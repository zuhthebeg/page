# HyperQwen primary-source checkpoint — 2026-10-14

## Verified identity and pins
- Supplied X post https://x.com/Oluwaphilemon1/status/2109830882404057588 read via https://api.fxtwitter.com/status/2109830882404057588. It already distinguishes ordinary chat ~133, 25k reproduction ~381, repeated-prefix TTFT 22.4→0.56. Do not accuse it of promising general chat 381.
- Old GitHub URL https://github.com/syv-ai/qwen38-27b-rtx3090 redirects to https://github.com/syv-ai/HyperQwen.
- GitHub main pin: 95ee3b64b0df7014ee2626529524d6b99c3dcdd1. README: 127 single-user, 381 quoting, ~1035 aggregate C64. LICENSE fetched: Apache-2.0.
- HF Qwen/Qwen3.8-27B pin 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0. API, card and exact LICENSE retrieved: Apache-2.0.
- HF dbirks/Qwen3.8-27B-W4A16-AutoRound pin 1f05c441c4e64ae0549de44fa9ea5a6d43610314. API and card Apache-2.0; separate LICENSE file 404 (do not claim read that file).
- HF syvai/Qwen3.8-27B-DFlash2-W4A16 pin 4d30ec736ffc6b8688dc2ae2b502d9b48bdec279; API/card Apache-2.0. Upstream incoai/Qwen3.8-27B-DFlash2 pin 015e795645c74b1a0eeef3b570031fb62e769bc5; API/card Apache-2.0.

## Evidence and limits
- docs/optimizations.md pinned: same 25k greedy server, first 60 lines verbatim 159→260→381 tok/s, 14.97 tokens/step for long block; free-form summary/Q&A ~67–72; short C1 chat ~133. DFLASH_TOKENS=15 trades 8 slots/64k for 4/56k. Report all as author measurements.
- Issue #32 API fetched: external reporter native Linux RTX4090 24GB, 450W cap, bbc6c0f, 135.5 C1 greedy against reference 133 at 250W. Cap is not measured sustained power. docs/reproductions/README.md preserves this older comparison; not a matched test against current README's 127.
- docs/wsl2-4090.md: separate external campaign, version/cache-state dependence, several explicitly retracted causal inferences. Do not repeat struck-through claims as current bugs.
- docs/vllm-0.31.md: defaults boot and serve; 8GB CPU KV tier loses cached turn-2 at eviction, 0.31 zero readback vs 0.30 96.3%. Current series carries upstream PR61050; native3090 8GB result 85.2/82.1%, not complete 96.3 parity, one boot. Patched4090 offload recovery not established by that row. Avoid headline '0.31 unusable' or 'fully fixed'.
- docs/quality.md: IFBench 299 prompts strict W4A16 78.3 vs model-card 79.5 (cross-source, not matched BF16 re-run); GSM8K 200 questions fast 96.5%, PPL fast8.095 vs base8.045. Draft rejection verification exact conditional on correct implementation and same target, not same as unquantized checkpoint; implementation notes admit 7/9 long greedy token-identical and near-tie differences.
- DFlash paper https://arxiv.org/abs/2602.06036v2 is original DFlash, not DFlash2. DFlash2 primary technical announcement https://inco.ai/blog/dflash2/ dated 2026-08-18, conditional position acceptance and rejection sampling. No separately verified DFlash2 paper citation. Announcement speedups on other runtimes/hardware do not prove 4090 results.

## Editorial verdict and boundary
Conditional GO: already available 24GB RTX4090, isolated single-user 30–60 minute evaluation after authorized preparation. NO immediate 24/7 or production agent replacement, no GPU purchase justified by this report. Ordinary chat/code/25k RAG, cold/warm TTFT, p50/p95, decode vs e2e, dedicated/shared RAM, correctness/tool JSON, power and errors. Proposed acceptance rubric, not predicted measured performance.
No our model measurements. No owner4090 inspection. Parent notes local GPU is RTX3080Ti12GB, different machine; public article discloses only lack of target hardware verification, not private details.
No install, download models/image, power/driver/WSL/gateway/auth changes, push/deploy/Threads/child spawn. Static homepage discovery link follows PG1 convention; a curated row in existing sites API also registers the normal searchable gallery without a D1 mutation. API tests preserve existing DB rows and deduplicate the reserved slug. Parent owns independent review, promotion and production verification.

## Additional preparation / Korean checks
- docker/prepare.sh default HF_REPO=dbirks/Qwen3.8-27B-W4A16-AutoRound verified at pin. prepare/fetch_fast_variant.py pulls syvai/qwen3.8-27b-3090-fast-variant; HF API/card verified Apache-2.0 at 124c14e7e8c7d2f5402933b9af368e772a9fcf0c. No model tensor downloads.
- docs/gotchas.md #61: MTP vocab language dependence, Hangul 4/6807 rows, Chinese measurements not Korean predictions; DFlash2 does not use this vocab. Added public caveat.
