import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { TranslationService } from './translation.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'translate',
  pure: false, // Set to false to update when language changes dynamically
  standalone: true
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private translationService = inject(TranslationService);
  private cdr = inject(ChangeDetectorRef);
  private langSub: Subscription;
  
  private lastKey: string = '';
  private lastParams: any = null;
  private value: string = '';

  constructor() {
    this.langSub = this.translationService.onLangChange.subscribe(() => {
      // Re-translate when language changes
      if (this.lastKey) {
        this.value = this.translationService.translate(this.lastKey, this.lastParams);
        this.cdr.markForCheck();
      }
    });
  }

  transform(key: string, params?: any): string {
    if (!key) return '';

    // If key and params haven't changed, return cached value to prevent infinite digest loop
    if (key === this.lastKey && JSON.stringify(params) === JSON.stringify(this.lastParams) && this.value) {
      return this.value;
    }

    this.lastKey = key;
    this.lastParams = params;
    
    // Perform translation
    this.value = this.translationService.translate(key, params);
    return this.value;
  }

  ngOnDestroy() {
    if (this.langSub) {
      this.langSub.unsubscribe();
    }
  }
}
