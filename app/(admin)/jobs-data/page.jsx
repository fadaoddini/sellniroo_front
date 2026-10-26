// app/(admin)/jobs-data — مدیریت داده‌های پایه و رصد کاریابی
'use client'

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import {
  Briefcase,
  LayoutDashboard,
  MapPin,
  Handshake,
  FolderTree,
  Type,
  SlidersHorizontal,
  Building2,
  ClipboardList,
  Database,
  Plus,
  Pencil,
  Trash2,
  Power,
  RefreshCw,
  CheckCircle2,
  X,
  FileText,
  ScrollText,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import Config from '@/config/config'
import styles from './JobsData.module.css'

const TABS = [
  { id: 'locations', label: 'شهر و موقعیت', icon: MapPin },
  { id: 'cooperation', label: 'نوع همکاری', icon: Handshake },
  { id: 'categories', label: 'دسته‌بندی', icon: FolderTree },
  { id: 'titles', label: 'عناوین شغلی', icon: Type },
  { id: 'filters', label: 'فیلترها', icon: SlidersHorizontal },
  { id: 'companies', label: 'شرکت‌ها', icon: Building2 },
  { id: 'applications', label: 'درخواست‌ها', icon: ClipboardList },
  { id: 'resumes', label: 'رزومه‌ها', icon: ScrollText },
]

const HUB_LINKS = [
  {
    href: '/jobs-manage',
    label: 'آگهی‌ها',
    desc: 'تأیید و ویژه',
    icon: Briefcase,
  },
  {
    href: '/job-single',
    label: 'سینگل آگهی',
    desc: 'چیدمان صفحه',
    icon: FileText,
  },
  {
    href: '/post-job',
    label: 'ثبت آگهی',
    desc: 'فرم عمومی',
    icon: Plus,
  },
]

function unwrapList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.data)) return data.data
  return []
}

function fmtErr(data) {
  if (!data) return 'خطا'
  if (typeof data === 'string') return data
  if (data.detail) {
    return Array.isArray(data.detail) ? data.detail.join('، ') : data.detail
  }
  if (data.message) return data.message
  const parts = []
  Object.entries(data).forEach(([k, v]) => {
    if (k === 'status') return
    parts.push(`${k}: ${Array.isArray(v) ? v.join('، ') : v}`)
  })
  return parts.join(' | ') || 'خطا'
}

function FormDialog({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className={styles.modalHead}>
          <h2>{title}</h2>
          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
            aria-label="بستن"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function FieldInputs({ fields, form, setForm, parentOptions }) {
  return (
    <div className={styles.formRow}>
      {fields.map((f) => (
        <label key={f.key} className={styles.formLabel}>
          {f.label}
          {f.type === 'select' ? (
            <select
              value={form[f.key] ?? ''}
              onChange={(e) =>
                setForm((s) => ({ ...s, [f.key]: e.target.value }))
              }
              required={!!f.required}
            >
              <option value="">—</option>
              {(parentOptions?.[f.key] || f.options || []).map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name || o.title || o.label}
                </option>
              ))}
            </select>
          ) : f.type === 'textarea' ? (
            <textarea
              rows={3}
              value={form[f.key] ?? ''}
              onChange={(e) =>
                setForm((s) => ({ ...s, [f.key]: e.target.value }))
              }
            />
          ) : f.type === 'bool' ? (
            <select
              value={form[f.key] ? '1' : '0'}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  [f.key]: e.target.value === '1',
                }))
              }
            >
              <option value="1">بله</option>
              <option value="0">خیر</option>
            </select>
          ) : (
            <input
              type={f.type === 'number' ? 'number' : 'text'}
              value={form[f.key] ?? ''}
              onChange={(e) =>
                setForm((s) => ({ ...s, [f.key]: e.target.value }))
              }
              required={!!f.required}
              autoFocus={f.required && f === fields[0]}
            />
          )}
        </label>
      ))}
      <label className={styles.formLabel}>
        وضعیت
        <select
          value={form.is_active ? '1' : '0'}
          onChange={(e) =>
            setForm((s) => ({
              ...s,
              is_active: e.target.value === '1',
            }))
          }
        >
          <option value="1">فعال</option>
          <option value="0">غیرفعال</option>
        </select>
      </label>
    </div>
  )
}

function LookupCrud({
  title,
  listUrl,
  detailUrl,
  fields,
  getAuthHeaders,
  parentOptions,
  extraParams = {},
  nameKey = 'name',
}) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({})

  const empty = useMemo(() => {
    const o = { is_active: true, order: 0 }
    fields.forEach((f) => {
      if (f.key === 'is_active') o.is_active = true
      else if (f.key === 'order') o.order = 0
      else if (f.type === 'bool') o[f.key] = !!f.default
      else o[f.key] = f.default ?? ''
    })
    return o
  }, [fields])

  const extraKey = JSON.stringify(extraParams || {})

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { manage: 1, ...(extraParams || {}) }
      const res = await axios.get(listUrl(params), {
        headers: getAuthHeaders(),
      })
      setItems(unwrapList(res.data))
    } catch (e) {
      setError(fmtErr(e.response?.data) || e.message)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- extraKey tracks extraParams
  }, [listUrl, getAuthHeaders, extraKey])

  useEffect(() => {
    load()
  }, [load])

  const closeForm = useCallback(() => {
    setShowForm(false)
    setFormError(null)
    setEditing(null)
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...empty })
    setFormError(null)
    setShowForm(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    const next = { ...empty }
    fields.forEach((f) => {
      next[f.key] = item[f.key] ?? empty[f.key]
    })
    next.is_active = item.is_active !== false
    setForm(next)
    setFormError(null)
    setShowForm(true)
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      const payload = { ...form }
      fields.forEach((f) => {
        if (f.type === 'number' && payload[f.key] !== '' && payload[f.key] != null) {
          payload[f.key] = Number(payload[f.key])
        }
        if (f.type === 'select' && payload[f.key] === '') {
          payload[f.key] = null
        }
      })
      if (editing) {
        await axios.patch(detailUrl(editing.id), payload, {
          headers: getAuthHeaders(),
        })
      } else {
        await axios.post(listUrl(), payload, { headers: getAuthHeaders() })
      }
      closeForm()
      await load()
    } catch (err) {
      setFormError(fmtErr(err.response?.data))
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (item) => {
    try {
      await axios.patch(
        detailUrl(item.id),
        { is_active: !item.is_active },
        { headers: getAuthHeaders() },
      )
      await load()
    } catch (err) {
      setError(fmtErr(err.response?.data))
    }
  }

  const remove = async (item) => {
    if (!window.confirm(`حذف «${item[nameKey] || item.title || item.id}»؟`)) return
    try {
      await axios.delete(detailUrl(item.id), { headers: getAuthHeaders() })
      await load()
    } catch (err) {
      setError(fmtErr(err.response?.data))
    }
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <strong>{title}</strong>
        <button type="button" className={styles.ghostBtn} onClick={load}>
          <RefreshCw size={14} className={loading ? styles.spinner : undefined} />
        </button>
        <button type="button" className={styles.primaryBtn} onClick={openCreate}>
          <Plus size={14} /> جدید
        </button>
      </div>
      {error && <div className={styles.errorBar}>{error}</div>}
      {loading ? (
        <p className={styles.empty}>در حال بارگذاری…</p>
      ) : items.length === 0 ? (
        <p className={styles.empty}>موردی ثبت نشده</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {fields
                  .filter((f) => f.showInTable !== false)
                  .map((f) => (
                    <th key={f.key}>{f.label}</th>
                  ))}
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className={!item.is_active ? styles.rowInactive : undefined}
                >
                  {fields
                    .filter((f) => f.showInTable !== false)
                    .map((f) => (
                      <td key={f.key}>
                        {f.render
                          ? f.render(item)
                          : f.key === 'province'
                            ? item.province_name || item.province
                            : f.key === 'city'
                              ? item.city_name || item.city
                              : f.key === 'category'
                                ? item.category_name || item.category
                                : item[f.key] ?? '—'}
                      </td>
                    ))}
                  <td>
                    <span
                      className={`${styles.statusPill} ${
                        item.is_active ? styles.on : styles.off
                      }`}
                    >
                      {item.is_active ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <X size={12} />
                      )}
                      {item.is_active ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => openEdit(item)}
                        title="ویرایش"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className={`${styles.iconBtn} ${
                          item.is_active ? styles.warn : styles.ok
                        }`}
                        onClick={() => toggle(item)}
                        title="فعال/غیرفعال"
                      >
                        <Power size={14} />
                      </button>
                      <button
                        type="button"
                        className={`${styles.iconBtn} ${styles.danger}`}
                        onClick={() => remove(item)}
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

      {showForm && (
        <FormDialog
          title={editing ? `ویرایش — ${title}` : `افزودن — ${title}`}
          onClose={closeForm}
        >
          <form className={styles.modalBody} onSubmit={save}>
            {formError && <div className={styles.errorBar}>{formError}</div>}
            <FieldInputs
              fields={fields}
              form={form}
              setForm={setForm}
              parentOptions={parentOptions}
            />
            <div className={styles.modalActions}>
              <button
                type="submit"
                className={styles.primaryBtn}
                disabled={saving}
              >
                {saving ? 'در حال ذخیره…' : 'ذخیره'}
              </button>
              <button
                type="button"
                className={styles.ghostBtn}
                onClick={closeForm}
              >
                انصراف
              </button>
            </div>
          </form>
        </FormDialog>
      )}
    </div>
  )
}

function LocationsPanel({ getAuthHeaders }) {
  const [layer, setLayer] = useState('provinces')
  const [provinceId, setProvinceId] = useState('')
  const [cityId, setCityId] = useState('')
  const [provinces, setProvinces] = useState([])
  const [cities, setCities] = useState([])

  useEffect(() => {
    axios
      .get(Config.endpoints.jobisell.provinces({ manage: 1 }), {
        headers: getAuthHeaders(),
      })
      .then((r) => setProvinces(unwrapList(r.data)))
      .catch(() => setProvinces([]))
  }, [getAuthHeaders])

  useEffect(() => {
    if (!provinceId) {
      setCities([])
      return
    }
    axios
      .get(
        Config.endpoints.jobisell.cities({ manage: 1, province: provinceId }),
        { headers: getAuthHeaders() },
      )
      .then((r) => setCities(unwrapList(r.data)))
      .catch(() => setCities([]))
  }, [provinceId, getAuthHeaders])

  return (
    <div>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={`${styles.ghostBtn} ${
            layer === 'provinces' ? styles.tabActive : ''
          }`}
          onClick={() => setLayer('provinces')}
        >
          استان‌ها
        </button>
        <button
          type="button"
          className={`${styles.ghostBtn} ${
            layer === 'cities' ? styles.tabActive : ''
          }`}
          onClick={() => setLayer('cities')}
        >
          شهرها
        </button>
        <button
          type="button"
          className={`${styles.ghostBtn} ${
            layer === 'neighborhoods' ? styles.tabActive : ''
          }`}
          onClick={() => setLayer('neighborhoods')}
        >
          محله‌ها
        </button>
        {layer !== 'provinces' && (
          <select
            value={provinceId}
            onChange={(e) => {
              setProvinceId(e.target.value)
              setCityId('')
            }}
          >
            <option value="">استان…</option>
            {provinces.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
        {layer === 'neighborhoods' && (
          <select
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            disabled={!provinceId}
          >
            <option value="">شهر…</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {layer === 'provinces' && (
        <LookupCrud
          title="استان‌ها"
          listUrl={Config.endpoints.jobisell.provinces}
          detailUrl={Config.endpoints.jobisell.provinceDetail}
          getAuthHeaders={getAuthHeaders}
          fields={[
            { key: 'name', label: 'نام', required: true },
            { key: 'order', label: 'ترتیب', type: 'number' },
          ]}
        />
      )}
      {layer === 'cities' && (
        <LookupCrud
          title="شهرها"
          listUrl={Config.endpoints.jobisell.cities}
          detailUrl={Config.endpoints.jobisell.cityDetail}
          getAuthHeaders={getAuthHeaders}
          extraParams={provinceId ? { province: provinceId } : {}}
          parentOptions={{ province: provinces }}
          fields={[
            { key: 'name', label: 'نام', required: true },
            {
              key: 'province',
              label: 'استان',
              type: 'select',
              required: true,
            },
            { key: 'order', label: 'ترتیب', type: 'number' },
          ]}
        />
      )}
      {layer === 'neighborhoods' && (
        <LookupCrud
          title="محله‌ها"
          listUrl={Config.endpoints.jobisell.neighborhoods}
          detailUrl={Config.endpoints.jobisell.neighborhoodDetail}
          getAuthHeaders={getAuthHeaders}
          extraParams={cityId ? { city: cityId } : {}}
          parentOptions={{ city: cities }}
          fields={[
            { key: 'name', label: 'نام', required: true },
            { key: 'city', label: 'شهر', type: 'select', required: true },
            { key: 'order', label: 'ترتیب', type: 'number' },
          ]}
        />
      )}
    </div>
  )
}

function CategoriesPanel({ getAuthHeaders }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    name: '',
    parent: '',
    icon: '',
    order: 0,
    is_active: true,
  })
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)

  const flatParents = useMemo(() => {
    const out = []
    items.forEach((p) => {
      out.push({ id: p.id, name: p.name })
      ;(p.children || []).forEach((c) => {
        out.push({ id: c.id, name: `↳ ${c.name}` })
      })
    })
    return out
  }, [items])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(
        Config.endpoints.jobisell.categories({ manage: 1 }),
        { headers: getAuthHeaders() },
      )
      setItems(unwrapList(res.data))
    } catch (e) {
      setError(fmtErr(e.response?.data) || e.message)
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders])

  useEffect(() => {
    load()
  }, [load])

  const rows = useMemo(() => {
    const out = []
    items.forEach((p) => {
      out.push({ ...p, _depth: 0 })
      ;(p.children || []).forEach((c) => out.push({ ...c, _depth: 1 }))
    })
    return out
  }, [items])

  const closeForm = useCallback(() => {
    setShowForm(false)
    setFormError(null)
    setEditing(null)
  }, [])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      const payload = {
        name: form.name.trim(),
        icon: form.icon || '',
        order: Number(form.order) || 0,
        is_active: !!form.is_active,
        parent: form.parent || null,
      }
      if (editing) {
        await axios.patch(
          Config.endpoints.jobisell.categoryDetail(editing.id),
          payload,
          { headers: getAuthHeaders() },
        )
      } else {
        await axios.post(Config.endpoints.jobisell.categories(), payload, {
          headers: getAuthHeaders(),
        })
      }
      closeForm()
      await load()
    } catch (err) {
      setFormError(fmtErr(err.response?.data))
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (item) => {
    try {
      await axios.patch(
        Config.endpoints.jobisell.categoryDetail(item.id),
        { is_active: !item.is_active },
        { headers: getAuthHeaders() },
      )
      await load()
    } catch (err) {
      setError(fmtErr(err.response?.data))
    }
  }

  const remove = async (item) => {
    if (!window.confirm(`حذف دسته «${item.name}»؟`)) return
    try {
      await axios.delete(Config.endpoints.jobisell.categoryDetail(item.id), {
        headers: getAuthHeaders(),
      })
      await load()
    } catch (err) {
      setError(fmtErr(err.response?.data))
    }
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <strong>دسته‌بندی شغلی (و زیرمجموعه)</strong>
        <button type="button" className={styles.ghostBtn} onClick={load}>
          <RefreshCw size={14} />
        </button>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={() => {
            setEditing(null)
            setForm({
              name: '',
              parent: '',
              icon: '',
              order: 0,
              is_active: true,
            })
            setFormError(null)
            setShowForm(true)
          }}
        >
          <Plus size={14} /> دسته جدید
        </button>
      </div>
      <p className={styles.hint}>
        برای زیرمجموعه، هنگام افزودن یک والد انتخاب کنید.
      </p>
      {error && <div className={styles.errorBar}>{error}</div>}
      {loading ? (
        <p className={styles.empty}>در حال بارگذاری…</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>نام</th>
                <th>ترتیب</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr
                  key={item.id}
                  className={`${!item.is_active ? styles.rowInactive : ''} ${
                    item._depth ? styles.childRow : ''
                  }`}
                >
                  <td>
                    {item._depth ? '↳ ' : ''}
                    <strong>{item.name}</strong>
                  </td>
                  <td>{item.order}</td>
                  <td>
                    <span
                      className={`${styles.statusPill} ${
                        item.is_active ? styles.on : styles.off
                      }`}
                    >
                      {item.is_active ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => {
                          setEditing(item)
                          setForm({
                            name: item.name,
                            parent: item.parent || '',
                            icon: item.icon || '',
                            order: item.order ?? 0,
                            is_active: item.is_active !== false,
                          })
                          setFormError(null)
                          setShowForm(true)
                        }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => toggle(item)}
                      >
                        <Power size={14} />
                      </button>
                      <button
                        type="button"
                        className={`${styles.iconBtn} ${styles.danger}`}
                        onClick={() => remove(item)}
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
      {showForm && (
        <FormDialog
          title={editing ? 'ویرایش دسته' : 'افزودن دسته جدید'}
          onClose={closeForm}
        >
          <form className={styles.modalBody} onSubmit={save}>
            {formError && <div className={styles.errorBar}>{formError}</div>}
            <div className={styles.formRow}>
              <label className={styles.formLabel}>
                نام
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, name: e.target.value }))
                  }
                  required
                  autoFocus
                />
              </label>
              <label className={styles.formLabel}>
                والد (زیرمجموعه)
                <select
                  value={form.parent}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, parent: e.target.value }))
                  }
                >
                  <option value="">بدون والد (ریشه)</option>
                  {flatParents
                    .filter((p) => !editing || p.id !== editing.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </label>
              <label className={styles.formLabel}>
                ترتیب
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, order: e.target.value }))
                  }
                />
              </label>
              <label className={styles.formLabel}>
                وضعیت
                <select
                  value={form.is_active ? '1' : '0'}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      is_active: e.target.value === '1',
                    }))
                  }
                >
                  <option value="1">فعال</option>
                  <option value="0">غیرفعال</option>
                </select>
              </label>
            </div>
            <div className={styles.modalActions}>
              <button
                type="submit"
                className={styles.primaryBtn}
                disabled={saving}
              >
                {saving ? 'در حال ذخیره…' : 'ذخیره'}
              </button>
              <button
                type="button"
                className={styles.ghostBtn}
                onClick={closeForm}
              >
                انصراف
              </button>
            </div>
          </form>
        </FormDialog>
      )}
    </div>
  )
}

function FiltersPanel({ getAuthHeaders }) {
  const [sub, setSub] = useState('education')

  const subs = [
    { id: 'education', label: 'تحصیلات' },
    { id: 'experience', label: 'سابقه' },
    { id: 'gender', label: 'جنسیت' },
    { id: 'salary', label: 'حقوق' },
    { id: 'features', label: 'ویژگی‌ها' },
    { id: 'tags', label: 'تگ‌ها' },
  ]

  return (
    <div>
      <div className={styles.toolbar}>
        {subs.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`${styles.ghostBtn} ${
              sub === s.id ? styles.tabActive : ''
            }`}
            onClick={() => setSub(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>
      {sub === 'education' && (
        <LookupCrud
          title="مقاطع تحصیلی"
          listUrl={Config.endpoints.jobisell.educationLevels}
          detailUrl={Config.endpoints.jobisell.educationLevelDetail}
          getAuthHeaders={getAuthHeaders}
          fields={[
            { key: 'name', label: 'نام', required: true },
            { key: 'order', label: 'ترتیب', type: 'number' },
          ]}
        />
      )}
      {sub === 'experience' && (
        <LookupCrud
          title="سطوح سابقه"
          listUrl={Config.endpoints.jobisell.experienceLevels}
          detailUrl={Config.endpoints.jobisell.experienceLevelDetail}
          getAuthHeaders={getAuthHeaders}
          fields={[
            { key: 'name', label: 'نام', required: true },
            { key: 'min_years', label: 'حداقل سال', type: 'number' },
            { key: 'max_years', label: 'حداکثر سال', type: 'number' },
            { key: 'order', label: 'ترتیب', type: 'number' },
          ]}
        />
      )}
      {sub === 'gender' && (
        <LookupCrud
          title="جنسیت"
          listUrl={Config.endpoints.jobisell.genders}
          detailUrl={Config.endpoints.jobisell.genderDetail}
          getAuthHeaders={getAuthHeaders}
          fields={[
            { key: 'name', label: 'نام', required: true },
            { key: 'order', label: 'ترتیب', type: 'number' },
          ]}
        />
      )}
      {sub === 'salary' && (
        <LookupCrud
          title="بازه‌های حقوق"
          listUrl={Config.endpoints.jobisell.salaryRanges}
          detailUrl={Config.endpoints.jobisell.salaryRangeDetail}
          getAuthHeaders={getAuthHeaders}
          nameKey="title"
          fields={[
            { key: 'title', label: 'عنوان', required: true },
            { key: 'min_amount', label: 'حداقل', type: 'number' },
            { key: 'max_amount', label: 'حداکثر', type: 'number' },
            { key: 'order', label: 'ترتیب', type: 'number' },
          ]}
        />
      )}
      {sub === 'features' && (
        <LookupCrud
          title="ویژگی‌های شغلی"
          listUrl={Config.endpoints.jobisell.features}
          detailUrl={Config.endpoints.jobisell.featureDetail}
          getAuthHeaders={getAuthHeaders}
          fields={[
            { key: 'name', label: 'نام', required: true },
            {
              key: 'feature_type',
              label: 'نوع',
              type: 'select',
              options: [
                { id: 'boolean', name: 'بله/خیر' },
                { id: 'text', name: 'متنی' },
                { id: 'number', name: 'عددی' },
              ],
            },
            { key: 'show_in_filter', label: 'در فیلتر', type: 'bool' },
            { key: 'order', label: 'ترتیب', type: 'number' },
          ]}
        />
      )}
      {sub === 'tags' && (
        <LookupCrud
          title="تگ‌ها"
          listUrl={Config.endpoints.jobisell.tags}
          detailUrl={Config.endpoints.jobisell.tagDetail}
          getAuthHeaders={getAuthHeaders}
          fields={[
            { key: 'name', label: 'نام', required: true },
            { key: 'color', label: 'رنگ' },
          ]}
        />
      )}
    </div>
  )
}

function CompaniesPanel({ getAuthHeaders }) {
  const [items, setItems] = useState([])
  const [requests, setRequests] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const headers = getAuthHeaders()
    const errors = []

    try {
      const cRes = await axios.get(
        Config.endpoints.jobisell.companies({ manage: 1 }),
        { headers },
      )
      setItems(unwrapList(cRes.data))
    } catch (e) {
      setItems([])
      errors.push(
        `شرکت‌ها: ${fmtErr(e.response?.data) || e.message}`,
      )
    }

    try {
      const vRes = await axios.get(
        Config.endpoints.jobisell.verificationRequests.list({
          status: 'pending',
        }),
        { headers },
      )
      setRequests(unwrapList(vRes.data))
    } catch (e) {
      setRequests([])
      errors.push(
        `درخواست تأیید: ${fmtErr(e.response?.data) || e.message}`,
      )
    }

    if (errors.length) setError(errors.join(' | '))
    setLoading(false)
  }, [getAuthHeaders])

  useEffect(() => {
    load()
  }, [load])

  const act = async (id, action) => {
    try {
      const url =
        action === 'approve'
          ? Config.endpoints.jobisell.verificationRequests.approve(id)
          : Config.endpoints.jobisell.verificationRequests.reject(id)
      const adminNote =
        (notes[id] || '').trim() ||
        (action === 'reject' ? 'رد شد' : '')
      await axios.post(
        url,
        { admin_note: adminNote },
        { headers: getAuthHeaders() },
      )
      setNotes((s) => {
        const next = { ...s }
        delete next[id]
        return next
      })
      await load()
    } catch (e) {
      setError(fmtErr(e.response?.data) || e.message)
    }
  }

  const pending = requests.filter((r) => r.status === 'pending')

  return (
    <div>
      <div className={styles.toolbar}>
        <strong>شرکت‌ها و درخواست تأیید</strong>
        <button type="button" className={styles.ghostBtn} onClick={load}>
          <RefreshCw size={14} className={loading ? styles.spinner : undefined} />
        </button>
      </div>
      {error && <div className={styles.errorBar}>{error}</div>}
      {loading ? (
        <p className={styles.empty}>در حال بارگذاری…</p>
      ) : (
        <>
          <h3 style={{ fontSize: 14, margin: '0 0 8px' }}>
            درخواست‌های در انتظار ({pending.length})
          </h3>
          {pending.length === 0 ? (
            <p className={styles.hint}>درخواست معلقی نیست</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>شرکت</th>
                    <th>درخواست‌دهنده</th>
                    <th>یادداشت / عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((r) => (
                    <tr key={r.id}>
                      <td>{r.company_name || r.company}</td>
                      <td>{r.requested_by_name || '—'}</td>
                      <td>
                        <div className={styles.toolbar}>
                          <input
                            placeholder="یادداشت ادمین"
                            value={notes[r.id] || ''}
                            onChange={(e) =>
                              setNotes((s) => ({
                                ...s,
                                [r.id]: e.target.value,
                              }))
                            }
                          />
                          <button
                            type="button"
                            className={styles.primaryBtn}
                            onClick={() => act(r.id, 'approve')}
                          >
                            تأیید
                          </button>
                          <button
                            type="button"
                            className={styles.ghostBtn}
                            onClick={() => act(r.id, 'reject')}
                          >
                            رد
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <h3 style={{ fontSize: 14, margin: '16px 0 8px' }}>
            همه شرکت‌ها ({items.length})
          </h3>
          {items.length === 0 ? (
            <p className={styles.empty}>شرکتی ثبت نشده</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>نام</th>
                    <th>مالک</th>
                    <th>شهر</th>
                    <th>وضعیت تأیید</th>
                    <th>فعال</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <tr
                      key={c.id}
                      className={!c.is_active ? styles.rowInactive : undefined}
                    >
                      <td>
                        <strong>{c.name}</strong>
                      </td>
                      <td>{c.owner_name || '—'}</td>
                      <td>
                        {c.city_name
                          ? `${c.city_name}${
                              c.province_name ? ` / ${c.province_name}` : ''
                            }`
                          : '—'}
                      </td>
                      <td>
                        {c.verification_status_display ||
                          (c.is_verified ? 'تأیید شده' : 'تأیید نشده')}
                      </td>
                      <td>{c.is_active ? 'فعال' : 'غیرفعال'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ApplicationsPanel({ getAuthHeaders }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(
        Config.endpoints.jobisell.applications.list({}),
        { headers: getAuthHeaders() },
      )
      setItems(unwrapList(res.data))
    } catch (e) {
      setError(fmtErr(e.response?.data) || e.message)
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders])

  useEffect(() => {
    load()
  }, [load])

  const setStatus = async (id, status) => {
    try {
      await axios.post(
        Config.endpoints.jobisell.applications.changeStatus(id),
        { status },
        { headers: getAuthHeaders() },
      )
      await load()
    } catch (e) {
      setError(fmtErr(e.response?.data) || e.message)
    }
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <strong>درخواست‌های شغلی</strong>
        <button type="button" className={styles.ghostBtn} onClick={load}>
          <RefreshCw size={14} />
        </button>
      </div>
      {error && <div className={styles.errorBar}>{error}</div>}
      {loading ? (
        <p className={styles.empty}>در حال بارگذاری…</p>
      ) : items.length === 0 ? (
        <p className={styles.empty}>درخواستی نیست</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>آگهی</th>
                <th>متقاضی</th>
                <th>وضعیت</th>
                <th>تغییر</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id}>
                  <td>{a.job_title || a.job_listing}</td>
                  <td>{a.applicant_name || a.applicant}</td>
                  <td>{a.status}</td>
                  <td>
                    <select
                      value={a.status}
                      onChange={(e) => setStatus(a.id, e.target.value)}
                    >
                      {[
                        ['pending', 'در انتظار'],
                        ['reviewed', 'بررسی‌شده'],
                        ['accepted', 'پذیرفته'],
                        ['rejected', 'رد شده'],
                      ].map(([s, label]) => (
                        <option key={s} value={s}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function ResumesPanel({ getAuthHeaders }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [qInput, setQInput] = useState('')
  const [q, setQ] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (statusFilter) params.status = statusFilter
      if (q.trim()) params.search = q.trim()
      const res = await axios.get(
        Config.endpoints.jobisell.resumesManage.list(params),
        { headers: getAuthHeaders() },
      )
      setItems(unwrapList(res.data))
    } catch (e) {
      setError(fmtErr(e.response?.data) || e.message)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders, statusFilter, q])

  useEffect(() => {
    load()
  }, [load])

  const setStatus = async (id, status) => {
    setBusyId(id)
    try {
      await axios.post(
        Config.endpoints.jobisell.resumesManage.setStatus(id),
        { status },
        { headers: getAuthHeaders() },
      )
      await load()
    } catch (e) {
      setError(fmtErr(e.response?.data) || e.message)
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (item) => {
    if (!window.confirm(`حذف رزومه «${item.full_name || item.title || item.id}»؟`)) {
      return
    }
    setBusyId(item.id)
    try {
      await axios.delete(
        Config.endpoints.jobisell.resumesManage.detail(item.id),
        { headers: getAuthHeaders() },
      )
      await load()
    } catch (e) {
      setError(fmtErr(e.response?.data) || e.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <strong>رزومه‌ها</strong>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">همه وضعیت‌ها</option>
          <option value="published">منتشر شده</option>
          <option value="draft">پیش‌نویس</option>
        </select>
        <input
          placeholder="جستجو نام، عنوان، موبایل…"
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setQ(qInput)
          }}
          style={{ minWidth: 180 }}
        />
        <button
          type="button"
          className={styles.ghostBtn}
          onClick={() => setQ(qInput)}
        >
          جستجو
        </button>
        <button type="button" className={styles.ghostBtn} onClick={load}>
          <RefreshCw size={14} className={loading ? styles.spinner : undefined} />
        </button>
      </div>
      <p className={styles.hint}>
        مدیر همه رزومه‌ها (منتشر و پیش‌نویس) را می‌بیند و می‌تواند وضعیت را
        تغییر دهد.
      </p>
      {error && <div className={styles.errorBar}>{error}</div>}
      {loading ? (
        <p className={styles.empty}>در حال بارگذاری…</p>
      ) : items.length === 0 ? (
        <p className={styles.empty}>رزومه‌ای نیست</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>نام</th>
                <th>عنوان شغلی</th>
                <th>کاربر</th>
                <th>وضعیت</th>
                <th>بازدید</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr
                  key={r.id}
                  className={
                    r.status !== 'published' ? styles.rowInactive : undefined
                  }
                >
                  <td>
                    <strong>{r.full_name || '—'}</strong>
                    {r.mobile ? (
                      <div className={styles.hint} style={{ margin: 0 }}>
                        {r.mobile}
                      </div>
                    ) : null}
                  </td>
                  <td>{r.job_title || '—'}</td>
                  <td>{r.owner_name || r.owner_mobile || '—'}</td>
                  <td>
                    <span
                      className={`${styles.statusPill} ${
                        r.status === 'published' ? styles.on : styles.off
                      }`}
                    >
                      {r.status_display || r.status}
                    </span>
                  </td>
                  <td>{r.views_count ?? 0}</td>
                  <td>
                    <div className={styles.rowActions}>
                      {r.status === 'published' && r.slug ? (
                        <a
                          className={styles.iconBtn}
                          href={`/resume/${r.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          title="مشاهده عمومی"
                        >
                          <ExternalLink size={14} />
                        </a>
                      ) : null}
                      {r.status === 'published' ? (
                        <button
                          type="button"
                          className={`${styles.iconBtn} ${styles.warn}`}
                          disabled={busyId === r.id}
                          title="برگرداندن به پیش‌نویس"
                          onClick={() => setStatus(r.id, 'draft')}
                        >
                          <Power size={14} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={`${styles.iconBtn} ${styles.ok}`}
                          disabled={busyId === r.id}
                          title="انتشار"
                          onClick={() => setStatus(r.id, 'published')}
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        className={`${styles.iconBtn} ${styles.danger}`}
                        disabled={busyId === r.id}
                        title="حذف"
                        onClick={() => remove(r)}
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
  )
}

function JobsDataInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, loading, user, canManageEmployees, getAuthHeaders } =
    useAuth()
  const { dir } = useLanguage()
  const canManage =
    user?.is_superuser || user?.is_staff || canManageEmployees

  const initialTab = searchParams?.get('tab') || 'locations'
  const [tab, setTab] = useState(
    TABS.some((t) => t.id === initialTab) ? initialTab : 'locations',
  )

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/login')
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    const t = searchParams?.get('tab')
    if (t === 'import') {
      router.replace('/jobs-data?tab=locations', { scroll: false })
      setTab('locations')
      return
    }
    if (t && TABS.some((x) => x.id === t)) setTab(t)
  }, [searchParams, router])

  const setTabNav = (id) => {
    setTab(id)
    router.replace(`/jobs-data?tab=${id}`, { scroll: false })
  }

  if (loading || !isAuthenticated) {
    return (
      <div className={styles.page} dir={dir}>
        <p className={styles.empty}>در حال بارگذاری…</p>
      </div>
    )
  }

  if (!canManage) {
    return (
      <div className={styles.page} dir={dir}>
        <div className={styles.denied}>
          <ShieldLike />
          <p>فقط مدیر و staff می‌توانند داده‌های کاریابی را مدیریت کنند.</p>
          <Link href="/dashboard" className={styles.headerGhost}>
            بازگشت
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page} dir={dir}>
      <div className={styles.wrap}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>
              <Database size={24} />
            </span>
            <div>
              <h1 className={styles.pageTitle}>مدیریت کاریابی</h1>
              <p className={styles.pageDesc}>
                شهرها، انواع همکاری، دسته، فیلترها، شرکت‌ها و درخواست‌ها
              </p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link href="/dashboard" className={styles.headerGhost}>
              <LayoutDashboard size={15} /> داشبورد
            </Link>
            <Link href="/jobs-manage" className={styles.headerGhost}>
              <Briefcase size={15} /> آگهی‌ها
            </Link>
          </div>
        </div>

        <div className={styles.hubGrid}>
          {HUB_LINKS.map((h) => {
            const Icon = h.icon
            return (
              <Link key={h.href} href={h.href} className={styles.hubCard}>
                <span className={styles.hubCardIcon}>
                  <Icon size={16} />
                </span>
                <strong>{h.label}</strong>
                <span>{h.desc}</span>
              </Link>
            )
          })}
        </div>

        <div className={styles.tabs}>
          {TABS.map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                type="button"
                className={`${styles.tab} ${
                  tab === t.id ? styles.tabActive : ''
                }`}
                onClick={() => setTabNav(t.id)}
              >
                <Icon size={14} />
                {t.label}
              </button>
            )
          })}
        </div>

        <div className={styles.panel}>
          {tab === 'locations' && (
            <LocationsPanel getAuthHeaders={getAuthHeaders} />
          )}
          {tab === 'cooperation' && (
            <LookupCrud
              title="انواع همکاری / نوع درخواست شغلی"
              listUrl={Config.endpoints.jobisell.cooperationTypes}
              detailUrl={Config.endpoints.jobisell.cooperationTypeDetail}
              getAuthHeaders={getAuthHeaders}
              fields={[
                { key: 'name', label: 'نام', required: true },
                { key: 'description', label: 'توضیح', type: 'textarea' },
                { key: 'icon', label: 'آیکون' },
                { key: 'order', label: 'ترتیب', type: 'number' },
              ]}
            />
          )}
          {tab === 'categories' && (
            <CategoriesPanel getAuthHeaders={getAuthHeaders} />
          )}
          {tab === 'titles' && (
            <TitlesPanel getAuthHeaders={getAuthHeaders} />
          )}
          {tab === 'filters' && (
            <FiltersPanel getAuthHeaders={getAuthHeaders} />
          )}
          {tab === 'companies' && (
            <CompaniesPanel getAuthHeaders={getAuthHeaders} />
          )}
          {tab === 'applications' && (
            <ApplicationsPanel getAuthHeaders={getAuthHeaders} />
          )}
          {tab === 'resumes' && (
            <ResumesPanel getAuthHeaders={getAuthHeaders} />
          )}
        </div>
      </div>
    </div>
  )
}

export default function JobsDataPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.page}>
          <p className={styles.empty}>در حال بارگذاری…</p>
        </div>
      }
    >
      <JobsDataInner />
    </Suspense>
  )
}

function TitlesPanel({ getAuthHeaders }) {
  const [categories, setCategories] = useState([])
  useEffect(() => {
    axios
      .get(Config.endpoints.jobisell.categories({ manage: 1 }), {
        headers: getAuthHeaders(),
      })
      .then((r) => {
        const roots = unwrapList(r.data)
        const flat = []
        roots.forEach((p) => {
          flat.push({ id: p.id, name: p.name })
          ;(p.children || []).forEach((c) =>
            flat.push({ id: c.id, name: `${p.name} / ${c.name}` }),
          )
        })
        setCategories(flat)
      })
      .catch(() => setCategories([]))
  }, [getAuthHeaders])

  return (
    <LookupCrud
      title="عناوین شغلی"
      listUrl={Config.endpoints.jobisell.jobTitles}
      detailUrl={Config.endpoints.jobisell.jobTitleDetail}
      getAuthHeaders={getAuthHeaders}
      parentOptions={{ category: categories }}
      fields={[
        { key: 'name', label: 'عنوان', required: true },
        { key: 'category', label: 'دسته', type: 'select' },
        { key: 'order', label: 'ترتیب', type: 'number' },
      ]}
    />
  )
}

function ShieldLike() {
  return (
    <div
      style={{
        width: 48,
        height: 48,
        margin: '0 auto 12px',
        borderRadius: 14,
        background: '#fff3c4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#c27800',
      }}
    >
      <Briefcase size={22} />
    </div>
  )
}
