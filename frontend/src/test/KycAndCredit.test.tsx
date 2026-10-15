import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import VerificationBadge from '../components/VerificationBadge';
import CreditDashboardModal from '../components/CreditDashboardModal';
import KycCallbackPage from '../pages/KycCallbackPage';
import ProfileModal from '../components/ProfileModal';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

// Mock api
vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
  extractErrorMessage: vi.fn((err) => String(err)),
}));

import api from '../lib/api';

describe('VerificationBadge Component', () => {
  it('renders verified, pending, and not-started badge states', () => {
    const { rerender } = render(<VerificationBadge type="pan" status="VERIFIED" />);
    expect(screen.getByRole('status')).toHaveTextContent('PAN Verified');

    rerender(<VerificationBadge type="aadhaar" status="PENDING" />);
    expect(screen.getByRole('status')).toHaveTextContent('Aadhaar Pending');

    rerender(<VerificationBadge type="credit" status="NOT_STARTED" />);
    expect(screen.getByRole('status')).toHaveTextContent('Credit Not Verified');
  });
});


describe('CreditDashboardModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial unrequested state and allows requesting credit report with consent', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        success: true,
        status: 'NOT_REQUESTED',
        has_report: false,
        credit_score: null,
      },
    });

    vi.mocked(api.post).mockResolvedValueOnce({
      data: {
        success: true,
        status: 'COMPLETED',
        has_report: true,
        credit_score: 750,
        score_band: 'Good',
        total_outstanding: 15200,
        active_accounts_count: 2,
        overdue_amount: 0,
        last_report_date: '2026-10-13T10:00:00Z',
      },
    });

    render(
      <ToastProvider>
        <CreditDashboardModal open={true} onClose={vi.fn()} />
      </ToastProvider>
    );

    // Initial view
    await waitFor(() => {
      expect(screen.getByText(/Authorized Credit Profile Check/i)).toBeInTheDocument();
    });

    // Checkbox consent
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    // Click request button
    const requestBtn = screen.getByRole('button', { name: /Request Credit Profile/i });
    fireEvent.click(requestBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/v1/credit/report/',
        expect.objectContaining({ consent: true })
      );
    });

    // Expect score to display
    await waitFor(() => {
      expect(screen.getByText('750')).toBeInTheDocument();
      expect(screen.getByText('Good')).toBeInTheDocument();
    });
  });
});

describe('KycCallbackPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('confirms DigiLocker session upon callback and shows verified status', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: {
        success: true,
        verification_type: 'aadhaar',
        status: 'verified',
        badge: { label: 'Aadhaar Verified', awarded: true },
        data: {
          masked_id: 'XXXXXXXX1234',
          registered_name: 'Test Aadhaar Citizen',
          verified_at: '2026-10-13T10:00:00Z',
        },
      },
    });

    render(
      <MemoryRouter initialEntries={['/kyc/callback?client_id=dgl-session-123&status=success']}>
        <AuthProvider>
          <ToastProvider>
            <KycCallbackPage />
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/kyc/aadhaar/complete/', {
        client_id: 'dgl-session-123',
      });
      expect(screen.getByText('Aadhaar Verified!')).toBeInTheDocument();
      expect(screen.getByText('XXXXXXXX1234')).toBeInTheDocument();
    });
  });
});

describe('ProfileModal Identity & Verification Tab', () => {
  it('allows navigating to Identity & Verification tab with DigiLocker and Credit sections', () => {
    render(
      <AuthProvider>
        <ToastProvider>
          <ProfileModal open={true} onClose={vi.fn()} />
        </ToastProvider>
      </AuthProvider>
    );

    const kycTab = screen.getByRole('button', { name: /Identity & Verification/i });
    expect(kycTab).toBeInTheDocument();
    fireEvent.click(kycTab);

    expect(screen.getByText(/Verified Identity Credentials/i)).toBeInTheDocument();
    expect(screen.getByText(/Verify Aadhaar via DigiLocker/i)).toBeInTheDocument();
    expect(screen.getByText(/Credit Bureau Overview/i)).toBeInTheDocument();
    expect(screen.getByText(/View Credit/i)).toBeInTheDocument();
  });
});
