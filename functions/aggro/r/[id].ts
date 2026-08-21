/// <reference types="@cloudflare/workers-types" />
// GET /aggro/r/:id — 어그로미터 판정 결과 공유 페이지 (KV aggro:r:{id}, 60일 보존)
// OG 카드는 레벨×언어별 정적 PNG(/aggro/og/{level}-{ui}.png), 점수는 og:title에 실어 크롤러에 노출.

interface Env {
  page_cache: KVNamespace;
}

type Ui = "ko" | "en" | "tw";

const VERDICTS: Record<Ui, Record<string, { stamp: string; sub: string }>> = {
  ko: {
    clean: { stamp: "✅ 청정 인증", sub: "안심하고 읽어도 되는 글" },
    low: { stamp: "🌶️ 약간 매콤", sub: "간은 세지만 먹을 만함" },
    mid: { stamp: "⚠️ 어그로 주의", sub: "반응하기 전에 한 번 더 생각" },
    high: { stamp: "🚫 어그로 확정 — 먹이 금지", sub: "답글이 곧 먹이입니다. 주지 마세요" },
    extreme: { stamp: "☣️ 선동 등급 — 절대 먹이 금지", sub: "분노 유발이 목적인 글. 무시가 최선의 반격" },
  },
  en: {
    clean: { stamp: "✅ Certified Clean", sub: "Safe to read and engage" },
    low: { stamp: "🌶️ Mildly Spicy", sub: "Strong seasoning, still edible" },
    mid: { stamp: "⚠️ Ragebait Warning", sub: "Think twice before reacting" },
    high: { stamp: "🚫 Confirmed Ragebait — DO NOT FEED", sub: "Your reply is the food. Don't serve it" },
    extreme: { stamp: "☣️ Weapons-Grade — DO NOT FEED", sub: "Built to enrage. Silence is the counterattack" },
  },
  tw: {
    clean: { stamp: "✅ 乾淨認證", sub: "可以安心閱讀的內容" },
    low: { stamp: "🌶️ 微辣", sub: "口味偏重，但還能吃" },
    mid: { stamp: "⚠️ 帶風向注意", sub: "回應之前先多想一秒" },
    high: { stamp: "🚫 確定帶風向 — 禁止餵食", sub: "你的回覆就是飼料，別餵" },
    extreme: { stamp: "☣️ 認知作戰等級 — 絕對禁止餵食", sub: "以激怒為目的的內容，無視就是反擊" },
  },
};

const TECH_NAMES: Record<Ui, Record<string, { name: string; icon: string }>> = {
  ko: {
    us_vs_them: { name: "편가르기", icon: "⚔️" }, moral_outrage: { name: "극단적 도덕 규탄", icon: "🔥" },
    emotion_amp: { name: "감정 증폭", icon: "📢" }, dehumanization: { name: "비인간화·멸칭", icon: "🚷" },
    urgency_fear: { name: "위기·공포 조장", icon: "⏰" }, false_dichotomy: { name: "허위 이분법", icon: "↔️" },
    unfounded_claim: { name: "무근거 단정", icon: "❗" }, conspiracy: { name: "음모론 프레임", icon: "🕳️" },
    generalization: { name: "집단 싸잡기", icon: "🧺" }, blind_praise: { name: "맹목적 찬양", icon: "🙇" },
    ragebait_hook: { name: "어그로 낚시", icon: "🎣" }, distortion: { name: "인용 왜곡·맥락 제거", icon: "✂️" },
  },
  en: {
    us_vs_them: { name: "Us-vs-them framing", icon: "⚔️" }, moral_outrage: { name: "Extreme moral condemnation", icon: "🔥" },
    emotion_amp: { name: "Emotional amplification", icon: "📢" }, dehumanization: { name: "Dehumanization", icon: "🚷" },
    urgency_fear: { name: "Manufactured urgency & fear", icon: "⏰" }, false_dichotomy: { name: "False dichotomy", icon: "↔️" },
    unfounded_claim: { name: "Unfounded assertion", icon: "❗" }, conspiracy: { name: "Conspiracy framing", icon: "🕳️" },
    generalization: { name: "Sweeping generalization", icon: "🧺" }, blind_praise: { name: "Blind glorification", icon: "🙇" },
    ragebait_hook: { name: "Ragebait hook", icon: "🎣" }, distortion: { name: "Quote distortion", icon: "✂️" },
  },
  tw: {
    us_vs_them: { name: "對立操作（我們 vs 他們）", icon: "⚔️" }, moral_outrage: { name: "極端道德譴責", icon: "🔥" },
    emotion_amp: { name: "情緒放大", icon: "📢" }, dehumanization: { name: "去人性化・蔑稱", icon: "🚷" },
    urgency_fear: { name: "製造危機與恐懼", icon: "⏰" }, false_dichotomy: { name: "假二選一", icon: "↔️" },
    unfounded_claim: { name: "無根據斷言", icon: "❗" }, conspiracy: { name: "陰謀論框架", icon: "🕳️" },
    generalization: { name: "以偏概全", icon: "🧺" }, blind_praise: { name: "盲目吹捧", icon: "🙇" },
    ragebait_hook: { name: "釣魚引戰", icon: "🎣" }, distortion: { name: "斷章取義", icon: "✂️" },
  },
};

const STR: Record<Ui, any> = {
  ko: {
    brand: "어그로미터", title: (s: number) => `어그로 지수 ${s}/100`, lang: "ko",
    levels: { clean: "청정", low: "낮음", mid: "주의", high: "높음", extreme: "극단" },
    detected: "검출된 선동 화법", none: "뚜렷한 선동 화법이 검출되지 않았습니다.",
    cta: "나도 궁금한 글 측정해보기", home: "/aggro/",
    font: "IBM+Plex+Sans+KR", fontName: "IBM Plex Sans KR",
    advice: "REACT LATER — 판단 전 3초",
    disclaimer: "어그로미터는 글의 화법(수사 기법)을 분석할 뿐, 작성자·계정을 판별하지 않습니다. 결과는 AI의 참고 의견입니다.",
    ogDesc: "댓글·링크·스크린샷을 던지면 AI가 선동 화법 12종을 탐지합니다.",
  },
  en: {
    brand: "RageBait Meter", title: (s: number) => `RageBait Score ${s}/100`, lang: "en",
    levels: { clean: "Clean", low: "Low", mid: "Caution", high: "High", extreme: "Extreme" },
    detected: "Detected techniques", none: "No clear manipulation techniques detected.",
    cta: "Measure a post yourself", home: "/aggro/en/",
    font: "IBM+Plex+Sans", fontName: "IBM Plex Sans",
    advice: "REACT LATER — 3 seconds first",
    disclaimer: "RageBait Meter analyzes rhetoric only — it cannot and does not identify authors or accounts. Results are an AI opinion.",
    ogDesc: "Drop a comment, link, or screenshot — AI detects 12 manipulation techniques.",
  },
  tw: {
    brand: "帶風向偵測器", title: (s: number) => `風向指數 ${s}/100`, lang: "zh-Hant",
    levels: { clean: "乾淨", low: "輕微", mid: "注意", high: "偏高", extreme: "極端" },
    detected: "偵測到的話術", none: "沒有偵測到明顯的帶風向話術。",
    cta: "我也要測一篇", home: "/aggro/tw/",
    font: "Noto+Sans+TC", fontName: "Noto Sans TC",
    advice: "REACT LATER — 先停三秒",
    disclaimer: "本工具僅分析文字話術，無法也不會判斷作者或帳號身分。結果僅為 AI 參考意見。",
    ogDesc: "留言、連結、截圖丟進來，AI 偵測 12 種帶風向話術。",
  },
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const LEVEL_COLORS: Record<string, string> = {
  clean: "#3ef08c", low: "#a8e063", mid: "#ffb224", high: "#ff7a45", extreme: "#ff4d5e",
};

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const id = String(ctx.params.id || "").replace(/[^a-z0-9]/gi, "").slice(0, 16);
  const raw = id ? await ctx.env.page_cache.get(`aggro:r:${id}`) : null;
  if (!raw) return Response.redirect(new URL("/aggro/", ctx.request.url).toString(), 302);

  let data: any;
  try { data = JSON.parse(raw); } catch { return Response.redirect(new URL("/aggro/", ctx.request.url).toString(), 302); }
  const r = data.r;
  const ui: Ui = (["ko", "en", "tw"] as Ui[]).includes(data.ui) ? data.ui : "ko";
  const s = STR[ui];
  const v = VERDICTS[ui][r.level] || VERDICTS[ui].mid;
  const color = LEVEL_COLORS[r.level] || "#ffb224";
  const pageUrl = `https://page.cocy.io/aggro/r/${id}`;
  const ogImg = `https://page.cocy.io/aggro/og/${r.level}-${ui}.png`;
  const ogTitle = `${s.title(r.score)} — ${v.stamp}`;

  const arcLen = 402;
  const arcOff = arcLen - (r.score / 100) * arcLen;
  const needleAng = (r.score / 100) * 180 - 90;

  const techsHtml = r.techniques.length
    ? r.techniques
        .map((t: any) => {
          const m = TECH_NAMES[ui][t.id] || { name: t.id, icon: "⚠️" };
          return `<div class="tech"><div class="name"><span class="ic">${m.icon}</span><span>${esc(m.name)}</span></div>${
            t.quote ? `<div class="quote">“${esc(t.quote)}”</div>` : ""
          }<div class="why">${esc(t.why)}</div></div>`;
        })
        .join("")
    : "";

  const html = `<!DOCTYPE html>
<html lang="${s.lang}">
<head>
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MV8KQGJF');</script>
<!-- End Google Tag Manager -->
<!-- AdSense: managed via GTM auto-ads (ca-pub-6634731722045607) -->
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>${esc(ogTitle)} · ${esc(s.brand)}</title>
<meta name="robots" content="noindex">
<meta name="description" content="${esc(r.headline || s.ogDesc)}">
<link rel="canonical" href="${pageUrl}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(ogTitle)}">
<meta property="og:description" content="${esc(r.headline || s.ogDesc)}">
<meta property="og:url" content="${pageUrl}">
<meta property="og:image" content="${ogImg}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(ogTitle)}">
<meta name="twitter:description" content="${esc(r.headline || s.ogDesc)}">
<meta name="twitter:image" content="${ogImg}">
<link rel="icon" type="image/svg+xml" href="/aggro/icon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${s.font}:wght@400;500;700&family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/aggro/aggro.css?v=2">
<style>:root{--body-font:"${s.fontName}"}</style>
</head>
<body>
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MV8KQGJF"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
<div class="wrap">
  <header class="top">
    <a href="${s.home}" style="display:contents"><img class="logo" src="/aggro/icon.svg" alt=""></a>
    <div class="brand"><b>${esc(s.brand)}</b><span>Aggro-Meter</span></div>
  </header>
  <section class="panel" style="margin-top:26px">
    <div class="result" style="display:block">
      <div class="gaugebox">
        <svg class="gauge" viewBox="0 0 300 160">
          <path d="M 22 140 A 128 128 0 0 1 278 140" fill="none" stroke="#1e2c47" stroke-width="14" stroke-linecap="round"/>
          <path d="M 22 140 A 128 128 0 0 1 278 140" fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round" stroke-dasharray="${arcLen}" stroke-dashoffset="${arcOff}"/>
          <g style="transform-origin:150px 140px;transform:rotate(${needleAng}deg)"><line x1="150" y1="140" x2="150" y2="34" stroke="#dce6f5" stroke-width="3" stroke-linecap="round"/><circle cx="150" cy="140" r="7" fill="#dce6f5"/></g>
        </svg>
        <div class="score-line"><span class="score-num" style="color:${color}">${r.score}</span><span class="score-unit"> / 100</span></div>
        <div class="stamp" style="border-color:${color};color:${color}">${esc(v.stamp)}</div>
        <div class="stamp-sub">${esc(v.sub)}</div>
        <div class="headline">${esc(r.headline)}</div>
        <div class="summary">${esc(r.summary)}</div>
      </div>
      ${techsHtml ? `<div class="techs">${techsHtml}</div>` : `<div class="no-tech" style="display:block">${esc(s.none)}</div>`}
      <div class="advice"><b>${esc(s.advice)}</b><span>${esc(r.advice)}</span></div>
      <div class="act-row"><a class="share-btn" style="text-align:center;text-decoration:none;padding:13px;border-radius:10px;background:linear-gradient(135deg,#2fe07f,#1db4e8);color:#04121f;font-weight:800" href="${s.home}">${esc(s.cta)}</a></div>
      <div class="disclaimer">⚠️ ${esc(s.disclaimer)}</div>
    </div>
  </section>
  <footer><a href="https://page.cocy.io/">← page.cocy.io</a></footer>
</div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
};
