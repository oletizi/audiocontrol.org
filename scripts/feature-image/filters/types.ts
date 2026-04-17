/** A post-processing filter that transforms an image buffer. */
export interface Filter {
  /** Filter identifier for logging and debugging */
  readonly name: string;
  /** Transform the input buffer and return the result */
  apply(buffer: Buffer): Promise<Buffer>;
}

/** Apply a chain of filters in order, threading the buffer through each. */
export async function applyFilters(buffer: Buffer, filters: Filter[]): Promise<Buffer> {
  let current = buffer;
  for (const filter of filters) {
    current = await filter.apply(current);
  }
  return current;
}
