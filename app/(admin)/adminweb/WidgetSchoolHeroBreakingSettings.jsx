'use client'

import React, { useMemo, useState } from 'react'
import { LayoutTemplate, Megaphone } from 'lucide-react'
import {
  DEFAULT_SCHOOL_LANDING,
  normalizeSchoolSettings,
} from '@/components/widgets/school/schoolData'
import {
  DEFAULT_NAV_WIDGET_SETTINGS,
  normalizeNavWidgetSettings,
} from '@/config/navWidgetSettings'
import WidgetNavSettings from './WidgetNavSettings'
import styles from './AdminWeb.module.css'

const TABS = [
  { id: 'hero', label: 'هیرو', icon: LayoutTemplate },
  { id: 'breaking', label: 'خبر فوری', icon: Megaphone },
]

function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className={styles.wsRow}>
      <span className={styles.wsRowText}>
        <span>{label}</span>
        {hint ? <small>{hint}</small> : null}
      </span>
      <span className={`${styles.wsSwitch} ${checked ? styles.wsSwitchOn : ''}`}>
        <input
          type="checkbox"
          checked={!!checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <i />
      </span>
    </label>
  )
}

function Field({ label, children }) {
  return (
    <label className={styles.wsField}>
      <span>{label}</span>
      {children}
    </label>
  )
}

function resolveBreakingRaw(settings = {}) {
  const raw = settings?.breaking || settings?.breaking_news || {}
  return raw && typeof raw === 'object' ? raw : {}
}

export default function WidgetSchoolHeroBreakingSettings({
  settings = {},
  onChange,
}) {
  const [tab, setTab] = useState('hero')
  const hero = useMemo(
    () => normalizeSchoolSettings(settings, DEFAULT_SCHOOL_LANDING),
    [settings],
  )
  const breakingRaw = useMemo(() => resolveBreakingRaw(settings), [settings])

  const patch = (partial) => {
    if (typeof onChange === 'function') onChange(partial)
  }

  const patchHero = (key, value) => patch({ [key]: value })

  const patchBreaking = (partial) => {
    const base = {
      ...normalizeNavWidgetSettings({
        ...DEFAULT_NAV_WIDGET_SETTINGS,
        ...breakingRaw,
      }),
      ...breakingRaw,
    }
    const p = partial && typeof partial === 'object' ? partial : {}
    const next = { ...base, ...p }
    ;['desktop', 'mobile'].forEach((vp) => {
      if (p[vp] && typeof p[vp] === 'object') {
        next[vp] = {
          ...(base[vp] && typeof base[vp] === 'object' ? base[vp] : {}),
          ...p[vp],
        }
      }
    })
    patch({
      embed_breaking: true,
      breaking: next,
      breaking_news: next,
    })
  }

  return (
    <div className={styles.wsStack}>
      <div className={styles.wsSeg} style={{ gridTemplateColumns: '1fr 1fr' }}>
        {TABS.map((t) => {
          const Icon = t.icon
          const on = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              className={`${styles.wsSegBtn} ${on ? styles.wsSegBtnActive : ''}`}
              onClick={() => setTab(t.id)}
            >
              <Icon size={13} style={{ marginInlineEnd: 4 }} />
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'hero' ? (
        <>
          <p className={styles.paletteHint} style={{ marginTop: 0 }}>
            ظاهر و نمایش ویجت. متن، دکمه‌ها و کارنامه نمایشی را از داشبورد →{' '}
            <a href="/home-hero-manage">تنظیمات صفحه اصلی</a> مدیریت
            کنید.
          </p>

          <Field label="برند / عنوان اصلی">
            <input
              type="text"
              value={hero.brand}
              onChange={(e) => patchHero('brand', e.target.value)}
              placeholder="مدرسه"
            />
          </Field>
          <Field label="تیتر">
            <input
              type="text"
              value={hero.headline}
              onChange={(e) => patchHero('headline', e.target.value)}
            />
          </Field>
          <Field label="توضیح کوتاه">
            <textarea
              rows={3}
              value={hero.subtitle}
              onChange={(e) => patchHero('subtitle', e.target.value)}
            />
          </Field>

          <div className={styles.wsFieldStack}>
            <Field label="متن دکمه اصلی">
              <input
                type="text"
                value={hero.cta_label}
                onChange={(e) => patchHero('cta_label', e.target.value)}
              />
            </Field>
            <Field label="لینک دکمه اصلی">
              <input
                type="text"
                dir="ltr"
                value={hero.cta_href}
                onChange={(e) => patchHero('cta_href', e.target.value)}
                placeholder="/login?next=/profile"
              />
            </Field>
            <Field label="متن دکمه دوم">
              <input
                type="text"
                value={hero.secondary_label}
                onChange={(e) => patchHero('secondary_label', e.target.value)}
              />
            </Field>
            <Field label="لینک دکمه دوم">
              <input
                type="text"
                dir="ltr"
                value={hero.secondary_href}
                onChange={(e) => patchHero('secondary_href', e.target.value)}
              />
            </Field>
          </div>

          <div className={styles.wsToggleGrid}>
            <Toggle
              label="نمایش در موبایل"
              checked={hero.show_on_mobile}
              onChange={(v) => patchHero('show_on_mobile', v)}
            />
            <Toggle
              label="نمایش در دسکتاپ"
              checked={hero.show_on_desktop}
              onChange={(v) => patchHero('show_on_desktop', v)}
            />
            <Toggle
              label="مخفی‌کردن هیرو"
              hint="فقط خبر فوری و بخش‌های پایین می‌مانند"
              checked={hero.hide_hero}
              onChange={(v) => patchHero('hide_hero', v)}
            />
            <Toggle
              label="مخفی‌کردن داک موبایل"
              checked={hero.hide_mobile_dock}
              onChange={(v) => patchHero('hide_mobile_dock', v)}
            />
            <Toggle
              label="مخفی‌کردن درگاه نقش‌ها"
              checked={hero.hide_portals}
              onChange={(v) => patchHero('hide_portals', v)}
            />
            <Toggle
              label="خبر فوری داخل هیرو"
              hint="نوار خبر فوری روی گرادیان هیرو"
              checked={settings?.embed_breaking !== false}
              onChange={(v) => patch({ embed_breaking: v })}
            />
          </div>
        </>
      ) : (
        <>
          <p className={styles.paletteHint} style={{ marginTop: 0 }}>
            رنگ، منو، پروفایل، تاریخ و فاصله‌ها — جدا برای موبایل و دسکتاپ.
          </p>
          <WidgetNavSettings
            type="breaking_news"
            settings={breakingRaw}
            onChange={patchBreaking}
          />
        </>
      )}
    </div>
  )
}

export function isSchoolHeroBreakingWidgetType(type) {
  return type === 'school_hero_breaking'
}
