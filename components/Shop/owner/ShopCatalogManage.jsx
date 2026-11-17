'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import nextDynamic from 'next/dynamic'
import axios from 'axios'
import {
  ExternalLink,
  Plus,
  RefreshCw,
  Star,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Config from '@/config/config'
import useShopMode from '@/hooks/useShopMode'
import platformShopApi from '@/services/platformShopApi'
import shopOwnerApi from '@/services/shopOwnerApi'
import styles from './ShopAccounting.module.css'

const AdminProductCreateForm = nextDynamic(
  () => import('@/components/Admin/AdminProductCreateForm'),
  { ssr: false },
)

/**
 * کاتالوگ محصولات — منتقل‌شده از /shop-manage به هاب فروشگاه
 */
export default function ShopCatalogManage() {
  const { user, canManageEmployees, getAuthHeaders } = useAuth()
  const { singleStore } = useShopMode()
  const canManage =
    user?.is_superuser || user?.is_staff || canManageEmployees

  const [items, setItems] = useState([])
  const [shops, setShops] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const [q, setQ] = useState('')
  const [creating, setCreating] = useState(false)

  const primaryShopId = useMemo(
    () => (shops[0]?.id != null ? String(shops[0].id) : ''),
    [shops],
  )
  const lockedShopId = singleStore ? primaryShopId : ''

  const activeCount = useMemo(
    () => items.filter((p) => p.status === 'active').length,
    [items],
  )
  const featuredCount = useMemo(
    () => items.filter((p) => p.is_featured).length,
    [items],
  )

  const loadMeta = useCallback(async () => {
    try {
      if (canManage) {
        const [shopRes, cats] = await Promise.all([
          platformShopApi.listShops(),
          platformShopApi.listCategories(),
        ])
        setShops(shopRes?.results || [])
        setCategories(Array.isArray(cats) ? cats : cats?.results || [])
      } else {
        const [dash, cats] = await Promise.all([
          shopOwnerApi.dashboard(),
          shopOwnerApi.listCategories(),
        ])
        const shop = dash?.shop
        setShops(shop ? [shop] : [])
        setCategories(Array.isArray(cats) ? cats : cats?.results || [])
      }
    } catch {
      /* ignore */
    }
  }, [canManage])

  const load = useCallback(async () => {
    setLoadingData(true)
    setErr('')
    try {
      if (canManage) {
        const res = await axios.get(
          Config.endpoints.shop.adminProducts({
            q: q || undefined,
            page_size: 40,
          }),
          { headers: getAuthHeaders() },
        )
        setItems(res.data?.results || [])
      } else {
        const params = {}
        if (q) params.q = q
        const res = await shopOwnerApi.listProducts(params)
        setItems(res?.results || [])
      }
    } catch (e) {
      setErr(e.response?.data?.error || e.message || 'بارگذاری ناموفق')
      setItems([])
    } finally {
      setLoadingData(false)
    }
  }, [canManage, getAuthHeaders, q])

  useEffect(() => {
    load()
    loadMeta()
  }, [load, loadMeta])

  const toggleFeatured = async (p) => {
    try {
      if (canManage) {
        await axios.patch(
          Config.endpoints.shop.adminProductDetail(p.id),
          { is_featured: !p.is_featured },
          { headers: getAuthHeaders() },
        )
      } else {
        await shopOwnerApi.updateProduct(p.id, {
          is_featured: !p.is_featured,
        })
      }
      setMsg(`محصول #${p.id} به‌روز شد`)
      await load()
    } catch (e) {
      setErr(e.response?.data?.error || e.message)
    }
  }

  const startCreate = () => {
    setCreating(true)
    setErr('')
    setMsg('')
  }

  return (
    <div className={styles.catalogRoot}>
      <div className={styles.catalogStats}>
        <article className={`${styles.catalogStat} ${styles.catalogStatForest}`}>
          <strong>{items.length.toLocaleString('fa-IR')}</strong>
          <span>کل محصولات</span>
        </article>
        <article className={`${styles.catalogStat} ${styles.catalogStatOlive}`}>
          <strong>{activeCount.toLocaleString('fa-IR')}</strong>
          <span>فعال</span>
        </article>
        <article className={`${styles.catalogStat} ${styles.catalogStatSand}`}>
          <strong>{featuredCount.toLocaleString('fa-IR')}</strong>
          <span>ویژه</span>
        </article>
      </div>

      <div className={styles.panelHead}>
        <h2>مدیریت محصولات</h2>
        <div className={styles.formActions} style={{ margin: 0 }}>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={startCreate}
            disabled={creating}
          >
            <Plus size={15} />
            محصول جدید
          </button>
          <button type="button" className={styles.ghostBtn} onClick={load}>
            <RefreshCw size={14} />
            بروزرسانی
          </button>
        </div>
      </div>

      {msg ? <div className={styles.toast}>{msg}</div> : null}
      {err ? <div className={styles.err}>{err}</div> : null}

      {creating ? (
        <div className={styles.panel} style={{ marginBottom: '0.75rem' }}>
          {canManage ? (
            <AdminProductCreateForm
              shops={shops}
              categories={categories}
              singleStore={singleStore}
              lockedShopId={lockedShopId}
              defaultShopId={lockedShopId || primaryShopId}
              onCancel={() => setCreating(false)}
              onCreated={async (created) => {
                setCreating(false)
                setMsg(
                  created?.id
                    ? `محصول «${created.title || created.id}» ثبت شد`
                    : 'محصول ثبت شد',
                )
                await load()
              }}
            />
          ) : (
            <div className={styles.empty}>
              <p>
                برای افزودن کامل محصول به{' '}
                <Link href="/dashboard/my-shop?tab=products">فروشگاه من</Link>{' '}
                بروید.
              </p>
              <button
                type="button"
                className={styles.ghostBtn}
                onClick={() => setCreating(false)}
              >
                بستن
              </button>
            </div>
          )}
        </div>
      ) : null}

      <div className={styles.panel} style={{ marginBottom: '0.75rem' }}>
        <label className={styles.catalogSearch}>
          جستجو
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') load()
            }}
            placeholder="عنوان محصول…"
          />
        </label>
        <div className={styles.formActions}>
          <button type="button" className={styles.primaryBtn} onClick={load}>
            اعمال جستجو
          </button>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h2 style={{ margin: 0 }}>
            محصولات ({items.length.toLocaleString('fa-IR')})
          </h2>
        </div>
        {loadingData ? (
          <div className={styles.stateBox} style={{ minHeight: '20vh' }}>
            <RefreshCw size={18} className={styles.spin} />
            بارگذاری…
          </div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>
            <strong>محصولی نیست</strong>
            <p>اولین محصول را همین‌جا یا از فروشگاه من ثبت کنید.</p>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={startCreate}
            >
              <Plus size={14} />
              ایجاد محصول
            </button>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>عنوان</th>
                  <th>قیمت</th>
                  <th>تخفیف</th>
                  <th>فروش</th>
                  <th>وضعیت</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>
                      {p.title}
                      {p.is_featured ? (
                        <span
                          className={styles.badgeSale}
                          style={{ marginRight: 6 }}
                        >
                          ویژه
                        </span>
                      ) : null}
                    </td>
                    <td>
                      {Number(p.final_price ?? p.price_one ?? 0).toLocaleString(
                        'fa-IR',
                      )}
                    </td>
                    <td>{p.discount || 0}%</td>
                    <td>{p.sales_count || 0}</td>
                    <td>
                      <span
                        className={
                          p.status === 'active' ? styles.badgeSale : styles.badgeExp
                        }
                      >
                        {p.status === 'active' ? 'فعال' : p.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.formActions} style={{ margin: 0 }}>
                        <button
                          type="button"
                          className={styles.ghostBtn}
                          onClick={() => toggleFeatured(p)}
                        >
                          <Star size={12} />
                          {p.is_featured ? 'حذف ویژه' : 'ویژه'}
                        </button>
                        <Link
                          href={`/shop/products/${p.id}`}
                          className={styles.ghostBtn}
                          target="_blank"
                        >
                          <ExternalLink size={12} />
                          مشاهده
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
