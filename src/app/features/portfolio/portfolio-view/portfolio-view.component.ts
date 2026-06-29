import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MarketDataService, AssetData, MarketIndex } from '../../../core/services/market-data.service';
import { Subscription, interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

interface Holding {
  name: string;
  symbol: string;
  quantity: number;
  avgPrice: number;
  sector: string;
  assetClass?: string;
  liveData?: AssetData;
  isMenuOpen?: boolean;
}

@Component({
  selector: 'app-portfolio-view',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, RouterModule, TranslatePipe],
  template: `
    <div class="portfolio-layout">
      <!-- Main Content: Holdings Table -->
      <div class="main-content bg-white w-100 flex-grow-1 d-flex flex-column">
        <!-- Top Toolbar & Summary -->
        <div class="toolbar p-3 border-bottom d-flex justify-content-between align-items-end bg-light flex-wrap gap-4">
          
          <!-- Tabs (Ribbon) -->
          <div class="d-flex gap-4 flex-wrap">
            <div class="tab fw-bold cursor-pointer pb-1" 
                 [class.text-primary]="activeTab === 'All'" 
                 [class.border-bottom]="activeTab === 'All'" 
                 [class.border-primary]="activeTab === 'All'" 
                 [class.border-3]="activeTab === 'All'"
                 [class.text-muted]="activeTab !== 'All'"
                 (click)="activeTab = 'All'">{{ 'PORTFOLIO.ALL' | translate }} ({{holdings.length}})</div>
                 
            <div class="tab fw-bold cursor-pointer pb-1 text-nowrap" 
                 *ngFor="let tab of tabs"
                 [class.text-primary]="activeTab === tab" 
                 [class.border-bottom]="activeTab === tab" 
                 [class.border-primary]="activeTab === tab" 
                 [class.border-3]="activeTab === tab"
                 [class.text-muted]="activeTab !== tab"
                 (click)="activeTab = tab">{{ 'PORTFOLIO.TAB_' + tab | translate }}</div>
          </div>

          <!-- Portfolio Summary Metrics -->
          <div class="d-flex gap-4 text-end">
            <div>
              <div class="small text-muted mb-1 text-uppercase fw-bold">{{ 'PORTFOLIO.INVESTED' | translate }}</div>
              <div class="fs-6 fw-bold">₹{{ totalInvested | number:'1.2-2' }}</div>
            </div>
            <div>
              <div class="small text-muted mb-1 text-uppercase fw-bold">{{ 'PORTFOLIO.CURRENT' | translate }}</div>
              <div class="fs-6 fw-bold">₹{{ totalCurrent | number:'1.2-2' }}</div>
            </div>
            <div>
              <div class="small text-muted mb-1 text-uppercase fw-bold">{{ 'PORTFOLIO.OVERALL_PL' | translate }}</div>
              <div class="fs-6 fw-bold" [ngClass]="totalPnL >= 0 ? 'text-success' : 'text-danger'">
                {{ totalPnL >= 0 ? '+' : '' }}₹{{ totalPnL | number:'1.2-2' }} ({{ totalPnLPercent | number:'1.2-2' }}%)
              </div>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="table-responsive flex-grow-1 p-0 m-0">
          <table class="table table-hover align-middle mb-0 custom-table">
            <thead class="bg-light sticky-top">
              <tr>
                <th class="ps-4 text-muted fw-bold small text-uppercase">{{ 'PORTFOLIO.ASSET' | translate }} ({{filteredHoldings.length}})</th>
                <th class="text-end text-muted fw-bold small text-uppercase">{{ 'PORTFOLIO.SHARES' | translate }}</th>
                <th class="text-end text-muted fw-bold small text-uppercase">{{ 'PORTFOLIO.AVG_PRICE' | translate }}</th>
                <th class="text-end text-muted fw-bold small text-uppercase">{{ 'PORTFOLIO.PRICE' | translate }}</th>
                <th class="text-end text-muted fw-bold small text-uppercase">{{ 'PORTFOLIO.TOTAL_VALUE' | translate }}</th>
                <th class="text-end text-muted fw-bold small text-uppercase">{{ 'PORTFOLIO.DAY_PL' | translate }}</th>
                <th class="text-end text-muted fw-bold small text-uppercase">{{ 'PORTFOLIO.DAY_PERCENT' | translate }}</th>
                <th class="text-end text-muted fw-bold small text-uppercase">{{ 'PORTFOLIO.OVERALL_PL' | translate }}</th>
                <th class="text-end text-muted fw-bold small text-uppercase pe-3">{{ 'PORTFOLIO.OVERALL_PERCENT' | translate }}</th>
                <th style="width: 40px"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let h of filteredHoldings" class="position-relative">
                <td class="ps-4 py-3">
                  <div class="fw-bold">{{ h.symbol.replace('.NS', '') }}</div>
                  <div class="small d-flex align-items-center mt-1">
                    <span class="badge" 
                          [ngClass]="{
                            'bg-primary': h.assetClass === 'Equity',
                            'bg-warning text-dark': h.assetClass === 'Crypto',
                            'bg-success': h.assetClass === 'Commodity',
                            'bg-info text-dark': h.assetClass === 'Mutual Fund',
                            'bg-secondary': h.assetClass === 'Fixed Income'
                          }">{{ 'PORTFOLIO.TAB_' + (h.assetClass || 'Equity') | translate }}</span>
                  </div>
                </td>
                <td class="text-end">{{ h.quantity | number:(h.assetClass === 'Crypto' ? '1.4-4' : '1.0-0') }}</td>
                <td class="text-end">₹{{ h.avgPrice | number:'1.2-2' }}</td>
                <td class="text-end">
                  <span *ngIf="h.liveData">₹{{ h.liveData.price | number:'1.2-2' }}</span>
                  <span *ngIf="!h.liveData" class="spinner-border spinner-border-sm text-secondary"></span>
                </td>
                <td class="text-end">
                   <span *ngIf="h.liveData">₹{{ (h.quantity * h.liveData.price) | number:'1.2-2' }}</span>
                </td>
                
                <td class="text-end fw-bold" [ngClass]="h.liveData ? (h.liveData.change >= 0 ? 'text-success' : 'text-danger') : ''">
                  <span *ngIf="h.liveData">{{ h.liveData.change >= 0 ? '+' : '' }}₹{{ Math.abs(h.liveData.change) | number:'1.2-2' }}</span>
                </td>
                <td class="text-end fw-bold" [ngClass]="h.liveData ? (h.liveData.changePercent >= 0 ? 'text-success' : 'text-danger') : ''">
                  <span *ngIf="h.liveData">{{ h.liveData.changePercent >= 0 ? '+' : '' }}{{ Math.abs(h.liveData.changePercent) | number:'1.2-2' }}%</span>
                </td>

                <td class="text-end fw-bold" [ngClass]="getProfitValue(h) >= 0 ? 'text-success' : 'text-danger'">
                   <span *ngIf="h.liveData">{{ getProfitValue(h) >= 0 ? '' : '' }}₹{{ getProfitValue(h) | number:'1.2-2' }}</span>
                </td>
                <td class="text-end fw-bold pe-3" [ngClass]="getReturnPercent(h) >= 0 ? 'text-success' : 'text-danger'">
                   <span *ngIf="h.liveData">{{ getReturnPercent(h) >= 0 ? '' : '' }}{{ getReturnPercent(h) | number:'1.2-2' }}%</span>
                </td>
                
                <td class="position-relative">
                  <button class="btn btn-sm btn-outline-secondary border-0" (click)="toggleMenu(h)">
                    <i class="bi bi-three-dots"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: calc(100vh - 100px); /* Adjust based on topnav */
    }
    .portfolio-layout {
      display: flex;
      height: 100%;
      background: #f8f9fa;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #dee2e6;
    }
    .tab {
      margin-bottom: -1px;
      transition: all 0.2s;
      cursor: pointer;
    }
    .tab:hover {
      color: #0d6efd !important;
    }
    .custom-table {
      font-size: 0.9rem;
      th {
        border-bottom-width: 1px;
        background-color: #f8f9fa;
        z-index: 1;
      }
      td {
        border-bottom: 1px solid #f1f3f5;
        padding: 1rem 0.5rem;
      }
      tr:hover td {
        background-color: #f8f9fa;
      }
    }
    .action-menu {
      right: 10px;
      margin-top: -10px;
    }
  `]
})
export class PortfolioViewComponent implements OnInit, OnDestroy {
  private marketService = inject(MarketDataService);
  private dataSub?: Subscription;
  private indicesSub?: Subscription;

  Math = Math;

  activeTab = 'All';
  tabs = ['Equity', 'Mutual Fund', 'Crypto', 'Commodity', 'Fixed Income'];

  holdings: Holding[] = [
    { name: 'Reliance Industries', symbol: 'RELIANCE.NS', quantity: 50, avgPrice: 2750, sector: 'Energy', assetClass: 'Equity' },
    { name: 'TCS', symbol: 'TCS.NS', quantity: 30, avgPrice: 3650, sector: 'IT', assetClass: 'Equity' },
    { name: 'HDFC Bank', symbol: 'HDFCBANK.NS', quantity: 75, avgPrice: 1580, sector: 'Banking', assetClass: 'Equity' },
    { name: 'Apple Inc.', symbol: 'AAPL', quantity: 15, avgPrice: 13500, sector: 'Technology', assetClass: 'Equity' },
    { name: 'Tesla Inc.', symbol: 'TSLA', quantity: 5, avgPrice: 18000, sector: 'Auto', assetClass: 'Equity' },
    { name: 'Microsoft Corp.', symbol: 'MSFT', quantity: 10, avgPrice: 28000, sector: 'Technology', assetClass: 'Equity' },
    { name: 'NVIDIA Corp.', symbol: 'NVDA', quantity: 8, avgPrice: 45000, sector: 'Semiconductor', assetClass: 'Equity' },
    
    { name: 'Parag Parikh Flexi Cap', symbol: 'PARAGPARIKH', quantity: 1520, avgPrice: 65, sector: 'Mutual Fund', assetClass: 'Mutual Fund' },
    { name: 'Axis Bluechip Fund', symbol: 'AXISBLUECHIP', quantity: 500, avgPrice: 40, sector: 'Mutual Fund', assetClass: 'Mutual Fund' },
    { name: 'SBI Nifty Index Fund', symbol: 'SBINIFTY', quantity: 200, avgPrice: 165, sector: 'Mutual Fund', assetClass: 'Mutual Fund' },
    { name: 'HDFC Small Cap Fund', symbol: 'HDFCSMALLCAP', quantity: 1000, avgPrice: 95, sector: 'Mutual Fund', assetClass: 'Mutual Fund' },
    
    { name: 'Bitcoin', symbol: 'BTC-USD', quantity: 0.15, avgPrice: 5000000, sector: 'Crypto', assetClass: 'Crypto' },
    { name: 'Ethereum', symbol: 'ETH-USD', quantity: 2.5, avgPrice: 250000, sector: 'Crypto', assetClass: 'Crypto' },
    { name: 'Solana', symbol: 'SOL-USD', quantity: 15, avgPrice: 8000, sector: 'Crypto', assetClass: 'Crypto' },
    { name: 'Cardano', symbol: 'ADA-USD', quantity: 1000, avgPrice: 40, sector: 'Crypto', assetClass: 'Crypto' },
    { name: 'Dogecoin', symbol: 'DOGE-USD', quantity: 5000, avgPrice: 8, sector: 'Crypto', assetClass: 'Crypto' },
    
    { name: 'Gold (10g)', symbol: 'GOLD', quantity: 10, avgPrice: 60000, sector: 'Commodity', assetClass: 'Commodity' },
    { name: 'Silver (1kg)', symbol: 'SILVER', quantity: 5, avgPrice: 70000, sector: 'Commodity', assetClass: 'Commodity' },
    { name: 'Crude Oil', symbol: 'CRUDEOIL', quantity: 100, avgPrice: 6500, sector: 'Commodity', assetClass: 'Commodity' },
    
    { name: 'Employees Provident Fund', symbol: 'EPF', quantity: 1, avgPrice: 1500000, sector: 'Fixed Income', assetClass: 'Fixed Income' },
    { name: 'Public Provident Fund', symbol: 'PPF', quantity: 1, avgPrice: 800000, sector: 'Fixed Income', assetClass: 'Fixed Income' },
    { name: 'SGB Aug 2029', symbol: 'SGB2029', quantity: 50, avgPrice: 5800, sector: 'Fixed Income', assetClass: 'Fixed Income' },
    { name: 'HDFC Bank FD 7.1%', symbol: 'HDFCFD', quantity: 1, avgPrice: 500000, sector: 'Fixed Income', assetClass: 'Fixed Income' }
  ];

  get filteredHoldings(): Holding[] {
    if (this.activeTab === 'All') return this.holdings;
    return this.holdings.filter(h => h.assetClass === this.activeTab);
  }

  get totalInvested(): number {
    return this.filteredHoldings.reduce((sum, h) => sum + (h.quantity * h.avgPrice), 0);
  }

  get totalCurrent(): number {
    return this.filteredHoldings.reduce((sum, h) => {
      const price = h.liveData ? h.liveData.price : h.avgPrice;
      return sum + (h.quantity * price);
    }, 0);
  }

  get totalPnL(): number {
    return this.totalCurrent - this.totalInvested;
  }

  get totalPnLPercent(): number {
    if (this.totalInvested === 0) return 0;
    return (this.totalPnL / this.totalInvested) * 100;
  }

  ngOnInit() {
    const symbols = this.holdings.map(h => h.symbol);
    
    // Fetch Holdings
    this.dataSub = interval(1000)
      .pipe(
        startWith(0),
        switchMap(() => this.marketService.fetchMultipleStocks(symbols))
      )
      .subscribe({
        next: (dataArray) => {
          dataArray.forEach(stockData => {
            const holding = this.holdings.find(h => h.symbol === stockData.symbol);
            if (holding) {
              const jitter = (Math.random() - 0.5) * (stockData.price * 0.002);
              holding.liveData = {
                ...stockData,
                price: stockData.price + jitter
              };
            }
          });
        },
        error: (err) => console.error('Failed to load portfolio data', err)
      });
  }

  ngOnDestroy() {
    if (this.dataSub) this.dataSub.unsubscribe();
  }

  getReturnPercent(asset: Holding): number {
    if (!asset.liveData) return 0;
    const currentTotal = asset.quantity * asset.liveData.price;
    const costBasis = asset.quantity * asset.avgPrice;
    return ((currentTotal - costBasis) / costBasis) * 100;
  }
  
  getProfitValue(asset: Holding): number {
    if (!asset.liveData) return 0;
    const currentTotal = asset.quantity * asset.liveData.price;
    const costBasis = asset.quantity * asset.avgPrice;
    return currentTotal - costBasis;
  }

  toggleMenu(asset: Holding) {
    const currentState = asset.isMenuOpen;
    this.holdings.forEach(h => h.isMenuOpen = false); // Close all others
    asset.isMenuOpen = !currentState;
  }
}

