'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  Archive,
  ArchiveRestore,
  Calendar,
  ClipboardPen,
  FileText,
  MessageCircle,
  MoreVertical,
  Plus,
  Trash2,
  User,
  UserRound,
} from 'lucide-react'
import { useTodo } from '../context/TodoContext'
import todoService from '../services/todoService'
import ActivityReportModal from './ActivityReportModal'
import ReviewReportModal from './ReviewReportModal'
import ReferAssignModal from './ReferAssignModal'
import styles from '../styles/Board.module.css'
import reportStyles from '../styles/Report.module.css'

const reviewBadge = (status) => {
  if (status === 'approved') return reportStyles.badgeApproved
  if (status === 'rejected') return reportStyles.badgeRejected
  return reportStyles.badgePending
}

const reviewLabel = (status) => {
  if (status === 'approved') return 'تأیید شده'
  if (status === 'rejected') return 'رد شده'
  return 'در انتظار بررسی'
}

const Attachments = ({ items }) => {
  if (!items?.length) return null
  return (
    <div className={reportStyles.attachList}>
      {items.map((a) => (
        <div key={a.id} className={reportStyles.attachItem}>
          {a.file_type === 'audio' && a.url ? (
            <audio src={a.url} controls preload="metadata" />
          ) : a.url ? (
            <a href={a.url} target="_blank" rel="noreferrer">
              {a.original_name || 'دانلود فایل'}
            </a>
          ) : (
            a.original_name || 'فایل'
          )}
        </div>
      ))}
    </div>
  )
}

const TaskCard = ({
  task,
  onDragStart,
  isArchived = false,
  tourTarget,
  canDrag = false,
}) => {
  const {
    priorities,
    currentUser,
    isAdmin,
    deleteTask,
    addComment,
    archiveTask,
    unarchiveTask,
    refresh,
  } = useTodo()
  const [showComments, setShowComments] = useState(false)
  const [showReports, setShowReports] = useState(false)
  const [comments, setComments] = useState(task.comments || [])
  const [reports, setReports] = useState([])
  const [newComment, setNewComment] = useState('')
  const [showActions, setShowActions] = useState(false)
  const [busy, setBusy] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [referOpen, setReferOpen] = useState(false)
  const [reviewTarget, setReviewTarget] = useState(null)
  const [pendingCount, setPendingCount] = useState(
    Number(task.pending_reports_count || 0)
  )
  const [reportsCount, setReportsCount] = useState(
    Number(task.reports_count || 0)
  )
  const actionsRef = useRef(null)

  const priority = priorities.find((p) => p.id === task.priority)
  const isAssignee =
    !task.assignee || String(task.assignee) === String(currentUser.id)
  const canReport = !isArchived && (isAdmin || isAssignee)
  const canRefer = !isArchived && (isAdmin || isAssignee)

  useEffect(() => {
    setPendingCount(Number(task.pending_reports_count || 0))
    setReportsCount(Number(task.reports_count || 0))
  }, [task.pending_reports_count, task.reports_count])

  useEffect(() => {
    const onDoc = (e) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target)) {
        setShowActions(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const dueLabel = (() => {
    if (!task.due_date) return '—'
    try {
      return new Date(`${task.due_date}T12:00:00`).toLocaleDateString('fa-IR')
    } catch {
      return task.due_date
    }
  })()

  const handleDelete = async () => {
    if (!window.confirm('این وظیفه حذف شود؟')) return
    setBusy(true)
    try {
      await deleteTask(task.id)
    } catch (err) {
      alert(err?.message || 'حذف ناموفق بود')
    } finally {
      setBusy(false)
      setShowActions(false)
    }
  }

  const handleArchive = async () => {
    setBusy(true)
    try {
      if (isArchived) await unarchiveTask(task.id)
      else await archiveTask(task.id)
    } catch (err) {
      alert(err?.message || err?.error || 'عملیات آرشیو ناموفق بود')
    } finally {
      setBusy(false)
    }
  }

  const openComments = async () => {
    const next = !showComments
    setShowComments(next)
    if (next) {
      setShowReports(false)
      try {
        const data = await todoService.getComments(task.id)
        setComments(Array.isArray(data) ? data : [])
      } catch {
        setComments(task.comments || [])
      }
    }
  }

  const loadReports = async () => {
    const data = await todoService.getReports(task.id)
    const list = Array.isArray(data) ? data : []
    setReports(list)
    setReportsCount(list.length)
    setPendingCount(list.filter((r) => r.review_status === 'pending').length)
    return list
  }

  const openReports = async () => {
    const next = !showReports
    setShowReports(next)
    if (next) {
      setShowComments(false)
      setBusy(true)
      try {
        await loadReports()
      } catch (err) {
        alert(err?.message || 'بارگذاری گزارش‌ها ناموفق بود')
      } finally {
        setBusy(false)
      }
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    setBusy(true)
    try {
      const comment = await addComment(task.id, newComment.trim())
      setComments((prev) => [...prev, comment])
      setNewComment('')
    } catch (err) {
      alert(err?.message || 'ثبت نظر ناموفق بود')
    } finally {
      setBusy(false)
    }
  }

  const handleSubmitReport = async (payload) => {
    setBusy(true)
    try {
      await todoService.addReport(task.id, payload)
      setReportOpen(false)
      setShowReports(true)
      await loadReports()
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  const handleReview = async (payload) => {
    if (!reviewTarget) return
    setBusy(true)
    try {
      await todoService.reviewReport(task.id, reviewTarget.id, payload)
      setReviewTarget(null)
      setShowReports(true)
      await loadReports()
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  const handleRefer = async (payload) => {
    setBusy(true)
    try {
      await todoService.assignTask(task.id, payload)
      setReferOpen(false)
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div
        className={styles.card}
        draggable={canDrag && !isArchived && !busy && !reportOpen}
        onDragStart={(e) =>
          canDrag && !isArchived && onDragStart?.(e, task.id)
        }
        data-tour={tourTarget || undefined}
      >
        <div className={styles.cardTop}>
          <h4 className={styles.cardTitle}>{task.title}</h4>
          {!isArchived && (canRefer || currentUser.isAdmin) ? (
            <div className={styles.menuWrap} ref={actionsRef}>
              <button
                type="button"
                className={styles.moreBtn}
                onClick={() => setShowActions((v) => !v)}
                aria-label="بیشتر"
              >
                <MoreVertical size={15} />
              </button>
              {showActions ? (
                <div className={styles.menu}>
                  {canRefer ? (
                    <button
                      type="button"
                      className={styles.menuItem}
                      onClick={() => {
                        setShowActions(false)
                        setReferOpen(true)
                      }}
                    >
                      <UserRound size={13} />
                      ارجاع
                    </button>
                  ) : null}
                  {currentUser.isAdmin ? (
                    <button
                      type="button"
                      className={`${styles.menuItem} ${styles.menuDanger}`}
                      onClick={handleDelete}
                    >
                      <Trash2 size={13} />
                      حذف
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {priority ? (
          <span
            className={styles.priority}
            style={{ color: priority.color, background: priority.bg }}
          >
            {priority.name}
          </span>
        ) : null}

        {task.description ? (
          <p className={styles.cardDesc}>{task.description}</p>
        ) : null}

        <div className={styles.cardMeta}>
          <span>
            <User size={11} />
            {task.assignee_name || 'بدون مسئول'}
          </span>
          <span>
            <Calendar size={11} />
            {dueLabel}
          </span>
        </div>

        <div className={styles.cardFooter}>
          <div className={styles.cardFooterLeft}>
            <button
              type="button"
              className={styles.commentBtn}
              onClick={openComments}
            >
              <MessageCircle size={12} />
              {(
                comments.length ||
                task.comments_count ||
                task.comments?.length ||
                0
              ).toLocaleString('fa-IR')}
            </button>
            <button
              type="button"
              className={`${styles.commentBtn} ${
                pendingCount > 0 ? styles.reportBtnPending : ''
              }`}
              onClick={openReports}
            >
              <ClipboardPen size={12} />
              {reportsCount.toLocaleString('fa-IR')}
              {pendingCount > 0
                ? ` · ${pendingCount.toLocaleString('fa-IR')} بررسی`
                : ''}
            </button>
          </div>
          <div className={styles.cardFooterRight}>
            {canRefer ? (
              <button
                type="button"
                className={styles.commentBtn}
                onClick={() => setReferOpen(true)}
                disabled={busy}
              >
                <UserRound size={12} />
                ارجاع
              </button>
            ) : null}
            {canReport ? (
              <button
                type="button"
                className={styles.activityBtn}
                onClick={() => setReportOpen(true)}
                disabled={busy}
              >
                <FileText size={12} />
                ثبت فعالیت
              </button>
            ) : null}
            {(task.status === 'done' || isArchived) && (
              <button
                type="button"
                className={styles.archiveBtn}
                onClick={handleArchive}
                disabled={busy}
              >
                {isArchived ? <ArchiveRestore size={12} /> : <Archive size={12} />}
                {isArchived ? 'بازگردانی' : 'آرشیو'}
              </button>
            )}
          </div>
        </div>

        {showReports ? (
          <div className={reportStyles.timeline}>
            {reports.length === 0 ? (
              <p className={styles.cardDesc}>هنوز گزارشی ثبت نشده</p>
            ) : (
              reports.map((r) => (
                <div key={r.id} className={reportStyles.reportCard}>
                  <div className={reportStyles.reportHead}>
                    <span className={reportStyles.reportAuthor}>
                      {r.author_name || 'کارمند'}
                    </span>
                    <span
                      className={`${reportStyles.badge} ${reviewBadge(
                        r.review_status
                      )}`}
                    >
                      {reviewLabel(r.review_status)}
                    </span>
                  </div>
                  <p className={reportStyles.reportText}>{r.description}</p>
                  <div className={reportStyles.reportMeta}>
                    {r.activity_display || r.activity_status}
                    {r.created_at
                      ? ` · ${new Date(r.created_at).toLocaleString('fa-IR')}`
                      : ''}
                  </div>
                  <Attachments items={r.report_attachments || r.attachments?.filter((a) => a.side === 'report')} />

                  {r.review_status !== 'pending' && (r.review_note || r.review_attachments?.length) ? (
                    <div className={reportStyles.reviewBox}>
                      <strong>
                        پاسخ مدیر
                        {r.reviewed_by_name ? ` — ${r.reviewed_by_name}` : ''}
                      </strong>
                      {r.review_note ? (
                        <p className={reportStyles.reportText}>{r.review_note}</p>
                      ) : null}
                      <Attachments items={r.review_attachments} />
                    </div>
                  ) : null}

                  {isAdmin && r.review_status === 'pending' && !isArchived ? (
                    <div className={reportStyles.reviewActions}>
                      <button
                        type="button"
                        className={styles.activityBtn}
                        onClick={() => setReviewTarget(r)}
                      >
                        بررسی گزارش
                      </button>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        ) : null}

        {showComments ? (
          <div className={styles.comments}>
            {comments.map((c) => (
              <div key={c.id} className={styles.comment}>
                <div className={styles.commentHead}>
                  <span>{c.author_name || 'کاربر'}</span>
                  <span>
                    {c.created_at
                      ? new Date(c.created_at).toLocaleDateString('fa-IR')
                      : ''}
                  </span>
                </div>
                <p className={styles.commentText}>{c.text}</p>
              </div>
            ))}
            {!isArchived ? (
              <div className={styles.commentRow}>
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="نظر..."
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <button type="button" onClick={handleAddComment} disabled={busy}>
                  <Plus size={14} />
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <ActivityReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        task={task}
        onSubmit={handleSubmitReport}
        loading={busy}
      />
      <ReviewReportModal
        isOpen={Boolean(reviewTarget)}
        onClose={() => setReviewTarget(null)}
        task={task}
        report={reviewTarget}
        onSubmit={handleReview}
        loading={busy}
      />
      <ReferAssignModal
        isOpen={referOpen}
        onClose={() => setReferOpen(false)}
        task={task}
        onSubmit={handleRefer}
        loading={busy}
      />
    </>
  )
}

export default TaskCard
