import React, { useState } from 'react';
import type { User } from '../../../types';
import { Card, CardHeader, CardTitle, CardContent, Input, Button, Badge } from '../../../components/ui';
import { CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';

import { extractErrorMessage } from '../../../lib/api';
import { maskPan } from '../../../lib/masking';

interface PanVerificationSectionProps {
  user: User | null;
  onVerifyPan: (pan: string) => Promise<void>;
  loading?: boolean;
}

export const PanVerificationSection: React.FC<PanVerificationSectionProps> = ({
  user,
  onVerifyPan,
  loading = false,
}) => {
  const [panInput, setPanInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isVerified = Boolean(user?.pan_verified);
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPan = panInput.trim().toUpperCase();

    if (!panRegex.test(cleanPan)) {
      setErrorMsg('Please enter a valid 10-character PAN number (e.g., ABCDE1234F).');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await onVerifyPan(cleanPan);
      setSuccessMsg('PAN verified successfully with government registry!');
      setPanInput('');
    } catch (err: unknown) {
      setErrorMsg(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className={`border ${isVerified ? 'border-[#a7f3d0] bg-white' : 'border-[#e7e5e4] bg-white'}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold text-[#0c0a09] flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#0c0a09]" />
            Permanent Account Number (PAN)
          </CardTitle>
          <p className="text-xs text-[#78716c] mt-0.5">
            Government tax identity verified directly via NSDL / Income Tax Department.
          </p>
        </div>
        <Badge
          variant={isVerified ? 'success' : 'neutral'}
          size="sm"
          icon={isVerified ? <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" /> : undefined}
        >
          {isVerified ? 'Verified' : 'Not Started'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {isVerified ? (
          <div className="p-4 rounded-xl bg-[#ecfdf5]/60 border border-[#a7f3d0] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[11px] text-[#065f46] font-medium block">Masked PAN</span>
                <span className="font-mono font-bold text-sm text-[#0c0a09] mt-0.5 block">
                  {maskPan(user?.pan_masked)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#065f46] font-medium block">Registered Name</span>
                <span className="font-semibold text-xs text-[#0c0a09] mt-0.5 block">
                  {user?.pan_registered_name || user?.name || 'Verified Taxpayer'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#065f46] font-medium block">Verification Date</span>
                <span className="text-xs text-[#78716c] mt-0.5 block">
                  {user?.pan_verified_at ? new Date(user.pan_verified_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Verified'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#065f46] flex items-center gap-1.5 pt-1 border-t border-[#a7f3d0]/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
              Authentic record confirmed with government PAN registry.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#fafafa] border border-[#e7e5e4] text-xs text-[#57534e]">
              <p>
                Enter your 10-character PAN to verify your identity. Your full PAN number will be masked immediately after verification for data security.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-xs text-[#991b1b] flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#dc2626]" />
                <div>
                  <p className="font-semibold">{errorMsg}</p>
                  <p className="text-[11px] text-[#b91c1c] mt-0.5">Please check the PAN details and try again.</p>
                </div>
              </div>
            )}

            {successMsg && (
              <p className="text-[#065f46] text-xs bg-[#ecfdf5] border border-[#a7f3d0] p-3 rounded-xl font-semibold flex items-center gap-1.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-[#059669]" /> {successMsg}
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-end gap-3">
              <div className="w-full sm:flex-1">
                <Input
                  label="10-Character PAN Number"
                  id="pan-input"
                  type="text"
                  maxLength={10}
                  value={panInput}
                  onChange={(e) => setPanInput(e.target.value.toUpperCase())}
                  placeholder="e.g. ABCDE1234F"
                  className="font-mono uppercase tracking-wider"
                  icon={<CreditCard className="w-4 h-4" />}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={submitting || loading}
                disabled={panInput.trim().length !== 10}
                className="w-full sm:w-auto"
              >
                Verify PAN
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default PanVerificationSection;
