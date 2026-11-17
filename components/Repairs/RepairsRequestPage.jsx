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
import { SADRA_PALETTE } from '@/config/sadraTheme'
import styles from './Repairs.module.css'

/** پالت صدرا — جنگل / زیتون / شن / کرم */
const THEME = {
  ink: SADRA_PALETTE.forest,
  muted: SADRA_PALETTE.sage,
  eyebrow_color: SADRA_PALETTE.sage,
  accent: SADRA_PALETTE.sand,
  accent_deep: SADRA_PALETTE.forest,
  panel_from: SADRA_PALETTE.cream,
  panel_to: SADRA_PALETTE.white,
  panel_border: 'color-mix(in srgb, #7F8C6A 28%, transparent)',
  input_border: 'color-mix(in srgb, #7F8C6A 32%, transparent)',
  input_bg: SADRA_PALETTE.white,
  button_from: SADRA_PALETTE.forest,
  button_to: '#163028',
  button_text: SADRA_PALETTE.cream,
  card_bg: SADRA_PALETTE.white,
  card_border: 'color-mix(in srgb, #7F8C6A 26%, transparent)',
  avatar_from: SADRA_PALETTE.sand,
  avatar_to: SADRA_PALETTE.sage,
  avatar_text: SADRA_PALETTE.forest,
  cta_color: SADRA_PALETTE.forest,
  margin_top: 0,
  margin_bottom: 0,
}

const REQUEST_THEME = {
  ...THEME,
  eyebrow_text: 'تعمیر در محل',
  title: 'فرم درخواست تعمیر',
  subtitle: 'مشخصات دستگاه و آدرس را پر کنید تا نوبت بازدید ثبت شود',
  show_panel: true,
  show_eyebrow: true,
  show_deposit_hint: true,
  show_brand_fields: true,
  show_serial: true,
  submit_label: 'ثبت درخواست و پرداخت رزرو',
  max_width: 720,
}

const TEAM_THEME = {
  ...THEME,
  eyebrow_text: 'تکنسین‌ها',
  title: 'تکنسین‌های فعال',
  subtitle: 'افرادی که برای تعمیر دستگاه به محل شما اعزام می‌شوند',
  show_eyebrow: true,
  show_specialty: true,
  show_city: true,
  show_avatar: true,
  card_lift: false,
  card_bg: 'transparent',
  card_border: 'rgba(127, 140, 106, 0.26)',
  card_padding: 8,
  card_radius: 10,
  card_min: 220,
  avatar_size: 42,
  name_size: 12,
  title_size: 16,
  subtitle_size: 12,
  gap: 8,
  columns: 3,
  section_full: true,
  max_width: 1200,
  padding_top: 0,
  padding_right: 0,
  padding_bottom: 0,
  padding_left: 0,
  margin_top: 0,
  margin_right: 0,
  margin_bottom: 0,
  margin_left: 0,
  limit: 16,
}

const SERVICES_THEME = {
  ...THEME,
  eyebrow_text: 'تعرفه',
  title: 'هزینه خدمات',
  subtitle: 'اجرت تقریبی است؛ مبلغ نهایی بعد از بازدید اعلام می‌شود',
  show_eyebrow: true,
  show_unit: true,
  show_desc: true,
  show_price: true,
  show_cta: true,
  show_dot: false,
  card_lift: false,
  card_bg: '#ffffff',
  card_border: 'rgba(127, 140, 106, 0.22)',
  card_padding: 12,
  card_radius: 12,
  card_min: 240,
  title_size: 16,
  subtitle_size: 12,
  gap: 10,
  cta_label: 'درخواست تعمیر',
  link_base: '/repairs?tab=request',
  columns: 3,
  section_full: true,
  max_width: 1200,
  padding_top: 0,
  padding_right: 0,
  padding_bottom: 0,
  padding_left: 0,
  margin_top: 0,
  margin_right: 0,
  margin_bottom: 0,
  margin_left: 0,
  limit: 24,
}

const TRACK_THEME = {
  ...THEME,
  eyebrow_text: 'پیگیری سفارش',
  title: 'وضعیت تعمیر من',
  subtitle:
    'کد سفارش و موبایل ثبت‌شده را وارد کنید تا وضعیت فعلی نمایش داده شود',
  show_panel: true,
  show_eyebrow: true,
  panel_shadow: false,
  code_label: 'کد سفارش',
  mobile_label: 'شماره موبایل',
  submit_label: 'نمایش وضعیت',
  code_placeholder: 'مثلاً R-1403-001',
  mobile_placeholder: '09xxxxxxxxx',
  result_bg: '#ffffff',
  panel_from: '#ffffff',
  panel_to: '#ffffff',
  panel_border: 'rgba(127, 140, 106, 0.22)',
  title_size: 16,
  subtitle_size: 12,
  panel_radius: 14,
  panel_padding: 16,
  section_full: true,
  max_width: 720,
  margin_top: 0,
  margin_bottom: 0,
}

const TABS = [
  { id: 'request', label: 'درخواست تعمیر', icon: Wrench },
  { id: 'team', label: 'تکنسین‌ها', icon: Users },
  { id: 'services', label: 'هزینه خدمات', icon: ClipboardList },
  { id: 'track', label: 'پیگیری سفارش', icon: Search },
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
        <p className={styles.hubEyebrow}>تعمیر دستگاه لیزر</p>
        <h1>درخواست تعمیر در محل</h1>
        <p>
          دستگاه خراب شده؟ درخواست بدهید، تکنسین اعزام می‌شود و وضعیت را
          همین‌جا پیگیری کنید.
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
                <p className={styles.asideEyebrow}>مراحل کار</p>
                <strong>از درخواست تا تعمیر</strong>
                <ol className={styles.asideSteps}>
                  <li>فرم را پر کنید و مبلغ رزرو را بپردازید</li>
                  <li>تکنسین برای بازدید به آدرس شما می‌آید</li>
                  <li>تعمیر انجام می‌شود و نتیجه را آنلاین می‌بینید</li>
                </ol>
              </div>
              <div className={styles.asideCard}>
                <p className={styles.asideEyebrow}>تکنسین</p>
                <strong>چه کسی می‌آید؟</strong>
                <p className={styles.asideText}>
                  لیست تکنسین‌های فعال و تخصص‌شان را ببینید.
                </p>
                <button
                  type="button"
                  className={styles.asideLink}
                  onClick={() => selectTab('team')}
                >
                  <Users size={14} />
                  مشاهده تکنسین‌ها
                </button>
              </div>
              <div className={styles.asideCard}>
                <p className={styles.asideEyebrow}>پیگیری</p>
                <strong>قبلاً درخواست داده‌اید؟</strong>
                <p className={styles.asideText}>
                  با کد سفارش و موبایل، وضعیت فعلی را ببینید.
                </p>
                <button
                  type="button"
                  className={styles.asideLink}
                  onClick={() => selectTab('track')}
                >
                  <Search size={14} />
                  پیگیری سفارش
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
