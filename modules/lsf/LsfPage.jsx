// modules/lsf/LsfPage.jsx
'use client';

import styles from './LsfPage.module.css';
import { LsfProvider } from './context/LsfContext';
import { useLanguage } from '@/contexts/LanguageContext';
import HeroSection from './HeroSection/HeroSection';
import StatsSection from './StatsSection/StatsSection';
import ProductsSection from './ProductsSection/ProductsSection';
import FactoriesSection from './FactoriesSection/FactoriesSection';
import TimelineSection from './TimelineSection/TimelineSection';
import AdvantagesSection from './AdvantagesSection/AdvantagesSection';
import FaqSection from './FaqSection/FaqSection';
import ContactSection from './ContactSection/ContactSection';

// ============================================
// کامپوننت داخلی برای دسترسی به language
// ============================================
function LsfContent() {
  const { dir, language } = useLanguage();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={styles.lsfPage} dir={dir}>
      <HeroSection onScrollToSection={scrollToSection} />
      <StatsSection />
     
      <FactoriesSection />
      <TimelineSection />
      <AdvantagesSection />
      <FaqSection />
      <ContactSection />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": language === 'fa' ? "سازه‌های ال اس اف (LSF)" : "LSF Structures",
            "description": language === 'fa' 
              ? "اجرای تخصصی سازه‌های سبک فولادی LSF" 
              : "Specialized execution of LSF lightweight steel structures",
            "provider": {
              "@type": "Organization",
              "name": "آریا استاد هلدینگ",
              "url": "https://ariastudholding.com"
            }
          })
        }}
      />
    </div>
  );
}

// ============================================
// کامپوننت اصلی با Provider
// ============================================
export default function LsfPage() {
  return (
    <LsfProvider>
      <LsfContent />
    </LsfProvider>
  );
}