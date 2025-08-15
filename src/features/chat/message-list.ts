import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Message } from '../../shared/models/message';
import { MdView } from '../../shared/markdown/md-view';

@Component({
  standalone: true,
  selector: 'message-list',
  imports: [MdView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="viewport" data-testid="message-viewport">
      @for (m of messages(); track m.id) {
        <div class="msg" [class.assistant]="m.role==='assistant'">
          <div class="role">{{ m.role }}</div>
          <md-view [markdown]="m.content" />
        </div>
      }
      @if (draft()) {
        <div class="msg assistant">
          <div class="role">assistant</div>
          <md-view [markdown]="draft()!" [live]="true" />
        </div>
      }
    </div>
  `,
  styles:[`
    .viewport{height:100%; padding:1rem; overflow:auto;}
    .msg{padding:.75rem 1rem; border-radius:12px; margin:.5rem 0; background:var(--surface-2)}
    .msg.assistant{background:var(--surface-3)}
    .role{font-size:.75rem; opacity:.7; margin-bottom:.25rem}
  `]
})
export class MessageList {
  messages = input.required<readonly Message[]>();
  draft = input<string | null>(null);
}
