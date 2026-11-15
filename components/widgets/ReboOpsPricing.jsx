'use client'

import React from 'react'
import { Headphones, ShieldCheck, Sparkles } from 'lucide-react'
import { formatMoney, normalizeSupport } from '@/config/reboPricing'
import fallbackStyles from '@/components/widgets/rebo/ReboOps.module.css'

const PLAN_ACCENTS = ['#1f9d78', '#0d9488', '#3b82f6', '#7c3aed']

export default function ReboOpsPricing({ pricing, styles: stylesProp }) {
  const styles = stylesProp || fallbackStyles
  const support = normalizeSupport(pricing?.support)
  const currency = support.currency_label || 'تومان'
  const plans = support.plans || []

  return (
    <div className={styles.supportOnly}>
      <div className={styles.supportFreeBanner}>
        <span className={styles.supportFreePill}>
          <Sparkles size={14} strokeWidth={2.2} />
          {support.free_months.toLocaleString('fa-IR')} ماه رایگان
        </span>
        <p>
          پس از تحویل،{' '}
          <strong>
            {support.free_months.toLocaleString('fa-IR')} ماه پشتیبانی رایگان
          </strong>{' '}
          دارید؛ سپس یکی از پلن‌های ماهانه را انتخاب کنید.
        </p>
      </div>

      <div className={styles.supportPlans}>
        {plans.map((plan, idx) => {
          const accent = PLAN_ACCENTS[idx % PLAN_ACCENTS.length]
          const featured = !!plan.featured
          return (
            <article
              key={plan.id}
              className={`${styles.supportPlanCard}${
                featured ? ` ${styles.supportPlanFeatured}` : ''
              }`}
              style={{ '--accent': accent }}
            >
              {featured ? (
                <span className={styles.supportPlanTag}>پیشنهادی</span>
              ) : null}
              <span className={styles.supportPlanIcon}>
                <Headphones size={16} strokeWidth={1.85} />
              </span>
              <h3>{plan.name}</h3>
              <p className={styles.supportPlanHint}>
                {idx === 0
                  ? 'پشتیبانی مبتدی'
                  : idx === plans.length - 1
                    ? 'پشتیبانی حرفه‌ای'
                    : 'سطح میانی پشتیبانی'}
              </p>
              <strong className={styles.supportPlanPrice}>
                {formatMoney(plan.monthly_price, currency)}
                <em>/ ماه</em>
              </strong>
            </article>
          )
        })}
      </div>

      <p className={styles.supportAssureNote}>
        <ShieldCheck size={15} strokeWidth={2} />
        {support.notes ||
          'نگران به‌روزرسانی و تغییرات قالب و بک‌اند نباشید.'}
      </p>
    </div>
  )
}
