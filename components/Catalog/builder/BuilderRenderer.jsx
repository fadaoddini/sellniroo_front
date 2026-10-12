'use client'

import React from 'react'
import { getLayoutPreset, legacyPageToBuilder } from './layouts'
import styles from './BuilderRender.module.css'

function BlockView({ block, isRtl }) {
  const d = block.data || {}
  switch (block.type) {
    case 'heading': {
      const text = isRtl ? d.text_fa : d.text_en
      if (!text) return null
      const sizeClass =
        d.size === 'xl'
          ? styles.hXl
          : d.size === 'md'
            ? styles.hMd
            : d.size === 'sm'
              ? styles.hSm
              : styles.hLg
      return (
        <h3
          className={`${styles.heading} ${sizeClass}`}
          style={{
            textAlign: d.align || (isRtl ? 'right' : 'left'),
            color: d.color || undefined,
          }}
        >
          {text}
        </h3>
      )
    }
    case 'text': {
      const text = isRtl ? d.text_fa : d.text_en
      if (!text) return null
      return (
        <p
          className={styles.text}
          style={{
            textAlign: d.align || (isRtl ? 'right' : 'left'),
            color: d.color || undefined,
          }}
        >
          {text}
        </p>
      )
    }
    case 'image':
      if (!d.url) return null
      return (
        <div
          className={styles.imageWrap}
          style={{ borderRadius: d.radius ?? 12 }}
        >
          <img
            src={d.url}
            alt={d.alt || ''}
            style={{ objectFit: d.fit || 'cover' }}
          />
        </div>
      )
    case 'button': {
      const label = isRtl ? d.label_fa : d.label_en
      if (!label) return null
      return (
        <a
          className={`${styles.button} ${
            d.style === 'outline' ? styles.buttonOutline : styles.buttonPrimary
          }`}
          href={d.url || '#'}
          target={d.url && d.url.startsWith('http') ? '_blank' : undefined}
          rel="noreferrer"
        >
          {label}
        </a>
      )
    }
    case 'divider':
      return (
        <hr
          className={styles.divider}
          style={{ borderColor: d.color || undefined }}
        />
      )
    case 'spacer':
      return <div style={{ height: Number(d.size) || 24 }} />
    case 'list': {
      const raw = isRtl ? d.items_fa : d.items_en
      const items = String(raw || '')
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean)
      if (!items.length) return null
      return (
        <ul className={styles.list}>
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )
    }
    default:
      return null
  }
}

export default function BuilderRenderer({ page, isRtl }) {
  const builder = legacyPageToBuilder(page)
  const sections = builder.sections || []
  const isCoverPage = sections.some((s) => s.layout === 'cover')

  return (
    <div
      className={`${styles.root} ${isCoverPage ? styles.rootCover : ''}`}
    >
      {sections.map((section) => {
        const preset = getLayoutPreset(section.layout)
        const cols = section.columns || []
        return (
          <div
            key={section.id}
            className={`${styles.section} ${
              section.layout === 'cover' ? styles.sectionCover : ''
            }`}
            style={{
              background: section.background || undefined,
              padding:
                section.padding === 'sm'
                  ? '0.5rem'
                  : section.padding === 'lg'
                    ? '1.5rem'
                    : '0.85rem',
            }}
          >
            <div
              className={styles.row}
              style={{
                gridTemplateColumns: preset.columns
                  .map((w) => `${w}fr`)
                  .join(' '),
              }}
            >
              {cols.map((col) => (
                <div key={col.id} className={styles.column}>
                  {(col.blocks || []).map((block) => (
                    <div key={block.id} className={styles.block}>
                      <BlockView block={block} isRtl={isRtl} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
