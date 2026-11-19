import React from 'react';
import type { SettlementException, SortDirection, SortField } from '../types/settlement';
import {
  formatCurrency,
  formatExceptionType,
  formatSeverityLabel,
  formatStatusLabel,
  getSlaInfo,
} from '../utils/sla';

interface SettlementTableProps {
  items: SettlementException[];
  selectedId: string | null;
  sortField: SortField;
  sortDirection: SortDirection;
  onToggleSort: (field: SortField) => void;
  onSelect: (id: string) => void;
}

export const SettlementTable: React.FC<SettlementTableProps> = ({
  items,
  selectedId,
  sortField,
  sortDirection,
  onToggleSort,
  onSelect,
}) => {
  const nowMs = Date.now();

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return '';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <>
      {/* Desktop Table */}
      <div className="table-wrap desktop-only">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Reference</th>
              <th scope="col">Counterparty</th>
              <th scope="col">Exception</th>
              <th scope="col">
                <button
                  type="button"
                  className="th-sort-btn"
                  onClick={() => onToggleSort('amount')}
                >
                  Amount{sortIndicator('amount')}
                </button>
              </th>
              <th scope="col">Severity</th>
              <th scope="col">Status</th>
              <th scope="col">
                <button
                  type="button"
                  className="th-sort-btn"
                  onClick={() => onToggleSort('sla')}
                >
                  SLA{sortIndicator('sla')}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const sla = getSlaInfo(item, nowMs);
              const isSelected = item.id === selectedId;

              return (
                <tr
                  key={item.id}
                  className={`table-row ${isSelected ? 'table-row--selected' : ''}`}
                  onClick={() => onSelect(item.id)}
                >
                  <td>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(item.id);
                      }}
                    >
                      {item.referenceCode}
                    </button>
                    <div className="cell-sub">{item.bankCode}</div>
                  </td>
                  <td>
                    <div className="cell-primary">{item.counterparty}</div>
                    <div className="cell-sub">{item.bankReasonCode}</div>
                  </td>
                  <td>{formatExceptionType(item.exceptionType)}</td>
                  <td>
                    <div className="cell-primary">
                      {formatCurrency(item.amount, item.currency)}
                    </div>
                    {item.currency !== 'USD' && (
                      <div className="cell-sub">
                        ~{formatCurrency(item.amountUsd, 'USD')}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge--sev-${item.severity}`}>
                      {formatSeverityLabel(item.severity)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge--status-${item.status}`}>
                      {formatStatusLabel(item.status)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`sla-pill ${
                        sla.isBreached
                          ? 'sla-pill--breached'
                          : sla.isAtRisk
                          ? 'sla-pill--risk'
                          : ''
                      }`}
                    >
                      {sla.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="mobile-cards mobile-only">
        {items.map((item) => {
          const sla = getSlaInfo(item, nowMs);
          return (
            <article
              key={item.id}
              className={`mobile-card ${item.id === selectedId ? 'mobile-card--selected' : ''}`}
            >
              <div className="mobile-card-top">
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => onSelect(item.id)}
                >
                  {item.referenceCode}
                </button>
                <span className={`badge badge--status-${item.status}`}>
                  {formatStatusLabel(item.status)}
                </span>
              </div>
              <h3 className="mobile-card-title">{item.counterparty}</h3>
              <p className="cell-sub">
                {formatExceptionType(item.exceptionType)} · {item.bankReasonCode}
              </p>
              <div className="mobile-card-bottom">
                <strong>{formatCurrency(item.amount, item.currency)}</strong>
                <span
                  className={`sla-pill ${
                    sla.isBreached ? 'sla-pill--breached' : sla.isAtRisk ? 'sla-pill--risk' : ''
                  }`}
                >
                  {sla.label}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
};
