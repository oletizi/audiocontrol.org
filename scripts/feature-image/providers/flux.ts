import type { ImageProvider, GenerationRequest, GenerationResult } from '../types.js';

/**
 * FLUX image generation provider using the BFL (Black Forest Labs) API.
 *
 * API docs: https://docs.bfl.ml/
 * Uses FLUX.1 [pro] for high-quality generation.
 */
export class FluxProvider implements ImageProvider {
  readonly name = 'flux' as const;
  private apiKey: string;
  private baseUrl = 'https://api.bfl.ml/v1';

  constructor() {
    const apiKey = process.env.BFL_API_KEY;
    if (!apiKey) {
      throw new Error('BFL_API_KEY environment variable is required for FLUX provider');
    }
    this.apiKey = apiKey;
  }

  async generate(request: GenerationRequest): Promise<GenerationResult> {
    // Submit generation request
    const submitResponse = await fetch(`${this.baseUrl}/flux-pro-1.1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Key': this.apiKey,
      },
      body: JSON.stringify({
        prompt: request.prompt,
        width: request.width,
        height: request.height,
      }),
    });

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      throw new Error(`FLUX API submission failed (${submitResponse.status}): ${errorText}`);
    }

    const submitResult = await submitResponse.json() as { id: string };
    const taskId = submitResult.id;

    // Poll for result
    const buffer = await this.pollForResult(taskId);

    return {
      provider: 'flux',
      buffer,
      width: request.width,
      height: request.height,
    };
  }

  private async pollForResult(taskId: string): Promise<Buffer> {
    const maxAttempts = 60;
    const pollIntervalMs = 2000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const pollResponse = await fetch(`${this.baseUrl}/get_result?id=${taskId}`, {
        headers: { 'X-Key': this.apiKey },
      });

      if (!pollResponse.ok) {
        const errorText = await pollResponse.text();
        throw new Error(`FLUX polling failed (${pollResponse.status}): ${errorText}`);
      }

      const result = await pollResponse.json() as {
        status: string;
        result?: { sample: string };
      };

      if (result.status === 'Ready' && result.result?.sample) {
        // Download the image from the returned URL
        const imageResponse = await fetch(result.result.sample);
        if (!imageResponse.ok) {
          throw new Error(`Failed to download FLUX image (${imageResponse.status})`);
        }
        const arrayBuffer = await imageResponse.arrayBuffer();
        return Buffer.from(arrayBuffer);
      }

      if (result.status === 'Error') {
        throw new Error('FLUX generation failed');
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }

    throw new Error(`FLUX generation timed out after ${maxAttempts * pollIntervalMs / 1000}s`);
  }
}
