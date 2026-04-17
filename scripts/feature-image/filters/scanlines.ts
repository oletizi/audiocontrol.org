import sharp from 'sharp';
import type { Filter } from './types.js';

export interface ScanlinesOptions {
  /** Opacity of the dark line (0-1) */
  opacity?: number;
  /** Height of one scanline cycle in pixels (line + gap) */
  cycle?: number;
}

/**
 * CRT scanline overlay: alternating dark horizontal lines composited over the image.
 */
export function scanlines(opts: ScanlinesOptions = {}): Filter {
  const opacity = opts.opacity ?? 0.35;
  const cycle = opts.cycle ?? 3;

  return {
    name: 'scanlines',
    async apply(buffer) {
      const meta = await sharp(buffer).metadata();
      const width = meta.width ?? 0;
      const height = meta.height ?? 0;
      if (!width || !height) {
        throw new Error('scanlines: input buffer has no dimensions');
      }

      const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="lines" patternUnits="userSpaceOnUse" width="${cycle}" height="${cycle}">
      <rect width="${cycle}" height="1" fill="rgba(0,0,0,${opacity})"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#lines)"/>
</svg>`;

      return await sharp(buffer)
        .composite([{ input: Buffer.from(svg), blend: 'over' }])
        .png()
        .toBuffer();
    },
  };
}
