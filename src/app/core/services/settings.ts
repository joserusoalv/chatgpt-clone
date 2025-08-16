import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'system' | 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class Settings {
  theme = signal<ThemeMode>('system');
  fontScale = signal(1);
}
