import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Group } from '../types';
import VerificationBadge from './VerificationBadge';
import { Sparkles, Plus, ChevronDown, LogOut, UsersRound, User, TrendingUp } from 'lucide-react';
import { Button } from './ui';

interface NavbarProps {
  groups?: Group[];
  currentGroupId?: string;
  onOpenCreateGroup?: () => void;
}

export default function Navbar({ groups = [], currentGroupId, onOpenCreateGroup }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isCurrent = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e7e5e4] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand & Nav Links */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => navigate('/groups')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-[#0c0a09] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 fill-white/20" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-[#0c0a09]">
              Collaborative Group Rewards
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1.5 pl-2">
            <button
              onClick={() => navigate('/groups')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isCurrent('/groups')
                  ? 'bg-[#0c0a09] text-white'
                  : 'text-[#78716c] hover:text-[#0c0a09] hover:bg-[#f5f5f4]'
              }`}
            >
              Groups
            </button>
            <button
              onClick={() => navigate('/credit')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                isCurrent('/credit')
                  ? 'bg-[#0c0a09] text-white'
                  : 'text-[#78716c] hover:text-[#0c0a09] hover:bg-[#f5f5f4]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>CIBIL Credit</span>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                isCurrent('/profile')
                  ? 'bg-[#0c0a09] text-white'
                  : 'text-[#78716c] hover:text-[#0c0a09] hover:bg-[#f5f5f4]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile & KYC</span>
            </button>
          </nav>

          {/* Group Selector (if groups exist) */}
          {groups.length > 0 && (
            <div className="hidden md:flex items-center">
              <select
                value={currentGroupId || ''}
                onChange={(e) => {
                  if (e.target.value) navigate(`/groups/${e.target.value}`);
                }}
                className="bg-[#f5f5f4] border border-[#e7e5e4] text-[#0c0a09] text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0c0a09] cursor-pointer"
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
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenCreateGroup}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              New Group
            </Button>
          )}

          {/* User Profile / Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-[#f5f5f4] transition-colors border border-transparent hover:border-[#e7e5e4] cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#0c0a09] text-white text-xs font-bold flex items-center justify-center">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-[#0c0a09]">
                {user?.name || 'Account'}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#78716c] transition-transform ${menuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white border border-[#e7e5e4] rounded-2xl shadow-xl py-2 z-50 animate-slide-up"
                onClick={() => setMenuOpen(false)}
              >
                <div className="px-4 py-2.5 border-b border-[#e7e5e4]">
                  <p className="text-[10px] font-bold text-[#78716c] uppercase tracking-wider">Signed in as</p>
                  <p className="text-xs font-bold text-[#0c0a09] truncate">{user?.name}</p>
                  <p className="text-[11px] text-[#78716c] truncate">{user?.email}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <VerificationBadge type="pan" status={user?.pan_verified ? 'VERIFIED' : 'NOT_STARTED'} size="sm" />
                    <VerificationBadge type="aadhaar" status={user?.aadhaar_verified ? 'VERIFIED' : 'NOT_STARTED'} size="sm" />
                  </div>
                </div>

                <div className="p-1 space-y-0.5">
                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#0c0a09] hover:bg-[#f5f5f4] transition-colors cursor-pointer text-left"
                  >
                    <User className="w-3.5 h-3.5 text-[#78716c]" />
                    <span>Profile & KYC Verification</span>
                  </button>
                  <button
                    onClick={() => navigate('/credit')}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#0c0a09] hover:bg-[#f5f5f4] transition-colors cursor-pointer text-left"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-[#0c0a09]" />
                    <span>CIBIL Credit Dashboard</span>
                  </button>
                </div>

                {/* Mobile Group Switcher */}
                {groups.length > 0 && (
                  <div className="md:hidden px-4 py-2 border-t border-[#e7e5e4]">
                    <p className="text-[10px] font-bold text-[#78716c] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <UsersRound className="w-3 h-3" /> Your Groups
                    </p>
                    {groups.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => navigate(`/groups/${g.id}`)}
                        className={`w-full text-left py-1 text-xs truncate ${
                          g.id === currentGroupId ? 'text-[#0c0a09] font-bold' : 'text-[#78716c]'
                        }`}
                      >
                        {g.name} ({g.total_points} pts)
                      </button>
                    ))}
                  </div>
                )}

                <div className="pt-1 border-t border-[#e7e5e4]">
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-[#dc2626] hover:bg-[#fef2f2] flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
