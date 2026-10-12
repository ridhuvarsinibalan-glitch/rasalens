import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../i18n/en.json';
import ta from '../i18n/ta.json';
import hi from '../i18n/hi.json';
import { api } from '../services/api';

const translations = { en, ta, hi };

export const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('rasalens_lang') || 'en';
  });

  const setLanguage = (lang) => {
    if (translations[lang]) {
      setLanguageState(lang);
      localStorage.setItem('rasalens_lang', lang);
    }
  };

  // Helper function to resolve dot-notated keys (e.g. "assistant.title")
  const t = (keyPath, fallback = '') => {
    const keys = keyPath.split('.');

    // Check current language
    let current = translations[language];
    for (const k of keys) {
      if (current && current[k] !== undefined) {
        current = current[k];
      } else {
        current = undefined;
        break;
      }
    }
    if (current !== undefined) return current;

    // Fallback to English
    let fallbackObj = translations.en;
    for (const k of keys) {
      if (fallbackObj && fallbackObj[k] !== undefined) {
        fallbackObj = fallbackObj[k];
      } else {
        fallbackObj = undefined;
        break;
      }
    }
    if (fallbackObj !== undefined) return fallbackObj;

    return fallback || keyPath;
  };

  // Transparent query translator for non-English queries or queries in Tamil/Hindi script
  const translateToEnglish = async (queryText) => {
    if (!queryText) return queryText;
    const hasIndicScript = /[\u0B80-\u0BFF\u0900-\u097F]/.test(queryText);
    if (!hasIndicScript && language === 'en') return queryText;
    try {
      const detectedSrc = hasIndicScript ? (/[\u0B80-\u0BFF]/.test(queryText) ? 'ta' : 'hi') : language;
      const res = await api.translateText(queryText, detectedSrc, 'en');
      return res.translated_text || queryText;
    } catch (err) {
      console.warn('Transparent query translation error, using raw query:', err);
      return queryText;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateToEnglish }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
