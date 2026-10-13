# PG1 local verification — 2026-10-13

## Reproduce

From this worktree, run `python3 -m http.server 8796 --bind 127.0.0.1 --directory public`, then `node scripts/pg1-verify.cjs`.
The script permits loopback HTTP only. Chromium/Playwright paths follow the existing repository verification scripts.
Screenshots and detailed JSON stay in ignored `tmp/pg1-evidence/`; no images are sent to chat.

## Final result

- Headless Chromium: **630 assertions passed**, **96 policy combinations** (3 models × 16 toggle combinations × 2 widths).
- Widths: **390 / 1280**. No horizontal overflow; all static SVG geometry inside its frame; all form targets ≥44px.
- **Console errors 0 / page errors 0**.
- Every select/checkbox changes the policy model and drawing. Request button shows a capsule; reset restores all defaults.
- Actual keyboard model selection, Tab traversal, Space toggles, Enter submit/reset passed.
- Reduced-motion requests settle immediately; ordinary motion moves the capsule, pauses offscreen and resumes to the exit. Changing reduced-motion live settles it immediately.
- Authentication rejection happens before routing and has 0 fallback attempts. API survives PC shutdown when the primary succeeds. PC-dependent routes cannot succeed with PC shutdown. The maximum fallback count is 1; fallback failure stops instead of switching to another paid API.
- No-JS explanatory fallback visible. Polite atomic live result region present.
- Meta3, homepage gallery link, llms.txt and sitemap registration present.
- Reserved route and three assets invoke static `ctx.next()` without DB/KV access (Node import of the actual TypeScript handler; 4 cases passed).
- Sitemap parses as XML and contains the new URL exactly once.
- Inline JavaScript and verification script pass `node --check`; `git diff --check` passes.

## Network boundary

The simulator contains no fetch, XMLHttpRequest, WebSocket or sendBeacon call. The only external script is the brief-required GTM tag, not an LLM request or CDN library. The browser test stubs this tag before navigation; simulator interactions make no external requests. Tracking/auto-ads behaviour of the real tag is not validated locally. No model requests, credential entry or paid calls are made.

## Security scan

`grep -RniE --binary-files=without-match` over the entire new public article folder found **0 matches** for the requested prohibited terms, 32-hex account identifiers, UUIDs, loopback/internal names, local paths and internal model alias prefixes. Exit 1 means no matches. Existing homepage authentication code is unchanged; the only added homepage line is the static article link, not its authentication implementation.

## Saved evidence

- `tmp/pg1-evidence/verification.json`: every assertion and all 96 combinations.
- `tmp/pg1-evidence/page-390.png`, `page-1280.png`: desktop/mobile page captures.
- `tmp/pg1-evidence/stopped-390.png`, `stopped-1280.png`: safety-stop states.
- `tmp/pg1-evidence/mechanism.png`, `mechanism-4x.png`: mechanism capture and 4× raster detail.
- `public/llm-gateway-anatomy/cover.png`: original local social-preview asset rendered from cover.svg, not an external hotlink.

## Fixes during verification

1. Initial reset failed because a form child named `reset` shadows the native method; fixed using `HTMLFormElement.prototype.reset.call` and reran the full matrix.
2. Native-select Enter opens its popup, consuming the next Tab; keyboard test now uses ArrowDown then Tab to exercise actual focus traversal.
3. Raised the isometric projection origin to keep the entire base within the SVG frame; both widths assert bounds.

No production tests, push, deployment, remote DB writes or child-agent spawning were performed. Screenshots were saved only; no image delivery or visual-review claim is made.
