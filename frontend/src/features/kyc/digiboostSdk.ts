/**
 * Surepass Digiboost Web SDK Wrapper & Direct New Tab Verification Manager
 * Official SDK: https://github.com/surepassio/surepass-digiboost-web-sdk
 */

declare global {
  interface Window {
    DigiboostSdk?: (config: DigiboostSdkConfig) => DigiboostSdkReturn;
  }
}

export interface DigiboostSdkConfig {
  gateway: 'sandbox' | 'production';
  token: string;
  selector?: string;
  style?: Record<string, string>;
  title?: string;
  onSuccess?: (data: unknown) => void;
  onFailure?: (error: unknown) => void;
}

export interface DigiboostSdkReturn {
  cleanup: () => void;
  getPopupWindow: () => Window | null;
  isProcessing: () => boolean;
}

export interface LaunchDigiboostOptions {
  token: string;
  gateway?: 'sandbox' | 'production';
  containerId?: string;
  onSuccess: (data: unknown) => void;
  onFailure: (error: unknown) => void;
  buttonTitle?: string;
}

export interface OpenDigilockerWindowOptions {
  authorizationUrl?: string;
  token?: string;
  gateway?: 'sandbox' | 'production';
  windowRef?: Window | null;
  onSuccess?: (data: unknown) => void;
  onFailure?: (error: unknown) => void;
}

const SDK_CDN_URL = 'https://cdn.jsdelivr.net/gh/surepassio/surepass-digiboost-web-sdk@latest/index.min.js';

let scriptLoadPromise: Promise<void> | null = null;

export function loadDigiboostScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.DigiboostSdk) return Promise.resolve();

  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SDK_CDN_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', (e) => reject(e));
      return;
    }

    const script = document.createElement('script');
    script.src = SDK_CDN_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

/**
 * Builds the direct Digiboost DigiLocker URL with the current window origin
 */
export function buildDigiboostUrl(options: {
  token: string;
  gateway?: 'sandbox' | 'production';
  origin?: string;
}): string {
  const gw = options.gateway || 'sandbox';
  const org = encodeURIComponent(options.origin || (typeof window !== 'undefined' ? window.location.origin : ''));
  return `https://digilocker-sdk.notbot.in/?gateway=${gw}&type=digilocker&token=${options.token}&auth_type=web&origin=${org}`;
}

/**
 * Pre-opens a blank window in a synchronous user click handler to avoid browser popup blockers.
 */
export function preOpenAuthWindow(): Window | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.open('about:blank', '_blank');
  } catch (e) {
    console.warn('[DigiboostSDK] Unable to pre-open window:', e);
    return null;
  }
}

/**
 * Opens DigiLocker verification in a new tab / window and listens for postMessage completion.
 */
export function openDigilockerInNewTab(options: OpenDigilockerWindowOptions): {
  authWindow: Window | null;
  cleanup: () => void;
} {
  let targetUrl = options.authorizationUrl;
  if (!targetUrl && options.token) {
    targetUrl = buildDigiboostUrl({ token: options.token, gateway: options.gateway });
  }

  if (!targetUrl) {
    throw new Error('Either authorizationUrl or token is required to open DigiLocker window.');
  }

  // Ensure origin is in the query params so digilocker-sdk.notbot.in knows where to postMessage
  if (typeof window !== 'undefined' && !targetUrl.includes('origin=')) {
    const org = encodeURIComponent(window.location.origin);
    const delim = targetUrl.includes('?') ? '&' : '?';
    targetUrl = `${targetUrl}${delim}origin=${org}`;
  }

  let authWindow = options.windowRef || null;
  if (authWindow && !authWindow.closed) {
    try {
      authWindow.location.href = targetUrl;
    } catch {
      authWindow = window.open(targetUrl, '_blank');
    }
  } else if (typeof window !== 'undefined') {
    authWindow = window.open(targetUrl, '_blank');
  }

  let isCompleted = false;
  let checkInterval: ReturnType<typeof setInterval> | null = null;

  const cleanup = () => {
    isCompleted = true;
    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('message', handleMessage);
    }
  };

  const handleMessage = (event: MessageEvent) => {
    const { type, data } = event.data || {};
    if (type === 'digilocker:complete') {
      cleanup();
      options.onSuccess?.(data);
    } else if (type === 'digilocker:failed') {
      cleanup();
      options.onFailure?.(data || 'DigiLocker verification failed or was cancelled.');
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('message', handleMessage);
  }

  // Periodically check if window was closed before completion
  if (authWindow) {
    checkInterval = setInterval(() => {
      if (!authWindow || authWindow.closed) {
        if (checkInterval) clearInterval(checkInterval);
        checkInterval = null;
        if (!isCompleted) {
          // Allow small delay in case postMessage arrives right as window closes
          setTimeout(() => {
            if (!isCompleted) {
              isCompleted = true;
              options.onFailure?.('Verification window was closed.');
            }
          }, 1500);
        }
      }
    }, 500);
  }

  return { authWindow, cleanup };
}

/**
 * Mounts the official Digiboost SDK button into a container and/or triggers verification popup.
 */
export async function mountDigiboostSdk(options: LaunchDigiboostOptions): Promise<DigiboostSdkReturn | null> {
  await loadDigiboostScript();

  if (!window.DigiboostSdk) {
    throw new Error('Digiboost Web SDK could not be loaded from CDN.');
  }

  const containerSelector = options.containerId ? `#${options.containerId}` : undefined;

  const instance = window.DigiboostSdk({
    gateway: options.gateway || 'sandbox',
    token: options.token,
    selector: containerSelector,
    title: options.buttonTitle || 'Verify Aadhaar with DigiLocker',
    onSuccess: (data) => {
      options.onSuccess(data);
    },
    onFailure: (err) => {
      options.onFailure(err);
    },
  });

  return instance;
}
