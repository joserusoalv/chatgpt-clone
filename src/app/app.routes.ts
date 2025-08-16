import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/chat/chat.routes'),
  },
  { path: '**', redirectTo: '' },
];
