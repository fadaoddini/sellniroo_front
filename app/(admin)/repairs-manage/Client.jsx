'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  ExternalLink,
  LayoutDashboard,
  Plus,
  RefreshCw,
  Settings2,
  ShoppingBag,
  UserCog,
  Users,
  Wrench,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ModuleGate from '@/components/modules/ModuleGate'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import FilterDialog, {
  FilterSelectTrigger,
} from '@/components/AllBoxItem/components/FilterDialog/FilterDialog'
import repairsService from '@/components/Repairs/services/repairsService'
import JobDetailPanel from './JobDetailPanel'
import styles from './RepairsManage.module.css'

function money(n) {
  return Number(n || 0).toLocaleString('fa-IR')
}

const TABS = [
  { id: 'overview', label: 'خانه', group: 'work', hint: 'کارهای امروز' },
  { id: 'payments', label: 'تایید رسید', group: 'work', hint: 'پول واریزی مشتری' },
  { id: 'jobs', label: 'سفارش‌ها', group: 'work', hint: 'همه پرونده‌ها' },
  { id: 'job', label: 'پرونده باز', group: 'work', hint: 'جزئیات یک سفارش' },
  { id: 'proposals', label: 'پیشنهادها', group: 'work', hint: 'درخواست خرید/پرداخت' },
  { id: 'technicians', label: 'سرویسکارها', group: 'setup', hint: 'اتصال حساب' },
  { id: 'rates', label: 'اجرت‌ها', group: 'setup', hint: 'قیمت خدمات' },
  { id: 'parts', label: 'قطعات', group: 'setup', hint: 'کاتالوگ قطعه' },
  { id: 'reminders', label: 'یادآورها', group: 'setup', hint: 'سرویس دوره‌ای' },
  { id: 'settings', label: 'تنظیمات', group: 'setup', hint: 'کارت و شرکت' },
]

const emptyTech = {
  name: '',
  mobile: '',
  city: '',
  specialty: '',
  is_active: true,
  sort_order: 0,
  user_id: null,
  user_label: '',
}
const emptyRate = {
  title: '',
  code: '',
  unit: 'fixed',
  price: 0,
  description: '',
  is_active: true,
}
const emptyPart = { name: '', sku: '', unit_price: 0, description: '', is_active: true }

function badgeClass(status) {
  if (status === 'paid' || status === 'purchased' || status === 'completed') {
    return styles.badgeOk
  }
  if (status === 'pending' || status === 'awaiting_deposit' || status === 'awaiting_mid' || status === 'awaiting_final') {
    return styles.badgeWarn
  }
  if (status === 'rejected' || status === 'canceled') return styles.badgeBad
  return ''
}

function RepairsManageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, loading, user, canManageEmployees } = useAuth()
  const canManage = user?.is_superuser || user?.is_staff || canManageEmployees

  const initialTab = searchParams?.get('tab') || 'overview'
  const [tab, setTab] = useState(
    TABS.some((t) => t.id === initialTab) ? initialTab : 'overview',
  )
  const [bundle, setBundle] = useState(null)
  const [jobs, setJobs] = useState([])
  const [jobFilter, setJobFilter] = useState('')
  const [selectedJob, setSelectedJob] = useState(null)
  const [reminders, setReminders] = useState(null)
  const [accounting, setAccounting] = useState(null)
  const [settings, setSettings] = useState(null)
  const [payments, setPayments] = useState([])
  const [payFilter, setPayFilter] = useState('pending')
  const [proposals, setProposals] = useState([])
  const [propFilter, setPropFilter] = useState('pending')
  const [technicians, setTechnicians] = useState([])
  const [rates, setRates] = useState([])
  const [parts, setParts] = useState([])
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)

  const [techForm, setTechForm] = useState(emptyTech)
  const [editingTech, setEditingTech] = useState(null)
  const [rateForm, setRateForm] = useState(emptyRate)
  const [editingRate, setEditingRate] = useState(null)
  const [partForm, setPartForm] = useState(emptyPart)
  const [editingPart, setEditingPart] = useState(null)

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
  const [picker, setPicker] = useState(null)
  const [userQuery, setUserQuery] = useState('')
  const [userResults, setUserResults] = useState([])
  const [userSearching, setUserSearching] = useState(false)
  const [linkTargetId, setLinkTargetId] = useState(null)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login?next=/repairs-manage')
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    const t = searchParams?.get('tab')
    if (t && TABS.some((x) => x.id === t)) setTab(t)
  }, [searchParams])

  const selectTab = (id) => {
    setTab(id)
    try {
      const url = new URL(window.location.href)
      if (id === 'overview') url.searchParams.delete('tab')
      else url.searchParams.set('tab', id)
      window.history.replaceState({}, '', url)
    } catch {
      /* ignore */
    }
  }

  const flash = (ok, text) => {
    if (ok) {
      setMsg(text)
      setErr(null)
    } else {
      setErr(text)
      setMsg(null)
    }
  }

  const loadCatalog = useCallback(async () => {
    const [t, r, p] = await Promise.all([
      repairsService.technicians(),
      repairsService.laborRates(),
      repairsService.parts(),
    ])
    if (t.success) setTechnicians(t.data || [])
    if (r.success) setRates(r.data || [])
    if (p.success) setParts(p.data || [])
  }, [])

  const load = useCallback(async () => {
    const [b, j, rem, a, s, pay, props] = await Promise.all([
      repairsService.bundle(),
      repairsService.jobs(),
      repairsService.reminders({ days: 30 }),
      repairsService.accounting(),
      repairsService.settings(),
      repairsService.payments({ status: payFilter || undefined }),
      repairsService.proposals({ status: propFilter || undefined }),
    ])
    if (b.success) setBundle(b.data)
    if (j.success) setJobs(j.data || [])
    if (rem.success) setReminders(rem.data)
    if (a.success) setAccounting(a.data)
    else setAccounting(null)
    if (s.success) setSettings(s.data)
    if (pay.success) setPayments(pay.data || [])
    if (props.success) setProposals(props.data || [])
    await loadCatalog()
    const fails = [
      !a.success && `آمار: ${a.error || 'خطا'}`,
      !j.success && `سفارش‌ها: ${j.error || 'خطا'}`,
    ].filter(Boolean)
    if (fails.length) {
      setErr(fails.join(' · '))
      setMsg(null)
    }
  }, [loadCatalog, payFilter, propFilter])

  useEffect(() => {
    if (isAuthenticated && canManage) load()
  }, [isAuthenticated, canManage, load])

  const filteredJobs = useMemo(() => {
    if (!jobFilter) return jobs
    return jobs.filter((j) => j.status === jobFilter)
  }, [jobs, jobFilter])

  const summary = useMemo(() => {
    const s = accounting?.summary || {}
    if (s.jobs_total != null) return s
    // اگر API آمار قطع بود، از فهرست سفارش‌ها برآورد کن
    const list = jobs || []
    return {
      jobs_total: list.length,
      jobs_open: list.filter(
        (j) => j.status !== 'completed' && j.status !== 'canceled',
      ).length,
      jobs_in_progress: list.filter((j) =>
        ['assigned', 'visited', 'mid_paid', 'in_progress'].includes(j.status),
      ).length,
      pending_receipts: 0,
      pending_proposals: 0,
      revenue: 0,
      technicians: technicians.length,
      awaiting_final: list.filter((j) => j.status === 'awaiting_final').length,
      due_reminders: 0,
    }
  }, [accounting, jobs, technicians.length])
  const statuses = bundle?.statuses || []

  const openJob = async (id) => {
    const res = await repairsService.job(id)
    if (!res.success) return flash(false, res.error)
    setSelectedJob(res.data)
    setReport({
      tech_report: res.data.tech_report || '',
      labor_minutes: res.data.labor_minutes || 60,
      labor_rate_ids: (res.data.labor_lines || [])
        .map((l) => l.labor_rate)
        .filter(Boolean),
      part_ids: (res.data.part_lines || []).map((p) => p.part).filter(Boolean),
    })
    selectTab('job')
  }

  const assignTech = async (techId) => {
    if (!selectedJob) return
    setBusy(true)
    const res = await repairsService.updateJob(selectedJob.id, {
      technician_id: techId,
    })
    setBusy(false)
    if (!res.success) return flash(false, res.error)
    setSelectedJob(res.data)
    flash(true, 'سرویسکار تخصیص یافت')
    load()
  }

  const approveComplete = async () => {
    if (!selectedJob) return
    if (
      !window.confirm(
        'تکمیل این سفارش را تایید می‌کنید؟ بعد از تایید، فاکتور برای مشتری قابل چاپ می‌شود.',
      )
    ) {
      return
    }
    setBusy(true)
    const res = await repairsService.approveComplete(selectedJob.id)
    setBusy(false)
    if (!res.success) return flash(false, res.error)
    setSelectedJob(res.data)
    flash(true, res.message || 'تکمیل تایید شد')
    load()
  }

  const submitReport = async () => {
    if (!selectedJob) return
    const locked = !!selectedJob.lines_locked
    const payload = {
      tech_report: report.tech_report,
      submit_for_payment: !locked,
    }
    if (!locked) {
      payload.labor_minutes = report.labor_minutes
      payload.labor_lines = (report.labor_rate_ids || [])
        .map((id) => {
          const rate =
            rates.find((r) => String(r.id) === String(id)) ||
            (bundle?.labor_rates || []).find((r) => String(r.id) === String(id))
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
          const part =
            parts.find((p) => String(p.id) === String(id)) ||
            (bundle?.parts || []).find((p) => String(p.id) === String(id))
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
    setBusy(true)
    const res = await repairsService.submitReport(selectedJob.id, payload)
    setBusy(false)
    if (!res.success) return flash(false, res.error)
    setSelectedJob(res.data)
    flash(true, 'گزارش ثبت شد')
    load()
  }

  const confirmPay = async (paymentId, action = 'approve') => {
    setBusy(true)
    const res = await repairsService.confirmPayment(paymentId, { action })
    setBusy(false)
    if (!res.success) return flash(false, res.error)
    flash(true, action === 'reject' ? 'پرداخت رد شد' : 'پرداخت تایید شد')
    if (selectedJob) openJob(selectedJob.id)
    load()
  }

  const reloadPayments = async (status = payFilter) => {
    setPayFilter(status)
    const res = await repairsService.payments({
      status: status || undefined,
    })
    if (res.success) setPayments(res.data || [])
  }

  const reloadProposals = async (status = propFilter) => {
    setPropFilter(status)
    const res = await repairsService.proposals({
      status: status || undefined,
    })
    if (res.success) setProposals(res.data || [])
  }

  const searchShop = async () => {
    const res = await repairsService.searchShopProducts(shopProposal.q || '')
    if (!res.success) return flash(false, res.error)
    setShopResults(res.data || [])
  }

  const createPayProposal = async () => {
    if (!selectedJob) return
    setBusy(true)
    const res = await repairsService.createProposal(selectedJob.id, {
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
    load()
  }

  const createShopProposal = async () => {
    if (!selectedJob || !shopProposal.product) return
    setBusy(true)
    const res = await repairsService.createProposal(selectedJob.id, {
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
    load()
  }

  const cancelProposal = async (id) => {
    setBusy(true)
    const res = await repairsService.updateProposal(id, { action: 'cancel' })
    setBusy(false)
    if (!res.success) return flash(false, res.error)
    flash(true, 'پیشنهاد لغو شد')
    if (selectedJob) openJob(selectedJob.id)
    load()
  }

  const saveSettings = async () => {
    setBusy(true)
    const res = await repairsService.updateSettings(settings)
    setBusy(false)
    if (!res.success) return flash(false, res.error)
    setSettings(res.data)
    flash(true, 'تنظیمات ذخیره شد')
  }

  const saveTech = async () => {
    setBusy(true)
    const payload = {
      name: techForm.name,
      mobile: techForm.mobile,
      city: techForm.city,
      specialty: techForm.specialty,
      is_active: !!techForm.is_active,
      sort_order: Number(techForm.sort_order || 0),
      user_id: techForm.user_id || null,
    }
    const res = editingTech
      ? await repairsService.updateTechnician(editingTech, payload)
      : await repairsService.createTechnician(payload)
    setBusy(false)
    if (!res.success) return flash(false, res.error)
    setTechForm(emptyTech)
    setEditingTech(null)
    setUserQuery('')
    setUserResults([])
    flash(true, editingTech ? 'تعمیرکار به‌روز شد' : 'تعمیرکار اضافه شد')
    loadCatalog()
    load()
  }

  const searchTechUsers = async (q) => {
    setUserQuery(q)
    if (q.trim().length < 2) {
      setUserResults([])
      return
    }
    setUserSearching(true)
    const res = await repairsService.searchUsers(q.trim())
    setUserSearching(false)
    if (!res.success) {
      setUserResults([])
      return
    }
    setUserResults(res.data || [])
  }

  const pickTechUser = (u) => {
    const label = u.display_name || u.mobile || String(u.id)
    setTechForm((f) => ({
      ...f,
      user_id: u.id,
      user_label: label,
      name: f.name || label,
      mobile: f.mobile || u.mobile || '',
    }))
    setUserQuery(label)
    setUserResults([])
  }

  const linkTechByMobile = async (id) => {
    setBusy(true)
    const res = await repairsService.linkTechnicianByMobile(id)
    setBusy(false)
    if (!res.success) return flash(false, res.error)
    flash(true, 'حساب کاربری با موبایل متصل شد')
    loadCatalog()
  }

  const unlinkTechUser = async (id) => {
    setBusy(true)
    const res = await repairsService.unlinkTechnicianUser(id)
    setBusy(false)
    if (!res.success) return flash(false, res.error)
    flash(true, 'اتصال حساب قطع شد')
    loadCatalog()
  }

  const linkTechToUser = async (techId, userId) => {
    setBusy(true)
    const res = await repairsService.linkTechnicianUser(techId, userId)
    setBusy(false)
    if (!res.success) return flash(false, res.error)
    flash(true, 'حساب کاربری متصل شد')
    setLinkTargetId(null)
    setPicker(null)
    setUserQuery('')
    setUserResults([])
    loadCatalog()
  }

  const saveRate = async () => {
    setBusy(true)
    const payload = {
      ...rateForm,
      price: Number(rateForm.price || 0),
    }
    const res = editingRate
      ? await repairsService.updateLaborRate(editingRate, payload)
      : await repairsService.createLaborRate(payload)
    setBusy(false)
    if (!res.success) return flash(false, res.error)
    setRateForm(emptyRate)
    setEditingRate(null)
    flash(true, editingRate ? 'اجرت به‌روز شد' : 'اجرت اضافه شد')
    loadCatalog()
    load()
  }

  const savePart = async () => {
    setBusy(true)
    const payload = {
      ...partForm,
      unit_price: Number(partForm.unit_price || 0),
    }
    const res = editingPart
      ? await repairsService.updatePart(editingPart, payload)
      : await repairsService.createPart(payload)
    setBusy(false)
    if (!res.success) return flash(false, res.error)
    setPartForm(emptyPart)
    setEditingPart(null)
    flash(true, editingPart ? 'قطعه به‌روز شد' : 'قطعه اضافه شد')
    loadCatalog()
    load()
  }

  const awaitingFinalJobs = useMemo(
    () => (jobs || []).filter((j) => j.status === 'awaiting_final'),
    [jobs],
  )
  const pendingReceipts = accounting?.pending_receipts || []
  const pendingProps = accounting?.pending_proposals || []
  const workTabs = TABS.filter((t) => t.group === 'work')
  const setupTabs = TABS.filter((t) => t.group === 'setup')
  const todoCount =
    Number(summary.pending_receipts || 0) +
    Number(awaitingFinalJobs.length || 0)

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.wrap}>در حال بارگذاری…</div>
      </div>
    )
  }

  if (!canManage) {
    return (
      <div className={styles.page}>
        <div className={styles.wrap}>دسترسی ندارید.</div>
      </div>
    )
  }

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.wrap}>
        <header className={styles.header}>
          <div>
            <p className={styles.headerEyebrow}>مدیریت تعمیرات</p>
            <h1>
              <Wrench size={20} style={{ verticalAlign: -4, marginLeft: 6 }} />
              داشبورد سرویس
            </h1>
            <p>
              از اینجا رسیدها را تایید کنید، سفارش‌ها را ببینید و وقتی کار تمام و
              بدهی صفر شد، تکمیل را بزنید.
            </p>
          </div>
          <div className={styles.headerActions}>
            <Link href="/dashboard" className={styles.ghost}>
              <LayoutDashboard size={14} /> خانه سایت
            </Link>
            <Link href="/repairs-tech" className={styles.ghost}>
              <UserCog size={14} /> پنل سرویسکار
            </Link>
            <Link href="/repairs" className={styles.ghost} target="_blank">
              <ExternalLink size={14} /> صفحه مشتری
            </Link>
            <button type="button" className={styles.ghost} onClick={load}>
              <RefreshCw size={14} /> بروزرسانی
            </button>
          </div>
        </header>

        {msg ? <p className={`${styles.msg} ${styles.msgOk}`}>{msg}</p> : null}
        {err ? <p className={`${styles.msg} ${styles.msgErr}`}>{err}</p> : null}

        <div className={styles.stats}>
          {[
            {
              go: 'payments',
              value: summary.pending_receipts,
              label: 'رسید برای تایید شما',
              alert: true,
              icon: CreditCard,
            },
            {
              go: 'jobs',
              value: summary.awaiting_final ?? awaitingFinalJobs.length,
              label: 'منتظر تایید تکمیل',
              alert: true,
              icon: CheckCircle2,
            },
            {
              go: 'jobs',
              value: summary.jobs_in_progress,
              label: 'در حال تعمیر',
              alert: false,
              icon: Wrench,
            },
            {
              go: 'jobs',
              value: summary.jobs_open,
              label: 'سفارش باز',
              alert: false,
              icon: ClipboardList,
            },
            {
              go: 'overview',
              value: summary.revenue,
              label: 'درآمد تاییدشده',
              alert: false,
              icon: ShoppingBag,
            },
            {
              go: 'technicians',
              value: summary.technicians,
              label: 'سرویسکار فعال',
              alert: false,
              icon: Users,
            },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <button
                key={`${item.go}-${item.label}-${i}`}
                type="button"
                className={`${styles.stat} ${item.alert && Number(item.value) > 0 ? styles.statAlert : ''} ${
                  tab === item.go ? styles.statOn : ''
                }`}
                onClick={() => selectTab(item.go)}
              >
                <span className={styles.statIcon}>
                  <Icon size={15} />
                </span>
                <strong>{money(item.value)}</strong>
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>

        <nav className={styles.navBlock} aria-label="منوی داشبورد">
          <div className={styles.navGroup}>
            <span className={styles.navLabel}>کار روزانه</span>
            <div className={styles.tabs}>
              {workTabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`${styles.tab} ${tab === t.id ? styles.tabOn : ''}`}
                  onClick={() => selectTab(t.id)}
                  title={t.hint}
                >
                  {t.label}
                  {t.id === 'payments' && summary.pending_receipts
                    ? ` (${money(summary.pending_receipts)})`
                    : ''}
                  {t.id === 'proposals' && summary.pending_proposals
                    ? ` (${money(summary.pending_proposals)})`
                    : ''}
                  {t.id === 'job' && selectedJob ? ` · ${selectedJob.code}` : ''}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.navGroup}>
            <span className={styles.navLabel}>
              <Settings2 size={12} /> تنظیمات پایه
            </span>
            <div className={styles.tabs}>
              {setupTabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`${styles.tab} ${styles.tabSoft} ${
                    tab === t.id ? styles.tabOn : ''
                  }`}
                  onClick={() => selectTab(t.id)}
                  title={t.hint}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {tab === 'overview' ? (
          <div className={styles.home}>
            <section className={styles.flowCard}>
              <h3>مسیر ساده یک سفارش</h3>
              <ol className={styles.flowSteps}>
                <li>
                  <strong>۱. تخصیص</strong>
                  <span>سرویسکار را به سفارش وصل کنید</span>
                </li>
                <li>
                  <strong>۲. کار</strong>
                  <span>سرویسکار گزارش و خرید لازم را ثبت می‌کند</span>
                </li>
                <li>
                  <strong>۳. پول</strong>
                  <span>رسید مشتری را اینجا تایید کنید</span>
                </li>
                <li>
                  <strong>۴. تکمیل</strong>
                  <span>اگر بدهی صفر بود، تکمیل را بزنید</span>
                </li>
              </ol>
            </section>

            {todoCount > 0 ? (
              <div className={styles.todoBanner}>
                <AlertTriangle size={18} />
                <div>
                  <strong>
                    {money(todoCount)} مورد منتظر اقدام شماست
                  </strong>
                  <p>
                    اول رسیدها را تایید کنید، بعد سفارش‌های منتظر تکمیل را ببندید.
                  </p>
                </div>
              </div>
            ) : (
              <div className={`${styles.todoBanner} ${styles.todoOk}`}>
                <CheckCircle2 size={18} />
                <div>
                  <strong>الان کار فوری ندارید</strong>
                  <p>رسید باز و سفارش منتظر تکمیل وجود ندارد.</p>
                </div>
              </div>
            )}

            <div className={styles.homeGrid}>
              <section className={styles.panel}>
                <header className={styles.panelHead}>
                  <div>
                    <h3>
                      <CreditCard size={16} /> رسیدهای منتظر تایید
                    </h3>
                    <p className={styles.panelHint}>
                      مشتری واریز کرده — شما باید قبول یا رد کنید
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.tab}
                    onClick={() => selectTab('payments')}
                  >
                    همه رسیدها
                  </button>
                </header>
                {pendingReceipts.length ? (
                  pendingReceipts.slice(0, 5).map((p) => (
                    <div key={p.id} className={styles.inboxCard}>
                      <div className={styles.inboxTop}>
                        <strong>
                          {p.job_code || p.job} ·{' '}
                          {p.purpose_label || p.purpose || p.stage_label}
                        </strong>
                        <span className={`${styles.badge} ${styles.badgeWarn}`}>
                          {money(p.amount)} ت
                        </span>
                      </div>
                      <div className={styles.muted}>
                        {p.method_label || p.method}
                        {p.ref_id ? ` · پیگیری ${p.ref_id}` : ''}
                      </div>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.btn}
                          disabled={busy}
                          onClick={() => confirmPay(p.id, 'approve')}
                        >
                          تایید رسید
                        </button>
                        <button
                          type="button"
                          className={`${styles.btn} ${styles.btnDanger}`}
                          disabled={busy}
                          onClick={() => confirmPay(p.id, 'reject')}
                        >
                          رد
                        </button>
                        {p.receipt_url ? (
                          <a
                            href={p.receipt_url}
                            target="_blank"
                            rel="noreferrer"
                            className={`${styles.btn} ${styles.btnGhost}`}
                          >
                            دیدن رسید
                          </a>
                        ) : null}
                        <button
                          type="button"
                          className={`${styles.btn} ${styles.btnGhost}`}
                          onClick={() => openJob(p.job)}
                        >
                          باز کردن سفارش
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={styles.emptySoft}>رسید معلقی نیست.</p>
                )}
              </section>

              <section className={styles.panel}>
                <header className={styles.panelHead}>
                  <div>
                    <h3>
                      <CheckCircle2 size={16} /> آماده تایید تکمیل
                    </h3>
                    <p className={styles.panelHint}>
                      سرویسکار کار را تمام کرده — بدهی را ببینید و تکمیل کنید
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.tab}
                    onClick={() => {
                      setJobFilter('awaiting_final')
                      selectTab('jobs')
                    }}
                  >
                    فهرست
                  </button>
                </header>
                {awaitingFinalJobs.length ? (
                  awaitingFinalJobs.slice(0, 5).map((j) => {
                    const due = Math.max(
                      0,
                      Number(j.balance_due ?? (j.grand_total || 0) - (j.paid_total || 0)),
                    )
                    return (
                      <div key={j.id} className={styles.inboxCard}>
                        <div className={styles.inboxTop}>
                          <strong>
                            {j.code} · {j.customer_name}
                          </strong>
                          <span
                            className={`${styles.badge} ${
                              due > 0 ? styles.badgeWarn : styles.badgeOk
                            }`}
                          >
                            {due > 0
                              ? `بدهی ${money(due)}`
                              : 'بدون بدهی'}
                          </span>
                        </div>
                        <div className={styles.muted}>
                          {j.technician_name || 'بدون سرویسکار'} ·{' '}
                          {j.status_label}
                        </div>
                        <div className={styles.actions}>
                          <button
                            type="button"
                            className={styles.btn}
                            onClick={() => openJob(j.id)}
                          >
                            {due > 0
                              ? 'بررسی و پیگیری پرداخت'
                              : 'تایید تکمیل سفارش'}
                          </button>
                          {j.tracking_token ? (
                            <Link
                              href={`/repairs/track/${j.tracking_token}`}
                              target="_blank"
                              className={`${styles.btn} ${styles.btnGhost}`}
                            >
                              دید مشتری
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className={styles.emptySoft}>
                    سفارشی منتظر تایید تکمیل نیست.
                  </p>
                )}
              </section>

              <section className={styles.panel}>
                <header className={styles.panelHead}>
                  <div>
                    <h3>
                      <ShoppingBag size={16} /> پیشنهادهای باز
                    </h3>
                    <p className={styles.panelHint}>
                      منتظر پاسخ یا پرداخت مشتری
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.tab}
                    onClick={() => selectTab('proposals')}
                  >
                    همه
                  </button>
                </header>
                {pendingProps.length ? (
                  pendingProps.slice(0, 5).map((p) => (
                    <div key={p.id} className={styles.inboxCard}>
                      <div className={styles.inboxTop}>
                        <strong>
                          {p.job_code || p.job} · {p.title}
                        </strong>
                        <span className={styles.badge}>
                          {money(p.amount)} ت
                        </span>
                      </div>
                      <div className={styles.muted}>{p.type_label}</div>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={`${styles.btn} ${styles.btnGhost}`}
                          onClick={() => openJob(p.job)}
                        >
                          باز کردن سفارش
                        </button>
                        <button
                          type="button"
                          className={`${styles.btn} ${styles.btnDanger}`}
                          onClick={() => cancelProposal(p.id)}
                        >
                          لغو پیشنهاد
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={styles.emptySoft}>پیشنهاد بازی نیست.</p>
                )}
              </section>

              <section className={styles.panel}>
                <header className={styles.panelHead}>
                  <div>
                    <h3>دسترسی سریع</h3>
                    <p className={styles.panelHint}>کارهای پرتکرار</p>
                  </div>
                </header>
                <div className={styles.quickGrid}>
                  <button
                    type="button"
                    className={styles.quickBtn}
                    onClick={() => selectTab('jobs')}
                  >
                    <ClipboardList size={18} />
                    <strong>همه سفارش‌ها</strong>
                    <span>جستجو و مدیریت پرونده</span>
                  </button>
                  <button
                    type="button"
                    className={styles.quickBtn}
                    onClick={() => selectTab('technicians')}
                  >
                    <UserCog size={18} />
                    <strong>سرویسکارها</strong>
                    <span>اتصال حساب به پنل</span>
                  </button>
                  <button
                    type="button"
                    className={styles.quickBtn}
                    onClick={() => selectTab('rates')}
                  >
                    <Wrench size={18} />
                    <strong>اجرت‌ها</strong>
                    <span>قیمت خدمات</span>
                  </button>
                  <button
                    type="button"
                    className={styles.quickBtn}
                    onClick={() => selectTab('settings')}
                  >
                    <Settings2 size={18} />
                    <strong>تنظیمات</strong>
                    <span>کارت بانکی و متن پرداخت</span>
                  </button>
                </div>
              </section>
            </div>

            <section className={styles.panel}>
              <header className={styles.panelHead}>
                <div>
                  <h3>آخرین پرداخت‌های موفق</h3>
                  <p className={styles.panelHint}>برای مرور سریع حسابداری</p>
                </div>
              </header>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>سفارش</th>
                      <th>موضوع</th>
                      <th>مبلغ</th>
                      <th>روش</th>
                      <th>زمان</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(accounting?.recent_payments || []).length ? (
                      (accounting?.recent_payments || []).slice(0, 8).map((p) => (
                        <tr key={p.id}>
                          <td>{p.job_code || p.job}</td>
                          <td>{p.purpose_label || p.purpose || '—'}</td>
                          <td>{money(p.amount)}</td>
                          <td>{p.method_label || p.method}</td>
                          <td>
                            {p.paid_at
                              ? new Date(p.paid_at).toLocaleString('fa-IR')
                              : '—'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className={styles.muted}>
                          هنوز پرداخت موفقی ثبت نشده
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : null}

        {tab === 'payments' ? (
          <div className={styles.panel}>
            <div className={styles.toolbar}>
              {[
                ['pending', 'در انتظار'],
                ['paid', 'پرداخت‌شده'],
                ['rejected', 'رد شده'],
                ['', 'همه'],
              ].map(([id, label]) => (
                <button
                  key={id || 'all'}
                  type="button"
                  className={`${styles.tab} ${payFilter === id ? styles.tabOn : ''}`}
                  onClick={() => reloadPayments(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>سفارش</th>
                    <th>موضوع</th>
                    <th>مرحله</th>
                    <th>مبلغ</th>
                    <th>روش</th>
                    <th>وضعیت</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td>{p.job_code || p.job}</td>
                      <td>
                        <strong>{p.purpose_label || p.purpose || '—'}</strong>
                      </td>
                      <td>{p.stage_label || p.stage}</td>
                      <td>{money(p.amount)}</td>
                      <td>{p.method_label || p.method}</td>
                      <td>
                        <span className={`${styles.badge} ${badgeClass(p.status)}`}>
                          {p.status_label || p.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          {p.status === 'pending' && p.method === 'card_transfer' ? (
                            <>
                              <button
                                type="button"
                                className={styles.tab}
                                onClick={() => confirmPay(p.id, 'approve')}
                              >
                                تایید
                              </button>
                              <button
                                type="button"
                                className={styles.tab}
                                onClick={() => confirmPay(p.id, 'reject')}
                              >
                                رد
                              </button>
                            </>
                          ) : null}
                          {p.receipt_url ? (
                            <a href={p.receipt_url} target="_blank" rel="noreferrer">
                              رسید
                            </a>
                          ) : null}
                          <button
                            type="button"
                            className={styles.tab}
                            onClick={() => openJob(p.job)}
                          >
                            سفارش
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {tab === 'proposals' ? (
          <div className={styles.panel}>
            <div className={styles.toolbar}>
              {[
                ['pending', 'در انتظار'],
                ['paid', 'پرداخت‌شده'],
                ['purchased', 'خریده‌شده'],
                ['canceled', 'لغو'],
                ['', 'همه'],
              ].map(([id, label]) => (
                <button
                  key={id || 'all'}
                  type="button"
                  className={`${styles.tab} ${propFilter === id ? styles.tabOn : ''}`}
                  onClick={() => reloadProposals(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>سفارش</th>
                    <th>نوع</th>
                    <th>موضوع</th>
                    <th>مبلغ</th>
                    <th>وضعیت</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {proposals.map((p) => (
                    <tr key={p.id}>
                      <td>{p.job_code || p.job}</td>
                      <td>{p.type_label || p.proposal_type}</td>
                      <td>
                        <strong>{p.title}</strong>
                        {p.product_title ? (
                          <div className={styles.muted}>{p.product_title}</div>
                        ) : null}
                      </td>
                      <td>{money(p.amount)}</td>
                      <td>
                        <span className={`${styles.badge} ${badgeClass(p.status)}`}>
                          {p.status_label || p.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            type="button"
                            className={styles.tab}
                            onClick={() => openJob(p.job)}
                          >
                            سفارش
                          </button>
                          {p.tracking_token ? (
                            <Link
                              href={`/repairs/track/${p.tracking_token}`}
                              target="_blank"
                              className={styles.tab}
                            >
                              مشتری
                            </Link>
                          ) : null}
                          {p.status === 'pending' ? (
                            <button
                              type="button"
                              className={styles.tab}
                              onClick={() => cancelProposal(p.id)}
                            >
                              لغو
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {tab === 'jobs' ? (
          <div className={styles.panel}>
            <header className={styles.panelHead}>
              <div>
                <h3>سفارش‌های سرویس</h3>
                <p className={styles.panelHint}>
                  برای تایید تکمیل یا بررسی بدهی، روی «مدیریت» بزنید
                </p>
              </div>
            </header>
            <div className={styles.toolbar}>
              <div style={{ minWidth: 220, flex: '0 1 260px' }}>
                <FilterSelectTrigger
                  label="فیلتر وضعیت"
                  displayValue={
                    jobFilter
                      ? statuses.find((s) => s.id === jobFilter)?.label || ''
                      : 'همه وضعیت‌ها'
                  }
                  placeholder="همه وضعیت‌ها"
                  onClick={() => setPicker('jobFilter')}
                />
              </div>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>کد</th>
                    <th>مشتری</th>
                    <th>شهر</th>
                    <th>سرویسکار</th>
                    <th>وضعیت</th>
                    <th>جمع</th>
                    <th>پرداخت‌شده</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((j) => (
                    <tr key={j.id}>
                      <td>{j.code}</td>
                      <td>
                        {j.customer_name}
                        <div className={styles.muted}>{j.customer_mobile}</div>
                      </td>
                      <td>{j.city}</td>
                      <td>{j.technician_name || '—'}</td>
                      <td>
                        <span className={`${styles.badge} ${badgeClass(j.status)}`}>
                          {j.status_label}
                        </span>
                      </td>
                      <td>{money(j.grand_total)}</td>
                      <td>{money(j.paid_total)}</td>
                      <td>
                        <button
                          type="button"
                          className={styles.tab}
                          onClick={() => openJob(j.id)}
                        >
                          مدیریت
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {tab === 'job' && selectedJob ? (
          <JobDetailPanel
            job={selectedJob}
            technicians={technicians}
            rates={rates}
            parts={parts}
            report={report}
            setReport={setReport}
            payProposal={payProposal}
            setPayProposal={setPayProposal}
            shopProposal={shopProposal}
            setShopProposal={setShopProposal}
            shopResults={shopResults}
            busy={busy}
            onAssignTech={assignTech}
            onApproveComplete={approveComplete}
            onSubmitReport={submitReport}
            onSearchShop={searchShop}
            onCreatePayProposal={createPayProposal}
            onCreateShopProposal={createShopProposal}
            onCancelProposal={cancelProposal}
            onConfirmPay={confirmPay}
          />
        ) : tab === 'job' ? (
          <div className={styles.panel}>
            <p className={styles.muted} style={{ margin: 0 }}>
              سفارشی انتخاب نشده — از تب سفارش‌ها یک پرونده را باز کنید.
            </p>
          </div>
        ) : null}

        {tab === 'technicians' ? (
          <div className={styles.panel}>
            <div className={styles.techGuide}>
              <strong>اتصال حساب برای پنل سرویسکار</strong>
              <p>
                سرویسکار فقط وقتی می‌تواند وارد{' '}
                <Link href="/repairs-tech">/repairs-tech</Link> شود که حساب
                کاربری‌اش به پروفایل تعمیرکار وصل باشد. ساده‌ترین راه: موبایل
                تعمیرکار را دقیقاً مثل موبایل لاگین او بگذارید و «اتصال با موبایل»
                را بزنید؛ یا کاربر را از جستجو انتخاب کنید.
              </p>
            </div>

            <h3>{editingTech ? 'ویرایش تعمیرکار' : 'افزودن تعمیرکار'}</h3>
            <div className={styles.row2}>
              {[
                ['name', 'نام'],
                ['mobile', 'موبایل حساب کاربری'],
                ['city', 'شهر'],
                ['specialty', 'تخصص'],
              ].map(([key, label]) => (
                <div key={key} className={styles.field}>
                  <label>{label}</label>
                  <input
                    value={techForm[key]}
                    dir={key === 'mobile' ? 'ltr' : undefined}
                    placeholder={
                      key === 'mobile' ? 'مثلاً 0912…' : undefined
                    }
                    onChange={(e) =>
                      setTechForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                  />
                </div>
              ))}
              <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                <label>جستجوی حساب کاربری (اختیاری)</label>
                <div className={styles.inlineSearch}>
                  <input
                    value={userQuery}
                    onChange={(e) => searchTechUsers(e.target.value)}
                    placeholder="نام یا موبایل کاربر را بنویسید…"
                  />
                  {techForm.user_id ? (
                    <button
                      type="button"
                      className={styles.tab}
                      onClick={() => {
                        setTechForm((f) => ({
                          ...f,
                          user_id: null,
                          user_label: '',
                        }))
                        setUserQuery('')
                      }}
                    >
                      حذف انتخاب
                    </button>
                  ) : null}
                </div>
                {techForm.user_id ? (
                  <p className={styles.jobHint} style={{ marginTop: 6 }}>
                    حساب انتخاب‌شده: {techForm.user_label || techForm.user_id}
                  </p>
                ) : null}
                {userSearching ? (
                  <p className={styles.muted}>در حال جستجو…</p>
                ) : null}
                {userResults.length ? (
                  <ul className={styles.userPickList}>
                    {userResults.map((u) => (
                      <li key={u.id}>
                        <button
                          type="button"
                          onClick={() => pickTechUser(u)}
                          disabled={u.already_linked && !editingTech}
                        >
                          <strong>{u.display_name}</strong>
                          <span dir="ltr">{u.mobile}</span>
                          {u.already_linked ? (
                            <em>قبلاً به تعمیرکار دیگری وصل است</em>
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <label className={styles.field}>
                <span>فعال</span>
                <input
                  type="checkbox"
                  checked={!!techForm.is_active}
                  onChange={(e) =>
                    setTechForm((f) => ({ ...f, is_active: e.target.checked }))
                  }
                />
              </label>
            </div>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.btn}
                disabled={busy}
                onClick={saveTech}
              >
                <Plus size={14} /> {editingTech ? 'ذخیره' : 'افزودن'}
              </button>
              {editingTech ? (
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnGhost}`}
                  onClick={() => {
                    setEditingTech(null)
                    setTechForm(emptyTech)
                    setUserQuery('')
                    setUserResults([])
                  }}
                >
                  انصراف
                </button>
              ) : null}
            </div>

            <div className={styles.tableWrap} style={{ marginTop: 16 }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>نام</th>
                    <th>موبایل</th>
                    <th>حساب کاربری</th>
                    <th>شهر</th>
                    <th>وضعیت</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {technicians.map((t) => (
                    <tr key={t.id}>
                      <td>{t.name}</td>
                      <td dir="ltr">{t.mobile || '—'}</td>
                      <td>
                        {t.is_linked ? (
                          <span className={`${styles.badge} ${styles.badgeOk}`}>
                            متصل · {t.user_name || t.user_mobile || t.user}
                          </span>
                        ) : (
                          <span className={`${styles.badge} ${styles.badgeWarn}`}>
                            بدون حساب
                          </span>
                        )}
                      </td>
                      <td>{t.city || '—'}</td>
                      <td>{t.is_active ? 'فعال' : 'غیرفعال'}</td>
                      <td>
                        <div className={styles.actions}>
                          {!t.is_linked ? (
                            <>
                              <button
                                type="button"
                                className={styles.tab}
                                disabled={busy || !t.mobile}
                                title={
                                  t.mobile
                                    ? 'اتصال با همان موبایل حساب کاربری'
                                    : 'ابتدا موبایل را ثبت کنید'
                                }
                                onClick={() => linkTechByMobile(t.id)}
                              >
                                اتصال با موبایل
                              </button>
                              <button
                                type="button"
                                className={styles.tab}
                                onClick={() => {
                                  setLinkTargetId(t.id)
                                  setUserQuery('')
                                  setUserResults([])
                                  setPicker('linkUser')
                                }}
                              >
                                انتخاب کاربر
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className={styles.tab}
                              disabled={busy}
                              onClick={() => unlinkTechUser(t.id)}
                            >
                              قطع اتصال
                            </button>
                          )}
                          <button
                            type="button"
                            className={styles.tab}
                            onClick={() => {
                              setEditingTech(t.id)
                              setTechForm({
                                name: t.name || '',
                                mobile: t.mobile || '',
                                city: t.city || '',
                                specialty: t.specialty || '',
                                is_active: !!t.is_active,
                                sort_order: t.sort_order || 0,
                                user_id: t.user || null,
                                user_label:
                                  t.user_name || t.user_mobile || '',
                              })
                              setUserQuery(t.user_name || t.user_mobile || '')
                              setUserResults([])
                            }}
                          >
                            ویرایش
                          </button>
                          <button
                            type="button"
                            className={styles.tab}
                            onClick={async () => {
                              await repairsService.updateTechnician(t.id, {
                                is_active: !t.is_active,
                              })
                              loadCatalog()
                            }}
                          >
                            {t.is_active ? 'غیرفعال' : 'فعال'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {tab === 'rates' ? (
          <div className={styles.panel}>
            <h3>{editingRate ? 'ویرایش اجرت' : 'افزودن اجرت / قیمت خدمت'}</h3>
            <div className={styles.row2}>
              <div className={styles.field}>
                <label>عنوان</label>
                <input
                  value={rateForm.title}
                  onChange={(e) =>
                    setRateForm((f) => ({ ...f, title: e.target.value }))
                  }
                />
              </div>
              <div className={styles.field}>
                <label>کد</label>
                <input
                  value={rateForm.code}
                  onChange={(e) =>
                    setRateForm((f) => ({ ...f, code: e.target.value }))
                  }
                />
              </div>
              <div style={{ minWidth: 160, flex: 1 }}>
                <FilterSelectTrigger
                  label="نوع اجرت"
                  displayValue={
                    rateForm.unit === 'hourly' ? 'ساعتی' : 'ثابت'
                  }
                  placeholder="نوع"
                  onClick={() => setPicker('rateUnit')}
                />
              </div>
              <div className={styles.field}>
                <label>مبلغ</label>
                <input
                  type="number"
                  value={rateForm.price}
                  onChange={(e) =>
                    setRateForm((f) => ({ ...f, price: e.target.value }))
                  }
                />
              </div>
              <label className={styles.field}>
                <span>فعال</span>
                <input
                  type="checkbox"
                  checked={!!rateForm.is_active}
                  onChange={(e) =>
                    setRateForm((f) => ({ ...f, is_active: e.target.checked }))
                  }
                />
              </label>
            </div>
            <div className={styles.actions}>
              <button type="button" className={styles.btn} onClick={saveRate}>
                {editingRate ? 'ذخیره' : 'افزودن اجرت'}
              </button>
              {editingRate ? (
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnGhost}`}
                  onClick={() => {
                    setEditingRate(null)
                    setRateForm(emptyRate)
                  }}
                >
                  انصراف
                </button>
              ) : null}
            </div>
            <div className={styles.tableWrap} style={{ marginTop: 12 }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>عنوان</th>
                    <th>کد</th>
                    <th>نوع</th>
                    <th>مبلغ</th>
                    <th>وضعیت</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rates.map((r) => (
                    <tr key={r.id}>
                      <td>{r.title}</td>
                      <td>{r.code}</td>
                      <td>{r.unit === 'hourly' ? 'ساعتی' : 'ثابت'}</td>
                      <td>{money(r.price)}</td>
                      <td>{r.is_active ? 'فعال' : 'غیرفعال'}</td>
                      <td>
                        <button
                          type="button"
                          className={styles.tab}
                          onClick={() => {
                            setEditingRate(r.id)
                            setRateForm({
                              title: r.title || '',
                              code: r.code || '',
                              unit: r.unit || 'fixed',
                              price: r.price || 0,
                              description: r.description || '',
                              is_active: !!r.is_active,
                            })
                          }}
                        >
                          ویرایش
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {tab === 'parts' ? (
          <div className={styles.panel}>
            <h3>{editingPart ? 'ویرایش قطعه' : 'افزودن قطعه کاتالوگ'}</h3>
            <div className={styles.row2}>
              <div className={styles.field}>
                <label>نام</label>
                <input
                  value={partForm.name}
                  onChange={(e) =>
                    setPartForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div className={styles.field}>
                <label>کد</label>
                <input
                  value={partForm.sku}
                  onChange={(e) =>
                    setPartForm((f) => ({ ...f, sku: e.target.value }))
                  }
                />
              </div>
              <div className={styles.field}>
                <label>قیمت</label>
                <input
                  type="number"
                  value={partForm.unit_price}
                  onChange={(e) =>
                    setPartForm((f) => ({ ...f, unit_price: e.target.value }))
                  }
                />
              </div>
              <label className={styles.field}>
                <span>فعال</span>
                <input
                  type="checkbox"
                  checked={!!partForm.is_active}
                  onChange={(e) =>
                    setPartForm((f) => ({ ...f, is_active: e.target.checked }))
                  }
                />
              </label>
            </div>
            <div className={styles.actions}>
              <button type="button" className={styles.btn} onClick={savePart}>
                {editingPart ? 'ذخیره' : 'افزودن قطعه'}
              </button>
              {editingPart ? (
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnGhost}`}
                  onClick={() => {
                    setEditingPart(null)
                    setPartForm(emptyPart)
                  }}
                >
                  انصراف
                </button>
              ) : null}
            </div>
            <div className={styles.tableWrap} style={{ marginTop: 12 }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>نام</th>
                    <th>کد</th>
                    <th>قیمت</th>
                    <th>وضعیت</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {parts.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.sku}</td>
                      <td>{money(p.unit_price)}</td>
                      <td>{p.is_active ? 'فعال' : 'غیرفعال'}</td>
                      <td>
                        <button
                          type="button"
                          className={styles.tab}
                          onClick={() => {
                            setEditingPart(p.id)
                            setPartForm({
                              name: p.name || '',
                              sku: p.sku || '',
                              unit_price: p.unit_price || 0,
                              description: p.description || '',
                              is_active: !!p.is_active,
                            })
                          }}
                        >
                          ویرایش
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {tab === 'reminders' ? (
          <div className={styles.panel}>
            <h3>موعد گذشته</h3>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>دستگاه</th>
                    <th>مشتری</th>
                    <th>موبایل</th>
                    <th>سرویس بعدی</th>
                  </tr>
                </thead>
                <tbody>
                  {(reminders?.overdue || []).map((d) => (
                    <tr key={d.id}>
                      <td>{d.title}</td>
                      <td>{d.customer_name}</td>
                      <td>{d.customer_mobile}</td>
                      <td>{d.next_service_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 style={{ marginTop: 16 }}>نزدیک (۳۰ روز)</h3>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>دستگاه</th>
                    <th>مشتری</th>
                    <th>موبایل</th>
                    <th>سرویس بعدی</th>
                  </tr>
                </thead>
                <tbody>
                  {(reminders?.upcoming || []).map((d) => (
                    <tr key={d.id}>
                      <td>{d.title}</td>
                      <td>{d.customer_name}</td>
                      <td>{d.customer_mobile}</td>
                      <td>{d.next_service_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {tab === 'settings' && settings ? (
          <div className={styles.panel}>
            <h3>تنظیمات مالی و پرداخت</h3>
            <div className={styles.row2}>
              {[
                ['deposit_amount', 'پیش‌پرداخت رزرو'],
                ['default_hourly_rate', 'نرخ ساعتی پیش‌فرض'],
                ['default_service_interval_months', 'دوره سرویس (ماه)'],
                ['company_title', 'عنوان فاکتور'],
                ['bank_card_number', 'شماره کارت'],
                ['bank_card_holder', 'صاحب کارت'],
                ['bank_name', 'بانک'],
              ].map(([key, label]) => (
                <div key={key} className={styles.field}>
                  <label>{label}</label>
                  <input
                    type={
                      key.includes('amount') || key.includes('rate') || key.includes('months')
                        ? 'number'
                        : 'text'
                    }
                    value={settings[key] ?? ''}
                    dir={key === 'bank_card_number' ? 'ltr' : undefined}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, [key]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
            <div className={styles.field}>
              <label>راهنمای واریز برای مشتری</label>
              <textarea
                rows={3}
                value={settings.payment_instructions || ''}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    payment_instructions: e.target.value,
                  }))
                }
              />
            </div>
            <button
              type="button"
              className={styles.btn}
              disabled={busy}
              onClick={saveSettings}
            >
              ذخیره تنظیمات
            </button>
          </div>
        ) : null}
      </div>

      <FilterDialog
        isOpen={picker === 'jobFilter'}
        title="فیلتر وضعیت سفارش"
        options={statuses.map((s) => ({ id: s.id, name: s.label }))}
        value={jobFilter}
        emptyLabel="همه وضعیت‌ها"
        showEmpty
        searchable={statuses.length > 6}
        onChange={(v) => setJobFilter(v || '')}
        onClose={() => setPicker(null)}
      />
      <FilterDialog
        isOpen={picker === 'rateUnit'}
        title="نوع اجرت"
        options={[
          { id: 'fixed', name: 'ثابت' },
          { id: 'hourly', name: 'ساعتی' },
        ]}
        value={rateForm.unit}
        showEmpty={false}
        searchable={false}
        onChange={(v) => setRateForm((f) => ({ ...f, unit: v || 'fixed' }))}
        onClose={() => setPicker(null)}
      />

      {picker === 'linkUser' && linkTargetId ? (
        <div
          className={styles.linkOverlay}
          role="presentation"
          onClick={() => {
            setPicker(null)
            setLinkTargetId(null)
            setUserResults([])
          }}
        >
          <div
            className={styles.linkSheet}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <header>
              <h4>اتصال حساب کاربری به سرویسکار</h4>
              <button
                type="button"
                className={styles.tab}
                onClick={() => {
                  setPicker(null)
                  setLinkTargetId(null)
                }}
              >
                بستن
              </button>
            </header>
            <p className={styles.muted}>
              نام یا موبایل کاربر را جستجو کنید و انتخاب نمایید.
            </p>
            <div className={styles.inlineSearch}>
              <input
                autoFocus
                value={userQuery}
                onChange={(e) => searchTechUsers(e.target.value)}
                placeholder="حداقل ۲ حرف…"
              />
            </div>
            {userSearching ? (
              <p className={styles.muted}>در حال جستجو…</p>
            ) : null}
            <ul className={styles.userPickList}>
              {userResults.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    disabled={busy || u.already_linked}
                    onClick={() => linkTechToUser(linkTargetId, u.id)}
                  >
                    <strong>{u.display_name}</strong>
                    <span dir="ltr">{u.mobile}</span>
                    {u.already_linked ? (
                      <em>قبلاً وصل شده</em>
                    ) : (
                      <em>انتخاب برای اتصال</em>
                    )}
                  </button>
                </li>
              ))}
              {!userSearching && userQuery.trim().length >= 2 && !userResults.length ? (
                <li className={styles.muted}>کاربری یافت نشد</li>
              ) : null}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function RepairsManageClient() {
  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.REPAIRS} notFoundWhenInactive>
      <RepairsManageInner />
    </ModuleGate>
  )
}
