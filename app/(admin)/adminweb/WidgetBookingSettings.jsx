'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Monitor, Smartphone } from 'lucide-react'
import {
  BOOKING_BAR_COLORS,
  BOOKING_BUTTON_COLORS,
  BOOKING_CALENDAR_DAYS,
  BOOKING_DENSITY,
  BOOKING_DEVICES,
  BOOKING_MARGIN_FIELDS,
  BOOKING_PANEL_COLORS,
  BOOKING_SPACE_FIELDS,
  DEFAULT_BOOKING_FORM_SETTINGS,
  buildBookingViewportPatch,
  getBookingVisibilityFlags,
  normalizeBookingFormSettings,
  snapshotBookingViewportSettings,
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
            title="شفاف"
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

/**
 * پنل تنظیمات فرم رزرو — الگوی نوار خبر فوری (دسکتاپ / موبایل جدا)
 */
export default function WidgetBookingSettings({ settings: raw, onChange }) {
  const [device, setDevice] = useState('desktop')
  const [openId, setOpenId] = useState('display')

  const rawSettings = raw || DEFAULT_BOOKING_FORM_SETTINGS
  const visibility = getBookingVisibilityFlags(rawSettings)
  const settings = normalizeBookingFormSettings(rawSettings, {
    viewport: device,
  })

  const patch = (key, value) => {
    onChange(buildBookingViewportPatch(rawSettings, device, key, value))
  }

  const copyDesktopToMobile = () => {
    const snap = snapshotBookingViewportSettings(rawSettings, 'desktop')
    onChange({ mobile: snap })
    setDevice('mobile')
  }

  return (
    <div className={styles.wsMinimal}>
      <div className={styles.wsLabelRow}>
        <p className={styles.wsMiniLabel}>دادهٔ نوبت‌دهی</p>
        <Link href="/booking-manage" className={styles.wsGhostLink}>
          مدیریت خدمات و نوبت‌ها
        </Link>
      </div>
      <p className={styles.wsHint}>
        خدمات و ساعات از پنل نوبت‌دهی می‌آید؛ اینجا ظاهر فرم را مثل نوار خبر فوری
        برای دسکتاپ و موبایل جدا تنظیم کنید.
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
          ? 'در حال ویرایش ظاهر و نمایش دسکتاپ'
          : 'در حال ویرایش ظاهر و نمایش موبایل / اپ'}
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

      <Accordion id="content" title="محتوا و برچسب‌ها" openId={openId} setOpenId={setOpenId}>
        <p className={styles.wsHint}>متن‌ها برای هر دو دستگاه مشترک است.</p>
        <TextField
          label="Eyebrow"
          value={settings.eyebrow_text}
          onChange={(v) => patch('eyebrow_text', v)}
          placeholder="رزرو"
        />
        <TextField
          label="عنوان"
          value={settings.title}
          onChange={(v) => patch('title', v)}
          placeholder="از نام کسب‌وکار / پیش‌فرض"
        />
        <TextField
          label="زیرعنوان"
          value={settings.subtitle}
          onChange={(v) => patch('subtitle', v)}
          placeholder="چهار مرحله ساده تا تأیید نوبت"
        />
        <TextField
          label="برچسب خدمت"
          value={settings.service_label}
          onChange={(v) => patch('service_label', v)}
        />
        <TextField
          label="برچسب پرسنل"
          value={settings.staff_label}
          onChange={(v) => patch('staff_label', v)}
        />
        <TextField
          label="متن اختیاری پرسنل"
          value={settings.staff_optional_hint}
          onChange={(v) => patch('staff_optional_hint', v)}
        />
        <TextField
          label="برچسب تاریخ"
          value={settings.date_label}
          onChange={(v) => patch('date_label', v)}
        />
        <TextField
          label="برچسب ساعت"
          value={settings.time_label}
          onChange={(v) => patch('time_label', v)}
        />
        <TextField
          label="برچسب نام"
          value={settings.name_label}
          onChange={(v) => patch('name_label', v)}
        />
        <TextField
          label="برچسب موبایل"
          value={settings.mobile_label}
          onChange={(v) => patch('mobile_label', v)}
        />
        <TextField
          label="برچسب یادداشت"
          value={settings.note_label}
          onChange={(v) => patch('note_label', v)}
        />
        <TextField
          label="متن دکمه ثبت"
          value={settings.submit_label}
          onChange={(v) => patch('submit_label', v)}
        />
        <TextField
          label="عنوان موفقیت"
          value={settings.success_title}
          onChange={(v) => patch('success_title', v)}
        />
        <TextField
          label="راهنمای موفقیت"
          value={settings.success_hint}
          onChange={(v) => patch('success_hint', v)}
        />
        <TextField
          label="لینک پیگیری"
          value={settings.lookup_link_label}
          onChange={(v) => patch('lookup_link_label', v)}
        />
      </Accordion>

      <Accordion id="display" title="نمایش" openId={openId} setOpenId={setOpenId}>
        <p className={styles.wsMiniLabel}>تراکم</p>
        <Seg
          options={BOOKING_DENSITY}
          value={settings.density}
          onChange={(v) => patch('density', v)}
        />
        <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
          بازه تقویم
        </p>
        <Seg
          options={BOOKING_CALENDAR_DAYS}
          value={settings.calendar_days}
          onChange={(v) => patch('calendar_days', v)}
        />
        <div className={styles.wsStack}>
          <Toggle
            checked={!!settings.show_panel}
            onChange={(v) => patch('show_panel', v)}
            label="قاب پنل"
            hint="پس‌زمینه و سایه دور فرم"
          />
          <Toggle
            checked={!!settings.show_eyebrow}
            onChange={(v) => patch('show_eyebrow', v)}
            label="نمایش eyebrow"
          />
          <Toggle
            checked={!!settings.show_steps}
            onChange={(v) => patch('show_steps', v)}
            label="نوار مراحل رزرو"
          />
          <Toggle
            checked={!!settings.show_staff_field}
            onChange={(v) => patch('show_staff_field', v)}
            label="فیلد انتخاب پرسنل"
          />
          <Toggle
            checked={!!settings.show_note_field}
            onChange={(v) => patch('show_note_field', v)}
            label="فیلد یادداشت"
          />
          <Toggle
            checked={!!settings.show_prices}
            onChange={(v) => patch('show_prices', v)}
            label="قیمت در لیست خدمات"
          />
          <Toggle
            checked={!!settings.show_duration}
            onChange={(v) => patch('show_duration', v)}
            label="مدت خدمت در لیست"
          />
          <Toggle
            checked={!!settings.panel_shadow}
            onChange={(v) => patch('panel_shadow', v)}
            label="سایه پنل"
          />
          <Toggle
            checked={!!settings.section_full}
            onChange={(v) => patch('section_full', v)}
            label="سکشن تمام‌عرض"
            hint={
              settings.section_full
                ? 'لبه به لبه — مناسب دسکتاپ'
                : 'داخل ستون — مناسب موبایل'
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
            min={280}
            max={900}
          />
          <PxField
            label="گردی پنل"
            value={settings.panel_radius}
            onChange={(v) => patch('panel_radius', v)}
            max={36}
          />
          <PxField
            label="گردی ورودی"
            value={settings.input_radius}
            onChange={(v) => patch('input_radius', v)}
            max={28}
          />
          <PxField
            label="گردی دکمه"
            value={settings.button_radius}
            onChange={(v) => patch('button_radius', v)}
            max={28}
          />
          <PxField
            label="پدینگ داخل پنل"
            value={settings.panel_padding}
            onChange={(v) => patch('panel_padding', v)}
            max={48}
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
          برای موبایل: عرض کمتر، تراکم فشرده، و پدینگ/مارجین جدا تنظیم کنید.
        </p>
      </Accordion>

      <Accordion id="barColors" title="رنگ متن و اکسنت" openId={openId} setOpenId={setOpenId}>
        <div className={styles.wsColorList}>
          {BOOKING_BAR_COLORS.map((f) => (
            <ColorRow
              key={f.key}
              label={f.label}
              value={settings[f.key]}
              onChange={(v) => patch(f.key, v)}
            />
          ))}
        </div>
      </Accordion>

      <Accordion id="panelColors" title="رنگ پنل و ورودی" openId={openId} setOpenId={setOpenId}>
        <div className={styles.wsColorList}>
          {BOOKING_PANEL_COLORS.map((f) => (
            <ColorRow
              key={f.key}
              label={f.label}
              value={settings[f.key]}
              onChange={(v) => patch(f.key, v)}
              allowTransparent={f.key === 'panel_border' || f.key === 'input_border'}
            />
          ))}
        </div>
      </Accordion>

      <Accordion id="btnColors" title="رنگ دکمه و مراحل" openId={openId} setOpenId={setOpenId}>
        <div className={styles.wsColorList}>
          {BOOKING_BUTTON_COLORS.map((f) => (
            <ColorRow
              key={f.key}
              label={f.label}
              value={settings[f.key]}
              onChange={(v) => patch(f.key, v)}
            />
          ))}
        </div>
      </Accordion>
    </div>
  )
}
