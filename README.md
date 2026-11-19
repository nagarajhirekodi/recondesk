# ReconDesk — FinOps Settlement & Exception Triage

A focused React + TypeScript application designed for a **Financial Operations (FinOps) analyst** triaging failed, rejected, or held payout exceptions before clearing SLAs breach.

## Problem & Intended User

- **Problem:** High-volume payment clearing batches generate exceptions (e.g., closed bank accounts, FX rate variances, missing ISO 20022 remittance tags, compliance holds). Flat ledger exports make it hard for analysts to prioritize what will breach SLA first, inspect why a payout was blocked, or record audit-ready resolution steps.
- **Intended User:** A FinOps reconciliation analyst reviewing daily settlement batches, prioritizing time-critical exceptions, inspecting bank/exception details, and updating triage statuses or operational notes.

## Key Features

- **Triage Workspace & KPI Strip:** Live counts of unresolved exceptions, SLA-at-risk items (< 2h or overdue), held USD-equivalent volume, and escalated payouts.
- **Multi-Dimensional Exploration:**
  - **Search** across reference ID (`SET-...`), counterparty, BIC/bank code, batch ID, or reason code.
  - **Filter** by status (`Open`, `In Review`, `Escalated`, `Resolved`), severity (`Critical`, `High`, `Medium`), or `SLA at risk only (< 2h)`.
  - **Sort** by SLA urgency, USD exposure, or last updated timestamp.
- **Detail Inspection Drawer:** View settlement metadata, transition exception status (`Start Review`, `Escalate`, `Mark Resolved`, `Reopen`), log resolution notes, and inspect an append-only audit trail.
- **Async & Edge States:** Loading skeletons, an empty state with filter reset, and a simulated error state (`Fail next sync` toggle + `Retry Sync` recovery).
- **Responsive & Accessible Layout:** Desktop table + mobile card layout, `Escape`-to-close modal drawer with focus management, visible focus rings, and `aria-live` status updates.

## Setup & Scripts

```bash
npm install
npm run dev        # Start Vite dev server
npm run build      # Type-check and build production bundle
npm test         # Run Vitest unit & component tests
```
