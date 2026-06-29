import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, forkJoin, shareReplay, tap } from 'rxjs';

export interface OHLCData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface AssetData {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  change: number;
  assetClass?: string;
  history: OHLCData[];
}

export interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
}

const STOCK_META: Record<string, { name: string, sector: string }> = {
  'RELIANCE.NS': { name: 'Reliance Industries', sector: 'Energy' },
  'TCS.NS': { name: 'Tata Consultancy Services', sector: 'IT' },
  'INFY.NS': { name: 'Infosys', sector: 'IT' },
  'HDFCBANK.NS': { name: 'HDFC Bank', sector: 'Banking' },
  'ITC.NS': { name: 'ITC Limited', sector: 'FMCG' },
  'BHARTIARTL.NS': { name: 'Bharti Airtel', sector: 'Telecom' },
  'SBIN.NS': { name: 'State Bank of India', sector: 'Banking' },
  'WIPRO.NS': { name: 'Wipro', sector: 'IT' },
  'LT.NS': { name: 'Larsen & Toubro', sector: 'Infra' },
  'ADANIENT.NS': { name: 'Adani Enterprises', sector: 'Conglomerate' },
  '^NSEI': { name: 'NIFTY 50', sector: 'Index' },
  '^BSESN': { name: 'SENSEX', sector: 'Index' },
  'BTC-USD': { name: 'Bitcoin', sector: 'Crypto' },
  'GOLD': { name: 'Gold (10g)', sector: 'Commodity' },
  'EPF': { name: 'Employees Provident Fund', sector: 'Fixed Income' },
  'PARAGPARIKH': { name: 'Parag Parikh Flexi Cap', sector: 'Mutual Fund' },
};

@Injectable({
  providedIn: 'root'
})
export class MarketDataService {
  private http = inject(HttpClient);

  // Cache for the massive offline JSON to avoid repeated HTTP calls
  private offlineDataCache$: Observable<Record<string, AssetData>> | null = null;

  private loadOfflineData(): Observable<Record<string, AssetData>> {
    if (!this.offlineDataCache$) {
      this.offlineDataCache$ = this.http.get<Record<string, AssetData>>('data/market-data.json').pipe(
        shareReplay(1)
      );
    }
    return this.offlineDataCache$;
  }

  fetchStockData(symbol: string): Observable<AssetData> {
    return this.loadOfflineData().pipe(
      map(data => {
        if (data[symbol]) {
          return data[symbol];
        }
        throw new Error(`Symbol ${symbol} not found in offline data.`);
      })
    );
  }

  fetchMultipleStocks(symbols: string[]): Observable<AssetData[]> {
    return this.loadOfflineData().pipe(
      map(data => {
        return symbols.map(sym => {
          if (data[sym]) return data[sym];
          throw new Error(`Symbol ${sym} not found in offline data.`);
        });
      })
    );
  }

  fetchMarketIndices(): Observable<MarketIndex[]> {
    const indices = ['^NSEI', '^BSESN'];
    return this.fetchMultipleStocks(indices).pipe(
      map(stocks => stocks.map(s => ({
        name: s.name,
        symbol: s.symbol,
        value: s.price,
        change: s.change,
        changePercent: s.changePercent
      })))
    );
  }

  getStockMeta() {
    return STOCK_META;
  }

  searchStocks(query: string): { symbol: string, name: string, sector: string }[] {
    const q = query.toLowerCase();
    return Object.entries(STOCK_META)
      .filter(([symbol, meta]) =>
        !symbol.startsWith('^') &&
        (symbol.toLowerCase().includes(q) || meta.name.toLowerCase().includes(q) || meta.sector.toLowerCase().includes(q))
      )
      .map(([symbol, meta]) => ({ symbol, name: meta.name, sector: meta.sector }));
  }
}
