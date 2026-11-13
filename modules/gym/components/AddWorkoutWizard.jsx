'use client'

import React, { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import {
  Calendar,
  Check,
  ChevronLeft,
  Dumbbell,
  Loader2,
  Plus,
  Sparkles,
  X,
} from 'lucide-react'
import { formatJalaliDate, toApiDate } from '@/modules/gym/utils/jalaliCalendar'
import ExercisePickerModal from './modals/ExercisePickerModal'
import styles from './AddWorkoutWizard.module.css'

const NAME_PRESETS = [
  'فول بادی',
  'بالاتنه',
  'پایین‌تنه',
  'سینه و پشت‌بازو',
  'پشت و جلوبازو',
  'سرشانه',
  'پا',
  'پوش',
  'پول',
  'کاردیو',
]
const NAME_CUSTOM = '__custom__'
const GOALS = ['حجمی', 'تعریف', 'قدرتی', 'استقامتی', 'فیتنس']
const SET_PRESETS = [2, 3, 4, 5]
const REP_PRESETS = ['8-10', '10-12', '12-15', '15-20']
const REST_PRESETS = [30, 45, 60, 90]

const mapGoalToApi = (t) =>
  ({
    حجمی: 'hypertrophy',
    تعریف: 'definition',
    قدرتی: 'strength',
    استقامتی: 'endurance',
    فیتنس: 'fitness',
  })[t] || 'hypertrophy'

const mapGoalFromApi = (t) =>
  ({
    hypertrophy: 'حجمی',
    definition: 'تعریف',
    strength: 'قدرتی',
    endurance: 'استقامتی',
    fitness: 'فیتنس',
  })[t] || t

const emptyDraft = () => ({
  exercise_library: null,
  title: '',
  image: '',
  sets: 3,
  reps: '12-15',
  restTime: 60,
})

const STEPS = [
  { id: 1, label: 'نام و هدف' },
  { id: 2, label: 'حرکات' },
  { id: 3, label: 'پایان' },
]

function mapExercise(e) {
  return {
    id: e.id,
    exercise_library: e.exercise_library,
    title: e.title,
    image: e.image_url || e.image || '',
    sets: e.sets,
    reps: e.reps,
    priority: e.order ?? e.priority ?? 1,
    isSuperSet: e.is_super_set ?? e.isSuperSet ?? false,
    superSetWith: e.super_set_with ?? e.superSetWith ?? null,
    restTime: e.rest_time ?? e.restTime ?? 60,
  }
}

/**
 * ویزارد درون‌صفحه‌ای افزودن برنامه — حتماً api والد (با businessSlug) را بگیرید
 */
export default function AddWorkoutWizard({
  api,
  memberId,
  selectedDate,
  onCancel,
  onSuccess,
}) {
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [nameKey, setNameKey] = useState(NAME_PRESETS[0])
  const [customName, setCustomName] = useState('')
  const [goal, setGoal] = useState(GOALS[0])
  const [program, setProgram] = useState(null)
  const [exercises, setExercises] = useState([])
  const [draft, setDraft] = useState(emptyDraft)
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    setStep(1)
    setSaving(false)
    setError('')
    setNameKey(NAME_PRESETS[0])
    setCustomName('')
    setGoal(GOALS[0])
    setProgram(null)
    setExercises([])
    setDraft(emptyDraft())
    setShowPicker(false)
  }, [selectedDate, memberId])

  const resolvedName = useMemo(() => {
    if (nameKey === NAME_CUSTOM) return String(customName || '').trim()
    return String(nameKey || '').trim()
  }, [nameKey, customName])

  const dateLabel = formatJalaliDate(selectedDate)

  const finishWithProgram = (nextExercises = exercises) => {
    if (program && typeof onSuccess === 'function') {
      onSuccess({
        ...program,
        exercises: nextExercises,
      })
    }
  }

  const handleCancel = () => {
    if (saving) return
    if (program) finishWithProgram()
    else onCancel?.()
  }

  const goCreateProgram = async () => {
    if (!api?.workoutPrograms?.create) {
      setError('ارتباط با باشگاه برقرار نیست. صفحه را تازه کنید.')
      return
    }
    if (!resolvedName) {
      setError(
        nameKey === NAME_CUSTOM
          ? 'عنوان دستی را بنویسید.'
          : 'یک نام برای برنامه انتخاب کنید.',
      )
      return
    }
    try {
      setSaving(true)
      setError('')
      const created = await api.workoutPrograms.create({
        member: memberId,
        name: resolvedName,
        schedule: 'daily',
        workout_type: mapGoalToApi(goal),
        date: toApiDate(selectedDate),
      })
      const mapped = {
        id: created.id,
        name: created.name,
        userName: created.member_name,
        schedule: created.schedule,
        type: mapGoalFromApi(created.workout_type),
        date: created.date,
        isApproved: false,
        isEditing: true,
        exercises: [],
      }
      setProgram(mapped)
      setExercises([])
      setStep(2)
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        'ثبت برنامه ممکن نشد.'
      setError(String(detail))
    } finally {
      setSaving(false)
    }
  }

  const handlePickExercise = (item) => {
    setDraft({
      exercise_library: item.id,
      title: item.title,
      image: item.image_url || '',
      sets: item.default_sets || 3,
      reps: item.default_reps || '12-15',
      restTime: item.default_rest_time || 60,
    })
    setShowPicker(false)
    setError('')
  }

  const addCurrentExercise = async () => {
    if (!program?.id) return
    if (!String(draft.title || '').trim()) {
      setError('اول یک حرکت از کتابخانه انتخاب کنید.')
      return
    }
    try {
      setSaving(true)
      setError('')
      await api.workoutPrograms.addExercise(program.id, {
        exercise_library: draft.exercise_library || null,
        title: draft.title,
        sets: draft.sets,
        reps: draft.reps,
        rest_time: draft.restTime,
      })
      const fresh = await api.workoutPrograms.detail(program.id)
      const list = (fresh.exercises || []).map(mapExercise)
      setExercises(list)
      setDraft(emptyDraft())
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          'افزودن حرکت ممکن نشد.',
      )
    } finally {
      setSaving(false)
    }
  }

  const goDone = () => setStep(3)

  const confirmDone = () => {
    finishWithProgram()
  }

  return (
    <div className={styles.inline} dir="rtl" lang="fa">
      <div className={styles.inlineHeader}>
        <div>
          <h3>افزودن برنامه جدید</h3>
          <p>مرحله‌به‌مرحله برای همین روز</p>
        </div>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={handleCancel}
          aria-label="بستن"
        >
          <X size={16} />
        </button>
      </div>

      <div className={styles.steps} aria-label="مراحل">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className={styles.stepItem}>
              <span
                className={clsx(
                  styles.stepDot,
                  step === s.id && styles.stepDotOn,
                  step > s.id && styles.stepDotDone,
                )}
              >
                {step > s.id ? <Check size={12} /> : s.id}
              </span>
              <span
                className={clsx(
                  styles.stepLabel,
                  step === s.id && styles.stepLabelOn,
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 ? (
              <div
                className={clsx(styles.stepLine, step > s.id && styles.stepLineOn)}
              />
            ) : null}
          </React.Fragment>
        ))}
      </div>

      <div className={styles.body}>
        {error ? <p className={styles.error}>{error}</p> : null}

        {step === 1 ? (
          <>
            <span className={styles.datePill}>
              <Calendar size={13} />
              {dateLabel}
            </span>

            <p className={styles.sectionLabel}>نام برنامه</p>
            <p className={styles.hint}>یکی را انتخاب کنید یا عنوان دستی بزنید.</p>
            <div className={styles.chipGrid} role="group" aria-label="نام برنامه">
              {NAME_PRESETS.map((name) => (
                <button
                  key={name}
                  type="button"
                  className={clsx(styles.chip, nameKey === name && styles.chipOn)}
                  onClick={() => setNameKey(name)}
                >
                  {nameKey === name ? <Check size={12} /> : null}
                  {name}
                </button>
              ))}
              <button
                type="button"
                className={clsx(
                  styles.chip,
                  nameKey === NAME_CUSTOM && styles.chipOn,
                )}
                onClick={() => setNameKey(NAME_CUSTOM)}
              >
                {nameKey === NAME_CUSTOM ? <Check size={12} /> : null}
                عنوان دستی
              </button>
            </div>

            {nameKey === NAME_CUSTOM ? (
              <div className={styles.field}>
                <label htmlFor="inline-workout-custom-name">عنوان دستی</label>
                <input
                  id="inline-workout-custom-name"
                  type="text"
                  placeholder="مثلاً: سینه + سرشانه سبک"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  autoFocus
                />
              </div>
            ) : null}

            <p className={styles.sectionLabel}>هدف</p>
            <div className={styles.chipGrid} role="group" aria-label="هدف">
              {GOALS.map((g) => (
                <button
                  key={g}
                  type="button"
                  className={clsx(styles.chip, goal === g && styles.chipOn)}
                  onClick={() => setGoal(g)}
                >
                  {goal === g ? <Check size={12} /> : null}
                  {g}
                </button>
              ))}
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div className={styles.programBanner}>
              <div>
                <strong>{program?.name}</strong>
                <div>
                  <span>{program?.type || goal}</span>
                  {' · '}
                  <span>{dateLabel}</span>
                </div>
              </div>
              <Dumbbell size={18} />
            </div>

            <div className={styles.step2Grid}>
              <section className={styles.step2Col} aria-label="انتخاب از کتابخانه">
                <header className={styles.colHead}>
                  <h4>انتخاب حرکت</h4>
                  <p>از کتابخانه بردارید و ست/تکرار را تنظیم کنید</p>
                </header>

                <div className={styles.composer}>
                  {draft.title ? (
                    <div className={styles.selectedMove}>
                      <div className={styles.selectedMoveMain}>
                        {draft.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={draft.image} alt="" width={40} height={40} />
                        ) : (
                          <span className={styles.selectedMoveThumb}>
                            <Dumbbell size={16} />
                          </span>
                        )}
                        <strong>{draft.title}</strong>
                      </div>
                      <button type="button" onClick={() => setShowPicker(true)}>
                        تغییر
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={styles.pickBtn}
                      onClick={() => setShowPicker(true)}
                    >
                      <Dumbbell size={16} />
                      انتخاب از کتابخانه
                    </button>
                  )}

                  <div className={styles.metricRow}>
                    <div className={styles.metricBlock}>
                      <span>ست</span>
                      <div className={styles.miniChips}>
                        {SET_PRESETS.map((n) => (
                          <button
                            key={n}
                            type="button"
                            className={clsx(
                              styles.miniChip,
                              draft.sets === n && styles.miniChipOn,
                            )}
                            onClick={() => setDraft({ ...draft, sets: n })}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.metricBlock}>
                      <span>تکرار</span>
                      <div className={styles.miniChips}>
                        {REP_PRESETS.map((n) => (
                          <button
                            key={n}
                            type="button"
                            className={clsx(
                              styles.miniChip,
                              draft.reps === n && styles.miniChipOn,
                            )}
                            onClick={() => setDraft({ ...draft, reps: n })}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.metricBlock}>
                      <span>استراحت (ثانیه)</span>
                      <div className={styles.miniChips}>
                        {REST_PRESETS.map((n) => (
                          <button
                            key={n}
                            type="button"
                            className={clsx(
                              styles.miniChip,
                              draft.restTime === n && styles.miniChipOn,
                            )}
                            onClick={() => setDraft({ ...draft, restTime: n })}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={styles.addMoveBtn}
                    onClick={addCurrentExercise}
                    disabled={saving || !draft.title}
                  >
                    {saving ? (
                      <Loader2 size={15} className={styles.spin} />
                    ) : (
                      <Plus size={15} />
                    )}
                    افزودن به لیست
                  </button>
                </div>
              </section>

              <section className={styles.step2Col} aria-label="حرکات انتخاب‌شده">
                <header className={styles.colHead}>
                  <h4>لیست انتخاب‌شده</h4>
                  <p>
                    {exercises.length
                      ? `${exercises.length.toLocaleString('fa-IR')} حرکت`
                      : 'هنوز خالی است'}
                  </p>
                </header>

                {exercises.length ? (
                  <div className={styles.exerciseList}>
                    {exercises.map((ex, idx) => (
                      <div key={ex.id} className={styles.exerciseItem}>
                        <span className={styles.exerciseIndex}>{idx + 1}</span>
                        <div className={styles.exerciseItemBody}>
                          <strong>{ex.title}</strong>
                          <em>
                            {ex.sets} ست × {ex.reps} · استراحت {ex.restTime}ث
                          </em>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyExercises}>
                    بعد از تنظیم، با «افزودن به لیست» اینجا دیده می‌شود.
                  </p>
                )}
              </section>
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <div className={styles.doneBox}>
            <div className={styles.doneIcon}>
              <Sparkles size={22} />
            </div>
            <h4>برنامه آماده شد</h4>
            <p>
              «{program?.name}» با {exercises.length.toLocaleString('fa-IR')} حرکت برای{' '}
              {dateLabel} ثبت شد.
            </p>
          </div>
        ) : null}
      </div>

      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          {step === 1 ? (
            <button type="button" className={styles.btnGhost} onClick={handleCancel}>
              انصراف
            </button>
          ) : null}
          {step === 2 ? (
            <button
              type="button"
              className={styles.btnGhost}
              onClick={goDone}
              disabled={saving}
            >
              بدون حرکت بیشتر
            </button>
          ) : null}
        </div>
        <div className={styles.footerRight}>
          {step === 1 ? (
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={goCreateProgram}
              disabled={saving}
            >
              {saving ? <Loader2 size={15} className={styles.spin} /> : null}
              ادامه
              <ChevronLeft size={15} />
            </button>
          ) : null}
          {step === 2 ? (
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={goDone}
              disabled={saving}
            >
              تمام شد
              <Check size={15} />
            </button>
          ) : null}
          {step === 3 ? (
            <button type="button" className={styles.btnPrimary} onClick={confirmDone}>
              مشاهده برنامه
              <Check size={15} />
            </button>
          ) : null}
        </div>
      </div>

      <ExercisePickerModal
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handlePickExercise}
      />
    </div>
  )
}
