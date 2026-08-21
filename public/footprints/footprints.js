/* 발자국 Footprints — 구글 타임라인 내보내기를 브라우저 안에서만 파싱·렌더.
   네트워크 요청은 CARTO 지도 타일뿐. 타임라인 데이터는 어디로도 전송되지 않는다. */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };

  // ── 좌표 파싱 유틸 ──
  function parsePoint(v) {
    if (!v) return null;
    if (typeof v === "object") {
      if (v.latLng) return parsePoint(v.latLng);
      if (v.latitudeE7 != null) return { lat: v.latitudeE7 / 1e7, lng: v.longitudeE7 / 1e7 };
      if (v.latE7 != null) return { lat: v.latE7 / 1e7, lng: v.lngE7 / 1e7 };
      return null;
    }
    var s = String(v).replace(/^geo:/, "");
    var m = s.match(/(-?\d+(?:\.\d+)?)\s*°?\s*,\s*(-?\d+(?:\.\d+)?)/);
    if (!m) return null;
    return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  }
  function ts(v) { var t = Date.parse(v); return isNaN(t) ? null : t; }

  // ── 포맷별 파서 → {points:[{t,lat,lng}], visits:[{t,lat,lng}]} ──
  function parseSegments(segs, out) {
    for (var i = 0; i < segs.length; i++) {
      var seg = segs[i];
      if (!seg) continue;
      var st = ts(seg.startTime), et = ts(seg.endTime);
      if (Array.isArray(seg.timelinePath)) {
        for (var j = 0; j < seg.timelinePath.length; j++) {
          var tp = seg.timelinePath[j];
          var p = parsePoint(tp.point);
          if (!p) continue;
          var t = tp.time ? ts(tp.time)
            : tp.durationMinutesOffsetFromStartTime != null && st != null
              ? st + Number(tp.durationMinutesOffsetFromStartTime) * 60000 : st;
          if (t != null) out.points.push({ t: t, lat: p.lat, lng: p.lng });
        }
      }
      if (seg.visit) {
        var vp = parsePoint(seg.visit.topCandidate && seg.visit.topCandidate.placeLocation);
        if (vp && st != null) { out.visits.push({ t: st, lat: vp.lat, lng: vp.lng }); out.points.push({ t: st, lat: vp.lat, lng: vp.lng }); }
      }
      if (seg.activity) {
        var a1 = parsePoint(seg.activity.start), a2 = parsePoint(seg.activity.end);
        if (a1 && st != null) out.points.push({ t: st, lat: a1.lat, lng: a1.lng });
        if (a2 && (et != null || st != null)) out.points.push({ t: et != null ? et : st, lat: a2.lat, lng: a2.lng });
      }
    }
  }
  function parseLegacyObjects(objs, out) {
    for (var i = 0; i < objs.length; i++) {
      var o = objs[i];
      if (o.placeVisit) {
        var p = parsePoint(o.placeVisit.location);
        var t = o.placeVisit.duration && ts(o.placeVisit.duration.startTimestamp);
        if (p && t != null) { out.visits.push({ t: t, lat: p.lat, lng: p.lng }); out.points.push({ t: t, lat: p.lat, lng: p.lng }); }
      }
      if (o.activitySegment) {
        var a = o.activitySegment;
        var st = a.duration && ts(a.duration.startTimestamp), et = a.duration && ts(a.duration.endTimestamp);
        var raw = a.simplifiedRawPath && a.simplifiedRawPath.points;
        if (Array.isArray(raw) && raw.length) {
          for (var j = 0; j < raw.length; j++) {
            var rp = parsePoint(raw[j]);
            var rt = raw[j].timestampMs ? Number(raw[j].timestampMs) : ts(raw[j].timestamp);
            if (rp && rt != null) out.points.push({ t: rt, lat: rp.lat, lng: rp.lng });
          }
        } else {
          var s = parsePoint(a.startLocation), e = parsePoint(a.endLocation);
          if (s && st != null) out.points.push({ t: st, lat: s.lat, lng: s.lng });
          var wps = a.waypointPath && a.waypointPath.waypoints;
          if (Array.isArray(wps) && st != null && et != null) {
            for (var k = 0; k < wps.length; k++) {
              var wp = parsePoint(wps[k]);
              if (wp) out.points.push({ t: st + ((k + 1) / (wps.length + 1)) * (et - st), lat: wp.lat, lng: wp.lng });
            }
          }
          if (e && et != null) out.points.push({ t: et, lat: e.lat, lng: e.lng });
        }
      }
    }
  }
  function parseRecords(locs, out) {
    var stride = Math.max(1, Math.floor(locs.length / 60000));
    for (var i = 0; i < locs.length; i += stride) {
      var l = locs[i];
      if (l.latitudeE7 == null) continue;
      var t = l.timestamp ? ts(l.timestamp) : l.timestampMs ? Number(l.timestampMs) : null;
      if (t == null) continue;
      out.points.push({ t: t, lat: l.latitudeE7 / 1e7, lng: l.longitudeE7 / 1e7 });
    }
  }
  function parseJson(obj, out) {
    if (obj && Array.isArray(obj.semanticSegments)) parseSegments(obj.semanticSegments, out);
    else if (Array.isArray(obj) && obj.length && (obj[0].startTime || obj[0].timelinePath)) parseSegments(obj, out);
    else if (obj && Array.isArray(obj.timelineObjects)) parseLegacyObjects(obj.timelineObjects, out);
    else if (obj && Array.isArray(obj.locations)) parseRecords(obj.locations, out);
    else return false;
    return true;
  }

  // ── 정제 + 통계 ──
  var R = 6371;
  function hav(a, b) {
    var dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180;
    var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(s));
  }
  function refine(data) {
    var pts = data.points.filter(function (p) {
      return p.t != null && isFinite(p.lat) && isFinite(p.lng) && Math.abs(p.lat) <= 85 && Math.abs(p.lng) <= 180;
    });
    pts.sort(function (a, b) { return a.t - b.t; });
    var clean = [];
    for (var i = 0; i < pts.length; i++) {
      var prev = clean[clean.length - 1];
      if (prev) {
        if (pts[i].t === prev.t && pts[i].lat === prev.lat) continue;
        var dt = (pts[i].t - prev.t) / 3600000;
        if (dt > 0 && hav(prev, pts[i]) / dt > 1200) continue; // GPS 글리치 (>1200km/h)
      }
      clean.push(pts[i]);
    }
    if (clean.length > 20000) {
      var stride = Math.ceil(clean.length / 20000), ds = [];
      for (var j = 0; j < clean.length; j += stride) ds.push(clean[j]);
      clean = ds;
    }
    // 통계
    var totalKm = 0, dayKm = {}, days = {};
    for (var k = 1; k < clean.length; k++) {
      var d = hav(clean[k - 1], clean[k]);
      totalKm += d;
      var day = new Date(clean[k].t).toISOString().slice(0, 10);
      dayKm[day] = (dayKm[day] || 0) + d;
    }
    clean.forEach(function (p) { days[new Date(p.t).toISOString().slice(0, 10)] = 1; });
    var maxDay = Object.keys(dayKm).sort(function (a, b) { return dayKm[b] - dayKm[a]; })[0];
    return {
      points: clean,
      visits: data.visits.filter(function (v) { return isFinite(v.lat); }),
      stats: {
        totalKm: totalKm,
        days: Object.keys(days).length,
        visits: data.visits.length,
        maxDayKm: maxDay ? dayKm[maxDay] : 0,
        maxDay: maxDay || null,
        from: clean.length ? clean[0].t : null,
        to: clean.length ? clean[clean.length - 1].t : null,
      },
    };
  }

  // ── 지도 (웹 메르카토르 + CARTO dark 타일) ──
  var TILE = 256, SUBS = ["a", "b", "c", "d"];
  var tileCache = {}, tileFail = {};
  function merc(lat, lng, z) {
    var n = TILE * Math.pow(2, z);
    var x = (lng + 180) / 360 * n;
    var rad = lat * Math.PI / 180;
    var y = (1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2 * n;
    return { x: x, y: y };
  }
  function fitView(bbox, w, h) {
    var pad = 0.14;
    for (var z = 13; z >= 2; z--) {
      var a = merc(bbox.maxLat, bbox.minLng, z), b = merc(bbox.minLat, bbox.maxLng, z);
      if ((b.x - a.x) <= w * (1 - pad) && (b.y - a.y) <= h * (1 - pad)) {
        return { z: z, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
      }
    }
    return { z: 2, cx: merc(0, 0, 2).x, cy: merc(0, 0, 2).y };
  }
  function drawTiles(ctx, view, w, h, onload) {
    var z = view.z, n = Math.pow(2, z);
    var x0 = Math.floor((view.cx - w / 2) / TILE), x1 = Math.floor((view.cx + w / 2) / TILE);
    var y0 = Math.floor((view.cy - h / 2) / TILE), y1 = Math.floor((view.cy + h / 2) / TILE);
    for (var tx = x0; tx <= x1; tx++) {
      for (var ty = Math.max(0, y0); ty <= Math.min(n - 1, y1); ty++) {
        var wx = ((tx % n) + n) % n;
        var key = z + "/" + wx + "/" + ty;
        var img = tileCache[key];
        if (!img) {
          if (tileFail[key]) continue;
          img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = onload;
          img.onerror = (function (k) { return function () { tileFail[k] = 1; }; })(key);
          img.src = "https://" + SUBS[(wx + ty) % 4] + ".basemaps.cartocdn.com/dark_all/" + key + ".png";
          tileCache[key] = img;
        }
        if (img.complete && img.naturalWidth) {
          ctx.drawImage(img, Math.round(tx * TILE - view.cx + w / 2), Math.round(ty * TILE - view.cy + h / 2));
        }
      }
    }
  }

  // ── 렌더러 ──
  var state = { data: null, view: null, progress: 1, playing: false, lastFrame: 0, duration: 20000 };
  var canvas = $("#map"), ctx = canvas.getContext("2d");
  var DPR = Math.min(2, window.devicePixelRatio || 1);

  function resize() {
    var w = canvas.parentElement.clientWidth;
    var h = Math.round(Math.min(w * 0.75, window.innerHeight * 0.72));
    canvas.width = w * DPR; canvas.height = h * DPR;
    canvas.style.height = h + "px";
    if (state.data) {
      state.view = fitView(state.data.bbox, w * DPR, h * DPR);
      render();
    }
  }
  window.addEventListener("resize", resize);

  function project(p) {
    var m = merc(p.lat, p.lng, state.view.z);
    return { x: m.x - state.view.cx + canvas.width / 2, y: m.y - state.view.cy + canvas.height / 2 };
  }

  function render() {
    if (!state.data) return;
    var w = canvas.width, h = canvas.height;
    ctx.fillStyle = "#0a0f1a";
    ctx.fillRect(0, 0, w, h);
    drawTiles(ctx, state.view, w, h, function () { if (!state.playing) render(); });
    ctx.fillStyle = "rgba(7,11,20,0.35)"; // 톤 통일용 오버레이
    ctx.fillRect(0, 0, w, h);

    var pts = state.data.points;
    if (!pts.length) return;
    var t0 = state.data.stats.from, t1 = state.data.stats.to;
    var tCur = t0 + (t1 - t0) * state.progress;

    // 경로
    ctx.lineWidth = 2.2 * DPR;
    ctx.lineJoin = ctx.lineCap = "round";
    ctx.shadowColor = "rgba(57,192,255,.8)";
    ctx.shadowBlur = 6 * DPR;
    var last = null, hue0 = 190, hue1 = 140;
    ctx.beginPath();
    var head = null, count = 0;
    for (var i = 0; i < pts.length && pts[i].t <= tCur; i++) {
      var q = project(pts[i]);
      if (last === null) ctx.moveTo(q.x, q.y);
      else {
        // 대륙 점프(랩어라운드) 방지
        if (Math.abs(q.x - last.x) > canvas.width * 0.8) ctx.moveTo(q.x, q.y);
        else ctx.lineTo(q.x, q.y);
      }
      last = q; head = pts[i]; count = i;
    }
    var grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "hsl(" + hue0 + ",95%,62%)");
    grad.addColorStop(1, "hsl(" + hue1 + ",90%,58%)");
    ctx.strokeStyle = grad;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 방문 지점
    ctx.fillStyle = "rgba(180,140,255,.85)";
    state.data.visits.forEach(function (v) {
      if (v.t > tCur) return;
      var q = project(v);
      ctx.beginPath(); ctx.arc(q.x, q.y, 2.2 * DPR, 0, 7); ctx.fill();
    });

    // 헤드
    if (last) {
      ctx.fillStyle = "#3ef08c";
      ctx.shadowColor = "#3ef08c"; ctx.shadowBlur = 10 * DPR;
      ctx.beginPath(); ctx.arc(last.x, last.y, 4 * DPR, 0, 7); ctx.fill();
      ctx.shadowBlur = 0;
    }

    // HUD
    var km = 0;
    for (var j = 1; j <= count; j++) km += hav(pts[j - 1], pts[j]);
    ctx.font = 600 * 0 + (13 * DPR) + "px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "rgba(220,230,245,.92)";
    ctx.fillText(head ? fmtDate(new Date(head.t)) : "", 14 * DPR, 24 * DPR);
    ctx.fillStyle = "#3ef08c";
    ctx.fillText(Math.round(km).toLocaleString() + " km", 14 * DPR, 44 * DPR);
    ctx.fillStyle = "rgba(90,107,136,.9)";
    ctx.font = (10 * DPR) + "px 'IBM Plex Mono', monospace";
    ctx.fillText("page.cocy.io/footprints · © CARTO © OSM", 14 * DPR, h - 12 * DPR);
    $("#scrub").value = Math.round(state.progress * 1000);
  }

  function fmtDate(d) {
    return d.getFullYear() + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + String(d.getDate()).padStart(2, "0");
  }

  // ── 재생 ──
  function tick(now) {
    if (!state.playing) return;
    var dt = now - (state.lastFrame || now);
    state.lastFrame = now;
    state.progress = Math.min(1, state.progress + dt / state.duration);
    render();
    if (state.progress >= 1) { state.playing = false; $("#play").textContent = "▶ 재생"; if (state.onFinish) { var f = state.onFinish; state.onFinish = null; f(); } return; }
    requestAnimationFrame(tick);
  }
  function play(fromStart) {
    if (fromStart || state.progress >= 1) state.progress = 0;
    state.playing = true; state.lastFrame = 0;
    $("#play").textContent = "⏸ 일시정지";
    requestAnimationFrame(tick);
  }
  function pause() { state.playing = false; $("#play").textContent = "▶ 재생"; }

  $("#play").addEventListener("click", function () { state.playing ? pause() : play(false); });
  $("#scrub").addEventListener("input", function () {
    pause();
    state.progress = Number(this.value) / 1000;
    render();
  });
  $("#speed").addEventListener("change", function () { state.duration = Number(this.value); });

  // ── 데이터 로드 ──
  function loadData(refined) {
    if (!refined.points.length) { showErr("이 파일에서 이동 기록을 찾지 못했어요. Timeline.json(타임라인 내보내기)인지 확인해주세요."); return; }
    var bbox = { minLat: 90, maxLat: -90, minLng: 180, maxLng: -180 };
    refined.points.forEach(function (p) {
      bbox.minLat = Math.min(bbox.minLat, p.lat); bbox.maxLat = Math.max(bbox.maxLat, p.lat);
      bbox.minLng = Math.min(bbox.minLng, p.lng); bbox.maxLng = Math.max(bbox.maxLng, p.lng);
    });
    refined.bbox = bbox;
    state.data = refined;
    $("#loader").style.display = "none";
    $("#viewer").style.display = "block";
    var s = refined.stats;
    $("#s-km").textContent = Math.round(s.totalKm).toLocaleString();
    $("#s-days").textContent = s.days.toLocaleString();
    $("#s-visits").textContent = s.visits.toLocaleString();
    $("#s-maxday").textContent = Math.round(s.maxDayKm).toLocaleString();
    $("#range").textContent = s.from ? fmtDate(new Date(s.from)) + " – " + fmtDate(new Date(s.to)) : "";
    resize();
    state.progress = 0;
    play(true);
    if (window.dataLayer) window.dataLayer.push({ event: "fp_load", fp_points: refined.points.length });
    $("#viewer").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function showErr(msg) { var e = $("#err"); e.textContent = msg; e.style.display = "block"; }
  function hideErr() { $("#err").style.display = "none"; }

  function handleFiles(files) {
    hideErr();
    var out = { points: [], visits: [] };
    var pending = files.length, okAny = false;
    if (!pending) return;
    Array.prototype.forEach.call(files, function (f) {
      if (f.size > 300 * 1024 * 1024) { pending--; showErr(f.name + ": 300MB 초과 파일은 브라우저에서 처리하기 어려워요."); return; }
      var reader = new FileReader();
      reader.onload = function () {
        try {
          if (parseJson(JSON.parse(reader.result), out)) okAny = true;
        } catch (e) { /* skip */ }
        if (--pending === 0) {
          if (!okAny) showErr("지원하는 형식이 아니에요. 구글지도 앱 → 타임라인 → 내보내기의 JSON을 넣어주세요.");
          else loadData(refine(out));
        }
      };
      reader.readAsText(f);
    });
  }

  var drop = $("#drop"), fileIn = $("#file");
  drop.addEventListener("click", function () { fileIn.click(); });
  fileIn.addEventListener("change", function () { handleFiles(fileIn.files); });
  ["dragover", "dragenter"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("over"); }); });
  ["dragleave", "drop"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("over"); }); });
  drop.addEventListener("drop", function (e) { handleFiles(e.dataTransfer.files); });

  // ── 데모 ──
  $("#demo").addEventListener("click", function () {
    var cities = [
      [37.5665, 126.9780], [37.4563, 126.7052], [36.3504, 127.3845], [35.8714, 128.6014],
      [35.1796, 129.0756], [35.1595, 126.8526], [33.4996, 126.5312], [33.2541, 126.5601],
      [33.5104, 126.4914], [37.5665, 126.9780], [37.7519, 128.8761], [38.2070, 128.5918],
      [37.5665, 126.9780], [34.7604, 127.6622], [34.8118, 126.3922], [37.5665, 126.9780],
    ];
    var out = { points: [], visits: [] };
    var t = Date.UTC(2026, 0, 5);
    for (var i = 0; i < cities.length - 1; i++) {
      var a = cities[i], b = cities[i + 1];
      out.visits.push({ t: t, lat: a[0], lng: a[1] });
      var steps = 14;
      for (var s = 0; s <= steps; s++) {
        var f = s / steps;
        // 살짝 휘어진 경로
        var curve = Math.sin(f * Math.PI) * 0.15;
        out.points.push({
          t: t + f * 36e5 * 4,
          lat: a[0] + (b[0] - a[0]) * f + curve * (b[1] - a[1]) * 0.12,
          lng: a[1] + (b[1] - a[1]) * f - curve * (b[0] - a[0]) * 0.12,
        });
      }
      t += 86400000 * (14 + (i % 5) * 7);
    }
    loadData(refine(out));
  });

  // ── PNG 포스터 ──
  $("#png").addEventListener("click", function () {
    if (!state.data) return;
    try {
      var W = 1080, H = 1350;
      var c = document.createElement("canvas"); c.width = W; c.height = H;
      var x = c.getContext("2d");
      x.fillStyle = "#070b14"; x.fillRect(0, 0, W, H);
      // 지도 영역
      var mw = W, mh = 940;
      var view = fitView(state.data.bbox, mw, mh);
      var save = { view: state.view, canvas: { w: canvas.width, h: canvas.height } };
      // 타일
      var z = view.z, n = Math.pow(2, z);
      var x0 = Math.floor((view.cx - mw / 2) / TILE), x1 = Math.floor((view.cx + mw / 2) / TILE);
      var y0 = Math.max(0, Math.floor((view.cy - mh / 2) / TILE)), y1 = Math.min(n - 1, Math.floor((view.cy + mh / 2) / TILE));
      for (var tx = x0; tx <= x1; tx++) for (var ty = y0; ty <= y1; ty++) {
        var wx = ((tx % n) + n) % n, key = z + "/" + wx + "/" + ty, img = tileCache[key];
        if (img && img.complete && img.naturalWidth) x.drawImage(img, Math.round(tx * TILE - view.cx + mw / 2), Math.round(ty * TILE - view.cy + mh / 2 + 120));
      }
      x.fillStyle = "rgba(7,11,20,0.4)"; x.fillRect(0, 120, mw, mh);
      var pj = function (p) { var m = merc(p.lat, p.lng, view.z); return { x: m.x - view.cx + mw / 2, y: m.y - view.cy + mh / 2 + 120 }; };
      x.lineWidth = 3; x.lineJoin = x.lineCap = "round";
      x.shadowColor = "rgba(57,192,255,.9)"; x.shadowBlur = 8;
      var grad = x.createLinearGradient(0, 120, W, mh);
      grad.addColorStop(0, "hsl(190,95%,62%)"); grad.addColorStop(1, "hsl(140,90%,58%)");
      x.strokeStyle = grad;
      x.beginPath();
      var lastq = null;
      state.data.points.forEach(function (p) {
        var q = pj(p);
        if (!lastq || Math.abs(q.x - lastq.x) > W * 0.8) x.moveTo(q.x, q.y); else x.lineTo(q.x, q.y);
        lastq = q;
      });
      x.stroke(); x.shadowBlur = 0;
      x.fillStyle = "rgba(180,140,255,.85)";
      state.data.visits.forEach(function (v) { var q = pj(v); x.beginPath(); x.arc(q.x, q.y, 3, 0, 7); x.fill(); });
      // 텍스트
      x.fillStyle = "#dce6f5"; x.font = "700 44px 'IBM Plex Sans KR', sans-serif";
      x.fillText("나의 발자국", 48, 76);
      x.fillStyle = "#5a6b88"; x.font = "22px 'IBM Plex Mono', monospace";
      x.fillText($("#range").textContent, 48, 106);
      var s = state.data.stats;
      var items = [
        [Math.round(s.totalKm).toLocaleString() + " km", "총 이동거리"],
        [s.days.toLocaleString() + "일", "기록된 날"],
        [s.visits.toLocaleString() + "곳", "방문 장소"],
        [Math.round(s.maxDayKm).toLocaleString() + " km", "최장 하루"],
      ];
      for (var i2 = 0; i2 < 4; i2++) {
        var bx = 48 + i2 * 252;
        x.fillStyle = "#3ef08c"; x.font = "700 40px 'IBM Plex Mono', monospace";
        x.fillText(items[i2][0], bx, 1180);
        x.fillStyle = "#8fa2c0"; x.font = "20px 'IBM Plex Sans KR', sans-serif";
        x.fillText(items[i2][1], bx, 1212);
      }
      x.fillStyle = "#5a6b88"; x.font = "20px 'IBM Plex Mono', monospace";
      x.fillText("page.cocy.io/footprints", 48, 1300);
      x.fillText("© CARTO © OpenStreetMap", W - 330, 1300);
      c.toBlob(function (blob) {
        if (!blob) { showErr("이미지 생성에 실패했어요."); return; }
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "footprints.png";
        a.click();
        if (window.dataLayer) window.dataLayer.push({ event: "fp_export", fp_type: "png" });
      });
      void save;
    } catch (e) {
      showErr("지도 타일 보안 정책 때문에 이미지 저장이 막혔어요. 새로고침 후 다시 시도해주세요.");
    }
  });

  // ── 영상(webm) — 재생을 그대로 녹화 ──
  var recBtn = $("#rec");
  if (!window.MediaRecorder || !canvas.captureStream) recBtn.style.display = "none";
  recBtn.addEventListener("click", function () {
    if (!state.data || recBtn.disabled) return;
    recBtn.disabled = true; recBtn.textContent = "● 녹화 중…";
    var stream = canvas.captureStream(30);
    var mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
    var rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 });
    var chunks = [];
    rec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
    rec.onstop = function () {
      var a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob(chunks, { type: "video/webm" }));
      a.download = "footprints.webm";
      a.click();
      recBtn.disabled = false; recBtn.textContent = "🎬 영상 저장";
      if (window.dataLayer) window.dataLayer.push({ event: "fp_export", fp_type: "webm" });
    };
    state.onFinish = function () { setTimeout(function () { rec.stop(); }, 400); };
    rec.start();
    play(true);
  });
})();
