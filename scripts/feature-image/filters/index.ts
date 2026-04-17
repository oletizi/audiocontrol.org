import type { Filter } from './types.js';
import { scanlines } from './scanlines.js';
import { vignette } from './vignette.js';
import { grain } from './grain.js';
import { grade } from './grade.js';
import { phosphor } from './phosphor.js';

export type { Filter } from './types.js';
export { applyFilters } from './types.js';
export { scanlines, vignette, grain, grade, phosphor };

/**
 * Registry of named filters with default options.
 * Used by the CLI to resolve `--filters foo,bar` flags.
 */
export const FILTER_REGISTRY: Record<string, () => Filter> = {
  scanlines: () => scanlines(),
  vignette: () => vignette(),
  grain: () => grain(),
  grade: () => grade(),
  phosphor: () => phosphor(),
};

/**
 * Named presets — opinionated filter chains with tuned options.
 */
export const PRESETS: Record<string, Filter[]> = {
  none: [],

  // Subtle: light vignette and grain only — preserves source image character
  subtle: [
    vignette({ amount: 0.35, innerStop: 0.6 }),
    grain({ amount: 0.04 }),
  ],

  // Retro CRT: phosphor blur + thick scanlines + vignette + grain + cool grade
  'retro-crt': [
    grade({ saturation: 0.9, channelMultipliers: [0.95, 1.0, 1.05] }),
    phosphor({ sigma: 1.4 }),
    vignette({ amount: 0.55, innerStop: 0.5 }),
    scanlines({ opacity: 0.4, cycle: 5, lineHeight: 2 }),
    grain({ amount: 0.06 }),
  ],

  // Teal & amber film grade — desaturate, push shadows blue, lift highlights orange
  'teal-amber': [
    grade({
      saturation: 0.85,
      channelMultipliers: [1.05, 1.0, 0.95],
      channelOffsets: [5, 0, -5],
    }),
    vignette({ amount: 0.4, innerStop: 0.55 }),
    grain({ amount: 0.05 }),
  ],

  // Heavy CRT — pronounced phosphor bloom, thick scanlines, heavy vignette
  'heavy-crt': [
    grade({ saturation: 1.05 }),
    phosphor({ sigma: 2.0 }),
    scanlines({ opacity: 0.55, cycle: 6, lineHeight: 3 }),
    vignette({ amount: 0.7, innerStop: 0.45 }),
    grain({ amount: 0.1 }),
  ],
};

/**
 * Resolve a filter spec string into a Filter array.
 * Spec is comma-separated filter names.
 */
export function resolveFilters(spec: string): Filter[] {
  if (!spec || spec === 'none') return [];
  const names = spec.split(',').map(s => s.trim()).filter(Boolean);
  return names.map(name => {
    const factory = FILTER_REGISTRY[name];
    if (!factory) {
      throw new Error(`Unknown filter "${name}". Valid filters: ${Object.keys(FILTER_REGISTRY).join(', ')}`);
    }
    return factory();
  });
}

/**
 * Resolve a preset name into a Filter array.
 */
export function resolvePreset(name: string): Filter[] {
  const preset = PRESETS[name];
  if (!preset) {
    throw new Error(`Unknown preset "${name}". Valid presets: ${Object.keys(PRESETS).join(', ')}`);
  }
  return preset;
}
