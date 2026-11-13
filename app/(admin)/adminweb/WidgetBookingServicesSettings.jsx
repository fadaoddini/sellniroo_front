'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Monitor, Smartphone } from 'lucide-react'
import {
  BOOKING_DEVICES,
  BOOKING_MARGIN_FIELDS,
  BOOKING_SERVICES_COLORS,
  BOOKING_SERVICES_COLUMNS,
  BOOKING_SERVICES_CTA_COLORS,
  BOOKING_SERVICES_CTA_HEIGHTS,
  BOOKING_SERVICES_CTA_SIDES,
  BOOKING_SERVICES_CTA_STYLES,
  BOOKING_SERVICES_LAYOUTS,
  BOOKING_SERVICES_SURFACE_MODES,
  BOOKING_SERVICES_SURFACE_SPANS,
  BOOKING_SPACE_FIELDS,
  DEFAULT_BOOKING_SERVICES_SETTINGS,
  buildBookingServicesViewportPatch,
  buildBookingServicesViewportPatchMany,
  getBookingVisibilityFlags,
  normalizeBookingServicesSettings,
  snapshotBookingServicesViewportSettings,
} from '@/config/bookingWidgetSettings'
import LucideIconPicker from '@/components/common/LucideIconPicker'
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

function ServicesLayoutSkel({ skeleton }) {
  if (skeleton === 'svc_list') {
    return (
      <div
        className={`${styles.wsPresetSkel} ${styles.wsPresetSkel_svc_list}`}
        aria-hidden
      >
        {[0, 1].map((i) => (
          <div key={i} className={styles.wsPresetSkelSvcRow}>
            <i className={styles.wsPresetSkelDot} />
            <i className={styles.wsPresetSkelLine} />
            <i className={styles.wsPresetSkelLineShort} />
            <i className={styles.wsPresetSkelBtn} />
          </div>
        ))}
      </div>
    )
  }

  const count = skeleton === 'svc_compact' ? 4 : 3
  return (
    <div
      className={`${styles.wsPresetSkel} ${
        styles[`wsPresetSkel_${skeleton}`] || ''
      }`}
      aria-hidden
    >
      <div
        className={styles.wsPresetSkelCards}
        style={{
          gridTemplateColumns: `repeat(${count}, 1fr)`,
          flex: 1,
          display: 'grid',
          gap: 4,
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={styles.wsPresetSkelCard}>
            <i className={styles.wsPresetSkelDot} />
            <i className={styles.wsPresetSkelLine} />
            <i className={styles.wsPresetSkelLineShort} />
            <i className={styles.wsPresetSkelBtn} />
          </div>
        ))}
      </div>
    </div>
  )
}

/** پنل تنظیمات خدمات نوبت‌دهی — الگوی نوار خبر فوری */
export default function WidgetBookingServicesSettings({
  settings: raw,
  onChange,
}) {
  const [device, setDevice] = useState('desktop')
  const [openId, setOpenId] = useState('layout')

  const rawSettings = raw || DEFAULT_BOOKING_SERVICES_SETTINGS
  const visibility = getBookingVisibilityFlags(rawSettings)
  const settings = normalizeBookingServicesSettings(rawSettings, {
    viewport: device,
  })

  const patch = (key, value) => {
    onChange(buildBookingServicesViewportPatch(rawSettings, device, key, value))
  }

  const patchMany = (obj) => {
    onChange(buildBookingServicesViewportPatchMany(rawSettings, device, obj))
  }

  const copyDesktopToMobile = () => {
    const snap = snapshotBookingServicesViewportSettings(rawSettings, 'desktop')
    onChange({ mobile: snap })
    setDevice('mobile')
  }

  return (
    <div className={styles.wsMinimal}>
      <div className={styles.wsLabelRow}>
        <p className={styles.wsMiniLabel}>دادهٔ خدمات</p>
        <Link href="/booking-manage" className={styles.wsGhostLink}>
          مدیریت خدمات
        </Link>
      </div>
      <p className={styles.wsHint}>
        لیست خدمات از پنل نوبت‌دهی می‌آید؛ ظاهر کارت‌ها را برای دسکتاپ و موبایل جدا
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

      <Accordion id="layout" title="طرح چیدمان" openId={openId} setOpenId={setOpenId}>
        <p className={styles.wsHint}>
          یکی از طرح‌ها را انتخاب کنید؛ بعداً می‌توانید ستون‌ها و جزئیات را دستی عوض کنید.
        </p>
        <div className={styles.wsPresetGrid}>
          {BOOKING_SERVICES_LAYOUTS.map((preset) => {
            const on = settings.layout === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                className={`${styles.wsPresetCard} ${
                  on ? styles.wsPresetCardOn : ''
                }`}
                onClick={() => patchMany({ ...preset.patch })}
              >
                <ServicesLayoutSkel skeleton={preset.skeleton} />
                <strong>{preset.label}</strong>
                <small>{preset.desc}</small>
              </button>
            )
          })}
        </div>
      </Accordion>

      <Accordion id="content" title="محتوا" openId={openId} setOpenId={setOpenId}>
        <p className={styles.wsHint}>متن‌ها برای هر دو دستگاه مشترک است.</p>
        <TextField
          label="Eyebrow"
          value={settings.eyebrow_text}
          onChange={(v) => patch('eyebrow_text', v)}
          placeholder="خدمات"
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
        <TextField
          label="متن لینک کارت"
          value={settings.cta_label}
          onChange={(v) => patch('cta_label', v)}
          placeholder="رزرو"
        />
        <TextField
          label="پایه لینک (قبل از id)"
          value={settings.link_base}
          onChange={(v) => patch('link_base', v)}
          placeholder="/booking?service="
        />
      </Accordion>

      <Accordion id="display" title="نمایش" openId={openId} setOpenId={setOpenId}>
        <p className={styles.wsMiniLabel}>تعداد ستون</p>
        <Seg
          options={BOOKING_SERVICES_COLUMNS}
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
            checked={!!settings.show_duration}
            onChange={(v) => patch('show_duration', v)}
            label="مدت خدمت"
          />
          <Toggle
            checked={!!settings.show_price}
            onChange={(v) => patch('show_price', v)}
            label="قیمت"
          />
          <Toggle
            checked={!!settings.show_cta}
            onChange={(v) => patch('show_cta', v)}
            label="لینک رزرو روی کارت"
          />
          <Toggle
            checked={!!settings.show_dot}
            onChange={(v) => patch('show_dot', v)}
            label="نقطه رنگی"
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
            hint={
              settings.section_full ? 'لبه به لبه صفحه' : 'داخل ستون محتوا'
            }
          />
        </div>

        <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
          پس‌زمینه سکشن
        </p>
        <Seg
          options={BOOKING_SERVICES_SURFACE_MODES}
          value={settings.surface_mode || 'transparent'}
          onChange={(v) => patch('surface_mode', v)}
        />
        {(settings.surface_mode || 'transparent') === 'color' ? (
          <>
            <ColorRow
              label="رنگ پس‌زمینه"
              value={settings.surface_bg}
              onChange={(v) => patch('surface_bg', v)}
            />
            <p className={styles.wsMiniLabel}>محدوده رنگ</p>
            <Seg
              options={BOOKING_SERVICES_SURFACE_SPANS}
              value={settings.surface_span || 'full'}
              onChange={(v) => patch('surface_span', v)}
            />
          </>
        ) : null}
      </Accordion>

      <Accordion id="cta" title="دکمه رزرو" openId={openId} setOpenId={setOpenId}>
        <p className={styles.wsHint}>
          شکل، جای قرارگیری، آیکن Lucide و رنگ دکمه رزرو روی هر کارت را تنظیم کنید.
        </p>
        <p className={styles.wsMiniLabel}>شکل</p>
        <Seg
          options={BOOKING_SERVICES_CTA_STYLES}
          value={settings.cta_style || 'text'}
          onChange={(v) => {
            if (v === 'rail') {
              patchMany({
                cta_style: 'rail',
                cta_side: 'left',
                cta_height: 'near',
                cta_width: 30,
                cta_show_label: false,
                cta_show_icon: true,
                cta_icon: settings.cta_icon || 'ArrowLeft',
                cta_bg: settings.cta_bg || '#0f766e',
                cta_color: '#ffffff',
                cta_hover_bg: settings.cta_hover_bg || '#0b5f59',
              })
            } else if (v === 'chip') {
              patchMany({
                cta_style: 'chip',
                cta_side: 'bottom',
                cta_height: 'auto',
                cta_show_label: true,
                cta_show_icon: true,
                cta_radius: settings.cta_radius || 10,
                cta_bg: settings.cta_bg || '#0f766e',
                cta_color: '#ffffff',
              })
            } else {
              patchMany({
                cta_style: 'text',
                cta_side: 'bottom',
                cta_height: 'auto',
                cta_show_label: true,
                cta_show_icon: true,
                cta_color: '#0f766e',
                cta_bg: 'transparent',
              })
            }
          }}
        />

        {(settings.cta_style || 'text') === 'rail' ? (
          <>
            <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
              سمت نوار
            </p>
            <Seg
              options={BOOKING_SERVICES_CTA_SIDES.filter(
                (s) => s.id === 'left' || s.id === 'right',
              )}
              value={
                settings.cta_side === 'right' ? 'right' : 'left'
              }
              onChange={(v) => patch('cta_side', v)}
            />
            <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
              ارتفاع نوار
            </p>
            <Seg
              options={BOOKING_SERVICES_CTA_HEIGHTS}
              value={settings.cta_height || 'near'}
              onChange={(v) => patch('cta_height', v)}
            />
            <div className={styles.wsPxGrid}>
              <PxField
                label="عرض نوار"
                value={settings.cta_width}
                onChange={(v) => patch('cta_width', v)}
                min={20}
                max={80}
              />
              <PxField
                label="گردی نوار"
                value={settings.cta_radius}
                onChange={(v) => patch('cta_radius', v)}
                max={28}
              />
            </div>
          </>
        ) : null}

        {(settings.cta_style || 'text') === 'chip' ? (
          <div className={styles.wsPxGrid}>
            <PxField
              label="گردی دکمه"
              value={settings.cta_radius}
              onChange={(v) => patch('cta_radius', v)}
              max={28}
            />
          </div>
        ) : null}

        <div className={styles.wsStack}>
          <Toggle
            checked={!!settings.cta_show_icon}
            onChange={(v) => patch('cta_show_icon', v)}
            label="نمایش آیکن"
          />
          <Toggle
            checked={!!settings.cta_show_label}
            onChange={(v) => patch('cta_show_label', v)}
            label="نمایش متن دکمه"
          />
        </div>

        {settings.cta_show_icon ? (
          <>
            <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
              آیکن Lucide
            </p>
            <LucideIconPicker
              value={settings.cta_icon || 'ArrowLeft'}
              onChange={(name) => patch('cta_icon', name)}
            />
            <div className={styles.wsPxGrid}>
              <PxField
                label="اندازه آیکن"
                value={settings.cta_icon_size}
                onChange={(v) => patch('cta_icon_size', v)}
                min={10}
                max={28}
              />
            </div>
          </>
        ) : null}

        <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
          رنگ دکمه
        </p>
        <div className={styles.wsColorList}>
          {BOOKING_SERVICES_CTA_COLORS.map((f) => (
            <ColorRow
              key={f.key}
              label={f.label}
              value={settings[f.key]}
              onChange={(v) => patch(f.key, v)}
              allowTransparent={
                f.key === 'cta_bg' ||
                f.key === 'cta_border' ||
                f.key === 'cta_hover_bg'
              }
            />
          ))}
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
            min={120}
            max={280}
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
          برای موبایل معمولاً ۲ ستون و حداقل عرض کارت کمتر مناسب‌تر است.
        </p>
      </Accordion>

      <Accordion id="colors" title="رنگ‌ها" openId={openId} setOpenId={setOpenId}>
        <div className={styles.wsColorList}>
          {BOOKING_SERVICES_COLORS.map((f) => (
            <ColorRow
              key={f.key}
              label={f.label}
              value={settings[f.key]}
              onChange={(v) => patch(f.key, v)}
              allowTransparent={
                f.key === 'card_border' || f.key === 'card_bg'
              }
            />
          ))}
        </div>
      </Accordion>
    </div>
  )
}
