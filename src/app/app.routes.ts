import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/chat/conversation/chat.page').then((m) => m.ChatPage),
  },
  { path: '**', redirectTo: '' },
];
