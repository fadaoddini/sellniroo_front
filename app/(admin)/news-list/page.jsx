// app/(admin)/news-list — تنظیمات کامل ویجت مجله‌ای لیست اخبار
'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Newspaper,
  LayoutDashboard,
  RefreshCw,
  Save,
  AlertCircle,
  CheckCircle2,
  Shield,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  fetchSiteSettings,
  saveHomeLayout,
  clearSiteSettingsCache,
} from '@/services/siteSettings'
import {
  fetchSiteModules,
  isSiteModuleActive,
} from '@/services/siteModules'
import newsService from '@/services/newsService'
import {
  DEFAULT_NEWS_MAGAZINE_SETTINGS,
  NEWS_MAGAZINE_ASPECTS,
  NEWS_MAGAZINE_CARD_STYLES,
  NEWS_MAGAZINE_COLUMNS,
  NEWS_MAGAZINE_COLOR_PRESETS,
  NEWS_MAGAZINE_PAGINATION_POSITIONS,
  NEWS_MAGAZINE_PAGINATION_STYLES,
  NEWS_MAGAZINE_RADIUS_FIELDS,
  NEWS_READ_MORE_ALIGNS,
  NEWS_READ_MORE_PLACES,
  pickNewsMagazineDashboardSettings,
} from '@/config/newsWidgetSettings'
import {
  findAllWidgetsByType,
  normalizeHomeLayout,
  patchAllWidgetsByType,
} from '@/config/homeLayout'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import styles from './NewsListAdmin.module.css'

function aspectCss(id) {
  return NEWS_MAGAZINE_ASPECTS.find((a) => a.id === id)?.css || '16 / 9'
}

function StylePreviewCard({ styleId, form, index }) {
  const r = Math.max(
    form.card_radius_top_left ?? form.card_radius ?? 12,
    0
  )
  const ink = form.ink_color || '#2a241c'
  const muted = form.muted_color || '#6f675c'
  const accent = form.accent_color || '#c27800'
  const soft = form.accent_soft || '#fff3c4'
  const surface = form.surface_bg || '#fff'
  const aspect = aspectCss(form.card_aspect)
  const mediaGrad = {
    background: `linear-gradient(145deg, ${soft}, ${accent}66)`,
  }
  const title = `خبر نمونه ${index + 1}`

  if (styleId === 'overlay' || styleId === 'cover' || styleId === 'glass') {
    return (
      <div
        className={`${styles.pvCard} ${styles.pvDark}`}
        style={{ borderRadius: r, aspectRatio: aspect }}
      >
        <div className={styles.pvMediaAbs} style={mediaGrad} />
        <div
          className={
            styleId === 'glass' ? styles.pvGlassBody : styles.pvOverlayBody
          }
        >
          {styleId === 'cover' ? (
            <span
              className={styles.pvBadge}
              style={{ background: soft, color: ink }}
            >
              منبع
            </span>
          ) : null}
          <strong>{title}</strong>
          {styleId !== 'cover' ? <em>لید کوتاه خبر…</em> : null}
        </div>
      </div>
    )
  }

  if (styleId === 'split') {
    return (
      <div
        className={`${styles.pvCard} ${styles.pvSplit}`}
        style={{ borderRadius: r, background: surface }}
      >
        <div className={styles.pvSplitMedia} style={mediaGrad} />
        <div className={styles.pvBody}>
          <strong style={{ color: ink }}>{title}</strong>
          <em style={{ color: muted }}>خلاصه خبر…</em>
        </div>
      </div>
    )
  }

  if (styleId === 'editorial') {
    return (
      <div
        className={`${styles.pvCard} ${styles.pvEditorial}`}
        style={{ borderRadius: r, background: surface }}
      >
        <i className={styles.pvEditBar} style={{ background: accent }} />
        <div className={styles.pvSplitMedia} style={mediaGrad} />
        <div className={styles.pvBody}>
          <strong style={{ color: ink }}>{title}</strong>
          <em style={{ color: muted }}>متن سردبیری…</em>
        </div>
      </div>
    )
  }

  if (styleId === 'framed') {
    return (
      <div
        className={`${styles.pvCard} ${styles.pvFramed}`}
        style={{ borderRadius: r, background: surface }}
      >
        <div
          className={styles.pvFrameMedia}
          style={{ ...mediaGrad, aspectRatio: aspect }}
        />
        <div className={`${styles.pvBody} ${styles.pvBodyCenter}`}>
          <strong style={{ color: ink }}>{title}</strong>
          <em style={{ color: muted }}>کپشن قاب…</em>
        </div>
      </div>
    )
  }

  return (
    <div
      className={styles.pvCard}
      style={{ borderRadius: r, background: surface }}
    >
      <div
        className={styles.pvMedia}
        style={{ ...mediaGrad, aspectRatio: aspect }}
      />
      <div className={styles.pvBody}>
        <strong style={{ color: ink }}>{title}</strong>
        <em style={{ color: muted }}>خلاصه کوتاه…</em>
      </div>
    </div>
  )
}

const WIDGET_TYPE = 'news_list'

function toHexForPicker(value, fallback = '#c27800') {
  const v = String(value || '').trim()
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    return `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`
  }
  return fallback
}

function ColorField({ label, value, onChange }) {
  const hex = toHexForPicker(value)
  return (
    <div className={styles.colorRow}>
      <label>{label}</label>
      <div className={styles.colorControls}>
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          dir="ltr"
        />
      </div>
    </div>
  )
}

export default function NewsListAdminPage() {
  const router = useRouter()
  const { isAuthenticated, loading, user, hasPermission, getAuthHeaders } =
    useAuth()
  const { language, dir } = useLanguage()
  const canAccess =
    user?.is_superuser || user?.is_staff || hasPermission('news')

  const [layout, setLayout] = useState(null)
  const [form, setForm] = useState(() =>
    pickNewsMagazineDashboardSettings(DEFAULT_NEWS_MAGAZINE_SETTINGS)
  )
  const [categories, setCategories] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const [moduleOn, setModuleOn] = useState(null)

  const t =
    language === 'en'
      ? {
          title: 'News list (magazine)',
          subtitle:
            'Same look as /news — cards grid, pagination and full settings',
          back: 'Dashboard',
          save: 'Save',
          saving: 'Saving…',
          refresh: 'Refresh',
          loading: 'Loading…',
          accessDenied: 'Access denied',
          needNews: 'You need news section access',
          moduleOff: 'Homepage news section module is off in AdminWeb.',
          returnHome: 'Home',
          noWidget:
            'Add «News list» in AdminWeb homepage layout first.',
          instances: 'widgets on homepage',
          saved: 'Settings saved',
          saveError: 'Save failed',
          hint: 'Appearance matches the News magazine page. Configure pagination, filters and colors here.',
        }
      : {
          title: 'لیست اخبار (مجله)',
          subtitle:
            'ظاهر مشابه صفحه /news — گرید کارت، صفحه‌بندی و تنظیمات کامل',
          back: 'داشبورد',
          save: 'ذخیره',
          saving: 'در حال ذخیره…',
          refresh: 'بروزرسانی',
          loading: 'در حال بارگذاری…',
          accessDenied: 'دسترسی محدود',
          needNews: 'برای این بخش باید دسترسی اخبار داشته باشید',
          moduleOff: 'ماژول بخش اخبار صفحه اصلی خاموش است.',
          returnHome: 'صفحه اصلی',
          noWidget:
            'اول در AdminWeb ویجت «لیست اخبار» را به صفحه اصلی اضافه کنید.',
          instances: 'ویجت روی صفحه اصلی',
          saved: 'تنظیمات ذخیره شد',
          saveError: 'ذخیره ناموفق بود',
          hint: 'شکل و قیافه مثل مجله اخبار است. صفحه‌بندی، فیلتر و رنگ‌ها را اینجا تنظیم کنید.',
        }

  const instances = useMemo(
    () => (layout ? findAllWidgetsByType(layout, WIDGET_TYPE) : []),
    [layout]
  )

  const load = useCallback(async () => {
    setLoadingData(true)
    setError('')
    try {
      await fetchSiteModules({ force: true })
      const active = await isSiteModuleActive(SITE_MODULE_KEYS.NEWS_SECTION, {
        force: true,
      })
      setModuleOn(!!active)
      if (!active) {
        setLayout(null)
        return
      }
      clearSiteSettingsCache()
      const [settings, catRes] = await Promise.all([
        fetchSiteSettings({ force: true }),
        newsService.getCategories(),
      ])
      const L = normalizeHomeLayout(settings?.home_layout)
      setLayout(L)
      const found = findAllWidgetsByType(L, WIDGET_TYPE)
      const seed =
        found[0]?.widget?.settings || DEFAULT_NEWS_MAGAZINE_SETTINGS
      setForm(pickNewsMagazineDashboardSettings(seed))

      const raw = Array.isArray(catRes?.data) ? catRes.data : []
      const flat = []
      const walk = (nodes, depth = 0) => {
        ;(nodes || []).forEach((n) => {
          if (!n?.slug) return
          flat.push({
            id: n.id,
            slug: n.slug,
            name: `${depth ? `${'— '.repeat(depth)}` : ''}${n.name}`,
          })
          if (Array.isArray(n.children) && n.children.length) {
            walk(n.children, depth + 1)
          }
        })
      }
      walk(raw)
      setCategories(flat)
    } catch (e) {
      setError(e?.message || t.loading)
    } finally {
      setLoadingData(false)
    }
  }, [t.loading])

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login')
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && canAccess) load()
  }, [isAuthenticated, canAccess, load])

  const patch = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))
  const patchMany = (obj) => setForm((prev) => ({ ...prev, ...obj }))

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 2800)
  }

  const onSave = async () => {
    if (!layout || !instances.length) return
    setSaving(true)
    setError('')
    try {
      const payload = pickNewsMagazineDashboardSettings(form)
      const next = patchAllWidgetsByType(layout, WIDGET_TYPE, payload)
      const saved = await saveHomeLayout(next, getAuthHeaders())
      setLayout(normalizeHomeLayout(saved))
      showToast(t.saved)
    } catch (e) {
      setError(e?.message || t.saveError)
      showToast(e?.message || t.saveError, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.page} dir={dir}>
        <div className={styles.centerBox}>
          <RefreshCw className={styles.spin} size={22} />
          <p>{t.loading}</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  if (!canAccess) {
    return (
      <div className={styles.page} dir={dir}>
        <div className={styles.centerBox}>
          <Shield size={40} />
          <h2>{t.accessDenied}</h2>
          <p>{t.needNews}</p>
          <Link href="/" className={styles.stickyGhost}>
            {t.returnHome}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page} dir={dir}>
      {toast ? (
        <div
          className={`${styles.toast} ${
            toast.type === 'error' ? styles.toastError : styles.toastOk
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle size={16} />
          ) : (
            <CheckCircle2 size={16} />
          )}
          <span>{toast.message}</span>
        </div>
      ) : null}

      <div className={styles.wrap}>
        <header className={styles.header}>
          <div className={styles.headerMain}>
            <span className={styles.headerIcon}>
              <Newspaper size={22} />
            </span>
            <div>
              <h1>{t.title}</h1>
              <p>{t.subtitle}</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link href="/dashboard" className={styles.ghostBtn}>
              <LayoutDashboard size={14} />
              {t.back}
            </Link>
            <button
              type="button"
              className={styles.ghostBtn}
              onClick={load}
              disabled={loadingData || saving}
            >
              <RefreshCw
                size={14}
                className={loadingData ? styles.spin : undefined}
              />
              {t.refresh}
            </button>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={onSave}
              disabled={saving || loadingData || !instances.length}
            >
              {saving ? (
                <RefreshCw size={14} className={styles.spin} />
              ) : (
                <Save size={14} />
              )}
              {saving ? t.saving : t.save}
            </button>
          </div>
        </header>

        <p className={styles.hint}>{t.hint}</p>

        {error ? (
          <div className={styles.alert} role="alert">
            <AlertCircle size={14} />
            {error}
          </div>
        ) : null}

        {loadingData ? (
          <div className={styles.centerBox}>
            <RefreshCw className={styles.spin} size={20} />
            <p>{t.loading}</p>
          </div>
        ) : moduleOn === false ? (
          <div className={styles.empty}>
            <AlertCircle size={22} />
            <p>{t.moduleOff}</p>
            <Link href="/adminsettings" className={styles.stickyPrimary}>
              AdminWeb
            </Link>
          </div>
        ) : !instances.length ? (
          <div className={styles.empty}>
            <AlertCircle size={22} />
            <p>{t.noWidget}</p>
            <Link href="/adminsettings" className={styles.stickyPrimary}>
              AdminWeb
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.metaBadge}>
              {instances.length} {t.instances}
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <p className={styles.panelTitle}>سبک و پیش‌نمایش</p>
                <p className={styles.panelHint}>
                  {NEWS_MAGAZINE_CARD_STYLES.find(
                    (x) => x.id === form.card_style
                  )?.hint || ''}
                </p>
              </div>
              <div className={styles.styleGrid}>
                {NEWS_MAGAZINE_CARD_STYLES.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className={`${styles.stylePick} ${
                      form.card_style === o.id ? styles.stylePickOn : ''
                    }`}
                    onClick={() => patch('card_style', o.id)}
                  >
                    <span className={styles.stylePickLabel}>{o.label}</span>
                  </button>
                ))}
              </div>
              <div
                className={styles.pvStage}
                style={{
                  gridTemplateColumns: `repeat(${Math.min(
                    form.columns || 3,
                    3
                  )}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({
                  length: Math.min(form.columns || 3, 3),
                }).map((_, i) => (
                  <StylePreviewCard
                    key={i}
                    styleId={form.card_style}
                    form={form}
                    index={i}
                  />
                ))}
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <p className={styles.panelTitle}>چیدمان و نسبت تصویر</p>
              </div>
              <p className={styles.labelMuted}>کارت در هر ردیف</p>
              <div className={styles.segRow}>
                {NEWS_MAGAZINE_COLUMNS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className={`${styles.segBtn} ${
                      Number(form.columns) === o.id ? styles.segBtnOn : ''
                    }`}
                    onClick={() => patch('columns', o.id)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <p className={styles.labelMuted}>نسبت ابعاد</p>
              <div className={styles.segRow}>
                {NEWS_MAGAZINE_ASPECTS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className={`${styles.segBtn} ${
                      form.card_aspect === o.id ? styles.segBtnOn : ''
                    }`}
                    onClick={() => patch('card_aspect', o.id)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <p className={styles.panelTitle}>صفحه‌بندی</p>
                <p className={styles.panelHint}>شکل و جایگاه ناوبری صفحات</p>
              </div>
              <p className={styles.panelHint}>شکل صفحه‌بندی</p>
              <div className={styles.segRow}>
                {NEWS_MAGAZINE_PAGINATION_STYLES.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className={`${styles.segBtn} ${
                      form.pagination_style === o.id ? styles.segBtnOn : ''
                    }`}
                    onClick={() => patch('pagination_style', o.id)}
                    title={o.hint}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <p className={styles.panelHint}>جایگاه</p>
              <div className={styles.segRow}>
                {NEWS_MAGAZINE_PAGINATION_POSITIONS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className={`${styles.segBtn} ${
                      form.pagination_position === o.id ? styles.segBtnOn : ''
                    }`}
                    onClick={() => patch('pagination_position', o.id)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <p className={styles.panelTitle}>جزئیات کارت</p>
                <p className={styles.panelHint}>
                  چه چیزی روی هر کارت دیده شود
                </p>
              </div>
              <div className={styles.toggles}>
                {[
                  ['show_card_image', 'تصویر'],
                  ['show_card_title', 'عنوان'],
                  ['show_card_excerpt', 'لید / خلاصه'],
                  ['show_card_date', 'تاریخ'],
                  ['show_card_source', 'منبع'],
                  ['show_read_more', 'ادامه مطلب'],
                  ['show_likes', 'لایک'],
                  ['show_share', 'اشتراک‌گذاری'],
                ].map(([key, label]) => (
                  <label key={key} className={styles.toggleRow}>
                    <span>{label}</span>
                    <input
                      type="checkbox"
                      checked={!!form[key]}
                      onChange={(e) => patch(key, e.target.checked)}
                    />
                  </label>
                ))}
              </div>
              {form.show_read_more ? (
                <>
                  <label className={styles.field}>
                    <span>متن ادامه مطلب</span>
                    <input
                      type="text"
                      value={form.read_more_text || ''}
                      onChange={(e) => patch('read_more_text', e.target.value)}
                    />
                  </label>
                  <p className={styles.panelHint}>جایگاه ادامه مطلب</p>
                  <div className={styles.segRow}>
                    {NEWS_READ_MORE_PLACES.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        className={`${styles.segBtn} ${
                          form.read_more_place === o.id ? styles.segBtnOn : ''
                        }`}
                        onClick={() => patch('read_more_place', o.id)}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                  <p className={styles.panelHint}>تراز ادامه مطلب</p>
                  <div className={styles.segRow}>
                    {NEWS_READ_MORE_ALIGNS.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        className={`${styles.segBtn} ${
                          form.read_more_align === o.id ? styles.segBtnOn : ''
                        }`}
                        onClick={() => patch('read_more_align', o.id)}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                  <label className={styles.toggleRow}>
                    <span>ادامه مطلب به شکل دکمه</span>
                    <input
                      type="checkbox"
                      checked={!!form.read_more_as_button}
                      onChange={(e) =>
                        patch('read_more_as_button', e.target.checked)
                      }
                    />
                  </label>
                </>
              ) : null}
              {form.show_share ? (
                <div className={styles.toggles}>
                  {[
                    ['share_bale', 'بله'],
                    ['share_eitaa', 'ایتا'],
                    ['share_rubika', 'روبیکا'],
                    ['share_soroush', 'سروش'],
                  ].map(([key, label]) => (
                    <label key={key} className={styles.toggleRow}>
                      <span>اشتراک در {label}</span>
                      <input
                        type="checkbox"
                        checked={!!form[key]}
                        onChange={(e) => patch(key, e.target.checked)}
                      />
                    </label>
                  ))}
                </div>
              ) : null}
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <p className={styles.panelTitle}>بردر، شعاع و سایه</p>
              </div>
              <div className={styles.toggles}>
                <label className={styles.toggleRow}>
                  <span>بردر کارت</span>
                  <input
                    type="checkbox"
                    checked={!!form.card_border}
                    onChange={(e) => patch('card_border', e.target.checked)}
                  />
                </label>
                <label className={styles.toggleRow}>
                  <span>باکس‌شادو</span>
                  <input
                    type="checkbox"
                    checked={!!form.card_shadow}
                    onChange={(e) => patch('card_shadow', e.target.checked)}
                  />
                </label>
              </div>
              {form.card_border ? (
                <div className={styles.grid2}>
                  <label className={styles.field}>
                    <span>ضخامت بردر (px)</span>
                    <input
                      type="number"
                      min={0}
                      max={12}
                      value={form.card_border_width}
                      onChange={(e) =>
                        patch(
                          'card_border_width',
                          Math.max(0, Math.min(12, Number(e.target.value) || 0))
                        )
                      }
                      dir="ltr"
                    />
                  </label>
                  <ColorField
                    label="رنگ بردر"
                    value={form.card_border_color}
                    onChange={(v) => patch('card_border_color', v)}
                  />
                </div>
              ) : null}
              <p className={styles.panelHint}>شعاع گوشه‌ها (px)</p>
              <div className={styles.grid2}>
                {NEWS_MAGAZINE_RADIUS_FIELDS.map((f) => (
                  <label key={f.key} className={styles.field}>
                    <span>{f.label}</span>
                    <input
                      type="number"
                      min={0}
                      max={64}
                      value={form[f.key] ?? 16}
                      onChange={(e) =>
                        patch(
                          f.key,
                          Math.max(0, Math.min(64, Number(e.target.value) || 0))
                        )
                      }
                      dir="ltr"
                    />
                  </label>
                ))}
              </div>
              {form.card_shadow ? (
                <div className={styles.grid3}>
                  <label className={styles.field}>
                    <span>سایه X</span>
                    <input
                      type="number"
                      min={-40}
                      max={40}
                      value={form.card_shadow_x}
                      onChange={(e) =>
                        patch('card_shadow_x', Number(e.target.value) || 0)
                      }
                      dir="ltr"
                    />
                  </label>
                  <label className={styles.field}>
                    <span>سایه Y</span>
                    <input
                      type="number"
                      min={-40}
                      max={40}
                      value={form.card_shadow_y}
                      onChange={(e) =>
                        patch('card_shadow_y', Number(e.target.value) || 0)
                      }
                      dir="ltr"
                    />
                  </label>
                  <label className={styles.field}>
                    <span>بلور</span>
                    <input
                      type="number"
                      min={0}
                      max={80}
                      value={form.card_shadow_blur}
                      onChange={(e) =>
                        patch(
                          'card_shadow_blur',
                          Math.max(0, Math.min(80, Number(e.target.value) || 0))
                        )
                      }
                      dir="ltr"
                    />
                  </label>
                  <label className={styles.field}>
                    <span>اسپرد</span>
                    <input
                      type="number"
                      min={-20}
                      max={40}
                      value={form.card_shadow_spread}
                      onChange={(e) =>
                        patch('card_shadow_spread', Number(e.target.value) || 0)
                      }
                      dir="ltr"
                    />
                  </label>
                  <label className={styles.field}>
                    <span>شفافیت سایه %</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form.card_shadow_opacity}
                      onChange={(e) =>
                        patch(
                          'card_shadow_opacity',
                          Math.max(0, Math.min(100, Number(e.target.value) || 0))
                        )
                      }
                      dir="ltr"
                    />
                  </label>
                </div>
              ) : null}
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <p className={styles.panelTitle}>پالت رنگ</p>
                <p className={styles.panelHint}>
                  رنگ فونت‌ها، تاکید و پس‌زمینه
                </p>
              </div>
              <div className={styles.presets}>
                {NEWS_MAGAZINE_COLOR_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={styles.presetBtn}
                    onClick={() => patchMany(p.patch)}
                  >
                    <i
                      className={styles.presetSwatch}
                      style={{
                        background: `linear-gradient(135deg, ${p.patch.accent_soft}, ${p.patch.accent_color})`,
                      }}
                    />
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
              <div className={styles.colorGrid}>
                <ColorField
                  label="رنگ متن پایه"
                  value={form.ink_color}
                  onChange={(v) => patch('ink_color', v)}
                />
                <ColorField
                  label="رنگ فرعی"
                  value={form.muted_color}
                  onChange={(v) => patch('muted_color', v)}
                />
                <ColorField
                  label="رنگ عنوان کارت"
                  value={form.title_color || form.ink_color}
                  onChange={(v) => patch('title_color', v)}
                />
                <ColorField
                  label="رنگ لید"
                  value={form.excerpt_color || form.muted_color}
                  onChange={(v) => patch('excerpt_color', v)}
                />
                <ColorField
                  label="رنگ تاریخ"
                  value={form.date_color || form.muted_color}
                  onChange={(v) => patch('date_color', v)}
                />
                <ColorField
                  label="رنگ ادامه مطلب"
                  value={form.read_more_color}
                  onChange={(v) => patch('read_more_color', v)}
                />
                <ColorField
                  label="پس‌زمینه ادامه مطلب"
                  value={form.read_more_bg || '#ffffff'}
                  onChange={(v) => patch('read_more_bg', v)}
                />
                <ColorField
                  label="رنگ اشتراک"
                  value={form.share_color}
                  onChange={(v) => patch('share_color', v)}
                />
                <ColorField
                  label="رنگ لایک"
                  value={form.like_color}
                  onChange={(v) => patch('like_color', v)}
                />
                <ColorField
                  label="پس‌زمینه سطح"
                  value={form.surface_bg}
                  onChange={(v) => patch('surface_bg', v)}
                />
                <ColorField
                  label="رنگ تاکید"
                  value={form.accent_color}
                  onChange={(v) => patch('accent_color', v)}
                />
                <ColorField
                  label="پس‌زمینه نرم تاکید"
                  value={form.accent_soft}
                  onChange={(v) => patch('accent_soft', v)}
                />
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <p className={styles.panelTitle}>محتوا و نمایش بخش</p>
                <p className={styles.panelHint}>
                  تعداد محتوا و صفحه فقط وقتی روشن باشند دیده می‌شوند
                </p>
              </div>
              <label className={styles.field}>
                <span>عنوان بخش</span>
                <input
                  type="text"
                  value={form.title || ''}
                  onChange={(e) => patch('title', e.target.value)}
                />
              </label>
              <label className={styles.field}>
                <span>دسته پیش‌فرض</span>
                <select
                  value={form.category_slug || ''}
                  onChange={(e) => patch('category_slug', e.target.value)}
                >
                  <option value="">همه دسته‌ها</option>
                  {categories.map((c) => (
                    <option key={c.id || c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className={styles.grid2}>
                <label className={styles.field}>
                  <span>تعداد در هر صفحه</span>
                  <input
                    type="number"
                    min={4}
                    max={24}
                    value={form.per_page}
                    onChange={(e) =>
                      patch(
                        'per_page',
                        Math.max(4, Math.min(24, Number(e.target.value) || 12))
                      )
                    }
                    dir="ltr"
                  />
                </label>
                <label className={styles.field}>
                  <span>حداکثر عرض بخش</span>
                  <input
                    type="number"
                    min={720}
                    max={1400}
                    value={form.section_max_width}
                    onChange={(e) =>
                      patch(
                        'section_max_width',
                        Math.max(
                          720,
                          Math.min(1400, Number(e.target.value) || 1200)
                        )
                      )
                    }
                    dir="ltr"
                  />
                </label>
              </div>
              <div className={styles.toggles}>
                {[
                  ['show_on_mobile', 'نمایش در موبایل'],
                  ['show_title', 'نمایش عنوان بخش'],
                  ['show_search', 'نمایش جستجو'],
                  ['show_categories', 'نمایش دسته‌ها'],
                  ['show_stats_bar', 'نوار آمار بالای بخش'],
                  ['show_total_count', 'تعداد محتوا'],
                  ['show_page_info', 'شماره صفحه در نوار آمار'],
                  ['show_pagination', 'صفحه‌بندی'],
                ].map(([key, label]) => (
                  <label key={key} className={styles.toggleRow}>
                    <span>{label}</span>
                    <input
                      type="checkbox"
                      checked={!!form[key]}
                      onChange={(e) => patch(key, e.target.checked)}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.stickyBar}>
              <div className={styles.stickyInner}>
                <span className={styles.stickyNote}>
                  بعد از ذخیره، ویجت روی صفحه اصلی مثل مجله اخبار رندر می‌شود
                </span>
                <div className={styles.stickyActions}>
                  <button
                    type="button"
                    className={styles.stickyGhost}
                    onClick={load}
                    disabled={loadingData || saving}
                  >
                    <RefreshCw
                      size={14}
                      className={loadingData ? styles.spin : undefined}
                    />
                    {t.refresh}
                  </button>
                  <button
                    type="button"
                    className={styles.stickyPrimary}
                    onClick={onSave}
                    disabled={saving || loadingData || !instances.length}
                  >
                    {saving ? (
                      <RefreshCw size={14} className={styles.spin} />
                    ) : (
                      <Save size={14} />
                    )}
                    {saving ? t.saving : t.save}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
