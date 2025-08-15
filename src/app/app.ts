import { Component } from '@angular/core';
import { ChatShell } from './features/chat/chat-shell';

@Component({
  selector: 'app-root',
  imports: [ChatShell],
  template: '<chat-shell/>',
})
export class App {}
