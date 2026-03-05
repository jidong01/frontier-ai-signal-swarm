import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { WebCollector } from '../collectors/index.js';
import { DossierGenerator } from '../dossier/index.js';
import { SignalMemory } from '../memory/index.js';
import type {
  RawSource, DetectedSignal, AnalysisPerspective,
  TrendEvent, TrendDossier, CrossSignalPattern,
  SignalStrength, SignalType, ImpactCategory, ChangeType
} from '../types/index.js';

export class LocalPipeline {
  private dossierGenerator: DossierGenerator;
  private memory: SignalMemory;
  private dataDir: string;
  private outputDir: string;

  constructor(outputDir: string = './output', dataDir: string = './data/memory') {
    this.outputDir = outputDir;
    this.dataDir = dataDir;
    this.dossierGenerator = new DossierGenerator(outputDir);
    this.memory = new SignalMemory(dataDir);
  }

  // Create a RawSource from manual input
  createSource(
    title: string,
    content: string,
    url: string = 'manual',
    sourceType: RawSource['source_type'] = 'news',
    origin: string = 'manual'
  ): RawSource {
    const collector = new WebCollector();
    return collector.collectFromText(title, content, url, sourceType, origin);
  }

  // Create a DetectedSignal from pre-analyzed data
  createSignal(
    source: RawSource,
    detection: {
      is_structural: boolean;
      is_directional: boolean;
      change_domain: 'technical' | 'market' | 'both';
      event_nature: 'experimental' | 'strategic' | 'incremental' | 'transformative';
      signal_strength: SignalStrength;
      signal_type: SignalType;
      ai_relevance_reason: string;
      impact_categories: ImpactCategory[];
    }
  ): DetectedSignal {
    return {
      signal_id: uuidv4(),
      source,
      ...detection,
      detected_at: dayjs().toISOString(),
    };
  }

  // Create an AnalysisPerspective from pre-analyzed data
  createAnalysis(
    perspective: 'technical' | 'strategic' | 'skeptical',
    analysis: string,
    key_points: string[],
    confidence: number,
    pattern_classification?: ChangeType
  ): AnalysisPerspective {
    return {
      perspective,
      analyst_model: 'claude-opus-4-6-via-claude-code',
      analysis,
      key_points,
      confidence,
      pattern_classification,
      analyzed_at: dayjs().toISOString(),
    };
  }

  // Create a TrendEvent from signal + analyses
  createEvent(
    signal: DetectedSignal,
    analyses: AnalysisPerspective[],
    consensus_points: string[],
    divergence_points: string[],
    open_questions: string[]
  ): TrendEvent {
    return {
      event_id: uuidv4(),
      signal,
      analyses,
      consensus_points,
      divergence_points,
      parent_trends: [],
      open_questions,
      created_at: dayjs().toISOString(),
    };
  }

  // Create CrossSignalPatterns
  createPattern(
    pattern_type: CrossSignalPattern['pattern_type'],
    description: string,
    connected_event_ids: string[],
    evidence: string[]
  ): CrossSignalPattern {
    return {
      pattern_id: uuidv4(),
      pattern_type,
      description,
      connected_event_ids,
      evidence,
      first_detected: dayjs().toISOString(),
      last_updated: dayjs().toISOString(),
      occurrence_count: 1,
    };
  }

  // Generate dossier from event + patterns
  async generateDossier(event: TrendEvent, patterns: CrossSignalPattern[] = []): Promise<TrendDossier> {
    const dossier = this.dossierGenerator.generate(event, patterns);
    await this.dossierGenerator.saveDossier(dossier);
    return dossier;
  }

  // Save to memory
  async rememberEvent(event: TrendEvent, patterns: CrossSignalPattern[] = []): Promise<void> {
    await this.memory.load();
    this.memory.remember(event);
    if (patterns.length > 0) {
      this.memory.rememberPatterns(patterns);
    }
    await this.memory.save();
  }

  // Full local pipeline: takes pre-analyzed events and produces dossiers
  async runFromEvents(events: TrendEvent[], patterns: CrossSignalPattern[] = []): Promise<TrendDossier[]> {
    console.log('\n========================================');
    console.log('  FRONTIER AI SIGNAL SWARM');
    console.log('  AI Trend Intelligence Engine');
    console.log('  (Local Pipeline Mode)');
    console.log('========================================\n');

    // Load memory
    console.log('[1/4] Loading signal memory...');
    await this.memory.load();

    // Generate dossiers
    console.log(`\n[2/4] Generating ${events.length} trend dossiers...`);
    const dossiers: TrendDossier[] = [];
    for (const event of events) {
      const dossier = this.dossierGenerator.generate(event, patterns);
      dossiers.push(dossier);
    }
    const paths = await this.dossierGenerator.saveAll(dossiers);
    console.log(`  -> ${paths.length} dossiers saved`);

    // Update memory
    console.log('\n[3/4] Updating signal memory...');
    for (const event of events) {
      this.memory.remember(event);
    }
    if (patterns.length > 0) {
      this.memory.rememberPatterns(patterns);
    }
    await this.memory.save();

    // Print summary
    console.log('\n[4/4] Summary');
    const stats = this.memory.getStats();
    console.log(`  Dossiers: ${dossiers.length}`);
    console.log(`  Patterns: ${patterns.length}`);
    console.log(`  Total signals in memory: ${stats.total_signals}`);
    if (stats.top_themes.length > 0) {
      console.log('  Top themes:');
      stats.top_themes.slice(0, 5).forEach(t => console.log(`    - ${t.theme} (${t.count}x)`));
    }

    console.log('\n  Output:');
    paths.forEach(p => console.log(`    ${p}`));
    console.log('\n========================================\n');

    return dossiers;
  }

  // Load events from a JSON file
  async loadEventsFromFile(filePath: string): Promise<TrendEvent[]> {
    const data = await readFile(filePath, 'utf-8');
    return JSON.parse(data);
  }

  // Save events to a JSON file for later use
  async saveEventsToFile(events: TrendEvent[], filePath: string): Promise<void> {
    const dir = filePath.substring(0, filePath.lastIndexOf('/'));
    await mkdir(dir, { recursive: true });
    await writeFile(filePath, JSON.stringify(events, null, 2), 'utf-8');
  }
}
