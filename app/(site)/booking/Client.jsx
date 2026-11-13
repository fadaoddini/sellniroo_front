'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  CalendarCheck,
  ClipboardList,
  Search,
  Users,
} from 'lucide-react'
import {
  BookingFormWidget,
  BookingLookupWidget,
  BookingServicesWidget,
  BookingStaffWidget,
} from '@/components/Booking/BookingWidgets'
import ModuleGate from '@/components/modules/ModuleGate'
import ModulePageShell from '@/components/layout/ModulePageShell'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import styles from '@/components/Booking/Booking.module.css'

/** تم طلایی هم‌تراز منوی صدرا و ویجت‌های خانه */
const BOOKING_PAGE_THEME = {
  accent: '#B38C00',
  accent_deep: '#8F7000',
  ink: '#1c1c1e',
  muted: '#6b6560',
  panel_from: '#FFF9E8',
  panel_to: '#ffffff',
  panel_border: 'rgba(179, 140, 0, 0.22)',
  input_border: 'rgba(179, 140, 0, 0.22)',
  input_bg: '#ffffff',
  button_from: '#dbbe00',
  button_to: '#B38C00',
  button_text: '#1c1c1e',
  step_on_bg: '#FFF3CC',
  step_on_text: '#8F7000',
  eyebrow_color: '#B38C00',
  card_bg: '#ffffff',
  card_border: 'rgba(179, 140, 0, 0.22)',
  cta_bg: '#dbbe00',
  cta_color: '#ffffff',
  cta_hover_bg: '#9A7A00',
  cta_border: 'transparent',
  cta_style: 'rail',
  cta_side: 'left',
  cta_height: 'near',
  cta_width: 30,
  cta_radius: 8,
  cta_show_icon: true,
  cta_show_label: true,
  cta_icon: 'ArrowLeft',
  layout: 'stripe',
  show_dot: false,
  card_lift: true,
  columns: 2,
  max_width: 720,
}

const SERVICES_THEME = {
  ...BOOKING_PAGE_THEME,
  title: 'خدمات قابل رزرو',
  subtitle: 'خدمت را انتخاب کنید تا مستقیم وارد رزرو شوید',
  eyebrow_text: 'خدمات',
  max_width: 960,
  columns: 2,
  margin_top: 0,
  margin_bottom: 8,
}

const STAFF_THEME = {
  accent: '#B38C00',
  accent_deep: '#8F7000',
  ink: '#1c1c1e',
  muted: '#6b6560',
  eyebrow_color: '#B38C00',
  card_bg: '#FFF9E8',
  card_border: 'rgba(179, 140, 0, 0.22)',
  avatar_from: '#dbbe00',
  avatar_to: '#B38C00',
  title: 'تیم فنی صدرا',
  subtitle: 'کارشناسان تعمیر دستگاه لیزر',
  eyebrow_text: 'پرسنل',
  max_width: 960,
  margin_top: 0,
}

const LOOKUP_THEME = {
  accent: '#B38C00',
  accent_deep: '#8F7000',
  ink: '#1c1c1e',
  muted: '#6b6560',
  eyebrow_color: '#B38C00',
  panel_from: '#FFF9E8',
  panel_to: '#ffffff',
  panel_border: 'rgba(179, 140, 0, 0.22)',
  input_border: 'rgba(179, 140, 0, 0.22)',
  button_from: '#dbbe00',
  button_to: '#B38C00',
  button_text: '#1c1c1e',
  result_bg: '#FFF3CC',
  title: 'پیگیری نوبت',
  subtitle: 'با کد پیگیری و موبایل ثبت‌شده',
  eyebrow_text: 'پیگیری',
  max_width: 520,
  margin_top: 0,
}

const FORM_THEME = {
  ...BOOKING_PAGE_THEME,
  title: '',
  subtitle: 'چهار مرحله تا تأیید نوبت تعمیر',
  eyebrow_text: 'رزرو صدرا',
  show_panel: true,
  show_steps: true,
  max_width: 560,
  margin_top: 0,
  margin_bottom: 0,
}

const TABS = [
  {
    id: 'book',
    label: 'رزرو نوبت',
    icon: CalendarCheck,
    moduleKey: SITE_MODULE_KEYS.BOOKING_WIDGET,
  },
  {
    id: 'services',
    label: 'خدمات',
    icon: ClipboardList,
    moduleKey: SITE_MODULE_KEYS.BOOKING_SERVICES,
  },
  {
    id: 'staff',
    label: 'تیم',
    icon: Users,
    moduleKey: SITE_MODULE_KEYS.BOOKING_STAFF,
  },
  {
    id: 'lookup',
    label: 'پیگیری',
    icon: Search,
    moduleKey: SITE_MODULE_KEYS.BOOKING_LOOKUP,
  },
]

function setTabInUrl(id) {
  if (typeof window === 'undefined') return
  try {
    const url = new URL(window.location.href)
    if (id === 'book') url.searchParams.delete('tab')
    else url.searchParams.set('tab', id)
    window.history.replaceState({}, '', url)
  } catch {
    /* ignore */
  }
}

function BookingInner() {
  const searchParams = useSearchParams()
  const [tab, setTab] = useState('book')
  const serviceId = searchParams?.get('service') || null

  useEffect(() => {
    const t = searchParams?.get('tab')
    if (TABS.some((x) => x.id === t)) setTab(t)
  }, [searchParams])

  const selectTab = (id) => {
    setTab(id)
    setTabInUrl(id)
  }

  return (
    <div className={styles.page} dir="rtl" data-booking-page="1">
      <header className={styles.pageHero}>
        <p className={styles.pageEyebrow}>صدرا · نوبت‌دهی آنلاین</p>
        <h1>رزرو نوبت تعمیر</h1>
        <p>
          خدمت، پرسنل و ساعت را انتخاب کنید — پیگیری با کد تأیید پس از ثبت
        </p>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="بخش‌های نوبت‌دهی">
        {TABS.map((t) => {
          const Icon = t.icon
          const on = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              className={`${styles.tab} ${on ? styles.tabOn : ''}`}
              onClick={() => selectTab(t.id)}
            >
              <Icon size={15} strokeWidth={2.25} aria-hidden />
              {t.label}
            </button>
          )
        })}
      </div>

      <div className={styles.pageBody}>
        {tab === 'book' ? (
          <ModuleGate moduleKey={SITE_MODULE_KEYS.BOOKING_WIDGET}>
            <div className={styles.bookLayout}>
              <div className={styles.bookMain}>
                <BookingFormWidget
                  settings={FORM_THEME}
                  initialServiceId={serviceId}
                />
              </div>
              <aside className={styles.bookAside}>
                <div className={styles.asideCard}>
                  <p className={styles.asideEyebrow}>راهنما</p>
                  <strong>چطور رزرو کنم؟</strong>
                  <ol className={styles.asideSteps}>
                    <li>خدمت موردنظر را انتخاب کنید</li>
                    <li>روز و ساعت آزاد را بزنید</li>
                    <li>نام و موبایل را وارد و ثبت کنید</li>
                  </ol>
                </div>
                <div className={styles.asideCard}>
                  <p className={styles.asideEyebrow}>پیگیری</p>
                  <strong>نوبت قبلی دارید؟</strong>
                  <p className={styles.asideText}>
                    با کد پیگیری و موبایل، وضعیت نوبت را ببینید.
                  </p>
                  <button
                    type="button"
                    className={styles.asideLink}
                    onClick={() => selectTab('lookup')}
                  >
                    <Search size={14} />
                    رفتن به پیگیری
                  </button>
                </div>
              </aside>
            </div>
          </ModuleGate>
        ) : null}

        {tab === 'services' ? (
          <ModuleGate moduleKey={SITE_MODULE_KEYS.BOOKING_SERVICES}>
            <BookingServicesWidget settings={SERVICES_THEME} />
          </ModuleGate>
        ) : null}

        {tab === 'staff' ? (
          <ModuleGate moduleKey={SITE_MODULE_KEYS.BOOKING_STAFF}>
            <BookingStaffWidget settings={STAFF_THEME} />
          </ModuleGate>
        ) : null}

        {tab === 'lookup' ? (
          <ModuleGate moduleKey={SITE_MODULE_KEYS.BOOKING_LOOKUP}>
            <div className={styles.lookupWrap}>
              <BookingLookupWidget settings={LOOKUP_THEME} />
            </div>
          </ModuleGate>
        ) : null}
      </div>
    </div>
  )
}

export default function BookingClient() {
  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.BOOKING} notFoundWhenInactive>
      <ModulePageShell pageKey="booking">
        <BookingInner />
      </ModulePageShell>
    </ModuleGate>
  )
}
