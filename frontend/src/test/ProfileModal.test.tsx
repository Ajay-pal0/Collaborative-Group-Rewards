import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProfileModal from '../components/ProfileModal';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import api from '../lib/api';

// Mock API calls
vi.mock('../lib/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({
      data: {
        transaction: { points: 50 },
        user: { name: 'Ajay Pal', email: 'ajay@example.com', phone: '+123456789' },
      },
    }),
  },
  extractErrorMessage: vi.fn((err) => String(err)),
}));

describe('ProfileModal Component', () => {
  it('renders modal header and shows locked bonus when user is unverified', () => {
    localStorage.clear();
    vi.mocked(api.get).mockResolvedValueOnce({ data: { pan_verified: false } });

    render(
      <AuthProvider>
        <ToastProvider>
          <ProfileModal open={true} onClose={vi.fn()} groupId="group-123" />
        </ToastProvider>
      </AuthProvider>
    );

    expect(screen.getByText('Edit Profile Details')).toBeInTheDocument();
    const editTab = screen.getByText('Edit Profile Details');
    fireEvent.click(editTab);

    expect(screen.getByText('Profile Completion Bonus')).toBeInTheDocument();
    expect(screen.getByText(/Locked \(\+50 pts\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Profile Completion Bonus can only be added once your PAN is verified/i)).toBeInTheDocument();
    
    const submitBtn = screen.getByRole('button', { name: /Save Profile & Claim/i });
    expect(submitBtn).toBeDisabled();
  });

  it('allows claiming bonus when user is PAN verified', async () => {
    localStorage.setItem('access_token', 'test_token');
    
    // Mock user with pan_verified: true
    const verifiedUser = {
      id: 'user-123',
      email: 'ajay@example.com',
      name: 'Ajay Pal',
      pan_verified: true,
      pan_masked: 'ABCDE****A',
    };
    vi.mocked(api.get).mockResolvedValue({ data: verifiedUser });

    const handleSuccess = vi.fn();
    render(
      <AuthProvider>
        <ToastProvider>
          <ProfileModal open={true} onClose={vi.fn()} groupId="group-123" onSuccess={handleSuccess} />
        </ToastProvider>
      </AuthProvider>
    );

    const editTab = screen.getByText('Edit Profile Details');
    fireEvent.click(editTab);

    const submitBtn = screen.getByRole('button', { name: /Save Profile & Claim/i });
    expect(submitBtn).toBeInTheDocument();
  });
});
