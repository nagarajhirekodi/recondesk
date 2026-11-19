import type { ExceptionStatus, ExceptionType, SeverityLevel, SettlementException } from '../types/settlement';

export interface SlaInfo {
  label: string;
  minutesRemaining: number;
  isBreached: boolean;
  isAtRisk: boolean; // < 120 minutes for unresolved items
}

export function getSlaInfo(item: SettlementException, nowMs: number = Date.now()): SlaInfo {
  if (item.status === 'resolved') {
    return {
      label: 'Resolved',
      minutesRemaining: Number.POSITIVE_INFINITY,
      isBreached: false,
      isAtRisk: false,
    };
  }

  const diffMs = new Date(item.slaBreachAt).getTime() - nowMs;
  const minutes = Math.round(diffMs / 60_000);

  if (minutes <= 0) {
    const overdueMins = Math.abs(minutes);
    const hrs = Math.floor(overdueMins / 60);
    const remMins = overdueMins % 60;
    const formatted = hrs > 0 ? `${hrs}h ${remMins}m overdue` : `${remMins}m overdue`;
    return {
      label: formatted,
      minutesRemaining: minutes,
      isBreached: true,
      isAtRisk: true,
    };
  }

  const hrs = Math.floor(minutes / 60);
  const remMins = minutes % 60;
  const formatted = hrs > 0 ? `${hrs}h ${remMins}m left` : `${remMins}m left`;

  return {
    label: formatted,
    minutesRemaining: minutes,
    isBreached: false,
    isAtRisk: minutes < 120,
  };
}

export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  }
}

export function formatExceptionType(type: ExceptionType): string {
  const map: Record<ExceptionType, string> = {
    FX_RATE_MISMATCH: 'FX Rate Mismatch',
    BANK_REJECT_CODE: 'Bank Reject Code',
    MISSING_REF_ID: 'Missing Ref ID',
    COMPLIANCE_HOLD: 'Compliance Hold',
  };
  return map[type];
}

export function formatStatusLabel(status: ExceptionStatus): string {
  const map: Record<ExceptionStatus, string> = {
    open: 'Open',
    in_review: 'In Review',
    escalated: 'Escalated',
    resolved: 'Resolved',
  };
  return map[status];
}

export function formatSeverityLabel(severity: SeverityLevel): string {
  const map: Record<SeverityLevel, string> = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
  };
  return map[severity];
}
