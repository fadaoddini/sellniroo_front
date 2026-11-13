// components/common/SiteFooter.jsx — فوتر سراسری: موتور اختصاصی ربو
'use client'

import React from 'react'
import { OWNER_PROFILE } from '@/utils/ownerAccess'
import styles from './SiteFooter.module.css'

export default function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer} dir="rtl">
      <div className={styles.inner}>
        <p className={styles.credit}>
          <span className={styles.creditLabel}>طراح:</span>{' '}
          <span className={styles.nameLink}>{OWNER_PROFILE.name}</span>
          <span className={styles.sep} aria-hidden="true">
            |
          </span>
          <a
            href={OWNER_PROFILE.siteUrl}
            className={styles.siteLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {OWNER_PROFILE.site}
          </a>
        </p>
        <p className={styles.engine}>
          <span className={styles.brand}>{OWNER_PROFILE.engineLine}</span>
        </p>
        <p className={styles.copy}>
          © {year} تمامی حقوق برای سایت{' '}
          <span className={styles.brand}>{OWNER_PROFILE.brandFa}</span> محفوظ
          است.
        </p>
      </div>
    </footer>
  )
}
