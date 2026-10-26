// CorporateBrandBar — پروفایل برند موضوع شرکتی (از SiteSettings)
'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, Building2 } from 'lucide-react'
import {
  fetchSiteSettings,
  DEFAULT_SITE_SETTINGS,
} from '@/services/siteSettings'
import {
  fetchCorporateAppearance,
  DEFAULT_CORPORATE_APPEARANCE,
} from '@/services/corporateAppearance'
import { getFullImageUrl } from '@/utils/imageUrl'
import styles from './CorporateBrandBar.module.css'

export default function CorporateBrandBar() {
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS)
  const [appearance, setAppearance] = useState(DEFAULT_CORPORATE_APPEARANCE)

  useEffect(() => {
    let cancelled = false
    fetchSiteSettings({ force: true }).then((data) => {
      if (!cancelled && data) setSettings(data)
    }).catch(() => {})
    fetchCorporateAppearance({ force: true }).then((data) => {
      if (!cancelled && data) setAppearance(data)
    }).catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const logoSrc =
    getFullImageUrl(appearance?.logo_display || appearance?.logo_url) ||
    getFullImageUrl(settings?.logo_display || settings?.logo_url) ||
    '/images/logo.png'

  const name = settings.site_name || 'شرکت'
  const subtitle = settings.seo_category || settings.site_name_en || ''
  const phone = settings.contact_phone || ''
  const email = settings.contact_email || ''
  const ctaLabel = settings.header_cta_label || 'تماس'
  const ctaHref = settings.header_cta_href || '/#contact'

  const barStyle = {
    ['--cbb-bg']: appearance.header_bg || '#0f1f17',
    ['--cbb-ink']: appearance.header_text || '#f4fff8',
    ['--cbb-accent']: appearance.header_icon || '#95d5b2',
  }

  return (
    <div className={styles.bar} style={barStyle} dir="rtl">
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} title={settings.logo_title || name}>
          <span className={styles.logoWrap}>
            <Image
              src={logoSrc}
              alt={settings.logo_alt || name}
              width={36}
              height={36}
              unoptimized
            />
          </span>
          <span className={styles.brandText}>
            <strong>{name}</strong>
            {subtitle ? <span>{subtitle}</span> : null}
          </span>
        </Link>

        <div className={styles.meta}>
          {phone ? (
            <a href={`tel:${phone}`}>
              <Phone size={13} />
              {phone}
            </a>
          ) : null}
          {email ? (
            <a href={`mailto:${email}`}>
              <Mail size={13} />
              {email}
            </a>
          ) : (
            <span>
              <Building2 size={13} />
              پروفایل شرکتی
            </span>
          )}
          <Link href={ctaHref} className={styles.cta}>
            {ctaLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}
