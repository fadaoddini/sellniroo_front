'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, RefreshCw, HelpCircle, Save, ImagePlus, X } from 'lucide-react'
import schoolService from '@/components/School/services/schoolService'
import DropZone from '@/components/School/DropZone'
import styles from './School.module.css'

const DIFF = [
  { v: 'easy', l: 'آسان' },
  { v: 'medium', l: 'متوسط' },
  { v: 'hard', l: 'سخت' },
]

const IMG_MAX = 5 * 1024 * 1024

const emptyForm = () => ({
  subject: '',
  chapter: '',
  lesson: '',
  question_text: '',
  question_image_url: '',
  questionImageFile: null,
  clear_question_image: false,
  difficulty: 'medium',
  points: 1,
  correct_option_id: 'a',
  options: [
    { id: 'a', text: '', image: '' },
    { id: 'b', text: '', image: '' },
    { id: 'c', text: '', image: '' },
    { id: 'd', text: '', image: '' },
  ],
  hint_text: '',
  hint_image_url: '',
  hintImageFile: null,
  clear_hint_image: false,
  explanation_text: '',
  explanation_image_url: '',
  explanationImageFile: null,
  clear_explanation_image: false,
})

function questionToForm(q) {
  const opts = Array.isArray(q.options) && q.options.length
    ? q.options.map((o) => ({
      id: String(o.id),
      text: o.text || '',
      image: o.image || '',
    }))
    : emptyForm().options
  while (opts.length < 4) {
    const ids = ['a', 'b', 'c', 'd']
    const next = ids.find((id) => !opts.some((o) => o.id === id)) || `o${opts.length}`
    opts.push({ id: next, text: '', image: '' })
  }
  return {
    subject: q.subject ? String(q.subject) : '',
    chapter: q.chapter ? String(q.chapter) : '',
    lesson: q.lesson ? String(q.lesson) : '',
    question_text: q.question_text || '',
    question_image_url: q.question_image_url || '',
    questionImageFile: null,
    clear_question_image: false,
    difficulty: q.difficulty || 'medium',
    points: q.points ?? 1,
    correct_option_id: String(q.correct_option_id || opts[0]?.id || 'a'),
    options: opts.slice(0, 4),
    hint_text: q.hint_text || '',
    hint_image_url: q.hint_image_url || '',
    hintImageFile: null,
    clear_hint_image: false,
    explanation_text: q.explanation_text || '',
    explanation_image_url: q.explanation_image_url || '',
    explanationImageFile: null,
    clear_explanation_image: false,
  }
}

function MediaPicker({ label, hint, previewUrl, file, onFile, onClear }) {
  const preview = file ? URL.createObjectURL(file) : previewUrl
  return (
    <div className={styles.bankMediaField}>
      <div className={styles.bankMediaHead}>
        <label>{label}</label>
        {preview ? (
          <button type="button" className={styles.btnGhost} onClick={onClear}>
            <X size={12} /> حذف تصویر
          </button>
        ) : null}
      </div>
      {hint ? <p className={styles.fieldHint}>{hint}</p> : null}
      <DropZone
        accept="image/*"
        label="تصویر را رها کنید یا انتخاب کنید"
        preview={preview || undefined}
        previewFile={file || undefined}
        onFile={onFile}
      />
    </div>
  )
}

export default function QuestionBankPanel({ tree = [], onNotify }) {
  const [items, setItems] = useState([])
  const [filterSubject, setFilterSubject] = useState('')
  const [filterChapter, setFilterChapter] = useState('')
  const [filterDiff, setFilterDiff] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [busy, setBusy] = useState(false)

  const chapters = useMemo(() => {
    const sub = tree.find((s) => String(s.id) === String(form.subject))
    return sub?.chapters || []
  }, [tree, form.subject])

  const lessons = useMemo(() => {
    const ch = chapters.find((c) => String(c.id) === String(form.chapter))
    return ch?.lessons || []
  }, [chapters, form.chapter])

  const filterChapters = useMemo(() => {
    const sub = tree.find((s) => String(s.id) === String(filterSubject))
    return sub?.chapters || []
  }, [tree, filterSubject])

  const load = useCallback(async () => {
    const params = {}
    if (filterSubject) params.subject = filterSubject
    if (filterChapter) params.chapter = filterChapter
    if (filterDiff) params.difficulty = filterDiff
    const res = await schoolService.listBankQuestions(params)
    if (res.success) setItems(res.data || [])
    else onNotify?.(res.error, true)
  }, [filterSubject, filterChapter, filterDiff, onNotify])

  useEffect(() => { load() }, [load])

  const pickImage = (file, apply) => {
    if (!file) return
    if (!file.type?.startsWith('image/')) {
      onNotify?.('فقط فایل تصویری مجاز است', true)
      return
    }
    if (file.size > IMG_MAX) {
      onNotify?.('حجم تصویر نباید بیشتر از ۵ مگابایت باشد', true)
      return
    }
    apply(file)
  }

  const setOpt = (id, patch) => {
    setForm((p) => ({
      ...p,
      options: p.options.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    }))
  }

  const startNew = () => {
    setEditingId(null)
    setForm((p) => ({
      ...emptyForm(),
      subject: p.subject || filterSubject || '',
      chapter: p.chapter || filterChapter || '',
      difficulty: filterDiff || 'medium',
    }))
  }

  const openQuestion = (q) => {
    setEditingId(q.id)
    setForm(questionToForm(q))
  }

  const uploadOptionImages = async (options) => {
    const out = []
    for (const o of options) {
      let image = o.image || ''
      if (o.imageFile) {
        const up = await schoolService.upload(o.imageFile)
        if (!up.success) throw new Error(up.error || 'آپلود تصویر گزینه ناموفق')
        image = up.data?.url || ''
      }
      out.push({
        id: o.id,
        text: (o.text || '').trim(),
        ...(image ? { image } : {}),
      })
    }
    return out
  }

  const save = async () => {
    if (!form.subject) {
      onNotify?.('درس / دسته الزامی است', true)
      return
    }
    const hasQText = !!form.question_text.trim()
    const hasQImg = !!(form.questionImageFile || (form.question_image_url && !form.clear_question_image))
    if (!hasQText && !hasQImg) {
      onNotify?.('متن یا تصویر سوال الزامی است', true)
      return
    }
    if (!form.options.every((o) => (o.text || '').trim() || o.image || o.imageFile)) {
      onNotify?.('هر گزینه باید متن یا تصویر داشته باشد', true)
      return
    }
    setBusy(true)
    try {
      const options = await uploadOptionImages(form.options)
      const fd = new FormData()
      fd.append('subject', String(form.subject))
      if (form.chapter) fd.append('chapter', String(form.chapter))
      if (form.lesson) fd.append('lesson', String(form.lesson))
      fd.append('question_text', form.question_text.trim())
      fd.append('difficulty', form.difficulty)
      fd.append('points', String(Number(form.points) || 1))
      fd.append('correct_option_id', form.correct_option_id)
      fd.append('options', JSON.stringify(options))
      fd.append('is_active', 'true')
      fd.append('hint_text', form.hint_text.trim())
      fd.append('explanation_text', form.explanation_text.trim())

      if (form.questionImageFile) fd.append('question_image', form.questionImageFile)
      else if (form.clear_question_image) fd.append('clear_question_image', '1')

      if (form.hintImageFile) fd.append('hint_image', form.hintImageFile)
      else if (form.clear_hint_image) fd.append('clear_hint_image', '1')

      if (form.explanationImageFile) fd.append('explanation_image', form.explanationImageFile)
      else if (form.clear_explanation_image) fd.append('clear_explanation_image', '1')

      const res = editingId
        ? await schoolService.updateBankQuestion(editingId, fd)
        : await schoolService.createBankQuestion(fd)
      if (!res.success) {
        onNotify?.(res.error || 'خطا در ذخیره', true)
        return
      }
      onNotify?.(editingId ? 'سوال به‌روز شد' : 'سوال به بانک اضافه شد')
      if (!editingId) {
        setForm((p) => ({
          ...emptyForm(),
          subject: p.subject,
          chapter: p.chapter,
          lesson: '',
          difficulty: p.difficulty,
        }))
      } else if (res.data) {
        setForm(questionToForm(res.data))
      }
      load()
    } catch (e) {
      onNotify?.(e.message || 'خطا در ذخیره', true)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id, e) => {
    e?.stopPropagation?.()
    if (!window.confirm('حذف این سوال؟')) return
    const res = await schoolService.deleteBankQuestion(id)
    if (res.success) {
      onNotify?.('حذف شد')
      if (editingId === id) startNew()
      load()
    } else onNotify?.(res.error, true)
  }

  const counts = useMemo(() => {
    const c = { easy: 0, medium: 0, hard: 0 }
    items.forEach((i) => { c[i.difficulty] = (c[i.difficulty] || 0) + 1 })
    return c
  }, [items])

  const qPreview = form.questionImageFile
    ? URL.createObjectURL(form.questionImageFile)
    : (form.clear_question_image ? '' : form.question_image_url)

  return (
    <div className={styles.bankLayout}>
      <aside className={styles.bankSidebar}>
        <div className={styles.currSideHead}>
          <h2 className={styles.panelTitle}>بانک سوالات</h2>
          <p className={styles.metaMuted}>
            {items.length} سوال · آسان {counts.easy} · متوسط {counts.medium} · سخت {counts.hard}
          </p>
        </div>

        <div className={styles.bankFilters}>
          <select
            value={filterSubject}
            onChange={(e) => { setFilterSubject(e.target.value); setFilterChapter('') }}
            aria-label="فیلتر درس"
          >
            <option value="">همه دروس</option>
            {tree.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
          <select
            value={filterChapter}
            onChange={(e) => setFilterChapter(e.target.value)}
            aria-label="فیلتر فصل"
          >
            <option value="">همه فصول</option>
            {filterChapters.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <select
            value={filterDiff}
            onChange={(e) => setFilterDiff(e.target.value)}
            aria-label="فیلتر سختی"
          >
            <option value="">همه سختی‌ها</option>
            {DIFF.map((d) => <option key={d.v} value={d.v}>{d.l}</option>)}
          </select>
        </div>

        <div className={styles.currAddBar}>
          <button type="button" className={styles.btnAccent} onClick={startNew}>
            <Plus size={14} /> سوال جدید
          </button>
          <button type="button" className={styles.btnGhost} onClick={load} title="بروزرسانی">
            <RefreshCw size={12} />
          </button>
        </div>

        <div className={styles.bankList}>
          {items.map((q) => {
            const on = editingId === q.id
            const label = (q.question_text || '').trim()
              || (q.question_image_url ? 'سوال تصویری' : 'بدون متن')
            return (
              <div
                key={q.id}
                className={`${styles.bankItem} ${on ? styles.bankItemOn : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => openQuestion(q)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openQuestion(q) }}
              >
                {q.question_image_url ? (
                  <img src={q.question_image_url} alt="" className={styles.bankThumb} />
                ) : null}
                <div className={styles.bankItemMain}>
                  <span className={styles.bankItemText}>{label.slice(0, 90)}</span>
                  <span className={styles.bankItemMeta}>
                    {q.subject_title}
                    {q.chapter_title ? ` · ${q.chapter_title}` : ''}
                    {q.hint_text || q.hint_image_url ? ' · راهنما' : ''}
                    {q.explanation_text || q.explanation_image_url ? ' · تشریحی' : ''}
                  </span>
                </div>
                <span className={styles.pill}>{DIFF.find((d) => d.v === q.difficulty)?.l || q.difficulty}</span>
                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={(e) => remove(q.id, e)}
                  title="حذف"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
          {!items.length ? (
            <p className={styles.empty}>هنوز سوالی در بانک نیست</p>
          ) : null}
        </div>
      </aside>

      <section className={styles.bankEditor}>
        <div className={styles.currSideHead}>
          <h2 className={styles.panelTitle}>
            {editingId ? 'ویرایش سوال' : 'افزودن سوال به بانک'}
          </h2>
          <p className={styles.metaMuted}>
            متن یا تصویر برای سوال و گزینه‌ها · راهنما و پاسخ تشریحی اختیاری
          </p>
        </div>

        <div className={styles.currEditorScroll}>
          <div className={styles.formGrid}>
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label>درس / دسته</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value, chapter: '', lesson: '' }))}
                >
                  <option value="">انتخاب</option>
                  {tree.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label>فصل</label>
                <select
                  value={form.chapter}
                  onChange={(e) => setForm((p) => ({ ...p, chapter: e.target.value, lesson: '' }))}
                >
                  <option value="">— اختیاری —</option>
                  {chapters.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label>درس (جلسه)</label>
                <select
                  value={form.lesson}
                  onChange={(e) => setForm((p) => ({ ...p, lesson: e.target.value }))}
                >
                  <option value="">— اختیاری —</option>
                  {lessons.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label>درجه سختی</label>
                <select value={form.difficulty} onChange={(e) => setForm((p) => ({ ...p, difficulty: e.target.value }))}>
                  {DIFF.map((d) => <option key={d.v} value={d.v}>{d.l}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label>متن سوال</label>
              <p className={styles.fieldHint}>متن و/یا تصویر — حداقل یکی لازم است</p>
              <textarea
                rows={3}
                value={form.question_text}
                onChange={(e) => setForm((p) => ({ ...p, question_text: e.target.value }))}
                placeholder="متن سوال (اختیاری اگر تصویر دارید)"
              />
            </div>

            <MediaPicker
              label="تصویر سوال"
              hint="حداکثر ۵ مگابایت"
              previewUrl={qPreview}
              file={form.questionImageFile}
              onFile={(file) => pickImage(file, (f) => setForm((p) => ({
                ...p,
                questionImageFile: f,
                clear_question_image: false,
              })))}
              onClear={() => setForm((p) => ({
                ...p,
                questionImageFile: null,
                question_image_url: '',
                clear_question_image: true,
              }))}
            />

            <div className={styles.bankOptionsBlock}>
              <strong className={styles.bankBlockTitle}>گزینه‌ها</strong>
              <p className={styles.fieldHint}>هر گزینه متن یا تصویر (یا هر دو) · گزینه صحیح را با رادیو مشخص کنید</p>
              {form.options.map((o) => {
                const optPreview = o.imageFile
                  ? URL.createObjectURL(o.imageFile)
                  : o.image
                return (
                  <div key={o.id} className={styles.bankOptionCard}>
                    <div className={styles.optionRow}>
                      <label className={styles.optionMark}>
                        <input
                          type="radio"
                          name="correct"
                          checked={form.correct_option_id === o.id}
                          onChange={() => setForm((p) => ({ ...p, correct_option_id: o.id }))}
                        />
                        {o.id.toUpperCase()}
                      </label>
                      <input
                        className={styles.input}
                        placeholder={`متن گزینه ${o.id} (اختیاری اگر تصویر دارید)`}
                        value={o.text}
                        onChange={(e) => setOpt(o.id, { text: e.target.value })}
                      />
                    </div>
                    <div className={styles.bankOptMedia}>
                      {optPreview ? (
                        <div className={styles.bankOptPreview}>
                          <img src={optPreview} alt="" />
                          <button
                            type="button"
                            className={styles.btnGhost}
                            onClick={() => setOpt(o.id, { image: '', imageFile: null })}
                          >
                            <X size={12} /> حذف تصویر
                          </button>
                        </div>
                      ) : (
                        <label className={styles.bankOptUpload}>
                          <ImagePlus size={14} />
                          تصویر گزینه
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              e.target.value = ''
                              pickImage(file, (f) => setOpt(o.id, { imageFile: f }))
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className={styles.bankHelpBlock}>
              <strong className={styles.bankBlockTitle}>راهنمای سوال</strong>
              <p className={styles.fieldHint}>اختیاری — در حین آزمون برای دانش‌آموز نمایش داده می‌شود</p>
              <div className={styles.field}>
                <textarea
                  rows={2}
                  value={form.hint_text}
                  onChange={(e) => setForm((p) => ({ ...p, hint_text: e.target.value }))}
                  placeholder="متن راهنما"
                />
              </div>
              <MediaPicker
                label="تصویر راهنما"
                hint="حداکثر ۵ مگابایت"
                previewUrl={
                  form.hintImageFile
                    ? URL.createObjectURL(form.hintImageFile)
                    : (form.clear_hint_image ? '' : form.hint_image_url)
                }
                file={form.hintImageFile}
                onFile={(file) => pickImage(file, (f) => setForm((p) => ({
                  ...p,
                  hintImageFile: f,
                  clear_hint_image: false,
                })))}
                onClear={() => setForm((p) => ({
                  ...p,
                  hintImageFile: null,
                  hint_image_url: '',
                  clear_hint_image: true,
                }))}
              />
            </div>

            <div className={styles.bankHelpBlock}>
              <strong className={styles.bankBlockTitle}>پاسخ تشریحی</strong>
              <p className={styles.fieldHint}>اختیاری — بعد از ارسال آزمون قابل نمایش است · متن یا تصویر</p>
              <div className={styles.field}>
                <textarea
                  rows={3}
                  value={form.explanation_text}
                  onChange={(e) => setForm((p) => ({ ...p, explanation_text: e.target.value }))}
                  placeholder="توضیح پاسخ صحیح"
                />
              </div>
              <MediaPicker
                label="تصویر پاسخ تشریحی"
                hint="حداکثر ۵ مگابایت"
                previewUrl={
                  form.explanationImageFile
                    ? URL.createObjectURL(form.explanationImageFile)
                    : (form.clear_explanation_image ? '' : form.explanation_image_url)
                }
                file={form.explanationImageFile}
                onFile={(file) => pickImage(file, (f) => setForm((p) => ({
                  ...p,
                  explanationImageFile: f,
                  clear_explanation_image: false,
                })))}
                onClear={() => setForm((p) => ({
                  ...p,
                  explanationImageFile: null,
                  explanation_image_url: '',
                  clear_explanation_image: true,
                }))}
              />
            </div>

            <div className={styles.formActions}>
              <button type="button" className={styles.btnAccent} disabled={busy} onClick={save}>
                {editingId ? <Save size={14} /> : <Plus size={14} />}
                {editingId ? 'ذخیره تغییرات' : 'افزودن به بانک'}
              </button>
              {editingId ? (
                <button type="button" className={styles.btnGhost} onClick={startNew}>
                  <HelpCircle size={14} /> سوال جدید
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
