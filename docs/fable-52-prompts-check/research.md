# Fable 5.2 프롬프트 6개 검토

기준일: 2026-11-16 KST. 모델 실행·프롬프트 비교·CI 실데이터 분석 없음.

## 조사 범위

- https://www.threads.com/share/BAWAp43dR5 → https://www.threads.com/@voidlight00/post/Dfx5epSj53o
- 로그인 없이 브라우저 DOM에서 본문, 작성자 후속 6개, 버그 확률 추가 글을 확인했다. 댓글은 주장의 사실 근거로 쓰지 않았다.
- 원문의 상태 머신·OSS 비교·버그 우선순위·작업 완결·CI 감사·재설계 질문을 각각 검토했다.
- 배포 사이트용 정적 HTML이며 첨부용 HTML 아티팩트가 아니므로 저장소의 자체 완결 vanilla HTML 규약을 따랐다. 새 런타임 의존성은 없다.

## 근거

1. Anthropic 2026-11-09 발표: https://www.anthropic.com/claude-fable-and-mythos-5-2
   - Fable 5.2 실재. FrontierCode 2.0 49.1% Xhigh vs Opus 5.5 45.5%.
   - AutomationBench Fable 51.4% vs Gemini 4 Carbon 53.9%; AA-Briefcase Elo 1785 vs Opus 1800.
   - 제조사 평가이며 독립 재현이 아니다. 대부분 코딩·지식 업무는 Opus 5.5부터 시작하라는 권고도 있다.
2. https://code.claude.com/docs/en/best-practices
   - 파일·증상·완료 기준·검증을 명확히 하라. 탐색형 모호한 질문도 괜찮다고 명시한다.
   - 특정 6개 문구의 정답률·비용·시간 개선 실험은 확인하지 못했다. 효과가 없다고 단정하지 않았다.
3. https://code.claude.com/docs/en/security
   - 권한·샌드박스·외부 콘텐츠 및 사용자 검토 필요. 삭제 이외에도 위험한 작업이 있다.
4. https://cli.github.com/manual/gh_run_list
   - --limit 150 지원. run 목록만으로 job/step 시간을 분해할 수는 없다.
5. https://docs.github.com/en/rest/actions/workflow-jobs?apiVersion=2022-11-28
6. https://docs.github.com/en/rest/actions/workflow-runs?apiVersion=2022-11-28
   - job/step started_at, completed_at 및 run created_at, run_started_at 확인.
   - job 시작 − workflow 생성은 needs/concurrency/승인 등과 섞이므로 순수 머신 대기라고 할 수 없다.
7. https://nitter.rdrama.net/Voxyz_ai/search 및 https://lunarcrush.ai/creator/twitter/Voxyz_ai/posts
   - 검색/페이지 조회 도구로 영문 도입과 6개 문구가 거의 같은 내용을 확인했다. 직접 requests 조회는 403이었다.
   - 영문 버그 분류 문구에는 “Tune the threshold of 5 to your project.”가 있고, 확인한 Threads에는 빠져 있다.
   - 미러 목록은 변동 가능. X 개별 고정 원문·최초 시각·작성 경위는 확인하지 못했으므로 표절 판정은 하지 않는다.

## 해석과 미검증

업무 범위·완료 기준을 구체화하는 것은 합리적이다. 점수 5의 보편적 정당성, 버그 확률 x% 측정, 무결점 개선·무한 자율 실행은 입증되지 않았다. 안전한 수정 프롬프트는 조사자의 제안이며 성능을 실험 검증한 공식 문구가 아니다. 보안·금전·데이터 손실 예외 및 CI 측정·통계 보완도 조사자의 엔지니어링 판단으로 표시했다.
