'use client'

import React from 'react'
import Link from 'next/link'
import { Info } from 'lucide-react'
import ModuleGate from '@/components/modules/ModuleGate'
import AboutUs from '@/components/About'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import styles from './ModuleDisabled.module.css'

function AboutDisabled() {
  return (
    <div className={styles.wrap} dir="rtl">
      <div className={styles.card}>
        <div className={styles.icon}>
          <Info size={28} />
        </div>
        <h1>صفحه درباره ما در دسترس نیست</h1>
        <p>این بخش فعلاً غیرفعال شده است.</p>
        <Link href="/" className={styles.btn}>
          بازگشت به خانه
        </Link>
      </div>
    </div>
  )
}

/** صفحه درباره ما — وضعیت از /adminweb (ماژول about_us) */
export default function AboutSlot() {
  return (
    <ModuleGate
      moduleKey={SITE_MODULE_KEYS.ABOUT_US}
      fallback={<AboutDisabled />}
    >
      <AboutUs />
    </ModuleGate>
  )
}
