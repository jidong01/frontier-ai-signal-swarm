import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import type { RawSource, DetectedSignal, SignalStrength, SignalType, ImpactCategory } from '../types/index.js';

const DETECTION_SYSTEM_PROMPT = `You are an AI Frontier Signal Detector. Your role is to analyze news/content about AI and determine if it represents a significant signal in the AI frontier landscape.

You must evaluate each piece of content and produce a structured assessment:

1. **Structural vs Noise**: Is this a structural signal (changes the landscape) or routine news (incremental, expected)?
2. **Directional**: Does this indicate a directional change in AI development?
3. **Domain**: Is the change primarily technical, market-driven, or both?
4. **Event Nature**: Is this experimental (early stage), strategic (deliberate positioning), incremental (small step), or transformative (paradigm shift)?
5. **Signal Strength**: Rate as noise/weak/moderate/strong/critical
6. **Signal Type**: Classify as research/infrastructure/product/capital/regulation/architecture/api/opensource/ecosystem/talent
7. **AI Relevance**: Explain WHY this matters for AI frontier development
8. **Impact Categories**: Which areas does this impact? (technology/market/ecosystem/industry_spillover/geopolitical)

IMPORTANT RULES:
- Do NOT inflate signal strength. Most news is noise or weak.
- A "critical" signal should be reserved for once-a-quarter type events.
- Be precise about WHY something matters, not just that it does.
- Distinguish PR/marketing language from actual technical substance.

Respond in valid JSON format:
{
  "is_structural": boolean,
  "is_directional": boolean,
  "change_domain": "technical" | "market" | "both",
  "event_nature": "experimental" | "strategic" | "incremental" | "transformative",
  "signal_strength": "noise" | "weak" | "moderate" | "strong" | "critical",
  "signal_type": "research" | "infrastructure" | "product" | "capital" | "regulation" | "architecture" | "api" | "opensource" | "ecosystem" | "talent",
  "ai_relevance_reason": "string explaining frontier relevance",
  "impact_categories": ["technology", "market", "ecosystem", "industry_spillover", "geopolitical"]
}`;

export class SignalDetector {
  private client: Anthropic;
  private model: string;

  constructor(model: string = 'claude-sonnet-4-20250514') {
    this.client = new Anthropic();
    this.model = model;
  }

  async detect(source: RawSource): Promise<DetectedSignal> {
    const userPrompt = `Analyze this AI-related content for frontier signals:

Title: ${source.title}
Source: ${source.origin}
Type: ${source.source_type}
Published: ${source.published_at}

Content:
${source.content.substring(0, 4000)}

Provide your structured signal assessment as JSON.`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: DETECTION_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = this.parseDetectionResponse(text);

    return {
      signal_id: uuidv4(),
      source,
      is_structural: parsed.is_structural,
      is_directional: parsed.is_directional,
      change_domain: parsed.change_domain,
      event_nature: parsed.event_nature,
      signal_strength: parsed.signal_strength,
      signal_type: parsed.signal_type,
      ai_relevance_reason: parsed.ai_relevance_reason,
      impact_categories: parsed.impact_categories,
      detected_at: dayjs().toISOString(),
    };
  }

  async detectBatch(sources: RawSource[]): Promise<DetectedSignal[]> {
    const results: DetectedSignal[] = [];
    for (const source of sources) {
      try {
        console.log(`  Detecting signal: ${source.title.substring(0, 60)}...`);
        const signal = await this.detect(source);
        results.push(signal);
        console.log(`    -> ${signal.signal_strength} ${signal.signal_type} signal (structural: ${signal.is_structural})`);
      } catch (error) {
        console.error(`  Error detecting signal for "${source.title}":`, error instanceof Error ? error.message : error);
      }
    }
    return results;
  }

  // Filter to only significant signals (moderate+)
  filterSignificant(signals: DetectedSignal[]): DetectedSignal[] {
    const significantLevels: SignalStrength[] = ['moderate', 'strong', 'critical'];
    return signals.filter(s => significantLevels.includes(s.signal_strength));
  }

  private parseDetectionResponse(text: string): {
    is_structural: boolean;
    is_directional: boolean;
    change_domain: 'technical' | 'market' | 'both';
    event_nature: 'experimental' | 'strategic' | 'incremental' | 'transformative';
    signal_strength: SignalStrength;
    signal_type: SignalType;
    ai_relevance_reason: string;
    impact_categories: ImpactCategory[];
  } {
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      return JSON.parse(jsonMatch[0]);
    } catch {
      // Fallback defaults
      return {
        is_structural: false,
        is_directional: false,
        change_domain: 'technical',
        event_nature: 'incremental',
        signal_strength: 'weak',
        signal_type: 'product',
        ai_relevance_reason: 'Unable to parse signal detection response',
        impact_categories: ['technology'],
      };
    }
  }
}
