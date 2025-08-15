import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/chat/chat.page').then((m) => m.ChatPage),
  },
  { path: '**', redirectTo: '' },
];
