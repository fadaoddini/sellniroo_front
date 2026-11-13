'use client'

import React, { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import {
  Apple,
  Calendar,
  Check,
  ChevronLeft,
  Flame,
  Loader2,
  Plus,
  Sparkles,
  Utensils,
  X,
} from 'lucide-react'
import { formatJalaliDate, toApiDate } from '@/modules/gym/utils/jalaliCalendar'
import FoodPickerModal from './modals/FoodPickerModal'
import styles from './AddWorkoutWizard.module.css'

const NAME_PRESETS = [
  'رژیم حجمی',
  'کاهش وزن',
  'تثبیت وزن',
  'خشکی',
  'کات',
  'بالک',
  'کم‌کالری',
  'پرکالری',
  'وعده تمرینی',
]
const NAME_CUSTOM = '__custom__'

const DIET_TYPES = [
  { value: 'gain', label: 'افزایش وزن' },
  { value: 'loss', label: 'کاهش وزن' },
  { value: 'maintain', label: 'تثبیت وزن' },
  { value: 'bulk', label: 'حجمی' },
  { value: 'cut', label: 'خشک' },
  { value: 'special', label: 'تخصصی' },
]

const CALORIE_PRESETS = [1800, 2000, 2200, 2500, 2800, 3000]
const COUNT_UNITS = new Set(['piece', 'slice', 'tablespoon', 'teaspoon', 'cup', 'serving'])

const amountPresetsFor = (unit) => {
  switch (unit) {
    case 'piece':
      return [1, 2, 3, 4, 6, 8]
    case 'slice':
      return [1, 2, 3, 4, 6]
    case 'tablespoon':
      return [1, 2, 3, 4]
    case 'teaspoon':
      return [1, 2, 3]
    case 'cup':
      return [0.5, 1, 1.5, 2]
    case 'serving':
      return [1, 1.5, 2, 3]
    case 'ml':
      return [50, 100, 150, 200, 250, 300]
    default:
      return [30, 50, 80, 100, 150, 200]
  }
}

const defaultAmountFor = (unit, baseAmount) => {
  const base = Number(baseAmount)
  if (COUNT_UNITS.has(unit)) {
    if (base > 0 && base <= 12) return base
    return 1
  }
  if (base > 0 && base <= 500) return base
  return 100
}

const MEAL_TYPES = [
  { value: 'breakfast', label: 'صبحانه', time: '08:00' },
  { value: 'morning_snack', label: 'میان‌وعده صبح', time: '10:30' },
  { value: 'lunch', label: 'ناهار', time: '13:00' },
  { value: 'afternoon_snack', label: 'میان‌وعده عصر', time: '16:30' },
  { value: 'dinner', label: 'شام', time: '20:00' },
  { value: 'night_snack', label: 'میان‌وعده شب', time: '22:00' },
  { value: 'pre_workout', label: 'قبل از تمرین', time: '17:00' },
  { value: 'post_workout', label: 'بعد از تمرین', time: '19:00' },
]

const STEPS = [
  { id: 1, label: 'نام و هدف' },
  { id: 2, label: 'وعده‌ها' },
  { id: 3, label: 'پایان' },
]

const UNIT_LABEL = {
  gram: 'گرم',
  ml: 'میلی‌لیتر',
  piece: 'عدد',
  slice: 'برش',
  tablespoon: 'قاشق',
  teaspoon: 'قاشق چای',
  cup: 'لیوان',
  serving: 'پرس',
}

const emptyDraft = () => ({
  food_library: null,
  name: '',
  image: '',
  amount_value: 100,
  amount_unit: 'gram',
  base_amount: 100,
  base_calories: 0,
  base_protein: 0,
  base_carbs: 0,
  base_fat: 0,
})

const scaled = (draft, key) => {
  const base = Number(draft.base_amount) || 1
  const amt = Number(draft.amount_value) || 0
  return Math.round(((Number(draft[key]) || 0) * amt) / base)
}

export default function AddDietWizard({
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
  const [dietType, setDietType] = useState('bulk')
  const [calories, setCalories] = useState(2500)
  const [program, setProgram] = useState(null)
  const [meals, setMeals] = useState([])
  const [mealType, setMealType] = useState(MEAL_TYPES[0].value)
  const [draft, setDraft] = useState(emptyDraft)
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    setStep(1)
    setSaving(false)
    setError('')
    setNameKey(NAME_PRESETS[0])
    setCustomName('')
    setDietType('bulk')
    setCalories(2500)
    setProgram(null)
    setMeals([])
    setMealType(MEAL_TYPES[0].value)
    setDraft(emptyDraft())
    setShowPicker(false)
  }, [selectedDate, memberId])

  const resolvedName = useMemo(() => {
    if (nameKey === NAME_CUSTOM) return String(customName || '').trim()
    return String(nameKey || '').trim()
  }, [nameKey, customName])

  const dateLabel = formatJalaliDate(selectedDate)
  const dietTypeLabel =
    DIET_TYPES.find((t) => t.value === dietType)?.label || dietType
  const mealMeta = MEAL_TYPES.find((m) => m.value === mealType) || MEAL_TYPES[0]
  const foodCount = meals.reduce((n, m) => n + (m.items?.length || 0), 0)

  const finishWithProgram = (nextMeals = meals) => {
    if (program && typeof onSuccess === 'function') {
      onSuccess({
        ...program,
        meals: nextMeals,
        meals_count: nextMeals.length,
      })
    }
  }

  const handleCancel = () => {
    if (saving) return
    if (program) finishWithProgram()
    else onCancel?.()
  }

  const refreshProgram = async (programId) => {
    const fresh = await api.dietPrograms.detail(programId)
    setProgram(fresh)
    setMeals(fresh.meals || [])
    return fresh
  }

  const goCreateProgram = async () => {
    if (!api?.dietPrograms?.create) {
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
      const created = await api.dietPrograms.create({
        member: memberId,
        name: resolvedName,
        diet_type: dietType,
        total_calories: calories,
        date: toApiDate(selectedDate),
      })
      setProgram(created)
      setMeals(created.meals || [])
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

  const handlePickFood = (item) => {
    const unit = item.selected_unit || item.base_unit || 'gram'
    const baseAmount = Number(item.base_amount) || (COUNT_UNITS.has(unit) ? 1 : 100)
    const picked = Number(item.selected_amount)
    const amountValue = Number.isFinite(picked) && picked > 0
      ? picked
      : defaultAmountFor(unit, baseAmount)
    setDraft({
      food_library: item.id,
      name: item.name,
      image: item.image_url || '',
      amount_value: amountValue,
      amount_unit: unit,
      base_amount: baseAmount,
      base_calories: Number(item.calories) || 0,
      base_protein: Number(item.protein) || 0,
      base_carbs: Number(item.carbs) || 0,
      base_fat: Number(item.fat) || 0,
    })
    setShowPicker(false)
    setError('')
  }

  const ensureMeal = async () => {
    const existing = meals.find((m) => m.meal_type === mealType)
    if (existing) return existing
    await api.dietPrograms.addMeal(program.id, {
      meal_type: mealType,
      time: mealMeta.time,
      calories: 0,
    })
    const fresh = await refreshProgram(program.id)
    return (fresh.meals || []).find((m) => m.meal_type === mealType)
  }

  const addCurrentFood = async () => {
    if (!program?.id) return
    if (!String(draft.name || '').trim()) {
      setError('اول یک غذا از کتابخانه انتخاب کنید.')
      return
    }
    try {
      setSaving(true)
      setError('')
      const meal = await ensureMeal()
      if (!meal?.id) {
        setError('ساخت وعده ممکن نشد.')
        return
      }
      const amount = Number(draft.amount_value) || 0
      const unit = draft.amount_unit || 'gram'
      await api.dietPrograms.addFood(program.id, meal.id, {
        food_library: draft.food_library || null,
        name: draft.name,
        amount: `${amount} ${UNIT_LABEL[unit] || unit}`,
        amount_value: amount,
        amount_unit: unit,
        calories: scaled(draft, 'base_calories'),
        protein: scaled(draft, 'base_protein'),
        carbs: scaled(draft, 'base_carbs'),
        fat: scaled(draft, 'base_fat'),
      })
      await refreshProgram(program.id)
      setDraft(emptyDraft())
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          'افزودن غذا ممکن نشد.',
      )
    } finally {
      setSaving(false)
    }
  }

  const goDone = () => setStep(3)

  return (
    <div className={styles.inline} dir="rtl" lang="fa">
      <div className={styles.inlineHeader}>
        <div>
          <h3>افزودن برنامه غذایی جدید</h3>
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
                <label htmlFor="inline-diet-custom-name">عنوان دستی</label>
                <input
                  id="inline-diet-custom-name"
                  type="text"
                  placeholder="مثلاً: رژیم کاهش وزن هفته اول"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  autoFocus
                />
              </div>
            ) : null}

            <p className={styles.sectionLabel}>هدف</p>
            <div className={styles.chipGrid} role="group" aria-label="هدف">
              {DIET_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className={clsx(styles.chip, dietType === t.value && styles.chipOn)}
                  onClick={() => setDietType(t.value)}
                >
                  {dietType === t.value ? <Check size={12} /> : null}
                  {t.label}
                </button>
              ))}
            </div>

            <p className={styles.sectionLabel}>کالری روزانه</p>
            <div className={styles.chipGrid} role="group" aria-label="کالری">
              {CALORIE_PRESETS.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={clsx(styles.chip, calories === n && styles.chipOn)}
                  onClick={() => setCalories(n)}
                >
                  {calories === n ? <Check size={12} /> : null}
                  {n.toLocaleString('fa-IR')}
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
                  <span>{dietTypeLabel}</span>
                  {' · '}
                  <span>{calories.toLocaleString('fa-IR')} کالری</span>
                  {' · '}
                  <span>{dateLabel}</span>
                </div>
              </div>
              <Utensils size={18} />
            </div>

            <div className={styles.step2Grid}>
              <section className={styles.step2Col} aria-label="افزودن غذا">
                <header className={styles.colHead}>
                  <h4>انتخاب غذا</h4>
                  <p>وعده را بزنید، غذا را از کتابخانه بردارید</p>
                </header>

                <p className={styles.sectionLabel}>وعده</p>
                <div className={styles.chipGrid} role="group" aria-label="نوع وعده">
                  {MEAL_TYPES.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      className={clsx(
                        styles.chip,
                        mealType === m.value && styles.chipOn,
                      )}
                      onClick={() => setMealType(m.value)}
                    >
                      {mealType === m.value ? <Check size={12} /> : null}
                      {m.label}
                    </button>
                  ))}
                </div>

                <div className={styles.composer}>
                  {draft.name ? (
                    <div className={styles.selectedMove}>
                      <div className={styles.selectedMoveMain}>
                        {draft.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={draft.image} alt="" width={40} height={40} />
                        ) : (
                          <span className={styles.selectedMoveThumb}>
                            <Apple size={16} />
                          </span>
                        )}
                        <strong>{draft.name}</strong>
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
                      <Apple size={16} />
                      انتخاب از کتابخانه
                    </button>
                  )}

                  {draft.name ? (
                    <div className={styles.metricRow}>
                      <div className={styles.metricBlock}>
                        <span>
                          مقدار ({UNIT_LABEL[draft.amount_unit] || draft.amount_unit})
                        </span>
                        <div className={styles.amountInputRow}>
                          <input
                            className={styles.amountInput}
                            type="number"
                            min="0"
                            step="any"
                            inputMode="decimal"
                            value={draft.amount_value}
                            onChange={(e) => {
                              const next = e.target.value
                              setDraft({
                                ...draft,
                                amount_value: next === '' ? '' : Number(next),
                              })
                            }}
                          />
                          <span className={styles.amountUnit}>
                            {UNIT_LABEL[draft.amount_unit] || draft.amount_unit}
                          </span>
                        </div>
                        <div className={styles.miniChips}>
                          {amountPresetsFor(draft.amount_unit).map((n) => (
                            <button
                              key={n}
                              type="button"
                              className={clsx(
                                styles.miniChip,
                                Number(draft.amount_value) === n && styles.miniChipOn,
                              )}
                              onClick={() =>
                                setDraft({ ...draft, amount_value: n })
                              }
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className={styles.metricBlock}>
                        <span>کالری این مقدار</span>
                        <div className={styles.miniChips}>
                          <span className={clsx(styles.miniChip, styles.miniChipOn)}>
                            <Flame size={11} />
                            {scaled(draft, 'base_calories')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    className={styles.addMoveBtn}
                    onClick={addCurrentFood}
                    disabled={saving || !draft.name}
                  >
                    {saving ? (
                      <Loader2 size={15} className={styles.spin} />
                    ) : (
                      <Plus size={15} />
                    )}
                    افزودن به {mealMeta.label}
                  </button>
                </div>
              </section>

              <section className={styles.step2Col} aria-label="وعده‌های انتخاب‌شده">
                <header className={styles.colHead}>
                  <h4>لیست انتخاب‌شده</h4>
                  <p>
                    {meals.length
                      ? `${meals.length.toLocaleString('fa-IR')} وعده · ${foodCount.toLocaleString('fa-IR')} غذا`
                      : 'هنوز خالی است'}
                  </p>
                </header>

                {meals.length ? (
                  <div className={styles.exerciseList}>
                    {meals.map((meal) => (
                      <div key={meal.id} className={styles.mealGroup}>
                        <div className={styles.mealGroupHead}>
                          <strong>
                            {meal.meal_type_display ||
                              MEAL_TYPES.find((m) => m.value === meal.meal_type)?.label ||
                              meal.meal_type}
                          </strong>
                          <span>
                            {(meal.items || []).length.toLocaleString('fa-IR')} غذا
                          </span>
                        </div>
                        {(meal.items || []).map((food) => (
                          <div key={food.id} className={styles.foodLine}>
                            <span>{food.name}</span>
                            <em>
                              {food.amount} · {Math.round(Number(food.calories) || 0)} کالری
                            </em>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyExercises}>
                    بعد از انتخاب غذا، با «افزودن به وعده» اینجا دیده می‌شود.
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
              «{program?.name}» با {meals.length.toLocaleString('fa-IR')} وعده برای{' '}
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
              بدون غذای بیشتر
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
            <button type="button" className={styles.btnPrimary} onClick={() => finishWithProgram()}>
              مشاهده برنامه
              <Check size={15} />
            </button>
          ) : null}
        </div>
      </div>

      <FoodPickerModal
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handlePickFood}
        mealName={mealMeta.label}
      />
    </div>
  )
}
