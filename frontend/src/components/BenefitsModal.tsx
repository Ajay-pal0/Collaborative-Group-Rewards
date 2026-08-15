import { useState } from 'react';
import Modal from './Modal';
import type { BenefitState } from '../types';
import {
  Gift,
  Lock,
  Check,
  Sparkles,
  Search,
  Filter,
  X,
  Award,
} from 'lucide-react';

interface BenefitsModalProps {
  open: boolean;
  onClose: () => void;
  benefits: BenefitState[];
  totalPoints: number;
  onUnlockBenefit: (benefitState: BenefitState) => void;
}

type BenefitCategory = 'all' | 'available' | 'claimed' | 'locked';

export default function BenefitsModal({
  open,
  onClose,
  benefits,
  totalPoints,
  onUnlockBenefit,
}: BenefitsModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<BenefitCategory>('all');

  const filteredBenefits = benefits.filter((bState) => {
    const { benefit, state } = bState;
    const matchesSearch =
      benefit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      benefit.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(benefit.required_points).includes(searchTerm);

    if (!matchesSearch) return false;

    if (activeCategory === 'available') return state === 'available';
    if (activeCategory === 'claimed') return state === 'claimed';
    if (activeCategory === 'locked') return state === 'locked';
    return true;
  });

  const availableCount = benefits.filter((b) => b.state === 'available').length;
  const claimedCount = benefits.filter((b) => b.state === 'claimed').length;
  const lockedCount = benefits.filter((b) => b.state === 'locked').length;

  return (
    <Modal open={open} onClose={onClose} title="Group Rewards & Milestones">
      <div className="space-y-4 text-[#171923]">
        {/* Banner Summary Header */}
        <div className="bg-gradient-to-r from-[#635BFF]/10 via-[#635BFF]/5 to-transparent border border-[#635BFF]/20 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#635BFF] to-[#4F46E5] text-white flex items-center justify-center shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#171923]">
                Group Rewards Progress
              </h3>
              <p className="text-[11px] text-[#667085]">
                {claimedCount} of {benefits.length} rewards claimed by your group
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white border border-[#E7E9EE] px-3 py-1 rounded-xl shadow-2xs text-center">
              <span className="text-[9px] uppercase font-bold text-[#667085] block">Group Balance</span>
              <span className="text-xs font-black text-[#635BFF]">{totalPoints} pts</span>
            </div>
          </div>
        </div>

        {/* Filter Category Tabs */}
        <div className="flex items-center gap-1.5 bg-[#F2F4F7] p-1.5 rounded-2xl overflow-x-auto">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex-1 min-w-[85px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeCategory === 'all'
                ? 'bg-white text-[#635BFF] shadow-xs'
                : 'text-[#667085] hover:text-[#171923]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" /> All ({benefits.length})
          </button>
          <button
            onClick={() => setActiveCategory('available')}
            className={`flex-1 min-w-[85px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeCategory === 'available'
                ? 'bg-white text-[#635BFF] shadow-xs'
                : 'text-[#667085] hover:text-[#171923]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#635BFF]" /> Available ({availableCount})
          </button>
          <button
            onClick={() => setActiveCategory('claimed')}
            className={`flex-1 min-w-[85px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeCategory === 'claimed'
                ? 'bg-white text-[#635BFF] shadow-xs'
                : 'text-[#667085] hover:text-[#171923]'
            }`}
          >
            <Check className="w-3.5 h-3.5 text-[#12B76A]" /> Claimed ({claimedCount})
          </button>
          <button
            onClick={() => setActiveCategory('locked')}
            className={`flex-1 min-w-[85px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeCategory === 'locked'
                ? 'bg-white text-[#635BFF] shadow-xs'
                : 'text-[#667085] hover:text-[#171923]'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-[#98A2B3]" /> Locked ({lockedCount})
          </button>
        </div>

        {/* Prominent Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reward name, description or points..."
            className="w-full bg-[#F8F9FC] border border-[#E7E9EE] rounded-xl pl-10 pr-8 py-2 text-xs text-[#171923] focus:outline-none focus:ring-2 focus:ring-[#635BFF] focus:bg-white placeholder-[#98A2B3] shadow-2xs transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-[#98A2B3] hover:text-[#171923] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Benefits list Container */}
        <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
          {filteredBenefits.length === 0 ? (
            <div className="text-center py-10 bg-[#F8F9FC] rounded-2xl border border-dashed border-[#E7E9EE] space-y-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-xs text-[#98A2B3]">
                <Gift className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#171923]">No rewards match your search</p>
                <p className="text-[11px] text-[#667085]">Try clearing search or selecting a different status filter.</p>
              </div>
              {(searchTerm || activeCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setActiveCategory('all');
                  }}
                  className="text-xs font-bold text-[#635BFF] hover:underline cursor-pointer"
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            filteredBenefits.map((bState) => {
              const { benefit, state } = bState;
              const isClaimed = state === 'claimed';
              const isAvailable = state === 'available';
              const pointsNeeded = benefit.required_points - totalPoints;

              return (
                <div
                  key={benefit.id}
                  className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                    isClaimed
                      ? 'bg-[#ECFDF3]/40 border-[#12B76A]/30'
                      : isAvailable
                      ? 'bg-[#635BFF]/5 border-[#635BFF]/30 shadow-xs'
                      : 'bg-white border-[#E7E9EE] hover:border-[#635BFF]/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                          isClaimed
                            ? 'bg-gradient-to-br from-[#12B76A] to-[#059669] text-white'
                            : isAvailable
                            ? 'bg-gradient-to-br from-[#635BFF] to-[#4F46E5] text-white'
                            : 'bg-[#F2F4F7] text-[#98A2B3]'
                        }`}
                      >
                        {isClaimed ? (
                          <Check className="w-5 h-5 stroke-[3]" />
                        ) : isAvailable ? (
                          <Gift className="w-5 h-5" />
                        ) : (
                          <Lock className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-xs text-[#171923] truncate">{benefit.name}</h4>
                          <span className="text-[10px] font-extrabold text-[#635BFF] bg-[#635BFF]/10 px-2 py-0.5 rounded-md shrink-0">
                            {benefit.required_points} pts
                          </span>
                        </div>
                        <p className="text-[11px] text-[#667085] mt-0.5 leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 self-center">
                      {isClaimed ? (
                        <span className="text-[10px] font-extrabold text-[#12B76A] bg-[#ECFDF3] border border-[#12B76A]/30 px-3 py-1 rounded-full inline-block shadow-2xs">
                          Claimed ✓
                        </span>
                      ) : isAvailable ? (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onUnlockBenefit(bState);
                          }}
                          className="text-[11px] font-extrabold text-white bg-[#635BFF] hover:bg-[#4F46E5] px-4 py-1.5 rounded-full transition-all shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" /> Claim Reward
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-[#98A2B3] bg-[#F2F4F7] border border-[#E7E9EE] px-3 py-1 rounded-full inline-block">
                          Need {pointsNeeded} more pts
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#E7E9EE] flex items-center justify-between">
          <span className="text-[11px] text-[#667085]">
            Showing <strong className="text-[#171923]">{filteredBenefits.length}</strong> of {benefits.length} rewards
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-[#635BFF] hover:bg-[#4F46E5] text-white rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
