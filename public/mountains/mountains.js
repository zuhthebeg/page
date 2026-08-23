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

  // 산별 제철(월) — 널리 알려진 시즌 명물 기준. 날짜·날씨 추천에 사용
  var SEASONAL = {
    halla: [{ m: [12, 1, 2], why: "겨울 설경·상고대" }, { m: [5, 6], why: "영실 철쭉" }],
    jiri: [{ m: [10], why: "단풍" }, { m: [12, 1, 2], why: "천왕봉 상고대" }, { m: [7, 8], why: "고지대 피서 산행" }],
    seorak: [{ m: [9, 10], why: "단풍 (9월 말 고지대부터)" }, { m: [12, 1], why: "설경" }],
    deogyu: [{ m: [12, 1, 2], why: "곤돌라 눈꽃" }, { m: [5, 6], why: "철쭉" }],
    gyebang: [{ m: [12, 1, 2], why: "눈꽃 명산" }, { m: [7, 8], why: "고지대라 여름에도 서늘" }],
    taebaek: [{ m: [1, 2], why: "눈꽃축제·주목 설경" }],
    odae: [{ m: [10], why: "선재길 단풍" }, { m: [7, 8], why: "전나무숲·계곡 피서" }],
    hambaek: [{ m: [7, 8], why: "만항재 야생화·고도 1,573m 피서" }, { m: [12, 1, 2], why: "눈꽃·일출" }],
    sobaek: [{ m: [5, 6], why: "철쭉 능선" }, { m: [12, 1, 2], why: "칼바람 눈꽃" }],
    chiak: [{ m: [10], why: "단풍" }, { m: [7, 8], why: "구룡계곡" }],
    worak: [{ m: [10], why: "암릉 단풍 조망" }],
    sokri: [{ m: [10], why: "법주사 단풍길" }],
    juwang: [{ m: [10, 11], why: "주산지·절골 단풍" }, { m: [7, 8], why: "용추협곡 계곡" }],
    palgong: [{ m: [10, 11], why: "단풍" }, { m: [4], why: "벚꽃" }],
    gaya: [{ m: [10], why: "홍류동 계곡 단풍" }],
    mudeung: [{ m: [10, 11], why: "억새·단풍" }, { m: [12, 1], why: "서석대 눈꽃" }],
    naejang: [{ m: [10, 11], why: "단풍 최고 명소 (10월 말~11월 초)" }],
    wolchul: [{ m: [4], why: "진달래·영산홍" }, { m: [10], why: "암릉 단풍" }],
    jogye: [{ m: [3], why: "선암사 매화" }, { m: [11], why: "늦가을 남도 단풍" }],
    bukhan: [{ m: [4], why: "진달래능선" }, { m: [10, 11], why: "단풍" }],
    dobong: [{ m: [10, 11], why: "암릉 단풍" }, { m: [4, 5], why: "봄꽃" }],
    gwanak: [{ m: [4, 5], why: "봄꽃 능선" }, { m: [10, 11], why: "단풍" }],
    cheonggye: [{ m: [4, 5], why: "봄 숲길" }, { m: [10, 11], why: "단풍" }],
    suraksan: [{ m: [4, 5], why: "봄꽃 암릉" }, { m: [10], why: "단풍" }],
    bulam: [{ m: [4], why: "철쭉동산" }, { m: [10, 11], why: "가을 조망" }],
    acha: [{ m: [3, 4, 10, 11], why: "가벼운 능선 산책·한강 조망" }],
    mani: [{ m: [4], why: "진달래" }, { m: [10], why: "참성단·서해 조망" }],
    yumyeong: [{ m: [7, 8], why: "유명계곡 물놀이 피서" }, { m: [5, 6], why: "신록" }],
    myeongseong: [{ m: [9, 10], why: "억새 평원 (9월 말~10월)" }],
    hwaak: [{ m: [10], why: "경기 최고봉 단풍 조망" }],
    mindung: [{ m: [9, 10], why: "억새 물결 (9월 말~10월)" }],
    gyeryong: [{ m: [4], why: "동학사 벚꽃" }, { m: [10, 11], why: "단풍" }],
    daedun: [{ m: [10, 11], why: "구름다리 단풍" }],
    cheonma: [{ m: [4, 5], why: "야생화·봄 숲" }],
    geomdan: [{ m: [3, 4, 10, 11], why: "한강·팔당 조망 근교 산행" }],
  };

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

  // ── 날짜·날씨 기반 오늘의 추천 — Open-Meteo(무키), 35개 좌표 일괄 1콜 ──
  // 기온은 산 지형 고도 기준이라(한라산 17°C vs 서울 33°C) 여름 고산 우대가 자동으로 반영된다
  function wxLabel(code) {
    if (code <= 1) return "☀️ 맑음";
    if (code === 2) return "⛅ 구름 조금";
    if (code === 3) return "☁️ 흐림";
    if (code <= 48) return "🌫 안개";
    if (code <= 67 || (code >= 80 && code <= 82)) return "🌧 비";
    if (code <= 77 || code === 85 || code === 86) return "🌨 눈";
    return "⛈ 뇌우";
  }

  function loadReco() {
    var box = $("#reco");
    if (!box) return;
    var now = new Date();
    var dayIdx = now.getHours() >= 15 ? 1 : 0; // 오후 3시 이후엔 내일 기준
    var target = new Date(now.getTime() + dayIdx * 86400000);
    var month = target.getMonth() + 1;
    var lats = MOUNTAINS.map(function (m) { return m.lat; }).join(",");
    var lngs = MOUNTAINS.map(function (m) { return m.lng; }).join(",");
    var url = "https://api.open-meteo.com/v1/forecast?latitude=" + lats + "&longitude=" + lngs +
      "&daily=weather_code,temperature_2m_max,precipitation_sum,precipitation_probability_max,snowfall_sum" +
      "&timezone=Asia%2FSeoul&forecast_days=" + (dayIdx + 1);
    fetch(url).then(function (r) { return r.json(); }).then(function (res) {
      if (!Array.isArray(res) || res.length !== MOUNTAINS.length) return;
      var scored = MOUNTAINS.map(function (m, i) {
        var d = res[i].daily;
        var code = d.weather_code[dayIdx], tmax = d.temperature_2m_max[dayIdx];
        var rain = d.precipitation_sum[dayIdx] || 0, snow = d.snowfall_sum[dayIdx] || 0;
        var prob = d.precipitation_probability_max[dayIdx] || 0;
        var season = (SEASONAL[m.id] || []).filter(function (s) { return s.m.indexOf(month) >= 0; })[0];
        var winter = (SEASONAL[m.id] || []).some(function (s) { return s.m.indexOf(1) >= 0 || s.m.indexOf(12) >= 0; });
        var score = 0, why = [];
        if (season) { score += 3; why.push(season.why); }
        if (rain >= 10) score -= 99;                       // 폭우 — 제외
        else if (rain >= 3) { score -= 4; why.push("비 소식"); }
        else if (prob >= 70 && rain >= 1) score -= 2;
        if (code <= 1 && rain < 1) score += 2;
        else if (code === 2) score += 1;
        if (tmax >= 15 && tmax <= 26) score += 1;          // 쾌적
        else if (tmax >= 31) score -= 2;                   // 산 위도 더움
        else if (tmax <= -10) score -= 1;                  // 혹한
        if (snow >= 1) { if (winter) { score += 2; why.push("눈꽃 기대 (아이젠 필수)"); } else score -= 2; }
        if (!checked[m.id]) score += 1;                    // 안 가본 산 우대
        return { m: m, score: score, tmax: tmax, code: code, why: why };
      }).filter(function (s) { return s.score > -10; });
      scored.sort(function (a, b) { return b.score - a.score || b.m.elev - a.m.elev; });
      var picks = scored.slice(0, 3);
      var head = "🎯 " + (dayIdx ? "내일" : "오늘") + "의 추천 — " + (target.getMonth() + 1) + "월 " + target.getDate() + "일 " +
        ["일", "월", "화", "수", "목", "금", "토"][target.getDay()] + "요일";
      if (!picks.length) {
        box.innerHTML = '<div class="reco-head">' + esc(head) + '</div><div class="reco-empty">전국이 비 예보 ☔ — 오늘은 코스 공부하기 좋은 날입니다.</div>';
        box.style.display = "block";
        return;
      }
      box.innerHTML = '<div class="reco-head">' + esc(head) + '</div>' + picks.map(function (p) {
        var reason = p.why.slice();
        reason.push(wxLabel(p.code) + " " + Math.round(p.tmax) + "°C");
        return '<div class="reco-row" data-id="' + p.m.id + '">' +
          '<span class="reco-name">' + esc(p.m.name) + '</span>' +
          '<span class="reco-meta">' + esc(p.m.region) + ' · ' + p.m.elev + 'm</span>' +
          '<span class="reco-why">' + esc(reason.join(" · ")) + '</span></div>';
      }).join("");
      box.style.display = "block";
      Array.prototype.forEach.call(box.querySelectorAll(".reco-row"), function (row) {
        row.addEventListener("click", function () {
          var id = row.getAttribute("data-id");
          state.filter = "all";
          Array.prototype.forEach.call(document.querySelectorAll("#filters button"), function (b) {
            b.classList.toggle("active", b.getAttribute("data-tier") === "all");
          });
          expanded[id] = true;
          render(); renderList();
          var el = document.querySelector('.mrow[data-id="' + id + '"]');
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
          if (window.dataLayer) window.dataLayer.push({ event: "mt_reco_click", mt_id: id });
        });
      });
    }).catch(function () {}); // 날씨 실패 시 카드 없이 조용히 진행
  }

  resize();
  renderList();
  renderProgress();
  loadReco();
})();
