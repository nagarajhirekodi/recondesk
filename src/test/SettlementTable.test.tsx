import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { SettlementException } from '../types/settlement';
import { SettlementTable } from '../components/SettlementTable';

const sampleItems: SettlementException[] = [
  {
    id: 'exc-1',
    referenceCode: 'SET-2026-1001',
    batchId: 'BCH-01',
    counterparty: 'Alpha Treasury Corp',
    bankCode: 'CHASUS33',
    currency: 'USD',
    amount: 50000,
    amountUsd: 50000,
    exceptionType: 'BANK_REJECT_CODE',
    bankReasonCode: 'AC04',
    severity: 'critical',
    status: 'open',
    slaBreachAt: new Date(Date.now() + 30 * 60_000).toISOString(),
    updatedAt: new Date().toISOString(),
    assignee: null,
    notes: [],
    auditTrail: [],
  },
  {
    id: 'exc-2',
    referenceCode: 'SET-2026-1002',
    batchId: 'BCH-01',
    counterparty: 'Beta Euro GmbH',
    bankCode: 'DEUTDEFF',
    currency: 'EUR',
    amount: 20000,
    amountUsd: 21600,
    exceptionType: 'FX_RATE_MISMATCH',
    bankReasonCode: 'FX_DEV',
    severity: 'medium',
    status: 'in_review',
    slaBreachAt: new Date(Date.now() + 240 * 60_000).toISOString(),
    updatedAt: new Date().toISOString(),
    assignee: 'A. Nair',
    notes: [],
    auditTrail: [],
  },
];

describe('SettlementTable', () => {
  it('renders rows, triggers column sorting, and selects an exception on click', async () => {
    const user = userEvent.setup();
    const onToggleSort = vi.fn();
    const onSelect = vi.fn();

    render(
      <SettlementTable
        items={sampleItems}
        selectedId={null}
        sortField="sla"
        sortDirection="asc"
        onToggleSort={onToggleSort}
        onSelect={onSelect}
      />
    );

    const table = screen.getByRole('table');
    expect(within(table).getByText('Alpha Treasury Corp')).toBeInTheDocument();
    expect(within(table).getByText('Beta Euro GmbH')).toBeInTheDocument();

    await user.click(within(table).getByRole('button', { name: /amount/i }));
    expect(onToggleSort).toHaveBeenCalledWith('amount');

    await user.click(within(table).getByRole('button', { name: 'SET-2026-1001' }));
    expect(onSelect).toHaveBeenCalledWith('exc-1');
  });
});
