import { useState } from 'react';
import Modal from './Modal';
import VerificationBadge from './VerificationBadge';
import type { GroupMember } from '../types';

import {
  User,
  ShieldCheck,
  Mail,
  UserPlus,
  Search,
  UsersRound,
  Filter,
  Clock,
  X,
  Sparkles,
} from 'lucide-react';

interface MembersModalProps {
  open: boolean;
  onClose: () => void;
  members: GroupMember[];
  groupName: string;
  onOpenInvite: () => void;
  memberPoints?: { user_id: string; member_id: string; points_earned: number }[];
}

type RoleFilter = 'all' | 'owner' | 'member';

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function MembersModal({
  open,
  onClose,
  members,
  groupName,
  onOpenInvite,
  memberPoints = [],
}: MembersModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (roleFilter === 'owner') return m.role === 'owner';
    if (roleFilter === 'member') return m.role === 'member';
    return true;
  });

  const ownerCount = members.filter((m) => m.role === 'owner').length;
  const memberCount = members.filter((m) => m.role === 'member').length;

  return (
    <Modal open={open} onClose={onClose} title="Group Members Roster">
      <div className="space-y-4 text-[#0c0a09]">
        {/* Banner Summary Header */}
        <div className="bg-[#fafafa] border border-[#e7e5e4] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0c0a09] text-white flex items-center justify-center shadow-xs">
              <UsersRound className="w-5 h-5 text-[#fd8d60]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#0c0a09]">
                {groupName} Members
              </h3>
              <p className="text-xs text-[#78716c]">
                {members.length} total members collaborating in this group
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white border border-[#e7e5e4] px-3.5 py-1.5 rounded-xl shadow-2xs text-center">
              <span className="text-[10px] uppercase font-bold text-[#78716c] block">Total Team</span>
              <span className="text-xs font-bold text-[#0c0a09]">{members.length} Active</span>
            </div>
          </div>
        </div>

        {/* Filter Category Tabs */}
        <div className="flex items-center gap-1.5 bg-[#f5f5f5] p-1.5 rounded-2xl overflow-x-auto">
          <button
            onClick={() => setRoleFilter('all')}
            className={`flex-1 min-w-[85px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              roleFilter === 'all'
                ? 'bg-white text-[#0c0a09] shadow-xs'
                : 'text-[#78716c] hover:text-[#0c0a09]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" /> All ({members.length})
          </button>
          <button
            onClick={() => setRoleFilter('owner')}
            className={`flex-1 min-w-[85px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              roleFilter === 'owner'
                ? 'bg-white text-[#0c0a09] shadow-xs'
                : 'text-[#78716c] hover:text-[#0c0a09]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#b4552d]" /> Owners ({ownerCount})
          </button>
          <button
            onClick={() => setRoleFilter('member')}
            className={`flex-1 min-w-[85px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              roleFilter === 'member'
                ? 'bg-white text-[#0c0a09] shadow-xs'
                : 'text-[#78716c] hover:text-[#0c0a09]'
            }`}
          >
            <User className="w-3.5 h-3.5 text-[#0c0a09]" /> Members ({memberCount})
          </button>
        </div>

        {/* Prominent Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#78716c] absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search member by name or email..."
            className="w-full bg-[#f8fafc] border border-[#e7e5e4] rounded-xl pl-10 pr-8 py-2 text-xs text-[#0c0a09] focus:outline-none focus:ring-2 focus:ring-[#0c0a09] focus:bg-white placeholder:text-[#a8a29e] shadow-2xs transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-[#78716c] hover:text-[#0c0a09] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Members Roster Container */}
        <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-10 bg-[#fafafa] rounded-2xl border border-dashed border-[#e7e5e4] space-y-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-xs text-[#a8a29e]">
                <UsersRound className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#0c0a09]">No members match your search</p>
                <p className="text-xs text-[#78716c]">Try searching for a different name or email.</p>
              </div>
              {(searchTerm || roleFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('all');
                  }}
                  className="text-xs font-bold text-[#b4552d] hover:underline cursor-pointer"
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            filteredMembers.map((m) => {
              const isOwner = m.role === 'owner';
              const userName = m.user.name || m.user.email || 'Group Member';
              const initial = userName.charAt(0).toUpperCase();
              const joinedTime = formatRelativeTime(m.joined_at);

              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#e7e5e4] hover:border-[#0c0a09]/20 hover:shadow-xs transition-all text-xs group"
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-2">
                    {/* User Avatar with Role Overlay Badge */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-[#0c0a09] text-white flex items-center justify-center font-bold text-xs shadow-xs border border-white/20">
                        {initial}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white border border-[#e7e5e4] flex items-center justify-center shadow-2xs">
                        {isOwner ? (
                          <ShieldCheck className="w-2.5 h-2.5 text-[#b4552d]" />
                        ) : (
                          <User className="w-2.5 h-2.5 text-[#0c0a09]" />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-[#0c0a09] truncate">{userName}</span>
                        {isOwner && (
                          <span className="text-[10px] font-bold text-[#370e00] bg-[#ffdbce] border border-[#ffb599] px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                            <ShieldCheck className="w-2.5 h-2.5 text-[#9c431d]" /> Owner
                          </span>
                        )}
                        {m.user.pan_verified && (
                          <VerificationBadge type="pan" status="VERIFIED" size="sm" showLabel={false} />
                        )}
                        {m.user.aadhaar_verified && (
                          <VerificationBadge type="aadhaar" status="VERIFIED" size="sm" showLabel={false} />
                        )}
                      </div>
                      <p className="text-[11px] text-[#78716c] flex items-center gap-1 mt-0.5 truncate">
                        <Mail className="w-3 h-3 text-[#a8a29e] shrink-0" /> {m.user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {(() => {
                      const mPointsData = memberPoints.find(
                        (mp) => mp.user_id === m.user.id || mp.member_id === m.id
                      );
                      const pointsEarned = mPointsData ? mPointsData.points_earned : 0;
                      return (
                        <span className="text-[10px] font-bold text-[#b4552d] bg-[#ffdbce]/50 border border-[#ffb599]/60 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
                          <Sparkles className="w-2.5 h-2.5" /> +{pointsEarned} pts
                        </span>
                      );
                    })()}
                    <span className="text-[10px] font-medium text-[#78716c] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Joined {joinedTime}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-[#e7e5e4] flex items-center justify-between gap-3">
          <span className="text-xs text-[#78716c]">
            Showing <strong className="text-[#0c0a09]">{filteredMembers.length}</strong> of {members.length} members
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#78716c] hover:text-[#0c0a09] transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenInvite();
              }}
              className="bg-[#0c0a09] hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              <UserPlus className="w-3.5 h-3.5" /> Invite member
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
