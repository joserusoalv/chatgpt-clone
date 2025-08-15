import { Injectable, computed, signal } from '@angular/core';
import { Message } from '../models/message';
import { STREAM_TRANSPORT } from '../stream/config';
import { SseTransport } from '../stream/sse-transport';
import { FetchTransport } from '../stream/fetch-transport';
import { Transport } from '../stream/transport';

@Injectable({ providedIn: 'root' })
export class Chat {
  #messages = signal<Message[]>([]);
  #draft = signal<string | null>(null);
  #controller: AbortController | null = null;
  #transport: Transport;

  messages = computed(() => this.#messages());
  draft = computed(() => this.#draft());

  constructor() {
    this.#transport =
      STREAM_TRANSPORT === 'sse' ? new SseTransport() :
      STREAM_TRANSPORT === 'fetch' ? new FetchTransport() :
      { start: async ({ onChunk, onDone, signal }) => {
          const chunks = ['Claro, ', 'vamos ', 'a ', 'ello.\n\n', '```ts\n', 'console.log("hola")\n', '```\n'];
          for (const c of chunks) {
            if (signal.aborted) return;
            await new Promise(r => setTimeout(r, 120));
            onChunk(c);
          }
          onDone();
        }
      };
  }

  send(text: string) {
    const user: Message = { id: crypto.randomUUID(), role: 'user', content: text, createdAt: Date.now() };
    this.#messages.update(m => [...m, user]);
    this.#draft.set('');
    this.#controller?.abort();
    this.#controller = new AbortController();

    const onChunk = (t: string) => this.#draft.update(cur => (cur ?? '') + t);
    const onDone = () => {
      const content = this.#draft() ?? '';
      const assistant: Message = { id: crypto.randomUUID(), role: 'assistant', content, createdAt: Date.now() };
      this.#messages.update(m => [...m, assistant]);
      this.#draft.set(null);
      this.#controller = null;
    };
    const onError = (err: unknown) => {
      console.error('stream error', err);
      this.#draft.set(null);
      this.#controller = null;
    };

    this.#transport.start({ prompt: text, signal: this.#controller.signal, onChunk, onDone, onError });
  }

  cancel() {
    this.#controller?.abort();
    this.#controller = null;
    this.#draft.set(null);
  }
}
