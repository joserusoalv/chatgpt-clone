import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { MdView } from '../../../../shared/markdown/md-view';
import { Message } from '../models/message.model';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, throttleTime } from 'rxjs'; // Importa throttleTime

@Component({
  standalone: true,
  selector: 'app-message-list',
  imports: [MdView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #viewport class="viewport" data-testid="message-viewport">
      @for (m of messages(); track m.id) {
        <div class="msg" [class.assistant]="m.role === 'assistant'">
          <div class="role">{{ m.role }}</div>
          <app-md-view [markdown]="m.content" />
        </div>
      }
      @if (draft()) {
        <div class="msg assistant">
          <div class="role">assistant</div>
          <app-md-view [markdown]="draft()!" [live]="true" />
        </div>
      }
      <div #bottomSentinel></div>
    </div>

    @if (showScrollToBottom()) {
      <button class="scroll-btn" (click)="scrollToBottom()">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 17.25L6 11.25H10.5V4.5h3v6.75H18z" />
        </svg>
      </button>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        min-height: 0;
        position: relative;
      }
      .viewport {
        height: 100%;
        padding: 1rem;
        overflow: auto;
        box-sizing: border-box;
        overscroll-behavior: contain;
      }
      .msg {
        padding: 0.75rem 1rem;
        border-radius: 12px;
        margin: 0.5rem 0;
        background: var(--surface-2);
        white-space: pre-wrap;
        word-break: break-word;
      }
      .msg.assistant {
        background: var(--surface-3);
      }
      .role {
        font-size: 0.75rem;
        opacity: 0.7;
        margin-bottom: 0.25rem;
      }
      .scroll-btn {
        position: absolute;
        bottom: 1rem;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.25rem;
        background: var(--surface-4);
        border: 1px solid var(--border);
        border-radius: 9999px;
        color: var(--text-2);
        cursor: pointer;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10;
        transition:
          opacity 0.3s,
          transform 0.3s;
      }
      .scroll-btn:hover {
        opacity: 0.9;
        transform: translateX(-50%) translateY(-2px);
      }
      .scroll-btn svg {
        width: 1rem;
        height: 1rem;
      }
    `,
  ],
})
export class MessageList {
  readonly messages = input.required<Message[]>();
  readonly draft = input<string | null>(null);

  readonly viewportRef =
    viewChild.required<ElementRef<HTMLDivElement>>('viewport');
  readonly bottomRef =
    viewChild.required<ElementRef<HTMLDivElement>>('bottomSentinel');

  readonly showScrollToBottom = signal(false);

  readonly #destroyRef = inject(DestroyRef);

  scrollToBottomEffect = effect(() => {
    this.messages();
    this.draft();

    this.scrollToBottom();
  });

  goToBottomButtonEffect = effect(() => {
    // Observa la referencia del viewport
    const viewport = this.viewportRef();

    // Si el viewport está disponible, suscribe al evento de scroll
    if (viewport) {
      fromEvent(viewport.nativeElement, 'scroll')
        .pipe(throttleTime(50), takeUntilDestroyed(this.#destroyRef))
        .subscribe(() => {
          this.#checkScrollPosition();
        });
    }
  });

  protected scrollToBottom(): void {
    const viewport = this.viewportRef().nativeElement;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        viewport.scrollTop = viewport.scrollHeight;
        this.#checkScrollPosition();
      }),
    );
  }

  #checkScrollPosition(): void {
    const viewport = this.viewportRef().nativeElement;
    const isAtBottom =
      viewport.scrollHeight - viewport.scrollTop < viewport.clientHeight + 1;
    this.showScrollToBottom.set(!isAtBottom);
  }
}
