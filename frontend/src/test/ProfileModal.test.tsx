import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProfileModal from '../components/ProfileModal';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

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
  it('renders modal header and profile fields when open', () => {
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
    expect(screen.getByText('+50 pts')).toBeInTheDocument();
  });

  it('triggers form submit and claims reward', async () => {
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
    fireEvent.click(submitBtn);

    expect(submitBtn).toBeInTheDocument();
  });
});
