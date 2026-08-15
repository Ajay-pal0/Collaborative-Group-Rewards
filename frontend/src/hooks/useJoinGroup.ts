import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupsApi } from '../services/apiServices';
import { extractErrorMessage } from '../lib/api';
import { useToast } from '../context/ToastContext';
import type { Invitation } from '../types';

export function useJoinGroup(token?: string) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(token ? '' : 'This invite link is invalid.');
  const [alreadyMember, setAlreadyMember] = useState(false);

  useEffect(() => {
    if (!token) return;

    groupsApi
      .getInviteDetails(token)
      .then((res) => {
        setInvitation(res.data);
      })
      .catch((err) => {
        const msg = extractErrorMessage(err);
        if (msg.toLowerCase().includes('already a member')) {
          setAlreadyMember(true);
        } else {
          setError(msg);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const handleJoin = async () => {
    if (!token) return;
    setJoining(true);
    setError('');

    try {
      const res = await groupsApi.joinGroup(token);
      const groupData = res.data;
      showToast(`Welcome to ${groupData.name}! 🎉`, 'success');
      navigate(`/groups/${groupData.id}`);
    } catch (err) {
      const msg = extractErrorMessage(err);
      if (msg.toLowerCase().includes('already a member')) {
        setAlreadyMember(true);
      } else {
        setError(msg);
      }
    } finally {
      setJoining(false);
    }
  };

  return {
    invitation,
    loading,
    joining,
    error,
    alreadyMember,
    handleJoin,
  };
}
