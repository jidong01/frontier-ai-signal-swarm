// Signal Types for Frontier AI Signal Swarm

export type SignalType =
  | 'research'        // Research breakthroughs, papers
  | 'infrastructure'  // AI infra changes, compute
  | 'product'         // Product releases, features
  | 'capital'         // Investment, funding, M&A
  | 'regulation'      // Policy, regulation changes
  | 'architecture'    // Model architecture changes
  | 'api'             // API changes, pricing
  | 'opensource'       // Open source releases
  | 'ecosystem'       // Industry ecosystem shifts
  | 'talent';         // Key hires, team changes

export type SignalStrength =
  | 'noise'           // Background noise, not significant
  | 'weak'            // Potentially interesting, needs watching
  | 'moderate'        // Clear signal, worth tracking
  | 'strong'          // Significant development
  | 'critical';       // Frontier-defining event

export type ChangeType =
  | 'continuation'    // Extension of existing trend
  | 'acceleration'    // Speeding up of trend
  | 'disruption'      // Break from existing pattern
  | 'emergence'       // New pattern appearing
  | 'convergence';    // Multiple trends merging

export type ImpactCategory =
  | 'technology'
  | 'market'
  | 'ecosystem'
  | 'industry_spillover'
  | 'geopolitical';

export interface RawSource {
  source_id: string;
  url: string;
  title: string;
  content: string;
  source_type: 'announcement' | 'paper' | 'blog' | 'news' | 'release_note' | 'community' | 'regulatory';
  published_at: string;
  collected_at: string;
  origin: string; // e.g., "arxiv", "openai.com", "techcrunch"
}

export interface DetectedSignal {
  signal_id: string;
  source: RawSource;
  is_structural: boolean;       // true = structural signal, false = noise/routine news
  is_directional: boolean;      // true = indicates direction change
  change_domain: 'technical' | 'market' | 'both';
  event_nature: 'experimental' | 'strategic' | 'incremental' | 'transformative';
  signal_strength: SignalStrength;
  signal_type: SignalType;
  ai_relevance_reason: string;  // Why this matters for AI frontier
  impact_categories: ImpactCategory[];
  detected_at: string;
}

export interface AnalysisPerspective {
  perspective: 'technical' | 'strategic' | 'skeptical';
  analyst_model: string;        // Which model performed analysis
  analysis: string;
  key_points: string[];
  confidence: number;           // 0-1
  pattern_classification?: ChangeType;
  analyzed_at: string;
}

export interface TrendEvent {
  event_id: string;
  signal: DetectedSignal;
  analyses: AnalysisPerspective[];
  consensus_points: string[];   // Where models agree
  divergence_points: string[];  // Where models disagree
  parent_trends: string[];      // Higher-level trend IDs
  open_questions: string[];
  created_at: string;
}

export interface CrossSignalPattern {
  pattern_id: string;
  pattern_type: 'recurring' | 'simultaneous' | 'ecosystem_shift' | 'scaling_direction' | 'infra_concentration';
  description: string;
  connected_event_ids: string[];
  evidence: string[];
  first_detected: string;
  last_updated: string;
  occurrence_count: number;
}

export interface TrendDossier {
  dossier_id: string;
  event: TrendEvent;
  event_summary: string;
  signal_type: SignalType;
  signal_strength: SignalStrength;
  technical_interpretation: string;
  strategic_interpretation: string;
  alternative_interpretation: string;
  model_consensus: string[];
  model_divergence: string[];
  parent_trend: string;
  related_patterns: CrossSignalPattern[];
  open_questions: string[];
  generated_at: string;
}

export interface SignalMemoryEntry {
  signal_id: string;
  event_id: string;
  signal_type: SignalType;
  signal_strength: SignalStrength;
  summary: string;
  key_themes: string[];
  related_signal_ids: string[];
  pattern_ids: string[];
  stored_at: string;
}

export interface SignalMemoryStore {
  entries: SignalMemoryEntry[];
  patterns: CrossSignalPattern[];
  recurring_themes: Record<string, number>;
  last_updated: string;
}
