import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { MarketDataService, AssetData } from '../../../core/services/market-data.service';
import { Subscription, interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-portfolio-summary',
  standalone: true,
  imports: [CommonModule, CardComponent, BadgeComponent, TranslatePipe],
  template: `
    <app-card [title]="'DASHBOARD.SUMMARY_TITLE' | translate">
      <div header-actions *ngIf="totalValue > 0">
        <app-badge [variant]="totalGain >= 0 ? 'success' : 'danger'" [pill]="true" [icon]="totalGain >= 0 ? 'bi-arrow-up-right' : 'bi-arrow-down-right'">
          {{ totalGain >= 0 ? '+' : '' }}{{ totalGainPercent | number:'1.2-2' }}%
        </app-badge>
      </div>
      
      <div class="summary-grid">
        <div class="summary-item main-value">
          <div class="text-muted small text-uppercase tracking-wide">{{ 'DASHBOARD.TOTAL_VALUE' | translate }}</div>
          <div class="fw-bold value-text text-dark" *ngIf="totalValue > 0">₹{{ totalValue | number:'1.2-2' }}</div>
          <div class="spinner-border spinner-border-sm text-info mt-2" *ngIf="totalValue === 0"></div>
        </div>
        
        <div class="summary-item main-value">
          <div class="text-muted small text-uppercase tracking-wide">{{ 'DASHBOARD.INVESTED' | translate }}</div>
          <div class="fw-bold value-text text-dark" *ngIf="totalValue > 0">₹{{ investedTotal | number:'1.2-2' }}</div>
          <div class="spinner-border spinner-border-sm text-info mt-2" *ngIf="totalValue === 0"></div>
        </div>
        
        <div class="summary-item mt-3">
          <div class="text-muted small text-uppercase tracking-wide">{{ 'DASHBOARD.TODAY_CHANGE' | translate }}</div>
          <div *ngIf="totalValue > 0" [ngClass]="totalChange >= 0 ? 'text-success' : 'text-danger'" class="fw-bold fs-4">
            <i class="bi" [ngClass]="totalChange >= 0 ? 'bi-caret-up-fill' : 'bi-caret-down-fill'"></i>
            ₹{{ Math.abs(totalChange) | number:'1.2-2' }} ({{ totalChangePercent | number:'1.2-2' }}%)
          </div>
        </div>

        <div class="summary-item mt-3">
          <div class="text-muted small text-uppercase tracking-wide">{{ 'DASHBOARD.TOTAL_GAIN' | translate }}</div>
          <div *ngIf="totalValue > 0" [ngClass]="totalGain >= 0 ? 'text-success' : 'text-danger'" class="fw-bold fs-4">
            <i class="bi" [ngClass]="totalGain >= 0 ? 'bi-caret-up-fill' : 'bi-caret-down-fill'"></i>
            ₹{{ Math.abs(totalGain) | number:'1.2-2' }} ({{ totalGainPercent | number:'1.2-2' }}%)
          </div>
        </div>
      </div>

    </app-card>
  `,
  styles: [`
    .summary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-top: 0.5rem;
    }
    .tracking-wide { letter-spacing: 1px; }
    .value-text {
      font-size: 2.2rem;
      line-height: 1.2;
    }
  `]
})
export class PortfolioSummaryComponent implements OnInit, OnDestroy {
  Math = Math;
  private marketDataService = inject(MarketDataService);
  private dataSub?: Subscription;
  
  public stocks: AssetData[] = [];
  public totalValue = 0;
  public totalChange = 0;
  public totalChangePercent = 0;
  public investedTotal = 0;
  public totalGain = 0;
  public totalGainPercent = 0;

  // Mock holdings qty and average cost for calculating realistic total value & gain
  private portfolioHoldings: Record<string, { qty: number, avgCost: number }> = {
    'RELIANCE.NS': { qty: 50, avgCost: 2800 },
    'TCS.NS': { qty: 30, avgCost: 3500 },
    'PARAGPARIKH': { qty: 1520, avgCost: 55 },
    'BTC-USD': { qty: 0.15, avgCost: 55000 },
    'GOLD': { qty: 10, avgCost: 6500 },
    'EPF': { qty: 1, avgCost: 1500000 },
    'HDFCBANK.NS': { qty: 75, avgCost: 1500 }
  };

  ngOnInit() {
    const symbols = Object.keys(this.portfolioHoldings);
    
    this.dataSub = interval(1000)
      .pipe(
        startWith(0),
        switchMap(() => this.marketDataService.fetchMultipleStocks(symbols))
      )
      .subscribe({
        next: (res) => {
          this.stocks = res;
          this.calculateTotals();
        },
        error: (err) => console.error(err)
      });
  }

  calculateTotals() {
    let currentTotal = 0;
    let previousTotal = 0;
    let invested = 0;

    this.stocks.forEach(stock => {
      const holding = this.portfolioHoldings[stock.symbol];
      if (!holding) return;
      const { qty, avgCost } = holding;
      
      // Simulate live market fluctuation (+/- 0.1%)
      const jitter = (Math.random() - 0.5) * (stock.price * 0.002);
      const simulatedLivePrice = stock.price + jitter;

      const currentVal = simulatedLivePrice * qty;
      const prevPrice = stock.price - stock.change;
      const prevVal = prevPrice * qty;
      
      currentTotal += currentVal;
      previousTotal += prevVal;
      invested += (avgCost * qty);
    });

    this.totalValue = currentTotal;
    this.investedTotal = invested;
    
    this.totalGain = currentTotal - invested;
    this.totalGainPercent = invested > 0 ? (this.totalGain / invested) * 100 : 0;
    
    this.totalChange = currentTotal - previousTotal;
    this.totalChangePercent = previousTotal > 0 ? (this.totalChange / previousTotal) * 100 : 0;
  }

  ngOnDestroy() {
    if (this.dataSub) {
      this.dataSub.unsubscribe();
    }
  }
}
