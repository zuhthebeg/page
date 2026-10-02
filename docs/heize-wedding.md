# Heize wedding — independent, unlisted invitation

URL: https://page.cocy.io/heize-wedding/

## Design
Full-bleed original portrait, fine gold frame and floral ornaments, warm ivory / deep burgundy chapter rhythm, local Korean Myeongjo display font, staggered editorial photo layout. Gallery supports 12 original full-size images, swipe, keyboard, focus restoration, Escape. Progressive IntersectionObserver entrances never hide content without JavaScript; reduced motion disables entrances.

## Serving and privacy
The invitation is only static files plus its own scoped Pages Function. It bypasses the generic KV/D1 slug route, expiry advertising and view counters. No site/database entry is created, and it is not added to sitemap or gallery indexes. No ads, GTM, analytics, remote SDK, forms, RSVP POSTs or payment actions. Noindex/nofollow/noimageindex/nosnippet headers and metadata; no-transform prevents automatic analytics injection. Noindex is not authentication: a URL recipient can read the page.

All image, font, script, gallery JSON and calendar references are root-relative under `/heize-wedding/`. The scoped route uses Pages' static continuation. Verification must check production image MIME, decode and original source hashes, not just HTML HTTP200 or a local file server.

## Map
A real static OpenStreetMap map was downloaded from nine zoom-16 tiles, with OSM attribution. Its label/marker uses the original invitation coordinates. The cached same-origin map needs no credentials, remote runtime request, iframe or broad CSP permission. This is a real map, not a decorative SVG or external-link-only placeholder. The map does not support interactive panning/zoom; navigation buttons remain separate. Original Naver URLs are unchanged. Tmap/Kakao app SDK actions remain explicitly linked to the original invitation's navigation section rather than copying its app key or pretending the SDK is available here.

## Source fidelity and tests
Names, date/time, venue, introduction, family/contact links, notices, five accounts, original photos and calendar come from `source/swiy-wedding`. Sensitive values never belong in reports. 32 original assets (31 images and Korean font) are SHA256 verified. Original artwork and its reduced-motion policy remain available. Flower ordering and advertisements are absent; the original flower-refusal notice is retained.

`node scripts/heize-wedding-verify.cjs [baseURL]` runs read-only DOM/geometry/network browser verification, no screenshots. Covers 320/375/430 and landscape, all 12 full-image gallery decoding, swipe/keyboard/focus, clipboard success/denial, original content equality, actual map geometry/image/marker, asset HTTP/MIME/hash, enforced CSP/noindex, ad absence, calendar and zero console/page/network errors.

Evidence: `/home/cocy/.openclaw/workspace/tmp/heize-source/`. Result/checkpoint: `/home/cocy/.openclaw/workspace/tmp/heize-wedding-result.md`.

Deploy only a clean archive of committed HEAD. Existing untracked pages and unfinished changes in the old `swiy-wedding` directory are not part of this release. The old invitation remains unchanged.
