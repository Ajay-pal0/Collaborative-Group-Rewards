import React from 'react';
import { Award, TrendingUp } from 'lucide-react';
import { Badge } from '../../../components/ui';

interface CreditScoreGaugeProps {
  score: number | null | undefined;
  scoreBand?: string | null;
  fetchedAt?: string | null;
}

export const CreditScoreGauge: React.FC<CreditScoreGaugeProps> = ({
  score,
  scoreBand,
  fetchedAt,
}) => {
  if (!score) {
    return (
      <div className="bg-[#F8F9FC] border border-[#E7E9EE] rounded-2xl p-6 text-center space-y-2">
        <TrendingUp className="w-8 h-8 text-[#98A2B3] mx-auto" />
        <h4 className="font-extrabold text-sm text-[#171923]">No Credit Score On File</h4>
        <p className="text-xs text-[#667085] max-w-xs mx-auto">
          Consent is required to query your authorized credit bureau score.
        </p>
      </div>
    );
  }

  // Calculate score position (300 - 900 range)
  const clampedScore = Math.min(900, Math.max(300, score));
  const scorePct = Math.round(((clampedScore - 300) / 600) * 100);

  // Determine band badge
  let badgeVariant: 'success' | 'warning' | 'primary' | 'error';
  let bandLabel: string;

  if (clampedScore >= 750) {
    badgeVariant = 'success';
    bandLabel = scoreBand || 'Excellent';
  } else if (clampedScore >= 700) {
    badgeVariant = 'primary';
    bandLabel = scoreBand || 'Good';
  } else if (clampedScore >= 650) {
    badgeVariant = 'warning';
    bandLabel = scoreBand || 'Fair';
  } else {
    badgeVariant = 'error';
    bandLabel = scoreBand || 'Needs Attention';
  }

  return (
    <div className="bg-gradient-to-br from-white to-[#F8F9FC] border border-[#E7E9EE] rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#635BFF]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
            Bureau Credit Score
          </span>
        </div>
        <Badge variant={badgeVariant} size="sm">
          {bandLabel}
        </Badge>
      </div>

      <div className="flex items-baseline justify-center gap-2 pt-2">
        <span className="text-4xl sm:text-5xl font-black tracking-tight text-[#171923]">
          {clampedScore}
        </span>
        <span className="text-xs font-semibold text-[#98A2B3]">/ 900</span>
      </div>

      {/* Progress Bar Meter */}
      <div className="space-y-1.5 pt-1">
        <div className="w-full bg-[#E7E9EE] h-3 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#F04438] via-[#F5B942] to-[#12B76A] transition-all duration-700 ease-out"
            style={{ width: `${scorePct}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-bold text-[#98A2B3] px-1">
          <span>300 (Poor)</span>
          <span>650 (Fair)</span>
          <span>750+ (Excellent)</span>
        </div>
      </div>

      {fetchedAt && (
        <p className="text-[10px] text-[#98A2B3] text-center pt-1 border-t border-[#E7E9EE]">
          Last fetched on {new Date(fetchedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      )}
    </div>
  );
};

export default CreditScoreGauge;
