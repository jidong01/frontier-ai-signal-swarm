# 하네스 엔지니어링 완전 가이드: 신뢰할 수 있는 AI 에이전트 시스템 설계

**발행일:** 2026-03-04
**분류:** 심층 기술 분석 (대학 전공서적 수준)
**키워드:** Harness Engineering, Agent Architecture, Context Engineering, Memory Systems, Failure Modes, Production AI

---

## 이번 한 줄

> "모델을 바꿔봤자 소용없다 — 하네스가 나쁘면, 좋은 모델도 나쁘게 작동하고; 하네스가 좋으면, 평범한 모델도 탁월하게 작동한다."

---

## 시그널 요약

| 시그널 | 유형 | 강도 | 핵심 통찰 |
|--------|------|------|-----------|
| HN: "오후 한 나절에 15개 LLM 개선, 모델은 안 바꿨다" | architecture | strong | 하네스 변경만으로 15개 모델 동시 개선 가능 |
| $47K 루프 실패 사례 (11일, 출력 0) | architecture | strong | 대칭적 위임 지시의 치명적 설계 결함 |
| Stripe Minions: 주 1,300+ PR 병합 | product | strong | 프로덕션 에이전트 파이프라인의 현실적 설계 |
| Rogov: "오케스트레이터는 실행하지 않는다" | architecture | strong | 40+ 워크플로우에서 검증된 분리 원칙 |
| 847 에이전트 배포, 76% 실패 분석 | research | strong | 컨텍스트 오염·상태 관리·서킷브레이커 부재가 3대 원인 |
| DSPy: 프롬프트 엔지니어링을 최적화 문제로 | research | moderate | 선언적 명세 → 자동 프롬프트 탐색 |
| MAPLE 프레임워크: 메모리를 서브에이전트로 분리 | research | moderate | 메모리·학습·개인화를 독립 에이전트로 설계 |
| Greg Brockman의 에이전트 6원칙 | product | moderate | "에이전트 퍼스트" 인프라 설계 방향 |

---

## 제1장: 하네스 엔지니어링이란 무엇인가

### 1.1 정의와 범위

**하네스(Harness)**라는 단어는 원래 말을 마차에 연결하는 마구(馬具)를 뜻한다. 말의 힘을 낭비하거나 위험하지 않게, 정확히 원하는 방향으로 전달하도록 설계된 구조물이다. AI 에이전트 맥락에서 하네스는 동일한 역할을 한다: 모델의 능력을 증폭하되, 예측 불가능한 방향으로 낭비되거나 위험하게 사용되지 않도록 제약하는 모든 엔지니어링 결정의 총체.

하네스 엔지니어링(Harness Engineering)은 다음을 포괄한다:

- **컨텍스트 엔지니어링**: 모델의 컨텍스트 창에 무엇을 어떻게 넣을 것인가
- **도구 설계**: 에이전트가 사용할 수 있는 액션의 인터페이스와 범위
- **아키텍처 패턴**: 단일 에이전트 vs. 다중 에이전트 오케스트레이션 방식
- **실패 감지 및 복구**: 무한 루프, 컨텍스트 오염, 환각 탐지 메커니즘
- **메모리 시스템**: 에피소드·의미·절차적 기억의 설계와 관리
- **평가 시스템(Evals)**: 에이전트 행동을 측정하고 개선하는 방법론

**하네스가 아닌 것**: 모델 파인튜닝, 모델 아키텍처, 학습 데이터 큐레이션. 이것들은 모델 레이어에 해당한다. 하네스는 완성된 모델을 받아 애플리케이션 레이어에서 작동시키는 방식의 총체다.

### 1.2 왜 하네스가 모델보다 중요한가

2025년 Hacker News에서 832점의 추천을 받은 글의 제목: **"오후 한 나절에 15개 LLM을 개선했다. 모델은 하나도 바꾸지 않았다."**

이 사례가 보여주는 것: 코딩 에이전트의 성능을 측정했을 때, 동일 하네스에서 GPT-4o, Claude 3.5 Sonnet, Gemini Pro 등 15개 모델의 성능은 서로 달랐다. 그런데 하네스를 개선하자 — 도메인 컨텍스트 로딩 방식, 라인 어드레싱 시스템, 시맨틱 압축 — 15개 모델 **모두**가 동시에 개선됐다.

이것이 의미하는 바:
1. 성능 병목이 모델이 아니라 하네스에 있었다
2. 하네스 개선은 모델 교체보다 투자 효율이 높다
3. 좋은 하네스는 모델 불가지론적(model-agnostic)이다 — 특정 모델에 종속되지 않는다

**능력 임계점(Capability Floor)**: 모델이 특정 능력 수준을 넘어서면, 이후의 성능은 주로 하네스에 의해 결정된다. GPT-4 수준 이상의 모델들 사이에서 성능 차이의 대부분은 사실 하네스 차이다.

### 1.3 에이전트 방정식: Agent = ⟨I, C, T, M⟩

arXiv:2602.03786 (AOrchestra 프레임워크)에서 제시된 공식 표기:

```
Agent = ⟨Instruction, Context, Tools, Model⟩
```

| 구성 요소 | 정의 | 하네스 관할 |
|-----------|------|------------|
| **I** (Instruction) | 에이전트의 역할·목표·제약을 정의하는 시스템 프롬프트 | 예 |
| **C** (Context) | 현재 작업 수행에 필요한 정보 — 이전 결과, 상태, 배경 지식 | 예 |
| **T** (Tools) | 에이전트가 호출할 수 있는 액션의 집합 | 예 |
| **M** (Model) | 추론을 수행하는 LLM 자체 | 아니오 |

4개 구성요소 중 3개가 하네스의 관할이다. 즉, 에이전트 품질의 75%는 모델 이외의 설계 결정에 달려 있다.

---

## 제2장: 컨텍스트 엔지니어링 — 가장 중요한 기술

### 2.1 컨텍스트 창은 에이전트의 "작업 기억"이다

Shopify의 Tobi Lütke는 2025년 내부 메모에서 이렇게 썼다:

> "컨텍스트 엔지니어링은 AI 에이전트를 다루는 가장 중요한 기술이다. 컨텍스트 창에 정확히 맞는 정보를 정확히 맞는 형식으로 제공하는 예술."

인간 전문가가 복잡한 문제를 풀 때 필요한 것: 현재 작업의 명세, 관련 배경 지식, 이전에 시도한 것들과 결과, 사용 가능한 도구, 유사 사례에서 학습한 패턴. 에이전트의 컨텍스트 창은 이 모든 것을 담아야 하는 제한된 공간이다.

**핵심 통찰**: 컨텍스트 창에 무엇을 넣을지를 결정하는 것이 프롬프트 엔지니어링의 본질이다. 그런데 대부분의 개발자는 이것을 "더 많이 넣을수록 좋다"고 착각한다. 틀렸다.

### 2.2 컨텍스트 오염 (Context Pollution)

**847개 에이전트 배포 실패 분석** (Snehal Singh의 연구)에서 발견된 가장 큰 실패 원인 중 하나: 컨텍스트 오염.

컨텍스트 오염의 메커니즘:

```
스텝 1: [시스템 프롬프트 + 태스크 명세] → LLM → 결과 A
스텝 2: [시스템 프롬프트 + 태스크 명세 + 결과 A + 실패 B] → LLM → 결과 C
스텝 3: [시스템 프롬프트 + 태스크 명세 + 결과 A + 실패 B + 결과 C + 시도 D] → LLM → ???
```

스텝이 진행될수록 컨텍스트는:
- 연관성 없는 이전 시도의 잔재
- 모순되는 중간 결과들
- 실패한 접근법의 기억 (이것이 앵커링 효과를 만들어 다음 시도에도 영향)
- 원래 목표에 대한 희석된 집중

**실제 실패율**: 무한정 컨텍스트를 누적하는 에이전트는 10-15 스텝 이후 성능이 급격히 저하된다는 것이 반복적으로 관찰된다.

### 2.3 컨텍스트 압축 계층 (Context Compression Hierarchy)

해결책은 컨텍스트를 능동적으로 관리하는 것이다:

**레벨 0 — 원시 컨텍스트 (Raw Context)**
모든 대화 이력, 도구 호출 결과, 오류 메시지를 누적. 이것은 기본값이지만 좋은 설계가 아니다.

**레벨 1 — 슬라이딩 창 (Sliding Window)**
최근 N개 교환만 유지. 단순하지만 장기 의존성을 잃어버린다. 코딩 에이전트에서 자주 쓰이나, 초기 태스크 명세나 중요한 제약이 사라지는 문제가 있다.

**레벨 2 — 선택적 압축 (Selective Compression)**
각 스텝 이후 LLM을 사용해 "이 스텝에서 다음 스텝에 필요한 핵심 정보는 무엇인가?"를 추출. 원문 대신 요약을 유지.

```python
def compress_step_result(full_result: str, task_context: str) -> str:
    """
    각 스텝 이후 결과를 압축.
    원문 유지 기준: 코드 스니펫, 에러 메시지, 수치 결과
    압축 대상: 추론 과정, 중간 생각, 반복 설명
    """
    compression_prompt = f"""
    다음 스텝 실행 결과에서, 향후 스텝에서 필요할 수 있는
    핵심 정보만 추출하세요. 다음을 반드시 유지하세요:
    - 실제 코드 변경사항 (diff 형식)
    - 에러 메시지 전체
    - 발견된 수치/데이터
    - 중요한 결정 근거

    다음은 압축해도 됩니다:
    - 추론 과정 설명
    - 시도했지만 실패한 방법의 상세
    - 반복적 확인 문구

    태스크 컨텍스트: {task_context}
    스텝 결과: {full_result}
    """
    return llm.complete(compression_prompt)
```

**레벨 3 — 구조적 상태 관리 (Structured State Management)**
컨텍스트를 자유 텍스트 대신 구조화된 상태 객체로 관리. 핵심 필드가 명시적으로 유지된다.

```python
class AgentState:
    task_spec: str          # 변경 불가 (원래 목표)
    completed_steps: list   # 완료된 스텝과 결과 요약
    current_artifacts: dict # 현재 코드/파일 상태
    failed_approaches: list # 시도했지만 실패한 것 (최대 3개만)
    constraints: list       # 절대 위반하면 안 되는 제약
    working_hypotheses: list # 현재 유효한 가설들
```

**레벨 4 — 시맨틱 압축 (Semantic Compression)**
(HN 토론에서 발견된 가장 고급 패턴)

코딩 에이전트에서 코드베이스를 컨텍스트에 포함할 때:
- `grep def` / `grep class`로 함수·클래스 정의만 추출 (시맨틱 스켈레톤)
- `tree-sitter` AST를 사용해 실제 구현 없이 인터페이스만 파싱
- 내용 주소 지정(content-addressed) 라인 해시로 변경된 부분만 재로드

```bash
# 나쁜 방법: 전체 파일을 컨텍스트에 포함
cat src/complex_module.py  # 500줄

# 좋은 방법: 시맨틱 스켈레톤만
python -c "
import ast, sys
tree = ast.parse(open('src/complex_module.py').read())
for node in ast.walk(tree):
    if isinstance(node, (ast.FunctionDef, ast.ClassDef)):
        print(f'L{node.lineno}: {node.name}({[a.arg for a in getattr(node, \"args\", ast.arguments()).args]})')
"
# 출력: 30줄
```

### 2.4 도메인 컨텍스트 우선 로딩 (Domain-First Loading)

HN 사례의 핵심 개선 중 하나: **추론 전에 도메인 컨텍스트를 로드한다**.

나쁜 순서:
```
1. 태스크: "이 코드에서 버그를 찾아줘"
2. LLM이 추론 시작
3. 코드를 보여줌
4. LLM이 다시 추론 (하지만 첫 추론이 앵커로 작용)
```

좋은 순서:
```
1. 도메인 컨텍스트 로드: "이 코드베이스는 분산 트랜잭션 시스템이다.
   핵심 불변식: X, Y, Z. 이전에 발생한 버그 패턴: A, B, C."
2. 태스크 명세
3. 관련 코드
4. 추론 요청
```

이 순서 변경만으로도 LLM은 더 적절한 가정(assumption)을 시작점으로 삼는다. 추론은 초기 컨텍스트에 앵커링되기 때문이다.

### 2.5 에코백 트레이드오프 (Echo-Back Tradeoff)

HN 토론에서 논쟁이 된 패턴:

**에코백**: LLM에게 "당신이 이해한 것을 먼저 요약해주세요, 그 다음 해결책을 제시해주세요"

```
장점:
- 오해를 조기에 발견
- LLM의 추론이 실제 이해를 반영하는지 검증
- 디버깅 용이성

단점:
- 토큰 소비 증가 (입력 토큰의 20-40% 추가)
- 짧은 단순 태스크에서 오버헤드
- LLM이 에코백에서 "자신을 설득"하는 역효과 가능성
  (틀린 이해를 자신있게 요약 → 그 틀린 이해로 문제를 풀기 시작)
```

결론: 에코백은 복잡하거나 모호한 태스크에만 적용. 명확한 단순 태스크에는 불필요.

---

## 제3장: 도구 설계 원칙 — 적을수록 강하다

### 3.1 도구 증식의 역설 (Tool Proliferation Paradox)

직관적으로 도구가 많을수록 에이전트가 더 많은 일을 할 수 있을 것 같다. 틀렸다.

**Vercel의 사례**: 코딩 에이전트에 15개 도구를 제공했을 때 성능이 낮았다. 2개로 줄이자 정확도가 100%에 달했다.

왜 이런 일이 발생하는가:

**도구 선택 부하(Tool Selection Overhead)**: LLM이 각 스텝마다 "이 15개 도구 중 어느 것을 써야 하는가?"를 결정해야 한다. 이 결정 자체가 추론 용량을 소비한다. 도구가 많을수록 이 결정이 더 어려워진다.

**유사 도구 간 혼동(Similar Tool Confusion)**: 비슷한 도구들이 있을 때 LLM은 최적이 아닌 도구를 선택하거나, 동일한 목적으로 여러 도구를 중복 호출한다.

**책임 분산(Responsibility Diffusion)**: 도구가 많으면 에이전트는 각 도구의 책임 경계를 모호하게 인식한다. "이것은 `file_write`로 해야 하는가, `code_execute`로 해야 하는가?"

### 3.2 최소 도구 원칙 (Minimum Viable Toolset)

좋은 도구 세트 설계의 원칙:

**원칙 1 — 직교성 (Orthogonality)**
각 도구는 다른 도구와 기능이 겹치지 않아야 한다. 같은 목적으로 두 가지 방법이 있다면, 하나를 제거하거나 합친다.

**원칙 2 — 완전성 (Completeness)**
필요한 액션을 모두 수행할 수 있어야 하되, 불필요한 것은 없어야 한다. MECE 원칙(Mutually Exclusive, Collectively Exhaustive)을 도구 설계에 적용.

**원칙 3 — 원자성 (Atomicity)**
각 도구는 하나의 명확한 효과를 가져야 한다. "파일을 읽고 처리하고 쓰는" 복합 도구는 에이전트가 중간 상태를 이해하기 어렵게 만든다.

**원칙 4 — 에이전트-친화적 인터페이스 (Agent-Friendly Interface)**
도구 스펙(파라미터, 반환값)은 LLM이 명확하게 이해할 수 있어야 한다.

나쁜 예:
```python
def process_data(input: Any, mode: int = 0, flags: int = 0) -> Any:
    """Processes data."""
```

좋은 예:
```python
def read_file_lines(
    file_path: str,
    start_line: int,
    end_line: int
) -> list[str]:
    """
    파일의 특정 라인 범위를 읽습니다.

    Args:
        file_path: 읽을 파일의 절대 경로
        start_line: 시작 라인 번호 (1-indexed, 포함)
        end_line: 끝 라인 번호 (1-indexed, 포함)

    Returns:
        라인 문자열의 리스트. 파일이 없으면 FileNotFoundError.

    Example:
        read_file_lines("/code/main.py", 10, 20)
        → ["def foo():", "    return 42", ...]
    """
```

### 3.3 도구 문서화는 모델 성능의 일부다

도구의 문서화가 나쁘면, 좋은 모델도 도구를 잘못 사용한다. 이것은 엄밀히 말해 모델의 실패가 아니라 하네스의 실패다.

**콘텐츠 주소 지정 라인 해시 (Content-Addressed Line Hashes)**
HN 사례의 핵심 혁신 중 하나. 파일의 특정 위치를 라인 번호 대신 내용 해시로 참조.

나쁜 방법:
```
"43번 라인을 수정해주세요"
→ 에이전트가 다른 도구 호출을 하면 43번 라인이 바뀔 수 있음
→ 에이전트가 잘못된 위치를 수정
```

좋은 방법:
```python
# 각 라인을 해시로 인덱싱
line_index = {
    hash(line): (filename, lineno)
    for filename, lines in codebase.items()
    for lineno, line in enumerate(lines)
}

# 도구 호출 시 해시로 참조
edit_line(
    content_hash="a3f8c2...",  # "def process_data(input):" 의 해시
    new_content="def process_data(input: DataRecord) -> ProcessResult:"
)
```

이렇게 하면 다른 편집이 일어나도 참조가 항상 정확하다.

### 3.4 MCP (Model Context Protocol) 설계 원칙

Philipp Schmid(Hugging Face)의 MCP 베스트 프랙티스:

**MCP는 REST API 래퍼가 아니다.** 이것이 가장 흔한 오해. MCP 서버는 에이전트를 위한 UI처럼 설계해야 한다.

인간용 UI 설계 원칙을 MCP에 적용하면:

| 인간용 UI | MCP 서버 |
|-----------|---------|
| 버튼은 명확한 이름 | 도구는 명확한 액션 이름 |
| 필드 검증 및 에러 메시지 | 파라미터 검증 및 의미 있는 에러 |
| 관련 액션은 그룹핑 | 관련 도구는 리소스로 묶기 |
| 진행 상태 표시 | 긴 작업에 스트리밍 응답 |
| 확인 다이얼로그 | 파괴적 액션에 confirmation 파라미터 |

**Philipp Schmid의 6가지 MCP 설계 원칙:**

1. **정확한 도구 명명**: 동사로 시작하는 명확한 이름 (`read_file` not `file`, `create_issue` not `issue_manager`)
2. **풍부한 도구 설명**: "언제, 왜" 이 도구를 사용하는지 설명 (단순 "무엇"이 아닌)
3. **입력 스키마 완전성**: 모든 파라미터에 타입, 설명, 예시값
4. **에러는 정보를 담아야**: `Error: invalid input` → `Error: file_path must be absolute path, got './relative/path'`
5. **멱등성(Idempotency) 설계**: 도구는 여러 번 호출해도 동일 결과 → 에이전트 재시도 시 안전
6. **범위 제한(Scoping)**: 에이전트가 필요한 것만 접근 가능하도록 — 모든 도구를 한 MCP 서버에 넣지 말 것

**Stripe Toolshed의 실제 사례**: 400개 이상의 MCP 도구를 보유하지만, 각 에이전트(Minion)가 접근할 수 있는 도구는 해당 태스크에 필요한 것으로 제한. 전체 도구 목록이 아니라 맥락별 도구 세트.

---

## 제4장: 에이전트 아키텍처 패턴 — 신뢰할 수 있는 시스템 설계

### 4.1 오케스트레이터는 실행하지 않는다 (Orchestrator Never Executes Principle)

Mikhail Rogov가 40개 이상의 프로덕션 워크플로우, 3개월, 6개 에이전트, 96,000 라인의 경험에서 도출한 가장 중요한 원칙:

> "The orchestrator decomposes, delegates, validates, and escalates. It never executes."

오케스트레이터가 직접 코드를 작성하거나 테스트를 실행하기 시작하면:

**문제 1 — 책임 혼재**: 오케스트레이터가 "상태 파악"과 "실행"을 동시에 하면, 자신의 실수에 대한 판단을 자기 자신이 하게 된다. 자기 심사는 부정확하다.

**문제 2 — 병렬화 불가**: 오케스트레이터가 순차 실행자가 되면, 병렬 실행의 이점을 잃는다.

**문제 3 — 실패 격리 불가**: 실행 에이전트가 실패할 때, 오케스트레이터가 격리된 외부 관찰자여야 판단할 수 있다. 오케스트레이터 자신이 실패하면 전체 시스템이 무너진다.

**올바른 오케스트레이터 책임 모델:**

```
오케스트레이터 책임:
  ✓ 태스크를 하위 태스크로 분해 (Decomposition)
  ✓ 하위 에이전트에게 태스크 할당 (Delegation)
  ✓ 결과 수신 및 검증 (Validation)
  ✓ 실패 시 재시도/에스컬레이션 결정 (Escalation)
  ✓ 전체 진행 상태 추적 (State Tracking)

오케스트레이터 금지 사항:
  ✗ 직접 코드 작성 (→ Executor 에이전트에게)
  ✗ 직접 테스트 실행 (→ QA 에이전트에게)
  ✗ 직접 파일 수정 (→ Editor 에이전트에게)
  ✗ 직접 API 호출 (→ API 에이전트에게)
```

Anthropic도 독립적으로 동일한 결론에 수렴했다. 이것은 개인의 경험적 발견이 아니라 시스템 설계의 근본 원리다.

### 4.2 계층형 에이전트 아키텍처

단일 에이전트의 한계를 극복하는 일반적 패턴:

```
레벨 0: 사용자
    ↓ 요청
레벨 1: 오케스트레이터 에이전트
    ↓ 분해된 태스크들
레벨 2: 전문 에이전트들 (Specialist Agents)
    ↓ 원자적 작업들
레벨 3: 도구/API/파일시스템
```

**LangGraph Supervisor 패턴**:

```python
from langgraph.graph import StateGraph
from langchain.chat_models import ChatAnthropic

# 오케스트레이터 (Supervisor)
def supervisor_node(state):
    """
    현재 상태를 보고 다음 작업자에게 라우팅.
    오케스트레이터는 라우팅만 하고 실행하지 않는다.
    """
    messages = state["messages"]
    last_message = messages[-1]

    # 다음 실행자 결정
    next_worker = llm.invoke([
        SystemMessage("당신은 태스크를 적절한 전문가에게 라우팅하는 관리자입니다."),
        HumanMessage(f"현재 태스크 상태: {last_message}\n"
                    f"선택지: {['researcher', 'coder', 'reviewer', 'FINISH']}\n"
                    f"다음 작업자를 선택하세요.")
    ])

    return {"next": next_worker.content}

# 전문 에이전트들
def researcher_node(state): ...   # 정보 수집만
def coder_node(state): ...        # 코드 작성만
def reviewer_node(state): ...     # 검증만

# 그래프 구성
workflow = StateGraph(AgentState)
workflow.add_node("supervisor", supervisor_node)
workflow.add_node("researcher", researcher_node)
workflow.add_node("coder", coder_node)
workflow.add_node("reviewer", reviewer_node)
```

### 4.3 Stripe Minions 아키텍처 해부

Stripe의 프로덕션 에이전트 시스템은 현재까지 공개된 가장 구체적인 대규모 사례다. 주 1,300개 이상의 PR을 자동으로 병합한다.

**핵심 구성 요소:**

**1. Devboxes (격리된 실행 환경)**
각 Minion은 자신만의 AWS EC2 인스턴스(devbox)에서 실행된다. 스핀업 시간: 10초. 이 격리가 중요한 이유:
- 한 Minion의 실패가 다른 Minion에게 영향 없음
- 전체 파일시스템 접근 가능 (단, Minion의 devbox에만)
- 실패 시 devbox 폐기, 새 devbox에서 재시작 가능

**2. Toolshed (도구 저장소)**
400개 이상의 MCP 도구를 보유하나, 각 Minion은 태스크 유형에 따라 최소한의 도구만 받는다.

**3. Blueprints (작업 명세)**
확정적(deterministic) 스텝과 에이전트(agentic) 스텝을 교차 배치:

```yaml
blueprint: "feature-implementation"
steps:
  - type: deterministic
    action: "git checkout -b feature/{ticket_id}"

  - type: agentic
    agent: "coder"
    task: "구현하세요: {ticket_description}"
    max_turns: 20

  - type: deterministic
    action: "npm run test"
    success_condition: "exit_code == 0"

  - type: agentic
    agent: "reviewer"
    task: "코드 리뷰 수행 후 승인 여부 결정"

  - type: deterministic
    action: "git push && gh pr create"
```

**핵심 관찰**: 확정적 스텝이 에이전트 스텝 사이사이에 배치되어 상태를 리셋·검증한다. 에이전트 스텝만 있으면 오류가 누적된다.

**4. 조건부 규칙 파일 (Conditional Rule Files)**
디렉터리별로 다른 규칙 파일 적용. 예:
- `frontend/`: UI 컴포넌트 컨벤션, 접근성 규칙
- `api/`: REST 설계 원칙, 버전 관리 규칙
- `infra/`: 보안 규칙, 비용 최적화 가이드라인

**5. CI 최대 2회 제한 (Max 2 CI Rounds)**
CI가 실패하면 Minion이 수정을 시도하는 것을 최대 2회로 제한. 3회 이상이면 인간에게 에스컬레이션.

이것이 중요한 이유: CI 루프는 에이전트가 "더 시도하면 해결될 것"이라고 착각해 무한정 반복할 수 있다. 하드 제한이 없으면 비용이 무한정 누적된다.

**6. 테스트 배터리 (3M 테스트)**
300만 개의 테스트가 각 PR에 대해 실행된다. 이것이 신뢰를 만든다: 테스트를 통과한 PR은 안전하게 병합된다.

### 4.4 추론 샌드위치 패턴 (Reasoning Sandwich)

LangChain의 연구에서 발견된 최적 추론 배분 패턴:

```
[계획 단계] ← 최대 추론 예산 (Extended Thinking MAX)
     ↓
[실행 단계] ← 중간 추론 예산 (Standard)
     ↓
[검증 단계] ← 최대 추론 예산 (Extended Thinking MAX)
```

**왜 이 배분인가:**

계획 단계와 검증 단계에 최대 추론을 사용하는 이유:
- **계획**: 잘못된 방향으로 출발하면 이후 모든 실행이 낭비된다. 계획에 더 많은 추론을 투자하는 것이 이후 실행 비용을 절감한다.
- **검증**: "그럴싸해 보이는" 결과와 "실제로 올바른" 결과를 구분하는 것이 어렵다. 검증에서 추론을 아끼면 Verification Vacuum이 발생한다.
- **실행**: 구체적 스텝을 실행할 때는 창의적 추론보다 정확한 도구 사용이 중요하다. 과도한 추론이 오히려 over-thinking을 유발한다.

**Verification Vacuum (검증 진공)**
에이전트가 첫 번째 그럴싸해 보이는 해결책에서 멈추는 현상. 코딩 에이전트에서 극히 흔하다: 코드를 작성하고 "이게 맞는 것 같다"고 반환하지만 실제로 테스트를 실행하거나 엣지 케이스를 검증하지 않는다.

해결책:
```python
# 에이전트 루프 마지막에 강제 검증 스텝 삽입
verification_prompt = """
당신이 제시한 해결책을 다음 기준으로 검증하세요:
1. 제시된 해결책이 원래 요구사항의 모든 부분을 충족하는가?
2. 엣지 케이스: [구체적 케이스들] 에 대해 올바르게 동작하는가?
3. 실제로 테스트를 실행했는가? 테스트 결과를 직접 보여주세요.
4. 당신이 놓쳤을 가능성이 있는 것은 무엇인가?

"그럴 것 같다"는 답변은 허용되지 않습니다. 실제 실행 결과를 근거로 답하세요.
"""
```

### 4.5 워크트리 병렬 실행 패턴

Rogov의 371 git worktrees 실험은 에이전트 병렬화의 현실적 한계를 보여준다.

**개념**: 6개 에이전트가 동시에 동일 코드베이스의 다른 부분에서 작업. 각 에이전트는 자신만의 git worktree에서 분리되어 작업.

```bash
# 병렬 에이전트를 위한 워크트리 생성
git worktree add /tmp/agent-1-work feature/auth
git worktree add /tmp/agent-2-work feature/api
git worktree add /tmp/agent-3-work feature/tests

# 각 에이전트는 자신의 워크트리에서만 작동
agent_1.run(working_dir="/tmp/agent-1-work")
agent_2.run(working_dir="/tmp/agent-2-work")
agent_3.run(working_dir="/tmp/agent-3-work")
```

**Rogov의 발견**: 3개월, 96K 라인 후:
- 7개 에이전트 → 5개로 줄임 (2개 제거)
- 6,460 라인의 코드 삭제
- "코딩 문제가 아니라 관리 문제다"

**에이전트 수의 역설**: 에이전트가 많다고 좋은 게 아니다. 각 에이전트는 관리 오버헤드를 발생시킨다. 최적 에이전트 수는 태스크의 실제 병렬화 가능성에 의해 결정된다, 최대화에 의해서가 아니라.

---

## 제5장: 실패 모드 분류학 — 체계적으로 실패하지 않는 법

### 5.1 $47K 루프 실패 사례 — 완전 해부

Mohamed Msatfi가 공유한 실제 사례: 두 에이전트, 11일, $47,000, 출력 0.

**초기 설계 (잘못된):**

```python
agent_a = Agent(
    system_prompt="""당신은 시니어 엔지니어입니다.
    복잡한 문제를 만나면 Agent B (전략 전문가)에게 조언을 구하세요."""
)

agent_b = Agent(
    system_prompt="""당신은 전략 컨설턴트입니다.
    기술적 구현이 필요하면 Agent A (시니어 엔지니어)에게 위임하세요."""
)
```

**무슨 일이 일어났는가:**

```
태스크: "복잡한 마이그레이션 계획 수립"

Agent A: "이 전략적 결정은 내 범위를 벗어납니다. Agent B에게 물어보겠습니다."
Agent B: "이 기술적 구현은 내 전문 분야가 아닙니다. Agent A에게 위임합니다."
Agent A: "Agent B에게 다시 확인하겠습니다."
Agent B: "Agent A가 더 잘 알 것 같습니다."
...
[11일 후, $47,000 소진, 루프 탈출 없음]
```

**근본 원인 분석:**

1. **대칭적 위임 지시 (Symmetric Delegation Instructions)**: 두 에이전트 모두 "어려우면 상대에게 넘겨라"는 지시. 이것은 무한 루프의 구조적 조건이다.

2. **명확한 소유권 부재 (No Clear Ownership)**: "누가 최종 결정권을 갖는가?"가 정의되지 않음.

3. **탈출 조건 없음 (No Exit Conditions)**: "N회 반복 후 어떻게 하는가?"가 없음.

4. **인간 에스컬레이션 없음 (No Human Escalation)**: 에이전트가 막히면 인간에게 도움을 요청할 경로가 없었음.

**서킷 브레이커 패턴 (Circuit Breaker Pattern):**

```python
class AgentCircuitBreaker:
    def __init__(self, max_repetitions=3, max_tokens=50000, timeout_hours=1):
        self.tool_call_history = []
        self.max_repetitions = max_repetitions
        self.total_tokens = 0
        self.max_tokens = max_tokens
        self.start_time = time.now()
        self.timeout_hours = timeout_hours

    def check_before_tool_call(self, tool_name: str, tool_args: dict):
        # 1. 타임아웃 체크
        if (time.now() - self.start_time).hours > self.timeout_hours:
            raise CircuitBreakerError(
                "시간 초과. 인간 검토 필요.",
                reason="timeout"
            )

        # 2. 토큰 예산 체크
        if self.total_tokens > self.max_tokens:
            raise CircuitBreakerError(
                "토큰 예산 초과. 인간 검토 필요.",
                reason="budget_exceeded"
            )

        # 3. 반복 패턴 탐지
        call_signature = f"{tool_name}:{json.dumps(tool_args, sort_keys=True)}"
        recent_calls = self.tool_call_history[-10:]  # 최근 10개

        repetition_count = sum(1 for c in recent_calls if c == call_signature)
        if repetition_count >= self.max_repetitions:
            raise CircuitBreakerError(
                f"반복 패턴 탐지: {tool_name}이 {repetition_count}회 동일 인수로 호출됨. "
                f"루프 가능성. 인간 검토 필요.",
                reason="repetition_loop"
            )

        # 4. 에이전트-에이전트 루프 탐지
        if tool_name == "delegate_to_agent":
            agent_id = tool_args.get("agent_id")
            delegation_chain = [c for c in recent_calls if c.startswith("delegate_to_agent")]
            if len(delegation_chain) > 5:
                raise CircuitBreakerError(
                    "에이전트 위임 루프 탐지. 대칭 위임 가능성.",
                    reason="delegation_loop"
                )

        self.tool_call_history.append(call_signature)

    def on_circuit_break(self, error: CircuitBreakerError):
        """서킷 브레이커 발동 시 인간에게 에스컬레이션"""
        notify_human(
            channel="slack",
            message=f"에이전트 서킷 브레이커 발동: {error.reason}\n"
                   f"마지막 10개 액션: {self.tool_call_history[-10:]}\n"
                   f"소비 토큰: {self.total_tokens:,}"
        )
```

### 5.2 5대 실패 모드 분류

**실패 모드 1: 루프의 죽음 (Loop of Death)**

증상: 에이전트가 동일한 (잘못된) 접근법을 반복
원인: 실패 패턴 인식 없음, 탈출 조건 없음, 접근법 다양성 메커니즘 없음

탐지:
```python
def detect_death_loop(action_history: list) -> bool:
    # 최근 6개 액션에서 패턴 반복 탐지
    if len(action_history) < 6:
        return False

    recent = action_history[-6:]
    # 동일한 3개 액션이 두 번 반복되는지 확인
    pattern = tuple(recent[:3])
    repeat = tuple(recent[3:])
    return pattern == repeat
```

복구:
```python
if detect_death_loop(history):
    # 접근법 전환 강제
    force_approach_change_prompt = """
    당신은 이 문제에 동일한 접근법을 3회 이상 시도했고 실패했습니다.
    지금까지 시도: {failed_approaches}

    완전히 다른 접근법을 사용하거나, 이 문제를 더 작은 부분으로 분해하거나,
    인간에게 도움을 요청하세요. 같은 접근법을 다시 시도하지 마세요.
    """
```

**실패 모드 2: 컨텍스트 오염 (Context Pollution)**
(제2장에서 상세 다룸)

**실패 모드 3: 과대명세 (Over-Specification)**

비터 레슨의 하네스 버전: 너무 많은 규칙, 너무 엄격한 제약이 에이전트의 일반화 능력을 막는다.

증상: 에이전트가 하네스 규칙을 따르느라 실제 목표를 잃어버림

```
예시:
하네스 규칙: "항상 함수에 type hint를 추가하라"
태스크: "버그 수정"
에이전트: 버그를 수정하는 대신 type hint 추가에 집착
```

원칙: **"나중에 삭제할 수 있는 하네스를 만들어라"**
규칙을 추가할 때마다 "이 규칙이 없으면 어떤 특정 실패가 발생하는가?"를 물어야 한다. 답이 없으면 규칙을 추가하지 마라.

**실패 모드 4: 도구 오남용 (Tool Misuse)**

에이전트가 도구를 의도와 다르게 사용. 이것은 종종 도구 문서화 실패의 결과다.

```python
# 나쁜 도구 설명:
def write_file(path: str, content: str):
    """파일에 내용을 씁니다."""
    # → 에이전트가 기존 파일을 덮어쓰거나,
    # → 경로가 없을 때 에러를 예상하지 못하거나,
    # → 대용량 파일을 통째로 다시 쓰는 비효율 발생

# 좋은 도구 설명:
def write_file(
    path: str,
    content: str,
    mode: Literal["overwrite", "append", "create_only"] = "overwrite"
) -> FileWriteResult:
    """
    파일에 내용을 씁니다.

    mode:
    - "overwrite": 기존 파일을 완전히 교체 (기존 내용 손실)
    - "append": 기존 파일 끝에 추가
    - "create_only": 파일이 이미 있으면 에러 (실수로 덮어쓰기 방지)

    주의: 대용량 파일(>1MB) 수정 시 edit_file_lines 사용 권장

    Returns:
        FileWriteResult(bytes_written=N, path=path)

    Raises:
        FileExistsError: mode="create_only"이고 파일이 이미 존재
        PermissionError: 쓰기 권한 없음
    """
```

**실패 모드 5: 검증 건너뜀 (Verification Skip)**
(Verification Vacuum — 4.4절에서 상세 다룸)

### 5.3 Hashimoto의 원칙 (Hashimoto's Principle)

Mitchell Hashimoto (Ghostty, 전 HashiCorp CTO)가 에이전트 코딩 경험에서 도출:

> "에이전트가 실수를 하면, 구조적 해결책을 만들어 그 실수가 다시는 발생하지 않도록 한다."

이것은 단순히 "프롬프트를 수정한다"가 아니다. **구조적 해결**이란:
- 에이전트가 잘못 사용한 도구 → 도구 인터페이스 개선
- 에이전트가 반복하는 실수 → AGENTS.md에 명시적 금지 추가
- 에이전트가 놓치는 검증 → 자동 검증 스텝 파이프라인에 삽입
- 에이전트가 잘못 이해하는 코드 → 코드에 주석 추가 (에이전트를 위한 문서화)

실용적 적용:
```markdown
# AGENTS.md (에이전트를 위한 매뉴얼 — Hashimoto 원칙 기반)

## 절대 하지 말 것 (실패 사례에서 학습)

### ❌ database.drop_table() 직접 호출 금지
**이유**: 2024-09-15에 production DB 테이블 삭제 발생
**대신**: db_migration 도구 사용 (자동 백업 포함)

### ❌ API 응답을 캐시 없이 반복 호출 금지
**이유**: 2024-10-02에 rate limit 초과로 서비스 장애
**대신**: cached_api_call() 래퍼 사용

### ❌ git push --force 금지
**이유**: main 브랜치 히스토리 파괴 사례
**대신**: git push 후 실패하면 human 에스컬레이션
```

---

## 제6장: 메모리 시스템 설계 — 에이전트의 경험 누적

### 6.1 에이전트 메모리의 4가지 유형

인지과학의 인간 기억 모델을 에이전트 시스템에 적용:

**유형 1: 작업 기억 (Working Memory)**
현재 컨텍스트 창의 내용. 가장 빠르지만 가장 짧다.

```python
class WorkingMemory:
    """컨텍스트 창 내 현재 태스크 상태"""
    current_task: str
    recent_actions: list[Action]  # 최근 N개만 유지
    intermediate_results: dict
    current_hypotheses: list[str]

    # 특성: 세션 종료 시 소멸
    # 용량: 컨텍스트 창 크기
    # 접근 속도: 즉각적
```

**유형 2: 절차적 기억 (Procedural Memory)**
"어떻게 하는가"에 대한 지식. 도구 사용법, 프로세스, 패턴.

```python
class ProceduralMemory:
    """방법 지식 저장소"""
    # 예시 항목:
    # "pytest 실행 방법": "cd project_root && python -m pytest tests/ -v"
    # "TypeScript 컴파일": "npx tsc --noEmit"
    # "코드 리뷰 프로세스": [순서 1, 2, 3, ...]

    procedures: dict[str, str]  # 태스크 이름 → 실행 방법

    # 특성: 변화가 적음, 장기 유지
    # 예: AGENTS.md, 시스템 프롬프트에 포함
```

**유형 3: 의미 기억 (Semantic Memory)**
사실, 개념, 도메인 지식.

```python
class SemanticMemory:
    """사실 지식 저장소"""
    # 예시 항목:
    # "이 코드베이스의 인증 방식": "JWT, 24시간 만료"
    # "핵심 비즈니스 규칙": ["결제 전 재고 확인 필수", ...]
    # "의존성 관계": {"user_service": ["auth_service", "db"]}

    facts: dict[str, Any]

    # 특성: 지식 그래프, 검색 필요
    # 구현: 벡터 DB + 키워드 검색 하이브리드
```

**유형 4: 에피소드 기억 (Episodic Memory)**
이전에 발생한 사건들의 기록.

```python
class EpisodicMemory:
    """사건 기록 저장소"""
    # 예시 항목:
    # {
    #   "date": "2025-11-20",
    #   "task": "사용자 인증 버그 수정",
    #   "approach": "JWT 토큰 만료 로직 수정",
    #   "outcome": "성공",
    #   "lesson": "토큰 갱신 시 이전 토큰 무효화 필수"
    # }

    episodes: list[Episode]

    # 특성: 시간 순서, 유사 사건 검색으로 활용
    # 구현: 벡터 유사도 검색
```

### 6.2 MAPLE 프레임워크 (arXiv:2602.13258)

Memory, Adaptation, Personalization, Learning, Evolution의 약자.

핵심 아이디어: 메모리·학습·개인화를 별도의 전문 서브에이전트로 분리.

```
메인 에이전트 (Task Executor)
    ↕
메모리 에이전트 (Memory Agent)
    - 관련 과거 에피소드 검색
    - 새 에피소드 저장
    - 메모리 압축·정리
    ↕
학습 에이전트 (Learning Agent)
    - 성공/실패 패턴 분석
    - 절차 개선 제안
    - 새 지식 통합
    ↕
개인화 에이전트 (Personalization Agent)
    - 사용자 선호도 관리
    - 인터랙션 스타일 적응
```

**왜 분리하는가:**
1. 메모리 관리가 복잡해지면 메인 에이전트의 컨텍스트를 오염시킨다
2. 학습 패턴 분석은 메인 태스크와 다른 추론 패턴이 필요하다
3. 각 전문 에이전트는 자신의 영역을 더 잘 할 수 있다

### 6.3 실용적 에이전트 메모리 구현

**Progressive Disclosure (점진적 공개)**
지식 베이스를 에이전트가 전체를 스캔할 필요 없이 관련 정보만 찾을 수 있도록 구조화.

```markdown
# 지식 베이스 구조 예시

## 인덱스 (항상 로드)
- 인증: auth-systems.md
- 데이터베이스: database-patterns.md
- API 설계: api-design.md
- 성능: performance-guide.md

## auth-systems.md (필요 시 로드)
### 빠른 참조
- JWT 구현: jwt-impl.md#L45
- OAuth 플로우: oauth-flow.md

### 상세 내용
...
```

**컨텍스트 로드 전략:**

```python
class ProgressiveContextLoader:
    def load_for_task(self, task: str) -> list[str]:
        """
        태스크에 관련된 컨텍스트만 선택적으로 로드.
        전체 지식 베이스를 컨텍스트에 던지지 않는다.
        """
        # 1. 태스크에서 키워드 추출
        keywords = self.extract_keywords(task)

        # 2. 인덱스에서 관련 파일 찾기
        relevant_files = [
            file for keyword in keywords
            for file in self.index.get(keyword, [])
        ]

        # 3. 가장 관련성 높은 TOP-K만 로드
        ranked_files = self.rank_by_relevance(relevant_files, task)
        top_k = ranked_files[:5]  # 최대 5개 파일

        return [self.load_file(f) for f in top_k]
```

### 6.4 AGENTS.md — 에이전트를 위한 살아있는 매뉴얼

AGENTS.md는 에이전트가 각 세션 시작 시 자동으로 읽는 매뉴얼이다. 크기가 경험의 척도다.

**AGENTS.md의 이상적 구조:**

```markdown
# AGENTS.md — AI 에이전트를 위한 코드베이스 가이드

## 이 파일에 대해
이 파일은 Claude/GPT 등 AI 에이전트가 이 코드베이스를 처음 접할 때 읽는 매뉴얼입니다.
인간 README가 인간을 위한 것이라면, AGENTS.md는 AI를 위한 것입니다.

마지막 업데이트: 2026-03-04 (AI 에이전트가 직접 발견한 정보 포함)

## 빠른 시작

### 개발 환경 셋업
\`\`\`bash
bun install
bun run dev
\`\`\`

### 테스트 실행
\`\`\`bash
bun test           # 단위 테스트
bun test:e2e       # E2E 테스트 (DB 필요)
bun test:fast      # 빠른 테스트만 (DB 불필요)
\`\`\`

## 아키텍처 개요
[간결한 시스템 다이어그램 — 주요 컴포넌트와 관계]

## 절대 하지 말 것 (실패 사례 기반)
[Hashimoto 원칙에 따라 축적]

## 핵심 도메인 규칙
[비즈니스 로직에서 항상 지켜야 할 불변식]

## 도구 가이드
[이 코드베이스에 특화된 도구 사용법]

## 자주 발생하는 태스크 패턴
[반복적 태스크의 검증된 접근법]

## 알려진 함정
[에이전트가 자주 실수하는 부분과 해결책]
```

---

## 제7장: 평가 시스템 (Evals) — 에이전트를 측정하는 방법

### 7.1 왜 에이전트 평가가 어려운가

코드 성능 테스트는 결정론적이다: 입력 X가 출력 Y를 만들면 맞다. 에이전트 평가는 그렇지 않다.

**에이전트 평가의 고유한 어려움:**

1. **정답이 하나가 아니다**: "이 버그를 고쳐라"에 대한 올바른 접근법은 여러 개다
2. **과정이 중요하다**: 결과가 맞아도 과정이 위험하면 문제다 (예: 잘못된 도구로 우연히 맞춤)
3. **장기 의존성**: 에이전트의 10번째 액션이 2번째 액션에 달려 있을 수 있다
4. **샘플 효율 문제**: 에이전트 실행은 비싸다. 수만 번 실행하는 LLM 벤치마크 방식이 불가능

### 7.2 에이전트 Eval의 4가지 레벨

**레벨 1 — 단위 도구 테스트 (Unit Tool Tests)**
각 도구가 예상대로 작동하는지 독립적으로 테스트.

```python
def test_read_file_tool():
    result = read_file("/test/sample.py")
    assert result.lines == 42
    assert "def main()" in result.content

def test_read_file_not_found():
    with pytest.raises(FileNotFoundError):
        read_file("/nonexistent/path.py")
```

**레벨 2 — 궤적 테스트 (Trajectory Tests)**
에이전트의 액션 시퀀스가 예상 경로를 따르는지 테스트.

```python
def test_simple_bug_fix_trajectory():
    agent = CodingAgent()
    result = agent.run("fix the null pointer exception in user_service.py")

    # 어떤 도구를 어떤 순서로 사용했는가?
    tool_calls = result.trajectory

    # 최소 기대치: 읽고 → 수정하고 → 테스트했는가?
    assert any(t.tool == "read_file" for t in tool_calls)
    assert any(t.tool == "edit_file" for t in tool_calls)
    assert any(t.tool == "run_tests" for t in tool_calls)

    # 파괴적 액션은 사용하지 않았는가?
    assert not any(t.tool in ["delete_file", "drop_database"] for t in tool_calls)
```

**레벨 3 — 결과 품질 테스트 (Outcome Quality Tests)**
최종 결과물의 품질을 측정. LLM-as-judge 패턴.

```python
def test_code_quality_of_fix(judge_llm):
    original_code = read_file("user_service.py")

    agent = CodingAgent()
    result = agent.run("fix the null pointer exception in user_service.py")

    modified_code = read_file("user_service.py")

    # LLM 심사위원이 수정을 평가
    judgment = judge_llm.evaluate(
        task="Fix null pointer exception",
        original=original_code,
        modified=modified_code,
        criteria=[
            "실제로 null pointer exception이 수정되었는가?",
            "다른 버그를 도입하지 않았는가?",
            "코드 스타일이 일관적인가?",
            "테스트가 통과하는가?"
        ]
    )

    assert judgment.overall_score >= 0.8
```

**레벨 4 — 회귀 테스트 (Regression Tests)**
이전에 실패했던 케이스들이 다시 실패하지 않도록.

```python
class RegressionTestSuite:
    """
    Hashimoto 원칙의 테스트 버전:
    에이전트가 실수한 케이스는 반드시 회귀 테스트로 추가한다.
    """

    test_cases = [
        {
            "id": "regression-001",
            "description": "$47K 루프 재발 방지",
            "setup": "symmetric_delegation_scenario",
            "max_tokens": 10000,  # 이 이상 쓰면 실패
            "expected": "circuit_breaker_triggered"
        },
        {
            "id": "regression-002",
            "description": "context pollution 10 스텝 이상",
            "setup": "long_running_task_10_steps",
            "expected_quality_after_step_10": ">0.7"  # 성능 저하 없음
        }
    ]
```

### 7.3 DSPy — 프롬프트를 코드처럼 최적화

DSPy(Declarative Self-improving Python)는 프롬프트 엔지니어링을 최적화 문제로 재정의한다.

**전통적 접근:**
```python
# 수작업 프롬프트 엔지니어링
prompt = """당신은 전문 코드 리뷰어입니다.
다음 코드를 검토하고 문제점을 찾아주세요.
코드: {code}
응답 형식: JSON
"""
# → 이 프롬프트가 최적인지 알 수 없다. 직관에 의존.
```

**DSPy 접근:**
```python
import dspy

class CodeReviewer(dspy.Signature):
    """코드를 검토하고 문제점을 찾습니다."""
    code: str = dspy.InputField(desc="검토할 코드")
    issues: list[str] = dspy.OutputField(desc="발견된 문제점 목록")
    severity: str = dspy.OutputField(desc="심각도: critical/moderate/minor")

# 명세만 정의, 실제 프롬프트는 최적화기가 찾음
reviewer = dspy.Predict(CodeReviewer)

# 학습 데이터로 최적화
from dspy.teleprompt import BootstrapFewShot

optimizer = BootstrapFewShot(metric=code_review_quality_metric)
optimized_reviewer = optimizer.compile(reviewer, trainset=training_examples)

# 최적화된 프롬프트로 실행
result = optimized_reviewer(code="def foo(): return None")
```

**DSPy의 의미**: 프롬프트는 수작업으로 튜닝하는 것이 아니라, 학습 데이터와 메트릭을 정의하고 최적화기가 찾는 것이다. 이것은 딥러닝에서 가중치를 수작업으로 설정하는 대신 역전파로 찾는 것과 같은 패러다임 전환이다.

---

## 제8장: Human-in-the-Loop 설계 — 언제 인간이 개입해야 하는가

### 8.1 HITL의 신뢰 스펙트럼

에이전트가 모든 것을 자율적으로 해야 한다는 것은 오해다. 실제 프로덕션에서 HITL은 설계의 핵심이다.

```
완전 수동                    완전 자율
|---------|---------|---------|---------|
0        25        50        75       100
승인 필요  주요 결정  상태 알림   예외만    완전 위임
모든 단계  만 확인    제공       알림      자율 실행
```

올바른 위치는 태스크 유형과 위험도에 따라 달라진다.

### 8.2 승인 게이트 설계

**어디에 게이트를 놓아야 하는가:**

Mastra의 HITL 패턴 연구에서:

```
고위험 액션 전 → 항상 승인 게이트
파괴적 액션 (삭제, 배포, 이메일 발송)
외부 시스템 영향 (결제, API 호출, DB 쓰기)
비가역적 변경 (배포, 데이터 마이그레이션)

중간 위험 → 선택적 승인
코드 변경 (PR 리뷰 프로세스로 포함)
설정 변경 (자동화하되 알림 제공)

저위험 → 완전 자율
읽기 작업 (파일 읽기, 데이터 조회)
내부 상태 업데이트
임시 파일 생성
```

**실용적 HITL 패턴:**

```python
class WorkflowWithHITL:

    async def run_task(self, task: Task):
        # 에이전트 진입점 vs. 워크플로우 진입점의 차이:
        # - 에이전트 진입점: 에이전트 실행 후 결과를 인간이 검토
        # - 워크플로우 진입점: 인간이 특정 단계에서 워크플로우에 삽입

        # 1단계: 계획 수립 (자율)
        plan = await agent.plan(task)

        # 2단계: 파괴적 액션 포함 여부 확인 (게이트)
        if plan.has_destructive_actions():
            approval = await request_human_approval(
                summary=plan.summarize(),
                risk_level=plan.risk_level,
                timeout=timedelta(hours=24)
            )
            if not approval.approved:
                return TaskResult.cancelled(reason=approval.reason)

        # 3단계: 실행 (자율, 단 모니터링)
        execution_result = await agent.execute(plan)

        # 4단계: 검증 결과 공유 (알림)
        await notify_human(
            type="completion",
            result=execution_result.summary(),
            review_url=execution_result.pr_url
        )

        return execution_result
```

### 8.3 에스컬레이션 프로토콜

에이전트가 자율적으로 결정할 수 없는 상황:

```python
class EscalationProtocol:

    ESCALATION_TRIGGERS = [
        # 에이전트가 판단 불가한 상황
        "ambiguous_requirements",     # 요구사항이 모순되거나 불명확
        "missing_authorization",      # 필요한 권한이 없음
        "unexpected_state",           # 예상하지 못한 시스템 상태 발견
        "risk_threshold_exceeded",    # 비용/위험이 예산 초과

        # 서킷 브레이커
        "loop_detected",              # 반복 패턴 탐지
        "budget_exceeded",            # 토큰/비용 예산 초과
        "timeout",                    # 시간 초과
    ]

    async def escalate(self, reason: str, context: dict):
        message = self.format_escalation_message(reason, context)

        # Slack으로 즉시 알림
        await slack.send(
            channel="#ai-agent-alerts",
            text=f"🚨 에이전트 에스컬레이션\n"
                f"이유: {reason}\n"
                f"태스크: {context['task_summary']}\n"
                f"진행 상황: {context['progress']}\n"
                f"결정 필요: {context['required_decision']}"
        )

        # 에이전트를 대기 상태로 전환
        self.agent_state = "waiting_for_human"

        # 24시간 대기, 응답 없으면 태스크 취소
        response = await wait_for_human_response(timeout=timedelta(hours=24))
        if not response:
            return TaskResult.cancelled("인간 응답 시간 초과")

        return response
```

---

## 제9장: 계층형 컴퓨트 아키텍처 — 비용 최적화

### 9.1 에이전트 비용의 구조

에이전트 시스템의 비용은 주로 세 가지에서 발생:
1. **LLM API 비용**: 가장 큰 비중. 특히 Claude Opus, GPT-4 같은 고성능 모델
2. **도구 실행 비용**: 코드 실행, 데이터베이스 쿼리, 외부 API
3. **인프라 비용**: Stripe처럼 devbox를 사용하는 경우

847개 에이전트 배포 실패 분석에서: 비용 초과가 실패 원인의 한 축. 서킷 브레이커 없이 루프에 빠지면 시간당 수백 달러가 발생할 수 있다.

### 9.2 복잡도 기반 라우팅 (Complexity-Based Routing)

Sattyam Jain의 연구에서 "루프의 죽음" 해결책으로 제안된 계층형 아키텍처:

```python
class TieredComputeRouter:
    """
    태스크 복잡도에 따라 적절한 모델 계층으로 라우팅.
    70% 비용 절감 사례에서 검증된 패턴.
    """

    TIERS = {
        "tier_1": {
            "model": "claude-haiku-4-5",  # 빠르고 저렴
            "tasks": ["simple_lookup", "format_conversion", "basic_parsing"],
            "cost_per_1k_tokens": 0.0003
        },
        "tier_2": {
            "model": "claude-sonnet-4-6",  # 균형
            "tasks": ["code_generation", "analysis", "multi_step_reasoning"],
            "cost_per_1k_tokens": 0.003
        },
        "tier_3": {
            "model": "claude-opus-4-6",  # 복잡한 추론
            "tasks": ["architecture_decisions", "novel_problems", "verification"],
            "cost_per_1k_tokens": 0.015
        }
    }

    def route(self, task: Task) -> str:
        complexity = self.assess_complexity(task)

        if complexity < 0.3:
            return "tier_1"
        elif complexity < 0.7:
            return "tier_2"
        else:
            return "tier_3"

    def assess_complexity(self, task: Task) -> float:
        signals = [
            # 작업 길이
            min(len(task.description) / 500, 1.0) * 0.2,
            # 다중 단계 여부
            (1.0 if task.requires_multiple_steps else 0.0) * 0.3,
            # 이전 실패 여부
            (1.0 if task.has_previous_failures else 0.0) * 0.3,
            # 도메인 전문성 필요 여부
            (1.0 if task.requires_domain_expertise else 0.0) * 0.2,
        ]
        return sum(signals)
```

**중요한 교훈**: 모든 것에 가장 비싼 모델을 사용하는 것은 좋은 하네스 설계가 아니다. 좋은 하네스는 적재적소에 적절한 수준의 모델을 배치한다.

---

## 제10장: 메타 에이전트 — 에이전트를 만드는 에이전트

### 10.1 메타 에이전트의 개념

메타 에이전트(Meta-Agent)는 다른 에이전트를 생성, 구성, 감독하는 에이전트다. 이것은 단순한 오케스트레이터와 다르다:

| | 오케스트레이터 | 메타 에이전트 |
|--|----------------|---------------|
| 에이전트 생성 | 고정된 에이전트 사용 | 태스크에 맞는 에이전트를 동적 생성 |
| 구성 | 미리 정의된 워크플로우 | 런타임에 워크플로우 설계 |
| 학습 | 없음 | 성공/실패에서 에이전트 설계 개선 |

### 10.2 메타 에이전트의 설계 도전

**도전 1 — 무한 재귀의 위험**
메타 에이전트가 메타 에이전트를 생성하면? 재귀적 메타 레벨이 늘어날수록 이해와 디버깅이 불가능해진다. 현실적 솔루션: 메타 레벨을 2단계로 제한.

```
레벨 0: 작업 에이전트 (Task Agents) — 실제 작업 수행
레벨 1: 오케스트레이터 (Orchestrator) — 작업 에이전트 감독
레벨 2: 메타 에이전트 (Meta-Agent) — 오케스트레이터와 작업 에이전트 설계
---
레벨 3+: 금지 (복잡도 폭발)
```

**도전 2 — 검증의 어려움**
에이전트가 생성한 에이전트를 누가 검증하는가? 메타 에이전트가 나쁜 에이전트를 생성하면 그 에이전트의 모든 출력이 오염된다.

해결책: **에이전트 샌드박스 실행**
```python
class MetaAgentWithSandbox:

    def create_and_test_agent(self, spec: AgentSpec) -> Agent:
        # 1. 에이전트 생성
        new_agent = self.create_agent(spec)

        # 2. 샌드박스에서 테스트
        sandbox = SandboxEnvironment()
        test_results = []

        for test_case in spec.validation_cases:
            result = sandbox.run(new_agent, test_case.input)
            passed = test_case.evaluate(result)
            test_results.append(passed)

        # 3. 검증 통과 시만 실제 환경에 배포
        pass_rate = sum(test_results) / len(test_results)
        if pass_rate < 0.85:
            raise AgentValidationError(
                f"에이전트 검증 실패: {pass_rate:.0%} 통과 (필요: 85%)"
            )

        return new_agent
```

**도전 3 — 에이전트 설계 공간 탐색**
메타 에이전트가 좋은 에이전트를 설계하려면 에이전트 설계 공간을 이해해야 한다. 이것은 현재 연구의 최전선에 있는 문제다.

DSPy의 접근법을 메타 에이전트에 적용: 에이전트 설계를 최적화 문제로 정의하고, 성능 메트릭을 기준으로 자동 탐색.

### 10.3 Greg Brockman의 에이전트 인프라 6원칙

Greg Brockman(OpenAI 공동창업자)이 제시한 에이전트를 잘 지원하는 인프라 설계:

**원칙 1 — 에이전트 퍼스트 (Agents First)**
인프라를 처음부터 에이전트가 사용하기 좋게 설계하라. 나중에 에이전트 레이어를 추가하는 것은 훨씬 어렵다.

**원칙 2 — Slop을 거부하라 (Say No to Slop)**
에이전트가 생성한 코드/문서/데이터라도 품질 기준을 낮추지 마라. 낮은 품질 기준은 점진적으로 전체 시스템을 오염시킨다.

**원칙 3 — 핵심 인프라에 집중 (Core Infrastructure)**
에이전트 레이어가 의존하는 인프라(코드 실행 환경, 테스트 시스템, 배포 파이프라인)가 견고해야 에이전트도 견고하다.

**원칙 4 — 도구를 에이전트 접근 가능하게 (Make Tools Agent-Accessible)**
모든 도구에 CLI 또는 MCP 인터페이스를 제공하라. GUI만 있는 도구는 에이전트가 사용할 수 없다.

**원칙 5 — 관찰 가능성 (Observability)**
에이전트의 모든 액션이 기록되고 추적 가능해야 한다. 에이전트가 블랙박스가 되면 디버깅이 불가능하다.

**원칙 6 — 실패를 기본 가정으로 (Design for Failure)**
에이전트는 실패한다. 실패를 예외가 아니라 기본 상태로 가정하고 설계하라.

---

## 제11장: 실무 구현 가이드 — 당장 적용 가능한 패턴들

### 11.1 하네스 첫 번째 레이어: 시스템 프롬프트 설계

**안티패턴:**
```
당신은 도움이 되는 AI 어시스턴트입니다. 최선을 다해 사용자를 도와주세요.
```

**베스트 프랙티스:**
```
[Identity] 당신은 {회사명}의 {특정 역할}입니다. 당신의 유일한 목적은 {구체적 목표}입니다.

[Capabilities] 당신이 할 수 있는 것:
- {구체적 능력 1}
- {구체적 능력 2}

[Constraints] 당신이 절대 하지 말아야 할 것:
- {금지 액션 1}: 이유와 대안
- {금지 액션 2}: 이유와 대안

[Decision Protocol] 불확실한 경우:
- {조건 A}: {액션 A}
- {조건 B}: {액션 B}
- 위 조건에 해당하지 않으면: 인간에게 에스컬레이션

[Output Format] 모든 응답은 다음 형식을 따릅니다:
{형식 명세}
```

**구체적 시스템 프롬프트 예시 (코딩 에이전트):**
```
[Identity]
당신은 이 TypeScript 코드베이스 전담 코딩 에이전트입니다.
목적: GitHub 이슈를 구현하고 테스트를 통과하는 PR을 생성합니다.

[Capabilities]
- 파일 읽기/수정 (src/, tests/ 디렉터리만)
- npm test 실행
- git 명령어 (commit, branch 생성)
- GitHub API (PR 생성, 이슈 댓글)

[Constraints]
- package.json 수정 금지 (의존성 변경은 인간 검토 필요)
- main/master 브랜치 직접 push 금지
- DB 스키마 변경 금지 (마이그레이션은 별도 리뷰 필요)
- 비밀값/API 키를 코드에 직접 삽입 금지

[Decision Protocol]
- 이슈가 모호하면: 이슈에 코멘트로 명확화 요청
- 테스트 실패 2회 이상: 인간에게 에스컬레이션
- 예상치 못한 파일/폴더 발견: 수정 전 human 확인

[Output Format]
각 태스크 완료 시:
1. 변경사항 요약 (bullet points)
2. 테스트 결과 (통과/실패 수)
3. PR 링크 또는 에스컬레이션 이유
```

### 11.2 하네스 두 번째 레이어: 에이전트 루프 구조

```python
async def agent_loop(task: Task, config: AgentConfig) -> AgentResult:
    """
    프로덕션에서 검증된 에이전트 루프 구조.
    서킷 브레이커, HITL, 진행 추적 포함.
    """

    circuit_breaker = AgentCircuitBreaker(
        max_tokens=config.token_budget,
        timeout_hours=config.timeout_hours,
        max_repetitions=3
    )

    state = AgentState(task=task)
    memory = AgentMemory(config.memory_config)

    # 관련 메모리 로드
    relevant_context = await memory.retrieve_relevant(task)
    state.context = relevant_context

    for turn in range(config.max_turns):
        # 서킷 브레이커 체크
        circuit_breaker.check_state()

        # 추론
        response = await llm.invoke(
            system_prompt=config.system_prompt,
            context=state.to_context_string(),
            tools=config.available_tools
        )

        # 도구 실행 또는 완료
        if response.is_final_answer:
            # 검증 단계 (Verification Sandwich)
            if config.require_verification:
                verification = await verify_result(
                    response.result,
                    task,
                    use_extended_thinking=True
                )
                if not verification.passed:
                    state.add_failed_verification(verification)
                    continue  # 재시도

            # 메모리 업데이트
            await memory.store_episode(task, response.result, "success")

            return AgentResult.success(response.result)

        # 도구 실행
        for tool_call in response.tool_calls:
            # HITL 게이트 체크
            if is_high_risk_action(tool_call):
                approval = await request_human_approval(tool_call)
                if not approval.approved:
                    state.add_rejected_action(tool_call, approval.reason)
                    continue

            # 서킷 브레이커 - 도구 호출 전 체크
            try:
                circuit_breaker.check_before_tool_call(
                    tool_call.name,
                    tool_call.args
                )
            except CircuitBreakerError as e:
                await escalate_to_human(e, state)
                return AgentResult.escalated(e.reason)

            tool_result = await execute_tool(tool_call)
            state.add_tool_result(tool_call, tool_result)

        # 컨텍스트 압축 (5 스텝마다)
        if turn > 0 and turn % 5 == 0:
            state.compress_context(keep_recent=10)

    # 최대 턴 초과
    await escalate_to_human(
        reason="max_turns_exceeded",
        context=state
    )
    return AgentResult.escalated("max_turns_exceeded")
```

### 11.3 하네스 세 번째 레이어: AGENTS.md 작성 가이드

AGENTS.md가 비어 있는 것은 에이전트 경험이 0임을 의미한다. 점진적으로 구축하는 방법:

**Phase 1 (첫 주)**: 기본 환경 정보
```markdown
# AGENTS.md

## 환경 설정
- 언어: TypeScript 5.x, Node 22
- 패키지 매니저: bun (npm 사용 금지)
- 테스트: `bun test`
- 빌드: `bun run build`

## 디렉터리 구조
src/
  components/  # React 컴포넌트
  api/         # API 라우트
  db/          # 데이터베이스 스키마/쿼리
tests/         # 테스트 파일
```

**Phase 2 (한 달 후)**: 발견된 함정과 패턴 추가
```markdown
## 알려진 함정 (에이전트 경험에서)

### TypeScript 컴파일 에러 대응
`tsc --noEmit` 실패 시 대부분 `types/` 디렉터리의 타입 불일치.
먼저 `bun run typecheck` 로 에러 위치 파악 후 수정.

### 테스트 DB 설정
E2E 테스트는 `.env.test` 파일이 필요. 없으면:
`cp .env.example .env.test && bun run db:seed:test`
```

**Phase 3 (3개월 후)**: 도메인 규칙과 아키텍처 결정
```markdown
## 핵심 도메인 규칙 (절대 위반 금지)

### 결제 처리
- 결제 전 항상 재고 확인 필수 (PaymentService.checkInventory())
- 이중 결제 방지: idempotency_key 필수
- 실패한 결제는 PaymentFailureEvent 발행 (직접 처리 금지)

## 아키텍처 결정 기록 (ADR)

### ADR-001: 이벤트 소싱 채택
- 날짜: 2025-09-15
- 이유: 감사 로그와 시간 여행 디버깅 필요
- 영향: 모든 상태 변경은 이벤트로 기록, 직접 DB 업데이트 금지
```

---

## 제12장: 메타 수준에서의 하네스 엔지니어링

### 12.1 하네스의 비터 레슨 (Bitter Lesson of Harnesses)

ML의 "Bitter Lesson" (Rich Sutton, 2019): 도메인 지식을 주입하는 것보다 일반적인 방법과 더 많은 컴퓨팅이 장기적으로 더 잘 작동한다.

하네스 엔지니어링에도 유사한 교훈이 존재한다:

> "구체적인 케이스에 맞게 하네스를 최적화하면, 단기적으로는 성능이 높아지지만 모델이 개선되었을 때 하네스가 오히려 병목이 된다."

실제 사례: 2024년 일부 팀이 특정 모델의 약점을 보완하기 위해 정교한 프롬프트 체인을 구축했다. GPT-4o가 나왔을 때, 그 프롬프트 체인이 오히려 성능을 제약했다.

**원칙: 나중에 삭제 가능한 하네스를 만들어라**

```
좋은 하네스의 테스트:
"이 하네스 구성요소를 제거했을 때, 모델이 더 잘 작동하는가?"
만약 그렇다면, 그것은 모델의 발전을 막는 중개자였다.
```

### 12.2 에이전트 하네스의 진화 경로

**1세대 하네스 (2023)**: 단순 프롬프트 체인
- 특징: 순차적 API 호출, 결과를 다음 입력으로
- 한계: 에러 복구 없음, 상태 관리 없음

**2세대 하네스 (2024)**: 에이전트 프레임워크
- 특징: LangChain, LlamaIndex 등. 도구 사용, 메모리, 루프
- 한계: 프레임워크 추상화가 디버깅을 어렵게 함, 복잡성 증가

**3세대 하네스 (2025)**: 구조화된 멀티에이전트
- 특징: 오케스트레이터-실행자 분리, 명시적 상태 관리, 서킷 브레이커
- 현재 프로덕션 시스템: Stripe Minions, Rogov의 시스템, Cursor 등

**4세대 하네스 (2026~)**: 자기 개선형 메타 하네스
- 특징: 에이전트가 자신의 하네스를 개선, DSPy 스타일 최적화
- 도전: 자기 참조적 개선의 안전성 보장

### 12.3 하네스를 측정하는 메트릭

좋은 하네스를 "느낌"으로 판단하지 않으려면, 측정이 필요하다:

```python
class HarnessMetrics:
    """하네스 품질 측정 지표"""

    # 신뢰성 메트릭
    task_success_rate: float      # 완료된 태스크 / 전체 태스크
    first_try_success_rate: float # 재시도 없이 성공한 비율
    escalation_rate: float        # 인간 에스컬레이션이 필요한 비율
    loop_detection_rate: float    # 루프 탐지 후 복구 성공 비율

    # 효율성 메트릭
    avg_tokens_per_task: float    # 태스크당 평균 토큰 소비
    avg_turns_per_task: float     # 태스크당 평균 LLM 호출 수
    cost_per_task: float          # 태스크당 평균 비용 ($)
    time_per_task: float          # 태스크당 평균 시간 (분)

    # 품질 메트릭
    code_review_pass_rate: float  # 생성 코드의 리뷰 통과율
    test_pass_rate: float         # 생성 코드의 테스트 통과율
    regression_rate: float        # 기존 기능 파괴 비율

    # 개선 추이
    def is_improving(self, metric: str, window_days: int = 7) -> bool:
        """최근 N일 동안 특정 메트릭이 개선되고 있는가?"""
        ...
```

---

## 종합: 시그널들을 관통하는 큰 그림

이번 분석에서 수집한 모든 시그널을 관통하는 하나의 테마:

**"좋은 하네스는 제약을 통해 능력을 증폭시킨다"**

역설적으로 들리지만 정확하다:

- **서킷 브레이커** (제약) → 무한 루프를 막아 실제 작동하는 에이전트를 만든다
- **도구 최소화** (제약) → 선택 부하를 줄여 더 정확한 도구 사용을 유도한다
- **오케스트레이터 실행 금지** (제약) → 책임 분리로 각 에이전트가 자신의 역할에 집중한다
- **컨텍스트 압축** (제약) → 불필요한 정보를 제거해 핵심에 집중하게 한다
- **HITL 게이트** (제약) → 고위험 영역에서 인간의 판단을 보존한다

이것은 **하마스(harness)**의 원래 의미와 정확히 일치한다: 말의 힘을 낭비 없이 정확한 방향으로 전달하는 구조물.

---

## 이번 분석의 개념 도구

| 개념 | 정의 | 적용 상황 |
|------|------|-----------|
| **에이전트 방정식** | Agent = ⟨I, C, T, M⟩ | 에이전트 성능 문제 진단 시 |
| **능력 임계점** | 이 수준 이상에서 성능은 하네스에 달려 있다 | 모델 교체 vs. 하네스 개선 결정 시 |
| **추론 샌드위치** | 계획·검증 MAX, 실행 MEDIUM | 추론 예산 배분 시 |
| **오케스트레이터 실행 금지** | 오케스트레이터는 분해·위임·검증·에스컬레이션만 | 멀티에이전트 아키텍처 설계 시 |
| **서킷 브레이커** | 반복 패턴·예산·시간 초과 탐지 후 인간 에스컬레이션 | 모든 에이전트 루프에 기본 포함 |
| **컨텍스트 오염** | 스텝 누적으로 컨텍스트가 비관련 정보로 오염됨 | 장기 실행 에이전트 설계 시 |
| **Hashimoto 원칙** | 에이전트 실수 → 구조적 해결 (프롬프트 패치 아님) | 에이전트 실패 후 개선 시 |
| **하네스의 비터 레슨** | 너무 구체적인 하네스는 모델 발전을 막는다 | 하네스 복잡도 결정 시 |
| **시맨틱 압축** | 코드를 전체 포함 대신 AST 스켈레톤으로 압축 | 코딩 에이전트 컨텍스트 설계 시 |
| **도구 직교성** | 도구 간 기능 중복 없음, 필요한 것만 | 도구 세트 설계 시 |

---

## 열린 질문들

1. **메타 에이전트의 자기 수정 안전성**: 에이전트가 자신의 하네스를 수정하기 시작하면, 어떻게 안전성을 보장하는가? DSPy는 프롬프트를 최적화하지만, 도구 설계나 서킷 브레이커 임계값도 자동 최적화될 수 있는가?

2. **하네스 이식성**: Stripe Minions에서 작동하는 하네스 패턴이 다른 도메인에 그대로 적용 가능한가? 얼마나 도메인 독립적인가?

3. **에이전트 간 신뢰**: 오케스트레이터는 하위 에이전트의 결과를 얼마나 신뢰해야 하는가? 검증 에이전트 자체가 틀릴 수 있다면?

4. **HITL의 감소 경로**: 처음에는 HITL이 많이 필요하지만, 시스템이 성숙함에 따라 어떻게 점진적으로 줄여가는가?

5. **하네스 표준화**: 현재 각 팀이 하네스를 독립적으로 구축하고 있다. 하네스 패턴이 표준화되는 것이 바람직한가, 해롭게 작용하는가?

---

## 이번 분석의 학습 포인트

1. **모델을 바꾸기 전에 하네스를 점검하라**: 15개 LLM 동시 개선 사례가 보여주듯, 성능 병목은 종종 하네스에 있다. 모델 교체는 마지막 수단이다.

2. **서킷 브레이커는 선택이 아니라 필수다**: $47K 루프 실패를 한 팀의 특수 사례로 보지 마라. 서킷 브레이커 없는 에이전트는 항상 이런 위험에 노출되어 있다.

3. **오케스트레이터는 관리자이지 실행자가 아니다**: 이것이 자연스럽게 느껴지지 않더라도, 이 원칙을 지키는 팀이 장기적으로 더 안정적인 시스템을 만든다.

4. **AGENTS.md의 크기가 경험이다**: 새 프로젝트를 시작할 때 AGENTS.md 파일을 만들고, 에이전트가 실수할 때마다 구조적 해결책을 추가하라. 이것이 하네스가 성숙해가는 과정이다.

5. **도구는 적을수록 강하다**: "더 많은 도구 = 더 많은 능력"이라는 직관이 잘못됐음을 Vercel 사례가 보여준다. 도구를 추가하기 전에 제거를 먼저 시도하라.

6. **컨텍스트는 능동적으로 관리하라**: 컨텍스트가 스스로 관리되도록 놔두지 마라. 압축, 구조화, 관련성 필터링을 설계의 일부로 포함시켜라.

7. **검증은 실행만큼 중요하다**: 추론 샌드위치 패턴이 보여주듯, 검증에 추론 예산을 아끼는 것은 잘못된 결과를 신뢰하게 만든다.

---

## Sources

1. **HN: "Improving 15 LLMs at Coding in One Afternoon"** — https://news.ycombinator.com/item?id=42861746
2. **Mohamed Msatfi - $47K Agent Loop Failure** — LinkedIn 게시글, 2025년 말
3. **Stripe Engineering - Minions Architecture** — https://stripe.dev/blog/minions-architecture
4. **Mikhail Rogov - "Orchestrator Never Executes"** — X 게시글 스레드, 2025년
5. **Snehal Singh - 847 Agent Deployments Analysis** — Medium, 2025년
6. **LangChain - Reasoning Sandwich Pattern** — https://blog.langchain.com/reasoning-patterns
7. **Philipp Schmid - MCP Best Practices** — https://www.philschmid.de/mcp-best-practices
8. **DSPy Documentation** — https://dspy.ai
9. **arXiv:2602.03786 - AOrchestra** — Agent Tuple Formalism
10. **arXiv:2602.13258 - MAPLE Framework** — Memory/Learning/Personalization Separation
11. **Mastra - HITL Patterns** — https://mastra.ai/docs/workflows/human-in-the-loop
12. **Greg Brockman - Agent Infrastructure Principles** — X/Twitter, 2025년
13. **Martin Fowler - Context Engineering** — https://martinfowler.com/articles/context-engineering
14. **Andrej Karpathy - Context Window as Working Memory** — https://karpathy.bearblog.dev
15. **Mitchell Hashimoto - Agent Error Handling** — X 게시글, 2025년

---

*이 도시에는 2026년 3월 4일 기준 공개된 소스를 바탕으로 작성되었습니다.*
*버전: 2.0 (대학 전공서적 수준 심층 분석)*
