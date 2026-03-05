import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { WebCollector } from '../collectors/index.js';
import { SignalDetector } from '../detectors/index.js';
import { TechnicalAnalyst, StrategicAnalyst, SkepticalAnalyst } from '../analyzers/index.js';
import { CrossSignalSynthesizer } from '../synthesis/index.js';
import { DossierGenerator } from '../dossier/index.js';
import { SignalMemory } from '../memory/index.js';
import type { RawSource, DetectedSignal, TrendEvent, TrendDossier, AnalysisPerspective, CrossSignalPattern } from '../types/index.js';

export interface PipelineConfig {
  outputDir?: string;
  dataDir?: string;
  detectorModel?: string;
  analysisModel?: string;
  synthesisModel?: string;
  filterWeak?: boolean; // Only process moderate+ signals
}

export class SignalPipeline {
  private collector: WebCollector;
  private detector: SignalDetector;
  private technicalAnalyst: TechnicalAnalyst;
  private strategicAnalyst: StrategicAnalyst;
  private skepticalAnalyst: SkepticalAnalyst;
  private synthesizer: CrossSignalSynthesizer;
  private dossierGenerator: DossierGenerator;
  private memory: SignalMemory;
  private config: Required<PipelineConfig>;

  constructor(config: PipelineConfig = {}) {
    this.config = {
      outputDir: config.outputDir || './output',
      dataDir: config.dataDir || './data/memory',
      detectorModel: config.detectorModel || 'claude-sonnet-4-20250514',
      analysisModel: config.analysisModel || 'claude-sonnet-4-20250514',
      synthesisModel: config.synthesisModel || 'claude-sonnet-4-20250514',
      filterWeak: config.filterWeak ?? true,
    };

    this.collector = new WebCollector();
    this.detector = new SignalDetector(this.config.detectorModel);
    this.technicalAnalyst = new TechnicalAnalyst(this.config.analysisModel);
    this.strategicAnalyst = new StrategicAnalyst(this.config.analysisModel);
    this.skepticalAnalyst = new SkepticalAnalyst(this.config.analysisModel);
    this.synthesizer = new CrossSignalSynthesizer(this.config.synthesisModel);
    this.dossierGenerator = new DossierGenerator(this.config.outputDir);
    this.memory = new SignalMemory(this.config.dataDir);
  }

  // Full pipeline: sources -> detect -> analyze -> synthesize -> dossier
  async run(sources: RawSource[]): Promise<TrendDossier[]> {
    console.log('\n========================================');
    console.log('  FRONTIER AI SIGNAL SWARM');
    console.log('  AI Trend Intelligence Engine');
    console.log('========================================\n');

    // Load memory
    console.log('[1/6] Loading signal memory...');
    await this.memory.load();

    // Detect signals
    console.log(`\n[2/6] Detecting signals from ${sources.length} sources...`);
    let signals = await this.detector.detectBatch(sources);
    console.log(`  -> ${signals.length} signals detected`);

    // Filter weak signals if configured
    if (this.config.filterWeak) {
      signals = this.detector.filterSignificant(signals);
      console.log(`  -> ${signals.length} significant signals (moderate+)`);
    }

    if (signals.length === 0) {
      console.log('\n  No significant signals detected. Pipeline complete.');
      return [];
    }

    // Multi-perspective analysis
    console.log(`\n[3/6] Running multi-perspective analysis on ${signals.length} signals...`);
    const events: TrendEvent[] = [];
    for (const signal of signals) {
      console.log(`\n  Analyzing: ${signal.source.title.substring(0, 60)}...`);
      const event = await this.analyzeSignal(signal);
      events.push(event);
    }

    // Cross-signal synthesis
    console.log(`\n[4/6] Running cross-signal synthesis...`);
    const patterns = await this.synthesizer.synthesize(events);
    console.log(`  -> ${patterns.length} cross-signal patterns detected`);

    // Generate dossiers
    console.log(`\n[5/6] Generating trend dossiers...`);
    const dossiers: TrendDossier[] = [];
    for (const event of events) {
      const dossier = this.dossierGenerator.generate(event, patterns);
      dossiers.push(dossier);
    }
    const paths = await this.dossierGenerator.saveAll(dossiers);
    console.log(`  -> ${paths.length} dossiers generated`);

    // Update memory
    console.log(`\n[6/6] Updating signal memory...`);
    for (const event of events) {
      this.memory.remember(event);
    }
    this.memory.rememberPatterns(patterns);
    await this.memory.save();

    // Print summary
    this.printSummary(dossiers, patterns);

    return dossiers;
  }

  // Analyze a single signal with all 3 perspectives
  private async analyzeSignal(signal: DetectedSignal): Promise<TrendEvent> {
    console.log('    -> Technical analysis...');
    const technical = await this.technicalAnalyst.analyze(signal);

    console.log('    -> Strategic analysis...');
    const strategic = await this.strategicAnalyst.analyze(signal);

    console.log('    -> Skeptical analysis...');
    const skeptical = await this.skepticalAnalyst.analyze(signal);

    const analyses = [technical, strategic, skeptical];

    // Extract consensus and divergence
    const { consensus, divergence, openQuestions } = this.extractConsensusAndDivergence(analyses);

    return {
      event_id: uuidv4(),
      signal,
      analyses,
      consensus_points: consensus,
      divergence_points: divergence,
      parent_trends: [],
      open_questions: openQuestions,
      created_at: dayjs().toISOString(),
    };
  }

  private extractConsensusAndDivergence(analyses: AnalysisPerspective[]): {
    consensus: string[];
    divergence: string[];
    openQuestions: string[];
  } {
    // Find overlapping key points across perspectives
    const consensus: string[] = [];
    const divergence: string[] = [];
    const openQuestions: string[] = [];

    // Simple overlap detection: points that share significant word overlap
    const techPoints = analyses[0]?.key_points || [];
    const stratPoints = analyses[1]?.key_points || [];
    const skeptPoints = analyses[2]?.key_points || [];

    // Points where technical and strategic agree
    for (const tp of techPoints) {
      const tpWords = new Set(tp.toLowerCase().split(/\s+/).filter(w => w.length > 3));
      for (const sp of stratPoints) {
        const spWords = sp.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const overlap = spWords.filter(w => tpWords.has(w)).length;
        if (overlap >= 3) {
          consensus.push(`Technical and Strategic agree: ${tp}`);
          break;
        }
      }
    }

    // Skeptical points that contradict others become divergence
    for (const skp of skeptPoints) {
      divergence.push(`Skeptical view: ${skp}`);
    }

    // Generate open questions from low-confidence analyses
    for (const a of analyses) {
      if (a.confidence < 0.6) {
        openQuestions.push(`${a.perspective} analysis has low confidence (${a.confidence}) -- needs more data`);
      }
    }

    // Add structural open questions
    if (consensus.length === 0) {
      openQuestions.push('No strong consensus across perspectives -- requires further investigation');
    }

    return { consensus, divergence, openQuestions };
  }

  private printSummary(dossiers: TrendDossier[], patterns: CrossSignalPattern[]): void {
    console.log('\n========================================');
    console.log('  PIPELINE SUMMARY');
    console.log('========================================');
    console.log(`  Dossiers generated: ${dossiers.length}`);
    console.log(`  Cross-signal patterns: ${patterns.length}`);

    const memStats = this.memory.getStats();
    console.log(`  Total signals in memory: ${memStats.total_signals}`);
    console.log(`  Recurring themes: ${memStats.recurring_themes}`);
    if (memStats.top_themes.length > 0) {
      console.log('  Top themes:');
      memStats.top_themes.slice(0, 5).forEach(t => {
        console.log(`    - ${t.theme} (${t.count}x)`);
      });
    }

    console.log('\n  Output files:');
    console.log(`    ${this.config.outputDir}/`);

    console.log('\n========================================');
    console.log('  Frontier AI Signal Swarm -- Complete');
    console.log('========================================\n');
  }
}
