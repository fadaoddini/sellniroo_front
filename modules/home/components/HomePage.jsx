'use client'

import React from 'react'
import CTASection from './sections/CTASection'
import AllBoxItem from '@/components/AllBoxItem/AllBoxItem'

import VideoArchiveSection from '@/components/Story/VideoArchiveSection'
import styles from '../styles/HomePage.module.css'
import NewsSection from './sections/news/NewsSection'

const HomePage = () => {
  return (
    <div className={styles.homeContainer}>
      {/* ✅ h2 مخفی برای سئو - تکمیل کننده h1 در page.jsx */}
      <h2 className="sr-only">
        خدمات و پروژه‌های هلدینگ آریا استاد در زمینه سازه‌های سبک فولادی ال اس اف
      </h2>
      <NewsSection />
      <AllBoxItem />
      <CTASection />
    </div>
  )
}

export default HomePage