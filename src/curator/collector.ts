import { CuratorMemory } from './curator-memory.js';
import { FeedManager } from './feed-manager.js';

interface ExaResult {
  title: string;
  url: string;
  text?: string;
  publishedDate?: string;
}

/**
 * Collect news from active sources and add to feed.
 * This is designed to be called from Claude Code / terminal.
 * In production, Exa API would be called directly.
 * For now, this provides the structure for manual or AI-assisted collection.
 */
export async function curatorCollect(dataDir = './data/curator'): Promise<void> {
  console.log('\n  Curator Collect — 소스 수집 시작\n');

  const memory = new CuratorMemory(dataDir);
  await memory.load();
  const feed = new FeedManager(memory, dataDir);
  await feed.load();

  const profile = memory.getProfile();
  const activeSources = memory.getSources('active');

  console.log(`  프로필: ${profile.name}`);
  console.log(`  활성 소스: ${activeSources.length}개`);
  console.log(`  필터링 컨텍스트: ${memory.getFilteringContext()}\n`);

  // Display active sources for manual collection guidance
  console.log('  --- 활성 소스 목록 (검색 쿼리로 활용) ---\n');

  for (const source of activeSources) {
    const trustBar = '█'.repeat(Math.round(source.trust_score * 10)) + '░'.repeat(10 - Math.round(source.trust_score * 10));
    console.log(`  ${source.name}`);
    console.log(`    쿼리: ${source.url_pattern}`);
    console.log(`    신뢰도: [${trustBar}] ${(source.trust_score * 100).toFixed(0)}%`);
    console.log(`    통계: 등장 ${source.stats.times_picked} | 읽음 ${source.stats.times_read} | 메모 ${source.stats.times_memo} | 무시 ${source.stats.times_dismissed}`);
    if (source.curator_note) console.log(`    노트: ${source.curator_note}`);
    console.log();
  }

  // Domain interest weights for filtering
  console.log('  --- 관심 도메인 가중치 ---\n');
  const sortedDomains = Object.entries(profile.interests.domains)
    .sort(([, a], [, b]) => b - a);
  for (const [domain, weight] of sortedDomains) {
    const bar = '█'.repeat(Math.round(weight * 10)) + '░'.repeat(10 - Math.round(weight * 10));
    console.log(`  ${domain.padEnd(16)} [${bar}] ${(weight * 100).toFixed(0)}%`);
  }

  console.log('\n  ---');
  console.log('  수집된 뉴스를 추가하려면:');
  console.log('    1. 브라우저에서 http://localhost:3847 접속');
  console.log('    2. URL 입력 바에 링크 붙여넣기');
  console.log('    3. 또는 Claude Code에서 직접 API 호출:');
  console.log('       curl -X POST http://localhost:3847/api/feed \\');
  console.log('         -H "Content-Type: application/json" \\');
  console.log('         -d \'{"url":"...", "title":"...", "summary":"..."}\'');
  console.log('\n  현재 피드 상태:');

  const stats = feed.getStats();
  console.log(`    전체: ${stats.total}개 | 안읽음: ${stats.unread}개 | 북마크: ${stats.bookmarked}개`);
  console.log(`    AI 수집: ${stats.ai_found}개 | 직접 추가: ${stats.curator_found}개\n`);
}

/**
 * Add items to feed programmatically (for AI-assisted collection).
 * This is called when Claude Code collects news and wants to push them to the feed.
 */
export async function addCollectedItems(
  items: Array<{
    url: string;
    title: string;
    summary: string;
    source_origin: string;
    why_picked?: string;
  }>,
  dataDir = './data/curator'
): Promise<{ added: number; skipped: number }> {
  const memory = new CuratorMemory(dataDir);
  await memory.load();
  const feed = new FeedManager(memory, dataDir);
  await feed.load();

  let added = 0;
  let skipped = 0;

  for (const item of items) {
    if (feed.hasUrl(item.url)) {
      console.log(`  skip (duplicate): ${item.title}`);
      skipped++;
      continue;
    }

    try {
      feed.addItem({
        url: item.url,
        title: item.title,
        summary: item.summary,
        source_origin: item.source_origin,
        found_by: 'ai',
        why_picked: item.why_picked,
      });
      console.log(`  added: ${item.title}`);
      added++;
    } catch (err: any) {
      console.log(`  failed: ${item.title} — ${err.message}`);
      skipped++;
    }
  }

  await Promise.all([feed.save(), memory.saveSources()]);
  console.log(`\n  결과: ${added}개 추가, ${skipped}개 건너뜀`);
  return { added, skipped };
}
