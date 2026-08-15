import { useState, useEffect, useRef } from 'react';
import { groupsApi } from '../services/apiServices';
import { extractErrorMessage } from '../lib/api';
import { useToast } from '../context/ToastContext';
import type { Invitation } from '../types';

export function useInviteGroup(
  open: boolean,
  groupId: string,
  onInviteCreated?: () => void
) {
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const onInviteCreatedRef = useRef(onInviteCreated);
  useEffect(() => {
    onInviteCreatedRef.current = onInviteCreated;
  }, [onInviteCreated]);

  useEffect(() => {
    if (!open || !groupId) return;

    let active = true;
    groupsApi
      .createInvite(groupId)
      .then((res) => {
        if (active) {
          setInvitation(res.data);
          setError('');
          if (onInviteCreatedRef.current) {
            onInviteCreatedRef.current();
          }
        }
      })
      .catch((err) => {
        if (active) setError(extractErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, groupId]);

  const joinUrl = invitation
    ? `${window.location.origin}/join/${invitation.token}`
    : '';

  function handleCopy() {
    if (!joinUrl) return;
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    showToast('Invite link copied! 📋', 'success');
    setTimeout(() => setCopied(false), 2500);
  }

  function handleShare() {
    if (!joinUrl) return;
    if (navigator.share) {
      navigator
        .share({
          title: 'Join my group on Collaborative Group Rewards',
          text: 'Join our group to earn collective rewards together!',
          url: joinUrl,
        })
        .catch(() => handleCopy());
    } else {
      handleCopy();
    }
  }

  return {
    invitation,
    loading,
    copied,
    error,
    joinUrl,
    handleCopy,
    handleShare,
  };
}
