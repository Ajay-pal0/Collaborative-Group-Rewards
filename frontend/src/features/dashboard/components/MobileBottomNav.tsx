import React from 'react';
import { LayoutDashboard, Zap, Plus, Gift, User } from 'lucide-react';

interface MobileBottomNavProps {
  onNavigateHome: () => void;
  onOpenActivity: () => void;
  onOpenInvite: () => void;
  onOpenRewards: () => void;
  onOpenProfile: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onNavigateHome,
  onOpenActivity,
  onOpenInvite,
  onOpenRewards,
  onOpenProfile,
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E7E9EE] px-4 py-2.5 flex items-center justify-around z-30 shadow-lg">
      <button
        onClick={onNavigateHome}
        className="flex flex-col items-center gap-1 text-[#635BFF] text-[10px] font-bold cursor-pointer"
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Dashboard</span>
      </button>

      <button
        onClick={onOpenActivity}
        className="flex flex-col items-center gap-1 text-[#667085] text-[10px] font-semibold cursor-pointer hover:text-[#171923]"
      >
        <Zap className="w-5 h-5" />
        <span>Activity</span>
      </button>

      {/* Floating (+) Invite Center Button */}
      <button
        onClick={onOpenInvite}
        className="w-12 h-12 rounded-full bg-[#635BFF] hover:bg-[#4F46E5] text-white flex items-center justify-center shadow-lg -mt-6 border-4 border-white cursor-pointer transition-transform active:scale-95"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
      </button>

      <button
        onClick={onOpenRewards}
        className="flex flex-col items-center gap-1 text-[#667085] text-[10px] font-semibold cursor-pointer hover:text-[#171923]"
      >
        <Gift className="w-5 h-5" />
        <span>Rewards</span>
      </button>

      <button
        onClick={onOpenProfile}
        className="flex flex-col items-center gap-1 text-[#667085] text-[10px] font-semibold cursor-pointer hover:text-[#171923]"
      >
        <User className="w-5 h-5" />
        <span>Profile</span>
      </button>
    </div>
  );
};

export default MobileBottomNav;
