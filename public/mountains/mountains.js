/* 산 체크리스트 — 정적 다크맵 + 클릭 토글. footprints의 merc/타일 로직 재사용(애니메이션 없는 축소판). */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };

  // 좌표는 개략치(국가 단위 지도용). 난이도는 공식 인증이 아니라 자체 분류.
  var MOUNTAINS = [
    { id: "halla", name: "한라산", region: "제주", elev: 1947, tier: "hard", lat: 33.362, lng: 126.533 },
    { id: "jiri", name: "지리산", region: "경남·전남·전북", elev: 1915, tier: "hard", lat: 35.337, lng: 127.730 },
    { id: "seorak", name: "설악산", region: "강원", elev: 1708, tier: "hard", lat: 38.119, lng: 128.465 },
    { id: "deogyu", name: "덕유산", region: "전북·경남", elev: 1614, tier: "mid", lat: 35.862, lng: 127.749 },
    { id: "gyebang", name: "계방산", region: "강원", elev: 1577, tier: "mid", lat: 37.687, lng: 128.428 },
    { id: "taebaek", name: "태백산", region: "강원", elev: 1567, tier: "mid", lat: 37.096, lng: 128.916 },
    { id: "odae", name: "오대산", region: "강원", elev: 1563, tier: "mid", lat: 37.798, lng: 128.550 },
    { id: "hambaek", name: "함백산", region: "강원", elev: 1573, tier: "mid", lat: 37.166, lng: 128.906 },
    { id: "sobaek", name: "소백산", region: "충북·경북", elev: 1439, tier: "mid", lat: 36.957, lng: 128.485 },
    { id: "chiak", name: "치악산", region: "강원", elev: 1288, tier: "mid", lat: 37.373, lng: 128.059 },
    { id: "worak", name: "월악산", region: "충북", elev: 1097, tier: "mid", lat: 36.855, lng: 128.100 },
    { id: "sokri", name: "속리산", region: "충북", elev: 1058, tier: "mid", lat: 36.541, lng: 127.870 },
    { id: "juwang", name: "주왕산", region: "경북", elev: 720, tier: "easy", lat: 36.395, lng: 129.184 },
    { id: "palgong", name: "팔공산", region: "대구·경북", elev: 1193, tier: "mid", lat: 36.020, lng: 128.680 },
    { id: "gaya", name: "가야산", region: "경남·경북", elev: 1430, tier: "mid", lat: 35.780, lng: 128.122 },
    { id: "mudeung", name: "무등산", region: "광주", elev: 1187, tier: "easy", lat: 35.134, lng: 127.014 },
    { id: "naejang", name: "내장산", region: "전북", elev: 763, tier: "easy", lat: 35.478, lng: 126.887 },
    { id: "wolchul", name: "월출산", region: "전남", elev: 809, tier: "mid", lat: 34.755, lng: 126.690 },
    { id: "jogye", name: "조계산", region: "전남", elev: 884, tier: "easy", lat: 34.960, lng: 127.317 },
    { id: "bukhan", name: "북한산", region: "서울", elev: 837, tier: "mid", lat: 37.659, lng: 126.977 },
    { id: "dobong", name: "도봉산", region: "서울", elev: 740, tier: "mid", lat: 37.689, lng: 127.014 },
    { id: "gwanak", name: "관악산", region: "서울", elev: 632, tier: "easy", lat: 37.443, lng: 126.964 },
    { id: "cheonggye", name: "청계산", region: "서울·경기", elev: 618, tier: "easy", lat: 37.428, lng: 127.056 },
    { id: "suraksan", name: "수락산", region: "서울·경기", elev: 638, tier: "easy", lat: 37.679, lng: 127.096 },
    { id: "bulam", name: "불암산", region: "서울", elev: 508, tier: "easy", lat: 37.658, lng: 127.075 },
    { id: "acha", name: "아차산", region: "서울", elev: 287, tier: "easy", lat: 37.556, lng: 127.106 },
    { id: "mani", name: "마니산", region: "인천 강화", elev: 469, tier: "easy", lat: 37.605, lng: 126.451 },
    { id: "yumyeong", name: "유명산", region: "경기", elev: 862, tier: "easy", lat: 37.554, lng: 127.451 },
    { id: "myeongseong", name: "명성산", region: "경기·강원", elev: 923, tier: "mid", lat: 38.140, lng: 127.335 },
    { id: "hwaak", name: "화악산", region: "경기·강원", elev: 1468, tier: "mid", lat: 37.988, lng: 127.512 },
    { id: "mindung", name: "민둥산", region: "강원", elev: 1119, tier: "easy", lat: 37.256, lng: 128.783 },
    { id: "gyeryong", name: "계룡산", region: "충남", elev: 845, tier: "mid", lat: 36.353, lng: 127.201 },
    { id: "daedun", name: "대둔산", region: "전북·충남", elev: 878, tier: "mid", lat: 36.148, lng: 127.360 },
    { id: "cheonma", name: "천마산", region: "경기", elev: 812, tier: "easy", lat: 37.618, lng: 127.256 },
    { id: "geomdan", name: "검단산", region: "경기", elev: 657, tier: "easy", lat: 37.516, lng: 127.204 },
  ];
  var TIER_LABEL = { easy: "초급", mid: "중급", hard: "고급" };
  var TIER_COLOR = { easy: "#39c0ff", mid: "#ffb224", hard: "#ff6b81" };

  var STORE_KEY = "kr_mountains_v1";
  var checked = {};
  try { checked = JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); } catch (e) { checked = {}; }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(checked)); } catch (e) {} }

  var state = { filter: "all" };
  var expanded = {}; // 코스 정보 펼침 상태 — 저장하지 않는다(세션 한정)

  // ── 메르카토르(footprints와 동일 공식, 애니메이션 없는 정적 오버뷰) ──
  var TILE = 256, SUBS = ["a", "b", "c", "d"];
  function merc(lat, lng, z) {
    var n = TILE * Math.pow(2, z);
    var x = (lng + 180) / 360 * n;
    var rad = lat * Math.PI / 180;
    var y = (1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2 * n;
    return { x: x, y: y };
  }
  function bbox() {
    var b = { minLat: 90, maxLat: -90, minLng: 180, maxLng: -180 };
    MOUNTAINS.forEach(function (m) {
      b.minLat = Math.min(b.minLat, m.lat); b.maxLat = Math.max(b.maxLat, m.lat);
      b.minLng = Math.min(b.minLng, m.lng); b.maxLng = Math.max(b.maxLng, m.lng);
    });
    return b;
  }
  function zoomToFit(b, w, h) {
    var pad = 0.14;
    for (var z = 9; z >= 3; z--) {
      var a = merc(b.maxLat, b.minLng, z), c = merc(b.minLat, b.maxLng, z);
      if ((c.x - a.x) <= w * (1 - pad) && (c.y - a.y) <= h * (1 - pad)) return z;
    }
    return 3;
  }

  var canvas = $("#map"), ctx = canvas.getContext("2d");
  var DPR = Math.min(2, window.devicePixelRatio || 1);
  var tileCache = {}, tileFail = {};
  var cam = null; // {lat,lng,z}

  function resize() {
    var w = canvas.parentElement.clientWidth;
    var h = Math.round(Math.min(w * 0.9, window.innerHeight * 0.72));
    canvas.width = w * DPR; canvas.height = h * DPR;
    canvas.style.height = h + "px";
    setupCam();
    render();
  }
  window.addEventListener("resize", resize);

  function setupCam() {
    var b = bbox();
    var z = zoomToFit(b, canvas.width, canvas.height);
    var a = merc(b.maxLat, b.minLng, z), c = merc(b.minLat, b.maxLng, z);
    var centerXY = { x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 };
    // 역메르카토르로 중심 lat/lng 계산
    var n = TILE * Math.pow(2, z);
    var lng = centerXY.x / n * 360 - 180;
    var lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * centerXY.y / n))) * 180 / Math.PI;
    cam = { lat: lat, lng: lng, z: z };
  }

  function project() {
    var w = canvas.width, h = canvas.height;
    var zi = Math.round(cam.z);
    var scale = Math.pow(2, cam.z - zi);
    var c = merc(cam.lat, cam.lng, zi);
    return function (lat, lng) {
      var m = merc(lat, lng, zi);
      return { x: (m.x - c.x) * scale + w / 2, y: (m.y - c.y) * scale + h / 2 };
    };
  }

  function visibleList() {
    return MOUNTAINS.filter(function (m) { return state.filter === "all" || m.tier === state.filter; });
  }

  function render() {
    if (!cam) return;
    var w = canvas.width, h = canvas.height;
    var zi = Math.round(cam.z);
    var scale = Math.pow(2, cam.z - zi);
    var c = merc(cam.lat, cam.lng, zi);

    ctx.fillStyle = "#0a0f1a";
    ctx.fillRect(0, 0, w, h);

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
          img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = function () { render(); };
          img.onerror = (function (k) { return function () { tileFail[k] = 1; }; })(key);
          img.src = "https://" + SUBS[(wx + ty) % 4] + ".basemaps.cartocdn.com/dark_all/" + key + ".png";
          tileCache[key] = img;
        }
        if (img.complete && img.naturalWidth) {
          ctx.drawImage(img, (tx * TILE - c.x) * scale + w / 2, (ty * TILE - c.y) * scale + h / 2, TILE * scale + 0.6, TILE * scale + 0.6);
        }
      }
    }
    ctx.fillStyle = "rgba(7,11,20,0.25)";
    ctx.fillRect(0, 0, w, h);

    var px = project();
    visibleList().forEach(function (m) {
      var q = px(m.lat, m.lng);
      if (q.x < -20 || q.x > w + 20 || q.y < -20 || q.y > h + 20) return;
      var isOn = !!checked[m.id];
      var r = 5.5 * DPR;
      ctx.beginPath();
      ctx.arc(q.x, q.y, r, 0, 7);
      ctx.fillStyle = isOn ? "#3ef08c" : TIER_COLOR[m.tier];
      ctx.globalAlpha = isOn ? 1 : 0.55;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 1.5 * DPR;
      ctx.strokeStyle = "#04121f";
      ctx.stroke();
      if (isOn) {
        ctx.fillStyle = "#04121f";
        ctx.font = (7 * DPR) + "px sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("✓", q.x, q.y + 0.5);
      }
    });
  }

  canvas.addEventListener("click", function (e) {
    var rect = canvas.getBoundingClientRect();
    var sx = (e.clientX - rect.left) * (canvas.width / rect.width);
    var sy = (e.clientY - rect.top) * (canvas.height / rect.height);
    var px = project();
    var best = null, bestD = 18 * DPR;
    visibleList().forEach(function (m) {
      var q = px(m.lat, m.lng);
      var d = Math.hypot(q.x - sx, q.y - sy);
      if (d < bestD) { bestD = d; best = m; }
    });
    if (best) toggle(best.id);
  });

  function toggle(id) {
    checked[id] = !checked[id];
    save();
    render();
    renderList();
    renderProgress();
    if (window.dataLayer) window.dataLayer.push({ event: "mt_toggle", mt_id: id, mt_on: checked[id] });
  }

  function renderProgress() {
    var total = MOUNTAINS.length;
    var n = MOUNTAINS.filter(function (m) { return checked[m.id]; }).length;
    $("#p-num").textContent = n + " / " + total;
    $("#p-bar").style.width = Math.round((n / total) * 100) + "%";
    $("#p-label").textContent = "완등 " + Math.round((n / total) * 100) + "%";
  }

  function renderList() {
    var wrap = $("#mlist");
    var list = visibleList().slice().sort(function (a, b) {
      var ca = checked[a.id] ? 1 : 0, cb = checked[b.id] ? 1 : 0;
      if (ca !== cb) return ca - cb; // 미완등 먼저
      return b.elev - a.elev;
    });
    wrap.innerHTML = list.map(function (m) {
      var on = !!checked[m.id];
      var info = (window.MT_INFO || {})[m.id];
      var open = !!expanded[m.id];
      return '<div class="mitem">' +
        '<div class="mrow' + (on ? ' checked' : '') + (open ? ' open' : '') + '" data-id="' + m.id + '">' +
        '<span class="chk" data-act="toggle" title="다녀옴 체크">' + (on ? "✓" : "") + '</span>' +
        '<span class="minfo"><span class="mname">' + esc(m.name) + '</span>' +
        '<span class="mmeta">' + esc(m.region) + ' · ' + m.elev + 'm</span></span>' +
        '<span class="tier tier-' + m.tier + '">' + TIER_LABEL[m.tier] + '</span>' +
        (info ? '<span class="caret">' + (open ? "▲" : "▼") + '</span>' : '') +
        '</div>' +
        (open && info ? detailHtml(info) : '') +
        '</div>';
    }).join("");
    Array.prototype.forEach.call(wrap.querySelectorAll(".mrow"), function (row) {
      row.addEventListener("click", function (e) {
        var id = row.getAttribute("data-id");
        // 체크박스는 완등 토글, 나머지 영역은 코스 정보 펼치기
        if (e.target.getAttribute("data-act") === "toggle") { toggle(id); return; }
        if (!(window.MT_INFO || {})[id]) { toggle(id); return; }
        expanded[id] = !expanded[id];
        renderList();
      });
    });
  }

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function detailHtml(info) {
    var h = '<div class="mdetail">';
    (info.courses || []).forEach(function (c) {
      if (!c.name) return;
      var meta = [c.distance, c.time].filter(Boolean).join(" · ");
      h += '<div class="course">' +
        '<div class="chead"><b>' + esc(c.name) + '</b>' +
        (c.level ? '<span class="clevel">' + esc(c.level) + '</span>' : '') + '</div>' +
        (meta ? '<div class="cmeta">' + esc(meta) + '</div>' : '') +
        (c.desc ? '<p>' + esc(c.desc) + '</p>' : '') +
        '</div>';
    });
    if (info.tips && info.tips.length) {
      h += '<ul class="tips">' + info.tips.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join("") + '</ul>';
    }
    if (info.best) h += '<div class="best">🍁 ' + esc(info.best) + '</div>';
    h += '</div>';
    return h;
  }

  Array.prototype.forEach.call(document.querySelectorAll("#filters button"), function (btn) {
    btn.addEventListener("click", function () {
      Array.prototype.forEach.call(document.querySelectorAll("#filters button"), function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      state.filter = btn.getAttribute("data-tier");
      render(); renderList();
    });
  });

  resize();
  renderList();
  renderProgress();
})();
