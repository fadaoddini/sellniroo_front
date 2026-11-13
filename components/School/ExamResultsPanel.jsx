'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  RefreshCw, Save, Check, X, CircleHelp, MessageSquare,
  Search, ChevronRight, ChevronLeft, Loader2, ArrowRight, Archive,
} from 'lucide-react'
import schoolService from '@/components/School/services/schoolService'
import styles from './School.module.css'

const DIFF_FA = { easy: 'آسان', medium: 'متوسط', hard: 'سخت' }
const PAGE_SIZE = 12

const OPT_FA = {
  a: 'الف', b: 'ب', c: 'ج', d: 'د',
  A: 'الف', B: 'ب', C: 'ج', D: 'د',
  '1': '۱', '2': '۲', '3': '۳', '4': '۴',
}

const FEEDBACK_PRESETS = [
  '🌟 آفرین! عملکردت عالی بود',
  '👍 خوب بود، ادامه بده',
  '🧐 روی غلط‌ها بیشتر تمرین کن',
  '📝 فصل مربوط را دوباره مرور کن',
  '💪 نزدیک بودی؛ دقیق‌تر شو',
]

function faNum(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString('fa-IR')
}

function optLetter(id) {
  if (id == null || id === '') return '—'
  const key = String(id)
  return OPT_FA[key] || OPT_FA[key.toLowerCase()] || key
}

export default function ExamResultsPanel({
  onNotify,
  studentMode = false,
  studentId = null,
  teacherId = null,
}) {
  const [list, setList] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: PAGE_SIZE,
    total: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  })
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [listBusy, setListBusy] = useState(false)

  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [filter, setFilter] = useState('all')
  const [inboxTab, setInboxTab] = useState('pending') // pending | archived
  const [confirmArchive, setConfirmArchive] = useState(false)
  const [portalReady, setPortalReady] = useState(false)
  const editorRef = useRef(null)

  const isArchiveTab = !studentMode && inboxTab === 'archived'

  const scopeParams = useMemo(() => {
    const p = {}
    if (studentId) p.student = studentId
    if (teacherId) p.teacher = teacherId
    return p
  }, [studentId, teacherId])

  useEffect(() => {
    setPortalReady(true)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 350)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    setPage(1)
  }, [debouncedQuery, studentId, teacherId, inboxTab])

  const loadList = useCallback(async () => {
    const archiveNeedsQuery = !studentMode && inboxTab === 'archived'
    // آرشیو فقط با جستجو واکشی می‌شود تا فشار به سرور نیاید
    if (archiveNeedsQuery && !debouncedQuery) {
      setList([])
      setPagination({
        page: 1,
        page_size: PAGE_SIZE,
        total: 0,
        total_pages: 1,
        has_next: false,
        has_prev: false,
      })
      setListBusy(false)
      return
    }

    setListBusy(true)
    const params = {
      page,
      page_size: PAGE_SIZE,
      status: 'submitted',
      ...scopeParams,
    }
    if (debouncedQuery) params.q = debouncedQuery
    if (!studentMode) {
      params.as = 'teacher'
      params.archived = inboxTab === 'archived' ? '1' : '0'
    }
    const res = await schoolService.listExamPapers(params)
    setListBusy(false)
    if (!res.success) {
      onNotify?.(res.error || 'خطا در دریافت نتایج', true)
      setList([])
      return
    }
    const payload = res.data || {}
    setList(payload.results || [])
    if (payload.pagination) setPagination(payload.pagination)
  }, [page, debouncedQuery, studentMode, onNotify, scopeParams, inboxTab])

  useEffect(() => { loadList() }, [loadList])

  useEffect(() => {
    if (!confirmArchive) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) setConfirmArchive(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [confirmArchive, busy])

  const closeDetail = () => {
    setSelectedId(null)
    setDetail(null)
    setFeedback('')
    setFilter('all')
    setConfirmArchive(false)
  }

  useEffect(() => {
    if (!studentMode && inboxTab === 'archived' && !debouncedQuery) {
      closeDetail()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, inboxTab, studentMode])

  const switchInboxTab = (tab) => {
    if (tab === inboxTab) return
    setInboxTab(tab)
    closeDetail()
    setQuery('')
    setDebouncedQuery('')
  }

  const openPaper = async (item) => {
    if (!item?.id) {
      onNotify?.('برگه آزمون نامعتبر است', true)
      return
    }
    setBusy(true)
    setSelectedId(item.id)
    const res = await schoolService.getExamPaper(item.id, scopeParams)
    setBusy(false)
    if (!res.success) {
      onNotify?.(res.error || 'خطا در دریافت برگه آزمون', true)
      setDetail(null)
      return
    }
    setDetail(res.data)
    setFeedback(res.data?.teacher_feedback || '')
    setFilter('all')
    requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const saveFeedback = async () => {
    if (!detail) return
    setBusy(true)
    const res = await schoolService.updateExamPaperFeedback(
      detail.id,
      feedback.trim(),
      scopeParams,
    )
    setBusy(false)
    if (!res.success) {
      onNotify?.(res.error || 'ذخیره ناموفق', true)
      return
    }
    setDetail(res.data)
    setFeedback(res.data.teacher_feedback || '')
    onNotify?.('توضیح برای دانش‌آموز ذخیره شد')
    loadList()
  }

  const archivePaper = async () => {
    if (!detail || studentMode) return
    setBusy(true)
    const res = await schoolService.archiveExamPaper(detail.id, {
      archived: true,
      teacher_feedback: feedback.trim(),
      ...scopeParams,
    })
    setBusy(false)
    setConfirmArchive(false)
    if (!res.success) {
      onNotify?.(res.error || 'آرشیو ناموفق', true)
      return
    }
    onNotify?.('آزمون آرشیو شد و از لیست نتایج خارج شد')
    closeDetail()
    loadList()
  }

  const searchPlaceholder = studentMode
    ? 'جستجو نام آزمون…'
    : isArchiveTab
      ? 'نام دانش‌آموز یا آزمون را جستجو کنید…'
      : 'جستجو آزمون یا دانش‌آموز…'

  const archiveAwaitingSearch = isArchiveTab && !debouncedQuery

  const confirmModal = confirmArchive && detail && portalReady
    ? createPortal(
      <div
        className={styles.hwModalBackdrop}
        role="presentation"
        onClick={() => !busy && setConfirmArchive(false)}
      >
        <div
          className={`${styles.hwConfirmModal} ${styles.hwConfirm_archive}`}
          role="dialog"
          aria-modal="true"
          aria-label="تأیید آرشیو آزمون"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.hwConfirmIconWrap} aria-hidden>
            <Archive size={26} strokeWidth={2.1} />
          </div>
          <h3>آرشیو آزمون</h3>
          <p className={styles.hwConfirmDesc}>
            این برگه از لیست بررسی‌نشده خارج می‌شود و فقط در تب آرشیو دیده می‌شود.
          </p>
          <div className={styles.hwConfirmMeta}>
            <strong>{detail.student_name || 'دانش‌آموز'}</strong>
            <span>{detail.exam_title || 'آزمون'}</span>
          </div>
          <div className={styles.hwConfirmActions}>
            <button
              type="button"
              className={styles.hwConfirmOk}
              disabled={busy}
              onClick={archivePaper}
            >
              {busy ? 'در حال آرشیو…' : 'بله، آرشیو شود'}
            </button>
            <button
              type="button"
              className={styles.hwConfirmCancel}
              disabled={busy}
              onClick={() => setConfirmArchive(false)}
            >
              انصراف
            </button>
          </div>
        </div>
      </div>,
      document.body,
    )
    : null

  const review = detail?.review || {}
  const items = review.items || []
  const totalQ = review.total_questions ?? detail?.total_questions ?? items.length
  const correctN = review.correct_count ?? detail?.correct_count ?? 0
  const answeredN = review.answered_count ?? 0
  const unansweredN = review.unanswered_count ?? Math.max(0, totalQ - answeredN)
  const wrongN = useMemo(
    () => items.filter((q) => q.answered && !q.is_correct).length,
    [items],
  )

  const visibleItems = useMemo(() => {
    if (filter === 'wrong') return items.filter((q) => q.answered && !q.is_correct)
    if (filter === 'unanswered') return items.filter((q) => !q.answered)
    if (filter === 'correct') return items.filter((q) => q.is_correct)
    return items
  }, [items, filter])

  return (
    <div
      className={[
        styles.resultsLayout,
        detail ? styles.resultsLayoutOpen : '',
        detail ? styles.resultsLayoutDetail : '',
      ].filter(Boolean).join(' ')}
      dir="rtl"
      lang="fa"
    >
      <aside className={`${styles.resultsSidebar} ${detail ? styles.resultsSidebarHiddenMobile : ''}`}>
        <div className={styles.resultsSideHead}>
          <div>
            <h2 className={styles.panelTitle}>
              {studentMode ? 'نتایج من' : isArchiveTab ? 'آرشیو آزمون' : 'نتایج آزمون'}
            </h2>
            <p className={styles.metaMuted}>
              {archiveAwaitingSearch
                ? 'جستجو برای مشاهده'
                : (
                  <>
                    {faNum(pagination.total)}
                    {studentMode ? ' نتیجه' : isArchiveTab ? ' آرشیو' : ' بررسی‌نشده'}
                    {debouncedQuery ? ' · فیلتر' : ''}
                  </>
                )}
            </p>
          </div>
          <button
            type="button"
            className={styles.resultsIconBtn}
            onClick={loadList}
            disabled={listBusy || archiveAwaitingSearch}
            title="بروزرسانی"
          >
            {listBusy ? <Loader2 size={13} className={styles.spin} /> : <RefreshCw size={13} />}
          </button>
        </div>

        {!studentMode ? (
          <div className={styles.resultsInboxTabs} role="tablist" aria-label="صندوق نتایج">
            <button
              type="button"
              role="tab"
              aria-selected={!isArchiveTab}
              className={`${styles.resultsInboxTab} ${!isArchiveTab ? styles.resultsInboxTabOn : ''}`}
              onClick={() => switchInboxTab('pending')}
            >
              بررسی‌نشده
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isArchiveTab}
              className={`${styles.resultsInboxTab} ${isArchiveTab ? styles.resultsInboxTabOn : ''}`}
              onClick={() => switchInboxTab('archived')}
            >
              <Archive size={12} />
              آرشیو آزمون
            </button>
          </div>
        ) : null}

        <label className={styles.resultsSearch}>
          <Search size={13} className={styles.resultsSearchIcon} aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="جستجو"
          />
          {query ? (
            <button
              type="button"
              className={styles.resultsSearchClear}
              onClick={() => setQuery('')}
              title="پاک کردن"
            >
              <X size={12} />
            </button>
          ) : null}
        </label>

        <div className={styles.resultsList} role="list">
          {listBusy && !list.length ? (
            <p className={styles.empty}>در حال بارگذاری…</p>
          ) : null}
          {list.map((item) => {
            const on = selectedId === item.id
            const total = item.total_questions || 0
            const correct = item.correct_count ?? 0
            return (
              <button
                key={item.id}
                type="button"
                className={`${styles.resultsItem} ${on ? styles.resultsItemOn : ''}`}
                role="listitem"
                onClick={() => openPaper(item)}
              >
                <span className={styles.resultsItemMain}>
                  {!studentMode ? (
                    <strong className={styles.resultsItemStudent}>
                      {item.student_name || 'دانش‌آموز'}
                    </strong>
                  ) : (
                    <strong className={styles.resultsItemStudent}>
                      {item.exam_title || 'آزمون'}
                    </strong>
                  )}
                  <em>
                    {!studentMode ? (item.exam_title || 'آزمون') : null}
                    {!studentMode ? ' · ' : null}
                    {faNum(correct)}/{faNum(total)} صحیح
                  </em>
                </span>
                <span className={styles.resultsPct}>{faNum(item.percentage ?? 0)}٪</span>
              </button>
            )
          })}
          {!listBusy && !list.length ? (
            <p className={styles.empty}>
              {archiveAwaitingSearch
                ? 'نام دانش‌آموز یا آزمون را بنویسید تا آرشیو جستجو شود'
                : debouncedQuery
                  ? 'نتیجه‌ای پیدا نشد'
                  : 'نتیجه‌ای ثبت نشده'}
            </p>
          ) : null}
        </div>

        {!archiveAwaitingSearch ? (
          <div className={styles.resultsPager}>
            <button
              type="button"
              className={styles.resultsPagerBtn}
              disabled={!pagination.has_prev || listBusy}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              title="صفحه قبل"
            >
              <ChevronRight size={15} />
            </button>
            <span className={styles.resultsPagerInfo}>
              {faNum(pagination.page)} / {faNum(pagination.total_pages || 1)}
            </span>
            <button
              type="button"
              className={styles.resultsPagerBtn}
              disabled={!pagination.has_next || listBusy}
              onClick={() => setPage((p) => p + 1)}
              title="صفحه بعد"
            >
              <ChevronLeft size={15} />
            </button>
          </div>
        ) : null}
      </aside>

      {detail ? (
        <aside className={styles.resultsNoteCol} aria-label="توضیح معلم">
          <div className={styles.resultsNoteHead}>
            <MessageSquare size={15} />
            <div>
              <strong>توضیح معلم</strong>
              <p>
                {detail.student_name || 'دانش‌آموز'}
                {detail.exam_title ? ` · ${detail.exam_title}` : ''}
              </p>
            </div>
          </div>

          <div className={styles.resultsNoteStats}>
            <div className={styles.resultsNoteStat}>
              <span>درصد</span>
              <strong>{faNum(detail.percentage)}٪</strong>
            </div>
            <div className={styles.resultsNoteStat}>
              <span>صحیح</span>
              <strong>{faNum(correctN)}</strong>
            </div>
            <div className={styles.resultsNoteStat}>
              <span>غلط</span>
              <strong>{faNum(wrongN)}</strong>
            </div>
          </div>

          {!studentMode && !isArchiveTab ? (
            <div className={styles.resultsNoteBody}>
              <div className={styles.examPresetRow}>
                {FEEDBACK_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={styles.examPreset}
                    onClick={() => setFeedback(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <textarea
                rows={6}
                dir="rtl"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="درباره عملکرد این دانش‌آموز در این آزمون بنویسید…"
              />
              <div className={styles.resultsNoteActions}>
                <button
                  type="button"
                  className={styles.btnAccent}
                  disabled={busy}
                  onClick={saveFeedback}
                >
                  <Save size={13} />
                  ذخیره توضیح
                </button>
                <button
                  type="button"
                  className={styles.resultsArchiveBtn}
                  disabled={busy}
                  onClick={() => setConfirmArchive(true)}
                  title="آرشیو پس از تأیید"
                >
                  <Archive size={13} />
                  آرشیو آزمون
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.resultsNoteBody}>
              {detail.teacher_feedback || feedback ? (
                <div className={styles.resultsNoteRead}>
                  <p>{detail.teacher_feedback || feedback}</p>
                </div>
              ) : (
                <p className={styles.resultsNoteEmpty}>
                  {isArchiveTab ? 'توضیح معلم ثبت نشده' : 'هنوز پیامی از معلم ثبت نشده'}
                </p>
              )}
            </div>
          )}
        </aside>
      ) : null}

      <section
        ref={editorRef}
        className={`${styles.resultsEditor} ${!detail ? styles.resultsEditorEmpty : ''}`}
      >
        {!detail ? (
          <div className={styles.resultsEmptyDetail}>
            <MessageSquare size={26} strokeWidth={1.5} />
            <strong>
              {archiveAwaitingSearch
                ? 'برای دیدن آرشیو جستجو کنید'
                : isArchiveTab
                  ? 'یک آزمون آرشیو را انتخاب کنید'
                  : 'یک نتیجه را انتخاب کنید'}
            </strong>
            <p>
              {studentMode
                ? 'جزئیات سوالات و پاسخ‌ها اینجا دیده می‌شود.'
                : archiveAwaitingSearch
                  ? 'نام دانش‌آموز یا عنوان آزمون را بنویسید؛ بدون جستجو چیزی واکشی نمی‌شود.'
                  : isArchiveTab
                    ? 'عملکرد دانش‌آموز و پاسخ‌ها را از آرشیو مرور کنید.'
                    : 'برگه آزمون و توضیح معلم در دو بخش جدا باز می‌شود.'}
            </p>
          </div>
        ) : (
          <>
            <div className={styles.resultsDetailHead}>
              <button
                type="button"
                className={styles.resultsBackBtn}
                onClick={closeDetail}
              >
                <ArrowRight size={14} />
                <span>لیست</span>
              </button>
              <div className={styles.resultsDetailTitle}>
                <h2>{detail.exam_title || 'برگه آزمون'}</h2>
                <p>
                  {detail.student_name || (studentMode ? 'برگه شما' : '')}
                  {detail.submitted_at
                    ? ` · ${new Date(detail.submitted_at).toLocaleDateString('fa-IR')}`
                    : ''}
                </p>
              </div>
              <span className={styles.resultsPctLg}>{faNum(detail.percentage)}٪</span>
            </div>

            <div className={styles.resultsDetailBody}>
              {busy ? (
                <p className={styles.resultsBusyLine}>
                  <Loader2 size={13} className={styles.spin} /> بارگذاری…
                </p>
              ) : null}

              <div className={styles.resultsStats}>
                <div className={styles.resultsStat}>
                  <span>صحیح</span>
                  <strong>{faNum(correctN)}</strong>
                </div>
                <div className={styles.resultsStat}>
                  <span>غلط</span>
                  <strong>{faNum(wrongN)}</strong>
                </div>
                <div className={styles.resultsStat}>
                  <span>پاسخ‌داده</span>
                  <strong>{faNum(answeredN)}</strong>
                </div>
                <div className={styles.resultsStat}>
                  <span>نزده</span>
                  <strong>{faNum(unansweredN)}</strong>
                </div>
              </div>

              <div className={styles.examFilterRow}>
                <button
                  type="button"
                  className={`${styles.examChip} ${filter === 'all' ? styles.examChipOn : ''}`}
                  onClick={() => setFilter('all')}
                >
                  همه {faNum(items.length)}
                </button>
                <button
                  type="button"
                  className={`${styles.examChip} ${filter === 'correct' ? styles.examChipOn : ''}`}
                  onClick={() => setFilter('correct')}
                >
                  صحیح {faNum(correctN)}
                </button>
                <button
                  type="button"
                  className={`${styles.examChip} ${filter === 'wrong' ? styles.examChipOn : ''}`}
                  onClick={() => setFilter('wrong')}
                >
                  غلط {faNum(wrongN)}
                </button>
                <button
                  type="button"
                  className={`${styles.examChip} ${filter === 'unanswered' ? styles.examChipOn : ''}`}
                  onClick={() => setFilter('unanswered')}
                >
                  نزده {faNum(unansweredN)}
                </button>
              </div>

              <div className={styles.examQList}>
                {!busy && !items.length ? (
                  <p className={styles.empty}>سوالات این برگه در دسترس نیست</p>
                ) : null}
                {visibleItems.map((q, idx) => {
                  const tone = q.is_correct
                    ? styles.examQOk
                    : q.answered
                      ? styles.examQBad
                      : styles.examQNeutral
                  return (
                    <article
                      key={q.id || `q-${idx}`}
                      className={`${styles.examQCard} ${tone}`}
                    >
                      <div className={styles.examQMain}>
                        <div className={styles.examQHead}>
                          <span className={styles.examQIndex}>س{faNum(q.index)}</span>
                          <span className={styles.examQDiff}>{DIFF_FA[q.difficulty] || '—'}</span>
                          {q.is_correct ? (
                            <span className={`${styles.examQStatus} ${styles.examQStatusOk}`}>
                              <Check size={11} /> صحیح
                            </span>
                          ) : q.answered ? (
                            <span className={`${styles.examQStatus} ${styles.examQStatusBad}`}>
                              <X size={11} /> غلط
                            </span>
                          ) : (
                            <span className={`${styles.examQStatus} ${styles.examQStatusMiss}`}>
                              <CircleHelp size={11} /> نزده
                            </span>
                          )}
                        </div>

                        {q.question_image_url ? (
                          <img src={q.question_image_url} alt="" className={styles.examQImg} />
                        ) : null}
                        {q.question_text ? (
                          <p className={styles.examQText}>{q.question_text}</p>
                        ) : null}

                        <div className={styles.examQOpts}>
                          {(q.options || []).map((opt) => {
                            const isCorrect = String(opt.id) === String(q.correct_option_id)
                            const isChosen = String(opt.id) === String(q.chosen)
                            const optClass = [
                              styles.examQOpt,
                              isCorrect ? styles.examQOptCorrect : '',
                              isChosen && !isCorrect ? styles.examQOptWrong : '',
                            ].filter(Boolean).join(' ')
                            return (
                              <div key={opt.id} className={optClass}>
                                <span className={styles.examQOptMark}>{optLetter(opt.id)}</span>
                                {opt.image ? <img src={opt.image} alt="" /> : null}
                                <span className={styles.examQOptText}>
                                  {opt.text || (opt.image ? 'تصویر' : '—')}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <aside className={styles.examQExplainCol}>
                        <strong>پاسخ تشریحی</strong>
                        {q.explanation_text || q.explanation_image_url ? (
                          <>
                            {q.explanation_text ? <p>{q.explanation_text}</p> : null}
                            {q.explanation_image_url ? (
                              <img src={q.explanation_image_url} alt="" />
                            ) : null}
                          </>
                        ) : (
                          <p className={styles.examQExplainEmpty}>تشریحی ثبت نشده</p>
                        )}
                      </aside>
                    </article>
                  )
                })}
                {!visibleItems.length ? (
                  <p className={styles.empty}>موردی در این فیلتر نیست</p>
                ) : null}
              </div>
            </div>
          </>
        )}
      </section>
      {confirmModal}
    </div>
  )
}
