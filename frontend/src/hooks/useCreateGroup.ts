import { useState } from 'react';
import { groupsApi } from '../services/apiServices';
import { extractErrorMessage } from '../lib/api';
import { useToast } from '../context/ToastContext';
import type { Group } from '../types';

export function useCreateGroup() {
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [type, setType] = useState<string>('friends');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdGroup, setCreatedGroup] = useState<Group | null>(null);
  const [inviteUrl, setInviteUrl] = useState('');

  const resetForm = () => {
    setStep(1);
    setName('');
    setType('friends');
    setError('');
    setCreatedGroup(null);
    setInviteUrl('');
    setLoading(false);
  };

  const createGroup = async (onSuccess?: (group: Group) => void) => {
    if (!name.trim()) {
      setError('Group name is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create Group
      const groupRes = await groupsApi.createGroup({ name, category: type });
      const newGroup = groupRes.data;

      // 2. Generate Invite Token
      const inviteRes = await groupsApi.createInvite(newGroup.id);
      const url = `${window.location.origin}/join/${inviteRes.data.token}`;

      setCreatedGroup(newGroup);
      setInviteUrl(url);
      setStep(2);
      showToast(`Group "${newGroup.name}" created! +100 points awarded! 🎉`, 'success');

      if (onSuccess) {
        onSuccess(newGroup);
      }
    } catch (err) {
      setError(extractErrorMessage(err));
      showToast(extractErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  return {
    step,
    name,
    setName,
    type,
    setType,
    loading,
    error,
    setError,
    createdGroup,
    inviteUrl,
    createGroup,
    resetForm,
  };
}
