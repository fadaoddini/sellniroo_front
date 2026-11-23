'use client'

import React from 'react'
import styles from './AdminWeb.module.css'

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

/**
 * چیدمان ویجت معرفی مدرسه (فقط هیرو) —
 * درگاه‌ها / کارنامه / مشاور / ابزار / جمع‌بندی ویجت‌های جدا زیر هم هستند.
 */
export default function WidgetSchoolHeroBreakingSettings({
  settings = {},
  onChange,
}) {
  const patch = (partial) => {
    if (typeof onChange === 'function') onChange(partial)
  }

  return (
    <div className={styles.wsStack}>
      <p className={styles.paletteHint} style={{ marginTop: 0 }}>
        این ویجت فقط هیرو معرفی است. بقیهٔ بخش‌ها (درگاه نقش‌ها، کارنامه،
        مشاور، ابزار معلم، جمع‌بندی) را جدا در چیدمان صفحه اصلی زیر هم اضافه
        کنید. متن و CTA از داشبورد →{' '}
        <a href="/home-hero-manage">تنظیمات صفحه اصلی</a>.
      </p>

      <div className={styles.wsToggleGrid}>
        <Toggle
          label="نمایش در موبایل"
          checked={settings?.show_on_mobile !== false}
          onChange={(v) => patch({ show_on_mobile: v })}
        />
        <Toggle
          label="نمایش در دسکتاپ"
          checked={settings?.show_on_desktop !== false}
          onChange={(v) => patch({ show_on_desktop: v })}
        />
        <Toggle
          label="مخفی‌کردن داک موبایل"
          checked={settings?.hide_mobile_dock === true}
          onChange={(v) => patch({ hide_mobile_dock: v })}
        />
        <Toggle
          label="هدر و منو روی هیرو"
          hint="هدر/منو روی این ویجت می‌نشینند؛ بک‌گراند خودشان حفظ می‌شود و با اسکرول بالا می‌مانند"
          checked={settings?.chrome_over_hero === true}
          onChange={(v) => patch({ chrome_over_hero: v })}
        />
      </div>
    </div>
  )
}

export function isSchoolHeroBreakingWidgetType(type) {
  return type === 'school_hero_breaking'
}
