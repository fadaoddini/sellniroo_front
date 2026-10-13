'use client'

import React, { useMemo, useState } from 'react'
import { Plus, RefreshCw, UserPlus, Users } from 'lucide-react'
import styles from './School.module.css'

export default function StudentsPanel({
  students = [],
  studentMobile,
  studentName,
  onMobileChange,
  onNameChange,
  onAdd,
  onReload,
  busy = false,
}) {
  const [selectedId, setSelectedId] = useState(null)
  const [mode, setMode] = useState('add') // add | detail
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return students
    return students.filter((s) => {
      const name = (s.display_name || '').toLowerCase()
      const mobile = (s.mobile || '').toLowerCase()
      return name.includes(q) || mobile.includes(q)
    })
  }, [students, query])

  const selected = useMemo(
    () => students.find((s) => s.id === selectedId) || null,
    [students, selectedId]
  )

  const startAdd = () => {
    setMode('add')
    setSelectedId(null)
  }

  const openStudent = (s) => {
    setSelectedId(s.id)
    setMode('detail')
  }

  return (
    <div className={styles.studentsLayout}>
      <aside className={styles.studentsSidebar}>
        <div className={styles.currSideHead}>
          <h2 className={styles.panelTitle}>دانش‌آموزان من</h2>
          <p className={styles.metaMuted}>{students.length} نفر در کلاس</p>
        </div>

        <div className={styles.bankFilters}>
          <input
            className={styles.input}
            placeholder="جستجو نام یا موبایل…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className={styles.currAddBar}>
          <button type="button" className={styles.btnAccent} onClick={startAdd}>
            <UserPlus size={14} /> افزودن
          </button>
          <button type="button" className={styles.btnGhost} onClick={onReload} title="بروزرسانی">
            <RefreshCw size={12} />
          </button>
        </div>

        <div className={styles.bankList}>
          {filtered.map((s) => {
            const on = selectedId === s.id && mode === 'detail'
            return (
              <div
                key={s.id}
                className={`${styles.bankItem} ${on ? styles.bankItemOn : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => openStudent(s)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openStudent(s) }}
              >
                <div className={styles.studentAvatar} aria-hidden>
                  {(s.display_name || s.mobile || '?').slice(0, 1)}
                </div>
                <div className={styles.bankItemMain}>
                  <span className={styles.bankItemText}>{s.display_name || 'بدون نام'}</span>
                  <span className={styles.bankItemMeta} dir="ltr">{s.mobile}</span>
                </div>
                <span className={styles.pill}>{s.rank_tier || '—'}</span>
              </div>
            )
          })}
          {!filtered.length ? (
            <p className={styles.empty}>
              {students.length ? 'نتیجه‌ای نیست' : 'هنوز دانش‌آموزی نیست'}
            </p>
          ) : null}
        </div>
      </aside>

      <section className={styles.studentsEditor}>
        {mode === 'detail' && selected ? (
          <>
            <div className={styles.currSideHead}>
              <h2 className={styles.panelTitle}>{selected.display_name || 'دانش‌آموز'}</h2>
              <p className={styles.metaMuted} dir="ltr">{selected.mobile}</p>
            </div>
            <div className={styles.currEditorScroll}>
              <div className={styles.studentDetailHero}>
                <div className={styles.studentAvatarLg} aria-hidden>
                  {(selected.display_name || selected.mobile || '?').slice(0, 1)}
                </div>
                <div>
                  <strong>{selected.display_name || 'بدون نام'}</strong>
                  <p dir="ltr">{selected.mobile}</p>
                </div>
              </div>

              <div className={styles.stats}>
                <div className={styles.stat}>
                  <p className={styles.statLabel}>امتیاز</p>
                  <p className={styles.statValue}>{selected.activity_points ?? 0}</p>
                </div>
                <div className={styles.stat}>
                  <p className={styles.statLabel}>رتبه</p>
                  <p className={styles.statValue}>{selected.rank_tier || '—'}</p>
                </div>
                <div className={`${styles.stat} ${styles.statOk}`}>
                  <p className={styles.statLabel}>معدل</p>
                  <p className={styles.statValue}>{selected.average_percent ?? 0}٪</p>
                </div>
              </div>

              {selected.grade ? (
                <p className={styles.metaMuted} style={{ marginTop: 8 }}>
                  پایه: {selected.grade}
                </p>
              ) : null}

              <div className={styles.formActions} style={{ marginTop: 16 }}>
                <button type="button" className={styles.btnGhost} onClick={startAdd}>
                  <Plus size={14} /> افزودن دانش‌آموز جدید
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className={styles.currSideHead}>
              <h2 className={styles.panelTitle}>افزودن دانش‌آموز</h2>
              <p className={styles.metaMuted}>با موبایل به کلاس شما وصل می‌شود</p>
            </div>
            <div className={styles.currEditorScroll}>
              <div className={styles.hintBox}>
                <Users size={14} />
                اگر کاربر از قبل ثبت‌نام کرده باشد، همان حساب به کلاس اضافه می‌شود.
              </div>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label>موبایل</label>
                  <input
                    dir="ltr"
                    value={studentMobile}
                    onChange={(e) => onMobileChange?.(e.target.value)}
                    placeholder="09..."
                  />
                </div>
                <div className={styles.field}>
                  <label>نام نمایشی</label>
                  <input
                    value={studentName}
                    onChange={(e) => onNameChange?.(e.target.value)}
                    placeholder="مثلاً سارا محمدی"
                  />
                </div>
                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.btnAccent}
                    disabled={busy}
                    onClick={onAdd}
                  >
                    <Plus size={14} /> افزودن دانش‌آموز
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
