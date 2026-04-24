import { join, dirname, isAbsolute } from 'path';
import { fileURLToPath } from 'url';
import { parseArgs } from 'util';
import { PRESETS } from './filters/index.js';
import { generateFeatureImage, loadApiKeysFromConfig } from './pipeline.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..', '..');

loadApiKeysFromConfig();

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
  --output       Output directory (default: src/sites/editorialcontrol/public/images/generated)
  --name         Base filename for output (default: generated)
  --width        Generation width in pixels (default: 1792)
  --height       Generation height in pixels (default: 1024)
  --help         Show this help message
`);
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
      output: { type: 'string', default: 'src/sites/editorialcontrol/public/images/generated' },
      name: { type: 'string', default: 'generated' },
      width: { type: 'string', default: '1792' },
      height: { type: 'string', default: '1024' },
      site: { type: 'string', default: 'editorialcontrol' },
      help: { type: 'boolean', default: false },
    },
    strict: true,
  });

  if (values.help) {
    printUsage();
    return;
  }

  if (!values.prompt && !values.background) {
    console.error('Error: either --prompt or --background is required\n');
    printUsage();
    process.exit(1);
  }

  const outputArg = values.output as string;
  const outputDir = isAbsolute(outputArg) ? outputArg : join(rootDir, outputArg);
  const backgroundPathArg = values.background;
  const backgroundPath = backgroundPathArg
    ? (isAbsolute(backgroundPathArg) ? backgroundPathArg : join(rootDir, backgroundPathArg))
    : undefined;

  const result = await generateFeatureImage({
    prompt: values.prompt,
    backgroundPath,
    provider: values.provider as 'dalle' | 'flux' | 'both',
    width: parseInt(values.width as string, 10),
    height: parseInt(values.height as string, 10),
    preset: values.preset,
    filters: values.filters,
    title: values.title,
    subtitle: values.subtitle,
    outputDir,
    baseName: values.name as string,
    formats: values.formats as string,
    site: values.site as 'audiocontrol' | 'editorialcontrol',
  });

  if (result.filtersApplied.length > 0) {
    console.log(`Filters: ${result.filtersApplied.join(' → ')}`);
  }
  for (const path of result.raw) console.log(`  Raw background: ${path}`);
  for (const path of result.filtered) console.log(`  Filtered background: ${path}`);
  for (const c of result.composited) console.log(`  Saved ${c.format}: ${c.path}`);
  console.log(`\nDone in ${result.durationMs}ms.`);
}

main().catch((error: Error) => {
  console.error(`\nError: ${error.message}`);
  process.exit(1);
});
