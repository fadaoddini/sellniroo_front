'use client'

import React from 'react'
import styles from '../styles/Flipbook.module.css'

export default function ImageTextPage({ page, isRtl }) {
  const title = isRtl ? page.title_fa : page.title_en
  const body = isRtl ? page.body_fa : page.body_en
  const img = page.image_url

  return (
    <div className={styles.imageTextPage}>
      {img ? (
        <div className={styles.media}>
          <img src={img} alt={title || ''} />
        </div>
      ) : null}
      {title ? <h3>{title}</h3> : null}
      {body ? <p>{body}</p> : null}
    </div>
  )
}
