'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Package, Pencil, Plus, Save, Search, Trash2, X } from 'lucide-react'
import karmandanService from '../services/karmandanService'
import ConfirmDialog from './ConfirmDialog'
import styles from '../styles/SaleCatalogTab.module.css'

const EMPTY = {
  id: null,
  title: '',
  price_per_sqm: '',
  default_notes: '',
  company: '',
  sort_order: 0,
  is_active: true,
}

const formatMoney = (value) => {
  const n = Number(value || 0)
  if (!Number.isFinite(n)) return '۰'
  return Math.round(n).toLocaleString('fa-IR')
}

export default function SaleCatalogTab({ companies = [] }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [query, setQuery] = useState('')
  const [companyFilter, setCompanyFilter] = useState('')
  const [form, setForm] = useState(EMPTY)
  const [formOpen, setFormOpen] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (companyFilter) params.company = companyFilter
      const res = await karmandanService.getSaleCatalog(params)
      setItems(Array.isArray(res?.data) ? res.data : [])
    } catch (err) {
      setError(err?.message || err?.error || 'بارگذاری کاتالوگ ناموفق بود')
    } finally {
      setLoading(false)
    }
  }, [companyFilter])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((it) =>
      `${it.title || ''} ${it.default_notes || ''} ${it.company_name || ''}`
        .toLowerCase()
        .includes(q)
    )
  }, [items, query])

  const openCreate = () => {
    setForm({ ...EMPTY, company: companyFilter || '' })
    setFormOpen(true)
    setError(null)
    setMessage(null)
  }

  const openEdit = (item) => {
    setForm({
      id: item.id,
      title: item.title || '',
      price_per_sqm: item.price_per_sqm ?? '',
      default_notes: item.default_notes || '',
      company: item.company || '',
      sort_order: item.sort_order ?? 0,
      is_active: item.is_active !== false,
    })
    setFormOpen(true)
    setError(null)
    setMessage(null)
  }

  const handleSave = async () => {
    const title = (form.title || '').trim()
    if (!title) {
      setError('شرح کالا یا خدمات الزامی است')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const payload = {
        title,
        price_per_sqm: Number(String(form.price_per_sqm).replace(/,/g, '')) || 0,
        default_notes: (form.default_notes || '').trim(),
        company: form.company || null,
        sort_order: Number(form.sort_order) || 0,
        is_active: !!form.is_active,
      }
      const res = form.id
        ? await karmandanService.updateSaleCatalogItem(form.id, payload)
        : await karmandanService.createSaleCatalogItem(payload)
      setMessage(res?.message || 'ذخیره شد')
      setFormOpen(false)
      setForm(EMPTY)
      await load()
    } catch (err) {
      setError(err?.title?.[0] || err?.message || err?.error || 'ذخیره ناموفق بود')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await karmandanService.deleteSaleCatalogItem(deleteTarget.id)
      setMessage(res?.message || 'حذف شد')
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err?.message || err?.error || 'حذف ناموفق بود')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className={styles.wrap} dir="rtl">
      <div className={styles.head}>
        <div>
          <h2>
            <Package size={16} />
            کاتالوگ کالا و خدمات
          </h2>
          <p>شرح و قیمت خدمات قابل ارائه را اینجا تعریف کنید تا در پیش‌فاکتور/فاکتور انتخاب شوند</p>
        </div>
        <button type="button" className={styles.primaryBtn} onClick={openCreate}>
          <Plus size={14} />
          مورد جدید
        </button>
      </div>

      {message ? <div className={styles.msg}>{message}</div> : null}
      {error ? <div className={styles.err}>{error}</div> : null}

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <Search size={14} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجوی شرح کالا یا خدمت..."
          />
        </div>
        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className={styles.select}
        >
          <option value="">همه / مشترک</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name_fa}
            </option>
          ))}
        </select>
      </div>

      {formOpen ? (
        <section className={styles.formCard}>
          <div className={styles.formHead}>
            <strong>{form.id ? 'ویرایش مورد' : 'افزودن مورد جدید'}</strong>
            <button type="button" className={styles.iconBtn} onClick={() => setFormOpen(false)}>
              <X size={14} />
            </button>
          </div>
          <div className={styles.formGrid}>
            <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
              <label>شرح کالا یا خدمات</label>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="مثلاً اجرای کفپوش اپوکسی صنعتی"
              />
            </div>
            <div className={styles.field}>
              <label>قیمت هر متر مربع (ریال)</label>
              <input
                value={form.price_per_sqm}
                onChange={(e) => setForm((p) => ({ ...p, price_per_sqm: e.target.value }))}
                placeholder="0"
                inputMode="numeric"
              />
            </div>
            <div className={styles.field}>
              <label>شرکت (اختیاری)</label>
              <select
                value={form.company || ''}
                onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
              >
                <option value="">مشترک برای همه شرکت‌ها</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_fa}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label>ترتیب نمایش</label>
              <input
                value={form.sort_order}
                onChange={(e) => setForm((p) => ({ ...p, sort_order: e.target.value }))}
                inputMode="numeric"
              />
            </div>
            <div className={styles.field}>
              <label>وضعیت</label>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={!!form.is_active}
                  onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                />
                فعال برای انتخاب در اسناد
              </label>
            </div>
            <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
              <label>توضیحات پیش‌فرض</label>
              <input
                value={form.default_notes}
                onChange={(e) => setForm((p) => ({ ...p, default_notes: e.target.value }))}
                placeholder="اختیاری"
              />
            </div>
          </div>
          <div className={styles.formActions}>
            <button type="button" className={styles.ghostBtn} onClick={() => setFormOpen(false)}>
              انصراف
            </button>
            <button type="button" className={styles.primaryBtn} onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={14} /> : <Save size={14} />}
              ذخیره
            </button>
          </div>
        </section>
      ) : null}

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.empty}>
            <Loader2 size={18} />
            در حال بارگذاری...
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <Package size={22} />
            هنوز موردی در کاتالوگ ثبت نشده است
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>شرح کالا یا خدمات</th>
                <th>قیمت هر م² (ریال)</th>
                <th>شرکت</th>
                <th>وضعیت</th>
                <th>توضیحات</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className={!item.is_active ? styles.inactive : undefined}>
                  <td>{idx + 1}</td>
                  <td className={styles.title}>{item.title}</td>
                  <td className={styles.price}>{formatMoney(item.price_per_sqm)}</td>
                  <td>{item.company_name || 'مشترک'}</td>
                  <td>
                    <span className={item.is_active ? styles.badgeOn : styles.badgeOff}>
                      {item.is_active ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                  <td className={styles.notes}>{item.default_notes || '—'}</td>
                  <td>
                    <div className={styles.rowActions}>
                      <button type="button" className={styles.iconBtn} onClick={() => openEdit(item)}>
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => setDeleteTarget(item)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="حذف از کاتالوگ"
        message={deleteTarget ? `«${deleteTarget.title}» حذف شود؟` : ''}
        confirmText="حذف"
        type="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
