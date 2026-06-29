import { Component, ViewChild, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ChartComponent as ApexChartComponent } from 'ng-apexcharts';
import { ThemeService } from '../../../core/theme/theme.service';
import { MarketDataService, AssetData } from '../../../core/services/market-data.service';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { Subscription, interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';

import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-portfolio-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, CardComponent, TranslatePipe],
  template: `
    <app-card [title]="'PORTFOLIO.CHART_TITLE' | translate" [subtitle]="'DASHBOARD.LIVE_TRACKING' | translate">
      <div header-actions class="chart-toolbar">
        <button class="btn btn-sm" [class.active]="activeRange === '1D'" (click)="setRange('1D')">1D</button>
        <button class="btn btn-sm" [class.active]="activeRange === '1W'" (click)="setRange('1W')">1W</button>
        <button class="btn btn-sm" [class.active]="activeRange === '1M'" (click)="setRange('1M')">1M</button>
        <button class="btn btn-sm" [class.active]="activeRange === '3M'" (click)="setRange('3M')">3M</button>
      </div>

      <div *ngIf="isLoading" class="d-flex justify-content-center align-items-center py-5" style="height: 350px;">
        <div class="spinner-grow text-primary" style="width: 3rem; height: 3rem;" role="status">
          <span class="visually-hidden">{{ 'COMMON.LOADING' | translate }}</span>
        </div>
      </div>
      
      <div id="chart" *ngIf="!isLoading && chartOptions">
        <apx-chart
          [series]="chartOptions.series"
          [chart]="chartOptions.chart"
          [xaxis]="chartOptions.xaxis"
          [yaxis]="chartOptions.yaxis"
          [dataLabels]="chartOptions.dataLabels"
          [grid]="chartOptions.grid"
          [stroke]="chartOptions.stroke"
          [colors]="chartOptions.colors"
          [theme]="chartOptions.theme"
          [fill]="chartOptions.fill"
          [tooltip]="chartOptions.tooltip"
        ></apx-chart>
      </div>
    </app-card>
  `,
  styles: [`
    .chart-toolbar {
      display: flex;
      gap: 0.25rem;
      background: #f8f9fa;
      padding: 0.25rem;
      border-radius: 6px;
      border: 1px solid #dee2e6;
      
      .btn {
        color: #6c757d;
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
        border: none;
        background: transparent;
        transition: all 0.2s;
        
        &:hover { color: #212529; }
        &.active {
          background: #e9ecef;
          color: #0d6efd;
          font-weight: bold;
          border-radius: 4px;
        }
      }
    }
  `]
})
export class PortfolioChartComponent implements OnInit, OnDestroy {
  @ViewChild('chart') chart!: ApexChartComponent;
  
  private themeService = inject(ThemeService);
  private marketDataService = inject(MarketDataService);
  private dataSub?: Subscription;

  public chartOptions: any;
  public isLoading = true;
  public activeRange = '3M';

  // Mock portfolio for aggregate chart
  private portfolioQty: Record<string, number> = {
    'RELIANCE.NS': 50,
    'TCS.NS': 30,
    'PARAGPARIKH': 1520,
    'BTC-USD': 0.15,
    'GOLD': 10,
    'EPF': 1
  };

  ngOnInit() {
    this.fetchData();
  }

  setRange(range: string) {
    this.activeRange = range;
    this.isLoading = true;
    this.fetchData();
  }

  fetchData() {
    if (this.dataSub) {
      this.dataSub.unsubscribe();
    }
    
    const symbols = [...Object.keys(this.portfolioQty), '^NSEI'];
    this.dataSub = interval(30000)
      .pipe(
        startWith(0),
        switchMap(() => this.marketDataService.fetchMultipleStocks(symbols))
      )
      .subscribe({
        next: (dataArray) => {
          this.buildAggregateChart(dataArray);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load chart data', err);
          this.isLoading = false;
        }
      });
  }

  ngOnDestroy() {
    if (this.dataSub) {
      this.dataSub.unsubscribe();
    }
  }

  buildAggregateChart(dataArray: AssetData[]) {
    // Separate Portfolio assets and NIFTY 50
    const portfolioAssets = dataArray.filter(d => d.symbol !== '^NSEI');
    const niftyAsset = dataArray.find(d => d.symbol === '^NSEI');

    // Sum history points based on portfolio quantities
    const aggregateHistory = new Map<number, number>();
    
    portfolioAssets.forEach(stock => {
      const qty = this.portfolioQty[stock.symbol] || 0;
      stock.history.forEach(point => {
        const d = new Date(point.timestamp);
        d.setHours(0, 0, 0, 0);
        const dayTs = d.getTime();
        const val = (aggregateHistory.get(dayTs) || 0) + (point.close * qty);
        aggregateHistory.set(dayTs, val);
      });
    });

    // Convert map to sorted array
    const sortedData = Array.from(aggregateHistory.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([ts, val]) => [ts, Number(val.toFixed(2))]);

    // Apply basic filter for ranges
    let filteredData = sortedData;
    if (this.activeRange === '1M' && sortedData.length > 20) {
      filteredData = sortedData.slice(sortedData.length - 20);
    } else if (this.activeRange === '1W' && sortedData.length > 5) {
      filteredData = sortedData.slice(sortedData.length - 5);
    } else if (this.activeRange === '1D' && sortedData.length > 1) {
      filteredData = sortedData.slice(sortedData.length - 2);
    }

    // Convert to percentage returns based on the first data point
    const basePortfolio = filteredData.length > 0 ? filteredData[0][1] : 1;
    const portfolioSeries = filteredData.map(([ts, val]) => [ts, Number((((val - basePortfolio) / basePortfolio) * 100).toFixed(2))]);

    let niftySeries: number[][] = [];
    if (niftyAsset && niftyAsset.history) {
      let sortedNifty = [...niftyAsset.history]
        .map(p => {
          const d = new Date(p.timestamp);
          d.setHours(0, 0, 0, 0);
          return { timestamp: d.getTime(), close: p.close };
        })
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(p => [p.timestamp, p.close]);
      
      let filteredNifty = sortedNifty;
      if (this.activeRange === '1M' && sortedNifty.length > 20) {
        filteredNifty = sortedNifty.slice(sortedNifty.length - 20);
      } else if (this.activeRange === '1W' && sortedNifty.length > 5) {
        filteredNifty = sortedNifty.slice(sortedNifty.length - 5);
      } else if (this.activeRange === '1D' && sortedNifty.length > 1) {
        filteredNifty = sortedNifty.slice(sortedNifty.length - 2);
      }
      const baseNifty = filteredNifty.length > 0 ? filteredNifty[0][1] : 1;
      niftySeries = filteredNifty.map(([ts, val]) => [ts, Number((((val - baseNifty) / baseNifty) * 100).toFixed(2))]);
    }
    
    this.chartOptions = {
      series: [
        {
          name: "Portfolio",
          type: "area",
          data: portfolioSeries
        },
        {
          name: "NIFTY 50",
          type: "line",
          data: niftySeries
        }
      ],
      chart: {
        height: 350,
        type: "line",
        fontFamily: 'Inter, Roboto, sans-serif',
        toolbar: { show: false },
        background: '#fff',
        animations: {
          enabled: true,
          easing: 'linear',
          dynamicAnimation: { speed: 1000 }
        }
      },
      colors: ['#0d6efd', '#6c757d'], // Primary Blue, Grey
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: [3, 2] },
      fill: {
        type: ["gradient", "solid"],
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.2,
          opacityTo: 0.0,
          stops: [0, 90, 100],
          colorStops: [
            { offset: 0, color: '#0d6efd', opacity: 0.2 },
            { offset: 100, color: '#0d6efd', opacity: 0 }
          ]
        },
        opacity: [1, 1] // Portfolio has gradient, NIFTY has solid (but we want line, so we can use opacity 1 for line, fill will be overriden by chart type if we mix)
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        markers: { radius: 12 },
        itemMargin: { horizontal: 10, vertical: 5 }
      },
      xaxis: {
        type: 'datetime',
        axisBorder: { color: '#dee2e6' },
        axisTicks: { color: '#dee2e6' },
        labels: { style: { colors: '#6c757d' } }
      },
      yaxis: {
        labels: {
          formatter: (value: number) => value.toFixed(1) + '%',
          style: { colors: '#6c757d' }
        }
      },
      grid: {
        borderColor: '#f1f3f5',
        strokeDashArray: 4,
        yaxis: { lines: { show: true } }
      },
      theme: { mode: 'light' },
      tooltip: {
        theme: 'light',
        x: { format: 'dd MMM yyyy' }
      }
    };
  }
}
