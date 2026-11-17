'use client'

import {
  ArrowLeft,
  Boxes,
  Cloud,
  Headphones,
  Package,
  Search,
  Server,
} from 'lucide-react'
import { formatRial } from '@/config/reboPricing'
import styles from '../../styles/ReboHub.module.css'

function money(n, cur = 'تومان') {
  return `${formatRial(n)} ${cur}`
}

export default function ReboOverviewPanel({
  cart,
  orders = [],
  cloudSub = null,
  cloudCfg = null,
  pricing = null,
  onNavigate,
}) {
  const cartCount =
    (cart?.packages?.length || 0) + (cart?.items?.length || 0)
  const currency =
    cart?.currency || cloudCfg?.currency_label || pricing?.currency_label || 'تومان'
  const packageCount = (pricing?.packages || []).filter((p) => p.enabled !== false)
    .length
  const cloudActive = Boolean(cloudSub && cloudSub.status !== 'wiped')

  const stats = [
    {
      key: 'cart',
      label: 'سبد سفارش',
      value: cartCount
        ? `${cartCount.toLocaleString('fa-IR')} مورد`
        : 'خالی',
      hint: cartCount ? money(cart?.total, currency) : 'از صفحه بسته‌ها انتخاب کنید',
      tone: cartCount ? 'accent' : 'muted',
    },
    {
      key: 'orders',
      label: 'سفارش‌های ثبت‌شده',
      value: (orders.length || 0).toLocaleString('fa-IR'),
      hint: orders[0]
        ? `آخرین: ${orders[0].request_number}`
        : 'هنوز سفارشی ثبت نشده',
      tone: orders.length ? 'ok' : 'muted',
    },
    {
      key: 'cloud',
      label: 'سرور ابری',
      value: cloudActive
        ? cloudSub.status_display || cloudSub.status
        : 'بدون اشتراک',
      hint: cloudActive
        ? `موجودی ${money(cloudSub.balance, currency)} · ${(
            cloudSub.days_remaining || 0
          ).toLocaleString('fa-IR')} روز`
        : cloudCfg
          ? `روزانه ${money(cloudCfg.daily_price, currency)}`
          : 'ثبت و شارژ از تب سرور',
      tone: cloudSub?.in_warning
        ? 'warn'
        : cloudActive
          ? 'ok'
          : 'muted',
    },
    {
      key: 'catalog',
      label: 'بسته‌های فعال',
      value: packageCount.toLocaleString('fa-IR'),
      hint: 'قیمت‌گذاری زنده ربو',
      tone: 'accent',
    },
  ]

  const actions = [
    {
      key: 'cart',
      title: cartCount ? 'تأیید سبد سفارش' : 'سبد سفارش',
      desc: cartCount
        ? `${cartCount.toLocaleString('fa-IR')} مورد آماده‌ی ثبت`
        : 'سبد سفارش بسته را از همین پروفایل مدیریت کنید',
      tab: 'rebo',
      icon: Package,
    },
    {
      key: 'track',
      title: 'پیگیری درخواست',
      desc: 'با شماره پیگیری وضعیت سفارش را ببینید',
      tab: 'track',
      icon: Search,
    },
    {
      key: 'cloud',
      title: cloudActive ? 'مدیریت سرور ابری' : 'سفارش سرور ابری',
      desc: cloudActive
        ? 'شارژ اعتبار، گردش حساب و وضعیت'
        : 'اشتراک روزانه بدون سرور اختصاصی',
      tab: 'cloud',
      icon: Cloud,
    },
    {
      key: 'support',
      title: 'مشاوره راه‌اندازی',
      desc: 'برای دامنه، محتوا و زمان تحویل با تیم ربو صحبت کنید',
      tab: 'support',
      icon: Headphones,
    },
  ]

  return (
    <section className={styles.overview} dir="rtl" lang="fa">
      <div className={styles.statGrid}>
        {stats.map((s) => (
          <article
            key={s.key}
            className={`${styles.statCard} ${styles[`stat_${s.tone}`] || ''}`}
          >
            <span>{s.label}</span>
            <strong>{s.value}</strong>
            <small>{s.hint}</small>
          </article>
        ))}
      </div>

      <div className={styles.actionGrid}>
        {actions.map((a) => {
          const Icon = a.icon
          return (
            <button
              key={a.key}
              type="button"
              className={styles.actionCard}
              onClick={() => onNavigate?.(a.tab)}
            >
              <span className={styles.actionIcon} aria-hidden>
                <Icon size={18} strokeWidth={1.8} />
              </span>
              <div>
                <strong>{a.title}</strong>
                <p>{a.desc}</p>
              </div>
              <ArrowLeft size={14} className={styles.actionArrow} />
            </button>
          )
        })}
      </div>

      <div className={styles.splitRow}>
        <article className={styles.panelCard}>
          <header>
            <Boxes size={16} />
            <h3>آخرین سفارش‌ها</h3>
          </header>
          {orders.length ? (
            <ul className={styles.miniList}>
              {orders.slice(0, 4).map((o) => (
                <li key={o.request_number}>
                  <div>
                    <strong dir="ltr">{o.request_number}</strong>
                    <small>{o.title || 'سفارش ربو'}</small>
                  </div>
                  <b>
                    {money(o.total, o.currency || currency)}
                  </b>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.emptyHint}>
              هنوز سفارشی ثبت نشده. بسته را انتخاب کنید و از تب سفارش بسته تأیید
              کنید.
            </p>
          )}
          <button
            type="button"
            className={styles.linkBtn}
            onClick={() => onNavigate?.('track')}
          >
            پیگیری سفارش‌ها
            <ArrowLeft size={13} />
          </button>
        </article>

        <article className={styles.panelCard}>
          <header>
            <Server size={16} />
            <h3>وضعیت سرور</h3>
          </header>
          {cloudActive ? (
            <div className={styles.cloudSnapshot}>
              <div>
                <span>کد اشتراک</span>
                <strong dir="ltr">{cloudSub.code}</strong>
              </div>
              <div>
                <span>موجودی</span>
                <strong>{money(cloudSub.balance, currency)}</strong>
              </div>
              <div>
                <span>باقی‌مانده تقریبی</span>
                <strong>
                  {(cloudSub.days_remaining || 0).toLocaleString('fa-IR')} روز
                </strong>
              </div>
              {cloudSub.in_warning ? (
                <p className={styles.warnLine}>هشدار اعتبار — زودتر شارژ کنید</p>
              ) : null}
            </div>
          ) : (
            <p className={styles.emptyHint}>
              اشتراک سرور ندارید. از تب سرور ابری ثبت سفارش کنید یا از صفحه اصلی
              بخش سفارش سرور را ببینید.
            </p>
          )}
          <button
            type="button"
            className={styles.linkBtn}
            onClick={() => onNavigate?.('cloud')}
          >
            {cloudActive ? 'مدیریت سرور' : 'سفارش سرور'}
            <ArrowLeft size={13} />
          </button>
        </article>
      </div>
    </section>
  )
}
