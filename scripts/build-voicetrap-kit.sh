#!/usr/bin/env bash
# voicetrap-kit: 인터넷 없이 도는 self-contained 패키지 빌드.
# 소스(public/voicetrap/*)를 복사해 외부 의존성(구글폰트/CDN onnxruntime/../gnom 자산)을 전부 로컬화한다.
# 산출물 public/voicetrap-kit/ 는 git ignore (바이너리 35MB) — 이 스크립트로 언제든 재생성.
# 제출: 폴더를 GitLab/Drive에 올리거나 zip(build 끝에 생성)로 제출. http 서빙 필요(file:// 은 worker/fetch 제약).
set -euo pipefail
cd "$(dirname "$0")/.."          # page repo 루트
PUB=public; KIT=$PUB/voicetrap-kit
rm -rf "$KIT"; mkdir -p "$KIT/vendor" "$KIT/clips"

# 1) gnom 자산 (실제 사기범 클립 + 성문DB + ECAPA 모델)
cp "$PUB"/gnom/gnom_db.json "$KIT"/
cp "$PUB"/gnom/ecapa_int8.onnx "$KIT"/
cp "$PUB"/gnom/clips/g?.mp3 "$KIT"/clips/

# 2) onnxruntime-web (wasm CPU EP) 로컬 번들
TMP=$(mktemp -d); ( cd "$TMP" && npm pack onnxruntime-web@1.27.0 >/dev/null 2>&1 && tar xzf onnxruntime-web-*.tgz )
cp "$TMP"/package/dist/ort.min.js "$KIT"/vendor/
cp "$TMP"/package/dist/ort-wasm-simd-threaded.wasm "$KIT"/vendor/
cp "$TMP"/package/dist/ort-wasm-simd-threaded.mjs "$KIT"/vendor/
rm -rf "$TMP"

# 3) html/worker 복사 후 경로 로컬화
cp "$PUB"/voicetrap/index.html "$KIT"/index.html
cp "$PUB"/voicetrap/analyzer.js "$KIT"/analyzer.js
# 구글폰트 제거 → 시스템 폰트
sed -i '/fonts\.googleapis\.com/d; /fonts\.gstatic\.com/d; /IBM+Plex/d' "$KIT"/index.html
sed -i "s|--mono:'IBM Plex Mono',monospace; --sans:'IBM Plex Sans KR',sans-serif;|--mono:ui-monospace,'SF Mono',Menlo,Consolas,monospace; --sans:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo',Pretendard,'Malgun Gothic',sans-serif;|" "$KIT"/index.html
# ../gnom/ → ./ ,  CDN onnxruntime → ./vendor/
sed -i 's|\.\./gnom/|./|g' "$KIT"/index.html
sed -i "s|https://cdn.jsdelivr.net/npm/onnxruntime-web@1.27.0/dist/ort.min.js|./vendor/ort.min.js|" "$KIT"/analyzer.js
sed -i "s|ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.27.0/dist/';|ort.env.wasm.wasmPaths = './vendor/';|" "$KIT"/analyzer.js

# 4) 제출용 zip
( cd "$PUB" && rm -f voicetrap-kit.zip && zip -qr voicetrap-kit.zip voicetrap-kit )
echo "built: $KIT  (zip: $PUB/voicetrap-kit.zip)"
grep -REl 'cdn\.jsdelivr|googleapis|\.\./gnom' "$KIT" && echo "WARN: 외부 의존성 잔존" || echo "self-contained OK (외부 URL 0)"
