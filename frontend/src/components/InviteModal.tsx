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
      <div className="space-y-5 text-[#0c0a09]">
        <p className="text-xs text-[#78716c] text-center -mt-2">
          Every person who joins brings your squad closer to unlocking premium reward tiers.
        </p>

        {error && (
          <div className="bg-[#ffdad6]/40 border border-[#ffdad6] text-[#ba1a1a] p-3 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-3 border-[#0c0a09] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : invitation ? (
          <div className="space-y-4">
            <div className="bg-[#fafafa] border border-[#e7e5e4] rounded-2xl p-4 space-y-2">
              <label className="block text-[11px] font-bold text-[#78716c] uppercase tracking-wider">
                Invite Link
              </label>
              <div className="flex gap-2 bg-white border border-[#e7e5e4] rounded-xl p-1.5 pl-3 items-center">
                <input
                  type="text"
                  readOnly
                  value={joinUrl}
                  className="w-full bg-transparent text-xs text-[#0c0a09] font-mono select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="border border-[#0c0a09] text-[#0c0a09] hover:bg-[#0c0a09] hover:text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-[#10b981]" /> Copied
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
              <div className="border-t border-[#e7e5e4] w-full" />
              <span className="bg-white px-3 text-[11px] font-medium text-[#a8a29e] absolute">or</span>
            </div>

            {/* Share Action */}
            <button
              type="button"
              onClick={handleShare}
              className="w-full border border-[#e7e5e4] hover:bg-[#fafafa] text-[#0c0a09] font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
            >
              <Share2 className="w-4 h-4 text-[#b4552d]" /> Share invite link
            </button>

            {/* Expiration Note Box */}
            <div className="bg-[#fff7ed] border border-[#fed7aa] rounded-2xl p-3.5 text-xs text-[#7c2d12] flex items-center justify-center gap-2 font-medium">
              <Clock className="w-4 h-4 text-[#b4552d] shrink-0" />
              <span>Invite link expires in 7 days.</span>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
