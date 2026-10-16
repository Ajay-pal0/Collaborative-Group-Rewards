import React from 'react';
import { CreditCard, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge, Button } from '../../../components/ui';

interface PanFinancialCardProps {
  isPanVerified: boolean;
  panMasked: string;
  registeredName: string;
  panCategory: string;
  panStatus: string;
  aadhaarLinked: boolean;
  onOpenPanVerification?: () => void;
}

export const PanFinancialCard: React.FC<PanFinancialCardProps> = ({
  isPanVerified,
  panMasked,
  registeredName,
  panCategory,
  panStatus,
  aadhaarLinked,
  onOpenPanVerification,
}) => {
  return (
    <div className="space-y-4">
      {/* Card Header & Verification Status */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isPanVerified ? 'bg-[#ECFDF3]/50 border-[#12B76A]/30' : 'bg-[#FFF9F5] border-[#F79009]/30'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
              isPanVerified ? 'bg-[#12B76A]/10 text-[#12B76A]' : 'bg-[#F79009]/10 text-[#F79009]'
            }`}>
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-[#171923]">PAN Card Summary</h4>
              <p className="text-[11px] text-[#667085]">
                {isPanVerified ? 'Registry Record Active & Verified' : 'PAN Verification Pending'}
              </p>
            </div>
          </div>
          <Badge variant={isPanVerified ? 'success' : 'warning'} size="sm">
            {isPanVerified ? 'Verified' : 'Unverified'}
          </Badge>
        </div>

        {isPanVerified ? (
          <div className="bg-white rounded-xl p-3 border border-[#E7E9EE] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#667085] font-medium">Masked PAN:</span>
              <span className="font-mono font-bold text-[#171923] tracking-wider">{panMasked}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#667085] font-medium">Cardholder Name:</span>
              <span className="font-bold text-[#171923]">{registeredName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#667085] font-medium">Category:</span>
              <span className="font-semibold text-[#171923]">{panCategory}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#667085] font-medium">Registry Status:</span>
              <span className="font-semibold text-[#12B76A] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {panStatus}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-[#E7E9EE]">
              <span className="text-[#667085] font-medium">Aadhaar Seeding:</span>
              <span className={`font-semibold flex items-center gap-1 ${aadhaarLinked ? 'text-[#12B76A]' : 'text-[#F79009]'}`}>
                {aadhaarLinked ? (
                  <><ShieldCheck className="w-3.5 h-3.5" /> Linked</>
                ) : (
                  <><AlertCircle className="w-3.5 h-3.5" /> Pending Link</>
                )}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <p className="text-xs text-[#667085]">
              Verify your PAN to view authenticated government registry status and unlock financial insights.
            </p>
            {onOpenPanVerification && (
              <Button
                variant="primary"
                size="sm"
                onClick={onOpenPanVerification}
                className="w-full"
              >
                Verify PAN Now
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PanFinancialCard;
