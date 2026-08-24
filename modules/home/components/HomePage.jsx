'use client'

import React from 'react'
import HeroSection from './sections/HeroSection'
import CTASection from './sections/CTASection'
import NewsSection from './sections/NewsSection'
import BrandSection from './sections/BrandSection'
import SliderSection from './sections/SliderSection'
import ProlineSection from './sections/ProlineSection'
import CertificatesCarousel from './sections/CertificatesCarousel'
import VideoArchiveSection from '@/components/Story/VideoArchiveSection'
import styles from '../styles/HomePage.module.css'

const HomePage = () => {
  return (
    <div className={styles.homeContainer}>
      {/* ✅ h2 مخفی برای سئو - تکمیل کننده h1 در page.jsx */}
      <h2 className="sr-only">
        خدمات و پروژه‌های هلدینگ آریا استاد در زمینه سازه‌های سبک فولادی ال اس اف
      </h2>
      
      <HeroSection />
      <VideoArchiveSection />
      <NewsSection />
      <BrandSection />
      <ProlineSection />
      <CertificatesCarousel />
      <SliderSection />
      <CTASection />
    </div>
  )
}

export default HomePage