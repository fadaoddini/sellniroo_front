'use client'

import React from 'react'
import { MapPin, Smartphone, User, UserCog, Wrench } from 'lucide-react'
import { formatJalaliShort } from '@/utils/dateUtils'
import styles from '../styles/Board.module.css'

const FIELD_STATUSES = new Set(['assigned', 'visited'])

export default function JobCard({ job, active, onOpen }) {
  if (!job) return null
  const isField = FIELD_STATUSES.has(job.status)
  const techName = job.technician_name || null

  return (
    <button
      type="button"
      className={`${styles.card} ${active ? styles.cardOn : ''} ${
        isField ? styles.cardField : ''
      }`}
      data-tour="ts-card"
      onClick={() => onOpen?.(job.id || job.tracking_token)}
    >
      <div className={styles.cardTop}>
        <p className={styles.cardCode}>{job.code || '—'}</p>
        <span className={styles.statusBadge}>{job.status_label || job.status}</span>
      </div>
      <div className={styles.cardMeta}>
        {job.customer_name ? (
          <span>
            <User size={11} />
            {job.customer_name}
            {job.customer_mobile ? (
              <>
                {' · '}
                <span dir="ltr">{job.customer_mobile}</span>
              </>
            ) : null}
          </span>
        ) : null}
        {job.city ? (
          <span>
            <MapPin size={11} />
            {job.city}
          </span>
        ) : null}
        {job.device_title ? (
          <span>
            <Wrench size={11} />
            {job.device_title}
          </span>
        ) : job.customer_request ? (
          <span>
            <Smartphone size={11} />
            {job.customer_request}
          </span>
        ) : null}
      </div>
      {isField || techName ? (
        <div className={`${styles.cardTech} ${techName ? '' : styles.cardTechEmpty}`}>
          <UserCog size={11} />
          <span>{techName || 'بدون سرویسکار'}</span>
        </div>
      ) : null}
      {job.deposit_deferred && !job.deposit_paid ? (
        <div className={styles.cardDefer}>بیعانه موکول‌شده</div>
      ) : job.deposit_paid ? (
        <div className={styles.cardPayOk}>بیعانه پرداخت‌شده</div>
      ) : null}
      {job.warranty_until ? (
        <div
          className={
            job.warranty_status === 'expired'
              ? styles.cardDefer
              : styles.cardPayOk
          }
        >
          گارانتی تا{' '}
          {formatJalaliShort(String(job.warranty_until).slice(0, 10)) ||
            String(job.warranty_until).slice(0, 10)}
          {job.warranty_status === 'expired' ? ' · منقضی' : ''}
        </div>
      ) : null}
      {job.next_service_at ? (
        <div
          className={
            job.service_reminder_status === 'overdue'
              ? styles.cardDefer
              : styles.cardPayOk
          }
        >
          سرویس بعدی{' '}
          {formatJalaliShort(String(job.next_service_at).slice(0, 10)) ||
            String(job.next_service_at).slice(0, 10)}
          {job.service_reminder_status === 'overdue' ? ' · گذشته' : ''}
        </div>
      ) : null}
    </button>
  )
}