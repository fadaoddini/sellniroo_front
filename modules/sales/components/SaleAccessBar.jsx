'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  Building2,
  FileText,
  MessageSquare,
  Pencil,
  Plus,
  Route,
  Search,
  Shield,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react'
import karmandanService from '../services/karmandanService'
import ConfirmDialog from './ConfirmDialog'
import styles from '../styles/SaleAccessBar.module.css'

const EMPTY_COMPANY = {
  name_fa: '',
  name_en: '',
  phone: '',
  website: '',
  address: '',
  registration_number: '',
  logoFile: null,
  logoPreview: null,
}

export default function SaleAccessBar({ enabled = false, stats = null }) {
  const router = useRouter()
  const [panel, setPanel] = useState(null) // companies | access | sms | null
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const [employees, setEmployees] = useState([])
  const [accessLoading, setAccessLoading] = useState(false)
  const [accessQuery, setAccessQuery] = useState('')
  const [busyEmpId, setBusyEmpId] = useState(null)

  const [companies, setCompanies] = useState([])
  const [companiesLoading, setCompaniesLoading] = useState(false)
  const [companyQuery, setCompanyQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_COMPANY)
  const [saving, setSaving] = useState(false)
  const logoInputRef = useRef(null)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [smsLoading, setSmsLoading] = useState(false)
  const [smsSaving, setSmsSaving] = useState(false)
  const [smsForm, setSmsForm] = useState({
    hours_before: 24,
    is_active: true,
    send_to_manager: true,
    manager_mobile: '',
  })

  const loadAccess = useCallback(async () => {
    setAccessLoading(true)
    setError(null)
    try {
      const res = await karmandanService.getSaleAccessList()
      setEmployees(Array.isArray(res?.data) ? res.data : [])
    } catch (err) {
      setError(err?.message || err?.error || 'خطا در بارگذاری دسترسی‌ها')
    } finally {
      setAccessLoading(false)
    }
  }, [])

  const loadCompanies = useCallback(async () => {
    setCompaniesLoading(true)
    setError(null)
    try {
      const res = await karmandanService.getSaleCompanies()
      setCompanies(Array.isArray(res?.data) ? res.data : [])
    } catch (err) {
      setError(err?.message || err?.error || 'خطا در بارگذاری شرکت‌ها')
    } finally {
      setCompaniesLoading(false)
    }
  }, [])

  const loadSmsConfig = useCallback(async () => {
    setSmsLoading(true)
    setError(null)
    try {
      const res = await karmandanService.getFollowupSmsConfig()
      const data = res?.data || {}
      setSmsForm({
        hours_before: data.hours_before ?? 24,
        is_active: data.is_active !== false,
        send_to_manager: data.send_to_manager !== false,
        manager_mobile: data.manager_mobile || '',
      })
    } catch (err) {
      setError(err?.message || err?.error || 'خطا در بارگذاری تنظیمات پیامک')
    } finally {
      setSmsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    loadCompanies()
    loadAccess()
  }, [enabled, loadCompanies, loadAccess])

  useEffect(() => {
    if (!enabled || !panel) return
    if (panel === 'access') loadAccess()
    if (panel === 'companies') loadCompanies()
    if (panel === 'sms') loadSmsConfig()
  }, [enabled, panel, loadAccess, loadCompanies, loadSmsConfig])

  const filteredEmployees = useMemo(() => {
    const q = accessQuery.trim().toLowerCase()
    if (!q) return employees
    return employees.filter((e) =>
      `${e.full_name || ''} ${e.employee_code || ''} ${e.mobile || ''}`
        .toLowerCase()
        .includes(q)
    )
  }, [employees, accessQuery])

  const filteredCompanies = useMemo(() => {
    const q = companyQuery.trim().toLowerCase()
    if (!q) return companies
    return companies.filter((c) =>
      `${c.name_fa || ''} ${c.name_en || ''} ${c.phone || ''} ${c.registration_number || ''}`
        .toLowerCase()
        .includes(q)
    )
  }, [companies, companyQuery])

  const activeAccessCount = employees.filter((e) => e.has_sale_access).length
  const totalLeads = stats?.total ?? 0
  const todayFollow = stats?.in_progress ?? 0

  const toggleAccess = async (emp) => {
    if (busyEmpId) return
    setBusyEmpId(emp.id)
    setError(null)
    const next = !emp.has_sale_access
    try {
      const res = await karmandanService.setSaleAccess(emp.id, next)
      const updated = res?.data
      setEmployees((prev) =>
        prev.map((row) =>
          row.id === emp.id
            ? {
                ...row,
                has_sale_access: updated?.has_sale_access ?? next,
                is_marketing: updated?.is_marketing ?? next,
                is_sales: updated?.is_sales ?? next,
              }
            : row
        )
      )
      setMessage(res?.message || 'دسترسی بروزرسانی شد')
    } catch (err) {
      setError(err?.message || err?.error || 'تغییر دسترسی ناموفق بود')
    } finally {
      setBusyEmpId(null)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_COMPANY)
    setFormOpen(true)
    setError(null)
  }

  const openEdit = (company) => {
    setEditing(company)
    setForm({
      name_fa: company.name_fa || '',
      name_en: company.name_en || '',
      phone: company.phone || '',
      website: company.website || '',
      address: company.address || '',
      registration_number: company.registration_number || '',
      logoFile: null,
      logoPreview: company.logo_url || null,
    })
    setFormOpen(true)
    setError(null)
  }

  const onLogoPick = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setForm((prev) => ({
      ...prev,
      logoFile: file,
      logoPreview: URL.createObjectURL(file),
    }))
  }

  const buildFormData = () => {
    const fd = new FormData()
    fd.append('name_fa', form.name_fa.trim())
    fd.append('name_en', form.name_en.trim())
    fd.append('phone', form.phone.trim())
    fd.append('website', form.website.trim())
    fd.append('address', form.address.trim())
    fd.append('registration_number', form.registration_number.trim())
    if (form.logoFile) fd.append('logo', form.logoFile)
    return fd
  }

  const saveCompany = async (e) => {
    e.preventDefault()
    if (!form.name_fa.trim()) {
      setError('نام فارسی شرکت الزامی است')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const fd = buildFormData()
      const res = editing
        ? await karmandanService.updateSaleCompany(editing.id, fd)
        : await karmandanService.createSaleCompany(fd)
      setMessage(res?.message || 'ذخیره شد')
      setFormOpen(false)
      setEditing(null)
      setForm(EMPTY_COMPANY)
      await loadCompanies()
    } catch (err) {
      setError(err?.name_fa?.[0] || err?.message || err?.error || 'ذخیره شرکت ناموفق بود')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await karmandanService.deleteSaleCompany(deleteTarget.id)
      setMessage(res?.message || 'شرکت حذف شد')
      setDeleteTarget(null)
      await loadCompanies()
    } catch (err) {
      setError(err?.message || err?.error || 'حذف ناموفق بود')
    } finally {
      setDeleting(false)
    }
  }

  const saveSmsConfig = async (e) => {
    e.preventDefault()
    if (smsSaving) return
    setSmsSaving(true)
    setError(null)
    setMessage(null)
    try {
      const hours = Number(smsForm.hours_before)
      if (!Number.isFinite(hours) || hours < 1 || hours > 168) {
        setError('تعداد ساعت باید بین ۱ تا ۱۶۸ باشد')
        return
      }
      const payload = {
        hours_before: hours,
        is_active: !!smsForm.is_active,
        send_to_manager: !!smsForm.send_to_manager,
        manager_mobile: (smsForm.manager_mobile || '').trim(),
      }
      const res = await karmandanService.updateFollowupSmsConfig(payload)
      const data = res?.data || {}
      setSmsForm({
        hours_before: data.hours_before ?? payload.hours_before,
        is_active: data.is_active !== false,
        send_to_manager: data.send_to_manager !== false,
        manager_mobile: data.manager_mobile || payload.manager_mobile,
      })
      setMessage(res?.message || 'تنظیمات یادآور پیامک ذخیره شد')
    } catch (err) {
      const detail =
        err?.hours_before?.[0] ||
        err?.manager_mobile?.[0] ||
        err?.detail ||
        err?.message ||
        err?.error ||
        'ذخیره تنظیمات پیامک ناموفق بود'
      setError(detail)
    } finally {
      setSmsSaving(false)
    }
  }

  const openPanel = (key) => {
    setError(null)
    setMessage(null)
    setPanel((prev) => (prev === key ? null : key))
  }

  if (!enabled) return null

  return (
    <section className={styles.managerSection} dir="rtl">
      <div className={styles.managerLabel}>
        <Shield size={13} />
        ردیف مدیریت
      </div>

      <div className={styles.managerGrid}>
        <button
          type="button"
          className={`${styles.managerCard} ${panel === 'companies' ? styles.managerCardActive : ''}`}
          onClick={() => openPanel('companies')}
        >
          <span className={styles.managerIcon}>
            <Building2 size={16} />
          </span>
          <span className={styles.managerTitle}>شرکت‌ها</span>
          <span className={styles.managerValue}>{companies.length}</span>
          <span className={styles.managerHint}>افزودن / ویرایش / حذف</span>
        </button>

        <button
          type="button"
          className={`${styles.managerCard} ${panel === 'access' ? styles.managerCardActive : ''}`}
          onClick={() => openPanel('access')}
        >
          <span className={styles.managerIcon}>
            <Users size={16} />
          </span>
          <span className={styles.managerTitle}>دسترسی کارمندان</span>
          <span className={styles.managerValue}>{activeAccessCount}</span>
          <span className={styles.managerHint}>اعضای دارای دسترسی</span>
        </button>

        <button
          type="button"
          className={styles.managerCard}
          onClick={() => router.push('/sale/invoice')}
        >
          <span className={styles.managerIcon}>
            <FileText size={16} />
          </span>
          <span className={styles.managerTitle}>پیش‌فاکتور / فاکتور</span>
          <span className={styles.managerValue}>طراحی</span>
          <span className={styles.managerHint}>صدور و چاپ سند</span>
        </button>

        <button
          type="button"
          className={styles.managerCard}
          onClick={() => router.push('/sale/analytics')}
        >
          <span className={styles.managerIcon}>
            <BarChart3 size={16} />
          </span>
          <span className={styles.managerTitle}>آمار فروش</span>
          <span className={styles.managerValue}>{totalLeads}</span>
          <span className={styles.managerHint}>
            تحلیل کارمندان · پیگیری: {todayFollow}
          </span>
        </button>

        <button
          type="button"
          className={styles.managerCard}
          onClick={() => router.push('/sale/monitor')}
        >
          <span className={styles.managerIcon}>
            <Route size={16} />
          </span>
          <span className={styles.managerTitle}>رصد مسیر</span>
          <span className={styles.managerValue}>موارد</span>
          <span className={styles.managerHint}>جستجو و مرحله هر مورد</span>
        </button>

        <button
          type="button"
          className={`${styles.managerCard} ${panel === 'sms' ? styles.managerCardActive : ''}`}
          onClick={() => openPanel('sms')}
        >
          <span className={styles.managerIcon}>
            <MessageSquare size={16} />
          </span>
          <span className={styles.managerTitle}>یادآور پیامک</span>
          <span className={styles.managerValue}>
            {smsForm.is_active ? `${smsForm.hours_before}س` : 'خاموش'}
          </span>
          <span className={styles.managerHint}>چند ساعت قبل از پیگیری</span>
        </button>
      </div>

      {message ? <div className={styles.okMsg}>{message}</div> : null}
      {error ? <div className={styles.error}>{error}</div> : null}

      {panel === 'companies' ? (
        <div className={styles.panel}>
          <div className={styles.toolbar}>
            <div className={styles.search}>
              <Search size={13} />
              <input
                type="search"
                value={companyQuery}
                onChange={(e) => setCompanyQuery(e.target.value)}
                placeholder="جستجوی شرکت..."
              />
            </div>
            <button type="button" className={styles.primaryBtn} onClick={openCreate}>
              <Plus size={14} />
              شرکت جدید
            </button>
          </div>

          {companiesLoading ? (
            <div className={styles.empty}>در حال بارگذاری...</div>
          ) : filteredCompanies.length === 0 ? (
            <div className={styles.empty}>
              <Building2 size={16} />
              هنوز شرکتی ثبت نشده
            </div>
          ) : (
            <ul className={styles.companyList}>
              {filteredCompanies.map((c) => (
                <li key={c.id} className={styles.companyRow}>
                  <div className={styles.companyMain}>
                    <div className={styles.logoBox}>
                      {c.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.logo_url} alt="" />
                      ) : (
                        <Building2 size={16} />
                      )}
                    </div>
                    <div className={styles.companyInfo}>
                      <div className={styles.companyName}>{c.name_fa}</div>
                      <div className={styles.companyMeta}>
                        {c.name_en ? `${c.name_en} · ` : ''}
                        {c.phone || 'بدون تماس'}
                        {c.registration_number ? ` · ثبت ${c.registration_number}` : ''}
                      </div>
                    </div>
                  </div>
                  <div className={styles.rowActions}>
                    <button type="button" className={styles.iconBtn} onClick={() => openEdit(c)}>
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      className={`${styles.iconBtn} ${styles.dangerBtn}`}
                      onClick={() => setDeleteTarget(c)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {panel === 'access' ? (
        <div className={styles.panel}>
          <p className={styles.hint}>
            کارمند فقط لیدهای خودش را می‌بیند؛ مدیر و سوپریوزر همه را می‌بینند.
          </p>
          <div className={styles.toolbar}>
            <div className={styles.search}>
              <Search size={13} />
              <input
                type="search"
                value={accessQuery}
                onChange={(e) => setAccessQuery(e.target.value)}
                placeholder="جستجوی کارمند..."
              />
            </div>
          </div>
          {accessLoading ? (
            <div className={styles.empty}>در حال بارگذاری...</div>
          ) : filteredEmployees.length === 0 ? (
            <div className={styles.empty}>کارمندی پیدا نشد</div>
          ) : (
            <ul className={styles.list}>
              {filteredEmployees.map((emp) => (
                <li key={emp.id} className={styles.row}>
                  <div className={styles.info}>
                    <div className={styles.name}>{emp.full_name}</div>
                    <div className={styles.meta}>
                      {emp.employee_code}
                      {emp.mobile ? ` · ${emp.mobile}` : ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`${styles.switch} ${emp.has_sale_access ? styles.switchOn : ''}`}
                    disabled={busyEmpId === emp.id}
                    onClick={() => toggleAccess(emp)}
                  >
                    <span className={styles.knob} />
                    <span className={styles.switchLabel}>
                      {emp.has_sale_access ? 'دارد' : 'ندارد'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {panel === 'sms' ? (
        <div className={`${styles.panel} ${styles.smsPanel}`}>
          <div className={styles.smsHead}>
            <div className={styles.smsHeadTitle}>
              <MessageSquare size={15} />
              یادآور پیامک پیگیری
            </div>
            <p className={styles.smsHeadDesc}>
              پیامک به موبایل خود همان کارمند مسئول لید می‌رود. فاصلهٔ قبل از زمان
              پیگیری را اینجا تنظیم کنید.
            </p>
          </div>

          {smsLoading ? (
            <div className={styles.empty}>در حال بارگذاری...</div>
          ) : (
            <form className={styles.smsForm} onSubmit={saveSmsConfig}>
              <div className={styles.smsHoursBlock}>
                <div className={styles.smsHoursLabel}>
                  <span>چند ساعت قبل از پیگیری</span>
                  <small>بین ۱ تا ۱۶۸ ساعت (۷ روز)</small>
                </div>
                <div className={styles.smsHoursControl}>
                  <button
                    type="button"
                    className={styles.smsStepBtn}
                    disabled={smsSaving || Number(smsForm.hours_before) <= 1}
                    onClick={() =>
                      setSmsForm((prev) => ({
                        ...prev,
                        hours_before: Math.max(1, Number(prev.hours_before) - 1),
                      }))
                    }
                    aria-label="کم کردن ساعت"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={168}
                    className={styles.smsHoursInput}
                    value={smsForm.hours_before}
                    onChange={(e) =>
                      setSmsForm({ ...smsForm, hours_before: e.target.value })
                    }
                    dir="ltr"
                    required
                  />
                  <span className={styles.smsHoursUnit}>ساعت</span>
                  <button
                    type="button"
                    className={styles.smsStepBtn}
                    disabled={smsSaving || Number(smsForm.hours_before) >= 168}
                    onClick={() =>
                      setSmsForm((prev) => ({
                        ...prev,
                        hours_before: Math.min(168, Number(prev.hours_before) + 1),
                      }))
                    }
                    aria-label="افزودن ساعت"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className={styles.smsOptionList}>
                <div className={styles.smsOptionRow}>
                  <div className={styles.smsOptionText}>
                    <strong>ارسال خودکار</strong>
                    <span>یادآور قبل از زمان پیگیری فعال باشد</span>
                  </div>
                  <button
                    type="button"
                    className={`${styles.switch} ${smsForm.is_active ? styles.switchOn : ''}`}
                    onClick={() =>
                      setSmsForm((prev) => ({ ...prev, is_active: !prev.is_active }))
                    }
                  >
                    <span className={styles.knob} />
                    <span className={styles.switchLabel}>
                      {smsForm.is_active ? 'فعال' : 'خاموش'}
                    </span>
                  </button>
                </div>

                <div className={styles.smsOptionRow}>
                  <div className={styles.smsOptionText}>
                    <strong>کپی برای مدیر</strong>
                    <span>علاوه بر کارمند، به موبایل مدیر هم برود</span>
                  </div>
                  <button
                    type="button"
                    className={`${styles.switch} ${smsForm.send_to_manager ? styles.switchOn : ''}`}
                    onClick={() =>
                      setSmsForm((prev) => ({
                        ...prev,
                        send_to_manager: !prev.send_to_manager,
                      }))
                    }
                  >
                    <span className={styles.knob} />
                    <span className={styles.switchLabel}>
                      {smsForm.send_to_manager ? 'بله' : 'خیر'}
                    </span>
                  </button>
                </div>
              </div>

              {smsForm.send_to_manager ? (
                <label className={`${styles.field} ${styles.smsManagerField}`}>
                  <span>موبایل مدیر</span>
                  <input
                    type="tel"
                    value={smsForm.manager_mobile}
                    onChange={(e) =>
                      setSmsForm({ ...smsForm, manager_mobile: e.target.value })
                    }
                    placeholder="0912xxxxxxx"
                    dir="ltr"
                    maxLength={11}
                  />
                </label>
              ) : null}

              <div className={styles.smsActions}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  disabled={smsSaving}
                  onClick={() => setPanel(null)}
                >
                  بستن
                </button>
                <button type="submit" className={styles.primaryBtn} disabled={smsSaving}>
                  {smsSaving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : null}

      {formOpen ? (
        <div className={styles.modalOverlay} onClick={() => !saving && setFormOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3>{editing ? 'ویرایش شرکت' : 'شرکت جدید'}</h3>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => !saving && setFormOpen(false)}
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={saveCompany} className={styles.form}>
              <div className={styles.logoField}>
                <div className={styles.logoPreview}>
                  {form.logoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.logoPreview} alt="" />
                  ) : (
                    <Building2 size={22} />
                  )}
                </div>
                <div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className={styles.hiddenInput}
                    onChange={onLogoPick}
                  />
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    <Upload size={13} />
                    آپلود لوگو
                  </button>
                </div>
              </div>

              <div className={styles.grid2}>
                <label className={styles.field}>
                  <span>نام فارسی *</span>
                  <input
                    value={form.name_fa}
                    onChange={(e) => setForm({ ...form, name_fa: e.target.value })}
                    required
                  />
                </label>
                <label className={styles.field}>
                  <span>نام انگلیسی</span>
                  <input
                    value={form.name_en}
                    onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                    dir="ltr"
                  />
                </label>
              </div>

              <div className={styles.grid2}>
                <label className={styles.field}>
                  <span>شماره تماس</span>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    dir="ltr"
                  />
                </label>
                <label className={styles.field}>
                  <span>شماره ثبت شرکت</span>
                  <input
                    value={form.registration_number}
                    onChange={(e) =>
                      setForm({ ...form, registration_number: e.target.value })
                    }
                    dir="ltr"
                  />
                </label>
              </div>

              <label className={styles.field}>
                <span>وب‌سایت</span>
                <input
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  dir="ltr"
                />
              </label>

              <label className={styles.field}>
                <span>آدرس</span>
                <textarea
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </label>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  disabled={saving}
                  onClick={() => setFormOpen(false)}
                >
                  انصراف
                </button>
                <button type="submit" className={styles.primaryBtn} disabled={saving}>
                  {saving ? 'در حال ذخیره...' : editing ? 'ذخیره تغییرات' : 'ثبت شرکت'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="حذف شرکت"
        message="این شرکت برای همیشه حذف می‌شود. آیا مطمئن هستید؟"
        confirmText="بله، حذف شود"
        cancelText="انصراف"
        type="danger"
        loading={deleting}
        itemTitle={deleteTarget?.name_fa}
        itemPhone={deleteTarget?.phone}
        details={
          deleteTarget?.registration_number
            ? [{ label: 'شماره ثبت', value: deleteTarget.registration_number }]
            : []
        }
      />
    </section>
  )
}
