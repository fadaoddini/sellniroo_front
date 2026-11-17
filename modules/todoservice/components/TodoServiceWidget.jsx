'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Wrench } from 'lucide-react'
import ModuleGate from '@/components/modules/ModuleGate'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import { TodoServiceProvider, useTodoService, BOARD_COLUMNS } from '../context/TodoServiceContext'
import JobCard from './JobCard'
import styles from '../styles/Board.module.css'

const COL_CLASS = {
  inbox: styles.colInbox,
  field: styles.colField,
  work: styles.colWork,
  done: styles.colDone,
}

function WidgetBoard({ maxHeight }) {
  const { jobsByColumn, columns, openJob, loading } = useTodoService()

  if (loading) {
    return <p className={styles.hint}>در حال بارگذاری…</p>
  }

  return (
    <div
      className={styles.embedBoard}
      style={maxHeight ? { maxHeight, overflow: 'auto' } : undefined}
    >
      <div className={styles.board} style={{ minWidth: 720 }}>
        {columns.map((col) => {
          const items = (jobsByColumn[col.id] || []).slice(0, 6)
          return (
            <section
              key={col.id}
              className={`${styles.column} ${COL_CLASS[col.id] || ''}`}
              style={{ maxHeight: 320 }}
            >
              <div className={styles.columnHead}>
                <h2 className={styles.columnTitle}>
                  <span className={styles.columnDot} aria-hidden />
                  {col.title}
                </h2>
              </div>
              <div className={styles.columnBody}>
                {items.map((job) => (
                  <JobCard key={job.id} job={job} onOpen={openJob} />
                ))}
                {items.length === 0 ? (
                  <div className={styles.emptyCol}>—</div>
                ) : null}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function WidgetInner({ settings = {} }) {
  const title = settings.title || 'میزکار سرویس'
  const subtitle = settings.subtitle || 'نمای خلاصه پرونده‌های تعمیر'
  const showBoard = settings.show_board !== false
  const maxHeight = settings.max_height

  return (
    <div className={styles.widgetWrap} dir="rtl">
      <div className={styles.widgetHead}>
        <div>
          <h3>
            <Wrench size={14} style={{ verticalAlign: -2, marginLeft: 4 }} />
            {title}
          </h3>
          {subtitle ? <p className={styles.hint} style={{ margin: '0.2rem 0 0' }}>{subtitle}</p> : null}
        </div>
        <Link href="/todoservice" className={styles.btnGhost}>
          <ArrowLeft size={14} />
          ورود کامل
        </Link>
      </div>
      {showBoard ? <WidgetBoard maxHeight={maxHeight} /> : null}
    </div>
  )
}

export default function TodoServiceWidget({ settings = {} }) {
  const normalized = useMemo(() => ({ ...settings }), [settings])

  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.REPAIRS} fallback={null}>
      <TodoServiceProvider>
        <WidgetInner settings={normalized} />
      </TodoServiceProvider>
    </ModuleGate>
  )
}