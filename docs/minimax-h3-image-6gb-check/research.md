# MiniMax H3 Image 근거 기록

조사일: 2026-11-15 KST. 범위: 공개 문서·코드·API 메타데이터만. 설치/weights 다운로드/실제 추론/API 유료 호출/게시 없음.

## 원문
- https://x.com/NFT_Chen/status/2121706250174132386
- https://api.fxtwitter.com/NFT_Chen/status/2121706250174132386 (HTTP 200, 원문 created_at 2026-11-14 20:46:04 UTC)
- 주장: 33.1B/68GB→Q2_K 6.4GB, 8/12GB GPU·얇은 Mac, 네이티브 4096²/21:9, 공식 6-step/noCFG, 최대16참조, 20+quant/11만downloads.
- 재현 가능한 8GB 4K peakVRAM/시간/CPU RAM 측정 로그가 원문이나 확인한 모델 카드에 제시되지 않음. 이것은 불가능 증명이 아님.

## 고정 primary / publisher URLs 및 선택 인용

### 공식 모델 카드
https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/5f90473023975e6271b0ed1dd84c4e88e4bbc6d3/README.md
- “The checkpoint is distilled to 6 sampling steps (6 NFEs) with no classifier-free guidance.”
- “It generates images of about 16 megapixels at every aspect ratio, from 4096x4096 (1:1) to 6272x2688 (21:9), directly and without an upscaler”
- “supports up to 16 reference images”
- “Diffusion transformer: 33.1B parameters”
- “Text encoder ... 66.7 GB” 별도 구성표, transformer66.28GB/VAE2.34GB.
- “MiniMax-H3-Image expects a detailed English description of the whole image.”
- 요청표: num_inference_steps omit or6; guidance_scale omit or1; other values HTTP400; negative_prompt rejected.
- min_generation_area default4194304(4MP), 작은 출력도 내부 업스케일 생성 후 LANCZOS 축소 가능.
- FullWorkflow는 Context-IR 원격 API key 경로 + 별도 로컬 PE 대안. 로컬 추론이 항상 외부전송 없다는 주장은 부정확.
- 모델 카드에 text_encoder repo 미포함이라 쓰였지만 API sibling에는 중복 포맷·encoder 파일도 존재한다. 페이지는 모델의 필수 별도 구성/참조를 설명하고 단순 total repo storage를 필요량으로 쓰지 않음.

### 공식 config
https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/5f90473023975e6271b0ed1dd84c4e88e4bbc6d3/pdd_config.json
- num_inference_steps:6, sigmas:[1.0,0.9675236940383911,0.8875485062599182,0.75,0.5327739119529724,0.23200887441635132,0.0]
https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/5f90473023975e6271b0ed1dd84c4e88e4bbc6d3/model_index.json
- pretrained_model_name_or_path MiniMaxAI/MiniMax-H3, subfolder text_encoder; tasks t2i/edit.

### 공식 GitHub (API·로컬 경계)
https://github.com/MiniMax-AI/MiniMax-H3-Image/blob/40850901ab938303b5274122b5f305ebc5b75c80/README.md
- “Not yet supported | Mask-based inpainting, transparent backgrounds, user-specified seeds, preview images”는 앞에 “specifications of the MiniMax API”라고 한 표. 로컬 seed 불가로 확장하지 않음.
- release/license date November10,2026. HF createdAt Nov3은 저장소 생성이지 공개 출시일로 취급하지 않음.

### 공식 모델 LICENSE (중요)
https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/5f90473023975e6271b0ed1dd84c4e88e4bbc6d3/LICENSE
- I.5: “Excluded Territories” means the European Union, the United Kingdom, the Republic of Korea and the United States of America.
- II: “Solely within the Applicable Territory, we grant you ...”
- V.4: “Any such use outside the Applicable Territory is not authorized by this Agreement.”
- IV.1: separate prior written authorization if Annualized Revenue of you and/or affiliates exceeds1MillionUSD OR you provide HostedServices to ANY ThirdParties.
- IV.2: commercial UI prominently display MiniMax-H3-Image.
- V.3: “You may not use the MiniMax-H3-Image Works or any of their Outputs or results to improve any other artificial intelligence model (other than MiniMax-H3-Image or its Model Derivatives).”
- VI.4: “MiniMax claims no rights over the Outputs you generate.” 조건·제3자권리와분리.
- III: license copy, modified-file notices, NOTICE, territorial/AUP conditions.
- ExhibitA.12 공개 산출물 machine-generated disclosure.
- 별도 허가 https://platform.minimax.io/console/license (신청·로그인 실행 안함).
- 한국 개인 연구 자동면제라는 근거없음. 법률 자문아닌 원문 범위 설명.

### 커뮤니티 양자화 배포자 (독립 실측 아님)
https://huggingface.co/Abiray/MiniMax-H3-Image-GGUF/blob/fec7ec774db49d0c785bdc2174a488576b7396dd/README.md
- “converted directly from the structurally pruned BF16 master checkpoint provided by Comfy-Org”
- “load natively ... in stock ComfyUI-GGUF ... zero custom scripts or patches required!” 배포자주장. 아래 stock code와 간극을 발견해 무패치실행 미검증으로표시.
- Q2_K recommended8–10GBVRAM, Q3_K_M12GB, Q4_K_M16GB. GPU/해상도/RAM/peak/time 로그없는 추천표.
- Q4/Q5 near-lossless/indistinguishable도 배포자주장, quality 확인아님.
https://huggingface.co/api/models/Abiray/MiniMax-H3-Image-GGUF?blobs=true
- sha fec7ec774db49d0c785bdc2174a488576b7396dd
- Q2_K 6876632704 bytes (6.876632704GB/6.404GiB)
- Q3_K_M 8911771264 bytes (8.912GB/8.300GiB)
- Q4_K_M and Q4_K_S 11573106304 bytes each (11.573GB/10.778GiB)
- Q5_K_M 14077892224 bytes
https://huggingface.co/api/models/Abiray/MiniMax-H3-GGUF?blobs=true
- sha9fc3454d3ebe1be1bade862cd4a5011f325a22cb
- text_encoders/qwen3vl_32b_minimax_h3-Q4_K_M.gguf14576977960bytes
https://huggingface.co/api/models/Comfy-Org/MiniMax-H3-Image?blobs=true
- sha0bb149f51e3156ed4b90dd45d5620346bfe1df8f
- vae/minimax_h3_image_vae_fp16.safetensors1168505312bytes
- DiTint820979314802bytes / TEint827141342152bytes / TEnvfp4_awq15687142551bytes
- Q2+Q4TE+FP16VAE=22622115976bytes=22.622GB. Disk-only illustrative set, not simultaneousVRAM or validated executable set.

### Runtime / workflow
https://docs.comfy.org/tutorials/image/minimax/minimax-h3-image
- “Both need ComfyUI 0.45.0+ and template pack 0.11.104+.”
- “The template opens at 4 MP ... so low-VRAM machines do not run out of memory.” 8GB 검증이라는 명시는 없음.
- “The text-to-image template ships with the expander switched off ... The image editing template ships with it on.”
- officialPEQwen3.8-27BFP4 vs templateQwen3.5-9BW4A8. 필수 Qwen3-VL encoder와 별개.
https://github.com/Comfy-Org/ComfyUI/releases/tag/v0.45.0
- latest release endpoint v0.45.0 published2026-11-10T21:42:42Z.
https://github.com/Comfy-Org/workflow_templates/blob/79b02f4a79e233c07ec4923e39f40be27448549d/templates/image_minimax_h3_image_t2i.json
https://github.com/Comfy-Org/workflow_templates/blob/79b02f4a79e233c07ec4923e39f40be27448549d/templates/image_minimax_h3_image_edit.json
- KSampler widgets6/1/euler/simple/1.
- MiniMaxH3ImageConditioning widgets3104x3104내장(서브그래프 override 미시험); 문서의 4MP와 실제 실행값이 같다고 단정하지 않음.
https://github.com/Comfy-Org/ComfyUI/blob/v0.45.0/comfy/model_detection.py#L401-L434
- core recognizes imagecheckpoint by video_patch_proj/condition_proj, readsmetadata config transformer.pdd_steps andpdd_sigmas.
https://github.com/city96/ComfyUI-GGUF/blob/6ea2651e7df66d7585f6ffee804b20e92fb38b8a/loader.py
- IMG_ARCH_LIST lacksMiniMaxH3. Unknownnamedarch ValueError; archNone/pig/cow compatibility uses tools.convert.detect_arch.
https://github.com/city96/ComfyUI-GGUF/blob/6ea2651e7df66d7585f6ffee804b20e92fb38b8a/tools/convert.py
- noMiniMaxH3 explicit detect model. Unknownarchitectureassert.
https://github.com/city96/ComfyUI-GGUF/blob/6ea2651e7df66d7585f6ffee804b20e92fb38b8a/nodes.py#L168-L178
- metadata forwarding exists. Necessary, not proof architecture is accepted.
- GGUFheaders/actualinference notinspected; no blanketclaimallforksfail.
https://github.com/Comfy-Org/ComfyUI/blob/v0.45.0/LICENSE GPLv3
https://github.com/city96/ComfyUI-GGUF/blob/6ea2651e7df66d7585f6ffee804b20e92fb38b8a/LICENSE Apache2.0
- enginelicense != modellicense.

## 동적 수치 (2026-11-15 KST)
https://huggingface.co/api/models?filter=base_model:quantized:MiniMaxAI/MiniMax-H3-Image&limit=50
31 returnedentries, includesMLX/FP8(not31GGUF). Abiraydownloads111241. Notuniqueusers/qualityproof. SnapshotJSON stored locally.

## 판정 경계
- RTX3080Ti12GB: 권리확인 뒤 CPU오프로딩·단계별로드를 검토할실험후보만. NoactualRAMknown, no4Ktime/noVRAMpeak/noqualitybench.
- Mac unifiedRAM != discreteVRAM. Nochip/RAM/backendbench; no8GBor16GBfitpromise.
- GGUFprunedDiT, textencoder, VAE, runtimebuffers, activations/4K/workspace, CPUoffloadRAM allseparate.
- No primarymodel fabrication. Sourceexists. No deploy/push/social; parentreview+integrationrequired.

## 페이지 검증 (커밋 전)
- verify.py: 23/23 PASS. HTML 요소 균형·중복ID·내부앵커·canonical/OG/JSON-LD·GTM·키보드/반응형 CSS 구조·정확한 bytes/6step/라이선스·local HTTP200·diff-check 확인.
- 브라우저 시각/실제 layout, 추론·GPU peak·실제 속도·Mac·유료 API는 미실행.
- 증거/테스트 스크립트는 /home/cocy/.openclaw/workspace/tmp/tribute-1115-minimax-h3/ 에 보관.
- 이 단계는 조사·페이지 커밋만. 부모 검수/병합/배포/운영 검증 대기. push/SNS 없음.
