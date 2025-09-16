import { StreamOptions, Transport } from '../models/transport.model';
import { FETCH_ENDPOINT } from './config';

export class FetchTransport implements Transport {
  async start(opts: StreamOptions) {
    try {
      const res = await fetch(FETCH_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: opts.prompt }),
        signal: opts.signal,
      });
      if (!res.ok || !res.body) throw new Error('Bad response');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) opts.onChunk(decoder.decode(value, { stream: true }));
      }
      opts.onDone();
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      opts.onError(e);
    }
  }
}
