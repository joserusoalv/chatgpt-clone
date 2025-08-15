import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { ChatToolbar } from './chat-toolbar';
import { Chat } from '../../shared/services/chat';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'chat-page',
  imports: [MessageList, MessageInput, ChatToolbar],
  template: `
    <section class="h-full grid grid-rows-[auto_1fr_auto]">
      <chat-toolbar (cancel)="cancel()" />
      <message-list [messages]="_messages" [draft]="_draft" class="min-h-0" />
      <message-input (send)="_send($event)" />
    </section>
  `
})
export class ChatPage {
  #chat = inject(Chat);
  protected _messages = this.#chat.messages();
  protected _draft = this.#chat.draft();
  protected _send(text: string) { this.#chat.send(text); }
  protected cancel() { this.#chat.cancel(); }
}
