import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import { authApi } from '../services/apiServices';

vi.mock('../services/apiServices', () => ({
  authApi: {
    resetPassword: vi.fn(),
    forgotPassword: vi.fn(),
  },
}));

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders missing token alert if no token is in URL', () => {
    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByText(/Invalid or missing reset token/i)
    ).toBeInTheDocument();
  });

  it('renders reset password form when token is present', () => {
    render(
      <MemoryRouter initialEntries={['/reset-password/sample-token-123']}>
        <Routes>
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Set New Password/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Min\. 6 characters/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Re-enter new password/i)).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    render(
      <MemoryRouter initialEntries={['/reset-password/sample-token-123']}>
        <Routes>
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Min\. 6 characters/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Re-enter new password/i), {
      target: { value: 'mismatch123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('calls resetPassword API and displays success state', async () => {
    vi.mocked(authApi.resetPassword).mockResolvedValueOnce({
      data: { message: 'Password has been reset successfully.' },
    } as any);

    render(
      <MemoryRouter initialEntries={['/reset-password/valid-token-xyz']}>
        <Routes>
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Min\. 6 characters/i), {
      target: { value: 'StrongPassword123' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Re-enter new password/i), {
      target: { value: 'StrongPassword123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

    await waitFor(() => {
      expect(authApi.resetPassword).toHaveBeenCalledWith({
        token: 'valid-token-xyz',
        new_password: 'StrongPassword123',
        confirm_password: 'StrongPassword123',
      });
      expect(screen.getByText(/Password Reset Successful!/i)).toBeInTheDocument();
    });
  });
});
