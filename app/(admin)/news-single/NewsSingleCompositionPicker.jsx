'use client'

import React from 'react'
import {
  NEWS_SINGLE_COMPOSITIONS,
  NEWS_SINGLE_BADGE_PLACEMENTS,
  NEWS_SINGLE_TITLE_SIZES,
  getNewsSingleComposition,
} from '@/config/newsSinglePageSettings'
import styles from './NewsSingleCompositionPicker.module.css'

/**
 * اسکلت زنده طرح‌های چیدمان بدنه سینگل + اندازه عنوان
 */
export default function NewsSingleCompositionPicker({
  layout,
  badgePlacement,
  titleSize,
  onSelectLayout,
  onBadgePlacement,
  onTitleSize,
}) {
  const active = getNewsSingleComposition(layout)

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <p className={styles.title}>قالب نمایش محتوا</p>
          <p className={styles.hint}>
            اسکلت زنده را ببینید و انتخاب کنید — از جمله چیدمان دو ستونه تصویر + لید
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        {NEWS_SINGLE_COMPOSITIONS.map((comp) => {
          const on = layout === comp.id
          const isSplit = comp.hero_style === 'split'
          return (
            <button
              key={comp.id}
              type="button"
              className={`${styles.card} ${on ? styles.cardOn : ''}`}
              onClick={() => onSelectLayout(comp.id)}
              aria-pressed={on}
            >
              <div
                className={`${styles.skel} ${styles[`skel_${comp.id}`] || ''}`}
                aria-hidden
              >
                <span className={styles.skelBack} />
                {comp.badge_placement === 'above' ? (
                  <span className={styles.skelBadgesAbove}>
                    <i />
                    <i />
                  </span>
                ) : null}

                {isSplit ? (
                  <div className={styles.skelSplit}>
                    <div className={styles.skelHero}>
                      {comp.badge_placement === 'on_image' ? (
                        <span className={styles.skelBadgesOn}>
                          <i />
                          <i />
                        </span>
                      ) : null}
                    </div>
                    <div className={styles.skelSplitLead}>
                      <b className={styles.skelTitle} />
                      <em className={styles.skelMeta} />
                      <span className={styles.skelLines}>
                        <i />
                        <i />
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.skelHero}>
                      {comp.badge_placement === 'on_image' ? (
                        <span className={styles.skelBadgesOn}>
                          <i />
                          <i />
                        </span>
                      ) : null}
                      {comp.title_place === 'on_image' ? (
                        <span className={styles.skelHeroText}>
                          <b />
                          <em />
                        </span>
                      ) : null}
                    </div>
                    {comp.badge_placement === 'below_image' ? (
                      <span className={styles.skelBadgesAbove}>
                        <i />
                        <i />
                      </span>
                    ) : null}
                    {comp.title_place === 'below' ? (
                      <div className={styles.skelBody}>
                        <b className={styles.skelTitle} />
                        <em className={styles.skelMeta} />
                        <span className={styles.skelLines}>
                          <i />
                          <i />
                          <i />
                        </span>
                      </div>
                    ) : (
                      <div className={styles.skelBody}>
                        <span className={styles.skelLines}>
                          <i />
                          <i />
                          <i />
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className={styles.cardMeta}>
                <strong>{comp.label}</strong>
                <small>{comp.desc}</small>
              </div>
            </button>
          )
        })}
      </div>

      <div className={styles.badgeRow}>
        <p className={styles.badgeLabel}>اندازه عنوان</p>
        <div className={styles.seg}>
          {NEWS_SINGLE_TITLE_SIZES.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`${styles.segBtn} ${
                titleSize === o.id ? styles.segBtnOn : ''
              }`}
              onClick={() => onTitleSize?.(o.id, o.px)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.badgeRow}>
        <p className={styles.badgeLabel}>جای برچسب‌ها (بج)</p>
        <div className={styles.seg}>
          {NEWS_SINGLE_BADGE_PLACEMENTS.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`${styles.segBtn} ${
                badgePlacement === o.id ? styles.segBtnOn : ''
              }`}
              onClick={() => onBadgePlacement(o.id)}
            >
              {o.label}
            </button>
          ))}
        </div>
        <p className={styles.badgeHint}>
          پیش‌فرض طرح «{active.label}»:{' '}
          {NEWS_SINGLE_BADGE_PLACEMENTS.find(
            (p) => p.id === active.badge_placement
          )?.label || '—'}
        </p>
      </div>
    </div>
  )
}
