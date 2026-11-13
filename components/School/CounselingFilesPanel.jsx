'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Brain, FolderOpen, GraduationCap, Lightbulb, MessageSquareText,
  Plus, Save, Sparkles, Target, Users,
} from 'lucide-react'
import schoolService from '@/components/School/services/schoolService'
import {
  buildCounselorPersonBrief,
  explainAttempt,
} from '@/components/School/counselingInsights'
import styles from './School.module.css'

const RISK = [
  { value: 'none', label: 'عادی' },
  { value: 'low', label: 'کم' },
  { value: 'medium', label: 'متوسط' },
  { value: 'high', label: 'نیاز به پیگیری' },
]

const KIND_COLORS = {
  iq: '#2563eb',
  eq: '#e11d48',
  personality: '#7c3aed',
  career: '#0d9488',
  interest: '#d97706',
  custom: '#64748b',
}

const LEVEL_TONE = {
  strong: styles.cfExplainStrong,
  mid: styles.cfExplainMid,
  weak: styles.cfExplainWeak,
}

function faNum(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString('fa-IR')
}

function AttemptExplainCard({ attempt, personName }) {
  const explained = explainAttempt(attempt, { personName })
  if (!explained) return null
  const color = KIND_COLORS[explained.kind] || KIND_COLORS.custom
  return (
    <article className={`${styles.cfExplainCard} ${LEVEL_TONE[explained.level] || ''}`}>
      <header className={styles.cfExplainHead}>
        <span className={styles.cfResultKind} style={{ '--cf-kind': color }}>
          {attempt.test_kind_label || explained.meta.label}
        </span>
        <strong title={explained.testTitle}>{explained.testTitle}</strong>
        <em className={styles.cfExplainTone}>{explained.toneLabel}</em>
      </header>

      <div className={styles.cfExplainScoreRow}>
        <div className={styles.cfResultScore} style={{ color }}>
          {faNum(explained.pct)}
          <small>٪</small>
        </div>
        <div className={styles.cfExplainScoreMeta}>
          <span>{explained.resultLabel}</span>
          <span>{explained.scoreLine}</span>
          {explained.date ? <span>{explained.date}</span> : null}
        </div>
      </div>

      <div className={styles.cfResultBar}>
        <div style={{ width: `${explained.pct}%`, background: color }} />
      </div>

      <div className={styles.cfExplainBlock}>
        <h4><Brain size={12} /> این آزمون چه چیزی را می‌سنجد؟</h4>
        <p>{explained.whatItMeasures}</p>
      </div>

      <div className={styles.cfExplainBlock}>
        <h4><MessageSquareText size={12} /> معنی ساده برای {personName}</h4>
        <p>{explained.plainMeaning}</p>
      </div>

      <div className={styles.cfExplainBlock}>
        <h4><Lightbulb size={12} /> پیشنهاد به مشاور</h4>
        <p>{explained.counselorHint}</p>
      </div>

      {explained.personTip?.length ? (
        <div className={styles.cfExplainBlock}>
          <h4><Target size={12} /> تمرین‌های ساده</h4>
          <ul className={styles.cfInsightListSoft}>
            {explained.personTip.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {explained.careersHint?.length ? (
        <div className={styles.cfExplainBlock}>
          <h4><Sparkles size={12} /> مسیرهای هم‌خوان</h4>
          <ul className={styles.cfInsightList}>
            {explained.careersHint.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  )
}

export default function CounselingFilesPanel({ students = [], teachers = [], onNotify }) {
  const [scope, setScope] = useState('students') // students | teachers
  const [files, setFiles] = useState([])
  const [selected, setSelected] = useState(null)
  const [detailTab, setDetailTab] = useState('results') // results | summary | notes
  const [note, setNote] = useState({ title: '', body: '', visibility: 'private' })
  const [newSubjectId, setNewSubjectId] = useState('')
  const [saving, setSaving] = useState(false)

  const isTeacher = scope === 'teachers'

  const load = useCallback(async () => {
    const res = isTeacher
      ? await schoolService.listTeacherCounselingFiles()
      : await schoolService.listCounselingFiles()
    if (res.success) setFiles(res.data || [])
    else onNotify?.(res.error, true)
  }, [isTeacher, onNotify])

  useEffect(() => {
    setSelected(null)
    setNewSubjectId('')
    setNote({ title: '', body: '', visibility: 'private' })
    setDetailTab('results')
    load()
  }, [load])

  const openFile = async (id) => {
    const res = isTeacher
      ? await schoolService.getTeacherCounselingFile(id)
      : await schoolService.getCounselingFile(id)
    if (!res.success) {
      onNotify?.(res.error, true)
      return
    }
    setSelected(res.data)
    setNote({ title: '', body: '', visibility: 'private' })
    setDetailTab(isTeacher ? 'summary' : 'results')
  }

  const createFile = async () => {
    if (!newSubjectId) {
      onNotify?.(isTeacher ? 'معلم را انتخاب کنید' : 'دانش‌آموز را انتخاب کنید', true)
      return
    }
    const res = isTeacher
      ? await schoolService.createTeacherCounselingFile({ teacher_id: Number(newSubjectId) })
      : await schoolService.createCounselingFile({ student_id: Number(newSubjectId) })
    if (!res.success) {
      onNotify?.(res.error, true)
      return
    }
    onNotify?.('پرونده آماده شد', false)
    setNewSubjectId('')
    load()
    setSelected(res.data)
    setDetailTab(isTeacher ? 'summary' : 'results')
  }

  const saveFile = async () => {
    if (!selected) return
    setSaving(true)
    const payload = {
      summary_html: selected.summary_html || '',
      risk_level: selected.risk_level || 'none',
    }
    const res = isTeacher
      ? await schoolService.updateTeacherCounselingFile(selected.id, payload)
      : await schoolService.updateCounselingFile(selected.id, payload)
    setSaving(false)
    if (!res.success) onNotify?.(res.error, true)
    else {
      onNotify?.('پرونده ذخیره شد', false)
      setSelected(res.data)
      load()
    }
  }

  const addNote = async () => {
    if (!selected || !(note.body || '').trim()) {
      onNotify?.('متن یادداشت الزامی است', true)
      return
    }
    const res = isTeacher
      ? await schoolService.createTeacherCounselingNote({
        file_id: selected.id,
        title: note.title,
        body: note.body,
        visibility: note.visibility,
      })
      : await schoolService.createCounselingNote({
        file_id: selected.id,
        title: note.title,
        body: note.body,
        visibility: note.visibility,
      })
    if (!res.success) {
      onNotify?.(res.error, true)
      return
    }
    onNotify?.('یادداشت ثبت شد', false)
    openFile(selected.id)
  }

  const subjectName = isTeacher
    ? (selected?.teacher_name || 'معلم')
    : (selected?.student_name || 'دانش‌آموز')

  const brief = useMemo(() => {
    if (!selected || isTeacher) return null
    return buildCounselorPersonBrief(selected.attempts || [], subjectName)
  }, [selected, isTeacher, subjectName])

  if (selected) {
    const tabs = isTeacher
      ? [
          ['summary', 'خلاصه پرونده'],
          ['notes', 'یادداشت‌ها'],
        ]
      : [
          ['results', 'نتایج قابل‌فهم'],
          ['summary', 'خلاصه پرونده'],
          ['notes', 'یادداشت‌ها'],
        ]

    return (
      <div className={styles.cfFileDetail}>
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}>
            <FolderOpen size={16} />
            پرونده {isTeacher ? 'معلم' : 'دانش‌آموز'} · {subjectName}
          </h2>
          <button type="button" className={styles.btnGhost} onClick={() => setSelected(null)}>
            لیست پرونده‌ها
          </button>
        </div>
        <p className={styles.tpHint}>
          {isTeacher
            ? `تخصص: ${selected.teacher_specialty || '—'}`
            : `پایه: ${selected.student_grade || '—'}`}
          {(isTeacher ? selected.teacher_mobile : selected.student_mobile)
            ? ` · ${isTeacher ? selected.teacher_mobile : selected.student_mobile}`
            : ''}
        </p>

        {!isTeacher && brief ? (
          <section className={styles.cfDossierCard}>
            <div className={styles.cfDossierMain}>
              <div className={styles.cfDossierCopy}>
                <span className={styles.cfDossierBadge}>
                  {brief.maturityInfo?.title || 'پرونده فرد'}
                </span>
                <p className={styles.cfDossierTitle}>{brief.dossierHeadline}</p>
                <p className={styles.cfDossierText}>{brief.dossierBody}</p>
                {brief.riskNote ? (
                  <p className={styles.cfDossierWarn}>{brief.riskNote}</p>
                ) : null}
              </div>
              <div className={styles.cfDossierStats} aria-label="آمار آزمون‌ها">
                <div className={styles.cfDossierStat}>
                  <strong>{faNum(brief.count)}</strong>
                  <span>آزمون ثبت‌شده</span>
                </div>
                <div className={styles.cfDossierStat}>
                  <strong>{faNum(brief.kindsCovered)}</strong>
                  <span>نوع پوشش</span>
                </div>
              </div>
            </div>
            {brief.followUps?.length ? (
              <div className={styles.cfDossierFollow}>
                <h4><Target size={12} /> قدم بعدی مشاور</h4>
                <ul className={styles.cfInsightListSoft}>
                  {brief.followUps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}

        <div className={styles.cfFileTabs} role="tablist">
          {tabs.map(([k, label]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={detailTab === k}
              className={`${styles.cfFileTab} ${detailTab === k ? styles.cfFileTabOn : ''}`}
              onClick={() => setDetailTab(k)}
            >
              {label}
            </button>
          ))}
        </div>

        {detailTab === 'results' && !isTeacher ? (
          <div className={styles.cfExplainGrid}>
            {(selected.attempts || []).length ? (
              selected.attempts.map((a) => (
                <AttemptExplainCard
                  key={a.id}
                  attempt={a}
                  personName={subjectName}
                />
              ))
            ) : (
              <p className={styles.empty}>
                هنوز آزمونی ثبت نشده — بعد از تکمیل آزمون، توضیح ساده نتیجه اینجا می‌آید.
              </p>
            )}
          </div>
        ) : null}

        {detailTab === 'summary' ? (
          <div className={styles.cfSummaryEdit}>
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label>سطح پیگیری</label>
                <select
                  value={selected.risk_level || 'none'}
                  onChange={(e) => setSelected((p) => ({ ...p, risk_level: e.target.value }))}
                >
                  {RISK.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.field} style={{ marginTop: 8 }}>
              <label>خلاصه پرونده (زبان مشاور)</label>
              <textarea
                rows={5}
                value={selected.summary_html || ''}
                onChange={(e) => setSelected((p) => ({ ...p, summary_html: e.target.value }))}
                placeholder={isTeacher
                  ? 'وضعیت حرفه‌ای، رفاهی، تعاملات و پیگیری‌های مشاور…'
                  : 'خلاصه وضعیت تحصیلی، رفتاری و پیگیری‌ها به زبان ساده…'}
              />
            </div>
            {!isTeacher && brief && !brief.empty ? (
              <div className={styles.cfAutoSummary}>
                <h4><Sparkles size={12} /> پیشنهاد متن خلاصه از روی نتایج</h4>
                <p>{brief.dossierHeadline}</p>
                <p>{brief.dossierBody}</p>
                <button
                  type="button"
                  className={styles.btnGhost}
                  onClick={() => setSelected((p) => ({
                    ...p,
                    summary_html: [brief.dossierHeadline, brief.dossierBody, ...(brief.followUps || [])]
                      .filter(Boolean)
                      .join('\n'),
                  }))}
                >
                  قرار دادن در خلاصه پرونده
                </button>
              </div>
            ) : null}
            <button
              type="button"
              className={styles.btnAccent}
              style={{ marginTop: 10 }}
              disabled={saving}
              onClick={saveFile}
            >
              <Save size={14} /> ذخیره پرونده
            </button>
          </div>
        ) : null}

        {detailTab === 'notes' ? (
          <div>
            {(selected.notes || []).map((n) => (
              <div key={n.id} className={styles.tip}>
                <strong>{n.title || 'یادداشت'}</strong>
                <span className={styles.pill}>
                  {n.visibility === 'shared' ? 'مشترک' : 'خصوصی'}
                </span>
                <div>{n.body}</div>
                <div className={styles.tpHint}>
                  {n.counselor_name} · {n.created_at?.slice?.(0, 10)}
                </div>
              </div>
            ))}
            {!(selected.notes || []).length ? (
              <p className={styles.empty}>هنوز یادداشتی نیست</p>
            ) : null}

            <div className={styles.tpItemCard} style={{ marginTop: 12 }}>
              <div className={styles.field}>
                <label>عنوان یادداشت</label>
                <input
                  value={note.title}
                  onChange={(e) => setNote((p) => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div className={styles.field} style={{ marginTop: 8 }}>
                <label>متن</label>
                <textarea
                  rows={3}
                  value={note.body}
                  onChange={(e) => setNote((p) => ({ ...p, body: e.target.value }))}
                />
              </div>
              <div className={styles.field} style={{ marginTop: 8 }}>
                <label>نمایش</label>
                <select
                  value={note.visibility}
                  onChange={(e) => setNote((p) => ({ ...p, visibility: e.target.value }))}
                >
                  <option value="private">فقط مشاور</option>
                  <option value="shared">
                    {isTeacher ? 'قابل مشاهده برای معلم' : 'قابل مشاهده برای دانش‌آموز'}
                  </option>
                </select>
              </div>
              <button type="button" className={styles.btnGhost} style={{ marginTop: 8 }} onClick={addNote}>
                <Plus size={14} /> ثبت یادداشت
              </button>
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div>
      <div className={styles.panelHead}>
        <h2 className={styles.panelTitle}><FolderOpen size={16} /> پرونده‌های مشاوره</h2>
      </div>

      <div className={styles.cfScopeTabs} role="tablist">
        <button
          type="button"
          className={`${styles.cfScopeTab} ${!isTeacher ? styles.cfScopeTabOn : ''}`}
          onClick={() => setScope('students')}
        >
          <GraduationCap size={13} /> دانش‌آموزان
        </button>
        <button
          type="button"
          className={`${styles.cfScopeTab} ${isTeacher ? styles.cfScopeTabOn : ''}`}
          onClick={() => setScope('teachers')}
        >
          <Users size={13} /> معلمان
        </button>
      </div>

      <div className={styles.formRow} style={{ marginTop: 12 }}>
        <div className={styles.field}>
          <label>
            {isTeacher
              ? 'ایجاد / بازکردن پرونده برای معلم'
              : 'ایجاد / بازکردن پرونده برای دانش‌آموز'}
          </label>
          <select value={newSubjectId} onChange={(e) => setNewSubjectId(e.target.value)}>
            <option value="">{isTeacher ? 'انتخاب معلم' : 'انتخاب دانش‌آموز'}</option>
            {isTeacher
              ? teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.display_name}{t.specialty ? ` · ${t.specialty}` : ''}
                </option>
              ))
              : students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.display_name}{s.grade ? ` · ${s.grade}` : ''}
                </option>
              ))}
          </select>
        </div>
        <div className={styles.field} style={{ alignSelf: 'end' }}>
          <button type="button" className={styles.btnAccent} onClick={createFile}>
            <Plus size={14} /> پرونده
          </button>
        </div>
      </div>

      <div className={styles.tableWrap} style={{ marginTop: 14 }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{isTeacher ? 'معلم' : 'دانش‌آموز'}</th>
              <th>{isTeacher ? 'تخصص' : 'پایه'}</th>
              <th>مشاور</th>
              <th>پیگیری</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {files.map((f) => (
              <tr key={f.id}>
                <td>{isTeacher ? f.teacher_name : f.student_name}</td>
                <td>{isTeacher ? (f.teacher_specialty || '—') : (f.student_grade || '—')}</td>
                <td>{f.primary_counselor_name || '—'}</td>
                <td><span className={styles.pill}>{f.risk_label || f.risk_level}</span></td>
                <td>
                  <button type="button" className={styles.btnGhost} onClick={() => openFile(f.id)}>
                    باز کردن
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!files.length ? (
        <p className={styles.empty}>
          {isTeacher ? 'هنوز پرونده معلمی نیست' : 'هنوز پرونده دانش‌آموزی نیست'}
        </p>
      ) : null}
    </div>
  )
}
