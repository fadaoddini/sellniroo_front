'use client'

import React from 'react'
import { Check } from 'lucide-react'
import useReboNormalized from './useReboNormalized'
import { REBO_CAPABILITIES } from './reboData'
import styles from './ReboCapabilities.module.css'

/** چیدمان داخلی صفحه موبایل — برای هر نوع امکان متفاوت */
function PhoneScreen({ layout, title, icon: Icon }) {
  if (layout === 'shop') {
    return (
      <div className={`${styles.phoneScreen} ${styles.screenShop}`}>
        <div className={styles.shopSearch} />
        <div className={styles.shopBanner} />
        <div className={styles.shopGrid}>
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className={styles.phoneDock}>
          <em />
          <em />
          <em />
        </div>
      </div>
    )
  }

  if (layout === 'calendar') {
    return (
      <div className={`${styles.phoneScreen} ${styles.screenCalendar}`}>
        <div className={styles.calHead}>
          <strong>{title}</strong>
        </div>
        <div className={styles.calGrid}>
          {Array.from({ length: 14 }).map((_, i) => (
            <b key={i} className={i === 8 ? styles.calOn : undefined} />
          ))}
        </div>
        <div className={styles.calSlots}>
          <i />
          <i />
          <i />
        </div>
      </div>
    )
  }

  if (layout === 'news') {
    return (
      <div className={`${styles.phoneScreen} ${styles.screenNews}`}>
        <div className={styles.newsHero} />
        <div className={styles.newsRow}>
          <span />
          <div>
            <i />
            <i />
          </div>
        </div>
        <div className={styles.newsRow}>
          <span />
          <div>
            <i />
            <i />
          </div>
        </div>
        <div className={styles.newsRow}>
          <span />
          <div>
            <i />
            <i />
          </div>
        </div>
      </div>
    )
  }

  if (layout === 'list') {
    return (
      <div className={`${styles.phoneScreen} ${styles.screenList}`}>
        <div className={styles.listHead}>
          <span className={styles.phoneHeroIcon}>
            <Icon size={16} strokeWidth={1.7} />
          </span>
          <strong>{title}</strong>
        </div>
        <div className={styles.listItems}>
          <div />
          <div />
          <div />
          <div />
        </div>
      </div>
    )
  }

  if (layout === 'dashboard') {
    return (
      <div className={`${styles.phoneScreen} ${styles.screenDash}`}>
        <div className={styles.dashStats}>
          <span />
          <span />
        </div>
        <div className={styles.dashChart} />
        <div className={styles.dashRows}>
          <i />
          <i />
          <i />
        </div>
      </div>
    )
  }

  if (layout === 'quiz') {
    return (
      <div className={`${styles.phoneScreen} ${styles.screenQuiz}`}>
        <div className={styles.quizBadge}>
          <Icon size={18} strokeWidth={1.7} />
        </div>
        <div className={styles.quizQ} />
        <div className={styles.quizOpts}>
          <b />
          <b />
          <b />
          <b />
        </div>
      </div>
    )
  }

  // default / brand / builder — hero + tiles
  return (
    <div className={`${styles.phoneScreen} ${styles.screenDefault}`}>
      <div className={styles.phoneHero}>
        <span className={styles.phoneHeroIcon}>
          <Icon size={18} strokeWidth={1.7} />
        </span>
        <strong>{title}</strong>
      </div>
      <div className={styles.phoneBars}>
        <i />
        <i />
      </div>
      <div className={styles.phoneCards}>
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  )
}

const LAYOUT_BY_ID = {
  jobs: 'list',
  shop: 'shop',
  booking: 'calendar',
  repairs: 'list',
  news: 'news',
  school: 'list',
  softapps: 'shop',
  quiz: 'quiz',
  sales: 'dashboard',
  brand: 'default',
  crm: 'dashboard',
  club: 'calendar',
}

function PhonePreview({ accent, title, icon: Icon, layout }) {
  return (
    <div className={styles.phone} style={{ '--accent': accent }} aria-hidden>
      <div className={styles.phoneGlow} />
      <div className={styles.phoneBody}>
        <div className={styles.phoneNotch} />
        <PhoneScreen layout={layout} title={title} icon={Icon} />
        <div className={styles.phoneHome} />
      </div>
    </div>
  )
}

export default function ReboCapabilities({ settings: raw = {} }) {
  const { settings: s, style, visible } = useReboNormalized(
    raw,
    'rebo_capabilities',
  )
  if (!visible) return null

  return (
    <section
      id="rebo-capabilities"
      className={styles.caps}
      style={style}
      dir="rtl"
      lang="fa"
    >
      <div className={styles.glow} aria-hidden />
      <div
        className={styles.inner}
        style={{ maxWidth: s.max_width ? `${s.max_width}px` : undefined }}
      >
        <header className={styles.head}>
          <p className={styles.eyebrow}>
            <i />
            امکانات
          </p>
          {s.title ? <h2 className={styles.title}>{s.title}</h2> : null}
          {s.show_subtitle !== false && s.subtitle ? (
            <p className={styles.subtitle}>{s.subtitle}</p>
          ) : null}
        </header>

        <div className={styles.grid}>
          {REBO_CAPABILITIES.map((cap) => {
            const Icon = cap.icon
            const layout = LAYOUT_BY_ID[cap.id] || 'default'
            return (
              <article
                key={cap.id}
                className={styles.card}
                style={{ '--accent': cap.accent }}
              >
                <div className={styles.media}>
                  <PhonePreview
                    accent={cap.accent}
                    title={cap.title}
                    icon={Icon}
                    layout={layout}
                  />
                </div>

                <div className={styles.body}>
                  <div className={styles.bodyTop}>
                    <span className={styles.iconWrap}>
                      <Icon size={20} strokeWidth={1.75} />
                    </span>
                    <div className={styles.titles}>
                      <h3>{cap.title}</h3>
                      <p>{cap.desc}</p>
                    </div>
                  </div>

                  <ul className={styles.features}>
                    {(cap.features || []).map((f) => (
                      <li key={f}>
                        <span className={styles.check} aria-hidden>
                          <Check size={12} strokeWidth={2.4} />
                        </span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
