'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ClipboardList,
  LayoutDashboard,
  MapPin,
  RefreshCw,
  ShoppingBag,
  UserCog,
  Wrench,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ModuleGate from '@/components/modules/ModuleGate'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import FilterDialog, {
  FilterSelectTrigger,
} from '@/components/AllBoxItem/components/FilterDialog/FilterDialog'
import MultiPickDialog from '@/components/Repairs/MultiPickDialog'
import repairsService from '@/components/Repairs/services/repairsService'
import styles from '../repairs-manage/RepairsManage.module.css'

function money(n) {
  return Number(n || 0).toLocaleString('fa-IR')
}

function RepairsTechInner() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()

  const [me, setMe] = useState(null)
  const [jobs, setJobs] = useState([])
  const [filter, setFilter] = useState('open')
  const [selected, setSelected] = useState(null)
  const [rates, setRates] = useState([])
  const [parts, setParts] = useState([])
  const [report, setReport] = useState({
    tech_report: '',
    labor_minutes: 60,
    labor_rate_ids: [],
    part_ids: [],
  })
  const [shopQ, setShopQ] = useState('')
  const [shopResults, setShopResults] = useState([])
  const [shopSearching, setShopSearching] = useState(false)
  const [shopProduct, setShopProduct] = useState(null)
  const [shopQty, setShopQty] = useState(1)
  const [shopNote, setShopNote] = useState('')
  const [picker, setPicker] = useState(null)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)
  const [denied, setDenied] = useState(false)
  const shopSearchRef = useRef(null)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login?next=/repairs-tech')
    }
  }, [loading, isAuthenticated, router])

  const flash = (ok, text) => {
    if (ok) {
      setMsg(text)
      setErr(null)
    } else {
      setErr(text)
      setMsg(null)
    }
  }

  const load = useCallback(async () => {
    const meRes = await repairsService.techMe()
    if (!meRes.success) {
      setDenied(true)
      setMe(null)
      setJobs([])
      if (meRes.code !== 'not_technician') flash(false, meRes.error)
      return
    }
    setDenied(false)
    setMe(meRes.data)
    setRates(meRes.data?.catalog?.labor_rates || [])
    setParts(meRes.data?.catalog?.parts || [])
    const jobsRes = await repairsService.techJobs({
      status: filter || undefined,
    })
    if (jobsRes.success) setJobs(jobsRes.data || [])
  }, [filter])

  useEffect(() => {
    if (isAuthenticated) load()
  }, [isAuthenticated, load])

  const filterOptions = useMemo(
    () => [
      { id: 'open', name: 'سفارش‌های باز' },
      { id: '', name: 'همه سفارش‌ها' },
      { id: 'assigned', name: 'تخصیص‌یافته' },
      { id: 'visited', name: 'بازدید شده' },
      { id: 'in_progress', name: 'در حال تعمیر' },
      { id: 'awaiting_mid', name: 'منتظر پرداخت میانی' },
      { id: 'completed', name: 'تکمیل‌شده' },
    ],
    [],
  )

  const rateOptions = useMemo(
    () =>
      rates.map((r) => ({
        id: r.id,
        name: r.title,
        meta: `${r.unit === 'hourly' ? 'ساعتی' : 'ثابت'} · ${money(r.price)} ت`,
      })),
    [rates],
  )

  const partOptions = useMemo(
    () =>
      parts.map((p) => ({
        id: p.id,
        name: p.name,
        meta: `${p.sku || '—'} · ${money(p.unit_price)} ت`,
      })),
    [parts],
  )

  const resetShopForm = () => {
    setShopQ('')
    setShopResults([])
    setShopProduct(null)
    setShopQty(1)
    setShopNote('')
  }

  const openJob = async (id) => {
    const res = await repairsService.techJob(id)
    if (!res.success) return flash(false, res.error)
    const job = res.data
    setSelected(job)
    resetShopForm()
    setReport({
      tech_report: job.tech_report || '',
      labor_minutes: job.labor_minutes || 60,
      labor_rate_ids: (job.labor_lines || [])
        .map((l) => l.labor_rate)
        .filter(Boolean),
      part_ids: (job.part_lines || []).map((p) => p.part).filter(Boolean),
    })
  }

  const onShopQuery = (value) => {
    setShopQ(value)
    setShopProduct(null)
    if (shopSearchRef.current) window.clearTimeout(shopSearchRef.current)
    const q = value.trim()
    if (q.length < 3) {
      setShopResults([])
      setShopSearching(false)
      return
    }
    setShopSearching(true)
    shopSearchRef.current = window.setTimeout(async () => {
      const res = await repairsService.techSearchShopProducts(q)
      setShopSearching(false)
      if (!res.success) {
        setShopResults([])
        return
      }
      setShopResults(res.data || [])
    }, 280)
  }

  const pickShopProduct = (p) => {
    setShopProduct(p)
    setShopQ(p.title || '')
    setShopResults([])
  }

  const submitShopProposal = async () => {
    if (!selected || !shopProduct) return
    setBusy(true)
    const res = await repairsService.techCreateProposal(selected.id, {
      proposal_type: 'shop_product',
      shop_product_id: shopProduct.id,
      quantity: Number(shopQty || 1),
      title: `خرید ${shopProduct.title}`,
      description: shopNote || '',
    })
    setBusy(false)
    if (!res.success) return flash(false, res.error)
    flash(true, 'پیشنهاد خرید برای مشتری ثبت شد')
    resetShopForm()
    openJob(selected.id)
    load()
  }

  const finishWork = async () => {
    if (!selected) return
    if (
      !window.confirm(
        'کار این سفارش تمام شده؟ بعد از اعلام، پرونده برای تسویه و تایید مدیر می‌رود.',
      )
    ) {
      return
    }
    setBusy(true)
    const res = await repairsService.techFinishWork(selected.id)
    setBusy(false)
    if (!res.success) return flash(false, res.error)
    setSelected(res.data)
    flash(true, res.message || 'پایان کار اعلام شد')
    load()
  }

  const submitReport = async () => {
    if (!selected) return
    const locked = !!selected.lines_locked
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
    setBusy(true)
    const res = await repairsService.techSubmitReport(selected.id, payload)
    setBusy(false)
    if (!res.success) return flash(false, res.error)
    setSelected(res.data)
    flash(true, locked ? 'یادداشت گزارش ذخیره شد' : 'گزارش ثبت شد')
    load()
  }

  const selectedRates = rates.filter((r) =>
    (report.labor_rate_ids || []).some((id) => String(id) === String(r.id)),
  )
  const selectedParts = parts.filter((p) =>
    (report.part_ids || []).some((id) => String(id) === String(p.id)),
  )
  const filterLabel =
    filterOptions.find((o) => String(o.id) === String(filter))?.name ||
    'فیلتر'

  if (loading || !isAuthenticated) {
    return (
      <div className={styles.page}>
        <div className={styles.wrap}>در حال بارگذاری…</div>
      </div>
    )
  }

  if (denied) {
    return (
      <div className={styles.page} dir="rtl">
        <div className={styles.wrap}>
          <header className={styles.header}>
            <div>
              <h1>
                <UserCog size={18} style={{ verticalAlign: -3, marginLeft: 6 }} />
                پنل سرویسکار
              </h1>
              <p>این حساب به پروفایل تعمیرکار متصل نیست</p>
            </div>
            <div className={styles.headerActions}>
              <Link href="/dashboard" className={styles.ghost}>
                <LayoutDashboard size={14} /> داشبورد
              </Link>
            </div>
          </header>
          <div className={styles.emptyState}>
            برای دسترسی، مدیر باید شما را در تب تعمیرکاران با همان موبایل حساب
            کاربری ثبت کند، یا حساب کاربری را به پروفایل تعمیرکار وصل کند.
          </div>
        </div>
      </div>
    )
  }

  const tech = me?.technician

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.wrap}>
        <header className={styles.header}>
          <div>
            <h1>
              <UserCog size={18} style={{ verticalAlign: -3, marginLeft: 6 }} />
              پنل سرویسکار
            </h1>
            <p>
              {tech?.name || 'سرویسکار'}
              {tech?.specialty ? ` · ${tech.specialty}` : ''}
              {tech?.city ? ` · ${tech.city}` : ''}
              {typeof me?.open_jobs === 'number'
                ? ` · ${me.open_jobs} سفارش باز`
                : ''}
            </p>
          </div>
          <div className={styles.headerActions}>
            <Link href="/dashboard" className={styles.ghost}>
              <LayoutDashboard size={14} /> داشبورد
            </Link>
            <button type="button" className={styles.ghost} onClick={load}>
              <RefreshCw size={14} /> بروزرسانی
            </button>
          </div>
        </header>

        {msg ? <p className={`${styles.msg} ${styles.msgOk}`}>{msg}</p> : null}
        {err ? <p className={`${styles.msg} ${styles.msgErr}`}>{err}</p> : null}

        <div className={styles.grid2}>
          <section className={styles.panel}>
            <div className={styles.toolbar}>
              <FilterSelectTrigger
                label="نمایش سفارش‌ها"
                displayValue={filterLabel}
                placeholder="فیلتر"
                onClick={() => setPicker('filter')}
              />
            </div>
            <div className={styles.jobList}>
              {jobs.length ? (
                jobs.map((j) => (
                  <button
                    key={j.id}
                    type="button"
                    className={`${styles.jobCard} ${
                      selected?.id === j.id ? styles.jobCardOn : ''
                    }`}
                    onClick={() => openJob(j.id)}
                  >
                    <div className={styles.jobCardTop}>
                      <strong>{j.code}</strong>
                      <span className={styles.badge}>{j.status_label}</span>
                    </div>
                    <div className={styles.jobCardMeta}>
                      <span>
                        {j.customer_name} · <span dir="ltr">{j.customer_mobile}</span>
                      </span>
                      <span>
                        <MapPin size={12} style={{ verticalAlign: -1 }} />{' '}
                        {j.city || '—'}
                        {j.address ? ` — ${j.address}` : ''}
                      </span>
                      <span>{j.device_title || j.customer_request || '—'}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className={styles.emptyState}>
                  سفارشی برای این فیلتر تخصیص داده نشده است.
                </div>
              )}
            </div>
          </section>

          <section>
            {selected ? (
              <div className={styles.jobDetail}>
                <header className={styles.jobHero}>
                  <div>
                    <p className={styles.jobEyebrow}>پرونده سرویسکار</p>
                    <h2>
                      {selected.code}
                      <span className={styles.jobStatus}>
                        {selected.status_label}
                      </span>
                    </h2>
                    <p className={styles.jobLead}>
                      {selected.status === 'awaiting_final'
                        ? 'پایان کار اعلام شده — منتظر تسویه مشتری و تایید مدیر.'
                        : selected.status === 'completed'
                          ? 'این سفارش تکمیل شده است.'
                          : 'گزارش را بنویسید، اگر قطعه لازم است پیشنهاد خرید بزنید، و وقتی کار تمام شد «اعلام پایان کار» را بزنید.'}
                    </p>
                  </div>
                </header>

                {selected.can_tech_finish ? (
                  <div className={styles.techGuide}>
                    <strong>کار تمام شد؟</strong>
                    <p>
                      با اعلام پایان کار، پرونده به مرحله تسویه می‌رود. دیگر
                      برگشتی به مرحله قبل نیست.
                    </p>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.btn}
                        disabled={busy}
                        onClick={finishWork}
                      >
                        اعلام پایان کار
                      </button>
                    </div>
                  </div>
                ) : null}

                {selected.status === 'awaiting_final' ? (
                  <div className={styles.techGuide}>
                    <strong>منتظر تایید مدیر</strong>
                    <p>
                      بدهی مشتری:{' '}
                      <strong>{money(selected.balance_due)} تومان</strong>
                      {Number(selected.balance_due) > 0
                        ? ' — مشتری باید پرداخت نهایی را انجام دهد، بعد مدیر تایید می‌کند.'
                        : ' — بدهی صفر است؛ مدیر می‌تواند تکمیل را تایید کند.'}
                    </p>
                  </div>
                ) : null}

                <div className={styles.jobInfoCard}>
                  <header>
                    <Wrench size={15} /> جزئیات اعزام
                  </header>
                  <dl>
                    <div>
                      <dt>مشتری</dt>
                      <dd>
                        {selected.customer_name} ·{' '}
                        <span dir="ltr">{selected.customer_mobile}</span>
                      </dd>
                    </div>
                    <div>
                      <dt>
                        <MapPin size={12} /> محل
                      </dt>
                      <dd>
                        {selected.city || '—'}
                        {selected.address ? ` — ${selected.address}` : ''}
                      </dd>
                    </div>
                    <div>
                      <dt>دستگاه</dt>
                      <dd>{selected.device_title || '—'}</dd>
                    </div>
                    <div>
                      <dt>درخواست مشتری</dt>
                      <dd>{selected.customer_request || '—'}</dd>
                    </div>
                  </dl>
                </div>

                <div className={styles.jobSection}>
                  <h3>
                    <ClipboardList size={16} /> تکمیل گزارش
                  </h3>
                  {selected.lines_locked ? (
                    <p className={styles.jobHint} style={{ marginTop: 0 }}>
                      اجرت‌ها و قطعاتی که پرداخت/تایید شده‌اند سند قطعی هستند و
                      قابل ویرایش نیستند. اگر وسیله جدیدی لازم شد، پایین یک
                      درخواست خرید جدید ثبت کنید.
                    </p>
                  ) : null}
                  <div className={styles.field}>
                    <label>شرح بازدید و اقدامات</label>
                    <textarea
                      rows={5}
                      value={report.tech_report}
                      disabled={
                        selected.status === 'completed' ||
                        selected.status === 'awaiting_final' ||
                        selected.status === 'canceled'
                      }
                      onChange={(e) =>
                        setReport((r) => ({
                          ...r,
                          tech_report: e.target.value,
                        }))
                      }
                      placeholder="عیب‌یابی، قطعات تعویضی، توصیه به مشتری…"
                    />
                  </div>
                  {selected.lines_locked ? (
                    <div className={styles.jobMoney} style={{ marginTop: 10 }}>
                      <span>
                        زمان{' '}
                        <strong>
                          {Number(selected.labor_minutes || 0).toLocaleString(
                            'fa-IR',
                          )}{' '}
                          دقیقه
                        </strong>
                      </span>
                      <span>
                        اجرت‌ها{' '}
                        <strong>
                          {(selected.labor_lines || [])
                            .map((l) => l.title)
                            .filter(Boolean)
                            .join('، ') || '—'}
                        </strong>
                      </span>
                      <span>
                        قطعات{' '}
                        <strong>
                          {(selected.part_lines || [])
                            .map((l) => l.title)
                            .filter(Boolean)
                            .join('، ') || '—'}
                        </strong>
                      </span>
                    </div>
                  ) : (
                    <div className={styles.jobPickers} style={{ marginTop: 10 }}>
                      <div className={styles.field}>
                        <label>زمان صرف‌شده (دقیقه)</label>
                        <input
                          type="number"
                          value={report.labor_minutes}
                          onChange={(e) =>
                            setReport((r) => ({
                              ...r,
                              labor_minutes: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <FilterSelectTrigger
                        label="اجرت‌ها"
                        displayValue={
                          selectedRates.length
                            ? selectedRates.map((r) => r.title).join('، ')
                            : ''
                        }
                        placeholder="انتخاب اجرت‌ها"
                        onClick={() => setPicker('rates')}
                      />
                      <FilterSelectTrigger
                        label="قطعات"
                        displayValue={
                          selectedParts.length
                            ? selectedParts.map((p) => p.name).join('، ')
                            : ''
                        }
                        placeholder="انتخاب قطعات"
                        onClick={() => setPicker('parts')}
                      />
                    </div>
                  )}
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.btn}
                      disabled={
                        busy ||
                        selected.status === 'completed' ||
                        selected.status === 'awaiting_final' ||
                        selected.status === 'canceled'
                      }
                      onClick={submitReport}
                    >
                      {selected.lines_locked
                        ? 'ذخیره یادداشت گزارش'
                        : 'ذخیره گزارش'}
                    </button>
                    {selected.can_tech_finish ? (
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.btnGhost}`}
                        disabled={busy}
                        onClick={finishWork}
                      >
                        اعلام پایان کار
                      </button>
                    ) : null}
                  </div>
                </div>

                {selected.can_add_proposal ? (
                <div className={styles.jobSection}>
                  <h3>
                    <ShoppingBag size={16} /> قطعه از فروشگاه لازم است؟
                  </h3>
                  <p className={styles.jobHint} style={{ marginTop: 0 }}>
                    هر خرید یک سند جداست. اسناد پرداخت‌شده قابل ویرایش نیستند —
                    برای نیاز جدید همین‌جا درخواست تازه ثبت کنید.
                  </p>
                  <div className={styles.field} style={{ marginTop: 10 }}>
                    <label>جستجوی محصول (حداقل ۳ حرف)</label>
                    <input
                      value={shopQ}
                      onChange={(e) => onShopQuery(e.target.value)}
                      placeholder="مثلاً برد، فیلتر، لامپ…"
                      autoComplete="off"
                    />
                    {shopSearching ? (
                      <p className={styles.muted} style={{ marginTop: 6 }}>
                        در حال جستجو…
                      </p>
                    ) : null}
                    {!shopSearching &&
                    shopQ.trim().length >= 3 &&
                    !shopProduct &&
                    shopResults.length === 0 ? (
                      <p className={styles.muted} style={{ marginTop: 6 }}>
                        محصولی یافت نشد
                      </p>
                    ) : null}
                    {shopResults.length ? (
                      <ul className={styles.userPickList}>
                        {shopResults.map((p) => (
                          <li key={p.id}>
                            <button type="button" onClick={() => pickShopProduct(p)}>
                              <strong>{p.title}</strong>
                              <span>{money(p.price)} تومان</span>
                              <em>انتخاب</em>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  {shopProduct ? (
                    <div className={styles.jobProposeCard} style={{ marginTop: 10 }}>
                      <strong>{shopProduct.title}</strong>
                      <span className={styles.muted}>
                        قیمت واحد: {money(shopProduct.price)} تومان
                      </span>
                      <div className={styles.row2} style={{ marginTop: 8 }}>
                        <div className={styles.field}>
                          <label>تعداد</label>
                          <input
                            type="number"
                            min={1}
                            value={shopQty}
                            onChange={(e) => setShopQty(e.target.value)}
                          />
                        </div>
                        <div className={styles.field}>
                          <label>جمع پیشنهادی</label>
                          <input
                            readOnly
                            value={money(
                              Number(shopProduct.price || 0) *
                                Math.max(1, Number(shopQty || 1)),
                            )}
                          />
                        </div>
                      </div>
                      <div className={styles.field}>
                        <label>توضیح برای مشتری (اختیاری)</label>
                        <textarea
                          rows={2}
                          value={shopNote}
                          onChange={(e) => setShopNote(e.target.value)}
                          placeholder="مثلاً این قطعه برای ادامه تعمیر لازم است…"
                        />
                      </div>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.btn}
                          disabled={busy}
                          onClick={submitShopProposal}
                        >
                          ثبت پیشنهاد خرید برای مشتری
                        </button>
                        <button
                          type="button"
                          className={`${styles.btn} ${styles.btnGhost}`}
                          onClick={resetShopForm}
                        >
                          پاک کردن
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {(selected.proposals || []).length ? (
                    <div className={styles.tableWrap} style={{ marginTop: 14 }}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>نوع</th>
                            <th>موضوع</th>
                            <th>مبلغ</th>
                            <th>وضعیت</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selected.proposals.map((p) => (
                            <tr key={p.id}>
                              <td>{p.type_label}</td>
                              <td>{p.title}</td>
                              <td>{money(p.amount)}</td>
                              <td>
                                {p.status_label}
                                {p.is_final ? (
                                  <span
                                    className={`${styles.badge} ${styles.badgeOk}`}
                                    style={{ marginInlineStart: 6 }}
                                  >
                                    قطعی
                                  </span>
                                ) : null}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </div>
                ) : (selected.proposals || []).length ? (
                  <div className={styles.jobSection}>
                    <h3>
                      <ShoppingBag size={16} /> اسناد پیشنهاد / خرید
                    </h3>
                    <div className={styles.tableWrap}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>نوع</th>
                            <th>موضوع</th>
                            <th>مبلغ</th>
                            <th>وضعیت</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selected.proposals.map((p) => (
                            <tr key={p.id}>
                              <td>{p.type_label}</td>
                              <td>{p.title}</td>
                              <td>{money(p.amount)}</td>
                              <td>
                                {p.status_label}
                                {p.is_final ? (
                                  <span
                                    className={`${styles.badge} ${styles.badgeOk}`}
                                    style={{ marginInlineStart: 6 }}
                                  >
                                    قطعی
                                  </span>
                                ) : null}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}

                <div className={styles.jobInfoCard}>
                  <header>فاکتور فعلی</header>
                  <div className={styles.jobMoney}>
                    <span>
                      اجرت <strong>{money(selected.labor_total)}</strong>
                    </span>
                    <span>
                      قطعه <strong>{money(selected.parts_total)}</strong>
                    </span>
                    <span>
                      زمان <strong>{money(selected.time_total)}</strong>
                    </span>
                    <span>
                      جمع <strong>{money(selected.grand_total)}</strong>
                    </span>
                    <span>
                      پرداخت‌شده <strong>{money(selected.paid_total)}</strong>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>
                یک سفارش را از فهرست انتخاب کنید تا گزارش را کامل کنید.
              </div>
            )}
          </section>
        </div>
      </div>

      <FilterDialog
        isOpen={picker === 'filter'}
        title="فیلتر سفارش‌ها"
        options={filterOptions}
        value={filter}
        showEmpty={false}
        searchable={false}
        onChange={(v) => {
          setFilter(v)
          setSelected(null)
        }}
        onClose={() => setPicker(null)}
      />
      <MultiPickDialog
        isOpen={picker === 'rates'}
        title="انتخاب اجرت‌ها"
        options={rateOptions}
        values={report.labor_rate_ids || []}
        onChange={(ids) =>
          setReport((r) => ({
            ...r,
            labor_rate_ids: ids.map(Number),
          }))
        }
        onClose={() => setPicker(null)}
      />
      <MultiPickDialog
        isOpen={picker === 'parts'}
        title="انتخاب قطعات"
        options={partOptions}
        values={report.part_ids || []}
        onChange={(ids) =>
          setReport((r) => ({
            ...r,
            part_ids: ids.map(Number),
          }))
        }
        onClose={() => setPicker(null)}
      />
    </div>
  )
}

export default function RepairsTechClient() {
  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.REPAIRS} notFoundWhenInactive>
      <RepairsTechInner />
    </ModuleGate>
  )
}
