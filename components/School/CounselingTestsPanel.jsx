'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Brain, ImagePlus, Lightbulb, Plus, Save, Trash2, Users, X,
} from 'lucide-react'
import schoolService from '@/components/School/services/schoolService'
import styles from './School.module.css'

const KINDS = [
  { value: 'iq', label: 'تست هوش (IQ)' },
  { value: 'eq', label: 'هوش هیجانی (EQ)' },
  { value: 'personality', label: 'شخصیت' },
  { value: 'career', label: 'هدایت تحصیلی / شغلی' },
  { value: 'interest', label: 'علاقه‌مندی' },
  { value: 'custom', label: 'سایر' },
]

const OPT_KEYS = 'abcdefghijklmnopqrstuvwxyz'.split('')

const emptyOpt = (key, score = 0) => ({ key, text: '', score, image: '' })

const emptyQ = () => ({
  text: '',
  image_url: '',
  hint: '',
  options: ['a', 'b', 'c', 'd'].map((k, i) => emptyOpt(k, i === 0 ? 1 : 0)),
})

const defaultSettings = () => ({
  questions_per_attempt: 0,
  shuffle_questions: true,
  shuffle_options: true,
  timed_questions: true,
  seconds_per_question: 30,
  allow_back: false,
})

function MediaThumb({ url, onClear }) {
  if (!url) return null
  return (
    <div className={styles.ctMediaPreview}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" />
      {onClear ? (
        <button type="button" className={styles.ctMediaClear} onClick={onClear} title="حذف تصویر">
          <X size={12} />
        </button>
      ) : null}
    </div>
  )
}

function ImagePickButton({ onPicked, onNotify, label = 'تصویر' }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    const res = await schoolService.upload(file)
    setBusy(false)
    if (!res.success) {
      onNotify?.(res.error || 'آپلود ناموفق', true)
      return
    }
    const url = res.data?.url || res.data?.data?.url
    if (!url) {
      onNotify?.('آدرس تصویر برنگشت', true)
      return
    }
    onPicked(url)
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={onFile} />
      <button
        type="button"
        className={styles.ctImgBtn}
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlus size={12} />
        {busy ? '…' : label}
      </button>
    </>
  )
}

function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className={styles.ctToggle}>
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={styles.ctToggleUi} aria-hidden />
      <span className={styles.ctToggleText}>
        <strong>{label}</strong>
        {hint ? <em>{hint}</em> : null}
      </span>
    </label>
  )
}

export default function CounselingTestsPanel({ onNotify }) {
  const [tests, setTests] = useState([])
  const [classes, setClasses] = useState([])
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [activeQ, setActiveQ] = useState(0)

  const load = useCallback(async () => {
    const [testsRes, classesRes] = await Promise.all([
      schoolService.listCounselingTests({ include_inactive: '1' }),
      schoolService.classes(),
    ])
    if (testsRes.success) setTests(testsRes.data || [])
    else onNotify?.(testsRes.error, true)
    if (classesRes.success) {
      const rows = Array.isArray(classesRes.data)
        ? classesRes.data
        : (classesRes.data?.results || [])
      setClasses(rows.filter((c) => c.is_active !== false))
    } else {
      onNotify?.(classesRes.error || 'خطا در دریافت کلاس‌ها', true)
    }
  }, [onNotify])

  useEffect(() => { load() }, [load])

  const openNew = () => {
    setEditing({
      id: null,
      title: '',
      kind: 'iq',
      description: '',
      duration_minutes: 20,
      is_active: true,
      allowed_class_ids: [],
      ...defaultSettings(),
      questions: [emptyQ()],
    })
    setActiveQ(0)
  }

  const openEdit = async (id) => {
    const res = await schoolService.getCounselingTest(id)
    if (!res.success) {
      onNotify?.(res.error, true)
      return
    }
    const questions = (res.data.questions || []).length
      ? res.data.questions.map((q) => ({
        ...q,
        image_url: q.image_url || '',
        hint: q.hint || '',
        options: (q.options || []).length
          ? q.options.map((o) => ({
            key: o.key,
            text: o.text || '',
            score: o.score ?? 0,
            image: o.image || o.image_url || '',
          }))
          : ['a', 'b', 'c', 'd'].map((k, i) => emptyOpt(k, i === 0 ? 1 : 0)),
      }))
      : [emptyQ()]
    const allowedIds = (res.data.allowed_classes || []).map((c) => c.id)
    setEditing({
      ...defaultSettings(),
      ...res.data,
      allowed_class_ids: allowedIds,
      questions,
    })
    setActiveQ(0)
  }

  const toggleClass = (classId) => {
    const id = Number(classId)
    setEditing((p) => {
      const cur = new Set((p.allowed_class_ids || []).map(Number))
      if (cur.has(id)) cur.delete(id)
      else cur.add(id)
      return { ...p, allowed_class_ids: [...cur] }
    })
  }

  const selectAllClasses = () => {
    setEditing((p) => ({ ...p, allowed_class_ids: classes.map((c) => c.id) }))
  }

  const clearClasses = () => {
    setEditing((p) => ({ ...p, allowed_class_ids: [] }))
  }

  const patchQ = (qi, patch) => {
    setEditing((p) => {
      const questions = [...p.questions]
      questions[qi] = { ...questions[qi], ...patch }
      return { ...p, questions }
    })
  }

  const patchOpt = (qi, oi, patch) => {
    setEditing((p) => {
      const questions = [...p.questions]
      const options = [...(questions[qi].options || [])]
      options[oi] = { ...options[oi], ...patch }
      questions[qi] = { ...questions[qi], options }
      return { ...p, questions }
    })
  }

  const addOption = (qi) => {
    setEditing((p) => {
      const questions = [...p.questions]
      const options = [...(questions[qi].options || [])]
      const used = new Set(options.map((o) => o.key))
      const key = OPT_KEYS.find((k) => !used.has(k)) || `o${options.length + 1}`
      options.push(emptyOpt(key, 0))
      questions[qi] = { ...questions[qi], options }
      return { ...p, questions }
    })
  }

  const removeOption = (qi, oi) => {
    setEditing((p) => {
      const questions = [...p.questions]
      const options = [...(questions[qi].options || [])]
      if (options.length <= 2) return p
      options.splice(oi, 1)
      questions[qi] = { ...questions[qi], options }
      return { ...p, questions }
    })
  }

  const save = async () => {
    if (!editing?.title?.trim()) {
      onNotify?.('عنوان الزامی است', true)
      return
    }
    const allowedIds = (editing.allowed_class_ids || []).map(Number).filter(Boolean)
    if (!allowedIds.length) {
      onNotify?.('حداقل یک کلاس مجاز انتخاب کنید — بدون کلاس، هیچ دانش‌آموزی آزمون را نمی‌بیند', true)
      return
    }
    const bankSize = (editing.questions || []).filter(
      (q) => (q.text || '').trim() || (q.image_url || '').trim(),
    ).length
    const per = Number(editing.questions_per_attempt) || 0
    if (per > 0 && per > bankSize) {
      onNotify?.('تعداد سوال تصادفی نمی‌تواند بیشتر از بانک باشد', true)
      return
    }
    const payload = {
      title: editing.title.trim(),
      kind: editing.kind,
      description: editing.description || '',
      duration_minutes: Number(editing.duration_minutes) || 20,
      questions_per_attempt: per,
      shuffle_questions: editing.shuffle_questions !== false,
      shuffle_options: editing.shuffle_options !== false,
      timed_questions: editing.timed_questions !== false,
      seconds_per_question: Math.max(5, Number(editing.seconds_per_question) || 30),
      allow_back: !!editing.allow_back,
      is_active: editing.is_active !== false,
      allowed_class_ids: allowedIds,
      questions: (editing.questions || [])
        .filter((q) => (q.text || '').trim() || (q.image_url || '').trim())
        .map((q, i) => ({
          id: q.id || undefined,
          text: (q.text || '').trim(),
          image_url: (q.image_url || '').trim(),
          hint: (q.hint || '').trim(),
          order: i,
          options: (q.options || [])
            .filter((o) => (o.text || '').trim() || (o.image || '').trim())
            .map((o) => ({
              key: o.key,
              text: o.text || '',
              score: Number(o.score) || 0,
              image: o.image || '',
            })),
        })),
    }
    if (!payload.questions.length) {
      onNotify?.('حداقل یک سوال در بانک لازم است', true)
      return
    }
    setSaving(true)
    const res = editing.id
      ? await schoolService.updateCounselingTest(editing.id, payload)
      : await schoolService.createCounselingTest(payload)
    setSaving(false)
    if (!res.success) {
      onNotify?.(res.error, true)
      return
    }
    onNotify?.('بانک آزمون ذخیره شد', false)
    setEditing(null)
    load()
  }

  const remove = async (id) => {
    const res = await schoolService.deleteCounselingTest(id)
    if (!res.success) onNotify?.(res.error, true)
    else {
      onNotify?.('غیرفعال شد', false)
      load()
    }
  }

  if (editing) {
    const q = editing.questions[activeQ] || editing.questions[0]
    const qi = Math.min(activeQ, Math.max(0, editing.questions.length - 1))
    const bankSize = editing.questions.length

    return (
      <div className={styles.ctEditor}>
        <div className={styles.ctEditorHead}>
          <div>
            <p className={styles.ctEyebrow}>{editing.id ? 'ویرایش بانک' : 'بانک سوال جدید'}</p>
            <h2 className={styles.ctEditorTitle}>
              <Brain size={15} /> {editing.title?.trim() || 'بدون عنوان'}
            </h2>
          </div>
          <div className={styles.ctEditorActions}>
            <button type="button" className={styles.btnGhost} onClick={() => setEditing(null)}>انصراف</button>
            <button type="button" className={styles.btnAccent} disabled={saving} onClick={save}>
              <Save size={13} /> {saving ? '…' : 'ذخیره'}
            </button>
          </div>
        </div>

        <div className={styles.ctMetaGrid}>
          <div className={styles.field}>
            <label>عنوان</label>
            <input
              value={editing.title}
              onChange={(e) => setEditing((p) => ({ ...p, title: e.target.value }))}
              placeholder="نام آزمون / بانک"
            />
          </div>
          <div className={styles.field}>
            <label>نوع</label>
            <select value={editing.kind} onChange={(e) => setEditing((p) => ({ ...p, kind: e.target.value }))}>
              {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label>مدت کل (دقیقه)</label>
            <input
              type="number"
              value={editing.duration_minutes}
              onChange={(e) => setEditing((p) => ({ ...p, duration_minutes: e.target.value }))}
            />
          </div>
        </div>

        <div className={styles.field} style={{ marginTop: 8 }}>
          <label>توضیح کوتاه</label>
          <input
            value={editing.description}
            onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))}
            placeholder="اختیاری"
          />
        </div>

        <div className={styles.ctClassTarget}>
          <div className={styles.ctClassTargetHead}>
            <h3 className={styles.ctSettingsTitle}>
              <Users size={14} /> کلاس‌های مجاز برگزاری
            </h3>
            <div className={styles.ctClassTargetActs}>
              <button type="button" className={styles.ctClassMiniBtn} onClick={selectAllClasses}>همه</button>
              <button type="button" className={styles.ctClassMiniBtn} onClick={clearClasses}>هیچ‌کدام</button>
            </div>
          </div>
          <p className={styles.ctFieldHint}>
            فقط دانش‌آموزان این کلاس‌ها آزمون را می‌بینند و می‌توانند شرکت کنند. بدون انتخاب کلاس، آزمون برای کسی نمایش داده نمی‌شود.
          </p>
          {!classes.length ? (
            <p className={styles.ctFieldHint}>هنوز کلاسی تعریف نشده — از بخش کلاس‌ها اضافه کنید.</p>
          ) : (
            <div className={styles.ctClassChips}>
              {classes.map((c) => {
                const on = (editing.allowed_class_ids || []).map(Number).includes(Number(c.id))
                const label = c.display_title || c.title || `${c.grade_label || ''} · ${c.section || ''}`.trim()
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`${styles.ctClassChip} ${on ? styles.ctClassChipOn : ''}`}
                    onClick={() => toggleClass(c.id)}
                    aria-pressed={on}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          )}
          <p className={styles.ctClassCount}>
            {(editing.allowed_class_ids || []).length} از {classes.length} کلاس انتخاب شده
          </p>
        </div>

        <div className={styles.ctSettings}>
          <h3 className={styles.ctSettingsTitle}>تنظیمات نمایش برای هر نفر</h3>
          <div className={styles.ctSettingsGrid}>
            <div className={styles.field}>
              <label>تعداد سوال تصادفی از بانک</label>
              <input
                type="number"
                min={0}
                max={bankSize}
                value={editing.questions_per_attempt ?? 0}
                onChange={(e) => setEditing((p) => ({ ...p, questions_per_attempt: e.target.value }))}
              />
              <p className={styles.ctFieldHint}>
                ۰ = همه ({bankSize} سوال). مثلاً ۱۰ یعنی از بانک، ۱۰ سوال تصادفی.
              </p>
            </div>
            <div className={styles.field}>
              <label>ثانیه هر سوال</label>
              <input
                type="number"
                min={5}
                value={editing.seconds_per_question ?? 30}
                disabled={!editing.timed_questions}
                onChange={(e) => setEditing((p) => ({ ...p, seconds_per_question: e.target.value }))}
              />
            </div>
            <div className={styles.ctToggleStack}>
              <Toggle
                checked={editing.shuffle_questions}
                onChange={(v) => setEditing((p) => ({ ...p, shuffle_questions: v }))}
                label="جابه‌جایی ترتیب سوالات"
                hint="ترتیب برای هر نفر فرق کند"
              />
              <Toggle
                checked={editing.shuffle_options}
                onChange={(v) => setEditing((p) => ({ ...p, shuffle_options: v }))}
                label="جابه‌جایی گزینه‌ها"
                hint="گزینه‌های هر سوال تصادفی شوند"
              />
              <Toggle
                checked={editing.timed_questions}
                onChange={(v) => setEditing((p) => ({ ...p, timed_questions: v }))}
                label="زمان مشخص برای هر سوال"
                hint="اگر خاموش باشد تایمر سوال نداریم"
              />
              <Toggle
                checked={editing.allow_back}
                onChange={(v) => setEditing((p) => ({ ...p, allow_back: v }))}
                label="مجاز به برگشت به سوال قبل"
                hint="دکمه قبلی و مرور پاسخ‌ها"
              />
            </div>
          </div>
        </div>

        <div className={styles.ctQBar}>
          <div>
            <span className={styles.ctBankLabel}>بانک سوال ({bankSize})</span>
            <div className={styles.ctQPills}>
              {editing.questions.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`${styles.ctQPill} ${i === qi ? styles.ctQPillOn : ''}`}
                  onClick={() => setActiveQ(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            className={styles.ctAddQ}
            onClick={() => {
              setEditing((p) => ({ ...p, questions: [...p.questions, emptyQ()] }))
              setActiveQ(editing.questions.length)
            }}
          >
            <Plus size={13} /> سوال به بانک
          </button>
        </div>

        {q ? (
          <div className={styles.ctQCard} key={qi}>
            <div className={styles.ctQCardTop}>
              <span className={styles.ctQBadge}>سوال بانک {qi + 1}</span>
              {editing.questions.length > 1 ? (
                <button
                  type="button"
                  className={styles.tpIconDel}
                  onClick={() => {
                    setEditing((p) => ({
                      ...p,
                      questions: p.questions.filter((_, i) => i !== qi),
                    }))
                    setActiveQ((prev) => Math.max(0, Math.min(prev, editing.questions.length - 2)))
                  }}
                >
                  <Trash2 size={13} />
                </button>
              ) : null}
            </div>

            <div className={styles.ctQGrid}>
              <div className={styles.ctQCol}>
                <div className={styles.field}>
                  <label>متن سوال</label>
                  <textarea
                    rows={3}
                    value={q.text || ''}
                    onChange={(e) => patchQ(qi, { text: e.target.value })}
                    placeholder="متن… یا فقط تصویر"
                  />
                </div>
                <div className={styles.ctMediaRow}>
                  <ImagePickButton
                    label="تصویر سوال"
                    onNotify={onNotify}
                    onPicked={(url) => patchQ(qi, { image_url: url })}
                  />
                  <MediaThumb url={q.image_url} onClear={() => patchQ(qi, { image_url: '' })} />
                </div>
              </div>

              <div className={styles.ctQCol}>
                <div className={`${styles.field} ${styles.ctHintField}`}>
                  <label><Lightbulb size={12} /> راهنمای سوال</label>
                  <textarea
                    rows={3}
                    value={q.hint || ''}
                    onChange={(e) => patchQ(qi, { hint: e.target.value })}
                    placeholder="نکته کمکی…"
                  />
                </div>
                {q.hint ? (
                  <div className={styles.ctHintPreview}>
                    <Lightbulb size={14} />
                    <p>{q.hint}</p>
                  </div>
                ) : null}
              </div>

              <div className={styles.ctQCol}>
                <div className={styles.ctOptsHead}>
                  <p className={styles.ctOptsLabel}>گزینه‌ها (۴ یا بیشتر)</p>
                  <button type="button" className={styles.ctAddOpt} onClick={() => addOption(qi)}>
                    <Plus size={12} /> گزینه
                  </button>
                </div>
                <div className={styles.ctOpts}>
                  {(q.options || []).map((o, oi) => (
                    <div key={o.key || oi} className={styles.ctOptRow}>
                      <span className={styles.ctOptKey}>{String(o.key || '').toUpperCase()}</span>
                      <input
                        className={styles.ctOptText}
                        value={o.text || ''}
                        placeholder="متن گزینه"
                        onChange={(e) => patchOpt(qi, oi, { text: e.target.value })}
                      />
                      <input
                        className={styles.ctOptScore}
                        type="number"
                        value={o.score}
                        title="امتیاز"
                        onChange={(e) => patchOpt(qi, oi, { score: e.target.value })}
                      />
                      <ImagePickButton
                        label=""
                        onNotify={onNotify}
                        onPicked={(url) => patchOpt(qi, oi, { image: url })}
                      />
                      {o.image ? (
                        <MediaThumb url={o.image} onClear={() => patchOpt(qi, oi, { image: '' })} />
                      ) : null}
                      {(q.options || []).length > 2 ? (
                        <button
                          type="button"
                          className={styles.ctOptDel}
                          onClick={() => removeOption(qi, oi)}
                          title="حذف گزینه"
                        >
                          <X size={12} />
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className={styles.ctList}>
      <div className={styles.ctListHead}>
        <div>
          <h2 className={styles.panelTitle}><Brain size={15} /> بانک آزمون‌های مشاوره</h2>
          <p className={styles.ctListSub}>بانک سوال + هدف‌گذاری کلاس + تعداد تصادفی و زمان</p>
        </div>
        <button type="button" className={styles.btnAccent} onClick={openNew}>
          <Plus size={13} /> بانک جدید
        </button>
      </div>

      {!tests.length ? (
        <p className={styles.empty}>هنوز بانکی ساخته نشده</p>
      ) : (
        <div className={styles.ctGrid3}>
          {tests.map((t) => {
            const per = Number(t.questions_per_attempt) || 0
            const bank = t.question_count ?? 0
            return (
              <article key={t.id} className={`${styles.ctCard} ${t.is_active ? '' : styles.ctCardOff}`}>
                <div className={styles.ctCardTop}>
                  <span className={styles.ctKind}>{t.kind_label || t.kind}</span>
                  <span className={styles.ctStatus}>{t.is_active ? 'فعال' : 'غیرفعال'}</span>
                </div>
                <h3 className={styles.ctCardTitle}>{t.title}</h3>
                <p className={styles.ctCardMeta}>
                  بانک {bank} · نمایش {per > 0 ? per : 'همه'} · {t.duration_minutes}′
                </p>
                <p className={styles.ctCardClasses}>
                  <Users size={11} />
                  {(t.allowed_class_count ?? t.allowed_classes?.length ?? 0) > 0
                    ? `${t.allowed_class_count ?? t.allowed_classes.length} کلاس`
                    : 'بدون کلاس (مخفی)'}
                  {(t.allowed_classes || []).length > 0 ? (
                    <span>
                      {' — '}
                      {(t.allowed_classes || []).slice(0, 3).map((c) => c.title || c.grade_label).join('، ')}
                      {(t.allowed_classes || []).length > 3 ? '…' : ''}
                    </span>
                  ) : null}
                </p>
                <p className={styles.ctCardFlags}>
                  {t.shuffle_options ? 'جابه‌جایی گزینه' : 'گزینه ثابت'}
                  {' · '}
                  {t.timed_questions ? `${t.seconds_per_question || 30}ث` : 'بدون تایمر'}
                  {' · '}
                  {t.allow_back ? 'برگشت مجاز' : 'بدون برگشت'}
                </p>
                <div className={styles.ctCardActions}>
                  <button type="button" className={styles.btnGhost} onClick={() => openEdit(t.id)}>ویرایش</button>
                  {t.is_active ? (
                    <button type="button" className={styles.btnGhost} onClick={() => remove(t.id)}>حذف</button>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
