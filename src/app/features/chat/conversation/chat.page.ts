import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ChatToolbar } from './components/chat-toolbar';
import { MessageInput } from './components/message-input';
import { MessageList } from './components/message-list';
import { ChatApi } from './services/chat-api';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-chat-page',
  imports: [MessageList, MessageInput, ChatToolbar],
  template: `
    <section class="h-full grid grid-rows-[auto_1fr_auto]">
      <app-chat-toolbar (cancelProgress)="cancel()" />
      <app-message-list
        [messages]="_messages()"
        [draft]="_draft()"
        class="min-h-0"
      />
      <app-message-input (send)="_send($event)" />
    </section>
  `,
})
export class ChatPage {
  #chat = inject(ChatApi);

  protected _messages = this.#chat.messages;
  protected _draft = this.#chat.draft;

  protected _send(text: string) {
    this.#chat.send(text);
  }
  protected cancel() {
    this.#chat.cancel();
  }
}
