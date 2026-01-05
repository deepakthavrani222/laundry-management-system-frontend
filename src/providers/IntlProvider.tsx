'use client';

import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { ReactNode, useEffect, useState } from 'react';
import { Locale, defaultLocale, locales } from '@/i18n/config';

interface IntlProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
  initialMessages?: AbstractIntlMessages;
}

export function IntlProvider({ children, initialLocale, initialMessages }: IntlProviderProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale || defaultLocale);
  const [messages, setMessages] = useState<AbstractIntlMessages | undefined>(initialMessages);

  // Load messages on mount and when locale changes
  useEffect(() => {
    const loadMessages = async () => {
      // Get locale from cookie or localStorage
      const savedLocale = getCookie('NEXT_LOCALE') || localStorage.getItem('landing_language');
      const validLocale = locales.includes(savedLocale as Locale) ? (savedLocale as Locale) : defaultLocale;
      
      if (validLocale !== locale || !messages) {
        const newMessages = (await import(`../../messages/${validLocale}.json`)).default;
        setLocale(validLocale);
        setMessages(newMessages);
      }
    };

    loadMessages();
  }, []);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = async (e: CustomEvent<{ language: Locale }>) => {
      const newLocale = e.detail.language;
      if (locales.includes(newLocale)) {
        const newMessages = (await import(`../../messages/${newLocale}.json`)).default;
        setLocale(newLocale);
        setMessages(newMessages);
        // Set cookie for server-side
        setCookie('NEXT_LOCALE', newLocale, 365);
      }
    };

    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    return () => window.removeEventListener('languageChange', handleLanguageChange as EventListener);
  }, []);

  if (!messages) {
    return <>{children}</>;
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Kolkata">
      {children}
    </NextIntlClientProvider>
  );
}

// Cookie helpers
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

// Export hook for changing language
export function useChangeLocale() {
  const changeLocale = (newLocale: Locale) => {
    setCookie('NEXT_LOCALE', newLocale, 365);
    localStorage.setItem('landing_language', newLocale);
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: newLocale } }));
  };

  return { changeLocale };
}
