import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class Storage {
  get<T>(key: string): T | null { try { return JSON.parse(localStorage.getItem(key) || 'null') as T | null; } catch { return null; } }
  set<T>(key: string, value: T) { localStorage.setItem(key, JSON.stringify(value)); }
}
