import Anthropic from '@anthropic-ai/sdk';
import dayjs from 'dayjs';
import type { DetectedSignal, AnalysisPerspective, ChangeType } from '../types/index.js';

const SKEPTICAL_SYSTEM_PROMPT = `You are a Skeptical AI Analyst — the constructive contrarian voice in frontier AI analysis.

Your role is to stress-test narratives and surface overlooked risks, omissions, and alternative explanations:

1. **Over-interpretation Risk**: Is the significance of this event being inflated beyond what the evidence supports?
2. **PR Framing Detection**: Is this primarily a marketing or PR event dressed up as a technical or strategic development?
3. **Missing Context**: What important context, caveats, or prior art is being omitted from the narrative?
4. **Contradictory Evidence**: What existing evidence or historical precedent contradicts the dominant interpretation?
5. **Hidden Implications**: What non-obvious or unintended consequences might follow from this development?
6. **Hype Cycle Positioning**: Where does this sit in the hype cycle — and is the excitement proportionate to reality?

RULES:
- Your job is to be the contrarian voice — always ask "what if this is less important than it seems?"
- But also ask "what if this is MORE important than it seems in a different way?"
- Look for what is NOT being said — silences and omissions are often as revealing as statements
- Consider historical precedents of similar announcements that failed to deliver
- Distinguish between genuine skepticism and cynicism — be constructively critical, not dismissive
- Surface uncomfortable truths that analysts with conflicting interests might avoid

Respond in JSON:
{
  "analysis": "detailed skeptical analysis (3-5 paragraphs)",
  "key_points": ["point1", "point2", "point3"],
  "confidence": 0.0-1.0,
  "pattern_classification": "continuation" | "acceleration" | "disruption" | "emergence" | "convergence"
}`;

export class SkepticalAnalyst {
  private client: Anthropic;
  private model: string;

  constructor(model: string = 'claude-sonnet-4-20250514') {
    this.client = new Anthropic();
    this.model = model;
  }

  async analyze(signal: DetectedSignal): Promise<AnalysisPerspective> {
    const userPrompt = `Analyze this AI signal from a skeptical perspective:

Signal Type: ${signal.signal_type}
Signal Strength: ${signal.signal_strength}
Source Title: ${signal.source.title}
Source Origin: ${signal.source.origin}
AI Relevance: ${signal.ai_relevance_reason}

Content:
${signal.source.content.substring(0, 4000)}

Provide your skeptical analysis as JSON.`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      system: SKEPTICAL_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = this.parseResponse(text);

    return {
      perspective: 'skeptical',
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
