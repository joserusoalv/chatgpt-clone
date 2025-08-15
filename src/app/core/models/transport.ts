export interface StreamOptions {
  prompt: string;
  signal: AbortSignal;
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (err: unknown) => void;
}

export interface Transport {
  start(opts: StreamOptions): void | Promise<void>;
}
