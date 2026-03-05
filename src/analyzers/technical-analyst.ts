import Anthropic from '@anthropic-ai/sdk';
import dayjs from 'dayjs';
import type { DetectedSignal, AnalysisPerspective, ChangeType } from '../types/index.js';

const TECHNICAL_SYSTEM_PROMPT = `You are a Technical AI Analyst specializing in frontier AI development patterns.

Your role is to analyze AI events from a purely TECHNICAL perspective:

1. **Pattern Classification**: Is this a continuation, acceleration, disruption, emergence, or convergence of technical trends?
2. **Technical Substance**: What is the actual technical contribution? Strip away marketing language.
3. **Architecture Implications**: Does this change how models are built, trained, or deployed?
4. **Scaling Implications**: What does this mean for scaling laws, compute requirements, or efficiency?
5. **Research Direction**: Does this open new research directions or close existing ones?

RULES:
- Focus ONLY on technical merit and implications
- Ignore market positioning and business strategy
- Be skeptical of claimed benchmarks without methodology details
- Distinguish between engineering improvements and scientific breakthroughs
- Reference specific technical concepts (architectures, training methods, etc.)

Respond in JSON:
{
  "analysis": "detailed technical analysis (3-5 paragraphs)",
  "key_points": ["point1", "point2", "point3"],
  "confidence": 0.0-1.0,
  "pattern_classification": "continuation" | "acceleration" | "disruption" | "emergence" | "convergence"
}`;

export class TechnicalAnalyst {
  private client: Anthropic;
  private model: string;

  constructor(model: string = 'claude-sonnet-4-20250514') {
    this.client = new Anthropic();
    this.model = model;
  }

  async analyze(signal: DetectedSignal): Promise<AnalysisPerspective> {
    const userPrompt = `Analyze this AI signal from a technical perspective:

Signal Type: ${signal.signal_type}
Signal Strength: ${signal.signal_strength}
Source Title: ${signal.source.title}
Source Origin: ${signal.source.origin}
AI Relevance: ${signal.ai_relevance_reason}

Content:
${signal.source.content.substring(0, 4000)}

Provide your technical analysis as JSON.`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      system: TECHNICAL_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = this.parseResponse(text);

    return {
      perspective: 'technical',
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
