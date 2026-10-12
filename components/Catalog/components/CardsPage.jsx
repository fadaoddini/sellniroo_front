'use client'

import React from 'react'
import styles from '../styles/Flipbook.module.css'

export default function CardsPage({ page, isRtl }) {
  const title = isRtl ? page.title_fa : page.title_en
  const body = isRtl ? page.body_fa : page.body_en
  const cards = Array.isArray(page.cards) ? page.cards : []

  return (
    <div className={styles.cardsPage}>
      {title ? <h3>{title}</h3> : null}
      {body ? (
        <p style={{ margin: 0, fontSize: '0.84rem', lineHeight: 1.7, opacity: 0.8 }}>
          {body}
        </p>
      ) : null}
      <div className={styles.cardsGrid}>
        {cards.map((card, idx) => (
          <div key={idx} className={styles.cardItem}>
            <strong>{isRtl ? card.title_fa : card.title_en}</strong>
            <span>{isRtl ? card.desc_fa : card.desc_en}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
