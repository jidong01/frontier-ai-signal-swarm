# Frontier AI Signal Swarm

AI 트렌드 인텔리전스 엔진 — 프론티어 AI 개발 동향을 탐지·분해·비교·해석하는 멀티 에이전트 시스템.

> **"지금 프론티어에서 무슨 일이 일어나고 있고, 그것이 우리의 이해를 어떻게 바꾸는가?"**

뉴스를 요약하지 않는다. 표면 아래 숨은 구조, 메커니즘, 함의를 드러내어 독자가 스스로 판단할 수 있는 **사고의 재료**를 생산한다.

## 핵심 특징

- **큐레이터 중심 개인화** — 도메인 가중치, 분석 깊이, 과대포장 민감도를 프로필로 관리
- **3-에이전트 병렬 분석** — Technical Analyst, Implications Analyst, Skeptical Verifier가 각 시그널을 독립 분석
- **체인 탐색(Chain Exploration)** — 씨앗 시그널에서 출발해 인용·반응·관련 동향을 "타고타고" 추적
- **시그널 메모리** — 이전 분석을 기억하여 중복을 방지하고 장기 트렌드를 식별
- **도시에(Dossier) 출력** — 에세이 형식의 심층 분석을 MD, JSON, HTML 세 포맷으로 동시 생성

## 분석 파이프라인

```
Step 0: 큐레이터 프로필 로드
Step 1: 소스 수집 (씨앗 수확 → 체인 탐색 → 보완 검색)
Step 1.5: 메모리 기반 중복 필터링
Step 2: 시그널 탐지 및 분류
Step 3: 3-에이전트 병렬 심층 분석
Step 4: 심층 탐구 (Deep Dive)
Step 5: 종합 서사 (Synthesis)
Step 6: 도시에 생성 (MD + JSON + HTML)
Step 7: 메모리 업데이트
```

## 빠른 시작

### 설치

```bash
npm install
```

### 사용법

```bash
# 전체 파이프라인 실행 (소스 수집 → 분석 → 도시에 생성)
npm start pipeline [topic]

# 특정 텍스트/URL 분석
npm start manual "제목" "내용" "URL"

# 데모 실행 (샘플 데이터)
npm start demo

# 시그널 메모리 조회
npm start memory
```

### 로컬 모드 (API 키 없이)

```bash
# 사전 수집한 이벤트 파일로 도시에 생성
npx tsx src/local.ts from-file data/events-latest.json

# 마크다운 → HTML 변환
npx tsx src/local.ts to-html output/dossier-2026-03-10.md

# 메모리 통계
npx tsx src/local.ts memory
```

### 큐레이터 워크스페이스

```bash
# 큐레이터 서버 시작 (포트 3847)
npm run curator

# 또는
npx tsx src/local.ts curator-serve
```

큐레이터 워크스페이스는 피드 관리, 메모 작성, 소스 등록, 도시에 열람을 위한 웹 UI를 제공한다.

## 프로젝트 구조

```
src/
├── index.ts                 # CLI 진입점 (API 모드)
├── local.ts                 # CLI 진입점 (로컬 모드)
├── types/signal.ts          # 타입 정의
├── collectors/              # 소스 수집 (Exa API)
├── detectors/               # 시그널 탐지 엔진
├── analyzers/               # 3-에이전트 분석기
├── synthesis/               # 시그널 간 패턴 탐지
├── dossier/                 # 도시에 생성기 (MD + JSON + HTML)
├── memory/                  # 시그널 메모리
├── curator/                 # 큐레이터 워크스페이스 서버
│   ├── server.ts            # Express API (포트 3847)
│   └── public/              # 웹 프론트엔드
├── pipeline/                # 파이프라인 오케스트레이터
│   ├── pipeline.ts          # API 기반 파이프라인
│   └── local-pipeline.ts    # 로컬 파이프라인
└── config/sources.ts        # 소스 설정

agents/                      # 분석 에이전트 프롬프트
├── technical-analyst.md     # 기술 메커니즘 분석가
├── implications-analyst.md  # 맥락·함의 분석가
└── skeptical-verifier.md    # 회의적 검증자

data/
├── curator/                 # 큐레이터 프로필·피드·메모·소스
└── memory/                  # 시그널 메모리·분석 이력

output/                      # 생성된 도시에 (MD + JSON + HTML)
```

## 도시에 구조

도시에는 뉴스 목록이 아니라 **읽을 수 있는 에세이**다.

1. **오늘의 한 줄** — 핵심을 한 문장으로
2. **시그널 요약 테이블** — 유형과 강도 한눈에
3. **심층 탐구** — 2-3개 주제를 깊이 있게 (메커니즘, 함의, 열린 질문)
4. **개념 도구** — 이번 분석에서 등장한 멘탈 모델
5. **시그널 간 연결** — 시그널들을 관통하는 큰 그림
6. **열린 질문들** — 결론이 아니라 질문으로
7. **학습 포인트** — 독자가 가져갈 구체적 배움

## 시그널 분류

### 유형

| Type | 설명 |
|------|------|
| `research` | 연구 논문, 브레이크스루 |
| `architecture` | 모델 아키텍처 변화 |
| `infrastructure` | AI 인프라, 컴퓨트 |
| `product` | 제품 출시, 기능 업데이트 |
| `api` | API 변경, 가격 정책 |
| `opensource` | 오픈소스 릴리스 |
| `capital` | 투자, 펀딩, M&A |
| `regulation` | 정책, 규제 |
| `ecosystem` | 산업 생태계 변화 |
| `talent` | 핵심 인재 이동 |

### 강도

| Strength | 빈도 |
|----------|------|
| `noise` | 대부분의 뉴스 |
| `weak` | 흔함 |
| `moderate` | 매일 |
| `strong` | 매월 |
| `critical` | 분기 1회 |

## 기술 스택

- **TypeScript** (Node.js)
- **Anthropic Claude** (Sonnet 4 / Opus 4.6)
- **Exa API** — 웹 검색
- **Express 5** — 큐레이터 워크스페이스 서버

## 라이선스

MIT
