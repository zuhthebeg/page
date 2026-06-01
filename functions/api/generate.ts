/// <reference types="@cloudflare/workers-types" />
// POST /api/generate — 설문(spec)을 받아 LLM이 bespoke 단일페이지 HTML 생성 → 린트 → 발행.
// body: { vertical, mood[], palette, lang, title, content, images?[], listed? }
// resp: { slug, url, title }

interface Env {
  page_db: D1Database;
  page_cache: KVNamespace;
  LLM_SECRET?: string;
}

const LLM_URL = "https://llm.cocy.io/v2/chat/completions";
const GEN_MODEL = "opus"; // claude-opus-4-6 — 디자인 크래프트 최상

const RESERVED = new Set([
  "new", "edit", "api", "auth", "portal", "assets", "static",
  "favicon", "robots", "sitemap", "index", "404", "yang",
]);

interface Spec {
  vertical: string;            // portfolio | wedding | menu | ...
  mood?: string[];             // 무드 키워드
  palette?: string;            // 색감 무드
  lang?: string;               // ko | en | ...
  title?: string;
  content?: string;            // 자유 콘텐츠 덤프 (최고의 입력)
  images?: string[];           // R2 등 이미지 URL
  listed?: boolean;
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  let spec: Spec;
  try { spec = await ctx.request.json(); } catch { return bad("invalid json"); }
  if (!spec?.vertical) return bad("vertical required");
  if (!spec.content || spec.content.trim().length < 4) return bad("content required");

  const owner = decodeSub(ctx.request.headers.get("Authorization")) || "anon";
  const lang = spec.lang || "ko";
  const secret = ctx.env.LLM_SECRET || "choon150622";

  // 품질 레퍼런스(few-shot): 같은 vertical 의 exemplar 가 KV 에 있으면 주입
  const exemplar = await ctx.env.page_cache.get(`exemplar:${spec.vertical}`);

  const system = buildSystemPrompt(lang, exemplar);
  const user = buildUserPrompt(spec, lang);

  let html = await callLLM(secret, system, user);
  let lint = lintHtml(html);
  if (!lint.ok) {
    // 1회 교정 재시도
    html = await callLLM(
      secret,
      system,
      `${user}\n\n[이전 출력이 규약 위반: ${lint.reason}. 반드시 <!DOCTYPE html> 로 시작하는 순수 HTML만, :root CSS 변수와 data-block 섹션 포함하여 다시 출력.]`
    );
    lint = lintHtml(html);
    if (!lint.ok) return bad(`generation failed lint: ${lint.reason}`, 502);
  }
  html = stripFences(html);

  // 슬러그 확보 (유니크 + 예약어 회피)
  const slug = await uniqueSlug(ctx.env.page_db, spec.title || spec.vertical);
  const title = spec.title || extractTitle(html) || slug;
  const desc = extractMeta(html, "description") || "";
  const cover = spec.images?.[0] || "";
  const now = Date.now();
  const sid = `s-${slug}-${now.toString(36)}`;
  const vid = `v-${now.toString(36)}`;
  const listed = spec.vertical === "wedding" ? 0 : (spec.listed === false ? 0 : 1);

  await ctx.env.page_db.batch([
    ctx.env.page_db.prepare(
      "INSERT INTO versions (id,site_id,html,spec_json,label,created_at) VALUES (?1,?2,?3,?4,?5,?6)"
    ).bind(vid, sid, html, JSON.stringify(spec), "최초 생성", now),
    ctx.env.page_db.prepare(
      `INSERT INTO sites (id,slug,owner_id,vertical,title,description,cover_image,spec_json,current_version_id,status,listed,view_count,created_at,updated_at,published_at)
       VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,'published',?10,0,?11,?11,?11)`
    ).bind(sid, slug, owner, spec.vertical, title, desc, cover, JSON.stringify(spec), vid, listed, now),
  ]);

  // KV 서빙 store 굽기
  await ctx.env.page_cache.put(`html:${slug}`, html);

  return Response.json({ slug, url: `https://page.cocy.io/${slug}`, title });
};

// ---------- 생성 하네스 (디자인 DNA + 구조 규약) ----------

function buildSystemPrompt(lang: string, exemplar: string | null): string {
  let p = `너는 세계 최고 수준의 웹 디자이너이자 프론트엔드 장인이다. 의뢰인 한 명만을 위한 "단 하나뿐인" 단일 페이지(single self-contained HTML)를 만든다.

# 절대 원칙
- 뻔한 템플릿 금지. 매번 완전히 다른 레이아웃·타이포·색·여백·모션을 의뢰 맥락에서 도출한다.
- 평범한 부트스트랩/머티리얼 룩 금지. 의도된 디테일(섬세한 타이포 스케일, 여백 리듬, 미세 인터랙션, 질감/그레인, 우아한 호버)로 "공들인 한 페이지" 느낌을 낸다.

# 출력 형식 (엄수)
- <!DOCTYPE html> 로 시작하는 **순수 HTML 한 덩어리만** 출력. 마크다운 펜스(\`\`\`)·설명·주석 금지.
- 단일 파일 자기완결: CSS 전부 <style> 인라인. 외부 JS 프레임워크 금지(Google Fonts <link>는 허용, 가벼운 vanilla JS 인터랙션 허용).
- 모바일 우선 반응형. <head> 에 <title>·meta description·og:title/og:description/og:type 채운다. lang="${lang}".

# 구조 규약 (수정 가능성을 위한 뼈대 — 반드시 지킨다)
1. 테마는 전부 :root CSS 변수로. 최소: --bg --bg-2 --ink --ink-soft --muted --accent --accent-2 --line --font-display --font-body. 색/폰트/간격을 하드코딩하지 말고 변수 참조.
2. 주요 블록마다 <section data-block="..."> 라벨. (hero, about, gallery, menu, info, experience, contact 등 맥락에 맞게)
3. 이미지: 제공된 URL이 있으면 적재적소 배치. 없으면 깨진 img/회색 플레이스홀더 금지 — 타이포·도형·그라디언트로 우아하게 채운다.

# 품질 기준
- 색·폰트는 의뢰의 무드/팔레트에서 도출(예: 고급스런→딥톤+세리프+브라스 악센트, 화사한→밝은 베이스+컬러 악센트).
- 카피는 제공된 콘텐츠를 살리되 어색한 자리표시자("Lorem", "여기에 내용") 금지.`;

  if (exemplar) {
    p += `\n\n# 품질 레퍼런스 (크래프트 수준 참고용 — 산업/색/콘텐츠를 베끼지 말 것, "이 정도 공력"만 상속)\n<<<EXEMPLAR\n${exemplar}\nEXEMPLAR`;
  }
  return p;
}

function buildUserPrompt(spec: Spec, lang: string): string {
  const lines = [
    `# 의뢰 맥락`,
    `- 종류(vertical): ${spec.vertical}`,
    spec.mood?.length ? `- 무드 키워드: ${spec.mood.join(", ")}` : "",
    spec.palette ? `- 색감/팔레트: ${spec.palette}` : "",
    spec.title ? `- 제목/이름: ${spec.title}` : "",
    `- 언어: ${lang}`,
    spec.images?.length ? `- 사용할 이미지 URL(순서대로):\n${spec.images.map((u, i) => `  ${i + 1}. ${u}`).join("\n")}` : "- 이미지: 없음 (타이포/도형으로 디자인)",
    ``,
    `# 콘텐츠 (이 내용을 페이지로)`,
    spec.content || "",
    ``,
    `위 맥락으로 이 의뢰인만을 위한 단 하나의 페이지를 완성해라. <!DOCTYPE html> 로 시작하는 순수 HTML만 출력.`,
  ];
  return lines.filter(Boolean).join("\n");
}

async function callLLM(secret: string, system: string, user: string): Promise<string> {
  const r = await fetch(LLM_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
    body: JSON.stringify({
      model: GEN_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.9,
      max_tokens: 16000,
    }),
  });
  if (!r.ok) throw new Error(`llm ${r.status}`);
  const j: any = await r.json();
  return j?.choices?.[0]?.message?.content ?? "";
}

// ---------- 린트 / 유틸 ----------

function stripFences(s: string): string {
  let t = s.trim();
  if (t.startsWith("```")) t = t.replace(/^```[a-z]*\n?/i, "").replace(/```\s*$/, "").trim();
  const i = t.indexOf("<!DOCTYPE");
  return i > 0 ? t.slice(i) : t;
}

function lintHtml(raw: string): { ok: boolean; reason?: string } {
  const s = stripFences(raw);
  if (!/^<!DOCTYPE html>/i.test(s)) return { ok: false, reason: "no <!DOCTYPE html>" };
  if (!/:root\s*\{/.test(s)) return { ok: false, reason: "no :root CSS variables" };
  if (!/data-block\s*=/.test(s)) return { ok: false, reason: "no data-block section" };
  if (!/<title>/i.test(s)) return { ok: false, reason: "no <title>" };
  if (s.length < 1200) return { ok: false, reason: "too short" };
  return { ok: true };
}

function extractTitle(html: string): string {
  return html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() || "";
}
function extractMeta(html: string, name: string): string {
  return html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)`, "i"))?.[1]?.trim() || "";
}

function slugify(s: string): string {
  const base = s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return base.replace(/[^a-z0-9-]/g, "");
}

async function uniqueSlug(db: D1Database, seed: string): Promise<string> {
  let base = slugify(seed).slice(0, 32);
  if (base.length < 3 || RESERVED.has(base)) base = "";
  const rnd = () => Math.random().toString(36).slice(2, 6);
  let slug = base || `p-${rnd()}`;
  for (let i = 0; i < 6; i++) {
    const hit = await db.prepare("SELECT 1 FROM sites WHERE slug=?1").bind(slug).first();
    if (!hit && !RESERVED.has(slug)) return slug;
    slug = `${base || "p"}-${rnd()}`;
  }
  return `p-${Date.now().toString(36)}`;
}

function decodeSub(auth: string | null): string | null {
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    const payload = auth.slice(7).split(".")[1];
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return json.sub || json.userId || null;
  } catch { return null; }
}

function bad(msg: string, status = 400): Response {
  return Response.json({ error: msg }, { status });
}
