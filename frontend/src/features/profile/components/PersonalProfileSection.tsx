import React, { useState } from 'react';
import type { User } from '../../../types';
import { Card, CardHeader, CardTitle, CardContent, Input, Button, Badge } from '../../../components/ui';
import { User as UserIcon, Mail, Phone, Lock, CheckCircle2 } from 'lucide-react';

import { extractErrorMessage } from '../../../lib/api';

interface PersonalProfileSectionProps {
  user: User | null;
  onUpdateProfile: (data: { name: string; phone?: string }) => Promise<void>;
  loading?: boolean;
}

export const PersonalProfileSection: React.FC<PersonalProfileSectionProps> = ({
  user,
  onUpdateProfile,
  loading = false,
}) => {
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [prevUser, setPrevUser] = useState(user);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [creditAlerts, setCreditAlerts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (user !== prevUser) {
    setPrevUser(user);
    setName(user?.name || '');
    setPhone(user?.phone || '');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await onUpdateProfile({ name, phone });
      setSuccessMsg('Profile preferences updated successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: unknown) {
      setErrorMsg(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border border-[#e7e5e4]">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold text-[#0c0a09] flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-[#0c0a09]" />
            Personal Profile & Preferences
          </CardTitle>
          <p className="text-xs text-[#78716c] mt-0.5">
            Manage your editable contact information and notifications.
          </p>
        </div>
        <Badge variant="neutral" size="xs">
          User-Editable Details
        </Badge>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <p className="text-[#dc2626] text-xs bg-[#fef2f2] border border-[#fecaca] p-3 rounded-xl font-medium animate-fade-in">
              {errorMsg}
            </p>
          )}

          {successMsg && (
            <p className="text-[#065f46] text-xs bg-[#ecfdf5] border border-[#a7f3d0] p-3 rounded-xl font-semibold flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" /> {successMsg}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              id="profile-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rajiv Talwar"
              icon={<UserIcon className="w-4 h-4" />}
              helperText="Editable personal display name"
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#44403c] tracking-wide">
                  Email Address
                </label>
                <span className="text-[10px] text-[#78716c] font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#a8a29e]" /> Non-editable
                </span>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-[#a8a29e] pointer-events-none flex items-center">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-[#f5f5f4] border border-[#e7e5e4] rounded-xl py-2.5 pl-10 pr-3.5 text-sm text-[#78716c] cursor-not-allowed select-none"
                />
              </div>
              <p className="text-[11px] text-[#78716c]">Primary authenticated identity</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Mobile Number"
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              icon={<Phone className="w-4 h-4" />}
              helperText="Used for credit bureau inquiries and SMS rewards"
            />

            <div className="p-3.5 rounded-xl bg-[#fafafa] border border-[#e7e5e4] space-y-2">
              <span className="text-xs font-semibold text-[#0c0a09] block">
                Preferences & Alerts
              </span>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="rounded border-[#d6d3d1] text-[#0c0a09] focus:ring-[#0c0a09]"
                  />
                  <span className="text-[#44403c]">Email notifications for group reward milestones</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={creditAlerts}
                    onChange={(e) => setCreditAlerts(e.target.checked)}
                    className="rounded border-[#d6d3d1] text-[#0c0a09] focus:ring-[#0c0a09]"
                  />
                  <span className="text-[#44403c]">Monthly CIBIL credit score change notifications</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={saving || loading}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PersonalProfileSection;
