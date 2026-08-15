import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { authApi } from '../services/apiServices';
import { extractErrorMessage } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { AuthResponse } from '../types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useAuthForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login } = useAuth();

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const [regLoading, setRegLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginFieldErrors, setLoginFieldErrors] = useState<Record<string, string>>({});

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
      navigate(redirect, { replace: true });
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
    navigate,
  };
}
