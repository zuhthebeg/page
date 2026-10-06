/* 산 체크리스트 — 정적 다크맵 + 클릭 토글. footprints의 merc/타일 로직 재사용(애니메이션 없는 축소판). */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };

  // 좌표는 OpenStreetMap 정상 지점(출입 제한 구간은 접근 가능한 인근 봉우리) 기준, r=인증 반경 m. 난이도는 공식 인증이 아니라 자체 분류.
  var MOUNTAINS = [
    { id: "halla", name: "한라산", region: "제주", elev: 1947, tier: "hard", lat: 33.3617, lng: 126.5292 },
    { id: "jiri", name: "지리산", region: "경남·전남·전북", elev: 1915, tier: "hard", lat: 35.33695, lng: 127.73059 },
    { id: "seorak", name: "설악산", region: "강원", elev: 1708, tier: "hard", lat: 38.11917, lng: 128.46531 },
    { id: "deogyu", name: "덕유산", region: "전북·경남", elev: 1614, tier: "mid", lat: 35.86001, lng: 127.74652 },
    { id: "gyebang", name: "계방산", region: "강원", elev: 1577, tier: "mid", lat: 37.72834, lng: 128.4655 },
    { id: "taebaek", name: "태백산", region: "강원", elev: 1567, tier: "mid", lat: 37.09856, lng: 128.91616 },
    { id: "odae", name: "오대산", region: "강원", elev: 1563, tier: "mid", lat: 37.79375, lng: 128.54265 },
    { id: "hambaek", name: "함백산", region: "강원", elev: 1573, tier: "mid", lat: 37.16116, lng: 128.9176 },
    { id: "sobaek", name: "소백산", region: "충북·경북", elev: 1439, tier: "mid", lat: 36.95749, lng: 128.4849 },
    { id: "chiak", name: "치악산", region: "강원", elev: 1288, tier: "mid", lat: 37.36515, lng: 128.05563 },
    { id: "worak", name: "월악산", region: "충북", elev: 1097, tier: "mid", lat: 36.88608, lng: 128.10584 },
    { id: "sokri", name: "속리산", region: "충북", elev: 1058, tier: "mid", lat: 36.54323, lng: 127.87086 },
    { id: "juwang", name: "주왕산", region: "경북", elev: 720, tier: "easy", lat: 36.38936, lng: 129.16239 },
    { id: "palgong", name: "팔공산", region: "대구·경북", elev: 1193, tier: "mid", lat: 36.01655, lng: 128.69532, r: 700 },
    { id: "gaya", name: "가야산", region: "경남·경북", elev: 1430, tier: "mid", lat: 35.82256, lng: 128.12294 },
    { id: "mudeung", name: "무등산", region: "광주", elev: 1187, tier: "easy", lat: 35.12092, lng: 127.00266, r: 600 },
    { id: "naejang", name: "내장산", region: "전북", elev: 763, tier: "easy", lat: 35.47833, lng: 126.88899 },
    { id: "wolchul", name: "월출산", region: "전남", elev: 809, tier: "mid", lat: 34.76662, lng: 126.70404 },
    { id: "jogye", name: "조계산", region: "전남", elev: 884, tier: "easy", lat: 35.0013, lng: 127.31363 },
    { id: "bukhan", name: "북한산", region: "서울", elev: 837, tier: "mid", lat: 37.65863, lng: 126.978 },
    { id: "dobong", name: "도봉산", region: "서울", elev: 740, tier: "mid", lat: 37.69866, lng: 127.01506 },
    { id: "gwanak", name: "관악산", region: "서울", elev: 632, tier: "easy", lat: 37.44514, lng: 126.96424 },
    { id: "cheonggye", name: "청계산", region: "서울·경기", elev: 618, tier: "easy", lat: 37.4219, lng: 127.04322 },
    { id: "suraksan", name: "수락산", region: "서울·경기", elev: 638, tier: "easy", lat: 37.69926, lng: 127.08134 },
    { id: "bulam", name: "불암산", region: "서울", elev: 508, tier: "easy", lat: 37.66365, lng: 127.09524 },
    { id: "acha", name: "아차산", region: "서울", elev: 287, tier: "easy", lat: 37.56684, lng: 127.10274 },
    { id: "mani", name: "마니산", region: "인천 강화", elev: 469, tier: "easy", lat: 37.61554, lng: 126.42968 },
    { id: "yumyeong", name: "유명산", region: "경기", elev: 862, tier: "easy", lat: 37.57534, lng: 127.48671 },
    { id: "myeongseong", name: "명성산", region: "경기·강원", elev: 923, tier: "mid", lat: 38.1043, lng: 127.33815 },
    { id: "hwaak", name: "화악산", region: "경기·강원", elev: 1468, tier: "mid", lat: 37.99467, lng: 127.50343, r: 800 },
    { id: "mindung", name: "민둥산", region: "강원", elev: 1119, tier: "easy", lat: 37.27094, lng: 128.77479 },
    { id: "gyeryong", name: "계룡산", region: "충남", elev: 845, tier: "mid", lat: 36.36144, lng: 127.21032 },
    { id: "daedun", name: "대둔산", region: "전북·충남", elev: 878, tier: "mid", lat: 36.12459, lng: 127.32048 },
    { id: "cheonma", name: "천마산", region: "경기", elev: 812, tier: "easy", lat: 37.68021, lng: 127.27335 },
    { id: "geomdan", name: "검단산", region: "경기", elev: 657, tier: "easy", lat: 37.51766, lng: 127.24935 },
    { id: "gaji", name: "가지산", region: "울산·경남·경북", elev: 1241, tier: "mid", lat: 35.620, lng: 129.003 },
    { id: "unmun", name: "운문산", region: "경북 청도", elev: 1195, tier: "mid", lat: 35.616, lng: 128.960 },
    { id: "cheonhwang", name: "천황산", region: "경남 밀양", elev: 1189, tier: "mid", lat: 35.558, lng: 128.972 },
    { id: "jaeyak", name: "재약산", region: "경남 밀양", elev: 1119, tier: "mid", lat: 35.545, lng: 128.981 },
    { id: "sinbul", name: "신불산", region: "울산·경남", elev: 1159, tier: "mid", lat: 35.53941, lng: 129.0541 },
    { id: "yeongchuk", name: "영축산", region: "경남 양산·울산", elev: 1081, tier: "mid", lat: 35.516, lng: 129.053 },
    { id: "ganwol", name: "간월산", region: "울산", elev: 1069, tier: "mid", lat: 35.552, lng: 129.040 },
    { id: "goheon", name: "고헌산", region: "울산", elev: 1034, tier: "mid", lat: 35.641, lng: 129.085 },
    { id: "munbok", name: "문복산", region: "경북", elev: 1015, tier: "mid", lat: 35.676, lng: 129.034 },
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
    gaji: [{ m: [12, 1, 2], why: "영남알프스 최고봉 설경·상고대" }, { m: [10, 11], why: "가을 단풍" }],
    unmun: [{ m: [10, 11], why: "가을 단풍·석골사 계곡" }],
    cheonhwang: [{ m: [10, 11], why: "사자평 억새 능선 (10월 중순~)" }],
    jaeyak: [{ m: [10, 11], why: "사자평 억새 (10월 중순~)" }],
    sinbul: [{ m: [10, 11], why: "신불평원 억새 (10월 중순~11월 초)" }],
    yeongchuk: [{ m: [10, 11], why: "신불평원 억새 능선" }],
    ganwol: [{ m: [10, 11], why: "간월재 억새·석양" }],
    goheon: [{ m: [10, 11], why: "고헌산성 억새·일출" }],
    munbok: [{ m: [10, 11], why: "영남 대표 단풍산·삼계리 계곡" }],
  };

  var STORE_KEY = "kr_mountains_v1";
  var checked = {};
  try { checked = JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); } catch (e) { checked = {}; }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(checked)); } catch (e) {} }

  // ── 정상 인증 도장: { id: { t: 인증시각(ms), d: 정상까지 거리(m), a: GPS 오차(m) } } — 위치 좌표는 저장하지 않는다
  var STAMP_KEY = "kr_mountains_stamps_v1";
  var stamps = {};
  try { stamps = JSON.parse(localStorage.getItem(STAMP_KEY) || "{}"); } catch (e) { stamps = {}; }
  function saveStamps() { try { localStorage.setItem(STAMP_KEY, JSON.stringify(stamps)); } catch (e) {} }
  var VERIFY_R = 400; // 정상 반경(m) — 산별 m.r로 덮어쓸 수 있다

  var state = { filter: "all", tab: "list" };
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
      var isStamp = !!stamps[m.id];
      var r = 5.5 * DPR;
      if (isStamp) {
        ctx.beginPath();
        ctx.arc(q.x, q.y, r + 3.5 * DPR, 0, 7);
        ctx.strokeStyle = "#ffd36b";
        ctx.lineWidth = 2 * DPR;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(q.x, q.y, r, 0, 7);
      ctx.fillStyle = isStamp ? "#ffd36b" : isOn ? "#3ef08c" : TIER_COLOR[m.tier];
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
        ctx.fillText(isStamp ? "★" : "✓", q.x, q.y + 0.5);
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
    if (stamps[id] && checked[id]) { say("정상 인증된 산은 체크를 해제할 수 없어요. 펼친 상세에서 '인증 취소' 후 가능해요."); return; }
    checked[id] = !checked[id];
    save();
    refresh();
    if (window.dataLayer) window.dataLayer.push({ event: "mt_toggle", mt_id: id, mt_on: checked[id] });
  }

  function renderProgress() {
    var total = MOUNTAINS.length;
    var n = MOUNTAINS.filter(function (m) { return checked[m.id]; }).length;
    $("#p-num").textContent = n + " / " + total;
    $("#p-bar").style.width = Math.round((n / total) * 100) + "%";
    $("#p-label").textContent = "완등 " + Math.round((n / total) * 100) + "%";
    renderRank();
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
        (stamps[m.id] ? '<span class="vmark" title="정상 인증 ' + fmtDate(stamps[m.id].t) + '">🏅</span>'
          : '<button type="button" class="vbtn" data-act="verify" title="이 정상 인증하기" aria-label="' + esc(m.name) + ' 정상 인증">📍</button>') +
        (info ? '<span class="caret">' + (open ? "▲" : "▼") + '</span>' : '') +
        '</div>' +
        (open && info ? detailHtml(info, m) : '') +
        '</div>';
    }).join("");
    Array.prototype.forEach.call(wrap.querySelectorAll(".mrow"), function (row) {
      row.addEventListener("click", function (e) {
        var id = row.getAttribute("data-id");
        // 체크박스는 완등 토글, 나머지 영역은 코스 정보 펼치기
        var act = e.target.getAttribute("data-act");
        if (act === "toggle") { toggle(id); return; }
        if (act === "verify") { verifyOne(id); return; }
        if (!(window.MT_INFO || {})[id]) { toggle(id); return; }
        expanded[id] = !expanded[id];
        renderList();
      });
    });
    Array.prototype.forEach.call(wrap.querySelectorAll(".mdetail [data-act]"), function (b) {
      b.addEventListener("click", function () {
        var id = b.closest(".mitem").querySelector(".mrow").getAttribute("data-id");
        if (b.getAttribute("data-act") === "verify") verifyOne(id);
        else if (b.getAttribute("data-act") === "unstamp") unstamp(id);
      });
    });
  }

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function detailHtml(info, m) {
    var h = '<div class="mdetail">';
    var st = stamps[m.id];
    h += '<div class="vbox">' + (st
      ? '<span>🏅 ' + fmtDate(st.t) + ' 정상 인증 완료</span><button type="button" class="vlink" data-act="unstamp">인증 취소</button>'
      : '<span>📍 정상 반경 ' + radiusOf(m) + 'm 안에서 인증할 수 있어요</span><button type="button" class="vlink vgo" data-act="verify">인증하기</button>') + '</div>';
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

  // ── 날짜·날씨 기반 오늘의 추천 — Open-Meteo(무키), 전체 좌표 일괄 1콜 ──
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


  // ════════ 정상 인증 · 도장 수집 ════════
  function byId(id) { return MOUNTAINS.filter(function (m) { return m.id === id; })[0]; }
  function radiusOf(m) { return m.r || VERIFY_R; }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function fmtDate(t) { var d = new Date(t); return d.getFullYear() + "." + pad2(d.getMonth() + 1) + "." + pad2(d.getDate()); }
  function fmtDist(d) { return d < 1000 ? (Math.round(d / 10) * 10) + "m" : (d / 1000).toFixed(d < 10000 ? 1 : 0) + "km"; }
  function hav(lat1, lng1, lat2, lng2) {
    var R = 6371000, t = Math.PI / 180;
    var a = Math.sin((lat2 - lat1) * t / 2), b = Math.sin((lng2 - lng1) * t / 2);
    var x = a * a + Math.cos(lat1 * t) * Math.cos(lat2 * t) * b * b;
    return 2 * R * Math.asin(Math.sqrt(x));
  }
  function stampCount() { return MOUNTAINS.filter(function (m) { return stamps[m.id]; }).length; }
  var sayTimer = null;
  function say(msg, kind) {
    var el = $("#summit-msg");
    if (!el) return;
    clearTimeout(sayTimer);
    el.textContent = msg || "";
    el.className = "summit-msg" + (msg ? " show" : "") + (kind ? " " + kind : "");
    if (msg && !busy) sayTimer = setTimeout(function () { el.className = "summit-msg"; }, 9000);
  }
  function refresh() { render(); renderList(); renderProgress(); renderStampbook(); }

  // 칭호 — 정상 도장 수 기준
  var RANKS = [
    { n: 0, t: "산 입문자" }, { n: 1, t: "산린이" }, { n: 3, t: "주말 산꾼" }, { n: 6, t: "능선 러너" },
    { n: 10, t: "봉우리 수집가" }, { n: 18, t: "명산 헌터" }, { n: 28, t: "산악 마스터" },
    { n: 40, t: "명산 정복자" }, { n: 44, t: "산신령" }
  ];
  function rankIdx(n) { var i = 0; RANKS.forEach(function (r, k) { if (n >= r.n) i = k; }); return i; }

  // 배지 — 모두 저장된 도장(id, 시각)에서 계산. 목표 수는 데이터에서 파생
  var ALPS = ["gaji", "unmun", "cheonhwang", "jaeyak", "sinbul", "yeongchuk", "ganwol", "goheon", "munbok"];
  function ids(fn) { return MOUNTAINS.filter(fn).map(function (m) { return m.id; }); }
  function have(list) { return list.filter(function (id) { return stamps[id]; }).length; }
  function badges() {
    var total = MOUNTAINS.length;
    var all = ids(function () { return true; });
    var k1000 = ids(function (m) { return m.elev >= 1000; });
    var seoul = ids(function (m) { return m.region.indexOf("서울") === 0; });
    var gangwon = ids(function (m) { return m.region.indexOf("강원") >= 0; });
    var top3 = ["halla", "jiri", "seorak"];
    var perDay = {}, winter = 0, sunrise = 0;
    MOUNTAINS.forEach(function (m) {
      var st = stamps[m.id]; if (!st) return;
      var d = new Date(st.t), k = fmtDate(st.t);
      perDay[k] = (perDay[k] || 0) + 1;
      var mo = d.getMonth() + 1, h = d.getHours();
      if (mo === 12 || mo <= 2) winter++;
      if (h >= 4 && h < 9) sunrise++;
    });
    var maxDay = 0; for (var k in perDay) maxDay = Math.max(maxDay, perDay[k]);
    function B(id, icon, name, desc, h, need) { return { id: id, icon: icon, name: name, desc: desc, have: Math.min(h, need), need: need, done: h >= need }; }
    var n = have(all);
    return [
      B("first", "🥾", "첫 정상", "첫 도장 찍기", n, 1),
      B("five", "⛰", "5봉 수집", "정상 5곳 인증", n, 5),
      B("ten", "🏔", "10봉 수집", "정상 10곳 인증", n, 10),
      B("twenty", "🗻", "20봉 수집", "정상 20곳 인증", n, 20),
      B("all", "👑", "전 봉우리 정복", "전체 " + total + "곳 인증", n, total),
      B("top3", "🔱", "남한 3대 고봉", "한라산·지리산·설악산", have(top3), 3),
      B("alps", "🦅", "영남알프스 9봉", "1,000m급 억새 능선 9곳", have(ALPS), ALPS.length),
      B("k1000", "☁️", "천 미터 클럽", "해발 1,000m 이상 10곳", have(k1000), Math.min(10, k1000.length)),
      B("seoul", "🏙", "서울 산 정복", "서울 " + seoul.length + "곳 인증", have(seoul), seoul.length),
      B("gangwon", "🌲", "강원 정복", "강원 " + gangwon.length + "곳 인증", have(gangwon), gangwon.length),
      B("twoday", "🔥", "연봉 종주", "하루에 2곳 이상 인증", maxDay, 2),
      B("winter", "❄️", "설산 정복자", "12~2월에 정상 인증", winter, 1),
      B("sunrise", "🌅", "일출 정상", "오전 4~9시에 정상 인증", sunrise, 1)
    ];
  }
  function doneSet() { var o = {}; badges().forEach(function (b) { if (b.done) o[b.id] = b; }); return o; }

  // 다음 목표 한 줄 — 완성에 가장 가까운 미달성 배지를 들이민다
  function nudge() {
    var n = stampCount(), ri = rankIdx(n);
    var best = null;
    badges().forEach(function (b) {
      if (b.done || b.have === 0 || b.need === 1) return;
      var r = b.have / b.need;
      if (!best || r > best.r) best = { b: b, r: r };
    });
    var lines = [];
    if (best) lines.push("🔥 " + best.b.name + " " + best.b.have + "/" + best.b.need + " — " + (best.b.need - best.b.have) + "곳만 더 채우면 배지!");
    if (ri < RANKS.length - 1) lines.push("🎖 다음 칭호 '" + RANKS[ri + 1].t + "'까지 " + (RANKS[ri + 1].n - n) + "곳");
    return lines;
  }

  function renderRank() {
    var box = $("#rankcard"); if (!box) return;
    var n = stampCount(), r = RANKS[rankIdx(n)], total = MOUNTAINS.length;
    var bs = badges(), got = bs.filter(function (b) { return b.done; }).length;
    var pending = MOUNTAINS.filter(function (m) { return checked[m.id] && !stamps[m.id]; }).length;
    var h = '<div class="rk-top"><span class="rk-title">🎖 ' + esc(r.t) + '</span>' +
      '<span class="rk-count">정상 도장 <b>' + n + '</b> / ' + total + ' · 배지 <b>' + got + '</b> / ' + bs.length + '</span></div>';
    if (n === 0) h += '<div class="rk-line">정상에 오르면 위의 버튼으로 첫 도장을 찍어보세요. 도장판에 44개 칸이 기다리고 있어요.</div>';
    else nudge().forEach(function (l) { h += '<div class="rk-line">' + esc(l) + '</div>'; });
    if (pending > 0 && n > 0) h += '<div class="rk-line dim">다녀옴 체크만 된 산 ' + pending + '곳 — 다음 산행 때 정상에서 도장을 받아보세요.</div>';
    box.innerHTML = h;
  }

  // ── GPS ──
  var busy = false;
  function locate(ok, fail) {
    if (!navigator.geolocation) { fail({ code: 0 }); return; }
    navigator.geolocation.getCurrentPosition(ok, fail, { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 });
  }
  function geoError(err) {
    if (err && err.code === 1) return "위치 권한이 꺼져 있어요. 브라우저(또는 설정)에서 이 사이트의 위치를 허용해주세요.";
    if (err && err.code === 3) return "GPS 신호를 못 잡았어요. 하늘이 트인 곳에서 다시 눌러주세요.";
    if (err && err.code === 0) return "이 브라우저는 위치 기능을 지원하지 않아요.";
    return "위치를 확인하지 못했어요. 잠시 후 다시 시도해주세요.";
  }
  function setBusy(b) {
    busy = b;
    var btn = $("#btn-summit");
    btn.disabled = b;
    $("#btn-summit-t").textContent = b ? "GPS 잡는 중…" : "지금 정상이에요 — 도장 찍기";
  }

  function judge(pos, m) {
    var c = pos.coords, acc = c.accuracy || 0;
    var d = hav(c.latitude, c.longitude, m.lat, m.lng);
    return { d: d, acc: acc, ok: d <= radiusOf(m) + Math.min(acc, 100) };
  }

  // 위치 한 번으로 판정 — only가 있으면 그 산만, 없으면 반경 안에 든 가장 가까운 산
  function verify(only) {
    if (busy) return;
    say("");
    setBusy(true);
    say("📡 위치 확인 중… 처음엔 10~20초 걸릴 수 있어요", "info");
    locate(function (pos) {
      setBusy(false);
      var acc = pos.coords.accuracy || 0;
      var cands = (only ? [only] : MOUNTAINS).map(function (m) { var j = judge(pos, m); j.m = m; return j; });
      var hit = cands.filter(function (j) { return j.ok; }).sort(function (a, b) { return a.d / radiusOf(a.m) - b.d / radiusOf(b.m); })[0];
      if (hit) {
        if (acc > 300) { say("GPS 정확도가 낮아요(±" + Math.round(acc) + "m). 하늘이 트인 곳에서 다시 눌러주세요.", "warn"); return; }
        if (stamps[hit.m.id]) { say("🏅 " + hit.m.name + "은(는) " + fmtDate(stamps[hit.m.id].t) + "에 이미 도장을 찍었어요.", "info"); return; }
        stampIt(hit.m, hit);
        return;
      }
      var near = cands.sort(function (a, b) { return a.d - b.d; })[0];
      if (only) say(only.name + " 정상까지 약 " + fmtDist(near.d) + " 남았어요. 정상 반경 " + radiusOf(only) + "m 안에서 눌러주세요.", "warn");
      else say("가까운 정상이 없어요. 가장 가까운 곳은 " + near.m.name + "(" + fmtDist(near.d) + "). 정상 반경 " + radiusOf(near.m) + "m 안에서 눌러주세요.", "warn");
    }, function (err) {
      setBusy(false);
      say(geoError(err), "warn");
    });
  }
  function verifyOne(id) { var m = byId(id); if (m) verify(m); }

  function stampIt(m, j) {
    var beforeRank = rankIdx(stampCount()), beforeBadges = doneSet();
    stamps[m.id] = { t: Date.now(), d: Math.round(j.d), a: Math.round(j.acc) };
    checked[m.id] = true;
    save(); saveStamps();
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
    var afterBadges = doneSet();
    var gained = Object.keys(afterBadges).filter(function (k) { return !beforeBadges[k]; }).map(function (k) { return afterBadges[k]; });
    var rankUp = rankIdx(stampCount()) > beforeRank ? RANKS[rankIdx(stampCount())] : null;
    refresh();
    say("");
    try { if (navigator.vibrate) navigator.vibrate([40, 50, 120]); } catch (e) {}
    showStampModal(m, gained, rankUp);
    if (window.dataLayer) window.dataLayer.push({ event: "mt_verify", mt_id: m.id, mt_count: stampCount() });
  }

  function unstamp(id) {
    var m = byId(id);
    if (!m || !stamps[id]) return;
    if (!window.confirm(m.name + " 정상 인증 도장을 취소할까요? (다녀옴 체크는 유지돼요)")) return;
    delete stamps[id];
    saveStamps();
    refresh();
  }

  // ── 도장 모달 ──
  function stampHtml(m, st, rot) {
    return '<div class="stamp v tier-' + m.tier + '" style="--rot:' + rot + 'deg"><div class="ring"><span class="s-top">정상 인증</span>' +
      '<span class="s-name">' + esc(m.name) + '</span><span class="s-elev">' + m.elev.toLocaleString() + 'm</span>' +
      '<span class="s-date">' + fmtDate(st.t) + '</span></div></div>';
  }
  function rotOf(id) { var h = 0; for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997; return (h % 17) - 8; }
  var lastModalFocus = null;
  function showStampModal(m, gained, rankUp) {
    var st = stamps[m.id], n = stampCount(), total = MOUNTAINS.length;
    var h = '<div class="confetti" aria-hidden="true">';
    for (var i = 0; i < 28; i++) {
      h += '<i style="--x:' + (Math.round(Math.random() * 100)) + '%;--dl:' + (Math.random() * .5).toFixed(2) + 's;--c:' + ["#ffd36b", "#3ef08c", "#39c0ff", "#ff6b81", "#b48cff"][i % 5] + ';--r:' + Math.round(Math.random() * 360) + 'deg"></i>';
    }
    h += '</div>';
    h += '<div class="sm-kicker" id="sm-title">' + n + '번째 정상 도장!</div>' + stampHtml(m, st, rotOf(m.id) * 0.6);
    h += '<div class="sm-sub">' + esc(m.name) + ' 정상 · ' + total + '곳 중 <b>' + n + '</b>곳 수집</div>';
    if (rankUp) h += '<div class="sm-rank">🎖 칭호 승급 → <b>' + esc(rankUp.t) + '</b></div>';
    gained.forEach(function (b) { h += '<div class="sm-badge">' + b.icon + ' 배지 획득 · <b>' + esc(b.name) + '</b></div>'; });
    var ng = nudge();
    if (ng.length) h += '<div class="sm-next">' + esc(ng[0]) + '</div>';
    h += '<div class="sm-actions"><button type="button" id="sm-share" class="btn-main">공유하기</button><button type="button" id="sm-close" class="btn-sub">닫기</button></div>';
    var box = $("#stamp-modal"), card = $("#stamp-modal-card");
    card.innerHTML = h;
    lastModalFocus = document.activeElement;
    box.hidden = false;
    $("#sm-close").focus();
    $("#sm-close").onclick = closeModal;
    $("#sm-share").onclick = function () { share(m); };
  }
  function closeModal() { $("#stamp-modal").hidden = true; if (lastModalFocus && lastModalFocus.focus) lastModalFocus.focus(); }
  $("#stamp-modal").addEventListener("click", function (e) { if (e.target === this) closeModal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !$("#stamp-modal").hidden) closeModal(); });

  function share(m) {
    var n = stampCount(), r = RANKS[rankIdx(n)].t;
    var text = "🏔 " + (m ? m.name + " 정상 도장 찍음! " : "") + "한국 명산 " + MOUNTAINS.length + "곳 중 " + n + "곳 수집 · 칭호 '" + r + "'";
    var url = "https://page.cocy.io/mountains/";
    if (navigator.share) {
      navigator.share({ title: "산 체크리스트", text: text, url: url }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text + " " + url).then(function () { say("공유 문구를 복사했어요 📋", "info"); closeModal(); });
    }
    if (window.dataLayer) window.dataLayer.push({ event: "mt_share", mt_count: n });
  }

  // ── 도장판 ──
  function renderStampbook() {
    var box = $("#stampbook"); if (!box) return;
    if (state.tab !== "stamps") return;
    var list = visibleList().slice().sort(function (a, b) { return b.elev - a.elev; });
    var h = '<div class="badges">' + badges().map(function (b) {
      return '<div class="badge' + (b.done ? ' on' : '') + '" title="' + esc(b.desc) + '"><span class="b-ico">' + b.icon + '</span>' +
        '<span class="b-name">' + esc(b.name) + '</span><span class="b-prog">' + (b.done ? "달성" : b.have + "/" + b.need) + '</span></div>';
    }).join("") + '</div>';
    h += '<div class="stamps">' + list.map(function (m) {
      var st = stamps[m.id];
      if (st) return '<button type="button" class="slot" data-id="' + m.id + '">' + stampHtml(m, st, rotOf(m.id)) + '</button>';
      var on = !!checked[m.id];
      return '<button type="button" class="slot" data-id="' + m.id + '"><div class="stamp ' + (on ? 'c' : 'n') + '"><div class="ring">' +
        '<span class="s-name">' + esc(m.name) + '</span><span class="s-elev">' + m.elev.toLocaleString() + 'm</span>' +
        '<span class="s-date">' + (on ? "다녀옴 · 인증 전" : "미수집") + '</span></div></div></button>';
    }).join("") + '</div>';
    h += '<div class="bk-tools"><button type="button" class="vlink" id="bk-share">내 수집 공유</button><button type="button" class="vlink" id="bk-out">백업 코드 복사</button><button type="button" class="vlink" id="bk-in">백업 복원</button></div>';
    box.innerHTML = h;
    Array.prototype.forEach.call(box.querySelectorAll(".slot"), function (el) {
      el.addEventListener("click", function () {
        var id = el.getAttribute("data-id");
        expanded[id] = true;
        setTab("list");
        var row = document.querySelector('.mrow[data-id="' + id + '"]');
        if (row) row.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
    $("#bk-share").onclick = function () { share(null); };
    $("#bk-out").onclick = backupOut;
    $("#bk-in").onclick = backupIn;
  }

  function setTab(t) {
    state.tab = t;
    Array.prototype.forEach.call(document.querySelectorAll("#tabs button"), function (b) {
      b.classList.toggle("active", b.getAttribute("data-tab") === t);
    });
    $("#mlist").hidden = t !== "list";
    $("#stampbook").hidden = t !== "stamps";
    if (t === "stamps") renderStampbook(); else renderList();
  }
  Array.prototype.forEach.call(document.querySelectorAll("#tabs button"), function (b) {
    b.addEventListener("click", function () { setTab(b.getAttribute("data-tab")); });
  });

  // ── 백업 — 사파리 저장소 정리 대비. 좌표 없이 id·시각만 들어간다 ──
  function backupOut() {
    var code = "MT1:" + btoa(JSON.stringify({ c: checked, s: stamps }));
    var done = function () { say("백업 코드를 복사했어요. 메모장 등에 붙여넣어 보관하세요 📋", "info"); };
    if (navigator.clipboard) navigator.clipboard.writeText(code).then(done, function () { window.prompt("백업 코드를 복사해두세요", code); });
    else window.prompt("백업 코드를 복사해두세요", code);
  }
  function backupIn() {
    var code = window.prompt("백업 코드를 붙여넣으세요");
    if (!code) return;
    try {
      if (code.indexOf("MT1:") !== 0) throw new Error("fmt");
      var o = JSON.parse(atob(code.slice(4)));
      var added = 0;
      MOUNTAINS.forEach(function (m) {
        if (o.c && o.c[m.id] && !checked[m.id]) checked[m.id] = true;
        var s = o.s && o.s[m.id];
        if (s && typeof s.t === "number" && (!stamps[m.id] || s.t < stamps[m.id].t)) { if (!stamps[m.id]) added++; stamps[m.id] = { t: s.t, d: +s.d || 0, a: +s.a || 0 }; checked[m.id] = true; }
      });
      save(); saveStamps(); refresh();
      say("복원 완료 — 도장 " + added + "개를 추가했어요.", "info");
    } catch (e) { say("백업 코드가 올바르지 않아요.", "warn"); }
  }

  $("#btn-summit").addEventListener("click", function () { verify(null); });

  resize();
  renderList();
  renderProgress();
  loadReco();
})();
