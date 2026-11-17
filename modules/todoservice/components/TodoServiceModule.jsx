'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  GraduationCap,
  Loader2,
  RefreshCw,
  Search,
  UserCog,
  Wrench,
} from 'lucide-react'
import ModuleGate from '@/components/modules/ModuleGate'
import ModulePageShell from '@/components/layout/ModulePageShell'
import GuidedTour, { useGuidedTour } from '@/components/Admin/GuidedTour'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import {
  TODO_SERVICE_TOUR_STORAGE_KEY,
  buildTodoServiceTourSteps,
} from '@/config/todoServiceTour'
import { TodoServiceProvider, useTodoService } from '../context/TodoServiceContext'
import JobCard from './JobCard'
import JobDetailSheet from './JobDetailSheet'
import IntakeAssignDialog, { isIntakeJob } from './IntakeAssignDialog'
import FieldJobDialog, { isFieldJob } from './FieldJobDialog'
import WorkJobDialog, { isWorkJob } from './WorkJobDialog'
import DoneJobDialog, { isDoneJob } from './DoneJobDialog'
import CustomerJobDialog from './CustomerJobDialog'
import TechJobDialog from './TechJobDialog'
import AdminOpsPanel from './AdminOpsPanel'
import ArchivePanel from './ArchivePanel'
import AccountingPanel from './AccountingPanel'
import CustomerHub from './CustomerHub'
import styles from '../styles/Board.module.css'

const fa = (n) => Number(n || 0).toLocaleString('fa-IR')

const COL_CLASS = {
  inbox: styles.colInbox,
  field: styles.colField,
  work: styles.colWork,
  done: styles.colDone,
}

const ROLE_LABELS = {
  admin: 'مدیر سرویس',
  tech: 'سرویسکار',
  customer: 'مشتری',
}

const VIEW_TABS = [
  { id: 'board', label: 'میزکار' },
  { id: 'archive', label: 'آرشیو', roles: ['admin'] },
  { id: 'accounting', label: 'حسابداری', roles: ['admin'] },
  { id: 'ops', label: 'عملیات', roles: ['admin'] },
  { id: 'customer', label: 'مرکز مشتری', roles: ['customer', 'admin', 'tech'] },
]

function BoardView() {
  const { jobsByColumn, columns, selectedJob, openJob } = useTodoService()

  return (
    <div className={styles.board} data-tour="ts-board">
      {columns.map((col) => {
        const items = jobsByColumn[col.id] || []
        return (
          <section
            key={col.id}
            className={`${styles.column} ${COL_CLASS[col.id] || ''}`}
            data-tour={`ts-col-${col.id}`}
          >
            <div className={styles.columnHead}>
              <h2 className={styles.columnTitle}>
                <span className={styles.columnDot} aria-hidden />
                {col.title}
              </h2>
              <span className={styles.columnCount}>{fa(items.length)}</span>
            </div>
            <div className={styles.columnBody}>
              {items.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  active={selectedJob?.id === job.id}
                  onOpen={openJob}
                />
              ))}
              {items.length === 0 ? (
                <div className={styles.emptyCol}>پرونده‌ای در این ستون نیست</div>
              ) : null}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function TodoServiceContent() {
  const router = useRouter()
  const {
    role,
    setRole,
    switchRole,
    availableRoles,
    view,
    setView,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    loading,
    error,
    msg,
    stats,
    refresh,
    authLoading,
    isAuthenticated,
    selectedJob,
    techProfile,
    columns,
  } = useTodoService()

  const tourSteps = useMemo(() => buildTodoServiceTourSteps(role), [role])
  const tour = useGuidedTour(tourSteps)
  const tourAutoRef = useRef(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login?next=/todoservice')
    }
  }, [authLoading, isAuthenticated, router])

  const startTourFn = tour.start
  useEffect(() => {
    if (authLoading || !isAuthenticated || loading) return undefined
    if (tourAutoRef.current) return undefined
    if (typeof window === 'undefined') return undefined
    try {
      if (window.localStorage.getItem(TODO_SERVICE_TOUR_STORAGE_KEY)) {
        return undefined
      }
    } catch {
      return undefined
    }
    const t = window.setTimeout(() => {
      if (tourAutoRef.current) return
      tourAutoRef.current = true
      if (view !== 'board') setView('board')
      startTourFn(buildTodoServiceTourSteps(role))
      try {
        window.localStorage.setItem(TODO_SERVICE_TOUR_STORAGE_KEY, '1')
      } catch {
        /* ignore */
      }
    }, 700)
    return () => window.clearTimeout(t)
  }, [
    authLoading,
    isAuthenticated,
    loading,
    role,
    view,
    setView,
    startTourFn,
  ])

  const techName =
    techProfile?.technician?.name ||
    techProfile?.name ||
    ''

  const columnFilters = [
    { id: 'all', label: 'همه' },
    ...columns.map((c) => ({ id: c.id, label: c.title })),
  ]

  const visibleViews = VIEW_TABS.filter(
    (v) => !v.roles || v.roles.includes(role),
  )

  let body = null
  if (loading) {
    body = (
      <div className={styles.loading}>
        <Loader2 size={20} className={styles.spin} />
        در حال بارگذاری میزکار سرویس…
      </div>
    )
  } else if (error && view === 'board') {
    body = (
      <div className={styles.errorBox}>
        <AlertCircle size={18} />
        <span>{error}</span>
        <button type="button" className={styles.btnGhost} onClick={refresh}>
          تلاش دوباره
        </button>
      </div>
    )
  } else {
    body = (
      <>
        {view === 'board' ? <BoardView /> : null}
        {view === 'archive' ? <ArchivePanel /> : null}
        {view === 'accounting' ? <AccountingPanel /> : null}
        {view === 'ops' ? <AdminOpsPanel /> : null}
        {view === 'customer' ? <CustomerHub /> : null}
      </>
    )
  }

  const startTour = () => {
    if (view !== 'board') setView('board')
    window.setTimeout(() => {
      tour.start(buildTodoServiceTourSteps(role))
    }, view === 'board' ? 40 : 180)
  }

  return (
    <div className={`${styles.page} todoServiceTheme`} dir="rtl">
      <header className={styles.header} data-tour="ts-header">
        <div className={styles.brand}>
          <span className={styles.brandIcon}>
            <Wrench size={17} />
          </span>
          <div>
            <h1>میزکار سرویس و تعمیر</h1>
            <p>
              {role === 'tech' && techName
                ? `سرویسکار فعال: ${techName}`
                : role === 'tech'
                  ? 'نمای سرویسکار'
                  : role === 'admin'
                    ? 'مدیریت پرونده‌ها از ورودی تا تکمیل'
                    : 'پیگیری و ثبت درخواست مشتری'}
            </p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={`${styles.btnGhost} ${styles.tourBtn}`}
            onClick={startTour}
            data-tour="ts-tour-btn"
          >
            <GraduationCap size={14} />
            راهنمای تور
          </button>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={refresh}
            disabled={loading}
            data-tour="ts-refresh"
          >
            <RefreshCw size={14} className={loading ? styles.spin : undefined} />
            بروزرسانی
          </button>
        </div>
      </header>

      <div className={styles.roleBar} data-tour="ts-roles">
        {availableRoles.map((r) => (
          <button
            key={r}
            type="button"
            className={`${styles.chip} ${role === r ? styles.chipActive : ''}`}
            onClick={() => (switchRole || setRole)(r)}
          >
            <UserCog size={12} />
            {r === 'tech' && techName
              ? `${ROLE_LABELS.tech}: ${techName}`
              : ROLE_LABELS[r] || r}
          </button>
        ))}
      </div>

      {role === 'tech' && techName ? (
        <div className={styles.techIdentity}>
          <span className={styles.techIdentityAvatar}>
            {techName.charAt(0)}
          </span>
          <div>
            <strong>{techName}</strong>
            <p>
              {[
                techProfile?.technician?.specialty,
                techProfile?.technician?.city,
                typeof techProfile?.open_jobs === 'number'
                  ? `${Number(techProfile.open_jobs).toLocaleString('fa-IR')} سفارش باز`
                  : null,
              ]
                .filter(Boolean)
                .join(' · ') || 'پنل سرویسکار شما'}
            </p>
          </div>
        </div>
      ) : null}

      <div className={styles.viewTabs} data-tour="ts-views">
        {visibleViews.map((v) => (
          <button
            key={v.id}
            type="button"
            className={`${styles.chip} ${view === v.id ? styles.chipActive : styles.chipGold}`}
            data-tour={`ts-view-${v.id}`}
            onClick={() => setView(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>

      {msg ? <p className={`${styles.msg} ${styles.msgOk}`}>{msg}</p> : null}
      {error && view !== 'board' ? (
        <p className={`${styles.msg} ${styles.msgErr}`}>{error}</p>
      ) : null}

      {view === 'board' ? (
        <>
          <div className={styles.stats} data-tour="ts-stats">
            <span className={styles.stat}>
              کل <strong>{fa(stats.total)}</strong>
            </span>
            <span className={styles.stat}>
              ورودی <strong>{fa(stats.inbox)}</strong>
            </span>
            <span className={styles.stat}>
              اعزام <strong>{fa(stats.field)}</strong>
            </span>
            <span className={styles.stat}>
              در حال تعمیر <strong>{fa(stats.work)}</strong>
            </span>
            <span className={styles.stat}>
              پایان <strong>{fa(stats.done)}</strong>
            </span>
            {typeof stats.open === 'number' ? (
              <span className={styles.stat}>
                باز <strong>{fa(stats.open)}</strong>
              </span>
            ) : null}
          </div>

          <div className={styles.toolbar} data-tour="ts-toolbar">
            <div className={styles.filters}>
              {columnFilters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`${styles.filterBtn} ${
                    statusFilter === f.id ? styles.filterActive : ''
                  }`}
                  onClick={() => setStatusFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className={styles.search}>
              <Search size={14} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجوی کد، مشتری، شهر یا دستگاه…"
              />
            </div>
          </div>
        </>
      ) : null}

      {body}
      {role === 'tech' && selectedJob ? (
        <TechJobDialog />
      ) : role === 'customer' && selectedJob ? (
        <CustomerJobDialog />
      ) : role === 'admin' && isIntakeJob(selectedJob) ? (
        <IntakeAssignDialog />
      ) : role === 'admin' && isFieldJob(selectedJob) ? (
        <FieldJobDialog />
      ) : role === 'admin' && isWorkJob(selectedJob) ? (
        <WorkJobDialog />
      ) : role === 'admin' && isDoneJob(selectedJob) ? (
        <DoneJobDialog />
      ) : selectedJob ? (
        <JobDetailSheet />
      ) : null}

      <GuidedTour
        open={tour.open}
        steps={tour.steps}
        stepIndex={tour.stepIndex}
        onStepChange={tour.setStepIndex}
        onClose={tour.close}
        tipClassName={styles.tourTip}
      />
    </div>
  )
}

export default function TodoServiceModule() {
  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.REPAIRS}>
      <ModulePageShell pageKey="repairs">
        <TodoServiceProvider>
          <TodoServiceContent />
        </TodoServiceProvider>
      </ModulePageShell>
    </ModuleGate>
  )
}