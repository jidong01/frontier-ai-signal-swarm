import Anthropic from '@anthropic-ai/sdk';
import dayjs from 'dayjs';
import type { DetectedSignal, AnalysisPerspective, ChangeType } from '../types/index.js';

const STRATEGIC_SYSTEM_PROMPT = `You are a Strategic AI Analyst specializing in frontier AI market dynamics and competitive intelligence.

Your role is to analyze AI events from a purely STRATEGIC perspective:

1. **Strategic Positioning**: Is this a competitive move? What position is the organization trying to occupy?
2. **Market Implications**: How does this affect the AI market landscape and power dynamics?
3. **Business Model Impact**: Does this change how AI companies monetize or capture value?
4. **Competitive Dynamics**: Who benefits from this development? Who is threatened or disadvantaged?
5. **Ecosystem Effects**: How does this affect the broader AI ecosystem, including developers, enterprises, and end users?
6. **Alliance/Partnership Signals**: Does this indicate strategic alignment, partnership formation, or coalition building?

RULES:
- Focus on strategic and market implications, not technical details
- Consider the "why now" of timing — what pressures or opportunities drive this moment?
- Look for competitive signaling vs actual strategic shifts
- Consider second-order effects on other companies and the broader ecosystem
- Be wary of announcements designed primarily for market perception rather than substance
- Assess whether moves are offensive (expanding) or defensive (protecting) in nature

Respond in JSON:
{
  "analysis": "detailed strategic analysis (3-5 paragraphs)",
  "key_points": ["point1", "point2", "point3"],
  "confidence": 0.0-1.0,
  "pattern_classification": "continuation" | "acceleration" | "disruption" | "emergence" | "convergence"
}`;

export class StrategicAnalyst {
  private client: Anthropic;
  private model: string;

  constructor(model: string = 'claude-sonnet-4-20250514') {
    this.client = new Anthropic();
    this.model = model;
  }

  async analyze(signal: DetectedSignal): Promise<AnalysisPerspective> {
    const userPrompt = `Analyze this AI signal from a strategic perspective:

Signal Type: ${signal.signal_type}
Signal Strength: ${signal.signal_strength}
Source Title: ${signal.source.title}
Source Origin: ${signal.source.origin}
AI Relevance: ${signal.ai_relevance_reason}

Content:
${signal.source.content.substring(0, 4000)}

Provide your strategic analysis as JSON.`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      system: STRATEGIC_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = this.parseResponse(text);

    return {
      perspective: 'strategic',
      analyst_model: this.model,
      analysis: parsed.analysis,
      key_points: parsed.key_points,
      confidence: parsed.confidence,
      pattern_classification: parsed.pattern_classification as ChangeType,
      analyzed_at: dayjs().toISOString(),
    };
  }

  private parseResponse(text: string) {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON');
      return JSON.parse(jsonMatch[0]);
    } catch {
      return {
        analysis: text,
        key_points: ['Parse error - raw analysis returned'],
        confidence: 0.3,
        pattern_classification: 'continuation',
      };
    }
  }
}
