import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { SettlementFilters } from "../types/settlement";
import { FilterToolbar } from "../components/FilterToolbar";

const defaultFilters: SettlementFilters = {
  search: "",
  status: "all",
  severity: "all",
  slaAtRiskOnly: false,
};

describe("FilterToolbar", () => {
  it("calls filter and sort handlers on user interaction", async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    const onResetFilters = vi.fn();
    const onSortChange = vi.fn();

    render(
      <FilterToolbar
        filters={defaultFilters}
        hasActiveFilters={false}
        sortField="sla"
        sortDirection="asc"
        resultCount={6}
        totalCount={6}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
        onSortChange={onSortChange}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /reset filters/i }),
    ).not.toBeInTheDocument();

    await user.type(screen.getByLabelText(/search/i), "DEUT");
    expect(onFilterChange).toHaveBeenCalledWith("search", "D");

    await user.selectOptions(screen.getByLabelText(/status/i), "escalated");
    expect(onFilterChange).toHaveBeenCalledWith("status", "escalated");

    await user.selectOptions(screen.getByLabelText(/severity/i), "critical");
    expect(onFilterChange).toHaveBeenCalledWith("severity", "critical");

    await user.click(screen.getByLabelText(/sla at risk only/i));
    expect(onFilterChange).toHaveBeenCalledWith("slaAtRiskOnly", true);

    await user.selectOptions(screen.getByLabelText(/sort by/i), "amount");
    expect(onSortChange).toHaveBeenCalledWith("amount");
  });

  it("shows and triggers Reset filters when filters are active", async () => {
    const user = userEvent.setup();
    const onResetFilters = vi.fn();

    render(
      <FilterToolbar
        filters={{ ...defaultFilters, search: "SET-2026" }}
        hasActiveFilters={true}
        sortField="sla"
        sortDirection="asc"
        resultCount={1}
        totalCount={6}
        onFilterChange={vi.fn()}
        onResetFilters={onResetFilters}
        onSortChange={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /reset filters/i }));
    expect(onResetFilters).toHaveBeenCalledTimes(1);
  });
});
