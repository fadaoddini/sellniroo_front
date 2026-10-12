// components/common/SiteFooter.jsx — فوتر مشترک سایت و ادمین
// ماژول سایت: site_footer — از /adminweb فعال/غیرفعال می‌شود (صفحات سایت)
'use client'

import React, { useEffect, useState } from 'react'
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/services/siteSettings'
import styles from './SiteFooter.module.css'

const PHONE = '09152913121'
const PHONE_HREF = `tel:${PHONE}`
const DEV_NAME = 'محمد سعید فداالدینی'
const DEV_SITE = 'saeedev.com'
const DEV_SITE_HREF = 'https://saeedev.com'

export default function SiteFooter({ siteName: siteNameProp } = {}) {
  const [siteName, setSiteName] = useState(
    siteNameProp || DEFAULT_SITE_SETTINGS.site_name || 'سلنیرو'
  )
  const year = new Date().getFullYear()

  useEffect(() => {
    if (siteNameProp) {
      setSiteName(siteNameProp)
      return undefined
    }
    let cancelled = false
    fetchSiteSettings().then((data) => {
      if (!cancelled && data?.site_name) setSiteName(data.site_name)
    })
    return () => { cancelled = true }
  }, [siteNameProp])

  return (
    <footer className={styles.footer} dir="rtl">
      <div className={styles.inner}>
        <p className={styles.copy}>
          © {year} تمامی حقوق برای{' '}
          <span className={styles.brand}>{siteName}</span>
          {' '}محفوظ است.
        </p>
        <p className={styles.credit}>
          <span className={styles.creditLabel}>طراح و برنامه‌نویس:</span>{' '}
          <a href={PHONE_HREF} className={styles.nameLink} title={`تماس: ${PHONE}`}>
            {DEV_NAME}
          </a>
          <span className={styles.sep} aria-hidden="true">|</span>
          <a
            href={DEV_SITE_HREF}
            className={styles.siteLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {DEV_SITE}
          </a>
        </p>
      </div>
    </footer>
  )
}
