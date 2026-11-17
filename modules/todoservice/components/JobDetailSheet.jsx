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
  X,
} from 'lucide-react'
import FilterDialog, {
  FilterSelectTrigger,
} from '@/components/AllBoxItem/components/FilterDialog/FilterDialog'
import MultiPickDialog from '@/components/Repairs/MultiPickDialog'
import { useTodoService } from '../context/TodoServiceContext'
import styles from '../styles/Board.module.css'

function money(n) {
  return Number(n || 0).toLocaleString('fa-IR')
}

export default function JobDetailSheet() {
  const {
    selectedJob,
    closeJob,
    role,
    busy,
    technicians,
    rates,
    parts,
    report,
    setReport,
    payProposal,
    setPayProposal,
    shopProposal,
    setShopProposal,
    shopResults,
    assignTech,
    submitReport,
    finishWork,
    approveComplete,
    searchShop,
    createPayProposal,
    createShopProposal,
    cancelProposal,
    confirmPayment,
    customerPayGateway,
    customerProposalAction,
    flash,
    openJob,
  } = useTodoService()

  const [picker, setPicker] = useState(null)
  const [deferSettlement, setDeferSettlement] = useState(false)
  const [deferNote, setDeferNote] = useState('')

  const job = selectedJob
  const balanceDue = job
    ? Number(
        job.balance_due ?? Math.max(0, (job.grand_total || 0) - (job.paid_total || 0)),
      )
    : 0

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

  const selectedTech = job
    ? technicians.find((t) => t.id === job.technician)
    : null
  const selectedRates = rates.filter((r) =>
    (report.labor_rate_ids || []).some((id) => String(id) === String(r.id)),
  )
  const selectedParts = parts.filter((p) =>
    (report.part_ids || []).some((id) => String(id) === String(p.id)),
  )

  const isAdmin = role === 'admin'
  const isTech = role === 'tech'
  const isCustomer = role === 'customer'
  const canEditReport =
    job &&
    (isAdmin || isTech) &&
    !(job.status === 'completed' || job.status === 'canceled')

  if (!job) return null

  return (
    <>
      <div className={styles.sheetOverlay} onClick={closeJob} role="presentation">
        <div
          className={styles.sheetDrawer}
          dir="rtl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.sheetHead}>
            <div>
              <p className={styles.hint} style={{ margin: 0 }}>
                پرونده سرویس
              </p>
              <h2>
                {job.code}{' '}
                <span className={styles.statusBadge}>{job.status_label || job.status}</span>
              </h2>
            </div>
            <button type="button" className={styles.closeBtn} onClick={closeJob} aria-label="بستن">
              <X size={16} />
            </button>
          </div>

          {job.tracking_token && !isCustomer ? (
            <div className={styles.formActions} style={{ justifyContent: 'flex-start' }}>
              <Link
                href={`/repairs/track/${job.tracking_token}`}
                target="_blank"
                className={styles.btnGhost}
              >
                <ExternalLink size={14} /> دید مشتری
              </Link>
            </div>
          ) : null}

          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <p className={styles.hint}>
                <Wrench size={12} /> مشتری و دستگاه
              </p>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.72rem' }}>
                {job.customer_name} · <span dir="ltr">{job.customer_mobile || '—'}</span>
              </p>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.72rem' }}>
                <MapPin size={11} /> {job.city || '—'}
                {job.address ? ` — ${job.address}` : ''}
              </p>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.72rem' }}>
                {job.device_title || '—'}
              </p>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.72rem' }}>
                {job.customer_request || '—'}
              </p>
            </div>
            <div className={styles.infoCard}>
              <p className={styles.hint}>
                <CreditCard size={12} /> فاکتور
              </p>
              <div className={styles.moneyRow} style={{ marginTop: '0.35rem' }}>
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
                <span>
                  بدهی <strong>{money(balanceDue)}</strong>
                </span>
              </div>
            </div>
          </div>

          {isAdmin ? (
            <section className={styles.section}>
              <h3>
                <UserCog size={15} /> تخصیص سرویسکار
              </h3>
              <FilterSelectTrigger
                label="سرویسکار اعزامی"
                icon={UserCog}
                displayValue={
                  selectedTech
                    ? `${selectedTech.name}${selectedTech.city ? ` — ${selectedTech.city}` : ''}`
                    : ''
                }
                placeholder="انتخاب سرویسکار"
                onClick={() => setPicker('tech')}
                disabled={job.status === 'completed' || job.status === 'canceled'}
              />
            </section>
          ) : null}

          {isTech && job.can_tech_finish ? (
            <section className={styles.section}>
              <h3>اعلام پایان کار</h3>
              <p className={styles.hint}>
                با اعلام پایان، پرونده برای تسویه و تایید مدیر می‌رود.
              </p>
              <div className={styles.formActions}>
                <button type="button" className={styles.btnPrimary} disabled={busy} onClick={finishWork}>
                  اعلام پایان کار
                </button>
              </div>
            </section>
          ) : null}

          {canEditReport ? (
            <section className={styles.section}>
              <h3>
                <ClipboardList size={15} /> گزارش بازدید / تعمیر
              </h3>
              {job.lines_locked ? (
                <p className={styles.hint}>
                  ردیف‌های اجرت/قطعه قفل شده‌اند؛ فقط یادداشت گزارش قابل ویرایش است.
                </p>
              ) : null}
              <div className={styles.formGroup}>
                <label>متن گزارش</label>
                <textarea
                  rows={4}
                  value={report.tech_report}
                  onChange={(e) =>
                    setReport((r) => ({ ...r, tech_report: e.target.value }))
                  }
                  placeholder="شرح بازدید و اقدامات…"
                />
              </div>
              {!job.lines_locked ? (
                <>
                  <div className={styles.formGroup}>
                    <label>زمان (دقیقه)</label>
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
                      selectedRates.length ? selectedRates.map((r) => r.title).join('، ') : ''
                    }
                    placeholder="انتخاب اجرت‌ها"
                    onClick={() => setPicker('rates')}
                  />
                  <FilterSelectTrigger
                    label="قطعات کاتالوگ"
                    displayValue={
                      selectedParts.length ? selectedParts.map((p) => p.name).join('، ') : ''
                    }
                    placeholder="انتخاب قطعات"
                    onClick={() => setPicker('parts')}
                  />
                </>
              ) : null}
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  disabled={busy}
                  onClick={submitReport}
                >
                  {job.lines_locked ? 'ذخیره یادداشت' : 'ثبت گزارش'}
                </button>
              </div>
            </section>
          ) : null}

          {isAdmin &&
          (job.status === 'awaiting_final' || job.status === 'completed') ? (
            <section className={styles.section}>
              <h3>
                <CreditCard size={15} /> تسویه و تکمیل
              </h3>
              {job.status === 'completed' ? (
                <p className={styles.hint}>
                  {job.settlement_deferred
                    ? `تکمیل شد — تسویه ${money(job.final_amount || balanceDue)} ت موکول شده.`
                    : 'تکمیل تایید شده است.'}
                </p>
              ) : (
                <>
                  <p className={styles.hint}>
                    {job.can_manager_complete
                      ? 'بدهی و رسیدها درست است — می‌توانید تکمیل را تایید کنید.'
                      : job.complete_block_reason ||
                        'تا بدهی یا رسید باز باشد، تکمیل ممکن نیست.'}
                  </p>
                  {(job.can_manager_defer_settlement || balanceDue > 0) &&
                  !job.can_manager_complete ? (
                    <>
                      <label className={styles.checkRow}>
                        <input
                          type="checkbox"
                          checked={deferSettlement}
                          onChange={(e) => setDeferSettlement(e.target.checked)}
                        />
                        <span>
                          موکول کردن تسویه ({money(balanceDue)} ت) و تکمیل پرونده
                        </span>
                      </label>
                      {deferSettlement ? (
                        <div className={styles.formGroup}>
                          <label>دلیل</label>
                          <textarea
                            rows={2}
                            value={deferNote}
                            onChange={(e) => setDeferNote(e.target.value)}
                            placeholder="مثلاً واحد مالی در دسترس نیست…"
                          />
                        </div>
                      ) : null}
                    </>
                  ) : null}
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      disabled={
                        busy ||
                        !(
                          job.can_manager_complete ||
                          (deferSettlement &&
                            (job.can_manager_defer_settlement ||
                              balanceDue > 0))
                        )
                      }
                      onClick={() =>
                        approveComplete({
                          deferSettlement:
                            !!deferSettlement && !job.can_manager_complete,
                          note: deferNote,
                        })
                      }
                    >
                      {deferSettlement && !job.can_manager_complete
                        ? 'تایید تکمیل با تسویه موکول'
                        : 'تایید تکمیل سفارش'}
                    </button>
                  </div>
                </>
              )}
            </section>
          ) : null}

          {(isAdmin || isTech) && job.can_add_proposal !== false ? (
            <section className={styles.section}>
              <h3>
                <ShoppingBag size={15} /> پیشنهاد به مشتری
              </h3>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>موضوع پرداخت</label>
                  <input
                    value={payProposal.title}
                    onChange={(e) =>
                      setPayProposal((f) => ({ ...f, title: e.target.value }))
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>مبلغ</label>
                  <input
                    type="number"
                    value={payProposal.amount}
                    onChange={(e) =>
                      setPayProposal((f) => ({ ...f, amount: e.target.value }))
                    }
                  />
                </div>
              </div>
              <button
                type="button"
                className={styles.btnPrimary}
                disabled={busy}
                onClick={createPayProposal}
              >
                ارسال پیشنهاد پرداخت
              </button>
              <div className={styles.formGroup} style={{ marginTop: '0.65rem' }}>
                <label>جستجوی محصول فروشگاه</label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <input
                    value={shopProposal.q}
                    onChange={(e) =>
                      setShopProposal((f) => ({ ...f, q: e.target.value }))
                    }
                    placeholder="نام قطعه…"
                  />
                  <button type="button" className={styles.btnGhost} onClick={searchShop}>
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
              <div className={styles.formGroup}>
                <label>تعداد</label>
                <input
                  type="number"
                  min={1}
                  value={shopProposal.quantity}
                  onChange={(e) =>
                    setShopProposal((f) => ({ ...f, quantity: e.target.value }))
                  }
                />
              </div>
              <button
                type="button"
                className={styles.btnPrimary}
                disabled={busy || !shopProposal.product}
                onClick={createShopProposal}
              >
                ارسال پیشنهاد خرید
              </button>
            </section>
          ) : null}

          <section className={styles.section}>
            <h3>پیشنهادها و پرداخت‌ها</h3>
            <p className={styles.hint}>اسناد پیشنهاد</p>
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
                          {isAdmin && p.status === 'pending' && !p.is_final ? (
                            <button
                              type="button"
                              className={styles.btnGhost}
                              onClick={() => cancelProposal(p.id)}
                            >
                              لغو
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className={styles.hint}>
                        پیشنهادی نیست
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className={styles.hint} style={{ marginTop: '0.65rem' }}>
              پرداخت‌ها
            </p>
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
                        {isAdmin &&
                        p.status === 'pending' &&
                        p.method === 'card_transfer' ? (
                          <button
                            type="button"
                            className={styles.btnGhost}
                            onClick={() => confirmPayment(p.id)}
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

          {isCustomer && job.tracking_token ? (
            <section className={styles.section}>
              <h3>اقدامات مشتری</h3>
              <p className={styles.hint}>
                پرداخت درگاه، تایید/رد پیشنهاد و مشاهده وضعیت — همان فرایند صفحه
                پیگیری، داخل میزکار.
              </p>
              <div className={styles.formActions} style={{ flexWrap: 'wrap' }}>
                {(job.payments || [])
                  .filter((p) => p.status === 'pending')
                  .map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={styles.btnPrimary}
                      disabled={busy}
                      onClick={async () => {
                        const res = await customerPayGateway(
                          job.tracking_token,
                          p.stage,
                          { payment_id: p.id },
                        )
                        if (!res.success) return flash(false, res.error)
                        if (res.data?.payment_url || res.data?.redirect_url) {
                          window.location.href =
                            res.data.payment_url || res.data.redirect_url
                          return
                        }
                        flash(true, res.message || 'پرداخت ثبت شد')
                        openJob(job.tracking_token)
                      }}
                    >
                      پرداخت {p.stage_label || p.stage} — {money(p.amount)} ت
                    </button>
                  ))}
                {(job.proposals || [])
                  .filter((p) => p.status === 'pending')
                  .map((p) => (
                    <React.Fragment key={p.id}>
                      <button
                        type="button"
                        className={styles.btnPrimary}
                        disabled={busy}
                        onClick={async () => {
                          const res = await customerProposalAction(
                            job.tracking_token,
                            p.id,
                            { action: 'accept' },
                          )
                          if (!res.success) return flash(false, res.error)
                          flash(true, 'پیشنهاد تایید شد')
                          openJob(job.tracking_token)
                        }}
                      >
                        تایید: {p.title}
                      </button>
                      <button
                        type="button"
                        className={styles.btnGhost}
                        disabled={busy}
                        onClick={async () => {
                          const res = await customerProposalAction(
                            job.tracking_token,
                            p.id,
                            { action: 'reject' },
                          )
                          if (!res.success) return flash(false, res.error)
                          flash(true, 'پیشنهاد رد شد')
                          openJob(job.tracking_token)
                        }}
                      >
                        رد پیشنهاد
                      </button>
                    </React.Fragment>
                  ))}
                <Link
                  href={`/repairs/track/${job.tracking_token}`}
                  target="_blank"
                  className={styles.btnGhost}
                >
                  <ExternalLink size={14} /> صفحه کامل پیگیری
                </Link>
              </div>
            </section>
          ) : null}
        </div>
      </div>

      {isAdmin ? (
        <FilterDialog
          isOpen={picker === 'tech'}
          title="انتخاب سرویسکار"
          options={techOptions}
          value={job.technician || ''}
          emptyLabel="بدون سرویسکار"
          showEmpty
          searchable={techOptions.length > 4}
          onChange={(v) => assignTech(v || null)}
          onClose={() => setPicker(null)}
        />
      ) : null}

      {(isAdmin || isTech) && (
        <>
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
        </>
      )}
    </>
  )
}