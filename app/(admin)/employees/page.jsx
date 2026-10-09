// app/(admin)/employees/page.jsx — مدیریت کامل کارمندان
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'
import axios from 'axios'
import Config from '@/config/config'
import {
  Users, Plus, Search, Shield, RefreshCw, Pencil,
  Trash2, UserCheck, UserX, X, Phone, Briefcase, CheckCircle2
} from 'lucide-react'
import styles from './Employees.module.css'

const ACCESS_LEVELS = [
  { value: 1, fa: 'کارمند', en: 'Employee' },
  { value: 2, fa: 'کارشناس', en: 'Expert' },
  { value: 3, fa: 'مدیر', en: 'Manager' },
  { value: 4, fa: 'مدیر کل', en: 'Director' },
]

const PERM_FIELDS = [
  { key: 'is_marketing', fa: 'بازاریابی', en: 'Marketing' },
  { key: 'is_sales', fa: 'فروش', en: 'Sales' },
  { key: 'is_support', fa: 'پشتیبانی', en: 'Support' },
  { key: 'is_warehouse', fa: 'انبار', en: 'Warehouse' },
  { key: 'is_attendance', fa: 'حضور و غیاب', en: 'Attendance' },
]

const emptyForm = {
  user: '',
  first_name: '',
  last_name: '',
  mobile: '',
  employee_code: '',
  access_level: 1,
  is_active: true,
  hire_date: '',
  is_marketing: false,
  is_sales: false,
  is_support: false,
  is_warehouse: false,
  is_attendance: false,
}

const EmployeesPage = () => {
  const router = useRouter()
  const { isAuthenticated, loading, user, isEmployee, employeeData, getAuthHeaders } = useAuth()
  const { language, dir } = useLanguage()

  const [items, setItems] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [stats, setStats] = useState(null)
  const [myProfile, setMyProfile] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState(null)

  const [userQuery, setUserQuery] = useState('')
  const [userResults, setUserResults] = useState([])
  const [searchingUsers, setSearchingUsers] = useState(false)

  const texts = {
    fa: {
      title: 'مدیریت کارمندان',
      subtitle: 'مشاهده، ایجاد و مدیریت دسترسی کارمندان',
      search: 'جستجو (نام، موبایل، کد پرسنلی)...',
      add: 'کارمند جدید',
      total: 'کل کارمندان',
      active: 'فعال',
      inactive: 'غیرفعال',
      marketing: 'بازاریابی',
      sales: 'فروش',
      support: 'پشتیبانی',
      warehouse: 'انبار',
      attendance: 'حضور و غیاب',
      name: 'نام',
      code: 'کد پرسنلی',
      mobile: 'موبایل',
      level: 'سطح',
      perms: 'دسترسی‌ها',
      status: 'وضعیت',
      actions: 'عملیات',
      edit: 'ویرایش',
      del: 'حذف',
      activate: 'فعال‌سازی',
      deactivate: 'غیرفعال‌سازی',
      save: 'ذخیره',
      cancel: 'انصراف',
      createTitle: 'ثبت کارمند جدید',
      editTitle: 'ویرایش کارمند',
      findUser: 'یافتن کاربر (حداقل ۳ حرف)',
      selectUser: 'انتخاب کاربر',
      noUser: 'کاربری یافت نشد',
      firstName: 'نام',
      lastName: 'نام خانوادگی',
      hireDate: 'تاریخ استخدام',
      isActive: 'حساب فعال باشد',
      loading: 'در حال بارگذاری...',
      saving: 'در حال ذخیره...',
      searching: 'در حال جستجو...',
      empty: 'کارمندی یافت نشد',
      confirmDelete: 'آیا از حذف این کارمند اطمینان دارید؟',
      accessDenied: 'دسترسی محدود',
      needManager: 'مدیریت کارمندان فقط برای مدیر (سطح ۳ به بالا) و سوپرکاربر است',
      needEmployee: 'برای دسترسی به این بخش باید کارمند باشید',
      returnHome: 'بازگشت به صفحه اصلی',
      backDashboard: 'بازگشت به داشبورد',
      myProfile: 'پروفایل من',
      noPerm: 'بدون دسترسی',
    },
    en: {
      title: 'Employee Management',
      subtitle: 'View, create and manage employee access',
      search: 'Search (name, mobile, code)...',
      add: 'New Employee',
      total: 'Total',
      active: 'Active',
      inactive: 'Inactive',
      marketing: 'Marketing',
      sales: 'Sales',
      support: 'Support',
      warehouse: 'Warehouse',
      attendance: 'Attendance',
      name: 'Name',
      code: 'Code',
      mobile: 'Mobile',
      level: 'Level',
      perms: 'Permissions',
      status: 'Status',
      actions: 'Actions',
      edit: 'Edit',
      del: 'Delete',
      activate: 'Activate',
      deactivate: 'Deactivate',
      save: 'Save',
      cancel: 'Cancel',
      createTitle: 'Create Employee',
      editTitle: 'Edit Employee',
      findUser: 'Find user (min 3 chars)',
      selectUser: 'Select user',
      noUser: 'No user found',
      firstName: 'First name',
      lastName: 'Last name',
      hireDate: 'Hire date',
      isActive: 'Account is active',
      loading: 'Loading...',
      saving: 'Saving...',
      searching: 'Searching...',
      empty: 'No employees found',
      confirmDelete: 'Are you sure you want to delete this employee?',
      accessDenied: 'Access Denied',
      needManager: 'Employee management is only for managers (level 3+) and superusers',
      needEmployee: 'You must be an employee to access this section',
      returnHome: 'Return to Home',
      backDashboard: 'Back to Dashboard',
      myProfile: 'My Profile',
      noPerm: 'No access',
    }
  }

  const t = texts[language] || texts.fa

  const isManager = user?.is_superuser || (employeeData?.access_level ?? 0) >= 3

  const accessLabel = (level) => {
    const found = ACCESS_LEVELS.find((a) => a.value === Number(level))
    return found ? (found[language] || found.fa) : level
  }

  // ---------- دریافت لیست ----------
  const fetchList = useCallback(async (q = '') => {
    try {
      setLoadingData(true)
      setError(null)
      const url = q.trim()
        ? Config.endpoints.karmandan.search(q.trim())
        : Config.endpoints.karmandan.list()
      const res = await axios.get(url, { headers: getAuthHeaders() })
      const body = res.data
      const arr = Array.isArray(body)
        ? body
        : Array.isArray(body?.results)
          ? body.results
          : []
      setItems(arr)
      setTotalCount(body?.count ?? arr.length)
    } catch (err) {
      setError(err.response?.data?.message || err.message || t.empty)
      setItems([])
    } finally {
      setLoadingData(false)
    }
  }, [getAuthHeaders, t.empty])

  // ---------- آمار (فقط مدیر) ----------
  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(Config.endpoints.karmandan.stats(), { headers: getAuthHeaders() })
      setStats(res.data?.data || res.data)
    } catch {
      setStats(null)
    }
  }, [getAuthHeaders])

  // ---------- پروفایل خودم (کارمند عادی) ----------
  const fetchMyProfile = useCallback(async () => {
    try {
      const res = await axios.get(Config.endpoints.karmandan.myProfile(), { headers: getAuthHeaders() })
      setMyProfile(res.data?.data || res.data)
    } catch {
      setMyProfile(null)
    }
  }, [getAuthHeaders])

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login')
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (!isAuthenticated) return
    if (isManager) {
      fetchList('')
      fetchStats()
    } else if (isEmployee) {
      fetchMyProfile()
      setLoadingData(false)
    } else {
      setLoadingData(false)
    }
  }, [isAuthenticated, isManager, isEmployee, fetchList, fetchStats, fetchMyProfile])

  // جستجو با debounce ساده
  useEffect(() => {
    if (!isManager) return
    const id = setTimeout(() => fetchList(searchTerm), 450)
    return () => clearTimeout(id)
  }, [searchTerm, isManager, fetchList])

  // ---------- جستجوی کاربر برای ساخت کارمند ----------
  const handleUserSearch = async (q) => {
    setUserQuery(q)
    if (q.trim().length < 3) {
      setUserResults([])
      return
    }
    try {
      setSearchingUsers(true)
      const res = await axios.get(Config.endpoints.karmandan.searchUsers(q.trim()), { headers: getAuthHeaders() })
      setUserResults(res.data?.results || [])
    } catch {
      setUserResults([])
    } finally {
      setSearchingUsers(false)
    }
  }

  const pickUser = (u) => {
    setForm((f) => ({
      ...f,
      user: u.id,
      first_name: u.first_name || f.first_name,
      last_name: u.last_name || f.last_name,
      mobile: u.mobile || f.mobile,
    }))
    setUserResults([])
    setUserQuery(u.display_name || u.mobile)
  }

  // ---------- باز کردن فرم ----------
  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setUserQuery('')
    setUserResults([])
    setFormError(null)
    setShowForm(true)
  }

  const openEdit = (emp) => {
    setEditing(emp)
    setForm({
      user: emp.user ?? '',
      first_name: emp.first_name || '',
      last_name: emp.last_name || '',
      mobile: emp.mobile || '',
      employee_code: emp.employee_code || '',
      access_level: emp.access_level ?? 1,
      is_active: emp.is_active ?? true,
      hire_date: emp.hire_date || '',
      is_marketing: !!emp.is_marketing,
      is_sales: !!emp.is_sales,
      is_support: !!emp.is_support,
      is_warehouse: !!emp.is_warehouse,
      is_attendance: !!emp.is_attendance,
    })
    setFormError(null)
    setShowForm(true)
  }

  const fmtErrors = (data) => {
    if (!data) return 'خطا در ذخیره'
    if (typeof data === 'string') return data
    if (data.message) return data.message
    const parts = []
    Object.entries(data).forEach(([k, v]) => {
      if (k === 'status') return
      parts.push(`${k}: ${Array.isArray(v) ? v.join('، ') : v}`)
    })
    return parts.join(' | ') || 'خطا در ذخیره'
  }

  // ---------- ذخیره ----------
  const handleSave = async (e) => {
    e.preventDefault()
    setFormError(null)
    try {
      setSaving(true)
      if (editing) {
        const payload = {
          first_name: form.first_name,
          last_name: form.last_name,
          mobile: form.mobile,
          employee_code: form.employee_code,
          access_level: Number(form.access_level),
          is_active: form.is_active,
          is_marketing: form.is_marketing,
          is_sales: form.is_sales,
          is_support: form.is_support,
          is_warehouse: form.is_warehouse,
          is_attendance: form.is_attendance,
        }
        if (form.hire_date) payload.hire_date = form.hire_date
        await axios.patch(Config.endpoints.karmandan.partialUpdate(editing.id), payload, { headers: getAuthHeaders() })
      } else {
        if (!form.user) {
          setFormError(language === 'fa' ? 'ابتدا کاربر را جستجو و انتخاب کنید' : 'Search and select a user first')
          setSaving(false)
          return
        }
        const payload = {
          user: form.user,
          first_name: form.first_name,
          last_name: form.last_name,
          mobile: form.mobile,
          employee_code: form.employee_code,
          access_level: Number(form.access_level),
          is_active: form.is_active,
          is_marketing: form.is_marketing,
          is_sales: form.is_sales,
          is_support: form.is_support,
          is_warehouse: form.is_warehouse,
          is_attendance: form.is_attendance,
        }
        if (form.hire_date) payload.hire_date = form.hire_date
        await axios.post(Config.endpoints.karmandan.create(), payload, { headers: getAuthHeaders() })
      }
      setShowForm(false)
      fetchList(searchTerm)
      fetchStats()
    } catch (err) {
      setFormError(fmtErrors(err.response?.data))
    } finally {
      setSaving(false)
    }
  }

  // ---------- تغییر وضعیت فعال ----------
  const handleToggle = async (emp) => {
    try {
      const res = await axios.post(
        Config.endpoints.karmandan.toggleActive(emp.id), {}, { headers: getAuthHeaders() }
      )
      const isActive = res.data?.is_active
      setItems((prev) => prev.map((it) => (it.id === emp.id ? { ...it, is_active: isActive ?? !it.is_active } : it)))
      fetchStats()
    } catch (err) {
      alert(fmtErrors(err.response?.data))
    }
  }

  // ---------- حذف ----------
  const handleDelete = async (emp) => {
    if (!window.confirm(`${t.confirmDelete}\n${emp.full_name || ''} (${emp.employee_code || ''})`)) return
    try {
      await axios.delete(Config.endpoints.karmandan.delete(emp.id), { headers: getAuthHeaders() })
      setItems((prev) => prev.filter((it) => it.id !== emp.id))
      fetchStats()
    } catch (err) {
      alert(fmtErrors(err.response?.data))
    }
  }

  const permBadges = (emp) => {
    const list = PERM_FIELDS.filter((p) => emp[p.key])
    if (list.length === 0) return <span className={styles.noPerm}>{t.noPerm}</span>
    return list.map((p) => (
      <span key={p.key} className={styles.permBadge}>{p[language] || p.fa}</span>
    ))
  }

  // ---------- رندر: لودینگ ----------
  if (loading || loadingData) {
    return (
      <div className={styles.page} dir={dir}>
        <div className={styles.wrap}>
          <div className={styles.loadingBox}>
            <RefreshCw size={32} className={styles.spinner} />
            <p>{t.loading}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  // ---------- رندر: غیرکارمند ----------
  if (!isEmployee && !user?.is_staff && !user?.is_superuser) {
    return (
      <div className={styles.page} dir={dir}>
        <div className={styles.wrap}>
          <div className={styles.denied}>
            <span className={styles.deniedIcon}><Shield size={44} /></span>
            <h3>{t.accessDenied}</h3>
            <p>{t.needEmployee}</p>
            <Link href="/" className={styles.primaryBtn}>{t.returnHome}</Link>
          </div>
        </div>
      </div>
    )
  }

  // ---------- رندر: کارمند عادی (فقط پروفایل خودش) ----------
  if (!isManager) {
    return (
      <div className={styles.page} dir={dir}>
        <div className={styles.wrap}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <span className={styles.headerIcon}><Users size={26} /></span>
              <div>
                <h1 className={styles.pageTitle}>{t.myProfile}</h1>
                <p className={styles.pageDesc}>{t.needManager}</p>
              </div>
            </div>
            <Link href="/dashboard" className={styles.ghostBtn}>{t.backDashboard}</Link>
          </div>
          {myProfile && (
            <div className={styles.profileCard}>
              <div className={styles.profileRow}>
                <Briefcase size={16} />
                <strong>{myProfile.full_name}</strong>
                <span className={styles.codeBadge}>{myProfile.employee_code}</span>
                <span className={styles.levelBadge}>{myProfile.access_level_label}</span>
              </div>
              <div className={styles.profileRow}>
                <Phone size={14} />
                <span dir="ltr">{myProfile.mobile}</span>
              </div>
              <div className={styles.permRow}>{permBadges(myProfile)}</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ---------- رندر اصلی مدیر ----------
  const statCards = stats ? [
    { id: 'total', icon: <Users size={20} />, value: stats.total ?? 0, label: t.total, cls: styles.stTotal },
    { id: 'active', icon: <UserCheck size={20} />, value: stats.active ?? 0, label: t.active, cls: styles.stActive },
    { id: 'inactive', icon: <UserX size={20} />, value: stats.inactive ?? 0, label: t.inactive, cls: styles.stInactive },
    { id: 'marketing', icon: <Briefcase size={20} />, value: stats.marketing ?? 0, label: t.marketing, cls: styles.stMark },
    { id: 'sales', icon: <Briefcase size={20} />, value: stats.sales ?? 0, label: t.sales, cls: styles.stSales },
    { id: 'support', icon: <Briefcase size={20} />, value: stats.support ?? 0, label: t.support, cls: styles.stSup },
    { id: 'warehouse', icon: <Briefcase size={20} />, value: stats.warehouse ?? 0, label: t.warehouse, cls: styles.stWh },
    { id: 'attendance', icon: <Briefcase size={20} />, value: stats.attendance ?? 0, label: t.attendance, cls: styles.stAtt },
  ] : []

  return (
    <div className={styles.page} dir={dir}>
      <div className={styles.wrap}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}><Users size={26} /></span>
            <div>
              <h1 className={styles.pageTitle}>{t.title} ({totalCount})</h1>
              <p className={styles.pageDesc}>{t.subtitle}</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link href="/dashboard" className={styles.ghostBtn}>{t.backDashboard}</Link>
            <button className={styles.primaryBtn} onClick={openCreate}>
              <Plus size={16} /> {t.add}
            </button>
          </div>
        </div>

        {statCards.length > 0 && (
          <div className={styles.statsGrid}>
            {statCards.map((s) => (
              <div key={s.id} className={`${styles.statCard} ${s.cls}`}>
                <span className={styles.statIcon}>{s.icon}</span>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.search}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button className={styles.clearSearch} onClick={() => setSearchTerm('')}>
                <X size={14} />
              </button>
            )}
          </div>
          <button className={styles.ghostBtn} onClick={() => { fetchList(searchTerm); fetchStats() }}>
            <RefreshCw size={14} />
          </button>
        </div>

        {error && <div className={styles.errorBar}>{error}</div>}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t.name}</th>
                <th>{t.code}</th>
                <th>{t.mobile}</th>
                <th>{t.level}</th>
                <th>{t.perms}</th>
                <th>{t.status}</th>
                <th>{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((emp) => (
                <tr key={emp.id} className={!emp.is_active ? styles.rowInactive : ''}>
                  <td>
                    <strong>{emp.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`}</strong>
                  </td>
                  <td><span className={styles.codeBadge}>{emp.employee_code}</span></td>
                  <td dir="ltr" className={styles.mobileCell}>{emp.mobile || emp.user_mobile}</td>
                  <td><span className={styles.levelBadge}>{emp.access_level_label || accessLabel(emp.access_level)}</span></td>
                  <td><span className={styles.permRow}>{permBadges(emp)}</span></td>
                  <td>
                    <span className={`${styles.statusPill} ${emp.is_active ? styles.on : styles.off}`}>
                      {emp.is_active ? <CheckCircle2 size={12} /> : <X size={12} />}
                      {emp.is_active ? t.active : t.inactive}
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        className={styles.iconBtn}
                        title={t.edit}
                        onClick={() => openEdit(emp)}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className={`${styles.iconBtn} ${emp.is_active ? styles.warn : styles.ok}`}
                        title={emp.is_active ? t.deactivate : t.activate}
                        onClick={() => handleToggle(emp)}
                      >
                        {emp.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.danger}`}
                        title={t.del}
                        onClick={() => handleDelete(emp)}
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
              <Users size={32} />
              <span>{t.empty}</span>
            </div>
          )}
        </div>

        {showForm && (
          <div className={styles.overlay} onClick={() => setShowForm(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHead}>
                <h2>{editing ? t.editTitle : t.createTitle}</h2>
                <button className={styles.iconBtn} onClick={() => setShowForm(false)}>
                  <X size={16} />
                </button>
              </div>

              {formError && <div className={styles.errorBar}>{formError}</div>}

              <form onSubmit={handleSave}>
                {!editing && (
                  <div className={styles.formGroup}>
                    <label>{t.findUser}</label>
                    <input
                      value={userQuery}
                      onChange={(e) => handleUserSearch(e.target.value)}
                      placeholder={t.findUser}
                    />
                    {searchingUsers && <small className={styles.hint}>{t.searching}</small>}
                    {userResults.length > 0 && (
                      <div className={styles.userList}>
                        {userResults.map((u) => (
                          <button
                            type="button"
                            key={u.id}
                            className={styles.userItem}
                            onClick={() => pickUser(u)}
                          >
                            <UserCheck size={14} />
                            <span>{u.display_name}</span>
                            <span dir="ltr" className={styles.mobileCell}>{u.mobile}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {userQuery.trim().length >= 3 && userResults.length === 0 && !searchingUsers && (
                      <small className={styles.hint}>{t.noUser}</small>
                    )}
                  </div>
                )}

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t.firstName} *</label>
                    <input
                      value={form.first_name}
                      onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t.lastName} *</label>
                    <input
                      value={form.last_name}
                      onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t.mobile} *</label>
                    <input
                      dir="ltr"
                      value={form.mobile}
                      onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                      placeholder="0912..."
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t.code} *</label>
                    <input
                      dir="ltr"
                      value={form.employee_code}
                      onChange={(e) => setForm({ ...form, employee_code: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t.level}</label>
                    <select
                      value={form.access_level}
                      onChange={(e) => setForm({ ...form, access_level: Number(e.target.value) })}
                    >
                      {ACCESS_LEVELS.map((a) => (
                        <option key={a.value} value={a.value}>{a[language] || a.fa}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t.hireDate}</label>
                    <input
                      type="date"
                      dir="ltr"
                      value={form.hire_date}
                      onChange={(e) => setForm({ ...form, hire_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.permGrid}>
                  {PERM_FIELDS.map((p) => (
                    <label key={p.key} className={styles.checkRow}>
                      <input
                        type="checkbox"
                        checked={!!form[p.key]}
                        onChange={(e) => setForm({ ...form, [p.key]: e.target.checked })}
                      />
                      {p[language] || p.fa}
                    </label>
                  ))}
                  <label className={styles.checkRow}>
                    <input
                      type="checkbox"
                      checked={!!form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    />
                    {t.isActive}
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

export default EmployeesPage
