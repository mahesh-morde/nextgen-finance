import { Component, OnInit } from '@angular/core';
import { generateRealisticParagraphs } from './reports-data';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-reports-view',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent, BadgeComponent, NgApexchartsModule, TranslatePipe],
  template: `
    <div class="mb-4">
      <div class="d-flex align-items-center mb-1">
        <span class="pulse-dot me-2"></span>
        <span class="small text-success fw-bold tracking-wide">ANALYTICS ENGINE</span>
      </div>
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h2 class="fw-bold text-dark mb-1">{{ 'REPORTS.HEADER' | translate }}</h2>
          <p class="text-muted small mb-0">{{ 'REPORTS.SUBTITLE' | translate }}</p>
        </div>
        <app-button variant="primary" label="Download PDF" icon="bi-download" (onClick)="downloadPdf()" [disabled]="isGenerating"></app-button>
      </div>
    </div>

    <div class="row g-4 h-100">
      <!-- Left Panel: Vertical Cards -->
      <div class="col-12 col-xl-3 d-flex flex-column gap-3">
        <div class="report-card p-3 d-flex flex-column" 
             *ngFor="let r of reportTypes"
             [class.active]="activeReport === r.id" 
             (click)="generateReport(r)">
          <div class="d-flex align-items-center mb-2">
            <div class="icon-box text-{{r.color}} me-3 bg-{{r.color}} bg-opacity-10 p-2 rounded">
              <i class="bi {{r.icon}} fs-4"></i>
            </div>
            <div>
              <h6 class="fw-bold text-dark mb-0">{{ r.title | translate }}</h6>
              <span class="small text-muted" style="font-size: 0.75rem;">{{ r.period }}</span>
            </div>
          </div>
          <p class="small text-muted mb-0" style="font-size: 0.8rem;">{{ r.desc | translate }}</p>
        </div>
      </div>

      <!-- Right Panel: Full Fledged Report or Loader -->
      <div class="col-12 col-xl-9">
        
        <!-- AI Generating Loader -->
        <div *ngIf="isGenerating" class="glass-card p-5 d-flex flex-column align-items-center justify-content-center loader-container" style="height: calc(100vh - 180px);">
          <div class="ai-core-spinner mb-4">
            <div class="spinner-ring"></div>
            <div class="spinner-core"></div>
          </div>
          <h4 class="fw-bold text-dark mb-2 scanning-text">{{ currentLoadingText | translate }}</h4>
          <p class="text-muted small">{{ 'REPORTS_CONTENT.LOADER_SUBTITLE' | translate }}</p>
          
          <div class="progress-bar-container mt-3 w-50">
            <div class="ai-progress-bar"></div>
          </div>
        </div>

        <!-- Generated Report -->
        <div *ngIf="!isGenerating && generatedReport" class="glass-card p-5 slide-up report-container overflow-auto" style="height: calc(100vh - 180px);">
          
          <!-- PERF REPORT LAYOUT -->
          <ng-container *ngIf="activeReport === 'perf'">
            <div class="mb-5">
              <img src="images/reports/futuristic_finance_performance_1782552229232.png" class="hero-image mb-4" alt="Performance Hero">
              <h1 class="fw-bold text-dark display-5 mb-2">{{ 'REPORTS_CONTENT.PERF_TITLE' | translate }}</h1>
              <p class="text-muted fs-5">{{ 'REPORTS_CONTENT.PERF_SUBTITLE' | translate }}</p>
            </div>
            <div class="split-layout mb-5">
              <div>
                <h4 class="fw-bold text-dark mb-3 border-start border-4 border-primary ps-3">{{ 'REPORTS_CONTENT.LANDSCAPE_TITLE' | translate }}</h4>
                <p class="text-muted lh-lg">{{ 'REPORTS_CONTENT.LANDSCAPE_TEXT' | translate }}</p>
              </div>
              <div class="p-4 bg-primary bg-opacity-10 rounded">
                <h6 class="text-primary fw-bold"><i class="bi bi-graph-up-arrow me-2"></i>{{ 'REPORTS_CONTENT.ALPHA_TITLE' | translate }}</h6>
                <p class="small text-dark mb-0">{{ 'REPORTS_CONTENT.ALPHA_TEXT' | translate }}</p>
              </div>
            </div>
          </ng-container>

          <!-- TAX REPORT LAYOUT -->
          <ng-container *ngIf="activeReport === 'tax'">
            <div class="mb-5 border-bottom pb-4">
              <h1 class="fw-bold text-danger display-6 mb-2">{{ 'REPORTS_CONTENT.TAX_TITLE' | translate }}</h1>
              <p class="text-muted fs-5">{{ 'REPORTS_CONTENT.TAX_SUBTITLE' | translate }}</p>
            </div>
            <div class="row align-items-center mb-5">
              <div class="col-md-6">
                <img src="images/reports/futuristic_tax_compliance_1782552342080.png" class="side-image" alt="Tax Compliance">
              </div>
              <div class="col-md-6">
                <h4 class="fw-bold text-dark mb-3 border-start border-4 border-danger ps-3">{{ 'REPORTS_CONTENT.CG_OVERVIEW' | translate }}</h4>
                <p class="text-muted lh-lg">{{ 'REPORTS_CONTENT.CG_TEXT' | translate }}</p>
                <div class="alert alert-danger border-0 border-start border-4 border-danger mt-3">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i> <strong>{{ 'REPORTS_CONTENT.CRITICAL_WARNING' | translate }}</strong> {{ 'REPORTS_CONTENT.TAX_WARNING_TEXT' | translate }}
                </div>
              </div>
            </div>
          </ng-container>

          <!-- DIV REPORT LAYOUT -->
          <ng-container *ngIf="activeReport === 'div'">
            <div class="text-center mb-5">
              <h1 class="fw-bold text-success display-5 mb-2">{{ 'REPORTS_CONTENT.DIV_TITLE' | translate }}</h1>
              <p class="text-muted">{{ 'REPORTS_CONTENT.DIV_SUBTITLE' | translate }}</p>
            </div>
            <div class="row g-4 mb-5">
              <div class="col-md-4">
                 <div class="masonry-card h-100">
                   <h6 class="text-muted text-uppercase small fw-bold">{{ 'REPORTS_CONTENT.BLENDED_YIELD' | translate }}</h6>
                   <h2 class="fw-bold text-dark mt-2">3.5%</h2>
                   <p class="small text-muted mb-0">{{ 'REPORTS_CONTENT.YIELD_TEXT' | translate }}</p>
                 </div>
              </div>
              <div class="col-md-4">
                 <div class="masonry-card h-100 border-primary">
                   <h6 class="text-muted text-uppercase small fw-bold">{{ 'REPORTS_CONTENT.IDLE_CASH' | translate }}</h6>
                   <h2 class="fw-bold text-dark mt-2">₹15,400</h2>
                   <p class="small text-muted mb-0">{{ 'REPORTS_CONTENT.IDLE_CASH_TEXT' | translate }}</p>
                 </div>
              </div>
              <div class="col-md-4">
                 <div class="masonry-card h-100 border-info">
                   <h6 class="text-muted text-uppercase small fw-bold">{{ 'REPORTS_CONTENT.TOP_CONTRIBUTOR' | translate }}</h6>
                   <h2 class="fw-bold text-dark mt-2">ITC Ltd.</h2>
                   <p class="small text-muted mb-0">{{ 'REPORTS_CONTENT.CONTRIBUTOR_TEXT' | translate }}</p>
                 </div>
              </div>
            </div>
            <div class="text-center mb-5">
              <img src="images/reports/futuristic_dividend_yield_1782552352808.png" class="hero-image" style="height: 250px;" alt="Dividend Visual">
            </div>
          </ng-container>

          <!-- AI REPORT LAYOUT (MASSIVE CONTENT) -->
          <ng-container *ngIf="activeReport === 'ai'">
            <div class="ai-terminal mb-5">
              <img src="images/reports/futuristic_ai_neural_network_1782552363393.png" alt="Neural Net">
              <h2 class="fw-bold mb-4">{{ 'REPORTS_CONTENT.AI_TITLE' | translate }}</h2>
              <p class="mb-2">{{ 'REPORTS_CONTENT.AI_RUNNING' | translate }}</p>
              <p class="mb-4">{{ 'REPORTS_CONTENT.AI_COMPLETE' | translate }}</p>
            </div>

          </ng-container>
          
          <!-- Dynamic Chart Injection based on Report Type -->
          <div class="chart-container border rounded p-4 bg-light my-5">
            <apx-chart
              *ngIf="chartOptions"
              [series]="chartOptions.series"
              [chart]="chartOptions.chart"
              [xaxis]="chartOptions.xaxis"
              [yaxis]="chartOptions.yaxis"
              [colors]="chartOptions.colors"
              [grid]="chartOptions.grid"
              [plotOptions]="chartOptions.plotOptions"
              [dataLabels]="chartOptions.dataLabels"
              [stroke]="chartOptions.stroke"
              [fill]="chartOptions.fill"
              [theme]="chartOptions.theme"
            ></apx-chart>
          </div>

          <!-- Dynamic Massive Content (Applies to all reports) -->
          <div class="report-content-body mt-5 pt-3">
            <div *ngFor="let section of massiveReportData; let i = index" class="mb-5 pb-4 border-bottom">
              <h3 class="fw-bold text-dark mb-4 border-start border-4 border-primary ps-3">{{ section.title | translate }}</h3>
              <p class="text-muted lh-lg fs-5 mb-4">{{ section.executiveSummary | translate }}</p>
              
              <div class="row g-4 mb-4">
                <div class="col-md-6" *ngFor="let point of section.keyPoints">
                  <div class="p-4 bg-light rounded h-100 border-start border-3 border-info">
                    <h6 class="fw-bold text-dark"><i class="bi bi-caret-right-fill text-primary me-2"></i>{{ point.header | translate }}</h6>
                    <p class="text-muted small mb-0">{{ point.details | translate }}</p>
                  </div>
                </div>
              </div>

              <div class="detailed-analysis">
                <h5 class="fw-bold mb-3 mt-5">{{ 'REPORTS_CONTENT.DYNAMIC.DEEP_DIVE' | translate }}</h5>
                <p class="text-muted lh-lg" *ngFor="let p of section.paragraphs">{{ p | translate }}</p>
              </div>
            </div>
          </div>
          

          
          <!-- FOOTERS -->
          <ng-container *ngIf="activeReport === 'perf'">
            <div class="mt-5 p-4 border rounded bg-light">
              <h5 class="fw-bold mb-3"><i class="bi bi-lightning-charge-fill text-primary me-2"></i>{{ 'REPORTS_CONTENT.STRATEGIC_PLAN' | translate }}</h5>
              <div class="row g-3">
                 <div class="col-md-4"><strong>{{ 'REPORTS_CONTENT.PLAN_1' | translate }}</strong></div>
                 <div class="col-md-4"><strong>{{ 'REPORTS_CONTENT.PLAN_2' | translate }}</strong></div>
                 <div class="col-md-4"><strong>{{ 'REPORTS_CONTENT.PLAN_3' | translate }}</strong></div>
              </div>
            </div>
          </ng-container>

          <ng-container *ngIf="activeReport === 'tax'">
            <div class="mt-5 p-4 border rounded shadow-sm">
              <h5 class="fw-bold mb-3 text-dark">{{ 'REPORTS_CONTENT.COMPLIANCE_ACTIONS' | translate }}</h5>
              <ul class="list-group list-group-flush">
                <li class="list-group-item px-0"><i class="bi bi-check-circle text-success me-2"></i> {{ 'REPORTS_CONTENT.COMP_1' | translate }}</li>
                <li class="list-group-item px-0"><i class="bi bi-clock text-warning me-2"></i> {{ 'REPORTS_CONTENT.COMP_2' | translate }}</li>
                <li class="list-group-item px-0"><i class="bi bi-shield-check text-info me-2"></i> {{ 'REPORTS_CONTENT.COMP_3' | translate }}</li>
              </ul>
            </div>
          </ng-container>

          <ng-container *ngIf="activeReport === 'div'">
            <div class="mt-5 p-4 border rounded bg-success bg-opacity-10 text-center">
              <h5 class="text-success fw-bold">{{ 'REPORTS_CONTENT.AUTOMATE_WEALTH' | translate }}</h5>
              <p class="text-dark">{{ 'REPORTS_CONTENT.AUTOMATE_TEXT' | translate }}</p>
            </div>
          </ng-container>

          <ng-container *ngIf="activeReport === 'ai'">
            <div class="mt-5 row g-4">
              <div class="col-md-6">
                 <div class="p-4 border rounded h-100">
                    <h5 class="fw-bold"><i class="bi bi-shield-shaded text-warning me-2"></i>{{ 'REPORTS_CONTENT.HEDGE_STRATEGY' | translate }}</h5>
                    <p class="text-muted">{{ 'REPORTS_CONTENT.HEDGE_TEXT' | translate }}</p>
                 </div>
              </div>
              <div class="col-md-6">
                 <div class="p-4 border rounded h-100">
                    <h5 class="fw-bold"><i class="bi bi-rocket-takeoff text-primary me-2"></i>{{ 'REPORTS_CONTENT.MEGATREND' | translate }}</h5>
                    <p class="text-muted">{{ 'REPORTS_CONTENT.MEGATREND_TEXT' | translate }}</p>
                 </div>
              </div>
            </div>
          </ng-container>

          <div class="text-center text-muted small mt-5 pt-3 border-top">
            <p>{{ 'REPORTS_CONTENT.END_REPORT' | translate }}</p>
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
      background: #198754;
      box-shadow: 0 0 0 0 rgba(25, 135, 84, 0.7);
      animation: pulseSuccess 2s infinite;
    }
    @keyframes pulseSuccess {
      0% { box-shadow: 0 0 0 0 rgba(25, 135, 84, 0.7); }
      70% { box-shadow: 0 0 0 8px rgba(25, 135, 84, 0); }
      100% { box-shadow: 0 0 0 0 rgba(25, 135, 84, 0); }
    }
    .report-card {
      background: rgba(255, 255, 255, 0.7) !important;
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.9);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        top: 0; left: -100%;
        width: 50%; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
        transition: all 0.4s;
        z-index: -1;
      }
      &:hover::before {
        left: 100%;
      }

      &:hover {
        transform: translateY(-4px) scale(1.02);
        background: #ffffff !important;
        border-color: rgba(13, 110, 253, 0.5);
        box-shadow: 0 10px 20px rgba(13, 110, 253, 0.15);
      }
      &.active {
        border-color: #0d6efd;
        background-color: #ffffff !important;
        border-left: 4px solid #0d6efd;
        box-shadow: 0 5px 15px rgba(13, 110, 253, 0.2);
      }
    }
    
    .glass-card {
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(248, 249, 250, 0.95));
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0,0,0,0.05);
      border-radius: 16px;
      box-shadow: inset 0 2px 4px rgba(255,255,255,1), 0 8px 32px rgba(0,0,0,0.05);
      transition: all 0.3s ease;
    }

    .report-container {
      scrollbar-width: thin;
      scrollbar-color: #cbd5e1 transparent;
      &::-webkit-scrollbar { width: 6px; }
      &::-webkit-scrollbar-track { background: transparent; }
      &::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
    }
    .slide-up {
      animation: slideUp 0.4s ease-out forwards;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* --- AI LOADER STYLES --- */
    .loader-container {
      position: relative;
      overflow: hidden;
    }
    .ai-core-spinner {
      position: relative;
      width: 100px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .spinner-ring {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 3px solid transparent;
      border-top-color: #0d6efd;
      border-right-color: #0dcaf0;
      animation: spinRing 1.5s linear infinite;
    }
    .spinner-core {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #0d6efd, #0dcaf0);
      border-radius: 50%;
      box-shadow: 0 0 20px rgba(13, 110, 253, 0.6);
      animation: pulseCore 1s ease-in-out infinite alternate;
    }
    @keyframes spinRing {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes pulseCore {
      0% { transform: scale(0.8); opacity: 0.8; }
      100% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 30px rgba(13, 110, 253, 0.9); }
    }
    .scanning-text {
      background: linear-gradient(90deg, #0d6efd, #0dcaf0, #0d6efd);
      background-size: 200% auto;
      color: transparent;
      -webkit-background-clip: text;
      animation: gradientText 2s linear infinite;
    }
    @keyframes gradientText {
      0% { background-position: 0% center; }
      100% { background-position: 200% center; }
    }
    .progress-bar-container {
      height: 4px;
      background: #e9ecef;
      border-radius: 2px;
      overflow: hidden;
      position: relative;
    }
    .ai-progress-bar {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 30%;
      background: linear-gradient(90deg, #0d6efd, #0dcaf0);
      border-radius: 2px;
      animation: slideProgress 2s ease-in-out infinite alternate;
    }
    @keyframes slideProgress {
      0% { left: -30%; }
      100% { left: 100%; }
    }

    /* --- DYNAMIC REPORT CLASSES --- */
    ::ng-deep .hero-image {
      width: 100%;
      height: 300px;
      object-fit: cover;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    ::ng-deep .split-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      align-items: center;
    }
    ::ng-deep .side-image {
      width: 100%;
      border-radius: 12px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.08);
    }
    ::ng-deep .masonry-card {
      background: #f8f9fa;
      border-left: 4px solid #198754;
      padding: 1.5rem;
      border-radius: 8px;
    }
    ::ng-deep .ai-terminal {
      background: #212529;
      color: #0dcaf0;
      padding: 2rem;
      border-radius: 12px;
      font-family: 'Courier New', Courier, monospace;
      position: relative;
      overflow: hidden;
    }
    ::ng-deep .ai-terminal img {
      position: absolute;
      right: -50px;
      top: -50px;
      width: 300px;
      opacity: 0.2;
      filter: grayscale(100%) sepia(100%) hue-rotate(180deg);
      mix-blend-mode: screen;
    }
  `]
})
export class ReportsViewComponent implements OnInit {
  isGenerating = false;
  currentLoadingText = '';
  loadingInterval: any;
  loadingSteps = [
    'REPORTS_CONTENT.STEP_1',
    'REPORTS_CONTENT.STEP_2',
    'REPORTS_CONTENT.STEP_3',
    'REPORTS_CONTENT.STEP_4',
    'REPORTS_CONTENT.STEP_5'
  ];

  reportTypes = [
    {
      id: 'perf',
      title: 'REPORTS.PERF_ANALYSIS',
      desc: 'REPORTS.PERF_DESC',
      icon: 'bi-graph-up-arrow',
      color: 'primary',
      period: 'Q3 2023'
    },
    {
      id: 'tax',
      title: 'REPORTS.TAX_COMPLIANCE',
      desc: 'REPORTS.TAX_DESC',
      icon: 'bi-bank',
      color: 'danger',
      period: 'FY 2023-24'
    },
    {
      id: 'div',
      title: 'REPORTS.DIVIDEND_YIELD',
      desc: 'Analysis of dividend payouts, yield percentages, and projected upcoming cash flows.',
      icon: 'bi-cash-coin',
      color: 'success',
      period: 'YTD'
    },
    {
      id: 'ai',
      title: 'REPORTS.AI_MACRO',
      desc: 'Advanced predictive modeling combining macro-economic factors with your specific holdings.',
      icon: 'bi-cpu',
      color: 'warning',
      period: 'Next 6 Months'
    }
  ];

  activeReport: string | null = null;
  generatedReport: any = null;
  chartOptions: any;
  massiveReportData: any[] = [];
  
  ngOnInit() {
    this.generateReport(this.reportTypes[0]); // Default to Performance report
  }

  generateMassiveData(type: string) {
    this.massiveReportData = [];
    let titles: string[] = [];

    if (type === 'perf') {
      titles = Array.from({length: 10}, (_, i) => `REPORTS_DYNAMIC_TITLES.PERF_${i + 1}`);
    } else if (type === 'tax') {
      titles = Array.from({length: 10}, (_, i) => `REPORTS_DYNAMIC_TITLES.TAX_${i + 1}`);
    } else if (type === 'div') {
      titles = Array.from({length: 10}, (_, i) => `REPORTS_DYNAMIC_TITLES.DIV_${i + 1}`);
    } else {
      titles = Array.from({length: 10}, (_, i) => `REPORTS_DYNAMIC_TITLES.AI_${i + 1}`);
    }

    for (let i = 0; i < 10; i++) {
      this.massiveReportData.push({
        title: titles[i], // Don't prefix with "Section 1", just show title, or we can use translate for "Section" in the template
        executiveSummary: "REPORTS_CONTENT.DYNAMIC.EXECUTIVE_SUMMARY",
        keyPoints: [
          { header: "REPORTS_CONTENT.DYNAMIC.PRIMARY_CATALYST", details: "REPORTS_CONTENT.DYNAMIC.PRIMARY_CATALYST_DESC" },
          { header: "REPORTS_CONTENT.DYNAMIC.AI_CONFIDENCE", details: "92% REPORTS_CONTENT.DYNAMIC.AI_CONFIDENCE_DESC" },
          { header: "REPORTS_CONTENT.DYNAMIC.ACTIONABLE_INSIGHT", details: "REPORTS_CONTENT.DYNAMIC.ACTIONABLE_INSIGHT_DESC" },
          { header: "REPORTS_CONTENT.DYNAMIC.TIME_HORIZON", details: "REPORTS_CONTENT.DYNAMIC.TIME_HORIZON_DESC" }
        ],
        paragraphs: generateRealisticParagraphs(type, 8) // 8 thick unique paragraphs per section
      });
    }
  }

  generateReport(report: any) {
    if (this.isGenerating || this.activeReport === report.id) return;
    
    this.activeReport = report.id;
    this.isGenerating = true;
    this.generatedReport = null;
    this.chartOptions = null;
    
    // Start Loading Sequence
    let stepIndex = 0;
    this.currentLoadingText = this.loadingSteps[stepIndex];
    
    this.loadingInterval = setInterval(() => {
      stepIndex++;
      if (stepIndex < this.loadingSteps.length) {
        this.currentLoadingText = this.loadingSteps[stepIndex];
      }
    }, 500);

    // Simulate AI generation time (2.5 seconds)
    setTimeout(() => {
      clearInterval(this.loadingInterval);
      this.isGenerating = false;
      this.generatedReport = report;
      this.generateMassiveData(report.id);
      this.buildChart(report.id);
    }, 2500);
  }

  buildChart(type: string) {
    // Advanced ApexCharts Configuration for a professional look
    if (type === 'perf') {
      this.chartOptions = {
        series: [
          { name: "Portfolio", data: [31, 40, 28, 51, 42, 109, 100] },
          { name: "NIFTY 50", data: [11, 32, 45, 32, 34, 52, 41] }
        ],
        chart: { type: 'area', height: 350, toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
        colors: ['#0d6efd', '#6c757d'],
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] } },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"] },
        theme: { mode: 'light' }
      };
    } else if (type === 'tax') {
      this.chartOptions = {
        series: [
          { name: 'Short-Term (15%)', data: [44, 55, 41, 67, 22, 43] },
          { name: 'Long-Term (10%)', data: [13, 23, 20, 8, 13, 27] }
        ],
        chart: { type: 'bar', height: 350, stacked: true, toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
        colors: ['#dc3545', '#198754'],
        plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: '40%' } },
        dataLabels: { enabled: false },
        stroke: { width: 1, colors: ['#fff'] },
        xaxis: { categories: ["FY20", "FY21", "FY22", "FY23", "FY24", "FY25 (Est)"] },
        fill: { opacity: 1 },
        theme: { mode: 'light' }
      };
    } else if (type === 'div') {
      this.chartOptions = {
        series: [{ name: "Dividend Income (₹)", data: [1500, 4200, 800, 6500, 1200, 8500, 3200, 11000] }],
        chart: { type: 'line', height: 350, toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
        colors: ['#198754'],
        stroke: { width: 4, curve: 'stepline' },
        dataLabels: { enabled: false },
        markers: { size: 6, hover: { sizeOffset: 4 } },
        xaxis: { categories: ["Q1 '22", "Q2 '22", "Q3 '22", "Q4 '22", "Q1 '23", "Q2 '23", "Q3 '23", "Q4 '23"] },
        theme: { mode: 'light' }
      };
    } else {
      // Radar chart for AI Insights
      this.chartOptions = {
        series: [{ name: 'Current Allocation', data: [80, 50, 30, 40, 100, 20] }],
        chart: { type: 'radar', height: 350, toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
        colors: ['#ffc107'],
        stroke: { width: 2 },
        fill: { opacity: 0.2 },
        markers: { size: 4 },
        xaxis: { categories: ['Growth', 'Value', 'Momentum', 'Quality', 'Yield', 'Volatility'] },
        yaxis: { show: false },
        theme: { mode: 'light' }
      };
    }
  }

  downloadPdf() {
    window.print();
  }
}
