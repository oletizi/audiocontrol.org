import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { ImageProvider, ProviderName, OutputFormat } from './types.js';
import { OUTPUT_FORMATS } from './types.js';
import { DalleProvider } from './providers/dalle.js';
import { FluxProvider } from './providers/flux.js';
import { compositeImage } from './overlay.js';
import { applyFilters, resolveFilters, resolvePreset } from './filters/index.js';
import type { Filter } from './filters/index.js';

export type ProviderSelection = ProviderName | 'both';

/** Input to `generateFeatureImage()` — the programmatic generation API. */
export interface GenerateRequest {
  /** Text prompt for AI generation. Either this or `backgroundPath` must be set. */
  prompt?: string;
  /** Path to an existing background image (absolute). Skips AI generation. */
  backgroundPath?: string;
  /** Provider selection when generating from `prompt`. Default: 'dalle'. */
  provider?: ProviderSelection;
  /** Requested generation width (provider may clamp). Default: 1792. */
  width?: number;
  /** Requested generation height (provider may clamp). Default: 1024. */
  height?: number;
  /** Named filter preset. Takes precedence over `filters`. */
  preset?: string;
  /** Comma-separated filter names (ignored if `preset` is set). */
  filters?: string;
  /** Title for the text overlay. If absent, overlay is skipped. */
  title?: string;
  /** Subtitle for the text overlay. */
  subtitle?: string;
  /** Absolute path to output directory. Created if missing. */
  outputDir: string;
  /** Base filename for outputs. Default: 'generated'. */
  baseName?: string;
  /** Comma-separated format names. Default: all. */
  formats?: string;
}

export interface CompositedOutput {
  provider: ProviderName | null;
  format: string;
  path: string;
}

export interface GenerateResult {
  /** Raw provider outputs (one per provider when generating from prompt) */
  raw: string[];
  /** Filtered backgrounds (one per provider, only when filters were applied) */
  filtered: string[];
  /** Final composited images (formats × providers) — only when `title` was set */
  composited: CompositedOutput[];
  /** Which providers ran */
  providersRun: ProviderName[];
  /** Names of filters applied, in order */
  filtersApplied: string[];
  /** Total wall-clock duration in milliseconds */
  durationMs: number;
}

/**
 * Load API keys from `~/.config/audiocontrol/` if the corresponding env vars
 * aren't already set. Idempotent.
 */
export function loadApiKeysFromConfig(): void {
  const configDir = join(homedir(), '.config', 'audiocontrol');
  const keyFiles: Array<[string, string]> = [
    ['OPENAI_API_KEY', 'openai-key.txt'],
    ['BFL_API_KEY', 'flux-key.txt'],
  ];
  for (const [envVar, fileName] of keyFiles) {
    if (process.env[envVar]) continue;
    const keyPath = join(configDir, fileName);
    if (existsSync(keyPath)) {
      process.env[envVar] = readFileSync(keyPath, 'utf-8').trim();
    }
  }
}

function createProvider(name: ProviderName): ImageProvider {
  switch (name) {
    case 'dalle':
      return new DalleProvider();
    case 'flux':
      return new FluxProvider();
  }
}

function parseFormatsList(formatStr: string): OutputFormat[] {
  const names = formatStr.split(',').map(s => s.trim()).filter(Boolean);
  const formats: OutputFormat[] = [];
  for (const name of names) {
    const found = OUTPUT_FORMATS.find(f => f.name === name);
    if (!found) {
      throw new Error(
        `Unknown format "${name}". Valid formats: ${OUTPUT_FORMATS.map(f => f.name).join(', ')}`,
      );
    }
    formats.push(found);
  }
  return formats;
}

/**
 * End-to-end feature image generation pipeline.
 * Called by both the CLI and the dev-only HTTP endpoint.
 */
export async function generateFeatureImage(request: GenerateRequest): Promise<GenerateResult> {
  const startedAt = Date.now();

  const {
    prompt,
    backgroundPath,
    provider = 'dalle',
    width = 1792,
    height = 1024,
    preset,
    filters: filterSpec,
    title,
    subtitle,
    outputDir,
    baseName = 'generated',
    formats = 'og,youtube,instagram',
  } = request;

  if (!prompt && !backgroundPath) {
    throw new Error('generateFeatureImage: either `prompt` or `backgroundPath` is required');
  }

  if (!['dalle', 'flux', 'both'].includes(provider)) {
    throw new Error(`Invalid provider "${provider}"`);
  }

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const outputFormats = parseFormatsList(formats);

  // Resolve filter chain
  let filters: Filter[] = [];
  if (preset) {
    filters = resolvePreset(preset);
  } else if (filterSpec) {
    filters = resolveFilters(filterSpec);
  }

  const result: GenerateResult = {
    raw: [],
    filtered: [],
    composited: [],
    providersRun: [],
    filtersApplied: filters.map(f => f.name),
    durationMs: 0,
  };

  // Gather backgrounds (either from file or from providers)
  const backgrounds: Array<{ providerName: ProviderName | null; suffix: string; buffer: Buffer }> = [];

  if (backgroundPath) {
    if (!existsSync(backgroundPath)) {
      throw new Error(`Background file not found: ${backgroundPath}`);
    }
    backgrounds.push({ providerName: null, suffix: '', buffer: readFileSync(backgroundPath) });
  } else {
    const providerNames: ProviderName[] =
      provider === 'both' ? ['dalle', 'flux'] : [provider as ProviderName];
    result.providersRun = providerNames;

    for (const providerName of providerNames) {
      const providerInstance = createProvider(providerName);
      const genResult = await providerInstance.generate({ prompt: prompt!, width, height });
      const suffix = providerNames.length > 1 ? `-${providerName}` : '';

      backgrounds.push({ providerName, suffix, buffer: genResult.buffer });

      const rawPath = join(outputDir, `${baseName}${suffix}-raw.png`);
      writeFileSync(rawPath, genResult.buffer);
      result.raw.push(rawPath);
    }
  }

  // Apply filters to each background (before overlay so text stays sharp)
  if (filters.length > 0) {
    for (const bg of backgrounds) {
      bg.buffer = await applyFilters(bg.buffer, filters);
      const filteredPath = join(outputDir, `${baseName}${bg.suffix}-filtered.png`);
      writeFileSync(filteredPath, bg.buffer);
      result.filtered.push(filteredPath);
    }
  }

  // Composite title overlay in each requested format
  if (title) {
    for (const bg of backgrounds) {
      for (const format of outputFormats) {
        const outPath = join(outputDir, `${baseName}${bg.suffix}-${format.name}.png`);
        const buffer = await compositeImage({
          title,
          subtitle,
          backgroundBuffer: bg.buffer,
          format,
        });
        writeFileSync(outPath, buffer);
        result.composited.push({
          provider: bg.providerName,
          format: format.name,
          path: outPath,
        });
      }
    }
  }

  result.durationMs = Date.now() - startedAt;
  return result;
}
