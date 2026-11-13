'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  Calculator,
  Headphones,
  Mail,
  MessageCircle,
  Phone,
} from 'lucide-react'
import styles from '../../styles/ReboHub.module.css'

export default function ReboSupportPanel({ site = null, onNavigate }) {
  const phone = site?.contact_phone || site?.contact_mobile || ''
  const mobile = site?.contact_mobile || ''
  const email = site?.contact_email || ''

  return (
    <section className={styles.support} dir="rtl" lang="fa">
      <header className={styles.supportHero}>
        <span className={styles.supportIcon} aria-hidden>
          <Headphones size={22} strokeWidth={1.8} />
        </span>
        <div>
          <p className={styles.eyebrow}>مشاوره و پشتیبانی</p>
          <h2>
            {site?.contact_title || 'راه‌اندازی سامانه اختصاصی'}
          </h2>
          <p>
            {site?.contact_description ||
              'بگویید چه کسب‌وکاری دارید؛ تیم ربو مسیر بسته، دامنه و زمان تحویل را با شما هماهنگ می‌کند.'}
          </p>
        </div>
      </header>

      <div className={styles.supportGrid}>
        <article className={styles.panelCard}>
          <h3>راه‌های تماس</h3>
          <ul className={styles.contactList}>
            {phone ? (
              <li>
                <Phone size={15} />
                <div>
                  <span>{site?.contact_phone_label || 'تلفن'}</span>
                  <a href={`tel:${phone}`} dir="ltr">
                    {phone}
                  </a>
                </div>
              </li>
            ) : null}
            {mobile && mobile !== phone ? (
              <li>
                <MessageCircle size={15} />
                <div>
                  <span>{site?.contact_mobile_label || 'موبایل'}</span>
                  <a href={`tel:${mobile}`} dir="ltr">
                    {mobile}
                  </a>
                </div>
              </li>
            ) : null}
            {email ? (
              <li>
                <Mail size={15} />
                <div>
                  <span>{site?.contact_email_label || 'ایمیل'}</span>
                  <a href={`mailto:${email}`} dir="ltr">
                    {email}
                  </a>
                </div>
              </li>
            ) : null}
            {!phone && !mobile && !email ? (
              <li className={styles.emptyHint}>
                اطلاعات تماس هنوز در تنظیمات سایت تکمیل نشده است.
              </li>
            ) : null}
          </ul>
          <Link href="/contact" className={styles.primaryBtn}>
            فرم مشاوره
            <ArrowLeft size={14} />
          </Link>
        </article>

        <article className={styles.panelCard}>
          <h3>قدم بعدی پیشنهادی</h3>
          <ol className={styles.steps}>
            <li>
              بسته و امکانات را از صفحه قیمت انتخاب کنید
              <Link href="/#rebo-cost">رفتن به بسته‌ها</Link>
            </li>
            <li>
              سبد را در پروفایل تأیید و ثبت کنید
              <button type="button" onClick={() => onNavigate?.('rebo')}>
                تب سفارش بسته
              </button>
            </li>
            <li>
              در صورت نیاز سرور ابری را سفارش و شارژ کنید
              <button type="button" onClick={() => onNavigate?.('cloud')}>
                تب سرور ابری
              </button>
            </li>
            <li>
              با شماره پیگیری وضعیت را چک کنید
              <button type="button" onClick={() => onNavigate?.('track')}>
                تب پیگیری
              </button>
            </li>
          </ol>
          <Link href="/#rebo-capabilities" className={styles.ghostBtn}>
            <Calculator size={14} />
            امکانات ربو
          </Link>
        </article>
      </div>
    </section>
  )
}
