'use client'

import React from 'react'
import { Star, ThumbsUp, Award, Shield } from 'lucide-react'
import { useLanguage } from '../../../../contexts/LanguageContext'
import styles from '../../styles/CertificatesSection.module.css'

const CertificatesSection = () => {
  const { t } = useLanguage()
  const homeData = t?.home || {}
  const certificatesData = homeData?.certificates || {}
  const items = certificatesData?.items || ['ISO 9001', 'CE Mark', 'کیفیت برتر', 'مقاوم در زلزله']
  const icons = [Star, ThumbsUp, Award, Shield]

  return (
    <section className={styles.certificates}>
      <div className="container">
        <div className={styles.certificatesContent}>
          <div className={styles.certificatesText}>
            <h2>{certificatesData.title || '🏆 افتخارات و گواهینامه‌ها'}</h2>
            <p>{certificatesData.subtitle || 'دارای گواهینامه‌های معتبر بین‌المللی و استانداردهای جهانی'}</p>
          </div>
          <div className={styles.certificatesGrid}>
            {items.map((item, index) => {
              const Icon = icons[index] || Star
              return (
                <div key={index} className={styles.certificateItem}>
                  <Icon size={32} />
                  <span>{item}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CertificatesSection
