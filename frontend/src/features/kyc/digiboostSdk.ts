/**
 * Surepass Digiboost Web SDK Wrapper
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

const SDK_CDN_URL = 'https://cdn.jsdelivr.net/gh/surepassio/surepass-digiboost-web-sdk@latest/index.min.js';

let scriptLoadPromise: Promise<void> | null = null;

export function loadDigiboostScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.DigiboostSdk) return Promise.resolve();

  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    // Check if already in DOM
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
 * Mounts the Digiboost SDK button into a container and/or triggers verification popup.
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
