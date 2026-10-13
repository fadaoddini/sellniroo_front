'use client'

import React, { useMemo, useState } from 'react'
import {
  Plus, Trash2, Save, Paperclip, ChevronUp, ChevronDown,
  BookOpen, FolderOpen, Layers, FileText, ClipboardList, Upload,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import schoolService from '@/components/School/services/schoolService'
import DropZone from '@/components/School/DropZone'
import styles from './School.module.css'

const CKEditorWrapper = dynamic(
  () => import('@/components/newsAdmin/CKEditorWrapper'),
  { ssr: false }
)

const IMPORTANCE = [
  { v: 'low', l: 'کم' },
  { v: 'medium', l: 'متوسط' },
  { v: 'high', l: 'بالا' },
  { v: 'critical', l: 'حیاتی' },
]

const COVER_MAX_BYTES = 5 * 1024 * 1024
const VIDEO_MAX_BYTES = 80 * 1024 * 1024

function isAparatUrl(url) {
  const raw = (url || '').trim()
  if (!raw) return true
  try {
    const host = new URL(raw).hostname.toLowerCase()
    return host === 'aparat.com' || host.endsWith('.aparat.com')
  } catch {
    return false
  }
}

export default function CurriculumWorkspace({
  tree = [],
  teacherId,
  selectedLesson,
  lessonForm,
  exercises = [],
  saving,
  onOpenLesson,
  onClearLesson,
  onLessonFormChange,
  onSaveLesson,
  onReload,
  onNotify,
  onAddAttachment,
  onAddExercise,
  onDeleteExercise,
  onDeleteAttachment,
}) {
  const [subjectTitle, setSubjectTitle] = useState('')
  const [addingChapterFor, setAddingChapterFor] = useState(null)
  const [chapterTitle, setChapterTitle] = useState('')
  const [addingLessonFor, setAddingLessonFor] = useState(null)
  const [lessonTitle, setLessonTitle] = useState('')
  const [expanded, setExpanded] = useState({})

  const ensureExpanded = (subjectId, chapterId) => {
    setExpanded((p) => ({
      ...p,
      [`s-${subjectId}`]: true,
      ...(chapterId ? { [`c-${chapterId}`]: true } : {}),
    }))
  }

  const createSubject = async () => {
    if (!subjectTitle.trim()) return
    const payload = { title: subjectTitle.trim() }
    if (teacherId) payload.teacher = teacherId
    const res = await schoolService.createSubject(payload)
    if (!res.success) return onNotify?.(res.error, true)
    setSubjectTitle('')
    onNotify?.('دسته اضافه شد')
    onReload?.()
  }

  const createChapter = async (subjectId) => {
    if (!chapterTitle.trim()) return
    const res = await schoolService.createChapter({
      subject: subjectId,
      title: chapterTitle.trim(),
      importance: 'medium',
    })
    if (!res.success) return onNotify?.(res.error, true)
    setChapterTitle('')
    setAddingChapterFor(null)
    ensureExpanded(subjectId)
    onNotify?.('فصل اضافه شد')
    onReload?.()
  }

  const createLesson = async (chapterId, subjectId) => {
    if (!lessonTitle.trim()) return
    const siblings = tree
      .flatMap((s) => s.chapters || [])
      .find((c) => Number(c.id) === Number(chapterId))
    const order = ((siblings?.lessons || []).length + 1) * 10
    const fd = new FormData()
    fd.append('chapter', String(chapterId))
    fd.append('title', lessonTitle.trim())
    fd.append('importance', 'medium')
    fd.append('is_active', 'true')
    fd.append('order', String(order))
    const res = await schoolService.createLesson(fd)
    if (!res.success) return onNotify?.(res.error, true)
    setLessonTitle('')
    setAddingLessonFor(null)
    ensureExpanded(subjectId, chapterId)
    onNotify?.('درس ساخته شد — محتوا را در ستون مقابل کامل کنید')
    onReload?.()
    onOpenLesson?.(res.data.id)
  }

  const moveItem = async (type, items, index, dir) => {
    const j = index + dir
    if (j < 0 || j >= items.length) return
    const a = items[index]
    const b = items[j]
    const orderA = a.order ?? (index + 1) * 10
    const orderB = b.order ?? (j + 1) * 10
    const patch = async (id, order) => {
      if (type === 'subject') return schoolService.updateSubject(id, { order })
      if (type === 'chapter') return schoolService.updateChapter(id, { order })
      const fd = new FormData()
      fd.append('order', String(order))
      return schoolService.updateLesson(id, fd)
    }
    const [r1, r2] = await Promise.all([
      patch(a.id, orderB),
      patch(b.id, orderA),
    ])
    if (!r1.success || !r2.success) {
      onNotify?.(r1.error || r2.error || 'جابه‌جایی ناموفق', true)
      return
    }
    onReload?.()
  }

  const deleteSubject = async (id) => {
    if (!window.confirm('حذف این دسته و تمام فصول/دروس آن؟')) return
    const res = await schoolService.deleteSubject(id)
    if (!res.success) return onNotify?.(res.error, true)
    if (selectedLesson?.subject_id === id || selectedLesson?.chapter?.subject_id === id) onClearLesson?.()
    onNotify?.('حذف شد')
    onReload?.()
  }

  const deleteChapter = async (id) => {
    if (!window.confirm('حذف این فصل و دروس آن؟')) return
    const res = await schoolService.deleteChapter(id)
    if (!res.success) return onNotify?.(res.error, true)
    if (selectedLesson?.chapter === id || selectedLesson?.chapter_id === id) onClearLesson?.()
    onNotify?.('حذف شد')
    onReload?.()
  }

  const deleteLesson = async (id) => {
    if (!window.confirm('حذف این درس؟')) return
    const res = await schoolService.deleteLesson(id)
    if (!res.success) return onNotify?.(res.error, true)
    if (selectedLesson?.id === id) onClearLesson?.()
    onNotify?.('حذف شد')
    onReload?.()
  }

  const setForm = (patch) => onLessonFormChange?.(patch)

  const onCoverFile = (file) => {
    if (!file) return
    if (file.size > COVER_MAX_BYTES) {
      onNotify?.('حجم تصویر شاخص نباید بیشتر از ۵ مگابایت باشد', true)
      return
    }
    setForm({ coverFile: file })
  }

  const onVideoFile = (file) => {
    if (!file) return
    if (file.size > VIDEO_MAX_BYTES) {
      onNotify?.('حجم ویدیو نباید بیشتر از ۸۰ مگابایت باشد', true)
      return
    }
    setForm({ videoFile: file })
  }

  const handleSave = () => {
    const url = (lessonForm?.video_url || '').trim()
    if (url && !isAparatUrl(url)) {
      onNotify?.('لینک ویدیو باید از سایت آپارات باشد (مثلاً https://www.aparat.com/...)', true)
      return
    }
    if (lessonForm?.coverFile && lessonForm.coverFile.size > COVER_MAX_BYTES) {
      onNotify?.('حجم تصویر شاخص نباید بیشتر از ۵ مگابایت باشد', true)
      return
    }
    if (lessonForm?.videoFile && lessonForm.videoFile.size > VIDEO_MAX_BYTES) {
      onNotify?.('حجم ویدیو نباید بیشتر از ۸۰ مگابایت باشد', true)
      return
    }
    onSaveLesson?.()
  }

  const selectedMeta = useMemo(() => {
    if (!selectedLesson) return null
    return {
      subject: selectedLesson.subject_title,
      chapter: selectedLesson.chapter_title,
    }
  }, [selectedLesson])

  return (
    <div className={styles.curriculumLayout}>
      {/* ستون مدیریت درخت */}
      <aside className={styles.curriculumSidebar}>
        <div className={styles.currSideHead}>
          <h2 className={styles.panelTitle}>ساختار درسی</h2>
          <p className={styles.metaMuted}>دسته ← فصل ← درس · ترتیب با ▲▼</p>
        </div>

        <div className={styles.currAddBar}>
          <input
            className={styles.input}
            placeholder="دسته جدید (مثلاً ریاضی)"
            value={subjectTitle}
            onChange={(e) => setSubjectTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createSubject()}
          />
          <button type="button" className={styles.btnAccent} onClick={createSubject} title="افزودن دسته">
            <Plus size={14} />
          </button>
        </div>

        <div className={styles.currTree}>
          {tree.map((s, si) => {
            const sOpen = expanded[`s-${s.id}`] !== false
            return (
              <div key={s.id} className={styles.currNode}>
                <div className={styles.currRow}>
                  <button
                    type="button"
                    className={styles.currToggle}
                    onClick={() => setExpanded((p) => ({ ...p, [`s-${s.id}`]: !sOpen }))}
                  >
                    <FolderOpen size={14} />
                    <strong>{s.title}</strong>
                  </button>
                  <div className={styles.currTools}>
                    <button type="button" className={styles.iconBtn} disabled={si === 0} onClick={() => moveItem('subject', tree, si, -1)} title="بالا">
                      <ChevronUp size={12} />
                    </button>
                    <button type="button" className={styles.iconBtn} disabled={si === tree.length - 1} onClick={() => moveItem('subject', tree, si, 1)} title="پایین">
                      <ChevronDown size={12} />
                    </button>
                    <button type="button" className={styles.iconBtn} onClick={() => { setAddingChapterFor(s.id); ensureExpanded(s.id); setChapterTitle('') }} title="فصل جدید">
                      <Plus size={12} />
                    </button>
                    <button type="button" className={styles.iconBtn} onClick={() => deleteSubject(s.id)} title="حذف">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {sOpen ? (
                  <div className={styles.currChildren}>
                    {addingChapterFor === s.id ? (
                      <div className={styles.currInlineAdd}>
                        <input
                          className={styles.input}
                          autoFocus
                          placeholder="عنوان فصل"
                          value={chapterTitle}
                          onChange={(e) => setChapterTitle(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && createChapter(s.id)}
                        />
                        <button type="button" className={styles.btnAccent} onClick={() => createChapter(s.id)}>افزودن</button>
                        <button type="button" className={styles.btnGhost} onClick={() => setAddingChapterFor(null)}>لغو</button>
                      </div>
                    ) : null}

                    {(s.chapters || []).map((c, ci) => {
                      const cOpen = expanded[`c-${c.id}`] !== false
                      const chapters = s.chapters || []
                      return (
                        <div key={c.id} className={styles.currNode}>
                          <div className={styles.currRow}>
                            <button
                              type="button"
                              className={`${styles.currToggle} ${styles.currToggleChapter}`}
                              onClick={() => setExpanded((p) => ({ ...p, [`c-${c.id}`]: !cOpen }))}
                            >
                              <Layers size={13} />
                              <span>{c.title}</span>
                            </button>
                            <div className={styles.currTools}>
                              <button type="button" className={styles.iconBtn} disabled={ci === 0} onClick={() => moveItem('chapter', chapters, ci, -1)}>
                                <ChevronUp size={12} />
                              </button>
                              <button type="button" className={styles.iconBtn} disabled={ci === chapters.length - 1} onClick={() => moveItem('chapter', chapters, ci, 1)}>
                                <ChevronDown size={12} />
                              </button>
                              <button
                                type="button"
                                className={styles.iconBtn}
                                onClick={() => { setAddingLessonFor(c.id); ensureExpanded(s.id, c.id); setLessonTitle('') }}
                                title="درس جدید"
                              >
                                <Plus size={12} />
                              </button>
                              <button type="button" className={styles.iconBtn} onClick={() => deleteChapter(c.id)}>
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                          {cOpen ? (
                            <div className={styles.currChildren}>
                              {addingLessonFor === c.id ? (
                                <div className={styles.currInlineAdd}>
                                  <input
                                    className={styles.input}
                                    autoFocus
                                    placeholder="عنوان درس"
                                    value={lessonTitle}
                                    onChange={(e) => setLessonTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && createLesson(c.id, s.id)}
                                  />
                                  <button type="button" className={styles.btnAccent} onClick={() => createLesson(c.id, s.id)}>ساخت</button>
                                  <button type="button" className={styles.btnGhost} onClick={() => setAddingLessonFor(null)}>لغو</button>
                                </div>
                              ) : null}

                              {(c.lessons || []).map((l, li) => {
                                const lessons = c.lessons || []
                                const active = selectedLesson?.id === l.id
                                return (
                                  <div key={l.id} className={`${styles.currLessonRow} ${active ? styles.currLessonOn : ''}`}>
                                    <button
                                      type="button"
                                      className={styles.currLessonBtn}
                                      onClick={() => onOpenLesson?.(l.id)}
                                    >
                                      <BookOpen size={12} />
                                      <span>{l.title}</span>
                                    </button>
                                    <div className={styles.currTools}>
                                      <button type="button" className={styles.iconBtn} disabled={li === 0} onClick={() => moveItem('lesson', lessons, li, -1)}>
                                        <ChevronUp size={12} />
                                      </button>
                                      <button type="button" className={styles.iconBtn} disabled={li === lessons.length - 1} onClick={() => moveItem('lesson', lessons, li, 1)}>
                                        <ChevronDown size={12} />
                                      </button>
                                      <button type="button" className={styles.iconBtn} onClick={() => deleteLesson(l.id)}>
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>
                                )
                              })}
                              {!(c.lessons || []).length && addingLessonFor !== c.id ? (
                                <p className={styles.currEmptyHint}>درسی نیست — + را بزنید</p>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      )
                    })}
                    {!(s.chapters || []).length && addingChapterFor !== s.id ? (
                      <p className={styles.currEmptyHint}>فصلی نیست — + را بزنید</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )
          })}
          {!tree.length ? <p className={styles.empty}>هنوز دسته‌ای نساخته‌اید</p> : null}
        </div>
      </aside>

      {/* ستون ویرایش درس */}
      <section className={styles.curriculumEditor}>
        {!lessonForm || !selectedLesson ? (
          <div className={styles.currEditorEmpty}>
            <BookOpen size={28} />
            <strong>ویرایش درس</strong>
            <p>
              از ستون ساختار یک درس را انتخاب کنید، یا با + روی فصل، درس جدید بسازید.
              محتوا، تصویر، ویدیو و تمرین‌ها همین‌جا ویرایش می‌شوند.
            </p>
          </div>
        ) : (
          <div className={styles.currEditorScroll}>
            <div className={styles.panelHead}>
              <div>
                <h2 className={styles.panelTitle}>{lessonForm.title || 'درس بدون عنوان'}</h2>
                {selectedMeta ? (
                  <p className={styles.metaMuted}>
                    {[selectedMeta.subject, selectedMeta.chapter].filter(Boolean).join(' · ')}
                  </p>
                ) : null}
              </div>
              <div className={styles.formActions}>
                <button type="button" className={styles.btnGhost} onClick={onClearLesson}>بستن</button>
                <button type="button" className={styles.btnAccent} onClick={handleSave} disabled={saving}>
                  <Save size={14} /> {saving ? '...' : 'ذخیره'}
                </button>
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label>عنوان</label>
                  <input value={lessonForm.title} onChange={(e) => setForm({ title: e.target.value })} />
                </div>
                <div className={styles.field}>
                  <label>اهمیت</label>
                  <select value={lessonForm.importance} onChange={(e) => setForm({ importance: e.target.value })}>
                    {IMPORTANCE.map((i) => <option key={i.v} value={i.v}>{i.l}</option>)}
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label>تصویر شاخص</label>
                  <DropZone
                    accept="image/*"
                    label="تصویر را رها کنید (حداکثر ۵ مگابایت)"
                    preview={lessonForm.coverFile ? URL.createObjectURL(lessonForm.coverFile) : lessonForm.coverPreview}
                    previewFile={lessonForm.coverFile}
                    onFile={onCoverFile}
                  />
                  <p className={styles.fieldHint}>حداکثر حجم تصویر شاخص: ۵ مگابایت</p>
                </div>
                <div className={styles.field}>
                  <label>ویدیو</label>
                  <DropZone
                    accept="video/*"
                    label="ویدیو را رها کنید (حداکثر ۸۰ مگابایت)"
                    preview={lessonForm.videoFile ? URL.createObjectURL(lessonForm.videoFile) : lessonForm.videoPreview}
                    previewFile={lessonForm.videoFile}
                    onFile={onVideoFile}
                  />
                  <p className={styles.fieldHint}>حداکثر حجم فایل ویدیو: ۸۰ مگابایت</p>
                  <input
                    className={styles.input}
                    style={{ marginTop: 8 }}
                    placeholder="https://www.aparat.com/v/..."
                    dir="ltr"
                    value={lessonForm.video_url}
                    onChange={(e) => setForm({ video_url: e.target.value })}
                  />
                  <p className={styles.fieldHint}>
                    اگر به‌جای آپلود، لینک می‌گذارید باید از <strong>آپارات</strong> باشد
                    (مثال: aparat.com)
                  </p>
                </div>
              </div>

              <div className={styles.field}>
                <label>متن درس</label>
                <div className={styles.editorShell}>
                  <CKEditorWrapper
                    value={lessonForm.content_html}
                    onChange={(html) => setForm({ content_html: html })}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label>زمان تخمینی (دقیقه)</label>
                  <input
                    type="number"
                    value={lessonForm.estimated_minutes}
                    onChange={(e) => setForm({ estimated_minutes: e.target.value })}
                  />
                </div>
                <label className={styles.checkRow}>
                  <input
                    type="checkbox"
                    checked={!!lessonForm.is_active}
                    onChange={(e) => setForm({ is_active: e.target.checked })}
                  />
                  درس فعال باشد
                </label>
              </div>
            </div>

            <div className={styles.sideBlock}>
              <div className={styles.sideBlockHead}>
                <div className={styles.sideBlockTitle}>
                  <span className={styles.sideBlockIcon}><Paperclip size={14} /></span>
                  <div>
                    <strong>پیوست فایل</strong>
                    <p>PDF، ورد، تصویر و سایر فایل‌های درس</p>
                  </div>
                </div>
                <span className={styles.pill}>{(selectedLesson.attachments || []).length} فایل</span>
              </div>

              <label className={styles.attachDrop}>
                <span className={styles.attachDropIcon}><Upload size={18} /></span>
                <span>
                  <strong>آپلود پیوست</strong>
                  <small>فایل را اینجا رها کنید یا برای انتخاب کلیک کنید</small>
                </span>
                <input
                  type="file"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) onAddAttachment?.(f)
                    e.target.value = ''
                  }}
                />
              </label>

              <div className={styles.attachGrid}>
                {(selectedLesson.attachments || []).map((a) => (
                  <div key={a.id} className={styles.attachCard}>
                    <span className={styles.attachCardIcon}><FileText size={16} /></span>
                    <div className={styles.attachCardBody}>
                      <a href={a.file_url} target="_blank" rel="noreferrer">{a.title || 'فایل'}</a>
                      <small>پیوست درس</small>
                    </div>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      title="حذف"
                      onClick={() => onDeleteAttachment?.(a.id)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
              {!(selectedLesson.attachments || []).length ? (
                <p className={styles.sideBlockEmpty}>هنوز فایلی پیوست نشده</p>
              ) : null}
            </div>

            <div className={styles.sideBlock}>
              <div className={styles.sideBlockHead}>
                <div className={styles.sideBlockTitle}>
                  <span className={styles.sideBlockIcon}><ClipboardList size={14} /></span>
                  <div>
                    <strong>تمرین‌ها</strong>
                    <p>تکالیفی که دانش‌آموز باید انجام دهد</p>
                  </div>
                </div>
                <button type="button" className={styles.btnAccent} onClick={onAddExercise}>
                  <Plus size={14} /> تمرین جدید
                </button>
              </div>

              <div className={styles.exGrid}>
                {exercises.map((ex, idx) => (
                  <article key={ex.id} className={styles.exCard}>
                    <span className={styles.exIndex}>{idx + 1}</span>
                    <div className={styles.exBody}>
                      <strong>{ex.title}</strong>
                      {ex.description ? (
                        <p>{ex.description}</p>
                      ) : (
                        <p className={styles.exMuted}>بدون توضیح</p>
                      )}
                    </div>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      title="حذف تمرین"
                      onClick={() => onDeleteExercise?.(ex.id)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </article>
                ))}
              </div>
              {!exercises.length ? (
                <div className={styles.sideBlockEmptyBox}>
                  <ClipboardList size={20} />
                  <strong>تمرینی ثبت نشده</strong>
                  <p>با دکمه «تمرین جدید» اولین تکلیف این درس را بسازید.</p>
                </div>
              ) : null}
            </div>

            <div className={styles.hintBox}>
              برای آزمون، سوالات را در تب <strong>بانک سوال</strong> بسازید و از تب <strong>ایجاد آزمون</strong> آزمون تصادفی بسازید.
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
