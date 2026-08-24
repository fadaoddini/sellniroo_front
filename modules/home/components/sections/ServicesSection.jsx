'use client'

import React from 'react'
import { Factory, Building2, Ruler, HardHat } from 'lucide-react'
import { useLanguage } from '../../../../contexts/LanguageContext'
import styles from '../../styles/ServicesSection.module.css'

const ServicesSection = () => {
  const { t } = useLanguage()
  const homeData = t?.home || {}
  const servicesData = homeData?.services || {}
  const items = servicesData?.items || []

  const icons = [Factory, Building2, Ruler, HardHat]
  const defaultItems = [
    { 
      title: 'سازه‌های LSF', 
      desc: 'طراحی و اجرای سازه‌های سبک فولادی با بالاترین کیفیت و سرعت', 
      icon: Factory 
    },
    { 
      title: 'سیستم‌های کناف', 
      desc: 'تولید و اجرای حرفه‌ای کناف برای ساختمان‌های مدرن', 
      icon: Building2 
    },
    { 
      title: 'طراحی معماری', 
      desc: 'مشاوره و طراحی معماری مدرن متناسب با نیاز شما', 
      icon: Ruler 
    },
    { 
      title: 'اجرای سازه', 
      desc: 'اجرای سریع و حرفه‌ای سازه‌های مسکونی و تجاری', 
      icon: HardHat 
    },
  ]

  const serviceItems = items.length > 0
    ? items.map((item, index) => ({
        ...item,
        icon: icons[index] || Factory
      }))
    : defaultItems

  return (
    <section className={styles.services}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            {servicesData.title || 'خدمات'} 
            <span className={styles.gradientText}> {servicesData.titleHighlight || 'تخصصی'}</span>
          </h2>
          <p className={styles.sectionDesc}>{servicesData.subtitle || 'راهکارهای جامع ساخت و ساز'}</p>
        </div>
        <div className={styles.servicesGrid}>
          {serviceItems.map((service, index) => (
            <div key={index} className={styles.serviceCard}>
              <div className={styles.serviceIcon}>
                <service.icon size={32} />
              </div>
              <div className={styles.serviceNumber}>۰{index + 1}</div>
              <h3 className={styles.serviceTitle}>{service.title}</h3>
              <p className={styles.serviceDesc}>{service.desc}</p>
              <div className={styles.serviceLine} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ServicesSection
