import { describe, expect, it } from "vitest";
import type { SettlementException } from "../types/settlement";
import { formatCurrency, getSlaInfo } from "../utils/sla";

const baseException: SettlementException = {
  id: "exc-test",
  referenceCode: "SET-2026-0001",
  batchId: "BCH-01",
  counterparty: "Test Corp",
  bankCode: "CITIUS33",
  currency: "USD",
  amount: 10000,
  amountUsd: 10000,
  exceptionType: "BANK_REJECT_CODE",
  bankReasonCode: "AC04",
  severity: "high",
  status: "open",
  slaBreachAt: "2026-11-19T10:00:00.000Z",
  updatedAt: "2026-11-19T08:00:00.000Z",
  assignee: null,
  notes: [],
  auditTrail: [],
};

describe("getSlaInfo", () => {
  const nowMs = new Date("2026-11-19T09:00:00.000Z").getTime();

  it("marks unresolved items under 120 minutes as at risk", () => {
    const item: SettlementException = {
      ...baseException,
      slaBreachAt: new Date(nowMs + 45 * 60_000).toISOString(),
    };
    const info = getSlaInfo(item, nowMs);
    expect(info.isAtRisk).toBe(true);
    expect(info.isBreached).toBe(false);
    expect(info.label).toBe("45m left");
  });

  it("marks past-due unresolved items as breached and at risk", () => {
    const item: SettlementException = {
      ...baseException,
      slaBreachAt: new Date(nowMs - 20 * 60_000).toISOString(),
    };
    const info = getSlaInfo(item, nowMs);
    expect(info.isBreached).toBe(true);
    expect(info.isAtRisk).toBe(true);
    expect(info.label).toBe("20m overdue");
  });

  it("returns Resolved with no risk for resolved exceptions", () => {
    const item: SettlementException = {
      ...baseException,
      status: "resolved",
      slaBreachAt: new Date(nowMs - 60 * 60_000).toISOString(),
    };
    const info = getSlaInfo(item, nowMs);
    expect(info.label).toBe("Resolved");
    expect(info.isAtRisk).toBe(false);
    expect(info.isBreached).toBe(false);
  });
});

describe("formatCurrency", () => {
  it("formats standard currencies and falls back gracefully on invalid codes", () => {
    expect(formatCurrency(1250, "USD").replace(/\s+/g, " ")).toBe("$1,250.00");
    expect(formatCurrency(500, "XYZ").replace(/\s+/g, " ")).toContain("500.00");
    expect(formatCurrency(500, "INVALID").replace(/\s+/g, " ")).toBe(
      "INVALID 500",
    );
  });
});
