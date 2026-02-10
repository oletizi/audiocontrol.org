import satori from 'satori';
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Fetch Inter font from Google Fonts (satori needs TTF, not woff2)
async function loadInterFont(): Promise<ArrayBuffer> {
  const response = await fetch(
    'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYAZFhjQ.ttf'
  );
  return response.arrayBuffer();
}

// Convert favicon SVG to PNG data URI for embedding in satori
async function loadLogoDataUri(): Promise<string> {
  const svgPath = join(rootDir, 'public/favicon.svg');
  const pngBuffer = await sharp(svgPath)
    .resize(32, 32)
    .png()
    .toBuffer();
  return `data:image/png;base64,${pngBuffer.toString('base64')}`;
}

interface PageConfig {
  slug: string;
  title: string;
  subtitle?: string;
  backgroundImage?: string; // Path relative to public/
}

// Define pages that need OG images
const pages: PageConfig[] = [
  // Homepage - use editor screenshot as background
  {
    slug: 'index',
    title: 'audiocontrol.org',
    subtitle: 'Free Web Editors for Vintage Roland & Akai Samplers and Synthesizers',
    backgroundImage: 'images/s330-screenshot.png',
  },
  // Blog posts
  {
    slug: 'blog-free-roland-s330-sampler-editor',
    title: 'A Free, Open Source Web Editor for the Roland S-330 Sampler',
    backgroundImage: 'images/s330-editor-thumbnail.jpg',
  },
  {
    slug: 'blog-roland-s-series-samplers',
    title: 'The Roland S-Series Samplers',
    subtitle: 'A Complete Guide to the S-330, S-550, S-770, and W-30',
    backgroundImage: 'images/s550-thumbnail.jpg',
  },
  {
    slug: 'blog-roland-s330-sampler-editor-feb-2026-update',
    title: "What's New in the Roland S-330 Web Editor",
    subtitle: 'February 2026 Update',
    backgroundImage: 'images/s330-editor-thumbnail.jpg',
  },
  // Hardware pages
  {
    slug: 'roland-s330',
    title: 'Roland S-330',
    subtitle: '12-bit Rack Sampler (1987)',
    backgroundImage: 'images/s330-thumbnail.jpg',
  },
  {
    slug: 'roland-s550',
    title: 'Roland S-550',
    subtitle: '12-bit Sampler with Video Output (1987)',
    backgroundImage: 'images/s550-thumbnail.jpg',
  },
  {
    slug: 'roland-s770',
    title: 'Roland S-770',
    subtitle: '16-bit Professional Sampler (1989)',
    backgroundImage: 'images/s770-thumbnail.jpg',
  },
  {
    slug: 'roland-w30',
    title: 'Roland W-30',
    subtitle: 'Music Workstation (1989)',
    backgroundImage: 'images/w30-thumbnail.jpg',
  },
  // Docs
  {
    slug: 'docs-roland-samplers-s-330',
    title: 'Roland S-330 Documentation',
    subtitle: 'Technical Reference & User Guide',
    backgroundImage: 'images/s330-editor-thumbnail.jpg',
  },
  // Accessories
  {
    slug: 'roland-s330-mu-1-mouse',
    title: 'Roland MU-1 Mouse',
    subtitle: 'Mouse Controller for S-330',
    backgroundImage: 'images/mu-1-thumbnail.jpg',
  },
  {
    slug: 'roland-s330-rc-100',
    title: 'Roland RC-100',
    subtitle: 'Remote Controller for S-330',
    backgroundImage: 'images/rc-100-thumbnail.jpg',
  },
];

async function generateOgImage(page: PageConfig, fontData: ArrayBuffer, logoDataUri: string): Promise<void> {
  // If there's a background image, we'll composite the text overlay on top
  const hasBackground = !!page.backgroundImage;

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: hasBackground
            ? 'radial-gradient(ellipse 120% 100% at 30% 50%, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.6) 40%, rgba(0, 0, 0, 0.2) 70%, transparent 100%)'
            : '#0a0a0a',
          padding: '60px 80px',
          fontFamily: 'Inter',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: page.subtitle ? '52px' : '60px',
                      fontWeight: 700,
                      color: '#e0e0e0',
                      lineHeight: 1.2,
                      maxWidth: '1000px',
                    },
                    children: page.title,
                  },
                },
                page.subtitle
                  ? {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '32px',
                          fontWeight: 700,
                          color: '#666666',
                          lineHeight: 1.3,
                        },
                        children: page.subtitle,
                      },
                    }
                  : null,
              ].filter(Boolean),
            },
          },
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: '60px',
                left: '80px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              },
              children: [
                {
                  type: 'img',
                  props: {
                    src: logoDataUri,
                    width: 32,
                    height: 32,
                    style: {
                      width: '32px',
                      height: '32px',
                    },
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '24px',
                      fontWeight: 700,
                      color: '#666666',
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
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    }
  );

  const outputDir = join(rootDir, 'public/images/og');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  let png: Buffer;

  if (page.backgroundImage) {
    // Composite text overlay on top of background image
    const backgroundPath = join(rootDir, 'public', page.backgroundImage);
    const overlay = await sharp(Buffer.from(svg)).png().toBuffer();

    png = await sharp(backgroundPath)
      .resize(1200, 630, { fit: 'cover', position: 'center' })
      .composite([{ input: overlay, blend: 'over' }])
      .png()
      .toBuffer();
  } else {
    png = await sharp(Buffer.from(svg)).png().toBuffer();
  }

  const outputPath = join(outputDir, `${page.slug}.png`);
  writeFileSync(outputPath, png);
  console.log(`Generated: ${outputPath}`);
}

async function main(): Promise<void> {
  console.log('Generating OG images...\n');

  console.log('Loading font...');
  const fontData = await loadInterFont();

  console.log('Loading logo...');
  const logoDataUri = await loadLogoDataUri();

  for (const page of pages) {
    await generateOgImage(page, fontData, logoDataUri);
  }

  console.log('\nDone!');
}

main().catch(console.error);
