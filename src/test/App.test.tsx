import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '../App';

describe('ReconDesk triage workflow', () => {
  it('loads exceptions, supports search and filtering, and shows empty state with reset', async () => {
    const user = userEvent.setup();
    render(<App />);

    const table = await screen.findByRole('table');
    expect(within(table).getByText('SET-2026-8841')).toBeInTheDocument();

    const searchInput = screen.getByLabelText(/search/i);
    await user.type(searchInput, 'Northstar');

    expect(within(table).getByText('Northstar BioLabs Inc.')).toBeInTheDocument();
    expect(within(table).queryByText('Harborview Maritime Services')).not.toBeInTheDocument();

    await user.type(searchInput, 'nonexistent-ref-999');
    expect(screen.getByText(/no matching exceptions found/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /clear all filters/i }));
    await waitFor(() => {
      expect(within(screen.getByRole('table')).getByText('Harborview Maritime Services')).toBeInTheDocument();
    });
  });

  it('opens detail drawer, updates status, and appends a resolution note', async () => {
    const user = userEvent.setup();
    render(<App />);

    const table = await screen.findByRole('table');
    const refLink = within(table).getByRole('button', { name: 'SET-2026-8841' });
    await user.click(refLink);

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Northstar BioLabs Inc.')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Mark Resolved' }));
    expect(within(dialog).getByText(/Updated status to Resolved/i)).toBeInTheDocument();

    const noteInput = within(dialog).getByLabelText(/add resolution note/i);
    await user.type(noteInput, 'Confirmed new IBAN via callback');
    await user.click(within(dialog).getByRole('button', { name: 'Add Note' }));

    expect(within(dialog).getByText('Confirmed new IBAN via callback')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('handles sync errors and recovers when retrying', async () => {
    const user = userEvent.setup();
    render(<App />);

    const table = await screen.findByRole('table');
    expect(within(table).getByText('SET-2026-8841')).toBeInTheDocument();

    await user.click(screen.getByLabelText(/fail next sync/i));
    await user.click(screen.getByRole('button', { name: /sync batch/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /unable to load settlement exceptions/i
    );

    await user.click(screen.getByRole('button', { name: /retry sync/i }));
    const recoveredTable = await screen.findByRole('table');
    expect(within(recoveredTable).getByText('SET-2026-8841')).toBeInTheDocument();
  });
});
