# 하네스 엔지니어링(Harness Engineering): AI 에이전트 시대의 새로운 엔지니어링 패러다임

*2026년 3월 2일 | Frontier AI Signal Swarm — 개념 심층 탐구*

> "2025년은 에이전트의 해였다. 2026년은 에이전트 하네스의 해다." — Aakash Gupta

---

## 1. 하네스 엔지니어링이란 무엇인가

### 한 문장 정의

**하네스 엔지니어링(Harness Engineering)은 AI 모델의 본질적으로 들쭉날쭉한(spiky) 지능을 인간이 원하는 복잡한 작업에 맞게 조율하기 위해, 모델 주변에 제어 시스템과 도구를 구축하는 엔지니어링 분야다.**

이것은 단순한 프롬프트 엔지니어링의 확장이 아니다. 시스템 프롬프트, 도구 선택, 미들웨어, 실행 흐름, 검증 루프, 아키텍처 제약 조건 등을 포괄하는 **시스템 수준의 설계**다.

### 말(馬) 비유

"하네스(harness)"라는 용어는 원래 말 장구(馬具)—고삐, 안장, 재갈—에서 온다. 이 비유는 의도적이다:

| 요소 | 비유 | 역할 |
|------|------|------|
| **말(Horse)** | AI 모델 | 강력하고 빠르지만, 혼자서는 어디로 갈지 모른다 |
| **하네스(Harness)** | 인프라 | 제약, 가드레일, 피드백 루프로 모델의 힘을 생산적으로 channeling |
| **기수(Rider)** | 인간 엔지니어 | 방향을 제시하지, 직접 달리지 않는다 |

하네스 없는 AI 에이전트는 **열린 들판의 경주마**와 같다. 빠르고, 인상적이지만, 실제로 무언가를 해내는 데는 완전히 쓸모없다.

### 컴퓨터 비유 (Philipp Schmid, Google DeepMind)

Philipp Schmid는 더 정밀한 비유를 제안했다:

| 컴퓨터 구성요소 | AI 시스템 대응 | 설명 |
|----------------|--------------|------|
| **CPU** | AI 모델 | 원시적 처리 능력 |
| **RAM** | 컨텍스트 윈도우 | 제한적이고 휘발성인 작업 메모리 |
| **운영체제(OS)** | 에이전트 하네스 | 리소스를 관리하고, 표준 인터페이스를 제공하고, 부팅 시퀀스를 처리 |
| **애플리케이션** | 에이전트 | 사용자 특화 로직 |

PC의 실제 능력이 CPU 성능만으로 결정되지 않듯, AI 에이전트의 효과도 모델 성능만으로 결정되지 않는다. **하네스가 곧 아키텍처**다.

---

## 2. 왜 지금 하네스 엔지니어링이 중요한가

### "모델은 상품, 하네스는 해자(moat)"

AI 업계가 마주한 불편한 진실: **기저 모델보다 그것을 감싸는 시스템이 더 중요하다.**

이것을 가장 극적으로 증명한 사례가 LangChain이다:

| 항목 | 변경 전 | 변경 후 | 변화 |
|------|--------|--------|------|
| Terminal Bench 2.0 점수 | 52.8% | 66.5% | +13.7p |
| 순위 | Top 30 밖 | Top 5 | 25단계 상승 |
| 모델 변경 | 없음 | 없음 | GPT-5.2-Codex 고정 |
| 변경한 것 | — | 하네스만 | 시스템 프롬프트, 도구, 미들웨어 |

**모델을 하나도 바꾸지 않고, 하네스만 바꿔서 25단계를 뛰어올랐다.** 이것은 하네스 엔지니어링의 가치를 가장 명확하게 보여주는 데이터다.

### AI 모델의 구조적 한계

LLM이 아무리 강력해도, 다음 문제들은 모델 크기를 키운다고 해결되지 않는다:

1. **제한된 컨텍스트 윈도우와 영속적 기억의 부재** — 각 세션은 백지에서 시작한다
2. **환경과의 상호작용 불가** — LLM은 텍스트만 생산한다. 코드 실행, DB 쿼리, 웹 탐색은 중간 레이어가 필요하다
3. **계획과 자기 검증의 부재** — 구조가 없으면 복잡한 작업을 한 번에 해결하려다("one-shotting") 중간에 길을 잃는다
4. **느리고 가변적인 출력** — 전통적 소프트웨어의 밀리초 응답과 달리, 수 초 단위 응답에 품질도 들쭉날쭉하다

하네스 엔지니어링은 이 모든 구조적 한계를 **모델 외부에서** 해결한다.

---

## 3. 하네스 엔지니어링의 기원과 계보

하네스 엔지니어링이라는 용어는 2025년 말~2026년 초에 걸쳐 여러 독립적인 흐름이 합류하면서 형성됐다.

### 3.1 Anthropic — "Effective Harnesses for Long-Running Agents" (2025년 11월)

Anthropic은 Claude Agent SDK를 "강력한 범용 에이전트 하네스"라고 명명하며, 장시간 실행 에이전트의 핵심 문제를 정의했다:

> "에이전트의 핵심 도전은 불연속적 세션에서 작업해야 한다는 것이다. 새 세션은 이전에 일어난 일에 대한 기억 없이 시작된다. 마치 교대 근무하는 엔지니어 팀인데, 새 엔지니어가 이전 교대에서 무슨 일이 있었는지 전혀 모르는 채 출근하는 것과 같다."

**해결책: 이중 에이전트 시스템**
- **초기화 에이전트(Initializer)**: 첫 세션에서 환경을 설정하고, `init.sh`, `claude-progress.txt` 등 인수인계 문서를 생성
- **코딩 에이전트(Coder)**: 이후 세션에서 진행 파일과 git 히스토리를 읽고, 기능 하나씩 점진적으로 진행하며 깨끗한 커밋을 남김

이것이 "인간 엔지니어 팀의 교대 근무 방식을 모방한 하네스"라는 개념의 출발점이었다.

### 3.2 Mitchell Hashimoto — "My AI Adoption Journey" (2026년 2월 5일)

HashiCorp 공동 창업자이자 Terraform, Vagrant의 창시자인 Mitchell Hashimoto가 자신의 AI 도입 여정을 6단계로 공유하며, **5단계를 "Engineer the Harness"**라고 명명했다.

**핵심 철학:**
> "에이전트가 처음부터 올바른 결과를 만들거나, 최소한의 수정만 필요한 결과를 만들 때 가장 효율적이다."

에이전트가 실수할 때, 두 가지 접근:

1. **암묵적 프롬프팅 개선 (AGENTS.md)**: 에이전트의 반복 실수를 문서화하여 재발 방지. Ghostty 프로젝트의 AGENTS.md에서 "각 줄은 나쁜 에이전트 행동에 기반하며, 거의 모든 문제를 해결했다"
2. **프로그래밍된 도구**: 스크린샷 촬영, 필터링된 테스트 실행 등의 커스텀 스크립트 구축

### 3.3 OpenAI — "Harness Engineering: Leveraging Codex in an Agent-First World" (2026년 2월 11일)

OpenAI의 Harness 팀이 이 개념을 산업적 규모로 증명했다:

- **5개월간 100만 줄의 코드**, 인간이 직접 작성한 코드 **0줄**
- 3명의 엔지니어 → 7명으로 확장, 엔지니어당 하루 평균 **3.5개 PR**
- 기존 대비 약 **1/10 시간**으로 제품 구축
- 약 **1,500개 PR** 생성·병합
- 내부 일일 사용자와 외부 알파 테스터가 있는 **실제 운영 제품**

> "소프트웨어 엔지니어링 팀의 주된 업무는 더 이상 코드를 작성하는 것이 아니라, 환경을 설계하고, 의도를 명시하며, 에이전트가 신뢰할 수 있는 작업을 수행할 수 있는 피드백 루프를 구축하는 것이다."

---

## 4. 하네스의 네 가지 핵심 기능

Martin Fowler는 하네스를 "AI 에이전트를 통제하는 도구와 관행"이라 정의했다. 더 구체적으로, 하네스는 네 가지 기능을 수행한다:

### 4.1 제약(Constrain) — 에이전트가 할 수 있는 것을 제한

"자유는 에이전트의 적이다." 아키텍처 경계를 기계적으로 강제하면 오히려 생산성이 올라간다. 에이전트가 해결 공간을 탐색하는 데 낭비하는 시간이 줄기 때문이다.

**구체적 방법:**
- 의존성 계층화: `Types → Config → Repo → Service → Runtime → UI`
- 결정론적 린터와 LLM 기반 감사기(auditor) 병행
- 구조적 테스트와 pre-commit 훅
- 에이전트가 특정 디렉터리/파일만 수정 가능하도록 범위 제한

**OpenAI 사례:** "에이전트에게 폭발 반경(blast radius)을 명시적으로 정의하지 않으면, CSS 버그를 고치려다 자신있게 데이터베이스 스키마를 다시 작성한다."

### 4.2 정보 제공(Inform) — 에이전트가 알아야 할 것을 제공

**"에이전트 관점에서, 컨텍스트 안에서 접근할 수 없는 것은 존재하지 않는다."**

두 가지 유형의 컨텍스트:
- **정적 컨텍스트**: `AGENTS.md`/`CLAUDE.md`, 검증된 설계 문서, 아키텍처 다이어그램
- **동적 컨텍스트**: 관측 가능성(observability) 데이터, 디렉터리 맵핑, CI/CD 상태

**핵심 설계 원칙 — 점진적 공개(Progressive Disclosure):**

에이전트에게 천 페이지짜리 매뉴얼을 한 번에 주지 않는다. 대신 `AGENTS.md`를 **목차(Table of Contents)**로 만들어, 에이전트가 필요할 때 관련 문서를 스스로 찾아가게 한다.

```
# AGENTS.md (목차 역할)
## 시작하기
- 개발 환경: docs/setup.md 참고
- 아키텍처 개요: docs/architecture.md 참고

## 규칙
- 코딩 컨벤션: docs/conventions.md 참고
- 테스트 전략: docs/testing.md 참고

## 도구
- 스크린샷 도구: scripts/screenshot.sh
- 필터링 테스트: scripts/test-filter.sh
```

### 4.3 검증(Verify) — 에이전트가 올바르게 했는지 확인

LangChain이 발견한 가장 흔한 실패 패턴:

> "에이전트가 솔루션을 작성하고, 자기 코드를 다시 읽고, 괜찮아 보인다고 판단하고, 멈춘다. 실제 테스트는 없다. 그냥 감(vibes)."

**해결책:**
- **자기 검증 루프(Self-Verification Loop)**: 계획 → 테스트를 염두에 두고 구현 → 원래 스펙(자기 코드가 아닌)에 대해 검증 → 문제 수정
- **PreCompletionChecklistMiddleware**: 에이전트가 종료하기 전에 인터셉트하여 검증을 강제. "일 다 했니?"라고 묻는 문지기 같은 역할
- **관측 가능성 도구**: 에이전트에게 로그, 메트릭, 트레이스를 직접 쿼리할 수 있는 능력 제공
- **구조적 테스트**: 에이전트가 생성한 코드를 CI 파이프라인으로 자동 검증

### 4.4 교정(Correct) — 에이전트가 잘못했을 때 시스템적으로 수정

Mitchell Hashimoto의 핵심 철학: 에이전트의 실수를 **그때그때 고치는 것이 아니라, 그 실수가 다시는 발생하지 않도록 시스템을 개선**하는 것.

**두 가지 교정 메커니즘:**
1. **문서적 교정**: `AGENTS.md`에 실패 패턴과 올바른 행동을 명문화
2. **도구적 교정**: 검증 스크립트, 커스텀 린터, 자동화된 정비(garbage collection) 에이전트

**OpenAI의 "가비지 컬렉션" 접근:**
주기적으로 전용 에이전트를 돌려 다음을 정리한다:
- 문서 드리프트 (코드와 문서의 불일치)
- 아키텍처 제약 위반
- 네이밍 불일치
- 순환 의존성
- 사용되지 않는 코드/추상화

---

## 5. 실제 사례 연구

### 사례 1: OpenAI Harness 팀 — 빈 레포에서 100만 줄까지

**과정:**
1. 빈 git 레포지토리에서 출발 (2025년 8월)
2. 초기 스캐폴드(디렉터리 구조, CI, 포맷팅 규칙)도 Codex가 생성
3. `AGENTS.md` 자체도 Codex가 작성
4. 5개월 후: 100만 줄, 1,500 PR, 내부 일일 사용자, 외부 알파 테스터

**엔지니어의 일과:**
- 코드를 직접 작성하지 않는다 (팀의 핵심 철학)
- 에이전트가 막힐 때 직접 구현하지 않고, "왜 막히는지", "어떤 도구/추상화/규칙이 없어서 막히는지"를 찾아 시스템 자체를 개선
- 관측 가능성(로그, 메트릭, 트레이스)을 에이전트에게 직접 노출하여 자체 디버깅 가능하게 함
- 비동기 코드 리뷰: "에이전트 처리량이 인간 주의력을 훨씬 초과하는 시스템에서, 교정은 싸고 기다림은 비싸다"

**아키텍처 엔트로피 방지:**
> "에이전트가 코드를 생성할 때, 아키텍처 드리프트가 가장 큰 위험이다. 외부 가드레일 없이 에이전트에게 '앱을 만들어라'고 하면, 즉각적 문제를 해결하면서 장기적 구조적 무결성을 서서히 침식한다."

해결: 기계적으로 강제되는 아키텍처 불변량(invariants) — 커스텀 린터, 구조적 테스트, 의존성 방향 검사

### 사례 2: LangChain Deep Agents — 하네스만 바꿔 Top 5 진입

**최적화한 세 가지 노브(Knob):**

1. **시스템 프롬프트**: 기본 → 작업 환경 정보, 테스트 표준, 시간 예산 주입
2. **도구**: 환경 발견을 위한 에이전트의 시행착오 → `LocalContextMiddleware`로 사전 주입
3. **미들웨어**:
   - `LoopDetectionMiddleware` — 반복 루프 탐지
   - `ReasoningSandwichMiddleware` — 추론 품질 향상
   - `PreCompletionChecklistMiddleware` — 완료 전 검증 강제

**미들웨어 아키텍처:**
```
에이전트 요청
  → LocalContextMiddleware (환경 정보 주입)
  → LoopDetectionMiddleware (반복 루프 탐지)
  → ReasoningSandwichMiddleware (추론 품질 향상)
  → PreCompletionChecklistMiddleware (완료 전 검증)
  → 에이전트 응답
```

**핵심 발견:**
- 에이전트가 환경을 파악하려고 시행착오하는 데 상당한 노력과 오류를 낭비 → 사전 주입이 더 효과적
- 에이전트는 시간 추정을 매우 못한다 → 시간 예산 경고 주입이 효과적
- "테스트는 자율적 에이전틱 코딩의 핵심 — 전반적 정확성을 검사하는 동시에 에이전트가 hill-climb할 신호를 제공한다"

### 사례 3: Anthropic — 장시간 실행 에이전트를 위한 하네스

**문제:**
- Claude Opus 4.5도 단순히 "claude.ai 클론을 만들어라"라는 고수준 프롬프트만으로는 프로덕션 품질 앱을 만들지 못함
- **실패 패턴 1**: 한 번에 너무 많이 하려 함 → 컨텍스트 소진 → 다음 세션이 반쯤 완성된 기능에서 시작 → 추측으로 시간 낭비
- **실패 패턴 2**: 기능 구현 후 완료 표시를 너무 일찍 함 → 실제로는 제대로 작동하지 않음

**해결:**
- **기능 목록(Feature List)**: 초기 프롬프트를 200개 이상의 세분화된 기능으로 확장한 JSON 파일
- **브라우저 자동화 테스트**: Puppeteer MCP로 실제 동작 검증 (이것 없으면 에이전트가 시기상조로 완료 표시)
- **세션 시작 프로토콜**: 매 세션 시작 시 개발 서버가 돌아가고 기본 기능이 작동하는지 확인 후 새 기능 구현

### 사례 4: 토스(Toss) — 조직 차원의 하네스

토스는 하네스를 **팀 생산성의 "저점을 높이는" 도구**로 접근했다.

**문제 인식:** 같은 모델, 같은 IDE를 써도 결과물 차이가 극심하다. A 엔지니어는 10분 만에 머지 가능한 코드를 만들고, B 엔지니어는 1시간 동안 "우리 팀은 이렇게 안 해"를 반복하며 수정 루프에 갇힌다.

**해결: 3계층 지식 구조**
- **Global Layer**: 전사 공통 보안 정책, 코딩 표준
- **Domain Layer**: 팀별 비즈니스 로직 (결제팀, 정산팀 등)
- **Local Layer**: 프로젝트 특화 규칙

**3가지 핵심 가치:**
1. **마찰 없는 통합**: 자연어와 코드가 끊김 없이 섞이는 경험
2. **실행 가능한 SSOT(Single Source of Truth)**: 문서는 낡지만, 플러그인 형태의 지식은 즉시 반영
3. **범용에서 도메인 특화로의 진화**: 각 조직만의 최적화된 AI 워크플로우 정의·배포

---

## 6. 하네스를 활용하는 소프트웨어의 형태

수집한 사례들을 종합하면, 하네스 엔지니어링을 활용하는 소프트웨어는 다음과 같은 형태로 수렴하고 있다.

### 6.1 에이전트 하네스 플랫폼 (Agent Harness Platform)

**기존 제품 예시:** Claude Code, OpenAI Codex, LangChain DeepAgents

이들은 범용 "에이전트 운영체제"를 지향한다. 핵심 구성:

```
┌───────────────────────────────────────┐
│           사용자 인터페이스            │
│    (CLI / IDE 통합 / 웹 대시보드)      │
├───────────────────────────────────────┤
│           에이전트 하네스              │
│  ┌─────────┐  ┌──────────┐  ┌──────┐ │
│  │ 컨텍스트  │  │ 도구 관리 │  │ 메모리 │ │
│  │ 엔지니어링│  │ & 실행   │  │ 시스템 │ │
│  └─────────┘  └──────────┘  └──────┘ │
│  ┌─────────┐  ┌──────────┐  ┌──────┐ │
│  │ 미들웨어 │  │ 검증 루프 │  │ 상태  │ │
│  │ 파이프라인│  │ (CI/테스트)│  │ 관리  │ │
│  └─────────┘  └──────────┘  └──────┘ │
├───────────────────────────────────────┤
│          LLM 모델 (교체 가능)         │
│    (Claude / GPT / Gemini / ...)      │
└───────────────────────────────────────┘
```

**핵심 특징:**
- 모델은 교체 가능한 "CPU"이고, 하네스가 진짜 제품
- 컨텍스트 압축(compaction)으로 무한 세션 지원
- 도구 호출에 대한 생명주기 훅(lifecycle hooks)
- 서브 에이전트 위임과 관리

### 6.2 레포지토리 내장형 하네스 (Repository-Embedded Harness)

**가장 실용적이고 즉시 적용 가능한 형태.** OpenAI와 Mitchell Hashimoto가 강조하는 접근.

```
my-project/
├── AGENTS.md              ← 에이전트 행동 가이드 (목차 역할)
├── CLAUDE.md              ← Claude 특화 지침
├── docs/
│   ├── architecture.md    ← 아키텍처 불변량
│   ├── conventions.md     ← 코딩 컨벤션
│   ├── testing.md         ← 테스트 전략
│   └── setup.md           ← 환경 설정
├── scripts/
│   ├── screenshot.sh      ← 에이전트용 스크린샷 도구
│   ├── test-filter.sh     ← 필터링된 테스트 실행
│   └── verify-arch.sh     ← 아키텍처 제약 검증
├── .lintstagedrc          ← pre-commit 자동 검사
├── .github/
│   └── workflows/
│       └── agent-ci.yml   ← 에이전트 생성 코드 전용 CI
└── src/                   ← 실제 코드 (에이전트가 작성·수정)
```

**구현 난이도별 가이드:**

| 수준 | 대상 | 소요 시간 | 구성 |
|------|------|----------|------|
| Level 1 | 개인 개발자 | 1-2시간 | `CLAUDE.md`, pre-commit 훅, 테스트 스위트, 명확한 디렉터리 구조 |
| Level 2 | 소규모 팀 | 1-2일 | + `AGENTS.md`, CI 제약, 공유 템플릿, 문서 린팅 |
| Level 3 | 조직 | 1-2주 | + 커스텀 미들웨어, 관측 가능성 통합, 엔트로피 에이전트, 성능 대시보드 |

### 6.3 미들웨어 기반 에이전트 파이프라인

LangChain이 보여준 접근. 에이전트의 입출력에 미들웨어를 끼워 넣어 행동을 제어한다.

```python
# 개념적 구조
class AgentPipeline:
    middlewares = [
        LocalContextMiddleware(),      # 환경 정보 사전 주입
        LoopDetectionMiddleware(),      # 무한 루프 탐지
        ReasoningSandwichMiddleware(),  # 추론 품질 향상
        PreCompletionChecklist(),       # 완료 전 검증 강제
        TimebudgetMiddleware(),         # 시간 예산 경고
    ]

    def run(self, task):
        context = task
        for mw in self.middlewares:
            context = mw.before(context)
        result = self.agent.execute(context)
        for mw in reversed(self.middlewares):
            result = mw.after(result)
        return result
```

**장점:** 테스트 가능하고, 모듈식이며, 핵심 에이전트 로직을 변경하지 않고 진화 가능

### 6.4 도메인 특화 하네스 (Domain-Specific Harness)

토스의 접근처럼, 특정 조직·팀의 맥락에 최적화된 하네스.

**예시: 결제 시스템 팀의 하네스**
```
payment-harness/
├── skills/
│   ├── new-payment-method.md    ← "새 결제수단 추가" 워크플로우
│   ├── refund-flow.md           ← "환불 처리" 워크플로우
│   └── compliance-check.md      ← "규정 준수 검사" 워크플로우
├── constraints/
│   ├── pci-dss-rules.md         ← PCI-DSS 보안 규칙
│   ├── idempotency-rules.md     ← 멱등성 규칙
│   └── amount-validation.md     ← 금액 검증 규칙
├── templates/
│   ├── payment-service.ts.tmpl  ← 서비스 템플릿
│   └── payment-test.ts.tmpl     ← 테스트 템플릿
└── tools/
    ├── simulate-payment.sh      ← 결제 시뮬레이션
    └── verify-idempotency.sh    ← 멱등성 검증
```

팀원 누구나 `/new-payment-method`를 실행하면, 숙련된 엔지니어와 동일한 품질의 코드가 생산된다.

### 6.5 자기 진화하는 하네스 (Self-Evolving Harness)

가장 미래지향적인 형태. 하네스 자체가 에이전트의 실패로부터 학습하여 진화한다.

```
에이전트 실패 발생
  → 실패 패턴 감지 및 분류
  → AGENTS.md에 새 규칙 자동 추가
  → 검증 스크립트 자동 생성
  → 다음 실행에서 같은 실패 방지
  → 효과 측정 및 규칙 정제
```

토스가 언급한 "데이터 플라이휠": 규격화된 실패/성공 데이터가 축적되면, 이를 기반으로 도메인 특화 모델을 파인튜닝하여 조직만의 AI 엔진을 구축하는 선순환 구조.

---

## 7. 핵심 개념 도구 모음 (Conceptual Toolkit)

### 엄격함의 재배치 (Relocating Rigor)

개발자의 엄격함이 적용되는 위치가 바뀌었다. 코드의 각 줄을 신중하게 작성하는 것에서 → **에이전트가 활동할 환경과 피드백 루프를 설계**하는 것으로.

### 컨텍스트 발견 vs 컨텍스트 주입 (Context Discovery vs Context Injection)

에이전트가 스스로 환경을 파악하게 놔두면(Discovery) 시행착오로 시간과 토큰을 낭비한다. 환경 정보를 사전에 주입(Injection)하는 것이 훨씬 효과적이다.

### 점진적 공개 (Progressive Disclosure)

천 페이지 매뉴얼이 아니라, 에이전트가 필요할 때 찾아가는 계층적 문서 구조. AGENTS.md는 백과사전이 아니라 목차다.

### 아키텍처 엔트로피 (Architectural Entropy)

에이전트가 생성한 코드는 시간이 지나면서 구조적 일관성을 잃는 경향이 있다. 이를 방지하려면 기계적으로 강제되는 아키텍처 불변량과 주기적인 "가비지 컬렉션"이 필요하다.

### 비동기 피드백 루프 (Asynchronous Feedback Loop)

에이전트 처리량은 인간 주의력을 초과한다. 머지 게이트를 낮추고 피드백을 비동기로 만들면, "교정은 싸고 기다림은 비싸다"는 원칙이 작동한다.

### 표준화된 스택으로의 수렴 (Convergence to Standardized Stacks)

AI 친화적 개발을 위해, 자유로운 언어/프레임워크 선택보다는 **하네스가 잘 구축된 제한된 기술 스택**으로 개발 방식이 수렴할 가능성이 높다.

---

## 8. 비판적 시각: 우리가 놓치고 있는 것

Andrew Maynard는 "AI 하네스" 은유가 내포하는 문제적 전제를 지적한다:

### 통제 중심 위계 (Control-Oriented Hierarchy)
하네스 은유는 인간이 지시하고 AI가 실행하는 구조를 전제한다. "중요한 지능"은 전적으로 인간 쪽에 있고, AI는 능력만 제공할 뿐 이해나 판단은 없다는 가정.

### 변형 없는 능력 (Capability Without Transformation)
이 프레임워크는 사용자가 AI 상호작용에서 변하지 않은 채로 나와야 한다고 전제한다. 그러나 실제로는 AI-인간 관계가 양쪽 모두를 변화시킨다—변형은 최소화할 부작용이 아니라 상호작용의 본질이다.

### 도구적 프레이밍 (Instrumental Framing)
하네스 은유는 AI를 "그냥 도구"로 보는 관점을 강화한다. 그러나 발전된 기술은 인간의 목적이 형성되는 인지적 지형 자체를 재구성한다. 오늘 성급하게 선택한 언어적 프레이밍이 내일 AI에 대한 사고를 제한할 수 있다.

---

## 9. 열린 질문들

1. **하네스 엔지니어링이 "코드를 읽지 않는" 시대를 여는가?** OpenAI의 접근은 라인별 코드 리뷰 대신 스펙, 테스트, 정적 분석, 프로덕션 시그널에 의존한다. 이것이 안전한가, 아니면 보이지 않는 기술 부채를 축적하는가?

2. **하네스의 표준화는 가능한가?** 현재는 각 팀이 자체 하네스를 구축한다. `AGENTS.md`의 비공식 표준이 나타나고 있지만, 이것이 진짜 산업 표준으로 수렴할 수 있을까?

3. **하네스 엔지니어링 능력의 편차는 어떻게 해결하는가?** 토스가 지적한 문제: 같은 도구를 써도 하네스 설계 능력에 따라 생산성 차이가 극심하다. 코딩 능력 편차가 하네스 설계 능력 편차로 이동한 것뿐인가?

4. **에이전트 생성 코드 100만 줄의 장기 유지보수성은?** OpenAI의 실험은 5개월이다. 2년, 5년 후에도 이 코드베이스가 건강하게 유지될 수 있을까?

5. **하네스 은유 자체의 한계는?** 통제와 제약 중심의 프레이밍이 인간-AI 협업의 더 풍부한 가능성을 가리고 있지는 않은가?

---

## 10. 지금 시작할 수 있는 것

하네스 엔지니어링은 대규모 인프라 투자를 요구하지 않는다. 오늘 당장 할 수 있는 것:

1. **프로젝트에 `AGENTS.md` 만들기** — 에이전트가 지켜야 할 규칙, 사용 가능한 도구, 디렉터리 구조를 문서화
2. **에이전트 실수를 시스템으로 전환하기** — 같은 실수가 반복되면, 그때그때 고치지 말고 `AGENTS.md`에 규칙 추가 또는 검증 스크립트 작성
3. **자기 검증 루프 설계하기** — 에이전트가 "다 했어요"라고 말하기 전에 실제로 테스트를 돌리도록 강제
4. **문서를 "목차"로 설계하기** — 에이전트에게 모든 것을 한 번에 주지 말고, 필요한 정보를 찾아가는 구조 만들기
5. **Mitchell Hashimoto의 방법 따라 하기** — 직접 한 작업을 에이전트로 재현하면서, 에이전트가 어디서 실패하는지 관찰하고 하네스 개선

---

## Sources

- [OpenAI — "Harness engineering: leveraging Codex in an agent-first world" (2026.02.11)](https://openai.com/index/harness-engineering/)
- [Mitchell Hashimoto — "My AI Adoption Journey" (2026.02.05)](https://mitchellh.com/writing/my-ai-adoption-journey)
- [Anthropic — "Effective harnesses for long-running agents" (2025.11.26)](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Philipp Schmid — "The importance of Agent Harness in 2026" (2026.01.05)](https://www.philschmid.de/agent-harness-2026)
- [LangChain — "Improving Deep Agents with Harness Engineering"](https://blog.langchain.com/improving-deep-agents-with-harness-engineering/)
- [토스 테크 — "Software 3.0 시대, Harness를 통한 조직 생산성 저점 높이기" (2026.02.26)](https://toss.tech/article/harness-for-team-productivity)
- [Evangelos Pappas — "The Agent Harness Is the Architecture" (2026.02.24)](https://medium.com/@epappas/the-agent-harness-is-the-architecture-and-your-model-is-not-the-bottleneck-5ae5fd067bb2)
- [NxCode — "Harness Engineering: The Complete Guide" (2026.03.01)](https://www.nxcode.io/resources/news/harness-engineering-complete-guide-ai-agent-codex-2026)
- [Andrew Maynard — "What we miss when we talk about AI Harnesses"](https://www.futureofbeinghuman.com/p/what-we-miss-when-we-talk-about-ai-harnesses)
- [InfoQ — "OpenAI Introduces Harness Engineering" (2026.02)](https://www.infoq.com/news/2026/02/openai-harness-engineering-codex/)
- [Hugo Bowne-Anderson — "AI Agent Harness, 3 Principles for Context Engineering"](https://hugobowne.substack.com/p/ai-agent-harness-3-principles-for)
- [박상길 — LinkedIn: Harness Engineering 요약](https://kr.linkedin.com/posts/%EC%83%81%EA%B8%B8-%EB%B0%95-b6ab145a_harness-engineering-activity-7429678800633864192-toOh)
- [Codex AGENTS.md 공식 가이드](https://developers.openai.com/codex/guides/agents-md/)
- [Simon Willison — Mitchell Hashimoto 글 소개](https://simonwillison.net/2026/Feb/5/ai-adoption-journey/)
- [velog xxziiko — Harness engineering 번역](https://velog.io/@xxziiko/Harness-engineering-Codex%EB%A5%BC-%ED%99%9C%EC%9A%A9%ED%95%98%EB%8A%94-%EC%97%90%EC%9D%B4%EC%A0%84%ED%8A%B8-%EC%A4%91%EC%8B%AC-%EC%84%B8%EA%B3%84-%EB%B2%88%EC%97%AD)
