# Verification

- Clean isolated worktree from page main a9b22c39. Existing nine dirty/untracked entries preserved in original checkout; no stash/reset.
- Reproduce: python3 -m http.server 8799 --bind 127.0.0.1 --directory public ; node scripts/polyhaven-verify.cjs
- 79 assertions PASS: exact key evidence values, no accidental domain/private content, no asset hotlinks or runtime API, actual TS static handler bypass no DB/KV, actual sites handler preserves DB rows/previous curated row and deduplicates new item, CORS, discovery entries, 320/390/768/1280 layout no overflow incl24px text, Korean/singleh1/canonical/JSON-LD, five cards, fragment anchors, native skip/disclosure keyboard, no-JS reading, browser pageerrors0. External traffic stubbed; no screenshots. Sitemap XML parses and URL occurs once. git diff --check clean.
- This verifies headless layout/semantics, not visual screenshot review/physical phone/GTM ads delivery/Blender import. Production proof to be recorded by publisher in workspace tmp/polyhaven-assets-research-result.md.
- Threads browser profiles check: No connected browser-capable nodes. No post/reply submitted. Draft saved beside research.
