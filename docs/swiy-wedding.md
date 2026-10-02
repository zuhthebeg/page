# SWIY wedding — static, unlisted, ad-free

Production: https://page.cocy.io/swiy-wedding/

## Route and privacy

`functions/swiy-wedding/[[path]].ts` is scoped to this invitation. It calls the static asset continuation, not the platform's generic KV/D1 slug handler. It therefore does not query expiry, increment platform view counters, enter the public site database/list, or inject expired-tier ads. Existing configuration, sitemap, portal, and other routes are unchanged.

The route supplies noindex/nofollow/noimageindex/nosnippet headers and a self-only CSP that disallows frames, tracking connections, and external scripts. The HTML supplies matching robots metadata. There is no analytics, advertising, platform header/footer, service worker, external font, or SDK. No promotional social posting is part of publication.

Noindex is not authentication: anyone given the URL can read the invitation. Telephone/account details are intentionally included in the invitation, but must never be printed in reports.

## Original-to-new feature matrix

| Original | New | Notes |
|---|---|---|
| Title, two first names, exact event date/time and venue | Preserved | No invented date/location |
| Invitation paragraph | Preserved verbatim HTML | Korean text and line breaks |
| Main photograph | Exact locally downloaded file | SHA256 equality |
| 12 gallery photographs and 12 thumbnails | Local gallery, full-screen modal | Keyboard, Escape, swipe, focus restore |
| 6 contact rows | Preserved | Only existing telephone/SMS hrefs; deceased parent has no fake contact action |
| 5 bank accounts | Preserved | Exact display + clipboard; no payment integration or transfers |
| Google calendar link | Real calendar link + local ICS + monthly display | Exact original 11:00 KST start; no invented event duration |
| Naver map/search | Original safe HTTPS links | No tracking-heavy embedded map |
| Tmap/Kakao navigation | Explicit original-page fallback | No original app key/SDK reused |
| Link copy | Working clipboard | Honest error when permission unavailable |
| Kakao sharing | Explicit original-page fallback | System share and copy also available |
| Flower refusal and parking notices | Preserved verbatim | Flower ordering removed entirely |
| Original decorative artwork | Local disclosure | GIF hidden for reduced-motion preference |
| Music | Absent in original DOM and network | Not invented |
| RSVP / guestbook | Absent in original DOM and network | Not invented; original shared JS definitions are not page features |
| Ads/tracking/service promotions | Removed | Not source content to retain |

## Verification

Read-only original HTML, full rendered DOM, network inventory, asset hashes, and executable local/production verification are preserved under `/home/cocy/.openclaw/workspace/tmp/swiy-source/`. These artifacts are not deployed. No original RSVP/guestbook request was submitted; no telephone, SMS, or transfer was initiated.

Only this directory's assets and this scoped function were introduced. Deploy from a clean archive of the committed HEAD rather than the working tree: unrelated untracked pages must not be published accidentally. Existing production deployment was at the prior HEAD before this change.
