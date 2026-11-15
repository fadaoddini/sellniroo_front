'use client'

import React, { useCallback, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Monitor, Smartphone, Upload, Music2, X } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@/contexts/AuthContext'
import Config from '@/config/config'
import {
  DEFAULT_REBO_WIDGET_SETTINGS,
  REBO_ALIGNS,
  REBO_COLOR_FIELDS,
  REBO_DEVICES,
  REBO_MARGIN_FIELDS,
  REBO_SPACE_FIELDS,
  buildReboViewportPatch,
  getReboVisibilityFlags,
  normalizeReboWidgetSettings,
  normalizeUsecaseIndustries,
  reboContentFieldsForType,
} from '@/config/reboWidgetSettings'
import {
  DEFAULT_REBO_DIAL_ITEMS,
  normalizeDialItems,
} from '@/components/widgets/rebo/reboDialDefaults'
import { widgetMeta } from '@/config/pageBuilderWidgets'
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
  const hex = value && /^#/.test(value) ? value : '#1d1d1f'
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

function TextField({ label, value, onChange, placeholder, multiline }) {
  return (
    <label className={styles.wsPxField}>
      <span>{label}</span>
      {multiline ? (
        <textarea
          rows={3}
          className={styles.wsColorHex}
          style={{ width: '100%', maxWidth: 'none', minHeight: 72 }}
          value={value || ''}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type="text"
          className={styles.wsColorHex}
          style={{ width: '100%', maxWidth: 'none' }}
          value={value || ''}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
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

const CONTENT_LABELS = {
  brand: 'برند',
  headline: 'تیتر اصلی',
  title: 'عنوان بخش',
  subtitle: 'توضیح کوتاه',
  eyebrow: 'برچسب بالای عنوان',
  kicker: 'برچسب کوچک (kicker)',
  cta_label: 'متن دکمه اصلی',
  cta_href: 'لینک دکمه اصلی',
  secondary_label: 'متن دکمه دوم',
  secondary_href: 'لینک دکمه دوم',
  sky_brand_text: 'متن لامپی آسمان',
  music_url: 'آدرس فایل موزیک (URL)',
  music_label: 'متن دکمه پلی',
}

const USECASE_BUILDING_OPTIONS = [
  { id: 'salon', label: 'آرایشگاه' },
  { id: 'clinic', label: 'مطب' },
  { id: 'restaurant', label: 'رستوران' },
  { id: 'shop', label: 'فروشگاه' },
  { id: 'company', label: 'شرکت' },
  { id: 'school', label: 'آموزشگاه' },
]

const SKY_BULB_COLOR_OPTIONS = [
  { id: 'custom', label: 'سفارشی' },
  { id: 'red', label: 'قرمز' },
  { id: 'green', label: 'سبز' },
  { id: 'multi', label: 'چندرنگ' },
]

function MusicDropZone({ url, onUploaded, onClear, onUrlChange }) {
  const { getAuthHeaders } = useAuth()
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const uploadFile = useCallback(
    async (file) => {
      if (!file) return
      setError('')
      setUploading(true)
      try {
        const fd = new FormData()
        fd.append('upload', file)
        const headers = { ...getAuthHeaders() }
        delete headers['Content-Type']
        const res = await axios.post(
          `${Config.baseUrl}/api/news/upload-rebo-media/`,
          fd,
          { headers },
        )
        const rawPath = res.data?.path || ''
        const rawUrl = res.data?.url || ''
        let nextUrl = rawPath || rawUrl
        // ترجیح مسیر نسبی /media/... تا از فرانت (rewrite) پخش شود
        if (nextUrl && /^https?:\/\//i.test(nextUrl)) {
          try {
            const u = new URL(nextUrl)
            if (u.pathname.startsWith('/media/')) nextUrl = u.pathname
          } catch {
            /* keep */
          }
        }
        if (!nextUrl) throw new Error('آدرس فایل برنگشت')
        onUploaded(nextUrl)
      } catch (err) {
        setError(
          err?.response?.data?.error ||
            err?.message ||
            'آپلود ناموفق بود',
        )
      } finally {
        setUploading(false)
      }
    },
    [getAuthHeaders, onUploaded],
  )

  return (
    <div className={styles.wsStack}>
      <div
        className={`${styles.wsDropZone || ''} ${dragging ? styles.wsDropZoneActive || '' : ''}`}
        style={{
          border: `2px dashed ${dragging ? '#16a34a' : 'rgba(0,0,0,0.18)'}`,
          borderRadius: 12,
          padding: '1rem',
          background: dragging ? 'rgba(22,163,74,0.06)' : 'rgba(0,0,0,0.02)',
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
        }}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setDragging(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const file = e.dataTransfer?.files?.[0]
          if (file) uploadFile(file)
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
      >
        <Music2 size={22} style={{ marginBottom: 6, opacity: 0.7 }} />
        <div style={{ fontSize: 13, fontWeight: 700 }}>
          {uploading
            ? 'در حال آپلود…'
            : 'فایل موزیک را اینجا رها کنید'}
        </div>
        <div style={{ fontSize: 11, opacity: 0.65, marginTop: 4 }}>
          یا کلیک کنید · mp3 / wav / ogg / m4a · تا ۲۰MB
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) uploadFile(file)
            e.target.value = ''
          }}
        />
      </div>
      {error ? (
        <p className={styles.wsHint} style={{ color: '#dc2626' }}>
          {error}
        </p>
      ) : null}
      <TextField
        label="آدرس فایل موزیک"
        value={url || ''}
        onChange={onUrlChange}
        placeholder="/media/rebo/audio/…"
      />
      {url ? (
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <audio controls src={url} style={{ maxWidth: '100%', height: 32 }} />
          <button type="button" className={styles.wsTinyBtn} onClick={onClear}>
            <X size={12} /> حذف
          </button>
        </div>
      ) : null}
      <p className={styles.wsHint}>
        <Upload size={12} style={{ verticalAlign: 'middle' }} /> فایل روی سرور
        ذخیره می‌شود و لینک در تنظیمات ویجت می‌ماند.
      </p>
    </div>
  )
}

/**
 * پنل تنظیمات ویجت‌های ربو — محتوا + دسکتاپ/موبایل جدا
 */
export default function WidgetReboSettings({ type, settings: raw, onChange }) {
  const widgetType = type || 'rebo_hero'
  const [device, setDevice] = useState('desktop')
  const [openId, setOpenId] = useState('content')

  const rawSettings = raw || DEFAULT_REBO_WIDGET_SETTINGS
  const visibility = getReboVisibilityFlags(rawSettings)
  const settings = normalizeReboWidgetSettings(rawSettings, widgetType, {
    viewport: device,
  })
  const contentKeys = reboContentFieldsForType(widgetType)
  const meta = widgetMeta(widgetType)

  const patchRoot = (key, value) => onChange({ [key]: value })
  const patchVp = (key, value) =>
    onChange(buildReboViewportPatch(rawSettings, device, key, value, widgetType))

  return (
    <div className={styles.wsMinimal}>
      <p className={styles.wsHint}>
        {meta?.desc || 'تنظیمات اختصاصی این بخش از لندینگ ربو'}
        {' · '}
        <Link href="/rebo-pricing" className={styles.wsGhostLink}>
          قیمت‌گذاری ربو
        </Link>
        {' · '}
        <Link href="/cloud-manage" className={styles.wsGhostLink}>
          سرور ابری
        </Link>
      </p>

      <div
        className={`${styles.wsMobileCard} ${
          visibility.show_on_desktop ? '' : styles.wsMobileCardOff
        }`}
      >
        <div className={styles.wsMobileMeta}>
          <Monitor size={15} strokeWidth={1.75} />
          <div>
            <strong>دسکتاپ</strong>
            <span>
              {visibility.show_on_desktop
                ? 'نمایش داده می‌شود'
                : 'مخفی روی دسکتاپ'}
            </span>
          </div>
        </div>
        <span
          className={`${styles.wsSwitch} ${
            visibility.show_on_desktop ? styles.wsSwitchOn : ''
          }`}
        >
          <input
            type="checkbox"
            checked={!!visibility.show_on_desktop}
            onChange={(e) => patchRoot('show_on_desktop', e.target.checked)}
            aria-label="نمایش در دسکتاپ"
          />
          <i />
        </span>
      </div>

      <div
        className={`${styles.wsMobileCard} ${
          visibility.show_on_mobile ? '' : styles.wsMobileCardOff
        }`}
      >
        <div className={styles.wsMobileMeta}>
          <Smartphone size={15} strokeWidth={1.75} />
          <div>
            <strong>موبایل</strong>
            <span>
              {visibility.show_on_mobile
                ? 'نمایش داده می‌شود'
                : 'مخفی زیر ۷۶۸px'}
            </span>
          </div>
        </div>
        <span
          className={`${styles.wsSwitch} ${
            visibility.show_on_mobile ? styles.wsSwitchOn : ''
          }`}
        >
          <input
            type="checkbox"
            checked={!!visibility.show_on_mobile}
            onChange={(e) => patchRoot('show_on_mobile', e.target.checked)}
            aria-label="نمایش در موبایل"
          />
          <i />
        </span>
      </div>

      {contentKeys.length ? (
        <Accordion
          id="content"
          title="محتوا"
          openId={openId}
          setOpenId={setOpenId}
        >
          {contentKeys.includes('show_pricing_calculator') ? (
            <Toggle
              checked={!!settings.show_pricing_calculator}
              onChange={(v) => patchRoot('show_pricing_calculator', v)}
              label="نمایش برآورد هزینه"
            />
          ) : null}
          {contentKeys.includes('show_cloud_order') ? (
            <Toggle
              checked={!!settings.show_cloud_order}
              onChange={(v) => patchRoot('show_cloud_order', v)}
              label="نمایش سفارش سرور ابری"
            />
          ) : null}
          {contentKeys
            .filter(
              (k) =>
                k !== 'show_pricing_calculator' && k !== 'show_cloud_order',
            )
            .map((key) => (
              <TextField
                key={key}
                label={CONTENT_LABELS[key] || key}
                value={settings[key]}
                onChange={(v) => patchRoot(key, v)}
                multiline={key === 'subtitle' || key === 'headline'}
                placeholder={CONTENT_LABELS[key] || ''}
              />
            ))}
        </Accordion>
      ) : null}

      {widgetType === 'rebo_usecases' || widgetType === 'school_animation' ? (
        <>
          <Accordion
            id="usecase_scene"
            title="عناصر صحنه پیکسلی"
            openId={openId}
            setOpenId={setOpenId}
          >
            <p className={styles.wsHint}>
              هر لایه را جدا روشن/خاموش کنید تا صحنه صنایع را بسازید.
            </p>
            <div className={styles.wsStack}>
              <Toggle
                checked={!!settings.show_sky_brand}
                onChange={(v) => patchRoot('show_sky_brand', v)}
                label="تابلوی لامپی آسمان"
              />
              <Toggle
                checked={!!settings.show_clouds}
                onChange={(v) => patchRoot('show_clouds', v)}
                label="ابرها"
              />
              <Toggle
                checked={!!settings.show_birds}
                onChange={(v) => patchRoot('show_birds', v)}
                label="پرنده‌ها"
              />
              <Toggle
                checked={!!settings.show_planes}
                onChange={(v) => patchRoot('show_planes', v)}
                label="هواپیما"
              />
              <Toggle
                checked={!!settings.show_city}
                onChange={(v) => patchRoot('show_city', v)}
                label="شهر شلوغ پشت صحنه"
              />
              <Toggle
                checked={!!settings.show_buildings}
                onChange={(v) => patchRoot('show_buildings', v)}
                label="ساختمان‌های صنایع"
              />
              <Toggle
                checked={!!settings.show_trees}
                onChange={(v) => patchRoot('show_trees', v)}
                label="درخت‌های کنار جاده"
              />
              <Toggle
                checked={!!settings.show_road}
                onChange={(v) => patchRoot('show_road', v)}
                label="جاده متحرک"
              />
              <Toggle
                checked={!!settings.show_walker}
                onChange={(v) => patchRoot('show_walker', v)}
                label="کاراکتر ربو"
              />
              <Toggle
                checked={!!settings.show_checks}
                onChange={(v) => patchRoot('show_checks', v)}
                label="تیک سبز هنگام عبور"
              />
              <Toggle
                checked={!!settings.show_sky_flash}
                onChange={(v) => patchRoot('show_sky_flash', v)}
                label="فلاش سبز آسمان"
              />
            </div>
            <TextField
              label="متن لامپی آسمان"
              value={settings.sky_brand_text}
              onChange={(v) => patchRoot('sky_brand_text', v)}
              placeholder="REBO.IR"
            />
            <p className={styles.wsMiniLabel}>حالت رنگ لامپ‌ها</p>
            <Seg
              options={SKY_BULB_COLOR_OPTIONS}
              value={settings.sky_bulb_color || 'custom'}
              onChange={(v) => patchRoot('sky_bulb_color', v)}
            />
            {(settings.sky_bulb_color || 'custom') === 'custom' ? (
              <ColorRow
                label="رنگ نور لامپ‌ها"
                value={settings.sky_bulb_hex || '#e11d48'}
                onChange={(v) => {
                  patchRoot('sky_bulb_hex', v)
                  patchRoot('sky_bulb_color', 'custom')
                }}
              />
            ) : null}
            <Toggle
              checked={settings.scene_full_page !== false}
              onChange={(v) => patchRoot('scene_full_page', v)}
              label="ارتفاع تمام‌صفحه (۱ صفحه)"
            />
            {settings.scene_full_page === false ? (
              <PxField
                label="ارتفاع صحنه"
                value={settings.scene_height || 380}
                min={220}
                max={1400}
                onChange={(v) => patchRoot('scene_height', v)}
              />
            ) : null}
          </Accordion>

          <Accordion
            id="usecase_speeds"
            title="سرعت انیمیشن هر بخش"
            openId={openId}
            setOpenId={setOpenId}
          >
            <p className={styles.wsHint}>
              عدد بالاتر = حرکت سریع‌تر. برای ساختمان‌ها مدت یک دور کامل را
              تنظیم کنید (عدد کمتر = سریع‌تر).
            </p>
            <PxField
              label="مدت یک دور ساختمان‌ها (ثانیه)"
              value={settings.building_loop_seconds || 14}
              min={6}
              max={60}
              onChange={(v) => patchRoot('building_loop_seconds', v)}
            />
            <PxField
              label="سرعت شهر پشت‌صحنه ٪"
              value={settings.city_speed_factor || 32}
              min={5}
              max={200}
              onChange={(v) => patchRoot('city_speed_factor', v)}
            />
            <PxField
              label="سرعت درخت‌ها ٪"
              value={settings.tree_speed_factor || 55}
              min={5}
              max={200}
              onChange={(v) => patchRoot('tree_speed_factor', v)}
            />
            <PxField
              label="سرعت جاده ٪"
              value={settings.road_speed_factor || 100}
              min={5}
              max={200}
              onChange={(v) => patchRoot('road_speed_factor', v)}
            />
            <PxField
              label="سرعت ابرها ٪"
              value={settings.cloud_speed_factor || 100}
              min={5}
              max={200}
              onChange={(v) => patchRoot('cloud_speed_factor', v)}
            />
            <PxField
              label="سرعت پرنده‌ها ٪"
              value={settings.bird_speed_factor || 100}
              min={5}
              max={200}
              onChange={(v) => patchRoot('bird_speed_factor', v)}
            />
            <PxField
              label="سرعت هواپیما ٪"
              value={settings.plane_speed_factor || 100}
              min={5}
              max={200}
              onChange={(v) => patchRoot('plane_speed_factor', v)}
            />
          </Accordion>

          <Accordion
            id="usecase_industries"
            title="صنایع / ساختمان‌ها"
            openId={openId}
            setOpenId={setOpenId}
          >
            <p className={styles.wsHint}>
              برچسب و نوع شکل هر ساختمان را تنظیم کنید (حداکثر ۱۲ مورد).
            </p>
            {normalizeUsecaseIndustries(settings.usecase_industries).map(
              (item, idx) => (
                <div
                  key={`ind-${idx}`}
                  className={styles.wsStack}
                  style={{
                    marginBottom: '0.75rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <TextField
                    label={`برچسب #${idx + 1}`}
                    value={item.label}
                    onChange={(v) => {
                      const next = normalizeUsecaseIndustries(
                        settings.usecase_industries,
                      ).map((row, i) =>
                        i === idx ? { ...row, label: v } : row,
                      )
                      patchRoot('usecase_industries', next)
                    }}
                  />
                  <p className={styles.wsMiniLabel}>شکل ساختمان</p>
                  <Seg
                    options={USECASE_BUILDING_OPTIONS}
                    value={item.id}
                    onChange={(v) => {
                      const next = normalizeUsecaseIndustries(
                        settings.usecase_industries,
                      ).map((row, i) => (i === idx ? { ...row, id: v } : row))
                      patchRoot('usecase_industries', next)
                    }}
                  />
                  <button
                    type="button"
                    className={styles.wsTinyBtn}
                    onClick={() => {
                      const next = normalizeUsecaseIndustries(
                        settings.usecase_industries,
                      ).filter((_, i) => i !== idx)
                      patchRoot('usecase_industries', next)
                    }}
                  >
                    حذف
                  </button>
                </div>
              ),
            )}
            <button
              type="button"
              className={styles.wsGhostLink}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
              onClick={() => {
                const cur = normalizeUsecaseIndustries(
                  settings.usecase_industries,
                )
                if (cur.length >= 12) return
                const base =
                  USECASE_BUILDING_OPTIONS[
                    cur.length % USECASE_BUILDING_OPTIONS.length
                  ]
                patchRoot('usecase_industries', [
                  ...cur,
                  { id: base.id, label: base.label },
                ])
              }}
            >
              + افزودن صنعت
            </button>
          </Accordion>

          <Accordion
            id="usecase_music"
            title="موزیک پیکسلی آسمان"
            openId={openId}
            setOpenId={setOpenId}
          >
            <p className={styles.wsHint}>
              دکمه پلی پیکسلی روی آسمان؛ با کلیک کاربر موزیک پخش می‌شود (مرورگرها
              بدون تعامل کاربر صدا را بلاک می‌کنند).
            </p>
            <Toggle
              checked={!!settings.show_music_btn}
              onChange={(v) => patchRoot('show_music_btn', v)}
              label="نمایش دکمه پلی"
            />
            <Toggle
              checked={!!settings.music_loop}
              onChange={(v) => patchRoot('music_loop', v)}
              label="پخش حلقه‌ای"
            />
            <MusicDropZone
              url={settings.music_url}
              onUploaded={(u) => patchRoot('music_url', u)}
              onClear={() => patchRoot('music_url', '')}
              onUrlChange={(v) => patchRoot('music_url', v)}
            />
            <TextField
              label="متن دکمه"
              value={settings.music_label}
              onChange={(v) => patchRoot('music_label', v)}
              placeholder="پخش موسیقی"
            />
            <PxField
              label="بلندی صدا ٪"
              value={settings.music_volume ?? 70}
              min={0}
              max={100}
              onChange={(v) => patchRoot('music_volume', v)}
            />
          </Accordion>
        </>
      ) : null}

      {widgetType === 'rebo_hero' ? (
        <Accordion
          id="dial"
          title="مدار دایره‌ای اسلایدر"
          openId={openId}
          setOpenId={setOpenId}
        >
          <p className={styles.wsHint}>
            هر نقطه روی مدار یک اسلاید است؛ با چرخش، پس‌زمینه و متن عوض می‌شود.
          </p>
          {normalizeDialItems(settings.dial_items).map((item, idx) => (
            <div
              key={item.id || idx}
              className={styles.wsStack}
              style={{
                marginBottom: '0.75rem',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <TextField
                label={`برچسب مدار #${idx + 1}`}
                value={item.label}
                onChange={(v) => {
                  const next = normalizeDialItems(settings.dial_items).map(
                    (row, i) => (i === idx ? { ...row, label: v } : row),
                  )
                  patchRoot('dial_items', next)
                }}
              />
              <TextField
                label="عنوان اسلاید"
                value={item.title}
                onChange={(v) => {
                  const next = normalizeDialItems(settings.dial_items).map(
                    (row, i) => (i === idx ? { ...row, title: v } : row),
                  )
                  patchRoot('dial_items', next)
                }}
              />
              <TextField
                label="توضیح"
                value={item.desc}
                multiline
                onChange={(v) => {
                  const next = normalizeDialItems(settings.dial_items).map(
                    (row, i) => (i === idx ? { ...row, desc: v } : row),
                  )
                  patchRoot('dial_items', next)
                }}
              />
              <ColorRow
                label="رنگ اسلاید"
                value={item.color}
                onChange={(v) => {
                  const next = normalizeDialItems(settings.dial_items).map(
                    (row, i) => (i === idx ? { ...row, color: v } : row),
                  )
                  patchRoot('dial_items', next)
                }}
              />
              <button
                type="button"
                className={styles.wsTinyBtn}
                onClick={() => {
                  const next = normalizeDialItems(settings.dial_items).filter(
                    (_, i) => i !== idx,
                  )
                  patchRoot('dial_items', next)
                }}
              >
                حذف این نقطه
              </button>
            </div>
          ))}
          <button
            type="button"
            className={styles.wsGhostLink}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
            onClick={() => {
              const cur = normalizeDialItems(settings.dial_items)
              const base =
                DEFAULT_REBO_DIAL_ITEMS[cur.length % DEFAULT_REBO_DIAL_ITEMS.length]
              patchRoot('dial_items', [
                ...cur,
                {
                  ...base,
                  id: `custom_${Date.now().toString(36)}`,
                  label: 'مورد جدید',
                  title: 'عنوان جدید',
                  desc: 'توضیح این بخش از مدار…',
                },
              ])
            }}
          >
            + افزودن نقطه به مدار
          </button>
        </Accordion>
      ) : null}

      <Accordion
        id="visibility"
        title="نمایش عناصر"
        openId={openId}
        setOpenId={setOpenId}
      >
        <div className={styles.wsStack}>
          {widgetType === 'rebo_hero' || widgetType === 'rebo_closing' || widgetType === 'rebo_showcase' ? (
            <Toggle
              checked={!!settings.show_brand}
              onChange={(v) => patchRoot('show_brand', v)}
              label="نمایش برند"
            />
          ) : null}
          {(widgetType === 'rebo_hero' || widgetType === 'rebo_showcase') && (
            <Toggle
              checked={!!settings.show_headline}
              onChange={(v) => patchRoot('show_headline', v)}
              label="نمایش تیتر"
            />
          )}
          {widgetType === 'rebo_pricing' ? (
            <>
              <Toggle
                checked={!!settings.show_kicker}
                onChange={(v) => patchRoot('show_kicker', v)}
                label="نمایش برچسب «برآورد»"
              />
              <Toggle
                checked={!!settings.show_title}
                onChange={(v) => patchRoot('show_title', v)}
                label="نمایش عنوان «هزینه را همین‌جا ببینید»"
              />
              <Toggle
                checked={!!settings.show_subtitle}
                onChange={(v) => patchRoot('show_subtitle', v)}
                label="نمایش توضیح زیر عنوان"
              />
              <Toggle
                checked={!!settings.show_topics_heading}
                onChange={(v) => patchRoot('show_topics_heading', v)}
                label="نمایش عنوان «موضوع‌ها»"
              />
              <Toggle
                checked={!!settings.show_cta}
                onChange={(v) => patchRoot('show_cta', v)}
                label="نمایش دکمه اصلی"
              />
            </>
          ) : widgetType === 'rebo_stack' ? (
            <>
              <Toggle
                checked={!!settings.show_eyebrow}
                onChange={(v) => patchRoot('show_eyebrow', v)}
                label="نمایش برچسب بالای عنوان"
              />
              <Toggle
                checked={!!settings.show_title}
                onChange={(v) => patchRoot('show_title', v)}
                label="نمایش عنوان"
              />
              <Toggle
                checked={!!settings.show_subtitle}
                onChange={(v) => patchRoot('show_subtitle', v)}
                label="نمایش توضیح"
              />
            </>
          ) : (
            <>
              {(widgetType === 'rebo_pillars' ||
                widgetType === 'rebo_capabilities' ||
                widgetType === 'rebo_dashboard' ||
                widgetType === 'rebo_ops' ||
                widgetType === 'rebo_cloud_order' ||
                widgetType === 'rebo_closing') && (
                <Toggle
                  checked={!!settings.show_title}
                  onChange={(v) => patchRoot('show_title', v)}
                  label="نمایش عنوان"
                />
              )}
              <Toggle
                checked={!!settings.show_subtitle}
                onChange={(v) => patchRoot('show_subtitle', v)}
                label="نمایش توضیح"
              />
              {(widgetType === 'rebo_dashboard' ||
                widgetType === 'rebo_ops' ||
                widgetType === 'rebo_cloud_order') && (
                <Toggle
                  checked={!!settings.show_kicker}
                  onChange={(v) => patchRoot('show_kicker', v)}
                  label="نمایش kicker"
                />
              )}
              {(widgetType === 'rebo_hero' ||
                widgetType === 'rebo_closing' ||
                widgetType === 'rebo_showcase') && (
                <>
                  <Toggle
                    checked={!!settings.show_cta}
                    onChange={(v) => patchRoot('show_cta', v)}
                    label="نمایش دکمه اصلی"
                  />
                  {widgetType === 'rebo_hero' || widgetType === 'rebo_showcase' ? (
                    <Toggle
                      checked={!!settings.show_secondary_cta}
                      onChange={(v) => patchRoot('show_secondary_cta', v)}
                      label="نمایش دکمه دوم"
                    />
                  ) : null}
                </>
              )}
              {(widgetType === 'rebo_hero' || widgetType === 'rebo_showcase') && (
                <Toggle
                  checked={!!settings.show_devices}
                  onChange={(v) => patchRoot('show_devices', v)}
                  label="نمایش دستگاه‌ها (مک / آیفون)"
                />
              )}
            </>
          )}
        </div>
      </Accordion>

      <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
        ویرایش تنظیمات برای
      </p>
      <div className={styles.wsSeg} style={{ gridTemplateColumns: '1fr 1fr' }}>
        {REBO_DEVICES.map((d) => {
          const on = device === d.id
          const Icon = d.id === 'mobile' ? Smartphone : Monitor
          return (
            <button
              key={d.id}
              type="button"
              className={`${styles.wsSegBtn} ${on ? styles.wsSegBtnActive : ''}`}
              onClick={() => setDevice(d.id)}
            >
              <Icon size={14} style={{ marginInlineEnd: 4 }} />
              {d.label}
            </button>
          )
        })}
      </div>
      <p className={styles.wsHint}>
        رنگ، فاصله و چیدمان برای{' '}
        <strong>{device === 'mobile' ? 'موبایل' : 'دسکتاپ'}</strong> جدا ذخیره
        می‌شود.
      </p>

      <Accordion
        id="layout"
        title="چیدمان دستگاه"
        openId={openId}
        setOpenId={setOpenId}
      >
        <Toggle
          checked={!!settings.section_full}
          onChange={(v) => patchVp('section_full', v)}
          label="سکشن تمام‌عرض"
          hint="پس‌زمینه لبه به لبه"
        />
        <p className={styles.wsMiniLabel}>تراز متن</p>
        <Seg
          options={REBO_ALIGNS}
          value={settings.align}
          onChange={(v) => patchVp('align', v)}
        />
        <PxField
          label="حداکثر عرض محتوا"
          value={settings.max_width}
          min={320}
          max={1600}
          onChange={(v) => patchVp('max_width', v)}
        />
        <PxField
          label="فاصله داخلی عناصر"
          value={settings.gap}
          max={64}
          onChange={(v) => patchVp('gap', v)}
        />
        {(widgetType === 'rebo_hero' || widgetType === 'rebo_showcase') && (
          <>
            <Toggle
              checked={!!settings.show_laptop}
              onChange={(v) => patchVp('show_laptop', v)}
              label="نمایش لپ‌تاپ"
            />
            <Toggle
              checked={!!settings.show_phone}
              onChange={(v) => patchVp('show_phone', v)}
              label="نمایش آیفون"
            />
            <PxField
              label="مقیاس دستگاه‌ها ٪"
              value={settings.device_scale}
              min={60}
              max={140}
              onChange={(v) => patchVp('device_scale', v)}
            />
          </>
        )}
      </Accordion>

      <Accordion
        id="space"
        title="فاصله و حاشیه"
        openId={openId}
        setOpenId={setOpenId}
      >
        <p className={styles.wsMiniLabel}>Padding</p>
        <div className={styles.wsPxGrid}>
          {REBO_SPACE_FIELDS.map((f) => (
            <PxField
              key={f.key}
              label={f.label}
              value={settings[f.key]}
              onChange={(v) => patchVp(f.key, v)}
            />
          ))}
        </div>
        <p className={styles.wsMiniLabel}>Margin</p>
        <div className={styles.wsPxGrid}>
          {REBO_MARGIN_FIELDS.map((f) => (
            <PxField
              key={f.key}
              label={f.label}
              value={settings[f.key]}
              onChange={(v) => patchVp(f.key, v)}
            />
          ))}
        </div>
      </Accordion>

      <Accordion
        id="colors"
        title="رنگ‌ها"
        openId={openId}
        setOpenId={setOpenId}
      >
        <p className={styles.wsHint}>خالی = رنگ پیش‌فرض تم اپل‌مانند ربو</p>
        {REBO_COLOR_FIELDS.map((f) => (
          <ColorRow
            key={f.key}
            label={f.label}
            value={settings[f.key]}
            onChange={(v) => patchVp(f.key, v)}
          />
        ))}
      </Accordion>
    </div>
  )
}
