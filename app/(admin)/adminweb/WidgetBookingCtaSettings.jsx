'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Monitor, Smartphone } from 'lucide-react'
import {
  BOOKING_CTA_BG_MODES,
  BOOKING_CTA_COLORS,
  BOOKING_CTA_LAYOUTS,
  BOOKING_DEVICES,
  BOOKING_MARGIN_FIELDS,
  BOOKING_SPACE_FIELDS,
  DEFAULT_BOOKING_CTA_SETTINGS,
  buildBookingCtaViewportPatch,
  getBookingVisibilityFlags,
  normalizeBookingCtaSettings,
  snapshotBookingCtaViewportSettings,
} from '@/config/bookingWidgetSettings'
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

function PxField({ label, value, onChange, min = 0, max = 240 }) {
  return (
    <label className={styles.wsPxField}>
      <span>{label}</span>
      <span className={styles.wsPxInput}>
        <input
          type="number"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          dir="ltr"
        />
        <em>px</em>
      </span>
    </label>
  )
}

function Seg({ options, value, onChange }) {
  return (
    <div
      className={styles.wsSeg}
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      {options.map((opt) => {
        const on = value === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            className={`${styles.wsSegBtn} ${on ? styles.wsSegBtnActive : ''}`}
            onClick={() => onChange(opt.id)}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function ColorRow({ label, value, onChange, allowTransparent = false }) {
  const isTransparent = value === 'transparent'
  const hex = value && /^#/.test(value) ? value : '#0f766e'
  return (
    <div className={styles.wsColorRow}>
      <span className={styles.wsColorRowLabel}>{label}</span>
      <div className={styles.wsColorRowControls}>
        <input
          type="color"
          className={styles.wsColorSwatch}
          value={isTransparent ? '#0f766e' : hex}
          disabled={isTransparent}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
        />
        <input
          type="text"
          className={styles.wsColorHex}
          dir="ltr"
          value={value || ''}
          placeholder="auto"
          onChange={(e) => onChange(e.target.value)}
        />
        {allowTransparent ? (
          <button
            type="button"
            className={`${styles.wsTinyBtn} ${
              isTransparent ? styles.wsTinyBtnOn : ''
            }`}
            onClick={() => onChange(isTransparent ? '' : 'transparent')}
          >
            شفاف
          </button>
        ) : null}
        {value && !isTransparent ? (
          <button
            type="button"
            className={styles.wsTinyBtn}
            onClick={() => onChange('')}
          >
            ×
          </button>
        ) : null}
      </div>
    </div>
  )
}

function TextField({ label, value, onChange, placeholder }) {
  return (
    <label className={styles.wsPxField}>
      <span>{label}</span>
      <input
        type="text"
        className={styles.wsColorHex}
        style={{ width: '100%', maxWidth: 'none' }}
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

function Accordion({ id, title, openId, setOpenId, children }) {
  const open = openId === id
  return (
    <div className={`${styles.wsAcc} ${open ? styles.wsAccOpen : ''}`}>
      <button
        type="button"
        className={styles.wsAccHead}
        onClick={() => setOpenId(open ? null : id)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <ChevronDown size={14} />
      </button>
      {open ? <div className={styles.wsAccBody}>{children}</div> : null}
    </div>
  )
}

/** پنل تنظیمات فراخوان رزرو — الگوی نوار خبر فوری */
export default function WidgetBookingCtaSettings({ settings: raw, onChange }) {
  const [device, setDevice] = useState('desktop')
  const [openId, setOpenId] = useState('display')

  const rawSettings = raw || DEFAULT_BOOKING_CTA_SETTINGS
  const visibility = getBookingVisibilityFlags(rawSettings)
  const settings = normalizeBookingCtaSettings(rawSettings, { viewport: device })

  const patch = (key, value) => {
    onChange(buildBookingCtaViewportPatch(rawSettings, device, key, value))
  }

  const copyDesktopToMobile = () => {
    const snap = snapshotBookingCtaViewportSettings(rawSettings, 'desktop')
    onChange({ mobile: snap })
    setDevice('mobile')
  }

  return (
    <div className={styles.wsMinimal}>
      <div className={styles.wsLabelRow}>
        <p className={styles.wsMiniLabel}>داده و لینک‌ها</p>
        <Link href="/booking" className={styles.wsGhostLink} target="_blank">
          پیش‌نمایش صفحه رزرو
        </Link>
      </div>
      <p className={styles.wsHint}>
        ظاهر بنر فراخوان را برای دسکتاپ و موبایل جدا تنظیم کنید — مثل نوار خبر فوری.
      </p>

      <p className={styles.wsMiniLabel}>نمایش در دستگاه</p>
      <div className={styles.wsStack}>
        <Toggle
          checked={!!visibility.show_on_desktop}
          onChange={(v) => patch('show_on_desktop', v)}
          label="نمایش در دسکتاپ"
          hint="بالای ۷۶۸px"
        />
        <Toggle
          checked={!!visibility.show_on_mobile}
          onChange={(v) => patch('show_on_mobile', v)}
          label="نمایش در موبایل / اپ"
          hint="زیر ۷۶۸px"
        />
      </div>

      <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
        ویرایش تنظیمات برای
      </p>
      <div className={styles.wsSeg} style={{ gridTemplateColumns: '1fr 1fr' }}>
        {BOOKING_DEVICES.map((d) => {
          const on = device === d.id
          return (
            <button
              key={d.id}
              type="button"
              className={`${styles.wsSegBtn} ${on ? styles.wsSegBtnActive : ''}`}
              onClick={() => setDevice(d.id)}
            >
              {d.id === 'desktop' ? (
                <Monitor size={14} style={{ marginInlineEnd: 4 }} />
              ) : (
                <Smartphone size={14} style={{ marginInlineEnd: 4 }} />
              )}
              {d.label}
            </button>
          )
        })}
      </div>
      <p className={styles.wsHint}>
        {device === 'desktop'
          ? 'در حال ویرایش ظاهر دسکتاپ'
          : 'در حال ویرایش ظاهر موبایل / اپ'}
      </p>
      {device === 'mobile' ? (
        <button
          type="button"
          className={styles.wsGhostLink}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: 0,
            marginBottom: '0.5rem',
          }}
          onClick={copyDesktopToMobile}
        >
          کپی تنظیمات دسکتاپ روی موبایل
        </button>
      ) : null}

      <Accordion id="content" title="محتوا و لینک‌ها" openId={openId} setOpenId={setOpenId}>
        <p className={styles.wsHint}>متن و لینک برای هر دو دستگاه مشترک است.</p>
        <TextField
          label="عنوان"
          value={settings.title}
          onChange={(v) => patch('title', v)}
        />
        <TextField
          label="زیرعنوان"
          value={settings.subtitle}
          onChange={(v) => patch('subtitle', v)}
        />
        <TextField
          label="متن دکمه اصلی"
          value={settings.primary_label}
          onChange={(v) => patch('primary_label', v)}
        />
        <TextField
          label="لینک دکمه اصلی"
          value={settings.primary_href}
          onChange={(v) => patch('primary_href', v)}
          placeholder="/booking"
        />
        <TextField
          label="متن دکمه فرعی"
          value={settings.secondary_label}
          onChange={(v) => patch('secondary_label', v)}
        />
        <TextField
          label="لینک دکمه فرعی"
          value={settings.secondary_href}
          onChange={(v) => patch('secondary_href', v)}
          placeholder="/booking?tab=lookup"
        />
      </Accordion>

      <Accordion id="display" title="نمایش" openId={openId} setOpenId={setOpenId}>
        <p className={styles.wsMiniLabel}>چیدمان</p>
        <Seg
          options={BOOKING_CTA_LAYOUTS}
          value={settings.layout}
          onChange={(v) => patch('layout', v)}
        />
        <div className={styles.wsStack}>
          <Toggle
            checked={!!settings.show_icon}
            onChange={(v) => patch('show_icon', v)}
            label="نمایش آیکن"
          />
          <Toggle
            checked={!!settings.show_glow}
            onChange={(v) => patch('show_glow', v)}
            label="درخشش پس‌زمینه"
          />
          <Toggle
            checked={!!settings.show_primary}
            onChange={(v) => patch('show_primary', v)}
            label="دکمه اصلی"
          />
          <Toggle
            checked={!!settings.show_secondary}
            onChange={(v) => patch('show_secondary', v)}
            label="دکمه فرعی"
          />
          <Toggle
            checked={!!settings.band_shadow}
            onChange={(v) => patch('band_shadow', v)}
            label="سایه بنر"
          />
          <Toggle
            checked={!!settings.section_full}
            onChange={(v) => patch('section_full', v)}
            label="سکشن تمام‌عرض"
            hint={
              settings.section_full
                ? 'لبه به لبه صفحه'
                : 'داخل ستون محتوا'
            }
          />
        </div>
      </Accordion>

      <Accordion id="space" title="شکل و فاصله" openId={openId} setOpenId={setOpenId}>
        <div className={styles.wsPxGrid}>
          <PxField
            label="حداکثر عرض"
            value={settings.max_width}
            onChange={(v) => patch('max_width', v)}
            min={320}
            max={1400}
          />
          <PxField
            label="گردی بنر"
            value={settings.band_radius}
            onChange={(v) => patch('band_radius', v)}
            max={40}
          />
          <PxField
            label="پدینگ عمودی بنر"
            value={settings.band_padding_y}
            onChange={(v) => patch('band_padding_y', v)}
            max={64}
          />
          <PxField
            label="پدینگ افقی بنر"
            value={settings.band_padding_x}
            onChange={(v) => patch('band_padding_x', v)}
            max={64}
          />
          <PxField
            label="اندازه عنوان"
            value={settings.title_size}
            onChange={(v) => patch('title_size', v)}
            min={16}
            max={42}
          />
          <PxField
            label="اندازه زیرعنوان"
            value={settings.subtitle_size}
            onChange={(v) => patch('subtitle_size', v)}
            min={11}
            max={22}
          />
        </div>
        <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
          Padding بیرونی
        </p>
        <div className={styles.wsPxGrid}>
          {BOOKING_SPACE_FIELDS.map((f) => (
            <PxField
              key={f.key}
              label={f.label}
              value={settings[f.key]}
              onChange={(v) => patch(f.key, v)}
            />
          ))}
        </div>
        <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
          Margin
        </p>
        <div className={styles.wsPxGrid}>
          {BOOKING_MARGIN_FIELDS.map((f) => (
            <PxField
              key={f.key}
              label={f.label}
              value={settings[f.key]}
              onChange={(v) => patch(f.key, v)}
              max={120}
            />
          ))}
        </div>
      </Accordion>

      <Accordion id="colors" title="رنگ‌ها" openId={openId} setOpenId={setOpenId}>
        <p className={styles.wsMiniLabel}>پس‌زمینه بنر</p>
        <Seg
          options={BOOKING_CTA_BG_MODES}
          value={settings.bg_mode || 'solid'}
          onChange={(v) => patch('bg_mode', v)}
        />
        <div className={styles.wsColorList}>
          {(settings.bg_mode || 'solid') === 'solid' ? (
            <ColorRow
              label="رنگ پس‌زمینه"
              value={settings.bg_solid}
              onChange={(v) => patch('bg_solid', v)}
            />
          ) : null}
          {(settings.bg_mode || 'solid') === 'gradient'
            ? BOOKING_CTA_COLORS.filter((f) =>
                ['bg_from', 'bg_mid', 'bg_to', 'glow'].includes(f.key),
              ).map((f) => (
                <ColorRow
                  key={f.key}
                  label={f.label}
                  value={settings[f.key]}
                  onChange={(v) => patch(f.key, v)}
                  allowTransparent={f.key === 'glow'}
                />
              ))
            : null}
          {BOOKING_CTA_COLORS.filter(
            (f) =>
              ![
                'bg_solid',
                'bg_from',
                'bg_mid',
                'bg_to',
                'glow',
              ].includes(f.key),
          ).map((f) => (
            <ColorRow
              key={f.key}
              label={f.label}
              value={settings[f.key]}
              onChange={(v) => patch(f.key, v)}
              allowTransparent={
                f.key === 'secondary_bg' || f.key === 'secondary_border'
              }
            />
          ))}
        </div>
      </Accordion>
    </div>
  )
}
