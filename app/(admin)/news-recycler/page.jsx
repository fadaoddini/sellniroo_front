// app/(admin)/news-recycler — تنظیمات کامل ویجت ریسایکلرویوی اخبار
'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  GalleryHorizontal,
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
  DEFAULT_NEWS_WIDGET_SETTINGS,
  NEWS_FONTS,
  NEWS_RECYCLER_ASPECTS,
  NEWS_RECYCLER_COLOR_PRESETS,
  NEWS_RECYCLER_TEXT_X,
  NEWS_RECYCLER_TEXT_Y,
  NEWS_STATS_LAYOUTS,
  pickNewsRecyclerDashboardSettings,
} from '@/config/newsWidgetSettings'
import {
  findAllWidgetsByType,
  normalizeHomeLayout,
  patchAllWidgetsByType,
} from '@/config/homeLayout'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import styles from './NewsRecyclerAdmin.module.css'

const WIDGET_TYPE = 'latest_news_recycler'

function toHexForPicker(value, fallback = '#071a2e') {
  const v = String(value || '').trim()
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    const r = v[1]
    const g = v[2]
    const b = v[3]
    return `#${r}${r}${g}${g}${b}${b}`
  }
  return fallback
}

function ColorField({ label, value, onChange, allowTransparent = false }) {
  const hex = toHexForPicker(value, '#ffffff')
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
        {allowTransparent ? (
          <button
            type="button"
            className={styles.ghostMini}
            onClick={() => onChange('transparent')}
          >
            شفاف
          </button>
        ) : null}
      </div>
    </div>
  )
}

function Seg({ options, value, onChange }) {
  return (
    <div className={styles.segRow}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          className={`${styles.segBtn} ${
            value === o.id ? styles.segBtnOn : ''
          }`}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function NewsRecyclerAdminPage() {
  const router = useRouter()
  const { isAuthenticated, loading, user, hasPermission, getAuthHeaders } =
    useAuth()
  const { language, dir } = useLanguage()

  const canAccess =
    user?.is_superuser || user?.is_staff || hasPermission('news')

  const [layout, setLayout] = useState(null)
  const [form, setForm] = useState(() =>
    pickNewsRecyclerDashboardSettings(DEFAULT_NEWS_WIDGET_SETTINGS)
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
          title: 'News RecyclerView',
          subtitle: 'Full data, colors and scroll settings for the recycler widget',
          back: 'Dashboard',
          save: 'Save',
          saving: 'Saving…',
          refresh: 'Refresh',
          loading: 'Loading…',
          accessDenied: 'Access denied',
          needNews: 'You need news section access',
          moduleOff:
            'The homepage news section module is off in AdminWeb. Turn it on to manage this widget.',
          returnHome: 'Home',
          noWidget:
            'This widget is not on the homepage yet. Add «News RecyclerView» in AdminWeb first.',
          instances: 'widgets on homepage',
          saved: 'Settings saved',
          saveError: 'Save failed',
          hint: 'Everything for this widget — data, color palettes, cards and scroll — is editable here.',
        }
      : {
          title: 'ریسایکلرویوی اخبار',
          subtitle: 'تنظیمات کامل داده، ترکیب رنگی، کارت و اسکرول',
          back: 'داشبورد',
          save: 'ذخیره',
          saving: 'در حال ذخیره…',
          refresh: 'بروزرسانی',
          loading: 'در حال بارگذاری…',
          accessDenied: 'دسترسی محدود',
          needNews: 'برای این بخش باید دسترسی اخبار داشته باشید',
          moduleOff:
            'ماژول «بخش اخبار صفحه اصلی» در AdminWeb خاموش است. برای مدیریت این ویجت آن را روشن کنید.',
          returnHome: 'صفحه اصلی',
          noWidget:
            'هنوز این ویجت روی صفحه اصلی نیست. اول در AdminWeb «ریسایکلرویوی اخبار» را اضافه کنید.',
          instances: 'ویجت روی صفحه اصلی',
          saved: 'تنظیمات ذخیره شد',
          saveError: 'ذخیره ناموفق بود',
          hint: 'همه چیز این ویجت — داده، پالت رنگ، کارت و اسکرول — از همین صفحه قابل تنظیم است.',
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
        found[0]?.widget?.settings || DEFAULT_NEWS_WIDGET_SETTINGS
      setForm(pickNewsRecyclerDashboardSettings(seed))

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

  const patch = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const patchMany = (obj) => {
    setForm((prev) => ({ ...prev, ...obj }))
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 2800)
  }

  const onSave = async () => {
    if (!layout || !instances.length) return
    setSaving(true)
    setError('')
    try {
      const payload = pickNewsRecyclerDashboardSettings(form)
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

  const previewStyle = {
    background: `linear-gradient(${form.recycler_section_angle || 180}deg, ${
      form.recycler_section_from || '#071a2e'
    }, ${form.recycler_section_to || '#0e3d66'})`,
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
            <GalleryHorizontal size={22} />
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
            <span>
              {instances.length} {t.instances}
            </span>
          </div>

          {/* پیش‌نمایش زنده رنگ */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <p className={styles.panelTitle}>پیش‌نمایش ترکیب رنگی</p>
            </div>
            <div className={styles.liveStrip} style={previewStyle}>
              {Array.from({
                length: Math.min(4, Math.max(2, form.recycler_visible_desktop || 3)),
              }).map((_, i) => (
                <span
                  key={i}
                  className={styles.liveCard}
                  style={{
                    borderColor: form.recycler_card_border_color || 'transparent',
                    boxShadow: form.recycler_card_shadow
                      ? '0 6px 14px rgba(0,0,0,0.25)'
                      : 'none',
                  }}
                >
                  <i className={styles.liveImg} />
                  <em
                    style={{
                      color: form.recycler_text_color || '#fff',
                      background:
                        form.recycler_overlay_bg === 'transparent'
                          ? 'transparent'
                          : form.recycler_overlay_bg || 'transparent',
                    }}
                  >
                    کارت نمونه {i + 1}
                  </em>
                </span>
              ))}
            </div>
          </div>

          {/* پالت‌های آماده */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <p className={styles.panelTitle}>پالت‌های آماده ترکیب رنگی</p>
              <p className={styles.panelHint}>
                با یک کلیک گرادیان سکشن، متن، بردر و رنگ آمار اعمال می‌شود
              </p>
            </div>
            <div className={styles.presets}>
              {NEWS_RECYCLER_COLOR_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={styles.presetBtn}
                  onClick={() => patchMany(p.patch)}
                >
                  <i
                    className={styles.presetSwatch}
                    style={{
                      background: `linear-gradient(${p.patch.recycler_section_angle}deg, ${p.patch.recycler_section_from}, ${p.patch.recycler_section_to})`,
                    }}
                  />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* داده */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <p className={styles.panelTitle}>داده و محتوا</p>
            </div>
            <label className={styles.field}>
              <span>دسته‌بندی</span>
              <select
                value={form.category_slug || ''}
                onChange={(e) => patch('category_slug', e.target.value)}
              >
                <option value="">همهٔ آخرین اخبار (بدون فیلتر دسته)</option>
                {categories.map((c) => (
                  <option key={c.id || c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <div className={styles.grid3}>
              <label className={styles.field}>
                <span>تعداد</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={form.count}
                  onChange={(e) =>
                    patch(
                      'count',
                      Math.max(1, Math.min(20, Number(e.target.value) || 1))
                    )
                  }
                  dir="ltr"
                />
              </label>
              <label className={styles.field}>
                <span>افست</span>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={form.offset}
                  onChange={(e) =>
                    patch(
                      'offset',
                      Math.max(0, Math.min(40, Number(e.target.value) || 0))
                    )
                  }
                  dir="ltr"
                />
              </label>
              <label className={styles.field}>
                <span>شروع از خبر شماره</span>
                <input
                  type="number"
                  min={1}
                  max={41}
                  value={(form.offset || 0) + 1}
                  onChange={(e) =>
                    patch(
                      'offset',
                      Math.max(0, Math.min(40, (Number(e.target.value) || 1) - 1))
                    )
                  }
                  dir="ltr"
                />
              </label>
            </div>
            <div className={styles.toggles}>
              {[
                ['show_on_mobile', 'نمایش در موبایل'],
                ['show_image', 'نمایش تصویر'],
                ['show_likes', 'نمایش لایک'],
                ['show_views', 'نمایش بازدید'],
                ['show_share', 'نمایش اشتراک'],
                ['show_author', 'نمایش نویسنده'],
                ['show_lead', 'نمایش لید'],
                ['show_read_more', 'نمایش ادامه مطلب'],
                ['title_wrap', 'شکستن عنوان'],
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
              <label className={styles.field}>
                <span>متن ادامه مطلب</span>
                <input
                  type="text"
                  value={form.read_more_text || ''}
                  onChange={(e) => patch('read_more_text', e.target.value)}
                />
              </label>
            ) : null}
            <label className={styles.field}>
              <span>حداکثر کاراکتر عنوان</span>
              <input
                type="number"
                min={10}
                max={120}
                value={form.title_max_chars}
                onChange={(e) =>
                  patch(
                    'title_max_chars',
                    Math.max(10, Math.min(120, Number(e.target.value) || 48))
                  )
                }
                dir="ltr"
              />
            </label>
          </div>

          {/* سکشن / گرادیان */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <p className={styles.panelTitle}>سکشن و گرادیان پس‌زمینه</p>
            </div>
            <label className={styles.toggleRow}>
              <span>سکشن تمام‌عرض</span>
              <input
                type="checkbox"
                checked={!!form.recycler_section_full}
                onChange={(e) =>
                  patch('recycler_section_full', e.target.checked)
                }
              />
            </label>
            <div className={styles.colorGrid}>
              <ColorField
                label="رنگ شروع گرادیان"
                value={form.recycler_section_from}
                onChange={(v) => patch('recycler_section_from', v)}
                allowTransparent
              />
              <ColorField
                label="رنگ پایان گرادیان"
                value={form.recycler_section_to}
                onChange={(v) => patch('recycler_section_to', v)}
                allowTransparent
              />
            </div>
            <label className={styles.field}>
              <span>زاویه گرادیان (۰–۳۶۰)</span>
              <input
                type="number"
                min={0}
                max={360}
                value={form.recycler_section_angle}
                onChange={(e) =>
                  patch(
                    'recycler_section_angle',
                    Math.max(0, Math.min(360, Number(e.target.value) || 0))
                  )
                }
                dir="ltr"
              />
            </label>
            <div className={styles.grid2}>
              <label className={styles.field}>
                <span>پدینگ بالا (px)</span>
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={form.padding_top}
                  onChange={(e) =>
                    patch(
                      'padding_top',
                      Math.max(0, Math.min(200, Number(e.target.value) || 0))
                    )
                  }
                  dir="ltr"
                />
              </label>
              <label className={styles.field}>
                <span>پدینگ پایین (px)</span>
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={form.padding_bottom}
                  onChange={(e) =>
                    patch(
                      'padding_bottom',
                      Math.max(0, Math.min(200, Number(e.target.value) || 0))
                    )
                  }
                  dir="ltr"
                />
              </label>
            </div>
          </div>

          {/* متن و فونت */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <p className={styles.panelTitle}>فونت و رنگ متن روی کارت</p>
            </div>
            <p className={styles.labelMuted}>فونت</p>
            <Seg
              options={NEWS_FONTS}
              value={form.font_family}
              onChange={(v) => patch('font_family', v)}
            />
            <div className={styles.grid2}>
              <label className={styles.field}>
                <span>اندازه فونت</span>
                <input
                  type="number"
                  min={10}
                  max={28}
                  value={form.font_size}
                  onChange={(e) =>
                    patch(
                      'font_size',
                      Math.max(10, Math.min(28, Number(e.target.value) || 14))
                    )
                  }
                  dir="ltr"
                />
              </label>
              <label className={styles.toggleRow}>
                <span>متن بولد</span>
                <input
                  type="checkbox"
                  checked={!!form.font_bold}
                  onChange={(e) => patch('font_bold', e.target.checked)}
                />
              </label>
            </div>
            <div className={styles.colorGrid}>
              <ColorField
                label="رنگ متن روی تصویر"
                value={form.recycler_text_color}
                onChange={(v) => patch('recycler_text_color', v)}
              />
              <ColorField
                label="پس‌زمینه لایه متن"
                value={form.recycler_overlay_bg}
                onChange={(v) => patch('recycler_overlay_bg', v)}
                allowTransparent
              />
            </div>
            <label className={styles.toggleRow}>
              <span>گرادیان تیره قوی‌تر روی تصویر</span>
              <input
                type="checkbox"
                checked={!!form.recycler_show_gradient}
                onChange={(e) =>
                  patch('recycler_show_gradient', e.target.checked)
                }
              />
            </label>
            <p className={styles.labelMuted}>موقعیت عمودی متن</p>
            <Seg
              options={NEWS_RECYCLER_TEXT_Y}
              value={form.recycler_text_y}
              onChange={(v) => patch('recycler_text_y', v)}
            />
            <p className={styles.labelMuted}>تراز افقی متن</p>
            <Seg
              options={NEWS_RECYCLER_TEXT_X}
              value={form.recycler_text_x}
              onChange={(v) => patch('recycler_text_x', v)}
            />
          </div>

          {/* کارت */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <p className={styles.panelTitle}>کارت، نسبت تصویر و بردر</p>
              <p className={styles.labelMuted}>نسبت تصویر</p>
            </div>
            <Seg
              options={NEWS_RECYCLER_ASPECTS}
              value={form.recycler_aspect}
              onChange={(v) => patch('recycler_aspect', v)}
            />
            {form.recycler_aspect === 'free' ? (
              <label className={styles.field}>
                <span>ارتفاع کارت (px)</span>
                <input
                  type="number"
                  min={160}
                  max={520}
                  value={form.recycler_height}
                  onChange={(e) =>
                    patch(
                      'recycler_height',
                      Math.max(160, Math.min(520, Number(e.target.value) || 280))
                    )
                  }
                  dir="ltr"
                />
              </label>
            ) : null}
            <label className={styles.toggleRow}>
              <span>کراپ تصویر</span>
              <input
                type="checkbox"
                checked={!!form.recycler_image_crop}
                onChange={(e) =>
                  patch('recycler_image_crop', e.target.checked)
                }
              />
            </label>
            <label className={styles.toggleRow}>
              <span>سایه زیر کارت</span>
              <input
                type="checkbox"
                checked={!!form.recycler_card_shadow}
                onChange={(e) =>
                  patch('recycler_card_shadow', e.target.checked)
                }
              />
            </label>
            <label className={styles.field}>
              <span>ضخامت بردر (۰ = بدون)</span>
              <input
                type="number"
                min={0}
                max={12}
                value={form.recycler_card_border_width}
                onChange={(e) =>
                  patch(
                    'recycler_card_border_width',
                    Math.max(0, Math.min(12, Number(e.target.value) || 0))
                  )
                }
                dir="ltr"
              />
            </label>
            <div className={styles.colorGrid}>
              <ColorField
                label="رنگ بردر"
                value={form.recycler_card_border_color}
                onChange={(v) => patch('recycler_card_border_color', v)}
                allowTransparent
              />
              <ColorField
                label="رنگ بردر در هاور"
                value={form.recycler_card_border_hover}
                onChange={(v) => patch('recycler_card_border_hover', v)}
                allowTransparent
              />
            </div>
          </div>

          {/* اسکرول */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <p className={styles.panelTitle}>اسکرول و ناوبری</p>
            </div>
            <label className={styles.field}>
              <span>تعداد کارت کنار هم (نگاه اول)</span>
              <input
                type="number"
                min={1}
                max={8}
                value={form.recycler_visible_desktop}
                onChange={(e) =>
                  patch(
                    'recycler_visible_desktop',
                    Math.max(1, Math.min(8, Number(e.target.value) || 4))
                  )
                }
                dir="ltr"
              />
            </label>
            <div className={styles.toggles}>
              {[
                ['recycler_drag_scroll', 'اسکرول با کشیدن موس'],
                ['recycler_show_arrows', 'دکمه قبلی / بعدی'],
                ['recycler_autoplay', 'حرکت خودکار'],
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
            {form.recycler_autoplay ? (
              <>
                <label className={styles.field}>
                  <span>فاصله حرکت خودکار (ms)</span>
                  <input
                    type="number"
                    min={1500}
                    max={15000}
                    value={form.recycler_autoplay_ms}
                    onChange={(e) =>
                      patch(
                        'recycler_autoplay_ms',
                        Math.max(
                          1500,
                          Math.min(15000, Number(e.target.value) || 4000)
                        )
                      )
                    }
                    dir="ltr"
                  />
                </label>
                <label className={styles.toggleRow}>
                  <span>توقف با هاور موس</span>
                  <input
                    type="checkbox"
                    checked={!!form.recycler_pause_on_hover}
                    onChange={(e) =>
                      patch('recycler_pause_on_hover', e.target.checked)
                    }
                  />
                </label>
              </>
            ) : null}
          </div>

          {/* آمار */}
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <p className={styles.panelTitle}>رنگ و چیدمان آمار</p>
              <p className={styles.labelMuted}>چیدمان آمار</p>
            </div>
            <Seg
              options={NEWS_STATS_LAYOUTS}
              value={form.stats_layout}
              onChange={(v) => patch('stats_layout', v)}
            />
            <div className={styles.colorGrid}>
              <ColorField
                label="رنگ لایک"
                value={form.like_color}
                onChange={(v) => patch('like_color', v)}
              />
              <ColorField
                label="رنگ بازدید"
                value={form.views_color}
                onChange={(v) => patch('views_color', v)}
              />
              <ColorField
                label="رنگ اشتراک"
                value={form.share_color}
                onChange={(v) => patch('share_color', v)}
              />
              <ColorField
                label="پس‌زمینه آمار"
                value={form.stats_bg}
                onChange={(v) => patch('stats_bg', v)}
                allowTransparent
              />
            </div>
            <div className={styles.grid2}>
              <label className={styles.field}>
                <span>سایز آیکن آمار</span>
                <input
                  type="number"
                  min={10}
                  max={28}
                  value={form.stats_icon_size}
                  onChange={(e) =>
                    patch(
                      'stats_icon_size',
                      Math.max(10, Math.min(28, Number(e.target.value) || 14))
                    )
                  }
                  dir="ltr"
                />
              </label>
              <label className={styles.field}>
                <span>سایز فونت آمار</span>
                <input
                  type="number"
                  min={8}
                  max={20}
                  value={form.stats_font_size}
                  onChange={(e) =>
                    patch(
                      'stats_font_size',
                      Math.max(8, Math.min(20, Number(e.target.value) || 10))
                    )
                  }
                  dir="ltr"
                />
              </label>
            </div>
            <div className={styles.grid2}>
              <label className={styles.field}>
                <span>شعاع پس‌زمینه آمار</span>
                <input
                  type="number"
                  min={0}
                  max={999}
                  value={form.stats_radius}
                  onChange={(e) =>
                    patch(
                      'stats_radius',
                      Math.max(0, Math.min(999, Number(e.target.value) || 0))
                    )
                  }
                  dir="ltr"
                />
              </label>
              <label className={styles.field}>
                <span>فاصله بین آمار</span>
                <input
                  type="number"
                  min={0}
                  max={32}
                  value={form.stats_gap}
                  onChange={(e) =>
                    patch(
                      'stats_gap',
                      Math.max(0, Math.min(32, Number(e.target.value) || 0))
                    )
                  }
                  dir="ltr"
                />
              </label>
            </div>
            <div className={styles.grid2}>
              <label className={styles.field}>
                <span>مارجین افقی آمار</span>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={form.stats_margin_x}
                  onChange={(e) =>
                    patch(
                      'stats_margin_x',
                      Math.max(0, Math.min(40, Number(e.target.value) || 0))
                    )
                  }
                  dir="ltr"
                />
              </label>
              <label className={styles.field}>
                <span>مارجین عمودی آمار</span>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={form.stats_margin_y}
                  onChange={(e) =>
                    patch(
                      'stats_margin_y',
                      Math.max(0, Math.min(40, Number(e.target.value) || 0))
                    )
                  }
                  dir="ltr"
                />
              </label>
            </div>
          </div>

          {/* ادامه مطلب رنگ */}
          {form.show_read_more ? (
            <div className={styles.panel}>
            <div className={styles.panelHead}>
              <p className={styles.panelTitle}>رنگ ادامه مطلب</p>
            </div>
            <div className={styles.colorGrid}>
              <ColorField
                label="رنگ متن"
                value={form.read_more_color}
                onChange={(v) => patch('read_more_color', v)}
                allowTransparent
              />
              <ColorField
                label="رنگ متن هاور"
                value={form.read_more_hover_color}
                onChange={(v) => patch('read_more_hover_color', v)}
                allowTransparent
              />
              <ColorField
                label="پس‌زمینه"
                value={form.read_more_bg}
                onChange={(v) => patch('read_more_bg', v)}
                allowTransparent
              />
              <ColorField
                label="پس‌زمینه هاور"
                value={form.read_more_hover_bg}
                onChange={(v) => patch('read_more_hover_bg', v)}
                allowTransparent
              />
            </div>
              <div className={styles.grid2}>
                <label className={styles.field}>
                  <span>سایز</span>
                  <input
                    type="number"
                    min={10}
                    max={22}
                    value={form.read_more_size}
                    onChange={(e) =>
                      patch(
                        'read_more_size',
                        Math.max(10, Math.min(22, Number(e.target.value) || 12))
                      )
                    }
                    dir="ltr"
                  />
                </label>
                <label
                  className={styles.toggleRow}
                 
                >
                  <span>بولد</span>
                  <input
                    type="checkbox"
                    checked={!!form.read_more_bold}
                    onChange={(e) => patch('read_more_bold', e.target.checked)}
                  />
                </label>
              </div>
            </div>
          ) : null}

          <div className={styles.stickyBar}>
            <div className={styles.stickyInner}>
              <span className={styles.stickyNote}>
                تغییرات بعد از ذخیره روی صفحه اصلی اعمال می‌شود
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
