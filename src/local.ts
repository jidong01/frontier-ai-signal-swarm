// Entry point for local pipeline (no API key needed)
// Usage: npx tsx src/local.ts

import { LocalPipeline } from './pipeline/local-pipeline.js';

async function main() {
  const command = process.argv[2] || 'help';

  const pipeline = new LocalPipeline('./output', './data/memory');

  switch (command) {
    case 'from-file': {
      const filePath = process.argv[3];
      if (!filePath) {
        console.log('Usage: npx tsx src/local.ts from-file <events.json>');
        process.exit(1);
      }
      const events = await pipeline.loadEventsFromFile(filePath);
      await pipeline.runFromEvents(events);
      break;
    }

    case 'to-html': {
      const inputPath = process.argv[3];
      if (!inputPath) {
        console.log('Usage: npx tsx src/local.ts to-html <input.md> [output.html]');
        process.exit(1);
      }

      const { readFile, writeFile } = await import('fs/promises');
      const { basename, dirname, join } = await import('path');
      const { wrapMarkdownInHTML } = await import('./dossier/html-template.js');
      const dayjs = (await import('dayjs')).default;

      // Determine output path
      let outputPath = process.argv[4];
      if (!outputPath) {
        const dir = dirname(inputPath);
        const base = basename(inputPath, '.md');
        outputPath = join(dir, `${base}.html`);
      }

      // Read markdown
      const markdown = await readFile(inputPath, 'utf-8');

      // Extract title from first H1 heading, or use filename
      const titleMatch = markdown.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : basename(inputPath, '.md');

      // Use file modification date or today
      const { stat } = await import('fs/promises');
      const fileStat = await stat(inputPath);
      const date = dayjs(fileStat.mtime).format('YYYY-MM-DD');

      // Generate HTML
      const html = wrapMarkdownInHTML(markdown, title, date);

      // Write output
      await writeFile(outputPath, html, 'utf-8');
      console.log(`  HTML generated: ${outputPath}`);
      break;
    }

    case 'memory': {
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
        stats.top_themes.forEach(t => console.log(`      - ${t.theme} (${t.count}x)`));
      }
      break;
    }

    case 'curator-serve': {
      await import('./curator/server.js');
      // Server auto-starts on import
      break;
    }

    case 'curator-collect': {
      const { curatorCollect } = await import('./curator/collector.js');
      await curatorCollect();
      break;
    }

    default:
      console.log(`
  Frontier AI Signal Swarm -- Local Pipeline
  (No API key needed -- Claude Code acts as analysis engine)

  Usage:
    npx tsx src/local.ts from-file <events.json>   Process pre-analyzed events
    npx tsx src/local.ts to-html <input.md> [out.html]  Convert markdown dossier to HTML
    npx tsx src/local.ts memory                     Show memory stats
    npx tsx src/local.ts curator-serve              Start curator workspace server
    npx tsx src/local.ts curator-collect            Show collection guidance

  The local pipeline is designed to work with Claude Code as the orchestrator.
  Claude Code collects news, analyzes from 3 perspectives, and feeds results
  into this pipeline for dossier generation and memory storage.
      `);
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
