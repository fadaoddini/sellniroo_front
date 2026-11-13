'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ExternalLink, Monitor, Smartphone } from 'lucide-react'
import {
  DEFAULT_SOFTAPPS_WIDGET_SETTINGS,
  SOFTAPPS_CARD_SKELETONS,
  SOFTAPPS_CARD_STYLES,
  SOFTAPPS_COLUMNS,
  SOFTAPPS_DEVICES,
  SOFTAPPS_DISPLAY_MODES,
  SOFTAPPS_FONTS,
  SOFTAPPS_ICON_SHAPES,
  SOFTAPPS_MARGIN_FIELDS,
  SOFTAPPS_PLATFORMS,
  SOFTAPPS_PRICING_FILTERS,
  SOFTAPPS_SPACE_FIELDS,
  SOFTAPPS_TITLE_ALIGNS,
  buildSoftAppsViewportPatch,
  getSoftAppsVisibilityFlags,
  isSoftAppsCtaWidgetType,
  isSoftAppsGridWidgetType,
  normalizeSoftAppsWidgetSettings,
  snapshotSoftAppsViewportSettings,
} from '@/config/softappsWidgetSettings'
import softappsService from '@/components/SoftApps/services/softappsService'
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
            key={String(opt.id)}
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

function ColorRow({ label, value, onChange }) {
  const hex = value && /^#/.test(value) ? value : '#0e7490'
  return (
    <div className={styles.wsColorRow}>
      <span className={styles.wsColorRowLabel}>{label}</span>
      <div className={styles.wsColorRowControls}>
        <input
          type="color"
          className={styles.wsColorSwatch}
          value={hex}
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
        {value ? (
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

function TextField({ label, value, onChange, dir, placeholder }) {
  return (
    <label className={styles.wsPxField}>
      <span>{label}</span>
      <input
        type="text"
        className={styles.wsInput}
        style={{ width: '100%' }}
        value={value || ''}
        dir={dir}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

function SelectField({ label, value, onChange, children }) {
  return (
    <label className={styles.wsPxField}>
      <span>{label}</span>
      <select
        className={styles.wsSelect}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
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

const SORT_OPTIONS = [
  { id: 'default', label: 'پیش‌فرض' },
  { id: 'downloads', label: 'بیشترین دانلود' },
  { id: 'newest', label: 'جدیدترین' },
  { id: 'price', label: 'قیمت' },
]

/**
 * پنل تنظیمات ویجت نرم‌افزار — دسکتاپ و موبایل جدا (مثل نوار خبر فوری)
 */
export default function WidgetSoftAppsSettings({
  type = 'softapps_grid',
  settings: raw,
  onChange,
}) {
  const isGrid = isSoftAppsGridWidgetType(type)
  const isCta = isSoftAppsCtaWidgetType(type)
  const isFeatured = type === 'softapps_featured'

  const [device, setDevice] = useState('desktop')
  const [openId, setOpenId] = useState(isCta ? 'cta' : 'content')
  const [categories, setCategories] = useState([])

  const rawSettings = raw || DEFAULT_SOFTAPPS_WIDGET_SETTINGS
  const visibility = getSoftAppsVisibilityFlags(rawSettings)
  const settings = normalizeSoftAppsWidgetSettings(rawSettings, type, {
    viewport: device,
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await softappsService.list()
      if (cancelled) return
      setCategories(res.data?.categories || [])
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const patch = (key, value) => {
    onChange(buildSoftAppsViewportPatch(rawSettings, device, key, value, type))
  }

  const patchViewportMany = (obj) => {
    const vp = device === 'mobile' ? 'mobile' : 'desktop'
    const current = snapshotSoftAppsViewportSettings(rawSettings, vp, type)
    onChange({ [vp]: { ...current, ...obj } })
  }

  const copyDesktopToMobile = () => {
    const snap = snapshotSoftAppsViewportSettings(rawSettings, 'desktop', type)
    onChange({ mobile: snap })
    setDevice('mobile')
  }

  return (
    <div className={styles.wsMinimal}>
      <div className={styles.wsLabelRow}>
        <p className={styles.wsMiniLabel}>ویجت نرم‌افزار</p>
        <Link href="/apps-manage" className={styles.wsGhostLink} target="_blank">
          مدیریت محتوا <ExternalLink size={12} />
        </Link>
      </div>

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
      <div
        className={styles.wsSeg}
        style={{ gridTemplateColumns: '1fr 1fr' }}
      >
        {SOFTAPPS_DEVICES.map((d) => {
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
          ? 'در حال ویرایش ظاهر و چیدمان دسکتاپ'
          : 'در حال ویرایش ظاهر و چیدمان موبایل / اپ'}
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

      {isCta ? (
        <Accordion id="cta" title="دکمه CTA" openId={openId} setOpenId={setOpenId}>
          <TextField
            label="متن دکمه"
            value={settings.cta_label}
            onChange={(v) => patch('cta_label', v)}
          />
          <TextField
            label="آدرس (مشترک)"
            value={settings.cta_href}
            onChange={(v) => patch('cta_href', v)}
            dir="ltr"
          />
          <p className={styles.wsMiniLabel}>تراز</p>
          <Seg
            options={SOFTAPPS_TITLE_ALIGNS}
            value={settings.cta_align}
            onChange={(v) => patch('cta_align', v)}
          />
          <div className={styles.wsStack}>
            <Toggle
              checked={settings.cta_full_width}
              onChange={(v) => patch('cta_full_width', v)}
              label="تمام‌عرض دکمه"
            />
          </div>
          <ColorRow
            label="رنگ دکمه"
            value={settings.accent_color}
            onChange={(v) => patch('accent_color', v || '#0e7490')}
          />
        </Accordion>
      ) : null}

      {isGrid ? (
        <>
          <Accordion id="content" title="محتوا و عنوان" openId={openId} setOpenId={setOpenId}>
            <div className={styles.wsStack}>
              <Toggle
                checked={settings.show_brand}
                onChange={(v) => patch('show_brand', v)}
                label="نمایش برند"
              />
            </div>
            {settings.show_brand ? (
              <TextField
                label="متن برند"
                value={settings.brand_text}
                onChange={(v) => patch('brand_text', v)}
              />
            ) : null}
            <div className={styles.wsStack}>
              <Toggle
                checked={settings.show_title}
                onChange={(v) => patch('show_title', v)}
                label="نمایش عنوان"
              />
            </div>
            {settings.show_title ? (
              <TextField
                label="عنوان"
                value={settings.title_text}
                placeholder={
                  isFeatured ? 'نرم‌افزارهای ویژه' : 'نرم‌افزارهای کاربردی'
                }
                onChange={(v) => patch('title_text', v)}
              />
            ) : null}
            <div className={styles.wsStack}>
              <Toggle
                checked={settings.show_subtitle}
                onChange={(v) => patch('show_subtitle', v)}
                label="نمایش زیرعنوان"
              />
            </div>
            {settings.show_subtitle ? (
              <TextField
                label="زیرعنوان"
                value={settings.subtitle_text}
                placeholder="جمله کوتاه توضیحی…"
                onChange={(v) => patch('subtitle_text', v)}
              />
            ) : null}
            <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
              تراز عنوان
            </p>
            <Seg
              options={SOFTAPPS_TITLE_ALIGNS}
              value={settings.title_align}
              onChange={(v) => patch('title_align', v)}
            />
          </Accordion>

          <Accordion id="data" title="منبع داده (مشترک)" openId={openId} setOpenId={setOpenId}>
            <p className={styles.wsHint}>
              فیلتر و تعداد برای دسکتاپ و موبایل یکسان است.
            </p>
            <div className={styles.wsPxGrid}>
              <PxField
                label="تعداد آیتم"
                value={settings.limit}
                min={1}
                max={48}
                onChange={(v) => patch('limit', v)}
              />
              <PxField
                label="رد کردن از اول"
                value={settings.offset}
                min={0}
                max={200}
                onChange={(v) => patch('offset', v)}
              />
            </div>
            <div className={styles.wsStack}>
              <Toggle
                checked={settings.featured_only}
                onChange={(v) => patch('featured_only', v)}
                label="فقط ویژه"
                hint={
                  isFeatured
                    ? 'در این ویجت معمولاً روشن می‌ماند'
                    : 'فقط نرم‌افزارهای علامت‌خورده ویژه'
                }
              />
            </div>
            <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
              فیلتر قیمت
            </p>
            <Seg
              options={SOFTAPPS_PRICING_FILTERS}
              value={settings.pricing}
              onChange={(v) => patch('pricing', v)}
              cols={3}
            />
            <SelectField
              label="دسته"
              value={settings.category_id}
              onChange={(v) => patch('category_id', v)}
            >
              <option value="">همه دسته‌ها</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="پلتفرم"
              value={settings.platform}
              onChange={(v) => patch('platform', v)}
            >
              {SOFTAPPS_PLATFORMS.map((p) => (
                <option key={p.id || 'all'} value={p.id}>
                  {p.label}
                </option>
              ))}
            </SelectField>
            <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
              مرتب‌سازی
            </p>
            <Seg
              options={SORT_OPTIONS}
              value={settings.sort}
              onChange={(v) => patch('sort', v)}
              cols={2}
            />
          </Accordion>

          <Accordion id="layout" title="چیدمان و کارت" openId={openId} setOpenId={setOpenId}>
            <div className={styles.wsStack}>
              <Toggle
                checked={settings.section_full}
                onChange={(v) => patch('section_full', v)}
                label="تمام‌عرض سکشن"
              />
            </div>

            <p className={styles.wsMiniLabel}>اسکلتون کارت (۴ حالت)</p>
            <p className={styles.wsHint}>
              عمودی یا افقی — با یک کلیک چیدمان کارت تنظیم می‌شود.
            </p>
            <div className={styles.wsPresetGrid}>
              {SOFTAPPS_CARD_SKELETONS.map((preset) => {
                const on = settings.card_skeleton === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`${styles.wsPresetCard} ${
                      on ? styles.wsPresetCardOn : ''
                    }`}
                    onClick={() => patchViewportMany({ ...preset.patch })}
                  >
                    <div
                      className={`${styles.wsPresetSkel} ${
                        styles[`wsSaSkel_${preset.skeleton}`] || ''
                      }`}
                      aria-hidden
                    >
                      <div className={styles.wsSaSkelCard}>
                        <i className={styles.wsSaSkelIcon} />
                        <span className={styles.wsSaSkelLines}>
                          <i className={styles.wsPresetSkelLine} />
                          <i className={styles.wsPresetSkelLineShort} />
                        </span>
                      </div>
                    </div>
                    <strong>{preset.label}</strong>
                    <small>{preset.desc}</small>
                  </button>
                )
              })}
            </div>

            <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
              حالت نمایش سکشن
            </p>
            <Seg
              options={SOFTAPPS_DISPLAY_MODES}
              value={settings.display_mode}
              onChange={(v) => patch('display_mode', v)}
              cols={3}
            />
            {settings.display_mode === 'grid' ? (
              <>
                <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
                  تعداد ستون
                </p>
                <Seg
                  options={SOFTAPPS_COLUMNS}
                  value={settings.columns}
                  onChange={(v) => patch('columns', Number(v))}
                  cols={3}
                />
              </>
            ) : null}
            {settings.display_mode === 'recycler' ? (
              <PxField
                label="عرض کارت ریسایکلر"
                value={settings.recycler_card_width}
                min={140}
                max={360}
                onChange={(v) => patch('recycler_card_width', v)}
              />
            ) : null}
            <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
              استایل کارت
            </p>
            <Seg
              options={SOFTAPPS_CARD_STYLES}
              value={settings.card_style}
              onChange={(v) => patch('card_style', v)}
              cols={2}
            />
            <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
              شکل آیکن
            </p>
            <Seg
              options={SOFTAPPS_ICON_SHAPES}
              value={settings.icon_shape}
              onChange={(v) => patch('icon_shape', v)}
              cols={3}
            />
            <PxField
              label="اندازه آیکن"
              value={settings.icon_size}
              min={32}
              max={120}
              onChange={(v) => patch('icon_size', v)}
            />

            <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
              فونت عنوان بخش
            </p>
            <Seg
              options={SOFTAPPS_FONTS}
              value={settings.title_font || 'edameh'}
              onChange={(v) => patch('title_font', v)}
              cols={2}
            />
            <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
              فونت عنوان کارت
            </p>
            <Seg
              options={SOFTAPPS_FONTS}
              value={settings.card_title_font || 'edameh'}
              onChange={(v) => patch('card_title_font', v)}
              cols={2}
            />
            <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
              فونت متن / توضیح
            </p>
            <Seg
              options={SOFTAPPS_FONTS}
              value={settings.body_font || 'iran'}
              onChange={(v) => patch('body_font', v)}
              cols={2}
            />
          </Accordion>

          <Accordion id="fields" title="فیلدهای کارت" openId={openId} setOpenId={setOpenId}>
            <div className={styles.wsStack}>
              <Toggle
                checked={settings.show_icon}
                onChange={(v) => patch('show_icon', v)}
                label="آیکن"
              />
              <Toggle
                checked={settings.show_desc}
                onChange={(v) => patch('show_desc', v)}
                label="توضیح کوتاه"
              />
              <Toggle
                checked={settings.show_price}
                onChange={(v) => patch('show_price', v)}
                label="قیمت"
              />
              <Toggle
                checked={settings.show_downloads}
                onChange={(v) => patch('show_downloads', v)}
                label="تعداد دانلود"
              />
              <Toggle
                checked={settings.show_platform}
                onChange={(v) => patch('show_platform', v)}
                label="پلتفرم"
              />
              <Toggle
                checked={settings.show_version}
                onChange={(v) => patch('show_version', v)}
                label="نسخه"
              />
              <Toggle
                checked={settings.show_badges}
                onChange={(v) => patch('show_badges', v)}
                label="نشان رایگان/پولی"
              />
              <Toggle
                checked={settings.show_category}
                onChange={(v) => patch('show_category', v)}
                label="نام دسته"
              />
            </div>
          </Accordion>

          <Accordion id="more" title="لینک مشاهده همه" openId={openId} setOpenId={setOpenId}>
            <div className={styles.wsStack}>
              <Toggle
                checked={settings.show_more_link}
                onChange={(v) => patch('show_more_link', v)}
                label="نمایش لینک"
              />
            </div>
            <TextField
              label="متن لینک"
              value={settings.more_label}
              onChange={(v) => patch('more_label', v)}
            />
            <TextField
              label="آدرس (مشترک)"
              value={settings.more_href}
              onChange={(v) => patch('more_href', v)}
              dir="ltr"
            />
          </Accordion>
        </>
      ) : null}

      <Accordion id="space" title="فاصله و حاشیه" openId={openId} setOpenId={setOpenId}>
        <div className={styles.wsPxGrid}>
          {SOFTAPPS_SPACE_FIELDS.map((f) => (
            <PxField
              key={f.key}
              label={`پدینگ ${f.label}`}
              value={settings[f.key]}
              onChange={(v) => patch(f.key, v)}
            />
          ))}
          {SOFTAPPS_MARGIN_FIELDS.map((f) => (
            <PxField
              key={f.key}
              label={`مارجین ${f.label}`}
              value={settings[f.key]}
              onChange={(v) => patch(f.key, v)}
            />
          ))}
        </div>
        {isGrid ? (
          <>
            <PxField
              label="فاصله بین آیتم‌ها"
              value={settings.gap}
              max={48}
              onChange={(v) => patch('gap', v)}
            />
            <PxField
              label="حداکثر عرض"
              value={settings.max_width}
              min={280}
              max={1600}
              onChange={(v) => patch('max_width', v)}
            />
          </>
        ) : null}
      </Accordion>

      <Accordion id="colors" title="رنگ‌ها" openId={openId} setOpenId={setOpenId}>
        <ColorRow
          label="اکسنت"
          value={settings.accent_color}
          onChange={(v) => patch('accent_color', v || '#0e7490')}
        />
        <ColorRow
          label="متن اصلی"
          value={settings.ink_color}
          onChange={(v) => patch('ink_color', v)}
        />
        <ColorRow
          label="متن فرعی"
          value={settings.muted_color}
          onChange={(v) => patch('muted_color', v)}
        />
        <ColorRow
          label="پس‌زمینه سکشن"
          value={settings.surface_bg}
          onChange={(v) => patch('surface_bg', v)}
        />
        {isGrid ? (
          <ColorRow
            label="پس‌زمینه کارت"
            value={settings.card_bg}
            onChange={(v) => patch('card_bg', v)}
          />
        ) : null}
      </Accordion>
    </div>
  )
}
