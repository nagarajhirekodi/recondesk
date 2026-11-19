import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { KpiSummary } from "../hooks/useSettlements";
import { KpiStrip } from "../components/KpiStrip";

const sampleKpis: KpiSummary = {
  unresolvedCount: 5,
  atRiskCount: 3,
  unresolvedVolumeUsd: 898536,
  escalatedCount: 1,
};

describe("KpiStrip", () => {
  it("renders em-dash placeholders while loading", () => {
    render(<KpiStrip kpis={sampleKpis} isLoading={true} />);

    const region = screen.getByRole("region", {
      name: /settlement exception summary/i,
    });
    const dashes = within(region).getAllByText("—");
    expect(dashes).toHaveLength(4);
  });

  it("renders KPI counts and formatted USD volume when loaded", () => {
    render(<KpiStrip kpis={sampleKpis} isLoading={false} />);

    const region = screen.getByRole("region", {
      name: /settlement exception summary/i,
    });
    expect(within(region).getByText("5")).toBeInTheDocument();
    expect(within(region).getByText("3")).toBeInTheDocument();
    expect(within(region).getByText("1")).toBeInTheDocument();
    expect(within(region).getByText("$898,536.00")).toBeInTheDocument();
  });
});
