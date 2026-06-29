import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { TranslationService } from '../../../core/i18n/translation.service';

@Component({
  selector: 'app-risk-view',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule, TranslatePipe],
  template: `
    <div class="mb-4">
      <div class="d-flex align-items-center mb-2">
        <span class="pulse-dot me-2"></span>
        <span class="small text-primary fw-bold tracking-wide">{{ 'RISK.SIMULATOR_TAG' | translate }}</span>
      </div>
      <h2 class="fw-bold text-dark">{{ 'RISK.HEADER' | translate }}</h2>
      <p class="text-muted">{{ 'RISK.SUBTITLE' | translate }}</p>
    </div>

    <div class="row g-4 mb-4">
      <!-- Controls -->
      <div class="col-12 col-xl-4">
        <div class="glass-card p-4 h-100">
           <h5 class="fw-bold mb-4 border-bottom border-light pb-2">{{ 'RISK.SIMULATION_PARAMS' | translate }}</h5>
          
          <div class="mb-4 slider-group">
            <div class="d-flex justify-content-between mb-2">
              <label class="form-label text-muted small fw-bold tracking-wide mb-0">{{ 'RISK.INITIAL_INVESTMENT' | translate }}</label>
              <span class="text-primary fw-bold">₹{{ formatLakhs(investment) }}L</span>
            </div>
            <input type="range" class="form-range custom-range text-primary" min="1" max="50" [(ngModel)]="investment">
            <div class="d-flex justify-content-between small text-muted opacity-75">
              <span>₹1L</span>
              <span>₹50L</span>
            </div>
          </div>
          
          <div class="mb-4 slider-group">
            <div class="d-flex justify-content-between mb-2">
              <label class="form-label text-muted small fw-bold tracking-wide mb-0">{{ 'RISK.TIME_HORIZON' | translate }}</label>
              <span class="text-primary fw-bold">{{ 'RISK.YEARS_LABEL' | translate:{years: years} }}</span>
            </div>
            <input type="range" class="form-range custom-range text-primary" min="1" max="30" [(ngModel)]="years">
            <div class="d-flex justify-content-between small text-muted opacity-75">
              <span>{{ 'RISK.MIN_YR' | translate }}</span>
              <span>{{ 'RISK.MAX_YR' | translate }}</span>
            </div>
          </div>

          <div class="mb-4 slider-group">
            <div class="d-flex justify-content-between mb-2">
              <label class="form-label text-muted small fw-bold tracking-wide mb-0">{{ 'RISK.TOLERANCE' | translate }}</label>
              <span [class]="getRiskColorClass()">{{ riskLevel }} / 10</span>
            </div>
            <input type="range" class="form-range custom-range" [class]="getRiskSliderClass()" min="1" max="10" [(ngModel)]="riskLevel">
            <div class="d-flex justify-content-between small text-muted opacity-75">
              <span>{{ 'DASHBOARD.SAFE' | translate }}</span>
              <span>{{ 'DASHBOARD.AGG' | translate }}</span>
            </div>
          </div>
          
          <button class="btn btn-primary w-100 fw-bold py-3 mt-2 btn-simulate" (click)="triggerSimulation()" [disabled]="isSimulating">
            <i class="bi bi-cpu me-2"></i>
            <span *ngIf="!isSimulating">{{ 'RISK.RUN_NEURAL' | translate }}</span>
            <span *ngIf="isSimulating">{{ 'RISK.CALCULATING_VECTORS' | translate }}</span>
          </button>

          <!-- Deep AI Insights -->
          <div class="ai-insight-box mt-4 p-3 rounded bg-light border border-primary border-opacity-25">
            <div class="d-flex align-items-center mb-2">
              <i class="bi bi-robot text-primary fs-4 me-2"></i>
              <div>
                <div class="small fw-bold text-dark">{{ 'ASSISTANT.CHAT_HEADER' | translate }}</div>
                <div class="text-xs text-muted">{{ 'ASSISTANT.SKILL_6_TITLE' | translate }}</div>
              </div>
            </div>
            <p class="small text-dark mb-0 mt-2 lh-base">
              {{ getAiInsight() }}
            </p>
            
            <div class="mt-3 border-top pt-2">
               <span class="badge bg-primary bg-opacity-10 text-primary me-2">{{ 'ASSISTANT.SKILL_5_TITLE' | translate }}</span>
               <span class="badge bg-success bg-opacity-10 text-success">{{ 'ASSISTANT.SKILL_3_DESC' | translate }}</span>
            </div>
          </div>

        </div>
      </div>

      <!-- Chart & Scenarios -->
      <div class="col-12 col-xl-8">
        <div class="glass-card p-4 h-100 d-flex flex-column">
           <h5 class="fw-bold mb-4 border-bottom border-light pb-2">{{ 'RISK.PROJECTION_TITLE' | translate }}</h5>
          
          <div class="chart-wrapper position-relative flex-grow-1 border rounded bg-dark p-3" style="min-height: 400px; overflow: hidden;">
            <!-- AI Scanner Overlay -->
            <div *ngIf="isSimulating" class="scanner-overlay d-flex flex-column align-items-center justify-content-center">
              <div class="scanner-beam"></div>
              <div class="spinner-border text-info mb-3" style="width: 3rem; height: 3rem;" role="status"></div>
              <h5 class="text-info font-monospace fw-bold scanning-text">{{ 'RISK.PROCESSING_MC' | translate }}</h5>
            </div>
            
            <div *ngIf="chartOptions" id="simulation-chart" [class.invisible]="isSimulating">
              <apx-chart
                [series]="chartOptions.series"
                [chart]="chartOptions.chart"
                [xaxis]="chartOptions.xaxis"
                [yaxis]="chartOptions.yaxis"
                [dataLabels]="chartOptions.dataLabels"
                [grid]="chartOptions.grid"
                [stroke]="chartOptions.stroke"
                [colors]="chartOptions.colors"
                [fill]="chartOptions.fill"
                [tooltip]="chartOptions.tooltip"
                [theme]="chartOptions.theme"
                [legend]="chartOptions.legend"
              ></apx-chart>
            </div>
          </div>

          <div class="row g-3 mt-4">
            <div class="col-12 col-md-4">
               <div class="scenario-card p-3 rounded text-center border-success success-glow">
                <div class="text-success small fw-bold text-uppercase tracking-wide mb-1">{{ 'RISK.BEST_CASE' | translate }}</div>
                <div class="fs-4 fw-bold text-dark">₹{{ finalBest | number:'1.2-2' }}L</div>
                <div class="small text-muted">{{ 'RISK.TOP_OUTCOME' | translate }}</div>
              </div>
            </div>
            <div class="col-12 col-md-4">
               <div class="scenario-card p-3 rounded text-center border-primary primary-glow">
                <div class="text-primary small fw-bold text-uppercase tracking-wide mb-1">{{ 'RISK.EXPECTED' | translate }}</div>
                <div class="fs-4 fw-bold text-dark">₹{{ finalExpected | number:'1.2-2' }}L</div>
                <div class="small text-muted">{{ 'RISK.MEDIAN_OUTCOME' | translate }}</div>
              </div>
            </div>
            <div class="col-12 col-md-4">
               <div class="scenario-card p-3 rounded text-center border-danger danger-glow">
                <div class="text-danger small fw-bold text-uppercase tracking-wide mb-1">{{ 'RISK.WORST_CASE' | translate }}</div>
                <div class="fs-4 fw-bold text-dark">₹{{ finalWorst | number:'1.2-2' }}L</div>
                <div class="small text-muted">{{ 'RISK.BOTTOM_OUTCOME' | translate }}</div>
              </div>
            </div>
          </div>
        </div>
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
      animation: pulsePrimary 2s infinite;
    }
    @keyframes pulsePrimary {
      0% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.7); }
      70% { box-shadow: 0 0 0 8px rgba(13, 110, 253, 0); }
      100% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0); }
    }
    .text-xs { font-size: 0.75rem; }

    /* Clean Range Sliders */
    .custom-range {
      height: 6px;
      border-radius: 3px;
    }
    
    /* Risk Colors */
    .range-safe { accent-color: #198754; }
    .range-mod { accent-color: #0d6efd; }
    .range-agg { accent-color: #dc3545; }

    /* Futuristic UI */
    .glass-card {
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(248, 249, 250, 0.95));
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0,0,0,0.05);
      border-radius: 16px;
      box-shadow: inset 0 2px 4px rgba(255,255,255,1), 0 8px 32px rgba(0,0,0,0.05);
      transition: all 0.3s ease;
    }
    
    .scenario-card {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(8px);
      border: 1px solid;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      cursor: default;
    }
    .scenario-card:hover {
      transform: translateY(-4px) scale(1.02);
      background: #ffffff;
    }
    .primary-glow { border-color: rgba(13, 110, 253, 0.3); }
    .primary-glow:hover { border-color: rgba(13, 110, 253, 0.6); box-shadow: 0 10px 20px rgba(13, 110, 253, 0.15); }
    .success-glow { border-color: rgba(25, 135, 84, 0.3); }
    .success-glow:hover { border-color: rgba(25, 135, 84, 0.6); box-shadow: 0 10px 20px rgba(25, 135, 84, 0.15); }
    .danger-glow:hover { border-color: rgba(220, 53, 69, 0.6); box-shadow: 0 10px 20px rgba(220, 53, 69, 0.15); }
    
    .btn-simulate {
      background: linear-gradient(45deg, #0d6efd, #0dcaf0);
      border: none;
      box-shadow: 0 4px 15px rgba(13, 110, 253, 0.3);
      transition: all 0.3s ease;
      letter-spacing: 1px;
    }
    .btn-simulate:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(13, 110, 253, 0.5);
    }
    .btn-simulate:active {
      transform: translateY(0);
    }

    .scanner-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(33, 37, 41, 0.9);
      z-index: 10;
      overflow: hidden;
      border-radius: 6px;
    }
    .scanner-beam {
      position: absolute;
      top: 0; left: -100%;
      width: 50%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(13, 202, 240, 0.4), transparent);
      animation: scanEffect 1.5s linear infinite;
    }
    @keyframes scanEffect {
      0% { left: -100%; }
      100% { left: 200%; }
    }
    .scanning-text {
      letter-spacing: 2px;
      text-shadow: 0 0 10px rgba(13, 202, 240, 0.8);
      animation: pulseText 1s ease-in-out infinite alternate;
    }
    @keyframes pulseText {
      from { opacity: 0.6; }
      to { opacity: 1; }
    }
  `]
})
export class RiskViewComponent implements OnInit {
  investment = 10; // Lakhs
  years = 10;
  riskLevel = 5;
  isSimulating = false;

  chartOptions: any;

  private ts = inject(TranslationService);

  finalBest = 0;
  finalExpected = 0;
  finalWorst = 0;

  ngOnInit() {
    this.runSimulation();
  }

  formatLakhs(val: number) {
    return val;
  }

  getRiskColorClass() {
    if (this.riskLevel < 4) return 'fw-bold text-success';
    if (this.riskLevel > 7) return 'fw-bold text-danger';
    return 'fw-bold text-primary';
  }

  getRiskSliderClass() {
    if (this.riskLevel < 4) return 'range-safe';
    if (this.riskLevel > 7) return 'range-agg';
    return 'range-mod';
  }

  getAiInsight() {
    if (this.riskLevel < 4) {
      return this.ts.translate('RISK.AI_INSIGHT_CONS');
    }
    if (this.riskLevel > 7) {
      return this.ts.translate('RISK.AI_INSIGHT_AGG');
    }
    return this.ts.translate('RISK.AI_INSIGHT_MOD');
  }

  triggerSimulation() {
    this.isSimulating = true;
    // Simulate AI thinking and calculation time
    setTimeout(() => {
      this.runSimulation();
      this.isSimulating = false;
    }, 2000);
  }

  runSimulation() {
    const currentYear = new Date().getFullYear();
    const categories = [];
    for (let i = 0; i <= this.years; i++) {
      categories.push((currentYear + i).toString());
    }

    const baseReturn = 0.05 + (this.riskLevel * 0.01); 
    const volatility = 0.02 + (this.riskLevel * 0.023);

    let bestPath = [this.investment];
    let expPath = [this.investment];
    let worstPath = [this.investment];

    let currBest = this.investment;
    let currExp = this.investment;
    let currWorst = this.investment;

    for (let i = 1; i <= this.years; i++) {
      currBest = currBest * (1 + baseReturn + (volatility * 1.5));
      bestPath.push(currBest);

      currExp = currExp * (1 + baseReturn);
      expPath.push(currExp);

      currWorst = currWorst * (1 + baseReturn - (volatility * 1.5));
      if (currWorst < 0) currWorst = 0;
      worstPath.push(currWorst);
    }

    this.finalBest = bestPath[bestPath.length - 1];
    this.finalExpected = expPath[expPath.length - 1];
    this.finalWorst = worstPath[worstPath.length - 1];

    this.updateChart(categories, bestPath, expPath, worstPath);
  }

  updateChart(categories: string[], best: number[], expected: number[], worst: number[]) {
    this.chartOptions = {
      series: [
        { name: this.ts.translate('RISK.BEST_CASE'), data: best.map(v => Number(v.toFixed(2))) },
        { name: this.ts.translate('RISK.EXPECTED'), data: expected.map(v => Number(v.toFixed(2))) },
        { name: this.ts.translate('RISK.WORST_CASE'), data: worst.map(v => Number(v.toFixed(2))) }
      ],
      chart: {
        height: 380,
        type: 'area', // Changed to area for futuristic look
        background: 'transparent',
        toolbar: { show: false },
        animations: { enabled: true, dynamicAnimation: { speed: 800 } },
        dropShadow: {
          enabled: true,
          top: 0,
          left: 0,
          blur: 3,
          color: '#000',
          opacity: 0.7
        }
      },
      colors: ['#00e676', '#0dcaf0', '#ff1744'], // Neon Success, Neon Info, Neon Danger
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3 },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: 'vertical',
          shadeIntensity: 0.5,
          gradientToColors: ['#00e676', '#0dcaf0', '#ff1744'],
          inverseColors: true,
          opacityFrom: 0.6,
          opacityTo: 0.05,
          stops: [0, 100]
        },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        labels: { colors: '#f8f9fa' }
      },
      xaxis: {
        categories: categories,
        labels: { style: { colors: '#adb5bd' } },
        axisBorder: { color: '#495057' },
        axisTicks: { color: '#495057' }
      },
      yaxis: {
        labels: {
          formatter: (val: number) => '₹' + val.toFixed(0) + 'L',
          style: { colors: '#adb5bd' }
        }
      },
      grid: {
        borderColor: '#343a40',
        strokeDashArray: 4,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } }
      },
      theme: { mode: 'dark' },
      tooltip: {
        theme: 'dark',
        y: { formatter: (val: number) => '₹' + val.toFixed(2) + ' Lakhs' }
      }
    };
  }
}
