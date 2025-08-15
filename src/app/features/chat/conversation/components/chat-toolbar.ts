import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  standalone: true,
  selector: 'chat-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="px-3 py-2 border-b flex gap-2">
      <button (click)="cancel.emit()">Cancelar</button>
    </header>
  `
})
export class ChatToolbar {
  cancel = output<void>();
}
