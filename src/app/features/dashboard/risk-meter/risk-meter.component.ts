import { Component, ViewChild, OnInit, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ChartComponent as ApexChartComponent } from 'ng-apexcharts';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { TranslationService } from '../../../core/i18n/translation.service';

@Component({
  selector: 'app-risk-meter',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, CardComponent, BadgeComponent, TranslatePipe],
  template: `
    <app-card [title]="'DASHBOARD.RISK_PROFILE' | translate">
      <div header-actions>
        <app-badge [variant]="getRiskVariant()" [pill]="true">{{ 'DASHBOARD.PROFILE_' + activeProfile | translate }}</app-badge>
      </div>
      
      <div class="mt-2 text-center position-relative">
        <apx-chart
          [series]="chartOptions.series"
          [chart]="chartOptions.chart"
          [plotOptions]="chartOptions.plotOptions"
          [labels]="chartOptions.labels"
          [fill]="chartOptions.fill"
          [stroke]="chartOptions.stroke"
          [colors]="chartOptions.colors"
        ></apx-chart>
        
        <!-- Interactive Selector -->
        <div class="risk-selector d-flex justify-content-center gap-2 mt-2">
          <button class="btn btn-sm" [class.active]="activeProfile === 'Conservative'" (click)="setProfile('Conservative', 30)">{{ 'DASHBOARD.SAFE' | translate }}</button>
          <button class="btn btn-sm" [class.active]="activeProfile === 'Moderate'" (click)="setProfile('Moderate', 60)">{{ 'DASHBOARD.MOD' | translate }}</button>
          <button class="btn btn-sm" [class.active]="activeProfile === 'Aggressive'" (click)="setProfile('Aggressive', 90)">{{ 'DASHBOARD.AGG' | translate }}</button>
        </div>
        
        <div class="mt-4 p-3 rounded risk-insight border-glow slide-in">
          <i class="bi bi-robot text-primary mb-2 fs-4"></i>
          <p class="text-sm text-dark mb-0 fw-medium">{{ getInsightText() }}</p>
        </div>
      </div>
    </app-card>
  `,
  styles: [`
    .risk-selector {
      .btn {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        color: #6c757d;
        font-size: 0.8rem;
        transition: all 0.3s;
        
        &:hover { background: #e9ecef; color: #495057; }
        &.active {
          border-color: #0d6efd;
          color: #0d6efd;
          background: rgba(13, 110, 253, 0.1);
          box-shadow: 0 0 10px rgba(13, 110, 253, 0.2);
        }
      }
    }
    .risk-insight {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-left: 3px solid #0d6efd;
      text-align: left;
      font-size: 0.85rem;
    }
  `]
})
export class RiskMeterComponent implements OnInit, OnDestroy {
  public chartOptions: any;
  public activeProfile = 'Moderate';
  public activeScore = 60;
  private ts = inject(TranslationService);
  private langSub?: Subscription;

  ngOnInit() {
    this.buildChart(this.activeScore);
    this.langSub = this.ts.onLangChange.subscribe(() => {
      this.buildChart(this.activeScore);
    });
  }

  ngOnDestroy() {
    if (this.langSub) {
      this.langSub.unsubscribe();
    }
  }

  setProfile(profile: string, score: number) {
    this.activeProfile = profile;
    this.activeScore = score;
    this.buildChart(score);
  }

  getRiskVariant() {
    if (this.activeProfile === 'Conservative') return 'success';
    if (this.activeProfile === 'Aggressive') return 'danger';
    return 'warning';
  }

  getInsightText() {
    if (this.activeProfile === 'Conservative') {
      return this.ts.translate('DASHBOARD.RISK_INSIGHT_CONS');
    }
    if (this.activeProfile === 'Aggressive') {
      return this.ts.translate('DASHBOARD.RISK_INSIGHT_AGG');
    }
    return this.ts.translate('DASHBOARD.RISK_INSIGHT_MOD');
  }

  buildChart(score: number) {
    let color = '#ffc107'; // Moderate
    if (score < 40) color = '#198754'; // Conservative
    if (score > 80) color = '#dc3545'; // Aggressive

    this.chartOptions = {
      series: [score],
      chart: {
        height: 250,
        type: "radialBar",
        animations: { enabled: true, dynamicAnimation: { speed: 800 } }
      },
      plotOptions: {
        radialBar: {
          startAngle: -135,
          endAngle: 135,
          hollow: {
            margin: 15,
            size: "65%",
            background: "transparent",
          },
          track: {
            background: "#f1f3f5",
            strokeWidth: "100%",
            margin: 0,
            dropShadow: {
              enabled: true,
              top: 0,
              left: 0,
              blur: 3,
              opacity: 0.1
            }
          },
          dataLabels: {
            show: true,
            name: {
              offsetY: 20,
              show: true,
              color: "#6c757d",
              fontSize: "12px"
            },
            value: {
              offsetY: -10,
              color: "#212529",
              fontSize: "30px",
              fontWeight: 700,
              show: true
            }
          }
        }
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "horizontal",
          gradientToColors: [color],
          stops: [0, 100]
        }
      },
      stroke: { lineCap: "round" },
      colors: [color],
      labels: [this.ts.translate('DASHBOARD.RISK_SCORE_LABEL')]
    };
  }
}
