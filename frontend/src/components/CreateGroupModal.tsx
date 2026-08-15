import React, { useState } from 'react';
import Modal from './Modal';
import { groupsApi } from '../services/apiServices';
import { extractErrorMessage } from '../lib/api';
import { useToast } from '../context/ToastContext';
import type { Group } from '../types';
import { UsersRound, House, BriefcaseBusiness, Sparkles, CheckCircle2, Copy, ArrowRight, Check } from 'lucide-react';

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (newGroup: Group) => void;
}

const TYPE_OPTIONS = [
  { value: 'friends', label: 'Friends', icon: UsersRound },
  { value: 'family', label: 'Family', icon: House },
  { value: 'colleagues', label: 'Colleagues', icon: BriefcaseBusiness },
  { value: 'other', label: 'Other', icon: Sparkles },
];

export default function CreateGroupModal({ open, onClose, onSuccess }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [groupType, setGroupType] = useState('friends');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Success Step State (Screen 03)
  const [createdGroup, setCreatedGroup] = useState<Group | null>(null);
  const [inviteToken, setInviteToken] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Group name is required.');
      return;
    }
    if (name.length > 255) {
      setError('Group name must be 255 characters or fewer.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await groupsApi.createGroup({
        name: name.trim(),
        category: groupType,
      });

      // Generate initial invite token for success screen
      try {
        const invRes = await groupsApi.createInvite(res.data.id);
        setInviteToken(invRes.data.token);
      } catch {
        // Invite creation is non-blocking
      }

      setCreatedGroup(res.data);
      showToast(`Group "${res.data.name}" created! +100 points earned! 🎉`, 'success');
      onSuccess(res.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function handleResetAndClose() {
    setName('');
    setGroupType('friends');
    setCreatedGroup(null);
    setInviteToken('');
    setCopied(false);
    onClose();
  }

  function handleCopyInvite() {
    const inviteUrl = inviteToken
      ? `${window.location.origin}/join/${inviteToken}`
      : window.location.href;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    showToast('Invite link copied! 📋', 'success');
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <Modal
      open={open}
      onClose={handleResetAndClose}
      title={createdGroup ? 'Group Created' : 'Create your group'}
    >
      {!createdGroup ? (
        /* Screen 02: Form */
        <form onSubmit={handleSubmit} className="space-y-5 text-[#171923]">
          {error && (
            <div className="bg-[#F04438]/10 border border-[#F04438]/20 text-[#F04438] p-3 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#667085] uppercase tracking-wider mb-1.5">
              Group Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g. Weekend Getaway"
              maxLength={255}
              className="w-full bg-[#F8F9FC] border border-[#E7E9EE] rounded-xl px-3.5 py-2.5 text-sm text-[#171923] focus:outline-none focus:ring-2 focus:ring-[#635BFF] placeholder-[#98A2B3]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#667085] uppercase tracking-wider mb-2">
              Group Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {TYPE_OPTIONS.map((opt) => {
                const IconComp = opt.icon;
                const isSelected = groupType === opt.value;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setGroupType(opt.value)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-[#635BFF]/10 border-[#635BFF] text-[#635BFF] shadow-xs'
                        : 'bg-white border-[#E7E9EE] text-[#667085] hover:border-[#D0D5DD] hover:bg-[#F2F4F7]'
                    }`}
                  >
                    <IconComp className={`w-5 h-5 ${isSelected ? 'text-[#635BFF]' : 'text-[#667085]'}`} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-[#E7E9EE]">
            <button
              type="button"
              onClick={handleResetAndClose}
              className="px-4 py-2.5 text-xs font-semibold text-[#667085] hover:text-[#171923] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#635BFF] hover:bg-[#4F46E5] disabled:opacity-50 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                'Create group'
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Screen 03: Group Created (Success) */
        <div className="text-center space-y-5 py-2 text-[#171923]">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#635BFF] flex items-center justify-center text-white shadow-md">
              <Check className="w-9 h-9 stroke-[3]" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-[#171923]">Your group is ready!</h3>
            <p className="text-sm font-bold text-[#635BFF]">{createdGroup.name}</p>
            <p className="text-xs text-[#667085]">
              You earned <strong className="text-[#171923] font-bold">100 points</strong> for creating your group.
            </p>
          </div>

          <div className="bg-[#F8F9FC] border border-[#E7E9EE] rounded-2xl p-4 max-w-xs mx-auto text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">Your Points</span>
            <div className="text-3xl font-black text-[#635BFF] font-sans flex items-center justify-center gap-1">
              100 <Sparkles className="w-5 h-5 text-[#F5B942] fill-[#F5B942]" />
            </div>
          </div>

          <p className="text-xs text-[#667085] max-w-xs mx-auto leading-relaxed">
            Invite your friends and start unlocking rewards together.
          </p>

          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              onClick={handleCopyInvite}
              className="w-full bg-[#635BFF] hover:bg-[#4F46E5] text-white text-xs font-semibold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Invite link copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy invite link
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-full text-xs font-semibold text-[#667085] hover:text-[#171923] py-2 transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              Go to dashboard <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
