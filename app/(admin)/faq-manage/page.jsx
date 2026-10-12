'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  HelpCircle,
  LayoutDashboard,
  RefreshCw,
  Save,
  Plus,
  Trash2,
  Pencil,
  Shield,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import faqService from '@/components/Faq/services/faqService'
import styles from './FaqManage.module.css'

const emptyItem = {
  category: '',
  question_fa: '',
  question_en: '',
  answer_fa: '',
  answer_en: '',
  order: 10,
  is_active: true,
}

const emptyCategory = {
  key: '',
  name_fa: '',
  name_en: '',
  order: 10,
  is_active: true,
}

export default function FaqManagePage() {
  const router = useRouter()
  const { isAuthenticated, loading, user, canManageEmployees } = useAuth()
  const canManage = user?.is_superuser || user?.is_staff || canManageEmployees

  const [tab, setTab] = useState('items')
  const [settings, setSettings] = useState({})
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [filterCat, setFilterCat] = useState('')
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)

  const [showItemForm, setShowItemForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [itemForm, setItemForm] = useState(emptyItem)

  const [showCatForm, setShowCatForm] = useState(false)
  const [editingCat, setEditingCat] = useState(null)
  const [catForm, setCatForm] = useState(emptyCategory)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login?next=/faq-manage')
    }
  }, [loading, isAuthenticated, router])

  const load = useCallback(async () => {
    setLoadingData(true)
    setErr(null)
    const [s, c, i] = await Promise.all([
      faqService.getSettings(),
      faqService.getCategories(true),
      faqService.getItems({ include_inactive: '1' }),
    ])
    if (s.success) setSettings(s.data || {})
    if (c.success) setCategories(c.data || [])
    if (i.success) setItems(i.data || [])
    if (!s.success && !c.success && !i.success) {
      setErr('خطا در بارگذاری داده‌ها')
    }
    setLoadingData(false)
  }, [])

  useEffect(() => {
    if (isAuthenticated && canManage) load()
    else if (isAuthenticated) setLoadingData(false)
  }, [isAuthenticated, canManage, load])

  const filteredItems = useMemo(() => {
    if (!filterCat) return items
    if (filterCat === 'none') return items.filter((it) => !it.category)
    return items.filter(
      (it) => String(it.category) === String(filterCat) || it.category_key === filterCat
    )
  }, [items, filterCat])

  const stats = useMemo(() => ({
    items: items.length,
    activeItems: items.filter((i) => i.is_active).length,
    categories: categories.length,
  }), [items, categories])

  const saveSettings = async () => {
    setSaving(true)
    setMsg(null)
    setErr(null)
    const res = await faqService.updateSettings(settings)
    setSaving(false)
    if (res.success) {
      setSettings(res.data || settings)
      setMsg('تنظیمات ذخیره شد')
    } else {
      setErr(res.error || 'خطا در ذخیره')
    }
  }

  const openCreateItem = () => {
    setEditingItem(null)
    setItemForm({
      ...emptyItem,
      order: items.length ? Math.max(...items.map((i) => i.order || 0)) + 10 : 10,
      category: filterCat && filterCat !== 'none' ? filterCat : '',
    })
    setShowItemForm(true)
  }

  const openEditItem = (item) => {
    setEditingItem(item)
    setItemForm({
      category: item.category || '',
      question_fa: item.question_fa || '',
      question_en: item.question_en || '',
      answer_fa: item.answer_fa || '',
      answer_en: item.answer_en || '',
      order: item.order ?? 10,
      is_active: item.is_active ?? true,
    })
    setShowItemForm(true)
  }

  const saveItem = async (e) => {
    e.preventDefault()
    setErr(null)
    if (!itemForm.question_fa.trim() || !itemForm.answer_fa.trim()) {
      setErr('سوال و پاسخ فارسی الزامی است')
      return
    }
    setSaving(true)
    const payload = {
      ...itemForm,
      category: itemForm.category || null,
      order: Number(itemForm.order) || 0,
    }
    const res = editingItem
      ? await faqService.updateItem(editingItem.id, payload)
      : await faqService.createItem(payload)
    setSaving(false)
    if (res.success) {
      setShowItemForm(false)
      setMsg(editingItem ? 'سوال به‌روزرسانی شد' : 'سوال اضافه شد')
      load()
    } else {
      setErr(res.error || 'خطا در ذخیره سوال')
    }
  }

  const deleteItem = async (item) => {
    if (!window.confirm(`حذف این سوال؟\n${item.question_fa}`)) return
    const res = await faqService.deleteItem(item.id)
    if (res.success) {
      setItems((prev) => prev.filter((i) => i.id !== item.id))
      setMsg('حذف شد')
    } else {
      setErr(res.error || 'خطا در حذف')
    }
  }

  const toggleItem = async (item) => {
    const res = await faqService.updateItem(item.id, { is_active: !item.is_active })
    if (res.success) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_active: !i.is_active } : i))
      )
    }
  }

  const openCreateCat = () => {
    setEditingCat(null)
    setCatForm({
      ...emptyCategory,
      order: categories.length
        ? Math.max(...categories.map((c) => c.order || 0)) + 10
        : 10,
    })
    setShowCatForm(true)
  }

  const openEditCat = (cat) => {
    setEditingCat(cat)
    setCatForm({
      key: cat.key || '',
      name_fa: cat.name_fa || '',
      name_en: cat.name_en || '',
      order: cat.order ?? 10,
      is_active: cat.is_active ?? true,
    })
    setShowCatForm(true)
  }

  const saveCat = async (e) => {
    e.preventDefault()
    if (!catForm.name_fa.trim()) {
      setErr('نام فارسی دسته الزامی است')
      return
    }
    setSaving(true)
    const payload = {
      ...catForm,
      order: Number(catForm.order) || 0,
      key: catForm.key.trim() || undefined,
    }
    const res = editingCat
      ? await faqService.updateCategory(editingCat.id, payload)
      : await faqService.createCategory(payload)
    setSaving(false)
    if (res.success) {
      setShowCatForm(false)
      setMsg(editingCat ? 'دسته به‌روزرسانی شد' : 'دسته اضافه شد')
      load()
    } else {
      setErr(res.error || 'خطا در ذخیره دسته')
    }
  }

  const deleteCat = async (cat) => {
    if (!window.confirm(`حذف دسته «${cat.name_fa}»؟`)) return
    const res = await faqService.deleteCategory(cat.id)
    if (res.success) {
      setCategories((prev) => prev.filter((c) => c.id !== cat.id))
      setMsg('دسته حذف شد')
    } else {
      setErr(res.error || 'خطا در حذف')
    }
  }

  if (loading || (isAuthenticated && canManage && loadingData)) {
    return (
      <div className={styles.page} dir="rtl">
        <div className={styles.wrap}>
          <div className={styles.loadingBox}>
            <RefreshCw size={28} className={styles.spinner} />
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
            <p>مدیریت سوالات متداول فقط برای مدیر و staff است</p>
            <Link href="/dashboard" className={styles.primaryBtn}>بازگشت به داشبورد</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.wrap}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}><HelpCircle size={24} /></span>
            <div>
              <h1 className={styles.pageTitle}>مدیریت سوالات متداول</h1>
              <p className={styles.pageDesc}>تنظیمات، دسته‌ها و سوالات صفحه /faq</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link href="/dashboard" className={styles.headerGhost}>
              <LayoutDashboard size={15} /> داشبورد
            </Link>
            <Link href="/faq" className={styles.headerGhost} target="_blank">
              <ExternalLink size={15} /> مشاهده صفحه
            </Link>
            <button type="button" className={styles.headerPrimary} onClick={load}>
              <RefreshCw size={15} /> بروزرسانی
            </button>
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <p className={styles.statLabel}>کل سوالات</p>
            <p className={styles.statValue}>{stats.items}</p>
          </div>
          <div className={styles.stat}>
            <p className={styles.statLabel}>فعال</p>
            <p className={styles.statValue}>{stats.activeItems}</p>
          </div>
          <div className={styles.stat}>
            <p className={styles.statLabel}>دسته‌ها</p>
            <p className={styles.statValue}>{stats.categories}</p>
          </div>
        </div>

        {msg ? <div className={styles.msg}>{msg}</div> : null}
        {err ? <div className={styles.err}>{err}</div> : null}

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${tab === 'items' ? styles.tabOn : ''}`}
            onClick={() => setTab('items')}
          >
            سوالات
          </button>
          <button
            type="button"
            className={`${styles.tab} ${tab === 'categories' ? styles.tabOn : ''}`}
            onClick={() => setTab('categories')}
          >
            دسته‌ها
          </button>
          <button
            type="button"
            className={`${styles.tab} ${tab === 'settings' ? styles.tabOn : ''}`}
            onClick={() => setTab('settings')}
          >
            تنظیمات صفحه
          </button>
        </div>

        {tab === 'settings' ? (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>عنوان و توضیحات</h2>
            <div className={styles.formGrid}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>عنوان فارسی</label>
                  <input
                    value={settings.title_fa || ''}
                    onChange={(e) => setSettings((p) => ({ ...p, title_fa: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>عنوان انگلیسی</label>
                  <input
                    dir="ltr"
                    value={settings.title_en || ''}
                    onChange={(e) => setSettings((p) => ({ ...p, title_en: e.target.value }))}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>زیرعنوان فارسی</label>
                  <input
                    value={settings.subtitle_fa || ''}
                    onChange={(e) => setSettings((p) => ({ ...p, subtitle_fa: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>زیرعنوان انگلیسی</label>
                  <input
                    dir="ltr"
                    value={settings.subtitle_en || ''}
                    onChange={(e) => setSettings((p) => ({ ...p, subtitle_en: e.target.value }))}
                  />
                </div>
              </div>
              <div className={styles.formActions}>
                <button type="button" className={styles.primaryBtn} onClick={saveSettings} disabled={saving}>
                  <Save size={15} /> {saving ? 'در حال ذخیره…' : 'ذخیره تنظیمات'}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {tab === 'categories' ? (
          <div className={styles.panel}>
            <div className={styles.toolbar}>
              <button type="button" className={styles.primaryBtn} onClick={openCreateCat}>
                <Plus size={15} /> دسته جدید
              </button>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>نام</th>
                    <th>کلید</th>
                    <th>ترتیب</th>
                    <th>سوالات</th>
                    <th>وضعیت</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id} className={!cat.is_active ? styles.rowInactive : ''}>
                      <td>
                        <strong>{cat.name_fa}</strong>
                        {cat.name_en ? <div className={styles.aPreview} dir="ltr">{cat.name_en}</div> : null}
                      </td>
                      <td><span className={styles.codeBadge}>{cat.key}</span></td>
                      <td>{cat.order}</td>
                      <td>{cat.item_count ?? '—'}</td>
                      <td>
                        <span className={`${styles.statusPill} ${cat.is_active ? styles.on : styles.off}`}>
                          {cat.is_active ? <CheckCircle2 size={12} /> : <X size={12} />}
                          {cat.is_active ? 'فعال' : 'غیرفعال'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.rowActions}>
                          <button type="button" className={styles.iconBtn} onClick={() => openEditCat(cat)}>
                            <Pencil size={14} />
                          </button>
                          <button type="button" className={`${styles.iconBtn} ${styles.danger}`} onClick={() => deleteCat(cat)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!categories.length ? (
                    <tr>
                      <td colSpan={6}>
                        <div className={styles.emptyBox}>
                          <span>هنوز دسته‌ای نیست</span>
                          <button type="button" className={styles.primaryBtn} onClick={openCreateCat}>
                            <Plus size={14} /> دسته جدید
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {tab === 'items' ? (
          <div className={styles.panel}>
            <div className={styles.toolbar}>
              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid var(--line)' }}
              >
                <option value="">همه دسته‌ها</option>
                <option value="none">بدون دسته</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name_fa}</option>
                ))}
              </select>
              <button type="button" className={styles.primaryBtn} onClick={openCreateItem}>
                <Plus size={15} /> سوال جدید
              </button>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>سوال / پاسخ</th>
                    <th>دسته</th>
                    <th>ترتیب</th>
                    <th>وضعیت</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className={!item.is_active ? styles.rowInactive : ''}>
                      <td>
                        <span className={styles.qPreview}>{item.question_fa}</span>
                        <span className={styles.aPreview}>{item.answer_fa}</span>
                      </td>
                      <td>{item.category_name || '—'}</td>
                      <td>{item.order}</td>
                      <td>
                        <button
                          type="button"
                          className={`${styles.statusPill} ${item.is_active ? styles.on : styles.off}`}
                          onClick={() => toggleItem(item)}
                          title="تغییر وضعیت"
                        >
                          {item.is_active ? <CheckCircle2 size={12} /> : <X size={12} />}
                          {item.is_active ? 'فعال' : 'غیرفعال'}
                        </button>
                      </td>
                      <td>
                        <div className={styles.rowActions}>
                          <button type="button" className={styles.iconBtn} onClick={() => openEditItem(item)}>
                            <Pencil size={14} />
                          </button>
                          <button type="button" className={`${styles.iconBtn} ${styles.danger}`} onClick={() => deleteItem(item)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filteredItems.length ? (
                    <tr>
                      <td colSpan={5}>
                        <div className={styles.emptyBox}>
                          <span>سوالی یافت نشد</span>
                          <button type="button" className={styles.primaryBtn} onClick={openCreateItem}>
                            <Plus size={14} /> سوال جدید
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>

      {showItemForm ? (
        <div className={styles.overlay} onClick={() => setShowItemForm(false)} role="presentation">
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className={styles.modalHead}>
              <h2>{editingItem ? 'ویرایش سوال' : 'سوال جدید'}</h2>
              <button type="button" className={styles.iconBtn} onClick={() => setShowItemForm(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={saveItem}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>دسته</label>
                  <select
                    value={itemForm.category || ''}
                    onChange={(e) => setItemForm((p) => ({ ...p, category: e.target.value }))}
                  >
                    <option value="">بدون دسته</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name_fa}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>سوال فارسی *</label>
                  <input
                    value={itemForm.question_fa}
                    onChange={(e) => setItemForm((p) => ({ ...p, question_fa: e.target.value }))}
                    required
                    autoFocus
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>پاسخ فارسی *</label>
                  <textarea
                    value={itemForm.answer_fa}
                    onChange={(e) => setItemForm((p) => ({ ...p, answer_fa: e.target.value }))}
                    required
                    rows={4}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>سوال انگلیسی</label>
                  <input
                    dir="ltr"
                    value={itemForm.question_en}
                    onChange={(e) => setItemForm((p) => ({ ...p, question_en: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>پاسخ انگلیسی</label>
                  <textarea
                    dir="ltr"
                    value={itemForm.answer_en}
                    onChange={(e) => setItemForm((p) => ({ ...p, answer_en: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>ترتیب</label>
                    <input
                      type="number"
                      value={itemForm.order}
                      onChange={(e) => setItemForm((p) => ({ ...p, order: e.target.value }))}
                    />
                  </div>
                  <label className={styles.switchRow}>
                    <span>فعال</span>
                    <input
                      type="checkbox"
                      checked={!!itemForm.is_active}
                      onChange={(e) => setItemForm((p) => ({ ...p, is_active: e.target.checked }))}
                    />
                  </label>
                </div>
              </div>
              <div className={styles.formActions}>
                <button type="button" className={styles.ghostBtn} onClick={() => setShowItemForm(false)}>انصراف</button>
                <button type="submit" className={styles.primaryBtn} disabled={saving}>
                  {saving ? 'در حال ذخیره…' : 'ذخیره'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showCatForm ? (
        <div className={styles.overlay} onClick={() => setShowCatForm(false)} role="presentation">
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className={styles.modalHead}>
              <h2>{editingCat ? 'ویرایش دسته' : 'دسته جدید'}</h2>
              <button type="button" className={styles.iconBtn} onClick={() => setShowCatForm(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={saveCat}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>نام فارسی *</label>
                  <input
                    value={catForm.name_fa}
                    onChange={(e) => setCatForm((p) => ({ ...p, name_fa: e.target.value }))}
                    required
                    autoFocus
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>نام انگلیسی</label>
                  <input
                    dir="ltr"
                    value={catForm.name_en}
                    onChange={(e) => setCatForm((p) => ({ ...p, name_en: e.target.value }))}
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>کلید (اختیاری)</label>
                    <input
                      dir="ltr"
                      value={catForm.key}
                      onChange={(e) => setCatForm((p) => ({ ...p, key: e.target.value }))}
                      placeholder="general"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>ترتیب</label>
                    <input
                      type="number"
                      value={catForm.order}
                      onChange={(e) => setCatForm((p) => ({ ...p, order: e.target.value }))}
                    />
                  </div>
                </div>
                <label className={styles.switchRow}>
                  <span>فعال</span>
                  <input
                    type="checkbox"
                    checked={!!catForm.is_active}
                    onChange={(e) => setCatForm((p) => ({ ...p, is_active: e.target.checked }))}
                  />
                </label>
              </div>
              <div className={styles.formActions}>
                <button type="button" className={styles.ghostBtn} onClick={() => setShowCatForm(false)}>انصراف</button>
                <button type="submit" className={styles.primaryBtn} disabled={saving}>
                  {saving ? 'در حال ذخیره…' : 'ذخیره'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
