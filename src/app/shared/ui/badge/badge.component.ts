import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="custom-badge badge-{{variant}}" [class.rounded-pill]="pill">
      <i *ngIf="icon" class="bi" [ngClass]="icon + ' me-1'"></i>
      <ng-content></ng-content>
    </span>
  `,
  styleUrl: './badge.component.scss'
})
export class BadgeComponent {
  @Input() variant: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'dark' = 'primary';
  @Input() pill: boolean = false;
  @Input() icon?: string;
}
