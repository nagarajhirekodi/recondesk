import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { SettlementException } from '../types/settlement';
import { SettlementDetailDrawer } from '../components/SettlementDetailDrawer';

const mockException: SettlementException = {
  id: 'exc-10',
  referenceCode: 'SET-2026-9001',
  batchId: 'BCH-1119',
  counterparty: 'Kestrel Freight & Logistics GmbH',
  bankCode: 'DEUTDEFF',
  currency: 'EUR',
  amount: 120000,
  amountUsd: 129600,
  exceptionType: 'FX_RATE_MISMATCH',
  bankReasonCode: 'FX_DEV_2.1%',
  severity: 'high',
  status: 'in_review',
  slaBreachAt: new Date(Date.now() + 90 * 60_000).toISOString(),
  updatedAt: new Date().toISOString(),
  assignee: 'A. Nair',
  notes: ['Initial FX check started'],
  auditTrail: [
    {
      id: 'aud-1',
      timestamp: new Date().toISOString(),
      actor: 'Engine',
      summary: 'Flagged FX variance.',
    },
  ],
};

describe('SettlementDetailDrawer', () => {
  it('renders nothing when exception is null', () => {
    const { container } = render(
      <SettlementDetailDrawer
        exception={null}
        onClose={vi.fn()}
        onUpdateStatus={vi.fn()}
        onAddNote={vi.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('disables current status button, submits notes, and closes on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onUpdateStatus = vi.fn();
    const onAddNote = vi.fn();

    render(
      <SettlementDetailDrawer
        exception={mockException}
        onClose={onClose}
        onUpdateStatus={onUpdateStatus}
        onAddNote={onAddNote}
      />
    );

    expect(screen.getByRole('button', { name: 'Start Review' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Mark Resolved' }));
    expect(onUpdateStatus).toHaveBeenCalledWith('exc-10', 'resolved');

    const input = screen.getByLabelText(/add resolution note/i);
    await user.type(input, 'Treasury approved spot rate override');
    await user.click(screen.getByRole('button', { name: 'Add Note' }));

    expect(onAddNote).toHaveBeenCalledWith('exc-10', 'Treasury approved spot rate override');
    expect(input).toHaveValue('');

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
