import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Theme } from '../../core/services/theme';
import { Sidebar } from './sidebar/sidebar';

@Component({
  selector: 'chat-shell',
  standalone: true,
  imports: [RouterOutlet, Sidebar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chat-shell" data-testid="chat-shell">
      <aside class="sidebar"><app-sidebar /></aside>
      <main class="content"><router-outlet /></main>
    </div>
  `,
  styles: [
    `
      .chat-shell {
        display: grid;
        grid-template-columns: 300px 1fr;
        height: 100dvh;
      }
      .sidebar {
        border-right: 1px solid var(--border);
        background: var(--surface-1);
        overflow: hidden; /* Asegura que el sidebar no haga scroll */
      }
      .content {
        background: var(--surface-0);
        color: var(--text);
        overflow: auto; /* <-- Permite el scroll solo en este contenedor */
      }
    `,
  ],
})
export class ChatShell {
  #theme = inject(Theme);

  constructor() {
    effect(() => this.#theme.applyTheme());
  }
}
