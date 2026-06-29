import { Component, inject, Output, EventEmitter, HostListener, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  @Output() toggled = new EventEmitter<boolean>();
  isCollapsed = true;

  navItems = [
    { label: 'SIDEBAR.DASHBOARD', icon: 'bi-grid', route: '/dashboard' },
    { label: 'SIDEBAR.RISK', icon: 'bi-speedometer2', route: '/risk' },
    { label: 'SIDEBAR.REPORTS', icon: 'bi-file-earmark-text', route: '/reports' },
    { label: 'SIDEBAR.ASSISTANT', icon: 'bi-robot', route: '/assistant' },
    { label: 'SIDEBAR.PORTFOLIO', icon: 'bi-pie-chart', route: '/portfolio' },
    { label: 'SIDEBAR.SETTINGS', icon: 'bi-gear', route: '/settings' }
  ];

  ngOnInit() {
    this.toggled.emit(this.isCollapsed);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside && !this.isCollapsed) {
      this.isCollapsed = true;
      this.toggled.emit(this.isCollapsed);
    }
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    if (this.isCollapsed) {
      this.isCollapsed = false;
      this.toggled.emit(this.isCollapsed);
    }
  }

  logout() {
    this.authService.logout();
  }
}
