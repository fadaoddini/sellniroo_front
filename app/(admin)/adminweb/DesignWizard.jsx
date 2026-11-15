'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Check, Circle, Compass, LayoutTemplate } from 'lucide-react'
import styles from './AdminWeb.module.css'

const STEPS = [
  {
    id: 'home',
    label: 'طراحی قالب',
    hint: 'خانه را از صفر بچینید',
    href: '/adminsettings?tab=home&wizard=1',
  },
  {
    id: 'pages',
    label: 'صفحات داخلی',
    hint: 'درباره، تماس، سرور ابری و…',
    href: '/adminsettings?tab=pages&wizard=1',
  },
  {
    id: 'shop',
    label: 'طراحی فروشگاه',
    hint: 'لیست و سینگل محصول',
    href: '/adminsettings?tab=shop&wizard=1',
    moduleKey: 'shop',
  },
  {
    id: 'jobs',
    label: 'طراحی کاریابی',
    hint: 'سینگل آگهی',
    href: '/adminsettings?tab=jobs&wizard=1',
    moduleKey: 'job_board',
  },
  {
    id: 'news',
    label: 'طراحی اخبار',
    hint: 'لیست و سینگل خبر',
    href: '/adminsettings?tab=news&wizard=1',
    moduleKey: 'news',
  },
  {
    id: 'profile',
    label: 'چیدمان پروفایل',
    hint: 'بخش‌های پروفایل همین سیستم',
    href: '/adminsettings?tab=profile&wizard=1',
  },
  {
    id: 'checkout',
    label: 'سفارش و سبد',
    hint: 'مسیر خرید / رزرو',
    href: '/adminsettings?tab=checkout&wizard=1',
  },
  {
    id: 'corporate',
    label: 'ظاهر شرکتی',
    hint: 'رنگ هدر و موبایل',
    href: '/adminsettings?tab=corporate&wizard=1',
  },
]

function storageKey(packKey) {
  return `rebo_design_wizard_v1:${packKey || 'none'}`
}

function readDone(packKey) {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(storageKey(packKey))
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export default function DesignWizard({
  packKey,
  packName,
  compact = false,
  defaultOpen = false,
  moduleMap = {},
}) {
  const [open, setOpen] = useState(!!defaultOpen)
  const [done, setDone] = useState({})

  useEffect(() => {
    setDone(readDone(packKey))
  }, [packKey])

  const persist = useCallback(
    (next) => {
      setDone(next)
      if (typeof window === 'undefined') return
      window.localStorage.setItem(storageKey(packKey), JSON.stringify(next))
    },
    [packKey],
  )

  const toggle = (id) => {
    persist({ ...done, [id]: !done[id] })
  }

  const steps = useMemo(
    () =>
      STEPS.filter((s) => !s.moduleKey || !!moduleMap[s.moduleKey]),
    [moduleMap],
  )
  const completed = useMemo(
    () => steps.filter((s) => done[s.id]).length,
    [done, steps],
  )
  const allDone = steps.length > 0 && completed === steps.length

  if (!packKey) return null

  return (
    <section
      className={`${styles.designWizard} ${compact ? styles.designWizardCompact : ''}`}
    >
      <div className={styles.designWizardHead}>
        <span className={styles.designWizardIcon} aria-hidden>
          <Compass size={16} />
        </span>
        <div>
          <strong>طراحی قالب</strong>
          <p>
            گام‌به‌گام برای «{packName || 'این سیستم'}» — {completed} از{' '}
            {steps.length} انجام شد
          </p>
        </div>
        <button
          type="button"
          className={styles.designWizardToggle}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'بستن' : 'شروع / ادامه'}
        </button>
      </div>

      {open ? (
        <>
          <ol className={styles.designWizardSteps}>
            {steps.map((step, idx) => {
              const on = !!done[step.id]
              return (
                <li
                  key={step.id}
                  className={on ? styles.designWizardStepOn : ''}
                >
                  <button
                    type="button"
                    className={styles.designWizardCheck}
                    onClick={() => toggle(step.id)}
                    aria-label={on ? 'انجام‌شده' : 'علامت به‌عنوان انجام‌شده'}
                  >
                    {on ? <Check size={14} /> : <Circle size={14} />}
                    <span>{idx + 1}</span>
                  </button>
                  <div>
                    <strong>{step.label}</strong>
                    <small>{step.hint}</small>
                  </div>
                  <Link href={step.href} className={styles.designWizardGo}>
                    <LayoutTemplate size={13} />
                    باز کردن
                  </Link>
                </li>
              )
            })}
          </ol>
          {allDone ? (
            <p className={styles.designWizardDone}>
              همه گام‌ها تیک خورده‌اند. اگر جایی خالی ماند، همان تب را دوباره باز
              کنید.
            </p>
          ) : (
            <p className={styles.designWizardHint}>
              هر بخش را بسازید و تیک بزنید تا مطمئن شوید چیزی جا نمانده. ویرایشگرها
              همان صفحات قبلی هستند؛ چیزی خراب نمی‌شود.
            </p>
          )}
        </>
      ) : null}
    </section>
  )
}
