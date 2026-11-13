'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Award,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Droplets,
  FileQuestion,
  FolderTree,
  GraduationCap,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Leaf,
  Package,
  Palette,
  PenLine,
  Phone,
  Shield,
  Sprout,
  Store,
  Target,
  Trophy,
  Users,
  Video,
} from 'lucide-react'
import {
  featureCardsCssVars,
  normalizeFeatureCardsSettings,
} from '@/config/featureCardsWidgetSettings'
import styles from './FeatureCardsWidget.module.css'

const ICONS = {
  Award,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Droplets,
  FileQuestion,
  FolderTree,
  GraduationCap,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Leaf,
  Package,
  Palette,
  PenLine,
  Phone,
  Shield,
  Sprout,
  Store,
  Target,
  Trophy,
  Users,
  Video,
}

function IconBadge({ name, show }) {
  if (!show) return null
  const Comp = ICONS[name] || Package
  return (
    <span className={styles.icon} aria-hidden>
      <Comp size={22} strokeWidth={1.75} />
    </span>
  )
}

function CardInner({ item, showIcons, showCta }) {
  return (
    <>
      <IconBadge name={item.icon} show={showIcons} />
      <div className={styles.cardBody}>
        <h3>{item.title}</h3>
        {item.desc ? <p>{item.desc}</p> : null}
        {showCta && item.href && item.cta ? (
          <span className={styles.cardCta}>{item.cta}</span>
        ) : null}
      </div>
    </>
  )
}

export default function FeatureCardsWidget({ settings: raw = {} }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mq = window.matchMedia('(max-width: 768px)')
    const apply = () => setIsMobile(!!mq.matches)
    apply()
    mq.addEventListener?.('change', apply)
    return () => mq.removeEventListener?.('change', apply)
  }, [])

  const cfg = useMemo(() => normalizeFeatureCardsSettings(raw), [raw])
  const cssVars = useMemo(() => featureCardsCssVars(cfg), [cfg])

  if ((isMobile && !cfg.show_on_mobile) || (!isMobile && !cfg.show_on_desktop)) {
    return null
  }

  const headAlignClass =
    cfg.head_align === 'start' ? styles.headStart : styles.headCenter

  return (
    <section
      className={`${styles.shell} ${cfg.section_full ? styles.shellFull : ''}`}
      style={cssVars}
      dir="rtl"
    >
      <div className={styles.inner}>
        <header className={`${styles.head} ${headAlignClass}`}>
          {cfg.show_eyebrow && cfg.eyebrow ? (
            <span className={styles.eyebrow}>{cfg.eyebrow}</span>
          ) : null}
          {cfg.show_title && cfg.title ? (
            <h2 className={styles.title}>{cfg.title}</h2>
          ) : null}
          {cfg.show_subtitle && cfg.subtitle ? (
            <p className={styles.subtitle}>{cfg.subtitle}</p>
          ) : null}
        </header>
        <div className={styles.grid}>
          {cfg.items.map((item, idx) =>
            item.href ? (
              <Link
                key={`${item.title}-${idx}`}
                href={item.href}
                className={`${styles.card} ${styles.cardLink}`}
              >
                <CardInner
                  item={item}
                  showIcons={cfg.show_icons}
                  showCta={cfg.show_cta}
                />
              </Link>
            ) : (
              <article key={`${item.title}-${idx}`} className={styles.card}>
                <CardInner
                  item={item}
                  showIcons={cfg.show_icons}
                  showCta={cfg.show_cta}
                />
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  )
}
