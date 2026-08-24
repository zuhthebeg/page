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
    errMemory: "파일이 너무 커서 이 기기의 메모리로는 처리하지 못했어요. PC 브라우저에서 다시 시도해보세요.",
    tripsTitle: "🧳 자동 감지된 여행",
    tripsSub: "집→집 구간 · 누르면 그 여행만 재생",
    tripsAll: "↺ 전체 기간 보기",
    tripsNights: "박",
    tripsEtc: "외 {n}곳",
    tripsNoCity: "미등록 지역",
    tripsOngoing: "진행 중",
    rankLgYear: "년",
    tripsTravly: "이 여행을 Travly에 등록",
    tripsTravlyNote: "🧭 버튼으로 그 여행 하나만 Travly에 등록해요. 도시·날짜 요약만 전달되고 GPS 좌표 원본은 브라우저 밖으로 나가지 않아요 — 저장은 Travly에서 확인 후 진행됩니다.",
    parsing: "🥾 발자국을 읽는 중… 파일이 크면 몇십 초 걸릴 수 있어요",
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
    trBadgeEarth: "지구 정복자", trBadgeNomad: "역마살 만렙", trBadgeSprint: "질주 본능",
    trBadgeWanderer: "방랑자", trBadgeNight: "심야 유랑자", trBadgeHomebody: "집돌이 마스터",
    trBadgeLogger: "기록의 신", trBadgeNormal: "평범한 하루하루",
    trAxisExplorer: "탐험가", trAxisRegular: "단골러", trAxisLong: "장거리", trAxisLocal: "동네",
    trAxisWeekend: "주말형", trAxisWeekday: "평일형", trAxisNight: "🦉 심야형", trAxisDay: "☀️ 주행성",
    rankBtn: "🏆 랭킹 등록하기",
    rankPayload: '서버로 전송되는 값: 닉네임 · 칭호 "{title}" (티어 {tier}/8) · 대략 거리 {km} · 기록 {days}일. 좌표·경로 데이터는 전송되지 않습니다.',
    rankNickPh: "닉네임 (선택, 비우면 익명)",
    rankKmFmt: "약 {v}km", kmMan: "만",
    rankConfirm: "등록하기", rankCancel: "취소",
    rankOk: "✅ 등록 완료! 대표 칭호: {title}",
    rankKept: "이미 더 높은 칭호가 등록돼 있어요: {title}",
    rankErr: "랭킹 등록에 실패했어요. 잠시 후 다시 시도해주세요.",
    rankBoardTitle: "명예의 전당", rankEmpty: "아직 아무도 등록 안 했어요 — 첫 주자가 되어보세요!",
    rankAnon: "익명",
    regionOff: "🖊 영역 선택", regionOn: "🖊 지도를 드래그하세요…",
    regionLabel: "🗺 선택 영역만 표시 중 · {n}개 지점", regionClear: "✕ 해제",
    regionTooSmall: "선택 영역이 너무 작아요. 더 크게 드래그해주세요.",
    dnaTitle: "🧬 여행 DNA",
    dnaHome: "베이스캠프", dnaTripsLabel: "다녀온 곳", dnaAbroadLabel: "해외",
    dnaDays: "일", dnaCount: "곳",
    dnaBtn: "✈️ 이 기록으로 Travly에서 다음 여행 추천받기",
    dnaNote: "도시 판별은 이 기기 안에서만 · Travly에는 도시 이름 요약만 전달되고 좌표 원본은 전송되지 않습니다",
    dnaFallback: "✈️ 다음 여행을 계획 중이라면 — AI 여행 플래너 Travly에서 일정을 짜보세요.",
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
    var trips = detectTrips(clean, data.visits); // 여행 자동 감지 — 다운샘플 전 풀해상도 기준

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

    var out = assemble(clean, data.visits.filter(function (v) { return isFinite(v.lat); }));
    out.trips = trips;
    return out;
  }

  // ── 여행 자동 감지 — 야간 최빈 클러스터를 '집'으로 보고 집→집 이탈 구간을 여행으로 분리.
  //    전부 온디바이스 계산. 월별로 집을 따로 잡아 이사·장기 체류 변화에 대응한다.
  var TRIP_HOME_KM = 4, TRIP_MIN_KM = 50;
  function localDay(t) { var d = new Date(t); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function detectTrips(pts, visits) {
    if (pts.length < 20) return [];
    var vs = (visits || []).filter(function (v) { return isFinite(v.lat) && isFinite(v.lng) && v.t != null; })
      .sort(function (a, b) { return a.t - b.t; });
    // 1) 월별 야간(22~06시) 포인트를 ~2km 그리드로 집계 → 최빈 셀 = 그 달의 집
    var monthCells = {}, i, d;
    for (i = 0; i < pts.length; i++) {
      d = new Date(pts[i].t);
      var h = d.getHours();
      if (h >= 7 && h < 22) continue;
      var ym = d.getFullYear() + "-" + d.getMonth();
      var ck = Math.round(pts[i].lat / 0.02) + "," + Math.round(pts[i].lng / 0.02);
      var mc = monthCells[ym] || (monthCells[ym] = {});
      var c = mc[ck] || (mc[ck] = { n: 0, lat: 0, lng: 0 });
      c.n++; c.lat += pts[i].lat; c.lng += pts[i].lng;
    }
    var homes = {}, globalBest = null;
    Object.keys(monthCells).forEach(function (ym) {
      var best = null, mc = monthCells[ym];
      Object.keys(mc).forEach(function (k) { if (!best || mc[k].n > best.n) best = mc[k]; });
      if (best && best.n >= 3) {
        homes[ym] = { lat: best.lat / best.n, lng: best.lng / best.n };
        if (!globalBest || best.n > globalBest.n) globalBest = best;
      }
    });
    if (!globalBest) return [];
    var globalHome = { lat: globalBest.lat / globalBest.n, lng: globalBest.lng / globalBest.n };

    // 2) 상태머신: 집 반경(4km) 밖 체류가 1박 이상 + 최대 이탈 50km 이상이면 여행으로 확정
    var trips = [], cur = null, lastHomeIdx = -1;
    for (i = 0; i < pts.length; i++) {
      d = new Date(pts[i].t);
      var home = homes[d.getFullYear() + "-" + d.getMonth()] || globalHome;
      var dh = hav(pts[i], home);
      if (dh < TRIP_HOME_KM) {
        if (cur) { finishTrip(trips, pts, cur, i, vs); cur = null; }
        lastHomeIdx = i;
      } else if (!cur) {
        cur = { s: lastHomeIdx >= 0 ? lastHomeIdx : i, maxKm: dh, home: home };
      } else if (dh > cur.maxKm) cur.maxKm = dh;
    }
    if (cur) { var last = trips.length; finishTrip(trips, pts, cur, pts.length - 1, vs); if (trips.length > last) trips[trips.length - 1].open = true; }
    return trips;
  }
  function matchCity(p) {
    var cities = window.FP_CITIES || [], best = null, bestD = CITY_MATCH_KM;
    for (var j = 0; j < cities.length; j++) {
      if (Math.abs(cities[j][1] - p.lat) > 0.35) continue;
      var dd = hav({ lat: cities[j][1], lng: cities[j][2] }, p);
      if (dd < bestD) { bestD = dd; best = cities[j]; }
    }
    return best;
  }
  function dayStartMs(t) { var d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); }
  // 애니메이션·일정용 리치 데이터 — 좌표는 소수 3자리(~110m)로 러프화, 집 근처는 제외
  function r3(n) { return Math.round(n * 1000) / 1000; }
  function tripPath(pts, s, endIdx, home) {
    var away = [];
    for (var i = s; i <= endIdx; i++) if (hav(pts[i], home) > 3) away.push(pts[i]);
    if (away.length < 2) return [];
    var stride = Math.max(1, Math.ceil(away.length / 240)), out = [], t0 = away[0].t;
    for (var j = 0; j < away.length; j += stride) {
      out.push([Math.round((away[j].t - t0) / 60000), r3(away[j].lat), r3(away[j].lng)]);
    }
    return out;
  }
  function tripPoi(pts, s, endIdx, home, vs, day0) {
    var poi = [], lastStay = null, seenMeal = {};
    var pad2 = function (n) { return (n < 10 ? "0" : "") + n; };
    // 숙소: 심야(00~06시) 체류 지점 — 직전 숙소에서 800m 이상 떨어졌을 때만 새 숙소로
    // (GPS 지터로 같은 호텔이 중복 등록되는 것 방지). 연박은 체크인 저녁 1건으로
    for (var i = s; i <= endIdx; i++) {
      var d = new Date(pts[i].t), h = d.getHours();
      if (h >= 6) continue;
      if (hav(pts[i], home) < 4) continue;
      if (lastStay && hav(pts[i], lastStay) < 0.8) continue;
      lastStay = { lat: pts[i].lat, lng: pts[i].lng };
      var off = Math.round((dayStartMs(pts[i].t) - day0) / 86400000);
      poi.push({ o: Math.max(0, off - 1), k: "stay", h: "21:00", lat: r3(pts[i].lat), lng: r3(pts[i].lng) });
      if (poi.length >= 20) break;
    }
    // 식당: 방문(visit) 중 점심(11~14시)·저녁(17~21시) 시간대, 날짜·슬롯당 1건
    var t0 = pts[s].t, t1 = pts[endIdx].t;
    for (var v = 0; v < vs.length && poi.length < 44; v++) {
      var vt = vs[v];
      if (vt.t < t0 || vt.t > t1) continue;
      if (hav(vt, home) < 4) continue;
      var vd = new Date(vt.t), vh = vd.getHours();
      var slot = vh >= 11 && vh < 15 ? "lunch" : vh >= 17 && vh < 22 ? "dinner" : null;
      if (!slot) continue;
      var voff = Math.round((dayStartMs(vt.t) - day0) / 86400000);
      var mk = voff + slot;
      if (seenMeal[mk]) continue;
      seenMeal[mk] = 1;
      poi.push({ o: voff, k: slot, h: pad2(vh) + ":" + pad2(vd.getMinutes()), lat: r3(vt.lat), lng: r3(vt.lng) });
    }
    poi.sort(function (a, b) { return a.o - b.o; });
    return poi;
  }
  function finishTrip(trips, pts, cur, endIdx, vs) {
    if (cur.maxKm < TRIP_MIN_KM) return;
    var s = cur.s, days = {}, km = 0, i;
    for (i = s; i <= endIdx; i++) {
      days[localDay(pts[i].t)] = 1;
      if (i > s) km += hav(pts[i - 1], pts[i]);
    }
    var nDays = Object.keys(days).length;
    if (nDays < 2) return; // 당일치기 제외 — 1박 이상만 여행으로
    // 도시 매칭 — 날짜별 첫 원거리(집 15km+) 포인트 샘플, 등장 순서 유지.
    // dayCity: 여행 시작일 기준 날짜 오프셋별 도시 인덱스(-1=미상) — Travly 스켈레톤 일정용
    var homeCity = matchCity(cur.home), seen = {}, cityOrder = [], cityIdx = {};
    var day0 = dayStartMs(pts[s].t);
    var span = Math.min(120, Math.round((dayStartMs(pts[endIdx].t) - day0) / 86400000) + 1);
    var dayCity = [];
    for (i = 0; i < span; i++) dayCity.push(-1);
    for (i = s; i <= endIdx; i++) {
      var dk = localDay(pts[i].t);
      if (seen[dk]) continue;
      if (hav(pts[i], cur.home) < 15) continue;
      seen[dk] = 1;
      var cty = matchCity(pts[i]);
      if (!cty || (homeCity && cty[0] === homeCity[0])) continue;
      if (cityIdx[cty[0]] === undefined) { cityIdx[cty[0]] = cityOrder.length; cityOrder.push([cty[0], cty[3]]); }
      var off = Math.round((dayStartMs(pts[i].t) - day0) / 86400000);
      if (off >= 0 && off < span) dayCity[off] = cityIdx[cty[0]];
    }
    var homeCc = homeCity ? homeCity[3] : null;
    trips.push({
      t0: pts[s].t, t1: pts[endIdx].t, nights: nDays - 1,
      km: Math.round(km), maxKm: Math.round(cur.maxKm),
      cities: cityOrder, days: dayCity,
      path: tripPath(pts, s, endIdx, cur.home),
      poi: tripPoi(pts, s, endIdx, cur.home, vs || [], day0),
      abroad: !!(homeCc && cityOrder.some(function (c) { return c[1] !== homeCc; })),
    });
  }

  // 정제 완료된 포인트/방문 배열 → 렌더 가능한 데이터 뷰(점프·누적거리·통계·bbox)
  // 기간 선택(applyRange)이 부분 배열로 재호출한다
  function assemble(clean, visits) {
    var jumps = [];
    for (var k2 = 1; k2 < clean.length; k2++) jumps.push(hav(clean[k2 - 1], clean[k2]) > JUMP_KM);
    var totalKm = 0, dayKm = {}, days = {}, cumKm = [0];
    // 재생 도메인(cumPlay): 비행(점프) 구간은 로그 압축 — 등속 재생에서 장거리 비행이
    // 전체 재생 시간을 다 먹는 것 방지 (미국행 9000km ≈ 417 재생km, 약 21배속)
    var playKm = 0, cumPlay = [0];
    for (var k = 1; k < clean.length; k++) {
      var d = hav(clean[k - 1], clean[k]);
      totalKm += d;
      cumKm.push(totalKm);
      playKm += d > JUMP_KM ? JUMP_KM * (1 + Math.log(d / JUMP_KM) / Math.LN10) : d;
      cumPlay.push(playKm);
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
      points: clean, jumps: jumps, cumKm: cumKm, cumPlay: cumPlay, visits: visits, bbox: bbox,
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
    regionMode: false, regionBBox: null, dragStart: null, dragCur: null,
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
    // 진행률은 cumPlay(비행 압축) 도메인, HUD/꼬리용 km는 cumKm(실거리) 유지
    var pts = state.data.points, cum = state.data.cumPlay || state.data.cumKm, real = state.data.cumKm;
    var total = cum[cum.length - 1];
    var last = pts.length - 1;
    if (!total || p <= 0) return { p: pts[0], idx: 0, frac: 0, t: pts[0].t, km: 0 };
    if (p >= 1) return { p: pts[last], idx: Math.max(0, last - 1), frac: 1, t: pts[last].t, km: real[real.length - 1] };
    var km = total * p;
    var lo = 0, hi = cum.length - 1;
    while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (cum[mid] <= km) lo = mid; else hi = mid - 1; }
    var i = Math.min(lo, last - 1);
    var segKm = cum[i + 1] - cum[i] || 1;
    var f = Math.max(0, Math.min(1, (km - cum[i]) / segKm));
    return {
      idx: i, frac: f, km: real[i] + (real[i + 1] - real[i]) * f,
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
    var BUCKETS = 24;
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

  // ── 영역 선택 — 지도 위 드래그 박스 → lat/lng bbox 필터. 서버 호출 없이 기존 merc/invMerc 투영만 재사용 ──
  function screenToLatLng(sx, sy) {
    var cam = state.cam;
    if (!cam) return null;
    var w = canvas.width, h = canvas.height;
    var zi = Math.max(2, Math.min(12, Math.round(cam.z)));
    var scale = Math.pow(2, cam.z - zi);
    var c = merc(cam.lat, cam.lng, zi);
    return invMerc((sx - w / 2) / scale + c.x, (sy - h / 2) / scale + c.y, zi);
  }
  function drawDragOverlay() {
    if (!state.dragStart || !state.dragCur) return;
    var x0 = Math.min(state.dragStart.x, state.dragCur.x), x1 = Math.max(state.dragStart.x, state.dragCur.x);
    var y0 = Math.min(state.dragStart.y, state.dragCur.y), y1 = Math.max(state.dragStart.y, state.dragCur.y);
    ctx.save();
    ctx.fillStyle = "rgba(139,92,246,.18)";
    ctx.strokeStyle = "rgba(139,92,246,.9)";
    ctx.lineWidth = 2 * DPR;
    ctx.setLineDash([6 * DPR, 5 * DPR]);
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    ctx.restore();
  }

  var regionBtn = $("#region"), regionClearBtn = $("#regionclear");
  if (regionBtn) regionBtn.addEventListener("click", function () {
    state.regionMode = !state.regionMode;
    canvas.classList.toggle("region-mode", state.regionMode);
    regionBtn.classList.toggle("active", state.regionMode);
    regionBtn.textContent = state.regionMode ? S.regionOn : S.regionOff;
    if (state.regionMode) pause();
  });
  if (regionClearBtn) regionClearBtn.addEventListener("click", function () {
    state.regionBBox = null;
    applyRange();
  });
  canvas.addEventListener("pointerdown", function (e) {
    if (!state.regionMode || !state.data) return;
    var rect = canvas.getBoundingClientRect();
    var p = { x: (e.clientX - rect.left) * (canvas.width / rect.width), y: (e.clientY - rect.top) * (canvas.height / rect.height) };
    state.dragStart = p; state.dragCur = p;
    canvas.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  canvas.addEventListener("pointermove", function (e) {
    if (!state.regionMode || !state.dragStart) return;
    var rect = canvas.getBoundingClientRect();
    state.dragCur = { x: (e.clientX - rect.left) * (canvas.width / rect.width), y: (e.clientY - rect.top) * (canvas.height / rect.height) };
    render();
    drawDragOverlay();
  });
  canvas.addEventListener("pointerup", function () {
    if (!state.regionMode || !state.dragStart) return;
    var a = screenToLatLng(state.dragStart.x, state.dragStart.y);
    var b = screenToLatLng(state.dragCur.x, state.dragCur.y);
    var dx = Math.abs(state.dragStart.x - state.dragCur.x), dy = Math.abs(state.dragStart.y - state.dragCur.y);
    state.dragStart = null; state.dragCur = null;
    state.regionMode = false;
    canvas.classList.remove("region-mode");
    regionBtn.classList.remove("active");
    regionBtn.textContent = S.regionOff;
    if (dx < 12 * DPR || dy < 12 * DPR || !a || !b) {
      render();
      if (dx > 2 || dy > 2) { showErr(S.regionTooSmall); setTimeout(hideErr, 2200); }
      return;
    }
    state.regionBBox = { minLat: Math.min(a.lat, b.lat), maxLat: Math.max(a.lat, b.lat), minLng: Math.min(a.lng, b.lng), maxLng: Math.max(a.lng, b.lng) };
    applyRange();
    if (window.dataLayer) window.dataLayer.push({ event: "fp_region" });
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
    // 리그 배정 — 기록 기간(년) 기준. 보드 기본 탭에 쓰인다
    var spanY = (refined.stats.to - refined.stats.from) / 31557600000;
    state.myLeague = spanY <= 1.5 ? 1 : spanY <= 3.5 ? 3 : spanY <= 7 ? 5 : 10;
    $("#loader").style.display = "none";
    $("#viewer").style.display = "block";
    var ra = $("#rgA"), rb = $("#rgB");
    if (ra) { ra.value = 0; rb.value = 1000; updateRangeLabel(); }
    state.regionBBox = null; state.regionMode = false;
    renderRegionUI();
    lastGifBlob = null; hideGifResult();
    updateStatsUI();
    renderTraits(computeTraits(state.data));
    renderTrips(refined.trips || []); // renderDNA보다 먼저 — DNA 카드 CTA가 state.trips를 본다
    renderDNA(computeDNA(state.data));
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
    updateRangeFill();
  }
  function updateRangeFill() {
    var fill = $("#rbfill");
    if (!fill) return;
    var a = Number($("#rgA").value), b = Number($("#rgB").value);
    var lo = Math.min(a, b), hi = Math.max(a, b);
    fill.style.left = (lo / 10) + "%";
    fill.style.width = ((hi - lo) / 10) + "%";
  }
  function inRegion(p) {
    var b = state.regionBBox;
    return !b || (p.lat >= b.minLat && p.lat <= b.maxLat && p.lng >= b.minLng && p.lng <= b.maxLng);
  }
  function applyRange() {
    var full = state.fullData;
    if (!full) return;
    var r = rangeTimes();
    var pts = full.points.filter(function (p) { return p.t >= r.tA && p.t <= r.tB && inRegion(p); });
    if (pts.length < 2) { updateRangeLabel(); renderRegionUI(); return; }
    var vis = full.visits.filter(function (v) { return v.t >= r.tA && v.t <= r.tB && inRegion(v); });
    state.data = assemble(pts, vis);
    lastGifBlob = null; hideGifResult();
    updateStatsUI();
    renderTraits(computeTraits(state.data));
    renderDNA(computeDNA(state.data));
    computeOverview();
    state.progress = 0;
    snapCamera();
    render();
    renderRegionUI();
    if (window.dataLayer) window.dataLayer.push({ event: "fp_range" });
  }
  function renderRegionUI() {
    var bar = $("#regionbar"), txt = $("#regiontxt");
    if (!bar || !txt) return;
    if (!state.regionBBox) { bar.style.display = "none"; return; }
    bar.style.display = "flex";
    txt.textContent = S.regionLabel.replace("{n}", state.data ? state.data.points.length.toLocaleString() : "0");
  }
  ["rgA", "rgB"].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", updateRangeLabel);
    el.addEventListener("change", applyRange);
  });

  function showErr(msg) { var e = $("#err"); e.classList.remove("busy"); e.textContent = msg; e.style.display = "block"; }
  function hideErr() { var e = $("#err"); e.classList.remove("busy"); e.style.display = "none"; }
  function showParsing(mb) {
    var e = $("#err"); e.textContent = S.parsing + " (" + mb + "MB)";
    e.classList.add("busy"); e.style.display = "block";
  }

  // ── 파일 파싱 — Web Worker에서 수행(대용량 파일이 메인 스레드를 얼려 "응답 없음"으로
  //    죽는 것 방지). 파서 함수 소스를 그대로 워커에 주입하므로 로직은 한 벌만 유지된다.
  //    결과는 Float64Array(t,lat,lng)로 transfer — 수십만 포인트도 클론 비용 없음.
  var PARSER_FNS = [parsePoint, ts, parseSegments, parseLegacyObjects, parseRecords, parseJson];
  function buildParserWorker() {
    try {
      var src = PARSER_FNS.map(function (f) { return f.toString(); }).join("\n") +
        "\nself.onmessage=function(ev){" +
        "var files=ev.data,out={points:[],visits:[]},okAny=false,sawSettings=false,errName=null;" +
        "for(var i=0;i<files.length;i++){" +
        "try{var r=parseJson(JSON.parse(new FileReaderSync().readAsText(files[i])),out);" +
        "if(r==='settings')sawSettings=true;else if(r)okAny=true;}" +
        "catch(e){errName=(e&&e.name)||'Error';}}" +
        "var n=out.points.length,pb=new Float64Array(n*3),j;" +
        "for(j=0;j<n;j++){pb[j*3]=out.points[j].t;pb[j*3+1]=out.points[j].lat;pb[j*3+2]=out.points[j].lng;}" +
        "var m=out.visits.length,vb=new Float64Array(m*3),k;" +
        "for(k=0;k<m;k++){vb[k*3]=out.visits[k].t;vb[k*3+1]=out.visits[k].lat;vb[k*3+2]=out.visits[k].lng;}" +
        "self.postMessage({okAny:okAny,sawSettings:sawSettings,errName:errName,pts:pb.buffer,vis:vb.buffer},[pb.buffer,vb.buffer]);};";
      return new Worker(URL.createObjectURL(new Blob([src], { type: "text/javascript" })));
    } catch (e) { return null; }
  }
  function reportParseFail(sawSettings, errName) {
    if (sawSettings) showErr(S.errSettings);
    else if (errName === "RangeError" || errName === "QuotaExceededError" || errName === "NS_ERROR_OUT_OF_MEMORY") showErr(S.errMemory);
    else showErr(S.errFormat + (errName ? " [" + errName + "]" : ""));
  }
  function finishParse(res) {
    var out = { points: [], visits: [] };
    var pb = new Float64Array(res.pts), vb = new Float64Array(res.vis);
    for (var j = 0; j < pb.length; j += 3) out.points.push({ t: pb[j], lat: pb[j + 1], lng: pb[j + 2] });
    for (var k = 0; k < vb.length; k += 3) out.visits.push({ t: vb[k], lat: vb[k + 1], lng: vb[k + 2] });
    hideErr();
    if (res.okAny && out.points.length) loadData(refine(out));
    else reportParseFail(res.sawSettings, res.errName);
  }
  function parseSync(list) { // Worker 불가 환경(구형 브라우저·CSP) 폴백 — 종전 동기 경로
    var out = { points: [], visits: [] };
    var pending = list.length, okAny = false, sawSettings = false, errName = null;
    list.forEach(function (f) {
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var r = parseJson(JSON.parse(reader.result), out);
          if (r === "settings") sawSettings = true;
          else if (r) okAny = true;
        } catch (e) { errName = (e && e.name) || "Error"; }
        if (--pending === 0) {
          hideErr();
          if (okAny && out.points.length) loadData(refine(out));
          else reportParseFail(sawSettings, errName);
        }
      };
      reader.readAsText(f);
    });
  }

  function handleFiles(files) {
    hideErr();
    if (!files.length) return;
    var list = [], totalMB = 0, tooBig = null;
    Array.prototype.forEach.call(files, function (f) {
      if (f.size > 300 * 1024 * 1024) { tooBig = f.name; return; }
      list.push(f); totalMB += f.size / 1048576;
    });
    if (tooBig) { showErr(tooBig + S.errTooBig); if (!list.length) return; }
    showParsing(Math.max(1, Math.round(totalMB)));
    var w = buildParserWorker();
    if (w) {
      w.onmessage = function (ev) { w.terminate(); finishParse(ev.data); };
      w.onerror = function () { w.terminate(); parseSync(list); };
      w.postMessage(list);
    } else parseSync(list);
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

  // ── 재미요소: 온디바이스 칭호/이동유형 계산 + opt-in 랭킹 ──
  // 칭호는 항상 브라우저에서만 계산된다. 서버로 보내는 건(opt-in 클릭 시) 칭호 텍스트+티어 숫자 둘뿐 — 좌표/경로는 전송 안 함.
  var BADGES = [
    // 거리 티어(T7/T8)는 다년치 타임라인 기준 — 40,075km(지구 한 바퀴)는 통근만으로도 넘어서 T8이 56%였다(2026-08 리밸런싱)
    { key: "earth", tier: 8, emoji: "🌍", get name() { return S.trBadgeEarth; }, test: function (m) { return m.totalKm >= 300000; } },
    { key: "nomad", tier: 7, emoji: "✈️", get name() { return S.trBadgeNomad; }, test: function (m) { return m.totalKm >= 100000; } },
    { key: "sprint", tier: 6, emoji: "🚀", get name() { return S.trBadgeSprint; }, test: function (m) { return m.maxDayKm >= 500 || m.totalKm >= 30000; } },
    { key: "wanderer", tier: 5, emoji: "📍", get name() { return S.trBadgeWanderer; }, test: function (m) { return m.visits >= 150; } },
    { key: "night", tier: 4, emoji: "🦉", get name() { return S.trBadgeNight; }, test: function (m) { return m.nightRatio >= 0.15; } },
    { key: "homebody", tier: 3, emoji: "🏠", get name() { return S.trBadgeHomebody; }, test: function (m) { return m.homeRatio >= 0.7; } },
    { key: "logger", tier: 2, emoji: "📝", get name() { return S.trBadgeLogger; }, test: function (m) { return m.days >= 300; } },
    { key: "normal", tier: 1, emoji: "🌱", get name() { return S.trBadgeNormal; }, test: function () { return true; } },
  ];

  function computeTraits(data) {
    var pts = data.points, st = data.stats;
    var n = pts.length;
    if (!n) return null;

    var night = 0;
    for (var i = 0; i < n; i++) { if (new Date(pts[i].t).getHours() < 5) night++; }
    var nightRatio = night / n;

    // 집돌이 판정 — 전체 평균 중심점 기준 5km를 못 벗어난 날 비율
    var cLat = 0, cLng = 0;
    for (var j = 0; j < n; j++) { cLat += pts[j].lat; cLng += pts[j].lng; }
    var center = { lat: cLat / n, lng: cLng / n };
    var dayMax = {};
    for (var k = 0; k < n; k++) {
      var day = new Date(pts[k].t).toISOString().slice(0, 10);
      var d = hav(center, pts[k]);
      if (!dayMax[day] || d > dayMax[day]) dayMax[day] = d;
    }
    var dayKeys = Object.keys(dayMax);
    var homeDays = dayKeys.filter(function (d) { return dayMax[d] <= 5; }).length;
    var homeRatio = dayKeys.length ? homeDays / dayKeys.length : 0;

    // 요일별 하루 평균 이동거리(주말형/평일형), 방문 격자 다양성(탐험가/단골러)
    var wkKm = 0, wdKm = 0, wkDays = {}, wdDays = {};
    for (var s = 1; s < n; s++) {
      var seg = hav(pts[s - 1], pts[s]);
      var dow = new Date(pts[s].t).getDay();
      var dkey = new Date(pts[s].t).toISOString().slice(0, 10);
      if (dow === 0 || dow === 6) { wkKm += seg; wkDays[dkey] = 1; } else { wdKm += seg; wdDays[dkey] = 1; }
    }
    var wkAvg = Object.keys(wkDays).length ? wkKm / Object.keys(wkDays).length : 0;
    var wdAvg = Object.keys(wdDays).length ? wdKm / Object.keys(wdDays).length : 0;

    var cellSet = {};
    data.visits.forEach(function (v) { cellSet[Math.round(v.lat / 0.05) + "_" + Math.round(v.lng / 0.05)] = 1; });
    var diversity = data.visits.length ? Object.keys(cellSet).length / data.visits.length : 0;

    var metrics = { totalKm: st.totalKm, days: st.days, visits: st.visits, maxDayKm: st.maxDayKm, nightRatio: nightRatio, homeRatio: homeRatio };
    var earned = BADGES.filter(function (b) { return b.key === "normal" || b.test(metrics); });
    var main = earned.reduce(function (a, b) { return b.tier > a.tier ? b : a; }, earned[0]);

    var avgKmPerDay = st.days ? st.totalKm / st.days : 0;
    var typeName = (wkAvg >= wdAvg ? S.trAxisWeekend : S.trAxisWeekday) + " " +
      (avgKmPerDay >= 15 ? S.trAxisLong : S.trAxisLocal) + " " +
      (diversity >= 0.5 ? S.trAxisExplorer : S.trAxisRegular);
    var typeTag = nightRatio >= 0.12 ? S.trAxisNight : S.trAxisDay;

    return { badges: earned, main: main, typeName: typeName, typeTag: typeTag };
  }

  function escHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function hideRankUI() {
    if (rankPreview) rankPreview.style.display = "none";
    if (rankResult) rankResult.style.display = "none";
    if (rankBoard) rankBoard.style.display = "none";
  }

  function renderTraits(traits) {
    var card = $("#traits");
    if (!card) return;
    if (!traits) { card.style.display = "none"; return; }
    state.traits = traits;
    card.style.display = "block";
    $("#tr-emoji").textContent = traits.main.emoji;
    $("#tr-name").textContent = traits.main.name;
    $("#tr-type").textContent = "🧭 " + traits.typeName + " · " + traits.typeTag;
    var chips = $("#tr-chips");
    chips.innerHTML = "";
    traits.badges.forEach(function (b) {
      var span = document.createElement("span");
      span.className = "tr-chip";
      span.textContent = b.emoji + " " + b.name;
      chips.appendChild(span);
    });
    if (rankBtn) rankBtn.textContent = S.rankBtn;
    if (rankConfirm) rankConfirm.textContent = S.rankConfirm;
    if (rankCancel) rankCancel.textContent = S.rankCancel;
    hideRankUI();
  }

  // ── 여행 DNA — 방문 좌표를 온디바이스 도시 테이블(cities.js)에 근사 매칭 ──
  // Travly 핸드오프: 도시 이름 요약만 URL fragment로 전달(서버 전송 없음). 좌표 원본은 절대 안 나감.
  var CITY_MATCH_KM = 35;
  function computeDNA(data) {
    var cities = window.FP_CITIES;
    if (!cities || !cities.length || !data.points.length) return null;

    // 방문이 적으면 날짜별 첫 포인트로 보강 (Records.json류는 visit이 없을 수 있음)
    var samples = data.visits.slice();
    if (samples.length < 5) {
      var seen = {};
      data.points.forEach(function (p) {
        var day = new Date(p.t).toISOString().slice(0, 10);
        if (!seen[day]) { seen[day] = 1; samples.push(p); }
      });
    }

    var cityDays = {}; // name → {cc, days:{}}
    samples.forEach(function (v) {
      var best = null, bestD = CITY_MATCH_KM;
      for (var i = 0; i < cities.length; i++) {
        // 하버사인 전에 싼 위도차 컷 (35km ≈ 0.32°)
        if (Math.abs(cities[i][1] - v.lat) > 0.35) continue;
        var d = hav({ lat: cities[i][1], lng: cities[i][2] }, v);
        if (d < bestD) { bestD = d; best = cities[i]; }
      }
      if (!best) return;
      var e = cityDays[best[0]] || (cityDays[best[0]] = { cc: best[3], days: {} });
      e.days[new Date(v.t).toISOString().slice(0, 10)] = 1;
    });

    var list = Object.keys(cityDays).map(function (n) {
      return { name: n, cc: cityDays[n].cc, days: Object.keys(cityDays[n].days).length };
    }).sort(function (a, b) { return b.days - a.days; });
    if (!list.length) return null;

    var home = list[0];
    var trips = list.slice(1, 9);
    var countries = {};
    list.forEach(function (c) { if (c.cc !== home.cc) countries[c.cc] = 1; });

    var st = data.stats;
    return {
      v: 1,
      home: [home.name, home.cc],
      trips: trips.map(function (c) { return [c.name, c.cc, c.days]; }),
      km: Math.round(st.totalKm), days: st.days,
      from: st.from ? new Date(st.from).toISOString().slice(0, 7) : null,
      to: st.to ? new Date(st.to).toISOString().slice(0, 7) : null,
      abroad: Object.keys(countries).length,
      style: state.traits ? state.traits.typeName + " · " + state.traits.typeTag : "",
    };
  }

  // ── 여행 목록 UI — 클릭하면 기간 슬라이더를 그 여행 구간으로 맞추고 재생
  function renderTrips(trips) {
    var box = $("#trips");
    if (!box) return;
    state.trips = trips || [];
    if (!state.trips.length) { box.style.display = "none"; return; }
    box.style.display = "block";
    var html = '<div class="tp-head">' + escHtml(S.tripsTitle) + ' <b>' + state.trips.length + '</b><span class="tp-sub">' + escHtml(S.tripsSub) + '</span></div><div class="tp-list">';
    for (var i = state.trips.length - 1; i >= 0; i--) { // 최신 여행부터
      var tr = state.trips[i];
      var names = tr.cities.map(function (c) { return c[0]; });
      var label = names.slice(0, 3).join(" · ") || S.tripsNoCity;
      if (names.length > 3) label += " " + S.tripsEtc.replace("{n}", names.length - 3);
      var meta = tr.open ? S.tripsOngoing : tr.nights + S.tripsNights;
      html += '<button class="tp-item" data-i="' + i + '">' +
        '<span class="tp-date">' + fmtDate(new Date(tr.t0)) + '</span>' +
        '<span class="tp-city">' + (tr.abroad ? "✈️ " : "") + escHtml(label) + '</span>' +
        '<span class="tp-meta">' + escHtml(meta) + ' · ' + tr.km.toLocaleString() + 'km</span>' +
        '<span class="tp-send" data-i="' + i + '" role="button" title="' + escHtml(S.tripsTravly) + '">🧭</span></button>';
    }
    html += '</div><div class="tp-foot"><button class="tp-all" id="tpall">' + escHtml(S.tripsAll) + '</button></div>' +
      '<div class="tp-note">' + escHtml(S.tripsTravlyNote) + '</div>';
    box.innerHTML = html;
    box.querySelectorAll(".tp-item").forEach(function (el) {
      el.addEventListener("click", function () { selectTrip(Number(el.dataset.i), el); });
    });
    // 여행 단위 Travly 등록 — 그 여행 하나만 payload로 전달 (전체 일괄 전송 없음)
    box.querySelectorAll(".tp-send").forEach(function (el) {
      el.addEventListener("click", function (ev) {
        ev.stopPropagation();
        var tr = state.trips[Number(el.dataset.i)];
        if (!tr) return;
        window.open("https://travly.cocy.io/import#fptrips=" + encodeFpTrips([tr]), "_blank", "noopener");
        if (window.dataLayer) window.dataLayer.push({ event: "fp_travly_trips", fp_trip_count: 1 });
      });
    });
    $("#tpall").addEventListener("click", function () {
      $("#rgA").value = 0; $("#rgB").value = 1000;
      updateRangeLabel(); applyRange();
      box.querySelectorAll(".tp-item.on").forEach(function (e2) { e2.classList.remove("on"); });
    });
  }
  // Travly 임포트 payload — 도시 이름·국가코드·날짜만. 좌표는 포함하지 않는다(러프 요약 원칙).
  function isoDate(t) {
    var d = new Date(t), p = function (n) { return (n < 10 ? "0" : "") + n; };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }
  function encodeFpTrips(trips) {
    var payload = {
      v: 1,
      trips: trips.slice(-40).map(function (tr) { // 최근 40개까지 — fragment 크기 상한
        return { s: isoDate(tr.t0), e: isoDate(tr.t1), km: tr.km, ab: tr.abroad ? 1 : 0, c: tr.cities, d: tr.days, p: tr.path || [], poi: tr.poi || [] };
      }),
    };
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function selectTrip(i, el) {
    var full = state.fullData, tr = state.trips[i];
    if (!full || !tr) return;
    var t0 = full.stats.from, span = (full.stats.to - t0) || 1;
    var pad = 3 * 36e5; // 여행 전후 3시간 여유 — 출발·귀가 경로 포함
    $("#rgA").value = Math.max(0, Math.floor((tr.t0 - pad - t0) / span * 1000));
    $("#rgB").value = Math.min(1000, Math.ceil((tr.t1 + pad - t0) / span * 1000));
    state.regionBBox = null; state.regionMode = false;
    updateRangeLabel(); applyRange();
    document.querySelectorAll(".tp-item.on").forEach(function (e2) { e2.classList.remove("on"); });
    if (el) el.classList.add("on");
    $("#map").scrollIntoView({ behavior: "smooth", block: "start" });
    play(true);
    if (window.dataLayer) window.dataLayer.push({ event: "fp_trip", fp_trip_km: tr.km });
  }

  function encodeDNA(dna) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(dna))))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function renderDNA(dna) {
    var box = document.querySelector(".travly");
    if (!box) return;
    if (!dna || (!dna.trips.length && !dna.home)) {
      box.innerHTML = escHtml(S.dnaFallback).replace("Travly", '<a href="https://travly.cocy.io/" target="_blank" rel="noopener">Travly</a>');
      return;
    }
    var chips = '<span class="dna-chip dna-home">🏠 ' + escHtml(S.dnaHome) + ' · ' + escHtml(dna.home[0]) + '</span>';
    dna.trips.forEach(function (t) {
      chips += '<span class="dna-chip">' + escHtml(t[0]) + ' <i>' + t[2] + escHtml(S.dnaDays) + '</i></span>';
    });
    var abroad = dna.abroad ? ' · ' + escHtml(S.dnaAbroadLabel) + ' ' + dna.abroad + escHtml(S.dnaCount) : '';
    box.innerHTML =
      '<div class="dna-head">' + escHtml(S.dnaTitle) +
      '<span class="dna-sub">' + escHtml(S.dnaTripsLabel) + ' ' + dna.trips.length + escHtml(S.dnaCount) + abroad + '</span></div>' +
      '<div class="dna-chips">' + chips + '</div>' +
      // 여행이 감지됐으면 Travly 등록은 여행 카드의 개별 🧭 버튼이 담당 — 여기선 추천 CTA를 걷어낸다
      // (과거 기록에 "추천받기"는 의도 불일치). 여행 감지가 0건일 때만 종전 추천 CTA 유지
      (state.trips && state.trips.length
        ? ''
        : '<a class="dna-btn" href="https://travly.cocy.io/#fp=' + encodeDNA(dna) + '" target="_blank" rel="noopener">' + escHtml(S.dnaBtn) + '</a>') +
      '<div class="dna-note">' + escHtml(S.dnaNote) + '</div>';
    var btn = box.querySelector(".dna-btn");
    if (btn) btn.addEventListener("click", function () {
      if (window.dataLayer) window.dataLayer.push({ event: "fp_travly_dna", fp_trips: dna.trips.length });
    });
  }

  function fpUserId() {
    var k = "fp_uid", v = localStorage.getItem(k);
    if (!v) { v = "fp_" + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem(k, v); }
    return v;
  }

  // 근사치 반올림 — "정확하지 않아도" 원칙: 유효숫자 2자리로 뭉개서 전송·표시
  function approxKm(km) {
    if (km < 100) return Math.round(km);
    var mag = Math.pow(10, Math.floor(Math.log(km) / Math.LN10) - 1);
    return Math.round(km / mag) * mag;
  }
  function fmtApproxKm(km) {
    if (!km) return "";
    // ko/tw는 만 단위 축약(9.8만), en은 kmMan=""라 전체 숫자(98,000)
    var v = (S.kmMan && km >= 10000) ? (Math.round(km / 1000) / 10).toLocaleString() + S.kmMan : km.toLocaleString();
    return S.rankKmFmt.replace("{v}", v);
  }

  function badgeByTier(tier) {
    for (var i = 0; i < BADGES.length; i++) if (BADGES[i].tier === tier) return BADGES[i];
    return null;
  }

  // 기록 기간별 리그(1·3·5·10년) — 1년치 기록과 13년치 기록이 같은 판에서 겨루지 않게 분리.
  // years가 없는 옛 등록 행은 기록일수(days)로 근사 분류
  var LEAGUES = [1, 3, 5, 10];
  function leagueOf(row) {
    var y = Number(row.years) || 0;
    if (!y) {
      var d = Number(row.days) || 0;
      return d <= 370 ? 1 : d <= 1100 ? 3 : d <= 1900 ? 5 : 10;
    }
    return y <= 1.5 ? 1 : y <= 3.5 ? 3 : y <= 7 ? 5 : 10;
  }
  function loadRankBoard(target) {
    var el = target || rankBoard;
    if (!el) return;
    fetch("https://relay.cocy.io/api/rankings/footprints?limit=100").then(function (r) { return r.json(); }).then(function (res) {
      if (!res.success) return;
      var uid = fpUserId();
      var buckets = { 1: [], 3: [], 5: [], 10: [] };
      (res.rankings || []).forEach(function (row) { buckets[leagueOf(row)].push(row); });
      function rowsHtml(lg) {
        var rows = buckets[lg].slice(0, 10).map(function (row, i) {
          var mine = row.user_id === uid;
          var kmTxt = row.km ? '<i class="rb-km">' + escHtml(fmtApproxKm(row.km)) + '</i>' : '';
          // 칭호는 저장된 텍스트가 아니라 티어 번호로 현재 로케일에서 렌더 — 리밸런싱/다국어에도 항상 최신 명칭
          var b = badgeByTier(row.tier);
          var titleTxt = b ? (b.emoji + " " + b.name) : (row.title || "");
          return '<div class="rb-row' + (mine ? ' mine' : '') + '"><span>' + (i + 1) + '.</span><span>' +
            escHtml(row.nickname || S.rankAnon) + '</span><span>' + escHtml(titleTxt) + kmTxt + '</span></div>';
        }).join("");
        return rows || '<div class="rb-empty">' + escHtml(S.rankEmpty) + '</div>';
      }
      // 기본 탭: 내 데이터의 리그 → 없으면 인원 최다 리그
      var def = state.myLeague && buckets[state.myLeague].length ? state.myLeague
        : LEAGUES.reduce(function (a, b) { return buckets[b].length > buckets[a].length ? b : a; }, 1);
      el.innerHTML = '<div class="rb-head">🏆 ' + escHtml(S.rankBoardTitle) + '</div>' +
        '<div class="rb-tabs">' + LEAGUES.map(function (lg) {
          return '<button class="rb-tab' + (lg === def ? ' on' : '') + '" data-lg="' + lg + '">' + lg + escHtml(S.rankLgYear) +
            '<em>' + buckets[lg].length + '</em></button>';
        }).join("") + '</div>' +
        '<div class="rb-body">' + rowsHtml(def) + '</div>';
      el.querySelectorAll(".rb-tab").forEach(function (tb) {
        tb.addEventListener("click", function () {
          el.querySelectorAll(".rb-tab").forEach(function (x) { x.classList.toggle("on", x === tb); });
          el.querySelector(".rb-body").innerHTML = rowsHtml(Number(tb.dataset.lg));
        });
      });
      el.style.display = "block";
    }).catch(function () {});
  }
  function myYears() {
    var st = state.fullData && state.fullData.stats;
    if (!st || !st.from || !st.to) return 0;
    return Math.max(0.1, Math.round(((st.to - st.from) / 31557600000) * 10) / 10);
  }

  var rankBtn = $("#rankbtn"), rankPreview = $("#rankpreview"), rankPayload = $("#rankpayload"),
    rankConfirm = $("#rankconfirm"), rankCancel = $("#rankcancel"), rankResult = $("#rankresult"), rankBoard = $("#rankboard");

  // 파일 올리기 전에도 랜딩에서 명예의 전당을 볼 수 있게 즉시 로드
  loadRankBoard($("#rankboard-landing"));

  if (rankBtn) rankBtn.addEventListener("click", function () {
    if (!state.traits) return;
    var t = state.traits.main;
    var aKm = approxKm(state.data.stats.totalKm);
    var aDays = Math.max(10, Math.round(state.data.stats.days / 10) * 10);
    rankPayload.textContent = S.rankPayload.replace("{title}", t.name).replace("{tier}", t.tier)
      .replace("{km}", fmtApproxKm(aKm) || "0km").replace("{days}", aDays);
    var nickEl = document.getElementById("ranknick");
    if (nickEl) { nickEl.placeholder = S.rankNickPh; nickEl.value = localStorage.getItem("fp_nick") || ""; }
    rankPreview.style.display = "block";
    rankResult.style.display = "none";
    if (window.dataLayer) window.dataLayer.push({ event: "fp_rank_preview" });
  });
  if (rankCancel) rankCancel.addEventListener("click", function () { rankPreview.style.display = "none"; });
  if (rankConfirm) rankConfirm.addEventListener("click", function () {
    if (!state.traits) return;
    var t = state.traits.main;
    var nickEl = document.getElementById("ranknick");
    var nick = nickEl ? nickEl.value.trim().slice(0, 16) : "";
    if (nick) localStorage.setItem("fp_nick", nick); else localStorage.removeItem("fp_nick");
    rankConfirm.disabled = true;
    fetch("https://relay.cocy.io/api/rankings/footprints", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: fpUserId(), tier: t.tier, title: t.name,
        nickname: nick || undefined,
        km: approxKm(state.data.stats.totalKm),
        days: Math.max(10, Math.round(state.data.stats.days / 10) * 10),
        years: myYears(), // 기록 기간(년) — 리그 분류용
      }),
    }).then(function (r) { return r.json(); }).then(function (res) {
      rankConfirm.disabled = false;
      rankPreview.style.display = "none";
      rankResult.style.display = "block";
      if (res.success) {
        var bestB = badgeByTier(res.bestTier);
        rankResult.textContent = (res.updated ? S.rankOk : S.rankKept).replace("{title}", bestB ? bestB.name : res.bestTitle);
        loadRankBoard();
        loadRankBoard($("#rankboard-landing"));
        if (window.dataLayer) window.dataLayer.push({ event: "fp_rank_submit", fp_tier: t.tier });
      } else {
        rankResult.textContent = S.rankErr;
      }
    }).catch(function () {
      rankConfirm.disabled = false;
      rankPreview.style.display = "none";
      rankResult.style.display = "block";
      rankResult.textContent = S.rankErr;
    });
  });
})();