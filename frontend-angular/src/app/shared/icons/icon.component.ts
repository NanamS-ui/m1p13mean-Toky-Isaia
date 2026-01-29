import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="app-icon material-symbols-outlined" [class.app-icon--fill]="fill" [style.fontSize.px]="size">{{ name }}</span>`,
  styles: [`
    .app-icon {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      vertical-align: middle;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .app-icon--fill {
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
  `]
})
export class IconComponent {
  @Input() name = 'circle';
  @Input() size = 24;
  @Input() fill = false;
}
