'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Monitor, Smartphone } from 'lucide-react'
import {
  BOOKING_DEVICES,
  BOOKING_MARGIN_FIELDS,
  BOOKING_SPACE_FIELDS,
  BOOKING_STAFF_COLORS,
  BOOKING_STAFF_COLUMNS,
  DEFAULT_BOOKING_STAFF_SETTINGS,
  buildBookingStaffViewportPatch,
  getBookingVisibilityFlags,
  normalizeBookingStaffSettings,
  snapshotBookingStaffViewportSettings,
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

/** پنل تنظیمات پرسنل نوبت‌دهی — الگوی نوار خبر فوری */
export default function WidgetBookingStaffSettings({
  settings: raw,
  onChange,
}) {
  const [device, setDevice] = useState('desktop')
  const [openId, setOpenId] = useState('display')

  const rawSettings = raw || DEFAULT_BOOKING_STAFF_SETTINGS
  const visibility = getBookingVisibilityFlags(rawSettings)
  const settings = normalizeBookingStaffSettings(rawSettings, {
    viewport: device,
  })

  const patch = (key, value) => {
    onChange(buildBookingStaffViewportPatch(rawSettings, device, key, value))
  }

  const copyDesktopToMobile = () => {
    const snap = snapshotBookingStaffViewportSettings(rawSettings, 'desktop')
    onChange({ mobile: snap })
    setDevice('mobile')
  }

  return (
    <div className={styles.wsMinimal}>
      <div className={styles.wsLabelRow}>
        <p className={styles.wsMiniLabel}>دادهٔ پرسنل</p>
        <Link href="/booking-manage" className={styles.wsGhostLink}>
          مدیریت پرسنل
        </Link>
      </div>
      <p className={styles.wsHint}>
        لیست پرسنل از پنل نوبت‌دهی می‌آید؛ ظاهر کارت‌ها را برای دسکتاپ و موبایل جدا
        تنظیم کنید.
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

      <Accordion id="content" title="محتوا" openId={openId} setOpenId={setOpenId}>
        <p className={styles.wsHint}>متن‌ها برای هر دو دستگاه مشترک است.</p>
        <TextField
          label="Eyebrow"
          value={settings.eyebrow_text}
          onChange={(v) => patch('eyebrow_text', v)}
          placeholder="پرسنل"
        />
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
      </Accordion>

      <Accordion id="display" title="نمایش" openId={openId} setOpenId={setOpenId}>
        <p className={styles.wsMiniLabel}>تعداد ستون</p>
        <Seg
          options={BOOKING_STAFF_COLUMNS}
          value={settings.columns}
          onChange={(v) => patch('columns', v)}
        />
        <div className={styles.wsStack}>
          <Toggle
            checked={!!settings.show_eyebrow}
            onChange={(v) => patch('show_eyebrow', v)}
            label="نمایش eyebrow"
          />
          <Toggle
            checked={!!settings.show_avatar}
            onChange={(v) => patch('show_avatar', v)}
            label="آواتار حرف اول"
          />
          <Toggle
            checked={!!settings.show_role}
            onChange={(v) => patch('show_role', v)}
            label="سمت / عنوان شغلی"
          />
          <Toggle
            checked={!!settings.card_lift}
            onChange={(v) => patch('card_lift', v)}
            label="بالا آمدن کارت در هاور"
          />
          <Toggle
            checked={!!settings.section_full}
            onChange={(v) => patch('section_full', v)}
            label="سکشن تمام‌عرض"
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
            label="حداقل عرض کارت"
            value={settings.card_min}
            onChange={(v) => patch('card_min', v)}
            min={80}
            max={220}
          />
          <PxField
            label="فاصله کارت‌ها"
            value={settings.gap}
            onChange={(v) => patch('gap', v)}
            max={32}
          />
          <PxField
            label="گردی کارت"
            value={settings.card_radius}
            onChange={(v) => patch('card_radius', v)}
            max={28}
          />
          <PxField
            label="پدینگ کارت"
            value={settings.card_padding}
            onChange={(v) => patch('card_padding', v)}
            max={32}
          />
          <PxField
            label="اندازه آواتار"
            value={settings.avatar_size}
            onChange={(v) => patch('avatar_size', v)}
            min={32}
            max={96}
          />
          <PxField
            label="اندازه عنوان"
            value={settings.title_size}
            onChange={(v) => patch('title_size', v)}
            min={16}
            max={40}
          />
          <PxField
            label="اندازه زیرعنوان"
            value={settings.subtitle_size}
            onChange={(v) => patch('subtitle_size', v)}
            min={11}
            max={22}
          />
          <PxField
            label="اندازه نام"
            value={settings.name_size}
            onChange={(v) => patch('name_size', v)}
            min={11}
            max={22}
          />
        </div>
        <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
          Padding
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
        <p className={styles.wsHint}>
          برای موبایل معمولاً ۳ ستون و آواتار کوچک‌تر مناسب‌تر است.
        </p>
      </Accordion>

      <Accordion id="colors" title="رنگ‌ها" openId={openId} setOpenId={setOpenId}>
        <div className={styles.wsColorList}>
          {BOOKING_STAFF_COLORS.map((f) => (
            <ColorRow
              key={f.key}
              label={f.label}
              value={settings[f.key]}
              onChange={(v) => patch(f.key, v)}
              allowTransparent={f.key === 'card_border'}
            />
          ))}
        </div>
      </Accordion>
    </div>
  )
}
