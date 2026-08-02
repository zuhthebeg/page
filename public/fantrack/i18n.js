/* FanTrack i18n — ko / en / tw
 * 원칙: 한 화면에는 한 언어만. 로케일별 값이 없으면 원문(한국어)으로 폴백하되, 언어를 섞어서 병기하지 않는다.
 * 번체는 대만 통용 표기만 사용(중국 대륙 표기·리메이크 제목 금지).
 */
(function (global) {
  const SUPPORTED = ['ko', 'en', 'tw', 'es'];

  const STR = {
    ko: {
      loading: '불러오는 중...',
      notFound: '프로필을 찾을 수 없어요.',
      emptyCategory: '이 분류엔 출연정보가 없어요.',
      gateTitle: '로그인하면 관심있어요를 누를 수 있어요',
      close: '닫기',
      myPhoto: '내 최애 사진 설정 (이 기기에만 저장)',
      myBg: '배경 사진 바꾸기', myBgClear: '배경 지우기',
      vmCta: '🎤 내 목소리와 닮은 가수 찾기', vmHint: '10초만 부르면 AI가 찾아줍니다',
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
      addLog: '📝 log에 시청기록 남기기',
      seenNote: '이 표시는 이 기기에만 남아요. 계정에 남기려면 아래에서 log에 추가하세요.',
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
      planTripPast: '📖 이 공연 추억 기록하기',
      planTripHint: '공연 앞뒤 2박 3일 일정으로 Travly에서 만들기',
      planTripHintPast: '다녀온 2박 3일을 Travly에 기록으로 남기기',
      planTripNoDate: '날짜 정보가 없어서 여행 계획을 만들 수 없어요',
      debut: '데뷔',
      fandomLabel: '팬덤',
    },
    en: {
      loading: 'Loading...',
      notFound: 'Profile not found.',
      emptyCategory: 'No appearances in this category.',
      gateTitle: 'Sign in to mark what you like',
      close: 'Close',
      myPhoto: 'Set my photo (stored on this device only)',
      myBg: 'Change background', myBgClear: 'Remove background',
      vmCta: '🎤 Find your K-pop voice twin', vmHint: 'Sing 10 seconds and AI finds it',
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
      addLog: '📝 Save to my log',
      seenNote: 'This mark stays on this device only. To keep it on your account, save it to log below.',
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
      planTripPast: '📖 Save this show as a trip memory',
      planTripHint: 'Draft a 2-night / 3-day trip in Travly',
      planTripHintPast: 'Record the 2 nights / 3 days you spent there',
      planTripNoDate: 'No date on file, so a trip cannot be drafted',
      debut: 'Debut',
      fandomLabel: 'Fandom',
    },
    tw: {
      loading: '載入中...',
      notFound: '找不到這個檔案。',
      emptyCategory: '這個分類還沒有出演資訊。',
      gateTitle: '登入後就能按「有興趣」',
      close: '關閉',
      myPhoto: '設定我的本命照片（只存在這台裝置）',
      myBg: '更換背景照片', myBgClear: '移除背景',
      vmCta: '🎤 找出和你聲音最像的歌手', vmHint: '唱10秒，AI 幫你找出來',
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
      addLog: '📝 記錄到 log',
      seenNote: '這個標記只存在這台裝置。想留在帳號裡，請用下方的 log 記錄。',
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
      planTripPast: '📖 把這場演出寫成旅行回憶',
      planTripHint: '在 Travly 建立演出前後 3天2夜的行程',
      planTripHintPast: '把去過的 3天2夜記錄到 Travly',
      planTripNoDate: '沒有日期資料，無法安排行程',
      debut: '出道',
      fandomLabel: '粉絲名',
    },
    es: {
      loading: 'Cargando...',
      notFound: 'No se encontró este perfil.',
      emptyCategory: 'Todavía no hay contenido en esta categoría.',
      gateTitle: 'Inicia sesión para marcar "me interesa"',
      close: 'Cerrar',
      myPhoto: 'Poner mi foto (solo se guarda en este dispositivo)',
      myBg: 'Cambiar el fondo', myBgClear: 'Quitar el fondo',
      vmCta: '🎤 Encuentra tu gemelo vocal', vmHint: 'Canta 10 segundos y la IA lo busca',
      sortPopular: '🔥 Por popularidad',
      sortRecent: '🗓 Más reciente',
      toYear: '⇄ Ordenar por año',
      toPopular: '⇄ Ordenar por popularidad',
      upcoming: 'Próximamente',
      krOnly: '🇰🇷 Solo en Corea',
      searchSuffix: '(buscar)',
      youtube: 'YouTube',
      yearSuffix: '',
      langLabel: 'Idioma',
      types: { all: 'Todo', broadcast: 'TV', radio: 'Radio', youtube: 'YouTube', ott: 'OTT', film: 'Cine', cf: 'Anuncio', album: 'Álbum', concert: 'Concierto' },
      indexTitle: 'FanTrack',
      indexTagline: 'Todo lo que hace tu artista, en un solo lugar',
      indexDesc: 'TV, radio, YouTube, OTT, álbumes y conciertos, ordenados por artista.',
      searchPh: 'Buscar por nombre',
      groupAll: 'Todos',
      noResult: 'Sin resultados.',
      countSuffix: '',
      actionTitle: 'Este contenido',
      goLink: 'Abrir enlace',
      addLog: '📝 Guardar en mi log',
      seenNote: 'Esta marca solo se guarda en este dispositivo. Para conservarla en tu cuenta, guárdala en log abajo.',
      addLogHint: 'Se guarda en log.cocy.io (visto hoy)',
      addLogDone: 'Guardado ✓',
      addLogFail: 'No se pudo guardar. Inténtalo de nuevo.',
      addLogLogin: 'Inicia sesión para guardar tu historial',
      openLog: 'Ver en log',
      noLink: 'No hay enlace disponible',
      home: '← Todos los artistas',
      watched: 'Visto',
      markWatched: 'Marcar como visto',
      unmarkWatched: 'Quitar marca de visto',
      hideWatched: 'Ocultar los vistos',
      showWatched: 'Mostrar los vistos',
      watchedLocal: 'Esta marca solo se guarda en este dispositivo',
      planTrip: '✈️ Planear un viaje para este concierto',
      planTripPast: '📖 Guardar este concierto como recuerdo de viaje',
      planTripHint: 'Crea un viaje de 3 días / 2 noches en Travly',
      planTripHintPast: 'Guarda esos 3 días / 2 noches en Travly',
      planTripNoDate: 'Sin fecha registrada, no se puede planear el viaje',
      debut: 'Debut',
      fandomLabel: 'Fandom',
    },
  };

  function detect() {
    // 정적 생성된 언어 경로(/fantrack/c/{slug}/{lang}/)를 최우선으로 본다.
    // 크롤러가 ?lang= 쿼리를 별도 페이지로 취급하지 않기 때문에 경로형이 정본이다.
    const p = location.pathname.match(/\/fantrack\/c\/[^/]+\/([a-z]{2})\/?$/);
    if (p && SUPPORTED.includes(p[1])) return p[1];
    const q = new URLSearchParams(location.search).get('lang');
    if (q && SUPPORTED.includes(q)) { try { localStorage.setItem('fantrack_lang', q); } catch (e) {} return q; }
    let saved = null;
    try { saved = localStorage.getItem('fantrack_lang'); } catch (e) {}
    if (saved && SUPPORTED.includes(saved)) return saved;
    const n = (navigator.language || 'ko').toLowerCase();
    if (n.startsWith('ko')) return 'ko';
    if (n === 'zh-tw' || n === 'zh-hk' || n === 'zh-mo' || n.startsWith('zh-hant')) return 'tw';
    if (n.startsWith('zh')) return 'tw';
    if (n.startsWith('es')) return 'es';
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
    // 스페인어는 전용 표기가 없다 — 영문(로마자)이 한국어 원문보다 훨씬 낫다
    if (LANG === 'es') return row[base + '_localized_en'] || row[base + '_en'] || row[base] || '';
    return row[base] || '';
  }

  function celebName(c) {
    if (!c) return '';
    if (LANG === 'en') return c.name_en || c.name_ko || '';
    // 번체 표기가 없으면 한글이 아니라 로마자로 간다(중화권 독자는 로마자 예명을 쓴다)
    if (LANG === 'tw') return c.name_tw || c.name_en || c.name_ko || '';
    if (LANG === 'es') return c.name_en || c.name_ko || '';
    return c.name_ko || '';
  }

  function htmlLang() { return LANG === 'tw' ? 'zh-Hant' : LANG; }

  function switcherHtml() {
    return SUPPORTED.map(function (l) {
      const label = l === 'ko' ? '한국어' : l === 'en' ? 'English' : l === 'tw' ? '繁體' : 'Español';
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

  // 콘서트 → Travly 여행계획 딥링크.
  // 정확도(공연장 위치·주변 맛집·아티스트 연고지)는 Travly에 위임한다.
  // 여기서는 날짜/공연/아티스트/출발지 같은 "맥락"만 넘기고, 우리가 장소를 지어내지 않는다.
  const TRAVLY = 'https://travly.cocy.io/plan/new';

  function shiftDate(ymd, days) {
    const d = new Date(ymd + 'T00:00:00Z');
    if (isNaN(d.getTime())) return null;
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  }

  // 출발지 추정: 브라우저 언어의 지역 서브태그(zh-TW → 대만). 없으면 언어 기본값.
  function originCountry() {
    const tags = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || ''];
    const FALLBACK = { ko: 'KR', ja: 'JP', zh: 'TW', en: 'US' };
    let region = null;
    for (const t of tags) {
      const m = /^[A-Za-z]{2,3}(?:-[A-Za-z]{4})?-([A-Za-z]{2})\b/.exec(t || '');
      if (m) { region = m[1].toUpperCase(); break; }
    }
    if (!region) {
      for (const t of tags) {
        const base = (t || '').slice(0, 2).toLowerCase();
        if (FALLBACK[base]) { region = FALLBACK[base]; break; }
      }
    }
    if (!region) return null;
    try {
      const dn = new Intl.DisplayNames([LANG === 'tw' ? 'zh-Hant' : LANG], { type: 'region' });
      return dn.of(region) || region;
    } catch (e) { return region; }
  }

  function tripPrompt(c, artistName, date, past) {
    const place = [c.venue, c.city, c.country].filter(Boolean).join(', ');
    const from = originCountry();
    const show = [artistName, pick(c, 'title')].filter(Boolean).join(' ');

    if (LANG === 'en') {
      return past ? [
        `I went to a concert: ${show}, on ${date}.`,
        place ? `Venue: ${place}.` : `Please look up where this concert was held and use that city.`,
        from ? `I travelled from ${from}.` : '',
        `It was 2 nights / 3 days — I arrived the day before the show and left the day after.`,
        `Write it up as a trip I already took: how I got to the venue, food spots near the venue,`,
        `and places connected to the artist or its members that I could have visited.`,
      ].filter(Boolean).join(' ') : [
        `I'm going to a concert: ${show}, on ${date}.`,
        place ? `Venue: ${place}.` : `Please look up where this concert is held and use that city.`,
        from ? `I'm travelling from ${from}.` : '',
        `Plan 2 nights / 3 days: arrive the day before the show, leave the day after.`,
        `Include getting to the venue, food spots near the venue,`,
        `and places connected to the artist or its members.`,
      ].filter(Boolean).join(' ');
    }
    if (LANG === 'tw') {
      return past ? [
        `我去看了這場演唱會：${show}，${date}。`,
        place ? `場館：${place}。` : `請查這場演出當時在哪裡舉行，並以該城市為主。`,
        from ? `我從${from}出發。` : '',
        `是 3天2夜：演出前一天抵達，隔天離開。`,
        `請整理成我已經走過的行程：怎麼去場館、場館附近吃了什麼，`,
        `以及和這位藝人或成員有關、可能去過的地點。`,
      ].filter(Boolean).join(' ') : [
        `我要去看這場演唱會：${show}，${date}。`,
        place ? `場館：${place}。` : `請查這場演出在哪裡舉行，並以該城市為主。`,
        from ? `我從${from}出發。` : '',
        `請安排 3天2夜：演出前一天抵達，隔天離開。`,
        `請包含前往場館的方式、場館附近的美食，`,
        `以及和這位藝人或成員有關的地點。`,
      ].filter(Boolean).join(' ');
    }
    return past ? [
      `${date}에 ${show} 공연을 보러 다녀왔어.`,
      place ? `공연장: ${place}.` : `이 공연이 어디에서 열렸는지 찾아서 그 도시 기준으로 정리해줘.`,
      from ? `${from}에서 출발했어.` : '',
      `공연 전날 도착해서 다음날 떠나는 2박 3일이었어.`,
      `다녀온 일정으로 정리해줘 — 공연장 가는 길, 공연장 근처에서 들렀을 만한 맛집,`,
      `그리고 이 아티스트나 멤버들과 연관된 장소까지 넣어서.`,
    ].filter(Boolean).join(' ') : [
      `${date}에 ${show} 공연을 보러 가려고 해.`,
      place ? `공연장: ${place}.` : `이 공연이 어디에서 열리는지 찾아서 그 도시 기준으로 잡아줘.`,
      from ? `${from}에서 출발해.` : '',
      `공연 전날 도착해서 다음날 떠나는 2박 3일로 짜줘.`,
      `공연장 가는 법, 공연장 근처 맛집,`,
      `그리고 이 아티스트나 멤버들과 연관된 장소도 넣어줘.`,
    ].filter(Boolean).join(' ');
  }

  function isPastShow(c) {
    const date = (c && c.air_date && /^\d{4}-\d{2}-\d{2}$/.test(c.air_date)) ? c.air_date : null;
    return !!date && date < new Date().toISOString().slice(0, 10);
  }

  function tripUrl(c, artistName) {
    const date = (c.air_date && /^\d{4}-\d{2}-\d{2}$/.test(c.air_date)) ? c.air_date : null;
    if (!date) return null;
    const past = isPastShow(c);
    const p = new URLSearchParams();
    // 여행 비서(ai)가 아니라 '텍스트로 일정 만들기' 탭으로 보낸다.
    p.set('tab', 'text');
    p.set('title', [artistName, pick(c, 'title')].filter(Boolean).join(' '));
    p.set('start', shiftDate(date, -1));
    p.set('end', shiftDate(date, 1));
    const place = [c.city, c.country].filter(Boolean).join(', ');
    if (place) p.set('region', place);
    p.set('text', tripPrompt(c, artistName, date, past));
    p.set('utm_source', 'fantrack');
    return TRAVLY + '?' + p.toString();
  }

  global.FT_I18N = { LANG: LANG, T: T, pick: pick, celebName: celebName, htmlLang: htmlLang, bindSwitcher: bindSwitcher, SUPPORTED: SUPPORTED,
    isWatched: isWatched, setWatched: setWatched, watchedCount: watchedCount,
    tripUrl: tripUrl, isPastShow: isPastShow };
})(window);
