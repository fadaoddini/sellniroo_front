'use client'

import React from 'react'
import { Factory, Building2, Home as HomeIcon, Shield } from 'lucide-react'
import { useLanguage } from '../../../../contexts/LanguageContext'
import styles from '../../styles/FeaturesSection.module.css'

const FeaturesSection = () => {
  const { t } = useLanguage()
  const homeData = t?.home || {}
  const featuresData = homeData?.features || {}
  const items = featuresData?.items || []

  const icons = [Factory, Building2, HomeIcon, Shield]
  const defaultItems = [
    { 
      icon: Factory, 
      title: 'بزرگترین تولید کننده LSF', 
      desc: 'پیشرو در تولید سازه‌های سبک فولادی در ایران با بالاترین کیفیت' 
    },
    { 
      icon: Building2, 
      title: 'تولید کننده کناف', 
      desc: 'تولید و اجرای سیستم‌های کناف با استانداردهای روز دنیا' 
    },
    { 
      icon: HomeIcon, 
      title: 'سازه‌های مسکونی', 
      desc: 'مشاوره، طراحی و اجرای سازه‌های مسکونی مدرن و مقاوم' 
    },
    { 
      icon: Shield, 
      title: 'مقاوم در برابر زلزله', 
      desc: 'سازه‌های LSF با مقاومت بالا در برابر زلزله و حوادث طبیعی' 
    },
  ]

  const featureItems = items.length > 0 
    ? items.map((item, index) => ({
        ...item,
        icon: icons[index] || Factory
      }))
    : defaultItems

  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            {featuresData.title || 'حوزه‌های'} 
            <span className={styles.gradientText}> {featuresData.titleHighlight || 'فعالیت'}</span>
          </h2>
          <p className={styles.sectionDesc}>{featuresData.subtitle || 'تخصص‌های ما در صنعت ساخت و ساز'}</p>
        </div>
        <div className={styles.featuresGrid}>
          {featureItems.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <feature.icon size={28} />
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDesc}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
