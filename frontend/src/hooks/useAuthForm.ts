import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { authApi, panApi, kycApi } from '../services/apiServices';
import { extractErrorMessage } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { AuthResponse } from '../types';
import { preOpenAuthWindow, openDigilockerInNewTab } from '../features/kyc/digiboostSdk';
import { maskPan } from '../lib/masking';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useAuthForm() {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login, updateUser, user } = useAuth();

  // Register state
  const [registerStep, setRegisterStep] = useState<'credentials' | 'optional_pan'>('credentials');
  const [signupVerificationTab, setSignupVerificationTab] = useState<'pan' | 'aadhaar'>('pan');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const [regLoading, setRegLoading] = useState(false);

  // PAN verification during signup state
  const [signupPan, setSignupPan] = useState('');
  const [panLoading, setPanLoading] = useState(false);
  const [panError, setPanError] = useState('');
  const [panSuccess, setPanSuccess] = useState(false);
  const [panVerifiedData, setPanVerifiedData] = useState<{
    pan_masked: string;
    name: string;
  } | null>(null);

  // Aadhaar verification during signup state
  const [aadhaarLoading, setAadhaarLoading] = useState(false);
  const [aadhaarError, setAadhaarError] = useState('');
  const [aadhaarConsent, setAadhaarConsent] = useState(false);
  const [aadhaarSuccess, setAadhaarSuccess] = useState(false);
  const [aadhaarVerifiedData, setAadhaarVerifiedData] = useState<{
    aadhaar_masked: string;
    name: string;
  } | null>(null);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginFieldErrors, setLoginFieldErrors] = useState<Record<string, string>>({});

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotResetUrl, setForgotResetUrl] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const redirect = params.get('redirect') || '/groups';

  function validateRegister() {
    const errs: Record<string, string> = {};
    if (!regName.trim()) errs.name = 'Name is required.';
    else if (regName.length > 255) errs.name = 'Name must be at most 255 characters.';
    if (!EMAIL_RE.test(regEmail)) errs.email = 'Enter a valid email address.';
    if (regPassword.length < 6) errs.password = 'Password must be at least 6 characters.';
    return errs;
  }

  function validateLogin() {
    const errs: Record<string, string> = {};
    if (!loginEmail.trim()) errs.email = 'Email is required.';
    else if (!EMAIL_RE.test(loginEmail)) errs.email = 'Enter a valid email address.';
    if (!loginPassword) errs.password = 'Password is required.';
    return errs;
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateRegister();
    if (Object.keys(errs).length) {
      setRegErrors(errs);
      return;
    }
    setRegLoading(true);
    try {
      const res = await authApi.register({
        name: regName,
        email: regEmail,
        password: regPassword,
      });
      const data = res.data as unknown as AuthResponse;
      login(data.user, data.tokens);
      setRegisterStep('optional_pan');
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as Record<string, unknown>;
        const fieldErrs: Record<string, string> = {};
        Object.entries(data).forEach(([k, v]) => {
          fieldErrs[k] = Array.isArray(v) ? v.join(' ') : String(v);
        });
        setRegErrors(fieldErrs);
      } else {
        setRegErrors({ general: extractErrorMessage(err) });
      }
    } finally {
      setRegLoading(false);
    }
  }

  async function handleVerifySignupPan(e: React.FormEvent) {
    e.preventDefault();
    setPanError('');
    const cleanPan = signupPan.trim().toUpperCase();
    if (!cleanPan) {
      setPanError('Please enter your PAN number.');
      return;
    }
    const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!PAN_RE.test(cleanPan)) {
      setPanError('Invalid PAN format. Format must be 5 letters, 4 digits, 1 letter (e.g. ABCDE1234A).');
      return;
    }

    setPanLoading(true);
    try {
      const res = await panApi.verifyPan({ pan: cleanPan });
      if (res.data.success) {
        setPanSuccess(true);
        const rawMasked =
          res.data.data?.masked_id ||
          res.data.data?.pan_masked;
        const masked = maskPan(rawMasked || cleanPan);
        const regName =
          res.data.data?.registered_name ||
          res.data.data?.name ||
          user?.name ||
          'Verified Citizen';
        const verifiedAt = res.data.data?.verified_at;

        setPanVerifiedData({
          pan_masked: masked,
          name: regName,
        });
        if (user) {
          updateUser({
            ...user,
            pan_verified: true,
            pan_masked: masked,
            pan_registered_name: regName,
            pan_verified_at: verifiedAt || undefined,
          });
        }
      } else {
        setPanError(res.data.error || res.data.message || 'PAN verification failed.');
      }
    } catch (err: unknown) {
      setPanError(extractErrorMessage(err));
    } finally {
      setPanLoading(false);
    }
  }

  async function handleVerifySignupAadhaar() {
    setAadhaarError('');
    if (!aadhaarConsent) {
      setAadhaarError('Please provide consent to proceed with Aadhaar verification.');
      return;
    }

    const preOpenedTab = preOpenAuthWindow();
    setAadhaarLoading(true);

    try {
      const callbackUrl = window.location.origin + '/kyc/callback';
      const res = await kycApi.initiateAadhaar({
        consent: true,
        redirect_url: callbackUrl,
      });

      if (!res.data.success) {
        if (preOpenedTab && !preOpenedTab.closed) preOpenedTab.close();
        setAadhaarError(res.data.error || 'Failed to initiate DigiLocker verification.');
        setAadhaarLoading(false);
        return;
      }

      const clientId = res.data.client_id;
      const sdkToken = res.data.token;
      const authUrl = res.data.authorization_url;

      const confirmVerification = async (): Promise<boolean> => {
        try {
          const verifyRes = await kycApi.verifyAadhaar({ client_id: clientId });
          if (verifyRes.data.success && verifyRes.data.status === 'verified') {
            setAadhaarSuccess(true);
            setAadhaarVerifiedData({
              aadhaar_masked: verifyRes.data.data?.masked_id || 'XXXXXXXX1234',
              name: verifyRes.data.data?.registered_name || user?.name || 'Verified Citizen',
            });
            if (user) {
              updateUser({
                ...user,
                aadhaar_verified: true,
                aadhaar_masked: verifyRes.data.data?.masked_id || 'XXXXXXXX1234',
                aadhaar_registered_name: verifyRes.data.data?.registered_name || user.name,
                aadhaar_verified_at: new Date().toISOString(),
              });
            }
            setAadhaarLoading(false);
            return true;
          }
          return false;
        } catch {
          return false;
        }
      };

      if (sdkToken && !sdkToken.startsWith('mock_')) {
        let isDone = false;
        let pollTimer: ReturnType<typeof setInterval> | null = null;

        const stopPolling = () => {
          if (pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null;
          }
        };

        const { authWindow, cleanup } = openDigilockerInNewTab({
          authorizationUrl: authUrl,
          token: sdkToken,
          gateway: 'sandbox',
          windowRef: preOpenedTab,
          onSuccess: async () => {
            if (isDone) return;
            isDone = true;
            stopPolling();
            cleanup();
            await confirmVerification();
          },
          onFailure: async (failReason) => {
            if (isDone) return;
            const ok = await confirmVerification();
            if (!ok) {
              isDone = true;
              stopPolling();
              cleanup();
              setAadhaarError(typeof failReason === 'string' ? failReason : 'DigiLocker verification was cancelled or closed.');
              setAadhaarLoading(false);
            }
          },
        });

        // Background auto-polling (only succeeds when status === 'verified')
        let polls = 0;
        pollTimer = setInterval(async () => {
          polls++;
          if (polls > 100 || isDone) {
            stopPolling();
            if (!isDone) setAadhaarLoading(false);
            return;
          }
          const ok = await confirmVerification();
          if (ok) {
            isDone = true;
            stopPolling();
            cleanup();
            if (authWindow && !authWindow.closed) {
              try {
                authWindow.close();
              } catch {
                // ignore
              }
            }
          }
        }, 4000);
      } else {
        if (preOpenedTab && !preOpenedTab.closed) preOpenedTab.close();
        await confirmVerification();
      }
    } catch (err: unknown) {
      if (preOpenedTab && !preOpenedTab.closed) preOpenedTab.close();
      setAadhaarError(extractErrorMessage(err));
      setAadhaarLoading(false);
    }
  }

  function handleSkipSignupPan() {
    navigate(redirect, { replace: true });
  }

  function handleCompleteSignup() {
    navigate(redirect, { replace: true });
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    const errs = validateLogin();
    if (Object.keys(errs).length) {
      setLoginFieldErrors(errs);
      return;
    }
    setLoginFieldErrors({});
    setLoginLoading(true);
    try {
      const res = await authApi.login({
        email: loginEmail,
        password: loginPassword,
      });
      const data = res.data as unknown as AuthResponse;
      login(data.user, data.tokens);
      navigate(redirect, { replace: true });
    } catch {
      setLoginError('Invalid email or password.');
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotResetUrl('');
    const cleanEmail = forgotEmail.trim();
    if (!cleanEmail) {
      setForgotError('Email address is required.');
      return;
    }
    if (!EMAIL_RE.test(cleanEmail)) {
      setForgotError('Enter a valid email address.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await authApi.forgotPassword({ email: cleanEmail });
      setForgotSuccess(
        res.data.message || 'If an account exists for this email, a password reset link has been sent.'
      );
      if (res.data.reset_url) {
        setForgotResetUrl(res.data.reset_url);
      }
    } catch (err: unknown) {
      setForgotError(extractErrorMessage(err));
    } finally {
      setForgotLoading(false);
    }
  }

  function handleBackToLogin() {
    setMode('login');
    setForgotError('');
    setForgotSuccess('');
    setForgotResetUrl('');
  }

  return {
    mode,
    setMode,
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
    registerStep,
    setRegisterStep,
    signupPan,
    setSignupPan,
    panLoading,
    panError,
    setPanError,
    panSuccess,
    panVerifiedData,
    handleVerifySignupPan,
    handleSkipSignupPan,
    handleCompleteSignup,
    signupVerificationTab,
    setSignupVerificationTab,
    aadhaarLoading,
    aadhaarError,
    setAadhaarError,
    aadhaarConsent,
    setAadhaarConsent,
    aadhaarSuccess,
    aadhaarVerifiedData,
    handleVerifySignupAadhaar,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    showLoginPassword,
    setShowLoginPassword,
    loginError,
    loginLoading,
    loginFieldErrors,
    setLoginFieldErrors,
    handleLogin,
    forgotEmail,
    setForgotEmail,
    forgotError,
    setForgotError,
    forgotSuccess,
    setForgotSuccess,
    forgotResetUrl,
    forgotLoading,
    handleForgotPassword,
    handleBackToLogin,
    navigate,
  };
}
