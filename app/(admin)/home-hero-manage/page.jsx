'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2,
  LayoutDashboard,
  LayoutTemplate,
  Palette,
  Plus,
  RefreshCw,
  Save,
  Shield,
  Trash2,
  Type,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  DEFAULT_HOME_HERO_SLIDER,
  HOME_PAGE_FONTS,
  normalizeHomeHeroSlider,
} from '@/config/homeHeroSlider'
import {
  clearSiteSettingsCache,
  fetchSiteSettings,
  saveHomeHeroSlider,
} from '@/services/siteSettings'
import styles from './HomeHeroManage.module.css'

const TABS = [
  { id: 'hero', label: 'هیرو' },
  { id: 'sections', label: 'بخش‌ها' },
  { id: 'content', label: 'محتوا' },
  { id: 'theme', label: 'رنگ' },
  { id: 'fonts', label: 'فونت' },
]

function SwitchField({ label, checked, onChange }) {
  return (
    <label className={styles.switchRow}>
      <span className={styles.switchLabel}>{label}</span>
      <span className={`${styles.switch} ${checked ? styles.switchOn : ''}`}>
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

function Field({ label, value, onChange, multiline, dir, type = 'text', min, max }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {multiline ? (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          dir={dir}
        />
      ) : (
        <input
          type={type}
          min={min}
          max={max}
          value={value ?? ''}
          onChange={(e) =>
            onChange(type === 'number' ? Number(e.target.value) : e.target.value)
          }
          dir={dir}
        />
      )}
    </label>
  )
}

function ColorField({ label, value, onChange }) {
  const hex = value && /^#/.test(value) ? value : '#004733'
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <div className={styles.colorRow}>
        <input
          type="text"
          dir="ltr"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
        />
      </div>
    </label>
  )
}

export default function HomeHeroManagePage() {
  const router = useRouter()
  const { isAuthenticated, loading, user, canManageEmployees, getAuthHeaders } =
    useAuth()
  const canManage =
    user?.is_superuser || user?.is_staff || canManageEmployees

  const [tab, setTab] = useState('hero')
  const [form, setForm] = useState(() =>
    normalizeHomeHeroSlider(DEFAULT_HOME_HERO_SLIDER),
  )
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)

  const load = useCallback(async () => {
    setLoadingData(true)
    setError('')
    try {
      clearSiteSettingsCache()
      const settings = await fetchSiteSettings({ force: true })
      setForm(normalizeHomeHeroSlider(settings?.home_hero_slider || {}))
    } catch (e) {
      setError(e?.message || 'بارگذاری ناموفق')
    } finally {
      setLoadingData(false)
    }
  }, [])

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login')
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && canManage) load()
  }, [isAuthenticated, canManage, load])

  const patch = (key, value) => setForm((p) => ({ ...p, [key]: value }))
  const patchNested = (group, key, value) =>
    setForm((p) => ({ ...p, [group]: { ...(p[group] || {}), [key]: value } }))

  const onSave = async () => {
    setSaving(true)
    setError('')
    try {
      const saved = await saveHomeHeroSlider(form, getAuthHeaders())
      setForm(normalizeHomeHeroSlider(saved))
      setToast('ذخیره شد')
      window.setTimeout(() => setToast(null), 2200)
    } catch (e) {
      setError(e?.message || 'ذخیره ناموفق')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !isAuthenticated) {
    return (
      <div className={styles.page} dir="rtl">
        <div className={styles.stateBox}>در حال بررسی دسترسی…</div>
      </div>
    )
  }

  if (!canManage) {
    return (
      <div className={styles.page} dir="rtl">
        <div className={styles.denied}>
          <Shield size={24} />
          <h1>دسترسی محدود</h1>
          <Link href="/dashboard">داشبورد</Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.wrap}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <LayoutTemplate size={16} /> محتوای هیرو مدرسه
            </h1>
            <p className={styles.subtitle}>
              متن، دکمه‌ها، بخش‌ها و رنگ — جدا از چیدمان قالب؛ وقتی ویجت هیرو
              خبر فوری در صفحه اصلی باشد از داشبورد در دسترس است
            </p>
          </div>
          <div className={styles.actions}>
            <Link href="/dashboard" className={styles.ghostBtn}>
              <LayoutDashboard size={12} />
              داشبورد
            </Link>
            <button
              type="button"
              className={styles.ghostBtn}
              onClick={load}
              disabled={loadingData || saving}
            >
              <RefreshCw size={12} />
              بروزرسانی
            </button>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={onSave}
              disabled={loadingData || saving}
            >
              <Save size={12} />
              {saving ? '…' : 'ذخیره'}
            </button>
          </div>
        </header>

        <div className={styles.tabs}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${styles.tab} ${tab === t.id ? styles.tabOn : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error ? <p className={styles.err}>{error}</p> : null}

        {loadingData ? (
          <div className={styles.stateBox}>در حال بارگذاری…</div>
        ) : (
          <>
            {tab === 'hero' ? (
              <>
                <section className={styles.card}>
                  <h2 className={styles.cardTitle}>متن هیرو</h2>
                  <div className={styles.grid2}>
                    <Field label="برند" value={form.brand} onChange={(v) => patch('brand', v)} />
                    <Field label="ابرو" value={form.eyebrow} onChange={(v) => patch('eyebrow', v)} />
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <Field label="تیتر" value={form.headline} onChange={(v) => patch('headline', v)} />
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <Field
                      label="توضیح"
                      value={form.subtitle}
                      onChange={(v) => patch('subtitle', v)}
                      multiline
                    />
                  </div>
                </section>
                <section className={styles.card}>
                  <h2 className={styles.cardTitle}>دکمه‌های هیرو</h2>
                  <div className={styles.grid2} style={{ marginBottom: 6 }}>
                    <SwitchField
                      label="دکمه اصلی"
                      checked={form.show_cta}
                      onChange={(v) => patch('show_cta', v)}
                    />
                    <SwitchField
                      label="دکمه دوم"
                      checked={form.show_secondary}
                      onChange={(v) => patch('show_secondary', v)}
                    />
                  </div>
                  <div className={styles.grid2}>
                    <Field label="متن اصلی" value={form.cta_label} onChange={(v) => patch('cta_label', v)} />
                    <Field label="لینک اصلی" value={form.cta_href} onChange={(v) => patch('cta_href', v)} dir="ltr" />
                    <Field label="متن دوم" value={form.secondary_label} onChange={(v) => patch('secondary_label', v)} />
                    <Field label="لینک دوم" value={form.secondary_href} onChange={(v) => patch('secondary_href', v)} dir="ltr" />
                  </div>
                </section>
                <section className={styles.card}>
                  <h2 className={styles.cardTitle}>کارت‌های شناور هیرو</h2>
                  <div className={styles.grid2} style={{ marginBottom: 6 }}>
                    <SwitchField
                      label="کارنامه شناور"
                      checked={form.report?.show !== false}
                      onChange={(v) => patchNested('report', 'show', v)}
                    />
                    <SwitchField
                      label="نمودار شناور"
                      checked={form.chart?.show !== false}
                      onChange={(v) => patchNested('chart', 'show', v)}
                    />
                    <SwitchField
                      label="نشان IQ"
                      checked={form.badge?.show !== false}
                      onChange={(v) => patchNested('badge', 'show', v)}
                    />
                    <SwitchField
                      label="تیکر پایین"
                      checked={form.marquee?.show !== false}
                      onChange={(v) => patchNested('marquee', 'show', v)}
                    />
                  </div>
                  <div className={styles.grid2}>
                    <Field label="عنوان کارنامه" value={form.report?.title} onChange={(v) => patchNested('report', 'title', v)} />
                    <Field label="رتبه" value={form.report?.rank} onChange={(v) => patchNested('report', 'rank', v)} />
                    <Field label="معدل" value={form.report?.gpa} onChange={(v) => patchNested('report', 'gpa', v)} />
                    <Field label="برچسب معدل" value={form.report?.gpa_label} onChange={(v) => patchNested('report', 'gpa_label', v)} />
                    <Field label="عنوان نمودار" value={form.chart?.title} onChange={(v) => patchNested('chart', 'title', v)} />
                    <Field label="متن رشد" value={form.chart?.trend} onChange={(v) => patchNested('chart', 'trend', v)} />
                    <Field label="متن نشان" value={form.badge?.text} onChange={(v) => patchNested('badge', 'text', v)} />
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <Field
                      label="تیکر (هر خط یک مورد)"
                      value={(form.marquee?.items || []).join('\n')}
                      onChange={(v) =>
                        patchNested(
                          'marquee',
                          'items',
                          String(v || '')
                            .split('\n')
                            .map((x) => x.trim())
                            .filter(Boolean),
                        )
                      }
                      multiline
                    />
                  </div>
                  <p className={styles.hint} style={{ marginTop: 8 }}>دروس کارنامه شناور</p>
                  <div className={styles.rowList}>
                    {(form.report?.subjects || []).map((row, idx) => (
                      <div key={`s-${idx}`} className={styles.grid4}>
                        <Field
                          label="درس"
                          value={row.name}
                          onChange={(v) => {
                            const subjects = [...(form.report?.subjects || [])]
                            subjects[idx] = { ...subjects[idx], name: v }
                            patchNested('report', 'subjects', subjects)
                          }}
                        />
                        <Field
                          label="نمره"
                          value={row.score}
                          onChange={(v) => {
                            const subjects = [...(form.report?.subjects || [])]
                            subjects[idx] = { ...subjects[idx], score: v }
                            patchNested('report', 'subjects', subjects)
                          }}
                          dir="ltr"
                        />
                        <Field
                          label="%"
                          type="number"
                          min={0}
                          max={100}
                          value={row.bar}
                          onChange={(v) => {
                            const subjects = [...(form.report?.subjects || [])]
                            subjects[idx] = { ...subjects[idx], bar: v }
                            patchNested('report', 'subjects', subjects)
                          }}
                          dir="ltr"
                        />
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() =>
                            patchNested(
                              'report',
                              'subjects',
                              (form.report?.subjects || []).filter((_, i) => i !== idx),
                            )
                          }
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className={styles.addBtn}
                    onClick={() =>
                      patchNested('report', 'subjects', [
                        ...(form.report?.subjects || []),
                        { name: 'درس', score: '18', bar: 80 },
                      ])
                    }
                  >
                    <Plus size={12} /> درس
                  </button>
                </section>
              </>
            ) : null}

            {tab === 'sections' ? (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>نمایش بخش‌های صفحه</h2>
                <p className={styles.hint}>هر بخش را جدا روشن/خاموش کنید.</p>
                <div className={styles.grid2}>
                  {[
                    ['hero', 'هیرو'],
                    ['portals', 'درگاه نقش‌ها'],
                    ['report_band', 'کارنامه و نمودار'],
                    ['counseling', 'پنل مشاور'],
                    ['tools', 'ابزار معلم'],
                    ['closing', 'جمع‌بندی'],
                    ['mobile_dock', 'داک موبایل'],
                  ].map(([key, label]) => (
                    <SwitchField
                      key={key}
                      label={label}
                      checked={form.sections?.[key] !== false}
                      onChange={(v) => patchNested('sections', key, v)}
                    />
                  ))}
                  <SwitchField
                    label="نمایش موبایل"
                    checked={form.show_on_mobile !== false}
                    onChange={(v) => patch('show_on_mobile', v)}
                  />
                  <SwitchField
                    label="نمایش دسکتاپ"
                    checked={form.show_on_desktop !== false}
                    onChange={(v) => patch('show_on_desktop', v)}
                  />
                </div>
              </section>
            ) : null}

            {tab === 'content' ? (
              <>
                <section className={styles.card}>
                  <h2 className={styles.cardTitle}>درگاه نقش‌ها</h2>
                  <div className={styles.grid2}>
                    <Field label="ابرو" value={form.portals?.kicker} onChange={(v) => patchNested('portals', 'kicker', v)} />
                    <Field label="متن ورود" value={form.portals?.enter_label} onChange={(v) => patchNested('portals', 'enter_label', v)} />
                    <Field label="عنوان" value={form.portals?.title} onChange={(v) => patchNested('portals', 'title', v)} />
                    <Field label="تأکید عنوان" value={form.portals?.title_em} onChange={(v) => patchNested('portals', 'title_em', v)} />
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <Field label="توضیح" value={form.portals?.lead} onChange={(v) => patchNested('portals', 'lead', v)} multiline />
                  </div>
                  <div className={styles.rowList} style={{ marginTop: 8 }}>
                    {(form.portals?.items || []).map((item, idx) => (
                      <div key={item.id || idx} className={styles.card} style={{ margin: 0, padding: 8 }}>
                        <div className={styles.grid2} style={{ marginBottom: 6 }}>
                          <SwitchField
                            label={item.title || item.id}
                            checked={item.show !== false}
                            onChange={(v) => {
                              const items = [...(form.portals?.items || [])]
                              items[idx] = { ...items[idx], show: v }
                              patchNested('portals', 'items', items)
                            }}
                          />
                          <Field
                            label="عنوان"
                            value={item.title}
                            onChange={(v) => {
                              const items = [...(form.portals?.items || [])]
                              items[idx] = { ...items[idx], title: v }
                              patchNested('portals', 'items', items)
                            }}
                          />
                          <Field
                            label="توضیح"
                            value={item.desc}
                            onChange={(v) => {
                              const items = [...(form.portals?.items || [])]
                              items[idx] = { ...items[idx], desc: v }
                              patchNested('portals', 'items', items)
                            }}
                          />
                          <Field
                            label="لینک"
                            value={item.href}
                            onChange={(v) => {
                              const items = [...(form.portals?.items || [])]
                              items[idx] = { ...items[idx], href: v }
                              patchNested('portals', 'items', items)
                            }}
                            dir="ltr"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={styles.card}>
                  <h2 className={styles.cardTitle}>کارنامه و نمودار (بخش میانی)</h2>
                  <div className={styles.grid2}>
                    <Field label="ابرو" value={form.report_band?.kicker} onChange={(v) => patchNested('report_band', 'kicker', v)} />
                    <Field label="عنوان" value={form.report_band?.title} onChange={(v) => patchNested('report_band', 'title', v)} />
                    <Field label="تأکید" value={form.report_band?.title_em} onChange={(v) => patchNested('report_band', 'title_em', v)} />
                    <Field label="عنوان برگه" value={form.report_band?.sheet_title} onChange={(v) => patchNested('report_band', 'sheet_title', v)} />
                    <Field label="متای برگه" value={form.report_band?.sheet_meta} onChange={(v) => patchNested('report_band', 'sheet_meta', v)} />
                    <Field label="نشان رتبه" value={form.report_band?.rank_pill} onChange={(v) => patchNested('report_band', 'rank_pill', v)} />
                    <Field label="عنوان نمودار" value={form.report_band?.chart_title} onChange={(v) => patchNested('report_band', 'chart_title', v)} />
                    <Field label="متن روند" value={form.report_band?.chart_trend} onChange={(v) => patchNested('report_band', 'chart_trend', v)} />
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <Field label="توضیح" value={form.report_band?.lead} onChange={(v) => patchNested('report_band', 'lead', v)} multiline />
                  </div>
                  <p className={styles.hint} style={{ marginTop: 8 }}>آمار بالا</p>
                  <div className={styles.grid3}>
                    {(form.report_band?.stats || []).map((st, idx) => (
                      <React.Fragment key={`st-${idx}`}>
                        <Field
                          label="مقدار"
                          value={st.value}
                          onChange={(v) => {
                            const stats = [...(form.report_band?.stats || [])]
                            stats[idx] = { ...stats[idx], value: v }
                            patchNested('report_band', 'stats', stats)
                          }}
                        />
                        <Field
                          label="برچسب"
                          value={st.label}
                          onChange={(v) => {
                            const stats = [...(form.report_band?.stats || [])]
                            stats[idx] = { ...stats[idx], label: v }
                            patchNested('report_band', 'stats', stats)
                          }}
                        />
                      </React.Fragment>
                    ))}
                  </div>
                </section>

                <section className={styles.card}>
                  <h2 className={styles.cardTitle}>مشاور</h2>
                  <div className={styles.grid2}>
                    <Field label="ابرو" value={form.counseling?.kicker} onChange={(v) => patchNested('counseling', 'kicker', v)} />
                    <Field label="عنوان" value={form.counseling?.title} onChange={(v) => patchNested('counseling', 'title', v)} />
                    <Field label="تأکید" value={form.counseling?.title_em} onChange={(v) => patchNested('counseling', 'title_em', v)} />
                    <Field label="دکمه" value={form.counseling?.cta_label} onChange={(v) => patchNested('counseling', 'cta_label', v)} />
                    <Field label="لینک" value={form.counseling?.cta_href} onChange={(v) => patchNested('counseling', 'cta_href', v)} dir="ltr" />
                    <Field label="دکمه دوم" value={form.counseling?.secondary_label} onChange={(v) => patchNested('counseling', 'secondary_label', v)} />
                    <SwitchField label="دکمه اصلی" checked={form.counseling?.show_cta !== false} onChange={(v) => patchNested('counseling', 'show_cta', v)} />
                    <SwitchField label="دکمه دوم" checked={form.counseling?.show_secondary !== false} onChange={(v) => patchNested('counseling', 'show_secondary', v)} />
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <Field label="توضیح" value={form.counseling?.lead} onChange={(v) => patchNested('counseling', 'lead', v)} multiline />
                  </div>
                </section>

                <section className={styles.card}>
                  <h2 className={styles.cardTitle}>ابزار معلم + جمع‌بندی</h2>
                  <div className={styles.grid2}>
                    <Field label="ابرو معلم" value={form.tools?.kicker} onChange={(v) => patchNested('tools', 'kicker', v)} />
                    <Field label="عنوان معلم" value={form.tools?.title} onChange={(v) => patchNested('tools', 'title', v)} />
                    <Field label="تأکید" value={form.tools?.title_em} onChange={(v) => patchNested('tools', 'title_em', v)} />
                    <Field label="ابرو جمع‌بندی" value={form.closing?.kicker} onChange={(v) => patchNested('closing', 'kicker', v)} />
                    <Field label="عنوان جمع‌بندی" value={form.closing?.title} onChange={(v) => patchNested('closing', 'title', v)} />
                    <Field label="برچسب مشاور" value={form.closing?.counselor_label} onChange={(v) => patchNested('closing', 'counselor_label', v)} />
                    <SwitchField label="CTA جمع‌بندی" checked={form.closing?.show_cta !== false} onChange={(v) => patchNested('closing', 'show_cta', v)} />
                    <SwitchField label="دکمه مشاور" checked={form.closing?.show_counselor !== false} onChange={(v) => patchNested('closing', 'show_counselor', v)} />
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <Field label="توضیح معلم" value={form.tools?.lead} onChange={(v) => patchNested('tools', 'lead', v)} multiline />
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <Field label="توضیح جمع‌بندی" value={form.closing?.lead} onChange={(v) => patchNested('closing', 'lead', v)} multiline />
                  </div>
                  <p className={styles.hint} style={{ marginTop: 8 }}>کارت‌های ابزار معلم</p>
                  <div className={styles.rowList}>
                    {(form.tools?.items || []).map((item, idx) => (
                      <div key={`tool-${idx}`} className={styles.grid2}>
                        <Field
                          label="عنوان"
                          value={item.title}
                          onChange={(v) => {
                            const items = [...(form.tools?.items || [])]
                            items[idx] = { ...items[idx], title: v }
                            patchNested('tools', 'items', items)
                          }}
                        />
                        <Field
                          label="توضیح"
                          value={item.desc}
                          onChange={(v) => {
                            const items = [...(form.tools?.items || [])]
                            items[idx] = { ...items[idx], desc: v }
                            patchNested('tools', 'items', items)
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              </>
            ) : null}

            {tab === 'theme' ? (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>
                  <Palette size={12} style={{ marginInlineEnd: 4 }} />
                  رنگ‌بندی صفحه
                </h2>
                <div className={styles.grid3}>
                  <ColorField label="جنگلی" value={form.theme?.forest} onChange={(v) => patchNested('theme', 'forest', v)} />
                  <ColorField label="زمردی" value={form.theme?.emerald} onChange={(v) => patchNested('theme', 'emerald', v)} />
                  <ColorField label="دریایی" value={form.theme?.sea} onChange={(v) => patchNested('theme', 'sea', v)} />
                  <ColorField label="سبز روشن" value={form.theme?.teal} onChange={(v) => patchNested('theme', 'teal', v)} />
                  <ColorField label="خاکستری" value={form.theme?.smoke} onChange={(v) => patchNested('theme', 'smoke', v)} />
                  <ColorField label="مرجانی" value={form.theme?.coral} onChange={(v) => patchNested('theme', 'coral', v)} />
                  <ColorField label="زرشکی" value={form.theme?.crimson} onChange={(v) => patchNested('theme', 'crimson', v)} />
                  <ColorField label="متن" value={form.theme?.ink} onChange={(v) => patchNested('theme', 'ink', v)} />
                  <ColorField label="سفید" value={form.theme?.white} onChange={(v) => patchNested('theme', 'white', v)} />
                </div>
              </section>
            ) : null}

            {tab === 'fonts' ? (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>
                  <Type size={12} style={{ marginInlineEnd: 4 }} />
                  فونت و اندازه
                </h2>
                <div className={styles.grid3}>
                  {[
                    ['font_body', 'فونت بدنه'],
                    ['font_title', 'فونت تیتر'],
                    ['font_brand', 'فونت برند'],
                  ].map(([key, label]) => (
                    <label key={key} className={styles.field}>
                      <span>{label}</span>
                      <select
                        value={form.theme?.[key] || 'ravi'}
                        onChange={(e) => patchNested('theme', key, e.target.value)}
                      >
                        {HOME_PAGE_FONTS.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                  <Field
                    label="اندازه برند"
                    type="number"
                    min={28}
                    max={120}
                    value={form.theme?.size_brand}
                    onChange={(v) => patchNested('theme', 'size_brand', v)}
                    dir="ltr"
                  />
                  <Field
                    label="اندازه تیتر"
                    type="number"
                    min={12}
                    max={48}
                    value={form.theme?.size_headline}
                    onChange={(v) => patchNested('theme', 'size_headline', v)}
                    dir="ltr"
                  />
                  <Field
                    label="اندازه متن"
                    type="number"
                    min={11}
                    max={24}
                    value={form.theme?.size_body}
                    onChange={(v) => patchNested('theme', 'size_body', v)}
                    dir="ltr"
                  />
                  <Field
                    label="اندازه ابرو"
                    type="number"
                    min={10}
                    max={20}
                    value={form.theme?.size_kicker}
                    onChange={(v) => patchNested('theme', 'size_kicker', v)}
                    dir="ltr"
                  />
                  <Field
                    label="اندازه دکمه"
                    type="number"
                    min={11}
                    max={22}
                    value={form.theme?.size_button}
                    onChange={(v) => patchNested('theme', 'size_button', v)}
                    dir="ltr"
                  />
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>

      {toast ? (
        <div className={styles.toast}>
          <CheckCircle2 size={12} />
          {toast}
        </div>
      ) : null}
    </div>
  )
}
