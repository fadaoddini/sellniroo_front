'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ClipboardList,
  CreditCard,
  ExternalLink,
  MapPin,
  ShoppingBag,
  UserCog,
  Wrench,
} from 'lucide-react'
import FilterDialog, {
  FilterSelectTrigger,
} from '@/components/AllBoxItem/components/FilterDialog/FilterDialog'
import MultiPickDialog from '@/components/Repairs/MultiPickDialog'
import styles from './RepairsManage.module.css'

function money(n) {
  return Number(n || 0).toLocaleString('fa-IR')
}

export default function JobDetailPanel({
  job,
  technicians = [],
  rates = [],
  parts = [],
  report,
  setReport,
  payProposal,
  setPayProposal,
  shopProposal,
  setShopProposal,
  shopResults = [],
  busy,
  onAssignTech,
  onApproveComplete,
  onSubmitReport,
  onSearchShop,
  onCreatePayProposal,
  onCreateShopProposal,
  onCancelProposal,
  onConfirmPay,
}) {
  const [picker, setPicker] = useState(null)

  const techOptions = useMemo(
    () =>
      technicians
        .filter((t) => t.is_active)
        .map((t) => ({
          id: t.id,
          name: t.name,
          meta: [t.specialty, t.city, t.mobile].filter(Boolean).join(' · '),
        })),
    [technicians],
  )

  const rateOptions = useMemo(
    () =>
      rates
        .filter((r) => r.is_active)
        .map((r) => ({
          id: r.id,
          name: r.title,
          meta: `${r.unit === 'hourly' ? 'ساعتی' : 'ثابت'} · ${money(r.price)} ت`,
        })),
    [rates],
  )

  const partOptions = useMemo(
    () =>
      parts
        .filter((p) => p.is_active)
        .map((p) => ({
          id: p.id,
          name: p.name,
          meta: `${p.sku || '—'} · ${money(p.unit_price)} ت`,
        })),
    [parts],
  )

  const shopOptions = useMemo(
    () =>
      shopResults.map((p) => ({
        id: p.id,
        name: p.title,
        meta: `${money(p.price)} ت`,
      })),
    [shopResults],
  )

  const selectedTech = technicians.find((t) => t.id === job.technician)
  const selectedRates = rates.filter((r) =>
    (report.labor_rate_ids || []).some((id) => String(id) === String(r.id)),
  )
  const selectedParts = parts.filter((p) =>
    (report.part_ids || []).some((id) => String(id) === String(p.id)),
  )
  const balanceDue = Number(job.balance_due ?? Math.max(0, (job.grand_total || 0) - (job.paid_total || 0)))

  return (
    <div className={styles.jobDetail} dir="rtl">
      <header className={styles.jobHero}>
        <div>
          <p className={styles.jobEyebrow}>پرونده سرویس</p>
          <h2>
            {job.code}
            <span className={styles.jobStatus}>{job.status_label}</span>
          </h2>
          <p className={styles.jobLead}>
            تخصیص سرویسکار، ثبت گزارش بازدید، پیشنهاد پرداخت/خرید و رصد پرداخت‌ها
          </p>
        </div>
        <Link
          href={`/repairs/track/${job.tracking_token}`}
          target="_blank"
          className={`${styles.btn} ${styles.btnGhost}`}
        >
          <ExternalLink size={14} /> دید مشتری
        </Link>
      </header>

      <section className={styles.jobInfoGrid}>
        <div className={styles.jobInfoCard}>
          <header>
            <Wrench size={15} /> مشتری و دستگاه
          </header>
          <dl>
            <div>
              <dt>مشتری</dt>
              <dd>
                {job.customer_name} · <span dir="ltr">{job.customer_mobile}</span>
              </dd>
            </div>
            <div>
              <dt>
                <MapPin size={12} /> محل
              </dt>
              <dd>
                {job.city || '—'}
                {job.address ? ` — ${job.address}` : ''}
              </dd>
            </div>
            <div>
              <dt>دستگاه</dt>
              <dd>{job.device_title || '—'}</dd>
            </div>
            <div>
              <dt>درخواست</dt>
              <dd>{job.customer_request || '—'}</dd>
            </div>
          </dl>
        </div>

        <div className={styles.jobInfoCard}>
          <header>
            <CreditCard size={15} /> فاکتور
          </header>
          <div className={styles.jobMoney}>
            <span>
              اجرت <strong>{money(job.labor_total)}</strong>
            </span>
            <span>
              قطعه <strong>{money(job.parts_total)}</strong>
            </span>
            <span>
              زمان <strong>{money(job.time_total)}</strong>
            </span>
            <span>
              جمع <strong>{money(job.grand_total)}</strong>
            </span>
            <span>
              پرداخت‌شده <strong>{money(job.paid_total)}</strong>
            </span>
          </div>
        </div>
      </section>

      <section className={styles.jobSection}>
        <h3>
          <UserCog size={16} /> تخصیص سرویسکار
        </h3>
        <div className={styles.jobPickers}>
          <FilterSelectTrigger
            label="سرویسکار اعزامی"
            icon={UserCog}
            displayValue={
              selectedTech
                ? `${selectedTech.name}${
                    selectedTech.city ? ` — ${selectedTech.city}` : ''
                  }`
                : ''
            }
            placeholder="انتخاب سرویسکار"
            onClick={() => setPicker('tech')}
            disabled={job.status === 'completed' || job.status === 'canceled'}
          />
        </div>
        <p className={styles.jobHint}>
          وضعیت فعلی: <strong>{job.status_label}</strong>
          {' · '}مراحل فقط رو به جلو می‌روند و برگشت ندارند.
          {selectedTech ? (
            <>
              {' '}
              سرویسکار از <Link href="/repairs-tech">پنل سرویسکار</Link> کار را
              پیش می‌برد.
            </>
          ) : null}
        </p>
      </section>

      {job.status === 'awaiting_final' || job.status === 'completed' ? (
        <section className={styles.jobSection}>
          <h3>
            <CreditCard size={16} /> تسویه و تکمیل
          </h3>
          <div className={styles.jobMoney}>
            <span>
              جمع فاکتور <strong>{money(job.grand_total)}</strong>
            </span>
            <span>
              پرداخت‌شده <strong>{money(job.paid_total)}</strong>
            </span>
            <span>
              بدهی <strong>{money(balanceDue)}</strong>
            </span>
          </div>
          {job.status === 'completed' ? (
            <p className={styles.jobHint}>
              تکمیل تایید شده است. مشتری می‌تواند فاکتور و گزارش را از صفحه
              پیگیری چاپ کند.
            </p>
          ) : (
            <>
              <p className={styles.jobHint}>
                {job.can_manager_complete
                  ? 'بدهی و رسیدها درست است — می‌توانید تکمیل را تایید کنید.'
                  : job.complete_block_reason ||
                    'تا وقتی بدهی یا رسید باز باشد، تکمیل ممکن نیست.'}
              </p>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.btn}
                  disabled={busy || !job.can_manager_complete}
                  onClick={onApproveComplete}
                >
                  تایید تکمیل سفارش
                </button>
                {balanceDue > 0 ? (
                  <Link
                    href={`/repairs/track/${job.tracking_token}`}
                    target="_blank"
                    className={`${styles.btn} ${styles.btnGhost}`}
                  >
                    لینک پرداخت مشتری
                  </Link>
                ) : null}
              </div>
            </>
          )}
        </section>
      ) : null}

      <section className={styles.jobSection}>
        <h3>
          <ClipboardList size={16} /> گزارش بازدید / تعمیر
        </h3>
        {job.lines_locked ? (
          <p className={styles.jobHint} style={{ marginTop: 0 }}>
            ردیف‌های اجرت/قطعه پس از پرداخت یا تایید خرید قفل می‌شوند تا سند
            حسابداری بهم نریزد. برای نیاز جدید از بخش پیشنهاد سند تازه بسازید.
          </p>
        ) : null}
        <div className={styles.field}>
          <label>متن گزارش سرویسکار</label>
          <textarea
            rows={4}
            value={report.tech_report}
            disabled={job.status === 'completed' || job.status === 'canceled'}
            onChange={(e) =>
              setReport((r) => ({ ...r, tech_report: e.target.value }))
            }
            placeholder="شرح بازدید، عیب‌یابی و اقدامات…"
          />
        </div>
        {job.lines_locked ? (
          <div className={styles.jobMoney} style={{ marginTop: 10 }}>
            <span>
              زمان{' '}
              <strong>
                {Number(job.labor_minutes || 0).toLocaleString('fa-IR')} دقیقه
              </strong>
            </span>
            <span>
              اجرت‌ها{' '}
              <strong>
                {(job.labor_lines || [])
                  .map((l) => l.title)
                  .filter(Boolean)
                  .join('، ') || '—'}
              </strong>
            </span>
            <span>
              قطعات{' '}
              <strong>
                {(job.part_lines || [])
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
                  setReport((r) => ({ ...r, labor_minutes: e.target.value }))
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
              label="قطعات کاتالوگ"
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
            disabled={busy || job.status === 'completed' || job.status === 'canceled'}
            onClick={onSubmitReport}
          >
            {job.lines_locked
              ? 'ذخیره یادداشت گزارش'
              : 'ثبت گزارش و درخواست پرداخت برآورد'}
          </button>
        </div>
      </section>

      {job.can_add_proposal !== false ? (
      <section className={styles.jobSection}>
        <h3>
          <ShoppingBag size={16} /> پیشنهاد به مشتری (سند جدید)
        </h3>
        <div className={styles.jobProposeGrid}>
          <div className={styles.jobProposeCard}>
            <strong>پیشنهاد پرداخت</strong>
            <div className={styles.field}>
              <label>موضوع</label>
              <input
                value={payProposal.title}
                onChange={(e) =>
                  setPayProposal((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="مثلاً تعویض برد"
              />
            </div>
            <div className={styles.field}>
              <label>مبلغ</label>
              <input
                type="number"
                value={payProposal.amount}
                onChange={(e) =>
                  setPayProposal((f) => ({ ...f, amount: e.target.value }))
                }
              />
            </div>
            <div className={styles.field}>
              <label>توضیح</label>
              <textarea
                rows={2}
                value={payProposal.description}
                onChange={(e) =>
                  setPayProposal((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <button
              type="button"
              className={styles.btn}
              disabled={busy}
              onClick={onCreatePayProposal}
            >
              ارسال پیشنهاد پرداخت
            </button>
          </div>

          <div className={styles.jobProposeCard}>
            <strong>پیشنهاد خرید فروشگاه</strong>
            <div className={styles.field}>
              <label>جستجوی محصول</label>
              <div className={styles.inlineSearch}>
                <input
                  value={shopProposal.q}
                  onChange={(e) =>
                    setShopProposal((f) => ({ ...f, q: e.target.value }))
                  }
                  placeholder="نام قطعه…"
                />
                <button type="button" className={styles.tab} onClick={onSearchShop}>
                  جستجو
                </button>
              </div>
            </div>
            <FilterSelectTrigger
              label="محصول"
              displayValue={shopProposal.product?.title || ''}
              placeholder={
                shopResults.length ? 'انتخاب از نتایج' : 'ابتدا جستجو کنید'
              }
              disabled={!shopResults.length}
              onClick={() => setPicker('shop')}
            />
            <div className={styles.field}>
              <label>تعداد</label>
              <input
                type="number"
                min={1}
                value={shopProposal.quantity}
                onChange={(e) =>
                  setShopProposal((f) => ({
                    ...f,
                    quantity: e.target.value,
                  }))
                }
              />
            </div>
            <button
              type="button"
              className={styles.btn}
              disabled={busy || !shopProposal.product}
              onClick={onCreateShopProposal}
            >
              ارسال پیشنهاد خرید
            </button>
          </div>
        </div>
      </section>
      ) : null}

      <section className={styles.jobSection}>
        <h3>اسناد پیشنهاد / خرید</h3>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>نوع</th>
                <th>موضوع</th>
                <th>مبلغ</th>
                <th>وضعیت</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(job.proposals || []).length ? (
                job.proposals.map((p) => (
                  <tr key={p.id}>
                    <td>{p.type_label}</td>
                    <td>{p.title}</td>
                    <td>{money(p.amount)}</td>
                    <td>{p.status_label}</td>
                    <td>
                      {p.status === 'pending' && !p.is_final ? (
                        <button
                          type="button"
                          className={styles.tab}
                          onClick={() => onCancelProposal(p.id)}
                        >
                          لغو
                        </button>
                      ) : p.is_final ? (
                        <span className={`${styles.badge} ${styles.badgeOk}`}>
                          قطعی
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className={styles.muted}>
                    پیشنهادی ثبت نشده
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.jobSection}>
        <h3>پرداخت‌ها</h3>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>موضوع</th>
                <th>مرحله</th>
                <th>مبلغ</th>
                <th>وضعیت</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(job.payments || []).map((p) => (
                <tr key={p.id}>
                  <td>{p.purpose_label || p.purpose || '—'}</td>
                  <td>{p.stage_label || p.stage}</td>
                  <td>{money(p.amount)}</td>
                  <td>{p.status_label || p.status}</td>
                  <td>
                    {p.status === 'pending' && p.method === 'card_transfer' ? (
                      <button
                        type="button"
                        className={styles.tab}
                        onClick={() => onConfirmPay(p.id)}
                      >
                        تایید رسید
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <FilterDialog
        isOpen={picker === 'tech'}
        title="انتخاب سرویسکار"
        options={techOptions}
        value={job.technician || ''}
        emptyLabel="بدون سرویسکار"
        showEmpty
        searchable={techOptions.length > 4}
        onChange={(v) => onAssignTech(v || null)}
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
      <FilterDialog
        isOpen={picker === 'shop'}
        title="انتخاب محصول فروشگاه"
        options={shopOptions}
        value={shopProposal.product?.id || ''}
        showEmpty={false}
        searchable={shopOptions.length > 5}
        onChange={(v) => {
          const p = shopResults.find((x) => String(x.id) === String(v))
          setShopProposal((f) => ({ ...f, product: p || null }))
        }}
        onClose={() => setPicker(null)}
      />
    </div>
  )
}
