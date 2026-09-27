import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfileModal from '../components/ProfileModal';
import OnboardingPage from '../pages/OnboardingPage';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { MemoryRouter } from 'react-router-dom';
import * as AuthContextModule from '../context/AuthContext';

// Mock API module
vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
  extractErrorMessage: vi.fn((err) => String(err)),
}));

import api from '../lib/api';

describe('PAN Verification Frontend Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders unverified PAN section in ProfileModal and triggers verification', async () => {
    (api.get as any).mockResolvedValue({
      data: {
        id: 'user-1',
        email: 'unverified@example.com',
        name: 'Test User',
        phone: '',
        pan_verified: false,
      },
    });

    (api.post as any).mockResolvedValue({
      data: {
        success: true,
        message: 'PAN verified successfully.',
        data: {
          pan_verified: true,
          pan_masked: 'ABCDE****A',
          name: 'Kumar Gaurav Rathod',
          verified_at: '2026-09-27T10:00:00Z',
        },
      },
    });

    render(
      <AuthProvider>
        <ToastProvider>
          <ProfileModal open={true} onClose={vi.fn()} groupId="group-123" />
        </ToastProvider>
      </AuthProvider>
    );

    // Switch to details tab
    const editTab = screen.getByText('Edit Profile Details');
    fireEvent.click(editTab);

    // Verify PAN section is present in unverified state
    expect(screen.getByText('PAN Verification')).toBeInTheDocument();
    expect(screen.getByText('Your PAN is not verified.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ABCDE1234A')).toBeInTheDocument();

    const panInput = screen.getByPlaceholderText('ABCDE1234A');
    fireEvent.change(panInput, { target: { value: 'abcde1234a' } });
    expect((panInput as HTMLInputElement).value).toBe('ABCDE1234A');

    const verifyBtn = screen.getByRole('button', { name: /Verify PAN/i });
    fireEvent.click(verifyBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/pan/verify/', { pan: 'ABCDE1234A' });
    });
  });

  it('renders verified PAN state in ProfileModal with masked PAN and registered name', () => {
    // Mock useAuth returning a verified user
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'user-2',
        email: 'verified@example.com',
        name: 'Gaurav Rathod',
        phone: '',
        pan_verified: true,
        pan_masked: 'ABCDE****A',
        pan_registered_name: 'Kumar Gaurav Rathod',
        pan_verified_at: '2026-09-27T10:00:00Z',
      },
      status: 'authenticated',
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    });

    render(
      <AuthProvider>
        <ToastProvider>
          <ProfileModal open={true} onClose={vi.fn()} groupId="group-123" />
        </ToastProvider>
      </AuthProvider>
    );

    const editTab = screen.getByText('Edit Profile Details');
    fireEvent.click(editTab);

    // Verified view assertions
    expect(screen.getByText('Identity verified via official registry')).toBeInTheDocument();
    expect(screen.getByText('ABCDE****A')).toBeInTheDocument();
    expect(screen.getByText('Kumar Gaurav Rathod')).toBeInTheDocument();

    // The normal verify input should NOT be displayed when already verified
    expect(screen.queryByPlaceholderText('ABCDE1234A')).not.toBeInTheDocument();
  });

  it('renders OnboardingPage and allows skipping PAN verification', async () => {
    (api.post as any).mockResolvedValue({
      data: {
        user: { id: 'u1', email: 'signup@example.com', name: 'New User' },
        tokens: { access: 'acc-token', refresh: 'ref-token' },
      },
    });

    render(
      <MemoryRouter initialEntries={['/register']}>
        <AuthProvider>
          <ToastProvider>
            <OnboardingPage />
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    // Switch to register tab
    const registerTabs = screen.getAllByRole('button', { name: 'Create Account' });
    fireEvent.click(registerTabs[0]);

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Ajay Pal'), { target: { value: 'New User' } });
    fireEvent.change(screen.getByPlaceholderText('ajay.pal@example.com'), { target: { value: 'signup@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Min. 6 characters'), { target: { value: 'password123' } });

    // Submit registration
    const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitBtn).toBeInTheDocument();
    fireEvent.click(submitBtn);

    // Expect transition to optional PAN verification step
    await waitFor(() => {
      expect(screen.getByText('PAN Verification (Optional)')).toBeInTheDocument();
    });

    // Skip button is available
    const skipBtn = screen.getByText('Skip for now →');
    expect(skipBtn).toBeInTheDocument();
    fireEvent.click(skipBtn);
  });
});
