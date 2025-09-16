import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import hljsRaw from 'highlight.js';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hljs: any = (hljsRaw as any)?.default ?? hljsRaw;

let mdEngine: Marked | null = null;
function getMarked(): Marked {
  if (mdEngine) return mdEngine;
  mdEngine = new Marked();
  mdEngine.use(
    markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code: string, lang?: string) {
        try {
          if (lang && hljs.getLanguage?.(lang)) {
            return hljs.highlight(code, { language: lang }).value;
          }
          return hljs.highlightAuto(code).value;
        } catch {
          return code;
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any,
  );
  return mdEngine;
}

// Normaliza fences para que marked detecte bloques de código
function normalizeFences(src: string): string {
  return (
    src
      // Salto antes de ``` si hay texto
      .replace(/([^\n])```/g, '$1\n```')
      // Salto antes de ```lang si hay texto
      .replace(/([^\n])```([a-z0-9-]*)/gi, '$1\n```$2')
      // Salto después del cierre si está pegado
      .replace(/```([^\n]*)$/m, '```\n$1')
  );
}

@Component({
  standalone: true,
  selector: 'app-md-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="md" [innerHTML]="_safeHtml()"></div>`,
  styles: [
    `
      .md :is(pre, code) {
        font-family:
          ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono',
          monospace;
      }
      .md pre {
        position: relative;
        padding: 0.75rem;
        border-radius: 12px;
        background: var(--surface-2);
        overflow: auto;
      }
      .md button.copy {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        padding: 0.25rem 0.5rem;
        border-radius: 0.5rem;
        border: 1px solid var(--border);
        background: var(--surface-0);
        font-size: 0.75rem;
        cursor: pointer;
      }
    `,
  ],
})
export class MdView implements OnDestroy {
  #host = inject(ElementRef<HTMLElement>);
  #san = inject(DomSanitizer);

  markdown = input.required<string>();
  live = input(false);

  _safeHtml = signal<SafeHtml | string>('');
  #cleanupFns: (() => void)[] = [];

  constructor() {
    const engine = getMarked();

    effect(() => {
      const mdRaw = this.markdown();
      const md = normalizeFences(mdRaw);

      // parse puede devolver string | Promise<string>
      Promise.resolve(engine.parse(md)).then((out) => {
        this._safeHtml.set(this.#san.bypassSecurityTrustHtml(String(out)));
        queueMicrotask(() => this.#decorateCodeBlocks());
      });
    });
  }

  ngOnDestroy() {
    this.#runCleanup();
  }

  #runCleanup() {
    for (const fn of this.#cleanupFns.splice(0)) {
      try {
        fn();
      } catch {
        console.error('Error during cleanup in MdView');
      }
    }
  }

  #decorateCodeBlocks() {
    const host = this.#host.nativeElement.querySelector('.md');
    if (!host) return;

    host.querySelectorAll('pre').forEach((pre: HTMLElement) => {
      if (pre.querySelector('button.copy')) return;

      const btn = document.createElement('button');
      btn.className = 'copy';
      btn.type = 'button';
      btn.textContent = 'Copiar';

      const onClick = async () => {
        const code = pre.querySelector('code')?.textContent ?? '';
        try {
          await navigator.clipboard.writeText(code);
          const old = btn.textContent;
          btn.textContent = 'Copiado ✓';
          setTimeout(() => (btn.textContent = old ?? 'Copiar'), 1200);
        } catch {
          btn.textContent = 'Error';
          setTimeout(() => (btn.textContent = 'Copiar'), 1200);
        }
      };

      btn.addEventListener('click', onClick);
      pre.appendChild(btn);
      this.#cleanupFns.push(() => btn.removeEventListener('click', onClick));
    });
  }
}
