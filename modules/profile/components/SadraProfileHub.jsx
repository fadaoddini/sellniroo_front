'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  CalendarCheck,
  MapPin,
  Package,
  Search,
  ShoppingBag,
  Store,
  Wrench,
} from 'lucide-react'
import styles from '../styles/SadraProfileHub.module.css'

/**
 * هاب کاربردی پروفایل صدرا — میانبرهای متناسب با ماژول‌های روشن
 */
export default function SadraProfileHub({
  user,
  modules = {},
  onOpenTab,
}) {
  const shopOn = !!(modules.shop || modules.shop_profile)
  const bookingOn = !!(modules.booking || modules.booking_profile)
  const repairsOn = !!(modules.repairs || modules.repairs_profile)

  const cards = []

  if (shopOn) {
    cards.push(
      {
        key: 'orders',
        href: '/profile?tab=shop',
        tab: 'shop',
        title: 'سفارش‌های قطعات',
        desc: 'پیگیری خرید، پرداخت و وضعیت ارسال',
        icon: Package,
        cta: 'مشاهده سفارش‌ها',
      },
      {
        key: 'shop',
        href: '/shop',
        title: 'فروشگاه قطعات',
        desc: 'قطعات و لوازم لیزر را ببینید و سفارش دهید',
        icon: Store,
        cta: 'ورود به فروشگاه',
      },
      {
        key: 'cart',
        href: '/cart',
        title: 'سبد خرید',
        desc: 'ادامه خرید و نهایی‌کردن پرداخت',
        icon: ShoppingBag,
        cta: 'باز کردن سبد',
      },
      {
        key: 'address',
        href: '/profile?tab=shop',
        tab: 'shop',
        title: 'آدرس‌های تحویل',
        desc: 'مدیریت آدرس روی نقشه برای ارسال',
        icon: MapPin,
        cta: 'مدیریت آدرس',
      },
    )
  }

  if (bookingOn) {
    cards.push(
      {
        key: 'book',
        href: '/booking',
        title: 'رزرو نوبت سرویس',
        desc: 'زمان بازدید یا تعمیر را رزرو کنید',
        icon: CalendarCheck,
        cta: 'رزرو نوبت',
      },
      {
        key: 'lookup',
        href: '/booking?tab=lookup',
        title: 'پیگیری نوبت',
        desc: 'با کد پیگیری و موبایل وضعیت را ببینید',
        icon: Search,
        cta: 'پیگیری',
      },
      {
        key: 'booking-tab',
        href: '/profile?tab=booking',
        tab: 'booking',
        title: 'نوبت‌های من',
        desc: 'میانبرهای رزرو و پیگیری در پروفایل',
        icon: CalendarCheck,
        cta: 'باز کردن',
      },
    )
  }

  if (repairsOn) {
    cards.push(
      {
        key: 'repairs',
        href: '/profile?tab=repairs',
        tab: 'repairs',
        title: 'پیگیری تعمیرات',
        desc: 'وضعیت سرویس، پیشنهادها و پرداخت‌ها',
        icon: Wrench,
        cta: 'سفارش‌های تعمیر',
      },
      {
        key: 'new-repair',
        href: '/repairs',
        title: 'ثبت درخواست تعمیر',
        desc: 'گزارش خرابی و درخواست سرویس جدید',
        icon: Wrench,
        cta: 'شروع درخواست',
      },
    )
  }

  const handleClick = (card, e) => {
    if (card.tab && typeof onOpenTab === 'function') {
      e.preventDefault()
      onOpenTab(card.tab)
    }
  }

  return (
    <div className={styles.hub}>
      <div className={styles.intro}>
        <h2>خدمات فعال شما</h2>
        <p>
          میانبرهای کاربردی بر اساس ماژول‌های روشن سایت — سفارش قطعه، رزرو نوبت و
          پیگیری تعمیر.
        </p>
      </div>

      {cards.length ? (
        <div className={styles.grid}>
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.key}
                href={card.href}
                className={styles.card}
                onClick={(e) => handleClick(card, e)}
              >
                <span className={styles.iconWrap} aria-hidden>
                  <Icon size={18} strokeWidth={2.2} />
                </span>
                <strong>{card.title}</strong>
                <span>{card.desc}</span>
                <span className={styles.cardCta}>
                  {card.cta}
                  <ArrowLeft size={13} />
                </span>
              </Link>
            )
          })}
        </div>
      ) : (
        <p className={styles.intro}>
          هنوز ماژول فروشگاه / نوبت / تعمیرات فعال نیست.
        </p>
      )}

      <section className={styles.accountBlock}>
        <h3>اطلاعات حساب</h3>
        <ul className={styles.infoList}>
          <li>
            <span>موبایل</span>
            <strong dir="ltr">{user?.mobile || '—'}</strong>
          </li>
          <li>
            <span>ایمیل</span>
            <strong dir="ltr">{user?.email || '—'}</strong>
          </li>
          <li>
            <span>نام</span>
            <strong>
              {[user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
                '—'}
            </strong>
          </li>
        </ul>
      </section>
    </div>
  )
}
