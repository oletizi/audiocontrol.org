import satori from 'satori';
import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { OutputFormat } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..', '..');

/** Site brand colors (HSL from design-tokens.css, converted to hex/rgba) */
const BRAND = {
  /** --background: 220 20% 10% */
  background: '#141820',
  /** --foreground: 210 20% 82% */
  foreground: '#c4ced8',
  /** --primary: 174 60% 46% (teal) */
  primary: '#2fb8a8',
  /** --muted-foreground: 215 12% 48% */
  muted: '#6b7280',
  /** Panel overlay */
  panelBackground: 'rgba(10, 12, 16, 0.82)',
};

interface OverlayConfig {
  title: string;
  subtitle?: string;
  /** Background image buffer (PNG/JPEG) */
  backgroundBuffer: Buffer;
  /** Target output format */
  format: OutputFormat;
}

interface FontData {
  jetbrainsMono: ArrayBuffer;
  inter: ArrayBuffer;
}

let cachedFonts: FontData | null = null;

async function loadFonts(): Promise<FontData> {
  if (cachedFonts) return cachedFonts;

  // Fetch JetBrains Mono Bold for titles
  const jbResponse = await fetch(
    'https://fonts.gstatic.com/s/jetbrainsmono/v20/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.ttf'
  );
  const jetbrainsMono = await jbResponse.arrayBuffer();

  // Fetch Inter Bold from Google Fonts (satori requires TTF, not woff2)
  const interResponse = await fetch(
    'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYAZFhjQ.ttf'
  );
  const inter = await interResponse.arrayBuffer();

  cachedFonts = { jetbrainsMono, inter };
  return cachedFonts;
}

async function loadLogoDataUri(): Promise<string> {
  const svgPath = join(rootDir, 'src/sites/audiocontrol/public/favicon.svg');
  const pngBuffer = await sharp(svgPath)
    .resize(32, 32)
    .png()
    .toBuffer();
  return `data:image/png;base64,${pngBuffer.toString('base64')}`;
}

let cachedLogoUri: string | null = null;

/**
 * Compute font size that fits within maxWidth, given a character count.
 * Approximates character width as 0.6 * fontSize for monospace.
 */
function computeTitleFontSize(
  title: string,
  maxWidth: number,
  maxFontSize: number,
  minFontSize: number
): number {
  // Approximate: each character is ~0.6em wide for monospace
  const charWidthRatio = 0.6;
  for (let size = maxFontSize; size >= minFontSize; size -= 2) {
    const lineWidth = title.length * charWidthRatio * size;
    // Allow wrapping to ~2 lines
    if (lineWidth <= maxWidth * 2.2) {
      return size;
    }
  }
  return minFontSize;
}

/**
 * Generate a text overlay SVG using satori, then composite it onto the background.
 */
async function renderOverlay(config: OverlayConfig): Promise<Buffer> {
  const { title, subtitle, format } = config;
  const { width, height } = format;

  const fonts = await loadFonts();
  if (!cachedLogoUri) {
    cachedLogoUri = await loadLogoDataUri();
  }

  const panelPadding = Math.round(width * 0.05);
  const maxTextWidth = width - panelPadding * 2;
  const titleSize = computeTitleFontSize(title, maxTextWidth, 52, 28);
  const subtitleSize = Math.round(titleSize * 0.58);
  const logoSize = Math.round(titleSize * 0.55);
  const brandFontSize = Math.round(titleSize * 0.42);

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          background: 'transparent',
        },
        children: [
          // Bottom panel with text
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: `${Math.round(titleSize * 0.3)}px`,
                padding: `${panelPadding}px`,
                background: BRAND.panelBackground,
                borderTop: `3px solid ${BRAND.primary}`,
              },
              children: [
                // Title
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: `${titleSize}px`,
                      fontFamily: 'JetBrains Mono',
                      fontWeight: 700,
                      color: BRAND.foreground,
                      lineHeight: 1.25,
                    },
                    children: title,
                  },
                },
                // Subtitle (if present)
                ...(subtitle
                  ? [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: `${subtitleSize}px`,
                            fontFamily: 'Inter',
                            fontWeight: 700,
                            color: BRAND.muted,
                            lineHeight: 1.3,
                          },
                          children: subtitle,
                        },
                      },
                    ]
                  : []),
                // Branding bar
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      gap: `${Math.round(logoSize * 0.4)}px`,
                      marginTop: `${Math.round(titleSize * 0.15)}px`,
                    },
                    children: [
                      {
                        type: 'img',
                        props: {
                          src: cachedLogoUri,
                          width: logoSize,
                          height: logoSize,
                          style: {
                            width: `${logoSize}px`,
                            height: `${logoSize}px`,
                          },
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: `${brandFontSize}px`,
                            fontFamily: 'JetBrains Mono',
                            fontWeight: 700,
                            color: BRAND.muted,
                          },
                          children: 'audiocontrol.org',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width,
      height,
      fonts: [
        {
          name: 'JetBrains Mono',
          data: fonts.jetbrainsMono,
          weight: 700,
          style: 'normal',
        },
        {
          name: 'Inter',
          data: fonts.inter,
          weight: 700,
          style: 'normal',
        },
      ],
    }
  );

  return Buffer.from(svg);
}

/**
 * Composite text overlay onto a background image, resized to the target format.
 */
export async function compositeImage(config: OverlayConfig): Promise<Buffer> {
  const { backgroundBuffer, format } = config;
  const { width, height } = format;

  // Render the text overlay as a transparent PNG
  const overlaySvg = await renderOverlay(config);
  const overlayPng = await sharp(overlaySvg).png().toBuffer();

  // Resize background to target dimensions and composite overlay
  const result = await sharp(backgroundBuffer)
    .resize(width, height, { fit: 'cover', position: 'center' })
    .composite([{ input: overlayPng, blend: 'over' }])
    .png()
    .toBuffer();

  return result;
}
