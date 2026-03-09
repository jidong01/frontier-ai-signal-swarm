# Claude Code Mode — Exa 없이 사용하기

CLI 없이 Claude Code 대화 안에서 전체 파이프라인을 실행하는 방법.

## 동작 원리

`CLAUDE.md`를 프로젝트에 두면 Claude Code가 자동으로 이 시스템의 프롬프트를 따릅니다.
수집 레이어는 Claude Code의 내장 도구(`WebSearch`, `WebFetch`)를 사용합니다 — Exa API 불필요.

```
사용자: "최신 AI 트렌드 분석해줘"
         ↓
Claude Code가 CLAUDE.md를 읽고 7단계 파이프라인 실행:
  Step 0: data/curator/profile.json 로드
  Step 1: WebSearch로 HN, arxiv, 기업 블로그 수확
  Step 2: 시그널 분류
  Step 3: 3-perspective 분석 (Task 도구로 병렬)
  Step 4: 심층 탐구
  Step 5: 서사 합성
  Step 6: output/dossier-YYYY-MM-DD.md + .html 저장
  Step 7: data/memory/ 업데이트
```

## 설정

### 1. CLAUDE.md 배치

```bash
# 이 레포를 그냥 Claude Code로 열면 됩니다
cd frontier-ai-signal-swarm
claude  # 또는 Claude Code로 폴더 열기
```

또는 기존 프로젝트에 통합:

```bash
cp CLAUDE.md /your-project/CLAUDE.md
cp -r data /your-project/data
```

### 2. 큐레이터 프로필 설정

```bash
npm run setup
# 또는
cp data/curator/profile.example.json data/curator/profile.json
# profile.json 편집
```

### 3. 사용

Claude Code 대화에서:

```
"최신 AI 트렌드 분석해줘"
"이번 주 프론티어 AI 소식 분석해줘"
"Reasoning model 트렌드 심층 분석해줘"
"이 기사 분석해줘: [URL]"
"지난 분석들에서 반복되는 패턴 있어?"
```

## CLI vs Claude Code Mode 비교

| 항목 | CLI Mode | Claude Code Mode |
|------|----------|-----------------|
| 수집 도구 | Exa API | Claude Code WebSearch/WebFetch |
| 실행 방식 | `npm start pipeline` | 대화 자연어 |
| 자동화 | 가능 (cron, CI) | 수동 (대화식) |
| 비용 | Exa + Anthropic API | Anthropic API만 |
| 커스터마이징 | config 파일 | 대화로 즉석 조정 |
| 권장 용도 | 정기 실행, 대량 처리 | 탐색, 원하는 시점 분석 |

## 팁

**분석 방향 즉석 조정:**
```
"이번엔 인프라 레이어에 더 집중해줘"
"투자 관련 시그널은 제외하고"
"한국 AI 생태계 관점에서 분석해줘"
```

**이전 분석과 연결:**
```
"지난번 reasoning model 분석이랑 이번 거 연결해줘"
"메모리에서 반복되는 테마 뭐야?"
```

**단일 URL 분석:**
```
"이 논문 분석해줘: https://arxiv.org/abs/..."
```
