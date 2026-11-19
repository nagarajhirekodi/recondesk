import React from 'react';
import type { KpiSummary } from '../hooks/useSettlements';
import { formatCurrency } from '../utils/sla';

interface KpiStripProps {
  kpis: KpiSummary;
  isLoading: boolean;
}

export const KpiStrip: React.FC<KpiStripProps> = ({ kpis, isLoading }) => {
  return (
    <section className="kpi-grid" aria-label="Settlement exception summary">
      <div className="kpi-card">
        <span className="kpi-label">Unresolved Exceptions</span>
        <strong className="kpi-value">{isLoading ? '—' : kpis.unresolvedCount}</strong>
        <span className="kpi-meta">Open, in review, or escalated</span>
      </div>

      <div className="kpi-card kpi-card--danger">
        <span className="kpi-label">SLA At Risk (&lt; 2h)</span>
        <strong className="kpi-value">{isLoading ? '—' : kpis.atRiskCount}</strong>
        <span className="kpi-meta">Includes overdue clearing items</span>
      </div>

      <div className="kpi-card">
        <span className="kpi-label">Held Volume (USD Eq.)</span>
        <strong className="kpi-value">
          {isLoading ? '—' : formatCurrency(kpis.unresolvedVolumeUsd, 'USD')}
        </strong>
        <span className="kpi-meta">Pending payout release</span>
      </div>

      <div className="kpi-card kpi-card--warn">
        <span className="kpi-label">Escalated</span>
        <strong className="kpi-value">{isLoading ? '—' : kpis.escalatedCount}</strong>
        <span className="kpi-meta">Awaiting lead or compliance sign-off</span>
      </div>
    </section>
  );
};