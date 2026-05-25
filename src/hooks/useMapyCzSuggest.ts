import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const API_KEY = import.meta.env.VITE_MAPY_API_KEY as string | undefined;
const BASE = 'https://api.mapy.com/v1/suggest';
const PROXY_BASE = (import.meta.env.VITE_MAPY_SUGGEST_URL as string | undefined)?.trim();
const DEBOUNCE_MS = 300;
const MIN_LEN = 3;
const CACHE_LIMIT = 200;
/** TTL-capped cache (~10 min) limits stale suggestions when the language changes during long sessions. */
const CACHE_TTL_MS = 10 * 60 * 1000;
const MAPY_LANGS = new Set(['cs', 'de', 'el', 'en', 'es', 'fr', 'it', 'nl', 'pl', 'pt', 'ru', 'sk', 'tr', 'uk']);

export interface MapyRegional {
  name: string;
  type: string;
  isoCode?: string;
}

export interface MapySuggestion {
  id: string;
  name: string;
  label: string;
  location: string;
  position: { lat: number; lon: number };
  zip: string | null;
  regionalStructure: MapyRegional[];
}

interface SuggestApiResponse {
  items?: Array<{
    id?: string;
    name: string;
    label: string;
    location: string;
    position: { lat: number; lon: number };
    zip?: string | null;
    regionalStructure?: MapyRegional[];
  }>;
}

interface CacheEntry {
  items: MapySuggestion[];
  storedAt: number;
}

const cache = new Map<string, CacheEntry>();

function mergeSuggestEndpoint(endpoint: string, params: URLSearchParams): string {
  const trimmed = endpoint.trim();
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    url = new URL(trimmed, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  }
  params.forEach((value, key) => {
    url.searchParams.append(key, value);
  });
  return url.toString();
}

function writeCache(key: string, items: MapySuggestion[]) {
  if (cache.size >= CACHE_LIMIT) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { items, storedAt: Date.now() });
}

function readCache(key: string): MapySuggestion[] | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.storedAt > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.items;
}

export function useMapyCzSuggest(query: string) {
  const { i18n } = useTranslation();
  const [results, setResults] = useState<MapySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const requestSeqRef = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_LEN || (!API_KEY && !PROXY_BASE)) {
      setResults([]);
      setLoading(false);
      setError(false);
      return;
    }

    const langCode = i18n.language.split('-')[0];
    const lang = MAPY_LANGS.has(langCode) ? langCode : 'en';
    const cacheKey = `${lang}::${trimmed.toLowerCase()}`;
    const cached = readCache(cacheKey);
    if (cached) {
      setResults(cached);
      setLoading(false);
      setError(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestSeqRef.current;

    const timer = setTimeout(async () => {
      if (requestSeqRef.current === requestId) {
        setLoading(true);
        setError(false);
      }
      try {
        const params = new URLSearchParams();
        params.set('query', trimmed);
        params.set('lang', lang);
        params.set('limit', '6');
        params.append('type', 'regional.address');
        params.append('type', 'poi');
        params.append('locality', 'cz');
        if (!PROXY_BASE && API_KEY) params.set('apikey', API_KEY);

        const endpoint = PROXY_BASE || BASE;
        const url = mergeSuggestEndpoint(endpoint, params);
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`http_${res.status}`);
        const data = (await res.json()) as SuggestApiResponse;
        const items: MapySuggestion[] = (data.items ?? []).map((it, index) => ({
          name: it.name,
          label: it.label,
          location: it.location,
          position: it.position,
          zip: it.zip ?? null,
          regionalStructure: it.regionalStructure ?? [],
          id: it.id ?? `${it.position.lat}_${it.position.lon}_${it.name}_${index}`,
        }));
        writeCache(cacheKey, items);
        if (requestSeqRef.current === requestId) setResults(items);
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        if (requestSeqRef.current === requestId) {
          setResults([]);
          setError(true);
        }
      } finally {
        if (requestSeqRef.current === requestId) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, i18n.language]);

  return { results, loading, error };
}
