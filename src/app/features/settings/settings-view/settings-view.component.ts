import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { TranslationService } from '../../../core/i18n/translation.service';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-settings-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent, InputComponent, ButtonComponent, TranslatePipe],
  template: `
    <div class="settings-container">
      <div class="header-section mb-5">
        <h2 class="fw-bold text-gradient">{{ 'SETTINGS.HEADER' | translate }}</h2>
        <p class="text-muted">{{ 'SETTINGS.SUBTITLE' | translate }}</p>
      </div>

      <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()">
        <div class="row g-4">
          <!-- Left Column: Profile & AI Configuration -->
          <div class="col-12 col-xl-7 d-flex flex-column gap-4">
            
            <app-card [title]="'SETTINGS.PROFILE_DETAILS' | translate" [glass]="true" class="h-100">
              <div header-actions>
                <div class="avatar-badge">{{ 'COMMON.PRO_MEMBER' | translate }}</div>
              </div>
              <div class="row g-4 mt-2">
                <div class="col-md-6">
                  <div class="form-floating glass-input">
                    <input type="text" class="form-control" id="firstName" formControlName="firstName" [placeholder]="'SETTINGS.FIRST_NAME' | translate">
                    <label for="firstName">{{ 'SETTINGS.FIRST_NAME' | translate }}</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating glass-input">
                    <input type="text" class="form-control" id="lastName" formControlName="lastName" [placeholder]="'SETTINGS.LAST_NAME' | translate">
                    <label for="lastName">{{ 'SETTINGS.LAST_NAME' | translate }}</label>
                  </div>
                </div>
                <div class="col-12">
                  <div class="form-floating glass-input">
                    <input type="email" class="form-control" id="email" formControlName="email" [placeholder]="'SETTINGS.EMAIL' | translate">
                    <label for="email">{{ 'SETTINGS.EMAIL' | translate }}</label>
                  </div>
                </div>
              </div>
            </app-card>

            <app-card [title]="'SETTINGS.AI_CONFIG' | translate" [glass]="true" class="h-100">
              <div class="ai-provider-selector mt-3">
                <label class="form-label text-muted small fw-bold text-uppercase mb-3">{{ 'SETTINGS.PRIMARY_LLM' | translate }}</label>
                <div class="provider-grid">
                  <div class="provider-card" [class.active]="settingsForm.get('aiProvider')?.value === 'Google'" (click)="setProvider('Google')">
                    <i class="bi bi-google fs-3"></i>
                    <span class="fw-bold mt-2">{{ 'SETTINGS.PROVIDERS.GEMINI' | translate }}</span>
                  </div>
                  <div class="provider-card" [class.active]="settingsForm.get('aiProvider')?.value === 'Groq'" (click)="setProvider('Groq')">
                    <i class="bi bi-cpu fs-3"></i>
                    <span class="fw-bold mt-2">{{ 'SETTINGS.PROVIDERS.GROQ' | translate }}</span>
                  </div>
                  <div class="provider-card" [class.active]="settingsForm.get('aiProvider')?.value === 'GitHub'" (click)="setProvider('GitHub')">
                    <i class="bi bi-github fs-3"></i>
                    <span class="fw-bold mt-2">{{ 'SETTINGS.PROVIDERS.GITHUB' | translate }}</span>
                  </div>
                  <div class="provider-card" [class.active]="settingsForm.get('aiProvider')?.value === 'Cohere'" (click)="setProvider('Cohere')">
                    <i class="bi bi-braces-asterisk fs-3"></i>
                    <span class="fw-bold mt-2">{{ 'SETTINGS.PROVIDERS.COHERE' | translate }}</span>
                  </div>
                </div>
              </div>
            </app-card>
          </div>

          <!-- Right Column: Preferences & Notifications -->
          <div class="col-12 col-xl-5 d-flex flex-column gap-4">
            
            <app-card [title]="'SETTINGS.PREFERENCES' | translate" [glass]="true">
              
              <!-- Language -->
              <div class="preference-item">
                <div>
                  <h6 class="mb-1 fw-bold text-dark"><i class="bi bi-globe me-2 text-primary"></i>{{ 'SETTINGS.LANGUAGE' | translate }}</h6>
                  <small class="text-muted">{{ 'SETTINGS.LANG_DESC' | translate }}</small>
                </div>
                <select class="form-select glass-select w-auto fw-bold text-uppercase" formControlName="language" (change)="changeLang($event)">
                  <option value="en">{{ 'SETTINGS.LANG_EN' | translate }}</option>
                  <option value="es">{{ 'SETTINGS.LANG_ES' | translate }}</option>
                  <option value="hi">{{ 'SETTINGS.LANG_HI' | translate }}</option>
                  <option value="kn">{{ 'SETTINGS.LANG_KN' | translate }}</option>
                </select>
              </div>
              
              <!-- Currency -->
              <div class="preference-item">
                <div>
                  <h6 class="mb-1 fw-bold text-dark"><i class="bi bi-currency-exchange me-2 text-primary"></i>{{ 'SETTINGS.CURRENCY' | translate }}</h6>
                  <small class="text-muted">{{ 'SETTINGS.CURRENCY_DESC' | translate }}</small>
                </div>
                <select class="form-select glass-select w-auto fw-bold text-uppercase" formControlName="currency">
                  <option value="INR">₹ INR</option>
                  <option value="USD">$ USD</option>
                </select>
              </div>

              <!-- Theme -->
              <div class="preference-item border-0 pb-0">
                <div>
                  <h6 class="mb-1 fw-bold text-dark"><i class="bi bi-palette me-2 text-primary"></i>{{ 'SETTINGS.THEME' | translate }}</h6>
                  <small class="text-muted">{{ 'SETTINGS.THEME_DESC' | translate }}</small>
                </div>
                <select class="form-select glass-select w-auto fw-bold text-uppercase" formControlName="theme">
                  <option value="light">{{ 'SETTINGS.THEME_LIGHT' | translate }}</option>
                  <option value="dark">{{ 'SETTINGS.THEME_DARK' | translate }}</option>
                </select>
              </div>
            </app-card>

            <app-card [title]="'SETTINGS.NOTIFICATIONS' | translate" [glass]="true">
              <div class="notification-item">
                <div>
                  <h6 class="mb-1 fw-bold text-dark">{{ 'SETTINGS.PRICE_ALERTS' | translate }}</h6>
                  <small class="text-muted">{{ 'SETTINGS.PRICE_ALERTS_DESC' | translate }}</small>
                </div>
                <div class="form-check form-switch custom-switch">
                  <input class="form-check-input" type="checkbox" formControlName="notifyPriceAlerts">
                </div>
              </div>

              <div class="notification-item">
                <div>
                  <h6 class="mb-1 fw-bold text-dark">{{ 'SETTINGS.AI_INSIGHTS_NOTIF' | translate }}</h6>
                  <small class="text-muted">{{ 'SETTINGS.AI_INSIGHTS_DESC' | translate }}</small>
                </div>
                <div class="form-check form-switch custom-switch">
                  <input class="form-check-input" type="checkbox" formControlName="notifyAiInsights">
                </div>
              </div>

              <div class="notification-item border-0 pb-0">
                <div>
                  <h6 class="mb-1 fw-bold text-dark">{{ 'SETTINGS.PORTFOLIO_UPDATES' | translate }}</h6>
                  <small class="text-muted">{{ 'SETTINGS.PORTFOLIO_UPDATES_DESC' | translate }}</small>
                </div>
                <div class="form-check form-switch custom-switch">
                  <input class="form-check-input" type="checkbox" formControlName="notifyPortfolioUpdates">
                </div>
              </div>
            </app-card>

          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .settings-container {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .text-gradient {
      background: linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .avatar-badge {
      background: linear-gradient(135deg, #ffc107, #ff9800);
      color: #fff;
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      padding: 0.35rem 0.75rem;
      border-radius: 50rem;
      box-shadow: 0 4px 10px rgba(255, 152, 0, 0.3);
    }

    .glass-input .form-control {
      background: rgba(255, 255, 255, 0.6);
      border: 1px solid rgba(13, 110, 253, 0.2);
      border-radius: 12px;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
    }

    .glass-input .form-control:focus {
      background: #fff;
      border-color: #0d6efd;
      box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.15);
    }
    
    .glass-input label {
      color: #6c757d;
      font-weight: 500;
    }

    .preference-item, .notification-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1.25rem;
      margin-bottom: 1.25rem;
      border-bottom: 1px solid rgba(0,0,0,0.06);
    }

    .glass-select {
      background-color: rgba(255,255,255,0.7);
      border: 1px solid rgba(13, 110, 253, 0.2);
      border-radius: 8px;
      padding: 0.4rem 2rem 0.4rem 1rem;
      box-shadow: 0 2px 5px rgba(0,0,0,0.02);
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .glass-select:focus {
      border-color: #0d6efd;
      box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.15);
    }

    .custom-switch .form-check-input {
      width: 3rem;
      height: 1.5rem;
      cursor: pointer;
    }

    .custom-switch .form-check-input:checked {
      background-color: #0d6efd;
      border-color: #0d6efd;
    }

    .provider-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 1rem;
    }

    .provider-card {
      background: rgba(255,255,255,0.5);
      border: 2px solid rgba(0,0,0,0.05);
      border-radius: 16px;
      padding: 1.5rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      color: #6c757d;
    }

    .provider-card:hover {
      background: rgba(255,255,255,0.9);
      border-color: rgba(13, 110, 253, 0.4);
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(13, 110, 253, 0.1);
      color: #0d6efd;
    }

    .provider-card.active {
      background: #0d6efd;
      border-color: #0d6efd;
      color: #fff;
      box-shadow: 0 8px 20px rgba(13, 110, 253, 0.25);
    }
    
    .save-btn {
      min-width: 180px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(13, 110, 253, 0.3);
      transition: all 0.3s;
    }
    .save-btn:hover:not([disabled]) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(13, 110, 253, 0.4);
    }
  `]
})
export class SettingsViewComponent implements OnInit {
  settingsForm: FormGroup;
  private ts = inject(TranslationService);
  private toast = inject(ToastService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  constructor() {
    this.settingsForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      aiProvider: ['Google'],
      language: ['en'],
      currency: ['INR'],
      theme: ['light'],
      notifyPriceAlerts: [true],
      notifyAiInsights: [true],
      notifyPortfolioUpdates: [false]
    });
  }

  ngOnInit() {
    this.loadSettings();
    this.settingsForm.valueChanges.subscribe(() => {
      if (this.settingsForm.valid) {
        this.saveSettings();
      }
    });
  }

  loadSettings() {
    const user = this.auth.currentUser();
    const saved = localStorage.getItem('nextgen_settings');
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.firstName === 'John') {
          parsed.firstName = 'Mahesh';
          parsed.lastName = 'Morde';
          parsed.email = 'mahesh.morde@example.com';
        }
        this.settingsForm.patchValue(parsed);
      } catch (e) {
        console.error('Failed to parse settings');
      }
    } else {
      // Default to auth user
      this.settingsForm.patchValue({
        firstName: user?.name?.split(' ')[0] || 'Mahesh',
        lastName: user?.name?.split(' ')[1] || 'Morde',
        email: user?.email || 'mahesh.morde@example.com',
        language: this.ts.getCurrentLang()
      });
    }
  }

  setProvider(provider: string) {
    this.settingsForm.patchValue({ aiProvider: provider });
    this.settingsForm.markAsDirty();
  }

  changeLang(event: any) {
    const lang = event.target.value;
    this.settingsForm.patchValue({ language: lang });
    this.ts.use(lang);
  }

  saveSettings() {
    if (this.settingsForm.valid) {
      localStorage.setItem('nextgen_settings', JSON.stringify(this.settingsForm.value));
      // Removed toast to prevent spamming on every auto-save tick
      this.settingsForm.markAsPristine();
    }
  }
}
