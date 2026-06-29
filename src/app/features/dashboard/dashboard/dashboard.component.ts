import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PortfolioSummaryComponent } from '../portfolio-summary/portfolio-summary.component';
import { RiskMeterComponent } from '../risk-meter/risk-meter.component';
import { PortfolioChartComponent } from '../portfolio-chart/portfolio-chart.component';
import { ChatWindowComponent } from '../../assistant/chat-window/chat-window.component';
import { MarketDataService, MarketIndex } from '../../../core/services/market-data.service';
import { Subscription, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, PortfolioSummaryComponent, RiskMeterComponent, PortfolioChartComponent, ChatWindowComponent, TranslatePipe],
  styleUrl: './dashboard.component.scss',
  template: `
    <!-- Main Content -->
    <div class="row g-4 h-100">
      <!-- Left Column: AI Chat Interaction -->
      <div class="col-12 col-xl-5 dashboard-left-panel">
        <app-chat-window></app-chat-window>
      </div>

      <!-- Right Column: Dashboard Widgets (Stacked vertically) -->
      <div class="col-12 col-xl-7 d-flex flex-column gap-4 dashboard-right-panel">
        <!-- Top Action Bar & Ticker -->
        <div class="market-ticker-wrapper bg-white shadow-sm border rounded">
          <div class="market-ticker">
            <ng-container *ngIf="indices.length > 0">
              <div class="ticker-content" aria-hidden="false">
                <div class="ticker-item" *ngFor="let idx of indices">
                  <span class="ticker-name">{{ idx.name }}</span>
                  <span class="ticker-value">₹{{ idx.value | number:'1.2-2' }}</span>
                  <span class="ticker-change fw-bold" [ngClass]="idx.changePercent >= 0 ? 'text-success' : 'text-danger'">
                    <i class="bi" [ngClass]="idx.changePercent >= 0 ? 'bi-caret-up-fill' : 'bi-caret-down-fill'"></i>
                    {{ Math.abs(idx.changePercent) | number:'1.2-2' }}%
                  </span>
                </div>
              </div>
              <div class="ticker-content" aria-hidden="true">
                <div class="ticker-item" *ngFor="let idx of indices">
                  <span class="ticker-name">{{ idx.name }}</span>
                  <span class="ticker-value">₹{{ idx.value | number:'1.2-2' }}</span>
                  <span class="ticker-change fw-bold" [ngClass]="idx.changePercent >= 0 ? 'text-success' : 'text-danger'">
                    <i class="bi" [ngClass]="idx.changePercent >= 0 ? 'bi-caret-up-fill' : 'bi-caret-down-fill'"></i>
                    {{ Math.abs(idx.changePercent) | number:'1.2-2' }}%
                  </span>
                </div>
              </div>
            </ng-container>
            <div class="ticker-content d-flex justify-content-center align-items-center w-100" *ngIf="indices.length === 0">
               <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
               <span class="text-muted small">{{ 'COMMON.LOADING' | translate }}</span>
            </div>
          </div>
        </div>
        <app-portfolio-summary></app-portfolio-summary>
        <app-portfolio-chart></app-portfolio-chart>
        <app-risk-meter></app-risk-meter>
        
        <!-- Recent AI Activity (Clean White Theme) -->
        <div class="activity-feed bg-white shadow-sm p-4 rounded border">
          <h6 class="text-dark fw-bold mb-3 d-flex align-items-center">
            <i class="bi bi-lightning-charge-fill text-primary me-2"></i> {{ 'DASHBOARD.AI_STREAM_TITLE' | translate }}
          </h6>
          <div class="feed-list">
            <div class="feed-item py-2 border-bottom">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="badge bg-primary bg-opacity-10 text-primary">{{ 'DASHBOARD.VOLUME_ALERT' | translate }}</span>
                <span class="small text-muted">{{ 'DASHBOARD.JUST_NOW' | translate }}</span>
              </div>
              <div class="text-sm" [innerHTML]="'DASHBOARD.FEED_MSG_1' | translate"></div>
            </div>
            <div class="feed-item py-2 border-bottom">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="badge bg-success bg-opacity-10 text-success">{{ 'DASHBOARD.PERFORMANCE' | translate }}</span>
                <span class="small text-muted">{{ 'DASHBOARD.MINS_AGO' | translate:{mins: 2} }}</span>
              </div>
              <div class="text-sm" [innerHTML]="'DASHBOARD.FEED_MSG_2' | translate"></div>
            </div>
            <div class="feed-item py-2">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="badge bg-warning bg-opacity-10 text-warning text-dark">{{ 'DASHBOARD.REBALANCE' | translate }}</span>
                <span class="small text-muted">{{ 'DASHBOARD.HOURS_AGO' | translate:{hours: 1} }}</span>
              </div>
              <div class="text-sm">{{ 'DASHBOARD.FEED_MSG_3' | translate }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  private marketService = inject(MarketDataService);
  
  Math = Math;
  indices: MarketIndex[] = [];
  private indicesSub?: Subscription;

  ngOnInit() {
    this.indicesSub = interval(30000)
      .pipe(
        startWith(0),
        switchMap(() => this.marketService.fetchMarketIndices())
      )
      .subscribe({
        next: (data) => this.indices = data,
        error: (err) => console.error('Error fetching indices', err)
      });
  }

  ngOnDestroy() {
    if (this.indicesSub) {
      this.indicesSub.unsubscribe();
    }
  }
}


