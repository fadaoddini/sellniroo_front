'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  ArrowDown, ArrowUp, Check, Coffee, Plus, Trash2, Bell,
} from 'lucide-react'
import schoolService from '@/components/School/services/schoolService'
import { faNum, toFaDigits } from '@/components/School/schoolDate'
import styles from './School.module.css'

function emptyPeriod(order) {
  return {
    id: null,
    title: `زنگ ${order}`,
    order,
    start_time: '',
    end_time: '',
    is_break: false,
  }
}

function normTime(v) {
  if (!v) return ''
  return String(v).slice(0, 5)
}

export default function PeriodsManager({ onNotify, onSaved }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await schoolService.periods()
    setLoading(false)
    if (!res.success) {
      onNotify?.(res.error || 'خطا در دریافت زنگ‌ها', true)
      return
    }
    setRows((res.data || []).map((p, i) => ({
      id: p.id,
      title: p.title || `زنگ ${i + 1}`,
      order: p.order || i + 1,
      start_time: normTime(p.start_time),
      end_time: normTime(p.end_time),
      is_break: !!p.is_break,
    })))
  }, [onNotify])

  useEffect(() => {
    load()
  }, [load])

  const update = (idx, patch) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
  }

  const add = (asBreak = false) => {
    setRows((prev) => [
      ...prev,
      {
        ...emptyPeriod(prev.length + 1),
        title: asBreak ? 'تفریح' : `زنگ ${prev.length + 1}`,
        is_break: asBreak,
      },
    ])
  }

  const remove = (idx) => {
    if (rows.length <= 1) {
      onNotify?.('حداقل یک زنگ لازم است', true)
      return
    }
    setRows((prev) => prev.filter((_, i) => i !== idx).map((r, i) => ({ ...r, order: i + 1 })))
  }

  const move = (idx, dir) => {
    const j = idx + dir
    if (j < 0 || j >= rows.length) return
    setRows((prev) => {
      const next = [...prev]
      const tmp = next[idx]
      next[idx] = next[j]
      next[j] = tmp
      return next.map((r, i) => ({ ...r, order: i + 1 }))
    })
  }

  const save = async () => {
    setSaving(true)
    const payload = rows.map((r, i) => ({
      id: r.id || undefined,
      title: r.title.trim() || `زنگ ${i + 1}`,
      order: i + 1,
      start_time: r.start_time || null,
      end_time: r.end_time || null,
      is_break: !!r.is_break,
    }))
    const res = await schoolService.savePeriods(payload)
    setSaving(false)
    if (!res.success) {
      onNotify?.(res.error || 'ذخیره زنگ‌ها ناموفق', true)
      return
    }
    setRows((res.data || []).map((p, i) => ({
      id: p.id,
      title: p.title,
      order: p.order || i + 1,
      start_time: normTime(p.start_time),
      end_time: normTime(p.end_time),
      is_break: !!p.is_break,
    })))
    onNotify?.('زنگ‌ها ذخیره شد')
    onSaved?.(res.data || [])
  }

  if (loading) return <div className={styles.empty}>بارگذاری زنگ‌ها…</div>

  return (
    <div className={styles.prdPanel}>
      <div className={styles.clsTopBar}>
        <h3 className={styles.clsTopTitle}>
          <Bell size={14} strokeWidth={2} />
          تعریف زنگ‌ها
          <span className={styles.prdCount}>{faNum(rows.length)}</span>
        </h3>
        <div className={styles.clsTopActions}>
          <button type="button" className={styles.clsActionBtn} onClick={() => add(false)}>
            <Plus size={12} strokeWidth={2} /> زنگ
          </button>
          <button type="button" className={styles.clsActionBtn} onClick={() => add(true)}>
            <Coffee size={12} strokeWidth={2} /> تفریح
          </button>
          <button type="button" className={styles.clsPrimaryBtn} disabled={saving} onClick={save}>
            <Check size={13} strokeWidth={2.4} /> {saving ? '…' : 'ذخیره'}
          </button>
        </div>
      </div>

      <p className={styles.prdHint}>
        تعداد و ترتیب زنگ‌های مدرسه را مشخص کنید. ردیف «تفریح» در جدول برنامه به‌صورت تعطیلی کوتاه نمایش داده می‌شود.
      </p>

      <div className={styles.prdList}>
        {rows.map((r, idx) => (
          <div
            key={r.id || `new-${idx}`}
            className={`${styles.prdRow} ${r.is_break ? styles.prdRowBreak : ''}`}
          >
            <span className={styles.prdOrder}>{toFaDigits(idx + 1)}</span>
            <input
              className={styles.prdInput}
              value={r.title}
              onChange={(e) => update(idx, { title: e.target.value })}
              placeholder="عنوان"
            />
            <input
              className={styles.prdTime}
              type="time"
              value={r.start_time}
              onChange={(e) => update(idx, { start_time: e.target.value })}
              title="شروع"
            />
            <input
              className={styles.prdTime}
              type="time"
              value={r.end_time}
              onChange={(e) => update(idx, { end_time: e.target.value })}
              title="پایان"
            />
            <button
              type="button"
              className={`${styles.prdToggle} ${r.is_break ? styles.prdToggleOn : ''}`}
              onClick={() => update(idx, { is_break: !r.is_break, title: !r.is_break && !r.title.includes('تفریح') ? 'تفریح' : r.title })}
              title="تفریح"
            >
              <Coffee size={12} strokeWidth={2} />
            </button>
            <button type="button" className={styles.clsIconBtn} onClick={() => move(idx, -1)} aria-label="بالا">
              <ArrowUp size={12} strokeWidth={2} />
            </button>
            <button type="button" className={styles.clsIconBtn} onClick={() => move(idx, 1)} aria-label="پایین">
              <ArrowDown size={12} strokeWidth={2} />
            </button>
            <button type="button" className={styles.clsIconBtnDanger} onClick={() => remove(idx)} aria-label="حذف">
              <Trash2 size={12} strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
