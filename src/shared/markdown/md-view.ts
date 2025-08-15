import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import type { Marked } from 'marked';

@Component({
  standalone: true,
  selector: 'md-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="md" [innerHTML]="_safeHtml"></div>`,
  styles: [`
    .md :is(pre, code){ font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; }
    .md pre{ position:relative; padding: .75rem; border-radius: 12px; background: var(--surface-2); overflow:auto; }
    .md button.copy { position:absolute; top:.5rem; right:.5rem; padding:.25rem .5rem; border-radius:.5rem; }
  `]
})
export class MdView {
  #el = inject(ElementRef<HTMLElement>);
  #san = inject(DomSanitizer);
  markdown = input.required<string>();
  live = input(false);
  protected _safeHtml: SafeHtml | string = '';
  #markedPromise: Promise<Marked> | null = null;
  #hljsPromise: Promise<any> | null = null;

  constructor() {
    effect(async () => {
      const md = this.markdown();
      this.#markedPromise ??= import('marked').then(m => m.marked);
      this.#hljsPromise ??= import('highlight.js');
      const [marked, hljs] = await Promise.all([this.#markedPromise, this.#hljsPromise]);
      marked.setOptions({
        highlight(code, lang) {
          if (lang && hljs.default.getLanguage(lang)) {
            return hljs.default.highlight(code, { language: lang }).value;
          }
          return hljs.default.highlightAuto(code).value;
        }
      });
      const html = marked.parse(md);
      this._safeHtml = this.#san.bypassSecurityTrustHtml(html as string);
      queueMicrotask(() => this.#decorateCodeBlocks());
    });
  }

  #decorateCodeBlocks() {
    const host = this.#el.nativeElement.querySelector('.md');
    if (!host) return;
    const pres = host.querySelectorAll('pre');
    pres.forEach(pre => {
      if (pre.querySelector('button.copy')) return;
      const btn = document.createElement('button');
      btn.className = 'copy';
      btn.textContent = 'Copiar';
      btn.addEventListener('click', async () => {
        const code = pre.querySelector('code')?.textContent ?? '';
        try {
          await navigator.clipboard.writeText(code);
          const old = btn.textContent;
          btn.textContent = 'Copiado ✓';
          setTimeout(() => (btn.textContent = old ?? 'Copiar'), 1200);
        } catch { btn.textContent = 'Error'; }
      });
      pre.appendChild(btn);
    });
  }
}
