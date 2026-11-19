import type { ExceptionStatus, SettlementException } from "../types/settlement";

const BASE_TIME = new Date("2026-11-19T09:08:00+05:30").getTime();
const minsFromNow = (m: number) =>
  new Date(BASE_TIME + m * 60_000).toISOString();
const minsAgo = (m: number) => new Date(BASE_TIME - m * 60_000).toISOString();

const INITIAL_EXCEPTIONS: SettlementException[] = [
  {
    id: "exc-101",
    referenceCode: "SET-2026-8841",
    batchId: "BCH-1119-AM",
    counterparty: "Northstar BioLabs Inc.",
    bankCode: "CITIUS33",
    currency: "USD",
    amount: 248500,
    amountUsd: 248500,
    exceptionType: "BANK_REJECT_CODE",
    bankReasonCode: "AC04 - Closed Account",
    severity: "critical",
    status: "open",
    slaBreachAt: minsFromNow(38),
    updatedAt: minsAgo(14),
    assignee: null,
    notes: [
      "Beneficiary advised IBAN/account migration last week; awaiting updated wire instruction.",
    ],
    auditTrail: [
      {
        id: "aud-1",
        timestamp: minsAgo(45),
        actor: "Settlement Engine",
        summary:
          "Flagged rejection AC04 during morning ACH/Wire clearing batch.",
      },
      {
        id: "aud-2",
        timestamp: minsAgo(14),
        actor: "System SLA Monitor",
        summary:
          "Entered high-urgency window (less than 1 hour remaining to SLA).",
      },
    ],
  },
  {
    id: "exc-102",
    referenceCode: "SET-2026-8849",
    batchId: "BCH-1119-AM",
    counterparty: "Kestrel Freight & Logistics GmbH",
    bankCode: "DEUTDEFF",
    currency: "EUR",
    amount: 164200,
    amountUsd: 177336,
    exceptionType: "FX_RATE_MISMATCH",
    bankReasonCode: "FX_DEV_2.4%",
    severity: "high",
    status: "in_review",
    slaBreachAt: minsFromNow(95),
    updatedAt: minsAgo(8),
    assignee: "A. Nair",
    notes: [
      "Booked spot rate 1.072 vs treasury lock 1.080. Checking treasury hedge window.",
    ],
    auditTrail: [
      {
        id: "aud-3",
        timestamp: minsAgo(52),
        actor: "Settlement Engine",
        summary:
          "Blocked payout due to 2.4% variance against locked FX contract.",
      },
      {
        id: "aud-4",
        timestamp: minsAgo(8),
        actor: "A. Nair",
        summary:
          "Moved status to In Review and requested treasury rate confirmation.",
      },
    ],
  },
  {
    id: "exc-103",
    referenceCode: "SET-2026-8854",
    batchId: "BCH-1119-AM",
    counterparty: "Apex Precision Tooling Co.",
    bankCode: "HDFCINBB",
    currency: "INR",
    amount: 4850000,
    amountUsd: 57500,
    exceptionType: "MISSING_REF_ID",
    bankReasonCode: "RMTINF_EMPTY",
    severity: "medium",
    status: "open",
    slaBreachAt: minsFromNow(210),
    updatedAt: minsAgo(25),
    assignee: null,
    notes: [],
    auditTrail: [
      {
        id: "aud-5",
        timestamp: minsAgo(25),
        actor: "Settlement Engine",
        summary:
          "Invoice remittance tag missing in ISO 20022 payment instruction.",
      },
    ],
  },
  {
    id: "exc-104",
    referenceCode: "SET-2026-8812",
    batchId: "BCH-1118-PM",
    counterparty: "Harborview Maritime Services",
    bankCode: "CHASUS33",
    currency: "USD",
    amount: 390000,
    amountUsd: 390000,
    exceptionType: "COMPLIANCE_HOLD",
    bankReasonCode: "AML_SCREEN_REVIEW",
    severity: "critical",
    status: "escalated",
    slaBreachAt: minsFromNow(24),
    updatedAt: minsAgo(5),
    assignee: "Compliance Desk",
    notes: [
      "Escalated to FinOps Lead & Compliance for secondary beneficiary verification.",
    ],
    auditTrail: [
      {
        id: "aud-6",
        timestamp: minsAgo(110),
        actor: "Compliance Screening",
        summary: "Held settlement for secondary entity screening match.",
      },
      {
        id: "aud-7",
        timestamp: minsAgo(5),
        actor: "A. Nair",
        summary: "Escalated exception due to imminent SLA breach.",
      },
    ],
  },
  {
    id: "exc-105",
    referenceCode: "SET-2026-8798",
    batchId: "BCH-1118-PM",
    counterparty: "Solstice Solar Components",
    bankCode: "BOTKJPJT",
    currency: "JPY",
    amount: 19400000,
    amountUsd: 125800,
    exceptionType: "BANK_REJECT_CODE",
    bankReasonCode: "AM04 - Insufficient Funds",
    severity: "high",
    status: "open",
    slaBreachAt: minsAgo(15),
    updatedAt: minsAgo(15),
    assignee: null,
    notes: ["JPY liquidity pool rebalancing queued at 09:15 IST."],
    auditTrail: [
      {
        id: "aud-8",
        timestamp: minsAgo(75),
        actor: "Settlement Engine",
        summary: "Rejected with AM04 on JPY sub-ledger account.",
      },
    ],
  },
  {
    id: "exc-106",
    referenceCode: "SET-2026-8770",
    batchId: "BCH-1118-AM",
    counterparty: "Caledonia MedTech Ltd.",
    bankCode: "BARCGB22",
    currency: "GBP",
    amount: 82400,
    amountUsd: 104600,
    exceptionType: "MISSING_REF_ID",
    bankReasonCode: "RMTINF_EMPTY",
    severity: "medium",
    status: "resolved",
    slaBreachAt: minsFromNow(300),
    updatedAt: minsAgo(40),
    assignee: "A. Nair",
    notes: ["Mapped ERP purchase order PO-77412 and re-released payout."],
    auditTrail: [
      {
        id: "aud-9",
        timestamp: minsAgo(90),
        actor: "Settlement Engine",
        summary: "Flagged missing remittance reference.",
      },
      {
        id: "aud-10",
        timestamp: minsAgo(40),
        actor: "A. Nair",
        summary: "Attached PO-77412 and marked exception Resolved.",
      },
    ],
  },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface FetchOptions {
  simulateError?: boolean;
  latencyMs?: number;
}

export async function fetchSettlementExceptions(
  options: FetchOptions = {},
): Promise<SettlementException[]> {
  const { simulateError = false, latencyMs = 550 } = options;
  await delay(latencyMs);

  if (simulateError) {
    throw new Error(
      "Failed to sync settlement batch from Clearing Gateway (HTTP 503).",
    );
  }

  // Return deep-enough clones so consumer mutations stay predictable
  return INITIAL_EXCEPTIONS.map((item) => ({
    ...item,
    notes: [...item.notes],
    auditTrail: [...item.auditTrail],
  }));
}

export async function updateExceptionStatusApi(
  id: string,
  nextStatus: ExceptionStatus,
  actor = "A. Nair",
  latencyMs = 200,
): Promise<{
  status: ExceptionStatus;
  updatedAt: string;
  auditEventId: string;
}> {
  await delay(latencyMs);
  return {
    id,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
    auditEventId: `aud-${Date.now()}`,
  } as unknown as {
    status: ExceptionStatus;
    updatedAt: string;
    auditEventId: string;
  };
}
