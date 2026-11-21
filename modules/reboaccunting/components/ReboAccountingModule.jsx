'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import {
  BookOpen,
  FilePlus2,
  Landmark,
  Loader2,
  Plus,
  RefreshCw,
  LayoutDashboard,
  Wallet,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  Scale,
  Pencil,
  Trash2,
  Banknote,
  Megaphone,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Config from '@/config/config'
import { isPlatformOwner } from '@/utils/ownerAccess'
import PersianDatePicker from '@/components/common/PersianDatePicker'
import { formatJalaliDate, formatJalaliShort } from '@/utils/dateUtils'
import MoneyAmountField from './MoneyAmountField'
import { formatGroupedDigits, parseGroupedAmount } from '../utils/moneyInput'
import styles from '../styles/ReboAccounting.module.css'

const money = (n, cur = 'تومان') =>
  `${Number(n || 0).toLocaleString('fa-IR')} ${cur}`

const todayIso = () => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const yearStartIso = () => {
  const d = new Date()
  return `${d.getFullYear()}-01-01`
}

const shamsi = (value) => {
  if (!value) return '—'
  const day = String(value).slice(0, 10)
  return formatJalaliDate(day) || formatJalaliShort(day) || day
}

const MODES = [
  { id: 'income', label: 'درآمد', icon: ArrowDownLeft, kind: 'income', category: 'other' },
  { id: 'expense', label: 'هزینه', icon: ArrowUpRight, kind: 'expense', category: 'other' },
  {
    id: 'withdrawal',
    label: 'تن‌خواه',
    icon: Banknote,
    kind: 'expense',
    category: 'partner_withdrawal',
  },
  {
    id: 'cheque_in',
    label: 'دریافت چک',
    icon: Landmark,
    kind: 'income',
    category: 'cheque_in',
  },
  {
    id: 'cheque_out',
    label: 'صدور چک',
    icon: Wallet,
    kind: 'expense',
    category: 'cheque_out',
  },
]

const CATEGORIES_BY_MODE = {
  income: [
    { value: 'other', label: 'سایر درآمد' },
    { value: 'stage_payment', label: 'قسط قرارداد' },
    { value: 'support_renew', label: 'تمدید پشتیبانی' },
    { value: 'server_service', label: 'خدمات سرور' },
    { value: 'barter', label: 'تهاتر' },
  ],
  expense: [
    { value: 'project_cost', label: 'هزینه پروژه' },
    { value: 'ops_expense', label: 'هزینه عملیاتی' },
    { value: 'server_service', label: 'خدمات سرور' },
    { value: 'marketer_commission', label: 'پورسانت بازاریاب' },
    { value: 'marketer_salary', label: 'حقوق بازاریاب' },
    { value: 'other', label: 'سایر هزینه' },
  ],
  withdrawal: [{ value: 'partner_withdrawal', label: 'تن‌خواه' }],
  cheque_in: [{ value: 'cheque_in', label: 'دریافت چک' }],
  cheque_out: [{ value: 'cheque_out', label: 'صدور چک' }],
}

const PAY_MODE_OPTIONS = [
  { value: 'commission', label: 'فقط پورسانت' },
  { value: 'fixed', label: 'فقط حقوق ثابت' },
  { value: 'both', label: 'حقوق ثابت + پورسانت' },
]

const emptyForm = () => ({
  mode: 'income',
  kind: 'income',
  category: 'other',
  title: '',
  amount: '',
  note: '',
  entry_date: todayIso(),
  order_code: '',
  cheque_number: '',
  cheque_bank: '',
  cheque_due_date: '',
  partner_id: '',
  partner_link: '',
  marketer_id: '',
})

const emptyPartnerForm = () => ({
  id: null,
  name: '',
  share_percent: '',
  joined_at: todayIso(),
  left_at: '',
  is_active: true,
  mobile: '',
  note: '',
})

const emptyMarketerForm = () => ({
  id: null,
  name: '',
  mobile: '',
  email: '',
  national_id: '',
  pay_mode: 'commission',
  fixed_salary: '',
  commission_percent: '',
  bank_name: '',
  bank_card: '',
  bank_sheba: '',
  address: '',
  note: '',
  is_active: true,
  joined_at: todayIso(),
  left_at: '',
})

function categoryBadgeClass(category) {
  switch (category) {
    case 'barter':
      return styles.badgeBarter
    case 'cheque_in':
      return styles.badgeChequeIn
    case 'cheque_out':
      return styles.badgeChequeOut
    case 'support_renew':
      return styles.badgeSupport
    case 'server_service':
      return styles.badgeServer
    case 'stage_payment':
      return styles.badgeStage
    case 'partner_withdrawal':
      return styles.badgeWithdraw
    case 'marketer_commission':
    case 'marketer_salary':
      return styles.badgeMarketer
    case 'project_cost':
    case 'ops_expense':
      return styles.badgeOps
    default:
      return styles.badgeOther
  }
}

function EntryDialog({ open, form, setForm, partners, marketers, saving, onClose, onSubmit }) {
  if (!open) return null
  const isCheque = form.mode === 'cheque_in' || form.mode === 'cheque_out'
  const isWithdrawal = form.mode === 'withdrawal'
  const isExpense = form.mode === 'expense'
  const needsMarketer =
    form.category === 'marketer_commission' || form.category === 'marketer_salary'
  const cats = CATEGORIES_BY_MODE[form.mode] || CATEGORIES_BY_MODE.income
  const activePartners = partners.filter((p) => p.is_active && !p.left_at)
  const activeMarketers = marketers.filter((m) => m.is_active && !m.left_at)

  const setMode = (modeId) => {
    const m = MODES.find((x) => x.id === modeId)
    if (!m) return
    setForm((f) => ({
      ...f,
      mode: m.id,
      kind: m.kind,
      category: m.category,
      partner_link:
        m.id === 'withdrawal'
          ? 'withdrawal'
          : m.id === 'expense'
            ? f.partner_id
              ? 'paid_by'
              : ''
            : '',
      title:
        m.id === 'cheque_in'
          ? f.title || 'دریافت چک'
          : m.id === 'cheque_out'
            ? f.title || 'صدور چک'
            : m.id === 'withdrawal'
              ? f.title || 'تن‌خواه از خزانه'
              : f.title,
    }))
  }

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label="ثبت سند حسابداری"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.dialogHead}>
          <div>
            <h2>ثبت سند جدید</h2>
            <p>درآمد، هزینه، تن‌خواه خزانه، چک — با تاریخ شمسی</p>
          </div>
          <button type="button" className={styles.btnGhost} onClick={onClose} aria-label="بستن">
            <X size={16} />
          </button>
        </div>

        <form className={styles.dialogBody} onSubmit={onSubmit}>
          <div className={styles.modeGrid5}>
            {MODES.map((m) => {
              const Icon = m.icon
              const on = form.mode === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  data-mode={m.id}
                  className={on ? styles.modeChipOn : styles.modeChip}
                  onClick={() => setMode(m.id)}
                >
                  <Icon size={15} />
                  {m.label}
                </button>
              )
            })}
          </div>

          <div className={styles.formGrid}>
            {!isCheque && !isWithdrawal ? (
              <label>
                دسته
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                >
                  {cats.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label>
                نوع
                <input
                  value={
                    isWithdrawal
                      ? 'تن‌خواه از خزانه'
                      : form.mode === 'cheque_in'
                        ? 'دریافت چک'
                        : 'صدور چک'
                  }
                  readOnly
                />
              </label>
            )}

            <MoneyAmountField
              label="مبلغ (تومان)"
              required
              value={form.amount}
              onChange={(next) => setForm((f) => ({ ...f, amount: next }))}
              placeholder="مثلاً ۵٬۰۰۰٬۰۰۰"
              unit="تومان"
            />

            <label className={styles.formFull}>
              عنوان
              <input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="شرح سند"
              />
            </label>

            <label>
              تاریخ سند
              <PersianDatePicker
                value={form.entry_date}
                onChange={(d) => setForm((f) => ({ ...f, entry_date: d || f.entry_date }))}
                placeholder="تاریخ شمسی"
                zIndex={130000}
              />
            </label>

            <label>
              کد سفارش (اختیاری)
              <input
                value={form.order_code}
                onChange={(e) => setForm((f) => ({ ...f, order_code: e.target.value }))}
                placeholder="RBO…"
                dir="ltr"
                style={{ textAlign: 'left' }}
              />
            </label>

            {(isExpense || isWithdrawal) && !needsMarketer && (
              <label className={styles.formFull}>
                {isWithdrawal
                  ? 'چه کسی تن‌خواه برداشته؟'
                  : 'پرداخت‌کننده هزینه (اگر از جیب شریک بوده)'}
                <select
                  required={isWithdrawal}
                  value={form.partner_id}
                  onChange={(e) => {
                    const pid = e.target.value
                    setForm((f) => ({
                      ...f,
                      partner_id: pid,
                      partner_link: pid
                        ? isWithdrawal
                          ? 'withdrawal'
                          : 'paid_by'
                        : '',
                    }))
                  }}
                >
                  <option value="">
                    {isWithdrawal ? 'انتخاب شریک…' : 'حساب شرکت / بدون شریک'}
                  </option>
                  {activePartners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({Number(p.share_percent).toLocaleString('fa-IR')}٪)
                    </option>
                  ))}
                </select>
              </label>
            )}

            {needsMarketer ? (
              <label className={styles.formFull}>
                بازاریاب
                <select
                  required
                  value={form.marketer_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, marketer_id: e.target.value }))
                  }
                >
                  <option value="">انتخاب بازاریاب…</option>
                  {activeMarketers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                      {m.pay_mode_display ? ` · ${m.pay_mode_display}` : ''}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {isCheque ? (
              <div
                className={`${styles.chequeBox} ${
                  form.mode === 'cheque_out' ? styles.chequeBoxOut : ''
                }`}
              >
                <label>
                  شماره چک
                  <input
                    required
                    value={form.cheque_number}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, cheque_number: e.target.value }))
                    }
                    placeholder="شماره سریال"
                    dir="ltr"
                    style={{ textAlign: 'left' }}
                  />
                </label>
                <label>
                  بانک
                  <input
                    value={form.cheque_bank}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, cheque_bank: e.target.value }))
                    }
                    placeholder="مثلاً ملت"
                  />
                </label>
                <label className={styles.formFull}>
                  سررسید چک
                  <PersianDatePicker
                    value={form.cheque_due_date}
                    onChange={(d) =>
                      setForm((f) => ({ ...f, cheque_due_date: d || '' }))
                    }
                    placeholder="تاریخ سررسید شمسی"
                    zIndex={130000}
                  />
                </label>
              </div>
            ) : null}

            <label className={styles.formFull}>
              یادداشت
              <textarea
                rows={2}
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="توضیح کوتاه (اختیاری)"
              />
            </label>

            <div className={styles.dialogFoot}>
              <button type="button" className={styles.btn} onClick={onClose} disabled={saving}>
                انصراف
              </button>
              <button type="submit" className={styles.btnPrimary} disabled={saving}>
                {saving ? <Loader2 size={14} className={styles.spin} /> : <Plus size={14} />}
                ثبت سند
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function PartnerDialog({ open, form, setForm, saving, onClose, onSubmit }) {
  if (!open) return null
  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.dialogHead}>
          <div>
            <h2>{form.id ? 'ویرایش شریک' : 'شریک جدید'}</h2>
            <p>نام، درصد سهم و تاریخ ورود به شراکت</p>
          </div>
          <button type="button" className={styles.btnGhost} onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <form className={styles.dialogBody} onSubmit={onSubmit}>
          <div className={styles.formGrid}>
            <label className={styles.formFull}>
              نام
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </label>
            <label>
              سهم (٪)
              <input
                required
                value={form.share_percent}
                onChange={(e) => setForm((f) => ({ ...f, share_percent: e.target.value }))}
                inputMode="decimal"
                placeholder="مثلاً ۵۰"
              />
            </label>
            <label>
              موبایل
              <input
                value={form.mobile}
                onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
                dir="ltr"
                style={{ textAlign: 'left' }}
              />
            </label>
            <label>
              تاریخ ورود
              <PersianDatePicker
                value={form.joined_at}
                onChange={(d) => setForm((f) => ({ ...f, joined_at: d || f.joined_at }))}
                placeholder="شمسی"
                zIndex={130000}
              />
            </label>
            <label>
              تاریخ خروج (اختیاری)
              <PersianDatePicker
                value={form.left_at}
                onChange={(d) => setForm((f) => ({ ...f, left_at: d || '' }))}
                placeholder="اگر خارج شده"
                zIndex={130000}
              />
            </label>
            <label className={styles.formFull}>
              یادداشت
              <textarea
                rows={2}
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              />
            </label>
            <label className={styles.checkRow}>
              <input
                type="checkbox"
                checked={!!form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              />
              شریک فعال
            </label>
            <div className={styles.dialogFoot}>
              <button type="button" className={styles.btn} onClick={onClose} disabled={saving}>
                انصراف
              </button>
              <button type="submit" className={styles.btnPrimary} disabled={saving}>
                {saving ? <Loader2 size={14} className={styles.spin} /> : <Plus size={14} />}
                ذخیره شریک
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function MarketerDialog({ open, form, setForm, saving, onClose, onSubmit }) {
  if (!open) return null
  const showFixed = form.pay_mode === 'fixed' || form.pay_mode === 'both'
  const showCommission = form.pay_mode === 'commission' || form.pay_mode === 'both'
  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.dialogHead}>
          <div>
            <h2>{form.id ? 'ویرایش بازاریاب' : 'بازاریاب جدید'}</h2>
            <p>اطلاعات کامل، نحوه حقوق و پورسانت</p>
          </div>
          <button type="button" className={styles.btnGhost} onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <form className={styles.dialogBody} onSubmit={onSubmit}>
          <div className={styles.formGrid}>
            <label className={styles.formFull}>
              نام
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </label>
            <label>
              موبایل
              <input
                value={form.mobile}
                onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
                dir="ltr"
                style={{ textAlign: 'left' }}
              />
            </label>
            <label>
              کد ملی
              <input
                value={form.national_id}
                onChange={(e) => setForm((f) => ({ ...f, national_id: e.target.value }))}
                dir="ltr"
                style={{ textAlign: 'left' }}
              />
            </label>
            <label>
              ایمیل
              <input
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                dir="ltr"
                style={{ textAlign: 'left' }}
              />
            </label>
            <label>
              نحوه دریافت
              <select
                value={form.pay_mode}
                onChange={(e) => setForm((f) => ({ ...f, pay_mode: e.target.value }))}
              >
                {PAY_MODE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            {showFixed ? (
              <MoneyAmountField
                label="حقوق ثابت ماهانه"
                required={showFixed}
                value={form.fixed_salary}
                onChange={(next) => setForm((f) => ({ ...f, fixed_salary: next }))}
                placeholder="تومان"
                unit="تومان"
              />
            ) : null}
            {showCommission ? (
              <label>
                پورسانت (٪)
                <input
                  required={showCommission}
                  value={form.commission_percent}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, commission_percent: e.target.value }))
                  }
                  inputMode="decimal"
                  placeholder="مثلاً ۱۰"
                />
              </label>
            ) : null}
            <label>
              بانک
              <input
                value={form.bank_name}
                onChange={(e) => setForm((f) => ({ ...f, bank_name: e.target.value }))}
              />
            </label>
            <label>
              کارت
              <input
                value={form.bank_card}
                onChange={(e) => setForm((f) => ({ ...f, bank_card: e.target.value }))}
                dir="ltr"
                style={{ textAlign: 'left' }}
              />
            </label>
            <label className={styles.formFull}>
              شبا
              <input
                value={form.bank_sheba}
                onChange={(e) => setForm((f) => ({ ...f, bank_sheba: e.target.value }))}
                dir="ltr"
                style={{ textAlign: 'left' }}
              />
            </label>
            <label>
              شروع همکاری
              <PersianDatePicker
                value={form.joined_at}
                onChange={(d) => setForm((f) => ({ ...f, joined_at: d || f.joined_at }))}
                placeholder="شمسی"
                zIndex={130000}
              />
            </label>
            <label>
              پایان همکاری
              <PersianDatePicker
                value={form.left_at}
                onChange={(d) => setForm((f) => ({ ...f, left_at: d || '' }))}
                placeholder="اختیاری"
                zIndex={130000}
              />
            </label>
            <label className={styles.formFull}>
              آدرس
              <input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
            </label>
            <label className={styles.formFull}>
              یادداشت
              <textarea
                rows={2}
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              />
            </label>
            <label className={styles.checkRow}>
              <input
                type="checkbox"
                checked={!!form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              />
              بازاریاب فعال
            </label>
            <div className={styles.dialogFoot}>
              <button type="button" className={styles.btn} onClick={onClose} disabled={saving}>
                انصراف
              </button>
              <button type="submit" className={styles.btnPrimary} disabled={saving}>
                {saving ? <Loader2 size={14} className={styles.spin} /> : <Plus size={14} />}
                ذخیره بازاریاب
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ReboAccountingModule() {
  const {
    isAuthenticated,
    loading: authLoading,
    user,
    getAuthHeaders,
    canManageEmployees,
  } = useAuth()

  const isAdmin =
    !!user?.is_superuser ||
    !!user?.is_staff ||
    !!canManageEmployees ||
    isPlatformOwner(user)

  const [summary, setSummary] = useState(null)
  const [journal, setJournal] = useState([])
  const [partners, setPartners] = useState([])
  const [partnerMeta, setPartnerMeta] = useState({ active_share_sum: 0, share_sum_ok: true })
  const [marketers, setMarketers] = useState([])
  const [marketerReport, setMarketerReport] = useState(null)
  const [distribution, setDistribution] = useState(null)
  const [distFrom, setDistFrom] = useState(yearStartIso())
  const [distTo, setDistTo] = useState(todayIso())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false)
  const [marketerDialogOpen, setMarketerDialogOpen] = useState(false)
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [partnerForm, setPartnerForm] = useState(emptyPartnerForm)
  const [marketerForm, setMarketerForm] = useState(emptyMarketerForm)
  const [tab, setTab] = useState('overview')

  const TABS = [
    { id: 'overview', label: 'خلاصه', icon: BookOpen },
    { id: 'partners', label: 'شرکا', icon: Users },
    { id: 'marketers', label: 'بازاریابان', icon: Megaphone },
    { id: 'tankhah', label: 'تن‌خواه', icon: Banknote },
    { id: 'split', label: 'تقسیم سود', icon: Scale },
    { id: 'journal', label: 'دفتر روزنامه', icon: FilePlus2 },
  ]

  const load = useCallback(async () => {
    setErr('')
    setLoading(true)
    try {
      const headers = getAuthHeaders()
      const [s, j, p, d, m] = await Promise.all([
        axios.get(Config.endpoints.reboOrders.accountingSummary(), { headers }),
        axios.get(Config.endpoints.reboOrders.accountingJournal({ limit: 200 }), {
          headers,
        }),
        axios.get(Config.endpoints.reboOrders.accountingPartners(), { headers }),
        axios.get(
          Config.endpoints.reboOrders.accountingDistribution({
            from: distFrom,
            to: distTo,
          }),
          { headers },
        ),
        axios.get(
          Config.endpoints.reboOrders.accountingMarketers({ settlement: 1 }),
          { headers },
        ),
      ])
      if (!s.data?.success) throw new Error(s.data?.message || 'خلاصه ناموفق')
      if (!j.data?.success) throw new Error(j.data?.message || 'دفتر ناموفق')
      setSummary(s.data?.data || null)
      setJournal(Array.isArray(j.data?.data) ? j.data.data : [])
      setPartners(Array.isArray(p.data?.data) ? p.data.data : [])
      setPartnerMeta(p.data?.meta || { active_share_sum: 0, share_sum_ok: true })
      setDistribution(d.data?.success ? d.data.data : null)
      const report = m.data?.success ? m.data.data : null
      setMarketerReport(report)
      setMarketers(Array.isArray(report?.marketers) ? report.marketers : [])
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || 'خطا در بارگذاری حسابداری')
      setSummary(null)
      setJournal([])
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders, distFrom, distTo])

  useEffect(() => {
    if (isAuthenticated && isAdmin) load()
  }, [isAuthenticated, isAdmin, load])

  const openDialog = (preset = 'income') => {
    const base = emptyForm()
    const m = MODES.find((x) => x.id === preset) || MODES[0]
    setForm({
      ...base,
      mode: m.id,
      kind: m.kind,
      category: m.category,
      partner_link: m.id === 'withdrawal' ? 'withdrawal' : '',
      title:
        m.id === 'cheque_in'
          ? 'دریافت چک'
          : m.id === 'cheque_out'
            ? 'صدور چک'
            : m.id === 'withdrawal'
              ? 'تن‌خواه از خزانه'
              : '',
    })
    setErr('')
    setDialogOpen(true)
  }

  const submitEntry = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErr('')
    setOk('')
    try {
      const isCheque = form.mode === 'cheque_in' || form.mode === 'cheque_out'
      const payload = {
        kind: form.kind,
        category: form.category || 'other',
        title: form.title.trim(),
        amount: parseGroupedAmount(form.amount),
        note: form.note || '',
        entry_date: form.entry_date || undefined,
        order_code: form.order_code.trim() || undefined,
        partner_id: form.partner_id || undefined,
        partner_link: form.partner_link || undefined,
        marketer_id: form.marketer_id || undefined,
      }
      if (
        (form.category === 'marketer_commission' || form.category === 'marketer_salary') &&
        !form.marketer_id
      ) {
        throw new Error('بازاریاب را انتخاب کنید')
      }
      if (isCheque) {
        payload.cheque_number = form.cheque_number.trim()
        payload.cheque_bank = form.cheque_bank.trim()
        payload.cheque_due_date = form.cheque_due_date || undefined
        if (!payload.cheque_number) throw new Error('شماره چک الزامی است')
        if (form.cheque_due_date) {
          payload.note = [payload.note, `سررسید شمسی ${shamsi(form.cheque_due_date)}`]
            .filter(Boolean)
            .join(' — ')
        }
      }
      if (form.mode === 'withdrawal' && !form.partner_id) {
        throw new Error('شریکی که تن‌خواه برداشته را انتخاب کنید')
      }
      const res = await axios.post(
        Config.endpoints.reboOrders.accountingJournal(),
        payload,
        { headers: getAuthHeaders() },
      )
      if (!res.data?.success) throw new Error(res.data?.message || 'ثبت نشد')
      setOk(res.data.message || 'سند ثبت شد')
      setDialogOpen(false)
      setForm(emptyForm())
      await load()
    } catch (ex) {
      setErr(ex?.response?.data?.message || ex.message || 'ثبت نشد')
    } finally {
      setSaving(false)
    }
  }

  const submitPartner = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErr('')
    setOk('')
    try {
      const payload = {
        name: partnerForm.name.trim(),
        share_percent: Number(String(partnerForm.share_percent).replace(/,/g, '')),
        joined_at: partnerForm.joined_at,
        left_at: partnerForm.left_at || null,
        is_active: !!partnerForm.is_active,
        mobile: partnerForm.mobile || '',
        note: partnerForm.note || '',
      }
      let res
      if (partnerForm.id) {
        res = await axios.post(
          Config.endpoints.reboOrders.accountingPartner(partnerForm.id),
          payload,
          { headers: getAuthHeaders() },
        )
      } else {
        res = await axios.post(
          Config.endpoints.reboOrders.accountingPartners(),
          payload,
          { headers: getAuthHeaders() },
        )
      }
      if (!res.data?.success) throw new Error(res.data?.message || 'ذخیره نشد')
      setOk(res.data.message || 'شریک ذخیره شد')
      setPartnerDialogOpen(false)
      setPartnerForm(emptyPartnerForm())
      await load()
    } catch (ex) {
      setErr(ex?.response?.data?.message || ex.message || 'ذخیره نشد')
    } finally {
      setSaving(false)
    }
  }

  const removePartner = async (p) => {
    if (!p?.id) return
    if (!window.confirm(`شریک «${p.name}» حذف/غیرفعال شود؟`)) return
    setSaving(true)
    try {
      await axios.delete(Config.endpoints.reboOrders.accountingPartner(p.id), {
        headers: getAuthHeaders(),
      })
      setOk('شریک حذف/غیرفعال شد')
      await load()
    } catch (ex) {
      setErr(ex?.response?.data?.message || ex.message || 'حذف نشد')
    } finally {
      setSaving(false)
    }
  }

  const submitMarketer = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErr('')
    setOk('')
    try {
      const payload = {
        name: marketerForm.name.trim(),
        mobile: marketerForm.mobile || '',
        email: marketerForm.email || '',
        national_id: marketerForm.national_id || '',
        pay_mode: marketerForm.pay_mode || 'commission',
        fixed_salary: parseGroupedAmount(marketerForm.fixed_salary),
        commission_percent: Number(
          String(marketerForm.commission_percent || 0).replace(/,/g, ''),
        ),
        bank_name: marketerForm.bank_name || '',
        bank_card: marketerForm.bank_card || '',
        bank_sheba: marketerForm.bank_sheba || '',
        address: marketerForm.address || '',
        note: marketerForm.note || '',
        is_active: !!marketerForm.is_active,
        joined_at: marketerForm.joined_at,
        left_at: marketerForm.left_at || null,
      }
      let res
      if (marketerForm.id) {
        res = await axios.post(
          Config.endpoints.reboOrders.accountingMarketer(marketerForm.id),
          payload,
          { headers: getAuthHeaders() },
        )
      } else {
        res = await axios.post(
          Config.endpoints.reboOrders.accountingMarketers(),
          payload,
          { headers: getAuthHeaders() },
        )
      }
      if (!res.data?.success) throw new Error(res.data?.message || 'ذخیره نشد')
      setOk(res.data.message || 'بازاریاب ذخیره شد')
      setMarketerDialogOpen(false)
      setMarketerForm(emptyMarketerForm())
      await load()
    } catch (ex) {
      setErr(ex?.response?.data?.message || ex.message || 'ذخیره نشد')
    } finally {
      setSaving(false)
    }
  }

  const removeMarketer = async (m) => {
    if (!m?.id) return
    if (!window.confirm(`بازاریاب «${m.name}» حذف/غیرفعال شود؟`)) return
    setSaving(true)
    try {
      await axios.delete(Config.endpoints.reboOrders.accountingMarketer(m.id), {
        headers: getAuthHeaders(),
      })
      setOk('بازاریاب حذف/غیرفعال شد')
      await load()
    } catch (ex) {
      setErr(ex?.response?.data?.message || ex.message || 'حذف نشد')
    } finally {
      setSaving(false)
    }
  }

  const currency = summary?.currency_label || 'تومان'
  const income = summary?.income ?? 0
  const expense = summary?.expense ?? 0
  const profit = summary?.profit ?? income - expense

  const tankhah = useMemo(() => {
    const rows = journal.filter(
      (r) =>
        r.category === 'partner_withdrawal' || r.partner_link === 'withdrawal',
    )
    const byPartner = {}
    let total = 0
    rows.forEach((r) => {
      const key = r.partner_id || 0
      const name = r.partner_name || 'نامشخص'
      if (!byPartner[key]) {
        byPartner[key] = { partner_id: key, name, total: 0, count: 0 }
      }
      byPartner[key].total += Number(r.amount || 0)
      byPartner[key].count += 1
      total += Number(r.amount || 0)
    })
    return {
      rows,
      total,
      byPartner: Object.values(byPartner).sort((a, b) => b.total - a.total),
    }
  }, [journal])

  if (authLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.wrap}>
          <div className={styles.state}>
            <Loader2 size={16} className={styles.spin} /> در حال بررسی ورود…
          </div>
        </div>
      </div>
    )
  }
  if (!isAuthenticated) {
    return (
      <div className={styles.page}>
        <div className={styles.wrap}>
          <div className={styles.err}>برای مشاهده حسابداری وارد شوید.</div>
          <Link href="/login" className={styles.btnPrimary}>
            ورود
          </Link>
        </div>
      </div>
    )
  }
  if (!isAdmin) {
    return (
      <div className={styles.page}>
        <div className={styles.wrap}>
          <div className={styles.err}>فقط مدیر به دفتر حسابداری ربو دسترسی دارد.</div>
          <Link href="/todorebo" className={styles.btn}>
            بازگشت به میز کار
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <h1>
              <BookOpen size={18} />
              حسابداری ربو
            </h1>
            <p>دفتر روزنامه، شرکا، تن‌خواه خزانه، چک و تقسیم سود</p>
          </div>
          <div className={styles.actions}>
            <Link href="/todorebo" className={styles.btn}>
              <LayoutDashboard size={14} />
              میز کار
            </Link>
            <button type="button" className={styles.btn} onClick={load} disabled={loading}>
              <RefreshCw size={14} className={loading ? styles.spin : undefined} />
              بروزرسانی
            </button>
            {tab === 'tankhah' ? (
              <button
                type="button"
                className={styles.btnTankhah}
                onClick={() => openDialog('withdrawal')}
              >
                <Banknote size={14} />
                ثبت تن‌خواه
              </button>
            ) : null}
            {tab === 'partners' ? (
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => {
                  setPartnerForm(emptyPartnerForm())
                  setPartnerDialogOpen(true)
                }}
              >
                <Plus size={14} />
                شریک جدید
              </button>
            ) : null}
            {tab === 'marketers' ? (
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => {
                  setMarketerForm(emptyMarketerForm())
                  setMarketerDialogOpen(true)
                }}
              >
                <Plus size={14} />
                بازاریاب جدید
              </button>
            ) : null}
            {tab === 'journal' || tab === 'overview' ? (
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => openDialog('income')}
              >
                <FilePlus2 size={14} />
                ثبت سند
              </button>
            ) : null}
          </div>
        </header>

        <nav className={styles.tabs} aria-label="بخش‌های حسابداری">
          {TABS.map((t) => {
            const Icon = t.icon
            const on = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                className={on ? styles.tabOn : styles.tab}
                onClick={() => setTab(t.id)}
              >
                <Icon size={13} />
                {t.label}
              </button>
            )
          })}
        </nav>

        {err ? <div className={styles.err}>{err}</div> : null}
        {ok ? <div className={styles.ok}>{ok}</div> : null}

        {tab === 'overview' ? (
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2>
                <BookOpen size={14} />
                خلاصه وضعیت
              </h2>
            </div>
            <div className={styles.grid}>
              <div className={`${styles.stat} ${styles.statIncome}`}>
                <span>درآمد کل</span>
                <strong>{money(income, currency)}</strong>
              </div>
              <div className={`${styles.stat} ${styles.statExpense}`}>
                <span>هزینه کل</span>
                <strong>{money(expense, currency)}</strong>
              </div>
              <div className={`${styles.stat} ${styles.statProfit}`}>
                <span>سود / زیان</span>
                <strong>{money(profit, currency)}</strong>
              </div>
              <div className={styles.stat}>
                <span>جمع سهم شرکای فعال</span>
                <strong
                  style={{
                    color: partnerMeta.share_sum_ok ? 'var(--in)' : 'var(--out)',
                  }}
                >
                  {Number(partnerMeta.active_share_sum || 0).toLocaleString('fa-IR')}٪
                </strong>
              </div>
            </div>
            <div className={styles.overviewCards}>
              <button type="button" className={styles.overviewCard} onClick={() => setTab('partners')}>
                <Users size={16} />
                <strong>شرکا</strong>
                <span>{Number(partners.length).toLocaleString('fa-IR')} نفر</span>
              </button>
              <button type="button" className={styles.overviewCard} onClick={() => setTab('marketers')}>
                <Megaphone size={16} />
                <strong>بازاریابان</strong>
                <span>{Number(marketers.length).toLocaleString('fa-IR')} نفر</span>
              </button>
              <button type="button" className={styles.overviewCard} onClick={() => setTab('tankhah')}>
                <Banknote size={16} />
                <strong>تن‌خواه</strong>
                <span>{money(tankhah.total, currency)}</span>
              </button>
              <button type="button" className={styles.overviewCard} onClick={() => setTab('split')}>
                <Scale size={16} />
                <strong>تقسیم سود</strong>
                <span>{money(distribution?.net_profit, currency)}</span>
              </button>
              <button type="button" className={styles.overviewCard} onClick={() => setTab('journal')}>
                <FilePlus2 size={16} />
                <strong>دفتر روزنامه</strong>
                <span>{Number(journal.length).toLocaleString('fa-IR')} سند</span>
              </button>
            </div>
          </section>
        ) : null}

        {tab === 'partners' ? (
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2>
                <Users size={14} />
                شرکا
              </h2>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => {
                  setPartnerForm(emptyPartnerForm())
                  setPartnerDialogOpen(true)
                }}
              >
                <Plus size={12} />
                شریک
              </button>
            </div>
            {!partnerMeta.share_sum_ok ? (
              <p className={styles.hintWarn}>
                جمع سهم فعال:{' '}
                {Number(partnerMeta.active_share_sum || 0).toLocaleString('fa-IR')}٪ — بهتر است
                ۱۰۰٪ باشد.
              </p>
            ) : null}
            <div className={styles.partnerGridWide}>
              {partners.length === 0 ? (
                <p className={styles.muted}>شریکی نیست.</p>
              ) : (
                partners.map((p) => (
                  <article key={p.id} className={styles.partnerCard}>
                    <div className={styles.partnerTop}>
                      <strong>{p.name}</strong>
                      <span className={`${styles.badge} ${styles.badgeStage}`}>
                        {Number(p.share_percent).toLocaleString('fa-IR')}٪
                      </span>
                    </div>
                    <div className={styles.partnerMeta}>
                      ورود: {shamsi(p.joined_at)}
                      {p.left_at ? ` · خروج: ${shamsi(p.left_at)}` : ''}
                      {!p.is_active ? ' · غیرفعال' : ''}
                    </div>
                    <div className={styles.partnerActions}>
                      <button
                        type="button"
                        className={styles.btn}
                        onClick={() => {
                          setPartnerForm({
                            id: p.id,
                            name: p.name,
                            share_percent: String(p.share_percent),
                            joined_at: p.joined_at || todayIso(),
                            left_at: p.left_at || '',
                            is_active: !!p.is_active,
                            mobile: p.mobile || '',
                            note: p.note || '',
                          })
                          setPartnerDialogOpen(true)
                        }}
                      >
                        <Pencil size={11} />
                        ویرایش
                      </button>
                      <button
                        type="button"
                        className={styles.btn}
                        onClick={() => removePartner(p)}
                        disabled={saving}
                      >
                        <Trash2 size={11} />
                        حذف
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        ) : null}

        {tab === 'marketers' ? (
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2>
                <Megaphone size={14} />
                بازاریابان
              </h2>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => {
                  setMarketerForm(emptyMarketerForm())
                  setMarketerDialogOpen(true)
                }}
              >
                <Plus size={12} />
                بازاریاب
              </button>
            </div>
            {marketerReport?.totals ? (
              <div className={styles.grid} style={{ marginBottom: 10 }}>
                <div className={styles.stat}>
                  <span>پورسانت تعلق‌گرفته</span>
                  <strong>
                    {money(marketerReport.totals.accrued_commission, currency)}
                  </strong>
                </div>
                <div className={`${styles.stat} ${styles.statExpense}`}>
                  <span>ثبت‌شده در دفتر (پورسانت)</span>
                  <strong>
                    {money(marketerReport.totals.ledger_commission, currency)}
                  </strong>
                </div>
                <div className={`${styles.stat} ${styles.statExpense}`}>
                  <span>حقوق ثبت‌شده</span>
                  <strong>{money(marketerReport.totals.ledger_salary, currency)}</strong>
                </div>
              </div>
            ) : null}
            <div className={styles.partnerGridWide}>
              {marketers.length === 0 ? (
                <p className={styles.muted}>بازاریابی ثبت نشده.</p>
              ) : (
                marketers.map((m) => (
                  <article key={m.id} className={styles.partnerCard}>
                    <div className={styles.partnerTop}>
                      <strong>{m.name}</strong>
                      <span className={`${styles.badge} ${styles.badgeMarketer}`}>
                        {m.pay_mode_display || m.pay_mode}
                      </span>
                    </div>
                    <div className={styles.partnerMeta}>
                      {m.mobile ? `${m.mobile} · ` : ''}
                      {m.has_fixed_salary
                        ? `حقوق ${money(m.fixed_salary, currency)}`
                        : ''}
                      {m.has_fixed_salary && m.has_commission ? ' · ' : ''}
                      {m.has_commission
                        ? `پورسانت ${Number(m.commission_percent).toLocaleString('fa-IR')}٪`
                        : ''}
                    </div>
                    <div className={styles.partnerMeta}>
                      سفارش‌ها: {Number(m.orders_count || 0).toLocaleString('fa-IR')}
                      {' · '}
                      پورسانت: {money(m.accrued_commission, currency)}
                      {!m.is_active ? ' · غیرفعال' : ''}
                    </div>
                    {(m.orders || []).length > 0 ? (
                      <div className={styles.marketerOrders}>
                        {m.orders.slice(0, 4).map((o) => (
                          <Link
                            key={o.order_id}
                            className={styles.orderLink}
                            href={`/todorebo?code=${encodeURIComponent(o.code)}`}
                          >
                            {o.code}
                            <span>
                              {' '}
                              · پرداخت {money(o.paid_amount, currency)} · مانده{' '}
                              {money(o.remaining_amount, currency)}
                              {o.commission_due
                                ? ` · سهم ${money(o.commission_due, currency)}`
                                : ''}
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : null}
                    <div className={styles.partnerActions}>
                      <button
                        type="button"
                        className={styles.btn}
                        onClick={() => {
                          setMarketerForm({
                            id: m.id,
                            name: m.name || '',
                            mobile: m.mobile || '',
                            email: m.email || '',
                            national_id: m.national_id || '',
                            pay_mode: m.pay_mode || 'commission',
                            fixed_salary: String(m.fixed_salary || ''),
                            commission_percent: String(m.commission_percent || ''),
                            bank_name: m.bank_name || '',
                            bank_card: m.bank_card || '',
                            bank_sheba: m.bank_sheba || '',
                            address: m.address || '',
                            note: m.note || '',
                            is_active: !!m.is_active,
                            joined_at: m.joined_at || todayIso(),
                            left_at: m.left_at || '',
                          })
                          setMarketerDialogOpen(true)
                        }}
                      >
                        <Pencil size={11} />
                        ویرایش
                      </button>
                      <button
                        type="button"
                        className={styles.btn}
                        onClick={() => removeMarketer(m)}
                        disabled={saving}
                      >
                        <Trash2 size={11} />
                        حذف
                      </button>
                      <button
                        type="button"
                        className={styles.btn}
                        onClick={() => {
                          setForm({
                            ...emptyForm(),
                            mode: 'expense',
                            kind: 'expense',
                            category: 'marketer_salary',
                            marketer_id: String(m.id),
                            title: `حقوق بازاریاب — ${m.name}`,
                            amount: m.fixed_salary
                              ? formatGroupedDigits(m.fixed_salary)
                              : '',
                          })
                          setDialogOpen(true)
                        }}
                      >
                        <Banknote size={11} />
                        ثبت حقوق
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        ) : null}

        {tab === 'tankhah' ? (
          <section className={styles.panel} id="tankhah">
            <div className={styles.panelHead}>
              <h2>
                <Banknote size={14} />
                تن‌خواه خزانه
              </h2>
              <button
                type="button"
                className={styles.btnTankhah}
                onClick={() => openDialog('withdrawal')}
              >
                <Plus size={12} />
                ثبت تن‌خواه
              </button>
            </div>
            <div className={styles.tankhahTotal}>
              <span>جمع تن‌خواه</span>
              <strong>{money(tankhah.total, currency)}</strong>
            </div>
            <div className={styles.partnerGridWide}>
              {tankhah.byPartner.length === 0 ? (
                <p className={styles.muted}>تن‌خواهی ثبت نشده.</p>
              ) : (
                tankhah.byPartner.map((p) => (
                  <article key={p.partner_id || p.name} className={styles.tankhahCard}>
                    <div className={styles.partnerTop}>
                      <strong>{p.name}</strong>
                      <span className={`${styles.badge} ${styles.badgeWithdraw}`}>
                        {Number(p.count).toLocaleString('fa-IR')} مورد
                      </span>
                    </div>
                    <div className={styles.tankhahAmount}>{money(p.total, currency)}</div>
                  </article>
                ))
              )}
            </div>
            {tankhah.rows.length > 0 ? (
              <div className={`${styles.tableWrap} ${styles.tableWide}`} style={{ marginTop: 8 }}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>تاریخ</th>
                      <th>شریک</th>
                      <th>عنوان</th>
                      <th>مبلغ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tankhah.rows.map((row) => (
                      <tr key={row.id}>
                        <td>{shamsi(row.entry_date)}</td>
                        <td className={styles.rowTitle}>{row.partner_name || '—'}</td>
                        <td>
                          <div>{row.title}</div>
                          {row.note ? <div className={styles.rowNote}>{row.note}</div> : null}
                        </td>
                        <td className={styles.amountOut}>
                          {money(row.amount, row.currency_label || currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
        ) : null}

        {tab === 'split' ? (
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2>
                <Scale size={14} />
                تقسیم سود
              </h2>
              <div className={styles.dateFilters}>
                <PersianDatePicker
                  value={distFrom}
                  onChange={(d) => setDistFrom(d || distFrom)}
                  placeholder="از تاریخ"
                  zIndex={120000}
                />
                <PersianDatePicker
                  value={distTo}
                  onChange={(d) => setDistTo(d || distTo)}
                  placeholder="تا تاریخ"
                  zIndex={120000}
                />
              </div>
            </div>
            {distribution ? (
              <>
                <div className={styles.distSummary}>
                  <div>
                    <span>درآمد بازه</span>
                    <strong className={styles.amountIn}>
                      {money(distribution.income_total, currency)}
                    </strong>
                  </div>
                  <div>
                    <span>هزینه عملیاتی</span>
                    <strong className={styles.amountOut}>
                      {money(distribution.expense_total, currency)}
                    </strong>
                  </div>
                  <div>
                    <span>تن‌خواه شرکا</span>
                    <strong>{money(distribution.withdrawal_total, currency)}</strong>
                  </div>
                  <div>
                    <span>سود خالص قابل تقسیم</span>
                    <strong>{money(distribution.net_profit, currency)}</strong>
                  </div>
                </div>
                <p className={styles.muted}>
                  تسویه = سهم سود (با تاریخ ورود) + پرداخت شخصی − تن‌خواه
                </p>
                <div className={`${styles.tableWrap} ${styles.tableWide}`}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>شریک</th>
                        <th>سهم</th>
                        <th>ورود</th>
                        <th>سهم از سود</th>
                        <th>پرداخت شخصی</th>
                        <th>تن‌خواه</th>
                        <th>مانده تسویه</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(distribution.partners || []).map((row) => (
                        <tr key={row.id}>
                          <td className={styles.rowTitle}>{row.name}</td>
                          <td>
                            <span className={`${styles.badge} ${styles.badgeStage}`}>
                              {Number(row.share_percent).toLocaleString('fa-IR')}٪
                            </span>
                          </td>
                          <td>{shamsi(row.joined_at)}</td>
                          <td>{money(row.profit_share, currency)}</td>
                          <td className={styles.amountIn}>
                            {money(row.paid_by_total, currency)}
                          </td>
                          <td className={styles.amountOut}>
                            {money(row.withdrawn_total, currency)}
                          </td>
                          <td>
                            <div
                              className={
                                row.settlement > 0
                                  ? styles.amountIn
                                  : row.settlement < 0
                                    ? styles.amountOut
                                    : ''
                              }
                            >
                              {money(row.settlement, currency)}
                            </div>
                            <div className={styles.rowNote}>{row.settlement_label}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className={styles.muted}>برای مشاهده تقسیم سود، بازه را انتخاب کنید.</p>
            )}
          </section>
        ) : null}

        {tab === 'journal' ? (
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2>دفتر روزنامه</h2>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.btnTankhah}
                  onClick={() => openDialog('withdrawal')}
                >
                  <Banknote size={13} />
                  تن‌خواه
                </button>
                <button type="button" className={styles.btn} onClick={() => openDialog('cheque_in')}>
                  <Landmark size={13} />
                  دریافت چک
                </button>
                <button type="button" className={styles.btn} onClick={() => openDialog('cheque_out')}>
                  <Wallet size={13} />
                  صدور چک
                </button>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={() => openDialog('income')}
                >
                  <Plus size={13} />
                  سند جدید
                </button>
              </div>
            </div>

            {loading ? (
              <div className={styles.state}>
                <Loader2 size={16} className={styles.spin} /> در حال بارگذاری…
              </div>
            ) : (
              <div className={`${styles.tableWrap} ${styles.tableWide}`}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>تاریخ</th>
                      <th>نوع</th>
                      <th>دسته</th>
                      <th>شریک / بازاریاب</th>
                      <th>عنوان</th>
                      <th>سفارش</th>
                      <th>مبلغ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {journal.length === 0 ? (
                      <tr>
                        <td colSpan={7}>سندی ثبت نشده است.</td>
                      </tr>
                    ) : (
                      journal.map((row) => (
                        <tr key={row.id}>
                          <td>{shamsi(row.entry_date)}</td>
                          <td>
                            <span
                              className={`${styles.badge} ${
                                row.kind === 'expense' ? styles.badgeOut : styles.badgeIn
                              }`}
                            >
                              {row.kind_display || (row.kind === 'expense' ? 'هزینه' : 'درآمد')}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`${styles.badge} ${categoryBadgeClass(row.category)}`}
                            >
                              {row.category_display || row.category || '—'}
                            </span>
                          </td>
                          <td>
                            {row.marketer_name ? (
                              <>
                                <div className={styles.rowTitle}>{row.marketer_name}</div>
                                <div className={styles.rowNote}>بازاریاب</div>
                              </>
                            ) : row.partner_name ? (
                              <>
                                <div className={styles.rowTitle}>{row.partner_name}</div>
                                <div className={styles.rowNote}>
                                  {row.partner_link_display || row.partner_link || ''}
                                </div>
                              </>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td>
                            <div className={styles.rowTitle}>{row.title}</div>
                            {row.note ? <div className={styles.rowNote}>{row.note}</div> : null}
                          </td>
                          <td dir="ltr" style={{ textAlign: 'left' }}>
                            {row.order_code ? (
                              <Link
                                className={styles.orderLink}
                                href={`/todorebo?code=${encodeURIComponent(row.order_code)}`}
                              >
                                {row.order_code}
                              </Link>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td
                            className={
                              row.kind === 'expense' ? styles.amountOut : styles.amountIn
                            }
                          >
                            {money(row.amount, row.currency_label || currency)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}
      </div>

      <EntryDialog
        open={dialogOpen}
        form={form}
        setForm={setForm}
        partners={partners}
        marketers={marketers}
        saving={saving}
        onClose={() => setDialogOpen(false)}
        onSubmit={submitEntry}
      />
      <PartnerDialog
        open={partnerDialogOpen}
        form={partnerForm}
        setForm={setPartnerForm}
        saving={saving}
        onClose={() => setPartnerDialogOpen(false)}
        onSubmit={submitPartner}
      />
      <MarketerDialog
        open={marketerDialogOpen}
        form={marketerForm}
        setForm={setMarketerForm}
        saving={saving}
        onClose={() => setMarketerDialogOpen(false)}
        onSubmit={submitMarketer}
      />
    </div>
  )
}
