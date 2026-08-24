'use client'

import React from 'react'
import { Clock, Award, Leaf, TrendingUp } from 'lucide-react'
import { useLanguage } from '../../../../contexts/LanguageContext'
import styles from '../../styles/AdvantagesSection.module.css'

const AdvantagesSection = () => {
  const { t } = useLanguage()
  const homeData = t?.home || {}
  const advantagesData = homeData?.advantages || {}
  const items = advantagesData?.items || []

  const icons = [Clock, Award, Leaf, TrendingUp]
  const defaultItems = [
    { 
      icon: Clock, 
      title: 'سرعت اجرا', 
      desc: 'کاهش ۵۰٪ زمان اجرا نسبت به روش‌های سنتی' 
    },
    { 
      icon: Award, 
      title: 'کیفیت تضمینی', 
      desc: 'استانداردهای بین‌المللی در تولید و اجرا' 
    },
    { 
      icon: Leaf, 
      title: 'سازگار با محیط زیست', 
      desc: 'استفاده از مواد قابل بازیافت و سازگار با محیط زیست' 
    },
    { 
      icon: TrendingUp, 
      title: 'صرفه‌جویی اقتصادی', 
      desc: 'کاهش هزینه‌های ساخت و افزایش بهره‌وری' 
    },
  ]

  const advantageItems = items.length > 0
    ? items.map((item, index) => ({
        ...item,
        icon: icons[index] || Clock
      }))
    : defaultItems

  return (
    <section className={styles.advantages}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            {advantagesData.title || 'چرا'} 
            <span className={styles.gradientText}> {advantagesData.titleHighlight || 'ما'}</span>
          </h2>
          <p className={styles.sectionDesc}>{advantagesData.subtitle || 'مزایای همکاری با بزرگترین تولید کننده LSF ایران'}</p>
        </div>
        <div className={styles.advantagesGrid}>
          {advantageItems.map((item, index) => (
            <div key={index} className={styles.advantageCard}>
              <div className={styles.advantageIcon}>
                <item.icon size={24} />
              </div>
              <h3 className={styles.advantageTitle}>{item.title}</h3>
              <p className={styles.advantageDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AdvantagesSection
