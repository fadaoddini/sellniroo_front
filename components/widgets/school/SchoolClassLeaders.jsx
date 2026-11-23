'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import ModuleGate from '@/components/modules/ModuleGate'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import {
  classLeaderPlaceTone,
  normalizeSchoolClassLeadersSettings,
  resolveClassLeadersList,
  schoolClassLeadersCssVars,
} from '@/config/schoolClassLeadersWidgetSettings'
import styles from './SchoolClassLeaders.module.css'

function faNum(n) {
  try {
    return new Intl.NumberFormat('fa-IR').format(n)
  } catch {
    return String(n)
  }
}

const TONE_CLASS = {
  gold: styles.rowGold,
  silver: styles.rowSilver,
  bronze: styles.rowBronze,
  plain: styles.rowPlain,
}

export default function SchoolClassLeaders({ settings: raw = {} }) {
  const settings = useMemo(
    () => normalizeSchoolClassLeadersSettings(raw),
    [raw],
  )
  const items = useMemo(() => resolveClassLeadersList(settings), [settings])
  const vars = schoolClassLeadersCssVars(settings)

  const visibilityClass =
    !settings.show_on_mobile && !settings.show_on_desktop
      ? styles.hiddenMobile
      : !settings.show_on_mobile
        ? styles.hiddenMobile
        : !settings.show_on_desktop
          ? styles.hiddenDesktop
          : ''

  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.SCHOOL}>
      <section
        className={`${styles.root} ${settings.section_full ? styles.rootFull : ''} ${visibilityClass}`}
        style={vars}
        data-school-class-leaders="1"
        aria-label={
          settings.class_label
            ? `نفرات برتر ${settings.class_label}`
            : settings.title || 'نفرات برتر کلاس'
        }
      >
        <div className={styles.inner}>
          {settings.show_title !== false ? (
            <div className={styles.head}>
              <h2 className={styles.title}>{settings.title}</h2>
              {settings.class_label ? (
                <p className={styles.classLabel}>{settings.class_label}</p>
              ) : null}
            </div>
          ) : settings.class_label ? (
            <div className={styles.head}>
              <p className={styles.classLabel}>{settings.class_label}</p>
            </div>
          ) : null}

          {!items.length ? (
            <p className={styles.empty}>هنوز لیستی برای این کلاس تنظیم نشده.</p>
          ) : (
            <ol className={styles.list}>
              {items.map((person, index) => {
                const place = index + 1
                const tone = classLeaderPlaceTone(place)
                const rowClass = `${styles.row} ${TONE_CLASS[tone] || styles.rowPlain}`
                const content = (
                  <>
                    <span className={styles.place}>{faNum(place)}</span>
                    <p className={styles.name}>{person.name}</p>
                    {settings.show_score && person.score ? (
                      <span className={styles.score}>{person.score}</span>
                    ) : (
                      <span />
                    )}
                    {settings.show_points && person.points > 0 ? (
                      <span className={styles.points}>{faNum(person.points)}</span>
                    ) : (
                      <span />
                    )}
                  </>
                )
                if (person.href) {
                  return (
                    <li key={person.id}>
                      <Link href={person.href} className={rowClass}>
                        {content}
                      </Link>
                    </li>
                  )
                }
                return (
                  <li key={person.id}>
                    <div className={rowClass}>{content}</div>
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      </section>
    </ModuleGate>
  )
}
