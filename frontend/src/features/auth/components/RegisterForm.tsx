import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '../../../components/ui';

interface RegisterFormProps {
  regName: string;
  setRegName: (val: string) => void;
  regEmail: string;
  setRegEmail: (val: string) => void;
  regPassword: string;
  setRegPassword: (val: string) => void;
  showRegPassword: boolean;
  setShowRegPassword: (val: boolean) => void;
  regErrors: { name?: string; email?: string; password?: string; general?: string };
  setRegErrors: React.Dispatch<React.SetStateAction<{ name?: string; email?: string; password?: string; general?: string }>>;
  regLoading: boolean;
  handleRegister: (e: React.FormEvent) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  regName,
  setRegName,
  regEmail,
  setRegEmail,
  regPassword,
  setRegPassword,
  showRegPassword,
  setShowRegPassword,
  regErrors,
  setRegErrors,
  regLoading,
  handleRegister,
}) => {
  return (
    <form onSubmit={handleRegister} noValidate className="space-y-4">
      {regErrors.general && (
        <p className="text-[#F04438] text-xs bg-[#F04438]/10 p-3 rounded-xl font-semibold">
          {regErrors.general}
        </p>
      )}

      <div>
        <Input
          label="Full Name"
          type="text"
          value={regName}
          onChange={(e) => {
            setRegName(e.target.value);
            setRegErrors((p) => ({ ...p, name: '' }));
          }}
          placeholder="Ajay Pal"
          maxLength={255}
          error={regErrors.name}
        />
      </div>

      <div>
        <Input
          label="Email"
          type="email"
          value={regEmail}
          onChange={(e) => {
            setRegEmail(e.target.value);
            setRegErrors((p) => ({ ...p, email: '' }));
          }}
          placeholder="ajay.pal@example.com"
          error={regErrors.email}
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-[#667085] uppercase tracking-wider mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            type={showRegPassword ? 'text' : 'password'}
            value={regPassword}
            onChange={(e) => {
              setRegPassword(e.target.value);
              setRegErrors((p) => ({ ...p, password: '' }));
            }}
            placeholder="Min. 6 characters"
            className={`w-full bg-[#F8F9FC] border rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-[#171923] focus:outline-none focus:ring-2 focus:ring-[#635BFF] ${
              regErrors.password ? 'border-[#F04438]' : 'border-[#E7E9EE]'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowRegPassword(!showRegPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#171923] transition-colors cursor-pointer p-1"
            aria-label={showRegPassword ? 'Hide password' : 'Show password'}
          >
            {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {regErrors.password && (
          <p className="text-[#F04438] text-xs mt-1 font-medium">{regErrors.password}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        loading={regLoading}
        disabled={regLoading}
        className="w-full"
      >
        Create Account
      </Button>
    </form>
  );
};

export default RegisterForm;
