// app/(admin)/ticker/page.jsx — مدیریت پیام‌های نوار خبری بالای سایت
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import {
  Megaphone, Plus, Pencil, Trash2, RefreshCw, Shield,
  CheckCircle2, X, LayoutDashboard, Power
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import Config from '@/config/config'
import styles from './Ticker.module.css'

const emptyForm = { text: '', sort_order: 100, is_active: true }

export default function TickerPage() {
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

  const canManage = user?.is_superuser || user?.is_staff || canManageEmployees

  const t = language === 'en' ? {
    title: 'Ticker messages',
    subtitle: 'Texts shown in the top breaking-news bar',
    add: 'New message',
    edit: 'Edit message',
    text: 'Message text',
    order: 'Order',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    actions: 'Actions',
    save: 'Save',
    cancel: 'Cancel',
    saving: 'Saving...',
    loading: 'Loading...',
    empty: 'No messages yet',
    back: 'Back to dashboard',
    confirmDelete: 'Delete this message?',
    accessDenied: 'Access denied',
    needManager: 'Only managers and staff can manage ticker messages',
    returnHome: 'Return home',
    hint: 'Active messages rotate in the site top bar.',
    placeholder: 'Enter ticker text...',
  } : {
    title: 'پیام‌های نوار خبری',
    subtitle: 'متن‌هایی که در نوار بالای سایت نمایش داده می‌شوند',
    add: 'پیام جدید',
    edit: 'ویرایش پیام',
    text: 'متن پیام',
    order: 'ترتیب',
    status: 'وضعیت',
    active: 'فعال',
    inactive: 'غیرفعال',
    actions: 'عملیات',
    save: 'ذخیره',
    cancel: 'انصراف',
    saving: 'در حال ذخیره...',
    loading: 'در حال بارگذاری...',
    empty: 'هنوز پیامی ثبت نشده است',
    back: 'بازگشت به داشبورد',
    confirmDelete: 'آیا از حذف این پیام اطمینان دارید؟',
    accessDenied: 'دسترسی محدود',
    needManager: 'مدیریت پیام‌های نوار خبری فقط برای مدیر و staff است',
    returnHome: 'بازگشت به صفحه اصلی',
    hint: 'پیام‌های فعال به‌صورت چرخشی در نوار بالای سایت نمایش داده می‌شوند.',
    placeholder: 'متن پیام را وارد کنید...',
  }

  const fetchList = useCallback(async () => {
    try {
      setLoadingData(true)
      setError(null)
      const res = await axios.get(Config.endpoints.news.tickers.list(), {
        headers: getAuthHeaders(),
      })
      const list = Array.isArray(res.data?.data)
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
      sort_order: items.length ? Math.max(...items.map((i) => i.sort_order || 0)) + 10 : 10,
    })
    setFormError(null)
    setShowForm(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({
      text: item.text || '',
      sort_order: item.sort_order ?? 100,
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

  const handleSave = async (e) => {
    e.preventDefault()
    setFormError(null)
    if (!form.text.trim()) {
      setFormError(language === 'en' ? 'Text is required' : 'متن پیام الزامی است')
      return
    }
    try {
      setSaving(true)
      const payload = {
        text: form.text.trim(),
        sort_order: Number(form.sort_order) || 100,
        is_active: !!form.is_active,
      }
      if (editing) {
        await axios.patch(
          Config.endpoints.news.tickers.update(editing.id),
          payload,
          { headers: getAuthHeaders() }
        )
      } else {
        await axios.post(
          Config.endpoints.news.tickers.create(),
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
        Config.endpoints.news.tickers.toggleActive(item.id),
        {},
        { headers: getAuthHeaders() }
      )
      const isActive = res.data?.is_active
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, is_active: isActive ?? !it.is_active } : it))
      )
    } catch (err) {
      alert(fmtErrors(err.response?.data))
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`${t.confirmDelete}\n${item.text}`)) return
    try {
      await axios.delete(Config.endpoints.news.tickers.delete(item.id), {
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
            <span className={styles.headerIcon}><Megaphone size={24} /></span>
            <div>
              <h1 className={styles.pageTitle}>{t.title} ({items.length})</h1>
              <p className={styles.pageDesc}>{t.subtitle}</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link href="/dashboard" className={styles.headerGhost}>
              <LayoutDashboard size={15} /> {t.back}
            </Link>
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
                <th>{t.text}</th>
                <th>{t.order}</th>
                <th>{t.status}</th>
                <th>{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className={!item.is_active ? styles.rowInactive : ''}>
                  <td><strong>{item.text}</strong></td>
                  <td><span className={styles.codeBadge}>{item.sort_order}</span></td>
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
              ))}
            </tbody>
          </table>
          {items.length === 0 && !error && (
            <div className={styles.emptyBox}>
              <Megaphone size={28} />
              <span>{t.empty}</span>
            </div>
          )}
        </div>

        {showForm && (
          <div className={styles.overlay} onClick={() => setShowForm(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHead}>
                <h2>{editing ? t.edit : t.add}</h2>
                <button type="button" className={styles.iconBtn} onClick={() => setShowForm(false)}>
                  <X size={16} />
                </button>
              </div>
              {formError && <div className={styles.errorBar}>{formError}</div>}
              <form onSubmit={handleSave}>
                <div className={styles.formGroup}>
                  <label>{t.text} *</label>
                  <textarea
                    value={form.text}
                    onChange={(e) => setForm({ ...form, text: e.target.value })}
                    placeholder={t.placeholder}
                    rows={3}
                    maxLength={300}
                    required
                  />
                  <small className={styles.charCount}>{form.text.length}/300</small>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t.order}</label>
                    <input
                      type="number"
                      dir="ltr"
                      value={form.sort_order}
                      onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                    />
                  </div>
                  <label className={styles.switchRow}>
                    <span>{t.active}</span>
                    <span className={`${styles.switch} ${form.is_active ? styles.switchOn : ''}`}>
                      <input
                        type="checkbox"
                        checked={!!form.is_active}
                        onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      />
                    </span>
                  </label>
                </div>
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
    </div>
  )
}
