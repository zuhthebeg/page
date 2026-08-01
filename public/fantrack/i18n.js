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
    if (LANG === 'tw') return row[base + '_localized_tw'] || row[base + '_tw'] || row[base] || '';
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

  global.FT_I18N = { LANG: LANG, T: T, pick: pick, celebName: celebName, htmlLang: htmlLang, bindSwitcher: bindSwitcher, SUPPORTED: SUPPORTED };
})(window);
