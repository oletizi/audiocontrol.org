import sharp from 'sharp';
import type { Filter } from './types.js';

export interface PhosphorOptions {
  /** Gaussian blur sigma — larger = softer/more bloomed (typical: 0.5-2.0) */
  sigma?: number;
}

/**
 * Phosphor blur: gentle gaussian blur to simulate the soft glow of a CRT
 * phosphor screen. Apply BEFORE scanlines so the lines stay crisp.
 */
export function phosphor(opts: PhosphorOptions = {}): Filter {
  const sigma = opts.sigma ?? 1.0;

  return {
    name: 'phosphor',
    async apply(buffer) {
      return await sharp(buffer).blur(sigma).png().toBuffer();
    },
  };
}
