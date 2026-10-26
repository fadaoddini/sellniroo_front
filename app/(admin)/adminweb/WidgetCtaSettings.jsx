'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Smartphone } from 'lucide-react'
import {
  CTA_LAYOUTS,
  CTA_MARGIN_FIELDS,
  CTA_SPACE_FIELDS,
  DEFAULT_CTA_WIDGET_SETTINGS,
  normalizeCtaWidgetSettings,
} from '@/config/ctaWidgetSettings'
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

function Seg({ options, value, onChange, cols }) {
  return (
    <div
      className={styles.wsSeg}
      style={{
        gridTemplateColumns: `repeat(${cols || options.length}, 1fr)`,
      }}
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
  const hex = value && /^#/.test(value) ? value : '#0b1220'
  return (
    <div className={styles.wsColorRow}>
      <span className={styles.wsColorRowLabel}>{label}</span>
      <div className={styles.wsColorRowControls}>
        <input
          type="color"
          className={styles.wsColorSwatch}
          value={isTransparent ? '#0b1220' : hex}
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

export default function WidgetCtaSettings({ settings: raw, onChange }) {
  const settings = normalizeCtaWidgetSettings(
    raw || DEFAULT_CTA_WIDGET_SETTINGS
  )
  const [openId, setOpenId] = useState('display')
  const patch = (key, value) => onChange({ [key]: value })

  return (
    <div className={styles.wsMinimal}>
      <div
        className={`${styles.wsMobileCard} ${
          settings.show_on_mobile ? '' : styles.wsMobileCardOff
        }`}
      >
        <div className={styles.wsMobileMeta}>
          <Smartphone size={15} strokeWidth={1.75} />
          <div>
            <strong>موبایل</strong>
            <span>
              {settings.show_on_mobile ? 'نمایش داده می‌شود' : 'مخفی زیر ۷۶۸px'}
            </span>
          </div>
        </div>
        <span
          className={`${styles.wsSwitch} ${
            settings.show_on_mobile ? styles.wsSwitchOn : ''
          }`}
        >
          <input
            type="checkbox"
            checked={!!settings.show_on_mobile}
            onChange={(e) => patch('show_on_mobile', e.target.checked)}
            aria-label="نمایش در موبایل"
          />
          <i />
        </span>
      </div>

      <Accordion id="content" title="محتوا" openId={openId} setOpenId={setOpenId}>
        <div className={styles.wsLabelRow}>
          <p className={styles.wsMiniLabel}>متن و کانال‌ها</p>
          <Link href="/site-settings" className={styles.wsGhostLink}>
            تنظیمات سایت
          </Link>
        </div>
        <p className={styles.wsHint}>
          عنوان، توضیح، تلفن و ایمیل از تنظیمات سایت خوانده می‌شود.
        </p>
        <div className={styles.wsLabelRow}>
          <p className={styles.wsMiniLabel}>انواع درخواست</p>
          <Link href="/request-types" className={styles.wsGhostLink}>
            مدیریت و ایمپورت پیش‌فرض
          </Link>
        </div>
        <p className={styles.wsHint}>
          حداقل سه نوع با آیکون Lucide: همکاری، تبلیغات، مشاوره — از صفحهٔ مدیریت
          ایمپورت کنید.
        </p>
        <TextField
          label="متن بالای عنوان (eyebrow)"
          value={settings.eyebrow_text}
          onChange={(v) => patch('eyebrow_text', v)}
          placeholder="ارتباط با سلنیرو"
        />
        <TextField
          label="عنوان فرم"
          value={settings.form_title}
          onChange={(v) => patch('form_title', v)}
          placeholder="فرم درخواست"
        />
        <TextField
          label="زیرعنوان فرم"
          value={settings.form_subtitle}
          onChange={(v) => patch('form_subtitle', v)}
          placeholder="در کمتر از یک دقیقه ارسال کنید"
        />
      </Accordion>

      <Accordion id="display" title="نمایش" openId={openId} setOpenId={setOpenId}>
        <p className={styles.wsMiniLabel}>چیدمان</p>
        <Seg
          options={CTA_LAYOUTS}
          value={settings.layout}
          onChange={(v) => patch('layout', v)}
        />
        <div className={styles.wsStack}>
          <Toggle
            checked={!!settings.section_full}
            onChange={(v) => patch('section_full', v)}
            label="سکشن تمام‌عرض"
            hint="پس‌زمینه لبه به لبه صفحه"
          />
          <Toggle
            checked={!!settings.show_eyebrow}
            onChange={(v) => patch('show_eyebrow', v)}
            label="نمایش eyebrow"
          />
          <Toggle
            checked={!!settings.show_channels}
            onChange={(v) => patch('show_channels', v)}
            label="نمایش کانال‌های تماس"
          />
          <Toggle
            checked={!!settings.show_form}
            onChange={(v) => patch('show_form', v)}
            label="نمایش فرم درخواست"
          />
          <Toggle
            checked={!!settings.show_email_field}
            onChange={(v) => patch('show_email_field', v)}
            label="فیلد ایمیل در فرم"
          />
          <Toggle
            checked={!!settings.show_request_type}
            onChange={(v) => patch('show_request_type', v)}
            label="انتخاب نوع درخواست"
          />
          <Toggle
            checked={!!settings.show_bg_grid}
            onChange={(v) => patch('show_bg_grid', v)}
            label="شبکه پس‌زمینه"
          />
          <Toggle
            checked={!!settings.show_bg_orb}
            onChange={(v) => patch('show_bg_orb', v)}
            label="نور تزئینی پس‌زمینه"
          />
        </div>
      </Accordion>

      <Accordion id="colors" title="رنگ‌ها" openId={openId} setOpenId={setOpenId}>
        <ColorRow
          label="پس‌زمینه شروع"
          value={settings.bg_from}
          onChange={(v) => patch('bg_from', v)}
        />
        <ColorRow
          label="پس‌زمینه پایان"
          value={settings.bg_to}
          onChange={(v) => patch('bg_to', v)}
        />
        <ColorRow
          label="نور گرادیان"
          value={settings.bg_accent}
          onChange={(v) => patch('bg_accent', v)}
        />
        <ColorRow
          label="رنگ عنوان"
          value={settings.title_color}
          onChange={(v) => patch('title_color', v)}
        />
        <ColorRow
          label="رنگ متن"
          value={settings.text_color}
          onChange={(v) => patch('text_color', v)}
        />
        <ColorRow
          label="رنگ متن ثانویه"
          value={settings.muted_color}
          onChange={(v) => patch('muted_color', v)}
        />
        <ColorRow
          label="اکسنت"
          value={settings.accent_color}
          onChange={(v) => patch('accent_color', v)}
        />
        <ColorRow
          label="اکسنت تیره"
          value={settings.accent_deep}
          onChange={(v) => patch('accent_deep', v)}
        />
        <ColorRow
          label="کارت فرم (شروع)"
          value={settings.card_from}
          onChange={(v) => patch('card_from', v)}
        />
        <ColorRow
          label="کارت فرم (پایان)"
          value={settings.card_to}
          onChange={(v) => patch('card_to', v)}
        />
        <ColorRow
          label="بردر کارت"
          value={settings.card_border}
          onChange={(v) => patch('card_border', v)}
        />
        <ColorRow
          label="پس‌زمینه اینپوت"
          value={settings.input_bg}
          onChange={(v) => patch('input_bg', v)}
        />
        <ColorRow
          label="بردر اینپوت"
          value={settings.input_border}
          onChange={(v) => patch('input_border', v)}
        />
        <ColorRow
          label="دکمه ارسال (شروع)"
          value={settings.button_from}
          onChange={(v) => patch('button_from', v)}
        />
        <ColorRow
          label="دکمه ارسال (پایان)"
          value={settings.button_to}
          onChange={(v) => patch('button_to', v)}
        />
        <ColorRow
          label="متن دکمه"
          value={settings.button_text}
          onChange={(v) => patch('button_text', v)}
        />
        <ColorRow
          label="پس‌زمینه کانال تماس"
          value={settings.channel_bg}
          onChange={(v) => patch('channel_bg', v)}
        />
      </Accordion>

      <Accordion id="type" title="تایپوگرافی و فرم" openId={openId} setOpenId={setOpenId}>
        <div className={styles.wsPxGrid}>
          <PxField
            label="سایز عنوان"
            value={settings.title_size}
            onChange={(v) => patch('title_size', v)}
            min={16}
            max={48}
          />
          <PxField
            label="سایز توضیح"
            value={settings.desc_size}
            onChange={(v) => patch('desc_size', v)}
            min={12}
            max={24}
          />
          <PxField
            label="عرض محتوا"
            value={settings.max_width}
            onChange={(v) => patch('max_width', v)}
            min={640}
            max={1600}
          />
          <PxField
            label="فاصله دو ستون"
            value={settings.columns_gap}
            onChange={(v) => patch('columns_gap', v)}
            max={80}
          />
          <PxField
            label="گردی فرم"
            value={settings.form_radius}
            onChange={(v) => patch('form_radius', v)}
            max={40}
          />
          <PxField
            label="گردی اینپوت"
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
            label="گردی کانال"
            value={settings.channel_radius}
            onChange={(v) => patch('channel_radius', v)}
            max={28}
          />
          <PxField
            label="پدینگ فرم"
            value={settings.form_padding}
            onChange={(v) => patch('form_padding', v)}
            max={48}
          />
        </div>
        <div className={styles.wsStack}>
          <Toggle
            checked={!!settings.form_shadow}
            onChange={(v) => patch('form_shadow', v)}
            label="سایه کارت فرم"
          />
        </div>
      </Accordion>

      <Accordion id="space" title="فاصله (px)" openId={openId} setOpenId={setOpenId}>
        <p className={styles.wsMiniLabel}>Padding سکشن</p>
        <div className={styles.wsPxGrid}>
          {CTA_SPACE_FIELDS.map((f) => (
            <PxField
              key={f.key}
              label={f.label}
              value={settings[f.key]}
              onChange={(v) => patch(f.key, v)}
              max={200}
            />
          ))}
        </div>
        <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
          Margin
        </p>
        <div className={styles.wsPxGrid}>
          {CTA_MARGIN_FIELDS.map((f) => (
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
    </div>
  )
}
