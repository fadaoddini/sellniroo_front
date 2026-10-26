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

const EMPTY = {
  id: null,
  shop: null,
  shop_title: null,
  items: [],
  items_count: 0,
  subtotal: 0,
  delivery_fee: 0,
  free_delivery_threshold: 0,
  shipping_estimate: 0,
  shop_bank: {
    title: '',
    sheba_number: '',
    bank_card_number: '',
    bank_account_number: '',
    bank_account_holder_name: '',
    has_manual_transfer: false,
  },
}

function unitOf(product) {
  const v =
    product?.final_price ??
    product?.get_discounted_price ??
    product?.price ??
    product?.price_one
  return Math.max(0, Number(v) || 0)
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
  if (typeof window === 'undefined') return { ...EMPTY }
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return { ...EMPTY }
    return recompute({ ...EMPTY, ...JSON.parse(raw) })
  } catch {
    return { ...EMPTY }
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
  const [cart, setCart] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [busyProductId, setBusyProductId] = useState(null)
  const migratedRef = useRef(false)

  const applyCart = useCallback((data) => {
    const next = recompute({ ...EMPTY, ...(data || {}) })
    setCart(next)
    if (!isAuthenticated || isDemoProduct(next.items?.[0]?.product)) {
      writeLocal(next)
    }
    return next
  }, [isAuthenticated])

  const refresh = useCallback(async () => {
    if (authLoading) return readLocal()
    if (!isAuthenticated) {
      const local = readLocal()
      setCart(local)
      setLoading(false)
      return local
    }
    setLoading(true)
    try {
      const data = await orderApi.getCart()
      const next = applyCart(data)
      setLoading(false)
      return next
    } catch {
      const local = readLocal()
      setCart(local)
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
          const pid = it.product || it.product_detail?.id
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

  const getQty = useCallback(
    (productId) => {
      const id = Number(productId)
      const item = (cart.items || []).find(
        (i) => Number(i.product) === id || Number(i.product_detail?.id) === id,
      )
      return item ? Number(item.quantity) || 0 : 0
    },
    [cart.items],
  )

  const localUpsert = useCallback(
    (product, qty, { replaceShop = false } = {}) => {
      const pid = Number(product.id)
      const price = unitOf(product)
      const shopId = shopIdOf(product)
      let next = { ...cart }

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
        next = { ...EMPTY }
      }

      const items = [...(next.items || [])]
      const idx = items.findIndex(
        (i) => Number(i.product) === pid || Number(i.product_detail?.id) === pid,
      )
      if (qty <= 0) {
        if (idx >= 0) items.splice(idx, 1)
      } else if (idx >= 0) {
        items[idx] = {
          ...items[idx],
          quantity: qty,
          price,
          product_detail: {
            ...(items[idx].product_detail || {}),
            ...product,
            final_price: price,
          },
        }
      } else {
        items.push({
          id: `local-${pid}`,
          product: pid,
          quantity: qty,
          price,
          line_total: price * qty,
          product_detail: { ...product, final_price: price },
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
    [cart],
  )

  const setQty = useCallback(
    async (product, quantity, opts = {}) => {
      if (!product?.id) return cart
      const qty = Math.max(0, Number(quantity) || 0)
      setBusyProductId(product.id)
      try {
        const useLocal = !isAuthenticated || isDemoProduct(product)
        if (useLocal) {
          return localUpsert(product, qty, opts)
        }
        try {
          const data = await orderApi.upsertItem({
            product_id: product.id,
            quantity: qty,
            replace_shop: !!opts.replaceShop,
          })
          return applyCart(data)
        } catch (e) {
          if (e.status === 409 && e.data?.code === 'other_shop' && !opts.replaceShop) {
            throw e
          }
          // fallback محلی
          return localUpsert(product, qty, opts)
        }
      } finally {
        setBusyProductId(null)
      }
    },
    [cart, isAuthenticated, localUpsert, applyCart],
  )

  const delta = useCallback(
    async (product, d = 1, opts = {}) => {
      if (!product?.id) return cart
      const current = getQty(product.id)
      return setQty(product, Math.max(0, current + d), opts)
    },
    [cart, getQty, setQty],
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
    setCart({ ...EMPTY })
    return { ...EMPTY }
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
