// app/(admin)/employees/page.jsx — مدیریت کارمندان و بخش‌های دسترسی
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'
import axios from 'axios'
import Config from '@/config/config'
import { SECTION_ICON_OPTIONS, sectionLabel } from '@/utils/accessSections'
import PersianDatePicker from '@/components/common/PersianDatePicker'
import {
  Users, Plus, Search, Shield, RefreshCw, Pencil,
  Trash2, UserCheck, UserX, X, Phone, Briefcase, CheckCircle2, Layers,
  LayoutDashboard, Calendar
} from 'lucide-react'
import styles from './Employees.module.css'

const ACCESS_LEVELS = [
  { value: 1, fa: 'کارمند', en: 'Employee' },
  { value: 2, fa: 'کارشناس', en: 'Expert' },
  { value: 3, fa: 'مدیر', en: 'Manager' },
  { value: 4, fa: 'مدیر کل', en: 'Director' },
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
  department_ids: [],
}

const emptySection = {
  code: '',
  name_fa: '',
  name_en: '',
  description: '',
  href: '',
  icon: 'layers',
  color: '#1976d2',
  sort_order: 100,
  is_active: true,
}

const EmployeesPage = () => {
  const router = useRouter()
  const {
    isAuthenticated, loading, user, isEmployee, getAuthHeaders,
    canManageEmployees, checkEmployeeStatus,
  } = useAuth()
  const { language, dir } = useLanguage()

  const [items, setItems] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [stats, setStats] = useState(null)
  const [sections, setSections] = useState([])
  const [myProfile, setMyProfile] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState(null)

  const [showSections, setShowSections] = useState(false)
  const [sectionForm, setSectionForm] = useState(emptySection)
  const [editingSection, setEditingSection] = useState(null)
  const [sectionError, setSectionError] = useState(null)
  const [savingSection, setSavingSection] = useState(false)

  const [userQuery, setUserQuery] = useState('')
  const [userResults, setUserResults] = useState([])
  const [searchingUsers, setSearchingUsers] = useState(false)
  const [sectionFilter, setSectionFilter] = useState('')

  const texts = {
    fa: {
      title: 'مدیریت کارمندان',
      subtitle: 'مشاهده، ایجاد و مدیریت دسترسی کارمندان',
      search: 'جستجو (نام، موبایل، کد پرسنلی)...',
      add: 'کارمند جدید',
      sections: 'تعریف بخش‌ها',
      sectionsTitle: 'بخش‌های دسترسی',
      sectionsHint: 'بخش‌هایی که به کارمند اختصاص می‌دهید اینجا تعریف می‌شوند؛ ثابت نیستند.',
      addSection: 'بخش جدید',
      editSection: 'ویرایش بخش',
      code: 'کد پرسنلی',
      sectionCode: 'کد یکتا',
      sectionNameFa: 'نام فارسی',
      sectionNameEn: 'نام انگلیسی',
      sectionHref: 'مسیر صفحه (اختیاری)',
      sectionIcon: 'آیکون',
      sectionDesc: 'توضیح',
      sectionColor: 'رنگ',
      sectionOrder: 'ترتیب',
      filterAll: 'همه بخش‌ها',
      members: 'عضو',
      systemSection: 'سیستمی',
      cannotDeleteSystem: 'بخش سیستمی قابل حذف نیست. می‌توانید غیرفعالش کنید.',
      total: 'کل کارمندان',
      active: 'فعال',
      inactive: 'غیرفعال',
      name: 'نام',
      mobile: 'موبایل',
      level: 'سطح',
      perms: 'بخش‌ها',
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
      noUser: 'کاربری یافت نشد',
      firstName: 'نام',
      lastName: 'نام خانوادگی',
      hireDate: 'تاریخ استخدام',
      hireDatePlaceholder: 'تاریخ استخدام را انتخاب کنید',
      isActive: 'حساب فعال باشد',
      loading: 'در حال بارگذاری...',
      saving: 'در حال ذخیره...',
      searching: 'در حال جستجو...',
      empty: 'کارمندی یافت نشد',
      confirmDelete: 'آیا از حذف این کارمند اطمینان دارید؟',
      confirmDeleteSection: 'آیا از حذف این بخش اطمینان دارید؟',
      accessDenied: 'دسترسی محدود',
      needManager: 'مدیریت کارمندان فقط برای مدیر (سطح ۳ به بالا)، سوپرکاربر یا دارندگان بخش کاربران است',
      needEmployee: 'برای دسترسی به این بخش باید کارمند باشید',
      returnHome: 'بازگشت به صفحه اصلی',
      backDashboard: 'بازگشت به داشبورد',
      myProfile: 'پروفایل من',
      noPerm: 'بدون بخش',
      assignSections: 'دسترسی به بخش‌ها',
    },
    en: {
      title: 'Employee Management',
      subtitle: 'View, create and manage employee access',
      search: 'Search (name, mobile, code)...',
      add: 'New Employee',
      sections: 'Define sections',
      sectionsTitle: 'Access sections',
      sectionsHint: 'Sections assigned to employees are defined here — they are not hardcoded.',
      addSection: 'New section',
      editSection: 'Edit section',
      code: 'Code',
      sectionCode: 'Unique code',
      sectionNameFa: 'Persian name',
      sectionNameEn: 'English name',
      sectionHref: 'Page path (optional)',
      sectionIcon: 'Icon',
      sectionDesc: 'Description',
      sectionColor: 'Color',
      sectionOrder: 'Order',
      filterAll: 'All sections',
      members: 'members',
      systemSection: 'System',
      cannotDeleteSystem: 'System sections cannot be deleted. You can deactivate them.',
      total: 'Total',
      active: 'Active',
      inactive: 'Inactive',
      name: 'Name',
      mobile: 'Mobile',
      level: 'Level',
      perms: 'Sections',
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
      noUser: 'No user found',
      firstName: 'First name',
      lastName: 'Last name',
      hireDate: 'Hire date',
      hireDatePlaceholder: 'Select hire date',
      isActive: 'Account is active',
      loading: 'Loading...',
      saving: 'Saving...',
      searching: 'Searching...',
      empty: 'No employees found',
      confirmDelete: 'Are you sure you want to delete this employee?',
      confirmDeleteSection: 'Delete this section?',
      accessDenied: 'Access Denied',
      needManager: 'Employee management is for managers (level 3+), superusers, or users section holders',
      needEmployee: 'You must be an employee to access this section',
      returnHome: 'Return to Home',
      backDashboard: 'Back to Dashboard',
      myProfile: 'My Profile',
      noPerm: 'No section',
      assignSections: 'Section access',
    }
  }

  const t = texts[language] || texts.fa
  const isManager = canManageEmployees

  const accessLabel = (level) => {
    const found = ACCESS_LEVELS.find((a) => a.value === Number(level))
    return found ? (found[language] || found.fa) : level
  }

  const sectionName = (sec) => sectionLabel(sec, language)

  const employeeName = (emp) => (emp?.full_name || `${emp?.first_name || ''} ${emp?.last_name || ''}`).trim() || '—'

  const initialsOf = (emp) => {
    const parts = employeeName(emp).split(/\s+/).filter(Boolean)
    if (!parts.length || parts[0] === '—') return '؟'
    return ((parts[0][0] || '') + (parts[1]?.[0] || '')).toUpperCase()
  }

  const avatarHue = (emp) => {
    const src = employeeName(emp)
    let h = 0
    for (let i = 0; i < src.length; i += 1) h = (h * 31 + src.charCodeAt(i)) % 360
    return [22, 38, 205, 160, 280, 340][h % 6]
  }

  const levelClass = (level) => ({
    1: styles.lv1,
    2: styles.lv2,
    3: styles.lv3,
    4: styles.lv4,
  }[Number(level)] || styles.lv1)

  const fetchList = useCallback(async (q = '') => {
    try {
      setLoadingData(true)
      setError(null)
      const deptParams = sectionFilter ? { department: sectionFilter } : {}
      const url = q.trim()
        ? Config.endpoints.karmandan.search(q.trim(), deptParams)
        : Config.endpoints.karmandan.list(deptParams)
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
  }, [getAuthHeaders, t.empty, sectionFilter])

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(Config.endpoints.karmandan.stats(), { headers: getAuthHeaders() })
      setStats(res.data?.data || res.data)
    } catch {
      setStats(null)
    }
  }, [getAuthHeaders])

  const fetchSections = useCallback(async () => {
    try {
      const res = await axios.get(Config.endpoints.karmandan.departments.list(), { headers: getAuthHeaders() })
      const body = res.data
      const arr = Array.isArray(body) ? body : Array.isArray(body?.results) ? body.results : []
      setSections(arr)
    } catch {
      setSections([])
    }
  }, [getAuthHeaders])

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
    fetchSections()
    if (isManager) {
      fetchList('')
      fetchStats()
    } else if (isEmployee) {
      fetchMyProfile()
      setLoadingData(false)
    } else {
      setLoadingData(false)
    }
  }, [isAuthenticated, isManager, isEmployee, fetchList, fetchStats, fetchMyProfile, fetchSections])

  useEffect(() => {
    if (!isManager) return
    const id = setTimeout(() => fetchList(searchTerm), 450)
    return () => clearTimeout(id)
  }, [searchTerm, isManager, fetchList, sectionFilter])

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

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setUserQuery('')
    setUserResults([])
    setFormError(null)
    setShowForm(true)
  }

  const employeeDeptIds = (emp) => {
    if (Array.isArray(emp?.departments) && emp.departments.length) {
      return emp.departments.map((d) => d.id)
    }
    if (Array.isArray(emp?.department_codes) && sections.length) {
      return sections.filter((s) => emp.department_codes.includes(s.code)).map((s) => s.id)
    }
    return []
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
      department_ids: employeeDeptIds(emp),
    })
    setFormError(null)
    setShowForm(true)
  }

  const toggleDept = (id) => {
    setForm((f) => {
      const has = f.department_ids.includes(id)
      return {
        ...f,
        department_ids: has ? f.department_ids.filter((x) => x !== id) : [...f.department_ids, id],
      }
    })
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
    try {
      setSaving(true)
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        mobile: form.mobile,
        employee_code: form.employee_code,
        access_level: Number(form.access_level),
        is_active: form.is_active,
        department_ids: form.department_ids,
      }
      if (form.hire_date) payload.hire_date = form.hire_date

      if (editing) {
        await axios.patch(Config.endpoints.karmandan.partialUpdate(editing.id), payload, { headers: getAuthHeaders() })
      } else {
        if (!form.user) {
          setFormError(language === 'fa' ? 'ابتدا کاربر را جستجو و انتخاب کنید' : 'Search and select a user first')
          setSaving(false)
          return
        }
        payload.user = form.user
        await axios.post(Config.endpoints.karmandan.create(), payload, { headers: getAuthHeaders() })
      }
      setShowForm(false)
      fetchList(searchTerm)
      fetchStats()
      if (typeof checkEmployeeStatus === 'function') checkEmployeeStatus()
    } catch (err) {
      setFormError(fmtErrors(err.response?.data))
    } finally {
      setSaving(false)
    }
  }

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

  const openSectionCreate = () => {
    setEditingSection(null)
    setSectionForm(emptySection)
    setSectionError(null)
  }

  const openSectionEdit = (sec) => {
    setEditingSection(sec)
    setSectionForm({
      code: sec.code || '',
      name_fa: sec.name_fa || '',
      name_en: sec.name_en || '',
      description: sec.description || '',
      href: sec.href || '',
      icon: sec.icon || 'layers',
      color: sec.color || '#1976d2',
      sort_order: sec.sort_order ?? 100,
      is_active: sec.is_active ?? true,
    })
    setSectionError(null)
  }

  const handleSaveSection = async (e) => {
    e.preventDefault()
    setSectionError(null)
    try {
      setSavingSection(true)
      const payload = {
        ...sectionForm,
        sort_order: Number(sectionForm.sort_order) || 100,
      }
      if (editingSection) {
        await axios.patch(Config.endpoints.karmandan.departments.update(editingSection.id), payload, { headers: getAuthHeaders() })
      } else {
        await axios.post(Config.endpoints.karmandan.departments.create(), payload, { headers: getAuthHeaders() })
      }
      setEditingSection(null)
      setSectionForm(emptySection)
      fetchSections()
      fetchStats()
      if (typeof checkEmployeeStatus === 'function') checkEmployeeStatus()
    } catch (err) {
      setSectionError(fmtErrors(err.response?.data))
    } finally {
      setSavingSection(false)
    }
  }

  const handleDeleteSection = async (sec) => {
    if (sec.is_system) {
      alert(t.cannotDeleteSystem)
      return
    }
    if (!window.confirm(`${t.confirmDeleteSection}\n${sec.name_fa}`)) return
    try {
      await axios.delete(Config.endpoints.karmandan.departments.delete(sec.id), { headers: getAuthHeaders() })
      fetchSections()
      fetchStats()
    } catch (err) {
      alert(fmtErrors(err.response?.data))
    }
  }

  const permBadges = (emp) => {
    const list = Array.isArray(emp?.departments) && emp.departments.length
      ? emp.departments
      : sections.filter((s) => (emp?.department_codes || emp?.permissions || []).includes(s.code))
    if (list.length === 0) return <span className={styles.noPerm}>{t.noPerm}</span>
    return list.map((p) => (
      <span
        key={p.id || p.code}
        className={styles.permBadge}
        style={p.color ? {
          background: `${p.color}18`,
          color: p.color,
          borderColor: `${p.color}40`,
        } : undefined}
      >
        <span className={styles.colorDot} style={{ background: p.color || '#1976d2' }} />
        {sectionName(p)}
      </span>
    ))
  }

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
            <Link href="/dashboard" className={styles.headerGhost}>
              <LayoutDashboard size={15} /> {t.backDashboard}
            </Link>
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

  const statCards = [
    { id: 'total', icon: <Users size={20} />, value: stats?.total ?? 0, label: t.total, cls: styles.stTotal },
    { id: 'active', icon: <UserCheck size={20} />, value: stats?.active ?? 0, label: t.active, cls: styles.stActive },
    { id: 'inactive', icon: <UserX size={20} />, value: stats?.inactive ?? 0, label: t.inactive, cls: styles.stInactive },
    ...((stats?.by_department || []).map((d) => ({
      id: d.code,
      icon: <Briefcase size={20} />,
      value: d.count ?? 0,
      label: language === 'en' && d.name_en ? d.name_en : d.name_fa,
      cls: styles.stMark,
      color: d.color,
    }))),
  ]

  const assignableSections = sections.filter((s) => s.is_active || form.department_ids.includes(s.id))

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
            <Link href="/dashboard" className={styles.headerGhost}>
              <LayoutDashboard size={15} /> {t.backDashboard}
            </Link>
            <button className={styles.headerGhost} onClick={() => { setShowSections(true); openSectionCreate() }}>
              <Layers size={16} /> {t.sections}
            </button>
            <button className={styles.headerPrimary} onClick={openCreate}>
              <Plus size={16} /> {t.add}
            </button>
          </div>
        </div>

        {statCards.length > 0 && (
          <div className={styles.statsGrid}>
            {statCards.map((s) => (
              <div
                key={s.id}
                className={`${styles.statCard} ${s.cls}`}
                style={s.color ? { '--accent': s.color } : undefined}
              >
                <span
                  className={styles.statIcon}
                  style={s.color ? { background: `${s.color}1a`, color: s.color } : undefined}
                >
                  {s.icon}
                </span>
                <div className={styles.statMeta}>
                  <span className={styles.statValue}>{s.value}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.toolbar}>
          <div className={styles.toolbarTop}>
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
            <button className={styles.ghostBtn} onClick={() => { fetchList(searchTerm); fetchStats(); fetchSections() }}>
              <RefreshCw size={14} />
            </button>
          </div>
          <div className={styles.filterChips}>
            <button
              className={`${styles.chip} ${!sectionFilter ? styles.chipOn : ''}`}
              onClick={() => setSectionFilter('')}
            >
              {t.filterAll}
            </button>
            {sections.filter((s) => s.is_active).map((s) => (
              <button
                key={s.id}
                className={`${styles.chip} ${sectionFilter === s.code ? styles.chipOn : ''}`}
                style={sectionFilter === s.code ? {
                  borderColor: s.color,
                  color: s.color,
                  background: `${s.color}14`,
                } : undefined}
                onClick={() => setSectionFilter(s.code)}
              >
                <span className={styles.colorDot} style={{ background: s.color || '#1976d2' }} />
                {sectionName(s)}
                {typeof s.members_count === 'number' ? (
                  <span className={styles.chipCount}>{s.members_count}</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {error && <div className={styles.errorBar}>{error}</div>}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t.name}</th>
                <th>{t.code}</th>
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
                    <div className={styles.personCell}>
                      <span
                        className={styles.avatar}
                        style={{ background: `hsl(${avatarHue(emp)} 62% 92%)`, color: `hsl(${avatarHue(emp)} 48% 32%)` }}
                      >
                        {initialsOf(emp)}
                      </span>
                      <div className={styles.personMeta}>
                        <strong>{employeeName(emp)}</strong>
                        <span dir="ltr" className={styles.personSub}>{emp.mobile || emp.user_mobile}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className={styles.codeBadge}>{emp.employee_code}</span></td>
                  <td>
                    <span className={`${styles.levelBadge} ${levelClass(emp.access_level)}`}>
                      {emp.access_level_label || accessLabel(emp.access_level)}
                    </span>
                  </td>
                  <td><span className={styles.permRow}>{permBadges(emp)}</span></td>
                  <td>
                    <span className={`${styles.statusPill} ${emp.is_active ? styles.on : styles.off}`}>
                      {emp.is_active ? <CheckCircle2 size={12} /> : <X size={12} />}
                      {emp.is_active ? t.active : t.inactive}
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button className={styles.iconBtn} title={t.edit} onClick={() => openEdit(emp)}>
                        <Pencil size={14} />
                      </button>
                      <button
                        className={`${styles.iconBtn} ${emp.is_active ? styles.warn : styles.ok}`}
                        title={emp.is_active ? t.deactivate : t.activate}
                        onClick={() => handleToggle(emp)}
                      >
                        {emp.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                      </button>
                      <button className={`${styles.iconBtn} ${styles.danger}`} title={t.del} onClick={() => handleDelete(emp)}>
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
                  <div className={`${styles.formGroup} ${styles.jalaliField}`}>
                    <label>
                      <Calendar size={13} /> {t.hireDate}
                    </label>
                    <PersianDatePicker
                      value={form.hire_date}
                      onChange={(date) => setForm({ ...form, hire_date: date || '' })}
                      placeholder={t.hireDatePlaceholder}
                    />
                  </div>
                </div>

                <div className={styles.sectionLabel}>{t.assignSections}</div>
                <div className={styles.permGrid}>
                  {assignableSections.map((p) => {
                    const on = form.department_ids.includes(p.id)
                    return (
                      <label
                        key={p.id}
                        className={`${styles.sectionPick} ${on ? styles.sectionPickOn : ''}`}
                        style={{ '--accent': p.color || '#1976d2' }}
                      >
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => toggleDept(p.id)}
                        />
                        <span className={styles.colorDot} style={{ background: p.color || '#1976d2' }} />
                        <span className={styles.sectionPickName}>{sectionName(p)}</span>
                        {on && <CheckCircle2 size={14} className={styles.sectionPickCheck} />}
                      </label>
                    )
                  })}
                  {assignableSections.length === 0 && (
                    <small className={styles.hint}>{t.sectionsHint}</small>
                  )}
                </div>
                <label className={styles.switchRow}>
                  <span>{t.isActive}</span>
                  <span className={`${styles.switch} ${form.is_active ? styles.switchOn : ''}`}>
                    <input
                      type="checkbox"
                      checked={!!form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
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

        {showSections && (
          <div className={styles.overlay} onClick={() => setShowSections(false)}>
            <div className={`${styles.modal} ${styles.modalWide}`} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHead}>
                <h2>{t.sectionsTitle}</h2>
                <button className={styles.iconBtn} onClick={() => setShowSections(false)}>
                  <X size={16} />
                </button>
              </div>
              <p className={styles.hint}>{t.sectionsHint}</p>

              {sectionError && <div className={styles.errorBar}>{sectionError}</div>}

              <form onSubmit={handleSaveSection} className={styles.sectionForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t.sectionCode} *</label>
                    <input
                      dir="ltr"
                      value={sectionForm.code}
                      onChange={(e) => setSectionForm({ ...sectionForm, code: e.target.value })}
                      required
                      disabled={!!editingSection?.is_system}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t.sectionNameFa} *</label>
                    <input
                      value={sectionForm.name_fa}
                      onChange={(e) => setSectionForm({ ...sectionForm, name_fa: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t.sectionNameEn}</label>
                    <input
                      dir="ltr"
                      value={sectionForm.name_en}
                      onChange={(e) => setSectionForm({ ...sectionForm, name_en: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t.sectionHref}</label>
                    <input
                      dir="ltr"
                      value={sectionForm.href}
                      onChange={(e) => setSectionForm({ ...sectionForm, href: e.target.value })}
                      placeholder="/employees"
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>{t.sectionIcon}</label>
                  <select
                    value={sectionForm.icon || 'layers'}
                    onChange={(e) => setSectionForm({ ...sectionForm, icon: e.target.value })}
                  >
                    {SECTION_ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {language === 'en' ? opt.en : opt.fa} ({opt.value})
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>{t.sectionDesc}</label>
                  <input
                    value={sectionForm.description}
                    onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t.sectionColor}</label>
                    <input
                      type="color"
                      value={sectionForm.color || '#1976d2'}
                      onChange={(e) => setSectionForm({ ...sectionForm, color: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t.sectionOrder}</label>
                    <input
                      type="number"
                      dir="ltr"
                      value={sectionForm.sort_order}
                      onChange={(e) => setSectionForm({ ...sectionForm, sort_order: e.target.value })}
                    />
                  </div>
                </div>
                <label className={styles.checkRow}>
                  <input
                    type="checkbox"
                    checked={!!sectionForm.is_active}
                    onChange={(e) => setSectionForm({ ...sectionForm, is_active: e.target.checked })}
                  />
                  {t.active}
                </label>
                <div className={styles.formActions}>
                  {editingSection && (
                    <button type="button" className={styles.ghostBtn} onClick={openSectionCreate}>
                      {t.addSection}
                    </button>
                  )}
                  <button type="submit" className={styles.primaryBtn} disabled={savingSection}>
                    {savingSection ? t.saving : (editingSection ? t.editSection : t.addSection)}
                  </button>
                </div>
              </form>

              <div className={styles.sectionTableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{t.sectionNameFa}</th>
                      <th>{t.sectionCode}</th>
                      <th>{t.sectionHref}</th>
                      <th>{t.members}</th>
                      <th>{t.status}</th>
                      <th>{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections.map((sec) => (
                      <tr key={sec.id} className={!sec.is_active ? styles.rowInactive : ''}>
                        <td>
                          <span className={styles.colorDot} style={{ background: sec.color || '#1976d2' }} />
                          <strong>{sectionName(sec)}</strong>
                          {sec.is_system && <span className={styles.systemTag}>{t.systemSection}</span>}
                        </td>
                        <td><span className={styles.codeBadge}>{sec.code}</span></td>
                        <td dir="ltr">{sec.href || '—'}</td>
                        <td>{sec.members_count ?? 0}</td>
                        <td>{sec.is_active ? t.active : t.inactive}</td>
                        <td>
                          <div className={styles.rowActions}>
                            <button className={styles.iconBtn} onClick={() => openSectionEdit(sec)}>
                              <Pencil size={14} />
                            </button>
                            <button
                              className={`${styles.iconBtn} ${styles.danger}`}
                              onClick={() => handleDeleteSection(sec)}
                              disabled={sec.is_system}
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
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EmployeesPage
