import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Medic from './Medic';

// Mock data
const mockDrugs = [
  { b: 'Napa', p: '500 mg', g: 'Paracetamol', m: 'Beximco' },
  { b: 'Ace', p: '500 mg', g: 'Paracetamol', m: 'Square' },
  { b: 'Napa Extend', p: '665 mg', g: 'Paracetamol', m: 'Beximco' },
  { b: 'Fexo', p: '120 mg', g: 'Fexofenadine', m: 'Incepta' },
];

// Mock fetch
global.fetch = vi.fn();

describe('Medic Component', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockDrugs,
    } as Response);
  });

  it('renders search bar and title', async () => {
    render(
      <MemoryRouter>
        <Medic />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.queryByText(/Loading Medicines/i)).not.toBeInTheDocument());

    expect(screen.getByText('Medic')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by brand name/i)).toBeInTheDocument();
  });

  it('shows suggestions when typing', async () => {
    render(
      <MemoryRouter>
        <Medic />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.queryByText(/Loading Medicines/i)).not.toBeInTheDocument());

    const input = screen.getByPlaceholderText(/Search by brand name/i);
    fireEvent.change(input, { target: { value: 'Napa' } });

    await waitFor(() => {
      expect(screen.getByText('Napa')).toBeInTheDocument();
      expect(screen.getByText('Napa Extend')).toBeInTheDocument();
    });
  });

  it('shows alternatives and excludes self when a drug is selected', async () => {
    render(
      <MemoryRouter>
        <Medic />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.queryByText(/Loading Medicines/i)).not.toBeInTheDocument());

    const input = screen.getByPlaceholderText(/Search by brand name/i);
    fireEvent.change(input, { target: { value: 'Napa 500 mg' } });

    const suggestion = await screen.findByText(/Napa/);
    fireEvent.click(suggestion);

    expect(screen.getByText('Alternatives')).toBeInTheDocument();

    // Should show Ace (Paracetamol 500mg)
    expect(screen.getByText('Ace')).toBeInTheDocument();

    // Should show Napa Extend (Paracetamol 665mg)
    expect(screen.getByText('Napa Extend')).toBeInTheDocument();

    // The selected drug "Napa 500 mg" should NOT be in the alternatives list
    // (It is in the header/selected section though)
    const alternativesSection = screen.getByText('Alternatives').parentElement;
    expect(alternativesSection?.textContent).not.toContain('BEST MATCH Napa 500 mg');

    // Check BEST MATCH
    expect(screen.getByText('BEST MATCH')).toBeInTheDocument();
  });

  it('toggles statistics', async () => {
    render(
      <MemoryRouter>
        <Medic />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.queryByText(/Loading Medicines/i)).not.toBeInTheDocument());

    const statsButton = screen.getByText(/View Statistics/i);
    fireEvent.click(statsButton);

    expect(screen.getByText('Total Drugs')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });
});
