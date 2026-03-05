import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import dayjs from 'dayjs';
import type {
  TrendEvent,
  CrossSignalPattern,
  SignalMemoryEntry,
  SignalMemoryStore,
} from '../types/index.js';

export class SignalMemory {
  private store: SignalMemoryStore;
  private storePath: string;
  private loaded: boolean = false;

  constructor(dataDir: string = './data/memory') {
    this.storePath = join(dataDir, 'signal-memory.json');
    this.store = {
      entries: [],
      patterns: [],
      recurring_themes: {},
      last_updated: dayjs().toISOString(),
    };
  }

  async load(): Promise<void> {
    try {
      const data = await readFile(this.storePath, 'utf-8');
      this.store = JSON.parse(data);
      this.loaded = true;
      console.log(`  Memory loaded: ${this.store.entries.length} signals, ${this.store.patterns.length} patterns`);
    } catch {
      // No existing memory - start fresh
      this.loaded = true;
      console.log('  Starting with fresh signal memory');
    }
  }

  async save(): Promise<void> {
    const dir = this.storePath.substring(0, this.storePath.lastIndexOf('/'));
    await mkdir(dir, { recursive: true });
    this.store.last_updated = dayjs().toISOString();
    await writeFile(this.storePath, JSON.stringify(this.store, null, 2), 'utf-8');
    console.log(`  Memory saved: ${this.store.entries.length} signals`);
  }

  // Store a trend event in memory
  remember(event: TrendEvent): SignalMemoryEntry {
    const entry: SignalMemoryEntry = {
      signal_id: event.signal.signal_id,
      event_id: event.event_id,
      signal_type: event.signal.signal_type,
      signal_strength: event.signal.signal_strength,
      summary: `${event.signal.source.title} — ${event.signal.ai_relevance_reason}`,
      key_themes: this.extractThemes(event),
      related_signal_ids: [],
      pattern_ids: [],
      stored_at: dayjs().toISOString(),
    };

    // Find related past signals
    entry.related_signal_ids = this.findRelated(entry);

    // Update recurring themes
    for (const theme of entry.key_themes) {
      this.store.recurring_themes[theme] = (this.store.recurring_themes[theme] || 0) + 1;
    }

    this.store.entries.push(entry);
    return entry;
  }

  // Store cross-signal patterns
  rememberPatterns(patterns: CrossSignalPattern[]): void {
    for (const pattern of patterns) {
      const existing = this.store.patterns.find(
        (p) =>
          p.pattern_type === pattern.pattern_type &&
          p.description === pattern.description
      );
      if (existing) {
        existing.occurrence_count++;
        existing.last_updated = dayjs().toISOString();
        existing.connected_event_ids = [
          ...new Set([...existing.connected_event_ids, ...pattern.connected_event_ids]),
        ];
      } else {
        this.store.patterns.push(pattern);
      }
    }
  }

  // Find signals similar to a new entry
  findRelated(entry: SignalMemoryEntry): string[] {
    return this.store.entries
      .filter((e) => {
        // Same signal type
        if (e.signal_type === entry.signal_type) return true;
        // Overlapping themes
        const overlap = e.key_themes.filter((t) => entry.key_themes.includes(t));
        return overlap.length >= 2;
      })
      .map((e) => e.signal_id)
      .slice(0, 10); // max 10 related
  }

  // Detect recurring themes above a threshold
  getRecurringThemes(minCount: number = 3): Array<{ theme: string; count: number }> {
    return Object.entries(this.store.recurring_themes)
      .filter(([_, count]) => count >= minCount)
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count);
  }

  // Get long-term trend candidates (patterns with high occurrence)
  getLongTermTrendCandidates(): CrossSignalPattern[] {
    return this.store.patterns
      .filter((p) => p.occurrence_count >= 2)
      .sort((a, b) => b.occurrence_count - a.occurrence_count);
  }

  // Get memory statistics
  getStats(): {
    total_signals: number;
    total_patterns: number;
    unique_themes: number;
    recurring_themes: number;
    top_themes: Array<{ theme: string; count: number }>;
  } {
    const recurring = this.getRecurringThemes(2);
    return {
      total_signals: this.store.entries.length,
      total_patterns: this.store.patterns.length,
      unique_themes: Object.keys(this.store.recurring_themes).length,
      recurring_themes: recurring.length,
      top_themes: recurring.slice(0, 10),
    };
  }

  private extractThemes(event: TrendEvent): string[] {
    const themes = new Set<string>();

    // From signal type
    themes.add(event.signal.signal_type);

    // From impact categories
    for (const cat of event.signal.impact_categories) {
      themes.add(cat);
    }

    // From consensus points (extract key phrases)
    for (const point of event.consensus_points) {
      // Look for compound technical terms
      const techTerms = [
        'scaling',
        'architecture',
        'training',
        'inference',
        'open source',
        'multimodal',
        'reasoning',
        'agents',
        'fine-tuning',
        'rlhf',
        'alignment',
        'safety',
        'regulation',
        'compute',
        'gpu',
        'transformer',
        'diffusion',
        'benchmark',
        'evaluation',
        'deployment',
        'api',
        'pricing',
        'competition',
        'investment',
        'acquisition',
        'partnership',
        'ecosystem',
      ];
      for (const term of techTerms) {
        if (point.toLowerCase().includes(term)) {
          themes.add(term);
        }
      }
    }

    return Array.from(themes);
  }

  getStore(): SignalMemoryStore {
    return this.store;
  }
}
