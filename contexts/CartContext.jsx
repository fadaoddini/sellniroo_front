'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useAuth } from '@/contexts/AuthContext'
import orderApi from '@/services/orderApi'

const CartContext = createContext(null)
const LS_KEY = 'sellniroo_shop_cart_v1'

function emptyCart() {
  return {
    id: null,
    shop: null,
    shop_title: null,
    items: [],
    items_count: 0,
    subtotal: 0,
    delivery_fee: 0,
    free_delivery_threshold: 0,
    shipping_estimate: 0,
    hold_minutes: 5,
    hold_seconds_left: 0,
    hold_expires_at: null,
    shop_bank: {
      title: '',
      sheba_number: '',
      bank_card_number: '',
      bank_account_number: '',
      bank_account_holder_name: '',
      has_manual_transfer: false,
    },
  }
}

/** شناسه محصول از آیتم سبد یا آبجکت محصول — فقط عدد معتبر > 0 */
function normalizeProductId(value) {
  if (value == null || value === '') return null
  if (typeof value === 'object') {
    return normalizeProductId(
      value.product ?? value.product_id ?? value.id,
    )
  }
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

function lineProductId(item) {
  if (!item || typeof item !== 'object') return null
  // اولویت با FK سبد؛ جزئیات محصول فقط fallback است
  return (
    normalizeProductId(item.product) ||
    normalizeProductId(item.product_detail?.id) ||
    null
  )
}

function unitOf(product, quantity = 1) {
  const qty = Math.max(1, Number(quantity) || 1)
  const tiers = [...(product?.price_tiers || [])].sort(
    (a, b) => Number(b.min_quantity || 0) - Number(a.min_quantity || 0),
  )
  for (const tier of tiers) {
    if (qty >= Number(tier.min_quantity || 0)) {
      return Math.max(0, Number(tier.unit_price) || 0)
    }
  }
  const v =
    product?.final_price ??
    product?.get_discounted_price ??
    product?.price ??
    product?.price_one
  return Math.max(0, Number(v) || 0)
}

function clampProductQty(product, quantity) {
  let qty = Math.max(0, Number(quantity) || 0)
  if (qty <= 0) return 0
  const min = Math.max(1, Number(product?.number_min) || 1)
  let max = Number(product?.number_max)
  if (!Number.isFinite(max) || max < 1) max = 9999
  const available =
    product?.stock?.available ??
    product?.stock_remaining ??
    product?.stock?.remaining
  if (available != null && available !== '') {
    max = Math.min(max, Math.max(0, Number(available) || 0))
  }
  if (max < min) return 0
  return Math.min(max, Math.max(min, qty))
}

function shopIdOf(product) {
  return (
    product?.shop ??
    product?.shop_id ??
    product?.shop_detail?.id ??
    null
  )
}

function recompute(cart) {
  const items = cart.items || []
  const items_count = items.reduce((s, i) => s + (Number(i.quantity) || 0), 0)
  const subtotal = items.reduce(
    (s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 0),
    0,
  )
  const fee = Number(cart.delivery_fee) || 0
  const freeAt = Number(cart.free_delivery_threshold) || 0
  return {
    ...cart,
    items,
    items_count,
    subtotal,
    shipping_estimate: freeAt && subtotal >= freeAt ? 0 : fee,
  }
}

function readLocal() {
  if (typeof window === 'undefined') return emptyCart()
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return emptyCart()
    return recompute({ ...emptyCart(), ...JSON.parse(raw) })
  } catch {
    return emptyCart()
  }
}

function writeLocal(cart) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(recompute(cart)))
  } catch {
    /* ignore */
  }
}

function isDemoProduct(productOrId) {
  const id = typeof productOrId === 'object' ? productOrId?.id : productOrId
  const n = Number(id)
  return Number.isFinite(n) && n >= 9000
}

export function CartProvider({ children }) {
  const { isAuthenticated, loading: authLoading, getAuthHeaders } = useAuth()
  const [cart, setCart] = useState(emptyCart)
  const [loading, setLoading] = useState(true)
  const [busyProductId, setBusyProductId] = useState(null)
  const migratedRef = useRef(false)
  const hasLoadedRef = useRef(false)
  const cartRef = useRef(cart)
  cartRef.current = cart

  const applyCart = useCallback((data) => {
    const incoming = { ...emptyCart(), ...(data || {}) }
    const prevItems = cartRef.current?.items || []
    const nextItems = Array.isArray(incoming.items) ? [...incoming.items] : []
    // ترتیب قبلی UI را حفظ کن تا با پاسخ API جابه‌جا نشود
    if (prevItems.length && nextItems.length) {
      const byKey = new Map()
      for (const it of nextItems) {
        const k = lineProductId(it) ?? `id:${it.id}`
        byKey.set(k, it)
      }
      const ordered = []
      const seen = new Set()
      for (const prev of prevItems) {
        const k = lineProductId(prev) ?? `id:${prev.id}`
        const hit = byKey.get(k)
        if (hit) {
          ordered.push(hit)
          seen.add(k)
        }
      }
      for (const it of nextItems) {
        const k = lineProductId(it) ?? `id:${it.id}`
        if (!seen.has(k)) ordered.push(it)
      }
      incoming.items = ordered
    }
    const next = recompute(incoming)
    setCart(next)
    if (!isAuthenticated || isDemoProduct(next.items?.[0]?.product)) {
      writeLocal(next)
    }
    return next
  }, [isAuthenticated])

  const patchItemQty = useCallback((productId, qty) => {
    const pid = normalizeProductId(productId)
    if (!pid) return
    setCart((prev) => {
      const items = [...(prev.items || [])]
      const idx = items.findIndex((i) => lineProductId(i) === pid)
      if (idx < 0) return prev
      if (qty <= 0) {
        items.splice(idx, 1)
      } else {
        const row = items[idx]
        const price = Number(row.price) || 0
        items[idx] = {
          ...row,
          quantity: qty,
          line_total: price * qty,
        }
      }
      return recompute({ ...prev, items })
    })
  }, [])

  const refresh = useCallback(async (opts = {}) => {
    if (authLoading) return readLocal()
    if (!isAuthenticated) {
      const local = readLocal()
      setCart(local)
      setLoading(false)
      hasLoadedRef.current = true
      return local
    }
    const silent = opts.silent ?? hasLoadedRef.current
    if (!silent) setLoading(true)
    try {
      const data = await orderApi.getCart()
      const next = applyCart(data)
      hasLoadedRef.current = true
      setLoading(false)
      return next
    } catch {
      const local = readLocal()
      setCart(local)
      hasLoadedRef.current = true
      setLoading(false)
      return local
    }
  }, [authLoading, isAuthenticated, applyCart])

  useEffect(() => {
    if (authLoading) return
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated])

  // مهاجرت سبد محلی به سرور بعد از لاگین
  useEffect(() => {
    if (authLoading || !isAuthenticated || migratedRef.current) return
    const local = readLocal()
    if (!local.items?.length) {
      migratedRef.current = true
      return
    }
    migratedRef.current = true
    ;(async () => {
      try {
        let last = null
        for (const it of local.items) {
          const pid = lineProductId(it)
          if (!pid || isDemoProduct(pid)) continue
          last = await orderApi.upsertItem({
            product_id: pid,
            quantity: it.quantity,
            replace_shop: true,
          })
        }
        if (last) {
          applyCart(last)
          localStorage.removeItem(LS_KEY)
        }
      } catch {
        /* نگه داشتن محلی */
      }
    })()
  }, [authLoading, isAuthenticated, applyCart])

  const getQty = useCallback((productId) => {
    const id = normalizeProductId(productId)
    if (!id) return 0
    const item = (cartRef.current.items || []).find(
      (i) => lineProductId(i) === id,
    )
    return item ? Number(item.quantity) || 0 : 0
  }, [])

  const localUpsert = useCallback(
    (product, qty, { replaceShop = false } = {}) => {
      const pid = normalizeProductId(product)
      if (!pid) return cartRef.current
      const clamped = clampProductQty(product, qty)
      if (qty > 0 && clamped <= 0) {
        const err = new Error('موجودی یا سقف سفارش کافی نیست')
        err.code = 'out_of_stock'
        err.data = { code: 'out_of_stock', error: err.message }
        throw err
      }
      const price = unitOf(product, clamped || 1)
      const shopId = shopIdOf(product)
      let next = { ...cartRef.current }

      if (
        next.shop != null &&
        shopId != null &&
        Number(next.shop) !== Number(shopId) &&
        (next.items || []).length
      ) {
        if (!replaceShop) {
          const err = new Error('سبد شما مربوط به فروشگاه دیگری است')
          err.code = 'other_shop'
          err.data = {
            code: 'other_shop',
            current_shop_id: next.shop,
            current_shop_title: next.shop_title,
            new_shop_id: shopId,
          }
          throw err
        }
        next = emptyCart()
      }

      const items = [...(next.items || [])]
      const idx = items.findIndex((i) => lineProductId(i) === pid)
      if (clamped <= 0) {
        if (idx >= 0) items.splice(idx, 1)
      } else if (idx >= 0) {
        items[idx] = {
          ...items[idx],
          product: pid,
          quantity: clamped,
          price,
          line_total: price * clamped,
          product_detail: {
            ...(items[idx].product_detail || {}),
            ...product,
            id: pid,
            final_price: price,
          },
        }
      } else {
        items.push({
          id: `local-${pid}`,
          product: pid,
          quantity: clamped,
          price,
          line_total: price * clamped,
          product_detail: { ...product, id: pid, final_price: price },
        })
      }

      next = recompute({
        ...next,
        shop: shopId ?? next.shop,
        shop_title: product.shop_title || product.shop_detail?.title || next.shop_title,
        items,
      })
      writeLocal(next)
      setCart(next)
      return next
    },
    [],
  )

  const setQty = useCallback(
    async (product, quantity, opts = {}) => {
      const pid = normalizeProductId(product)
      if (!pid) return cartRef.current
      const productPayload = { ...product, id: pid }
      const qty =
        Number(quantity) <= 0
          ? 0
          : clampProductQty(productPayload, quantity)
      if (Number(quantity) > 0 && qty <= 0) {
        const err = new Error('موجودی یا سقف سفارش کافی نیست')
        err.code = 'out_of_stock'
        err.data = { code: 'out_of_stock', error: err.message }
        throw err
      }
      setBusyProductId(pid)
      try {
        const useLocal = !isAuthenticated || isDemoProduct(pid)
        if (useLocal) {
          return localUpsert(productPayload, qty, opts)
        }
        const prevQty = getQty(pid)
        patchItemQty(pid, qty)
        try {
          const data = await orderApi.upsertItem({
            product_id: pid,
            quantity: qty,
            replace_shop: !!opts.replaceShop,
          })
          return applyCart(data)
        } catch (e) {
          patchItemQty(pid, prevQty)
          if (e.status === 409 && e.data?.code === 'other_shop' && !opts.replaceShop) {
            throw e
          }
          return localUpsert(productPayload, qty, opts)
        }
      } finally {
        setBusyProductId(null)
      }
    },
    [isAuthenticated, localUpsert, applyCart, getQty, patchItemQty],
  )

  const delta = useCallback(
    async (product, d = 1, opts = {}) => {
      const pid = normalizeProductId(product)
      if (!pid) return cartRef.current
      const step = Number(d) || 0
      if (!step) return cartRef.current

      const productPayload = { ...(typeof product === 'object' ? product : {}), id: pid }
      const useLocal = !isAuthenticated || isDemoProduct(pid)

      if (useLocal) {
        const current = getQty(pid)
        return setQty(productPayload, Math.max(0, current + step), opts)
      }

      const prevQty = getQty(pid)
      const optimistic = Math.max(0, prevQty + step)
      setBusyProductId(pid)
      patchItemQty(pid, optimistic)
      try {
        const data = await orderApi.deltaItem({
          product_id: pid,
          delta: step,
          replace_shop: !!opts.replaceShop,
        })
        return applyCart(data)
      } catch (e) {
        patchItemQty(pid, prevQty)
        if (e.status === 409 && e.data?.code === 'other_shop' && !opts.replaceShop) {
          throw e
        }
        // fallback: تعداد مطلق
        return setQty(productPayload, optimistic, opts)
      } finally {
        setBusyProductId(null)
      }
    },
    [isAuthenticated, getQty, setQty, patchItemQty, applyCart],
  )

  const clear = useCallback(async () => {
    if (isAuthenticated && !isDemoProduct(cart.items?.[0]?.product)) {
      try {
        await orderApi.clearCart(cart.shop)
      } catch {
        /* ignore */
      }
    }
    localStorage.removeItem(LS_KEY)
    const cleared = emptyCart()
    setCart(cleared)
    return cleared
  }, [isAuthenticated, cart.shop, cart.items])

  const value = useMemo(
    () => ({
      cart,
      loading,
      busyProductId,
      itemsCount: cart.items_count || 0,
      subtotal: cart.subtotal || 0,
      shippingEstimate: cart.shipping_estimate || 0,
      getQty,
      setQty,
      delta,
      clear,
      refresh,
      getAuthHeaders,
    }),
    [
      cart,
      loading,
      busyProductId,
      getQty,
      setQty,
      delta,
      clear,
      refresh,
      getAuthHeaders,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

/** برای ویجت‌ها / پیش‌نمایش ادمین بدون Provider */
export function useCartOptional() {
  return useContext(CartContext)
}

export default CartContext
