// modules/lsf/context/LsfContext.jsx
'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LSF_TRANSLATIONS, LSF_STATIC_DATA } from './LsfData';

const LsfContext = createContext();

export const useLsf = () => {
  const context = useContext(LsfContext);
  if (!context) {
    throw new Error('useLsf must be used within LsfProvider');
  }
  return context;
};

export const LsfProvider = ({ children }) => {
  const { language } = useLanguage();

  const t = useMemo(() => {
    return language === 'fa' ? LSF_TRANSLATIONS.fa : LSF_TRANSLATIONS.en;
  }, [language]);

  const getTranslation = (path) => {
    const keys = path.split('.');
    let result = t;
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        console.warn(`Translation key not found: ${path}`);
        return path;
      }
    }
    return result;
  };

  const value = {
    language,
    t,
    getTranslation,
    staticData: LSF_STATIC_DATA,

    hero: t.hero,
    stats: t.stats,

    products: {
      ...t.products.section,
      items: t.products.items.map((item) => ({
        ...item,
        image: LSF_STATIC_DATA.productImages[item.id],
      })),
      btn: t.products.btn,
    },

    factories: {
      ...t.factories.section,
      items: t.factories.items.map((item) => ({
        ...item,
        image: LSF_STATIC_DATA.factoryImages[item.id],
      })),
      capacityLabel: t.factories.capacityLabel,
      employeesLabel: t.factories.employeesLabel,
    },

    timeline: {
      ...t.timeline.section,
      items: t.timeline.items,
    },

    advantages: {
      ...t.advantages.section,
      items: t.advantages.items,
    },

    faq: {
      ...t.faq.section,
      items: t.faq.items,
    },

    contact: t.contact,
  };

  return (
    <LsfContext.Provider value={value}>
      {children}
    </LsfContext.Provider>
  );
};