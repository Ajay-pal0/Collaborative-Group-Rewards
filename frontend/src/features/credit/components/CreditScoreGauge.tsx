import React from 'react';
import { Award, TrendingUp } from 'lucide-react';
import { Badge } from '../../../components/ui';

interface CreditScoreGaugeProps {
  score: number | null | undefined;
  scoreBand?: string | null;
  fetchedAt?: string | null;
  onFetchScore?: () => void;
  loading?: boolean;
  status?: string | null;
  statusMessage?: string | null;
}

export const CreditScoreGauge: React.FC<CreditScoreGaugeProps> = ({
  score,
  scoreBand,
  fetchedAt,
  onFetchScore,
  loading = false,
  status,
  statusMessage,
}) => {
  if (!score) {
    const isUnprovisioned = status === 'PENDING_PROVIDER_ACCESS';
    return (
      <div className="bg-[#fafafa] border border-[#e7e5e4] rounded-2xl p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-white border border-[#e7e5e4] shadow-xs flex items-center justify-center mx-auto text-[#78716c]">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-semibold text-sm text-[#0c0a09]">
            {isUnprovisioned ? 'Bureau Access Notice' : 'No CIBIL Score Fetched'}
          </h4>
          <p className="text-xs text-[#78716c] max-w-xs mx-auto mt-1">
            {statusMessage ||
              'Provide affirmative consent to securely query your official bureau credit score.'}
          </p>
        </div>
        {onFetchScore && (
          <button
            onClick={onFetchScore}
            disabled={loading}
            className="btn-primary text-xs px-4 py-2"
          >
            {loading ? 'Fetching...' : isUnprovisioned ? 'Retry CIBIL Score' : 'Query CIBIL Score'}
          </button>
        )}
      </div>
    );
  }

  // Calculate score position (300 - 900 range)
  const clampedScore = Math.min(900, Math.max(300, score));
  const scorePct = Math.round(((clampedScore - 300) / 600) * 100);

  // Approved CIBIL range definitions
  let badgeVariant: 'success' | 'warning' | 'error' | 'neutral' | 'accent';
  let bandLabel: string;

  if (clampedScore >= 800) {
    badgeVariant = 'success';
    bandLabel = scoreBand || 'Excellent';
  } else if (clampedScore >= 750) {
    badgeVariant = 'success';
    bandLabel = scoreBand || 'Very Good';
  } else if (clampedScore >= 650) {
    badgeVariant = 'neutral';
    bandLabel = scoreBand || 'Good';
  } else if (clampedScore >= 550) {
    badgeVariant = 'warning';
    bandLabel = scoreBand || 'Fair';
  } else {
    badgeVariant = 'error';
    bandLabel = scoreBand || 'Poor';
  }

  return (
    <div className="bg-white border border-[#e7e5e4] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#f5f5f4] flex items-center justify-center text-[#0c0a09]">
            <Award className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-[#44403c]">
            Official CIBIL Credit Score
          </span>
        </div>
        <Badge variant={badgeVariant} size="sm">
          {bandLabel}
        </Badge>
      </div>

      <div className="flex items-baseline justify-center gap-2 pt-2">
        <span className="text-4xl sm:text-5xl font-black tracking-tight text-[#0c0a09]">
          {clampedScore}
        </span>
        <span className="text-xs font-medium text-[#78716c]">/ 900</span>
      </div>

      {/* Progress Bar Meter */}
      <div className="space-y-1.5 pt-1">
        <div className="w-full bg-[#e7e5e4] h-2.5 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#dc2626] via-[#d97706] to-[#059669] transition-all duration-700 ease-out"
            style={{ width: `${scorePct}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-medium text-[#78716c] px-0.5">
          <span>300 (Poor)</span>
          <span>550 (Fair)</span>
          <span>650 (Good)</span>
          <span>750+ (Very Good / Excellent)</span>
        </div>
      </div>

      {fetchedAt && (
        <p className="text-[11px] text-[#78716c] text-center pt-2 border-t border-[#f0efed]">
          Retrieved on {new Date(fetchedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  );
};

export default CreditScoreGauge;
