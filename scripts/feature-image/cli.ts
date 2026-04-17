import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import { parseArgs } from 'util';
import type { ImageProvider, ProviderName, OutputFormat } from './types.js';
import { OUTPUT_FORMATS } from './types.js';
import { DalleProvider } from './providers/dalle.js';
import { FluxProvider } from './providers/flux.js';
import { compositeImage } from './overlay.js';
import { applyFilters, resolveFilters, resolvePreset, PRESETS } from './filters/index.js';
import type { Filter } from './filters/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..', '..');

/** Load API keys from ~/.config/audiocontrol/ if env vars aren't already set. */
function loadApiKeysFromConfig(): void {
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

loadApiKeysFromConfig();

function createProvider(name: ProviderName): ImageProvider {
  switch (name) {
    case 'dalle':
      return new DalleProvider();
    case 'flux':
      return new FluxProvider();
  }
}

function printUsage(): void {
  console.log(`
Usage: tsx scripts/feature-image/cli.ts --prompt <text> [options]

Modes:
  Background only (default):
    --prompt <text> --provider <dalle|flux|both>

  Full feature image (background + text overlay):
    --prompt <text> --title <text> [--subtitle <text>] --formats <og,youtube,instagram>

  Overlay only (use existing background):
    --background <path> --title <text> [--subtitle <text>] --formats <og,youtube,instagram>

Options:
  --prompt       Text prompt for AI background generation
  --provider     Provider: dalle, flux, or both (default: dalle)
  --title        Title text for overlay (enables overlay mode)
  --subtitle     Subtitle text for overlay
  --background   Path to existing background image (skips AI generation)
  --formats      Comma-separated output formats: og,youtube,instagram (default: all)
  --filters      Comma-separated filter names: scanlines,vignette,grain,grade
  --preset       Named preset: ${Object.keys(PRESETS).join(', ')}
  --output       Output directory (default: public/images/generated)
  --name         Base filename for output (default: generated)
  --width        Generation width in pixels (default: 1792)
  --height       Generation height in pixels (default: 1024)
  --help         Show this help message
`);
}

function parseFormats(formatStr: string): OutputFormat[] {
  const names = formatStr.split(',').map(s => s.trim());
  const formats: OutputFormat[] = [];
  for (const name of names) {
    const found = OUTPUT_FORMATS.find(f => f.name === name);
    if (!found) {
      throw new Error(`Unknown format "${name}". Valid formats: ${OUTPUT_FORMATS.map(f => f.name).join(', ')}`);
    }
    formats.push(found);
  }
  return formats;
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      prompt: { type: 'string' },
      provider: { type: 'string', default: 'dalle' },
      title: { type: 'string' },
      subtitle: { type: 'string' },
      background: { type: 'string' },
      formats: { type: 'string', default: 'og,youtube,instagram' },
      filters: { type: 'string' },
      preset: { type: 'string' },
      output: { type: 'string', default: 'public/images/generated' },
      name: { type: 'string', default: 'generated' },
      width: { type: 'string', default: '1792' },
      height: { type: 'string', default: '1024' },
      help: { type: 'boolean', default: false },
    },
    strict: true,
  });

  if (values.help) {
    printUsage();
    return;
  }

  const hasTitle = !!values.title;
  const hasBackground = !!values.background;
  const hasPrompt = !!values.prompt;

  if (!hasPrompt && !hasBackground) {
    console.error('Error: either --prompt or --background is required\n');
    printUsage();
    process.exit(1);
  }

  const providerArg = values.provider as string;
  if (!['dalle', 'flux', 'both'].includes(providerArg)) {
    console.error(`Error: --provider must be "dalle", "flux", or "both" (got "${providerArg}")\n`);
    printUsage();
    process.exit(1);
  }

  const outputDir = join(rootDir, values.output as string);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const width = parseInt(values.width as string, 10);
  const height = parseInt(values.height as string, 10);
  const baseName = values.name as string;
  const outputFormats = parseFormats(values.formats as string);

  // Resolve filter chain
  let filters: Filter[] = [];
  if (values.preset) {
    filters = resolvePreset(values.preset as string);
  } else if (values.filters) {
    filters = resolveFilters(values.filters as string);
  }
  if (filters.length > 0) {
    console.log(`Filters: ${filters.map(f => f.name).join(' → ')}`);
  }

  // Resolve background image(s)
  const backgrounds: Array<{ name: string; buffer: Buffer }> = [];

  if (hasBackground) {
    // Use existing background file
    const bgPath = values.background as string;
    if (!existsSync(bgPath)) {
      console.error(`Error: background file not found: ${bgPath}`);
      process.exit(1);
    }
    backgrounds.push({ name: '', buffer: readFileSync(bgPath) });
  } else {
    // Generate background(s) from AI
    const prompt = values.prompt as string;
    const providerNames: ProviderName[] = providerArg === 'both'
      ? ['dalle', 'flux']
      : [providerArg as ProviderName];

    for (const providerName of providerNames) {
      console.log(`\nGenerating background with ${providerName}...`);
      const provider = createProvider(providerName);
      const result = await provider.generate({ prompt, width, height });

      const suffix = providerNames.length > 1 ? `-${providerName}` : '';
      backgrounds.push({ name: suffix, buffer: result.buffer });

      // Save raw background
      const rawPath = join(outputDir, `${baseName}${suffix}-raw.png`);
      writeFileSync(rawPath, result.buffer);
      console.log(`  Raw background: ${rawPath} (${result.width}x${result.height})`);
    }
  }

  // Apply filters to backgrounds (before overlay so text stays sharp)
  if (filters.length > 0) {
    for (const bg of backgrounds) {
      const before = bg.buffer;
      bg.buffer = await applyFilters(before, filters);

      const suffix = bg.name ? bg.name : '';
      const filteredPath = join(outputDir, `${baseName}${suffix}-filtered.png`);
      writeFileSync(filteredPath, bg.buffer);
      console.log(`  Filtered background: ${filteredPath}`);
    }
  }

  if (!hasTitle) {
    if (hasBackground && filters.length === 0) {
      console.log('No --title and no --filters specified. Nothing to do.');
    }
    console.log('\nDone!');
    return;
  }

  // Overlay mode: composite text onto each background in each format
  const title = values.title as string;
  const subtitle = values.subtitle;

  for (const bg of backgrounds) {
    for (const format of outputFormats) {
      const suffix = bg.name ? `${bg.name}` : '';
      const outputPath = join(outputDir, `${baseName}${suffix}-${format.name}.png`);

      console.log(`  Compositing ${format.name} (${format.width}x${format.height})...`);
      const result = await compositeImage({
        title,
        subtitle,
        backgroundBuffer: bg.buffer,
        format,
      });

      writeFileSync(outputPath, result);
      console.log(`  Saved: ${outputPath}`);
    }
  }

  console.log('\nDone!');
}

main().catch((error: Error) => {
  console.error(`\nError: ${error.message}`);
  process.exit(1);
});
