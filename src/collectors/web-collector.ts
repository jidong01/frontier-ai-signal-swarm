import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import type { RawSource } from '../types/signal.js';
import type { SourceConfig } from '../config/sources.js';

/**
 * Exa search result shape (partial, only fields we use).
 */
interface ExaResult {
  id: string;
  url: string;
  title: string;
  text?: string;
  publishedDate?: string;
}

interface ExaSearchResponse {
  results: ExaResult[];
}

/**
 * WebCollector gathers RawSource records from web sources.
 *
 * For MVP, two modes of operation are supported:
 *
 * 1. Exa Web Search API  – activated when the EXA_API_KEY env variable is set.
 *    Performs a live `POST /search` request for each query in a SourceConfig.
 *
 * 2. Manual / programmatic input – via `collectFromText()`.
 *    Useful when raw content is provided directly (e.g., piped from another
 *    step in the pipeline or constructed during testing).
 */
export class WebCollector {
  private readonly exaEndpoint = 'https://api.exa.ai/search';
  private readonly exaApiKey: string | undefined;

  constructor() {
    this.exaApiKey = process.env.EXA_API_KEY;
    if (!this.exaApiKey) {
      console.warn(
        '[WebCollector] EXA_API_KEY not set – live web search disabled. ' +
          'Use collectFromText() for manual input.'
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Collect sources for a single SourceConfig by running each of its
   * search_queries through the Exa API (or returning an empty array when
   * the API key is absent).
   */
  async collectFromSource(
    config: SourceConfig,
    maxResults: number = 5
  ): Promise<RawSource[]> {
    if (!this.exaApiKey) {
      console.warn(
        `[WebCollector] Skipping source "${config.name}" – no EXA_API_KEY.`
      );
      return [];
    }

    const results: RawSource[] = [];

    for (const query of config.search_queries) {
      try {
        const batch = await this.searchExa(query, config, maxResults);
        results.push(...batch);
      } catch (err) {
        console.error(
          `[WebCollector] Error searching query "${query}" for source "${config.name}":`,
          err instanceof Error ? err.message : err
        );
        // Continue with remaining queries rather than crashing.
      }
    }

    return results;
  }

  /**
   * Collect from all provided SourceConfig entries, optionally capping results
   * per source.
   */
  async collectAll(
    sources: SourceConfig[],
    maxPerSource: number = 5
  ): Promise<RawSource[]> {
    const all: RawSource[] = [];

    for (const source of sources) {
      try {
        const batch = await this.collectFromSource(source, maxPerSource);
        all.push(...batch);
        console.log(
          `[WebCollector] Collected ${batch.length} results from "${source.name}".`
        );
      } catch (err) {
        console.error(
          `[WebCollector] Failed to collect from source "${source.name}":`,
          err instanceof Error ? err.message : err
        );
      }
    }

    return all;
  }

  /**
   * Ad-hoc single-topic collection.  Runs the topic string through Exa as a
   * general news search and maps results to RawSource records tagged as
   * 'news' / 'ad_hoc'.
   */
  async collectByTopic(topic: string): Promise<RawSource[]> {
    if (!this.exaApiKey) {
      console.warn(
        `[WebCollector] Skipping topic "${topic}" – no EXA_API_KEY.`
      );
      return [];
    }

    const adHocConfig: SourceConfig = {
      name: `Ad-hoc: ${topic}`,
      type: 'news',
      search_queries: [topic],
      origin: 'ad_hoc',
    };

    return this.collectFromSource(adHocConfig, 10);
  }

  /**
   * Manual input pathway.  Use this when you already have the raw text and URL
   * and simply need to wrap it in the RawSource envelope.
   */
  collectFromText(
    title: string,
    content: string,
    url: string,
    sourceType: RawSource['source_type'],
    origin: string,
    publishedAt?: string
  ): RawSource {
    const now = dayjs();

    return {
      source_id: uuidv4(),
      url,
      title,
      content,
      source_type: sourceType,
      published_at: publishedAt ?? now.toISOString(),
      collected_at: now.toISOString(),
      origin,
    };
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Execute a single Exa `/search` request and map results to RawSource[].
   */
  private async searchExa(
    query: string,
    config: SourceConfig,
    numResults: number
  ): Promise<RawSource[]> {
    const body = {
      query,
      numResults,
      contents: {
        text: { maxCharacters: 2000 },
      },
      useAutoprompt: true,
    };

    const response = await fetch(this.exaEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.exaApiKey as string,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Exa API returned ${response.status} ${response.statusText}: ${errorText}`
      );
    }

    const data = (await response.json()) as ExaSearchResponse;
    const collectedAt = dayjs().toISOString();

    return data.results.map((result) =>
      this.mapExaResultToRawSource(result, config, collectedAt)
    );
  }

  /**
   * Map a single Exa result to the RawSource interface.
   */
  private mapExaResultToRawSource(
    result: ExaResult,
    config: SourceConfig,
    collectedAt: string
  ): RawSource {
    // Exa returns ISO date strings; fall back to now if absent.
    const publishedAt = result.publishedDate
      ? dayjs(result.publishedDate).toISOString()
      : collectedAt;

    return {
      source_id: uuidv4(),
      url: result.url,
      title: result.title ?? '(no title)',
      content: result.text ?? '',
      source_type: config.type,
      published_at: publishedAt,
      collected_at: collectedAt,
      origin: config.origin,
    };
  }
}
