/**
 * run-demo.ts
 *
 * Feeds 3 fully analyzed frontier AI events through the LocalPipeline
 * to generate Trend Dossiers and update signal memory.
 *
 * Usage:
 *   npx tsx src/run-demo.ts
 */

import { LocalPipeline } from './pipeline/local-pipeline.js';

async function main() {
  const pipeline = new LocalPipeline('./output', './data/memory');

  // =========================================================================
  // EVENT 1: Anthropic Claude Opus 4.6 with Agent Teams
  // =========================================================================

  const source1 = pipeline.createSource(
    'Anthropic Releases Claude Opus 4.6 with Agent Teams and 1M Context Window',
    'Anthropic released Claude Opus 4.6 featuring Agent Teams - multiple Claude instances working in parallel from a single orchestrator, each in its own tmux pane. A demo showed 16 agents building a 100K-line Rust C compiler that compiles the Linux kernel on x86/ARM/RISC-V. Benchmarks: SWE-bench 80.8%, ARC-AGI-2 68.8% (+83% over 4.5), MRCR v2 1M token 76% vs GPT-5.2\'s 18.5%, GDPval-AA leads GPT-5.2 by 144 Elo. 200K default context, 1M beta, 128K max output. Pricing: $5/$25 per M tokens. Sonnet 4.6 followed at 79.6% SWE-bench at 1/5 cost. Controversy: prose quality regression vs 4.5.',
    'https://anthropic.com/news/claude-opus-4-6',
    'announcement',
    'anthropic.com'
  );

  const signal1 = pipeline.createSignal(source1, {
    is_structural: true,
    is_directional: true,
    change_domain: 'both' as const,
    event_nature: 'strategic' as const,
    signal_strength: 'strong' as const,
    signal_type: 'product' as const,
    ai_relevance_reason: 'Agent Teams represents a paradigm shift from single-model to orchestrated multi-agent AI systems for complex engineering workflows',
    impact_categories: ['technology', 'market', 'ecosystem'] as const,
  });

  const analysis1_technical = pipeline.createAnalysis(
    'technical',
    'Claude Opus 4.6 with Agent Teams represents a significant acceleration in the multi-agent orchestration paradigm. The core technical advance is the demonstrated viability of parallel agent coordination at production scale \u2014 16 agents collaborating on a 100K-line Rust C compiler is a systems engineering result. The ARC-AGI-2 jump from 37.6% to 68.8% indicates genuine reasoning improvement under distribution shift. The MRCR v2 result at 1M tokens (76% vs GPT-5.2\'s 18.5%) suggests architectural innovations in long-context processing. The 128K max output limit removes a critical bottleneck for agentic workflows. Sonnet 4.6 at 79.6% SWE-bench at 1/5 cost implies capability gains are partially architectural, not purely scale-driven. The prose quality tradeoff signals deliberate RLHF reward shaping for agentic reliability.',
    [
      'ARC-AGI-2 jump from 37.6% to 68.8% indicates genuine reasoning improvement under distribution shift',
      'MRCR v2 1M token result suggests architectural innovations in long-context processing beyond simple context window extension',
      '128K output token limit removes critical bottleneck for agentic code generation',
      'Sonnet 4.6 at 79.6% SWE-bench at 20% cost implies partially architectural gains',
      'Prose quality tradeoff signals RLHF optimization for agentic reliability over conversational engagement',
    ],
    0.88,
    'acceleration' as const,
  );

  const analysis1_strategic = pipeline.createAnalysis(
    'strategic',
    'Anthropic\'s Opus 4.6 with Agent Teams is a decisive competitive positioning move against OpenAI, shifting the battleground from single-model benchmarks to orchestrated multi-agent productivity. The compiler demonstration targets the $500B+ global software services market. GDPval-AA\'s 144 Elo lead signals intent to capture high-margin enterprise verticals. The two-tier pricing strategy (premium Opus + cost-effective Sonnet) mirrors classic enterprise software playbooks. The MRCR long-context gap suggests a structural advantage competitors cannot close with incremental improvements. The prose regression is a strategic vulnerability that could cede the consumer market to OpenAI. The \'why now\' is clear: justifying $60B+ valuation by demonstrating a path to enterprise revenue through autonomous engineering capacity.',
    [
      'Agent Teams shifts competition to orchestrated multi-agent productivity, targeting the $500B+ software services market',
      'Two-tier pricing strategy defends against price competition while preserving margins in high-value verticals',
      '76% vs 18.5% MRCR gap indicates structural advantage in agentic reliability',
      'Prose quality regression signals strategic trade-off favoring enterprise/engineering over consumer market',
    ],
    0.88,
    'acceleration' as const,
  );

  const analysis1_skeptical = pipeline.createAnalysis(
    'skeptical',
    'The Opus 4.6 Agent Teams announcement demands decomposition of genuine novelty vs incremental improvement wrapped in spectacular demonstration. The 100K-line compiler demo is orchestration engineering, not necessarily an intelligence breakthrough \u2014 16 parallel instances doing coordinated but narrower subtasks is fundamentally different from one model reasoning over 100K lines. SWE-bench scores above 75% face serious questions about benchmark saturation and data contamination. The MRCR 1M comparison (76% vs 18.5%) is almost certainly cherry-picked to maximize the gap. The prose regression signals a genuine capability trade-off that may indicate structural degradation of the language modeling foundation. Sonnet 4.6 at 79.6% SWE-bench at 1/5 cost actually undermines the flagship\'s value proposition.',
    [
      'The compiler demo is orchestration engineering, not model intelligence breakthrough',
      'SWE-bench above 75% faces benchmark saturation and data contamination questions',
      'Prose quality regression signals genuine capability trade-off with concerning precedent',
      'Sonnet at 79.6% at 1/5 cost undermines Opus value proposition',
      'MRCR comparison is likely cherry-picked to maximize gap',
    ],
    0.72,
    'acceleration' as const,
  );

  const event1 = pipeline.createEvent(
    signal1,
    [analysis1_technical, analysis1_strategic, analysis1_skeptical],
    [
      'All perspectives agree Agent Teams represents acceleration in the agentic AI paradigm',
      'Technical and Strategic agree on structural advantage in long-context processing',
      'All perspectives note the prose quality trade-off as significant',
    ],
    [
      'Technical sees genuine reasoning improvement; Skeptical sees orchestration engineering',
      'Strategic sees $500B market opportunity; Skeptical questions benchmark validity',
      'Technical trusts MRCR gap as architectural; Skeptical suspects cherry-picking',
    ],
    [
      'What is the failure rate and reproducibility of Agent Teams on complex tasks?',
      'Does Sonnet 4.6 at 79.6% SWE-bench invalidate the case for Opus premium pricing?',
      'Is prose quality regression a fixable issue or a structural consequence of agentic optimization?',
    ],
  );

  // =========================================================================
  // EVENT 2: DeepSeek mHC (Manifold-Constrained Hyper-Connections)
  // =========================================================================

  const source2 = pipeline.createSource(
    'DeepSeek Publishes mHC: Manifold-Constrained Hyper-Connections for Stable Frontier Model Scaling',
    'DeepSeek\'s mHC paper (arXiv:2512.24880) proposes constraining Hyper-Connection mixing matrices to the Birkhoff Polytope using the Sinkhorn-Knopp algorithm (1967) to fix training instability at scale. Standard residual connections limit scaling; ByteDance\'s HC widened the residual stream but broke identity mapping, causing gradient norm explosions (~3000 at step 12K). mHC restores stability while preserving performance benefits. Results at 27B MoE: BBH 43.8\u219251.0, DROP F1 47.0\u219253.9, with 6.7% training overhead. Infrastructure-level technique applicable to any transformer architecture.',
    'https://arxiv.org/abs/2512.24880',
    'paper',
    'arxiv'
  );

  const signal2 = pipeline.createSignal(source2, {
    is_structural: true,
    is_directional: true,
    change_domain: 'technical' as const,
    event_nature: 'experimental' as const,
    signal_strength: 'moderate' as const,
    signal_type: 'architecture' as const,
    ai_relevance_reason: 'Infrastructure-level training technique that could shift the compute-optimal frontier toward deeper models and reduce capital risk of frontier training runs',
    impact_categories: ['technology', 'ecosystem'] as const,
  });

  const analysis2_technical = pipeline.createAnalysis(
    'technical',
    'mHC is a technically elegant solution to a real problem. The original HC paper widened the residual stream with learned mixing matrices, but unconstrained mixing matrices can amplify gradients exponentially. mHC constrains to the Birkhoff Polytope \u2014 doubly stochastic matrices with spectral radius exactly 1.0, preserving gradient norm-preservation. Sinkhorn-Knopp normalization is differentiable and well-understood from optimal transport theory. The 6.7% overhead for meaningful benchmark gains suggests a favorable compute-performance tradeoff. This is orthogonal to other scaling techniques (MoE routing, attention sparsification). It may shift compute-optimal frontier toward deeper, narrower models, affecting hardware utilization patterns.',
    [
      'Birkhoff Polytope constraint preserves gradient flow stability with spectral radius exactly 1.0',
      'Sinkhorn-Knopp is differentiable and adds minimal overhead per step',
      '6.7% overhead for 14-17% benchmark gains is favorable at scale',
      'Infrastructure-level technique orthogonal to attention, MoE, and data improvements',
      'May shift compute-optimal frontier toward deeper architectures',
    ],
    0.82,
    'emergence' as const,
  );

  const analysis2_strategic = pipeline.createAnalysis(
    'strategic',
    'DeepSeek\'s mHC is an infrastructure-level competitive move with greater long-term implications than any single model release. By solving training instability \u2014 a multi-million-dollar failure mode \u2014 DeepSeek demonstrates parity in training methodology sophistication despite chip restrictions. The publication strategy serves dual purpose: political cover against export control escalation and temporal advantage since DeepSeek has already integrated the technique. The technique lowers barrier to frontier training for all labs. The 6.7% overhead at frontier scale ($50-100M runs) means $3-7M in additional compute. The January 2026 timing likely reflects techniques already baked into their next training run.',
    [
      'Demonstrates DeepSeek\'s research sophistication despite chip export controls',
      'Publication provides political cover and temporal advantage simultaneously',
      'Lowers barrier to frontier training while demonstrating research leadership',
      '6.7% overhead is $3-7M at frontier scale \u2014 non-trivial cost for the improvement',
    ],
    0.82,
    'emergence' as const,
  );

  const analysis2_skeptical = pipeline.createAnalysis(
    'skeptical',
    'The improvements (BBH +7.2, DROP +6.9) are solid but moderate \u2014 this is incremental training stabilization, not a paradigm shift. Open publication may signal DeepSeek has already moved to more advanced approaches, making this a low-cost publication. The 6.7% compute overhead is non-trivial at frontier scale. The need for increasingly sophisticated constraints to stabilize MoE training could be interpreted as evidence of fundamental architectural limitations rather than solutions. The paper does not demonstrate scaling to frontier-size models (200B+ dense equivalent). The use of 1967 mathematics is both reassuring (well-understood) and deflating (application engineering, not algorithmic discovery).',
    [
      'Improvements are moderate \u2014 incremental stabilization, not paradigm shift',
      'Open publication may signal DeepSeek has moved beyond this technique',
      '6.7% overhead is $3-7M at frontier scale \u2014 paper doesn\'t prove proportional benefits at larger sizes',
      'Need for sophisticated constraints may indicate fundamental MoE architectural limitations',
    ],
    0.68,
    'continuation' as const,
  );

  const event2 = pipeline.createEvent(
    signal2,
    [analysis2_technical, analysis2_strategic, analysis2_skeptical],
    [
      'All agree mHC is mathematically principled and the technique works at 27B scale',
      'All note the 6.7% overhead as significant at frontier scale',
      'Technical and Strategic agree on infrastructure-level importance',
    ],
    [
      'Technical sees emergence of new scaling direction; Skeptical sees continuation of incremental improvements',
      'Strategic reads open publication as strategic; Skeptical reads it as low-cost disposal of superseded technique',
      'Technical emphasizes compute-optimal frontier shift; Skeptical emphasizes undemonstrated frontier-scale validity',
    ],
    [
      'Does mHC maintain benefits at 200B+ dense equivalent scale?',
      'Has DeepSeek already integrated this into production training?',
      'Does MoE\'s need for increasingly sophisticated stabilization indicate architectural limits?',
    ],
  );

  // =========================================================================
  // EVENT 3: Trump Executive Order - Federal AI Preemption Framework
  // =========================================================================

  const source3 = pipeline.createSource(
    'Trump Executive Order Mandates Federal AI Preemption Framework \u2014 March 2026 Deadlines Now Active',
    'President Trump\'s executive order on federal AI preemption reaches critical March 11, 2026 deadlines. FTC must issue Section 5 policy statement on AI. Commerce Secretary must identify overly burdensome state AI laws. DOJ AI Litigation Task Force has been operational since January 10, 2026. Targets Colorado SB 205 and 1000+ state AI bills. BEAD broadband funding leverage. Carve-outs for child safety and procurement. Legal analysts note limited actual preemption power via policy statement vs rulemaking. Over 1000 AI-related bills introduced across US states in 2025.',
    'https://whitehouse.gov/presidential-actions/2025/12/eliminating-state-law-obstruction-of-national-artificial-intelligence-policy/',
    'regulatory',
    'whitehouse.gov'
  );

  const signal3 = pipeline.createSignal(source3, {
    is_structural: true,
    is_directional: true,
    change_domain: 'market' as const,
    event_nature: 'strategic' as const,
    signal_strength: 'moderate' as const,
    signal_type: 'regulation' as const,
    ai_relevance_reason: 'Federal preemption of state AI regulation reshapes the compliance landscape and reduces incentives for model-level safety tooling and interpretability research',
    impact_categories: ['market', 'ecosystem', 'geopolitical'] as const,
  });

  const analysis3_technical = pipeline.createAnalysis(
    'technical',
    'The order\'s technical implications center on compliance architecture and deployment strategy. If state laws requiring bias auditing, impact assessments, and explanation capabilities are preempted, the technical burden shifts from per-model compliance to general-purpose monitoring. FTC Section 5 is outcomes-based, not process-based \u2014 evaluating AI by effects rather than architecture. This favors black-box evaluation over interpretability-based compliance, potentially reducing commercial incentives for mechanistic interpretability research. Policy statement instability favors companies with flexible compliance infrastructure. The order creates regulatory monoculture risk \u2014 a single federal framework failure point replaces distributed state experimentation.',
    [
      'Federal preemption shifts compliance from model-level interventions to outcomes-based monitoring',
      'FTC Section 5 outcomes-based standard may reduce commercial demand for interpretability research',
      'Policy statement instability favors large organizations with flexible infrastructure',
      'Regulatory monoculture replaces distributed state-level experimentation',
    ],
    0.72,
    'convergence' as const,
  );

  const analysis3_strategic = pipeline.createAnalysis(
    'strategic',
    'The executive order functions as regulatory capture through indirect pressure rather than direct preemption. The real mechanism is BEAD funding leverage \u2014 well-established federal tactic with strong legal precedent. Regulatory uniformity disproportionately benefits incumbent AI companies with federal lobbying capacity. Carve-outs preserve regulations large companies easily meet while targeting novel compliance burdens. The primary effect may be deterrence of future state legislation rather than invalidation of existing laws. Industry celebrates removal of regulatory friction without considering that strong federal AI authority precedent cuts both ways under different administrations.',
    [
      'Executive order functions as regulatory capture via indirect pressure',
      'Regulatory uniformity benefits incumbents with lobbying capacity over startups',
      'Carve-outs preserve easy-compliance regulations while targeting novel burdens',
      'Primary effect is deterring future state legislation, not rolling back existing laws',
    ],
    0.79,
    'convergence' as const,
  );

  const analysis3_skeptical = pipeline.createAnalysis(
    'skeptical',
    'The political signaling far exceeds the legal substance, but that may be the point. FTC policy statements have limited preemptive power. DOJ Task Force being \'operational\' is bureaucratic language revealing little about actual capacity. The BEAD funding leverage is the most potent tool and deserves more attention. Historical precedent from both Trump and Biden AI executive orders shows these instruments are fragile and reversible. Regulatory uncertainty itself disproportionately benefits large incumbents. March 2026 deadlines are almost certainly performative \u2014 federal agencies don\'t operationalize complex mandates in months. The gap between announcement and implementation is where executive orders typically lose momentum.',
    [
      'Political signaling far exceeds legal substance \u2014 limited formal preemptive power',
      'BEAD funding leverage is the most potent but least discussed mechanism',
      'Historical precedent shows AI executive orders are fragile and reversible',
      'Regulatory uncertainty benefits large incumbents over startups and civil society',
      'March deadlines are likely performative \u2014 implementation gap is where EOs lose momentum',
    ],
    0.74,
    'continuation' as const,
  );

  const event3 = pipeline.createEvent(
    signal3,
    [analysis3_technical, analysis3_strategic, analysis3_skeptical],
    [
      'All agree BEAD funding leverage is the most substantive mechanism in the order',
      'All note limited formal preemptive power of FTC policy statements',
      'All agree regulatory uncertainty disproportionately benefits large incumbents',
    ],
    [
      'Technical sees convergence toward outcomes-based regulation; Skeptical sees continuation of fragile executive orders',
      'Strategic sees effective regulatory capture; Skeptical sees performative deadlines',
      'Technical worries about reduced interpretability incentives; Strategic worries about reversibility under different administrations',
    ],
    [
      'Will the BEAD leverage mechanism be legally challenged?',
      'Does this executive order survive administration change?',
      'Does removal of state compliance requirements actually reduce AI safety investment, or do market forces maintain it?',
    ],
  );

  // =========================================================================
  // CROSS-SIGNAL PATTERNS
  // =========================================================================

  const events = [event1, event2, event3];

  const pattern1 = pipeline.createPattern(
    'simultaneous' as const,
    'Concurrent optimization for agentic AI capability: Anthropic Agent Teams and DeepSeek mHC both optimize different layers of the stack for more capable, scalable AI agents \u2014 one at the application layer, one at the training infrastructure layer',
    [event1.event_id, event2.event_id],
    [
      'Agent Teams optimizes multi-agent coordination at inference time',
      'mHC optimizes training stability for larger base models',
      'Both reduce barriers to more capable AI systems',
    ],
  );

  const pattern2 = pipeline.createPattern(
    'ecosystem_shift' as const,
    'Regulatory environment aligning with frontier AI scaling: Federal preemption removes state-level compliance friction simultaneously as frontier labs demonstrate new capability thresholds, creating a permissive environment for rapid agentic AI deployment',
    [event1.event_id, event3.event_id],
    [
      'Federal preemption reduces compliance requirements for AI deployment',
      'Agent Teams demonstrates production-scale autonomous coding',
      'Reduced regulation + increased capability = accelerated deployment trajectory',
    ],
  );

  const pattern3 = pipeline.createPattern(
    'recurring' as const,
    'Benchmark-driven capability claims masking fundamental trade-offs: Both Anthropic\'s prose regression and DeepSeek\'s unproven frontier-scale validation reveal a recurring pattern where capability claims outpace verified, general-purpose improvements',
    [event1.event_id, event2.event_id],
    [
      'Opus 4.6 prose regression suggests benchmark optimization at cost of general quality',
      'mHC results only demonstrated at 27B, not frontier scale',
      'Industry trend of impressive demonstrations with undisclosed limitations',
    ],
  );

  const patterns = [pattern1, pattern2, pattern3];

  // =========================================================================
  // RUN PIPELINE
  // =========================================================================

  const dossiers = await pipeline.runFromEvents(events, patterns);

  console.log('Demo complete. Generated dossiers:');
  for (const d of dossiers) {
    console.log(`  - [${d.signal_strength}/${d.signal_type}] ${d.event.signal.source.title}`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
