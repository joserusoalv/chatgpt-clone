import { SSE_ENDPOINT } from './config';
import { StreamOptions, Transport } from './transport';

export class SseTransport implements Transport {
  start(opts: StreamOptions): void {
    const url = new URL(SSE_ENDPOINT, window.location.origin);
    url.searchParams.set('prompt', opts.prompt);
    const es = new EventSource(url.toString(), { withCredentials: false });
    const abort = () => es.close();

    opts.signal.addEventListener('abort', abort, { once: true });
    es.onmessage = (ev: MessageEvent) => {
      const data = String(ev.data);
      if (data === '[DONE]') {
        abort();
        opts.onDone();
        return;
      }
      opts.onChunk(data);
    };
    es.onerror = (err) => {
      abort();
      opts.onError(err);
    };
  }
}
