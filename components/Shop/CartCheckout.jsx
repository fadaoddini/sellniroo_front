'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ImagePlus, Trash2, Upload } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import orderApi from '@/services/orderApi'
import shopApi from '@/services/shopApi'
import { fetchSiteSettings } from '@/services/siteSettings'
import {
  checkoutThemeCssVars,
  getCheckoutSystemConfig,
  getCheckoutTheme,
  normalizeCheckoutPipelines,
} from '@/config/checkoutPipelines'
import { getDeliveryCost } from '@/utils/deliveryCalculator'
import AddressForm from './AddressForm'
import styles from './CartCheckout.module.css'

const ALL_STEPS = [
  { id: 'cart', label: 'سبد' },
  { id: 'shipping', label: 'ارسال' },
  { id: 'confirm', label: 'تأیید' },
  { id: 'done', label: 'ثبت' },
]

function formatPrice(n) {
  return (Number(n) || 0).toLocaleString('fa-IR')
}

export default function CartCheckout() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading, user } = useAuth()
  const {
    cart,
    loading,
    busyProductId,
    delta,
    clear,
    refresh,
    itemsCount,
    subtotal,
  } = useCart()
  const [shopPipeline, setShopPipeline] = useState(() =>
    getCheckoutSystemConfig({}, 'shop'),
  )
  const [cartThemeVars, setCartThemeVars] = useState(null)
  const [step, setStep] = useState('cart')
  const [pickup, setPickup] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [addressId, setAddressId] = useState(null)
  const [showNewAddr, setShowNewAddr] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [orderResult, setOrderResult] = useState(null)
  const [shipInfo, setShipInfo] = useState(null)
  const [shipLoading, setShipLoading] = useState(false)
  const [gateways, setGateways] = useState([])
  const [payEnabled, setPayEnabled] = useState(true)
  const [paymentMode, setPaymentMode] = useState('gateway') // gateway | manual
  const [gatewayCode, setGatewayCode] = useState('')
  const [useWallet, setUseWallet] = useState(false)
  const [walletBalance, setWalletBalance] = useState(0)
  const [walletLoading, setWalletLoading] = useState(false)
  const [receiptFile, setReceiptFile] = useState(null)
  const [receiptPreview, setReceiptPreview] = useState('')
  const [receiptNote, setReceiptNote] = useState('')
  const [receiptDone, setReceiptDone] = useState(false)
  const [holdLeft, setHoldLeft] = useState(0)

  // تایمر از زمان مطلق سرور؛ رفرش صفحه شمارش را از نو شروع نمی‌کند
  useEffect(() => {
    const expiresAt = cart?.hold_expires_at
    if (!expiresAt || !itemsCount) {
      setHoldLeft(0)
      return undefined
    }
    const expiresMs = new Date(expiresAt).getTime()
    if (!Number.isFinite(expiresMs)) {
      setHoldLeft(Math.max(0, Number(cart?.hold_seconds_left) || 0))
      return undefined
    }
    const tick = () => {
      setHoldLeft(Math.max(0, Math.floor((expiresMs - Date.now()) / 1000)))
    }
    tick()
    const t = window.setInterval(tick, 1000)
    return () => window.clearInterval(t)
  }, [cart?.hold_expires_at, cart?.hold_seconds_left, itemsCount])

  useEffect(() => {
    if (!isAuthenticated || !itemsCount) return undefined
    const t = window.setInterval(() => {
      refresh?.()
    }, 45000)
    return () => window.clearInterval(t)
  }, [isAuthenticated, itemsCount, refresh])

  // پایان تایمر → یک‌بار همگام با سرور تا رزرو واقعاً آزاد شود
  useEffect(() => {
    if (!isAuthenticated || holdLeft !== 0 || !cart?.hold_expires_at) return
    refresh?.()
  }, [holdLeft, cart?.hold_expires_at, isAuthenticated, refresh])

  const holdLabel = useMemo(() => {
    if (!holdLeft) return ''
    const m = Math.floor(holdLeft / 60)
    const s = holdLeft % 60
    return `${m.toLocaleString('fa-IR')}:${String(s).padStart(2, '0')}`
  }, [holdLeft])

  useEffect(() => {
    let cancelled = false
    const loadPipeline = async () => {
      try {
        const settings = await fetchSiteSettings({ force: false })
        if (cancelled) return
        const pipes = normalizeCheckoutPipelines(settings?.checkout_pipelines)
        setShopPipeline(getCheckoutSystemConfig(pipes, 'shop'))
        const theme = getCheckoutTheme(pipes)
        setCartThemeVars(theme ? checkoutThemeCssVars(theme) : null)
      } catch {
        /* defaults */
      }
    }
    loadPipeline()
    const onChange = () => loadPipeline()
    window.addEventListener('checkout-pipelines-changed', onChange)
    return () => {
      cancelled = true
      window.removeEventListener('checkout-pipelines-changed', onChange)
    }
  }, [])

  const STEPS = useMemo(() => {
    const enabled = shopPipeline?.steps || {}
    const list = ALL_STEPS.filter((s) => enabled[s.id] !== false)
    return list.length ? list : ALL_STEPS
  }, [shopPipeline])

  const opt = shopPipeline?.options || {}
  const allowPickup = opt.allow_pickup !== false
  const allowAddress = opt.allow_address !== false
  const allowGateway = opt.payment_gateway !== false
  const allowManual = opt.payment_manual !== false
  const allowWallet = opt.payment_wallet !== false
  const allowReceipt = opt.receipt_upload !== false

  useEffect(() => {
    // اگر فقط یکی از ارسال/حضوری روشن باشد، همان را اعمال کن
    if (allowPickup && !allowAddress) setPickup(true)
    else if (!allowPickup && allowAddress) setPickup(false)
  }, [allowPickup, allowAddress])

  const nextStepAfter = useCallback(
    (currentId) => {
      const idx = STEPS.findIndex((s) => s.id === currentId)
      if (idx < 0) return STEPS[0]?.id || 'cart'
      return STEPS[Math.min(idx + 1, STEPS.length - 1)]?.id || currentId
    },
    [STEPS],
  )

  const prevStepBefore = useCallback(
    (currentId) => {
      const idx = STEPS.findIndex((s) => s.id === currentId)
      if (idx <= 0) return STEPS[0]?.id || 'cart'
      return STEPS[idx - 1]?.id || currentId
    },
    [STEPS],
  )

  useEffect(() => {
    if (!receiptFile) {
      setReceiptPreview('')
      return undefined
    }
    const url = URL.createObjectURL(receiptFile)
    setReceiptPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [receiptFile])

  const onReceiptPick = (file) => {
    if (!file) {
      setReceiptFile(null)
      return
    }
    if (!file.type?.startsWith('image/')) {
      setError('فقط فایل تصویری مجاز است')
      return
    }
    setError('')
    setReceiptFile(file)
  }

  const shipping = pickup
    ? 0
    : Number(shipInfo?.price ?? cart.shipping_estimate) || 0
  const total = subtotal + shipping
  const walletApplied = useWallet
    ? Math.min(Number(walletBalance) || 0, total)
    : 0
  const payableRemainder = Math.max(0, total - walletApplied)
  const walletCoversAll = useWallet && payableRemainder === 0 && total > 0
  const shopBank = cart.shop_bank || {}
  const hasManualBank = !!shopBank.has_manual_transfer
  const onlineGateways = useMemo(
    () =>
      (gateways || []).filter(
        (g) =>
          g.is_enable !== false &&
          g.gateway_code &&
          g.gateway_code !== 'manual',
      ),
    [gateways],
  )

  useEffect(() => {
    refresh()
    orderApi
      .publicPaymentConfig()
      .then((cfg) => {
        setPayEnabled(cfg?.is_enabled !== false)
        const list = Array.isArray(cfg?.gateways) ? cfg.gateways : []
        setGateways(list)
        const online = list.filter(
          (g) => g.is_enable !== false && g.gateway_code !== 'manual',
        )
        const def =
          online.find((g) => g.is_default) || online[0] || null
        if (def) {
          setGatewayCode(def.gateway_code)
          setPaymentMode('gateway')
        } else {
          setPaymentMode('manual')
          setGatewayCode('manual')
        }
      })
      .catch(() => {
        setPayEnabled(false)
        setGateways([])
        setPaymentMode('manual')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isAuthenticated || authLoading) return
    orderApi
      .listAddresses()
      .then((list) => {
        const arr = Array.isArray(list) ? list : []
        setAddresses(arr)
        if (arr.length && !addressId) {
          const withCoords = arr.find((a) => a.latitude && a.longitude)
          setAddressId((withCoords || arr[0]).id)
        }
      })
      .catch(() => setAddresses([]))
  }, [isAuthenticated, authLoading, addressId])

  useEffect(() => {
    if (!isAuthenticated || authLoading) return
    if (step !== 'confirm' && step !== 'done') return
    setWalletLoading(true)
    orderApi
      .getWalletBalance()
      .then((data) => setWalletBalance(Number(data?.balance) || 0))
      .catch(() => setWalletBalance(0))
      .finally(() => setWalletLoading(false))
  }, [isAuthenticated, authLoading, step])

  const estimateShipping = useCallback(
    async (lat, lng, addrId) => {
      if (pickup) {
        setShipInfo({ price: 0, distance_km: 0, formatted_distance: '—' })
        return
      }
      const shopLat = cart.shop_latitude
      const shopLng = cart.shop_longitude
      setShipLoading(true)
      setError('')
      try {
        // اول API بک‌اند (نشان + فرمول)
        if (isAuthenticated && (addrId || (lat != null && lng != null))) {
          try {
            const data = await orderApi.shippingEstimate({
              shop_id: cart.shop,
              address_id: addrId || undefined,
              latitude: lat,
              longitude: lng,
            })
            if (data.out_of_range) {
              setError(data.error || 'خارج از محدوده ارسال')
            }
            setShipInfo(data)
            return
          } catch {
            /* fallback کلاینت */
          }
        }
        if (
          shopLat != null &&
          shopLng != null &&
          lat != null &&
          lng != null
        ) {
          const local = await getDeliveryCost(shopLat, shopLng, lat, lng)
          const freeAt = Number(cart.free_delivery_threshold) || 0
          let price = local.price
          if (freeAt && subtotal >= freeAt) price = 0
          setShipInfo({
            price,
            distance_km: local.distance,
            formatted_distance: local.formattedDistance,
            distance_source: local.source,
          })
        } else {
          setShipInfo({
            price: Number(cart.shipping_estimate) || 0,
            distance_km: null,
            formatted_distance: null,
          })
        }
      } finally {
        setShipLoading(false)
      }
    },
    [
      pickup,
      cart.shop,
      cart.shop_latitude,
      cart.shop_longitude,
      cart.shipping_estimate,
      cart.free_delivery_threshold,
      isAuthenticated,
      subtotal,
    ],
  )

  useEffect(() => {
    if (step !== 'shipping' && step !== 'confirm') return
    if (pickup) {
      setShipInfo({ price: 0, formatted_distance: 'حضوری' })
      return
    }
    const addr = addresses.find((a) => a.id === addressId)
    if (addr?.latitude != null && addr?.longitude != null) {
      estimateShipping(addr.latitude, addr.longitude, addr.id)
    }
  }, [step, pickup, addressId, addresses, estimateShipping])

  const stepIndex = useMemo(
    () => STEPS.findIndex((s) => s.id === step),
    [step],
  )

  const bump = async (item, d) => {
    const pid =
      Number(item?.product) ||
      Number(item?.product_detail?.id) ||
      0
    if (!pid) return
    if (busyProductId && Number(busyProductId) === pid) return
    // id را صریح از FK سبد می‌گیریم تا با فیلدهای دیگر product_detail قاطی نشود
    const product = {
      ...(item.product_detail || {}),
      id: pid,
      price_one: item.product_detail?.price_one ?? item.price,
      // هنگام تغییر تعداد داخل سبد، سقف موجودی لیست را دوباره اعمال نکن
      stock_remaining: undefined,
      stock: undefined,
    }
    try {
      await delta(product, d)
    } catch {
      /* ignore */
    }
  }

  const goShipping = () => {
    if (!itemsCount) return
    if (!isAuthenticated) {
      router.push('/login?next=/cart')
      return
    }
    setError('')
    setStep(nextStepAfter('cart'))
  }

  const saveAddress = async (payload) => {
    setBusy(true)
    setError('')
    try {
      // ثبت روی حساب همان کاربر لاگین‌شده که سفارش می‌دهد
      const created = await orderApi.createAddress(payload)
      setAddresses((prev) => [created, ...prev])
      setAddressId(created.id)
      setShowNewAddr(false)
      await estimateShipping(created.latitude, created.longitude, created.id)
    } catch (e) {
      setError(e.message || 'ثبت آدرس ناموفق بود')
      throw e
    } finally {
      setBusy(false)
    }
  }

  const goConfirm = () => {
    if (!pickup) {
      if (!addressId) {
        setError('یک آدرس انتخاب کنید یا آدرس جدید بسازید')
        return
      }
      const addr = addresses.find((a) => a.id === addressId)
      if (!addr?.latitude || !addr?.longitude) {
        setError('آدرس انتخاب‌شده موقعیت نقشه ندارد — آدرس جدید با نقشه بسازید')
        return
      }
      if (shipInfo?.out_of_range) {
        setError(shipInfo.error || 'خارج از محدوده ارسال')
        return
      }
    }
    setError('')
    setStep(nextStepAfter('shipping'))
  }

  const placeOrder = async () => {
    if (useWallet && walletBalance <= 0) {
      setError('موجودی کیف پول صفر است')
      return
    }
    if (!walletCoversAll) {
      if (paymentMode === 'gateway') {
        if (!onlineGateways.length || !payEnabled) {
          setError('درگاه آنلاینی فعال نیست — واریز دستی را انتخاب کنید')
          return
        }
        if (!gatewayCode) {
          setError('یک درگاه پرداخت انتخاب کنید')
          return
        }
      } else if (!hasManualBank) {
        setError('اطلاعات کارت/شبا فروشگاه برای واریز دستی موجود نیست')
        return
      }
    }

    setBusy(true)
    setError('')
    try {
      const mode = walletCoversAll ? 'wallet' : paymentMode
      const result = await orderApi.checkout({
        shop_id: cart.shop,
        address_id: pickup ? null : addressId,
        pickup_from_shop: pickup,
        payment_mode: mode,
        gateway_code: walletCoversAll
          ? 'wallet'
          : paymentMode === 'gateway'
            ? gatewayCode
            : 'manual',
        create_payment: !walletCoversAll && paymentMode === 'gateway',
        use_wallet: useWallet,
        wallet_amount: useWallet ? walletApplied : 0,
      })
      setOrderResult(result)
      await clear()
      setStep(nextStepAfter('confirm'))
      setReceiptDone(false)
      const payUrl = result?.payment?.payment_url
      if (
        !result?.payment?.fully_paid_by_wallet &&
        result?.payment?.mode === 'gateway' &&
        payUrl
      ) {
        window.location.href = payUrl
      }
    } catch (e) {
      setError(e.message || 'ثبت سفارش ناموفق بود')
    } finally {
      setBusy(false)
    }
  }

  const submitReceipt = async () => {
    const orderId = orderResult?.order?.id
    if (!orderId) {
      setError('شناسه سفارش موجود نیست')
      return
    }
    if (!receiptFile) {
      setError('تصویر رسید واریز را انتخاب کنید')
      return
    }
    setBusy(true)
    setError('')
    try {
      const res = await orderApi.uploadReceipt(orderId, {
        file: receiptFile,
        note: receiptNote,
      })
      setOrderResult((prev) => ({
        ...prev,
        order: res.order || prev?.order,
      }))
      setReceiptDone(true)
    } catch (e) {
      setError(e.message || 'ارسال رسید ناموفق بود')
    } finally {
      setBusy(false)
    }
  }

  const copyText = async (text) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(String(text).replace(/\s/g, ''))
    } catch {
      /* ignore */
    }
  }

  // فقط بارگذاری اولیه؛ همگام‌سازی بعدی کل صفحه را خالی نکند
  const initialBooting = (loading || authLoading) && !cart?.id && !itemsCount
  if (initialBooting) {
    return (
      <div
        className={`${styles.page} ${styles.pageApp}`}
        style={cartThemeVars || undefined}
      >
        <p className={styles.empty}>در حال بارگذاری سبد…</p>
      </div>
    )
  }

  return (
    <div
      className={`${styles.page} ${styles.pageApp}`}
      data-step={step}
      style={cartThemeVars || undefined}
    >
      <div className={styles.head}>
        <div className={styles.headText}>
          <h1 className={styles.title}>سبد خرید</h1>
          {cart.shop_title ? (
            <span className={styles.shopLabel}>{cart.shop_title}</span>
          ) : null}
        </div>
        {itemsCount ? (
          <span className={styles.countBadge}>
            {Number(itemsCount).toLocaleString('fa-IR')} کالا
          </span>
        ) : null}
      </div>

      <div className={styles.steps} role="list" aria-label="مراحل سفارش">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            role="listitem"
            className={[
              styles.step,
              i === stepIndex ? styles.stepActive : '',
              i < stepIndex ? styles.stepDone : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span className={styles.stepNum}>
              {(i + 1).toLocaleString('fa-IR')}
            </span>
            <span className={styles.stepLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {error ? <div className={`${styles.msg} ${styles.msgErr}`}>{error}</div> : null}

      {itemsCount && isAuthenticated ? (
        <div
          className={`${styles.msg} ${
            holdLeft > 0 ? styles.msgOk : styles.msgErr
          }`}
        >
          {holdLeft > 0 ? (
            <>
              موجودی سبد تا <strong>{holdLabel}</strong> برای شما رزرو است.
              قبل از اتمام زمان، خرید را نهایی کنید.
            </>
          ) : (
            <>
              زمان رزرو موجودی تمام شده. با تغییر تعداد یا ادامه خرید دوباره
              رزرو می‌شود (در صورت آزاد بودن موجودی).
            </>
          )}
        </div>
      ) : null}

      {step === 'cart' ? (
        !itemsCount ? (
          <div className={styles.empty}>
            <p>سبد خرید خالی است.</p>
            <Link href="/shop">بازگشت به فروشگاه</Link>
          </div>
        ) : (
          <>
            <div className={styles.list}>
              {(cart.items || []).map((item) => {
                const p = item.product_detail || {}
                const img = shopApi.resolveImage(p)
                const line =
                  item.line_total ??
                  (Number(item.price) || 0) * (Number(item.quantity) || 0)
                return (
                  <div
                    key={`cart-line-${item.id ?? 'x'}-${item.product ?? item.product_detail?.id}`}
                    className={styles.row}
                  >
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className={styles.thumb} src={img} alt="" />
                    ) : (
                      <span className={styles.thumb} />
                    )}
                    <div>
                      <h3 className={styles.rowTitle}>
                        {p.title || item.product_name || `محصول ${item.product}`}
                      </h3>
                      <div className={styles.rowMeta}>
                        {formatPrice(item.price)} تومان ×{' '}
                        {(item.quantity || 0).toLocaleString('fa-IR')}
                      </div>
                      <div className={styles.linePrice}>
                        {formatPrice(line)} تومان
                      </div>
                    </div>
                    <div className={styles.rowActions}>
                      <div
                        className={`${styles.qty} ${
                          Number(busyProductId) ===
                          Number(item.product || item.product_detail?.id || 0)
                            ? styles.qtyBusy
                            : ''
                        }`}
                      >
                        <button
                          type="button"
                          aria-label="کاهش"
                          disabled={
                            Number(busyProductId) ===
                            Number(item.product || item.product_detail?.id || 0)
                          }
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            bump(item, -1)
                          }}
                        >
                          −
                        </button>
                        <span>
                          {(item.quantity || 0).toLocaleString('fa-IR')}
                        </span>
                        <button
                          type="button"
                          aria-label="افزایش"
                          disabled={
                            Number(busyProductId) ===
                            Number(item.product || item.product_detail?.id || 0)
                          }
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            bump(item, 1)
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className={styles.summary}>
              <div className={styles.summaryHead}>
                <span>جمع سبد</span>
                <span className={styles.orderSummaryBadge}>
                  {(itemsCount || 0).toLocaleString('fa-IR')} قلم
                </span>
              </div>
              <div className={styles.summaryBody}>
                <div className={styles.summaryRow}>
                  <span>جمع اقلام</span>
                  <strong>{formatPrice(subtotal)} تومان</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>ارسال</span>
                  <strong className={styles.mutedStrong}>
                    بعد از انتخاب آدرس محاسبه می‌شود
                  </strong>
                </div>
              </div>
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>قابل پرداخت (فعلاً)</span>
                <strong className={styles.totalAccent}>
                  {formatPrice(subtotal)}
                  <small>تومان</small>
                </strong>
              </div>
              <div className={`${styles.actions} ${styles.actionsSticky}`}>
                <button type="button" className={styles.btn} onClick={goShipping}>
                  ادامه — نحوه ارسال
                </button>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnGhost}`}
                  onClick={() => clear()}
                >
                  خالی کردن سبد
                </button>
              </div>
            </div>
          </>
        )
      ) : null}

      {step === 'shipping' ? (
        <>
          {allowAddress || allowPickup ? (
            <div className={styles.shipOpts}>
              {allowAddress ? (
                <label
                  className={`${styles.shipOpt} ${!pickup ? styles.shipOptActive : ''}`}
                >
                  <input
                    type="radio"
                    name="ship"
                    checked={!pickup}
                    onChange={() => setPickup(false)}
                  />
                  <span>
                    <strong>ارسال به آدرس</strong>
                    <br />
                    <small style={{ color: 'var(--muted)' }}>
                      فاصله با نقشه نشان و فرمول مسافت محاسبه می‌شود
                    </small>
                  </span>
                </label>
              ) : null}
              {allowPickup ? (
                <label
                  className={`${styles.shipOpt} ${pickup ? styles.shipOptActive : ''}`}
                >
                  <input
                    type="radio"
                    name="ship"
                    checked={pickup}
                    onChange={() => setPickup(true)}
                  />
                  <span>
                    <strong>تحویل حضوری از فروشگاه</strong>
                    <br />
                    <small style={{ color: 'var(--muted)' }}>بدون هزینه ارسال</small>
                  </span>
                </label>
              ) : null}
            </div>
          ) : (
            <p className={styles.empty}>
              هیچ روش ارسالی در تنظیمات سفارش فعال نیست — از ادمین «سفارش و سبد»
              را بررسی کنید.
            </p>
          )}

          {!pickup && allowAddress ? (
            <>
              <div className={styles.addrSection}>
                <h3 className={styles.addrSectionTitle}>آدرس تحویل</h3>
                {addresses.length ? (
                  <div className={styles.addrList}>
                    {addresses.map((a) => (
                      <label
                        key={a.id}
                        className={`${styles.addrItem} ${
                          addressId === a.id ? styles.addrItemActive : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name="addr"
                          checked={addressId === a.id}
                          onChange={() => setAddressId(a.id)}
                        />
                        <span>
                          <strong>
                            {a.name} {a.family}
                          </strong>
                          <small>
                            {a.address}
                            {a.description ? ` · ${a.description}` : ''}
                            {a.mobile ? ` — ${a.mobile}` : ''}
                          </small>
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className={styles.empty} style={{ padding: '0.75rem 0' }}>
                    هنوز آدرسی ندارید — روی نقشه اضافه کنید.
                  </p>
                )}

                {!showNewAddr ? (
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnGhost}`}
                    onClick={() => setShowNewAddr(true)}
                  >
                    + آدرس جدید روی نقشه نشان
                  </button>
                ) : (
                  <AddressForm
                    user={user}
                    shopLat={cart.shop_latitude}
                    shopLng={cart.shop_longitude}
                    busy={busy}
                    onCancel={() => setShowNewAddr(false)}
                    onSubmit={saveAddress}
                    onLocationChange={(lat, lng) =>
                      estimateShipping(lat, lng, null)
                    }
                  />
                )}
              </div>

              <div className={styles.summary} style={{ marginTop: '1rem' }}>
                <div className={styles.summaryHead}>
                  <span>هزینه ارسال</span>
                </div>
                <div className={styles.summaryBody}>
                  <div className={styles.summaryRow}>
                    <span>فاصله تا فروشگاه</span>
                    <strong>
                      {shipLoading
                        ? 'در حال محاسبه…'
                        : shipInfo?.formatted_distance ||
                          shipInfo?.formattedDistance ||
                          '—'}
                    </strong>
                  </div>
                </div>
                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                  <span>مبلغ ارسال</span>
                  <strong className={styles.totalAccent}>
                    {shipLoading ? '…' : formatPrice(shipping)}
                    {!shipLoading ? <small>تومان</small> : null}
                  </strong>
                </div>
              </div>
            </>
          ) : null}

          <div className={`${styles.actions} ${styles.actionsSticky}`}>
            <button
              type="button"
              className={styles.btn}
              onClick={goConfirm}
              disabled={shipLoading || (!pickup && shipInfo?.out_of_range)}
            >
              ادامه — تأیید سفارش
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={() => setStep(prevStepBefore('shipping'))}
            >
              بازگشت
            </button>
          </div>
        </>
      ) : null}

      {step === 'confirm' ? (
        <div className={styles.confirmPanel}>
          <div className={styles.confirmHero}>
            <h2>تأیید نهایی سفارش</h2>
            <p>جزئیات را بررسی کنید و روش پرداخت را انتخاب نمایید.</p>
          </div>

          <div className={styles.confirmGrid}>
            <div className={`${styles.confirmCard} ${styles.orderSummary}`}>
              <div className={styles.orderSummaryHead}>
                <h3>خلاصه سفارش</h3>
                <span className={styles.orderSummaryBadge}>
                  {(itemsCount || 0).toLocaleString('fa-IR')} قلم
                </span>
              </div>
              <div className={styles.orderSummaryBody}>
                <div className={styles.summaryRow}>
                  <span>فروشگاه</span>
                  <strong>{cart.shop_title || '—'}</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>جمع کالا</span>
                  <strong>{formatPrice(subtotal)} تومان</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>نحوه دریافت</span>
                  <strong className={styles.summaryChip}>
                    {pickup ? 'حضوری از فروشگاه' : 'ارسال به آدرس'}
                  </strong>
                </div>
                {!pickup && addressId ? (
                  <div className={`${styles.summaryRow} ${styles.summaryRowStack}`}>
                    <span>آدرس</span>
                    <strong className={styles.addrValue}>
                      {addresses.find((a) => a.id === addressId)?.address || '—'}
                      {addresses.find((a) => a.id === addressId)?.description
                        ? ` · ${addresses.find((a) => a.id === addressId).description}`
                        : ''}
                    </strong>
                  </div>
                ) : null}
                {!pickup &&
                (shipInfo?.formatted_distance || shipInfo?.formattedDistance) ? (
                  <div className={styles.summaryRow}>
                    <span>فاصله</span>
                    <strong>
                      {shipInfo.formatted_distance || shipInfo.formattedDistance}
                    </strong>
                  </div>
                ) : null}
                <div className={styles.summaryRow}>
                  <span>هزینه ارسال</span>
                  <strong>
                    {pickup ? '۰' : formatPrice(shipping)} تومان
                  </strong>
                </div>
              </div>
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>جمع کل</span>
                <strong className={styles.totalAccent}>
                  {formatPrice(total)}
                  <small>تومان</small>
                </strong>
              </div>
              {useWallet && walletApplied > 0 ? (
                <div className={styles.orderSummaryWallet}>
                  <div className={`${styles.summaryRow} ${styles.summaryRowDeduct}`}>
                    <span>از کیف پول</span>
                    <strong>−{formatPrice(walletApplied)} تومان</strong>
                  </div>
                  <div className={`${styles.summaryRow} ${styles.totalRow} ${styles.totalRowRemain}`}>
                    <span>باقیمانده</span>
                    <strong className={styles.totalAccent}>
                      {formatPrice(payableRemainder)}
                      <small>تومان</small>
                    </strong>
                  </div>
                </div>
              ) : null}
            </div>

            <div className={styles.confirmCard}>
              <h3>روش پرداخت</h3>

              {allowWallet ? (
                <label
                  className={`${styles.walletToggle} ${
                    useWallet ? styles.walletToggleOn : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={useWallet}
                    disabled={walletLoading || walletBalance <= 0}
                    onChange={(e) => setUseWallet(e.target.checked)}
                  />
                  <span>
                    <strong>استفاده از کیف پول</strong>
                    <small>
                      {walletLoading
                        ? 'در حال دریافت موجودی…'
                        : walletBalance > 0
                          ? `موجودی: ${formatPrice(walletBalance)} تومان`
                          : 'موجودی کیف پول صفر است'}
                    </small>
                    {useWallet && walletApplied > 0 ? (
                      <small className={styles.walletSplit}>
                        {walletCoversAll
                          ? 'کل مبلغ از کیف پول پرداخت می‌شود'
                          : `${formatPrice(walletApplied)} از کیف پول + ${formatPrice(payableRemainder)} باقیمانده`}
                      </small>
                    ) : null}
                  </span>
                </label>
              ) : null}

              {!walletCoversAll ? (
              <div className={styles.payModes}>
                <p className={styles.payHint}>
                  {useWallet && walletApplied > 0
                    ? 'باقیمانده را چگونه پرداخت می‌کنید؟'
                    : 'روش پرداخت را انتخاب کنید:'}
                </p>
                {allowGateway ? (
                  <button
                    type="button"
                    className={`${styles.payMode} ${
                      paymentMode === 'gateway' ? styles.payModeOn : ''
                    }`}
                    disabled={!onlineGateways.length || !payEnabled}
                    onClick={() => {
                      setPaymentMode('gateway')
                      if (!gatewayCode && onlineGateways[0]) {
                        setGatewayCode(onlineGateways[0].gateway_code)
                      }
                    }}
                  >
                    <strong>پرداخت آنلاین</strong>
                    <span>
                      {onlineGateways.length && payEnabled
                        ? useWallet && payableRemainder > 0
                          ? `پرداخت باقیمانده ${formatPrice(payableRemainder)} تومان`
                          : 'انتخاب درگاه بانکی'
                        : 'درگاهی فعال نیست'}
                    </span>
                  </button>
                ) : null}
                {allowManual ? (
                  <button
                    type="button"
                    className={`${styles.payMode} ${
                      paymentMode === 'manual' ? styles.payModeOn : ''
                    }`}
                    disabled={!hasManualBank}
                    onClick={() => {
                      setPaymentMode('manual')
                      setGatewayCode('manual')
                    }}
                  >
                    <strong>واریز دستی</strong>
                    <span>
                      {hasManualBank
                        ? useWallet && payableRemainder > 0
                          ? `واریز باقیمانده ${formatPrice(payableRemainder)} تومان`
                          : 'کارت / شبا / حساب فروشگاه'
                        : 'فروشگاه حساب اعلام نکرده'}
                    </span>
                  </button>
                ) : null}
              </div>
              ) : (
                <div className={styles.walletFullNote}>
                  موجودی کیف پول کل مبلغ را پوشش می‌دهد — نیازی به درگاه نیست.
                </div>
              )}

              {!walletCoversAll && paymentMode === 'gateway' && onlineGateways.length ? (
                <div className={styles.gatewayList}>
                  <p className={styles.payHint}>درگاه مورد نظر را انتخاب کنید:</p>
                  {onlineGateways.map((g) => (
                    <label
                      key={g.id || g.gateway_code}
                      className={`${styles.gatewayItem} ${
                        gatewayCode === g.gateway_code
                          ? styles.gatewayItemOn
                          : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="gateway"
                        checked={gatewayCode === g.gateway_code}
                        onChange={() => setGatewayCode(g.gateway_code)}
                      />
                      <span>
                        <strong>{g.title || g.gateway_code}</strong>
                        <small>{g.gateway_code}</small>
                      </span>
                    </label>
                  ))}
                </div>
              ) : null}

              {!walletCoversAll && paymentMode === 'manual' && hasManualBank ? (
                <div className={styles.bankBox}>
                  <p className={styles.payHint}>
                    {payableRemainder > 0 && useWallet
                      ? `باقیمانده ${formatPrice(payableRemainder)} تومان را به یکی از حساب‌های زیر واریز کنید؛ پس از ثبت سفارش، تصویر رسید را ارسال نمایید.`
                      : 'مبلغ را به یکی از حساب‌های زیر واریز کنید؛ پس از ثبت سفارش، تصویر رسید را ارسال نمایید تا بررسی شود.'}
                  </p>
                  {shopBank.bank_account_holder_name ? (
                    <div className={styles.bankRow}>
                      <span>به نام</span>
                      <strong>{shopBank.bank_account_holder_name}</strong>
                    </div>
                  ) : null}
                  {shopBank.bank_card_number ? (
                    <div className={styles.bankRow}>
                      <span>شماره کارت</span>
                      <strong dir="ltr">{shopBank.bank_card_number}</strong>
                      <button
                        type="button"
                        className={styles.copyBtn}
                        onClick={() => copyText(shopBank.bank_card_number)}
                      >
                        کپی
                      </button>
                    </div>
                  ) : null}
                  {shopBank.sheba_number ? (
                    <div className={styles.bankRow}>
                      <span>شبا</span>
                      <strong dir="ltr">{shopBank.sheba_number}</strong>
                      <button
                        type="button"
                        className={styles.copyBtn}
                        onClick={() => copyText(shopBank.sheba_number)}
                      >
                        کپی
                      </button>
                    </div>
                  ) : null}
                  {shopBank.bank_account_number ? (
                    <div className={styles.bankRow}>
                      <span>شماره حساب</span>
                      <strong dir="ltr">{shopBank.bank_account_number}</strong>
                      <button
                        type="button"
                        className={styles.copyBtn}
                        onClick={() => copyText(shopBank.bank_account_number)}
                      >
                        کپی
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {!walletCoversAll && !onlineGateways.length && !hasManualBank ? (
                <div className={`${styles.msg} ${styles.msgErr}`}>
                  هیچ روش پرداختی در دسترس نیست. با پشتیبانی تماس بگیرید.
                </div>
              ) : null}
            </div>
          </div>

          <div className={`${styles.actions} ${styles.actionsSticky}`}>
            <button
              type="button"
              className={styles.btn}
              disabled={
                busy ||
                (useWallet && walletBalance <= 0) ||
                (!walletCoversAll &&
                  paymentMode === 'gateway' &&
                  (!onlineGateways.length || !gatewayCode)) ||
                (!walletCoversAll &&
                  paymentMode === 'manual' &&
                  !hasManualBank)
              }
              onClick={placeOrder}
            >
              {busy
                ? 'در حال ثبت…'
                : walletCoversAll
                  ? 'پرداخت کامل با کیف پول'
                  : paymentMode === 'manual'
                    ? useWallet && payableRemainder > 0
                      ? 'ثبت و واریز باقیمانده'
                      : 'ثبت سفارش و نمایش اطلاعات واریز'
                    : useWallet && payableRemainder > 0
                      ? 'ثبت و پرداخت باقیمانده'
                      : 'ثبت سفارش و رفتن به درگاه'}
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={() => setStep(prevStepBefore('confirm'))}
            >
              بازگشت
            </button>
          </div>
        </div>
      ) : null}

      {step === 'done' ? (
        <div className={styles.donePanel}>
          <div className={styles.doneHero}>
            <h2>سفارش ثبت شد</h2>
            <p>
              {orderResult?.order?.id
                ? `شماره سفارش: ${orderResult.order.id}`
                : 'سفارش شما با موفقیت ثبت شد.'}
            </p>
          </div>

          {orderResult?.payment?.error ? (
            <div className={`${styles.msg} ${styles.msgErr}`}>
              پرداخت: {orderResult.payment.error}
            </div>
          ) : null}

          {orderResult?.payment?.fully_paid_by_wallet ||
          orderResult?.payment?.mode === 'wallet' ||
          orderResult?.order?.payment_mode === 'wallet' ? (
            <div className={`${styles.msg} ${styles.msgOk}`}>
              سفارش با کیف پول پرداخت شد
              {orderResult?.order?.wallet_amount
                ? ` (${formatPrice(orderResult.order.wallet_amount)} تومان)`
                : ''}
              .
            </div>
          ) : null}

          {(Number(orderResult?.order?.wallet_amount) || 0) > 0 &&
          (Number(orderResult?.order?.payable_amount) || 0) > 0 ? (
            <div className={styles.walletSplitDone}>
              <div className={styles.summaryRow}>
                <span>پرداخت از کیف پول</span>
                <strong>
                  {formatPrice(orderResult.order.wallet_amount)} تومان
                </strong>
              </div>
              <div className={styles.summaryRow}>
                <span>باقیمانده قابل پرداخت</span>
                <strong>
                  {formatPrice(orderResult.order.payable_amount)} تومان
                </strong>
              </div>
            </div>
          ) : null}

          {allowReceipt &&
          (orderResult?.payment?.mode === 'manual' ||
            orderResult?.order?.payment_mode === 'manual') ? (
            <div className={styles.receiptPanel}>
              <h3>واریز دستی و ارسال رسید</h3>
              <p className={styles.payHint}>
                مبلغ{' '}
                <strong>
                  {formatPrice(
                    orderResult?.order?.payable_amount ??
                      orderResult?.payment?.payable_amount ??
                      orderResult?.order?.final_price ??
                      total,
                  )}{' '}
                  تومان
                </strong>{' '}
                را واریز کنید و عکس رسید را بفرستید تا پس از بررسی، سفارش ادامه
                یابد.
              </p>

              {(orderResult?.payment?.shop_bank || shopBank)?.bank_card_number ||
              (orderResult?.payment?.shop_bank || shopBank)?.sheba_number ||
              (orderResult?.payment?.shop_bank || shopBank)
                ?.bank_account_number ? (
                <div className={styles.bankBox}>
                  {(orderResult?.payment?.shop_bank || shopBank)
                    .bank_account_holder_name ? (
                    <div className={styles.bankRow}>
                      <span>به نام</span>
                      <strong>
                        {
                          (orderResult?.payment?.shop_bank || shopBank)
                            .bank_account_holder_name
                        }
                      </strong>
                    </div>
                  ) : null}
                  {(orderResult?.payment?.shop_bank || shopBank)
                    .bank_card_number ? (
                    <div className={styles.bankRow}>
                      <span>کارت</span>
                      <strong dir="ltr">
                        {
                          (orderResult?.payment?.shop_bank || shopBank)
                            .bank_card_number
                        }
                      </strong>
                    </div>
                  ) : null}
                  {(orderResult?.payment?.shop_bank || shopBank)
                    .sheba_number ? (
                    <div className={styles.bankRow}>
                      <span>شبا</span>
                      <strong dir="ltr">
                        {
                          (orderResult?.payment?.shop_bank || shopBank)
                            .sheba_number
                        }
                      </strong>
                    </div>
                  ) : null}
                  {(orderResult?.payment?.shop_bank || shopBank)
                    .bank_account_number ? (
                    <div className={styles.bankRow}>
                      <span>حساب</span>
                      <strong dir="ltr">
                        {
                          (orderResult?.payment?.shop_bank || shopBank)
                            .bank_account_number
                        }
                      </strong>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {receiptDone ||
              orderResult?.order?.payment_review_status === 'under_review' ? (
                <div className={`${styles.msg} ${styles.msgOk}`}>
                  رسید دریافت شد و در صف بررسی قرار گرفت.
                </div>
              ) : (
                <div className={styles.receiptForm}>
                  <p className={styles.receiptTitle}>تصویر رسید پرداخت</p>
                  {!receiptPreview ? (
                    <label className={styles.dropzone}>
                      <input
                        type="file"
                        accept="image/*"
                        className={styles.dropzoneInput}
                        onChange={(e) =>
                          onReceiptPick(e.target.files?.[0] || null)
                        }
                      />
                      <span className={styles.dropzoneIcon}>
                        <ImagePlus size={28} strokeWidth={1.75} />
                      </span>
                      <strong>انتخاب یا رها کردن تصویر رسید</strong>
                      <span>JPG، PNG یا WEBP — حداکثر چند مگابایت</span>
                    </label>
                  ) : (
                    <div className={styles.previewCard}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={receiptPreview}
                        alt="پیش‌نمایش رسید"
                        className={styles.previewImg}
                      />
                      <div className={styles.previewMeta}>
                        <div>
                          <strong>{receiptFile?.name}</strong>
                          <span>
                            {receiptFile
                              ? `${(receiptFile.size / 1024).toFixed(0)} KB`
                              : ''}
                          </span>
                        </div>
                        <div className={styles.previewActions}>
                          <label className={styles.changeBtn}>
                            تعویض
                            <input
                              type="file"
                              accept="image/*"
                              className={styles.dropzoneInput}
                              onChange={(e) =>
                                onReceiptPick(e.target.files?.[0] || null)
                              }
                            />
                          </label>
                          <button
                            type="button"
                            className={styles.removeBtn}
                            onClick={() => setReceiptFile(null)}
                            aria-label="حذف تصویر"
                          >
                            <Trash2 size={15} />
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <label className={styles.noteLabel}>
                    توضیح اختیاری
                    <textarea
                      className={styles.receiptNote}
                      placeholder="زمان واریز، نام واریزکننده…"
                      value={receiptNote}
                      onChange={(e) => setReceiptNote(e.target.value)}
                      rows={3}
                    />
                  </label>
                  <button
                    type="button"
                    className={styles.btn}
                    disabled={busy || !receiptFile}
                    onClick={submitReceipt}
                  >
                    <Upload size={16} />
                    {busy ? 'در حال ارسال…' : 'ارسال رسید برای بررسی'}
                  </button>
                </div>
              )}
            </div>
          ) : null}

          <div className={styles.actions} style={{ justifyContent: 'center' }}>
            <Link href="/profile?tab=shop" className={styles.btn}>
              سفارش‌های من
            </Link>
            <Link href="/shop" className={`${styles.btn} ${styles.btnGhost}`}>
              ادامه خرید
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
