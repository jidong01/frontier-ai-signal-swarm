import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import type { TrendEvent, CrossSignalPattern } from '../types/index.js';

const SYNTHESIS_SYSTEM_PROMPT = `You are an AI Trend Synthesis Engine. Given multiple AI trend events, your job is to identify cross-cutting patterns and connections.

Look for:
1. **Recurring Patterns**: Similar signals appearing from different sources/companies
2. **Simultaneous Directional Shifts**: Multiple actors moving in the same direction at the same time
3. **Ecosystem-level Movements**: Changes that affect the entire AI ecosystem, not just one player
4. **Scaling Direction Changes**: Shifts in how models are scaled (data, compute, architecture)
5. **Infrastructure Concentration**: Where investment and resources are being concentrated

For each pattern detected, provide:
{
  "patterns": [
    {
      "pattern_type": "recurring" | "simultaneous" | "ecosystem_shift" | "scaling_direction" | "infra_concentration",
      "description": "Clear description of the pattern",
      "connected_event_ids": ["id1", "id2"],
      "evidence": ["evidence1", "evidence2"]
    }
  ]
}

RULES:
- Only identify patterns with clear evidence from at least 2 events
- Don't force connections where none exist
- Rate pattern significance honestly
- Consider temporal proximity (events close in time are more likely related)
- Look for both obvious and non-obvious connections`;

export class CrossSignalSynthesizer {
  private client: Anthropic;
  private model: string;

  constructor(model: string = 'claude-sonnet-4-20250514') {
    this.client = new Anthropic();
    this.model = model;
  }

  async synthesize(events: TrendEvent[]): Promise<CrossSignalPattern[]> {
    if (events.length < 2) {
      console.log('  Need at least 2 events for cross-signal synthesis');
      return [];
    }

    const eventSummaries = events.map(e => ({
      event_id: e.event_id,
      title: e.signal.source.title,
      signal_type: e.signal.signal_type,
      signal_strength: e.signal.signal_strength,
      ai_relevance: e.signal.ai_relevance_reason,
      consensus: e.consensus_points,
      divergence: e.divergence_points,
      date: e.signal.source.published_at,
    }));

    const userPrompt = `Analyze these AI trend events for cross-cutting patterns:

${JSON.stringify(eventSummaries, null, 2)}

Identify all cross-signal patterns. Respond with JSON.`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      system: SYNTHESIS_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return this.parsePatterns(text);
  }

  private parsePatterns(text: string): CrossSignalPattern[] {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return [];
      const parsed = JSON.parse(jsonMatch[0]);
      const patterns = parsed.patterns || [];

      return patterns.map((p: any) => ({
        pattern_id: uuidv4(),
        pattern_type: p.pattern_type || 'recurring',
        description: p.description || '',
        connected_event_ids: p.connected_event_ids || [],
        evidence: p.evidence || [],
        first_detected: dayjs().toISOString(),
        last_updated: dayjs().toISOString(),
        occurrence_count: 1,
      }));
    } catch {
      console.error('  Failed to parse synthesis patterns');
      return [];
    }
  }
}
