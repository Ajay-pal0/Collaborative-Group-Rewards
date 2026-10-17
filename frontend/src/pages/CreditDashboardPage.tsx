import { useNavigate } from 'react-router-dom';
import { PageHeader, Button } from '../components/ui';
import { CreditDashboardView } from '../features/credit/components/CreditDashboardView';
import { ArrowLeft, User as UserIcon } from 'lucide-react';

export default function CreditDashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#0c0a09]">
      {/* Top Application Header */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-[#e7e5e4] px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/groups')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Dashboard
          </Button>
          <span className="text-sm font-semibold text-[#0c0a09]">
            CIBIL Credit Intelligence
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/profile')}
            icon={<UserIcon className="w-4 h-4" />}
          >
            Profile & KYC
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <PageHeader
          title="TransUnion CIBIL Credit Dashboard"
          description="Informed consent-backed bureau intelligence. View official credit score, active loan lines, high-credit limits, and monthly repayment compliance."
          breadcrumbs={[
            { label: 'Dashboard', href: '/groups' },
            { label: 'Credit Dashboard' },
          ]}
        />

        <CreditDashboardView onOpenPanVerification={() => navigate('/profile')} />
      </main>
    </div>
  );
}
