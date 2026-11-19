export type ExceptionStatus = 'open' | 'in_review' | 'escalated' | 'resolved';

export type SeverityLevel = 'critical' | 'high' | 'medium';

export type ExceptionType =
  | 'FX_RATE_MISMATCH'
  | 'BANK_REJECT_CODE'
  | 'MISSING_REF_ID'
  | 'COMPLIANCE_HOLD';

export type SortField = 'sla' | 'amount' | 'updatedAt';
export type SortDirection = 'asc' | 'desc';

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  summary: string;
}

export interface SettlementException {
  id: string;
  referenceCode: string;
  batchId: string;
  counterparty: string;
  bankCode: string;
  currency: string;
  amount: number;
  amountUsd: number;
  exceptionType: ExceptionType;
  bankReasonCode: string;
  severity: SeverityLevel;
  status: ExceptionStatus;
  slaBreachAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  assignee: string | null;
  notes: string[];
  auditTrail: AuditEvent[];
}

export interface SettlementFilters {
  search: string;
  status: ExceptionStatus | 'all';
  severity: SeverityLevel | 'all';
  slaAtRiskOnly: boolean;
}
