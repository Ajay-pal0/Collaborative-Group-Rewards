import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Group } from '../types';
import { Sparkles, Plus, ChevronDown, LogOut, UsersRound, User } from 'lucide-react';

interface NavbarProps {
  groups?: Group[];
  currentGroupId?: string;
  onOpenCreateGroup?: () => void;
}

export default function Navbar({ groups = [], currentGroupId, onOpenCreateGroup }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E7E9EE] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand & Group Selector */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => navigate('/groups')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#635BFF] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 fill-white/20" />
            </div>
            <span className="font-bold text-base sm:text-lg tracking-tight text-[#171923]">
              Collaborative Group Rewards
            </span>
          </div>

          {/* Group Selector (if groups exist) */}
          {groups.length > 0 && (
            <div className="hidden md:flex items-center">
              <select
                value={currentGroupId || ''}
                onChange={(e) => {
                  if (e.target.value) navigate(`/groups/${e.target.value}`);
                }}
                className="bg-[#F2F4F7] border border-[#E7E9EE] text-[#171923] text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#635BFF] cursor-pointer"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.total_points} pts)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right: Actions & User Info */}
        <div className="flex items-center gap-3">
          {onOpenCreateGroup && (
            <button
              onClick={onOpenCreateGroup}
              className="bg-[#635BFF] hover:bg-[#4F46E5] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> New Group
            </button>
          )}

          {/* User Profile / Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#F2F4F7] transition-colors border border-transparent hover:border-[#E7E9EE] cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#635BFF]/10 border border-[#635BFF]/20 text-[#635BFF] text-xs font-bold flex items-center justify-center">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-[#171923]">
                {user?.name || 'Account'}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#667085] transition-transform ${menuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-60 bg-white border border-[#E7E9EE] rounded-2xl shadow-xl py-2 z-50 animate-slide-up"
                onClick={() => setMenuOpen(false)}
              >
                <div className="px-4 py-2.5 border-b border-[#E7E9EE]">
                  <p className="text-[10px] font-bold text-[#98A2B3] uppercase tracking-wider">Signed in as</p>
                  <p className="text-xs font-bold text-[#171923] truncate">{user?.name}</p>
                  <p className="text-[11px] text-[#667085] truncate">{user?.email}</p>
                </div>

                {/* Mobile Group Switcher */}
                {groups.length > 0 && (
                  <div className="md:hidden px-4 py-2 border-b border-[#E7E9EE]">
                    <p className="text-[10px] font-bold text-[#98A2B3] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <UsersRound className="w-3 h-3" /> Your Groups
                    </p>
                    {groups.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => navigate(`/groups/${g.id}`)}
                        className={`w-full text-left py-1 text-xs truncate ${
                          g.id === currentGroupId ? 'text-[#635BFF] font-semibold' : 'text-[#667085]'
                        }`}
                      >
                        {g.name} ({g.total_points} pts)
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-[#F04438] hover:bg-[#F2F4F7] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
