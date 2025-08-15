import { Injectable, inject } from '@angular/core';
import { Settings } from './settings';
@Injectable({ providedIn: 'root' })
export class Theme {
  #settings = inject(Settings);
  applyTheme() {
    const doc = document.documentElement;
    const theme = this.#settings.theme();
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
    doc.dataset.theme = isDark ? 'dark' : 'light';
    doc.style.setProperty('--font-scale', String(this.#settings.fontScale()));
  }
}
