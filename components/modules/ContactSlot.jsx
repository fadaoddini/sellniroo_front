'use client'

import React from 'react'
import Link from 'next/link'
import { Phone } from 'lucide-react'
import ModuleGate from '@/components/modules/ModuleGate'
import ModulePageShell from '@/components/layout/ModulePageShell'
import CTASectionSlot from '@/components/modules/CTASectionSlot'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import styles from './ModuleDisabled.module.css'

function ContactDisabled() {
  return (
    <div className={styles.wrap} dir="rtl">
      <div className={styles.card}>
        <div className={styles.icon}>
          <Phone size={28} />
        </div>
        <h1>صفحه تماس در دسترس نیست</h1>
        <p>این بخش فعلاً غیرفعال شده است.</p>
        <Link href="/" className={styles.btn}>
          بازگشت به خانه
        </Link>
      </div>
    </div>
  )
}

/** صفحه تماس با ما — /contact */
export default function ContactSlot(props) {
  return (
    <ModuleGate
      moduleKey={SITE_MODULE_KEYS.CTA_SECTION}
      fallback={<ContactDisabled />}
    >
      <ModulePageShell pageKey="contact">
        <CTASectionSlot {...props} />
      </ModulePageShell>
    </ModuleGate>
  )
}
