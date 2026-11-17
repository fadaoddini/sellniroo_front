'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BookOpen,
  Calculator,
  Plus,
  RefreshCw,
  Scale,
  Trash2,
  Wallet,
} from 'lucide-react'
import repairsService from '@/components/Repairs/services/repairsService'
import PersianDatePicker from '@/components/common/PersianDatePicker'
import ReceiptDropzone from '@/components/Repairs/ReceiptDropzone'
import { formatJalaliDate, formatJalaliShort } from '@/utils/dateUtils'
import { useTodoService } from '../context/TodoServiceContext'
import styles from '../styles/Board.module.css'

const fa = (n) => Number(n || 0).toLocaleString('fa-IR')

function shamsi(value) {
  if (!value) return '—'
  const day = String(value).slice(0, 10)
  return formatJalaliDate(day) || formatJalaliShort(day) || day
}

function daysAgoIso(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function todayIso() {
  return daysAgoIso(0)
}

const TABS = [
  { id: 'overview', label: 'خلاصه', icon: Wallet },
  { id: 'journal', label: 'دفتر روزنامه', icon: BookOpen },
  { id: 'expenses', label: 'هزینه‌ها', icon: Plus },
  { id: 'trial', label: 'تراز', icon: Scale },
]

const emptyExpense = {
  title: '',
  amount: '',
  category: 'other',
  expense_date: todayIso(),
  document_no: '',
  note: '',
  job_id: '',
}

export default function AccountingPanel() {
  const { flash, busy } = useTodoService()
  const [tab, setTab] = useState('overview')
  const [from, setFrom] = useState(daysAgoIso(30))
  const [to, setTo] = useState(todayIso())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyExpense)
  const [receiptFile, setReceiptFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const res = await repairsService.accounting({
      from: from || undefined,
      to: to || undefined,
    })
    setLoading(false)
    if (!res.success) {
      setData(null)
      setError(res.error || 'خطا در بارگذاری حسابداری')
      return
    }
    setData(res.data)
  }, [from, to])

  useEffect(() => {
    load()
  }, [load])

  const summary = data?.summary || {}
  const ledger = data?.ledger || []
  const expenses = data?.expenses || []
  const trial = data?.trial_balance || { rows: [], totals: {} }
  const categories = data?.expense_categories || []

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const submitExpense = async () => {
    if (!form.title.trim()) return flash(false, 'عنوان هزینه لازم است')
    if (!Number(form.amount)) return flash(false, 'مبلغ معتبر نیست')
    const fd = new FormData()
    fd.append('title', form.title.trim())
    fd.append('amount', String(Number(form.amount)))
    fd.append('category', form.category || 'other')
    fd.append('expense_date', form.expense_date || todayIso())
    if (form.document_no) fd.append('document_no', form.document_no)
    if (form.note) fd.append('note', form.note)
    if (form.job_id) fd.append('job_id', String(form.job_id))
    if (receiptFile) fd.append('receipt_image', receiptFile)
    setSaving(true)
    const res = await repairsService.createExpense(fd)
    setSaving(false)
    if (!res.success) return flash(false, res.error || 'خطا در ثبت هزینه')
    flash(true, res.message || 'هزینه ثبت شد')
    setForm({ ...emptyExpense, expense_date: form.expense_date || todayIso() })
    setReceiptFile(null)
    load()
    setTab('journal')
  }

  const removeExpense = async (id) => {
    if (!id) return
    if (typeof window !== 'undefined' && !window.confirm('این هزینه حذف شود؟')) {
      return
    }
    const res = await repairsService.deleteExpense(id)
    if (!res.success) return flash(false, res.error)
    flash(true, res.message || 'حذف شد')
    load()
  }

  const periodLabel = useMemo(() => {
    if (!data?.period) return ''
    return `${shamsi(data.period.from)} تا ${shamsi(data.period.to)}`
  }, [data])

  return (
    <div className={styles.acctPanel} dir="rtl">
      <header className={styles.acctHead}>
        <div>
          <p className={styles.acctEyebrow}>
            <Calculator size={14} /> حسابداری تعمیرات
          </p>
          <h2>دفتر مالی واحد سرویس</h2>
          <p className={styles.acctLead}>
            درآمد پرداخت‌ها، هزینه‌ها با سند، دفتر روزنامه و تراز دوره
            {periodLabel ? ` · ${periodLabel}` : ''}
          </p>
        </div>
        <button
          type="button"
          className={styles.intakeBtnGhost}
          disabled={loading || busy}
          onClick={load}
        >
          <RefreshCw size={14} /> بروزرسانی
        </button>
      </header>

      <div className={styles.acctPeriod}>
        <label>
          از تاریخ
          <PersianDatePicker
            value={from}
            onChange={(d) => setFrom(d || from)}
            placeholder="از"
            zIndex={120000}
          />
        </label>
        <label>
          تا تاریخ
          <PersianDatePicker
            value={to}
            onChange={(d) => setTo(d || to)}
            placeholder="تا"
            zIndex={120000}
          />
        </label>
        <button
          type="button"
          className={styles.intakeBtnPrimary}
          onClick={load}
          disabled={loading}
        >
          اعمال بازه
        </button>
      </div>

      <div className={styles.acctTabs}>
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              type="button"
              className={`${styles.chip} ${
                tab === t.id ? styles.chipActive : styles.chipGold
              }`}
              onClick={() => setTab(t.id)}
            >
              <Icon size={13} />
              {t.label}
            </button>
          )
        })}
      </div>

      {error ? <p className={`${styles.msg} ${styles.msgErr}`}>{error}</p> : null}
      {loading && !data ? (
        <p className={styles.archiveEmpty}>در حال بارگذاری حسابداری…</p>
      ) : null}

      {tab === 'overview' && data ? (
        <section className={styles.acctSection}>
          <div className={styles.acctStats}>
            <div className={styles.acctStat}>
              <span>درآمد دوره</span>
              <strong>{fa(summary.revenue)} ت</strong>
            </div>
            <div className={styles.acctStat}>
              <span>هزینه‌ها</span>
              <strong>{fa(summary.expenses)} ت</strong>
            </div>
            <div
              className={`${styles.acctStat} ${
                Number(summary.net || 0) >= 0
                  ? styles.acctStatOk
                  : styles.acctStatBad
              }`}
            >
              <span>خالص</span>
              <strong>{fa(summary.net)} ت</strong>
            </div>
            <div className={styles.acctStat}>
              <span>مطالبات</span>
              <strong>{fa(summary.receivables)} ت</strong>
            </div>
            <div className={styles.acctStat}>
              <span>رسید منتظر</span>
              <strong>{fa(summary.pending_receipts)}</strong>
            </div>
            <div className={styles.acctStat}>
              <span>سفارش باز</span>
              <strong>{fa(summary.jobs_open)}</strong>
            </div>
          </div>

          {(data.by_expense_category || []).length ? (
            <div className={styles.acctBlock}>
              <h3>هزینه به تفکیک دسته</h3>
              <div className={styles.acctCatList}>
                {data.by_expense_category.map((row) => (
                  <div key={row.category} className={styles.acctCatRow}>
                    <span>{row.category_label || row.category}</span>
                    <strong>{fa(row.amount)} ت</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {(data.by_payment_method || []).length ? (
            <div className={styles.acctBlock}>
              <h3>درآمد به تفکیک روش پرداخت</h3>
              <div className={styles.acctCatList}>
                {data.by_payment_method.map((row) => (
                  <div key={row.method} className={styles.acctCatRow}>
                    <span>{row.method_label || row.method}</span>
                    <strong>{fa(row.amount)} ت</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {tab === 'journal' && data ? (
        <section className={styles.acctSection}>
          <h3>دفتر روزنامه</h3>
          <div className={styles.acctTableWrap}>
            <table className={styles.acctTable}>
              <thead>
                <tr>
                  <th>تاریخ</th>
                  <th>نوع</th>
                  <th>شرح / سند</th>
                  <th>سفارش</th>
                  <th>بدهکار</th>
                  <th>بستانکار</th>
                </tr>
              </thead>
              <tbody>
                {ledger.length === 0 ? (
                  <tr>
                    <td colSpan={6}>در این بازه ردیفی نیست</td>
                  </tr>
                ) : (
                  ledger.map((row) => (
                    <tr key={`${row.type}-${row.id}`}>
                      <td>{shamsi(row.date)}</td>
                      <td>
                        <span
                          className={
                            row.type === 'income'
                              ? styles.acctBadgeIn
                              : styles.acctBadgeOut
                          }
                        >
                          {row.type_label}
                        </span>
                      </td>
                      <td>
                        <strong>{row.ref}</strong>
                        {row.document_no ? (
                          <div className={styles.acctMuted}>
                            سند: {row.document_no}
                          </div>
                        ) : null}
                        {row.receipt_url ? (
                          <a
                            href={row.receipt_url}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.acctLink}
                          >
                            تصویر سند
                          </a>
                        ) : null}
                      </td>
                      <td>{row.job_code || '—'}</td>
                      <td>{row.debit ? fa(row.debit) : '—'}</td>
                      <td>{row.credit ? fa(row.credit) : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === 'expenses' ? (
        <section className={styles.acctSection}>
          <div className={styles.acctExpenseGrid}>
            <div className={styles.acctExpenseForm}>
              <h3>ثبت هزینه جدید</h3>
              <label>
                عنوان
                <input
                  value={form.title}
                  onChange={(e) => setField('title', e.target.value)}
                  placeholder="مثلاً خرید قطعه / کرایه"
                />
              </label>
              <label>
                مبلغ (تومان)
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setField('amount', e.target.value)}
                  placeholder="0"
                />
              </label>
              <label>
                دسته
                <select
                  value={form.category}
                  onChange={(e) => setField('category', e.target.value)}
                >
                  {(categories.length
                    ? categories
                    : [{ id: 'other', label: 'سایر' }]
                  ).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                تاریخ هزینه
                <PersianDatePicker
                  value={form.expense_date}
                  onChange={(d) => setField('expense_date', d || form.expense_date)}
                  placeholder="تاریخ شمسی"
                  zIndex={120000}
                />
              </label>
              <label>
                شماره سند
                <input
                  value={form.document_no}
                  onChange={(e) => setField('document_no', e.target.value)}
                  placeholder="اختیاری"
                />
              </label>
              <label>
                کد سفارش مرتبط (اختیاری — شناسه عددی)
                <input
                  value={form.job_id}
                  onChange={(e) => setField('job_id', e.target.value)}
                  placeholder="مثلاً ۱۲۳"
                />
              </label>
              <label>
                توضیح
                <input
                  value={form.note}
                  onChange={(e) => setField('note', e.target.value)}
                  placeholder="توضیح کوتاه"
                />
              </label>
              <ReceiptDropzone
                file={receiptFile}
                onChange={setReceiptFile}
                disabled={saving}
                label="تصویر سند / رسید"
                hint="بکشید و رها کنید یا انتخاب کنید"
              />
              <button
                type="button"
                className={styles.intakeBtnPrimary}
                disabled={saving || busy}
                onClick={submitExpense}
              >
                <Plus size={14} /> ثبت هزینه
              </button>
            </div>

            <div className={styles.acctExpenseList}>
              <h3>هزینه‌های بازه</h3>
              {expenses.length === 0 ? (
                <p className={styles.acctMuted}>هزینه‌ای ثبت نشده</p>
              ) : (
                expenses.map((e) => (
                  <article key={e.id} className={styles.acctExpenseCard}>
                    <div className={styles.acctExpenseTop}>
                      <strong>{e.title}</strong>
                      <span>{fa(e.amount)} ت</span>
                    </div>
                    <div className={styles.acctMuted}>
                      {e.category_label} · {shamsi(e.expense_date)}
                      {e.document_no ? ` · سند ${e.document_no}` : ''}
                      {e.job_code ? ` · ${e.job_code}` : ''}
                    </div>
                    <div className={styles.acctExpenseActions}>
                      {e.receipt_url ? (
                        <a
                          href={e.receipt_url}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.acctLink}
                        >
                          سند
                        </a>
                      ) : null}
                      <button
                        type="button"
                        className={styles.doneArchiveDanger}
                        onClick={() => removeExpense(e.id)}
                      >
                        <Trash2 size={13} /> حذف
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      ) : null}

      {tab === 'trial' && data ? (
        <section className={styles.acctSection}>
          <h3>تراز آزمایشی دوره</h3>
          <p className={styles.doneArchiveHint}>
            درآمد پرداخت‌شده، هزینه‌های ثبت‌شده، مطالبات مشتریان و مانده تراز
          </p>
          <div className={styles.acctTableWrap}>
            <table className={styles.acctTable}>
              <thead>
                <tr>
                  <th>حساب</th>
                  <th>بدهکار</th>
                  <th>بستانکار</th>
                </tr>
              </thead>
              <tbody>
                {(trial.rows || []).map((row) => (
                  <tr key={row.account}>
                    <td>{row.account_label || row.account}</td>
                    <td>{row.debit ? fa(row.debit) : '—'}</td>
                    <td>{row.credit ? fa(row.credit) : '—'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th>جمع</th>
                  <th>{fa(trial.totals?.debit)}</th>
                  <th>{fa(trial.totals?.credit)}</th>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className={styles.acctStats}>
            <div className={styles.acctStat}>
              <span>سود/زیان عملیاتی</span>
              <strong>{fa(summary.net)} ت</strong>
            </div>
            <div className={styles.acctStat}>
              <span>مطالبات جاری</span>
              <strong>{fa(summary.receivables)} ت</strong>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
