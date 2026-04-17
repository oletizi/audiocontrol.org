import sharp from 'sharp';
import type { Filter } from './types.js';

export interface VignetteOptions {
  /** Strength of the darkening at the edges (0-1) */
  amount?: number;
  /** Distance from center where darkening begins (0-1, fraction of radius) */
  innerStop?: number;
  /** Outer stop, where darkening reaches full strength (0-1) */
  outerStop?: number;
}

/**
 * Radial vignette: darkens the edges of the image with a smooth radial gradient.
 */
export function vignette(opts: VignetteOptions = {}): Filter {
  const amount = opts.amount ?? 0.6;
  const innerStop = opts.innerStop ?? 0.55;
  const outerStop = opts.outerStop ?? 1.0;

  return {
    name: 'vignette',
    async apply(buffer) {
      const meta = await sharp(buffer).metadata();
      const width = meta.width ?? 0;
      const height = meta.height ?? 0;
      if (!width || !height) {
        throw new Error('vignette: input buffer has no dimensions');
      }

      const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="vig" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="black" stop-opacity="0"/>
      <stop offset="${innerStop * 100}%" stop-color="black" stop-opacity="0"/>
      <stop offset="${outerStop * 100}%" stop-color="black" stop-opacity="${amount}"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#vig)"/>
</svg>`;

      return await sharp(buffer)
        .composite([{ input: Buffer.from(svg), blend: 'over' }])
        .png()
        .toBuffer();
    },
  };
}
