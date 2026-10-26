// app/(admin)/request-types/page.jsx — مدیریت انواع درخواست فرم تماس
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import {
  Tags, Plus, Pencil, Trash2, RefreshCw, Shield,
  CheckCircle2, X, LayoutDashboard, Power, Settings2,
  Download, MessageCircle,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import Config from '@/config/config'
import LucideIconPicker from '@/components/common/LucideIconPicker'
import { resolveLucideIcon } from '@/utils/lucideIcons'
import styles from './RequestTypes.module.css'

const emptyForm = {
  name: '',
  name_en: '',
  description: '',
  icon: 'Handshake',
  color: '#3b82f6',
  order: 10,
  is_active: true,
}

export default function RequestTypesPage() {
  const router = useRouter()
  const { isAuthenticated, loading, user, canManageEmployees, getAuthHeaders } = useAuth()
  const { language, dir } = useLanguage()

  const [items, setItems] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)

  const canManage = user?.is_superuser || user?.is_staff || canManageEmployees

  const t = language === 'en' ? {
    title: 'Contact request types',
    subtitle: 'Options shown in the homepage contact form',
    add: 'New type',
    edit: 'Edit type',
    name: 'Title (FA)',
    nameEn: 'Title (EN)',
    description: 'Description',
    icon: 'Lucide icon',
    color: 'Color',
    order: 'Order',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    actions: 'Actions',
    save: 'Save',
    cancel: 'Cancel',
    saving: 'Saving...',
    loading: 'Loading...',
    empty: 'No request types yet',
    back: 'Back to dashboard',
    settings: 'Contact section settings',
    confirmDelete: 'Delete this request type?',
    accessDenied: 'Access denied',
    needManager: 'Only managers and staff can manage request types',
    hint: 'Active types appear in the contact form dialog on the homepage. Use Lucide icons (Handshake, Megaphone, MessageCircle, …).',
    nameRequired: 'Title is required',
    importDefaults: 'Import defaults',
    importConfirm:
      'Warning: all existing request types will be deleted and replaced with Partnership, Advertising, and Consulting.\n\nContinue?',
    importing: 'Importing…',
  } : {
    title: 'انواع درخواست تماس',
    subtitle: 'گزینه‌هایی که در فرم تماس صفحه اصلی نمایش داده می‌شوند',
    add: 'نوع جدید',
    edit: 'ویرایش نوع',
    name: 'عنوان (فارسی)',
    nameEn: 'عنوان (انگلیسی)',
    description: 'توضیحات',
    icon: 'آیکون Lucide',
    color: 'رنگ',
    order: 'ترتیب',
    status: 'وضعیت',
    active: 'فعال',
    inactive: 'غیرفعال',
    actions: 'عملیات',
    save: 'ذخیره',
    cancel: 'انصراف',
    saving: 'در حال ذخیره...',
    loading: 'در حال بارگذاری...',
    empty: 'هنوز نوعی ثبت نشده است',
    back: 'بازگشت به داشبورد',
    settings: 'تنظیمات بخش تماس',
    confirmDelete: 'آیا از حذف این نوع درخواست اطمینان دارید؟',
    accessDenied: 'دسترسی محدود',
    needManager: 'مدیریت انواع درخواست فقط برای مدیر و staff است',
    hint: 'انواع فعال در دیالوگ فرم تماس دیده می‌شوند. آیکون باید از Lucide باشد (مثل Handshake، Megaphone، MessageCircle).',
    nameRequired: 'عنوان فارسی الزامی است',
    importDefaults: 'ایمپورت پیش‌فرض',
    importConfirm:
      'هشدار: همهٔ انواع درخواست قبلی حذف می‌شوند و با «همکاری»، «تبلیغات» و «مشاوره» جایگزین می‌گردند.\n\nادامه می‌دهید؟',
    importing: 'در حال ایمپورت…',
  }

  const fetchList = useCallback(async () => {
    try {
      setLoadingData(true)
      setError(null)
      const res = await axios.get(Config.endpoints.requser.types({ manage: 1 }), {
        headers: getAuthHeaders(),
      })
      const list = Array.isArray(res.data?.results)
        ? res.data.results
        : Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : []
      setItems(list)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || t.empty)
      setItems([])
    } finally {
      setLoadingData(false)
    }
  }, [getAuthHeaders, t.empty])

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login')
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && canManage) fetchList()
    else if (isAuthenticated) setLoadingData(false)
  }, [isAuthenticated, canManage, fetchList])

  const openCreate = () => {
    setEditing(null)
    setForm({
      ...emptyForm,
      order: items.length ? Math.max(...items.map((i) => i.order || 0)) + 10 : 10,
    })
    setFormError(null)
    setShowForm(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({
      name: item.name || '',
      name_en: item.name_en || '',
      description: item.description || '',
      icon: item.icon || 'Handshake',
      color: item.color || '#3b82f6',
      order: item.order ?? 10,
      is_active: item.is_active ?? true,
    })
    setFormError(null)
    setShowForm(true)
  }

  const fmtErrors = (data) => {
    if (!data) return 'خطا در ذخیره'
    if (typeof data === 'string') return data
    if (data.detail) return Array.isArray(data.detail) ? data.detail.join('، ') : data.detail
    if (data.message) return data.message
    const parts = []
    Object.entries(data).forEach(([k, v]) => {
      if (k === 'status') return
      parts.push(`${k}: ${Array.isArray(v) ? v.join('، ') : v}`)
    })
    return parts.join(' | ') || 'خطا در ذخیره'
  }

  const runImportDefaults = async () => {
    if (!window.confirm(t.importConfirm)) return
    setImporting(true)
    setError(null)
    try {
      await axios.post(
        Config.endpoints.requser.typesSeed(),
        {},
        { headers: getAuthHeaders() },
      )
      await fetchList()
    } catch (err) {
      setError(fmtErrors(err.response?.data) || err.message)
    } finally {
      setImporting(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setFormError(null)
    if (!form.name.trim()) {
      setFormError(t.nameRequired)
      return
    }
    try {
      setSaving(true)
      const payload = {
        name: form.name.trim(),
        name_en: form.name_en.trim(),
        description: form.description.trim(),
        icon: form.icon.trim() || 'Handshake',
        color: form.color || '#3b82f6',
        order: Number(form.order) || 0,
        is_active: !!form.is_active,
      }
      if (editing) {
        await axios.patch(
          Config.endpoints.requser.typeDetail(editing.id),
          payload,
          { headers: getAuthHeaders() }
        )
      } else {
        await axios.post(
          Config.endpoints.requser.types(),
          payload,
          { headers: getAuthHeaders() }
        )
      }
      setShowForm(false)
      fetchList()
    } catch (err) {
      setFormError(fmtErrors(err.response?.data))
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (item) => {
    try {
      const res = await axios.post(
        Config.endpoints.requser.typeToggleActive(item.id),
        {},
        { headers: getAuthHeaders() }
      )
      const next = res.data?.is_active
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, is_active: typeof next === 'boolean' ? next : !it.is_active } : it
        )
      )
    } catch (err) {
      alert(fmtErrors(err.response?.data))
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`${t.confirmDelete}\n${item.name}`)) return
    try {
      await axios.delete(Config.endpoints.requser.typeDetail(item.id), {
        headers: getAuthHeaders(),
      })
      setItems((prev) => prev.filter((it) => it.id !== item.id))
    } catch (err) {
      alert(fmtErrors(err.response?.data))
    }
  }

  if (loading || loadingData) {
    return (
      <div className={styles.page} dir={dir}>
        <div className={styles.wrap}>
          <div className={styles.loadingBox}>
            <RefreshCw size={28} className={styles.spinner} />
            <p>{t.loading}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  if (!canManage) {
    return (
      <div className={styles.page} dir={dir}>
        <div className={styles.wrap}>
          <div className={styles.denied}>
            <span className={styles.deniedIcon}><Shield size={40} /></span>
            <h3>{t.accessDenied}</h3>
            <p>{t.needManager}</p>
            <Link href="/dashboard" className={styles.primaryBtn}>{t.back}</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page} dir={dir}>
      <div className={styles.wrap}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}><Tags size={24} /></span>
            <div>
              <h1 className={styles.pageTitle}>{t.title} ({items.length})</h1>
              <p className={styles.pageDesc}>{t.subtitle}</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link href="/dashboard" className={styles.headerGhost}>
              <LayoutDashboard size={15} /> {t.back}
            </Link>
            <Link href="/site-settings" className={styles.headerGhost}>
              <Settings2 size={15} /> {t.settings}
            </Link>
            <button
              type="button"
              className={styles.headerGhost}
              onClick={runImportDefaults}
              disabled={importing}
            >
              {importing ? (
                <RefreshCw size={15} className={styles.spinner} />
              ) : (
                <Download size={15} />
              )}
              {importing ? t.importing : t.importDefaults}
            </button>
            <button type="button" className={styles.headerPrimary} onClick={openCreate}>
              <Plus size={16} /> {t.add}
            </button>
          </div>
        </div>

        <p className={styles.hint}>{t.hint}</p>

        <div className={styles.toolbar}>
          <button type="button" className={styles.ghostBtn} onClick={fetchList}>
            <RefreshCw size={14} />
          </button>
        </div>

        {error && <div className={styles.errorBar}>{error}</div>}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t.icon}</th>
                <th>{t.name}</th>
                <th>{t.nameEn}</th>
                <th>{t.order}</th>
                <th>{t.status}</th>
                <th>{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const RowIcon = resolveLucideIcon(item.icon, MessageCircle)
                return (
                <tr key={item.id} className={!item.is_active ? styles.rowInactive : ''}>
                  <td>
                    <span className={styles.iconCell} title={item.icon || 'MessageCircle'}>
                      <RowIcon size={18} />
                    </span>
                  </td>
                  <td>
                    <strong>{item.name}</strong>
                    {item.color && (
                      <>
                        {' '}
                        <span className={styles.colorDot} style={{ background: item.color }} title={item.color} />
                      </>
                    )}
                  </td>
                  <td dir="ltr">{item.name_en || '—'}</td>
                  <td><span className={styles.codeBadge}>{item.order}</span></td>
                  <td>
                    <span className={`${styles.statusPill} ${item.is_active ? styles.on : styles.off}`}>
                      {item.is_active ? <CheckCircle2 size={12} /> : <X size={12} />}
                      {item.is_active ? t.active : t.inactive}
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button type="button" className={styles.iconBtn} title={t.edit} onClick={() => openEdit(item)}>
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className={`${styles.iconBtn} ${item.is_active ? styles.warn : styles.ok}`}
                        title={item.is_active ? t.inactive : t.active}
                        onClick={() => handleToggle(item)}
                      >
                        <Power size={14} />
                      </button>
                      <button
                        type="button"
                        className={`${styles.iconBtn} ${styles.danger}`}
                        title={t.confirmDelete}
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
              {!items.length && (
                <tr>
                  <td colSpan={6}>
                    <div className={styles.emptyBox}>
                      <Tags size={28} />
                      <span>{t.empty}</span>
                      <button type="button" className={styles.primaryBtn} onClick={openCreate}>
                        <Plus size={14} /> {t.add}
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className={styles.overlay} onClick={() => setShowForm(false)} role="presentation">
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className={styles.modalHead}>
              <h2>{editing ? t.edit : t.add}</h2>
              <button type="button" className={styles.iconBtn} onClick={() => setShowForm(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              {formError && <div className={styles.errorBar}>{formError}</div>}

              <div className={styles.formGroup}>
                <label>{t.name} *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  autoFocus
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>{t.nameEn}</label>
                <input
                  dir="ltr"
                  value={form.name_en}
                  onChange={(e) => setForm((p) => ({ ...p, name_en: e.target.value }))}
                />
              </div>

              <div className={styles.formGroup}>
                <label>{t.description}</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div className={styles.formGroup}>
                <label>{t.icon}</label>
                <LucideIconPicker
                  value={form.icon || 'Handshake'}
                  onChange={(name) => setForm((p) => ({ ...p, icon: name }))}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>{t.color}</label>
                  <input
                    type="color"
                    value={form.color || '#3b82f6'}
                    onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                    style={{ height: 42, padding: 4, cursor: 'pointer' }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>{t.order}</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm((p) => ({ ...p, order: e.target.value }))}
                  />
                </div>
              </div>

              <label className={styles.switchRow}>
                <span>{t.active}</span>
                <span className={`${styles.switch} ${form.is_active ? styles.switchOn : ''}`}>
                  <input
                    type="checkbox"
                    checked={!!form.is_active}
                    onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                  />
                </span>
              </label>

              <div className={styles.formActions}>
                <button type="button" className={styles.ghostBtn} onClick={() => setShowForm(false)}>
                  {t.cancel}
                </button>
                <button type="submit" className={styles.primaryBtn} disabled={saving}>
                  {saving ? t.saving : t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
