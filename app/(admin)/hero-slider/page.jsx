// app/(admin)/hero-slider/page.jsx — مدیریت اسلایدهای هیرو
'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import {
  Images, Plus, Pencil, Trash2, RefreshCw, Shield,
  CheckCircle2, X, LayoutDashboard, Power, ImageIcon,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import Config from '@/config/config'
import { getFullImageUrl } from '@/utils/imageUrl'
import styles from './HeroSliderAdmin.module.css'

const emptyForm = {
  title: '',
  description: '',
  link: '',
  image_url: '',
  sort_order: 100,
  is_active: true,
}

const resolvePreview = (item) => {
  if (!item) return null
  const src = item.image_display || item.image_url || item.image
  if (!src) return null
  if (typeof src === 'string' && src.startsWith('/images/')) return src
  return getFullImageUrl(src)
}

export default function HeroSliderAdminPage() {
  const router = useRouter()
  const { isAuthenticated, loading, user, canManageEmployees, getAuthHeaders } = useAuth()
  const { language, dir } = useLanguage()

  const [items, setItems] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)

  const canManage = user?.is_superuser || user?.is_staff || canManageEmployees

  const t = language === 'en' ? {
    title: 'Hero slides',
    subtitle: 'Banner slides shown at the top of the site',
    add: 'New slide',
    edit: 'Edit slide',
    slideTitle: 'Title',
    description: 'Description',
    link: 'Link',
    image: 'Image',
    imageUrl: 'Image URL (optional)',
    order: 'Order',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    actions: 'Actions',
    save: 'Save',
    cancel: 'Cancel',
    saving: 'Saving...',
    loading: 'Loading...',
    empty: 'No slides yet',
    back: 'Back to dashboard',
    confirmDelete: 'Delete this slide?',
    accessDenied: 'Access denied',
    needManager: 'Only managers and staff can manage hero slides',
    hint: 'Active slides rotate in the site hero banner.',
    placeholderTitle: 'Slide title...',
    placeholderDesc: 'Short description...',
    placeholderLink: '/jobs',
    placeholderImageUrl: '/images/bg01.png or https://...',
    clearFile: 'Clear file',
    needImage: 'Upload an image or enter an image URL',
  } : {
    title: 'اسلایدهای هیرو',
    subtitle: 'بنرهای اسلایدر بالای سایت',
    add: 'اسلاید جدید',
    edit: 'ویرایش اسلاید',
    slideTitle: 'عنوان',
    description: 'توضیحات',
    link: 'لینک',
    image: 'تصویر',
    imageUrl: 'آدرس تصویر (اختیاری)',
    order: 'ترتیب',
    status: 'وضعیت',
    active: 'فعال',
    inactive: 'غیرفعال',
    actions: 'عملیات',
    save: 'ذخیره',
    cancel: 'انصراف',
    saving: 'در حال ذخیره...',
    loading: 'در حال بارگذاری...',
    empty: 'هنوز اسلایدی ثبت نشده است',
    back: 'بازگشت به داشبورد',
    confirmDelete: 'آیا از حذف این اسلاید اطمینان دارید؟',
    accessDenied: 'دسترسی محدود',
    needManager: 'مدیریت اسلایدر فقط برای مدیر و staff است',
    hint: 'اسلایدهای فعال به‌صورت چرخشی در بنر بالای سایت نمایش داده می‌شوند.',
    placeholderTitle: 'عنوان اسلاید...',
    placeholderDesc: 'توضیح کوتاه...',
    placeholderLink: '/jobs',
    placeholderImageUrl: '/images/bg01.png یا https://...',
    clearFile: 'حذف فایل',
    needImage: 'یک تصویر آپلود کنید یا آدرس تصویر وارد کنید',
  }

  const localPreview = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile)
    if (form.image_url?.trim()) {
      const src = form.image_url.trim()
      return src.startsWith('/images/') ? src : getFullImageUrl(src)
    }
    if (editing) return resolvePreview(editing)
    return null
  }, [imageFile, form.image_url, editing])

  useEffect(() => {
    if (!imageFile || !localPreview?.startsWith('blob:')) return undefined
    const url = localPreview
    return () => URL.revokeObjectURL(url)
  }, [imageFile, localPreview])

  const fetchList = useCallback(async () => {
    try {
      setLoadingData(true)
      setError(null)
      const res = await axios.get(Config.endpoints.news.heroSlides.list(), {
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
    setImageFile(null)
    setForm({
      ...emptyForm,
      sort_order: items.length ? Math.max(...items.map((i) => i.sort_order || 0)) + 10 : 10,
    })
    setFormError(null)
    setShowForm(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setImageFile(null)
    setForm({
      title: item.title || '',
      description: item.description || '',
      link: item.link || '',
      image_url: item.image_url || '',
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
    if (!form.title.trim()) {
      setFormError(language === 'en' ? 'Title is required' : 'عنوان الزامی است')
      return
    }
    const hasExistingImage = !!(editing && (editing.image || editing.image_url || editing.image_display))
    if (!imageFile && !form.image_url.trim() && !hasExistingImage) {
      setFormError(t.needImage)
      return
    }
    try {
      setSaving(true)
      const fd = new FormData()
      fd.append('title', form.title.trim())
      fd.append('description', form.description.trim())
      fd.append('link', form.link.trim())
      fd.append('image_url', form.image_url.trim())
      fd.append('sort_order', String(Number(form.sort_order) || 100))
      fd.append('is_active', form.is_active ? 'true' : 'false')
      if (imageFile) fd.append('image', imageFile)

      if (editing) {
        await axios.patch(
          Config.endpoints.news.heroSlides.update(editing.id),
          fd,
          { headers: getAuthHeaders() }
        )
      } else {
        await axios.post(
          Config.endpoints.news.heroSlides.create(),
          fd,
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
        Config.endpoints.news.heroSlides.toggleActive(item.id),
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
    if (!window.confirm(`${t.confirmDelete}\n${item.title}`)) return
    try {
      await axios.delete(Config.endpoints.news.heroSlides.delete(item.id), {
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
            <span className={styles.headerIcon}><Images size={24} /></span>
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
                <th>{t.image}</th>
                <th>{t.slideTitle}</th>
                <th>{t.order}</th>
                <th>{t.status}</th>
                <th>{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const thumb = resolvePreview(item)
                return (
                  <tr key={item.id} className={!item.is_active ? styles.rowInactive : ''}>
                    <td>
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb} alt="" className={styles.thumb} />
                      ) : (
                        <span className={styles.thumbPlaceholder}><ImageIcon size={16} /></span>
                      )}
                    </td>
                    <td>
                      <div className={styles.titleCell}>
                        <strong>{item.title}</strong>
                        {item.description ? <span>{item.description}</span> : null}
                      </div>
                    </td>
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
                )
              })}
            </tbody>
          </table>
          {items.length === 0 && !error && (
            <div className={styles.emptyBox}>
              <Images size={28} />
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
                  <label>{t.slideTitle} *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder={t.placeholderTitle}
                    maxLength={200}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>{t.description}</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder={t.placeholderDesc}
                    rows={2}
                    maxLength={400}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>{t.link}</label>
                  <input
                    dir="ltr"
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    placeholder={t.placeholderLink}
                    maxLength={300}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>{t.image}</label>
                  <div className={styles.fileRow}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />
                    {imageFile && (
                      <button
                        type="button"
                        className={styles.clearFile}
                        onClick={() => setImageFile(null)}
                      >
                        {t.clearFile}
                      </button>
                    )}
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>{t.imageUrl}</label>
                  <input
                    dir="ltr"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder={t.placeholderImageUrl}
                    maxLength={500}
                  />
                </div>
                {localPreview && (
                  <div className={styles.previewBox}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={localPreview} alt="" />
                  </div>
                )}
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
