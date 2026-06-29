import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/theme/theme.service';
import { AuthService } from '../../core/auth/auth.service';
import { TranslationService } from '../../core/i18n/translation.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  translationService = inject(TranslationService);

  get isDarkMode() {
    return this.themeService.isDarkMode();
  }

  get currentUser() {
    return this.authService.currentUser();
  }

  get currentLang() {
    return this.translationService.getCurrentLang();
  }

  setLanguage(lang: string) {
    this.translationService.use(lang);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
