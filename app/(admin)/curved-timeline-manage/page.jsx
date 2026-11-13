'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  RefreshCw,
  Save,
  Plus,
  Trash2,
  Pencil,
  Shield,
  CheckCircle2,
  X,
  GitBranch,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import curvedTimelineService from '@/components/widgets/gym/curvedTimelineService'
import styles from './CurvedTimelineManage.module.css'

const emptyStep = {
  key: '',
  step_label: '',
  need: '',
  title: '',
  text: '',
  result: '',
  icon: 'users',
  side: 'light',
  order: 10,
  is_active: true,
}

const ICON_OPTIONS = [
  { value: 'users', label: 'اعضا' },
  { value: 'calendar', label: 'سانس / تقویم' },
  { value: 'coach', label: 'مربی' },
  { value: 'bell', label: 'یادآوری' },
  { value: 'shop', label: 'فروشگاه' },
  { value: 'clipboard', label: 'پروفایل / لیست' },
]

export default function CurvedTimelineManagePage() {
  const router = useRouter()
  const { isAuthenticated, loading, user, canManageEmployees } = useAuth()
  const canManage = user?.is_superuser || user?.is_staff || canManageEmployees

  const [settings, setSettings] = useState({
    eyebrow: '',
    title: '',
    subtitle: '',
  })
  const [steps, setSteps] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyStep)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login?next=/curved-timeline-manage')
    }
  }, [loading, isAuthenticated, router])

  const load = useCallback(async () => {
    setLoadingData(true)
    setErr(null)
    const [s, st] = await Promise.all([
      curvedTimelineService.getSettings(),
      curvedTimelineService.getSteps(true),
    ])
    if (s.success) setSettings(s.data || {})
    if (st.success) setSteps(st.data || [])
    if (!s.success && !st.success) setErr('خطا در بارگذاری داده‌ها')
    setLoadingData(false)
  }, [])

  useEffect(() => {
    if (isAuthenticated && canManage) load()
    else if (isAuthenticated) setLoadingData(false)
  }, [isAuthenticated, canManage, load])

  const stats = useMemo(
    () => ({
      steps: steps.length,
      active: steps.filter((i) => i.is_active).length,
    }),
    [steps],
  )

  const saveSettings = async () => {
    setSaving(true)
    setMsg(null)
    setErr(null)
    const res = await curvedTimelineService.updateSettings(settings)
    setSaving(false)
    if (res.success) {
      setSettings(res.data || settings)
      setMsg('تنظیمات هدر ذخیره شد')
    } else {
      setErr(res.error || 'خطا در ذخیره')
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm({
      ...emptyStep,
      order: (steps.length + 1) * 10,
      step_label: String(steps.length + 1).padStart(2, '0'),
    })
    setShowForm(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      key: row.key || '',
      step_label: row.step_label || '',
      need: row.need || '',
      title: row.title || '',
      text: row.text || '',
      result: row.result || '',
      icon: row.icon || 'users',
      side: row.side || 'light',
      order: row.order ?? 10,
      is_active: row.is_active !== false,
    })
    setShowForm(true)
  }

  const saveStep = async () => {
    setSaving(true)
    setMsg(null)
    setErr(null)
    const payload = { ...form }
    if (!payload.key) delete payload.key
    const res = editing
      ? await curvedTimelineService.updateStep(editing.id, payload)
      : await curvedTimelineService.createStep(payload)
    setSaving(false)
    if (res.success) {
      setShowForm(false)
      setMsg(editing ? 'گام ویرایش شد' : 'گام اضافه شد')
      load()
    } else {
      setErr(res.error || 'خطا در ذخیره گام')
    }
  }

  const removeStep = async (row) => {
    if (!window.confirm(`حذف «${row.title}»؟`)) return
    setSaving(true)
    const res = await curvedTimelineService.deleteStep(row.id)
    setSaving(false)
    if (res.success) {
      setMsg('گام حذف شد')
      load()
    } else {
      setErr(res.error || 'خطا در حذف')
    }
  }

  if (loading || (isAuthenticated && canManage && loadingData)) {
    return (
      <div className={styles.page} dir="rtl">
        <div className={styles.wrap}>
          <div className={styles.loadingBox}>
            <RefreshCw size={28} />
            <p>در حال بارگذاری…</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  if (!canManage) {
    return (
      <div className={styles.page} dir="rtl">
        <div className={styles.wrap}>
          <div className={styles.denied}>
            <Shield size={40} />
            <h3>دسترسی محدود</h3>
            <p>فقط مدیر و staff می‌توانند این بخش را مدیریت کنند.</p>
            <Link href="/dashboard" className={styles.primaryBtn}>
              بازگشت به داشبورد
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page} dir="rtl" lang="fa">
      <div className={styles.wrap}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <GitBranch size={24} />
            </div>
            <div>
              <h1 className={styles.pageTitle}>تایم لاین منحنی</h1>
              <p className={styles.pageDesc}>
                مدیریت هدر و گام‌های ویجت تایم‌لاین منحنی
              </p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link href="/dashboard" className={styles.headerGhost}>
              <LayoutDashboard size={16} />
              داشبورد
            </Link>
            <button type="button" className={styles.headerGhost} onClick={load}>
              <RefreshCw size={16} />
              بروزرسانی
            </button>
          </div>
        </header>

        {(msg || err) && (
          <div className={`${styles.banner} ${err ? styles.err : styles.ok}`}>
            {err ? <X size={16} /> : <CheckCircle2 size={16} />}
            <span>{err || msg}</span>
          </div>
        )}

        <div className={styles.stats}>
          <div className={styles.stat}>
            <strong>{stats.steps}</strong>
            <span>گام</span>
          </div>
          <div className={styles.stat}>
            <strong>{stats.active}</strong>
            <span>فعال</span>
          </div>
        </div>

        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2>هدر ویجت</h2>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={saveSettings}
              disabled={saving}
            >
              <Save size={16} />
              ذخیره هدر
            </button>
          </div>
          <div className={styles.formGrid}>
            <label>
              ابرو
              <input
                value={settings.eyebrow || ''}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, eyebrow: e.target.value }))
                }
              />
            </label>
            <label>
              عنوان
              <input
                value={settings.title || ''}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, title: e.target.value }))
                }
              />
            </label>
            <label className={styles.full}>
              زیرعنوان
              <textarea
                rows={3}
                value={settings.subtitle || ''}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, subtitle: e.target.value }))
                }
              />
            </label>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2>گام‌ها</h2>
            <button type="button" className={styles.primaryBtn} onClick={openCreate}>
              <Plus size={16} />
              گام جدید
            </button>
          </div>

          <div className={styles.list}>
            {steps.map((row) => (
              <article key={row.id} className={styles.listItem}>
                <div>
                  <div className={styles.listTitle}>
                    <span className={styles.badge}>{row.step_label || '—'}</span>
                    {row.title}
                    {!row.is_active && (
                      <span className={styles.badgeMuted}>غیرفعال</span>
                    )}
                  </div>
                  <p className={styles.muted}>
                    {row.need} · {row.side === 'dark' ? 'تیره' : 'روشن'} ·{' '}
                    {ICON_OPTIONS.find((o) => o.value === row.icon)?.label || row.icon}
                  </p>
                </div>
                <div className={styles.listActions}>
                  <button type="button" className={styles.ghostBtn} onClick={() => openEdit(row)}>
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    className={styles.dangerBtn}
                    onClick={() => removeStep(row)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            ))}
            {!steps.length && <p className={styles.muted}>گامی ثبت نشده.</p>}
          </div>
        </section>
      </div>

      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.modalHead}>
              <h3>{editing ? 'ویرایش گام' : 'گام جدید'}</h3>
              <button type="button" className={styles.ghostBtn} onClick={() => setShowForm(false)}>
                <X size={16} />
              </button>
            </div>
            <div className={styles.formGrid}>
              <label>
                کلید
                <input
                  value={form.key}
                  onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
                  placeholder="members"
                />
              </label>
              <label>
                برچسب (۰۱)
                <input
                  value={form.step_label}
                  onChange={(e) => setForm((f) => ({ ...f, step_label: e.target.value }))}
                />
              </label>
              <label>
                نیاز
                <input
                  value={form.need}
                  onChange={(e) => setForm((f) => ({ ...f, need: e.target.value }))}
                />
              </label>
              <label>
                عنوان
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </label>
              <label className={styles.full}>
                متن
                <textarea
                  rows={3}
                  value={form.text}
                  onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
                />
              </label>
              <label>
                نتیجه
                <input
                  value={form.result}
                  onChange={(e) => setForm((f) => ({ ...f, result: e.target.value }))}
                />
              </label>
              <label>
                آیکون
                <select
                  value={form.icon}
                  onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                >
                  {ICON_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                سمت
                <select
                  value={form.side}
                  onChange={(e) => setForm((f) => ({ ...f, side: e.target.value }))}
                >
                  <option value="light">روشن (چپ مسیر)</option>
                  <option value="dark">تیره (راست مسیر)</option>
                </select>
              </label>
              <label>
                ترتیب
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, order: Number(e.target.value) || 0 }))
                  }
                />
              </label>
              <label className={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={!!form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                />
                فعال
              </label>
            </div>
            <div className={styles.modalActions}>
              <button type="button" className={styles.ghostBtn} onClick={() => setShowForm(false)}>
                انصراف
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={saveStep}
                disabled={saving || !form.title}
              >
                <Save size={16} />
                ذخیره
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
