import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Agents } from '../../../core/services/agents';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="px-3 py-2 flex items-center justify-between">
      <h1 class="text-lg font-semibold">ChatGPT Clone</h1>
      <button data-testid="new-chat" (click)="newChat()">＋</button>
    </header>

    <section class="px-3">
      <label class="text-xs block mb-1">Agente</label>
      <select [value]="_currentId()" (change)="set($any($event.target).value)">
        @for (a of _agents(); track a.id) {
        <option [value]="a.id">{{ a.name }}</option>
        }
      </select>
    </section>
  `,
})
export class Sidebar {
  #agents = inject(Agents);

  protected _agents = this.#agents.list;
  protected _currentId = this.#agents.currentId;

  protected set(id: string) {
    this.#agents.setCurrent(id);
  }

  protected newChat() {
    this.#agents.startNewSession();
  }
}
