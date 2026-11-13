'use client'

import Link from 'next/link'
import { ArrowLeft, CalendarCheck, Search } from 'lucide-react'
import styles from '../styles/BookingProfilePanel.module.css'

export default function BookingProfilePanel() {
  return (
    <div className={styles.wrap}>
      <section className={styles.hero}>
        <h2>نوبت‌دهی و پیگیری</h2>
        <p>
          نوبت جدید رزرو کنید یا با کد پیگیری، وضعیت نوبت قبلی را ببینید — مثل
          پنل کاربردی پروفایل کاریابی، اینجا هم میانبرهای اصلی یک‌جا هستند.
        </p>
      </section>

      <div className={styles.actions}>
        <Link href="/booking" className={styles.primary}>
          <CalendarCheck size={18} />
          رزرو نوبت جدید
          <ArrowLeft size={14} />
        </Link>
        <Link href="/booking?tab=lookup" className={styles.secondary}>
          <Search size={18} />
          پیگیری با کد
        </Link>
      </div>

      <ul className={styles.tips}>
        <li>بعد از ثبت، کد پیگیری را ذخیره کنید.</li>
        <li>برای تغییر زمان، از بخش پیگیری یا پشتیبانی مرکز استفاده کنید.</li>
        <li>اگر سرویس تعمیر دارید، وضعیت کامل‌تر در تب «تعمیرات» است.</li>
      </ul>
    </div>
  )
}
