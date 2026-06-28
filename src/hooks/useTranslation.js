import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import en from '../locales/en.json';
import ru from '../locales/ru.json';
import { selectLocale } from '../redux/uiSlice.js';

const translations = {
  en,
  ru,
};

export const useTranslation = () => {
  const locale = useSelector(selectLocale);

  const t = useMemo(() => {
    const translation = translations[locale] || en;
    return (key, variables) => {
      const value = key.split('.').reduce((section, pathPart) => section?.[pathPart], translation);
      if (!value || typeof value !== 'string') {
        return key;
      }
      if (!variables) return value;
      return Object.entries(variables).reduce((result, [name, content]) => result.replace(new RegExp(`\\{${name}\\}`, 'g'), String(content)), value);
    };
  }, [locale]);

  return { t, locale };
};
