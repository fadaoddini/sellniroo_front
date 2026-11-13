'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Archive,
  ArchiveRestore,
  Check,
  ImageIcon,
  RefreshCw,
  RotateCcw,
  Search,
  X,
} from 'lucide-react'
import schoolService from '@/components/School/services/schoolService'
import styles from './School.module.css'

const APPROVE_PRESETS = [
  '🌟 آفرین! خیلی عالی انجام دادی.',
  '👏 کارت تمیز و کامل بود، دمت گرم!',
  '✨ پیشرفت عالی داشتی، ادامه بده.',
  '💪 درست و با دقت نوشته بودی.',
]
const REJECT_PRESETS = [
  '📷 لطفاً تصویر واضح‌تری دوباره بفرست.',
  '✏️ تکلیف ناقص است؛ بخش‌های باقی‌مانده را کامل کن.',
  '🔍 با دقت بیشتر حل کن و مجدد ارسال کن.',
  '📝 پاسخ با صورت‌سؤال هم‌خوان نیست؛ دوباره بفرست.',
]

function faNum(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString('fa-IR')
}

function TodoCard({
  item,
  tone = 'pending',
  onOpen,
  onAskArchive,
  onAskUnarchive,
  onAskReopen,
  onPreview,
}) {
  const isRejected = tone === 'rejected' || item.status === 'rejected'
  const isApproved = tone === 'reviewed' || item.status === 'approved'
  const simple = tone === 'pending' || tone === 'rejected'
  const managed = tone === 'reviewed' || tone === 'archived'

  if (simple) {
    const locked = tone === 'rejected'
    const className = [
      styles.hwTodoCard,
      styles.hwTodoCardSimple,
      styles[`hwTodoCard_${tone}`] || '',
      locked ? styles.hwTodoCardLocked : '',
    ].filter(Boolean).join(' ')

    const line = (
      <>
        <div className={styles.hwTodoCheck} aria-hidden>
          {locked ? <X size={12} strokeWidth={2.6} /> : <span />}
        </div>
        <div className={styles.hwTodoLine}>
          <strong className={styles.hwTodoName}>{item.student_name || 'دانش‌آموز'}</strong>
          <span className={styles.hwTodoDot} aria-hidden>·</span>
          <em className={styles.hwTodoTitle}>{item.exercise_title || 'تکلیف'}</em>
          {locked ? (
            <span className={styles.hwTodoWait}>منتظر ارسال مجدد</span>
          ) : null}
        </div>
      </>
    )

    if (locked) {
      return (
        <article
          className={className}
          role="listitem"
          title="منتظر ارسال دوباره دانش‌آموز"
        >
          {line}
        </article>
      )
    }

    return (
      <button
        type="button"
        className={className}
        role="listitem"
        onClick={() => onOpen?.(item)}
      >
        {line}
      </button>
    )
  }

  return (
    <article
      className={[
        styles.hwTodoCard,
        styles[`hwTodoCard_${tone}`] || '',
        managed ? styles.hwTodoCardManaged : '',
      ].filter(Boolean).join(' ')}
      role="listitem"
    >
      <div className={styles.hwTodoCheck} aria-hidden>
        {tone === 'reviewed' || (tone === 'archived' && isApproved) ? (
          <Check size={14} strokeWidth={2.6} />
        ) : tone === 'archived' && isRejected ? (
          <X size={14} strokeWidth={2.6} />
        ) : (
          <span />
        )}
      </div>

      <div className={styles.hwTodoBody}>
        <div className={styles.hwTodoTop}>
          <strong>{item.student_name || 'دانش‌آموز'}</strong>
          {tone === 'reviewed' || (tone === 'archived' && isApproved) ? (
            <em className={styles.hwTodoBadgeOk}>تأیید</em>
          ) : null}
          {tone === 'archived' && isRejected ? (
            <em className={styles.hwTodoBadgeNo}>رد</em>
          ) : null}
        </div>
        <p className={styles.hwTodoTitle}>
          {item.exercise_title || 'تکلیف'}
          {item.lesson_title ? ` · ${item.lesson_title}` : ''}
          {item.score != null ? (
            <span className={Number(item.score) >= 0 ? styles.hwScoreChipPos : styles.hwScoreChipNeg}>
              {Number(item.score) > 0 ? ` +${item.score}` : ` ${item.score}`}
            </span>
          ) : null}
        </p>
        {item.teacher_note ? (
          <p className={styles.hwTodoTeacherNote}>{item.teacher_note}</p>
        ) : null}
      </div>

      <div className={styles.hwTodoActions}>
        {item.proof_url && !isRejected ? (
          <button
            type="button"
            className={styles.hwTodoThumb}
            onClick={() => onPreview?.(item.proof_url)}
            title="مشاهده تصویر"
          >
            <img src={item.proof_url} alt="" />
          </button>
        ) : item.proof_url && isRejected ? (
          <span className={`${styles.hwTodoThumb} ${styles.hwTodoThumbLocked}`} title="تا ارسال مجدد قابل مشاهده نیست">
            <img src={item.proof_url} alt="" />
          </span>
        ) : (
          <span className={styles.hwTodoThumbEmpty}>
            <ImageIcon size={13} />
          </span>
        )}
      </div>

      {managed ? (
        <div className={styles.hwTodoCorner}>
          {tone === 'reviewed' ? (
            <>
              <button
                type="button"
                className={`${styles.hwCornerBtn} ${styles.hwCornerBtnReopen}`}
                onClick={() => onAskReopen?.(item)}
                title="بررسی مجدد"
                aria-label="بررسی مجدد"
              >
                <RotateCcw size={15} strokeWidth={2.3} />
              </button>
              <button
                type="button"
                className={`${styles.hwCornerBtn} ${styles.hwCornerBtnArchive}`}
                onClick={() => onAskArchive?.(item)}
                title="آرشیو"
                aria-label="آرشیو"
              >
                <Archive size={15} strokeWidth={2.3} />
              </button>
            </>
          ) : null}
          {tone === 'archived' ? (
            <>
              <button
                type="button"
                className={`${styles.hwCornerBtn} ${styles.hwCornerBtnRestore}`}
                onClick={() => onAskUnarchive?.(item)}
                title="بازگردانی"
                aria-label="بازگردانی"
              >
                <ArchiveRestore size={15} strokeWidth={2.3} />
              </button>
              <button
                type="button"
                className={`${styles.hwCornerBtn} ${styles.hwCornerBtnReopen}`}
                onClick={() => onAskReopen?.(item)}
                title="بررسی مجدد"
                aria-label="بررسی مجدد"
              >
                <RotateCcw size={15} strokeWidth={2.3} />
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

const CONFIRM_META = {
  archive: {
    title: 'آرشیو تکلیف',
    desc: 'این تکلیف از ستون بررسی‌شده به آرشیو منتقل می‌شود.',
    confirm: 'بله، آرشیو شود',
    Icon: Archive,
    tone: 'archive',
  },
  unarchive: {
    title: 'بازگردانی از آرشیو',
    desc: 'تکلیف دوباره در ستون بررسی‌شده نمایش داده می‌شود.',
    confirm: 'بله، بازگردانی شود',
    Icon: ArchiveRestore,
    tone: 'restore',
  },
  reopen: {
    title: 'بررسی مجدد',
    desc: 'تکلیف به صف بررسی‌نشده برمی‌گردد تا دوباره بررسی کنید.',
    confirm: 'بله، بررسی مجدد',
    Icon: RotateCcw,
    tone: 'reopen',
  },
}

export default function HomeworkReviewPanel({
  submissions = [],
  onNotify,
  onDone,
  compact = false,
}) {
  const [pending, setPending] = useState(submissions || [])
  const [rejected, setRejected] = useState([])
  const [approved, setApproved] = useState([])
  const [archived, setArchived] = useState([])
  const [archiveQ, setArchiveQ] = useState('')
  const [loading, setLoading] = useState(!compact)
  const [reviewing, setReviewing] = useState(null)
  const [confirm, setConfirm] = useState(null) // { type, item }
  const [lightbox, setLightbox] = useState(null)
  const [note, setNote] = useState('')
  const [score, setScore] = useState(10)
  const [busy, setBusy] = useState(false)
  const [portalReady, setPortalReady] = useState(false)

  useEffect(() => {
    setPortalReady(true)
  }, [])

  const portal = (node) => {
    if (!node || !portalReady || typeof document === 'undefined') return null
    return createPortal(node, document.body)
  }

  const clampScore = (raw) => {
    const n = Math.round(Number(raw))
    if (!Number.isFinite(n)) return 0
    return Math.min(100, Math.max(-100, n))
  }

  const loadBoard = useCallback(async () => {
    if (compact) return
    setLoading(true)
    const [pRes, rejRes, okRes, aRes] = await Promise.all([
      schoolService.listSubmissions({ status: 'pending', archived: '0', limit: 200 }),
      schoolService.listSubmissions({ status: 'rejected', archived: '0', limit: 200 }),
      schoolService.listSubmissions({ status: 'approved', archived: '0', limit: 200 }),
      schoolService.listSubmissions({ archived: '1', limit: 200 }),
    ])
    setLoading(false)
    if (pRes.success) setPending(pRes.data || [])
    else onNotify?.(pRes.error, true)
    if (rejRes.success) setRejected(rejRes.data || [])
    else onNotify?.(rejRes.error, true)
    if (okRes.success) setApproved(okRes.data || [])
    else onNotify?.(okRes.error, true)
    if (aRes.success) setArchived(aRes.data || [])
    else onNotify?.(aRes.error, true)
  }, [compact, onNotify])

  useEffect(() => {
    if (compact) {
      setPending(submissions || [])
      return
    }
    loadBoard()
  }, [compact, submissions, loadBoard])

  useEffect(() => {
    if (!reviewing && !lightbox && !confirm) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setReviewing(null)
        setLightbox(null)
        if (!busy) setConfirm(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [reviewing, lightbox, confirm, busy])

  const filteredArchived = useMemo(() => {
    const q = archiveQ.trim().toLowerCase()
    if (!q) return archived
    return archived.filter((s) =>
      `${s.student_name || ''} ${s.exercise_title || ''} ${s.lesson_title || ''} ${s.teacher_note || ''} ${s.note || ''}`
        .toLowerCase()
        .includes(q),
    )
  }, [archived, archiveQ])

  const openReview = (sub) => {
    setReviewing(sub)
    setNote(sub?.teacher_note || '')
    const prev = Number(sub?.score)
    setScore(Number.isFinite(prev) ? clampScore(prev) : 10)
  }

  const applyPreset = (text) => {
    setNote(text)
  }

  const submitReview = async (status) => {
    if (!reviewing || busy) return
    const trimmed = note.trim()
    if (status === 'rejected' && !trimmed) {
      onNotify?.('برای رد تکلیف باید دلیل را بنویسید', true)
      return
    }
    const payload = {
      status,
      teacher_note: trimmed,
    }
    let finalScore = null
    if (status === 'approved') {
      finalScore = clampScore(score)
      payload.score = finalScore
    }
    setBusy(true)
    const res = await schoolService.reviewSubmission(reviewing.id, payload)
    setBusy(false)
    if (!res.success) {
      onNotify?.(res.error || 'خطا در بررسی', true)
      return
    }
    if (status === 'approved') {
      const scoreLabel = finalScore > 0 ? `+${finalScore}` : `${finalScore}`
      onNotify?.(`تأیید شد · امتیاز ${scoreLabel}`)
    } else {
      onNotify?.('رد شد · منتظر ارسال دوباره')
    }
    setReviewing(null)
    setNote('')
    setScore(10)
    if (compact) onDone?.()
    else {
      await loadBoard()
      onDone?.()
    }
  }

  const runConfirm = async () => {
    if (!confirm?.item || !confirm?.type) return
    setBusy(true)
    let res
    if (confirm.type === 'archive') {
      res = await schoolService.archiveSubmission(confirm.item.id, { archived: true })
    } else if (confirm.type === 'unarchive') {
      res = await schoolService.archiveSubmission(confirm.item.id, { archived: false })
    } else {
      res = await schoolService.reviewSubmission(confirm.item.id, { status: 'pending' })
    }
    setBusy(false)
    if (!res.success) {
      onNotify?.(
        res.error ||
          (confirm.type === 'archive'
            ? 'آرشیو ناموفق'
            : confirm.type === 'unarchive'
              ? 'بازگردانی ناموفق'
              : 'بازگشت برای بررسی ناموفق'),
        true,
      )
      return
    }
    onNotify?.(
      confirm.type === 'archive'
        ? 'به آرشیو منتقل شد'
        : confirm.type === 'unarchive'
          ? 'از آرشیو خارج شد'
          : 'به صف بررسی‌نشده برگشت',
    )
    setConfirm(null)
    await loadBoard()
    onDone?.()
  }

  const confirmMeta = confirm ? CONFIRM_META[confirm.type] : null
  const ConfirmIcon = confirmMeta?.Icon

  const reviewModal = reviewing ? (
    <div
      className={styles.hwModalBackdrop}
      role="presentation"
      onClick={() => !busy && setReviewing(null)}
    >
      <div
        className={styles.hwReviewModal}
        role="dialog"
        aria-modal="true"
        aria-label="بررسی تکلیف"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.hwReviewTop}>
          {reviewing.proof_url ? (
            <button
              type="button"
              className={styles.hwReviewThumbSm}
              onClick={() => setLightbox(reviewing.proof_url)}
              title="بزرگ‌نمایی"
            >
              <img src={reviewing.proof_url} alt="" />
            </button>
          ) : (
            <span className={styles.hwReviewThumbEmpty}>
              <ImageIcon size={18} />
            </span>
          )}
          <div className={styles.hwReviewTopInfo}>
            <strong>{reviewing.student_name || 'دانش‌آموز'}</strong>
            <p>
              {reviewing.exercise_title || 'تکلیف'}
              {reviewing.lesson_title ? ` · ${reviewing.lesson_title}` : ''}
            </p>
            {reviewing.note ? (
              <em className={styles.hwReviewNoteOne}>{reviewing.note}</em>
            ) : null}
            {reviewing.status === 'rejected' && reviewing.teacher_note ? (
              <em className={styles.hwReviewRejectOne}>رد قبلی: {reviewing.teacher_note}</em>
            ) : null}
          </div>
          <button
            type="button"
            className={styles.hwModalClose}
            onClick={() => !busy && setReviewing(null)}
          >
            <X size={15} />
          </button>
        </div>

        <div className={styles.hwReviewBody}>
          <div className={styles.hwReviewMain}>
            <div className={styles.hwScoreCompact} title="امتیاز فقط با تأیید ثبت می‌شود">
              <button
                type="button"
                className={styles.hwScoreStep}
                onClick={() => setScore(clampScore(Number(score) - 5))}
                aria-label="کاهش امتیاز"
              >
                −
              </button>
              <input
                type="number"
                min={-100}
                max={100}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                onBlur={() => setScore(clampScore(score))}
                className={[
                  styles.hwScoreValue,
                  Number(score) >= 0 ? styles.hwScorePos : styles.hwScoreNeg,
                ].join(' ')}
                aria-label="امتیاز تأیید"
              />
              <button
                type="button"
                className={styles.hwScoreStep}
                onClick={() => setScore(clampScore(Number(score) + 5))}
                aria-label="افزایش امتیاز"
              >
                +
              </button>
              <input
                type="range"
                min={-100}
                max={100}
                step={1}
                value={Number(score) || 0}
                onChange={(e) => setScore(clampScore(e.target.value))}
                className={styles.hwScoreRange}
                style={{ '--hw-score-pct': `${(((Number(score) || 0) + 100) / 200) * 100}%` }}
              />
            </div>

            <div className={styles.hwReviewMsg}>
              <textarea
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="پیام برای دانش‌آموز را بنویس یا از بانک پیام سمت چپ انتخاب کن…"
              />
            </div>

            <div className={styles.hwReviewFooterDual}>
              <button
                type="button"
                className={styles.hwSubmitOk}
                disabled={busy}
                onClick={() => submitReview('approved')}
              >
                <Check size={15} />
                {busy ? '…' : 'تأیید و ثبت امتیاز'}
              </button>
              <button
                type="button"
                className={styles.hwSubmitNo}
                disabled={busy}
                onClick={() => submitReview('rejected')}
              >
                <X size={15} />
                {busy ? '…' : 'رد'}
              </button>
            </div>
          </div>

          <aside className={styles.hwMsgBank} aria-label="بانک پیام">
            <header className={styles.hwMsgBankHead}>
              <strong>💬 بانک پیام</strong>
              <p>با یک لمس داخل پیام می‌رود</p>
            </header>
            <div className={styles.hwMsgBankGroup}>
              <em>تأیید ✨</em>
              {APPROVE_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`${styles.hwMsgChip} ${styles.hwMsgChipOk}`}
                  onClick={() => applyPreset(p)}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className={styles.hwMsgBankGroup}>
              <em>رد و اصلاح 🔁</em>
              {REJECT_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`${styles.hwMsgChip} ${styles.hwMsgChipNo}`}
                  onClick={() => applyPreset(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  ) : null

  const lightboxModal = lightbox ? (
    <div
      className={styles.hwModalBackdrop}
      role="presentation"
      onClick={() => setLightbox(null)}
    >
      <div
        className={styles.hwLightbox}
        role="dialog"
        aria-modal="true"
        aria-label="پیش‌نمایش تصویر تکلیف"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={styles.hwModalClose}
          onClick={() => setLightbox(null)}
        >
          <X size={16} />
        </button>
        <img src={lightbox} alt="پیش‌نمایش تکلیف" />
      </div>
    </div>
  ) : null

  if (compact) {
    if (!pending.length) {
      return (
        <div className={styles.hwReviewEmpty}>
          <p>تکلیفی برای بررسی نیست</p>
        </div>
      )
    }
    return (
      <div className={styles.hwTodoCompact}>
        <div className={styles.hwTodoStack} role="list">
          {pending.map((s) => (
            <TodoCard
              key={s.id}
              item={s}
              tone="pending"
              onOpen={openReview}
            />
          ))}
        </div>
        {portal(reviewModal)}
        {portal(lightboxModal)}
      </div>
    )
  }

  const confirmModal = confirm && confirmMeta ? (
        <div
          className={styles.hwModalBackdrop}
          role="presentation"
          onClick={() => !busy && setConfirm(null)}
        >
          <div
            className={`${styles.hwConfirmModal} ${styles[`hwConfirm_${confirmMeta.tone}`] || ''}`}
            role="dialog"
            aria-modal="true"
            aria-label={confirmMeta.title}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.hwConfirmIconWrap} aria-hidden>
              {ConfirmIcon ? <ConfirmIcon size={26} strokeWidth={2.1} /> : null}
            </div>
            <h3>{confirmMeta.title}</h3>
            <p className={styles.hwConfirmDesc}>{confirmMeta.desc}</p>
            <div className={styles.hwConfirmMeta}>
              <strong>{confirm.item.student_name || 'دانش‌آموز'}</strong>
              <span>
                {confirm.item.exercise_title || 'تکلیف'}
                {confirm.item.lesson_title ? ` · ${confirm.item.lesson_title}` : ''}
              </span>
            </div>
            <div className={styles.hwConfirmActions}>
              <button
                type="button"
                className={styles.hwConfirmOk}
                disabled={busy}
                onClick={runConfirm}
              >
                {confirmMeta.confirm}
              </button>
              <button
                type="button"
                className={styles.hwConfirmCancel}
                disabled={busy}
                onClick={() => setConfirm(null)}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
  ) : null

  return (
    <div className={styles.hwBoard}>
      <div className={styles.hwBoardHead}>
        <div>
          <h2 className={styles.panelTitle}>بررسی تکالیف</h2>
          <p className={styles.metaMuted}>
            بررسی‌نشده {faNum(pending.length)} · ردشده {faNum(rejected.length)} · تأییدشده{' '}
            {faNum(approved.length)} · آرشیو {faNum(archived.length)}
          </p>
        </div>
        <button
          type="button"
          className={styles.hwBoardRefresh}
          onClick={loadBoard}
          title="بروزرسانی"
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? styles.hwSpin : undefined} />
        </button>
      </div>

      <div className={styles.hwBoardGrid4}>
        <div className={styles.hwTodoCol}>
          <div className={`${styles.hwTodoColHead} ${styles.hwTodoColHeadPending}`}>
            <span>بررسی‌نشده</span>
            <em>{faNum(pending.length)}</em>
          </div>
          <div className={styles.hwTodoStack} role="list">
            {pending.map((s) => (
              <TodoCard
                key={s.id}
                item={s}
                tone="pending"
                onOpen={openReview}
              />
            ))}
            {!pending.length && !loading ? (
              <p className={styles.hwTodoEmpty}>تکلیف جدیدی برای بررسی نیست</p>
            ) : null}
          </div>
        </div>

        <div className={styles.hwTodoCol}>
          <div className={`${styles.hwTodoColHead} ${styles.hwTodoColHeadRejected}`}>
            <span>ردشده</span>
            <em>{faNum(rejected.length)}</em>
          </div>
          <p className={styles.hwColHint}>دانش‌آموز باید مجدد ارسال کند</p>
          <div className={styles.hwTodoStack} role="list">
            {rejected.map((s) => (
              <TodoCard
                key={s.id}
                item={s}
                tone="rejected"
              />
            ))}
            {!rejected.length && !loading ? (
              <p className={styles.hwTodoEmpty}>مورد ردی در انتظار ارسال مجدد نیست</p>
            ) : null}
          </div>
        </div>

        <div className={styles.hwTodoCol}>
          <div className={`${styles.hwTodoColHead} ${styles.hwTodoColHeadDone}`}>
            <span>بررسی‌شده</span>
            <em>{faNum(approved.length)}</em>
          </div>
          <div className={styles.hwTodoStack} role="list">
            {approved.map((s) => (
              <TodoCard
                key={s.id}
                item={s}
                tone="reviewed"
                onAskArchive={(item) => setConfirm({ type: 'archive', item })}
                onAskReopen={(item) => setConfirm({ type: 'reopen', item })}
                onPreview={setLightbox}
              />
            ))}
            {!approved.length && !loading ? (
              <p className={styles.hwTodoEmpty}>هنوز تکلیف تأییدشده‌ای نیست</p>
            ) : null}
          </div>
        </div>

        <div className={`${styles.hwTodoCol} ${styles.hwTodoColArchive}`}>
          <div className={`${styles.hwTodoColHead} ${styles.hwTodoColHeadArchive}`}>
            <span>آرشیو</span>
            <em>{faNum(filteredArchived.length)}</em>
          </div>
          <label className={styles.hwArchiveSearch}>
            <Search size={15} aria-hidden />
            <input
              type="search"
              value={archiveQ}
              onChange={(e) => setArchiveQ(e.target.value)}
              placeholder="جستجو در آرشیو…"
            />
          </label>
          <div className={styles.hwTodoStack} role="list">
            {filteredArchived.map((s) => (
              <TodoCard
                key={s.id}
                item={s}
                tone="archived"
                onAskUnarchive={(item) => setConfirm({ type: 'unarchive', item })}
                onAskReopen={(item) => setConfirm({ type: 'reopen', item })}
                onPreview={setLightbox}
              />
            ))}
            {!filteredArchived.length && !loading ? (
              <p className={styles.hwTodoEmpty}>
                {archiveQ.trim()
                  ? 'نتیجه‌ای پیدا نشد'
                  : 'آرشیو خالی است'}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {portal(confirmModal)}
      {portal(reviewModal)}
      {portal(lightboxModal)}
    </div>
  )
}
