import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatWindowComponent } from '../chat-window/chat-window.component';
import { ChatService } from '../chat.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { TranslationService } from '../../../core/i18n/translation.service';

@Component({
  selector: 'app-assistant-view',
  standalone: true,
  imports: [CommonModule, ChatWindowComponent, TranslatePipe],
  template: `
    <div class="mb-4">
      <div class="d-flex align-items-center mb-1">
        <span class="pulse-dot me-2"></span>
        <span class="small text-primary fw-bold tracking-wide">{{ 'ASSISTANT.CORE_TAG' | translate }}</span>
      </div>
      <h2 class="fw-bold text-dark mb-1">{{ 'ASSISTANT.HEADER' | translate }}</h2>
      <p class="text-muted small mb-0">{{ 'ASSISTANT.SUBTITLE' | translate }}</p>
    </div>

    <div class="row h-100 g-4">
      
      <!-- Left Panel: AI Capabilities Showcase -->
      <div class="col-12 col-xl-4 d-flex flex-column gap-3">
        
        <div class="card border-0 rounded-4 overflow-hidden h-100 p-4 skill-card-container">
           <h5 class="fw-bold mb-4 border-bottom pb-2">{{ 'ASSISTANT.SKILL_SCENARIOS' | translate }}</h5>
           <p class="small text-muted mb-4">{{ 'ASSISTANT.SKILL_DESC' | translate }}</p>
           
           <div class="d-flex flex-column gap-3">
             
             <button class="btn text-start p-3 d-flex align-items-center skill-btn primary-glow" (click)="triggerSkill('ASSISTANT.SKILL_1_TITLE', 'OPTIONS')">
               <div class="icon-box bg-primary bg-opacity-10 text-primary p-2 me-3">
                 <i class="bi bi-book fs-5"></i>
               </div>
               <div>
                 <div class="fw-bold text-dark">{{ 'ASSISTANT.SKILL_1_TITLE' | translate }}</div>
                 <div class="small text-muted">{{ 'ASSISTANT.SKILL_1_DESC' | translate }}</div>
               </div>
             </button>

             <button class="btn text-start p-3 d-flex align-items-center skill-btn danger-glow" (click)="triggerSkill('ASSISTANT.SKILL_2_TITLE', 'RISK_SPIKE')">
               <div class="icon-box bg-danger bg-opacity-10 text-danger p-2 me-3">
                 <i class="bi bi-activity fs-5"></i>
               </div>
               <div>
                 <div class="fw-bold text-dark">{{ 'ASSISTANT.SKILL_2_TITLE' | translate }}</div>
                 <div class="small text-muted">{{ 'ASSISTANT.SKILL_2_DESC' | translate }}</div>
               </div>
             </button>

             <button class="btn text-start p-3 d-flex align-items-center skill-btn warning-glow" (click)="triggerSkill('ASSISTANT.SKILL_3_TITLE', 'ANOMALY')">
               <div class="icon-box bg-warning bg-opacity-10 text-warning p-2 me-3">
                 <i class="bi bi-shield-exclamation fs-5"></i>
               </div>
               <div>
                 <div class="fw-bold text-dark">{{ 'ASSISTANT.SKILL_3_TITLE' | translate }}</div>
                 <div class="small text-muted">{{ 'ASSISTANT.SKILL_3_DESC' | translate }}</div>
               </div>
             </button>

             <button class="btn text-start p-3 d-flex align-items-center skill-btn success-glow" (click)="triggerSkill('ASSISTANT.SKILL_4_TITLE', 'WEEKLY')">
               <div class="icon-box bg-success bg-opacity-10 text-success p-2 me-3">
                 <i class="bi bi-file-earmark-text fs-5"></i>
               </div>
               <div>
                 <div class="fw-bold text-dark">{{ 'ASSISTANT.SKILL_4_TITLE' | translate }}</div>
                 <div class="small text-muted">{{ 'ASSISTANT.SKILL_4_DESC' | translate }}</div>
               </div>
             </button>

             <button class="btn text-start p-3 d-flex align-items-center skill-btn info-glow" (click)="triggerSkill('ASSISTANT.SKILL_5_TITLE', 'TAX')">
               <div class="icon-box bg-info bg-opacity-10 text-info p-2 me-3">
                 <i class="bi bi-bank fs-5"></i>
               </div>
               <div>
                 <div class="fw-bold text-dark">{{ 'ASSISTANT.SKILL_5_TITLE' | translate }}</div>
                 <div class="small text-muted">{{ 'ASSISTANT.SKILL_5_DESC' | translate }}</div>
               </div>
             </button>

             <button class="btn text-start p-3 d-flex align-items-center skill-btn secondary-glow" (click)="triggerSkill('ASSISTANT.SKILL_6_TITLE', 'RISK_SCORE')">
               <div class="icon-box bg-secondary bg-opacity-10 text-secondary p-2 me-3">
                 <i class="bi bi-diagram-3 fs-5"></i>
               </div>
               <div>
                 <div class="fw-bold text-dark">{{ 'ASSISTANT.SKILL_6_TITLE' | translate }}</div>
                 <div class="small text-muted">{{ 'ASSISTANT.SKILL_6_DESC' | translate }}</div>
               </div>
             </button>

           </div>
        </div>

      </div>

      <!-- Right Panel: Chat Window -->
      <div class="col-12 col-xl-8 h-100">
        <app-chat-window></app-chat-window>
      </div>

    </div>
  `,
  styles: [`
    .tracking-wide { letter-spacing: 1px; }
    .pulse-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #0d6efd;
      box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.7);
      animation: pulseAI 2s infinite;
    }
    @keyframes pulseAI {
      0% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.7); }
      70% { box-shadow: 0 0 0 8px rgba(13, 110, 253, 0); }
      100% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0); }
    }
    
    .skill-card-container {
      background: linear-gradient(145deg, #f8f9fa, #ffffff);
      box-shadow: inset 0 2px 4px rgba(255,255,255,1), 0 8px 30px rgba(0,0,0,0.06);
      border: 1px solid rgba(0,0,0,0.05) !important;
    }

    .skill-btn {
      background: rgba(255, 255, 255, 0.6) !important;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.9);
      border-radius: 14px;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 4px 6px rgba(0,0,0,0.02);
      position: relative;
      overflow: hidden;
      z-index: 1;
    }
    
    .skill-btn::before {
      content: '';
      position: absolute;
      top: 0; left: -100%;
      width: 50%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
      transition: all 0.4s;
      z-index: -1;
    }
    .skill-btn:hover::before {
      left: 100%;
    }

    .skill-btn:hover {
      background: #ffffff !important;
      transform: translateY(-4px) scale(1.02);
    }
    
    .primary-glow:hover { border-color: rgba(13, 110, 253, 0.5); box-shadow: 0 10px 20px rgba(13, 110, 253, 0.15); }
    .danger-glow:hover { border-color: rgba(220, 53, 69, 0.5); box-shadow: 0 10px 20px rgba(220, 53, 69, 0.15); }
    .warning-glow:hover { border-color: rgba(255, 193, 7, 0.5); box-shadow: 0 10px 20px rgba(255, 193, 7, 0.15); }
    .success-glow:hover { border-color: rgba(25, 135, 84, 0.5); box-shadow: 0 10px 20px rgba(25, 135, 84, 0.15); }
    .info-glow:hover { border-color: rgba(13, 202, 240, 0.5); box-shadow: 0 10px 20px rgba(13, 202, 240, 0.15); }
    .secondary-glow:hover { border-color: rgba(108, 117, 125, 0.5); box-shadow: 0 10px 20px rgba(108, 117, 125, 0.15); }

    .icon-box {
      border-radius: 12px;
      transition: all 0.4s ease;
      position: relative;
    }
    
    .skill-btn:hover .icon-box {
      transform: rotate(5deg) scale(1.1);
    }
  `]
})
export class AssistantViewComponent {
  private chatService = inject(ChatService);
  private ts = inject(TranslationService);

  triggerSkill(promptKey: string, intentId: string) {
    const translatedPrompt = this.ts.translate(promptKey);
    this.chatService.sendMessage(translatedPrompt, intentId);
  }
}
