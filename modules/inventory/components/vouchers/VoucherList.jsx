'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ScrollText,
  Search,
  RefreshCw,
  Printer,
  Eye,
  Loader2,
  Archive,
  ArchiveRestore,
  Undo2,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useInventory } from '@/modules/inventory/context/InventoryContext'
import ConfirmDialog from '../common/ConfirmDialog'
import VoucherPrint from './VoucherPrint'
import styles from './vouchers.module.css'

const faNum = (n) => Number(n || 0).toLocaleString('fa-IR')

const formatDate = (value) => {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('fa-IR')
  } catch {
    return '—'
  }
}

export default function VoucherList() {
  const { language } = useLanguage()
  const fa = language === 'fa'
  const {
    loadTransactions,
    loadWarehouses,
    cancelTransaction,
    archiveTransaction,
    unarchiveTransaction,
    state,
  } = useInventory()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [viewMode, setViewMode] = useState('active') // active | archived | rejected
  const [selected, setSelected] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [archiveTarget, setArchiveTarget] = useState(null)
  const initialDone = useRef(false)

  const t = useMemo(
    () => ({
      title: fa ? 'حواله‌ها' : 'Vouchers',
      subtitle: fa
        ? 'چاپ، آرشیو و رد حواله خروج با برگشت به انبار'
        : 'Print, archive, or reject stock-out vouchers',
      refresh: fa ? 'بروزرسانی' : 'Refresh',
      search: fa ? 'جستجو شماره، کالا، انبار، مجوز...' : 'Search ref, product, warehouse...',
      allWarehouses: fa ? 'همه انبارها' : 'All warehouses',
      empty: fa ? 'حواله‌ای برای نمایش نیست' : 'No vouchers yet',
      print: fa ? 'چاپ' : 'Print',
      view: fa ? 'مشاهده' : 'View',
      ref: fa ? 'شماره حواله' : 'Reference',
      date: fa ? 'تاریخ' : 'Date',
      warehouse: fa ? 'انبار' : 'Warehouse',
      product: fa ? 'کالا' : 'Product',
      qty: fa ? 'تعداد' : 'Qty',
      auth: fa ? 'مجوز خروج' : 'Authorized by',
      status: fa ? 'وضعیت' : 'Status',
      actions: fa ? 'عملیات' : 'Actions',
      noAuth: fa ? 'بدون مجوز ثبت‌شده' : 'No authorizer',
      tabActive: fa ? 'فعال' : 'Active',
      tabArchived: fa ? 'آرشیو' : 'Archived',
      tabRejected: fa ? 'رد شده' : 'Rejected',
      archive: fa ? 'آرشیو' : 'Archive',
      unarchive: fa ? 'خروج از آرشیو' : 'Unarchive',
      reject: fa ? 'رد حواله' : 'Reject',
      rejectTitle: fa ? 'رد حواله و برگشت به انبار' : 'Reject voucher & restore stock',
      rejectMsg: fa
        ? 'اگر خروج از انبار انجام نشده، با رد حواله همان مقدار به انبار برمی‌گردد. ادامه می‌دهید؟'
        : 'If goods were not actually issued, rejecting restores the same quantity to stock. Continue?',
      rejectReason: fa ? 'علت رد (اختیاری)' : 'Reject reason (optional)',
      rejectConfirm: fa ? 'رد و برگشت موجودی' : 'Reject & restore',
      archiveTitle: fa ? 'آرشیو حواله' : 'Archive voucher',
      archiveMsg: fa
        ? 'این حواله به آرشیو منتقل می‌شود و از لیست فعال خارج می‌گردد.'
        : 'This voucher will move to the archive list.',
      archiveConfirm: fa ? 'آرشیو کن' : 'Archive',
    }),
    [fa]
  )

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await loadWarehouses?.()
      // همه خروج‌ها را می‌گیریم و در کلاینت فیلتر می‌کنیم
      const txns = await loadTransactions({
        transaction_type: 'OUT',
      })
      const list = Array.isArray(txns?.results)
        ? txns.results
        : Array.isArray(txns)
          ? txns
          : []
      setItems(list)
    } catch (err) {
      setError(err?.message || (fa ? 'خطا در بارگذاری حواله‌ها' : 'Failed to load vouchers'))
    } finally {
      setLoading(false)
    }
  }, [loadTransactions, loadWarehouses, fa])

  useEffect(() => {
    if (initialDone.current) return
    initialDone.current = true
    fetchData()
  }, [fetchData])

  const warehouses = state.warehouses || []

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((item) => {
      if (viewMode === 'active') {
        if (item.is_archived || item.status === 'CANCELLED') return false
      } else if (viewMode === 'archived') {
        if (!item.is_archived) return false
      } else if (viewMode === 'rejected') {
        if (item.status !== 'CANCELLED' || item.is_archived) return false
      }

      if (warehouseId && String(item.warehouse) !== String(warehouseId)) return false
      if (!q) return true
      const hay = [
        item.reference_number,
        item.product_title,
        item.product_code,
        item.warehouse_title,
        item.authorized_by_name,
        item.authorized_by_position,
        item.unit_title,
        item.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [items, search, warehouseId, viewMode])

  const counts = useMemo(() => {
    const active = items.filter((i) => !i.is_archived && i.status !== 'CANCELLED').length
    const archived = items.filter((i) => i.is_archived).length
    const rejected = items.filter((i) => i.status === 'CANCELLED' && !i.is_archived).length
    return { active, archived, rejected }
  }, [items])

  const patchItem = (id, patch) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))
    setSelected((prev) => (prev?.id === id ? { ...prev, ...patch } : prev))
  }

  const handleReject = async () => {
    if (!rejectTarget) return
    setActionLoading(true)
    setError(null)
    try {
      const result = await cancelTransaction(rejectTarget.id, rejectReason.trim())
      const updated = result?.data || { status: 'CANCELLED' }
      patchItem(rejectTarget.id, updated)
      setRejectTarget(null)
      setRejectReason('')
      setViewMode('rejected')
      await fetchData()
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          (fa ? 'خطا در رد حواله' : 'Reject failed')
      )
    } finally {
      setActionLoading(false)
    }
  }

  const handleArchive = async () => {
    if (!archiveTarget) return
    setActionLoading(true)
    setError(null)
    try {
      const result = await archiveTransaction(archiveTarget.id)
      const updated = result?.data || { is_archived: true }
      patchItem(archiveTarget.id, updated)
      setArchiveTarget(null)
      setViewMode('archived')
      await fetchData()
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          (fa ? 'خطا در آرشیو' : 'Archive failed')
      )
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnarchive = async (item) => {
    setActionLoading(true)
    setError(null)
    try {
      const result = await unarchiveTransaction(item.id)
      const updated = result?.data || { is_archived: false }
      patchItem(item.id, updated)
      setViewMode(item.status === 'CANCELLED' ? 'rejected' : 'active')
      await fetchData()
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          (fa ? 'خطا در خروج از آرشیو' : 'Unarchive failed')
      )
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1>
            <ScrollText size={26} />
            {t.title}
          </h1>
          <p>{t.subtitle}</p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.btnGhost} onClick={fetchData}>
            <RefreshCw size={16} />
            {t.refresh}
          </button>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${viewMode === 'active' ? styles.tabActive : ''}`}
          onClick={() => setViewMode('active')}
        >
          {t.tabActive}
          <em>{faNum(counts.active)}</em>
        </button>
        <button
          type="button"
          className={`${styles.tab} ${viewMode === 'rejected' ? styles.tabActive : ''}`}
          onClick={() => setViewMode('rejected')}
        >
          {t.tabRejected}
          <em>{faNum(counts.rejected)}</em>
        </button>
        <button
          type="button"
          className={`${styles.tab} ${viewMode === 'archived' ? styles.tabActive : ''}`}
          onClick={() => setViewMode('archived')}
        >
          {t.tabArchived}
          <em>{faNum(counts.archived)}</em>
        </button>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.search}
          />
        </div>
        <select
          value={warehouseId}
          onChange={(e) => setWarehouseId(e.target.value)}
          aria-label={t.warehouse}
        >
          <option value="">{t.allWarehouses}</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.title}
            </option>
          ))}
        </select>
      </div>

      {error ? <div className={styles.error}>{error}</div> : null}

      {loading ? (
        <div className={styles.loading}>
          <Loader2 size={22} className={styles.spin} />
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>{t.empty}</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t.ref}</th>
                <th>{t.date}</th>
                <th>{t.warehouse}</th>
                <th>{t.product}</th>
                <th>{t.qty}</th>
                <th>{t.auth}</th>
                <th>{t.status}</th>
                <th>{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const canReject =
                  item.status === 'CONFIRMED' && !item.is_archived
                const canArchive =
                  !item.is_archived &&
                  (item.status === 'CONFIRMED' || item.status === 'CANCELLED')
                const canUnarchive = !!item.is_archived

                return (
                  <tr key={item.id}>
                    <td>
                      <span className={styles.ref}>{item.reference_number || '—'}</span>
                    </td>
                    <td>{formatDate(item.transaction_date || item.created_at)}</td>
                    <td>{item.warehouse_title || '—'}</td>
                    <td>
                      <div>{item.product_title || '—'}</div>
                      {item.product_code ? (
                        <div className={styles.muted}>{item.product_code}</div>
                      ) : null}
                    </td>
                    <td>
                      {faNum(item.quantity)}{' '}
                      {item.unit_abbreviation || item.unit_title || ''}
                    </td>
                    <td>
                      {item.authorized_by_name ? (
                        <>
                          <div>{item.authorized_by_name}</div>
                          {item.authorized_by_position ? (
                            <div className={styles.muted}>
                              {item.authorized_by_position}
                            </div>
                          ) : null}
                        </>
                      ) : (
                        <span className={styles.muted}>{t.noAuth}</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          item.status === 'CONFIRMED'
                            ? styles.badgeOk
                            : item.status === 'CANCELLED'
                              ? styles.badgeReject
                              : item.status === 'PENDING'
                                ? styles.badgeWait
                                : ''
                        }`}
                      >
                        {item.status === 'CANCELLED'
                          ? fa
                            ? 'رد شده'
                            : 'Rejected'
                          : item.status_display || item.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          title={t.view}
                          onClick={() => setSelected(item)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          title={t.print}
                          onClick={() => setSelected(item)}
                        >
                          <Printer size={16} />
                        </button>
                        {canReject ? (
                          <button
                            type="button"
                            className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                            title={t.reject}
                            onClick={() => {
                              setRejectReason('')
                              setRejectTarget(item)
                            }}
                          >
                            <Undo2 size={16} />
                          </button>
                        ) : null}
                        {canArchive ? (
                          <button
                            type="button"
                            className={styles.iconBtn}
                            title={t.archive}
                            onClick={() => setArchiveTarget(item)}
                          >
                            <Archive size={16} />
                          </button>
                        ) : null}
                        {canUnarchive ? (
                          <button
                            type="button"
                            className={styles.iconBtn}
                            title={t.unarchive}
                            onClick={() => handleUnarchive(item)}
                            disabled={actionLoading}
                          >
                            <ArchiveRestore size={16} />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected ? (
        <VoucherPrint
          voucher={selected}
          onClose={() => setSelected(null)}
          onReject={
            selected.status === 'CONFIRMED' && !selected.is_archived
              ? () => {
                  setRejectReason('')
                  setRejectTarget(selected)
                }
              : null
          }
          onArchive={
            !selected.is_archived &&
            (selected.status === 'CONFIRMED' || selected.status === 'CANCELLED')
              ? () => setArchiveTarget(selected)
              : null
          }
        />
      ) : null}

      {rejectTarget ? (
        <div className={styles.sheetOverlay} role="dialog" aria-modal="true">
          <div className={styles.confirmCard}>
            <h3>{t.rejectTitle}</h3>
            <p>
              {t.rejectMsg}
              <br />
              <strong>
                {rejectTarget.reference_number} · {rejectTarget.product_title} ·{' '}
                {faNum(rejectTarget.quantity)}{' '}
                {rejectTarget.unit_abbreviation || rejectTarget.unit_title}
              </strong>
            </p>
            <label className={styles.reasonLabel}>
              {t.rejectReason}
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder={fa ? 'مثلاً مشتری نیامد / خروج انجام نشد' : 'e.g. not delivered'}
              />
            </label>
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.btnGhost}
                onClick={() => setRejectTarget(null)}
                disabled={actionLoading}
              >
                {fa ? 'انصراف' : 'Cancel'}
              </button>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={handleReject}
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 size={16} className={styles.spin} /> : null}
                {t.rejectConfirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        isOpen={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleArchive}
        title={t.archiveTitle}
        message={`${t.archiveMsg}\n${archiveTarget?.reference_number || ''}`}
        confirmText={t.archiveConfirm}
        loading={actionLoading}
      />
    </div>
  )
}
