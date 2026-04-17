import OpenAI from 'openai';
import type { ImageProvider, GenerationRequest, GenerationResult } from '../types.js';

export class DalleProvider implements ImageProvider {
  readonly name = 'dalle' as const;
  private client: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required for DALL-E provider');
    }
    this.client = new OpenAI();
  }

  async generate(request: GenerationRequest): Promise<GenerationResult> {
    // DALL-E 3 supports: 1024x1024, 1792x1024, 1024x1792
    // Use landscape (1792x1024) as the best base for cropping to our target formats
    const response = await this.client.images.generate({
      model: 'dall-e-3',
      prompt: request.prompt,
      n: 1,
      size: '1792x1024',
      response_format: 'b64_json',
      quality: 'hd',
    });

    const imageData = response.data[0]?.b64_json;
    if (!imageData) {
      throw new Error('DALL-E 3 returned no image data');
    }

    return {
      provider: 'dalle',
      buffer: Buffer.from(imageData, 'base64'),
      width: 1792,
      height: 1024,
    };
  }
}
