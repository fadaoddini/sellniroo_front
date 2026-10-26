'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Monitor, Smartphone } from 'lucide-react'
import {
  SITE_TOP_NAV_COLOR_FIELDS,
  SITE_TOP_NAV_DEVICES,
  SITE_TOP_NAV_MARGIN_FIELDS,
  SITE_TOP_NAV_MOBILE_MODES,
  SITE_TOP_NAV_ALIGNS,
  SITE_TOP_NAV_SPACE_FIELDS,
  DEFAULT_SITE_TOP_NAV_WIDGET_SETTINGS,
  buildSiteTopNavViewportPatch,
  getSiteTopNavVisibilityFlags,
  normalizeSiteTopNavSettings,
  snapshotSiteTopNavViewportSettings,
} from '@/config/siteTopNavWidgetSettings'
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

function PxField({ label, value, onChange, max = 240, min = 0 }) {
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
  const hex = value && /^#/.test(value) ? value : '#0a0b0d'
  return (
    <div className={styles.wsColorRow}>
      <span className={styles.wsColorRowLabel}>{label}</span>
      <div className={styles.wsColorRowControls}>
        <input
          type="color"
          className={styles.wsColorSwatch}
          value={isTransparent ? '#0a0b0d' : hex}
          disabled={isTransparent}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
        />
        <input
          type="text"
          className={styles.wsColorHex}
          dir="ltr"
          value={value || ''}
          placeholder="rgba / #hex"
          onChange={(e) => onChange(e.target.value)}
        />
        {allowTransparent ? (
          <button
            type="button"
            className={`${styles.wsTinyBtn} ${
              isTransparent ? styles.wsTinyBtnOn : ''
            }`}
            onClick={() =>
              onChange(isTransparent ? '#0a0b0d' : 'transparent')
            }
          >
            شفاف
          </button>
        ) : null}
      </div>
    </div>
  )
}

function TextField({ label, value, onChange, placeholder, dir }) {
  return (
    <label className={styles.wsPxField}>
      <span>{label}</span>
      <input
        type="text"
        className={styles.wsColorHex}
        style={{ width: '100%', maxWidth: 'none' }}
        value={value || ''}
        placeholder={placeholder}
        dir={dir}
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

export default function WidgetSiteTopNavSettings({
  settings: raw,
  onChange,
}) {
  const rawSettings = raw || DEFAULT_SITE_TOP_NAV_WIDGET_SETTINGS
  const [device, setDevice] = useState('desktop')
  const [openId, setOpenId] = useState('mobileNav')
  const visibility = getSiteTopNavVisibilityFlags(rawSettings)
  const settings = normalizeSiteTopNavSettings(rawSettings, {
    viewport: device,
  })

  const patch = (key, value) => {
    onChange(buildSiteTopNavViewportPatch(rawSettings, device, key, value))
  }

  const copyDesktopToMobile = () => {
    onChange({
      mobile: snapshotSiteTopNavViewportSettings(rawSettings, 'desktop'),
    })
    setDevice('mobile')
  }

  return (
    <div className={styles.wsMinimal}>
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
        {SITE_TOP_NAV_DEVICES.map((d) => {
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
          ? 'فقط ظاهر و رفتار دسکتاپ'
          : 'فقط ظاهر و رفتار موبایل — از دسکتاپ جدا است'}
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

      <Accordion
        id="mobileNav"
        title="نمایش موبایل"
        openId={openId}
        setOpenId={setOpenId}
      >
        <div className={styles.wsStack}>
          <Toggle
            checked={!!settings.mobile_bottom_nav}
            onChange={(v) => patch('mobile_bottom_nav', v)}
            label="منوی پایین موبایل"
            hint="ظاهر و لینک‌ها از داشبورد /header-menu"
          />
          <Toggle
            checked={!!settings.mobile_show_top}
            onChange={(v) => patch('mobile_show_top', v)}
            label="نوار منوی بالا در موبایل"
            hint="اگر خاموش باشد فقط منوی پایین دیده می‌شود"
          />
          <Toggle
            checked={!!settings.show_logo}
            onChange={(v) => patch('show_logo', v)}
            label="نمایش لوگو در بالا"
            hint="برای ویوپورت فعلی (دسکتاپ یا موبایل)"
          />
        </div>
        <Link href="/header-menu?tab=mobile" className={styles.wsGhostLink}>
          تنظیم ظاهر منوی پایین در داشبورد
        </Link>
      </Accordion>

      <Accordion id="content" title="محتوا و برند" openId={openId} setOpenId={setOpenId}>
        <div className={styles.wsStack}>
          <Toggle
            checked={!!settings.use_site_logo}
            onChange={(v) => patch('use_site_logo', v)}
            label="لوگو از ظاهر منو"
            hint="از /header-menu?tab=desktop"
          />
          <Toggle
            checked={!!settings.filter_by_modules}
            onChange={(v) => patch('filter_by_modules', v)}
            label="فیلتر لینک‌ها با ماژول‌های فعال"
          />
        </div>
        <div className={styles.wsLabelRow}>
          <p className={styles.wsMiniLabel}>آیتم‌های منو</p>
          <Link href="/header-menu?tab=links" className={styles.wsGhostLink}>
            مدیریت لینک‌ها
          </Link>
        </div>
        <Link href="/header-menu?tab=desktop" className={styles.wsGhostLink}>
          ظاهر دسکتاپ
        </Link>
        <Link href="/header-menu?tab=mobile" className={styles.wsGhostLink}>
          ظاهر موبایل
        </Link>
        <TextField
          label="لینک لوگو"
          value={settings.logo_href}
          onChange={(v) => patch('logo_href', v)}
          placeholder="/"
          dir="ltr"
        />
        <TextField
          label="نام سایت (فارسی)"
          value={settings.site_name_fa}
          onChange={(v) => patch('site_name_fa', v)}
        />
        <TextField
          label="نام سایت (انگلیسی)"
          value={settings.site_name_en}
          onChange={(v) => patch('site_name_en', v)}
          dir="ltr"
        />
        <TextField
          label="متن CTA"
          value={settings.cta_label}
          onChange={(v) => patch('cta_label', v)}
        />
        <TextField
          label="لینک CTA"
          value={settings.cta_href}
          onChange={(v) => patch('cta_href', v)}
          placeholder="/post-job"
          dir="ltr"
        />
      </Accordion>

      <Accordion id="layout" title="چیدمان و فاصله" openId={openId} setOpenId={setOpenId}>
        <div className={styles.wsStack}>
          <Toggle
            checked={!!settings.full_bleed}
            onChange={(v) => patch('full_bleed', v)}
            label="تمام‌عرض صفحه"
            hint={
              settings.full_bleed
                ? 'لبه به لبه — مناسب دسکتاپ'
                : 'کارت inset با فاصله — مناسب موبایل'
            }
          />
          <Toggle
            checked={!!settings.sticky}
            onChange={(v) => patch('sticky', v)}
            label="چسبان (sticky)"
          />
          <Toggle
            checked={!!settings.shadow}
            onChange={(v) => patch('shadow', v)}
            label="سایه"
          />
        </div>
        <div className={styles.wsPxGrid}>
          <PxField
            label="ارتفاع"
            value={settings.height}
            onChange={(v) => patch('height', v)}
            min={40}
            max={120}
          />
          <PxField
            label="آفست sticky"
            value={settings.sticky_offset}
            onChange={(v) => patch('sticky_offset', v)}
            max={120}
          />
          <PxField
            label="بلور"
            value={settings.blur}
            onChange={(v) => patch('blur', v)}
            max={40}
          />
          <PxField
            label="ضخامت بردر"
            value={settings.border_width}
            onChange={(v) => patch('border_width', v)}
            max={4}
          />
          <PxField
            label="گردی"
            value={settings.radius}
            onChange={(v) => patch('radius', v)}
            max={40}
          />
          <PxField
            label="ارتفاع لوگو"
            value={settings.logo_height}
            onChange={(v) => patch('logo_height', v)}
            min={20}
            max={72}
          />
        </div>
        <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
          Padding
        </p>
        <div className={styles.wsPxGrid}>
          {SITE_TOP_NAV_SPACE_FIELDS.map((f) => (
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
          {SITE_TOP_NAV_MARGIN_FIELDS.map((f) => (
            <PxField
              key={f.key}
              label={f.label}
              value={settings[f.key]}
              onChange={(v) => patch(f.key, v)}
            />
          ))}
        </div>
      </Accordion>

      <Accordion id="nav" title="منو و لینک‌ها" openId={openId} setOpenId={setOpenId}>
        <div className={styles.wsStack}>
          <Toggle
            checked={!!settings.show_nav}
            onChange={(v) => patch('show_nav', v)}
            label="نمایش لینک‌های منو"
          />
          <Toggle
            checked={!!settings.show_icons}
            onChange={(v) => patch('show_icons', v)}
            label="آیکن کنار لینک"
          />
          <Toggle
            checked={!!settings.show_labels}
            onChange={(v) => patch('show_labels', v)}
            label="متن لینک"
          />
          <Toggle
            checked={!!settings.underline}
            onChange={(v) => patch('underline', v)}
            label="خط زیر هاور"
          />
          <Toggle
            checked={!!settings.show_cta}
            onChange={(v) => patch('show_cta', v)}
            label="دکمه CTA"
          />
        </div>
        <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
          تراز منو
        </p>
        <Seg
          options={SITE_TOP_NAV_ALIGNS}
          value={settings.nav_align}
          onChange={(v) => patch('nav_align', v)}
        />
        {device === 'mobile' ? (
          <>
            <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
              حالت موبایل
            </p>
            <Seg
              options={SITE_TOP_NAV_MOBILE_MODES}
              value={settings.mobile_mode}
              onChange={(v) => patch('mobile_mode', v)}
            />
          </>
        ) : null}
        <div className={styles.wsPxGrid}>
          <PxField
            label="فاصله لینک‌ها"
            value={settings.nav_gap}
            onChange={(v) => patch('nav_gap', v)}
            max={32}
          />
          <PxField
            label="گردی لینک"
            value={settings.link_radius}
            onChange={(v) => patch('link_radius', v)}
            max={24}
          />
          <PxField
            label="اندازه فونت"
            value={settings.font_size}
            onChange={(v) => patch('font_size', v)}
            min={10}
            max={20}
          />
          {device === 'mobile' && settings.mobile_mode === 'drawer' ? (
            <PxField
              label="عرض کشو"
              value={settings.drawer_width}
              onChange={(v) => patch('drawer_width', v)}
              min={220}
              max={420}
            />
          ) : null}
        </div>
      </Accordion>

      <Accordion id="colors" title="رنگ‌ها" openId={openId} setOpenId={setOpenId}>
        <div className={`${styles.wsColorList} ${styles.wsColorListSpaced}`}>
          {SITE_TOP_NAV_COLOR_FIELDS.map((f) => (
            <ColorRow
              key={f.key}
              label={f.label}
              value={settings[f.key]}
              onChange={(v) => patch(f.key, v)}
              allowTransparent={f.key === 'color_bg' || f.key === 'color_border'}
            />
          ))}
        </div>
      </Accordion>
    </div>
  )
}
