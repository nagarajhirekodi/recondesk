import React, { useEffect, useRef, useState } from 'react';
import type { ExceptionStatus, SettlementException } from '../types/settlement';
import {
  formatCurrency,
  formatExceptionType,
  formatSeverityLabel,
  formatStatusLabel,
  getSlaInfo,
} from '../utils/sla';

interface SettlementDetailDrawerProps {
  exception: SettlementException | null;
  onClose: () => void;
  onUpdateStatus: (id: string, nextStatus: ExceptionStatus) => void;
  onAddNote: (id: string, note: string) => void;
}

const STATUS_ACTIONS: { status: ExceptionStatus; label: string }[] = [
  { status: 'in_review', label: 'Start Review' },
  { status: 'escalated', label: 'Escalate' },
  { status: 'resolved', label: 'Mark Resolved' },
  { status: 'open', label: 'Reopen' },
];

export const SettlementDetailDrawer: React.FC<SettlementDetailDrawerProps> = ({
  exception,
  onClose,
  onUpdateStatus,
  onAddNote,
}) => {
  const [noteInput, setNoteInput] = useState('');
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!exception) return;
    closeBtnRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [exception, onClose]);

  useEffect(() => {
    setNoteInput('');
  }, [exception?.id]);

  if (!exception) return null;

  const sla = getSlaInfo(exception);

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    onAddNote(exception.id, noteInput);
    setNoteInput('');
  };

  return (
    <div
      className="drawer-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      onClick={onClose}
    >
      <aside className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <header className="drawer-header">
          <div>
            <div className="drawer-eyebrow">
              {exception.referenceCode} · Batch {exception.batchId}
            </div>
            <h2 id="drawer-title" className="drawer-title">
              {exception.counterparty}
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className="btn btn--ghost"
            onClick={onClose}
            aria-label="Close exception details"
          >
            ✕
          </button>
        </header>

        <div className="drawer-body">
          <div className="drawer-badges">
            <span className={`badge badge--status-${exception.status}`}>
              {formatStatusLabel(exception.status)}
            </span>
            <span className={`badge badge--sev-${exception.severity}`}>
              {formatSeverityLabel(exception.severity)}
            </span>
            <span
              className={`sla-pill ${
                sla.isBreached ? 'sla-pill--breached' : sla.isAtRisk ? 'sla-pill--risk' : ''
              }`}
            >
              {sla.label}
            </span>
          </div>

          <section className="detail-section">
            <h3 className="detail-heading">Triage Actions</h3>
            <div className="action-row">
              {STATUS_ACTIONS.map(({ status, label }) => (
                <button
                  key={status}
                  type="button"
                  disabled={exception.status === status}
                  className={`btn btn--sm ${
                    status === 'resolved' ? 'btn--primary' : 'btn--secondary'
                  }`}
                  onClick={() => onUpdateStatus(exception.id, status)}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          <dl className="meta-grid">
            <div>
              <dt>Settlement Amount</dt>
              <dd>{formatCurrency(exception.amount, exception.currency)}</dd>
            </div>
            <div>
              <dt>USD Equivalent</dt>
              <dd>{formatCurrency(exception.amountUsd, 'USD')}</dd>
            </div>
            <div>
              <dt>Exception Type</dt>
              <dd>{formatExceptionType(exception.exceptionType)}</dd>
            </div>
            <div>
              <dt>Clearing / Reason Code</dt>
              <dd>
                {exception.bankCode} ({exception.bankReasonCode})
              </dd>
            </div>
            <div>
              <dt>Owner</dt>
              <dd>{exception.assignee ?? 'Unassigned'}</dd>
            </div>
          </dl>

          <section className="detail-section">
            <h3 className="detail-heading">Resolution Notes ({exception.notes.length})</h3>
            {exception.notes.length === 0 ? (
              <p className="muted-text">No resolution notes recorded yet.</p>
            ) : (
              <ul className="note-list">
                {exception.notes.map((n, index) => (
                  <li key={index} className="note-item">
                    {n}
                  </li>
                ))}
              </ul>
            )}

            <form className="note-form" onSubmit={handleNoteSubmit}>
              <label htmlFor="resolution-note" className="sr-only">
                Add resolution note
              </label>
              <input
                id="resolution-note"
                type="text"
                className="input"
                placeholder="Log investigation finding or bank callback reference..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
              />
              <button type="submit" className="btn btn--secondary btn--sm" disabled={!noteInput.trim()}>
                Add Note
              </button>
            </form>
          </section>

          <section className="detail-section">
            <h3 className="detail-heading">Audit Trail</h3>
            <ol className="audit-list">
              {exception.auditTrail.map((event) => (
                <li key={event.id} className="audit-item">
                  <div className="audit-summary">{event.summary}</div>
                  <div className="audit-meta">
                    {event.actor} · {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </aside>
    </div>
  );
};
