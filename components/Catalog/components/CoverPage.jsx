'use client'

import React from 'react'
import styles from '../styles/Flipbook.module.css'

export default function CoverPage({ page, isRtl }) {
  const title = isRtl ? page.title_fa : page.title_en
  const subtitle = isRtl ? page.subtitle_fa : page.subtitle_en
  const badge = page.is_back_cover
    ? isRtl
      ? 'تماس'
      : 'Contact'
    : isRtl
      ? 'کاتالوگ'
      : 'Catalog'

  return (
    <div
      className={styles.cover}
      style={{
        '--cover-bg': page.cover_bg || '#1a0a12',
        '--cover-accent': page.cover_accent || '#c9a227',
      }}
    >
      {page.cover_image_url ? (
        <div className={styles.coverMedia}>
          <img src={page.cover_image_url} alt="" />
        </div>
      ) : null}
      <div className={styles.coverInner}>
        <span className={styles.coverBadge}>{badge}</span>
        <h2 className={styles.coverTitle}>{title}</h2>
        <span className={styles.coverOrnament} />
        {subtitle ? <p className={styles.coverSubtitle}>{subtitle}</p> : null}
      </div>
    </div>
  )
}
