'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Plus,
  Trash2,
  RefreshCw,
  Save,
  List,
  Pencil,
  X,
} from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@/contexts/AuthContext'
import Config from '@/config/config'
import { clearMenuListsCache } from '@/services/menuLists'
import { resolveLucideIcon } from '@/utils/lucideIcons'
import LucideIconPicker from '@/components/common/LucideIconPicker'
import styles from './MenuLists.module.css'

const emptyItemForm = () => ({
  label_fa: '',
  label_en: '',
  href: '/',
  icon: 'Home',
})

function slugify(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0600-\u06ff\-]/gi, '')
    .replace(/-+/g, '-')
    .slice(0, 60) || `menu-${Date.now().toString(36)}`
}

export default function MenuListsPage() {
  const { getAuthHeaders, isAuthenticated, loading: authLoading } = useAuth()
  const [lists, setLists] = useState([])
  const [activeSlug, setActiveSlug] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const [newListName, setNewListName] = useState('')
  const [itemForm, setItemForm] = useState(emptyItemForm)
  const [editingItemId, setEditingItemId] = useState(null)
  const [listNameDraft, setListNameDraft] = useState('')
  const [editingListMeta, setEditingListMeta] = useState(false)

  const headers = () => getAuthHeaders()

  const loadLists = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const res = await axios.get(Config.endpoints.news.menuLists.list(), {
        headers: headers(),
      })
      const data = Array.isArray(res.data?.data) ? res.data.data : []
      setLists(data)
      if (!activeSlug && data[0]) setActiveSlug(data[0].slug)
      else if (activeSlug && !data.find((m) => m.slug === activeSlug) && data[0]) {
        setActiveSlug(data[0].slug)
      }
    } catch (e) {
      setErr(e.response?.data?.detail || e.message || 'بارگذاری ناموفق')
    } finally {
      setLoading(false)
    }
  }, [activeSlug, getAuthHeaders])

  const loadItems = useCallback(async (slug) => {
    if (!slug) {
      setItems([])
      return
    }
    try {
      const res = await axios.get(Config.endpoints.news.menuLists.get(slug), {
        headers: headers(),
      })
      const menu = res.data?.data
      setItems(Array.isArray(menu?.items) ? menu.items : [])
    } catch {
      setItems([])
    }
  }, [getAuthHeaders])

  useEffect(() => {
    if (!authLoading && isAuthenticated) loadLists()
  }, [authLoading, isAuthenticated, loadLists])

  useEffect(() => {
    if (activeSlug) {
      loadItems(activeSlug)
      setEditingItemId(null)
      setItemForm(emptyItemForm())
      setEditingListMeta(false)
    }
  }, [activeSlug, loadItems])

  useEffect(() => {
    const m = lists.find((x) => x.slug === activeSlug)
    if (m) setListNameDraft(m.name || '')
  }, [lists, activeSlug])

  const createList = async () => {
    if (!newListName.trim()) return
    setSaving(true)
    setErr(null)
    try {
      const slug = slugify(newListName)
      const res = await axios.post(
        Config.endpoints.news.menuLists.create(),
        { name: newListName.trim(), slug, description: '', is_active: true, sort_order: 100 },
        { headers: { ...headers(), 'Content-Type': 'application/json' } }
      )
      clearMenuListsCache()
      setNewListName('')
      setMsg('فهرست ساخته شد')
      await loadLists()
      if (res.data?.data?.slug) setActiveSlug(res.data.data.slug)
    } catch (e) {
      setErr(e.response?.data?.slug?.[0] || e.response?.data?.detail || e.message)
    } finally {
      setSaving(false)
    }
  }

  const saveListName = async () => {
    if (!activeMenu || !listNameDraft.trim()) return
    setSaving(true)
    setErr(null)
    try {
      await axios.patch(
        Config.endpoints.news.menuLists.update(activeMenu.slug),
        { name: listNameDraft.trim() },
        { headers: { ...headers(), 'Content-Type': 'application/json' } }
      )
      clearMenuListsCache()
      setMsg('نام فهرست ذخیره شد')
      setEditingListMeta(false)
      await loadLists()
    } catch (e) {
      setErr(e.response?.data?.detail || e.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteList = async (slug) => {
    if (!window.confirm('حذف این فهرست و همه آیتم‌هایش؟')) return
    setSaving(true)
    try {
      await axios.delete(Config.endpoints.news.menuLists.delete(slug), {
        headers: headers(),
      })
      clearMenuListsCache()
      setMsg('فهرست حذف شد')
      await loadLists()
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  const activeMenu = lists.find((m) => m.slug === activeSlug)

  const startEditItem = (it) => {
    setEditingItemId(it.id)
    setItemForm({
      label_fa: it.label_fa || '',
      label_en: it.label_en || '',
      href: it.href || '/',
      icon: it.icon || 'Home',
    })
    setMsg(null)
    setErr(null)
  }

  const cancelEditItem = () => {
    setEditingItemId(null)
    setItemForm(emptyItemForm())
  }

  const saveItem = async () => {
    if (!activeMenu || !itemForm.label_fa.trim() || !itemForm.href.trim()) return
    setSaving(true)
    setErr(null)
    try {
      const payload = {
        label_fa: itemForm.label_fa.trim(),
        label_en: itemForm.label_en.trim(),
        href: itemForm.href.trim(),
        icon: itemForm.icon.trim() || 'Home',
      }
      if (editingItemId) {
        await axios.patch(
          Config.endpoints.news.menuListItems.update(editingItemId),
          payload,
          { headers: { ...headers(), 'Content-Type': 'application/json' } }
        )
        setMsg('آیتم ویرایش شد')
      } else {
        await axios.post(
          Config.endpoints.news.menuListItems.create(),
          {
            menu: activeMenu.id,
            ...payload,
            is_active: true,
            sort_order: (items.length + 1) * 10,
          },
          { headers: { ...headers(), 'Content-Type': 'application/json' } }
        )
        setMsg('آیتم اضافه شد')
      }
      clearMenuListsCache()
      cancelEditItem()
      await loadItems(activeSlug)
      await loadLists()
    } catch (e) {
      setErr(e.response?.data?.detail || JSON.stringify(e.response?.data) || e.message)
    } finally {
      setSaving(false)
    }
  }

  const removeItem = async (id) => {
    if (!window.confirm('این آیتم حذف شود؟')) return
    setSaving(true)
    try {
      await axios.delete(Config.endpoints.news.menuListItems.delete(id), {
        headers: headers(),
      })
      clearMenuListsCache()
      if (editingItemId === id) cancelEditItem()
      setMsg('آیتم حذف شد')
      await loadItems(activeSlug)
      await loadLists()
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) {
    return <div className={styles.page}>در حال بارگذاری…</div>
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.page}>
        <p>برای مدیریت فهرست‌ها وارد شوید.</p>
        <Link href="/login?next=/menu-lists">ورود</Link>
      </div>
    )
  }

  const isEditing = !!editingItemId

  return (
    <div className={styles.page} dir="rtl">
      <header className={styles.head}>
        <div>
          <Link href="/adminsettings" className={styles.back}>
            <ArrowRight size={14} />
            adminsettings
          </Link>
          <h1>
            <List size={22} />
            مدیریت فهرست‌ها
          </h1>
          <p>فهرست بسازید، آیتم‌ها را ویرایش کنید، بعد در چیدمان وصل کنید</p>
        </div>
        <button type="button" className={styles.ghost} onClick={loadLists} disabled={loading}>
          <RefreshCw size={14} />
          بروزرسانی
        </button>
      </header>

      {err ? <div className={styles.alert}>{err}</div> : null}
      {msg ? <div className={styles.ok}>{msg}</div> : null}

      <div className={styles.grid}>
        <aside className={styles.side}>
          <h2>فهرست‌ها</h2>
          <div className={styles.newRow}>
            <input
              placeholder="نام فهرست جدید…"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
            />
            <button type="button" onClick={createList} disabled={saving}>
              <Plus size={14} />
            </button>
          </div>
          <ul className={styles.list}>
            {lists.map((m) => (
              <li key={m.slug}>
                <button
                  type="button"
                  className={activeSlug === m.slug ? styles.on : ''}
                  onClick={() => setActiveSlug(m.slug)}
                >
                  <strong>{m.name}</strong>
                  <small>
                    {m.slug} · {m.items_count ?? 0} آیتم
                  </small>
                </button>
                <button
                  type="button"
                  className={styles.trash}
                  onClick={() => deleteList(m.slug)}
                  aria-label="حذف"
                >
                  <Trash2 size={13} />
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className={styles.main}>
          {!activeMenu ? (
            <p className={styles.empty}>یک فهرست انتخاب کنید یا بسازید.</p>
          ) : (
            <>
              <div className={styles.listMeta}>
                {editingListMeta ? (
                  <div className={styles.listMetaEdit}>
                    <input
                      value={listNameDraft}
                      onChange={(e) => setListNameDraft(e.target.value)}
                      placeholder="نام فهرست"
                    />
                    <button
                      type="button"
                      className={styles.primary}
                      onClick={saveListName}
                      disabled={saving}
                    >
                      <Save size={14} />
                      ذخیره نام
                    </button>
                    <button
                      type="button"
                      className={styles.ghost}
                      onClick={() => {
                        setEditingListMeta(false)
                        setListNameDraft(activeMenu.name || '')
                      }}
                    >
                      <X size={14} />
                      انصراف
                    </button>
                  </div>
                ) : (
                  <div className={styles.listMetaView}>
                    <h2>
                      آیتم‌های «{activeMenu.name}»
                      <code>{activeMenu.slug}</code>
                    </h2>
                    <button
                      type="button"
                      className={styles.ghost}
                      onClick={() => setEditingListMeta(true)}
                    >
                      <Pencil size={14} />
                      ویرایش نام فهرست
                    </button>
                  </div>
                )}
              </div>

              <ul className={styles.items}>
                {items.map((it) => {
                  const Icon = resolveLucideIcon(it.icon)
                  const on = editingItemId === it.id
                  return (
                    <li key={it.id} className={on ? styles.itemEditing : ''}>
                      <span className={styles.itemIcon}>
                        <Icon size={16} />
                      </span>
                      <div>
                        <strong>{it.label_fa}</strong>
                        <small dir="ltr">
                          {it.href} · {it.icon || 'Home'}
                        </small>
                      </div>
                      <div className={styles.itemActs}>
                        <button
                          type="button"
                          onClick={() => startEditItem(it)}
                          aria-label="ویرایش"
                          title="ویرایش"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(it.id)}
                          aria-label="حذف"
                          title="حذف"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </li>
                  )
                })}
                {items.length === 0 ? (
                  <li className={styles.emptyItem}>هنوز آیتمی نیست</li>
                ) : null}
              </ul>

              <div className={styles.addBox}>
                <h3>{isEditing ? 'ویرایش آیتم' : 'افزودن آیتم'}</h3>
                <div className={styles.fields}>
                  <input
                    placeholder="عنوان فارسی"
                    value={itemForm.label_fa}
                    onChange={(e) => setItemForm((p) => ({ ...p, label_fa: e.target.value }))}
                  />
                  <input
                    placeholder="عنوان انگلیسی"
                    value={itemForm.label_en}
                    onChange={(e) => setItemForm((p) => ({ ...p, label_en: e.target.value }))}
                  />
                  <input
                    placeholder="لینک /about"
                    dir="ltr"
                    value={itemForm.href}
                    onChange={(e) => setItemForm((p) => ({ ...p, href: e.target.value }))}
                    className={styles.fieldFull}
                  />
                </div>
                <div className={styles.iconPick}>
                  <span className={styles.iconPickLabel}>آیکون (جستجو در Lucide)</span>
                  <LucideIconPicker
                    value={itemForm.icon || 'Home'}
                    onChange={(name) => setItemForm((p) => ({ ...p, icon: name }))}
                  />
                </div>
                <div className={styles.formActs}>
                  <button
                    type="button"
                    className={styles.primary}
                    onClick={saveItem}
                    disabled={saving}
                  >
                    <Save size={14} />
                    {isEditing ? 'ذخیره تغییرات' : 'افزودن به فهرست'}
                  </button>
                  {isEditing ? (
                    <button type="button" className={styles.ghost} onClick={cancelEditItem}>
                      <X size={14} />
                      انصراف
                    </button>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
