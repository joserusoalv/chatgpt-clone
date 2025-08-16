import { Injectable, signal } from '@angular/core';
import { Agent } from '../models/agent.model';

@Injectable({ providedIn: 'root' })
export class Agents {
  #agents = signal<Agent[]>([
    { id: 'default', name: 'General', model: 'gpt-4o-mini', temperature: 0.6 },
    { id: 'code', name: 'Coder', model: 'sonnet-3.5', temperature: 0.2 },
  ]);
  #currentId = signal<string>('default');

  list = this.#agents.asReadonly();
  currentId = this.#currentId.asReadonly();

  setCurrent(id: string) {
    this.#currentId.set(id);

    localStorage.setItem(
      'agents',
      JSON.stringify({ agents: this.#agents(), currentId: this.#currentId() })
    );
  }
  startNewSession() {
    localStorage.removeItem('chat:last');
    location.reload();
  }
}
