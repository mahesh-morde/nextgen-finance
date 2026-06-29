import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private http = inject(HttpClient);
  private currentLang = signal<string>('en');
  private translations: any = {};
  
  // Expose an observable for the pipe to listen for changes
  public onLangChange = new BehaviorSubject<string>('en');

  constructor() {
    this.use('en');
  }

  use(lang: string): void {
    this.currentLang.set(lang);
    this.http.get(`i18n/${lang}.json`).subscribe({
      next: (res) => {
        this.translations = res;
        this.onLangChange.next(lang);
      },
      error: (err) => {
        console.error(`Error loading translation file for ${lang}`, err);
      }
    });
  }

  getCurrentLang(): string {
    return this.currentLang();
  }

  translate(key: string, params?: any): string {
    const keys = key.split('.');
    let value = this.translations;

    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        return key; // return key itself if not found
      }
    }

    if (typeof value === 'string' && params) {
      Object.keys(params).forEach(k => {
        value = (value as string).replace(new RegExp(`{{${k}}}`, 'g'), params[k]);
      });
    }

    return typeof value === 'string' ? value : key;
  }
}
