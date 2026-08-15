import Modal from './Modal';
import { useInviteGroup } from '../hooks/useInviteGroup';
import { Copy, CheckCircle, Clock, Share2 } from 'lucide-react';

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  onInviteCreated?: () => void;
}

export default function InviteModal({
  open,
  onClose,
  groupId,
  onInviteCreated,
}: InviteModalProps) {
  const {
    invitation,
    loading,
    copied,
    error,
    joinUrl,
    handleCopy,
    handleShare,
  } = useInviteGroup(open, groupId, onInviteCreated);

  return (
    <Modal open={open} onClose={onClose} title="Invite your people">
      <div className="space-y-5 text-[#171923]">
        <p className="text-xs text-[#667085] text-center -mt-2">
          Every person who joins brings you closer to amazing rewards.
        </p>

        {error && (
          <div className="bg-[#F04438]/10 border border-[#F04438]/20 text-[#F04438] p-3 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-3 border-[#635BFF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : invitation ? (
          <div className="space-y-4">
            <div className="bg-[#F8F9FC] border border-[#E7E9EE] rounded-2xl p-4 space-y-2">
              <label className="block text-[11px] font-bold text-[#667085] uppercase tracking-wider">
                Invite Link
              </label>
              <div className="flex gap-2 bg-white border border-[#E7E9EE] rounded-xl p-1.5 pl-3 items-center">
                <input
                  type="text"
                  readOnly
                  value={joinUrl}
                  className="w-full bg-transparent text-xs text-[#171923] font-mono select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="border border-[#635BFF] text-[#635BFF] hover:bg-[#635BFF]/5 text-xs font-semibold px-4 py-2 rounded-lg transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#E7E9EE] w-full" />
              <span className="bg-white px-3 text-[11px] font-medium text-[#98A2B3] absolute">or</span>
            </div>

            {/* Share Action */}
            <button
              type="button"
              onClick={handleShare}
              className="w-full border border-[#E7E9EE] hover:bg-[#F8F9FC] text-[#635BFF] font-semibold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Share2 className="w-4 h-4 text-[#635BFF]" /> Share invite link
            </button>

            {/* Expiration Note Box */}
            <div className="bg-[#F4F5FD] border border-[#635BFF]/15 rounded-2xl p-3.5 text-xs text-[#635BFF] flex items-center justify-center gap-2 font-medium">
              <Clock className="w-4 h-4 text-[#635BFF] shrink-0" />
              <span>Invite link expires in 7 days.</span>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
