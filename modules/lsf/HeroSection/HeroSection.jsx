// modules/lsf/HeroSection/HeroSection.jsx
'use client';

import styles from './HeroSection.module.css';
import Image from 'next/image';
import { Building2, Phone, ArrowLeft, ArrowRight, ThumbsUp } from 'lucide-react';
import { useLsf } from '../context/LsfContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HeroSection({ onScrollToSection }) {
  const { hero, staticData } = useLsf();
  const { dir } = useLanguage();

  const scrollToSection = (sectionId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onScrollToSection) {
      onScrollToSection(sectionId);
    }
  };

  // انتخاب آیکون بر اساس جهت
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <section className={styles.hero} dir={dir}>
      <div className={styles.heroBackground}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroBlob1} />
        <div className={styles.heroBlob2} />
      </div>

      <div className={styles.heroContent}>
        <div>
         
          <h1 className={styles.heroTitle}>
            {hero.title}
            <br />
            <span>{hero.titleSuffix}</span>
          </h1>
          <p className={styles.heroSubtitle}>{hero.subtitle}</p>
          <div className={styles.heroButtons}>
          
            <button 
              type="button"
              onClick={(e) => scrollToSection('consulting', e)} 
              className={styles.heroBtnSecondary}
            >
              {hero.secondaryBtn}
              <Phone size={20} />
            </button>
          </div>
          
        </div>

        <div className={styles.heroImageWrapper}>
          <div className={styles.heroImage}>
            <Image
              src={staticData.heroImage}
              alt={hero.title}
              fill
              className="object-cover"
              priority
            />
            <div className={styles.heroImageOverlay} />
          </div>
          
        </div>
      </div>
    </section>
  );
}