'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Check,
  ChevronLeft,
  FolderOpen,
  FolderTree,
  Search,
  Tag,
  X,
} from 'lucide-react'
import {
  buildCategoryIndex,
  filterAssignableCategories,
  formatCategoryPath,
  getCategoryPath,
  getChildren,
  isLeafCategory,
  searchLeafCategories,
} from './categoryTree'
import styles from './ShopPanel.module.css'

function Dialog({ open, title, onClose, children, footer, wide }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className={styles.dialogRoot} role="dialog" aria-modal="true">
      <button
        type="button"
        className={styles.dialogBackdrop}
        aria-label="بستن"
        onClick={onClose}
      />
      <div
        className={`${styles.dialogCard} ${wide ? styles.dialogCardWide : ''}`}
      >
        <div className={styles.dialogHead}>
          <h4>{title}</h4>
          <button type="button" className={styles.iconRound} onClick={onClose}>
            <X size={15} />
          </button>
        </div>
        <div className={styles.dialogBody}>{children}</div>
        {footer ? <div className={styles.dialogFoot}>{footer}</div> : null}
      </div>
    </div>
  )
}

export function useCategoryLabel(categories, categoryId) {
  return useMemo(() => {
    if (!categoryId) return ''
    const { byId, childrenOf } = buildCategoryIndex(categories)
    const path = getCategoryPath(categoryId, byId)
    if (!path.length) return ''
    const leaf = path[path.length - 1]
    if (!isLeafCategory(leaf, childrenOf)) {
      return `${leaf.title} (ناقص — زیرمجموعه انتخاب کنید)`
    }
    return formatCategoryPath(path)
  }, [categories, categoryId])
}

/**
 * انتخابگر سلسله‌مراتبی استاندارد:
 * - والدها فقط برای مرور درخت (غیرقابل انتخاب محصول)
 * - فقط برگ نهایی انتخاب می‌شود
 * - جستجو روی برگ‌ها با نمایش مسیر کامل
 */
export default function CategoryPicker({
  open,
  onClose,
  categories = [],
  value,
  onSelect,
  /** فقط دسته‌های فعال (و اجداد فعال) — پیش‌فرض برای فرم محصول */
  assignableOnly = true,
}) {
  const visibleCategories = useMemo(
    () =>
      assignableOnly
        ? filterAssignableCategories(categories)
        : categories,
    [categories, assignableOnly],
  )
  const { byId, childrenOf } = useMemo(
    () => buildCategoryIndex(visibleCategories),
    [visibleCategories],
  )
  const [query, setQuery] = useState('')
  const [browseParentId, setBrowseParentId] = useState(null)
  const searchRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setQuery('')
    // اگر قبلاً دسته‌ای انتخاب شده، از والد آن شروع کن تا مسیر نزدیک باشد
    if (value) {
      const path = getCategoryPath(value, byId)
      if (path.length >= 2) {
        setBrowseParentId(path[path.length - 2].id)
      } else {
        setBrowseParentId(null)
      }
    } else {
      setBrowseParentId(null)
    }
    const t = setTimeout(() => searchRef.current?.focus(), 80)
    return () => clearTimeout(t)
  }, [open, value, byId])

  const breadcrumb = useMemo(() => {
    if (browseParentId == null) return []
    return getCategoryPath(browseParentId, byId)
  }, [browseParentId, byId])

  const currentChildren = useMemo(
    () => getChildren(childrenOf, browseParentId),
    [childrenOf, browseParentId],
  )

  const searchHits = useMemo(() => {
    if (!query.trim()) return null
    return searchLeafCategories(visibleCategories, childrenOf, byId, query)
  }, [query, visibleCategories, childrenOf, byId])

  const selectedPath = value ? getCategoryPath(value, byId) : []

  const goRoot = () => setBrowseParentId(null)
  const goTo = (id) => setBrowseParentId(id)

  const pickLeaf = (leaf) => {
    if (!isLeafCategory(leaf, childrenOf)) return
    onSelect?.(String(leaf.id), leaf)
    onClose?.()
  }

  const enterBranch = (cat) => {
    setQuery('')
    setBrowseParentId(cat.id)
  }

  return (
    <Dialog
      open={open}
      title="انتخاب دسته‌بندی"
      onClose={onClose}
      wide
      footer={
        <button type="button" className={styles.ghostBtn} onClick={onClose}>
          بستن
        </button>
      }
    >
      <div className={styles.catPicker} dir="rtl">
        <label className={styles.catSearch}>
          <Search size={15} strokeWidth={2} />
          <input
            ref={searchRef}
            type="search"
            placeholder="جستجو در دسته‌های نهایی… مثلاً زنانه، سامسونگ، فرش"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query ? (
            <button
              type="button"
              className={styles.catSearchClear}
              onClick={() => setQuery('')}
              aria-label="پاک کردن"
            >
              <X size={13} />
            </button>
          ) : null}
        </label>

        <p className={styles.catHint}>
          فقط آخرین سطح (بدون زیرمجموعه) قابل انتخاب است. روی پوشه‌ها کلیک کنید
          تا وارد زیرمجموعه‌ها شوید.
        </p>

        {searchHits ? (
          <div className={styles.catSearchResults}>
            {searchHits.length === 0 ? (
              <div className={styles.catEmpty}>نتیجه‌ای پیدا نشد</div>
            ) : (
              searchHits.map(({ leaf, path }) => {
                const on = String(value) === String(leaf.id)
                return (
                  <button
                    key={leaf.id}
                    type="button"
                    className={on ? styles.catHitOn : styles.catHit}
                    onClick={() => pickLeaf(leaf)}
                  >
                    <span className={styles.catHitIcon}>
                      <Tag size={14} />
                    </span>
                    <span className={styles.catHitText}>
                      <strong>{leaf.title}</strong>
                      <em>{formatCategoryPath(path.slice(0, -1)) || 'ریشه'}</em>
                    </span>
                    {on ? <Check size={15} /> : null}
                  </button>
                )
              })
            )}
          </div>
        ) : (
          <>
            <nav className={styles.catBreadcrumb} aria-label="مسیر دسته">
              <button
                type="button"
                className={
                  browseParentId == null
                    ? styles.catCrumbOn
                    : styles.catCrumb
                }
                onClick={goRoot}
              >
                همه دسته‌ها
              </button>
              {breadcrumb.map((c) => (
                <React.Fragment key={c.id}>
                  <span className={styles.catCrumbSep} aria-hidden>
                    ‹
                  </span>
                  <button
                    type="button"
                    className={
                      String(browseParentId) === String(c.id)
                        ? styles.catCrumbOn
                        : styles.catCrumb
                    }
                    onClick={() => goTo(c.id)}
                  >
                    {c.title}
                  </button>
                </React.Fragment>
              ))}
            </nav>

            <div className={styles.catList}>
              {currentChildren.length === 0 ? (
                <div className={styles.catEmpty}>
                  {browseParentId == null
                    ? 'هنوز دسته‌ای تعریف نشده'
                    : 'زیرمجموعه‌ای وجود ندارد — این سطح قابل انتخاب نیست اگر خالی است'}
                </div>
              ) : (
                currentChildren.map((cat) => {
                  const leaf = isLeafCategory(cat, childrenOf)
                  const childCount = getChildren(childrenOf, cat.id).length
                  const on = leaf && String(value) === String(cat.id)
                  if (leaf) {
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        className={on ? styles.catLeafOn : styles.catLeaf}
                        onClick={() => pickLeaf(cat)}
                      >
                        <span className={styles.catRowIcon}>
                          <Tag size={15} />
                        </span>
                        <span className={styles.catRowMain}>
                          <strong>{cat.title}</strong>
                          <em>قابل انتخاب برای محصول</em>
                        </span>
                        {on ? <Check size={15} /> : null}
                      </button>
                    )
                  }
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={styles.catBranch}
                      onClick={() => enterBranch(cat)}
                    >
                      <span className={styles.catRowIcon}>
                        <FolderOpen size={15} />
                      </span>
                      <span className={styles.catRowMain}>
                        <strong>{cat.title}</strong>
                        <em>
                          {childCount.toLocaleString('fa-IR')} زیرمجموعه — فقط
                          مرور
                        </em>
                      </span>
                      <ChevronLeft size={16} className={styles.catChevron} />
                    </button>
                  )
                })
              )}
            </div>
          </>
        )}

        {selectedPath.length ? (
          <div className={styles.catSelected}>
            <FolderTree size={14} />
            <span>
              انتخاب فعلی:{' '}
              <strong>{formatCategoryPath(selectedPath)}</strong>
            </span>
          </div>
        ) : null}
      </div>
    </Dialog>
  )
}
