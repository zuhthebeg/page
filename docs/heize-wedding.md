# Heize wedding — independent, unlisted invitation

URL: https://page.cocy.io/heize-wedding/

## Design
Full-bleed original portrait, fine gold frame and floral ornaments, warm ivory / deep burgundy chapter rhythm, local Korean Myeongjo display font, regular equal-size two-column photo grid. Gallery supports 12 original full-size images, swipe, keyboard, focus restoration, Escape. Progressive IntersectionObserver entrances never hide content without JavaScript; reduced motion disables entrances.

## Serving and privacy
The invitation is only static files plus its own scoped Pages Function. It bypasses the generic KV/D1 slug route, expiry advertising and view counters. No site/database entry is created, and it is not added to sitemap or gallery indexes. No ads, GTM, analytics, remote SDK, forms, RSVP POSTs or payment actions. Noindex/nofollow/noimageindex/nosnippet headers and metadata; no-transform prevents automatic analytics injection. Noindex is not authentication: a URL recipient can read the page.

All image, font, script, gallery JSON and calendar references are root-relative under `/heize-wedding/`. The scoped route uses Pages' static continuation. Verification must check production image MIME, decode and original source hashes, not just HTML HTTP200 or a local file server.

## Map
A real static OpenStreetMap map was downloaded from nine zoom-16 tiles, with OSM attribution. Its label/marker uses the original invitation coordinates. The cached same-origin map needs no credentials, remote runtime request, iframe or broad CSP permission. This is a real map, not a decorative SVG or external-link-only placeholder. The map does not support interactive panning/zoom; navigation buttons remain separate. Original Naver URLs are unchanged. Separate `티맵 대체 · 웹 길찾기` and `카카오맵 웹 길찾기` links use the officially documented HTTPS KakaoMap destination URL. Both are explicitly web-route fallbacks, NOT TMAP/KakaoNavi app launches; helper text explains this. The exact original venue latitude 37.5639695 and longitude 126.9862543 are retained, with an encoded venue name and documented latitude/longitude order. No source keys, SDK, invented URI schemes, platform sniffing, automatic app/store launches or installation timers are used. HTTPS links are activated only by a guest click, with provider-managed PC/mobile web handling and user-selected origin. No original invitation is opened.

## Source fidelity and tests
Names, date/time, venue, introduction, family/contact links, notices, five accounts, original photos and calendar come from `source/swiy-wedding`. Sensitive values never belong in reports. 32 original assets (31 images and Korean font) are SHA256 verified. Original artwork assets remain stored, but the requested archive viewer has been removed. Flower ordering and advertisements are absent; the original flower-refusal notice is retained.

`node scripts/heize-wedding-verify.cjs [baseURL]` runs read-only DOM/geometry/network browser verification, no screenshots. Covers 320/375/430 and landscape, all 12 full-image gallery decoding, swipe/keyboard/focus, clipboard success/denial, original content equality, actual map geometry/image/marker, asset HTTP/MIME/hash, enforced CSP/noindex, ad absence, calendar and zero console/page/network errors.

Evidence: `/home/cocy/.openclaw/workspace/tmp/heize-source/`. Result/checkpoint: `/home/cocy/.openclaw/workspace/tmp/heize-wedding-result.md`.

Deploy only a clean archive of committed HEAD. Existing untracked pages and unfinished changes in the old `swiy-wedding` directory are not part of this release. The old invitation remains unchanged.


## Point motion and sharing revision
Hero-only CSS decoration: eight slow petals and two soft gold glints (ten objects total), a low-opacity portrait light pass, staggered date/venue entrance, and a subtle wedding-date halo. Transform/opacity only, no animation timers/canvas/RAF; decorative layer is aria-hidden and pointer-events:none. Hidden tabs pause CSS animations; reduced-motion hides decoration and disables all animation/transitions. No screenshots were taken.

The original-sharing fallback link was removed; original navigation fallback is now also removed by the nav/gallery correction. Sharing uses navigator.share, not the Kakao SDK. Supported mobile OS share sheets may offer KakaoTalk; unsupported browsers explicitly label the action as link copy. User cancellation is silent; other share failures and clipboard denial produce honest feedback. Native payload tests use stubs, never transmit an invitation.


## Navigation/gallery correction (2026-10-02)
- Removed all nth-child spans and opposite margins; 12 thumbnails form six regular pairs, identical 3:4 thumbnail boxes with cover cropping. Full modal uses contain, never cropping originals; image sequence and files unchanged.
- Official docs live-checked: [KakaoMap destination URL](https://apis.map.kakao.com/web/guide/#routeurl), [KakaoNavi JavaScript](https://developers.kakao.com/docs/ko/kakaonavi/js), [TMAP official documentation portal](https://tmapapi.tmapmobility.com/main.html), [SK official TMAP Q&A](https://openapi.sk.com/qnaCommunity/214). KakaoNavi requires own JavaScript key/domain registration; source TMAP uses a registered appKey. The SK Q&A refers to SDK implementation, not a current keyless web-deep-link contract. No officially defined keyless native TMAP/KakaoNavi web scheme was confirmed, so no native support is claimed. Own registration/authorized keys would be a separate change.
- `node scripts/heize-wedding-nav-gallery-test.cjs [baseURL]`: actual DOM pair rects/gap/overflow at 325/375/430px, no original fallback, exact encoded destination URL, desktop/Android/iOS-labelled web dispatch with six trusted-click attempts intercepted before external navigation; no app/store/phone/SMS action performed.
- Existing full verifier additionally records all 12 original natural image dimensions and verifies modal contain framing, source asset hashes and original contact/account equality without logging private values.
- Physical phone app opening/installation and visual crop composition are not tested. No screenshots. The HTTPS provider can change downstream UI; tests prove correct destination links and user gestures, not successful native navigation.
- Result: `/home/cocy/.openclaw/workspace/tmp/heize-wedding-nav-gallery-result.md`.
