'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AppWindow,
  LayoutDashboard,
  RefreshCw,
  Plus,
  Trash2,
  Pencil,
  ExternalLink,
  X,
  Save,
  BarChart3,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import softappsService from '@/components/SoftApps/services/softappsService'
import styles from './AppsManage.module.css'

const PLATFORMS = [
  { id: 'windows', label: 'ویندوز' },
  { id: 'mac', label: 'مک' },
  { id: 'android', label: 'اندروید' },
  { id: 'ios', label: 'iOS' },
  { id: 'linux', label: 'لینوکس' },
  { id: 'web', label: 'وب' },
  { id: 'other', label: 'سایر' },
]

const emptyApp = {
  title: '',
  short_desc: '',
  description: '',
  platform: 'windows',
  version: '',
  file_size_label: '',
  external_url: '',
  category_id: '',
  is_free: true,
  price: 0,
  is_active: true,
  is_featured: false,
  requires_login_for_free: false,
  sort_order: 0,
}

const emptyCat = {
  name: '',
  color: '#0e7490',
  sort_order: 0,
  is_active: true,
}

function formatPrice(n) {
  return Number(n || 0).toLocaleString('fa-IR')
}

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('fa-IR')
  } catch {
    return iso
  }
}

export default function AppsManagePage() {
  const router = useRouter()
  const { isAuthenticated, loading, user, canManageEmployees } = useAuth()
  const canManage = user?.is_superuser || user?.is_staff || canManageEmployees

  const [tab, setTab] = useState('apps')
  const [apps, setApps] = useState([])
  const [categories, setCategories] = useState([])
  const [accounting, setAccounting] = useState(null)
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)

  const [showAppForm, setShowAppForm] = useState(false)
  const [editingApp, setEditingApp] = useState(null)
  const [appForm, setAppForm] = useState(emptyApp)
  const [iconFile, setIconFile] = useState(null)
  const [packageFile, setPackageFile] = useState(null)

  const [showCatForm, setShowCatForm] = useState(false)
  const [editingCat, setEditingCat] = useState(null)
  const [catForm, setCatForm] = useState(emptyCat)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login?next=/apps-manage')
    }
  }, [loading, isAuthenticated, router])

  const load = useCallback(async () => {
    setLoadingData(true)
    setErr(null)
    const [a, c, acc] = await Promise.all([
      softappsService.manageList(),
      softappsService.manageCategories(),
      softappsService.accounting(),
    ])
    if (a.success) setApps(a.data || [])
    else setErr(a.error)
    if (c.success) setCategories(c.data || [])
    if (acc.success) setAccounting(acc.data || null)
    setLoadingData(false)
  }, [])

  useEffect(() => {
    if (isAuthenticated && canManage) load()
  }, [isAuthenticated, canManage, load])

  const flash = (ok, text) => {
    if (ok) {
      setMsg(text)
      setErr(null)
    } else {
      setErr(text)
      setMsg(null)
    }
    setTimeout(() => {
      setMsg(null)
      setErr(null)
    }, 4000)
  }

  const openCreateApp = () => {
    setEditingApp(null)
    setAppForm(emptyApp)
    setIconFile(null)
    setPackageFile(null)
    setShowAppForm(true)
  }

  const openEditApp = (app) => {
    setEditingApp(app)
    setAppForm({
      title: app.title || '',
      short_desc: app.short_desc || '',
      description: app.description || '',
      platform: app.platform || 'windows',
      version: app.version || '',
      file_size_label: app.file_size_label || '',
      external_url: app.external_url || '',
      category_id: app.category?.id || '',
      is_free: !!app.is_free,
      price: app.price || 0,
      is_active: !!app.is_active,
      is_featured: !!app.is_featured,
      requires_login_for_free: !!app.requires_login_for_free,
      sort_order: app.sort_order || 0,
    })
    setIconFile(null)
    setPackageFile(null)
    setShowAppForm(true)
  }

  const buildAppFormData = () => {
    const fd = new FormData()
    Object.entries(appForm).forEach(([k, v]) => {
      if (k === 'category_id') {
        if (v) fd.append('category_id', v)
        return
      }
      if (typeof v === 'boolean') {
        fd.append(k, v ? 'true' : 'false')
        return
      }
      fd.append(k, v ?? '')
    })
    if (iconFile) fd.append('icon', iconFile)
    if (packageFile) fd.append('package_file', packageFile)
    return fd
  }

  const saveApp = async () => {
    if (!appForm.title.trim()) {
      flash(false, 'عنوان الزامی است')
      return
    }
    setSaving(true)
    const fd = buildAppFormData()
    const res = editingApp
      ? await softappsService.updateApp(editingApp.id, fd)
      : await softappsService.createApp(fd)
    setSaving(false)
    if (!res.success) {
      flash(false, res.error || 'خطا')
      return
    }
    flash(true, editingApp ? 'ویرایش شد' : 'افزوده شد')
    setShowAppForm(false)
    load()
  }

  const removeApp = async (id) => {
    if (!window.confirm('حذف این نرم‌افزار؟')) return
    const res = await softappsService.deleteApp(id)
    if (!res.success) {
      flash(false, res.error)
      return
    }
    flash(true, 'حذف شد')
    load()
  }

  const openCreateCat = () => {
    setEditingCat(null)
    setCatForm(emptyCat)
    setShowCatForm(true)
  }

  const openEditCat = (cat) => {
    setEditingCat(cat)
    setCatForm({
      name: cat.name || '',
      color: cat.color || '#0e7490',
      sort_order: cat.sort_order || 0,
      is_active: !!cat.is_active,
    })
    setShowCatForm(true)
  }

  const saveCat = async () => {
    if (!catForm.name.trim()) {
      flash(false, 'نام دسته الزامی است')
      return
    }
    setSaving(true)
    const payload = {
      ...catForm,
      sort_order: Number(catForm.sort_order) || 0,
    }
    const res = editingCat
      ? await softappsService.updateCategory(editingCat.id, payload)
      : await softappsService.createCategory(payload)
    setSaving(false)
    if (!res.success) {
      flash(false, res.error || 'خطا')
      return
    }
    flash(true, editingCat ? 'دسته ویرایش شد' : 'دسته اضافه شد')
    setShowCatForm(false)
    load()
  }

  const removeCat = async (id) => {
    if (!window.confirm('حذف این دسته؟')) return
    const res = await softappsService.deleteCategory(id)
    if (!res.success) {
      flash(false, res.error)
      return
    }
    flash(true, 'حذف شد')
    load()
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.wrap}>
          <div className={styles.empty}>در حال بارگذاری…</div>
        </div>
      </div>
    )
  }

  if (!canManage) {
    return (
      <div className={styles.page}>
        <div className={styles.wrap}>
          <div className={styles.empty}>دسترسی مدیریت ندارید.</div>
        </div>
      </div>
    )
  }

  const summary = accounting?.summary || {}

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.wrap}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <AppWindow size={24} />
            </div>
            <div>
              <h1 className={styles.pageTitle}>نرم‌افزارهای کاربردی</h1>
              <p className={styles.pageDesc}>
                انتشار، قیمت‌گذاری، دانلود و حسابداری خرید
              </p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link href="/dashboard" className={styles.headerGhost}>
              <LayoutDashboard size={15} />
              داشبورد
            </Link>
            <Link href="/apps" className={styles.headerGhost} target="_blank">
              <ExternalLink size={15} />
              صفحه عمومی
            </Link>
            <button
              type="button"
              className={styles.headerGhost}
              onClick={load}
              disabled={loadingData}
            >
              <RefreshCw size={15} />
              بروزرسانی
            </button>
            {tab === 'apps' ? (
              <button
                type="button"
                className={styles.headerPrimary}
                onClick={openCreateApp}
              >
                <Plus size={15} />
                نرم‌افزار جدید
              </button>
            ) : null}
            {tab === 'categories' ? (
              <button
                type="button"
                className={styles.headerPrimary}
                onClick={openCreateCat}
              >
                <Plus size={15} />
                دسته جدید
              </button>
            ) : null}
          </div>
        </header>

        {msg ? <div className={`${styles.alert} ${styles.alertOk}`}>{msg}</div> : null}
        {err ? <div className={`${styles.alert} ${styles.alertErr}`}>{err}</div> : null}

        <div className={styles.tabs}>
          {[
            { id: 'apps', label: 'نرم‌افزارها' },
            { id: 'categories', label: 'دسته‌ها' },
            { id: 'accounting', label: 'حسابداری' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${styles.tab} ${tab === t.id ? styles.tabOn : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.id === 'accounting' ? <BarChart3 size={14} /> : null}
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'apps' ? (
          <>
            {showAppForm ? (
              <div className={styles.panel}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                >
                  <h2 className={styles.panelTitle} style={{ margin: 0 }}>
                    {editingApp ? 'ویرایش نرم‌افزار' : 'افزودن نرم‌افزار'}
                  </h2>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => setShowAppForm(false)}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className={styles.formGrid}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>عنوان *</label>
                      <input
                        value={appForm.title}
                        onChange={(e) =>
                          setAppForm((f) => ({ ...f, title: e.target.value }))
                        }
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>دسته</label>
                      <select
                        value={appForm.category_id}
                        onChange={(e) =>
                          setAppForm((f) => ({
                            ...f,
                            category_id: e.target.value,
                          }))
                        }
                      >
                        <option value="">بدون دسته</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>خلاصه</label>
                    <input
                      value={appForm.short_desc}
                      onChange={(e) =>
                        setAppForm((f) => ({ ...f, short_desc: e.target.value }))
                      }
                      maxLength={300}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>توضیحات</label>
                    <textarea
                      value={appForm.description}
                      onChange={(e) =>
                        setAppForm((f) => ({
                          ...f,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>پلتفرم</label>
                      <select
                        value={appForm.platform}
                        onChange={(e) =>
                          setAppForm((f) => ({
                            ...f,
                            platform: e.target.value,
                          }))
                        }
                      >
                        {PLATFORMS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>نسخه</label>
                      <input
                        value={appForm.version}
                        onChange={(e) =>
                          setAppForm((f) => ({ ...f, version: e.target.value }))
                        }
                        placeholder="1.0.0"
                      />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>حجم نمایشی</label>
                      <input
                        value={appForm.file_size_label}
                        onChange={(e) =>
                          setAppForm((f) => ({
                            ...f,
                            file_size_label: e.target.value,
                          }))
                        }
                        placeholder="مثلاً ۴۵ مگابایت"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>ترتیب</label>
                      <input
                        type="number"
                        value={appForm.sort_order}
                        onChange={(e) =>
                          setAppForm((f) => ({
                            ...f,
                            sort_order: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>آیکن / کاور</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setIconFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>فایل نصب / دانلود</label>
                      <input
                        type="file"
                        onChange={(e) =>
                          setPackageFile(e.target.files?.[0] || null)
                        }
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>لینک خارجی (اگر فایل آپلود نشود)</label>
                    <input
                      value={appForm.external_url}
                      onChange={(e) =>
                        setAppForm((f) => ({
                          ...f,
                          external_url: e.target.value,
                        }))
                      }
                      placeholder="https://..."
                      dir="ltr"
                    />
                  </div>
                  <div className={styles.switchRow}>
                    <span>رایگان</span>
                    <input
                      type="checkbox"
                      checked={appForm.is_free}
                      onChange={(e) =>
                        setAppForm((f) => ({
                          ...f,
                          is_free: e.target.checked,
                          price: e.target.checked ? 0 : f.price,
                        }))
                      }
                    />
                  </div>
                  {!appForm.is_free ? (
                    <div className={styles.formGroup}>
                      <label>قیمت (تومان)</label>
                      <input
                        type="number"
                        min={0}
                        value={appForm.price}
                        onChange={(e) =>
                          setAppForm((f) => ({ ...f, price: e.target.value }))
                        }
                      />
                    </div>
                  ) : null}
                  <div className={styles.switchRow}>
                    <span>منتشر / فعال</span>
                    <input
                      type="checkbox"
                      checked={appForm.is_active}
                      onChange={(e) =>
                        setAppForm((f) => ({
                          ...f,
                          is_active: e.target.checked,
                        }))
                      }
                    />
                  </div>
                  <div className={styles.switchRow}>
                    <span>ویژه</span>
                    <input
                      type="checkbox"
                      checked={appForm.is_featured}
                      onChange={(e) =>
                        setAppForm((f) => ({
                          ...f,
                          is_featured: e.target.checked,
                        }))
                      }
                    />
                  </div>
                  <div className={styles.switchRow}>
                    <span>حتی برای رایگان ورود لازم است</span>
                    <input
                      type="checkbox"
                      checked={appForm.requires_login_for_free}
                      onChange={(e) =>
                        setAppForm((f) => ({
                          ...f,
                          requires_login_for_free: e.target.checked,
                        }))
                      }
                    />
                  </div>
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.primaryBtn}
                      onClick={saveApp}
                      disabled={saving}
                    >
                      <Save size={15} />
                      {saving ? 'در حال ذخیره…' : 'ذخیره'}
                    </button>
                    <button
                      type="button"
                      className={styles.ghostBtn}
                      onClick={() => setShowAppForm(false)}
                    >
                      انصراف
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>لیست نرم‌افزارها</h2>
              {loadingData ? (
                <div className={styles.empty}>در حال بارگذاری…</div>
              ) : apps.length === 0 ? (
                <div className={styles.empty}>
                  هنوز نرم‌افزاری ثبت نشده — یکی اضافه کنید.
                </div>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>نرم‌افزار</th>
                        <th>قیمت</th>
                        <th>دانلود</th>
                        <th>خرید</th>
                        <th>وضعیت</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {apps.map((app) => (
                        <tr
                          key={app.id}
                          className={!app.is_active ? styles.rowInactive : ''}
                        >
                          <td>
                            <div
                              style={{
                                display: 'flex',
                                gap: 10,
                                alignItems: 'center',
                              }}
                            >
                              {app.icon_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={app.icon_url}
                                  alt=""
                                  className={styles.appThumb}
                                />
                              ) : (
                                <div
                                  className={styles.appThumb}
                                  style={{
                                    display: 'grid',
                                    placeItems: 'center',
                                  }}
                                >
                                  <AppWindow size={16} />
                                </div>
                              )}
                              <div>
                                <strong>{app.title}</strong>
                                <div className={styles.muted}>
                                  {PLATFORMS.find((p) => p.id === app.platform)
                                    ?.label || app.platform}
                                  {app.version ? ` · v${app.version}` : ''}
                                  {app.category?.name
                                    ? ` · ${app.category.name}`
                                    : ''}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            {app.is_free ? (
                              <span
                                className={`${styles.statusPill} ${styles.free}`}
                              >
                                رایگان
                              </span>
                            ) : (
                              <span
                                className={`${styles.statusPill} ${styles.paid}`}
                              >
                                {formatPrice(app.price)} ت
                              </span>
                            )}
                          </td>
                          <td>{formatPrice(app.download_count)}</td>
                          <td>{formatPrice(app.purchase_count)}</td>
                          <td>
                            <span
                              className={`${styles.statusPill} ${
                                app.is_active ? styles.on : styles.off
                              }`}
                            >
                              {app.is_active ? 'فعال' : 'غیرفعال'}
                            </span>
                          </td>
                          <td>
                            <div className={styles.rowActions}>
                              <Link
                                href={`/apps/${app.slug}`}
                                className={styles.iconBtn}
                                target="_blank"
                                title="مشاهده"
                              >
                                <ExternalLink size={14} />
                              </Link>
                              <button
                                type="button"
                                className={styles.iconBtn}
                                onClick={() => openEditApp(app)}
                                title="ویرایش"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                                onClick={() => removeApp(app.id)}
                                title="حذف"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : null}

        {tab === 'categories' ? (
          <>
            {showCatForm ? (
              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>
                  {editingCat ? 'ویرایش دسته' : 'دسته جدید'}
                </h2>
                <div className={styles.formGrid}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>نام</label>
                      <input
                        value={catForm.name}
                        onChange={(e) =>
                          setCatForm((f) => ({ ...f, name: e.target.value }))
                        }
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>رنگ</label>
                      <input
                        type="color"
                        value={catForm.color || '#0e7490'}
                        onChange={(e) =>
                          setCatForm((f) => ({ ...f, color: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>ترتیب</label>
                      <input
                        type="number"
                        value={catForm.sort_order}
                        onChange={(e) =>
                          setCatForm((f) => ({
                            ...f,
                            sort_order: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className={styles.switchRow}>
                      <span>فعال</span>
                      <input
                        type="checkbox"
                        checked={catForm.is_active}
                        onChange={(e) =>
                          setCatForm((f) => ({
                            ...f,
                            is_active: e.target.checked,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.primaryBtn}
                      onClick={saveCat}
                      disabled={saving}
                    >
                      <Save size={15} />
                      ذخیره
                    </button>
                    <button
                      type="button"
                      className={styles.ghostBtn}
                      onClick={() => setShowCatForm(false)}
                    >
                      انصراف
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>دسته‌ها</h2>
              {categories.length === 0 ? (
                <div className={styles.empty}>دسته‌ای نیست.</div>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>نام</th>
                        <th>رنگ</th>
                        <th>ترتیب</th>
                        <th>وضعیت</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((c) => (
                        <tr key={c.id}>
                          <td>{c.name}</td>
                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                width: 18,
                                height: 18,
                                borderRadius: 6,
                                background: c.color || '#ccc',
                                verticalAlign: 'middle',
                              }}
                            />
                          </td>
                          <td>{c.sort_order}</td>
                          <td>
                            <span
                              className={`${styles.statusPill} ${
                                c.is_active ? styles.on : styles.off
                              }`}
                            >
                              {c.is_active ? 'فعال' : 'غیرفعال'}
                            </span>
                          </td>
                          <td>
                            <div className={styles.rowActions}>
                              <button
                                type="button"
                                className={styles.iconBtn}
                                onClick={() => openEditCat(c)}
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                                onClick={() => removeCat(c.id)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : null}

        {tab === 'accounting' ? (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>حسابداری و آمار</h2>
            {!accounting ? (
              <div className={styles.empty}>داده‌ای نیست.</div>
            ) : (
              <>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <p className={styles.statVal}>
                      {formatPrice(summary.apps_total)}
                    </p>
                    <p className={styles.statLabel}>کل نرم‌افزارها</p>
                  </div>
                  <div className={styles.statCard}>
                    <p className={styles.statVal}>
                      {formatPrice(summary.downloads_total)}
                    </p>
                    <p className={styles.statLabel}>کل دانلودها</p>
                  </div>
                  <div className={styles.statCard}>
                    <p className={styles.statVal}>
                      {formatPrice(summary.purchases_paid)}
                    </p>
                    <p className={styles.statLabel}>خریدهای موفق</p>
                  </div>
                  <div className={styles.statCard}>
                    <p className={styles.statVal}>
                      {formatPrice(summary.purchases_pending)}
                    </p>
                    <p className={styles.statLabel}>در انتظار پرداخت</p>
                  </div>
                  <div className={styles.statCard}>
                    <p className={styles.statVal}>
                      {formatPrice(summary.revenue_toman)}
                    </p>
                    <p className={styles.statLabel}>درآمد (تومان)</p>
                  </div>
                  <div className={styles.statCard}>
                    <p className={styles.statVal}>
                      {formatPrice(summary.apps_paid)}
                    </p>
                    <p className={styles.statLabel}>آیتم‌های پولی</p>
                  </div>
                </div>

                <h3 className={styles.sectionTitle}>آمار هر نرم‌افزار</h3>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>عنوان</th>
                        <th>نوع</th>
                        <th>دانلود</th>
                        <th>خرید</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(accounting.per_app || []).map((row) => (
                        <tr key={row.id}>
                          <td>{row.title}</td>
                          <td>
                            {row.is_free
                              ? 'رایگان'
                              : `${formatPrice(row.price)} ت`}
                          </td>
                          <td>{formatPrice(row.download_count)}</td>
                          <td>{formatPrice(row.purchase_count)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h3 className={styles.sectionTitle}>آخرین خریدها</h3>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>کاربر</th>
                        <th>نرم‌افزار</th>
                        <th>مبلغ</th>
                        <th>وضعیت</th>
                        <th>زمان</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(accounting.recent_purchases || []).length === 0 ? (
                        <tr>
                          <td colSpan={5} className={styles.empty}>
                            خریدی ثبت نشده
                          </td>
                        </tr>
                      ) : (
                        (accounting.recent_purchases || []).map((p) => (
                          <tr key={p.id}>
                            <td>{p.user_label}</td>
                            <td>{p.app_title}</td>
                            <td>{formatPrice(p.amount)}</td>
                            <td>{p.status}</td>
                            <td className={styles.muted}>
                              {formatDate(p.paid_at || p.created_at)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <h3 className={styles.sectionTitle}>آخرین دانلودها</h3>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>کاربر</th>
                        <th>نرم‌افزار</th>
                        <th>نوع</th>
                        <th>آی‌پی</th>
                        <th>زمان</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(accounting.recent_downloads || []).length === 0 ? (
                        <tr>
                          <td colSpan={5} className={styles.empty}>
                            دانلودی ثبت نشده
                          </td>
                        </tr>
                      ) : (
                        (accounting.recent_downloads || []).map((d) => (
                          <tr key={d.id}>
                            <td>{d.user_label}</td>
                            <td>{d.app_title}</td>
                            <td>
                              {d.is_paid_download ? 'پس از خرید' : 'رایگان'}
                            </td>
                            <td className={styles.muted} dir="ltr">
                              {d.ip_address || '—'}
                            </td>
                            <td className={styles.muted}>
                              {formatDate(d.created_at)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
