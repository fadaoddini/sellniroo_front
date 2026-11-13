'use client'

import React from 'react'
import {
  applySadraPixelTheme,
  DEFAULT_SADRA_PIXEL_SETTINGS,
  normalizeSadraPixelSettings,
  SADRA_PIXEL_THEMES,
} from '@/config/sadraPixelWidgetSettings'
import styles from './AdminWeb.module.css'

function Toggle({ checked, onChange, label }) {
  return (
    <label className={styles.wsRow}>
      <span className={styles.wsRowText}>
        <span>{label}</span>
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

function ColorRow({ label, value, fallback, onChange }) {
  const v = value || fallback
  return (
    <div className={styles.wsColorRow}>
      <span className={styles.wsColorRowLabel}>{label}</span>
      <div className={styles.wsColorRowControls}>
        <input
          type="color"
          value={/^#([0-9a-f]{6})$/i.test(v) ? v : fallback}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          type="text"
          dir="ltr"
          value={v}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}

export default function WidgetSadraPixelSettings({ settings: raw, onChange }) {
  const settings = normalizeSadraPixelSettings(
    raw || DEFAULT_SADRA_PIXEL_SETTINGS
  )
  const set = (key, value) => onChange?.({ [key]: value })

  const applyTheme = (themeKey) => {
    if (themeKey === 'custom') {
      set('theme', 'custom')
      return
    }
    const next = applySadraPixelTheme(themeKey, settings)
    onChange?.({
      theme: next.theme,
      color: next.color,
      color_glow: next.color_glow,
      color_dim: next.color_dim,
      board_bg: next.board_bg,
      board_border: next.board_border,
    })
  }

  const setColor = (key, value) => {
    onChange?.({ [key]: value, theme: 'custom' })
  }

  return (
    <div className={styles.wsStack} style={{ gap: '0.65rem' }}>
      <p className={styles.wsHint}>
        ماتریس LED ریز قرمز — چراغ‌های خاموش، عبور کلمه با روشنایی ضعیف/قوی.
      </p>

      <label className={styles.wsField}>
        <span>متن تابلو</span>
        <input
          dir="auto"
          value={settings.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="مثلاً فروش ویژه صدرا"
        />
      </label>

      <label className={styles.wsField}>
        <span>تم رنگی</span>
        <select
          className={styles.wsSelect}
          value={settings.theme || 'gold'}
          onChange={(e) => applyTheme(e.target.value)}
        >
          {Object.entries(SADRA_PIXEL_THEMES).map(([key, t]) => (
            <option key={key} value={key}>
              {t.label}
            </option>
          ))}
          <option value="custom">سفارشی</option>
        </select>
      </label>

      <label className={styles.wsField}>
        <span>جهت حرکت انیمیشن</span>
        <select
          className={styles.wsSelect}
          value={settings.scroll_direction}
          onChange={(e) => set('scroll_direction', e.target.value)}
        >
          <option value="to_left">به چپ ←</option>
          <option value="to_right">به راست →</option>
        </select>
      </label>

      <label className={styles.wsField}>
        <span>جهت متن</span>
        <select
          className={styles.wsSelect}
          value={settings.text_direction}
          onChange={(e) => set('text_direction', e.target.value)}
        >
          <option value="auto">خودکار (بر اساس زبان)</option>
          <option value="rtl">راست‌چین (فارسی)</option>
          <option value="ltr">چپ‌چین (لاتین)</option>
        </select>
      </label>

      <label className={styles.wsField}>
        <span>اندازه نوشته</span>
        <input
          type="number"
          min={4}
          max={16}
          value={settings.pixel_size}
          onChange={(e) => set('pixel_size', Number(e.target.value))}
        />
      </label>

      <label className={styles.wsField}>
        <span>سرعت اسکرول (ثانیه یک دور)</span>
        <input
          type="number"
          min={4}
          max={40}
          value={settings.scroll_seconds}
          onChange={(e) => set('scroll_seconds', Number(e.target.value))}
        />
      </label>

      <ColorRow
        label="رنگ LED"
        value={settings.color}
        fallback="#dbbe00"
        onChange={(v) => setColor('color', v)}
      />
      <ColorRow
        label="درخشش"
        value={settings.color_glow}
        fallback="#f5e08a"
        onChange={(v) => setColor('color_glow', v)}
      />
      <ColorRow
        label="پس‌زمینه تابلو"
        value={settings.board_bg}
        fallback="#0c1210"
        onChange={(v) => setColor('board_bg', v)}
      />
      <ColorRow
        label="حاشیه تابلو"
        value={settings.board_border}
        fallback="#2a3a30"
        onChange={(v) => setColor('board_border', v)}
      />

      <Toggle
        checked={settings.animate}
        onChange={(v) => set('animate', v)}
        label="حرکت تابلو روان"
      />
      <Toggle
        checked={settings.show_on_mobile}
        onChange={(v) => set('show_on_mobile', v)}
        label="نمایش در موبایل"
      />
      <Toggle
        checked={settings.show_on_desktop}
        onChange={(v) => set('show_on_desktop', v)}
        label="نمایش در دسکتاپ"
      />
    </div>
  )
}
