'use client'

import React from 'react'
import {
  createDefaultNobatWidgetSettings,
  normalizeNobatWidgetSettings,
} from '@/config/nobatWidgetSettings'
import styles from './AdminWeb.module.css'

function Field({ label, value, onChange, multiline = false }) {
  return (
    <label className={styles.wsRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
      <span className={styles.wsRowText}>
        <span>{label}</span>
      </span>
      {multiline ? (
        <textarea
          rows={3}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            borderRadius: 10,
            border: '1px solid rgba(15,23,42,0.12)',
            padding: '8px 10px',
            font: 'inherit',
            resize: 'vertical',
          }}
        />
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            borderRadius: 10,
            border: '1px solid rgba(15,23,42,0.12)',
            padding: '8px 10px',
            font: 'inherit',
          }}
        />
      )}
    </label>
  )
}

export default function WidgetNobatSettings({ type, settings: raw, onChange }) {
  const widgetType = type || 'nobat_hero'
  const s = normalizeNobatWidgetSettings(
    raw || createDefaultNobatWidgetSettings(widgetType),
    widgetType,
  )

  const patch = (key, value) => onChange?.({ [key]: value })

  return (
    <div className={styles.wsPanel}>
      <p className={styles.paletteHint} style={{ marginBottom: 12 }}>
        ویجت اختصاصی نوبت / صدرا — متن‌ها را با موضوع مرکز لیزر هماهنگ کنید.
      </p>
      <Field label="ابرو" value={s.eyebrow} onChange={(v) => patch('eyebrow', v)} />
      <Field label="عنوان" value={s.title} onChange={(v) => patch('title', v)} />
      <Field
        label="توضیح"
        value={s.subtitle}
        onChange={(v) => patch('subtitle', v)}
        multiline
      />
      {s.primary_label !== undefined ? (
        <>
          <Field
            label="دکمه اصلی"
            value={s.primary_label}
            onChange={(v) => patch('primary_label', v)}
          />
          <Field
            label="لینک اصلی"
            value={s.primary_href}
            onChange={(v) => patch('primary_href', v)}
          />
        </>
      ) : null}
      {s.secondary_label !== undefined ? (
        <>
          <Field
            label="دکمه دوم"
            value={s.secondary_label}
            onChange={(v) => patch('secondary_label', v)}
          />
          <Field
            label="لینک دوم"
            value={s.secondary_href}
            onChange={(v) => patch('secondary_href', v)}
          />
        </>
      ) : null}
      {widgetType === 'nobat_hero' ? (
        <>
          <Field
            label="دکمه سوم"
            value={s.tertiary_label}
            onChange={(v) => patch('tertiary_label', v)}
          />
          <Field
            label="لینک سوم"
            value={s.tertiary_href}
            onChange={(v) => patch('tertiary_href', v)}
          />
          <Field label="نشان ۱" value={s.badge_a} onChange={(v) => patch('badge_a', v)} />
          <Field label="نشان ۲" value={s.badge_b} onChange={(v) => patch('badge_b', v)} />
          <Field label="نشان ۳" value={s.badge_c} onChange={(v) => patch('badge_c', v)} />
        </>
      ) : null}
      {widgetType === 'nobat_parts' ? (
        <>
          <Field
            label="متن لینک فروشگاه"
            value={s.cta_label}
            onChange={(v) => patch('cta_label', v)}
          />
          <Field
            label="لینک فروشگاه"
            value={s.cta_href}
            onChange={(v) => patch('cta_href', v)}
          />
        </>
      ) : null}
      {widgetType === 'nobat_search' ? (
        <>
          <Field
            label="متن جایگزین (placeholder)"
            value={s.placeholder}
            onChange={(v) => patch('placeholder', v)}
          />
          <Field
            label="راهنمای زیر فیلد"
            value={s.hint}
            onChange={(v) => patch('hint', v)}
          />
          <Field
            label="متن دکمه (خالی = فقط آیکون)"
            value={s.submit_label}
            onChange={(v) => patch('submit_label', v)}
          />
          <Field
            label="آدرس نتایج"
            value={s.results_href}
            onChange={(v) => patch('results_href', v)}
          />
        </>
      ) : null}
    </div>
  )
}
