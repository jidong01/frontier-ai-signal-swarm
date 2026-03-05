# frontier-ai-signal-swarm — Architecture Guide

> AI Trend Intelligence Engine for frontier AI signal detection and analysis

---

## Quick Reference

| Property | Value |
|----------|-------|
| Language | TypeScript (strict mode) |
| Runtime | Node 22+, ESM (`"type": "module"`) |
| Package Manager | npm |
| Build Tool | `tsc` → `dist/` |
| Primary Entry (local mode) | `src/local.ts` |
| Primary Entry (API mode) | `src/index.ts` |
| Demo Entry | `src/run-demo.ts` |
| TypeScript Config | `tsconfig.json` — target ES2022, moduleResolution bundler |
| Key Dependencies | `@anthropic-ai/sdk`, `dayjs`, `express`, `tsx`, `uuid` |
| Output Directory | `output/` — generated dossiers (`.md`, `.json`, `.html`) |
| Data Directory | `data/` — memory store, curator data, signal history |

### NPM Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `npm run build` | `tsc` | Compile TypeScript to `dist/` |
| `npm start` | `tsx src/index.ts` | Start API-mode CLI |
| `npm run collect` | `tsx src/index.ts collect` | Run collector (API mode) |
| `npm run analyze` | `tsx src/index.ts analyze` | Run analyzer (API mode) |
| `npm run dossier` | `tsx src/index.ts dossier` | Generate dossier (API mode) |
| `npm run pipeline` | `tsx src/index.ts pipeline` | Full pipeline (API mode) |

### Local Pipeline Subcommands (no API key needed)

```bash
npx tsx src/local.ts from-file <events.json>        # Process pre-analyzed events → dossiers
npx tsx src/local.ts to-html <input.md> [out.html]  # Convert markdown dossier to HTML
npx tsx src/local.ts memory                          # Show signal memory statistics
npx tsx src/local.ts curator-serve                   # Start curator workspace server (port 3847)
npx tsx src/local.ts curator-collect                 # Show collection guidance
```

---

## Directory Structure

```
/Users/jidonghwan/frontier-ai-signal-swarm/
├── src/
│   ├── index.ts                  # CLI entry point (API/Anthropic SDK mode)
│   ├── local.ts                  # CLI entry point (local/Claude Code mode)
│   ├── run-demo.ts               # Demo runner with sample data
│   ├── types/
│   │   ├── signal.ts             # All domain type definitions
│   │   └── index.ts              # Re-exports from signal.ts
│   ├── config/
│   │   └── sources.ts            # AI_SOURCES array: SourceConfig definitions for collectors
│   ├── collectors/
│   │   ├── web-collector.ts      # WebCollector: constructs RawSource objects
│   │   └── index.ts              # Re-exports WebCollector
│   ├── detectors/
│   │   ├── signal-detector.ts    # SignalDetector: classifies signals from RawSources
│   │   └── index.ts              # Re-exports SignalDetector
│   ├── analyzers/
│   │   ├── technical-analyst.ts  # TechnicalAnalyst: API-mode technical perspective
│   │   ├── strategic-analyst.ts  # StrategicAnalyst: API-mode implications perspective
│   │   ├── skeptical-analyst.ts  # SkepticalAnalyst: API-mode skeptical perspective
│   │   └── index.ts              # Re-exports all three analysts
│   ├── synthesis/
│   │   ├── cross-signal.ts       # CrossSignalAnalyzer: pattern detection across events
│   │   └── index.ts              # Re-exports CrossSignalAnalyzer
│   ├── dossier/
│   │   ├── dossier-generator.ts  # DossierGenerator: builds TrendDossier + saves MD/JSON/HTML
│   │   ├── html-template.ts      # wrapMarkdownInHTML(): self-contained HTML renderer
│   │   └── index.ts              # Re-exports DossierGenerator and wrapMarkdownInHTML
│   ├── memory/
│   │   ├── signal-memory.ts      # SignalMemory: persistent store for signals and patterns
│   │   └── index.ts              # Re-exports SignalMemory
│   ├── pipeline/
│   │   ├── pipeline.ts           # Pipeline: API-based full pipeline orchestrator
│   │   ├── local-pipeline.ts     # LocalPipeline: Claude Code mode orchestrator
│   │   └── index.ts              # Re-exports
│   ├── curator/
│   │   ├── server.ts             # Express server on port 3847 (curator workspace)
│   │   ├── curator-memory.ts     # CuratorMemory: memos, sources, dossier index CRUD
│   │   ├── feed-manager.ts       # FeedManager: feed items CRUD with dedup
│   │   ├── collector.ts          # curatorCollect(): collection guidance for Claude Code
│   │   ├── types.ts              # Curator-specific types (FeedItem, Memo, SourceProfile, etc.)
│   │   └── public/               # Static SPA frontend for curator workspace
│   │       ├── index.html        # Main feed dashboard
│   │       ├── dossiers.html     # Dossier browser
│   │       ├── memos.html        # Memo management
│   │       ├── sources.html      # Source management
│   │       ├── app.js            # Frontend JS (vanilla)
│   │       └── style.css         # Curator UI styles
│   └── utils/                    # (Reserved — currently empty)
├── output/                       # Generated dossiers (MD + JSON + HTML)
│   └── dossier-YYYY-MM-DD.{md,json,html}
├── data/
│   ├── memory/
│   │   ├── signal-memory.json    # Persistent signal memory store
│   │   └── analyzed-topics.json  # Topics analyzed this session (dedup key)
│   ├── curator/
│   │   ├── memos.json            # Curator memos
│   │   ├── sources.json          # Source profiles with trust scores
│   │   ├── profile.json          # Curator preferences and learned patterns
│   │   └── dossier-index.json    # Dossier metadata + feed item linkage
│   └── signals/                  # Raw signal data
├── CLAUDE.md                     # System prompt / operational instructions
├── AGENTS.md                     # This file
├── package.json
├── tsconfig.json
└── .claude/
    └── settings.local.json       # Claude Code permissions and MCP config
```

---

## Module Map

### `types/` — Domain Type System

**File:** `src/types/signal.ts`

The single source of truth for all domain types. Everything else imports from here.

| Type | Description |
|------|-------------|
| `SignalType` | Union: `research`, `infrastructure`, `product`, `capital`, `regulation`, `architecture`, `api`, `opensource`, `ecosystem`, `talent` |
| `SignalStrength` | Union: `noise`, `weak`, `moderate`, `strong`, `critical` |
| `ChangeType` | Union: `continuation`, `acceleration`, `disruption`, `emergence`, `convergence` |
| `ImpactCategory` | Union: `technology`, `market`, `ecosystem`, `industry_spillover`, `geopolitical` |
| `RawSource` | Raw collected source with URL, content, type, origin, timestamps |
| `DetectedSignal` | Classified signal: is_structural, is_directional, strength, type, relevance reason |
| `AnalysisPerspective` | One analyst's output: perspective type, analysis text, key_points, confidence, pattern |
| `TrendEvent` | A signal with all 3 analyses, consensus/divergence points, open questions |
| `CrossSignalPattern` | Recurring cross-event pattern with evidence and occurrence count |
| `TrendDossier` | Final output combining event + interpretations + patterns |
| `SignalMemoryEntry` | Stored signal record with themes and related signal IDs |
| `SignalMemoryStore` | Full memory store: entries, patterns, recurring_themes |

---

### `config/` — Source Configuration

**File:** `src/config/sources.ts`

Exports `AI_SOURCES: SourceConfig[]` — the canonical list of search query configurations used by the collector. Each entry has:
- `name`: human-readable source name
- `type`: one of the `RawSource.source_type` values
- `search_queries`: array of time-anchored search strings (e.g., `"OpenAI announcement 2026"`)
- `origin`: identifier string (e.g., `"arxiv"`, `"company_announcements"`)

Current source categories: AI Company Announcements, AI Research Papers, Model Releases, API Changes, AI Investment News, AI Tech Blogs, Developer Community, Open Source Updates.

---

### `collectors/` — Source Collection

**File:** `src/collectors/web-collector.ts` → class `WebCollector`

Constructs `RawSource` objects from raw text input. In API mode it runs WebSearch queries from `AI_SOURCES`. In local (Claude Code) mode, Claude Code performs the actual web collection and calls `collectFromText()` directly.

Key method:
- `collectFromText(title, content, url, sourceType, origin): RawSource` — used by `LocalPipeline.createSource()`

---

### `detectors/` — Signal Detection

**File:** `src/detectors/signal-detector.ts` → class `SignalDetector`

Classifies a `RawSource` into a `DetectedSignal`. Determines:
- `is_structural` / `is_directional`
- `change_domain` (technical / market / both)
- `event_nature` (experimental / strategic / incremental / transformative)
- `signal_strength` (noise → critical)
- `signal_type`
- `ai_relevance_reason`
- `impact_categories`

In local mode, signal detection is performed by Claude Code following the rules in `CLAUDE.md` Step 2, then fed into `LocalPipeline.createSignal()`.

---

### `analyzers/` — Multi-Perspective Analysis (API Mode)

Three specialized analysts that call the Anthropic SDK directly. Each returns an `AnalysisPerspective`.

| File | Class | Perspective | Focus |
|------|-------|-------------|-------|
| `technical-analyst.ts` | `TechnicalAnalyst` | `'technical'` | Pattern classification, architecture implications, scaling, research direction |
| `strategic-analyst.ts` | `StrategicAnalyst` | `'strategic'` | Implications, historical context, practitioner impact, structural vs surface change |
| `skeptical-analyst.ts` | `SkepticalAnalyst` | `'skeptical'` | Hype detection, omissions, alternative interpretations, honest uncertainty |

Default model: `claude-sonnet-4-20250514`. All three are launched in parallel in the API pipeline.

In **local mode**, Claude Code performs all three analyses manually (following CLAUDE.md Step 3) and feeds results via `LocalPipeline.createAnalysis()`.

---

### `synthesis/` — Cross-Signal Pattern Detection

**File:** `src/synthesis/cross-signal.ts` → class `CrossSignalAnalyzer`

Accepts multiple `TrendEvent` objects and identifies `CrossSignalPattern` instances:
- Pattern types: `recurring`, `simultaneous`, `ecosystem_shift`, `scaling_direction`, `infra_concentration`
- Each pattern tracks `connected_event_ids`, `evidence`, `occurrence_count`

---

### `dossier/` — Output Generation

**File:** `src/dossier/dossier-generator.ts` → class `DossierGenerator`

Takes a `TrendEvent` + optional `CrossSignalPattern[]` and produces a `TrendDossier`. Saves three output formats simultaneously:

| Format | Path pattern | Description |
|--------|-------------|-------------|
| Markdown | `output/dossier-{id}.md` | Human-readable narrative |
| JSON | `output/dossier-{id}.json` | Structured data for downstream use |
| HTML | `output/dossier-{id}.html` | Self-contained, print-optimized, no external deps |

**File:** `src/dossier/html-template.ts`

Exports `wrapMarkdownInHTML(markdown, title, date): string`. Used by:
1. `DossierGenerator.formatAsHTML()` — automatic HTML generation in pipeline
2. `npx tsx src/local.ts to-html <input.md>` — manual conversion of existing MD files

Date-based naming convention for manually generated dossiers: `dossier-YYYY-MM-DD.{md,html}` (e.g., `dossier-2026-03-02.md`).

---

### `memory/` — Signal Memory

**File:** `src/memory/signal-memory.ts` → class `SignalMemory`

Persistent JSON store at `data/memory/signal-memory.json`. Provides deduplication across analysis sessions.

Key methods:
- `load()` — reads from disk, starts fresh if not found
- `save()` — writes updated store to disk
- `remember(event)` — stores a `TrendEvent`, extracts themes, finds related signals
- `rememberPatterns(patterns)` — merges or creates cross-signal patterns
- `findRelated(entry)` — returns up to 10 related signal IDs by type + theme overlap
- `getRecurringThemes(minCount)` — returns themes appearing ≥ minCount times
- `getLongTermTrendCandidates()` — patterns with occurrence_count ≥ 2
- `getStats()` — total_signals, total_patterns, unique_themes, top_themes

Theme extraction scans consensus_points for technical keywords: `scaling`, `architecture`, `training`, `inference`, `open source`, `multimodal`, `reasoning`, `agents`, `alignment`, `safety`, `compute`, `gpu`, `transformer`, `benchmark`, `api`, `investment`, etc.

**Analyzed Topics Memory** (manual): `data/memory/analyzed-topics.json` — updated by Claude Code after each analysis session to prevent topic repetition across sessions. Schema:
```json
{
  "topics": [
    {
      "topic": "string",
      "analyzed_at": "YYYY-MM-DD",
      "deep_dive": true,
      "key_points": ["..."],
      "sources_used": ["url1"]
    }
  ]
}
```

---

### `pipeline/` — Orchestration

**File:** `src/pipeline/pipeline.ts` → class `Pipeline`

API-based full pipeline: collect → detect → analyze (parallel 3-agent) → synthesize → generate dossier → update memory.

**File:** `src/pipeline/local-pipeline.ts` → class `LocalPipeline`

Local pipeline designed for Claude Code orchestration (no Anthropic API key needed). Claude Code acts as the analysis engine.

Constructor: `new LocalPipeline(outputDir = './output', dataDir = './data/memory')`

Factory methods (all return typed domain objects):
- `createSource(title, content, url, sourceType, origin): RawSource`
- `createSignal(source, detection): DetectedSignal`
- `createAnalysis(perspective, analysis, key_points, confidence, pattern?): AnalysisPerspective`
- `createEvent(signal, analyses, consensus, divergence, questions): TrendEvent`
- `createPattern(type, description, eventIds, evidence): CrossSignalPattern`

Pipeline execution:
- `runFromEvents(events, patterns?): Promise<TrendDossier[]>` — full run: load memory → generate dossiers → update memory → print summary
- `loadEventsFromFile(filePath): Promise<TrendEvent[]>` — parse a pre-saved `events.json`
- `saveEventsToFile(events, filePath): Promise<void>`

---

### `curator/` — Curator Workspace

A self-contained web application for reviewing collected sources, creating memos, and browsing generated dossiers.

**Server:** `src/curator/server.ts`
- Express server on port **3847**
- Serves static frontend from `src/curator/public/`
- Serves generated dossiers from `output/` at `/output/*`
- Start: `npx tsx src/local.ts curator-serve`

**REST API endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/feed` | List feed items (filter: status, found_by, item_type, limit, offset) |
| `POST` | `/api/feed` | Add a feed item (url, title, summary) |
| `PATCH` | `/api/feed/:id` | Update feed item status |
| `GET` | `/api/memos` | List memos |
| `POST` | `/api/memos` | Create a memo |
| `PATCH` | `/api/memos/:id` | Update a memo |
| `GET` | `/api/sources` | List source profiles |
| `POST` | `/api/sources` | Add a source profile |
| `PATCH` | `/api/sources/:id` | Update source status/note |
| `GET` | `/api/profile` | Curator profile (interests, learned patterns) |
| `GET` | `/api/stats` | Dashboard stats (feed + memory) |
| `GET` | `/api/dossiers` | List dossiers with feed linkage metadata |
| `POST` | `/api/dossiers` | Register a generated dossier + auto-link feed items |
| `PATCH` | `/api/dossiers/:id/link` | Link feed items or memos to a dossier |
| `POST` | `/api/dossiers/:id/ingest` | Split dossier into individual signal/deep-dive feed items |

**Data layer classes:**

- `CuratorMemory` (`curator-memory.ts`) — manages memos, source profiles, curator profile, dossier index. Persists to `data/curator/{memos,sources,profile,dossier-index}.json`.
- `FeedManager` (`feed-manager.ts`) — feed item CRUD with URL-based deduplication. Persists to `data/curator/feed.json`.

**Curator types** (`curator/types.ts`): `FeedItem`, `Memo`, `SourceProfile`, `SourceStats`, `CuratorProfile`, `DossierMeta`, `DossierIndex`, `FeedStore`, `MemoStore`, `SourceStore`.

`FeedItem.found_by` values: `'ai'` | `'curator'` | `'dossier'`
`FeedItem.item_type` values: `'signal'` | `'deep_dive'` (for dossier-ingested items)

---

## Key Files Reference

| File | Purpose | Key Export |
|------|---------|-----------|
| `src/local.ts` | CLI entry (local mode) | `main()` — routes subcommands |
| `src/types/signal.ts` | All domain types | 10+ interfaces and union types |
| `src/config/sources.ts` | Search source config | `AI_SOURCES: SourceConfig[]` |
| `src/pipeline/local-pipeline.ts` | Local orchestrator | `LocalPipeline` class |
| `src/pipeline/pipeline.ts` | API-mode orchestrator | `Pipeline` class |
| `src/dossier/dossier-generator.ts` | Output generation | `DossierGenerator` class |
| `src/dossier/html-template.ts` | HTML rendering | `wrapMarkdownInHTML()` |
| `src/memory/signal-memory.ts` | Signal persistence | `SignalMemory` class |
| `src/curator/server.ts` | Workspace server | Express app on :3847 |
| `src/curator/curator-memory.ts` | Curator data CRUD | `CuratorMemory` class |
| `src/curator/feed-manager.ts` | Feed item management | `FeedManager` class |
| `src/curator/types.ts` | Curator-specific types | `FeedItem`, `Memo`, `SourceProfile`, etc. |
| `src/analyzers/technical-analyst.ts` | Technical analysis (API) | `TechnicalAnalyst` class |
| `src/analyzers/strategic-analyst.ts` | Implications analysis (API) | `StrategicAnalyst` class |
| `src/analyzers/skeptical-analyst.ts` | Skeptical analysis (API) | `SkepticalAnalyst` class |
| `src/collectors/web-collector.ts` | Source construction | `WebCollector` class |
| `src/detectors/signal-detector.ts` | Signal classification | `SignalDetector` class |
| `src/synthesis/cross-signal.ts` | Pattern detection | `CrossSignalAnalyzer` class |
| `data/memory/signal-memory.json` | Persistent signal store | Runtime JSON |
| `data/memory/analyzed-topics.json` | Session dedup key | Runtime JSON (manual update) |
| `data/curator/` | Curator workspace data | Runtime JSON files |
| `output/` | Generated dossiers | `.md`, `.json`, `.html` |
| `CLAUDE.md` | Operational instructions | System prompt (502 lines) |

---

## Conventions

### Language
- **Default output language: Korean (한국어)**. All dossier body text, signal summaries, analysis narratives, and user-facing output are written in Korean by default.
- Technical terms may include the original English in parentheses (e.g., "하네스 엔지니어링(Harness Engineering)").
- Code, type names, variable names, file names, and API paths remain in English.
- If the user requests English output, respond in English.

### TypeScript
- Strict mode enabled throughout (`"strict": true`).
- ESM modules: use `.js` extensions in all imports (TypeScript resolves `.ts` → `.js` at build time; `tsx` handles it at runtime).
- `moduleResolution: "bundler"` — use bundler-style imports.
- All async file I/O uses `fs/promises` (never sync variants).
- UUID generation via `uuid` package (`v4`).
- Timestamps via `dayjs` (ISO 8601 strings).

### File Naming
- Dossier outputs follow `dossier-YYYY-MM-DD.{md,json,html}` convention for named sessions.
- Pipeline-generated dossiers use `dossier-{uuid-prefix-8}.{md,json,html}`.

### Data Flow (Local Mode)
Claude Code orchestrates the entire pipeline manually:
1. Collect sources via WebSearch / WebFetch / mcp__exa__web_search_exa
2. Classify each source into a `DetectedSignal` (following CLAUDE.md Step 2 rules)
3. Run 3-perspective analysis (following CLAUDE.md Step 3 — often in parallel via Task tool)
4. Construct `TrendEvent` objects and call `npx tsx src/local.ts from-file events.json`
5. Convert to HTML: `npx tsx src/local.ts to-html output/dossier-YYYY-MM-DD.md`
6. Update signal memory: `npx tsx src/local.ts memory`
7. Manually update `data/memory/analyzed-topics.json`

### Signal Strength Discipline
- `critical` — reserved for once-a-quarter frontier-defining events
- `strong` — significant development, roughly monthly
- `moderate` — clear signal worth tracking, roughly daily
- Most news is `noise` or `weak`; do not inflate

### Analysis Philosophy
- Depth over breadth: 2-3 signals analyzed deeply, not 10 signals shallowly
- Mechanism over outcome: explain how/why, not just what happened
- Hype filter: distinguish marketing from technical substance
- Humble uncertainty: explicitly state what is not yet known
- No investment framing: valuations and market share are tools to explain structural change, not goals

---

## Architectural Decisions

### 1. 3-Layer Harvest Strategy
Sources are collected in three ordered layers to minimize keyword-search dependence:
- **Layer 1 (Seed Harvest):** Curated high-trust sources (HN top, arxiv, company blogs, HuggingFace Papers)
- **Layer 2 (Chain Exploration):** Depth-first traversal from each seed — follow citations, expert reactions, competing approaches (3-4 hops per seed)
- **Layer 2.5 (Expert Source Network):** AI Frontier podcast (aifrontier.kr) curated source list — pre-validated by domain experts
- **Layer 3 (Gap Filling):** Keyword search only for domains not covered by Layers 1-2

This produces 3-5 high-quality, diverse primary sources per session rather than a large shallow set.

### 2. 3-Agent Parallel Analysis
Every moderate+ signal is analyzed from three independent perspectives in parallel (via Task tool in local mode, parallel API calls in API mode):

| Agent | Role | Agent File |
|-------|------|-----------|
| **Technical Mechanism Analyst** | How it works, trade-offs, research implications | `agents/technical-analyst.md` |
| **Implications & Context Analyst** | Historical analogues, practitioner impact, what to learn | `agents/implications-analyst.md` |
| **Skeptical Verifier** | Hype detection, omissions, alternative interpretations | `agents/skeptical-verifier.md` |

Results are combined into consensus/divergence points rather than averaged.

### 3. Signal Memory Deduplication
`SignalMemory` persists across sessions to prevent re-analyzing the same events. Two complementary stores:
- `data/memory/signal-memory.json` — programmatic store updated by the pipeline
- `data/memory/analyzed-topics.json` — semantic store updated manually by Claude Code, used in Step 1.5 of CLAUDE.md to filter incoming sources before analysis begins

Related signal detection uses type-matching and theme-overlap (≥2 shared themes).

### 4. Local-First Architecture (Claude Code as Analysis Engine)
The system operates in two modes:
- **API mode** (`src/index.ts`): calls Anthropic SDK directly — requires `ANTHROPIC_API_KEY`
- **Local mode** (`src/local.ts`): Claude Code itself performs collection and analysis; only the rendering/storage pipeline runs as code

Local mode is the primary operational mode. The `LocalPipeline` class provides factory methods that accept pre-analyzed data from Claude Code and handle persistence/rendering.

### 5. Triple Output Format
Every dossier is saved as `.md` (narrative), `.json` (structured data), and `.html` (self-contained, print-optimized, no external dependencies) simultaneously. This allows:
- `.md` — version control, editing
- `.json` — downstream processing, curator linkage
- `.html` — sharing, archiving, browser viewing without a server

### 6. Curator Workspace as Feedback Loop
The curator web app (port 3847) is the human-in-the-loop interface. It tracks:
- Which sources Claude Code found and why
- Curator reactions (read, bookmark, dismiss) → trust score updates
- Memo annotations on specific sources
- Linkage between dossiers and their source feed items

Trust scores (`SourceProfile.trust_score`) adjust source priority over time based on curator engagement.

---

## Common Operations

### Run a fresh analysis session (local mode)
```bash
# Claude Code performs Steps 1-3 from CLAUDE.md, then:
npx tsx src/local.ts from-file data/events-latest.json
npx tsx src/local.ts to-html output/dossier-YYYY-MM-DD.md
npx tsx src/local.ts memory
# Manually update data/memory/analyzed-topics.json
```

### Convert an existing markdown dossier to HTML
```bash
npx tsx src/local.ts to-html output/dossier-2026-03-02.md
# Outputs: output/dossier-2026-03-02.html (auto-named)

npx tsx src/local.ts to-html output/dossier-2026-03-02.md output/custom-name.html
```

### Check signal memory statistics
```bash
npx tsx src/local.ts memory
```

### Start curator workspace
```bash
npx tsx src/local.ts curator-serve
# Open browser: http://localhost:3847
```

### Build TypeScript
```bash
npm run build
# Compiled output in dist/
```

### Type-check without building
```bash
npx tsc --noEmit
```

### Add a feed item via API (curator is running)
```bash
curl -X POST http://localhost:3847/api/feed \
  -H "Content-Type: application/json" \
  -d '{"url": "https://...", "title": "...", "summary": "..."}'
```

### Register a generated dossier in curator
```bash
curl -X POST http://localhost:3847/api/dossiers \
  -H "Content-Type: application/json" \
  -d '{"id": "dossier-2026-03-03", "title": "...", "date": "2026-03-03", "file": "dossier-2026-03-03.html", "source_urls": ["https://..."], "one_liner": "..."}'
```
