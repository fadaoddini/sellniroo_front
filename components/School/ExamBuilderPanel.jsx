'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, RefreshCw, Trash2, Users, ClipboardList } from 'lucide-react'
import schoolService from '@/components/School/services/schoolService'
import styles from './School.module.css'

const emptyForm = () => ({
  title: '',
  description: '',
  subject_ids: [],
  chapter_ids: [],
  all_students: true,
  student_ids: [],
  count_easy: 5,
  count_medium: 5,
  count_hard: 5,
  time_per_question: 30,
  same_questions: false,
  shuffle_options: true,
  allow_back: true,
})

export default function ExamBuilderPanel({ tree = [], students = [], onNotify }) {
  const [exams, setExams] = useState([])
  const [busy, setBusy] = useState(false)
  const [avail, setAvail] = useState({ easy: 0, medium: 0, hard: 0, total: 0 })
  const [form, setForm] = useState(emptyForm)
  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [mode, setMode] = useState('create') // create | detail

  const loadExams = useCallback(async () => {
    const res = await schoolService.listExams()
    if (res.success) setExams(res.data || [])
    else onNotify?.(res.error, true)
  }, [onNotify])

  useEffect(() => { loadExams() }, [loadExams])

  const selectedSubjects = form.subject_ids
  const chaptersForSubjects = useMemo(() => {
    const set = new Set(selectedSubjects.map(String))
    const list = []
    tree.forEach((s) => {
      if (!set.size || set.has(String(s.id))) {
        ;(s.chapters || []).forEach((c) => {
          list.push({ ...c, subject_title: s.title, subject_id: s.id })
        })
      }
    })
    return list
  }, [tree, selectedSubjects])

  const refreshAvail = useCallback(async () => {
    const params = {}
    if (form.subject_ids.length) params.subjects = form.subject_ids.join(',')
    if (form.chapter_ids.length) params.chapters = form.chapter_ids.join(',')
    const res = await schoolService.bankAvailability(params)
    if (res.success) setAvail(res.data || { easy: 0, medium: 0, hard: 0, total: 0 })
  }, [form.subject_ids, form.chapter_ids])

  useEffect(() => { refreshAvail() }, [refreshAvail])

  const toggleId = (key, id) => {
    const sid = Number(id)
    setForm((p) => {
      const arr = p[key] || []
      const has = arr.map(Number).includes(sid)
      return {
        ...p,
        [key]: has ? arr.filter((x) => Number(x) !== sid) : [...arr, sid],
      }
    })
  }

  const startCreate = () => {
    setMode('create')
    setSelectedId(null)
    setDetail(null)
  }

  const create = async () => {
    if (!form.title.trim()) {
      onNotify?.('عنوان آزمون را وارد کنید', true)
      return
    }
    if (!form.subject_ids.length && !form.chapter_ids.length) {
      onNotify?.('حداقل یک درس یا فصل انتخاب کنید', true)
      return
    }
    if (!form.all_students && !form.student_ids.length) {
      onNotify?.('دانش‌آموزان شرکت‌کننده را انتخاب کنید', true)
      return
    }
    const total = Number(form.count_easy) + Number(form.count_medium) + Number(form.count_hard)
    if (total <= 0) {
      onNotify?.('تعداد سوالات را مشخص کنید', true)
      return
    }
    setBusy(true)
    const res = await schoolService.createExam({
      title: form.title.trim(),
      description: form.description,
      subject_ids: form.subject_ids.map(Number),
      chapter_ids: form.chapter_ids.map(Number),
      all_students: form.all_students,
      student_ids: form.all_students ? [] : form.student_ids.map(Number),
      count_easy: Number(form.count_easy) || 0,
      count_medium: Number(form.count_medium) || 0,
      count_hard: Number(form.count_hard) || 0,
      time_per_question: Number(form.time_per_question) || 30,
      same_questions: !!form.same_questions,
      shuffle_options: !!form.shuffle_options,
      allow_back: !!form.allow_back,
    })
    setBusy(false)
    if (!res.success) {
      onNotify?.(res.error || 'ایجاد آزمون ناموفق', true)
      return
    }
    const modeLabel = form.same_questions
      ? (form.shuffle_options ? 'سوالات یکسان · گزینه‌های تصادفی' : 'سوالات و گزینه‌های یکسان')
      : (form.shuffle_options ? 'سوالات تصادفی · گزینه‌های تصادفی' : 'سوالات تصادفی · گزینه‌های ثابت')
    onNotify?.(`آزمون ساخته شد · ${res.data?.papers_created || 0} برگه · ${modeLabel}`)
    setForm((p) => ({ ...p, title: '', description: '' }))
    loadExams()
  }

  const openExam = async (id) => {
    setSelectedId(id)
    setMode('detail')
    const res = await schoolService.getExam(id)
    if (res.success) setDetail(res.data)
    else onNotify?.(res.error, true)
  }

  const removeExam = async (id, e) => {
    e?.stopPropagation?.()
    if (!window.confirm('حذف آزمون و همه برگه‌های دانش‌آموزان؟')) return
    const res = await schoolService.deleteExam(id)
    if (res.success) {
      onNotify?.('حذف شد')
      if (selectedId === id) startCreate()
      loadExams()
    } else onNotify?.(res.error, true)
  }

  const totalNeed = Number(form.count_easy) + Number(form.count_medium) + Number(form.count_hard)

  return (
    <div className={styles.examLayout}>
      <aside className={styles.examSidebar}>
        <div className={styles.currSideHead}>
          <h2 className={styles.panelTitle}>آزمون‌ها</h2>
          <p className={styles.metaMuted}>{exams.length} آزمون ساخته‌شده</p>
        </div>

        <div className={styles.currAddBar}>
          <button type="button" className={styles.btnAccent} onClick={startCreate}>
            <Plus size={14} /> آزمون جدید
          </button>
          <button type="button" className={styles.btnGhost} onClick={loadExams} title="بروزرسانی">
            <RefreshCw size={12} />
          </button>
        </div>

        <div className={styles.bankList}>
          {exams.map((ex) => {
            const on = selectedId === ex.id && mode === 'detail'
            return (
              <div
                key={ex.id}
                className={`${styles.bankItem} ${on ? styles.bankItemOn : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => openExam(ex.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openExam(ex.id) }}
              >
                <div className={styles.bankItemMain}>
                  <span className={styles.bankItemText}>{ex.title}</span>
                  <span className={styles.bankItemMeta}>
                    آسان {ex.count_easy} · متوسط {ex.count_medium} · سخت {ex.count_hard}
                    {' · '}
                    {ex.paper_count || 0} برگه · {ex.submitted_count || 0} ارسال
                  </span>
                  <span className={styles.bankItemMeta}>
                    {ex.same_questions ? 'سوالات یکسان' : 'سوالات تصادفی'}
                    {' · '}
                    {ex.shuffle_options ? 'گزینه تصادفی' : 'گزینه ثابت'}
                    {' · '}
                    {ex.allow_back === false ? 'بدون برگشت' : 'با برگشت'}
                  </span>
                  {(ex.subject_titles || []).length ? (
                    <span className={styles.bankItemMeta}>
                      {(ex.subject_titles || []).join(' · ')}
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={(e) => removeExam(ex.id, e)}
                  title="حذف"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
          {!exams.length ? (
            <p className={styles.empty}>هنوز آزمونی ساخته نشده</p>
          ) : null}
        </div>
      </aside>

      <section className={styles.examEditor}>
        {mode === 'detail' && detail ? (
          <>
            <div className={styles.currSideHead}>
              <h2 className={styles.panelTitle}>نتایج · {detail.exam?.title}</h2>
              <p className={styles.metaMuted}>وضعیت برگه‌های اختصاصی دانش‌آموزان</p>
            </div>
            <div className={styles.currEditorScroll}>
              <div className={styles.formActions} style={{ marginBottom: 12 }}>
                <button type="button" className={styles.btnGhost} onClick={startCreate}>
                  <Plus size={14} /> ساخت آزمون جدید
                </button>
                <button
                  type="button"
                  className={styles.btnGhost}
                  onClick={() => openExam(selectedId)}
                >
                  <RefreshCw size={12} /> بروزرسانی
                </button>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>دانش‌آموز</th>
                      <th>وضعیت</th>
                      <th>درصد</th>
                      <th>صحیح</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detail.papers || []).map((p) => (
                      <tr key={p.id}>
                        <td>{p.student_name}</td>
                        <td>
                          <span className={styles.pill}>
                            {p.status === 'submitted' ? 'ارسال‌شده' : 'در انتظار'}
                          </span>
                        </td>
                        <td>{p.status === 'submitted' ? `${p.percentage}٪` : '—'}</td>
                        <td>
                          {p.status === 'submitted'
                            ? `${p.correct_count}/${p.total_questions}`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!detail.papers?.length ? (
                <p className={styles.empty}>برگه‌ای ثبت نشده</p>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <div className={styles.currSideHead}>
              <h2 className={styles.panelTitle}>ایجاد آزمون هدفمند</h2>
              <p className={styles.metaMuted}>
                می‌توانید سوالات یکسان یا تصادفی، و گزینه‌های ثابت یا جابه‌جا را انتخاب کنید
              </p>
            </div>

            <div className={styles.currEditorScroll}>
              <div className={styles.hintBox}>
                <ClipboardList size={14} />
                محدوده درس/فصل و ترکیب سختی را مشخص کنید؛ سیستم از بانک سوال می‌سازد.
              </div>

              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label>عنوان آزمون</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="مثلاً آزمون فصل ۱ ریاضی"
                  />
                </div>

                <div className={styles.field}>
                  <label>درس‌ها</label>
                  <div className={styles.chipGrid}>
                    {tree.map((s) => {
                      const on = form.subject_ids.map(Number).includes(Number(s.id))
                      return (
                        <button
                          key={s.id}
                          type="button"
                          className={`${styles.chip} ${on ? styles.chipOn : ''}`}
                          onClick={() => toggleId('subject_ids', s.id)}
                        >
                          {s.title}
                        </button>
                      )
                    })}
                    {!tree.length ? (
                      <span className={styles.metaMuted}>ابتدا در برنامه درسی دسته بسازید</span>
                    ) : null}
                  </div>
                </div>

                <div className={styles.field}>
                  <label>فصل‌ها (اختیاری)</label>
                  <div className={styles.chipGrid}>
                    {chaptersForSubjects.map((c) => {
                      const on = form.chapter_ids.map(Number).includes(Number(c.id))
                      return (
                        <button
                          key={c.id}
                          type="button"
                          className={`${styles.chip} ${on ? styles.chipOn : ''}`}
                          onClick={() => toggleId('chapter_ids', c.id)}
                        >
                          {c.subject_title} / {c.title}
                        </button>
                      )
                    })}
                    {!chaptersForSubjects.length ? (
                      <span className={styles.metaMuted}>فصلی برای نمایش نیست</span>
                    ) : null}
                  </div>
                </div>

                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <p className={styles.statLabel}>موجود آسان</p>
                    <p className={styles.statValue}>{avail.easy}</p>
                  </div>
                  <div className={styles.stat}>
                    <p className={styles.statLabel}>موجود متوسط</p>
                    <p className={styles.statValue}>{avail.medium}</p>
                  </div>
                  <div className={styles.stat}>
                    <p className={styles.statLabel}>موجود سخت</p>
                    <p className={styles.statValue}>{avail.hard}</p>
                  </div>
                  <div className={`${styles.stat} ${styles.statOk}`}>
                    <p className={styles.statLabel}>درخواست</p>
                    <p className={styles.statValue}>{totalNeed}</p>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label>تعداد آسان</label>
                    <input
                      type="number"
                      min={0}
                      value={form.count_easy}
                      onChange={(e) => setForm((p) => ({ ...p, count_easy: e.target.value }))}
                    />
                  </div>
                  <div className={styles.field}>
                    <label>تعداد متوسط</label>
                    <input
                      type="number"
                      min={0}
                      value={form.count_medium}
                      onChange={(e) => setForm((p) => ({ ...p, count_medium: e.target.value }))}
                    />
                  </div>
                  <div className={styles.field}>
                    <label>تعداد سخت</label>
                    <input
                      type="number"
                      min={0}
                      value={form.count_hard}
                      onChange={(e) => setForm((p) => ({ ...p, count_hard: e.target.value }))}
                    />
                  </div>
                  <div className={styles.field}>
                    <label>ثانیه / سوال</label>
                    <input
                      type="number"
                      min={5}
                      value={form.time_per_question}
                      onChange={(e) => setForm((p) => ({ ...p, time_per_question: e.target.value }))}
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label>شرکت‌کنندگان</label>
                  <div className={styles.rowActions}>
                    <button
                      type="button"
                      className={form.all_students ? styles.btnAccent : styles.btnGhost}
                      onClick={() => setForm((p) => ({ ...p, all_students: true, student_ids: [] }))}
                    >
                      <Users size={14} /> کل کلاس
                    </button>
                    <button
                      type="button"
                      className={!form.all_students ? styles.btnAccent : styles.btnGhost}
                      onClick={() => setForm((p) => ({ ...p, all_students: false }))}
                    >
                      انتخاب دانش‌آموزان
                    </button>
                  </div>
                  {!form.all_students ? (
                    <div className={styles.chipGrid} style={{ marginTop: 8 }}>
                      {students.map((s) => {
                        const on = form.student_ids.map(Number).includes(Number(s.id))
                        return (
                          <button
                            key={s.id}
                            type="button"
                            className={`${styles.chip} ${on ? styles.chipOn : ''}`}
                            onClick={() => toggleId('student_ids', s.id)}
                          >
                            {s.display_name}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <p className={styles.metaMuted} style={{ marginTop: 8 }}>
                      همه دانش‌آموزان فعال معلم ({students.length} نفر)
                    </p>
                  )}
                </div>

                <div className={styles.examModeBox}>
                  <strong className={styles.bankBlockTitle}>نحوه ساخت برگه</strong>
                  <p className={styles.fieldHint}>سوالات و گزینه‌ها را جداگانه تنظیم کنید</p>

                  <div className={styles.examModeGroup}>
                    <span className={styles.examModeLabel}>سوالات آزمون</span>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={!form.same_questions ? styles.btnAccent : styles.btnGhost}
                        onClick={() => setForm((p) => ({ ...p, same_questions: false }))}
                      >
                        تصادفی برای هر دانش‌آموز
                      </button>
                      <button
                        type="button"
                        className={form.same_questions ? styles.btnAccent : styles.btnGhost}
                        onClick={() => setForm((p) => ({ ...p, same_questions: true }))}
                      >
                        یکسان برای همه
                      </button>
                    </div>
                    <p className={styles.metaMuted}>
                      {form.same_questions
                        ? 'همه دانش‌آموزان همان سوال‌ها را می‌بینند'
                        : 'برای هر دانش‌آموز سوالات از بانک به‌صورت تصادفی انتخاب می‌شود'}
                    </p>
                  </div>

                  <div className={styles.examModeGroup}>
                    <span className={styles.examModeLabel}>ترتیب گزینه‌ها</span>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={form.shuffle_options ? styles.btnAccent : styles.btnGhost}
                        onClick={() => setForm((p) => ({ ...p, shuffle_options: true }))}
                      >
                        جابه‌جایی تصادفی
                      </button>
                      <button
                        type="button"
                        className={!form.shuffle_options ? styles.btnAccent : styles.btnGhost}
                        onClick={() => setForm((p) => ({ ...p, shuffle_options: false }))}
                      >
                        یکسان / ثابت
                      </button>
                    </div>
                    <p className={styles.metaMuted}>
                      {form.shuffle_options
                        ? (form.same_questions
                          ? 'سوالات یکی است، ولی ترتیب گزینه‌ها برای هر نفر فرق می‌کند'
                          : 'ترتیب گزینه‌ها در هر برگه به‌صورت تصادفی جابه‌جا می‌شود')
                        : (form.same_questions
                          ? 'سوالات و ترتیب گزینه‌ها برای همه کاملاً یکسان است'
                          : 'سوالات تصادفی است، ولی ترتیب گزینه‌های هر سوال مثل بانک می‌ماند')}
                    </p>
                  </div>

                  <div className={styles.examModeGroup}>
                    <span className={styles.examModeLabel}>برگشت به سوال قبلی</span>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={form.allow_back ? styles.btnAccent : styles.btnGhost}
                        onClick={() => setForm((p) => ({ ...p, allow_back: true }))}
                      >
                        مجاز است
                      </button>
                      <button
                        type="button"
                        className={!form.allow_back ? styles.btnAccent : styles.btnGhost}
                        onClick={() => setForm((p) => ({ ...p, allow_back: false }))}
                      >
                        غیرمجاز
                      </button>
                    </div>
                    <p className={styles.metaMuted}>
                      {form.allow_back
                        ? 'دانش‌آموز می‌تواند بین سوالات عقب و جلو برود'
                        : 'بعد از رفتن به سوال بعد، برگشت ممکن نیست و قبل از هر سوال هشدار داده می‌شود'}
                    </p>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button type="button" className={styles.btnAccent} disabled={busy} onClick={create}>
                    <Plus size={14} /> ایجاد آزمون و ساخت برگه‌ها
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
