import {
  ChangeDetectionStrategy,
  Component,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'message-input',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="flex gap-2 p-3 border-t" (ngSubmit)="_submit($event)">
      <textarea
        data-testid="chat-textarea"
        [(ngModel)]="_text"
        name="text"
        rows="1"
        placeholder="Escribe tu mensaje..."
        class="flex-1 resize-none"
      ></textarea>

      <button data-testid="send-button" [disabled]="!_text().trim()">
        Enviar
      </button>
    </form>
  `,
})
export class MessageInput {
  protected _text = signal('');
  send = output<string>();

  protected _submit(e: Event) {
    e.preventDefault();
    const v = this._text().trim();

    if (!v) return;

    this.send.emit(v);
    this._text.set('');
  }
}
