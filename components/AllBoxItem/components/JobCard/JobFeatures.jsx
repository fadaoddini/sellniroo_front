// src/components/AllBoxItem/components/JobCard/JobFeatures.jsx

'use client'

import React from 'react'
import { 
  ShieldCheck, 
  Clock, 
  Truck, 
  Utensils, 
  Award, 
  Calendar, 
  Wifi,
  CheckCircle,
  XCircle,
  MinusCircle
} from 'lucide-react'
import styles from './JobFeatures.module.css'

const JobFeatures = ({ job, isCompact = false }) => {
  // فقط برای آگهی‌های استخدام
  if (job.type !== 'hiring') {
    return null
  }

  const features = [
    {
      key: 'hasInsurance',
      icon: ShieldCheck,
      label: 'بیمه',
      value: job.hasInsurance
    },
    {
      key: 'hasExperience',
      icon: Clock,
      label: 'سابقه کار',
      value: job.hasExperience
    },
    {
      key: 'hasTransportation',
      icon: Truck,
      label: 'سرویس رفت و آمد',
      value: job.hasTransportation
    },
    {
      key: 'hasMeal',
      icon: Utensils,
      label: 'وعده غذایی',
      value: job.hasMeal
    },
    {
      key: 'hasBonus',
      icon: Award,
      label: 'پاداش',
      value: job.hasBonus
    },
    {
      key: 'hasFlexibleHours',
      icon: Calendar,
      label: 'ساعت انعطاف‌پذیر',
      value: job.hasFlexibleHours
    },
    {
      key: 'hasRemoteWork',
      icon: Wifi,
      label: 'دورکاری',
      value: job.hasRemoteWork
    }
  ]

  const getStatusIcon = (value) => {
    if (value === true) {
      return <CheckCircle size={isCompact ? 12 : 14} className={styles.activeIcon} />
    } else if (value === false) {
      return <XCircle size={isCompact ? 12 : 14} className={styles.inactiveIcon} />
    } else {
      return <MinusCircle size={isCompact ? 12 : 14} className={styles.unknownIcon} />
    }
  }

  const getStatusClass = (value) => {
    if (value === true) return styles.active
    if (value === false) return styles.inactive
    return styles.unknown
  }

  return (
    <div className={`${styles.featuresContainer} ${isCompact ? styles.compact : ''}`}>
      <span className={styles.featuresLabel}>مزایا و امکانات:</span>
      <div className={styles.featuresGrid}>
        {features.map((feature) => (
          <div 
            key={feature.key} 
            className={`${styles.featureItem} ${getStatusClass(feature.value)}`}
            title={feature.label}
          >
            <feature.icon size={isCompact ? 12 : 14} />
            <span className={styles.featureLabel}>{feature.label}</span>
            {getStatusIcon(feature.value)}
          </div>
        ))}
      </div>
    </div>
  )
}

export default JobFeatures