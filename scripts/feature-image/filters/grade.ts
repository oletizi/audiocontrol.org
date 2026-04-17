import sharp from 'sharp';
import type { Filter } from './types.js';

export interface GradeOptions {
  /** Saturation multiplier (1.0 = unchanged) */
  saturation?: number;
  /** Brightness multiplier (1.0 = unchanged) */
  brightness?: number;
  /** Hue rotation in degrees (0 = unchanged) */
  hue?: number;
  /** Per-channel multipliers [R, G, B] applied via linear() */
  channelMultipliers?: [number, number, number];
  /** Per-channel offsets [R, G, B] applied via linear() */
  channelOffsets?: [number, number, number];
}

/**
 * Color grading: adjust saturation, brightness, hue, and per-channel levels.
 *
 * For a "teal and amber" film look, push the blue channel slightly and lift
 * the red channel offset to warm shadows toward orange while keeping highlights cool.
 */
export function grade(opts: GradeOptions = {}): Filter {
  const saturation = opts.saturation ?? 1.0;
  const brightness = opts.brightness ?? 1.0;
  const hue = opts.hue ?? 0;
  const multipliers = opts.channelMultipliers ?? [1.0, 1.0, 1.0];
  const offsets = opts.channelOffsets ?? [0, 0, 0];

  return {
    name: 'grade',
    async apply(buffer) {
      let pipeline = sharp(buffer);

      if (saturation !== 1.0 || brightness !== 1.0 || hue !== 0) {
        pipeline = pipeline.modulate({ saturation, brightness, hue });
      }

      const hasLinear = multipliers.some(m => m !== 1.0) || offsets.some(o => o !== 0);
      if (hasLinear) {
        pipeline = pipeline.linear(multipliers, offsets);
      }

      return await pipeline.png().toBuffer();
    },
  };
}
