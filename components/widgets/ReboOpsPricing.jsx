'use client'

import React from 'react'
import {
  ArrowLeft,
  Cloud,
  Headphones,
  MapPin,
  MessageSquare,
  Server,
  ShieldCheck,
} from 'lucide-react'
import {
  cloudMonthlyEstimate,
  formatMoney,
  normalizeCloudServer,
  normalizeCustomerServices,
  normalizeSupport,
} from '@/config/reboPricing'
import fallbackStyles from '@/components/widgets/rebo/ReboOps.module.css'

const SERVICE_ICONS = {
  sms: MessageSquare,
  neshan: MapPin,
}

export default function ReboOpsPricing({ pricing, styles: stylesProp }) {
  const styles = stylesProp || fallbackStyles
  const support = normalizeSupport(pricing?.support)
  const cloud = normalizeCloudServer(pricing?.cloud_server)
  const services = normalizeCustomerServices(pricing?.customer_services).filter(
    (s) => s.enabled !== false,
  )

  const supportCurrency = support.currency_label || 'تومان'
  const cloudCurrency = cloud.currency_label || 'تومان'
  const monthlyCloud = cloudMonthlyEstimate(cloud.daily_price)

  return (
    <div className={styles.grid}>
      <article className={styles.card}>
        <div className={styles.cardHead}>
          <span className={styles.icon}>
            <Headphones size={20} strokeWidth={1.75} />
          </span>
          <div>
            <h3>{support.title}</h3>
            {support.desc ? <p>{support.desc}</p> : null}
          </div>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <strong className={styles.statStrong}>
              {support.free_months.toLocaleString('fa-IR')}
              <em> ماه</em>
            </strong>
            <span className={styles.statLabel}>پشتیبانی رایگان پس از تحویل</span>
          </div>
          <div className={styles.stat}>
            <strong className={styles.statStrong}>
              {formatMoney(support.monthly_price, supportCurrency)}
            </strong>
            <span className={styles.statLabel}>
              هزینه هر ماه بعد از پایان دوره رایگان
            </span>
          </div>
        </div>
        {support.notes ? (
          <p className={styles.note}>
            <ShieldCheck size={14} /> {support.notes}
          </p>
        ) : null}
      </article>

      {cloud.enabled ? (
        <article className={`${styles.card} ${styles.cardCloud}`}>
          <div className={styles.cardHead}>
            <span className={styles.icon}>
              <Cloud size={20} strokeWidth={1.75} />
            </span>
            <div>
              <h3>{cloud.title}</h3>
              {cloud.desc ? <p>{cloud.desc}</p> : null}
            </div>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <strong className={styles.statStrong}>
                {formatMoney(cloud.daily_price, cloudCurrency)}
              </strong>
              <span className={styles.statLabel}>هزینه روزانه سرور ابری</span>
            </div>
            <div className={styles.stat}>
              <strong className={styles.statStrong}>
                {formatMoney(monthlyCloud, cloudCurrency)}
              </strong>
              <span className={styles.statLabel}>
                برآورد تقریبی ماهانه (۳۰ روز)
              </span>
            </div>
          </div>
          {cloud.specs?.length ? (
            <ul className={styles.specs}>
              {cloud.specs.map((s) => (
                <li key={s.id}>
                  <Server size={14} />
                  <strong>{s.label}:</strong>
                  <span>{s.value}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {cloud.notes ? <p className={styles.note}>{cloud.notes}</p> : null}
          <a href="#rebo-cloud-order" className={styles.cta}>
            ثبت سفارش سرور ابری
            <ArrowLeft size={14} />
          </a>
        </article>
      ) : null}

      {services.length ? (
        <article className={`${styles.card} ${styles.cardWide}`}>
          <div className={styles.cardHead}>
            <span className={styles.icon}>
              <MessageSquare size={20} strokeWidth={1.75} />
            </span>
            <div>
              <h3>خدمات بر عهده مشتری</h3>
              <p>
                این موارد جدا از هزینه راه‌اندازی سایت است و معمولاً توسط خود
                مشتری تأمین می‌شود.
              </p>
            </div>
          </div>
          <div className={styles.serviceGrid}>
            {services.map((s) => {
              const Icon = SERVICE_ICONS[s.id] || MapPin
              return (
                <div key={s.id} className={styles.service}>
                  <span className={styles.serviceIcon}>
                    <Icon size={16} />
                  </span>
                  <div>
                    <strong>{s.name}</strong>
                    {s.desc ? <small>{s.desc}</small> : null}
                    <em>
                      {s.price > 0
                        ? formatMoney(s.price, supportCurrency)
                        : s.unit || 'طبق تعرفه ارائه‌دهنده'}
                      {s.note ? ` · ${s.note}` : ''}
                    </em>
                  </div>
                </div>
              )
            })}
          </div>
        </article>
      ) : null}
    </div>
  )
}
