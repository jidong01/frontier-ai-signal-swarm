import { SignalPipeline } from './pipeline/index.js';
import { WebCollector } from './collectors/index.js';
import { AI_SOURCES } from './config/sources.js';
import type { RawSource } from './types/index.js';

async function main() {
  const command = process.argv[2] || 'pipeline';
  const topic = process.argv.slice(3).join(' ');

  console.log(`\n  Command: ${command}`);
  if (topic) console.log(`  Topic: ${topic}`);

  const pipeline = new SignalPipeline({
    outputDir: './output',
    dataDir: './data/memory',
    filterWeak: true,
  });

  const collector = new WebCollector();

  switch (command) {
    case 'pipeline':
    case 'run': {
      // Full pipeline with web collection
      let sources: RawSource[];
      if (topic) {
        console.log(`\n  Collecting sources for topic: "${topic}"...`);
        sources = await collector.collectByTopic(topic);
      } else {
        console.log('\n  Collecting from all configured AI sources...');
        sources = await collector.collectAll(AI_SOURCES, 3);
      }

      if (sources.length === 0) {
        console.log('  No sources collected. Try providing a topic or check API keys.');
        console.log('  Usage: npm run pipeline -- "OpenAI GPT-5 release"');
        console.log('  Or use manual input: npm start manual "Title" "Content" "URL"');
        process.exit(1);
      }

      await pipeline.run(sources);
      break;
    }

    case 'manual': {
      // Manual input mode for testing without web APIs
      const title = process.argv[3] || 'Test Signal';
      const content = process.argv[4] || '';
      const url = process.argv[5] || 'manual-input';

      if (!content) {
        console.log('  Usage: npm start manual "Title" "Content" "URL"');
        process.exit(1);
      }

      const source = collector.collectFromText(
        title, content, url, 'news', 'manual'
      );

      await pipeline.run([source]);
      break;
    }

    case 'demo': {
      // Demo mode with a hardcoded real AI news item
      console.log('\n  Running demo with sample AI news...\n');

      const demoSources: RawSource[] = [
        collector.collectFromText(
          'Anthropic Releases Claude Opus 4.6 with Enhanced Agentic Capabilities',
          `Anthropic has released Claude Opus 4.6, the latest iteration of its flagship AI model. The new model demonstrates significant improvements in agentic coding tasks, complex reasoning, and multi-step problem solving. Key highlights include: improved ability to use tools and navigate complex codebases, better performance on software engineering benchmarks (SWE-bench), enhanced instruction following for long-running autonomous tasks, and new capabilities for parallel tool use. The model is available through Anthropic's API and Claude.ai. This release continues Anthropic's focus on building reliable, steerable AI systems that can handle complex real-world tasks. Industry analysts note this represents a significant step in the "agentic AI" trend, where models are increasingly used as autonomous agents rather than simple chat assistants.`,
          'https://anthropic.com/news/claude-opus-4-6',
          'announcement',
          'anthropic.com'
        ),
        collector.collectFromText(
          'Google DeepMind Publishes Gemini 2.5 Technical Report Showing Advances in Long-Context Reasoning',
          `Google DeepMind has published the technical report for Gemini 2.5, revealing architectural innovations in long-context processing and reasoning capabilities. The model introduces a novel attention mechanism that enables efficient processing of up to 2 million tokens while maintaining reasoning quality. Key findings: 1) A new "thinking" mode that allows the model to perform extended internal reasoning before responding, 2) Improved mathematical and scientific reasoning benchmarks, 3) Native multimodal processing across text, images, video, and audio with improved cross-modal reasoning, 4) Significant improvements in code generation and software engineering tasks. The report also discusses safety evaluations and alignment techniques used during training. This release intensifies the competition in frontier AI models between Google, Anthropic, and OpenAI.`,
          'https://deepmind.google/research/gemini-2-5',
          'paper',
          'deepmind.google'
        ),
        collector.collectFromText(
          'SoftBank Leads $40B AI Infrastructure Investment Round Targeting US Data Centers',
          `SoftBank Group has announced a $40 billion investment commitment focused on AI infrastructure development in the United States. The investment will fund construction of new data centers optimized for AI training and inference workloads, with a particular focus on next-generation GPU clusters and custom AI accelerator chips. Key details: Partnership with major cloud providers for distributed compute infrastructure, focus on energy-efficient cooling technologies for high-density AI compute, plans for 5 new hyperscale data centers across the US by 2028, collaboration with chip manufacturers for custom AI silicon. This represents one of the largest single commitments to AI infrastructure and signals the continued scaling of compute resources for frontier AI model training. Industry observers note the investment reflects growing conviction that AI compute demand will continue to grow exponentially.`,
          'https://techcrunch.com/softbank-ai-infrastructure',
          'news',
          'techcrunch.com'
        ),
      ];

      await pipeline.run(demoSources);
      break;
    }

    case 'memory': {
      // Show memory stats
      const { SignalMemory } = await import('./memory/index.js');
      const mem = new SignalMemory('./data/memory');
      await mem.load();
      const stats = mem.getStats();
      console.log('\n  Signal Memory Statistics:');
      console.log(`    Total signals: ${stats.total_signals}`);
      console.log(`    Total patterns: ${stats.total_patterns}`);
      console.log(`    Unique themes: ${stats.unique_themes}`);
      console.log(`    Recurring themes: ${stats.recurring_themes}`);
      if (stats.top_themes.length > 0) {
        console.log('    Top themes:');
        stats.top_themes.forEach(t => {
          console.log(`      - ${t.theme} (${t.count}x)`);
        });
      }
      const trends = mem.getLongTermTrendCandidates();
      if (trends.length > 0) {
        console.log('\n    Long-term trend candidates:');
        trends.forEach(t => {
          console.log(`      - [${t.pattern_type}] ${t.description} (${t.occurrence_count}x)`);
        });
      }
      break;
    }

    default:
      console.log(`
  Frontier AI Signal Swarm -- AI Trend Intelligence Engine

  Usage:
    npm start pipeline [topic]   Full pipeline (collect -> detect -> analyze -> synthesize -> dossier)
    npm start manual "Title" "Content" "URL"   Analyze manual input
    npm start demo               Run with sample AI news data
    npm start memory             Show signal memory statistics

  Examples:
    npm start pipeline "OpenAI GPT-5"
    npm start demo
    npm start manual "Title" "Full article content here" "https://example.com"
      `);
  }
}

main().catch(error => {
  console.error('Pipeline error:', error);
  process.exit(1);
});
