'use client';

import { useState, useEffect } from 'react';
import type { CodeFont } from '../fonts';

const EVENT_KEY = 'snipcode-font-change';

export function useCodeFont() {
  const [codeFont, setCodeFont] = useState<CodeFont>('jetbrains');

  useEffect(() => {
    try {
      const savedFont = localStorage.getItem(
        'snipcode-font'
      ) as CodeFont | null;
      if (savedFont) {
        setCodeFont(savedFont);
      }
    } catch (err) {
      console.error('Error reading font from localStorage:', err);
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'snipcode-font' && e.newValue) {
        setCodeFont(e.newValue as CodeFont);
      }
    };

    // Listen to custom event locally across components
    const handleCustom = (e: CustomEvent) => setCodeFont(e.detail);

    window.addEventListener('storage', handleStorage);
    window.addEventListener(EVENT_KEY, handleCustom as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(EVENT_KEY, handleCustom as EventListener);
    };
  }, []);

  const changeCodeFont = (fontId: CodeFont) => {
    try {
      localStorage.setItem('snipcode-font', fontId);
      setCodeFont(fontId);
      // Dispatch globally to sibling components
      window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: fontId }));
    } catch (err) {
      console.error('Error saving font to localStorage:', err);
    }
  };

  return { codeFont, setCodeFont: changeCodeFont };
}
