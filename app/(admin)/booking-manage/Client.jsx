'use client'

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import {
  CalendarCheck,
  ExternalLink,
  LayoutDashboard,
  RefreshCw,
  Save,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Config from '@/config/config'
import ModuleGate from '@/components/modules/ModuleGate'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import styles from './BookingManage.module.css'

const WEEKDAYS = [
  { id: 0, label: 'شنبه' },
  { id: 1, label: 'یکشنبه' },
  { id: 2, label: 'دوشنبه' },
  { id: 3, label: 'سه‌شنبه' },
  { id: 4, label: 'چهارشنبه' },
  { id: 5, label: 'پنجشنبه' },
  { id: 6, label: 'جمعه' },
]

const TABS = [
  { id: 'settings', label: 'تنظیمات رزرو' },
  { id: 'appointments', label: 'نوبت‌ها' },
  { id: 'services', label: 'خدمات' },
  { id: 'staff', label: 'پرسنل' },
  { id: 'accounting', label: 'حسابداری پرسنل' },
  { id: 'schedules', label: 'ساعات کاری' },
  { id: 'exceptions', label: 'تعطیلی‌ها' },
]

function money(n) {
  const v = Number(n || 0)
  return `${v.toLocaleString('fa-IR')} تومان`
}

const BUSINESS_TYPES = [
  { id: 'beauty_salon', label: 'آرایشگاه / سالن زیبایی' },
  { id: 'clinic', label: 'مطب / کلینیک' },
  { id: 'lawyer', label: 'دفتر وکالت' },
  { id: 'auto_service', label: 'تعویض روغن / خودرو' },
  { id: 'spa', label: 'اسپا / ماساژ' },
  { id: 'dental', label: 'دندانپزشکی' },
  { id: 'consulting', label: 'مشاوره' },
  { id: 'custom', label: 'سفارشی' },
]

function Field({ label, children, wide }) {
  return (
    <label className={`${styles.field} ${wide ? styles.formWide : ''}`}>
      <span className={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  )
}

function ToggleRow({ checked, onChange, label, hint }) {
  return (
    <label
      className={`${styles.toggleCard} ${checked ? styles.toggleCardOn : ''}`}
    >
      <span className={styles.toggleText}>
        <span className={styles.toggleTitle}>{label}</span>
        {hint ? <span className={styles.toggleDesc}>{hint}</span> : null}
      </span>
      <span className={styles.switch}>
        <input
          type="checkbox"
          checked={!!checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className={styles.switchTrack}>
          <span className={styles.switchThumb} />
        </span>
      </span>
    </label>
  )
}

function BookingManageInner() {
  const { getAuthHeaders, isAuthenticated, loading } = useAuth()
  const [tab, setTab] = useState('settings')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const [settings, setSettings] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [services, setServices] = useState([])
  const [staff, setStaff] = useState([])
  const [schedules, setSchedules] = useState([])
  const [exceptions, setExceptions] = useState([])
  const [accountingRows, setAccountingRows] = useState([])
  const [accountingTotals, setAccountingTotals] = useState({
    payable: 0,
    staff_count: 0,
    with_balance: 0,
  })
  const [ledgerStaffId, setLedgerStaffId] = useState(null)
  const [ledgerSummary, setLedgerSummary] = useState(null)
  const [ledgerEntries, setLedgerEntries] = useState([])
  const [settleNote, setSettleNote] = useState('')
  const [settleAmount, setSettleAmount] = useState('')

  const [serviceForm, setServiceForm] = useState({
    name: '',
    duration_minutes: 30,
    price: 0,
    is_active: true,
  })
  const [staffForm, setStaffForm] = useState({
    name: '',
    title: '',
    commission_percent: 0,
    service_ids: [],
    is_active: true,
  })
  const [scheduleForm, setScheduleForm] = useState({
    weekday: 0,
    start_time: '09:00',
    end_time: '17:00',
    staff: '',
    is_closed: false,
  })
  const [exceptionForm, setExceptionForm] = useState({
    date: '',
    is_closed: true,
    note: '',
  })

  const headers = useMemo(() => getAuthHeaders(), [getAuthHeaders])

  const flash = (okMsg, errorMsg) => {
    if (okMsg) {
      setMsg(okMsg)
      setErr('')
    } else {
      setErr(errorMsg || 'خطا')
      setMsg('')
    }
  }

  const loadAll = useCallback(async () => {
    if (!isAuthenticated) return
    setBusy(true)
    setErr('')
    try {
      const [st, ap, sv, sf, sc, ex, acc] = await Promise.all([
        axios.get(Config.endpoints.nobat.settings(), { headers }),
        axios.get(Config.endpoints.nobat.appointments(), { headers }),
        axios.get(Config.endpoints.nobat.services({ manage: 1 }), { headers }),
        axios.get(Config.endpoints.nobat.staff({ manage: 1 }), { headers }),
        axios.get(Config.endpoints.nobat.schedules(), { headers }),
        axios.get(Config.endpoints.nobat.exceptions(), { headers }),
        axios.get(Config.endpoints.nobat.accounting(), { headers }),
      ])
      setSettings(st.data?.data || null)
      setAppointments(ap.data?.data || [])
      setServices(sv.data?.data || [])
      setStaff(sf.data?.data || [])
      setSchedules(sc.data?.data || [])
      setExceptions(ex.data?.data || [])
      setAccountingRows(acc.data?.data?.staff || [])
      setAccountingTotals(
        acc.data?.data?.totals || {
          payable: 0,
          staff_count: 0,
          with_balance: 0,
        },
      )
    } catch (e) {
      flash(null, e.response?.data?.message || 'خطا در بارگذاری')
    } finally {
      setBusy(false)
    }
  }, [headers, isAuthenticated])

  const loadLedger = useCallback(
    async (staffId) => {
      if (!staffId) return
      try {
        const res = await axios.get(
          Config.endpoints.nobat.accounting({ staff_id: staffId }),
          { headers },
        )
        setLedgerStaffId(staffId)
        setLedgerSummary(res.data?.data?.summary || null)
        setLedgerEntries(res.data?.data?.entries || [])
        setSettleAmount('')
        setSettleNote('')
      } catch (e) {
        flash(null, e.response?.data?.message || 'خطا در بارگذاری دفتر حساب')
      }
    },
    [headers],
  )

  useEffect(() => {
    if (!loading && isAuthenticated) loadAll()
  }, [loading, isAuthenticated, loadAll])

  const stats = useMemo(
    () => ({
      appointments: appointments.length,
      services: services.filter((s) => s.is_active).length,
      staff: staff.filter((s) => s.is_active).length,
      payable: accountingTotals.payable ?? 0,
    }),
    [appointments, services, staff, accountingTotals],
  )

  const tabCounts = useMemo(
    () => ({
      appointments: appointments.length,
      services: services.length,
      staff: staff.length,
      accounting: accountingTotals.with_balance ?? 0,
      schedules: schedules.length,
      exceptions: exceptions.length,
    }),
    [appointments, services, staff, accountingTotals, schedules, exceptions],
  )

  const patchSettings = async (patch) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }

  const saveSettings = async () => {
    if (!settings) return
    setBusy(true)
    try {
      const res = await axios.patch(
        Config.endpoints.nobat.settings(),
        settings,
        { headers },
      )
      setSettings(res.data?.data || settings)
      flash('تنظیمات ذخیره شد')
    } catch (e) {
      flash(null, e.response?.data?.message || 'ذخیره تنظیمات ناموفق')
    } finally {
      setBusy(false)
    }
  }

  const setApStatus = async (id, status) => {
    try {
      await axios.patch(
        Config.endpoints.nobat.appointment(id),
        { status },
        { headers },
      )
      loadAll()
    } catch (e) {
      flash(null, e.response?.data?.message || 'خطا')
    }
  }

  const createService = async (e) => {
    e.preventDefault()
    try {
      await axios.post(Config.endpoints.nobat.services(), serviceForm, {
        headers,
      })
      setServiceForm({
        name: '',
        duration_minutes: 30,
        price: 0,
        is_active: true,
      })
      flash('خدمت اضافه شد')
      loadAll()
    } catch (e2) {
      flash(null, e2.response?.data?.message || 'خطا در افزودن خدمت')
    }
  }

  const toggleService = async (sv) => {
    try {
      await axios.patch(
        Config.endpoints.nobat.service(sv.id),
        { is_active: !sv.is_active },
        { headers },
      )
      loadAll()
    } catch (e) {
      flash(null, e.response?.data?.message || 'خطا')
    }
  }

  const createStaff = async (e) => {
    e.preventDefault()
    try {
      await axios.post(
        Config.endpoints.nobat.staff(),
        {
          ...staffForm,
          commission_percent: Number(staffForm.commission_percent) || 0,
          service_ids: staffForm.service_ids.map(Number),
        },
        { headers },
      )
      setStaffForm({
        name: '',
        title: '',
        commission_percent: 0,
        service_ids: [],
        is_active: true,
      })
      flash('پرسنل اضافه شد')
      loadAll()
    } catch (e2) {
      flash(null, e2.response?.data?.message || 'خطا در افزودن پرسنل')
    }
  }

  const toggleStaff = async (st) => {
    try {
      await axios.patch(
        Config.endpoints.nobat.staffMember(st.id),
        { is_active: !st.is_active },
        { headers },
      )
      loadAll()
    } catch (e) {
      flash(null, e.response?.data?.message || 'خطا')
    }
  }

  const saveCommission = async (st, percent) => {
    try {
      await axios.patch(
        Config.endpoints.nobat.staffMember(st.id),
        { commission_percent: Number(percent) || 0 },
        { headers },
      )
      flash(`سهم ${st.name} به‌روز شد`)
      loadAll()
    } catch (e) {
      flash(null, e.response?.data?.message || 'خطا در ذخیره درصد')
    }
  }

  const settleSelected = async (full = true) => {
    if (!ledgerStaffId) return
    setBusy(true)
    try {
      const payload = {
        note: settleNote || undefined,
      }
      if (!full && settleAmount !== '') {
        payload.amount = Number(settleAmount)
      }
      const res = await axios.post(
        Config.endpoints.nobat.staffSettle(ledgerStaffId),
        payload,
        { headers },
      )
      flash(res.data?.message || 'تسویه ثبت شد')
      await loadAll()
      await loadLedger(ledgerStaffId)
    } catch (e) {
      flash(null, e.response?.data?.message || 'خطا در تسویه')
    } finally {
      setBusy(false)
    }
  }

  const createSchedule = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        weekday: Number(scheduleForm.weekday),
        start_time: scheduleForm.start_time,
        end_time: scheduleForm.end_time,
        is_closed: !!scheduleForm.is_closed,
        staff: scheduleForm.staff ? Number(scheduleForm.staff) : null,
      }
      await axios.post(Config.endpoints.nobat.schedules(), payload, {
        headers,
      })
      flash('ساعت کاری ثبت شد')
      loadAll()
    } catch (e2) {
      flash(null, e2.response?.data?.message || 'خطا در ثبت ساعت کاری')
    }
  }

  const deleteSchedule = async (id) => {
    try {
      await axios.delete(Config.endpoints.nobat.schedule(id), { headers })
      loadAll()
    } catch (e) {
      flash(null, e.response?.data?.message || 'خطا')
    }
  }

  const createException = async (e) => {
    e.preventDefault()
    try {
      await axios.post(
        Config.endpoints.nobat.exceptions(),
        {
          date_input: exceptionForm.date,
          is_closed: !!exceptionForm.is_closed,
          note: exceptionForm.note || '',
        },
        { headers },
      )
      setExceptionForm({ date: '', is_closed: true, note: '' })
      flash('تعطیلی ثبت شد')
      loadAll()
    } catch (e2) {
      flash(null, e2.response?.data?.message || 'خطا در ثبت تعطیلی')
    }
  }

  const deleteException = async (id) => {
    try {
      await axios.delete(Config.endpoints.nobat.exception(id), { headers })
      loadAll()
    } catch (e) {
      flash(null, e.response?.data?.message || 'خطا')
    }
  }

  if (loading) {
    return <p className={styles.loading}>در حال بارگذاری…</p>
  }
  if (!isAuthenticated) {
    return <p className={styles.err}>برای مدیریت نوبت‌دهی وارد شوید.</p>
  }

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.wrap}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>
              <CalendarCheck size={24} />
            </span>
            <div>
              <h1 className={styles.pageTitle}>مدیریت سیستم نوبت‌دهی</h1>
              <p className={styles.pageDesc}>
                تنظیمات رزرو، خدمات، پرسنل، ساعات کاری و نوبت‌ها در یک بخش
              </p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link href="/dashboard" className={styles.ghostBtn}>
              <LayoutDashboard size={15} />
              داشبورد
            </Link>
            <Link href="/booking" className={styles.ghostBtn} target="_blank">
              <ExternalLink size={15} />
              صفحه رزرو
            </Link>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={loadAll}
              disabled={busy}
            >
              <RefreshCw size={15} />
              بروزرسانی
            </button>
          </div>
        </header>

        <div className={styles.stats}>
          <div className={`${styles.statCard} ${styles.statTeal}`}>
            <p className={styles.statLabel}>نوبت‌های اخیر</p>
            <p className={styles.statValue}>{stats.appointments}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>خدمات فعال</p>
            <p className={styles.statValue}>{stats.services}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>پرسنل فعال</p>
            <p className={styles.statValue}>{stats.staff}</p>
          </div>
          <div className={`${styles.statCard} ${styles.statOk}`}>
            <p className={styles.statLabel}>طلب پرسنل (قابل تسویه)</p>
            <p className={styles.statValue}>
              {Number(stats.payable || 0).toLocaleString('fa-IR')}
            </p>
          </div>
        </div>

        {msg ? <div className={styles.msg}>{msg}</div> : null}
        {err ? <div className={styles.err}>{err}</div> : null}

        <div className={styles.tabs}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${styles.tab} ${tab === t.id ? styles.tabOn : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              {tabCounts[t.id] != null ? (
                <span className={styles.tabCount}>{tabCounts[t.id]}</span>
              ) : null}
            </button>
          ))}
        </div>

        {tab === 'settings' && settings ? (
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <div>
                <h2 className={styles.cardTitle}>قوانین و هویت کسب‌وکار</h2>
                <p className={styles.hint}>
                  اگر «حداقل فاصله تا نوبت» را مثلاً ۴ ساعت بگذارید، مشتری
                  نمی‌تواند تا ۴ ساعت بعد از اکنون رزرو کند؛ ساعت‌های بعد از این
                  فاصله (اگر آزاد باشند) قابل رزرو می‌مانند.
                </p>
              </div>
              <button
                type="button"
                className={styles.solidBtn}
                onClick={saveSettings}
                disabled={busy}
              >
                <Save size={15} />
                ذخیره تنظیمات
              </button>
            </div>

            <div className={styles.toggleGrid}>
              <ToggleRow
                checked={!!settings.is_public_booking_open}
                onChange={(v) => patchSettings({ is_public_booking_open: v })}
                label="رزرو عمومی باز است"
                hint="اگر خاموش باشد صفحه رزرو بسته می‌شود"
              />
              <ToggleRow
                checked={!!settings.auto_confirm}
                onChange={(v) => patchSettings({ auto_confirm: v })}
                label="تأیید خودکار نوبت"
              />
              <ToggleRow
                checked={!!settings.require_staff}
                onChange={(v) => patchSettings({ require_staff: v })}
                label="انتخاب پرسنل اجباری"
              />
            </div>

            <div className={styles.formGrid}>
              <Field label="نام کسب‌وکار">
                <input
                  className={styles.input}
                  value={settings.business_name || ''}
                  onChange={(e) =>
                    patchSettings({ business_name: e.target.value })
                  }
                />
              </Field>
              <Field label="نوع کسب‌وکار">
                <select
                  className={styles.select}
                  value={settings.business_type || 'custom'}
                  onChange={(e) =>
                    patchSettings({ business_type: e.target.value })
                  }
                >
                  {BUSINESS_TYPES.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="تلفن">
                <input
                  className={styles.input}
                  dir="ltr"
                  value={settings.phone || ''}
                  onChange={(e) => patchSettings({ phone: e.target.value })}
                />
              </Field>
              <Field label="آدرس">
                <input
                  className={styles.input}
                  value={settings.address || ''}
                  onChange={(e) => patchSettings({ address: e.target.value })}
                />
              </Field>
              <Field label="حداقل فاصله تا نوبت (ساعت)">
                <input
                  className={styles.input}
                  type="number"
                  min={0}
                  max={168}
                  dir="ltr"
                  value={settings.booking_lead_hours ?? 1}
                  onChange={(e) =>
                    patchSettings({
                      booking_lead_hours: Number(e.target.value) || 0,
                    })
                  }
                />
              </Field>
              <Field label="افق رزرو (روز)">
                <input
                  className={styles.input}
                  type="number"
                  min={1}
                  max={365}
                  dir="ltr"
                  value={settings.booking_horizon_days ?? 30}
                  onChange={(e) =>
                    patchSettings({
                      booking_horizon_days: Number(e.target.value) || 30,
                    })
                  }
                />
              </Field>
              <Field label="بازه اسلات (دقیقه)">
                <input
                  className={styles.input}
                  type="number"
                  min={5}
                  max={120}
                  dir="ltr"
                  value={settings.slot_interval_minutes ?? 15}
                  onChange={(e) =>
                    patchSettings({
                      slot_interval_minutes: Number(e.target.value) || 15,
                    })
                  }
                />
              </Field>
              <Field label="مهلت لغو توسط مشتری (ساعت)">
                <input
                  className={styles.input}
                  type="number"
                  min={0}
                  max={168}
                  dir="ltr"
                  value={settings.cancel_before_hours ?? 2}
                  onChange={(e) =>
                    patchSettings({
                      cancel_before_hours: Number(e.target.value) || 0,
                    })
                  }
                />
              </Field>
              <Field label="فاصله خالی بعد هر نوبت (دقیقه)">
                <input
                  className={styles.input}
                  type="number"
                  min={0}
                  max={240}
                  dir="ltr"
                  value={settings.buffer_after_minutes ?? 0}
                  onChange={(e) =>
                    patchSettings({
                      buffer_after_minutes: Number(e.target.value) || 0,
                    })
                  }
                />
              </Field>
              <Field label="منطقه زمانی">
                <input
                  className={styles.input}
                  dir="ltr"
                  value={settings.timezone_label || 'Asia/Tehran'}
                  onChange={(e) =>
                    patchSettings({ timezone_label: e.target.value })
                  }
                />
              </Field>
              <Field label="رنگ برند">
                <input
                  className={styles.input}
                  type="color"
                  value={settings.primary_color || '#0f766e'}
                  onChange={(e) =>
                    patchSettings({ primary_color: e.target.value })
                  }
                />
              </Field>
              <Field label="شعار" wide>
                <input
                  className={styles.input}
                  value={settings.tagline || ''}
                  onChange={(e) => patchSettings({ tagline: e.target.value })}
                />
              </Field>
              <Field label="توضیحات" wide>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  value={settings.description || ''}
                  onChange={(e) =>
                    patchSettings({ description: e.target.value })
                  }
                />
              </Field>
            </div>
          </section>
        ) : null}

        {tab === 'appointments' ? (
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <div>
                <h2 className={styles.cardTitle}>نوبت‌های اخیر</h2>
                <p className={styles.hint}>
                  وضعیت هر نوبت را از همین جدول تغییر دهید.
                </p>
              </div>
            </div>
            {appointments.length === 0 ? (
              <p className={styles.empty}>هنوز نوبتی ثبت نشده است.</p>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>کد</th>
                      <th>مشتری</th>
                      <th>خدمت</th>
                      <th>تاریخ</th>
                      <th>ساعت</th>
                      <th>وضعیت</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((ap) => (
                      <tr key={ap.id}>
                        <td dir="ltr">{ap.confirmation_code}</td>
                        <td>
                          {ap.customer_name}
                          <span className={styles.cellSub} dir="ltr">
                            {ap.customer_mobile}
                          </span>
                        </td>
                        <td>{ap.service_name}</td>
                        <td dir="ltr">{ap.jalali_date}</td>
                        <td dir="ltr">{String(ap.start_time).slice(0, 5)}</td>
                        <td>
                          <select
                            className={styles.select}
                            value={ap.status}
                            onChange={(e) => setApStatus(ap.id, e.target.value)}
                          >
                            <option value="pending">در انتظار</option>
                            <option value="confirmed">تأیید</option>
                            <option value="cancelled">لغو</option>
                            <option value="completed">انجام‌شده</option>
                            <option value="no_show">حاضر نشد</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}

        {tab === 'services' ? (
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <div>
                <h2 className={styles.cardTitle}>خدمات</h2>
                <p className={styles.hint}>
                  خدمت جدید اضافه کنید یا وضعیت خدمات فعلی را تغییر دهید.
                </p>
              </div>
            </div>
            <form className={styles.formGrid} onSubmit={createService}>
              <Field label="نام خدمت">
                <input
                  className={styles.input}
                  required
                  value={serviceForm.name}
                  onChange={(e) =>
                    setServiceForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </Field>
              <Field label="مدت (دقیقه)">
                <input
                  className={styles.input}
                  type="number"
                  min={5}
                  dir="ltr"
                  value={serviceForm.duration_minutes}
                  onChange={(e) =>
                    setServiceForm((f) => ({
                      ...f,
                      duration_minutes: Number(e.target.value) || 30,
                    }))
                  }
                />
              </Field>
              <Field label="قیمت (تومان)">
                <input
                  className={styles.input}
                  type="number"
                  min={0}
                  dir="ltr"
                  value={serviceForm.price}
                  onChange={(e) =>
                    setServiceForm((f) => ({
                      ...f,
                      price: Number(e.target.value) || 0,
                    }))
                  }
                />
              </Field>
              <div className={styles.formActions}>
                <button type="submit" className={styles.solidBtn}>
                  افزودن خدمت
                </button>
              </div>
            </form>
            {services.length === 0 ? (
              <p className={styles.empty}>خدمتی تعریف نشده است.</p>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>نام</th>
                      <th>مدت</th>
                      <th>قیمت</th>
                      <th>وضعیت</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((sv) => (
                      <tr key={sv.id}>
                        <td>{sv.name}</td>
                        <td>{sv.duration_minutes}′</td>
                        <td>
                          {Number(sv.price)
                            ? Number(sv.price).toLocaleString('fa-IR')
                            : 'توافقی'}
                        </td>
                        <td>
                          <span
                            className={`${styles.badge} ${
                              sv.is_active ? '' : styles.badgeOff
                            }`}
                          >
                            {sv.is_active ? 'فعال' : 'غیرفعال'}
                          </span>
                        </td>
                        <td>
                          <div className={styles.rowActions}>
                            <button
                              type="button"
                              className={styles.softBtn}
                              onClick={() => toggleService(sv)}
                            >
                              {sv.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}

        {tab === 'staff' ? (
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <div>
                <h2 className={styles.cardTitle}>پرسنل</h2>
                <p className={styles.hint}>
                  درصد سهم هر نفر از مبلغ نوبت‌های «انجام‌شده» محاسبه می‌شود.
                  حسابداری و تسویه در تب جداست.
                </p>
              </div>
            </div>
            <form className={styles.formGrid} onSubmit={createStaff}>
              <Field label="نام">
                <input
                  className={styles.input}
                  required
                  value={staffForm.name}
                  onChange={(e) =>
                    setStaffForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </Field>
              <Field label="سمت">
                <input
                  className={styles.input}
                  value={staffForm.title}
                  onChange={(e) =>
                    setStaffForm((f) => ({ ...f, title: e.target.value }))
                  }
                />
              </Field>
              <Field label="سهم درصدی (۰–۱۰۰)">
                <input
                  className={styles.input}
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  dir="ltr"
                  value={staffForm.commission_percent}
                  onChange={(e) =>
                    setStaffForm((f) => ({
                      ...f,
                      commission_percent: e.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="خدمات مرتبط" wide>
                <select
                  className={styles.select}
                  multiple
                  value={staffForm.service_ids.map(String)}
                  onChange={(e) => {
                    const ids = Array.from(e.target.selectedOptions).map(
                      (o) => o.value,
                    )
                    setStaffForm((f) => ({ ...f, service_ids: ids }))
                  }}
                >
                  {services
                    .filter((s) => s.is_active)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </Field>
              <div className={styles.formActions}>
                <button type="submit" className={styles.solidBtn}>
                  افزودن پرسنل
                </button>
              </div>
            </form>
            {staff.length === 0 ? (
              <p className={styles.empty}>پرسنلی ثبت نشده است.</p>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>نام</th>
                      <th>سمت</th>
                      <th>سهم %</th>
                      <th>وضعیت</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((st) => (
                      <tr key={st.id}>
                        <td>{st.name}</td>
                        <td>{st.title || '—'}</td>
                        <td>
                          <div className={styles.rowActions}>
                            <input
                              className={styles.input}
                              style={{ width: 88 }}
                              type="number"
                              min={0}
                              max={100}
                              step={0.5}
                              dir="ltr"
                              defaultValue={st.commission_percent ?? 0}
                              key={`${st.id}-${st.commission_percent}`}
                              onBlur={(e) => {
                                const next = e.target.value
                                if (
                                  String(next) !==
                                  String(st.commission_percent ?? 0)
                                ) {
                                  saveCommission(st, next)
                                }
                              }}
                            />
                          </div>
                        </td>
                        <td>
                          <span
                            className={`${styles.badge} ${
                              st.is_active ? '' : styles.badgeOff
                            }`}
                          >
                            {st.is_active ? 'فعال' : 'غیرفعال'}
                          </span>
                        </td>
                        <td>
                          <div className={styles.rowActions}>
                            <button
                              type="button"
                              className={styles.softBtn}
                              onClick={() => {
                                setTab('accounting')
                                loadLedger(st.id)
                              }}
                            >
                              حساب
                            </button>
                            <button
                              type="button"
                              className={styles.softBtn}
                              onClick={() => toggleStaff(st)}
                            >
                              {st.is_active ? 'غیرفعال' : 'فعال'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}

        {tab === 'accounting' ? (
          <>
            <section className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <h2 className={styles.cardTitle}>حسابداری پرسنل</h2>
                  <p className={styles.hint}>
                    با انجام‌شدن هر نوبت، سهم درصدی پرسنل به حسابش اضافه می‌شود.
                    با «تسویه کامل» موجودی صفر می‌شود.
                  </p>
                </div>
              </div>
              {accountingRows.length === 0 ? (
                <p className={styles.empty}>پرسنلی برای حسابداری نیست.</p>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>پرسنل</th>
                        <th>سهم %</th>
                        <th>کل سهم</th>
                        <th>تسویه‌شده</th>
                        <th>مانده</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {accountingRows.map((row) => (
                        <tr key={row.staff_id}>
                          <td>
                            {row.staff_name}
                            {row.title ? (
                              <span className={styles.cellSub}>{row.title}</span>
                            ) : null}
                          </td>
                          <td dir="ltr">{row.commission_percent}%</td>
                          <td>{money(row.total_earned)}</td>
                          <td>{money(row.total_settled)}</td>
                          <td>
                            <strong>{money(row.balance)}</strong>
                          </td>
                          <td>
                            <button
                              type="button"
                              className={styles.softBtn}
                              onClick={() => loadLedger(row.staff_id)}
                            >
                              دفتر و تسویه
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {ledgerSummary ? (
              <section className={styles.card}>
                <div className={styles.cardHead}>
                  <div>
                    <h2 className={styles.cardTitle}>
                      دفتر حساب — {ledgerSummary.staff_name}
                    </h2>
                    <p className={styles.hint}>
                      مانده فعلی:{' '}
                      <strong>{money(ledgerSummary.balance)}</strong>
                      {' · '}
                      سهم کل: {money(ledgerSummary.total_earned)}
                      {' · '}
                      تسویه تا الان: {money(ledgerSummary.total_settled)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.softBtn}
                    onClick={() => {
                      setLedgerStaffId(null)
                      setLedgerSummary(null)
                      setLedgerEntries([])
                    }}
                  >
                    بستن
                  </button>
                </div>

                {Number(ledgerSummary.balance) > 0 ? (
                  <div className={styles.formGrid}>
                    <Field label="مبلغ تسویه جزئی (اختیاری)">
                      <input
                        className={styles.input}
                        type="number"
                        min={1}
                        dir="ltr"
                        placeholder="خالی = تسویه کامل"
                        value={settleAmount}
                        onChange={(e) => setSettleAmount(e.target.value)}
                      />
                    </Field>
                    <Field label="یادداشت تسویه" wide>
                      <input
                        className={styles.input}
                        value={settleNote}
                        onChange={(e) => setSettleNote(e.target.value)}
                        placeholder="مثلاً واریز کارت به کارت"
                      />
                    </Field>
                    <div className={styles.formActions}>
                      <button
                        type="button"
                        className={styles.solidBtn}
                        disabled={busy}
                        onClick={() => settleSelected(true)}
                      >
                        تسویه کامل و صفر کردن حساب
                      </button>
                      {settleAmount ? (
                        <button
                          type="button"
                          className={styles.softBtn}
                          disabled={busy}
                          onClick={() => settleSelected(false)}
                        >
                          تسویه جزئی
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <p className={styles.hint}>
                    مانده صفر است؛ چیزی برای تسویه نیست.
                  </p>
                )}

                {ledgerEntries.length === 0 ? (
                  <p className={styles.empty}>سندی در دفتر نیست.</p>
                ) : (
                  <div className={styles.tableWrap} style={{ marginTop: '1rem' }}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>تاریخ</th>
                          <th>نوع</th>
                          <th>مبلغ</th>
                          <th>نوبت</th>
                          <th>یادداشت</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ledgerEntries.map((en) => (
                          <tr key={en.id}>
                            <td dir="ltr">{en.jalali_date}</td>
                            <td>{en.entry_type_label}</td>
                            <td
                              style={{
                                color:
                                  Number(en.amount) < 0
                                    ? '#b91c1c'
                                    : '#0f766e',
                                fontWeight: 800,
                              }}
                            >
                              {money(en.amount)}
                            </td>
                            <td dir="ltr">{en.appointment_code || '—'}</td>
                            <td>{en.note || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ) : null}
          </>
        ) : null}

        {tab === 'schedules' ? (
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <div>
                <h2 className={styles.cardTitle}>ساعات کاری هفتگی</h2>
                <p className={styles.hint}>
                  اگر پرسنل خالی بماند، ساعت کاری عمومی کسب‌وکار ثبت می‌شود.
                </p>
              </div>
            </div>
            <form className={styles.formGrid} onSubmit={createSchedule}>
              <Field label="روز هفته">
                <select
                  className={styles.select}
                  value={scheduleForm.weekday}
                  onChange={(e) =>
                    setScheduleForm((f) => ({
                      ...f,
                      weekday: Number(e.target.value),
                    }))
                  }
                >
                  {WEEKDAYS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="از ساعت">
                <input
                  className={styles.input}
                  type="time"
                  dir="ltr"
                  value={scheduleForm.start_time}
                  onChange={(e) =>
                    setScheduleForm((f) => ({
                      ...f,
                      start_time: e.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="تا ساعت">
                <input
                  className={styles.input}
                  type="time"
                  dir="ltr"
                  value={scheduleForm.end_time}
                  onChange={(e) =>
                    setScheduleForm((f) => ({
                      ...f,
                      end_time: e.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="پرسنل (اختیاری)">
                <select
                  className={styles.select}
                  value={scheduleForm.staff}
                  onChange={(e) =>
                    setScheduleForm((f) => ({ ...f, staff: e.target.value }))
                  }
                >
                  <option value="">عمومی (کل کسب‌وکار)</option>
                  {staff.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </Field>
              <div className={styles.formWide}>
                <ToggleRow
                  checked={!!scheduleForm.is_closed}
                  onChange={(v) =>
                    setScheduleForm((f) => ({ ...f, is_closed: v }))
                  }
                  label="این روز تعطیل است"
                />
              </div>
              <div className={styles.formActions}>
                <button type="submit" className={styles.solidBtn}>
                  افزودن ساعت کاری
                </button>
              </div>
            </form>
            {schedules.length === 0 ? (
              <p className={styles.empty}>ساعت کاری تعریف نشده است.</p>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>روز</th>
                      <th>از</th>
                      <th>تا</th>
                      <th>پرسنل</th>
                      <th>تعطیل</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((sc) => (
                      <tr key={sc.id}>
                        <td>
                          {WEEKDAYS.find((d) => d.id === sc.weekday)?.label ||
                            sc.weekday}
                        </td>
                        <td dir="ltr">{String(sc.start_time).slice(0, 5)}</td>
                        <td dir="ltr">{String(sc.end_time).slice(0, 5)}</td>
                        <td>
                          {staff.find((s) => s.id === sc.staff)?.name ||
                            'عمومی'}
                        </td>
                        <td>{sc.is_closed ? 'بله' : 'خیر'}</td>
                        <td>
                          <button
                            type="button"
                            className={styles.dangerBtn}
                            onClick={() => deleteSchedule(sc.id)}
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}

        {tab === 'exceptions' ? (
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <div>
                <h2 className={styles.cardTitle}>تعطیلی و استثنا</h2>
                <p className={styles.hint}>
                  تاریخ را شمسی (مثلاً 1403/08/15) یا میلادی وارد کنید.
                </p>
              </div>
            </div>
            <form className={styles.formGrid} onSubmit={createException}>
              <Field label="تاریخ">
                <input
                  className={styles.input}
                  required
                  dir="ltr"
                  placeholder="1403/08/15"
                  value={exceptionForm.date}
                  onChange={(e) =>
                    setExceptionForm((f) => ({ ...f, date: e.target.value }))
                  }
                />
              </Field>
              <Field label="یادداشت">
                <input
                  className={styles.input}
                  value={exceptionForm.note}
                  onChange={(e) =>
                    setExceptionForm((f) => ({ ...f, note: e.target.value }))
                  }
                />
              </Field>
              <div className={styles.formWide}>
                <ToggleRow
                  checked={!!exceptionForm.is_closed}
                  onChange={(v) =>
                    setExceptionForm((f) => ({ ...f, is_closed: v }))
                  }
                  label="تعطیل کامل"
                />
              </div>
              <div className={styles.formActions}>
                <button type="submit" className={styles.solidBtn}>
                  ثبت تعطیلی
                </button>
              </div>
            </form>
            {exceptions.length === 0 ? (
              <p className={styles.empty}>تعطیلی ثبت نشده است.</p>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>تاریخ شمسی</th>
                      <th>تعطیل</th>
                      <th>یادداشت</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {exceptions.map((ex) => (
                      <tr key={ex.id}>
                        <td dir="ltr">{ex.jalali_date}</td>
                        <td>{ex.is_closed ? 'بله' : 'خیر'}</td>
                        <td>{ex.note || '—'}</td>
                        <td>
                          <button
                            type="button"
                            className={styles.dangerBtn}
                            onClick={() => deleteException(ex.id)}
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}
      </div>
    </div>
  )
}

export default function BookingManageClient() {
  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.BOOKING}>
      <Suspense fallback={null}>
        <BookingManageInner />
      </Suspense>
    </ModuleGate>
  )
}
