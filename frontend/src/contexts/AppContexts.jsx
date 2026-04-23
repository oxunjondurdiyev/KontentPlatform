import React, { createContext, useContext, useEffect, useState } from 'react';
import { getTranslation } from '../i18n/translations';

const ThemeContext = createContext({});
const LanguageContext = createContext({});
const ColorContext = createContext({});
export const useTheme = () => useContext(ThemeContext);
export const useLanguage = () => useContext(LanguageContext);
export const useColor = () => useContext(ColorContext);

const COLOR_DATA = {
  blue:    { main:'#2563eb', light:'#3b82f6', css:'37 99 235' },
  violet:  { main:'#7c3aed', light:'#8b5cf6', css:'124 58 237' },
  emerald: { main:'#059669', light:'#10b981', css:'5 150 105' },
  rose:    { main:'#e11d48', light:'#f43f5e', css:'225 29 72' },
  amber:   { main:'#d97706', light:'#f59e0b', css:'217 119 6' },
};

export function ColorProvider({ children }) {
  const [color, setColor] = useState(() => localStorage.getItem('kb_color') || 'blue');
  useEffect(() => {
    localStorage.setItem('kb_color', color);
    document.documentElement.setAttribute('data-color', color);
    const c = COLOR_DATA[color] || COLOR_DATA.blue;
    document.documentElement.style.setProperty('--acc-main', c.main);
    document.documentElement.style.setProperty('--acc-light', c.light);
    document.documentElement.style.setProperty('--acc-css', c.css);
  }, [color]);
  const colors = COLOR_DATA[color] || COLOR_DATA.blue;
  return (
    <ColorContext.Provider value={{ color, setColor, colors }}>
      {children}
    </ColorContext.Provider>
  );
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('kb_theme') || 'system');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const apply = (dark) => {
      document.documentElement.classList.toggle('dark', dark);
      setTheme(dark ? 'dark' : 'light');
    };
    localStorage.setItem('kb_theme', mode);
    if (mode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mq.matches);
      const h = (e) => apply(e.matches);
      mq.addEventListener('change', h);
      return () => mq.removeEventListener('change', h);
    } else {
      apply(mode === 'dark');
    }
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('kb_lang') || 'uz');
  useEffect(() => {
    localStorage.setItem('kb_lang', language);
    document.documentElement.lang = language;
  }, [language]);
  const t = (key) => getTranslation(language, key);
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
