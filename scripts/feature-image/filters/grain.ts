import sharp from 'sharp';
import type { Filter } from './types.js';

export interface GrainOptions {
  /** Strength of the grain (0-1, where 1 is fully opaque noise) */
  amount?: number;
  /** Tile size in pixels — smaller = finer grain */
  tileSize?: number;
}

/**
 * Film grain: monochrome random noise composited with overlay blend.
 */
export function grain(opts: GrainOptions = {}): Filter {
  const amount = opts.amount ?? 0.08;
  const tileSize = opts.tileSize ?? 256;

  return {
    name: 'grain',
    async apply(buffer) {
      const meta = await sharp(buffer).metadata();
      const width = meta.width ?? 0;
      const height = meta.height ?? 0;
      if (!width || !height) {
        throw new Error('grain: input buffer has no dimensions');
      }

      // Generate a tile of monochrome noise
      const pixelCount = tileSize * tileSize;
      const noiseRgba = new Uint8Array(pixelCount * 4);
      const alpha = Math.round(amount * 255);
      for (let i = 0; i < pixelCount; i++) {
        const v = Math.floor(Math.random() * 256);
        noiseRgba[i * 4 + 0] = v;
        noiseRgba[i * 4 + 1] = v;
        noiseRgba[i * 4 + 2] = v;
        noiseRgba[i * 4 + 3] = alpha;
      }

      const tile = await sharp(noiseRgba, {
        raw: { width: tileSize, height: tileSize, channels: 4 },
      })
        .png()
        .toBuffer();

      return await sharp(buffer)
        .composite([{ input: tile, tile: true, blend: 'overlay' }])
        .png()
        .toBuffer();
    },
  };
}
