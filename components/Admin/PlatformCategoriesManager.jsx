'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Check,
  ChevronDown,
  ChevronLeft,
  FolderOpen,
  FolderTree,
  AlertTriangle,
  GraduationCap,
  Loader2,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  Trash2,
  X,
} from 'lucide-react'
import platformShopApi from '@/services/platformShopApi'
import {
  buildCategoryIndex,
  formatCategoryPath,
  getCategoryPath,
  getChildren,
  isLeafCategory,
} from '@/app/(site)/shop-panel/categoryTree'
import GuidedTour, { useGuidedTour } from '@/components/Admin/GuidedTour'
import styles from '@/app/(admin)/admincategories/AdminCategories.module.css'

function emptyForm(parentId = null) {
  return {
    title: '',
    parent: parentId == null ? '' : String(parentId),
    status: 'active',
    discount: '0',
    discount_status: 'inactive',
  }
}

/** تور کوتاه — قالب‌ها داخل تور نیست؛ اختیاری از دکمه جدا */
const TOUR_STEPS = [
  {
    id: 'welcome',
    target: '[data-tour="cat-intro"]',
    title: 'دسته‌بندی محصولات',
    text: 'سه ستون دارید: ساخت سریع، درخت، و ویرایش. فقط برگ نهایی در محصول انتخاب می‌شود.',
    hint: '«مرحله بعد» را بزنید.',
    advanceOn: 'manual',
  },
  {
    id: 'create',
    target: '[data-tour="cat-col-create"]',
    title: 'ساخت سریع',
    text: 'عنوان بدهید و ایجاد کنید. اگر والد بگذارید، زیرمجموعه همان دسته می‌شود.',
    hint: 'می‌توانید یک دسته بسازید یا رد کنید.',
    advanceOn: 'create',
  },
  {
    id: 'tree',
    target: '[data-tour="cat-col-tree"]',
    title: 'درخت دسته‌ها',
    text: 'روی هر ردیف کلیک کنید تا در ستون ویرایش باز شود. پوشه‌ها فقط برای مرورند.',
    hint: 'یک دسته را انتخاب کنید یا «مرحله بعد» بزنید.',
    advanceOn: 'select',
  },
  {
    id: 'form',
    target: '[data-tour="cat-col-edit"]',
    title: 'ویرایش',
    text: 'عنوان و والد را عوض کنید و ذخیره بزنید. حذف فقط وقتی محصول نداشته باشد آسان‌تر است.',
    hint: 'ذخیره اختیاری است — می‌توانید رد کنید.',
    advanceOn: 'save',
  },
  {
    id: 'templates',
    target: '[data-tour="cat-templates-btn"]',
    title: 'قالب مشاغل (اختیاری)',
    text: 'اگر خواستید درخت آماده (سوپرمارکت، پوشاک و…) داشته باشید، این دکمه را بعداً بزنید. تکراری ساخته نمی‌شود.',
    hint: 'الزامی نیست — «تمام» را بزنید.',
    advanceOn: 'manual',
  },
]

function TreeNode({
  cat,
  depth,
  childrenOf,
  expanded,
  toggle,
  selectedId,
  onSelect,
  matchIds,
}) {
  const kids = getChildren(childrenOf, cat.id).filter((c) =>
    matchIds ? matchIds.has(String(c.id)) : true,
  )
  const rawKids = getChildren(childrenOf, cat.id)
  const hasKids = rawKids.length > 0
  const open = expanded.has(String(cat.id))
  const leaf = isLeafCategory(cat, childrenOf)
  const on = String(selectedId) === String(cat.id)
  const activeProducts = Number(
    cat.active_products_count ?? cat.products_count ?? 0,
  )
  const inactive = cat.status === 'inactive'

  return (
    <div>
      <div
        className={`${styles.treeRow} ${on ? styles.treeRowOn : ''} ${
          inactive ? styles.treeRowOff : ''
        }`}
        style={{ paddingInlineStart: `${0.4 + depth * 0.75}rem` }}
        role="button"
        tabIndex={0}
        onClick={() => onSelect(cat)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect(cat)
          }
        }}
      >
        {hasKids ? (
          <button
            type="button"
            className={styles.treeToggle}
            aria-label={open ? 'بستن' : 'باز کردن'}
            onClick={(e) => {
              e.stopPropagation()
              toggle(cat.id)
            }}
          >
            {open ? <ChevronDown size={14} /> : <ChevronLeft size={14} />}
          </button>
        ) : (
          <span className={styles.treeToggle} aria-hidden />
        )}
        <span className={styles.treeIcon}>
          {leaf ? <Tag size={12} /> : <FolderOpen size={12} />}
        </span>
        <span className={styles.treeMain}>
          <strong>{cat.title}</strong>
          <span className={styles.meta}>
            {leaf
              ? `${activeProducts.toLocaleString('fa-IR')} محصول فعال`
              : `${rawKids.length.toLocaleString('fa-IR')} زیرشاخه · ${activeProducts.toLocaleString('fa-IR')} فعال`}
            {inactive ? ' · غیرفعال' : ''}
          </span>
        </span>
        {inactive ? (
          <span className={styles.badgeOff}>خاموش</span>
        ) : leaf ? (
          <span className={styles.badgeLeaf}>برگ</span>
        ) : null}
      </div>
      {hasKids && open
        ? kids.map((child) => (
            <TreeNode
              key={child.id}
              cat={child}
              depth={depth + 1}
              childrenOf={childrenOf}
              expanded={expanded}
              toggle={toggle}
              selectedId={selectedId}
              onSelect={onSelect}
              matchIds={matchIds}
            />
          ))
        : null}
    </div>
  )
}

function ConfirmDialog({
  open,
  title,
  description,
  details = [],
  confirmLabel = 'تأیید',
  cancelLabel = 'انصراف',
  danger = false,
  busy = false,
  onConfirm,
  onClose,
}) {
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
    <div className={styles.modalRoot} role="dialog" aria-modal="true">
      <button
        type="button"
        className={styles.modalBackdrop}
        aria-label="بستن"
        onClick={onClose}
      />
      <div className={`${styles.modalCard} ${styles.confirmCard}`}>
        <div className={styles.confirmBody}>
          <div
            className={danger ? styles.confirmIconDanger : styles.confirmIcon}
          >
            <AlertTriangle size={22} strokeWidth={2} />
          </div>
          <h3 className={styles.confirmTitle}>{title}</h3>
          {description ? (
            <p className={styles.confirmDesc}>{description}</p>
          ) : null}
          {details.length ? (
            <ul className={styles.confirmList}>
              {details.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className={styles.confirmFoot}>
          <button
            type="button"
            className={styles.ghostBtn}
            disabled={busy}
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={danger ? styles.dangerBtn : styles.primaryBtn}
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? (
              <Loader2 size={14} className={styles.spin} />
            ) : danger ? (
              <Trash2 size={14} />
            ) : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function TemplatesDialog({
  open,
  onClose,
  templates,
  busy,
  onInjectOne,
  onInjectAll,
}) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose?.()
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
    <div className={styles.modalRoot} role="dialog" aria-modal="true">
      <button
        type="button"
        className={styles.modalBackdrop}
        aria-label="بستن"
        onClick={onClose}
      />
      <div className={styles.modalCard}>
        <div className={styles.modalHead}>
          <div>
            <h3>قالب آماده مشاغل</h3>
            <p>اختیاری — مسیرهای تکراری دوباره وارد دیتابیس نمی‌شوند.</p>
          </div>
          <button type="button" className={styles.iconRound} onClick={onClose}>
            <X size={15} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.templatesGrid}>
            {templates.map((t) => (
              <article key={t.key} className={styles.templateCard}>
                <div className={styles.templateTop}>
                  <h3>{t.title}</h3>
                  <span className={styles.templateMeta}>
                    {(t.path_count || 0).toLocaleString('fa-IR')} مسیر
                  </span>
                </div>
                <p>{t.description}</p>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  disabled={busy}
                  onClick={() => onInjectOne(t.key)}
                >
                  {busy ? (
                    <Loader2 size={13} className={styles.spin} />
                  ) : (
                    <Plus size={13} />
                  )}
                  تزریق
                </button>
              </article>
            ))}
          </div>
        </div>
        <div className={styles.modalFoot}>
          <button type="button" className={styles.ghostBtn} onClick={onClose}>
            بستن
          </button>
          <button
            type="button"
            className={styles.okBtn}
            disabled={busy}
            onClick={onInjectAll}
          >
            <Sparkles size={14} />
            تزریق همه
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PlatformCategoriesManager({
  gate,
  Shell,
  shellProps = {},
}) {
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [categories, setCategories] = useState([])
  const [templates, setTemplates] = useState([])
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(() => new Set())
  const [selectedId, setSelectedId] = useState(null)
  const [mode, setMode] = useState('create')
  const [createForm, setCreateForm] = useState(emptyForm())
  const [editForm, setEditForm] = useState(emptyForm())
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [injectAllOpen, setInjectAllOpen] = useState(false)

  const tour = useGuidedTour(TOUR_STEPS)

  const { byId, childrenOf } = useMemo(
    () => buildCategoryIndex(categories),
    [categories],
  )
  const roots = useMemo(() => getChildren(childrenOf, null), [childrenOf])
  const selected = selectedId ? byId.get(String(selectedId)) : null
  const selectedPath = selectedId
    ? formatCategoryPath(getCategoryPath(selectedId, byId))
    : ''

  const matchingIds = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/ي/g, 'ی').replace(/ك/g, 'ک')
    if (!q) return null
    const ids = new Set()
    for (const c of categories) {
      const title = String(c.title || '')
        .toLowerCase()
        .replace(/ي/g, 'ی')
        .replace(/ك/g, 'ک')
      if (title.includes(q)) {
        ids.add(String(c.id))
        getCategoryPath(c.id, byId).forEach((p) => ids.add(String(p.id)))
      }
    }
    return ids
  }, [query, categories, byId])

  const load = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const [cats, tpls] = await Promise.all([
        platformShopApi.listCategories(),
        platformShopApi.listCategoryTemplates(),
      ])
      const list = Array.isArray(cats) ? cats : cats?.results || []
      setCategories(list)
      setTemplates(tpls?.results || [])
      setExpanded((prev) => {
        if (prev.size) return prev
        return new Set(
          list.filter((c) => c.parent == null).map((c) => String(c.id)),
        )
      })
    } catch (e) {
      setError(e?.message || 'خطا در بارگذاری')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (gate?.allowed) load()
  }, [gate?.allowed, load])

  useEffect(() => {
    if (!matchingIds) return
    setExpanded((prev) => {
      const next = new Set(prev)
      matchingIds.forEach((id) => next.add(id))
      return next
    })
  }, [matchingIds])

  const toggle = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      const key = String(id)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const selectForEdit = (cat) => {
    setSelectedId(cat.id)
    setMode('edit')
    setEditForm({
      title: cat.title || '',
      parent: cat.parent == null ? '' : String(cat.parent),
      status: cat.status || 'active',
      discount: cat.discount != null ? String(cat.discount) : '0',
      discount_status: cat.discount_status || 'inactive',
    })
    setCreateForm((f) => ({ ...f, parent: String(cat.id) }))
    setMsg('')
    setError('')
    tour.advance('select')
  }

  const parentOptions = useMemo(() => {
    const blocked = new Set()
    if (mode === 'edit' && selectedId) {
      const walk = (id) => {
        blocked.add(String(id))
        getChildren(childrenOf, id).forEach((c) => walk(c.id))
      }
      walk(selectedId)
    }
    return categories
      .filter((c) => !blocked.has(String(c.id)))
      .map((c) => ({
        id: c.id,
        label: formatCategoryPath(getCategoryPath(c.id, byId)) || c.title,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'fa'))
  }, [categories, byId, childrenOf, mode, selectedId])

  const allParents = useMemo(
    () =>
      categories
        .map((c) => ({
          id: c.id,
          label: formatCategoryPath(getCategoryPath(c.id, byId)) || c.title,
        }))
        .sort((a, b) => a.label.localeCompare(b.label, 'fa')),
    [categories, byId],
  )

  const createCategory = async (e) => {
    e?.preventDefault?.()
    const title = createForm.title.trim()
    if (!title) {
      setError('عنوان را وارد کنید')
      return
    }
    setBusy(true)
    setError('')
    setMsg('')
    try {
      const created = await platformShopApi.createCategory({
        title,
        parent: createForm.parent ? Number(createForm.parent) : null,
        status: 'active',
      })
      setMsg('دسته ساخته شد')
      const keepParent = createForm.parent
      setCreateForm(emptyForm(keepParent || null))
      await load()
      if (created?.id) {
        setSelectedId(created.id)
        setMode('edit')
        setEditForm({
          title: created.title || title,
          parent:
            created.parent == null ? '' : String(created.parent),
          status: created.status || 'active',
          discount: '0',
          discount_status: 'inactive',
        })
      }
      tour.advance('create')
    } catch (err) {
      setError(err?.message || err?.error || 'خطا در ایجاد')
    } finally {
      setBusy(false)
    }
  }

  const saveEdit = async (e) => {
    e?.preventDefault?.()
    if (!selectedId) return
    const title = editForm.title.trim()
    if (!title) {
      setError('عنوان را وارد کنید')
      return
    }
    setBusy(true)
    setError('')
    setMsg('')
    try {
      await platformShopApi.updateCategory(selectedId, {
        title,
        parent: editForm.parent ? Number(editForm.parent) : null,
        status: editForm.status,
        discount: Number(editForm.discount) || 0,
        discount_status: editForm.discount_status,
      })
      setMsg('ذخیره شد')
      await load()
      tour.advance('save')
    } catch (err) {
      setError(err?.message || err?.error || 'خطا در ذخیره')
    } finally {
      setBusy(false)
    }
  }

  const toggleStatus = async () => {
    if (!selectedId || !selected) return
    const next = selected.status === 'active' ? 'inactive' : 'active'
    setBusy(true)
    setError('')
    setMsg('')
    try {
      await platformShopApi.updateCategory(selectedId, { status: next })
      setEditForm((f) => ({ ...f, status: next }))
      setMsg(
        next === 'active'
          ? 'دسته فعال شد'
          : 'دسته غیرفعال شد — محصولات این شاخه در ویترین دیده نمی‌شوند',
      )
      await load()
    } catch (err) {
      setError(err?.message || err?.error || 'خطا در تغییر وضعیت')
    } finally {
      setBusy(false)
    }
  }

  const askDelete = () => {
    if (!selectedId) return
    const activeN = Number(selected?.active_products_count || 0)
    if (activeN > 0) {
      setError(
        `این شاخه ${activeN.toLocaleString('fa-IR')} محصول فعال دارد و قابل حذف نیست`,
      )
      return
    }
    setDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedId) return
    setBusy(true)
    setError('')
    setMsg('')
    try {
      const res = await platformShopApi.deleteCategory(selectedId)
      setDeleteOpen(false)
      setMsg(
        `حذف شد · ${Number(res?.deleted_categories || 1).toLocaleString('fa-IR')} دسته` +
          (res?.deleted_inactive_products
            ? ` · ${Number(res.deleted_inactive_products).toLocaleString('fa-IR')} محصول غیرفعال`
            : ''),
      )
      setSelectedId(null)
      setMode('create')
      setEditForm(emptyForm())
      await load()
    } catch (err) {
      setError(err?.message || err?.error || 'خطا در حذف')
    } finally {
      setBusy(false)
    }
  }

  const formatInjectMsg = (r) => {
    if (!r) return 'تزریق انجام شد'
    if (r.created_paths === 0 && r.existing_paths > 0) {
      return `«${r.title}» از قبل کامل بود — چیزی تکراری اضافه نشد (${r.existing_paths.toLocaleString('fa-IR')} مسیر)`
    }
    return `«${r.title}» · جدید ${r.created_paths.toLocaleString('fa-IR')} · موجود ${r.existing_paths.toLocaleString('fa-IR')}`
  }

  const injectOne = async (key) => {
    setBusy(true)
    setError('')
    setMsg('')
    try {
      const res = await platformShopApi.injectCategoryTemplates({ key })
      setMsg(formatInjectMsg(res?.results?.[0]))
      await load()
    } catch (err) {
      setError(err?.message || err?.error || 'خطا در تزریق')
    } finally {
      setBusy(false)
    }
  }

  const confirmInjectAll = async () => {
    setBusy(true)
    setError('')
    setMsg('')
    try {
      const res = await platformShopApi.injectCategoryTemplates({ all: true })
      const results = res?.results || []
      const newTotal = results.reduce((s, r) => s + (r.created_paths || 0), 0)
      const existTotal = results.reduce((s, r) => s + (r.existing_paths || 0), 0)
      setInjectAllOpen(false)
      setMsg(
        newTotal === 0
          ? `همه قالب‌ها از قبل بودند — تکراری اضافه نشد (${existTotal.toLocaleString('fa-IR')} مسیر)`
          : `تزریق شد · جدید ${newTotal.toLocaleString('fa-IR')} · موجود ${existTotal.toLocaleString('fa-IR')}`,
      )
      await load()
    } catch (err) {
      setError(err?.message || err?.error || 'خطا در تزریق')
    } finally {
      setBusy(false)
    }
  }

  const stats = useMemo(() => {
    const leaves = categories.filter((c) =>
      isLeafCategory(c, childrenOf),
    ).length
    return { total: categories.length, leaves, rootsN: roots.length }
  }, [categories, childrenOf, roots])

  if (!gate) return null

  return (
    <Shell {...gate} wide tagline="دسته‌بندی" {...shellProps}>
      <div className={styles.page} dir="rtl">
        <header className={styles.header} data-tour="cat-intro">
          <div>
            <h1>دسته‌بندی</h1>
            <p className={styles.sub}>
              ساخت · درخت · ویرایش — قالب مشاغل اختیاری است.
            </p>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.helpBtn}
              onClick={() => tour.start()}
            >
              <GraduationCap size={15} />
              آموزش
            </button>
            <button
              type="button"
              className={styles.ghostBtn}
              data-tour="cat-templates-btn"
              onClick={() => setTemplatesOpen(true)}
            >
              <Sparkles size={14} />
              قالب مشاغل
            </button>
            <button
              type="button"
              className={styles.refreshBtn}
              onClick={load}
              disabled={busy || loading}
              title="بروزرسانی"
            >
              <RefreshCw
                size={14}
                className={loading ? styles.spin : undefined}
              />
            </button>
          </div>
        </header>

        {msg ? <div className={styles.bannerOk}>{msg}</div> : null}
        {error ? <div className={styles.bannerErr}>{error}</div> : null}

        {loading ? (
          <div className={styles.stateBox}>
            <Loader2 size={26} className={styles.spin} />
            <p>بارگذاری…</p>
          </div>
        ) : (
          <div className={styles.layout3}>
            {/* ستون ۱: ساخت */}
            <section className={styles.panel} data-tour="cat-col-create">
              <div className={styles.panelHead}>
                <h2>
                  <Plus size={14} style={{ verticalAlign: -2, marginLeft: 4 }} />
                  ساخت
                </h2>
              </div>
              <div className={styles.panelBody}>
                <form className={styles.formStack} onSubmit={createCategory}>
                  <label>
                    عنوان
                    <input
                      required
                      value={createForm.title}
                      onChange={(e) =>
                        setCreateForm((f) => ({ ...f, title: e.target.value }))
                      }
                      placeholder="مثلاً تی‌شرت"
                    />
                  </label>
                  <label>
                    والد
                    <select
                      value={createForm.parent}
                      onChange={(e) =>
                        setCreateForm((f) => ({
                          ...f,
                          parent: e.target.value,
                        }))
                      }
                    >
                      <option value="">ریشه</option>
                      {allParents.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="submit"
                    className={styles.primaryBtn}
                    disabled={busy}
                  >
                    {busy ? (
                      <Loader2 size={14} className={styles.spin} />
                    ) : (
                      <Plus size={14} />
                    )}
                    ایجاد
                  </button>
                </form>
              </div>
            </section>

            {/* ستون ۲: درخت */}
            <section className={styles.panel} data-tour="cat-col-tree">
              <div className={styles.panelHead}>
                <h2>
                  <FolderTree
                    size={14}
                    style={{ verticalAlign: -2, marginLeft: 4 }}
                  />
                  درخت
                </h2>
                <span className={styles.statsInline}>
                  {stats.leaves.toLocaleString('fa-IR')} برگ /{' '}
                  {stats.total.toLocaleString('fa-IR')}
                </span>
              </div>
              <div className={styles.panelBody}>
                <label className={styles.searchBox}>
                  <Search size={14} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="جستجو…"
                  />
                </label>
                <div className={styles.tree}>
                  {roots.length === 0 ? (
                    <div className={styles.empty}>
                      خالی است — بسازید یا از «قالب مشاغل» استفاده کنید.
                    </div>
                  ) : (
                    roots
                      .filter((c) =>
                        matchingIds ? matchingIds.has(String(c.id)) : true,
                      )
                      .map((cat) => (
                        <TreeNode
                          key={cat.id}
                          cat={cat}
                          depth={0}
                          childrenOf={childrenOf}
                          expanded={expanded}
                          toggle={toggle}
                          selectedId={selectedId}
                          onSelect={selectForEdit}
                          matchIds={matchingIds}
                        />
                      ))
                  )}
                </div>
              </div>
            </section>

            {/* ستون ۳: ویرایش */}
            <section className={styles.panel} data-tour="cat-col-edit">
              <div className={styles.panelHead}>
                <h2>ویرایش</h2>
              </div>
              <div className={styles.panelBody}>
                {!selectedId ? (
                  <div className={styles.empty}>
                    از درخت یک دسته انتخاب کنید.
                  </div>
                ) : (
                  <form className={styles.formStack} onSubmit={saveEdit}>
                    {selectedPath ? (
                      <p className={styles.pathPreview}>{selectedPath}</p>
                    ) : null}
                    <label>
                      عنوان
                      <input
                        required
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            title: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <label>
                      والد
                      <select
                        value={editForm.parent}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            parent: e.target.value,
                          }))
                        }
                      >
                        <option value="">ریشه</option>
                        {parentOptions.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <p className={styles.statusHint}>
                      {editForm.status === 'active'
                        ? 'فعال — در ویترین و انتخاب محصول دیده می‌شود'
                        : 'غیرفعال — این دسته و زیرشاخه‌ها در ویترین مخفی‌اند'}
                    </p>
                    <div className={styles.formActions}>
                      <button
                        type="submit"
                        className={styles.primaryBtn}
                        disabled={busy}
                      >
                        {busy ? (
                          <Loader2 size={14} className={styles.spin} />
                        ) : (
                          <Check size={14} />
                        )}
                        ذخیره
                      </button>
                      <button
                        type="button"
                        className={
                          editForm.status === 'active'
                            ? styles.ghostBtn
                            : styles.okBtn
                        }
                        disabled={busy}
                        onClick={toggleStatus}
                      >
                        {editForm.status === 'active' ? (
                          <>
                            <PowerOff size={13} />
                            غیرفعال
                          </>
                        ) : (
                          <>
                            <Power size={13} />
                            فعال‌سازی
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className={styles.dangerBtn}
                        disabled={
                          busy || Number(selected?.active_products_count || 0) > 0
                        }
                        title={
                          Number(selected?.active_products_count || 0) > 0
                            ? 'محصول فعال دارد'
                            : 'حذف شاخه بدون محصول فعال'
                        }
                        onClick={askDelete}
                      >
                        <Trash2 size={13} />
                        حذف
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      <TemplatesDialog
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        templates={templates}
        busy={busy}
        onInjectOne={injectOne}
        onInjectAll={() => setInjectAllOpen(true)}
      />

      <ConfirmDialog
        open={deleteOpen}
        danger
        busy={busy}
        title={`حذف «${selected?.title || 'دسته'}»؟`}
        description="این عمل برگشت‌پذیر نیست. شاخه و زیرمجموعه‌های بدون محصول فعال پاک می‌شوند."
        details={[
          'محصولات فعال مانع حذف می‌شوند (الان ندارد).',
          'محصولات غیرفعال همین شاخه هم حذف می‌شوند.',
          selectedPath ? `مسیر: ${selectedPath}` : 'کل این گره از درخت حذف می‌شود.',
        ].filter(Boolean)}
        confirmLabel="بله، حذف شود"
        cancelLabel="انصراف"
        onClose={() => !busy && setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />

      <ConfirmDialog
        open={injectAllOpen}
        busy={busy}
        title="تزریق همه قالب‌های مشاغل؟"
        description="درخت‌های آماده برای سوپرمارکت، پوشاک، لوازم خانگی و… اضافه می‌شوند."
        details={[
          'مسیرهای تکراری دوباره ساخته نمی‌شوند.',
          'می‌توانید بعداً هر شاخه را ویرایش یا حذف کنید.',
        ]}
        confirmLabel="تزریق همه"
        cancelLabel="انصراف"
        onClose={() => !busy && setInjectAllOpen(false)}
        onConfirm={confirmInjectAll}
      />

      <GuidedTour
        open={tour.open}
        steps={tour.steps}
        stepIndex={tour.stepIndex}
        onStepChange={tour.setStepIndex}
        onClose={tour.close}
      />
    </Shell>
  )
}
