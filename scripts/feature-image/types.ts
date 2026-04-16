/** Supported image generation providers */
export type ProviderName = 'dalle' | 'flux';

/** Result of a single image generation request */
export interface GenerationResult {
  /** The provider that generated this image */
  provider: ProviderName;
  /** Raw image data as a Buffer */
  buffer: Buffer;
  /** Original dimensions from the provider */
  width: number;
  height: number;
}

/** Configuration for an image generation request */
export interface GenerationRequest {
  /** Text prompt describing the desired background image */
  prompt: string;
  /** Desired width (provider may use closest supported size) */
  width: number;
  /** Desired height (provider may use closest supported size) */
  height: number;
}

/** Interface that all image generation providers must implement */
export interface ImageProvider {
  /** Provider identifier */
  readonly name: ProviderName;
  /** Generate a background image from a text prompt */
  generate(request: GenerationRequest): Promise<GenerationResult>;
}

/** Output format specification */
export interface OutputFormat {
  /** Format name for file naming */
  name: string;
  /** Target width in pixels */
  width: number;
  /** Target height in pixels */
  height: number;
}

/** Standard output formats */
export const OUTPUT_FORMATS: OutputFormat[] = [
  { name: 'og', width: 1200, height: 630 },
  { name: 'youtube', width: 1280, height: 720 },
  { name: 'instagram', width: 1080, height: 1080 },
];
