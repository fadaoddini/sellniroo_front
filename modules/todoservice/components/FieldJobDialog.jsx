'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ExternalLink,
  MapPin,
  Phone,
  Search,
  User,
  UserCog,
  Wrench,
  X,
} from 'lucide-react'
import { useTodoService } from '../context/TodoServiceContext'
import styles from '../styles/Board.module.css'

const FIELD_STATUSES = new Set(['assigned', 'visited'])

export function isFieldJob(job) {
  return !!(job && FIELD_STATUSES.has(job.status))
}

export default function FieldJobDialog() {
  const {
    selectedJob,
    closeJob,
    role,
    busy,
    technicians,
    assignTech,
  } = useTodoService()

  const job = selectedJob
  const [mounted, setMounted] = useState(false)
  const [techId, setTechId] = useState('')
  const [techQuery, setTechQuery] = useState('')
  const [changing, setChanging] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!job) return
    setTechId(job.technician ? String(job.technician) : '')
    setTechQuery('')
    setChanging(false)
  }, [job?.id])

  const activeTechs = useMemo(() => {
    const list = (technicians || []).filter((t) => t.is_active !== false)
    const q = techQuery.trim().toLowerCase()
    if (!q) return list
    return list.filter((t) => {
      const hay = [t.name, t.specialty, t.city, t.mobile]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [technicians, techQuery])

  const selectedTech = useMemo(() => {
    if (!job) return null
    return (
      (technicians || []).find((t) => String(t.id) === String(job.technician)) ||
      (job.technician_name
        ? { id: job.technician, name: job.technician_name }
        : null)
    )
  }, [job, technicians])

  if (role !== 'admin' || !job || !isFieldJob(job) || !mounted) return null

  const addressLine = [job.city, job.address].filter(Boolean).join(' — ') || '—'
  const canSave =
    !!techId &&
    !busy &&
    String(techId) !== String(job.technician || '')

  const dialog = (
    <div
      className={styles.modalOverlay}
      onClick={closeJob}
      role="presentation"
    >
      <div
        className={styles.modalCard}
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="field-title"
      >
        <header className={styles.modalHead}>
          <div>
            <p className={styles.modalEyebrow}>پرونده اعزام</p>
            <h2 id="field-title">
              {job.code}
              <span className={styles.intakeBadge}>
                {job.status_label || job.status}
              </span>
            </h2>
          </div>
          <button
            type="button"
            className={styles.intakeClose}
            onClick={closeJob}
            aria-label="بستن"
          >
            <X size={16} />
          </button>
        </header>

        <div className={styles.modalBody}>
          <article className={`${styles.intakeCard} ${styles.intakeCardSlim}`}>
            <div className={styles.intakeSlimRow}>
              <User size={13} className={styles.intakeSlimIcon} />
              <span className={styles.intakeSlimName}>
                {job.customer_name || '—'}
              </span>
              <span className={styles.intakeSlimDot} aria-hidden>
                ·
              </span>
              <span className={styles.intakeSlimPhone} dir="ltr">
                <Phone size={11} />
                {job.customer_mobile || '—'}
              </span>
            </div>
            <div className={styles.intakeSlimRow}>
              <MapPin size={13} className={styles.intakeSlimIcon} />
              <span className={styles.intakeSlimAddr}>{addressLine}</span>
            </div>
          </article>

          <article
            className={`${styles.intakeCard} ${styles.intakeCardSlim} ${styles.intakeCardSlimGold}`}
          >
            <div className={styles.intakeSlimRow}>
              <Wrench size={13} className={styles.intakeSlimIconGold} />
              <span className={styles.intakeSlimLabel}>دستگاه</span>
              <span className={styles.intakeSlimValue}>
                {job.device_title || '—'}
              </span>
            </div>
            <div className={styles.intakeSlimRow}>
              <span className={styles.intakeSlimLabel}>درخواست</span>
              <span
                className={styles.intakeSlimValue}
                title={job.customer_request || ''}
              >
                {job.customer_request || '—'}
              </span>
            </div>
          </article>

          {/* سرویسکار فعلی */}
          <section className={styles.fieldTechBanner}>
            <div className={styles.fieldTechBannerTop}>
              <UserCog size={15} />
              <strong>سرویسکار اعزامی</strong>
            </div>
            {selectedTech ? (
              <div className={styles.fieldTechCurrent}>
                <span className={styles.fieldTechAvatar}>
                  {(selectedTech.name || '?').charAt(0)}
                </span>
                <div className={styles.fieldTechInfo}>
                  <span className={styles.fieldTechName}>
                    {selectedTech.name}
                  </span>
                  <span className={styles.fieldTechMeta}>
                    {[selectedTech.specialty, selectedTech.city, selectedTech.mobile]
                      .filter(Boolean)
                      .join(' · ') || 'تخصیص‌یافته'}
                  </span>
                </div>
                {!changing ? (
                  <button
                    type="button"
                    className={styles.intakeBtnGhost}
                    onClick={() => setChanging(true)}
                  >
                    تغییر
                  </button>
                ) : null}
              </div>
            ) : (
              <p className={styles.intakeHintWarn}>سرویسکاری تخصیص نشده است.</p>
            )}
          </section>

          {changing || !selectedTech ? (
            <section className={styles.intakeTechBlock}>
              <div className={styles.intakeCardHead}>
                <span className={styles.intakeCardIcon}>
                  <UserCog size={14} />
                </span>
                <h3>{selectedTech ? 'تعویض سرویسکار' : 'انتخاب سرویسکار'}</h3>
              </div>
              <div className={styles.techSearch}>
                <Search size={14} />
                <input
                  value={techQuery}
                  onChange={(e) => setTechQuery(e.target.value)}
                  placeholder="جستجو نام، تخصص، شهر…"
                  autoComplete="off"
                />
              </div>
              <div className={styles.techList}>
                {activeTechs.map((t) => {
                  const on = String(techId) === String(t.id)
                  const meta = [t.specialty, t.city].filter(Boolean).join(' · ')
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`${styles.techRow} ${on ? styles.techRowOn : ''}`}
                      onClick={() => setTechId(String(t.id))}
                    >
                      <span className={styles.techRowRadio} aria-hidden />
                      <span className={styles.techRowMain}>
                        <span className={styles.techRowName}>{t.name}</span>
                        {meta ? (
                          <span className={styles.techRowMeta}>{meta}</span>
                        ) : null}
                      </span>
                      {t.mobile ? (
                        <span className={styles.techRowMobile} dir="ltr">
                          {t.mobile}
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </section>
          ) : null}

          {job.tracking_token ? (
            <a
              href={`/repairs/track/${job.tracking_token}`}
              target="_blank"
              rel="noreferrer"
              className={styles.fieldTrackLink}
            >
              <ExternalLink size={13} />
              دید مشتری / پیگیری
            </a>
          ) : null}
        </div>

        <footer className={styles.modalFoot}>
          {changing ? (
            <button
              type="button"
              className={styles.intakeBtnGhost}
              onClick={() => {
                setChanging(false)
                setTechId(job.technician ? String(job.technician) : '')
              }}
            >
              انصراف از تغییر
            </button>
          ) : (
            <button type="button" className={styles.intakeBtnGhost} onClick={closeJob}>
              بستن
            </button>
          )}
          {changing || !selectedTech ? (
            <button
              type="button"
              className={styles.intakeBtnPrimary}
              disabled={!canSave}
              onClick={async () => {
                if (!techId) return
                await assignTech(techId)
                setChanging(false)
              }}
            >
              {busy ? 'در حال ذخیره…' : 'ذخیره سرویسکار'}
            </button>
          ) : null}
        </footer>
      </div>
    </div>
  )

  return createPortal(dialog, document.body)
}
