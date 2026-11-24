'use client'

import React, { useMemo, useState } from 'react'
import { FolderOpen, GraduationCap, Search, UserRound, Users } from 'lucide-react'
import schoolService from '@/components/School/services/schoolService'
import styles from './School.module.css'

function faNum(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString('fa-IR')
}

export default function CounselorPeoplePanel({
  students = [],
  teachers = [],
  onNotify,
  onOpenFile,
}) {
  const [scope, setScope] = useState('students')
  const [query, setQuery] = useState('')
  const [busyId, setBusyId] = useState(null)

  const list = scope === 'teachers' ? teachers : students

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter((row) => {
      const hay = [
        row.display_name,
        row.full_name,
        row.name,
        row.grade,
        row.specialty,
        row.mobile,
        row.national_id,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [list, query])

  const openOrCreate = async (row) => {
    const id = row.id
    if (!id) return
    setBusyId(id)
    try {
      if (scope === 'teachers') {
        let res = await schoolService.getCounselingFileByTeacher(id)
        if (!res.success) {
          res = await schoolService.createTeacherCounselingFile({ teacher_id: Number(id) })
        }
        if (!res.success) {
          onNotify?.(res.error || 'خطا در پرونده معلم', true)
          return
        }
        onNotify?.('پرونده معلم آماده است', false)
        onOpenFile?.('teachers', res.data?.id)
      } else {
        let res = await schoolService.getCounselingFileByStudent(id)
        if (!res.success) {
          res = await schoolService.createCounselingFile({ student_id: Number(id) })
        }
        if (!res.success) {
          onNotify?.(res.error || 'خطا در پرونده دانش‌آموز', true)
          return
        }
        onNotify?.('پرونده دانش‌آموز آماده است', false)
        onOpenFile?.('students', res.data?.id)
      }
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className={styles.cpp} dir="rtl" lang="fa">
      <header className={styles.cppHead}>
        <div>
          <h2>
            <Users size={18} />
            فهرست افراد
          </h2>
          <p>جستجوی دانش‌آموز یا معلم و باز کردن / ساخت پرونده مشاوره</p>
        </div>
        <div className={styles.cppScope}>
          <button
            type="button"
            className={`${styles.cppScopeBtn} ${scope === 'students' ? styles.cppScopeOn : ''}`}
            onClick={() => setScope('students')}
          >
            <GraduationCap size={14} />
            دانش‌آموزان
            <em>{faNum(students.length)}</em>
          </button>
          <button
            type="button"
            className={`${styles.cppScopeBtn} ${scope === 'teachers' ? styles.cppScopeOn : ''}`}
            onClick={() => setScope('teachers')}
          >
            <UserRound size={14} />
            معلمان
            <em>{faNum(teachers.length)}</em>
          </button>
        </div>
      </header>

      <div className={styles.cppSearch}>
        <Search size={15} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={scope === 'teachers' ? 'جستجو نام یا تخصص معلم…' : 'جستجو نام یا پایه دانش‌آموز…'}
          autoComplete="off"
        />
      </div>

      {!filtered.length ? (
        <div className={styles.cppEmpty}>
          <Users size={24} />
          <strong>موردی یافت نشد</strong>
        </div>
      ) : (
        <ul className={styles.cppList}>
          {filtered.map((row) => {
            const name = row.display_name || row.full_name || row.name || '—'
            const meta = scope === 'teachers'
              ? (row.specialty || 'معلم')
              : (row.grade ? `پایه ${row.grade}` : 'دانش‌آموز')
            return (
              <li key={`${scope}-${row.id}`}>
                <div className={styles.cppRow}>
                  <span className={styles.cppAvatar} aria-hidden>
                    {String(name).slice(0, 1)}
                  </span>
                  <div className={styles.cppBody}>
                    <strong>{name}</strong>
                    <em>
                      {meta}
                      {row.mobile ? ` · ${row.mobile}` : ''}
                    </em>
                  </div>
                  <button
                    type="button"
                    className={styles.btnAccent}
                    disabled={busyId === row.id}
                    onClick={() => openOrCreate(row)}
                  >
                    <FolderOpen size={14} />
                    {busyId === row.id ? '…' : 'پرونده'}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
