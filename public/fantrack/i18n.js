/* FanTrack i18n — ko / en / tw
 * 원칙: 한 화면에는 한 언어만. 로케일별 값이 없으면 원문(한국어)으로 폴백하되, 언어를 섞어서 병기하지 않는다.
 * 번체는 대만 통용 표기만 사용(중국 대륙 표기·리메이크 제목 금지).
 */
(function (global) {
  const SUPPORTED = ['ko', 'en', 'tw'];

  const STR = {
    ko: {
      loading: '불러오는 중...',
      notFound: '프로필을 찾을 수 없어요.',
      emptyCategory: '이 분류엔 출연정보가 없어요.',
      gateTitle: '로그인하면 관심있어요를 누를 수 있어요',
      close: '닫기',
      myPhoto: '내 최애 사진 설정 (이 기기에만 저장)',
      sortPopular: '🔥 지금 인기순',
      sortRecent: '🗓 최신순',
      toYear: '⇄ 연도순으로',
      toPopular: '⇄ 인기순으로',
      upcoming: '공개예정',
      krOnly: '🇰🇷 한국만',
      searchSuffix: '(검색)',
      youtube: '유튜브',
      yearSuffix: '년',
      langLabel: '언어',
      types: { all: '전체', broadcast: '방송', radio: '라디오', youtube: '유튜브', ott: 'OTT', film: '영화', cf: '광고', album: '음반', concert: '콘서트' },
      indexTitle: 'FanTrack',
      indexTagline: '최애 출연정보, 한곳에서',
      indexDesc: '방송·라디오·유튜브·OTT·음반·콘서트까지 아티스트별로 모아봅니다.',
      searchPh: '이름으로 검색',
      groupAll: '전체',
      noResult: '검색 결과가 없어요.',
      countSuffix: '명',
      actionTitle: '이 콘텐츠',
      goLink: '링크로 가기',
      addLog: '로그에 시청 기록 추가',
      addLogHint: 'log.cocy.io에 오늘 시청으로 기록돼요',
      addLogDone: '기록했어요 ✓',
      addLogFail: '기록 실패. 잠시 후 다시 시도해주세요.',
      addLogLogin: '로그인하면 시청 기록을 남길 수 있어요',
      openLog: '로그에서 보기',
      noLink: '등록된 링크가 없어요',
      home: '← 전체 아티스트',
      watched: '봤어요',
      markWatched: '봤음으로 표시',
      unmarkWatched: '안 봤음으로 되돌리기',
      hideWatched: '본 것 숨기기',
      showWatched: '본 것 보기',
      watchedLocal: '이 표시는 이 기기에만 저장돼요',
      planTrip: '✈️ 이 공연으로 여행 계획 짜기',
      planTripHint: '공연 앞뒤로 2박 3일, Travly에서 일정 만들기',
      planTripNoDate: '날짜 정보가 없어서 여행 계획을 만들 수 없어요',
    },
    en: {
      loading: 'Loading...',
      notFound: 'Profile not found.',
      emptyCategory: 'No appearances in this category.',
      gateTitle: 'Sign in to mark what you like',
      close: 'Close',
      myPhoto: 'Set my photo (stored on this device only)',
      sortPopular: '🔥 Most liked',
      sortRecent: '🗓 Newest',
      toYear: '⇄ Sort by year',
      toPopular: '⇄ Sort by likes',
      upcoming: 'Upcoming',
      krOnly: '🇰🇷 Korea only',
      searchSuffix: '(search)',
      youtube: 'YouTube',
      yearSuffix: '',
      langLabel: 'Language',
      types: { all: 'All', broadcast: 'TV', radio: 'Radio', youtube: 'YouTube', ott: 'OTT', film: 'Film', cf: 'Ad', album: 'Album', concert: 'Concert' },
      indexTitle: 'FanTrack',
      indexTagline: 'Every appearance, one place',
      indexDesc: 'TV, radio, YouTube, OTT, albums and concerts — collected per artist.',
      searchPh: 'Search by name',
      groupAll: 'All',
      noResult: 'No matches.',
      countSuffix: '',
      actionTitle: 'This title',
      goLink: 'Open link',
      addLog: 'Add to my watch log',
      addLogHint: 'Saved to log.cocy.io as watched today',
      addLogDone: 'Saved ✓',
      addLogFail: 'Could not save. Please try again.',
      addLogLogin: 'Sign in to keep a watch log',
      openLog: 'View in log',
      noLink: 'No link available',
      home: '← All artists',
      watched: 'Watched',
      markWatched: 'Mark as watched',
      unmarkWatched: 'Unmark as watched',
      hideWatched: 'Hide watched',
      showWatched: 'Show watched',
      watchedLocal: 'This mark is stored on this device only',
      planTrip: '✈️ Plan a trip around this show',
      planTripHint: '2 nights / 3 days around the show, in Travly',
      planTripNoDate: 'No date on file, so a trip cannot be drafted',
    },
    tw: {
      loading: '載入中...',
      notFound: '找不到這個檔案。',
      emptyCategory: '這個分類還沒有出演資訊。',
      gateTitle: '登入後就能按「有興趣」',
      close: '關閉',
      myPhoto: '設定我的本命照片（只存在這台裝置）',
      sortPopular: '🔥 人氣排序',
      sortRecent: '🗓 最新排序',
      toYear: '⇄ 依年份排序',
      toPopular: '⇄ 依人氣排序',
      upcoming: '即將公開',
      krOnly: '🇰🇷 僅限韓國',
      searchSuffix: '(搜尋)',
      youtube: 'YouTube',
      yearSuffix: '年',
      langLabel: '語言',
      types: { all: '全部', broadcast: '電視', radio: '廣播', youtube: 'YouTube', ott: 'OTT', film: '電影', cf: '廣告', album: '專輯', concert: '演唱會' },
      indexTitle: 'FanTrack',
      indexTagline: '本命的出演資訊，一次看完',
      indexDesc: '電視、廣播、YouTube、OTT、專輯、演唱會，依藝人整理。',
      searchPh: '以姓名搜尋',
      groupAll: '全部',
      noResult: '沒有符合的結果。',
      countSuffix: '位',
      actionTitle: '這個節目',
      goLink: '前往連結',
      addLog: '加入我的觀看紀錄',
      addLogHint: '會記錄到 log.cocy.io（今天觀看）',
      addLogDone: '已記錄 ✓',
      addLogFail: '記錄失敗，請稍後再試。',
      addLogLogin: '登入後就能留下觀看紀錄',
      openLog: '在 log 查看',
      noLink: '沒有可用的連結',
      home: '← 全部藝人',
      watched: '看過了',
      markWatched: '標記為看過',
      unmarkWatched: '取消看過標記',
      hideWatched: '隱藏看過的',
      showWatched: '顯示看過的',
      watchedLocal: '這個標記只存在這台裝置',
      planTrip: '✈️ 為這場演出安排行程',
      planTripHint: '演出前後 3天2夜，在 Travly 建立行程',
      planTripNoDate: '沒有日期資料，無法安排行程',
    },
  };

  function detect() {
    const q = new URLSearchParams(location.search).get('lang');
    if (q && SUPPORTED.includes(q)) { try { localStorage.setItem('fantrack_lang', q); } catch (e) {} return q; }
    let saved = null;
    try { saved = localStorage.getItem('fantrack_lang'); } catch (e) {}
    if (saved && SUPPORTED.includes(saved)) return saved;
    const n = (navigator.language || 'ko').toLowerCase();
    if (n.startsWith('ko')) return 'ko';
    if (n === 'zh-tw' || n === 'zh-hk' || n === 'zh-mo' || n.startsWith('zh-hant')) return 'tw';
    if (n.startsWith('zh')) return 'tw';
    return 'en';
  }

  const LANG = detect();
  const T = STR[LANG];

  // 로케일 값 우선순위. 없으면 한국어 원문으로 폴백(병기하지 않음).
  function pick(row, base) {
    if (!row) return '';
    if (LANG === 'en') return row[base + '_localized_en'] || row[base + '_en'] || row[base] || '';
    // tw에 번체값이 없으면 한국어보다 영문 폴백이 낫다(중국어권 독자 기준)
    if (LANG === 'tw') return row[base + '_localized_tw'] || row[base + '_tw'] || row[base + '_localized_en'] || row[base + '_en'] || row[base] || '';
    return row[base] || '';
  }

  function celebName(c) {
    if (!c) return '';
    if (LANG === 'en') return c.name_en || c.name_ko || '';
    if (LANG === 'tw') return c.name_tw || c.name_ko || '';
    return c.name_ko || '';
  }

  function htmlLang() { return LANG === 'tw' ? 'zh-Hant' : LANG; }

  function switcherHtml() {
    return SUPPORTED.map(function (l) {
      const label = l === 'ko' ? '한국어' : l === 'en' ? 'English' : '繁體';
      return '<button class="lang-btn' + (l === LANG ? ' on' : '') + '" data-lang="' + l + '">' + label + '</button>';
    }).join('');
  }

  function bindSwitcher(el) {
    if (!el) return;
    el.innerHTML = switcherHtml();
    el.querySelectorAll('.lang-btn').forEach(function (b) {
      b.onclick = function () {
        try { localStorage.setItem('fantrack_lang', b.dataset.lang); } catch (e) {}
        const u = new URL(location.href);
        u.searchParams.set('lang', b.dataset.lang);
        location.href = u.toString();
      };
    });
  }

  // 시청 표시 — 서버에 안 보내고 이 기기 localStorage에만 남긴다.
  const WKEY = 'fantrack_watched';
  function readWatched() {
    try { const v = JSON.parse(localStorage.getItem(WKEY) || '{}'); return (v && typeof v === 'object') ? v : {}; }
    catch (e) { return {}; }
  }
  function isWatched(id) { return !!readWatched()[id]; }
  function setWatched(id, on) {
    const w = readWatched();
    if (on) w[id] = Date.now(); else delete w[id];
    try { localStorage.setItem(WKEY, JSON.stringify(w)); } catch (e) {}
    return !!w[id];
  }
  function watchedCount() { return Object.keys(readWatched()).length; }

  // 콘서트 → Travly 여행계획 딥링크. 공연일 앞뒤 하루씩 = 2박3일.
  // 장소 데이터가 없으면 region은 비워두고 AI 탭에 질문만 실어 보낸다(억지로 지역을 지어내지 않는다).
  const TRAVLY = 'https://travly.cocy.io/plan/new';
  function shiftDate(ymd, days) {
    const d = new Date(ymd + 'T00:00:00Z');
    if (isNaN(d.getTime())) return null;
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  }
  function tripUrl(c, artistName) {
    const date = (c.air_date && /^\d{4}-\d{2}-\d{2}$/.test(c.air_date)) ? c.air_date : null;
    if (!date) return null;
    // 지난 공연으로 여행 계획을 권하는 건 무의미하다. 오늘 이후만.
    if (date < new Date().toISOString().slice(0, 10)) return null;
    const start = shiftDate(date, -1), end = shiftDate(date, 1);
    const place = [c.city, c.country].filter(Boolean).join(', ');
    const title = artistName ? (artistName + ' ' + (c.title || '')).trim() : (c.title || '');
    const p = new URLSearchParams();
    p.set('tab', place ? 'manual' : 'ai');
    p.set('title', title);
    if (place) p.set('region', place);
    p.set('start', start);
    p.set('end', end);
    if (!place) {
      p.set('q', title + ' (' + date + ') 공연을 보러 가려고 해. 공연 전날 도착해서 다음날 떠나는 2박 3일 일정을 짜줘.');
    }
    p.set('utm_source', 'fantrack');
    return TRAVLY + '?' + p.toString();
  }

  global.FT_I18N = { LANG: LANG, T: T, pick: pick, celebName: celebName, htmlLang: htmlLang, bindSwitcher: bindSwitcher, SUPPORTED: SUPPORTED,
    isWatched: isWatched, setWatched: setWatched, watchedCount: watchedCount,
    tripUrl: tripUrl };
})(window);
