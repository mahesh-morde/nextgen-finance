import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-item" [class]="'toast-' + toast.type" (click)="toastService.dismiss(toast.id)">
          <i class="bi" [ngClass]="toast.icon"></i>
          <span class="toast-message">{{ toast.message }}</span>
          <i class="bi bi-x toast-close"></i>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
    }
    .toast-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      border-radius: 12px;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: white;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      animation: toastSlideIn 0.3s ease-out;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .toast-success {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9));
    }
    .toast-error {
      background: linear-gradient(135deg, rgba(220, 53, 69, 0.9), rgba(185, 28, 28, 0.9));
    }
    .toast-info {
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.9), rgba(13, 110, 253, 0.9));
    }
    .toast-warning {
      background: linear-gradient(135deg, rgba(255, 193, 7, 0.9), rgba(245, 158, 11, 0.9));
      color: #1a1a1a;
    }
    .toast-message {
      flex: 1;
    }
    .toast-close {
      opacity: 0.7;
      transition: opacity 0.2s;
      &:hover { opacity: 1; }
    }
    @keyframes toastSlideIn {
      from { opacity: 0; transform: translateX(100px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
