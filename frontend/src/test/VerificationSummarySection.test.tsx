import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import VerificationSummarySection from '../features/profile/components/VerificationSummarySection';
import { ToastProvider } from '../context/ToastContext';
import type { User } from '../types';

vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
  extractErrorMessage: vi.fn((err) => String(err)),
}));

import api from '../lib/api';

describe('VerificationSummarySection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders accurate personal information and dynamic group data', async () => {
    const mockUser: User = {
      id: 'test-user-id-1234',
      name: 'Rohan Sharma',
      email: 'rohan.sharma@example.com',
      phone: '+91 98765 00000',
      created_at: '2025-08-15T10:00:00Z',
      pan_verified: true,
      pan_masked: 'ABCDE1234F',
      pan_registered_name: 'ROHAN SHARMA',
      pan_verified_at: '2025-09-01T12:00:00Z',
      aadhaar_verified: true,
      aadhaar_masked: '123456789012',
      aadhaar_registered_name: 'ROHAN SHARMA',
      aadhaar_verified_at: '2025-09-01T12:00:00Z',
    };

    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url === '/groups/') {
        return {
          data: [
            {
              id: 'group-1',
              name: 'Alpha Investors',
              current_user_role: 'owner',
              total_points: 3500,
            },
          ],
        } as never;
      }
      if (url === '/groups/group-1/user-points/') {
        return {
          data: {
            user_points: 2450,
          },
        } as never;
      }
      return { data: {} } as never;
    });

    render(
      <MemoryRouter>
        <ToastProvider>
          <VerificationSummarySection user={mockUser} />
        </ToastProvider>
      </MemoryRouter>
    );

    // Personal Information assertions
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Rohan Sharma')).toBeInTheDocument();
    expect(screen.getByText('rohan.sharma@example.com')).toBeInTheDocument();
    expect(screen.getByText('+91 98765 00000')).toBeInTheDocument();
    expect(screen.getByText('August 2025')).toBeInTheDocument();

    // Group & Points dynamic loading
    await waitFor(() => {
      expect(screen.getByText('Alpha Investors (Owner)')).toBeInTheDocument();
      expect(screen.getByText('2,450 PTS')).toBeInTheDocument();
    });

    // Masked identities
    expect(screen.getByText('ABCDE****F')).toBeInTheDocument();
    expect(screen.getByText('XXXXXXXX9012')).toBeInTheDocument();
  });

  it('renders graceful accurate fallbacks when phone or group is not present', async () => {
    const mockUnverifiedUser: User = {
      id: 'test-user-id-5678',
      name: 'Priya Verma',
      email: 'priya@example.com',
      phone: '',
      pan_verified: false,
      aadhaar_verified: false,
    };

    vi.mocked(api.get).mockResolvedValue({ data: [] } as never);

    render(
      <MemoryRouter>
        <ToastProvider>
          <VerificationSummarySection user={mockUnverifiedUser} />
        </ToastProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Priya Verma')).toBeInTheDocument();
    expect(screen.getByText('priya@example.com')).toBeInTheDocument();
    expect(screen.getByText('Not added')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('No active group')).toBeInTheDocument();
      expect(screen.getByText('0 PTS')).toBeInTheDocument();
    });
  });
});
