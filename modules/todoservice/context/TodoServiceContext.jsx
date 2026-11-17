'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useAuth } from '@/contexts/AuthContext'
import repairsService from '@/components/Repairs/services/repairsService'

const TodoServiceContext = createContext(null)

export const useTodoService = () => {
  const ctx = useContext(TodoServiceContext)
  if (!ctx) throw new Error('useTodoService must be used within TodoServiceProvider')
  return ctx
}

export const BOARD_COLUMNS = [
  {
    id: 'inbox',
    title: 'ورودی',
    statuses: ['draft', 'awaiting_deposit', 'booked'],
  },
  {
    id: 'field',
    title: 'اعزام',
    statuses: ['assigned', 'visited'],
  },
  {
    id: 'work',
    title: 'در حال تعمیر',
    statuses: ['awaiting_mid', 'mid_paid', 'in_progress', 'awaiting_final'],
  },
  {
    id: 'done',
    title: 'پایان',
    statuses: ['completed', 'canceled'],
  },
]

/** میزکار سرویسکار: اعزام + در حال تعمیر */
export const TECH_BOARD_COLUMNS = [
  {
    id: 'inbox',
    title: 'ورودی',
    statuses: ['draft', 'awaiting_deposit', 'booked'],
  },
  {
    id: 'field',
    title: 'اعزام',
    statuses: ['assigned', 'visited'],
  },
  {
    id: 'work',
    title: 'در حال تعمیر',
    statuses: ['awaiting_mid', 'mid_paid', 'in_progress', 'awaiting_final'],
  },
  {
    id: 'done',
    title: 'پایان',
    statuses: ['completed', 'canceled'],
  },
]

/** آیا پرونده برای کار سرویسکار در کارگاه آماده است؟ */
export function isReadyForTechWorkshop(job) {
  if (!job) return false
  const st = job.status
  if (['completed', 'canceled'].includes(st)) return true
  if (['draft', 'awaiting_deposit'].includes(st)) {
    // فقط اگر مدیر بیعانه را موکول کرده یا پرداخت شده
    return !!(job.deposit_paid || job.deposit_deferred)
  }
  // assigned / visited / … : مدیر سرویسکار را مشخص کرده
  if (st === 'assigned' || st === 'visited' || st === 'booked') {
    const hasTech = !!(job.technician || job.technician_name)
    const payOk =
      !!job.deposit_paid ||
      !!job.deposit_deferred ||
      !Number(job.deposit_amount || 0)
    return hasTech && payOk
  }
  return [
    'awaiting_mid',
    'mid_paid',
    'in_progress',
    'awaiting_final',
  ].includes(st)
}

const statusToColumn = (status, columns = BOARD_COLUMNS) => {
  const col = columns.find((c) => c.statuses.includes(status))
  return col?.id || 'inbox'
}

/** پاسخ API گاهی آرایه است، گاهی { jobs|results|items: [...] } */
const asList = (data) => {
  if (Array.isArray(data)) return data
  if (!data || typeof data !== 'object') return []
  if (Array.isArray(data.jobs)) return data.jobs
  if (Array.isArray(data.results)) return data.results
  if (Array.isArray(data.items)) return data.items
  if (Array.isArray(data.payments)) return data.payments
  if (Array.isArray(data.proposals)) return data.proposals
  return []
}

const emptyTech = {
  name: '',
  mobile: '',
  city: '',
  specialty: '',
  is_active: true,
  sort_order: 0,
  user_id: null,
}
const emptyRate = {
  title: '',
  code: '',
  unit: 'fixed',
  price: 0,
  description: '',
  is_active: true,
}
const emptyPart = {
  name: '',
  sku: '',
  unit_price: 0,
  description: '',
  is_active: true,
}

export const TodoServiceProvider = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading, canManageEmployees } = useAuth()

  const [role, setRole] = useState('customer')
  const [availableRoles, setAvailableRoles] = useState(['customer'])
  const [view, setView] = useState('board')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)

  const [technicians, setTechnicians] = useState([])
  const [rates, setRates] = useState([])
  const [parts, setParts] = useState([])
  const [settings, setSettings] = useState(null)
  const [payments, setPayments] = useState([])
  const [proposals, setProposals] = useState([])
  const [reminders, setReminders] = useState(null)
  const [reminderDays, setReminderDaysState] = useState(30)
  const [accounting, setAccounting] = useState(null)
  const [techProfile, setTechProfile] = useState(null)
  const [myJobs, setMyJobs] = useState([])
  const [dueReminders, setDueReminders] = useState([])
  const [bundle, setBundle] = useState(null)
  const [payFilter, setPayFilter] = useState('pending')
  const [propFilter, setPropFilter] = useState('pending')
  const payFilterRef = useRef(payFilter)
  const propFilterRef = useRef(propFilter)
  const reminderDaysRef = useRef(reminderDays)
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    payFilterRef.current = payFilter
  }, [payFilter])
  useEffect(() => {
    propFilterRef.current = propFilter
  }, [propFilter])
  useEffect(() => {
    reminderDaysRef.current = reminderDays
  }, [reminderDays])

  const [report, setReport] = useState({
    tech_report: '',
    labor_minutes: 60,
    labor_rate_ids: [],
    part_ids: [],
  })
  const [payProposal, setPayProposal] = useState({
    title: '',
    amount: '',
    description: '',
  })
  const [shopProposal, setShopProposal] = useState({
    q: '',
    product: null,
    quantity: 1,
    description: '',
  })
  const [shopResults, setShopResults] = useState([])

  const [techForm, setTechForm] = useState(emptyTech)
  const [editingTech, setEditingTech] = useState(null)
  const [rateForm, setRateForm] = useState(emptyRate)
  const [editingRate, setEditingRate] = useState(null)
  const [partForm, setPartForm] = useState(emptyPart)
  const [editingPart, setEditingPart] = useState(null)

  const isAdmin = useMemo(
    () => !!(user?.is_superuser || user?.is_staff || canManageEmployees),
    [user, canManageEmployees],
  )

  const flash = useCallback((ok, text) => {
    if (ok) {
      setMsg(text)
      setError(null)
    } else {
      setError(text)
      setMsg(null)
    }
  }, [])

  const detectRoles = useCallback(async () => {
    const roles = []
    // مدیر/سوپریوزر هر سه نما را دارد تا با تب نقش واقعی را ببیند
    if (isAdmin) {
      roles.push('admin', 'tech', 'customer')
    }
    const techRes = await repairsService.techMe()
    if (techRes.success) {
      if (!roles.includes('tech')) roles.push('tech')
      setTechProfile(techRes.data)
    } else if (!isAdmin) {
      setTechProfile(null)
    } else {
      // تب سرویسکار برای مدیر باز است؛ اگر پروفایل وصل نباشد refreshTech پیام می‌دهد
      setTechProfile(null)
    }
    if (!roles.includes('customer')) roles.push('customer')
    const prefer = roles.includes('admin')
      ? 'admin'
      : roles.includes('tech')
        ? 'tech'
        : 'customer'
    setAvailableRoles(roles)
    setRole((r) => (roles.includes(r) ? r : prefer))
    return { roles, prefer, techRes }
  }, [isAdmin])

  /** تعویض تب نقش — فقط نقش فعال معیار UI/API است، نه is_superuser */
  const switchRole = useCallback((next) => {
    setSelectedJob(null)
    setStatusFilter('all')
    setSearch('')
    setError(null)
    setMsg(null)
    setView('board')
    setRole(next)
  }, [])

  const loadCatalog = useCallback(async () => {
    const [t, r, p] = await Promise.all([
      repairsService.technicians(),
      repairsService.laborRates(),
      repairsService.parts(),
    ])
    if (t.success) setTechnicians(asList(t.data))
    if (r.success) setRates(asList(r.data))
    if (p.success) setParts(asList(p.data))
  }, [])

  const refreshAdmin = useCallback(async () => {
    const [b, j, rem, a, s, pay, props] = await Promise.all([
      repairsService.bundle(),
      repairsService.jobs(),
      repairsService.reminders({ days: reminderDaysRef.current || 30 }),
      repairsService.accounting(),
      repairsService.settings(),
      repairsService.payments({
        status: payFilterRef.current || undefined,
      }),
      repairsService.proposals({
        status: propFilterRef.current || undefined,
      }),
    ])
    if (b.success) setBundle(b.data)
    if (j.success) setJobs(asList(j.data))
    else {
      setJobs([])
      if (!j.success) throw new Error(j.error || 'خطا در بارگذاری سفارش‌ها')
    }
    if (rem.success) setReminders(rem.data)
    if (a.success) setAccounting(a.data)
    else setAccounting(null)
    if (s.success) setSettings(s.data)
    if (pay.success) setPayments(asList(pay.data))
    if (props.success) setProposals(asList(props.data))
    await loadCatalog()
  }, [loadCatalog])

  const setReminderDays = useCallback(
    async (days) => {
      const next = Number(days) || 30
      setReminderDaysState(next)
      const rem = await repairsService.reminders({ days: next })
      if (rem.success) setReminders(rem.data)
      else flash(false, rem.error || 'خطا در بارگذاری یادآورها')
    },
    [flash],
  )

  const refreshTech = useCallback(async () => {
    const meRes = await repairsService.techMe()
    if (!meRes.success) {
      setTechProfile(null)
      setJobs([])
      throw new Error(meRes.error || 'دسترسی سرویسکار نیست')
    }
    setTechProfile(meRes.data)
    let nextRates = asList(meRes.data?.catalog?.labor_rates)
    let nextParts = asList(meRes.data?.catalog?.parts)
    // اگر کاتالوگ سرویسکار خالی بود و مدیر هستیم، از API مدیریت بخوان
    if ((!nextRates.length || !nextParts.length) && isAdmin) {
      const [r, p] = await Promise.all([
        repairsService.laborRates(),
        repairsService.parts(),
      ])
      if (r.success && !nextRates.length) nextRates = asList(r.data)
      if (p.success && !nextParts.length) nextParts = asList(p.data)
    }
    setRates(nextRates)
    setParts(nextParts)
    const jobsRes = await repairsService.techJobs()
    if (jobsRes.success) setJobs(asList(jobsRes.data))
    else {
      setJobs([])
      throw new Error(jobsRes.error || 'خطا در بارگذاری کارها')
    }
  }, [isAdmin])

  const refreshCustomer = useCallback(async () => {
    const myRes = await repairsService.my()
    if (myRes.success) {
      const list = asList(myRes.data)
      setMyJobs(list)
      setJobs(list)
      setDueReminders(
        Array.isArray(myRes.data?.due_reminders) ? myRes.data.due_reminders : [],
      )
    } else {
      setMyJobs([])
      setJobs([])
      setDueReminders([])
      if (myRes.httpStatus !== 401) {
        throw new Error(myRes.error || 'خطا در بارگذاری سفارش‌های من')
      }
    }
  }, [])

  const prevRoleRef = useRef(role)
  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    const roleChanged = prevRoleRef.current !== role
    prevRoleRef.current = role
    // فقط بار اول / تغییر نقش: لودینگ تمام‌صفحه — تا پنل عملیات آنماونت نشود
    const soft = hasLoadedRef.current && !roleChanged
    if (!soft) setLoading(true)
    setError(null)
    try {
      if (role === 'admin') await refreshAdmin()
      else if (role === 'tech') await refreshTech()
      else await refreshCustomer()
      hasLoadedRef.current = true
    } catch (e) {
      setError(e?.message || 'خطا در بروزرسانی')
    } finally {
      if (!soft) setLoading(false)
    }
  }, [
    isAuthenticated,
    refreshAdmin,
    refreshCustomer,
    refreshTech,
    role,
  ])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    detectRoles()
  }, [authLoading, detectRoles, isAdmin, isAuthenticated])

  useEffect(() => {
    if (authLoading || !isAuthenticated) return
    refresh()
  }, [authLoading, isAuthenticated, role, refresh])

  const applyJobToForms = useCallback((job) => {
    setReport({
      tech_report: job.tech_report || '',
      labor_minutes: job.labor_minutes || 60,
      labor_rate_ids: (job.labor_lines || [])
        .map((l) => l.labor_rate)
        .filter(Boolean),
      part_ids: (job.part_lines || []).map((p) => p.part).filter(Boolean),
    })
    setPayProposal({ title: '', amount: '', description: '' })
    setShopProposal({ q: '', product: null, quantity: 1, description: '' })
    setShopResults([])
  }, [])

  const respondServiceReminder = useCallback(
    async (deviceId, accept, note = '') => {
      setBusy(true)
      const res = await repairsService.respondServiceReminder(deviceId, {
        action: accept ? 'accept' : 'decline',
        note: note || undefined,
      })
      setBusy(false)
      if (!res.success) {
        flash(false, res.error)
        return { success: false, error: res.error }
      }
      flash(
        true,
        res.message ||
          (accept ? 'درخواست سرویس ثبت شد' : 'یادآور رد شد'),
      )
      if (Array.isArray(res.data?.due_reminders)) {
        setDueReminders(res.data.due_reminders)
      }
      await refreshCustomer()
      if (accept && res.data?.job) {
        setSelectedJob(res.data.job)
        applyJobToForms(res.data.job)
      }
      return { success: true, data: res.data, message: res.message }
    },
    [applyJobToForms, flash, refreshCustomer],
  )

  const resolveJobId = useCallback(
    (idOrToken) => {
      if (idOrToken == null || idOrToken === '') return null
      if (/^\d+$/.test(String(idOrToken))) return Number(idOrToken)
      const pools = [...asList(jobs), ...asList(myJobs)]
      const found = pools.find(
        (j) =>
          String(j.id) === String(idOrToken) ||
          j.tracking_token === idOrToken,
      )
      return found?.id || null
    },
    [jobs, myJobs],
  )

  const openJob = useCallback(
    async (idOrToken) => {
      if (!idOrToken) return
      setBusy(true)
      let res
      const id = resolveJobId(idOrToken) || idOrToken
      // فقط تب فعال معیار است (حتی برای سوپریوزر)
      if (role === 'tech') {
        res = await repairsService.techJob(id)
      } else if (role === 'admin') {
        res = await repairsService.job(id)
        if (res.success && (!technicians || !technicians.length)) {
          loadCatalog()
        }
      } else {
        const job = asList(myJobs).find(
          (j) =>
            String(j.id) === String(idOrToken) ||
            j.tracking_token === idOrToken,
        )
        const token = job?.tracking_token || idOrToken
        res = await repairsService.track(token)
      }
      setBusy(false)
      if (!res.success) return flash(false, res.error)
      setSelectedJob(res.data)
      applyJobToForms(res.data)
    },
    [
      applyJobToForms,
      flash,
      loadCatalog,
      myJobs,
      resolveJobId,
      role,
      technicians,
    ],
  )

  const closeJob = useCallback(() => setSelectedJob(null), [])

  const intakeAssign = useCallback(
    async ({ technicianId, deferDeposit = false, note = '' } = {}) => {
      if (!selectedJob) return
      setBusy(true)
      const res = await repairsService.updateJob(selectedJob.id, {
        action: 'intake_assign',
        technician_id: technicianId,
        defer_deposit: !!deferDeposit,
        note: note || '',
      })
      setBusy(false)
      if (!res.success) return flash(false, res.error)
      flash(true, res.message || 'سرویسکار تخصیص یافت')
      setSelectedJob(null)
      refresh()
    },
    [flash, refresh, selectedJob],
  )

  const assignTech = useCallback(
    async (techId) => {
      if (!selectedJob) return
      setBusy(true)
      const res = await repairsService.updateJob(selectedJob.id, {
        technician_id: techId,
      })
      setBusy(false)
      if (!res.success) return flash(false, res.error)
      setSelectedJob(res.data)
      applyJobToForms(res.data)
      flash(true, 'سرویسکار تخصیص یافت')
      refresh()
    },
    [applyJobToForms, flash, refresh, selectedJob],
  )

  const buildReportPayload = useCallback(
    (job, locked) => {
      const payload = {
        tech_report: report.tech_report,
        submit_for_payment: !locked,
      }
      if (!locked) {
        payload.labor_minutes = report.labor_minutes
        payload.labor_lines = (report.labor_rate_ids || [])
          .map((id) => {
            const rate = rates.find((r) => String(r.id) === String(id))
            if (!rate) return null
            return {
              labor_rate: rate.id,
              title: rate.title,
              quantity: 1,
              unit_price: rate.price,
            }
          })
          .filter(Boolean)
        payload.part_lines = (report.part_ids || [])
          .map((id) => {
            const part = parts.find((p) => String(p.id) === String(id))
            if (!part) return null
            return {
              part: part.id,
              title: part.name,
              quantity: 1,
              unit_price: part.unit_price,
            }
          })
          .filter(Boolean)
      }
      return payload
    },
    [parts, rates, report],
  )

  const submitReport = useCallback(async () => {
    if (!selectedJob) return
    const locked = !!selectedJob.lines_locked
    const payload = buildReportPayload(selectedJob, locked)
    if (!locked && selectedJob.work_started_at) {
      const raw = String(selectedJob.work_started_at).trim()
      let start = NaN
      if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(raw)) {
        start = new Date(raw).getTime()
      } else {
        const m = raw.match(
          /(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?/,
        )
        if (m) {
          start = new Date(
            `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6] || '00'}+03:30`,
          ).getTime()
        }
      }
      if (!Number.isNaN(start)) {
        const mins = Math.max(1, Math.floor((Date.now() - start) / 60000))
        payload.labor_minutes = Math.max(
          Number(payload.labor_minutes || 0),
          mins,
        )
      }
    }
    setBusy(true)
    const res =
      role === 'tech'
        ? await repairsService.techSubmitReport(selectedJob.id, payload)
        : await repairsService.submitReport(selectedJob.id, payload)
    setBusy(false)
    if (!res.success) return flash(false, res.error)
    setSelectedJob(res.data)
    applyJobToForms(res.data)
    flash(true, locked ? 'یادداشت ذخیره شد' : 'گزارش ثبت شد')
    refresh()
  }, [applyJobToForms, buildReportPayload, flash, refresh, role, selectedJob])

  const markArrived = useCallback(async () => {
    if (!selectedJob) return
    setBusy(true)
    const res = await repairsService.techArrive(selectedJob.id)
    setBusy(false)
    if (!res.success) return flash(false, res.error)
    setSelectedJob(res.data)
    applyJobToForms(res.data)
    flash(true, res.message || 'رسیدن به محل ثبت شد')
    refresh()
  }, [applyJobToForms, flash, refresh, selectedJob])

  const startWork = useCallback(async () => {
    if (!selectedJob) return
    setBusy(true)
    const res = await repairsService.techStartWork(selectedJob.id)
    setBusy(false)
    if (!res.success) return flash(false, res.error)
    setSelectedJob(res.data)
    applyJobToForms(res.data)
    flash(true, res.message || 'شروع کار ثبت شد')
    refresh()
  }, [applyJobToForms, flash, refresh, selectedJob])

  const finishWork = useCallback(async () => {
    if (!selectedJob) return
    setBusy(true)
    const res = await repairsService.techFinishWork(selectedJob.id)
    setBusy(false)
    if (!res.success) return flash(false, res.error)
    setSelectedJob(res.data)
    applyJobToForms(res.data)
    flash(true, res.message || 'پایان کار اعلام شد')
    refresh()
  }, [applyJobToForms, flash, refresh, selectedJob])

  const rateTechnician = useCallback(
    async (payload) => {
      if (!selectedJob) return
      setBusy(true)
      const res = await repairsService.rateTechnician(selectedJob.id, payload)
      setBusy(false)
      if (!res.success) return flash(false, res.error)
      setSelectedJob(res.data)
      applyJobToForms(res.data)
      flash(true, res.message || 'امتیاز ثبت شد')
      refresh()
    },
    [applyJobToForms, flash, refresh, selectedJob],
  )

  const adjustPayable = useCallback(
    async ({ payableAmount, note = '' } = {}) => {
      if (!selectedJob) return
      setBusy(true)
      const res = await repairsService.adjustPayable(
        selectedJob.id,
        payableAmount,
        note,
      )
      setBusy(false)
      if (!res.success) return flash(false, res.error)
      flash(true, res.message || 'مبلغ قابل پرداخت به‌روز شد')
      setSelectedJob(null)
      await refresh()
    },
    [flash, refresh, selectedJob],
  )

  const approveComplete = useCallback(
    async ({
      deferSettlement = false,
      note = '',
      payableAmount = undefined,
    } = {}) => {
      if (!selectedJob) return
      setBusy(true)
      const payload = {
        defer_settlement: !!deferSettlement,
        note: note || undefined,
      }
      if (payableAmount !== undefined && payableAmount !== '') {
        payload.payable_amount = payableAmount
      }
      const res = await repairsService.approveComplete(selectedJob.id, payload)
      setBusy(false)
      if (!res.success) return flash(false, res.error)
      flash(true, res.message || 'تکمیل تایید شد')
      // پرونده تکمیل‌شده بماند تا دیالوگ «پایان» وسط صفحه باز شود
      setSelectedJob(res.data)
      applyJobToForms(res.data)
      await refresh()
    },
    [applyJobToForms, flash, refresh, selectedJob],
  )

  const archiveJob = useCallback(
    async ({ warranty_until, note = '', clear_warranty = false } = {}) => {
      if (!selectedJob) return
      setBusy(true)
      const payload = {
        note: note || undefined,
      }
      if (clear_warranty) {
        payload.clear_warranty = true
      } else if (warranty_until) {
        payload.warranty_until = warranty_until
      }
      const res = await repairsService.archiveJob(selectedJob.id, payload)
      setBusy(false)
      if (!res.success) return flash(false, res.error)
      flash(true, res.message || 'آرشیو شد')
      setSelectedJob(null)
      await refresh()
    },
    [flash, refresh, selectedJob],
  )

  const unarchiveJob = useCallback(async () => {
    if (!selectedJob) return
    setBusy(true)
    const res = await repairsService.unarchiveJob(selectedJob.id)
    setBusy(false)
    if (!res.success) return flash(false, res.error)
    flash(true, res.message || 'از آرشیو خارج شد')
    setSelectedJob(res.data)
    applyJobToForms(res.data)
    await refresh()
  }, [applyJobToForms, flash, refresh, selectedJob])

  const setWarranty = useCallback(
    async (warrantyUntil, clear = false) => {
      if (!selectedJob) return { success: false }
      setBusy(true)
      const res = await repairsService.setWarranty(
        selectedJob.id,
        warrantyUntil,
        clear,
      )
      setBusy(false)
      if (!res.success) {
        flash(false, res.error)
        return { success: false, error: res.error }
      }
      setSelectedJob(res.data)
      applyJobToForms(res.data)
      await refresh()
      return {
        success: true,
        data: res.data,
        message: res.message || 'گارانتی به‌روز شد',
        cleared: !!clear || !warrantyUntil,
      }
    },
    [applyJobToForms, flash, refresh, selectedJob],
  )

  const setServiceReminder = useCallback(
    async (payload = {}) => {
      if (!selectedJob) return { success: false }
      setBusy(true)
      const res = await repairsService.setServiceReminder(
        selectedJob.id,
        payload,
      )
      setBusy(false)
      if (!res.success) {
        flash(false, res.error)
        return { success: false, error: res.error }
      }
      setSelectedJob(res.data)
      applyJobToForms(res.data)
      await refresh()
      return {
        success: true,
        data: res.data,
        message: res.message || 'یادآور سرویس به‌روز شد',
        cleared: !!payload.clear_reminder,
      }
    },
    [applyJobToForms, flash, refresh, selectedJob],
  )

  const searchShop = useCallback(async () => {
    const q = shopProposal.q || ''
    const fn =
      role === 'tech'
        ? repairsService.techSearchShopProducts
        : repairsService.searchShopProducts
    const res = await fn(q)
    if (!res.success) return flash(false, res.error)
    setShopResults(asList(res.data))
  }, [flash, role, shopProposal.q])

  const createPayProposal = useCallback(async () => {
    if (!selectedJob) return
    setBusy(true)
    const api =
      role === 'tech'
        ? (id, p) => repairsService.techCreateProposal(id, p)
        : (id, p) => repairsService.createProposal(id, p)
    const res = await api(selectedJob.id, {
      proposal_type: 'payment',
      title: payProposal.title || 'پرداخت هزینه تعمیر',
      amount: Number(payProposal.amount || 0),
      description: payProposal.description || '',
    })
    setBusy(false)
    if (!res.success) return flash(false, res.error)
    setPayProposal({ title: '', amount: '', description: '' })
    flash(true, 'پیشنهاد پرداخت ارسال شد')
    openJob(selectedJob.id)
    refresh()
  }, [flash, openJob, payProposal, refresh, role, selectedJob])

  const createShopProposal = useCallback(async () => {
    if (!selectedJob || !shopProposal.product) return
    setBusy(true)
    const api =
      role === 'tech'
        ? (id, p) => repairsService.techCreateProposal(id, p)
        : (id, p) => repairsService.createProposal(id, p)
    const res = await api(selectedJob.id, {
      proposal_type: 'shop_product',
      shop_product_id: shopProposal.product.id,
      quantity: Number(shopProposal.quantity || 1),
      title: `خرید ${shopProposal.product.title}`,
      description: shopProposal.description || '',
    })
    setBusy(false)
    if (!res.success) return flash(false, res.error)
    setShopProposal({ q: '', product: null, quantity: 1, description: '' })
    setShopResults([])
    flash(true, 'پیشنهاد خرید ارسال شد')
    openJob(selectedJob.id)
    refresh()
  }, [flash, openJob, refresh, role, selectedJob, shopProposal])

  const cancelProposal = useCallback(
    async (id) => {
      setBusy(true)
      const res = await repairsService.updateProposal(id, { action: 'cancel' })
      setBusy(false)
      if (!res.success) return flash(false, res.error)
      flash(true, 'پیشنهاد لغو شد')
      if (selectedJob) openJob(selectedJob.id)
      refresh()
    },
    [flash, openJob, refresh, selectedJob],
  )

  const confirmPayment = useCallback(
    async (paymentId, action = 'approve') => {
      setBusy(true)
      const res = await repairsService.confirmPayment(paymentId, { action })
      setBusy(false)
      if (!res.success) return flash(false, res.error)
      flash(true, action === 'reject' ? 'پرداخت رد شد' : 'پرداخت تایید شد')
      if (selectedJob) openJob(selectedJob.id)
      refresh()
    },
    [flash, openJob, refresh, selectedJob],
  )

  const updateSettings = useCallback(
    async (payload) => {
      setBusy(true)
      const res = await repairsService.updateSettings(payload ?? settings)
      setBusy(false)
      if (!res.success) return flash(false, res.error)
      setSettings(res.data)
      flash(true, 'تنظیمات ذخیره شد')
    },
    [flash, settings],
  )

  const saveTechnician = useCallback(async () => {
    setBusy(true)
    const payload = { ...techForm, sort_order: Number(techForm.sort_order || 0) }
    const res = editingTech
      ? await repairsService.updateTechnician(editingTech, payload)
      : await repairsService.createTechnician(payload)
    setBusy(false)
    if (!res.success) return flash(false, res.error)
    setTechForm(emptyTech)
    setEditingTech(null)
    flash(true, 'سرویسکار ذخیره شد')
    loadCatalog()
    if (role === 'admin') refreshAdmin()
  }, [editingTech, flash, loadCatalog, refreshAdmin, role, techForm])

  const deleteTechnician = useCallback(
    async (id) => {
      setBusy(true)
      const res = await repairsService.deleteTechnician(id)
      setBusy(false)
      if (!res.success) return flash(false, res.error)
      flash(true, 'حذف شد')
      loadCatalog()
    },
    [flash, loadCatalog],
  )

  const linkTechnicianByMobile = useCallback(
    async (id) => {
      setBusy(true)
      const res = await repairsService.linkTechnicianByMobile(id)
      setBusy(false)
      if (!res.success) return flash(false, res.error)
      flash(true, res.message || 'حساب با موبایل وصل شد')
      loadCatalog()
    },
    [flash, loadCatalog],
  )

  const saveLaborRate = useCallback(async () => {
    setBusy(true)
    const payload = { ...rateForm, price: Number(rateForm.price || 0) }
    const res = editingRate
      ? await repairsService.updateLaborRate(editingRate, payload)
      : await repairsService.createLaborRate(payload)
    setBusy(false)
    if (!res.success) return flash(false, res.error)
    setRateForm(emptyRate)
    setEditingRate(null)
    flash(true, 'اجرت ذخیره شد')
    loadCatalog()
  }, [editingRate, flash, loadCatalog, rateForm])

  const deleteLaborRate = useCallback(
    async (id) => {
      setBusy(true)
      const res = await repairsService.deleteLaborRate(id)
      setBusy(false)
      if (!res.success) return flash(false, res.error)
      flash(true, 'حذف شد')
      loadCatalog()
    },
    [flash, loadCatalog],
  )

  const savePart = useCallback(async () => {
    setBusy(true)
    const payload = { ...partForm, unit_price: Number(partForm.unit_price || 0) }
    const res = editingPart
      ? await repairsService.updatePart(editingPart, payload)
      : await repairsService.createPart(payload)
    setBusy(false)
    if (!res.success) return flash(false, res.error)
    setPartForm(emptyPart)
    setEditingPart(null)
    flash(true, 'قطعه ذخیره شد')
    loadCatalog()
  }, [editingPart, flash, loadCatalog, partForm])

  const deletePart = useCallback(
    async (id) => {
      setBusy(true)
      const res = await repairsService.deletePart(id)
      setBusy(false)
      if (!res.success) return flash(false, res.error)
      flash(true, 'حذف شد')
      loadCatalog()
    },
    [flash, loadCatalog],
  )

  const customerRequest = useCallback(
    async (payload) => {
      setBusy(true)
      const res = await repairsService.request(payload)
      setBusy(false)
      if (!res.success) return flash(false, res.error)
      flash(true, res.message || 'درخواست ثبت شد')
      refresh()
      return res.data
    },
    [flash, refresh],
  )

  const customerLookup = useCallback(async (params) => {
    return repairsService.lookup(params)
  }, [])

  const customerPayGateway = useCallback(async (token, stage, extra) => {
    return repairsService.payGateway(token, stage, extra)
  }, [])

  const customerPayWallet = useCallback(async (token, stage, extra) => {
    return repairsService.payWallet(token, stage, extra)
  }, [])

  const customerPayCard = useCallback(async (token, stage, formData) => {
    return repairsService.payCard(token, stage, formData)
  }, [])

  const customerProposalAction = useCallback(async (token, id, payload) => {
    return repairsService.proposalAction(token, id, payload)
  }, [])

  const reloadPayments = useCallback(
    async (status = payFilter) => {
      setPayFilter(status)
      const res = await repairsService.payments({ status: status || undefined })
      if (res.success) setPayments(asList(res.data))
    },
    [payFilter],
  )

  const reloadProposals = useCallback(
    async (status = propFilter) => {
      setPropFilter(status)
      const res = await repairsService.proposals({ status: status || undefined })
      if (res.success) setProposals(asList(res.data))
    },
    [propFilter],
  )

  const boardColumns = useMemo(
    () => (role === 'tech' ? TECH_BOARD_COLUMNS : BOARD_COLUMNS),
    [role],
  )

  const filteredJobs = useMemo(() => {
    let list = asList(jobs).filter((j) => !j.is_archived && !j.archived_at)
    if (role === 'tech') {
      list = list.filter((j) => isReadyForTechWorkshop(j))
    }
    if (statusFilter !== 'all') {
      const col = boardColumns.find((c) => c.id === statusFilter)
      if (col) list = list.filter((j) => col.statuses.includes(j.status))
      else list = list.filter((j) => j.status === statusFilter)
    }
    const q = search.trim().toLowerCase()
    if (!q) return list
    return list.filter((j) => {
      const hay = [
        j.code,
        j.customer_name,
        j.customer_mobile,
        j.city,
        j.device_title,
        j.status_label,
        j.technician_name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [boardColumns, jobs, role, search, statusFilter])

  const stats = useMemo(() => {
    const list = asList(jobs).filter((j) => {
      if (j.is_archived || j.archived_at) return false
      return role === 'tech' ? isReadyForTechWorkshop(j) : true
    })
    const byCol = boardColumns.reduce((acc, col) => {
      acc[col.id] = list.filter((j) => col.statuses.includes(j.status)).length
      return acc
    }, {})
    const s = accounting?.summary || {}
    return {
      total: list.length,
      inbox: byCol.inbox || 0,
      field: byCol.field || 0,
      work: byCol.work || 0,
      done: byCol.done || 0,
      open: list.filter((j) => !['completed', 'canceled'].includes(j.status))
        .length,
      pendingReceipts: s.pending_receipts,
      pendingProposals: s.pending_proposals,
      revenue: s.revenue,
    }
  }, [accounting, boardColumns, jobs, role])

  const jobsByColumn = useMemo(() => {
    const map = {}
    const list = asList(filteredJobs)
    boardColumns.forEach((col) => {
      map[col.id] = list.filter((j) => col.statuses.includes(j.status))
    })
    return map
  }, [boardColumns, filteredJobs])

  const value = {
    role,
    setRole: switchRole,
    switchRole,
    availableRoles,
    isAdmin,
    /** نقش فعال مدیر است؟ (نه فقط دسترسی سوپریوزر) */
    isAdminRole: role === 'admin',
    view,
    setView,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    jobs,
    filteredJobs,
    jobsByColumn,
    selectedJob,
    loading,
    error,
    msg,
    busy,
    technicians,
    rates,
    parts,
    settings,
    setSettings,
    payments,
    proposals,
    reminders,
    reminderDays,
    setReminderDays,
    accounting,
    techProfile,
    myJobs,
    dueReminders,
    respondServiceReminder,
    bundle,
    payFilter,
    propFilter,
    report,
    setReport,
    payProposal,
    setPayProposal,
    shopProposal,
    setShopProposal,
    shopResults,
    setShopResults,
    techForm,
    setTechForm,
    editingTech,
    setEditingTech,
    rateForm,
    setRateForm,
    editingRate,
    setEditingRate,
    partForm,
    setPartForm,
    editingPart,
    setEditingPart,
    stats,
    columns: boardColumns,
    statusToColumn,
    refresh,
    openJob,
    closeJob,
    intakeAssign,
    assignTech,
    submitReport,
    markArrived,
    startWork,
    finishWork,
    adjustPayable,
    rateTechnician,
    approveComplete,
    archiveJob,
    unarchiveJob,
    setWarranty,
    setServiceReminder,
    searchShop,
    createPayProposal,
    createShopProposal,
    cancelProposal,
    confirmPayment,
    updateSettings,
    saveTechnician,
    deleteTechnician,
    linkTechnicianByMobile,
    saveLaborRate,
    deleteLaborRate,
    savePart,
    deletePart,
    customerRequest,
    customerLookup,
    customerPayGateway,
    customerPayWallet,
    customerPayCard,
    customerProposalAction,
    reloadPayments,
    reloadProposals,
    flash,
    authLoading,
    isAuthenticated,
  }

  return (
    <TodoServiceContext.Provider value={value}>{children}</TodoServiceContext.Provider>
  )
}