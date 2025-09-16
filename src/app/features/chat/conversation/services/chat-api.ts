import { Injectable, signal } from '@angular/core';
import { Transport } from '../../../../core/models/transport.model';
import { STREAM_TRANSPORT } from '../../../../core/stream/config';
import { FetchTransport } from '../../../../core/stream/fetch-transport';
import { SseTransport } from '../../../../core/stream/sse-transport';
import { Message } from '../models/message.model';

@Injectable()
export class ChatApi {
  #messages = signal<Message[]>([]);
  #draft = signal<string | null>(null);

  #controller: AbortController | null = null;
  #transport: Transport;

  messages = this.#messages.asReadonly();
  draft = this.#draft.asReadonly();

  constructor() {
    this.#transport =
      STREAM_TRANSPORT === 'sse'
        ? new SseTransport()
        : STREAM_TRANSPORT === 'fetch'
          ? new FetchTransport()
          : {
              start: async ({ onChunk, onDone, signal }) => {
                const chunks = [
                  'Claro, ',
                  'vamos ',
                  'a ',
                  'ello.\n\n',
                  '```ts\n',
                  'console.log("hola")\n',
                  '```\n',
                ];
                for (const c of chunks) {
                  if (signal.aborted) return;
                  await new Promise((r) => setTimeout(r, 120));
                  onChunk(c);
                }
                onDone();
              },
            };
  }

  send(text: string) {
    const user: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      createdAt: Date.now(),
    };
    this.#messages.update((m) => [...m, user]);
    this.#draft.set('');
    this.#controller?.abort();
    this.#controller = new AbortController();

    const onChunk = (t: string) => this.#draft.update((cur) => (cur ?? '') + t);
    const onDone = () => {
      const content = this.#draft() ?? '';
      const assistant: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content,
        createdAt: Date.now(),
      };
      this.#messages.update((m) => [...m, assistant]);
      this.#draft.set(null);
      this.#controller = null;
    };
    const onError = (err: unknown) => {
      console.error('stream error', err);
      this.#draft.set(null);
      this.#controller = null;
    };

    this.#transport.start({
      prompt: text,
      signal: this.#controller.signal,
      onChunk,
      onDone,
      onError,
    });
  }

  cancel() {
    this.#controller?.abort();
    this.#controller = null;
    this.#draft.set(null);
  }
}
