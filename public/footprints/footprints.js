/* 발자국 Footprints — 구글 타임라인 내보내기를 브라우저 안에서만 파싱·렌더.
   네트워크 요청은 CARTO 지도 타일뿐. 타임라인 데이터는 어디로도 전송되지 않는다.
   v3: 팔로우 카메라(부동소수 줌) + 비행 아크(150km+ 점프) + i18n 문자열 주입 */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };

  // ── i18n — 각 로케일 HTML이 window.FP_STR 주입, 없으면 ko 기본값 ──
  var S = Object.assign({
    errTooBig: ": 300MB 초과 파일은 브라우저에서 처리하기 어려워요.",
    errSettings: "이건 위치 데이터가 아니라 타임라인 '설정' 파일이에요 (Settings.json). 2024년부터 이동 기록은 Takeout이 아니라 휴대폰 안에 저장됩니다. 안드로이드: 폰 설정 → 위치 → 위치 서비스 → 타임라인 → '타임라인 데이터 내보내기'로 Timeline.json을 만들어 넣어주세요.",
    errFormat: "지원하는 형식이 아니에요. 폰 설정 → 위치 → 위치 서비스 → 타임라인 → '타임라인 데이터 내보내기'의 Timeline.json을 넣어주세요.",
    errNoPoints: "이 파일에서 이동 기록을 찾지 못했어요. Timeline.json(타임라인 내보내기)인지 확인해주세요.",
    errPng: "이미지 생성에 실패했어요.",
    errPngCors: "지도 타일 보안 정책 때문에 이미지 저장이 막혔어요. 새로고침 후 다시 시도해주세요.",
    play: "▶ 재생", pause: "⏸ 일시정지",
    recIdle: "🎞 GIF 만들기", recBusy: "● GIF 녹화 중… (최대 10초)",
    shareTitle: "발자국 Footprints",
    shareText: "구글 타임라인으로 내 1년 이동 지도를 만들었다 — 너도 30초면 됨 (업로드 없음):",
    pageUrl: "https://page.cocy.io/footprints/",
    copied: "링크 복사됨! 붙여넣어 공유하세요",
    camFollow: "📷 따라가기", camOverview: "🗺 전체 보기",
    trailOff: "〰 선 유지", trailOn: "✨ 꼬리 모드",
    posterTitle: "나의 발자국",
    stTotal: "총 이동거리", stDays: "기록된 날", stVisits: "방문 장소", stMaxDay: "최장 하루",
    brandUrl: "page.cocy.io/footprints",
  }, window.FP_STR || {});

  // ── 좌표/시간 파싱 ──
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

  // ── 포맷별 파서 ──
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
    // Takeout의 Settings.json — 위치 데이터가 아니라 설정 파일. 흔한 실수라 전용 안내로 분기
    if (obj && Array.isArray(obj.deviceSettings) && obj.timelineEnabled !== undefined) return "settings";
    if (obj && Array.isArray(obj.semanticSegments)) parseSegments(obj.semanticSegments, out);
    else if (Array.isArray(obj) && obj.length && (obj[0].startTime || obj[0].timelinePath)) parseSegments(obj, out);
    else if (obj && Array.isArray(obj.timelineObjects)) parseLegacyObjects(obj.timelineObjects, out);
    else if (obj && Array.isArray(obj.locations)) parseRecords(obj.locations, out);
    else return false;
    return true;
  }

  // ── 정제 + 통계 ──
  var R = 6371, JUMP_KM = 150;
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
        if (dt > 0 && hav(prev, pts[i]) / dt > 1200) continue; // GPS 글리치
      }
      clean.push(pts[i]);
    }
    if (clean.length > 20000) {
      var stride = Math.ceil(clean.length / 20000), ds = [];
      for (var j = 0; j < clean.length; j += stride) ds.push(clean[j]);
      clean = ds;
    }
    // 경도 언랩: 시간순으로 ±360° 보정 → 태평양 횡단(한국→미국)이 지도 오른쪽으로 이어짐.
    // merc()는 ±180 밖 경도도 선형 확장으로 처리하고 타일은 wx 모듈로로 랩되므로 전체 파이프라인 안전.
    for (var u = 1; u < clean.length; u++) {
      clean[u].lng -= 360 * Math.round((clean[u].lng - clean[u - 1].lng) / 360);
    }
    var uMin = 180, uMax = -180;
    clean.forEach(function (p) { uMin = Math.min(uMin, p.lng); uMax = Math.max(uMax, p.lng); });
    var uCenter = (uMin + uMax) / 2;
    data.visits.forEach(function (v) { v.lng -= 360 * Math.round((v.lng - uCenter) / 360); });

    return assemble(clean, data.visits.filter(function (v) { return isFinite(v.lat); }));
  }

  // 정제 완료된 포인트/방문 배열 → 렌더 가능한 데이터 뷰(점프·누적거리·통계·bbox)
  // 기간 선택(applyRange)이 부분 배열로 재호출한다
  function assemble(clean, visits) {
    var jumps = [];
    for (var k2 = 1; k2 < clean.length; k2++) jumps.push(hav(clean[k2 - 1], clean[k2]) > JUMP_KM);
    var totalKm = 0, dayKm = {}, days = {}, cumKm = [0];
    for (var k = 1; k < clean.length; k++) {
      var d = hav(clean[k - 1], clean[k]);
      totalKm += d;
      cumKm.push(totalKm);
      var day = new Date(clean[k].t).toISOString().slice(0, 10);
      dayKm[day] = (dayKm[day] || 0) + d;
    }
    clean.forEach(function (p) { days[new Date(p.t).toISOString().slice(0, 10)] = 1; });
    var maxDay = Object.keys(dayKm).sort(function (a, b) { return dayKm[b] - dayKm[a]; })[0];
    var bbox = { minLat: 90, maxLat: -90, minLng: Infinity, maxLng: -Infinity };
    clean.forEach(function (p) {
      bbox.minLat = Math.min(bbox.minLat, p.lat); bbox.maxLat = Math.max(bbox.maxLat, p.lat);
      bbox.minLng = Math.min(bbox.minLng, p.lng); bbox.maxLng = Math.max(bbox.maxLng, p.lng);
    });
    return {
      points: clean, jumps: jumps, cumKm: cumKm, visits: visits, bbox: bbox,
      stats: {
        totalKm: totalKm, days: Object.keys(days).length, visits: visits.length,
        maxDayKm: maxDay ? dayKm[maxDay] : 0,
        from: clean.length ? clean[0].t : null, to: clean.length ? clean[clean.length - 1].t : null,
      },
    };
  }

  // ── 메르카토르 + CARTO dark 타일 ──
  var TILE = 256, SUBS = ["a", "b", "c", "d"];
  var tileCache = {}, tileFail = {}, tileCount = 0;
  function merc(lat, lng, z) {
    var n = TILE * Math.pow(2, z);
    var x = (lng + 180) / 360 * n;
    var rad = lat * Math.PI / 180;
    var y = (1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2 * n;
    return { x: x, y: y };
  }
  function invMerc(x, y, z) {
    var n = TILE * Math.pow(2, z);
    var lng = x / n * 360 - 180;
    var lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))) * 180 / Math.PI;
    return { lat: lat, lng: lng };
  }
  function zoomToFit(bbox, w, h, maxZ) {
    var pad = 0.14;
    for (var z = maxZ; z >= 2; z--) {
      var a = merc(bbox.maxLat, bbox.minLng, z), b = merc(bbox.minLat, bbox.maxLng, z);
      if ((b.x - a.x) <= w * (1 - pad) && (b.y - a.y) <= h * (1 - pad)) return z;
    }
    return 2;
  }
  function bboxCenter(bbox, z) {
    var a = merc(bbox.maxLat, bbox.minLng, z), b = merc(bbox.minLat, bbox.maxLng, z);
    return invMerc((a.x + b.x) / 2, (a.y + b.y) / 2, z);
  }

  // ── 상태 ──
  var state = {
    data: null, progress: 0, playing: false, lastFrame: 0, duration: 20000, baseDuration: 20000, speedMul: 1,
    cam: null,            // {lat,lng,z(float)} 현재 카메라
    trail: false,         // ✨ 꼬리 모드 — 지나간 선을 페이드아웃
    follow: true,         // 팔로우 캠 vs 전체 보기
    fitZ: 3, overviewCam: null, onFinish: null,
  };
  var canvas = $("#map"), ctx = canvas.getContext("2d");
  var DPR = Math.min(2, window.devicePixelRatio || 1);

  function resize() {
    var w = canvas.parentElement.clientWidth;
    var h = Math.round(Math.min(w * 0.75, window.innerHeight * 0.72));
    canvas.width = w * DPR; canvas.height = h * DPR;
    canvas.style.height = h + "px";
    if (state.data) {
      computeOverview();
      if (!state.playing) { snapCamera(); render(); }
    }
  }
  window.addEventListener("resize", resize);

  function computeOverview() {
    var b = state.data.bbox;
    state.fitZ = zoomToFit(b, canvas.width, canvas.height, 13);
    var c = bboxCenter(b, state.fitZ);
    state.overviewCam = { lat: c.lat, lng: c.lng, z: state.fitZ };
  }

  // ── 진행률→현재 위치 (거리 도메인: 정지 기간은 건너뛰고 이동은 등속 — 뚝뚝 끊김 방지) ──
  function headAtProgress(p) {
    var pts = state.data.points, cum = state.data.cumKm;
    var total = cum[cum.length - 1];
    var last = pts.length - 1;
    if (!total || p <= 0) return { p: pts[0], idx: 0, frac: 0, t: pts[0].t, km: 0 };
    if (p >= 1) return { p: pts[last], idx: Math.max(0, last - 1), frac: 1, t: pts[last].t, km: total };
    var km = total * p;
    var lo = 0, hi = cum.length - 1;
    while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (cum[mid] <= km) lo = mid; else hi = mid - 1; }
    var i = Math.min(lo, last - 1);
    var segKm = cum[i + 1] - cum[i] || 1;
    var f = Math.max(0, Math.min(1, (km - cum[i]) / segKm));
    return {
      idx: i, frac: f, km: km,
      t: pts[i].t + (pts[i + 1].t - pts[i].t) * f,
      p: { lat: pts[i].lat + (pts[i + 1].lat - pts[i].lat) * f, lng: pts[i].lng + (pts[i + 1].lng - pts[i].lng) * f },
    };
  }

  // ── 카메라 ──
  function desiredCam(head) {
    if (!state.follow) return state.overviewCam;
    var followZ = Math.min(10.5, Math.max(7.5, state.fitZ + 3));
    // 비행(점프) 구간: 양 끝점이 다 보이게 줌아웃. jumps[i] = 세그먼트 i→i+1
    var i = head.idx;
    if (state.data.jumps[i] && i < state.data.points.length - 1) {
      var a = state.data.points[i], b = state.data.points[i + 1];
      var jb = {
        minLat: Math.min(a.lat, b.lat), maxLat: Math.max(a.lat, b.lat),
        minLng: Math.min(a.lng, b.lng), maxLng: Math.max(a.lng, b.lng),
      };
      var jz = zoomToFit(jb, canvas.width, canvas.height, 10) - 0.3;
      return { lat: head.p.lat, lng: head.p.lng, z: Math.min(followZ, Math.max(3, jz)) };
    }
    return { lat: head.p.lat, lng: head.p.lng, z: followZ };
  }
  function snapCamera() {
    state.cam = Object.assign({}, desiredCam(headAtProgress(state.progress)));
  }
  function lerpCamera(head) {
    var d = desiredCam(head);
    var kP = 0.14, kZ = 0.07;
    state.cam.lat += (d.lat - state.cam.lat) * kP;
    state.cam.lng += (d.lng - state.cam.lng) * kP;
    state.cam.z += (d.z - state.cam.z) * kZ;
  }

  // ── 렌더 ──
  function render() {
    if (!state.data || !state.cam) return;
    var w = canvas.width, h = canvas.height;
    var cam = state.cam;
    var zi = Math.max(2, Math.min(12, Math.round(cam.z)));
    var scale = Math.pow(2, cam.z - zi);
    var c = merc(cam.lat, cam.lng, zi);
    function px(p) {
      var m = merc(p.lat, p.lng, zi);
      return { x: (m.x - c.x) * scale + w / 2, y: (m.y - c.y) * scale + h / 2 };
    }

    ctx.fillStyle = "#0a0f1a";
    ctx.fillRect(0, 0, w, h);

    // 타일 — tileN = 이 줌의 타일 개수(2^zi). 픽셀 단위와 혼동 금지 (v3에서 n/TILE 오계산으로 상단만 렌더되던 버그)
    var tileN = Math.pow(2, zi);
    var x0 = Math.floor((c.x - w / 2 / scale) / TILE), x1 = Math.floor((c.x + w / 2 / scale) / TILE);
    var y0 = Math.max(0, Math.floor((c.y - h / 2 / scale) / TILE)), y1 = Math.min(tileN - 1, Math.floor((c.y + h / 2 / scale) / TILE));
    for (var tx = x0; tx <= x1; tx++) {
      for (var ty = y0; ty <= y1; ty++) {
        if (ty < 0 || ty >= tileN) continue;
        var wx = ((tx % tileN) + tileN) % tileN;
        var key = zi + "/" + wx + "/" + ty;
        var img = tileCache[key];
        if (!img) {
          if (tileFail[key]) continue;
          if (tileCount > 600) { tileCache = {}; tileCount = 0; } // 캐시 폭주 가드
          img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = function () { if (!state.playing) render(); };
          img.onerror = (function (k) { return function () { tileFail[k] = 1; }; })(key);
          img.src = "https://" + SUBS[(wx + ty) % 4] + ".basemaps.cartocdn.com/dark_all/" + key + ".png";
          tileCache[key] = img; tileCount++;
        }
        if (img.complete && img.naturalWidth) {
          ctx.drawImage(img, (tx * TILE - c.x) * scale + w / 2, (ty * TILE - c.y) * scale + h / 2, TILE * scale + 0.6, TILE * scale + 0.6);
        }
      }
    }
    ctx.fillStyle = "rgba(7,11,20,0.35)";
    ctx.fillRect(0, 0, w, h);

    var pts = state.data.points;
    if (!pts.length) return;
    var head = headAtProgress(state.progress);
    var tCur = state.data.points[Math.min(head.idx, state.data.points.length - 1)].t; // 이동 중 날짜 스핀 방지 — 세그먼트 시작일 고정

    drawPath(ctx, px, pts, state.data.jumps, head, w, h, DPR);

    // 방문 지점 (꼬리 모드에선 숨김 — 점+잔상만 남는 클린 룩)
    ctx.fillStyle = "rgba(180,140,255,.85)";
    if (!state.trail) state.data.visits.forEach(function (v) {
      if (v.t > tCur) return;
      var q = px(v);
      if (q.x < -20 || q.x > w + 20 || q.y < -20 || q.y > h + 20) return;
      ctx.beginPath(); ctx.arc(q.x, q.y, 2.2 * DPR, 0, 7); ctx.fill();
    });

    // 헤드
    var hq = px(head.p);
    ctx.fillStyle = "#3ef08c";
    ctx.shadowColor = "#3ef08c"; ctx.shadowBlur = 10 * DPR;
    ctx.beginPath(); ctx.arc(hq.x, hq.y, 4 * DPR, 0, 7); ctx.fill();
    ctx.shadowBlur = 0;

    // HUD
    var km = head.km;
    ctx.font = (13 * DPR) + "px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "rgba(220,230,245,.92)";
    ctx.fillText(fmtDate(new Date(tCur)), 14 * DPR, 24 * DPR);
    ctx.fillStyle = "#3ef08c";
    ctx.fillText(Math.round(km).toLocaleString() + " km", 14 * DPR, 44 * DPR);
    ctx.fillStyle = "rgba(90,107,136,.9)";
    ctx.font = (10 * DPR) + "px 'IBM Plex Mono', monospace";
    ctx.fillText(S.brandUrl + " · © CARTO © OSM", 14 * DPR, h - 12 * DPR);
    $("#scrub").value = Math.round(state.progress * 1000);
  }

  // 경로 그리기 — 전체 선 모드 / ✨꼬리 모드(지나간 선 페이드아웃). 각 스타일당 소수 stroke로 일괄 처리
  function drawPath(x, px, pts, jumps, head, w, h, dpr, forceFull) {
    var margin = 60 * dpr;
    function offscreen(a, b) {
      return (a.x < -margin && b.x < -margin) || (a.x > w + margin && b.x > w + margin) ||
             (a.y < -margin && b.y < -margin) || (a.y > h + margin && b.y > h + margin);
    }
    var grad = x.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "hsl(190,95%,62%)");
    grad.addColorStop(1, "hsl(140,90%,58%)");
    x.lineJoin = x.lineCap = "round";

    function strokeSolids(list) { // list: [i, frac]
      if (!list.length) return;
      x.beginPath();
      var pen = -1;
      for (var n = 0; n < list.length; n++) {
        var i = list[n][0], f = list[n][1];
        var a = px(pts[i]), b = px(pts[i + 1]);
        if (Math.abs(b.x - a.x) > w * 1.5 || offscreen(a, b)) { pen = -1; continue; }
        if (pen !== i) x.moveTo(a.x, a.y);
        x.lineTo(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f);
        pen = i + 1;
      }
      x.strokeStyle = grad;
      x.lineWidth = 2.2 * dpr;
      x.shadowColor = "rgba(57,192,255,.7)"; x.shadowBlur = 5 * dpr;
      x.stroke();
      x.shadowBlur = 0;
    }
    function strokeArcs(list) {
      if (!list.length) return;
      x.save();
      x.setLineDash([5 * dpr, 7 * dpr]);
      x.beginPath();
      for (var n = 0; n < list.length; n++) {
        var i = list[n][0], f = list[n][1];
        var a = px(pts[i]), b = px(pts[i + 1]);
        if (Math.abs(b.x - a.x) > w * 1.5 || offscreen(a, b)) continue;
        var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        var dx = b.x - a.x, dy = b.y - a.y;
        var len = Math.sqrt(dx * dx + dy * dy) || 1;
        var off = Math.min(len * 0.22, 90 * dpr);
        var cx2 = mx - dy / len * off, cy2 = my + dx / len * off;
        x.moveTo(a.x, a.y);
        var steps = 22, lim = Math.max(1, Math.round(steps * f));
        for (var s2 = 1; s2 <= lim; s2++) {
          var t2 = (s2 / lim) * f;
          x.lineTo((1 - t2) * (1 - t2) * a.x + 2 * (1 - t2) * t2 * cx2 + t2 * t2 * b.x,
                   (1 - t2) * (1 - t2) * a.y + 2 * (1 - t2) * t2 * cy2 + t2 * t2 * b.y);
        }
      }
      x.strokeStyle = "rgba(180,140,255,.9)";
      x.lineWidth = 1.8 * dpr;
      x.shadowColor = "rgba(180,140,255,.5)"; x.shadowBlur = 4 * dpr;
      x.stroke();
      x.restore();
    }

    var end = head.idx, frac = head.frac;
    if (!state.trail || forceFull) {
      var solids = [], arcs = [];
      for (var i = 0; i < end; i++) (jumps[i] ? arcs : solids).push([i, 1]);
      if (end < pts.length - 1 && frac > 0) (jumps[end] ? arcs : solids).push([end, frac]);
      strokeSolids(solids);
      strokeArcs(arcs);
      return;
    }
    // ✨ 꼬리 모드: 헤드 뒤 일정 거리만 알파 버킷으로 페이드
    var cum = state.data.cumKm;
    var total = cum[cum.length - 1] || 1;
    var trailKm = Math.max(20, Math.min(600, total * 0.07));
    var headKm = head.km != null ? head.km : cum[end];
    var minKm = headKm - trailKm;
    var start = end;
    while (start > 0 && cum[start] > minKm) start--;
    var BUCKETS = 6;
    var solidB = [], arcB = [];
    for (var b0 = 0; b0 < BUCKETS; b0++) { solidB.push([]); arcB.push([]); }
    for (var j = start; j <= end && j < pts.length - 1; j++) {
      var f2 = (j === end) ? frac : 1;
      if (f2 <= 0) continue;
      var segEndKm = cum[j] + (cum[j + 1] - cum[j]) * f2;
      var alpha = 1 - (headKm - segEndKm) / trailKm;
      if (alpha <= 0) continue;
      var bi = Math.min(BUCKETS - 1, Math.floor(alpha * BUCKETS));
      (jumps[j] ? arcB : solidB)[bi].push([j, f2]);
    }
    for (var b1 = 0; b1 < BUCKETS; b1++) {
      x.globalAlpha = (b1 + 1) / BUCKETS;
      strokeSolids(solidB[b1]);
      strokeArcs(arcB[b1]);
    }
    x.globalAlpha = 1;
  }

  function fmtDate(d) {
    // 일 단위는 과잉 정보 + 이동 중 시선 분산 — 연.월만 표시 (cocy 피드백)
    return d.getFullYear() + "." + String(d.getMonth() + 1).padStart(2, "0");
  }

  // ── 재생 루프 ──
  function tick(now) {
    if (!state.playing) return;
    var dt = now - (state.lastFrame || now);
    state.lastFrame = now;
    state.progress = Math.min(1, state.progress + dt / state.duration);
    lerpCamera(headAtProgress(state.progress));
    render();
    if (state.captureHook) state.captureHook(now);
    if (state.progress >= 1) {
      state.playing = false;
      $("#play").textContent = S.play;
      // 끝나면 전체 보기로 부드럽게 전환
      var settle = 0;
      (function settleLoop() {
        if (state.playing || settle++ > 90) { if (state.onFinish) { var f = state.onFinish; state.onFinish = null; f(); } return; }
        var d = state.overviewCam;
        state.cam.lat += (d.lat - state.cam.lat) * 0.08;
        state.cam.lng += (d.lng - state.cam.lng) * 0.08;
        state.cam.z += (d.z - state.cam.z) * 0.06;
        render();
        requestAnimationFrame(settleLoop);
      })();
      return;
    }
    requestAnimationFrame(tick);
  }
  function play(fromStart) {
    if (fromStart || state.progress >= 1) { state.progress = 0; snapCamera(); }
    state.playing = true; state.lastFrame = 0;
    $("#play").textContent = S.pause;
    requestAnimationFrame(tick);
  }
  function pause() { state.playing = false; $("#play").textContent = S.play; }

  $("#play").addEventListener("click", function () { state.playing ? pause() : play(false); });
  $("#scrub").addEventListener("input", function () {
    pause();
    state.progress = Number(this.value) / 1000;
    snapCamera(); render();
  });
  $("#speed").addEventListener("change", function () {
    state.speedMul = Number(this.value) || 1;
    state.duration = state.baseDuration / state.speedMul;
  });
  $("#cam").addEventListener("click", function () {
    state.follow = !state.follow;
    this.textContent = state.follow ? S.camFollow : S.camOverview;
    if (!state.playing) { snapCamera(); render(); }
  });
  var trailBtn = $("#trail");
  if (trailBtn) trailBtn.addEventListener("click", function () {
    state.trail = !state.trail;
    this.textContent = state.trail ? S.trailOn : S.trailOff;
    if (!state.playing) render();
    if (window.dataLayer) window.dataLayer.push({ event: "fp_trail", fp_on: state.trail });
  });

  // ── 데이터 로드 ──
  function updateStatsUI() {
    var st = state.data.stats;
    $("#s-km").textContent = Math.round(st.totalKm).toLocaleString();
    $("#s-days").textContent = st.days.toLocaleString();
    $("#s-visits").textContent = st.visits.toLocaleString();
    $("#s-maxday").textContent = Math.round(st.maxDayKm).toLocaleString();
    $("#range").textContent = st.from ? fmtDate(new Date(st.from)) + " – " + fmtDate(new Date(st.to)) : "";
    state.baseDuration = Math.max(12000, Math.min(60000, st.days * 200));
    state.duration = state.baseDuration / state.speedMul;
  }

  function loadData(refined) {
    if (!refined.points.length) { showErr(S.errNoPoints); return; }
    state.fullData = refined;
    state.data = refined;
    $("#loader").style.display = "none";
    $("#viewer").style.display = "block";
    var ra = $("#rgA"), rb = $("#rgB");
    if (ra) { ra.value = 0; rb.value = 1000; updateRangeLabel(); }
    lastGifBlob = null; hideGifResult();
    updateStatsUI();
    resize();
    computeOverview();
    state.progress = 0;
    snapCamera();
    play(true);
    // gifenc 모듈 워밍업 — 콜드 CDN 로드로 첫 GIF 시도가 실패하는 것 방지
    setTimeout(function () { import("https://cdn.jsdelivr.net/npm/gifenc@1.0.3/+esm").catch(function () {}); }, 2500);
    if (window.dataLayer) window.dataLayer.push({ event: "fp_load", fp_points: refined.points.length });
    $("#viewer").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ── 기간 선택 — 전체 데이터에서 원하는 구간만 잘라 재생·통계·GIF·포스터에 적용
  function rangeTimes() {
    var full = state.fullData;
    var a = Number($("#rgA").value) / 1000, b = Number($("#rgB").value) / 1000;
    var lo = Math.min(a, b), hi = Math.max(a, b);
    var t0 = full.stats.from, t1 = full.stats.to;
    return { tA: t0 + (t1 - t0) * lo, tB: t0 + (t1 - t0) * hi };
  }
  function updateRangeLabel() {
    if (!state.fullData) return;
    var r = rangeTimes();
    $("#rgval").textContent = fmtDate(new Date(r.tA)) + " – " + fmtDate(new Date(r.tB));
  }
  function applyRange() {
    var full = state.fullData;
    if (!full) return;
    var r = rangeTimes();
    var pts = full.points.filter(function (p) { return p.t >= r.tA && p.t <= r.tB; });
    if (pts.length < 2) { updateRangeLabel(); return; }
    var vis = full.visits.filter(function (v) { return v.t >= r.tA && v.t <= r.tB; });
    state.data = assemble(pts, vis);
    lastGifBlob = null; hideGifResult();
    updateStatsUI();
    computeOverview();
    state.progress = 0;
    snapCamera();
    render();
    if (window.dataLayer) window.dataLayer.push({ event: "fp_range" });
  }
  ["rgA", "rgB"].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", updateRangeLabel);
    el.addEventListener("change", applyRange);
  });

  function showErr(msg) { var e = $("#err"); e.textContent = msg; e.style.display = "block"; }
  function hideErr() { $("#err").style.display = "none"; }

  function handleFiles(files) {
    hideErr();
    var out = { points: [], visits: [] };
    var pending = files.length, okAny = false, sawSettings = false;
    if (!pending) return;
    Array.prototype.forEach.call(files, function (f) {
      if (f.size > 300 * 1024 * 1024) { pending--; showErr(f.name + S.errTooBig); return; }
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var r = parseJson(JSON.parse(reader.result), out);
          if (r === "settings") sawSettings = true;
          else if (r) okAny = true;
        } catch (e) { /* skip */ }
        if (--pending === 0) {
          if (okAny) loadData(refine(out));
          else if (sawSettings) showErr(S.errSettings);
          else showErr(S.errFormat);
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

  // ── 데모 (해외 점프 포함 — 비행 아크 확인용) ──
  $("#demo").addEventListener("click", function () {
    var cities = [
      [37.5665, 126.9780], [37.4563, 126.7052], [36.3504, 127.3845], [35.1796, 129.0756],
      [33.4996, 126.5312], [33.2541, 126.5601], [37.5665, 126.9780],
      [35.6762, 139.6503], [34.6937, 135.5023], [37.5665, 126.9780],
      [25.0330, 121.5654], [37.5665, 126.9780],
    ];
    var out = { points: [], visits: [] };
    // 총 기간을 계산해 오늘에서 끝나도록 시작일을 역산 (미래 날짜 방지)
    var gaps = [], total = 0;
    for (var g = 0; g < cities.length - 1; g++) { var d = 86400000 * (10 + (g % 4) * 5); gaps.push(d); total += d; }
    var t = Date.now() - total - 86400000;
    for (var i = 0; i < cities.length - 1; i++) {
      var a = cities[i], b = cities[i + 1];
      out.visits.push({ t: t, lat: a[0], lng: a[1] });
      var far = hav({ lat: a[0], lng: a[1] }, { lat: b[0], lng: b[1] }) > JUMP_KM;
      if (far) {
        out.points.push({ t: t, lat: a[0], lng: a[1] });
        out.points.push({ t: t + 36e5 * 2.5, lat: b[0], lng: b[1] });
      } else {
        var steps = 14;
        for (var sp = 0; sp <= steps; sp++) {
          var f = sp / steps, curve = Math.sin(f * Math.PI) * 0.15;
          out.points.push({
            t: t + f * 36e5 * 4,
            lat: a[0] + (b[0] - a[0]) * f + curve * (b[1] - a[1]) * 0.12,
            lng: a[1] + (b[1] - a[1]) * f - curve * (b[0] - a[0]) * 0.12,
          });
        }
      }
      t += gaps[i];
    }
    loadData(refine(out));
  });

  // ── PNG 포스터 (전체 뷰 고정) ──
  $("#png").addEventListener("click", function () {
    if (!state.data) return;
    try {
      var W = 1080, H = 1350, mh = 940, topPad = 120;
      var c = document.createElement("canvas"); c.width = W; c.height = H;
      var x = c.getContext("2d");
      x.fillStyle = "#070b14"; x.fillRect(0, 0, W, H);
      var z = zoomToFit(state.data.bbox, W, mh, 13);
      var cc = bboxCenter(state.data.bbox, z);
      var cm = merc(cc.lat, cc.lng, z);
      var pj = function (p) { var m = merc(p.lat, p.lng, z); return { x: m.x - cm.x + W / 2, y: m.y - cm.y + mh / 2 + topPad }; };
      var n = Math.pow(2, z);
      var x0 = Math.floor((cm.x - W / 2) / TILE), x1 = Math.floor((cm.x + W / 2) / TILE);
      var y0 = Math.max(0, Math.floor((cm.y - mh / 2) / TILE)), y1 = Math.min(n - 1, Math.floor((cm.y + mh / 2) / TILE));
      for (var tx = x0; tx <= x1; tx++) for (var ty = y0; ty <= y1; ty++) {
        var wx = ((tx % n) + n) % n, key = z + "/" + wx + "/" + ty, img = tileCache[key];
        if (img && img.complete && img.naturalWidth) x.drawImage(img, Math.round(tx * TILE - cm.x + W / 2), Math.round(ty * TILE - cm.y + mh / 2 + topPad));
      }
      x.fillStyle = "rgba(7,11,20,0.4)"; x.fillRect(0, topPad, W, mh);
      var lastIdx = state.data.points.length - 1;
      drawPath(x, pj, state.data.points, state.data.jumps, { idx: lastIdx, frac: 1, p: state.data.points[lastIdx] }, W, H, 1.4, true);
      x.fillStyle = "rgba(180,140,255,.85)";
      state.data.visits.forEach(function (v) { var q = pj(v); x.beginPath(); x.arc(q.x, q.y, 3, 0, 7); x.fill(); });
      x.fillStyle = "#dce6f5"; x.font = "700 44px 'IBM Plex Sans KR', sans-serif";
      x.fillText(S.posterTitle, 48, 76);
      x.fillStyle = "#5a6b88"; x.font = "22px 'IBM Plex Mono', monospace";
      x.fillText($("#range").textContent, 48, 106);
      var s = state.data.stats;
      var items = [
        [Math.round(s.totalKm).toLocaleString() + " km", S.stTotal],
        [s.days.toLocaleString(), S.stDays],
        [s.visits.toLocaleString(), S.stVisits],
        [Math.round(s.maxDayKm).toLocaleString() + " km", S.stMaxDay],
      ];
      for (var i2 = 0; i2 < 4; i2++) {
        var bx = 48 + i2 * 252;
        x.fillStyle = "#3ef08c"; x.font = "700 40px 'IBM Plex Mono', monospace";
        x.fillText(items[i2][0], bx, 1180);
        x.fillStyle = "#8fa2c0"; x.font = "20px 'IBM Plex Sans KR', sans-serif";
        x.fillText(items[i2][1], bx, 1212);
      }
      x.fillStyle = "#5a6b88"; x.font = "20px 'IBM Plex Mono', monospace";
      x.fillText(S.brandUrl, 48, 1300);
      x.fillText("© CARTO © OpenStreetMap", W - 330, 1300);
      c.toBlob(function (blob) {
        if (!blob) { showErr(S.errPng); return; }
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "footprints.png";
        a.click();
        if (window.dataLayer) window.dataLayer.push({ event: "fp_export", fp_type: "png" });
      });
    } catch (e) {
      showErr(S.errPngCors);
    }
  });

  // ── GIF 생성 → 결과 카드(미리보기+저장+공유). 공유의 본체는 결과물(GIF) ──
  var recBtn = $("#rec"), shareBtn = $("#share");
  var lastGifBlob = null;

  function hideGifResult() {
    var b = $("#gifresult");
    if (b) b.style.display = "none";
  }
  function showGifResult(blob) {
    lastGifBlob = blob;
    var box = $("#gifresult"), img = $("#gifpreview");
    if (!box) return;
    if (img.src) URL.revokeObjectURL(img.src);
    img.src = URL.createObjectURL(blob);
    $("#gifsize").textContent = (blob.size / 1048576).toFixed(1) + " MB";
    box.style.display = "block";
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  function downloadGif(blob) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "footprints.gif";
    a.click();
  }
  function shareGif(blob) {
    var file = new File([blob], "footprints.gif", { type: "image/gif" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: S.shareTitle, text: S.shareText + " " + S.pageUrl }).catch(function () {});
    } else {
      downloadGif(blob);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(S.shareText + " " + S.pageUrl).then(function () {
          var orig = shareBtn.textContent;
          shareBtn.textContent = S.copied;
          setTimeout(function () { shareBtn.textContent = orig; }, 1800);
        }).catch(function () {});
      }
    }
    if (window.dataLayer) window.dataLayer.push({ event: "fp_share", fp_has_gif: true });
  }

  function makeGif(done) {
    if (!state.data || recBtn.disabled) return;
    recBtn.disabled = true; if (shareBtn) shareBtn.disabled = true;
    recBtn.textContent = S.recBusy;
    import("https://cdn.jsdelivr.net/npm/gifenc@1.0.3/+esm").then(function (G) {
      var W2 = 420, H2 = Math.max(2, Math.round(canvas.height / canvas.width * 420));
      var oc = document.createElement("canvas"); oc.width = W2; oc.height = H2;
      var octx = oc.getContext("2d", { willReadFrequently: true });
      var frames = [], lastCap = 0;
      var savedDur = state.duration;
      state.duration = Math.min(state.duration, 10000); // GIF는 최대 10초 분량
      state.captureHook = function (now) {
        if (now - lastCap < 80) return; // ~12fps
        lastCap = now;
        octx.drawImage(canvas, 0, 0, W2, H2);
        frames.push(new Uint8Array(octx.getImageData(0, 0, W2, H2).data.buffer.slice(0)));
      };
      state.onFinish = function () {
        state.captureHook = null;
        state.duration = savedDur;
        var blob = null;
        try {
          if (!frames.length) throw new Error("no frames");
          var gif = G.GIFEncoder();
          var palette = G.quantize(frames[Math.floor(frames.length / 2)], 256);
          for (var i = 0; i < frames.length; i++) {
            gif.writeFrame(G.applyPalette(frames[i], palette), W2, H2, { palette: palette, delay: 80 });
          }
          gif.finish();
          blob = new Blob([gif.bytes()], { type: "image/gif" });
          showGifResult(blob);
          if (window.dataLayer) window.dataLayer.push({ event: "fp_export", fp_type: "gif", fp_frames: frames.length });
        } catch (e) {
          showErr(S.errPng);
        }
        frames = null;
        recBtn.disabled = false; if (shareBtn) shareBtn.disabled = false;
        recBtn.textContent = S.recIdle;
        if (blob && done) done(blob);
      };
      play(true);
    }).catch(function () {
      recBtn.disabled = false; if (shareBtn) shareBtn.disabled = false;
      recBtn.textContent = S.recIdle;
      showErr(S.errPng);
    });
  }

  recBtn.addEventListener("click", function () { makeGif(null); });
  if (shareBtn) shareBtn.addEventListener("click", function () {
    if (lastGifBlob) shareGif(lastGifBlob);
    else makeGif(shareGif);
  });
  var gifDlBtn = $("#gifdl"), gifShareBtn = $("#gifshare");
  if (gifDlBtn) gifDlBtn.addEventListener("click", function () { if (lastGifBlob) downloadGif(lastGifBlob); });
  if (gifShareBtn) gifShareBtn.addEventListener("click", function () { if (lastGifBlob) shareGif(lastGifBlob); });
})();