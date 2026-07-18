import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Medic from './Medic';

// Mock data (Paracetamol, Aspirin are allowed; Fexofenadine is not allowed)
const mockDrugs = [
  { b: 'Napa', p: '500 mg', g: 'Paracetamol', m: 'Beximco' },
  { b: 'Ace', p: '500 mg', g: 'Paracetamol', m: 'Square' },
  { b: 'Napa Extend', p: '665 mg', g: 'Paracetamol', m: 'Beximco' },
  { b: 'Fexo', p: '120 mg', g: 'Fexofenadine', m: 'Incepta' },
  { b: 'Disprin', p: '300 mg', g: 'Aspirin', m: 'Reckitt' },
];

// Mock fetch
global.fetch = vi.fn();

describe('Medic Component - Redesigned Medicine Allowance Checker', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockDrugs,
    } as Response);
    // Clear session storage to avoid cache interference
    sessionStorage.clear();
  });

  it('renders search bar and branded title without back buttons', async () => {
    render(
      <MemoryRouter>
        <Medic />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.queryByText(/Synchronizing clinical data/i)).not.toBeInTheDocument());

    expect(screen.getByText('Medical Assistant')).toBeInTheDocument();
    expect(screen.getByText(/Medicine Allowance Checker/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search Brand or Generic name/i)).toBeInTheDocument();

    // There should be no back button anywhere on the page
    const backButton = screen.queryByTitle(/Back/i);
    expect(backButton).not.toBeInTheDocument();
  });

  it('shows suggestions when typing matching brand or generic', async () => {
    render(
      <MemoryRouter>
        <Medic />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.queryByText(/Synchronizing clinical data/i)).not.toBeInTheDocument());

    const input = screen.getByPlaceholderText(/Search Brand or Generic name/i);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Napa' } });

    await waitFor(() => {
      expect(screen.getByText('Napa')).toBeInTheDocument();
      expect(screen.getByText('Napa Extend')).toBeInTheDocument();
    });
  });

  it('shows allowance checker status and alternatives when a drug is selected', async () => {
    render(
      <MemoryRouter>
        <Medic />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.queryByText(/Synchronizing clinical data/i)).not.toBeInTheDocument());

    const input = screen.getByPlaceholderText(/Search Brand or Generic name/i);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Napa 500 mg' } });

    const suggestion = await screen.findByText('Napa');
    fireEvent.mouseDown(suggestion);

    // Should show medicine details
    expect(screen.getAllByText('Paracetamol')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Beximco')[0]).toBeInTheDocument();

    // Napa (Paracetamol) should show as allowed
    expect(screen.getByText(/Prescribable Medicine/i)).toBeInTheDocument();

    // Napa (Paracetamol) should show alternatives list with BEST MATCH
    expect(screen.getByText(/Alternative Brands/i)).toBeInTheDocument();
    expect(screen.getByText('Ace')).toBeInTheDocument();
    expect(screen.getByText('BEST MATCH')).toBeInTheDocument();
  });

  it('toggles stats and displays clinical metrics', async () => {
    render(
      <MemoryRouter>
        <Medic />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.queryByText(/Synchronizing clinical data/i)).not.toBeInTheDocument());

    const statsButton = screen.getByText(/Expand Database Statistics/i);
    fireEvent.click(statsButton);

    expect(screen.getByText('Medicines in DB')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    // Click unique generics tile to show generics registry sub-list
    const genericsTile = screen.getByText('Unique Generics').closest('button');
    expect(genericsTile).toBeInTheDocument();
    if (genericsTile) {
      fireEvent.click(genericsTile);
    }

    expect(screen.getByText('Clinical Generics Registry')).toBeInTheDocument();
  });
});
