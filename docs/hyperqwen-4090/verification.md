# HyperQwen / RTX 4090 verification — 2026-10-14

## Scope
New public/hyperqwen-4090/index.html and original icon.svg; surgical static route reservation, sites API normal gallery registration, homepage no-JS discovery link, sitemap/llms entry, local test and research docs. No D1 writes, installation, models/images downloaded, push/deploy, auth/gateway/driver/power/WSL settings, Threads, child agents, screenshots or changes to other worktrees.

## Repeat locally
1. `python3 -m http.server 8798 --bind 127.0.0.1 --directory public`
2. `node --check scripts/hyperqwen-4090-verify.cjs`
3. `node scripts/hyperqwen-4090-verify.cjs`
4. `git diff --check`

The test accepts loopback HTTP only. Node24's stripTypeScriptTypes imports the actual Pages handlers; its experimental warning is expected. Browser/Playwright paths follow installed local verification tooling, not a new dependency. HYPERQWEN_EVIDENCE_DIR optionally changes the JSON destination; default is outside this worktree at the session workspace's tmp/page-hyperqwen4090-evidence/verification.json. No screenshots are taken.

## Result
**123 assertions pass.** Article matrix 320/390/768/1280 CSS px, touch/mobile emulation at 320/390, native keyboard at every width. Additional normal gallery tests at 390/1280.
- Tab → visible skip-link focus, Enter → main focus; native Enter/Space open/close both disclosures; native keyboard TOC navigation makes pilot heading visible.
- No horizontal overflow initially, with disclosure open, or with enlarged 24px body text. Navigation and disclosures have ≥44px height. Mobile emulation is not a physical-phone test or screenshot visual review.
- Korean lang, single h1, canonical, JSON-LD, explicit no-GPU-measurement disclosure, all fragment anchors resolve, three distinct workload cards.
- JS-disabled article and native disclosure readable.
- Actual reserved-route handler calls next() with zero KV/D1 access at /hyperqwen-4090, trailing slash and icon URL.
- Actual sites API preserves existing DB results, deduplicates the static article, keeps CORS, includes the static article with an empty DB result. Normal homepage gallery renders its card, native search filters it, keyboard opens the article. The API registration is a curated static row, not a D1 publish mutation; its zero view count is a placeholder, not analytics.
- Sitemap parses as XML and contains article URL exactly once; homepage and llms discovery entries present.
- Article privacy scan finds no private machine names, local paths, credentials or loopback endpoints; no external art/library hotlinks or application fetch/WebSocket code. Existing GTM/AdSense metadata retained.
- Article matrix console errors 0 / page errors 0; screenshots 0 / model requests 0.

## Network boundary and gaps
All external browser requests are stubbed. GTM/AdSense execution, ads placement, external Google login and production routing are not verified. Gallery uses a mock D1 result delivered through the actual API handler; no remote database mutation. Browser is headless Chromium, not an owner4090/realphone run.

Initial test mistakenly required a section target within the top 100px. Native mobile anchor navigation showed the heading fully inside the viewport lower down. Corrected to test the actual contract (heading fully visible), using state-based wait rather than sleep. Full 123 checks rerun after the correction and normal gallery integration.

## Research review
See research.md for pins and evidence classification. Main HF license read from exact LICENSE; quantized checkpoints, fast extras and draft licenses checked in exact pinned card/API, not nonexistent separate LICENSE files. DFlash v2 paper is not relabeled DFlash2. Ordinary chat, document reproduction, concurrent aggregate and warm-prefix TTFT remain distinct. MTP language-vocabulary caveat added without extrapolating Chinese performance to Korean. CPU offload regression described as bounded eviction case with partial patch recovery, not a blanket 0.31 failure or fully fixed 4090 result.

## Publication gate
Local implementation ready for independent parent fact-check/review. Parent must verify fresh origin integration, commit before deploy, actual production bytes/route/status/title/source links and gallery state before claiming publication. No deployed URL, Threads success, owner hardware speed or GPT/Claude replacement proof is claimed.

## Parent review correction
The parent caught a badge corrupted by broad placeholder replacement (`REPO` inside `REPORT`). The badge is now exact Korean: `외부 사용자 재현 보고 · 직접 실측 아님`. Actual source-link anchors are unchanged. Added two regression assertions for exact text and absence of a URL in the badge; all 123 assertions pass.
