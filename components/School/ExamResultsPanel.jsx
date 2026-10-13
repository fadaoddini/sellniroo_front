'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  RefreshCw, Save, Check, X, CircleHelp, MessageSquare,
  Search, ChevronRight, ChevronLeft, Loader2, ArrowRight,
} from 'lucide-react'
import schoolService from '@/components/School/services/schoolService'
import styles from './School.module.css'

const DIFF_FA = { easy: 'آسان', medium: 'متوسط', hard: 'سخت' }
const PAGE_SIZE = 8

const OPT_FA = {
  a: 'الف', b: 'ب', c: 'ج', d: 'د',
  A: 'الف', B: 'ب', C: 'ج', D: 'د',
  '1': '۱', '2': '۲', '3': '۳', '4': '۴',
}

const FEEDBACK_PRESETS = [
  '🌟 آفرین! عملکردت عالی بود',
  '👍 خوب بود، همین‌طور ادامه بده',
  '🧐 روی سوالات اشتباه بیشتر تمرین کن',
  '📝 فصل مربوط به غلط‌ها را دوباره مرور کن',
  '💪 نزدیک بودی؛ با دقت بیشتر بهتر می‌شی',
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

function optionText(opts, id) {
  if (id == null || id === '') return 'پاسخ نداده'
  const o = (opts || []).find((x) => String(x.id) === String(id))
  if (!o) return optLetter(id)
  const letter = optLetter(o.id)
  if (o.text) return `${letter} — ${o.text}`
  if (o.image) return `${letter} — تصویر`
  return letter
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
  const editorRef = useRef(null)

  const scopeParams = useMemo(() => {
    const p = {}
    if (studentId) p.student = studentId
    if (teacherId) p.teacher = teacherId
    return p
  }, [studentId, teacherId])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 350)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    setPage(1)
  }, [debouncedQuery, studentId, teacherId])

  const loadList = useCallback(async () => {
    setListBusy(true)
    const params = {
      page,
      page_size: PAGE_SIZE,
      status: 'submitted',
      ...scopeParams,
    }
    if (debouncedQuery) params.q = debouncedQuery
    if (!studentMode) params.as = 'teacher'
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
  }, [page, debouncedQuery, studentMode, onNotify, scopeParams])

  useEffect(() => { loadList() }, [loadList])

  const closeDetail = () => {
    setSelectedId(null)
    setDetail(null)
    setFeedback('')
    setFilter('all')
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

  const review = detail?.review || {}
  const items = review.items || []
  const visibleItems = useMemo(() => {
    if (filter === 'wrong') return items.filter((q) => !q.is_correct)
    if (filter === 'unanswered') return items.filter((q) => !q.answered)
    return items
  }, [items, filter])

  const searchPlaceholder = studentMode
    ? 'جستجو بر اساس نام آزمون…'
    : 'جستجو نام آزمون یا دانش‌آموز…'

  return (
    <div
      className={`${styles.resultsLayout} ${detail ? styles.resultsLayoutDetail : ''}`}
      dir="rtl"
      lang="fa"
    >
      <aside className={`${styles.resultsSidebar} ${detail ? styles.resultsSidebarHiddenMobile : ''}`}>
        <div className={styles.currSideHead}>
          <h2 className={styles.panelTitle}>
            {studentMode ? 'نتایج من' : 'نتایج آزمون'}
          </h2>
          <p className={styles.metaMuted}>
            {faNum(pagination.total)} نتیجه
            {debouncedQuery ? ' · فیلترشده' : ''}
          </p>
        </div>

        <div className={styles.resultsSearch}>
          <Search size={14} className={styles.resultsSearchIcon} />
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
        </div>

        <div className={styles.currAddBar}>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={loadList}
            disabled={listBusy}
            title="بروزرسانی"
          >
            {listBusy ? <Loader2 size={12} className={styles.spin} /> : <RefreshCw size={12} />}
            <span>بروزرسانی</span>
          </button>
        </div>

        <div className={styles.resultsList}>
          {listBusy && !list.length ? (
            <p className={styles.empty}>در حال بارگذاری…</p>
          ) : null}
          {list.map((item) => {
            const on = selectedId === item.id
            const answered = item.answered_count
            const total = item.total_questions || 0
            const correct = item.correct_count ?? 0
            return (
              <button
                key={item.id}
                type="button"
                className={`${styles.resultsItem} ${on ? styles.resultsItemOn : ''}`}
                onClick={() => openPaper(item)}
              >
                <div className={styles.resultsItemMain}>
                  <span className={styles.resultsItemTitle}>{item.exam_title || 'آزمون'}</span>
                  <span className={styles.resultsItemMeta}>
                    {!studentMode && item.student_name ? (
                      <span className={styles.resultsItemStudent}>{item.student_name}</span>
                    ) : null}
                    <span>
                      {faNum(correct)} از {faNum(total)} صحیح
                      {answered != null ? ` · ${faNum(answered)} پاسخ` : ''}
                    </span>
                  </span>
                </div>
                <span className={`${styles.pill} ${
                  (item.percentage || 0) >= 70 ? styles.pillOk
                    : (item.percentage || 0) >= 50 ? '' : styles.pillWarn
                }`}
                >
                  {faNum(item.percentage ?? 0)}٪
                </span>
              </button>
            )
          })}
          {!listBusy && !list.length ? (
            <p className={styles.empty}>
              {debouncedQuery ? 'نتیجه‌ای برای این جستجو نیست' : 'نتیجه‌ای ثبت نشده'}
            </p>
          ) : null}
        </div>

        <div className={styles.resultsPager}>
          <button
            type="button"
            className={styles.resultsPagerBtn}
            disabled={!pagination.has_prev || listBusy}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            title="صفحه قبل"
          >
            <ChevronRight size={16} />
          </button>
          <span className={styles.resultsPagerInfo}>
            صفحه {faNum(pagination.page)} از {faNum(pagination.total_pages || 1)}
          </span>
          <button
            type="button"
            className={styles.resultsPagerBtn}
            disabled={!pagination.has_next || listBusy}
            onClick={() => setPage((p) => p + 1)}
            title="صفحه بعد"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      </aside>

      <section
        ref={editorRef}
        className={`${styles.resultsEditor} ${!detail ? styles.resultsEditorEmpty : ''}`}
      >
        {!detail ? (
          <div className={styles.currEditorEmpty}>
            <strong>یک نتیجه را انتخاب کنید</strong>
            <p>
              {studentMode
                ? 'برگه آزمونی که داده‌اید — سوالات، پاسخ شما و پاسخ صحیح — اینجا دیده می‌شود.'
                : 'جزئیات سوالات، پاسخ دانش‌آموز و توضیح معلم اینجا دیده می‌شود.'}
            </p>
          </div>
        ) : (
          <>
            <div className={styles.currSideHead}>
              <button
                type="button"
                className={styles.resultsBackBtn}
                onClick={closeDetail}
              >
                <ArrowRight size={14} />
                <span>بازگشت به لیست</span>
              </button>
              <h2 className={styles.panelTitle}>{detail.exam_title || 'برگه آزمون'}</h2>
              <p className={styles.metaMuted}>
                {detail.student_name || (studentMode ? 'برگه شما' : '')}
                {detail.submitted_at
                  ? ` · ${new Date(detail.submitted_at).toLocaleDateString('fa-IR')}`
                  : ''}
                {detail.total_questions
                  ? ` · ${faNum(detail.total_questions)} سوال`
                  : ''}
              </p>
            </div>
            <div className={styles.currEditorScroll}>
              {busy ? (
                <p className={styles.metaMuted} style={{ marginBottom: 8 }}>
                  <Loader2 size={14} className={styles.spin} /> در حال بارگذاری برگه آزمون…
                </p>
              ) : null}

              <div className={styles.resultsStats}>
                <div className={styles.resultsStat}>
                  <span>درصد</span>
                  <strong>{faNum(detail.percentage)}٪</strong>
                </div>
                <div className={styles.resultsStat}>
                  <span>صحیح</span>
                  <strong>
                    {faNum(review.correct_count ?? detail.correct_count)}
                    {' از '}
                    {faNum(review.total_questions ?? detail.total_questions)}
                  </strong>
                </div>
                <div className={styles.resultsStat}>
                  <span>پاسخ‌داده‌شده</span>
                  <strong>
                    {faNum(review.answered_count ?? 0)}
                    {' از '}
                    {faNum(review.total_questions ?? detail.total_questions)}
                  </strong>
                </div>
                <div className={`${styles.resultsStat} ${styles.resultsStatWarn}`}>
                  <span>غلط / نزده</span>
                  <strong>{faNum(review.wrong_count ?? 0)}</strong>
                </div>
              </div>

              {!studentMode ? (
                <div className={styles.examFeedbackBox}>
                  <strong className={styles.bankBlockTitle}>توضیح شخصی برای دانش‌آموز</strong>
                  <p className={styles.fieldHint}>این متن در پنل دانش‌آموز نمایش داده می‌شود</p>
                  <div className={styles.hwPresetGrid}>
                    {FEEDBACK_PRESETS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={styles.hwPreset}
                        onClick={() => setFeedback((prev) => (prev.trim() ? `${prev.trim()} ${p}` : p))}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={3}
                    dir="rtl"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="مثلاً روی سوالات سخت بیشتر تمرین کن…"
                  />
                  <div className={styles.formActions}>
                    <button type="button" className={styles.btnAccent} disabled={busy} onClick={saveFeedback}>
                      <Save size={14} />
                      <span>ذخیره توضیح</span>
                    </button>
                  </div>
                </div>
              ) : detail.teacher_feedback ? (
                <div className={`${styles.teacherFeedback} ${styles.examStudentFeedback}`}>
                  <MessageSquare size={16} />
                  <div>
                    <strong>پیام معلم</strong>
                    <p>{detail.teacher_feedback}</p>
                  </div>
                </div>
              ) : null}

              <div className={styles.examFilterRow}>
                <button type="button" className={`${styles.chip} ${filter === 'all' ? styles.chipOn : ''}`} onClick={() => setFilter('all')}>
                  همه ({faNum(items.length)})
                </button>
                <button type="button" className={`${styles.chip} ${filter === 'wrong' ? styles.chipOn : ''}`} onClick={() => setFilter('wrong')}>
                  اشتباه / نزده ({faNum(review.wrong_count ?? 0)})
                </button>
                <button type="button" className={`${styles.chip} ${filter === 'unanswered' ? styles.chipOn : ''}`} onClick={() => setFilter('unanswered')}>
                  بی‌پاسخ ({faNum(review.unanswered_count ?? 0)})
                </button>
              </div>

              <div className={styles.examQList}>
                {!busy && !items.length ? (
                  <p className={styles.empty}>سوالات این برگه در دسترس نیست</p>
                ) : null}
                {visibleItems.map((q, idx) => (
                  <article
                    key={q.id || `q-${idx}`}
                    className={`${styles.examQCard} ${
                      q.is_correct ? styles.examQOk : styles.examQBad
                    }`}
                  >
                    <div className={styles.examQHead}>
                      <span className={styles.examQIndex}>سوال {faNum(q.index)}</span>
                      <span className={styles.pill}>{DIFF_FA[q.difficulty] || '—'}</span>
                      {q.is_correct ? (
                        <span className={`${styles.pill} ${styles.pillOk}`}>
                          <Check size={12} />
                          <span>صحیح</span>
                        </span>
                      ) : q.answered ? (
                        <span className={`${styles.pill} ${styles.pillWarn}`}>
                          <X size={12} />
                          <span>غلط</span>
                        </span>
                      ) : (
                        <span className={`${styles.pill} ${styles.pillWarn}`}>
                          <CircleHelp size={12} />
                          <span>نزده</span>
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
                        return (
                          <div
                            key={opt.id}
                            className={`${styles.examQOpt} ${isCorrect ? styles.examQOptCorrect : ''} ${isChosen && !isCorrect ? styles.examQOptWrong : ''}`}
                          >
                            <span className={styles.examQOptMark}>{optLetter(opt.id)}</span>
                            {opt.image ? <img src={opt.image} alt="" /> : null}
                            <span className={styles.examQOptBody}>
                              <span className={styles.examQOptText}>
                                {opt.text || (opt.image ? 'گزینه تصویری' : '—')}
                              </span>
                              <span className={styles.examQOptTags}>
                                {isChosen ? <em>انتخاب دانش‌آموز</em> : null}
                                {isCorrect ? <em className={styles.examTagOk}>پاسخ درست</em> : null}
                              </span>
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    <div className={styles.examQMeta}>
                      <div>
                        <span>پاسخ دانش‌آموز</span>
                        <strong>{optionText(q.options, q.chosen)}</strong>
                      </div>
                      <div>
                        <span>پاسخ صحیح</span>
                        <strong>{optionText(q.options, q.correct_option_id)}</strong>
                      </div>
                    </div>

                    {(q.explanation_text || q.explanation_image_url) ? (
                      <div className={styles.examExplain}>
                        <strong>پاسخ تشریحی</strong>
                        {q.explanation_text ? <p>{q.explanation_text}</p> : null}
                        {q.explanation_image_url ? (
                          <img src={q.explanation_image_url} alt="" />
                        ) : null}
                      </div>
                    ) : null}
                  </article>
                ))}
                {!visibleItems.length ? (
                  <p className={styles.empty}>موردی در این فیلتر نیست</p>
                ) : null}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
