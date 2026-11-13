'use client'

import React, { useState } from 'react'
import { ChevronDown, Monitor, Search, Smartphone } from 'lucide-react'
import {
  DEFAULT_SHOP_SEARCH_SETTINGS,
  SHOP_MARGIN_FIELDS,
  SHOP_SEARCH_DEVICES,
  SHOP_SEARCH_RADIUS_CORNERS,
  SHOP_SEARCH_STYLES,
  SHOP_SEARCH_SUBMIT_MODES,
  SHOP_SPACE_FIELDS,
  buildShopSearchViewportPatch,
  getShopSearchVisibilityFlags,
  normalizeShopSearchSettings,
  snapshotShopSearchViewportSettings,
} from '@/config/shopWidgetSettings'
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
      style={{ gridTemplateColumns: `repeat(${Math.min(options.length, 4)}, 1fr)` }}
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

function ColorRow({ label, value, fallback, onChange }) {
  const hex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value || '')
    ? value
    : fallback
  return (
    <div className={styles.wsColorRow}>
      <span className={styles.wsColorRowLabel}>{label}</span>
      <div className={styles.wsColorRowControls}>
        <input
          className={styles.wsColorHex}
          dir="ltr"
          value={value || ''}
          placeholder={fallback}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          className={styles.wsColorSwatch}
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
        />
      </div>
    </div>
  )
}

function Preview({ settings }) {
  const r = (v) => (v >= 40 ? 999 : v)
  const radius = `${r(settings.bar_radius_tl)}px ${r(settings.bar_radius_tr)}px ${r(
    settings.bar_radius_br
  )}px ${r(settings.bar_radius_bl)}px`
  const showBtn = settings.submit_mode !== 'hidden'
  const showLabel =
    settings.submit_mode === 'label' || settings.submit_mode === 'both'
  const showIconBtn =
    settings.submit_mode === 'icon' || settings.submit_mode === 'both'

  return (
    <div
      style={{
        marginBottom: 12,
        padding: '14px 12px',
        borderRadius: 14,
        background: 'linear-gradient(160deg, #f8fafc, #f1f5f9)',
        border: '1px solid rgba(15,23,42,0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          minHeight: settings.bar_height,
          height: settings.bar_height,
          padding: settings.search_style === 'minimal' ? '0 4px' : '4px 4px 4px 14px',
          borderRadius: radius,
          background:
            settings.search_style === 'minimal'
              ? 'transparent'
              : settings.surface_bg || '#fff',
          border: `${settings.border_width || 1}px solid ${
            settings.border_color || 'rgba(15,23,42,0.1)'
          }`,
          boxShadow: settings.shadow
            ? '0 8px 22px rgba(15,23,42,0.06)'
            : 'none',
          backdropFilter: settings.blur ? `blur(${settings.blur}px)` : undefined,
        }}
      >
        {settings.show_icon ? (
          <Search
            size={15}
            style={{ color: settings.accent_color, flexShrink: 0, opacity: 0.85 }}
          />
        ) : null}
        <span
          style={{
            flex: 1,
            fontSize: settings.font_size || 13,
            fontWeight: 500,
            color: settings.placeholder_color || '#94a3b8',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {settings.placeholder || 'جستجو…'}
        </span>
        {showBtn ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              minHeight: Math.max(32, settings.bar_height - 8),
              padding: showLabel ? '0 12px' : 0,
              width: showLabel ? 'auto' : Math.max(32, settings.bar_height - 8),
              justifyContent: 'center',
              borderRadius: radius,
              background: settings.accent_color || '#0f766e',
              color: settings.button_text || '#fff',
              fontSize: Math.max(10, (settings.font_size || 14) - 2),
              fontWeight: 800,
            }}
          >
            {showIconBtn ? <Search size={13} strokeWidth={2.4} /> : null}
            {showLabel ? settings.submit_label || 'جستجو' : null}
          </span>
        ) : null}
      </div>
      {settings.hint ? (
        <p
          style={{
            margin: '8px 2px 0',
            fontSize: 11,
            fontWeight: 600,
            color: '#64748b',
            textAlign: 'center',
          }}
        >
          {settings.hint}
        </p>
      ) : null}
    </div>
  )
}

export default function WidgetShopSearchSettings({ settings: raw, onChange }) {
  const rawSettings = raw || DEFAULT_SHOP_SEARCH_SETTINGS
  const [device, setDevice] = useState('desktop')
  const [openId, setOpenId] = useState('space')
  const visibility = getShopSearchVisibilityFlags(rawSettings)
  const settings = normalizeShopSearchSettings(rawSettings, {
    viewport: device,
  })

  const patch = (key, value) => {
    onChange?.(buildShopSearchViewportPatch(rawSettings, device, key, value))
  }

  const copyDesktopToMobile = () => {
    onChange?.({
      mobile: snapshotShopSearchViewportSettings(rawSettings, 'desktop'),
    })
    setDevice('mobile')
  }

  const setAllRadii = (v) => {
    const vp = device === 'mobile' ? 'mobile' : 'desktop'
    const current = snapshotShopSearchViewportSettings(rawSettings, vp)
    onChange?.({
      [vp]: {
        ...current,
        bar_radius: v,
        bar_radius_tl: v,
        bar_radius_tr: v,
        bar_radius_br: v,
        bar_radius_bl: v,
      },
    })
  }

  return (
    <div className={styles.wsMinimal}>
      <p className={styles.wsHint}>
        نوار جستجوی فروشگاه — چیدمان مثل نوار خبر فوری، جدا برای دسکتاپ و موبایل
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
        {SHOP_SEARCH_DEVICES.map((d) => {
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

      <Preview settings={settings} />

      <Accordion id="space" title="چیدمان و فاصله" openId={openId} setOpenId={setOpenId}>
        <div className={styles.wsStack}>
          <Toggle
            checked={!!settings.section_full}
            onChange={(v) => patch('section_full', v)}
            label="تمام‌عرض صفحه"
            hint={
              settings.section_full
                ? 'لبه به لبه — مناسب دسکتاپ'
                : 'کارت وسط‌چین تا سقف عرض صفحه'
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
            value={settings.bar_height}
            min={28}
            max={120}
            onChange={(v) => patch('bar_height', v)}
          />
          <PxField
            label="آفست sticky"
            value={settings.sticky_offset}
            max={120}
            onChange={(v) => patch('sticky_offset', v)}
          />
          <PxField
            label="بلور"
            value={settings.blur}
            max={40}
            onChange={(v) => patch('blur', v)}
          />
          <PxField
            label="ضخامت بردر"
            value={settings.border_width}
            max={8}
            onChange={(v) => patch('border_width', v)}
          />
          <PxField
            label="حداکثر عرض نوار"
            value={settings.max_width}
            min={240}
            max={1400}
            onChange={(v) => patch('max_width', v)}
          />
          <PxField
            label="اندازه فونت"
            value={settings.font_size}
            min={10}
            max={22}
            onChange={(v) => patch('font_size', v)}
          />
        </div>

        <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
          گردی گوشه‌ها
        </p>
        <div className={styles.wsPxGrid}>
          <PxField
            label="همه"
            value={settings.bar_radius}
            max={999}
            onChange={setAllRadii}
          />
          {SHOP_SEARCH_RADIUS_CORNERS.map((f) => (
            <PxField
              key={f.key}
              label={f.label}
              value={settings[f.key]}
              max={999}
              onChange={(v) => patch(f.key, v)}
            />
          ))}
        </div>

        <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
          Padding
        </p>
        <div className={styles.wsPxGrid}>
          {SHOP_SPACE_FIELDS.map((f) => (
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
          {SHOP_MARGIN_FIELDS.map((f) => (
            <PxField
              key={f.key}
              label={f.label}
              value={settings[f.key]}
              onChange={(v) => patch(f.key, v)}
            />
          ))}
        </div>
        {settings.section_full ? (
          <p className={styles.wsHint}>
            در تمام‌عرض، مارجین چپ/راست اعمال نمی‌شود
          </p>
        ) : (
          <p className={styles.wsHint}>
            تمام‌عرض خاموش = کارت وسط‌چین؛ برای فاصله بیشتر مارجین چپ/راست بدهید
          </p>
        )}
      </Accordion>

      <Accordion id="content" title="متن و رفتار" openId={openId} setOpenId={setOpenId}>
        <div className={styles.wsFieldStack}>
          <label className={styles.wsField}>
            <span>متن جایگزین</span>
            <input
              value={settings.placeholder}
              onChange={(e) => patch('placeholder', e.target.value)}
              placeholder="جستجوی محصول، برند، دسته…"
            />
          </label>
          <label className={styles.wsField}>
            <span>راهنمای زیر نوار</span>
            <input
              value={settings.hint}
              onChange={(e) => patch('hint', e.target.value)}
              placeholder="مثلاً برند · دسته · کد کالا"
            />
          </label>
          <label className={styles.wsField}>
            <span>آدرس نتایج</span>
            <input
              dir="ltr"
              value={settings.results_href}
              onChange={(e) => patch('results_href', e.target.value)}
              placeholder="/shop"
            />
          </label>
        </div>
        <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
          دکمه ارسال
        </p>
        <Seg
          options={SHOP_SEARCH_SUBMIT_MODES}
          value={settings.submit_mode}
          onChange={(v) => patch('submit_mode', v)}
        />
        {settings.submit_mode === 'label' || settings.submit_mode === 'both' ? (
          <label className={styles.wsField} style={{ marginTop: 8 }}>
            <span>متن دکمه</span>
            <input
              value={settings.submit_label}
              onChange={(e) => patch('submit_label', e.target.value)}
              placeholder="جستجو"
            />
          </label>
        ) : null}
        <div className={styles.wsStack} style={{ marginTop: 6 }}>
          <Toggle
            checked={!!settings.show_icon}
            onChange={(v) => patch('show_icon', v)}
            label="آیکون جستجو داخل نوار"
          />
        </div>
      </Accordion>

      <Accordion id="look" title="ظاهر و رنگ" openId={openId} setOpenId={setOpenId}>
        <p className={styles.wsMiniLabel}>استایل نوار</p>
        <Seg
          options={SHOP_SEARCH_STYLES}
          value={settings.search_style}
          onChange={(v) => patch('search_style', v)}
        />
        <div className={`${styles.wsColorList} ${styles.wsColorListSpaced}`}>
          <ColorRow
            label="پس‌زمینه"
            value={settings.surface_bg}
            fallback="#ffffff"
            onChange={(v) => patch('surface_bg', v)}
          />
          <ColorRow
            label="حاشیه"
            value={settings.border_color}
            fallback="#e2e8f0"
            onChange={(v) => patch('border_color', v)}
          />
          <ColorRow
            label="اکسنت / دکمه"
            value={settings.accent_color}
            fallback="#0f766e"
            onChange={(v) => patch('accent_color', v)}
          />
          <ColorRow
            label="متن"
            value={settings.ink_color}
            fallback="#0f172a"
            onChange={(v) => patch('ink_color', v)}
          />
          <ColorRow
            label="متن جایگزین"
            value={settings.placeholder_color}
            fallback="#94a3b8"
            onChange={(v) => patch('placeholder_color', v)}
          />
          <ColorRow
            label="متن دکمه"
            value={settings.button_text}
            fallback="#ffffff"
            onChange={(v) => patch('button_text', v)}
          />
        </div>
      </Accordion>
    </div>
  )
}
