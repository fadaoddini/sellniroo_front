'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { goHomeHash } from '@/utils/goHomeHash'
import {
  ArrowLeft,
  Boxes,
  Building2,
  CheckCircle2,
  Copy,
  CreditCard,
  ImagePlus,
  Loader2,
  Package,
  Receipt,
  Trash2,
  UserRound,
  Wallet,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Config from '@/config/config'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import { formatRial } from '@/config/reboPricing'
import { isSiteModuleActive } from '@/services/siteModules'
import { resolveLucideIcon } from '@/utils/lucideIcons'
import {
  clearReboPackageCart,
  readReboPackageCart,
  writeReboPackageCart,
} from '@/utils/reboPackageCart'
import { pushReboOrderHistory } from '@/utils/reboOrderHistory'
import styles from '../styles/ReboPackageOrdersPanel.module.css'

const PAY_METHODS = [
  {
    id: 'gateway',
    label: 'درگاه پرداخت',
    desc: 'پرداخت آنلاین امن',
    icon: CreditCard,
    flag: 'allow_gateway',
  },
  {
    id: 'wallet',
    label: 'کیف پول',
    desc: 'برداشت از موجودی حساب',
    icon: Wallet,
    flag: 'allow_wallet',
  },
  {
    id: 'receipt',
    label: 'واریز کارت',
    desc: 'فیش دستی و تأیید مدیر',
    icon: Receipt,
    flag: 'allow_receipt',
  },
]

export default function ReboPackageOrdersPanel() {
  const { user, getAuthHeaders } = useAuth()
  const [cart, setCart] = useState(() => readReboPackageCart())
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [requestNumber, setRequestNumber] = useState('')
  const [orderCode, setOrderCode] = useState('')
  const [paymentsOn, setPaymentsOn] = useState(false)
  const [payCfg, setPayCfg] = useState(null)
  const [walletBalance, setWalletBalance] = useState(null)
  const [method, setMethod] = useState('gateway')
  const [receiptFile, setReceiptFile] = useState(null)
  const [receiptNote, setReceiptNote] = useState('')
  const [copiedKey, setCopiedKey] = useState('')

  const copyValue = async (key, value) => {
    const text = String(value || '').trim()
    if (!text) return
    try {
      await navigator.clipboard.writeText(text.replace(/\s+/g, ''))
      setCopiedKey(key)
      window.setTimeout(() => setCopiedKey(''), 1600)
    } catch {
      setCopiedKey('')
    }
  }

  const refresh = useCallback(() => {
    const next = readReboPackageCart()
    setCart(next)
    setNote(next.note || '')
  }, [])

  useEffect(() => {
    refresh()
    const onChange = () => refresh()
    window.addEventListener('rebo-package-cart-changed', onChange)
    window.addEventListener('storage', onChange)
    return () => {
      window.removeEventListener('rebo-package-cart-changed', onChange)
      window.removeEventListener('storage', onChange)
    }
  }, [refresh])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const on = await isSiteModuleActive(SITE_MODULE_KEYS.REBO_PAYMENTS, {
        force: true,
      })
      if (cancelled) return
      setPaymentsOn(!!on)
      if (!on) return
      try {
        const res = await axios.get(Config.endpoints.reboOrders.config(), {
          timeout: 8000,
        })
        const data = res.data?.data || null
        if (cancelled) return
        setPayCfg(data)
        const first = PAY_METHODS.find((m) => data?.[m.flag] !== false)
        if (first) setMethod(first.id)
      } catch {
        if (!cancelled) setPayCfg(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!paymentsOn || method !== 'wallet') return undefined
    let cancelled = false
    axios
      .get(Config.endpoints.order.wallet(), {
        headers: getAuthHeaders(),
        timeout: 8000,
      })
      .then((res) => {
        if (cancelled) return
        const bal =
          res.data?.data?.balance ??
          res.data?.balance ??
          res.data?.data ??
          0
        setWalletBalance(Number(bal) || 0)
      })
      .catch(() => {
        if (!cancelled) setWalletBalance(null)
      })
    return () => {
      cancelled = true
    }
  }, [paymentsOn, method, getAuthHeaders])

  const count = (cart.packages?.length || 0) + (cart.items?.length || 0)
  const currency = cart.currency || payCfg?.currency_label || 'تومان'

  const lines = useMemo(() => {
    const pkgs = (cart.packages || []).map((p) => ({
      key: `pkg:${p.id}`,
      kind: 'package',
      id: p.id,
      title: p.name,
      desc: p.desc,
      price: p.price,
      icon: p.icon,
      features: p.features || [],
    }))
    const items = (cart.items || []).map((it) => ({
      key: `item:${it.type}`,
      kind: 'item',
      id: it.type,
      title: it.label,
      desc: it.desc,
      price: it.price,
      icon: it.icon,
      features: [],
    }))
    return [...pkgs, ...items]
  }, [cart])

  const availableMethods = useMemo(() => {
    if (!payCfg) return PAY_METHODS
    return PAY_METHODS.filter((m) => payCfg[m.flag] !== false)
  }, [payCfg])

  const removeLine = (line) => {
    const next = {
      ...cart,
      packages:
        line.kind === 'package'
          ? (cart.packages || []).filter((p) => p.id !== line.id)
          : cart.packages || [],
      items:
        line.kind === 'item'
          ? (cart.items || []).filter((it) => it.type !== line.id)
          : cart.items || [],
    }
    next.total =
      next.packages.reduce((s, p) => s + (Number(p.price) || 0), 0) +
      next.items.reduce((s, it) => s + (Number(it.price) || 0), 0)
    writeReboPackageCart(next)
    refresh()
  }

  const finishSuccess = (msg, meta = {}) => {
    setOk(msg)
    setRequestNumber(meta.request_number || '')
    setOrderCode(meta.code || '')
    if (meta.request_number) {
      pushReboOrderHistory({
        request_number: meta.request_number,
        title: meta.title || 'سفارش ربو',
        total: cart.total,
        currency,
        package_count: cart.packages?.length || 0,
        item_count: cart.items?.length || 0,
        summary: meta.code || '',
      })
    }
    clearReboPackageCart()
    refresh()
    setNote('')
    setReceiptFile(null)
    setReceiptNote('')
  }

  const submitLeadOnly = async () => {
    const mobile = String(user?.mobile || '').replace(/\D/g, '')
    if (!/^09\d{9}$/.test(mobile)) {
      setErr('برای ثبت سفارش، موبایل معتبر در حساب لازم است')
      return
    }

    const packageLines = (cart.packages || [])
      .map(
        (p) =>
          `• ${p.name} — ${formatRial(p.price)} ${currency}` +
          (p.features?.length ? `\n  ${p.features.join('، ')}` : ''),
      )
      .join('\n')
    const itemLines = (cart.items || [])
      .map((it) => `• ${it.label} — ${formatRial(it.price)} ${currency}`)
      .join('\n')
    const description = [
      'سفارش بسته از موتور قدرتمند ربو',
      '',
      packageLines,
      itemLines,
      '',
      `جمع برآوردی: ${formatRial(cart.total)} ${currency}`,
      note.trim() ? `\nتوضیح مشتری:\n${note.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    const payload = {
      title: `سفارش ربو — ${(
        user?.full_name ||
        user?.first_name ||
        mobile
      )
        .toString()
        .trim()}`,
      description,
      customer_name: (
        user?.full_name ||
        [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
        'کاربر ربو'
      ).trim(),
      customer_mobile: mobile,
      customer_email: user?.email || '',
      source: 'rebo_package_order',
    }
    const response = await axios.post(
      Config.endpoints.requser.create(),
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        timeout: 12000,
      },
    )
    if (response.data?.status !== 'ok') {
      throw new Error(response.data?.message || 'ثبت ناموفق بود')
    }
    finishSuccess('سفارش ثبت شد — تیم ربو به‌زودی تماس می‌گیرد.', {
      request_number: response.data.request_number || '',
      title: payload.title,
    })
  }

  const submitPaid = async () => {
    if (method === 'receipt' && !receiptFile) {
      setErr('تصویر رسید واریز را انتخاب کنید')
      return
    }
    if (
      method === 'wallet' &&
      walletBalance != null &&
      walletBalance < Number(cart.total || 0)
    ) {
      setErr(
        `موجودی کیف پول کافی نیست (موجودی: ${formatRial(walletBalance)} ${currency})`,
      )
      return
    }

    const fd = new FormData()
    fd.append('method', method)
    fd.append('note', note || '')
    fd.append('packages', JSON.stringify(cart.packages || []))
    fd.append('items', JSON.stringify(cart.items || []))
    fd.append('customer_mobile', String(user?.mobile || ''))
    fd.append('customer_email', String(user?.email || ''))
    fd.append(
      'customer_name',
      (
        user?.full_name ||
        [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
        ''
      ).trim(),
    )
    if (method === 'receipt') {
      fd.append('receipt_image', receiptFile)
      fd.append('receipt_note', receiptNote || '')
    }

    const response = await axios.post(
      Config.endpoints.reboOrders.checkout(),
      fd,
      {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
        timeout: 20000,
      },
    )
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'پرداخت ناموفق بود')
    }
    const data = response.data.data || {}
    const order = data.order || {}
    if (data.payment_url) {
      finishSuccess('در حال انتقال به درگاه…', {
        request_number: order.request_number || '',
        code: order.code || '',
        title: `سفارش ربو ${order.code || ''}`.trim(),
      })
      window.location.href = data.payment_url
      return
    }
    const paid = order.status === 'paid'
    const awaiting = order.status === 'awaiting_review'
    finishSuccess(
      response.data.message ||
        (paid
          ? 'پرداخت با موفقیت انجام شد'
          : awaiting
            ? 'رسید ثبت شد و پس از تأیید مدیر نهایی می‌شود'
            : 'سفارش ثبت شد'),
      {
        request_number: order.request_number || '',
        code: order.code || '',
        title: `سفارش ربو ${order.code || ''}`.trim(),
      },
    )
  }

  const submit = async () => {
    if (!count) {
      setErr('بسته‌ای انتخاب نشده است')
      return
    }
    setBusy(true)
    setErr('')
    setOk('')
    setRequestNumber('')
    setOrderCode('')
    try {
      if (paymentsOn && payCfg?.module_active !== false) {
        await submitPaid()
      } else {
        await submitLeadOnly()
      }
    } catch (ex) {
      setErr(
        ex?.response?.data?.message ||
          ex?.message ||
          'ثبت سفارش ناموفق بود. دوباره تلاش کنید.',
      )
    } finally {
      setBusy(false)
    }
  }

  if (!count && !ok) {
    return (
      <section className={styles.panel} dir="rtl" lang="fa">
        <div className={styles.empty}>
          <Package size={28} strokeWidth={1.6} />
          <h2>سفارش بسته‌های ربو</h2>
          <p>
            هنوز بسته‌ای در سبد نیست. از صفحه اصلی، موضوع موردنظر را انتخاب کنید
            و با یک کلیک همین‌جا ثبت کنید.
          </p>
          <button
            type="button"
            className={styles.ctaGhost}
            onClick={() => goHomeHash('rebo-cost')}
          >
            مشاهده بسته‌ها
            <ArrowLeft size={14} />
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.panel} dir="rtl" lang="fa">
      <header className={styles.head}>
        <p className={styles.eyebrow}>
          <Boxes size={14} strokeWidth={2} />
          سفارش موتور ربو
        </p>
        <h2>بسته‌های انتخاب‌شده</h2>
        <p className={styles.sub}>
          {paymentsOn
            ? 'سبد را بررسی کنید، روش پرداخت را انتخاب کنید و سفارش را نهایی کنید.'
            : 'یک‌کلیکه از صفحه قیمت‌گذاری آمده‌اند — تأیید کنید تا درخواست ثبت شود.'}
        </p>
      </header>

      {ok ? (
        <div className={styles.success} role="status">
          <CheckCircle2 size={18} />
          <div>
            <strong>{ok}</strong>
            {orderCode ? <span>کد سفارش: {orderCode}</span> : null}
            {requestNumber ? (
              <span>شماره پیگیری: {requestNumber}</span>
            ) : null}
          </div>
          <div className={styles.successActions}>
            {requestNumber ? (
              <Link
                href={`/profile?tab=track&request=${encodeURIComponent(requestNumber)}`}
                className={styles.cta}
              >
                پیگیری سفارش
                <ArrowLeft size={14} />
              </Link>
            ) : null}
            <button
              type="button"
              className={styles.ctaGhost}
              onClick={() => goHomeHash('rebo-cost')}
            >
              سفارش بسته دیگر
            </button>
          </div>
        </div>
      ) : null}

      {count > 0 ? (
        <>
          <ul className={styles.list}>
            {lines.map((line) => {
              const Icon = resolveLucideIcon(line.icon, Boxes)
              return (
                <li key={line.key} className={styles.card}>
                  <span className={styles.icon}>
                    <Icon size={16} strokeWidth={1.8} />
                  </span>
                  <div className={styles.meta}>
                    <strong>{line.title}</strong>
                    {line.desc ? <small>{line.desc}</small> : null}
                    {line.features?.length ? (
                      <em>{line.features.slice(0, 4).join(' · ')}</em>
                    ) : null}
                  </div>
                  <div className={styles.side}>
                    <b>
                      {formatRial(line.price)}
                      <i>{currency}</i>
                    </b>
                    <button
                      type="button"
                      className={styles.remove}
                      onClick={() => removeLine(line)}
                      aria-label="حذف"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>

          <div className={styles.total}>
            <span>جمع برآوردی</span>
            <strong>
              {formatRial(cart.total)}
              <em>{currency}</em>
            </strong>
          </div>

          <label className={styles.note}>
            توضیح بیشتر (اختیاری)
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="مثلاً نوع کسب‌وکار، دامنه، یا زمان راه‌اندازی"
            />
          </label>

          {paymentsOn ? (
            <div className={styles.payBox}>
              <h3>روش پرداخت</h3>
              <div className={styles.payMethods} role="radiogroup" aria-label="روش پرداخت">
                {availableMethods.map((m) => {
                  const Icon = m.icon
                  const on = method === m.id
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      className={`${styles.payMethod} ${on ? styles.payMethodOn : ''}`}
                      onClick={() => setMethod(m.id)}
                      disabled={busy}
                    >
                      <span className={styles.payMethodIcon} aria-hidden>
                        <Icon size={15} strokeWidth={2} />
                      </span>
                      <strong>{m.label}</strong>
                      <small>{m.desc}</small>
                    </button>
                  )
                })}
              </div>

              {method === 'wallet' ? (
                <div className={styles.walletCard}>
                  <span className={styles.walletIcon} aria-hidden>
                    <Wallet size={16} />
                  </span>
                  <div>
                    <strong>موجودی کیف پول</strong>
                    <p>
                      {walletBalance == null
                        ? 'در حال دریافت…'
                        : `${formatRial(walletBalance)} ${currency}`}
                    </p>
                  </div>
                </div>
              ) : null}

              {method === 'receipt' ? (
                <div className={styles.receiptBox}>
                  <div className={styles.bankCard}>
                    <div className={styles.bankCardTop}>
                      <span>
                        <Building2 size={14} />
                        {payCfg?.bank_name || 'واریز به کارت'}
                      </span>
                      <em>{formatRial(cart.total)} {currency}</em>
                    </div>
                    {payCfg?.bank_card ? (
                      <div className={styles.bankCardNumber}>
                        <span dir="ltr">{payCfg.bank_card}</span>
                        <button
                          type="button"
                          className={styles.copyBtn}
                          onClick={() => copyValue('card', payCfg.bank_card)}
                        >
                          <Copy size={13} />
                          {copiedKey === 'card' ? 'کپی شد' : 'کپی کارت'}
                        </button>
                      </div>
                    ) : (
                      <p className={styles.bankEmpty}>
                        شماره کارت هنوز در تنظیمات پرداخت ربو ثبت نشده است.
                      </p>
                    )}
                    <div className={styles.bankCardMeta}>
                      {payCfg?.bank_owner ? (
                        <span>
                          <UserRound size={13} />
                          {payCfg.bank_owner}
                        </span>
                      ) : null}
                      {payCfg?.bank_sheba ? (
                        <button
                          type="button"
                          className={styles.shebaBtn}
                          onClick={() => copyValue('sheba', payCfg.bank_sheba)}
                        >
                          <span dir="ltr">شبا: {payCfg.bank_sheba}</span>
                          <Copy size={12} />
                          {copiedKey === 'sheba' ? 'کپی شد' : null}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {payCfg?.payment_instructions ? (
                    <p className={styles.receiptHint}>
                      {payCfg.payment_instructions}
                    </p>
                  ) : (
                    <p className={styles.receiptHint}>
                      مبلغ سفارش را واریز کنید و تصویر رسید را بارگذاری کنید تا
                      پس از تأیید مدیر، سفارش پرداخت‌شده شود.
                    </p>
                  )}

                  <label
                    className={`${styles.uploadZone} ${
                      receiptFile ? styles.uploadZoneOn : ''
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setReceiptFile(e.target.files?.[0] || null)
                      }
                    />
                    <span className={styles.uploadIcon} aria-hidden>
                      <ImagePlus size={18} />
                    </span>
                    <strong>
                      {receiptFile ? receiptFile.name : 'بارگذاری تصویر رسید'}
                    </strong>
                    <small>
                      {receiptFile
                        ? 'برای تعویض، فایل دیگری انتخاب کنید'
                        : 'فرمت تصویر · JPG یا PNG'}
                    </small>
                  </label>

                  <label className={styles.receiptNoteLabel}>
                    توضیح رسید (اختیاری)
                    <input
                      type="text"
                      className={styles.receiptNote}
                      placeholder="مثلاً ساعت واریز یا نام واریزکننده"
                      value={receiptNote}
                      onChange={(e) => setReceiptNote(e.target.value)}
                    />
                  </label>
                </div>
              ) : null}
            </div>
          ) : null}

          {err ? <p className={styles.err}>{err}</p> : null}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cta}
              disabled={busy}
              onClick={submit}
            >
              {busy ? (
                <>
                  <Loader2 className={styles.spin} size={16} />
                  در حال ثبت…
                </>
              ) : paymentsOn ? (
                <>
                  {method === 'gateway'
                    ? 'پرداخت آنلاین'
                    : method === 'wallet'
                      ? 'پرداخت از کیف پول'
                      : 'ثبت سفارش با فیش'}
                  <ArrowLeft size={14} />
                </>
              ) : (
                <>
                  تأیید و ثبت سفارش
                  <ArrowLeft size={14} />
                </>
              )}
            </button>
            <button
              type="button"
              className={styles.clear}
              disabled={busy}
              onClick={() => {
                clearReboPackageCart()
                refresh()
                setNote('')
              }}
            >
              خالی کردن سبد
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
