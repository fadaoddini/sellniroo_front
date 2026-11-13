'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  ClipboardList,
  Search,
  Users,
  Wrench,
} from 'lucide-react'
import ModuleGate from '@/components/modules/ModuleGate'
import ModulePageShell from '@/components/layout/ModulePageShell'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import {
  RepairsRequestWidget,
  RepairsServicesWidget,
  RepairsTechniciansWidget,
  RepairsTrackWidget,
} from '@/components/Repairs/RepairsWidgets'
import styles from './Repairs.module.css'

/** تم طلایی هم‌تراز منوی صدرا و /booking */
const GOLD = {
  ink: '#1c1c1e',
  muted: '#6b6560',
  eyebrow_color: '#B38C00',
  accent: '#B38C00',
  accent_deep: '#8F7000',
  panel_from: '#FFF9E8',
  panel_to: '#ffffff',
  panel_border: 'rgba(179, 140, 0, 0.22)',
  input_border: 'rgba(179, 140, 0, 0.22)',
  input_bg: '#ffffff',
  button_from: '#dbbe00',
  button_to: '#B38C00',
  button_text: '#1c1c1e',
  card_bg: '#ffffff',
  card_border: 'rgba(179, 140, 0, 0.22)',
  avatar_from: '#dbbe00',
  avatar_to: '#B38C00',
  avatar_text: '#1c1c1e',
  cta_color: '#B38C00',
  margin_top: 0,
  margin_bottom: 0,
}

const REQUEST_THEME = {
  ...GOLD,
  eyebrow_text: 'سرویس لیزر',
  title: 'ثبت درخواست تعمیر',
  subtitle: 'اطلاعات دستگاه لیزر و آدرس را وارد کنید',
  show_panel: true,
  show_eyebrow: true,
  show_deposit_hint: true,
  show_brand_fields: true,
  show_serial: true,
  submit_label: 'ثبت درخواست و ادامه پرداخت',
  max_width: 640,
}

const TEAM_THEME = {
  ...GOLD,
  eyebrow_text: 'تیم سرویس',
  title: 'تعمیرکاران اعزامی',
  subtitle: 'ببینید چه کسی برای تعمیر دستگاه شما اعزام می‌شود',
  show_eyebrow: true,
  show_specialty: true,
  show_city: true,
  show_avatar: true,
  card_lift: true,
  card_bg: '#FFF9E8',
  columns: 4,
  max_width: 960,
  limit: 16,
}

const SERVICES_THEME = {
  ...GOLD,
  eyebrow_text: 'اجرت و سرویس',
  title: 'خدمات و مراحل تعمیر',
  subtitle: 'شرایط و اجرت تعمیر انواع دستگاه لیزر',
  show_eyebrow: true,
  show_unit: true,
  show_desc: true,
  show_price: true,
  show_cta: true,
  show_dot: true,
  card_lift: true,
  cta_label: 'ثبت درخواست',
  link_base: '/repairs?tab=request',
  columns: 3,
  max_width: 960,
  limit: 24,
}

const TRACK_THEME = {
  ...GOLD,
  eyebrow_text: 'پیگیری',
  title: 'پیگیری و گزارش تعمیر',
  subtitle: 'وضعیت تکنسین، مراحل طی‌شده و گزارش دستگاه',
  show_panel: true,
  show_eyebrow: true,
  code_label: 'کد سفارش',
  mobile_label: 'موبایل',
  submit_label: 'جستجو',
  result_bg: '#FFF3CC',
  max_width: 520,
}

const TABS = [
  { id: 'request', label: 'ثبت درخواست', icon: Wrench },
  { id: 'team', label: 'تیم سرویس', icon: Users },
  { id: 'services', label: 'اجرت و سرویس', icon: ClipboardList },
  { id: 'track', label: 'پیگیری', icon: Search },
]

function setTabInUrl(id) {
  if (typeof window === 'undefined') return
  try {
    const url = new URL(window.location.href)
    if (id === 'request') {
      url.searchParams.delete('tab')
      url.hash = ''
    } else {
      url.searchParams.set('tab', id)
      url.hash = id === 'track' ? 'track' : ''
    }
    window.history.replaceState({}, '', url)
  } catch {
    /* ignore */
  }
}

function resolveInitialTab(searchParams) {
  const fromQuery = searchParams?.get('tab')
  if (TABS.some((t) => t.id === fromQuery)) return fromQuery
  if (typeof window !== 'undefined') {
    const hash = String(window.location.hash || '').replace(/^#/, '')
    if (hash === 'track') return 'track'
  }
  return 'request'
}

function RepairsPageInner() {
  const searchParams = useSearchParams()
  const [tab, setTab] = useState('request')

  useEffect(() => {
    setTab(resolveInitialTab(searchParams))
  }, [searchParams])

  useEffect(() => {
    const onHash = () => {
      const hash = String(window.location.hash || '').replace(/^#/, '')
      if (hash === 'track') setTab('track')
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const selectTab = (id) => {
    setTab(id)
    setTabInUrl(id)
  }

  return (
    <div className={styles.hub} dir="rtl" data-repairs-page="1">
      <header className={styles.hubHero}>
        <p className={styles.hubEyebrow}>صدرا · تعمیرات و سرویس</p>
        <h1>مدیریت تعمیرات و گزارش سرویس</h1>
        <p>
          ثبت درخواست، مشاهده تیم اعزامی، اجرت خدمات و پیگیری وضعیت تعمیر
          دستگاه لیزر — همه در یک صفحه
        </p>
      </header>

      <div className={styles.hubTabs} role="tablist" aria-label="بخش‌های تعمیرات">
        {TABS.map((t) => {
          const Icon = t.icon
          const on = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              className={`${styles.hubTab} ${on ? styles.hubTabOn : ''}`}
              onClick={() => selectTab(t.id)}
            >
              <Icon size={16} strokeWidth={2.25} aria-hidden />
              {t.label}
            </button>
          )
        })}
      </div>

      <div className={styles.hubBody}>
        {tab === 'request' ? (
          <div className={styles.hubRequest}>
            <div>
              <RepairsRequestWidget settings={REQUEST_THEME} />
            </div>
            <aside>
              <div className={styles.asideCard}>
                <p className={styles.asideEyebrow}>راهنما</p>
                <strong>چطور درخواست بدم؟</strong>
                <ol className={styles.asideSteps}>
                  <li>اطلاعات دستگاه و آدرس را وارد کنید</li>
                  <li>درخواست را ثبت و پیش‌پرداخت را انجام دهید</li>
                  <li>تکنسین اعزامی و مراحل را از پیگیری ببینید</li>
                </ol>
              </div>
              <div className={styles.asideCard}>
                <p className={styles.asideEyebrow}>تیم سرویس</p>
                <strong>تعمیرکاران اعزامی</strong>
                <p className={styles.asideText}>
                  تخصص و شهر تکنسین‌های فعال صدرا را ببینید.
                </p>
                <button
                  type="button"
                  className={styles.asideLink}
                  onClick={() => selectTab('team')}
                >
                  <Users size={14} />
                  مشاهده تیم
                </button>
              </div>
              <div className={styles.asideCard}>
                <p className={styles.asideEyebrow}>پیگیری</p>
                <strong>سفارش قبلی دارید؟</strong>
                <p className={styles.asideText}>
                  با کد سفارش و موبایل، گزارش تعمیر و وضعیت را ببینید.
                </p>
                <button
                  type="button"
                  className={styles.asideLink}
                  onClick={() => selectTab('track')}
                >
                  <Search size={14} />
                  رفتن به پیگیری
                </button>
              </div>
            </aside>
          </div>
        ) : null}

        {tab === 'team' ? (
          <RepairsTechniciansWidget settings={TEAM_THEME} />
        ) : null}

        {tab === 'services' ? (
          <RepairsServicesWidget settings={SERVICES_THEME} />
        ) : null}

        {tab === 'track' ? (
          <div className={styles.hubTrack}>
            <RepairsTrackWidget settings={TRACK_THEME} />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function RepairsRequestPage() {
  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.REPAIRS} notFoundWhenInactive>
      <ModulePageShell pageKey="repairs">
        <RepairsPageInner />
      </ModulePageShell>
    </ModuleGate>
  )
}
