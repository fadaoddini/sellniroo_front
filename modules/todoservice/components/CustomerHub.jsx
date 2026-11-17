'use client'

import React from 'react'
import {
  RepairsRequestWidget,
  RepairsTrackWidget,
  RepairsCtaWidget,
  RepairsServicesWidget,
} from '@/components/Repairs/RepairsWidgets'
import { formatJalaliDate, formatJalaliShort } from '@/utils/dateUtils'
import { Bell, Check, MapPin, Wrench, X } from 'lucide-react'
import JobCard from './JobCard'
import { useTodoService } from '../context/TodoServiceContext'
import styles from '../styles/Board.module.css'

function shamsiDay(value) {
  if (!value) return '—'
  const day = String(value).slice(0, 10)
  return formatJalaliDate(day) || formatJalaliShort(day) || day
}

export default function CustomerHub() {
  const {
    myJobs,
    selectedJob,
    openJob,
    dueReminders,
    respondServiceReminder,
    busy,
  } = useTodoService()

  const reminders = Array.isArray(dueReminders) ? dueReminders : []

  return (
    <div className={styles.customerHub}>
      {reminders.length ? (
        <section className={styles.customerReminderPanel}>
          <div className={styles.customerReminderHead}>
            <span className={styles.customerReminderIcon}>
              <Bell size={16} />
            </span>
            <div>
              <h3>نوبت سرویس دوره‌ای رسیده</h3>
              <p>
                موعد سرویس دستگاه‌تان فرا رسیده. آیا می‌خواهید سرویسکار مراجعه
                کند؟
              </p>
            </div>
          </div>
          <div className={styles.customerReminderList}>
            {reminders.map((item) => (
              <article key={item.id} className={styles.customerReminderCard}>
                <div className={styles.customerReminderMeta}>
                  <strong>
                    <Wrench size={13} />
                    {item.title || 'دستگاه'}
                  </strong>
                  {(item.brand || item.model) && (
                    <span>
                      {[item.brand, item.model].filter(Boolean).join(' · ')}
                    </span>
                  )}
                  <span>
                    موعد: {shamsiDay(item.next_service_at)}
                    {item.is_due_today
                      ? ' · امروز'
                      : item.days_overdue
                        ? ` · ${Number(item.days_overdue).toLocaleString('fa-IR')} روز تأخیر`
                        : ''}
                  </span>
                  {(item.city || item.address) && (
                    <span>
                      <MapPin size={12} />
                      {[item.city, item.address].filter(Boolean).join(' — ')}
                    </span>
                  )}
                </div>
                <div className={styles.customerReminderActions}>
                  <button
                    type="button"
                    className={styles.intakeBtnPrimary}
                    disabled={busy}
                    onClick={() => respondServiceReminder(item.id, true)}
                  >
                    <Check size={14} />
                    بله، سرویسکار بیاید
                  </button>
                  <button
                    type="button"
                    className={styles.intakeBtnGhost}
                    disabled={busy}
                    onClick={() => respondServiceReminder(item.id, false)}
                  >
                    <X size={14} />
                    فعلاً نمی‌خواهم
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <div className={styles.widgetWrap}>
        <div className={styles.widgetHead}>
          <h3>ثبت درخواست سرویس</h3>
        </div>
        <RepairsRequestWidget settings={{}} />
      </div>

      <div className={styles.widgetWrap}>
        <div className={styles.widgetHead}>
          <h3>پیگیری سفارش</h3>
        </div>
        <RepairsTrackWidget settings={{}} />
      </div>

      <div className={styles.formRow}>
        <div className={styles.widgetWrap}>
          <RepairsCtaWidget settings={{}} />
        </div>
        <div className={styles.widgetWrap}>
          <RepairsServicesWidget settings={{}} />
        </div>
      </div>

      <section className={styles.section}>
        <h3>سفارش‌های من</h3>
        {(Array.isArray(myJobs) ? myJobs : []).length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {(Array.isArray(myJobs) ? myJobs : []).map((job) => (
              <JobCard
                key={job.id}
                job={job}
                active={selectedJob?.id === job.id}
                onOpen={openJob}
              />
            ))}
          </div>
        ) : (
          <p className={styles.hint}>هنوز سفارشی ثبت نشده است.</p>
        )}
      </section>
    </div>
  )
}
