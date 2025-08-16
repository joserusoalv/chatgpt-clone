import { Routes } from '@angular/router';
import { ChatPage } from './conversation/chat.page';
import { ChatApi } from './conversation/services/chat-api';

const chatRoutes: Routes = [
  {
    path: '',
    component: ChatPage,
    providers: [ChatApi],
  },
];

export default chatRoutes;
