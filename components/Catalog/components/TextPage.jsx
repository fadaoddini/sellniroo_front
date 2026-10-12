'use client'

import React from 'react'
import styles from '../styles/Flipbook.module.css'

export default function TextPage({ page, isRtl }) {
  const title = isRtl ? page.title_fa : page.title_en
  const body = isRtl ? page.body_fa : page.body_en
  const subtitle = isRtl ? page.subtitle_fa : page.subtitle_en

  return (
    <div className={styles.textPage}>
      {title ? <h3>{title}</h3> : null}
      {subtitle ? (
        <p style={{ marginBottom: '0.75rem', opacity: 0.75, fontSize: '0.82rem' }}>
          {subtitle}
        </p>
      ) : null}
      {body ? <p>{body}</p> : null}
    </div>
  )
}
