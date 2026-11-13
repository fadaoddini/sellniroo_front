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
  LayoutDashboard, Calendar, KeyRound, Sparkles
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
  const [listBusy, setListBusy] = useState(false)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [userSearchError, setUserSearchError] = useState(null)
  const userSearchTimer = React.useRef(null)
  const initialListDone = React.useRef(false)

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
  const [accessEmp, setAccessEmp] = useState(null)
  const [accessIds, setAccessIds] = useState([])
  const [accessLevel, setAccessLevel] = useState(1)
  const [savingAccess, setSavingAccess] = useState(false)
  const [togglingKey, setTogglingKey] = useState('')
  const [bootstrapping, setBootstrapping] = useState(false)

  const texts = {
    fa: {
      title: 'مدیریت کارمندان',
      subtitle: 'مشاهده، ایجاد و مدیریت دسترسی کارمندان',
      search: 'جستجو با حداقل ۵ کاراکتر (نام، موبایل، کد)...',
      add: 'کارمند جدید',
      sections: 'تعریف بخش‌ها',
      sectionsTitle: 'بخش‌های دسترسی',
      sectionsHint: 'روی هر بخش کلیک کنید تا همان لحظه روشن/خاموش شود.',
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
      siteUsers: 'کاربران سایت',
      availableUsers: 'آمادهٔ کارمند شدن',
      active: 'فعال',
      inactive: 'غیرفعال',
      findByMobile: 'شماره موبایل کاربر سایت',
      findByMobileHint: '۱۱ رقم وارد کنید؛ کاربر باید قبلاً یک‌بار وارد سایت شده باشد',
      lookupBtn: 'یافتن کاربر',
      userFound: 'کاربر پیدا شد',
      alreadyEmployee: 'این شماره قبلاً کارمند شده است',
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
      findUser: 'یافتن کاربر با موبایل یا نام (حداقل ۵ کاراکتر)',
      noUser: 'کاربری یافت نشد — اول باید با همان شماره وارد سایت شده باشد',
      firstName: 'نام',
      lastName: 'نام خانوادگی',
      hireDate: 'تاریخ استخدام',
      hireDatePlaceholder: 'تاریخ استخدام را انتخاب کنید',
      isActive: 'حساب فعال باشد',
      loading: 'در حال بارگذاری...',
      saving: 'در حال ذخیره...',
      searching: 'در حال جستجو...',
      empty: 'هنوز کارمندی ثبت نشده',
      emptyHint: 'کاربر را با موبایل پیدا کنید، بخش‌ها را تیک بزنید و ذخیره کنید.',
      confirmDelete: 'آیا از حذف این کارمند اطمینان دارید؟',
      confirmDeleteSection: 'آیا از حذف این بخش اطمینان دارید؟',
      accessDenied: 'دسترسی محدود',
      needManager: 'مدیریت کارمندان فقط برای مدیر (سطح ۳ به بالا)، سوپرکاربر یا دارندگان بخش کاربران است',
      needEmployee: 'برای دسترسی به این بخش باید کارمند باشید',
      returnHome: 'بازگشت به صفحه اصلی',
      backDashboard: 'بازگشت به داشبورد',
      myProfile: 'پروفایل من',
      noPerm: 'بدون بخش — کلیک کنید',
      assignSections: 'دسترسی به بخش‌ها',
      quickAccess: 'دسترسی سریع',
      quickAccessTitle: 'تنظیم دسترسی',
      quickAccessHint: 'بخش‌های موردنیاز را روشن کنید؛ تغییر همان لحظه ذخیره می‌شود.',
      bootstrapMe: 'خودم را مدیر ثبت کن',
      bootstrapHint: 'با یک کلیک شما را با دسترسی کامل (مدیر کل) ثبت می‌کند.',
      tapToToggle: 'برای دادن/گرفتن دسترسی روی بخش کلیک کنید',
    },
    en: {
      title: 'Employee Management',
      subtitle: 'View, create and manage employee access',
      search: 'Search with at least 5 chars (name, mobile, code)...',
      add: 'New Employee',
      sections: 'Define sections',
      sectionsTitle: 'Access sections',
      sectionsHint: 'Click any section chip to toggle access instantly.',
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
      total: 'Total employees',
      siteUsers: 'Site users',
      availableUsers: 'Available to hire',
      active: 'Active',
      inactive: 'Inactive',
      findByMobile: 'Site user mobile',
      findByMobileHint: 'Enter 11 digits; user must have logged in once',
      lookupBtn: 'Find user',
      userFound: 'User found',
      alreadyEmployee: 'This mobile is already an employee',
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
      findUser: 'Find user by mobile or name (min 5 chars)',
      noUser: 'No user found — they must have logged in once first',
      firstName: 'First name',
      lastName: 'Last name',
      hireDate: 'Hire date',
      hireDatePlaceholder: 'Select hire date',
      isActive: 'Account is active',
      loading: 'Loading...',
      saving: 'Saving...',
      searching: 'Searching...',
      empty: 'No employees yet',
      emptyHint: 'Find a user by mobile, pick sections, then save.',
      confirmDelete: 'Are you sure you want to delete this employee?',
      confirmDeleteSection: 'Delete this section?',
      accessDenied: 'Access Denied',
      needManager: 'Employee management is for managers (level 3+), superusers, or users section holders',
      needEmployee: 'You must be an employee to access this section',
      returnHome: 'Return to Home',
      backDashboard: 'Back to Dashboard',
      myProfile: 'My Profile',
      noPerm: 'No section — tap to add',
      assignSections: 'Section access',
      quickAccess: 'Quick access',
      quickAccessTitle: 'Access settings',
      quickAccessHint: 'Toggle the sections you need; changes save instantly.',
      bootstrapMe: 'Register myself as manager',
      bootstrapHint: 'One click registers you as director with full access.',
      tapToToggle: 'Click a section to grant or revoke access',
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
    const firstLoad = !initialListDone.current
    try {
      if (firstLoad) setLoadingData(true)
      else setListBusy(true)
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
          : Array.isArray(body?.data)
            ? body.data
            : []
      setItems(arr)
      setTotalCount(body?.count ?? arr.length)
      initialListDone.current = true
    } catch (err) {
      setError(err.response?.data?.message || err.message || t.empty)
      setItems([])
    } finally {
      setLoadingData(false)
      setListBusy(false)
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
    const q = searchTerm.trim()
    // خالی = همه؛ کمتر از ۵ کاراکتر = هنوز جستجو نزن
    if (q.length > 0 && q.length < 5) return undefined
    const id = setTimeout(() => fetchList(searchTerm), 450)
    return () => clearTimeout(id)
  }, [searchTerm, isManager, fetchList, sectionFilter])

  const toEnDigits = (value) =>
    String(value || '')
      .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
      .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))

  const normalizeMobileInput = (value) =>
    toEnDigits(value).replace(/\D/g, '').slice(0, 11)

  const applyFoundUser = (u) => {
    if (u?.is_employee) {
      setUserSearchError(t.alreadyEmployee)
      setForm((f) => ({ ...f, user: '' }))
      return
    }
    setForm((f) => ({
      ...f,
      user: u.id,
      first_name: u.first_name || f.first_name || '',
      last_name: u.last_name || f.last_name || '',
      mobile: u.mobile || f.mobile,
      employee_code: f.employee_code || suggestEmployeeCode(u.mobile),
      department_ids: f.department_ids.length ? f.department_ids : defaultDeptIds(),
    }))
    setUserResults([u])
    setUserQuery(u.mobile || '')
    setUserSearchError(null)
  }

  const lookupByMobile = async (rawMobile) => {
    const mobile = normalizeMobileInput(rawMobile)
    if (mobile.length !== 11) {
      setUserSearchError(t.findByMobileHint)
      return
    }
    try {
      setSearchingUsers(true)
      setUserSearchError(null)
      const res = await axios.get(
        Config.endpoints.karmandan.lookupMobile(mobile),
        { headers: getAuthHeaders() }
      )
      const u = res.data?.data || res.data
      if (!u?.id) {
        setUserResults([])
        setUserSearchError(t.noUser)
        return
      }
      applyFoundUser(u)
    } catch (err) {
      setUserResults([])
      setForm((f) => ({ ...f, user: '', mobile }))
      setUserSearchError(
        err.response?.data?.message ||
          err.message ||
          t.noUser
      )
    } finally {
      setSearchingUsers(false)
    }
  }

  const handleUserSearch = (q) => {
    const mobile = normalizeMobileInput(q)
    setUserQuery(mobile)
    setUserSearchError(null)
    setForm((f) => ({ ...f, user: '', mobile }))
    if (userSearchTimer.current) clearTimeout(userSearchTimer.current)

    if (mobile.length < 11) {
      setUserResults([])
      setSearchingUsers(false)
      return
    }

    // با ۱۱ رقم، مستقیم lookup دقیق
    userSearchTimer.current = setTimeout(() => {
      lookupByMobile(mobile)
    }, 350)
  }

  const pickUser = (u) => {
    applyFoundUser(u)
  }

  const defaultDeptIds = () => {
    const prefer = ['users', 'marketing', 'sales', 'news', 'settings']
    const active = sections.filter((s) => s.is_active)
    const picked = prefer
      .map((code) => active.find((s) => s.code === code)?.id)
      .filter(Boolean)
    return picked.length ? picked : active.map((s) => s.id)
  }

  const suggestEmployeeCode = (mobileValue = '') => {
    const digits = String(mobileValue || '').replace(/\D/g, '').slice(-4) || '0000'
    return `EMP${digits}`
  }

  const openCreate = () => {
    setEditing(null)
    setForm({
      ...emptyForm,
      access_level: 3,
      employee_code: suggestEmployeeCode(),
      department_ids: defaultDeptIds(),
    })
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

  const openAccess = (emp) => {
    setAccessEmp(emp)
    setAccessIds(employeeDeptIds(emp))
    setAccessLevel(emp.access_level ?? 1)
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

  const patchEmployeeAccess = async (emp, nextIds, nextLevel = emp.access_level) => {
    const key = `${emp.id}`
    setTogglingKey(key)
    try {
      const res = await axios.patch(
        Config.endpoints.karmandan.partialUpdate(emp.id),
        {
          department_ids: nextIds,
          access_level: Number(nextLevel) || emp.access_level || 1,
        },
        { headers: getAuthHeaders() }
      )
      const updated = res.data?.data || res.data
      setItems((prev) =>
        prev.map((it) => {
          if (it.id !== emp.id) return it
          return {
            ...it,
            ...updated,
            departments:
              updated?.departments ||
              sections.filter((s) => nextIds.includes(s.id)),
            department_codes:
              updated?.department_codes ||
              sections.filter((s) => nextIds.includes(s.id)).map((s) => s.code),
            access_level: Number(nextLevel) || it.access_level,
          }
        })
      )
      if (typeof checkEmployeeStatus === 'function') checkEmployeeStatus()
      return true
    } catch (err) {
      alert(fmtErrors(err.response?.data))
      return false
    } finally {
      setTogglingKey('')
    }
  }

  const toggleInlineDept = async (emp, sectionId) => {
    const current = employeeDeptIds(emp)
    const has = current.includes(sectionId)
    const next = has ? current.filter((id) => id !== sectionId) : [...current, sectionId]
    await patchEmployeeAccess(emp, next, emp.access_level)
  }

  const saveAccessPanel = async () => {
    if (!accessEmp) return
    setSavingAccess(true)
    const ok = await patchEmployeeAccess(accessEmp, accessIds, accessLevel)
    setSavingAccess(false)
    if (ok) setAccessEmp(null)
  }

  const bootstrapMyself = async () => {
    if (!user?.id) return
    setBootstrapping(true)
    setFormError(null)
    try {
      const mobileValue = user.mobile || ''
      const payload = {
        user: user.id,
        first_name: user.first_name || 'مدیر',
        last_name: user.last_name || '',
        mobile: mobileValue,
        employee_code: suggestEmployeeCode(mobileValue),
        access_level: 4,
        is_active: true,
        department_ids: defaultDeptIds(),
      }
      await axios.post(Config.endpoints.karmandan.create(), payload, {
        headers: getAuthHeaders(),
      })
      await fetchList(searchTerm)
      await fetchStats()
      if (typeof checkEmployeeStatus === 'function') await checkEmployeeStatus()
    } catch (err) {
      alert(fmtErrors(err.response?.data))
    } finally {
      setBootstrapping(false)
    }
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
        const mobile = normalizeMobileInput(form.mobile || userQuery)
        if (!form.user && mobile.length !== 11) {
          setFormError(
            language === 'fa'
              ? 'ابتدا شماره موبایل ۱۱ رقمی کاربر سایت را وارد و پیدا کنید'
              : 'Enter and look up the site user mobile first'
          )
          setSaving(false)
          return
        }
        if (form.user) payload.user = form.user
        payload.mobile = mobile
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

  const permBadges = (emp, interactive = false) => {
    const activeSections = sections.filter((s) => s.is_active)
    const currentIds = employeeDeptIds(emp)
    if (!interactive) {
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

    if (!activeSections.length) {
      return <span className={styles.noPerm}>{t.noPerm}</span>
    }

    const busy = togglingKey === String(emp.id)
    return (
      <div className={styles.quickPerms} title={t.tapToToggle}>
        {activeSections.map((p) => {
          const on = currentIds.includes(p.id)
          return (
            <button
              key={p.id}
              type="button"
              disabled={busy}
              className={`${styles.permToggle} ${on ? styles.permToggleOn : ''}`}
              style={{
                '--accent': p.color || '#c27800',
              }}
              onClick={() => toggleInlineDept(emp, p.id)}
            >
              <span className={styles.colorDot} style={{ background: p.color || '#c27800' }} />
              {sectionName(p)}
              {on ? <CheckCircle2 size={12} /> : <Plus size={12} />}
            </button>
          )
        })}
      </div>
    )
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
    {
      id: 'site_users',
      icon: <Users size={20} />,
      value: stats?.site_users ?? 0,
      label: t.siteUsers,
      cls: styles.stTotal,
    },
    {
      id: 'available',
      icon: <Sparkles size={20} />,
      value: stats?.site_users_available ?? 0,
      label: t.availableUsers,
      cls: styles.stMark,
      color: '#c27800',
    },
    { id: 'total', icon: <Briefcase size={20} />, value: stats?.total ?? 0, label: t.total, cls: styles.stActive },
    { id: 'active', icon: <UserCheck size={20} />, value: stats?.active ?? 0, label: t.active, cls: styles.stActive },
    { id: 'inactive', icon: <UserX size={20} />, value: stats?.inactive ?? 0, label: t.inactive, cls: styles.stInactive },
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
              {listBusy && <RefreshCw size={14} className={styles.spinner} />}
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
          {searchTerm.trim().length > 0 && searchTerm.trim().length < 5 ? (
            <small className={styles.hint}>
              {language === 'fa'
                ? `برای جستجو حداقل ۵ کاراکتر لازم است (${searchTerm.trim().length}/۵)`
                : `Need at least 5 characters to search (${searchTerm.trim().length}/5)`}
            </small>
          ) : null}
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
                  <td><span className={styles.permRow}>{permBadges(emp, true)}</span></td>
                  <td>
                    <span className={`${styles.statusPill} ${emp.is_active ? styles.on : styles.off}`}>
                      {emp.is_active ? <CheckCircle2 size={12} /> : <X size={12} />}
                      {emp.is_active ? t.active : t.inactive}
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        className={`${styles.iconBtn} ${styles.accessBtn}`}
                        title={t.quickAccess}
                        onClick={() => openAccess(emp)}
                      >
                        <KeyRound size={14} />
                      </button>
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
              <strong>{t.empty}</strong>
              <span className={styles.emptyHint}>{t.emptyHint}</span>
              <div className={styles.emptyActions}>
                <button type="button" className={styles.primaryBtn} onClick={openCreate}>
                  <Plus size={16} /> {t.add}
                </button>
                {(user?.is_superuser || user?.is_staff) && !isEmployee ? (
                  <button
                    type="button"
                    className={styles.bootstrapBtn}
                    onClick={bootstrapMyself}
                    disabled={bootstrapping}
                  >
                    <Sparkles size={16} />
                    {bootstrapping ? t.saving : t.bootstrapMe}
                  </button>
                ) : null}
              </div>
              {(user?.is_superuser || user?.is_staff) && !isEmployee ? (
                <small className={styles.hint}>{t.bootstrapHint}</small>
              ) : null}
            </div>
          )}
        </div>

        {accessEmp && (
          <div className={styles.overlay} onClick={() => setAccessEmp(null)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHead}>
                <h2>
                  {t.quickAccessTitle}
                  <span className={styles.accessEmpName}>
                    {employeeName(accessEmp)}
                  </span>
                </h2>
                <button className={styles.iconBtn} onClick={() => setAccessEmp(null)}>
                  <X size={16} />
                </button>
              </div>
              <p className={styles.hint}>{t.quickAccessHint}</p>
              <div className={styles.formGroup}>
                <label>{t.level}</label>
                <select
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(Number(e.target.value))}
                >
                  {ACCESS_LEVELS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a[language] || a.fa}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.sectionLabel}>{t.assignSections}</div>
              <div className={styles.permGrid}>
                {sections.filter((s) => s.is_active).map((p) => {
                  const on = accessIds.includes(p.id)
                  return (
                    <label
                      key={p.id}
                      className={`${styles.sectionPick} ${on ? styles.sectionPickOn : ''}`}
                      style={{ '--accent': p.color || '#1976d2' }}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => {
                          setAccessIds((ids) =>
                            on ? ids.filter((x) => x !== p.id) : [...ids, p.id]
                          )
                        }}
                      />
                      <span className={styles.colorDot} style={{ background: p.color || '#1976d2' }} />
                      <span className={styles.sectionPickName}>{sectionName(p)}</span>
                      {on && <CheckCircle2 size={14} className={styles.sectionPickCheck} />}
                    </label>
                  )
                })}
              </div>
              <div className={styles.formActions}>
                <button type="button" className={styles.ghostBtn} onClick={() => setAccessEmp(null)}>
                  {t.cancel}
                </button>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  disabled={savingAccess}
                  onClick={saveAccessPanel}
                >
                  {savingAccess ? t.saving : t.save}
                </button>
              </div>
            </div>
          </div>
        )}

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
                    <label>{t.findByMobile}</label>
                    <div className={styles.mobileLookupRow}>
                      <input
                        dir="ltr"
                        value={userQuery}
                        onChange={(e) => handleUserSearch(e.target.value)}
                        placeholder="09123456789"
                        maxLength={11}
                        inputMode="numeric"
                      />
                      <button
                        type="button"
                        className={styles.lookupBtn}
                        disabled={searchingUsers || normalizeMobileInput(userQuery).length !== 11}
                        onClick={() => lookupByMobile(userQuery)}
                      >
                        {searchingUsers ? t.searching : t.lookupBtn}
                      </button>
                    </div>
                    <small className={styles.hint}>{t.findByMobileHint}</small>
                    {form.user ? (
                      <div className={styles.userFoundCard}>
                        <UserCheck size={16} />
                        <div>
                          <strong>{t.userFound}</strong>
                          <span>
                            {(userResults[0]?.display_name ||
                              `${form.first_name} ${form.last_name}`.trim() ||
                              form.mobile)}
                          </span>
                          <span dir="ltr">{form.mobile}</span>
                        </div>
                      </div>
                    ) : null}
                    {userResults.length > 1 && (
                      <div className={styles.userList}>
                        {userResults.map((u) => (
                          <button
                            type="button"
                            key={u.id}
                            className={styles.userItem}
                            onClick={() => pickUser(u)}
                          >
                            <UserCheck size={14} />
                            <span>{u.display_name || u.mobile}</span>
                            <span dir="ltr" className={styles.mobileCell}>{u.mobile}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {userSearchError && !searchingUsers && (
                      <small className={styles.hint}>{userSearchError}</small>
                    )}
                    {userQuery.length > 0 && userQuery.length < 11 && (
                      <small className={styles.hint}>
                        {language === 'fa'
                          ? `شماره کامل ۱۱ رقمی وارد کنید (${userQuery.length}/۱۱)`
                          : `Enter full 11-digit mobile (${userQuery.length}/11)`}
                      </small>
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
