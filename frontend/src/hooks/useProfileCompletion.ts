import React, { useState } from 'react';
import { groupsApi } from '../services/apiServices';
import { extractErrorMessage } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function useProfileCompletion(
  groupId?: string,
  onSuccess?: () => void
) {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!groupId) {
      setError('Please select a group first.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await groupsApi.completeProfile(groupId, { name, phone });
      if (res.data.user) {
        updateUser(res.data.user);
      }
      setSuccessMsg('Profile completed! +50 points added to your group! 🎉');
      showToast('Profile completed! +50 points added to your group! 🎉', 'success');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function resetStatus() {
    setError('');
    setSuccessMsg('');
  }

  return {
    name,
    setName,
    phone,
    setPhone,
    loading,
    error,
    successMsg,
    handleSubmit,
    resetStatus,
  };
}
