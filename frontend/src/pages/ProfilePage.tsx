import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProfileView from '../features/profile/components/ProfileView';
import {
  ArrowLeft,
  CreditCard,
  HelpCircle,
  Bell,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const isKycComplete = Boolean(user?.pan_verified && user?.aadhaar_verified);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0c0a09] flex flex-col font-sans">
      {/* Top Application Header matching Stitch */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#e7e5e4] shadow-xs">
        <div className="flex items-center justify-between px-4 sm:px-8 max-w-7xl mx-auto h-16 w-full">
          {/* Brand & Left Navigation Links */}
          <div className="flex items-center gap-4">
            <Link
              to="/groups"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#78716c] hover:text-[#0c0a09] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <div className="h-4 w-px bg-[#e7e5e4]"></div>
            <Link
              to="/credit"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f5f5] text-[#0c0a09] hover:bg-[#e7e5e4] transition-colors text-xs font-semibold"
            >
              <CreditCard className="w-3.5 h-3.5 text-[#b4552d]" />
              <span>Credit Dashboard</span>
            </Link>
            <span className="text-base font-bold text-[#0c0a09] tracking-tight ml-1 hidden sm:inline">
              TribeWealth
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold">
            <Link to="/groups" className="text-[#78716c] hover:text-[#0c0a09] transition-colors">
              Dashboard
            </Link>
            <Link to="/groups" className="text-[#78716c] hover:text-[#0c0a09] transition-colors">
              Group Pots
            </Link>
            <Link to="/credit" className="text-[#78716c] hover:text-[#0c0a09] transition-colors">
              Credit Hub
            </Link>
            <span className="text-[#0c0a09] font-bold border-b-2 border-[#0c0a09] pb-1">
              KYC &amp; Verification
            </span>
          </nav>

          {/* Right Trailing Profile & Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Support help"
              onClick={() => showToast('Help & UIDAI Compliance Guide available 24/7.', 'info')}
              className="p-2 rounded-full text-[#78716c] hover:bg-[#f5f5f5] hover:text-[#0c0a09] transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => showToast('No pending KYC alerts.', 'info')}
              className="p-2 rounded-full text-[#78716c] hover:bg-[#f5f5f5] hover:text-[#0c0a09] transition-colors relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#b4552d]"></span>
            </button>
            <div className="h-5 w-px bg-[#e7e5e4]"></div>

            {/* User Profile Avatar Pill */}
            <div className="flex items-center gap-2.5 pl-1">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-[#0c0a09] text-white flex items-center justify-center text-xs font-bold ring-2 ring-[#e7e5e4]">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AP'}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10b981] rounded-full ring-2 ring-white"></span>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-[#0c0a09] leading-tight">
                  {user?.name || 'Ajay Pal'}
                </span>
                <span className="text-[10px] text-[#78716c] font-medium leading-tight">
                  Tier-1 Member / Owner
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Page Header & Status Badge */}
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-[#78716c] font-medium mb-1">
              <Link to="/groups" className="hover:text-[#0c0a09] transition-colors">
                Dashboard
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#a8a29e]" />
              <span className="text-[#0c0a09] font-semibold">Profile &amp; KYC</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0c0a09] tracking-tight">
              Account Profile &amp; Identity
            </h1>
            <p className="text-xs sm:text-sm text-[#78716c] max-w-2xl">
              Manage your personal profile details and complete government KYC credentials for maximum group rewards eligibility.
            </p>
          </div>

          {/* Right KYC Complete Badge */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            {isKycComplete ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ffdbce] text-[#370e00] font-bold text-xs shadow-xs border border-[#ffb599]">
                <CheckCircle2 className="w-4 h-4 text-[#9c431d]" />
                <span>KYC Tier 2 Complete</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fef3c7] text-[#92400e] font-bold text-xs shadow-xs border border-[#fde68a]">
                <ShieldCheck className="w-4 h-4 text-[#d97706]" />
                <span>Action Required: Complete KYC</span>
              </div>
            )}
          </div>
        </section>

        {/* Tab & Profile Content View */}
        <ProfileView />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e7e5e4] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#78716c]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0c0a09]">TribeWealth Rewards</span>
            <span>•</span>
            <span>Fintech Collaborative Rewards &copy; 2026. All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-6">
            <span className="hover:text-[#0c0a09] cursor-pointer">Compliance Portal</span>
            <span className="hover:text-[#0c0a09] cursor-pointer">UIDAI &amp; Privacy Policy</span>
            <span className="hover:text-[#0c0a09] cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#0c0a09] cursor-pointer">Help Center</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
