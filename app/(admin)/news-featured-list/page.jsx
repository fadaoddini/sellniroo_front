// app/(admin)/news-featured-list — تنظیمات دادهٔ ویجت اخبار ویژه لیست سفارشی
'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Star,
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
} from '@/services/siteSettings'
import {
  fetchSiteModules,
  isSiteModuleActive,
} from '@/services/siteModules'
import newsService from '@/services/newsService'
import {
  DEFAULT_NEWS_WIDGET_SETTINGS,
  pickFeaturedListDashboardSettings,
} from '@/config/newsWidgetSettings'
import {
  findAllWidgetsByType,
  normalizeHomeLayout,
  patchAllWidgetsByType,
} from '@/config/homeLayout'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import styles from './FeaturedListAdmin.module.css'

const WIDGET_TYPE = 'featured_news'

export default function FeaturedNewsListAdminPage() {
  const router = useRouter()
  const { isAuthenticated, loading, user, hasPermission, getAuthHeaders } =
    useAuth()
  const { language, dir } = useLanguage()

  const canAccess =
    user?.is_superuser || user?.is_staff || hasPermission('news')

  const [layout, setLayout] = useState(null)
  const [form, setForm] = useState(() =>
    pickFeaturedListDashboardSettings(DEFAULT_NEWS_WIDGET_SETTINGS)
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
          title: 'Featured news custom list',
          subtitle:
            'Data settings for the featured news list widget (not appearance)',
          back: 'Dashboard',
          save: 'Save',
          saving: 'Saving…',
          refresh: 'Refresh',
          loading: 'Loading…',
          accessDenied: 'Access denied',
          needNews: 'You need news section access',
          moduleOff:
            'The homepage news section module is off in AdminWeb. Turn on «بخش اخبار صفحه اصلی» to manage this widget.',
          returnHome: 'Home',
          noWidget:
            'This widget is not on the homepage yet. Add «Featured news custom list» in AdminWeb first.',
          instances: 'widgets on homepage',
          category: 'Category',
          allCategories: 'All featured (no category filter)',
          count: 'Count',
          offset: 'Offset',
          startFrom: 'Start from item #',
          showMobile: 'Show on mobile',
          showImage: 'Show thumbnail',
          showLikes: 'Show likes',
          showViews: 'Show views',
          showShare: 'Show share',
          showAuthor: 'Show author',
          showLead: 'Show lead / excerpt',
          showReadMore: 'Show read more',
          readMoreText: 'Read more label',
          titleMax: 'Title max characters',
          titleWrap: 'Allow title wrap',
          hint: 'Colors and visual styling stay in AdminWeb. Here you only set data and general options.',
          saved: 'Settings saved',
          saveError: 'Save failed',
        }
      : {
          title: 'اخبار ویژه لیست سفارشی',
          subtitle:
            'تنظیمات داده و کلی ویجت — بدون رنگ و ظاهر (ظاهر در AdminWeb)',
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
            'هنوز این ویجت روی صفحه اصلی نیست. اول در AdminWeb «ویجت اخبار ویژه لیست سفارشی» را اضافه کنید.',
          instances: 'ویجت روی صفحه اصلی',
          category: 'دسته‌بندی',
          allCategories: 'همهٔ اخبار ویژه (بدون فیلتر دسته)',
          count: 'تعداد',
          offset: 'افست',
          startFrom: 'شروع از خبر شماره',
          showMobile: 'نمایش در موبایل',
          showImage: 'نمایش تصویر شاخص',
          showLikes: 'نمایش لایک',
          showViews: 'نمایش بازدید',
          showShare: 'نمایش اشتراک',
          showAuthor: 'نمایش نویسنده',
          showLead: 'نمایش لید / خلاصه',
          showReadMore: 'نمایش ادامه مطلب',
          readMoreText: 'متن ادامه مطلب',
          titleMax: 'حداکثر کاراکتر عنوان',
          titleWrap: 'شکستن عنوان در چند خط',
          hint: 'رنگ‌بندی و ظاهر در AdminWeb می‌ماند؛ اینجا فقط داده و تنظیمات کلی ویجت است.',
          saved: 'تنظیمات ذخیره شد',
          saveError: 'ذخیره ناموفق بود',
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
      const [settings, catRes] = await Promise.all([
        fetchSiteSettings({ force: true }),
        newsService.getCategories(),
      ])
      const L = normalizeHomeLayout(settings?.home_layout)
      setLayout(L)
      const found = findAllWidgetsByType(L, WIDGET_TYPE)
      const seed =
        found[0]?.widget?.settings || DEFAULT_NEWS_WIDGET_SETTINGS
      setForm(pickFeaturedListDashboardSettings(seed))

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

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 2800)
  }

  const onSave = async () => {
    if (!layout || !instances.length) return
    setSaving(true)
    setError('')
    try {
      const payload = pickFeaturedListDashboardSettings(form)
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
          <Link href="/" className={styles.ghostBtn}>
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

      <header className={styles.header}>
        <div className={styles.headerMain}>
          <span className={styles.headerIcon}>
            <Star size={22} />
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
          <Link href="/adminsettings" className={styles.primaryBtn}>
            AdminWeb
          </Link>
        </div>
      ) : !instances.length ? (
        <div className={styles.empty}>
          <AlertCircle size={22} />
          <p>{t.noWidget}</p>
          <Link href="/adminsettings" className={styles.primaryBtn}>
            AdminWeb
          </Link>
        </div>
      ) : (
        <div className={styles.card}>
          <div className={styles.metaRow}>
            <span>
              {instances.length} {t.instances}
            </span>
          </div>

          <label className={styles.field}>
            <span>{t.category}</span>
            <select
              value={form.category_slug || ''}
              onChange={(e) => patch('category_slug', e.target.value)}
            >
              <option value="">{t.allCategories}</option>
              {categories.map((c) => (
                <option key={c.id || c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.grid3}>
            <label className={styles.field}>
              <span>{t.count}</span>
              <input
                type="number"
                min={1}
                max={20}
                value={form.count}
                onChange={(e) =>
                  patch('count', Math.max(1, Math.min(20, Number(e.target.value) || 1)))
                }
                dir="ltr"
              />
            </label>
            <label className={styles.field}>
              <span>{t.offset}</span>
              <input
                type="number"
                min={0}
                max={40}
                value={form.offset}
                onChange={(e) =>
                  patch('offset', Math.max(0, Math.min(40, Number(e.target.value) || 0)))
                }
                dir="ltr"
              />
            </label>
            <label className={styles.field}>
              <span>{t.startFrom}</span>
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
              ['show_on_mobile', t.showMobile],
              ['show_image', t.showImage],
              ['show_likes', t.showLikes],
              ['show_views', t.showViews],
              ['show_share', t.showShare],
              ['show_author', t.showAuthor],
              ['show_lead', t.showLead],
              ['show_read_more', t.showReadMore],
              ['title_wrap', t.titleWrap],
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
              <span>{t.readMoreText}</span>
              <input
                type="text"
                value={form.read_more_text || ''}
                onChange={(e) => patch('read_more_text', e.target.value)}
              />
            </label>
          ) : null}

          <label className={styles.field}>
            <span>{t.titleMax}</span>
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
      )}
    </div>
  )
}
