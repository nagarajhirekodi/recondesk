import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EmptyState, ErrorBanner, LoadingSkeleton } from "../components/StateBanner";

describe("StateBanner components", () => {
  it("renders loading skeleton with status role", () => {
    render(<LoadingSkeleton rows={3} />);
    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-label",
      "Loading exceptions",
    );
  });

  it("renders error banner and triggers retry callback", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<ErrorBanner message="Gateway timeout" onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Gateway timeout");

    await user.click(screen.getByRole("button", { name: /retry sync/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders filtered empty state with reset action", async () => {
    const user = userEvent.setup();
    const onResetFilters = vi.fn();

    render(
      <EmptyState hasActiveFilters={true} onResetFilters={onResetFilters} />,
    );
    await user.click(
      screen.getByRole("button", { name: /clear all filters/i }),
    );
    expect(onResetFilters).toHaveBeenCalledTimes(1);
  });
});
