'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronLeft,
  FolderTree,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import shopOwnerApi from '@/services/shopOwnerApi'
import {
  buildCategoryIndex,
  formatCategoryPath,
  getCategoryPath,
  getChildren,
} from './categoryTree'
import styles from './ShopPanel.module.css'

function TreeRow({
  cat,
  depth,
  childrenOf,
  expanded,
  onToggle,
  selectedId,
  onSelect,
}) {
  const kids = getChildren(childrenOf, cat.id)
  const open = expanded.has(String(cat.id))
  const selected = String(selectedId) === String(cat.id)
  return (
    <li>
      <button
        type="button"
        className={`${styles.catRow}${selected ? ` ${styles.catRowOn}` : ''}`}
        style={{ paddingInlineStart: `${0.65 + depth * 0.85}rem` }}
        onClick={() => onSelect(cat)}
      >
        {kids.length ? (
          <span
            className={styles.catExpand}
            onClick={(e) => {
              e.stopPropagation()
              onToggle(cat.id)
            }}
            role="presentation"
          >
            {open ? <ChevronDown size={14} /> : <ChevronLeft size={14} />}
          </span>
        ) : (
          <span className={styles.catExpandSpacer} />
        )}
        <span className={styles.catTitle}>{cat.title}</span>
        {cat.status === 'inactive' ? (
          <span className={styles.metaChip}>غیرفعال</span>
        ) : null}
        {kids.length ? (
          <span className={styles.catCount}>{kids.length}</span>
        ) : null}
      </button>
      {open && kids.length ? (
        <ul className={styles.catTree}>
          {kids.map((c) => (
            <TreeRow
              key={c.id}
              cat={c}
              depth={depth + 1}
              childrenOf={childrenOf}
              expanded={expanded}
              onToggle={onToggle}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export default function OwnerCategoriesPanel({ onFlash, onError }) {
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [categories, setCategories] = useState([])
  const [expanded, setExpanded] = useState(() => new Set())
  const [selectedId, setSelectedId] = useState(null)
  const [title, setTitle] = useState('')
  const [parentId, setParentId] = useState('')
  const [status, setStatus] = useState('active')
  const [mode, setMode] = useState('create')

  const { byId, childrenOf } = useMemo(
    () => buildCategoryIndex(categories),
    [categories],
  )
  const roots = useMemo(() => getChildren(childrenOf, null), [childrenOf])
  const selected = selectedId ? byId.get(String(selectedId)) : null
  const selectedPath = selectedId
    ? formatCategoryPath(getCategoryPath(selectedId, byId))
    : ''

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await shopOwnerApi.listCategories({ manage: '1' })
      const arr = Array.isArray(list) ? list : list?.results || []
      setCategories(arr)
      setExpanded((prev) => {
        if (prev.size) return prev
        return new Set(
          arr.filter((c) => c.parent == null).map((c) => String(c.id)),
        )
      })
    } catch (e) {
      onError?.(e.message || 'بارگذاری دسته‌ها ناموفق')
    } finally {
      setLoading(false)
    }
  }, [onError])

  useEffect(() => {
    load()
  }, [load])

  const resetCreate = () => {
    setMode('create')
    setSelectedId(null)
    setTitle('')
    setParentId('')
    setStatus('active')
  }

  const selectCat = (cat) => {
    setMode('edit')
    setSelectedId(cat.id)
    setTitle(cat.title || '')
    setParentId(cat.parent != null ? String(cat.parent) : '')
    setStatus(cat.status || 'active')
  }

  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      const k = String(id)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      onError?.('عنوان دسته الزامی است')
      return
    }
    setBusy(true)
    try {
      const payload = {
        title: title.trim(),
        parent: parentId || null,
        status,
      }
      if (mode === 'edit' && selectedId) {
        await shopOwnerApi.updateCategory(selectedId, payload)
        onFlash?.('دسته به‌روز شد')
      } else {
        await shopOwnerApi.createCategory(payload)
        onFlash?.('دسته ساخته شد')
        resetCreate()
      }
      await load()
    } catch (err) {
      onError?.(err.message || 'ذخیره دسته ناموفق')
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!selectedId) return
    if (!window.confirm('این دسته و زیرمجموعه‌های بدون محصول فعال حذف شوند؟')) {
      return
    }
    setBusy(true)
    try {
      await shopOwnerApi.deleteCategory(selectedId)
      onFlash?.('دسته حذف شد')
      resetCreate()
      await load()
    } catch (err) {
      onError?.(err.message || 'حذف ناموفق')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className={styles.section} data-tour="shop-categories">
      <div className={styles.sectionHead}>
        <div>
          <h2>دسته‌بندی محصولات</h2>
          <p className={styles.sub} style={{ marginTop: 4 }}>
            فقط برگ نهایی در محصول قابل انتخاب است.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={resetCreate}
          >
            <Plus size={14} />
            دسته جدید
          </button>
          <button
            type="button"
            className={styles.iconRound}
            onClick={load}
            aria-label="بازنشانی"
          >
            <RefreshCw size={15} className={loading ? styles.spin : undefined} />
          </button>
        </div>
      </div>

      <div className={styles.catLayout}>
        <div className={styles.panel}>
          <h2>
            <FolderTree size={14} style={{ marginInlineEnd: 6 }} />
            درخت دسته‌ها
          </h2>
          {loading ? (
            <div className={styles.empty}>
              <Loader2 size={18} className={styles.spin} /> در حال بارگذاری…
            </div>
          ) : !roots.length ? (
            <div className={styles.empty}>هنوز دسته‌ای نیست — یکی بسازید.</div>
          ) : (
            <ul className={styles.catTree}>
              {roots.map((c) => (
                <TreeRow
                  key={c.id}
                  cat={c}
                  depth={0}
                  childrenOf={childrenOf}
                  expanded={expanded}
                  onToggle={toggleExpand}
                  selectedId={selectedId}
                  onSelect={selectCat}
                />
              ))}
            </ul>
          )}
        </div>

        <form className={`${styles.panel} ${styles.formCard}`} onSubmit={submit}>
          <h2>{mode === 'edit' ? 'ویرایش دسته' : 'دسته جدید'}</h2>
          {selectedPath ? (
            <p className={styles.mapHint}>مسیر: {selectedPath}</p>
          ) : null}
          <div className={styles.formStack}>
            <label>
              عنوان
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثلاً لبنیات"
              />
            </label>
            <label>
              والد (اختیاری)
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
              >
                <option value="">بدون والد — ریشه</option>
                {categories
                  .filter((c) => String(c.id) !== String(selectedId))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              وضعیت
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="active">فعال</option>
                <option value="inactive">غیرفعال</option>
              </select>
            </label>
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryBtn} disabled={busy}>
              {busy ? '…' : mode === 'edit' ? 'ذخیره' : 'ایجاد'}
            </button>
            {mode === 'edit' ? (
              <button
                type="button"
                className={styles.noBtn}
                disabled={busy}
                onClick={remove}
              >
                <Trash2 size={14} />
                حذف
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  )
}
