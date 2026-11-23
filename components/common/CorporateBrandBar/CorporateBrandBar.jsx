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
    const load = () => {
      fetchSiteSettings({ force: true })
        .then((data) => {
          if (!cancelled && data) setSettings(data)
        })
        .catch(() => {})
      fetchCorporateAppearance({ force: true })
        .then((data) => {
          if (!cancelled && data) setAppearance(data)
        })
        .catch(() => {})
    }
    load()
    const onSite = (ev) => {
      if (ev?.detail) setSettings(ev.detail)
      else load()
    }
    const onAppear = () => {
      fetchCorporateAppearance({ force: true })
        .then((data) => {
          if (!cancelled && data) setAppearance(data)
        })
        .catch(() => {})
    }
    window.addEventListener('site-settings-changed', onSite)
    window.addEventListener('corporate-appearance-changed', onAppear)
    return () => {
      cancelled = true
      window.removeEventListener('site-settings-changed', onSite)
      window.removeEventListener('corporate-appearance-changed', onAppear)
    }
  }, [])

  const logoSrc =
    getFullImageUrl(settings?.logo_display || settings?.logo_url) ||
    getFullImageUrl(appearance?.logo_display || appearance?.logo_url) ||
    ''

  const name = settings.site_name || ''
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
        <Link
          href="/"
          className={styles.brand}
          title={settings.logo_title || name || undefined}
        >
          {logoSrc ? (
            <span className={styles.logoWrap}>
              <Image
                src={logoSrc}
                alt={settings.logo_alt || name || 'لوگو'}
                width={36}
                height={36}
                unoptimized
              />
            </span>
          ) : null}
          {name || subtitle ? (
            <span className={styles.brandText}>
              {name ? <strong>{name}</strong> : null}
              {subtitle ? <span>{subtitle}</span> : null}
            </span>
          ) : null}
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
