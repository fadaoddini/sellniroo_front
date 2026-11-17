'use client'

import React, { useEffect, useState } from 'react'
import {
  AlertCircle,
  Archive,
  ArchiveRestore,
  ClipboardList,
  HelpCircle,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  User,
} from 'lucide-react'
import { TodoProvider, useTodo } from '../context/TodoContext'
import TaskCard from './TaskCard'
import CreateTaskModal from './CreateTaskModal'
import TodoTour, { hasSeenTodoTour } from './TodoTour'
import styles from '../styles/Board.module.css'

const fa = (n) => Number(n || 0).toLocaleString('fa-IR')

const COL_CLASS = {
  todo: styles.colTodo,
  in_progress: styles.colProgress,
  review: styles.colReview,
  done: styles.colDone,
}

const COL_TOUR = {
  todo: 'todo-col-todo',
  in_progress: 'todo-col-progress',
  review: 'todo-col-review',
  done: 'todo-col-done',
}

const BoardColumns = () => {
  const { filteredTasks, columns, moveTask, isAdmin } = useTodo()
  const [draggedId, setDraggedId] = useState(null)
  const [overStatus, setOverStatus] = useState(null)
  let firstCardMarked = false

  const byStatus = (status) => filteredTasks.filter((t) => t.status === status)

  const onDragStart = (e, taskId) => {
    if (!isAdmin) {
      e.preventDefault()
      return
    }
    setDraggedId(taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const onDrop = async (e, status) => {
    e.preventDefault()
    setOverStatus(null)
    if (!isAdmin || !draggedId) return
    try {
      await moveTask(draggedId, status)
    } catch (err) {
      alert(err?.message || 'جابجایی ناموفق بود')
    } finally {
      setDraggedId(null)
    }
  }

  return (
    <div className={styles.board} data-tour="todo-board">
      {columns.map((col) => {
        const items = byStatus(col.id)
        return (
          <section
            key={col.id}
            className={`${styles.column} ${COL_CLASS[col.id] || ''}`}
            data-tour={COL_TOUR[col.id]}
          >
            <div className={styles.columnHead}>
              <h2 className={styles.columnTitle}>
                <span className={styles.columnDot} aria-hidden />
                {col.title}
              </h2>
              <span className={styles.columnCount}>{fa(items.length)}</span>
            </div>
            <div
              className={`${styles.columnBody} ${
                isAdmin && overStatus === col.id ? styles.columnBodyDragging : ''
              }`}
              onDragOver={
                isAdmin
                  ? (e) => {
                      e.preventDefault()
                      setOverStatus(col.id)
                    }
                  : undefined
              }
              onDragLeave={isAdmin ? () => setOverStatus(null) : undefined}
              onDrop={isAdmin ? (e) => onDrop(e, col.id) : undefined}
            >
              {items.map((task) => {
                const tourTarget = !firstCardMarked
                if (tourTarget) firstCardMarked = true
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    canDrag={isAdmin}
                    onDragStart={onDragStart}
                    tourTarget={tourTarget ? 'todo-card' : undefined}
                  />
                )
              })}
              {items.length === 0 ? (
                <div className={styles.emptyCol}>کارتی در این ستون نیست</div>
              ) : null}
            </div>
          </section>
        )
      })}
    </div>
  )
}

const TodoContent = () => {
  const {
    loading,
    error,
    stats,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    selectedEmployee,
    setSelectedEmployee,
    assignees,
    showArchived,
    setShowArchived,
    archivedTasks,
    refresh,
  } = useTodo()

  const [modalOpen, setModalOpen] = useState(false)
  const [tourOpen, setTourOpen] = useState(false)

  useEffect(() => {
    if (!hasSeenTodoTour()) {
      const t = setTimeout(() => setTourOpen(true), 700)
      return () => clearTimeout(t)
    }
    return undefined
  }, [])

  const filters = [
    { id: 'all', label: 'همه' },
    { id: 'todo', label: 'در انتظار' },
    { id: 'in_progress', label: 'در حال انجام' },
    { id: 'review', label: 'در بررسی' },
    { id: 'done', label: 'انجام شده' },
  ]

  return (
    <div className={`${styles.page} todoTheme`}>
      <header className={styles.header} data-tour="todo-header">
        <div className={styles.brand}>
          <span className={styles.brandIcon}>
            <ClipboardList size={17} />
          </span>
          <div>
            <h1>میزکار وظایف</h1>
            <p>مدیریت فعالیت ها</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? styles.spin : undefined} />
            بروزرسانی
          </button>
          <button
            type="button"
            className={`${styles.btnGhost} ${showArchived ? styles.btnGhostActive : ''}`}
            onClick={() => setShowArchived(!showArchived)}
            data-tour="todo-archive"
          >
            {showArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
            {showArchived ? 'میزکار' : 'آرشیو'}
          </button>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={() => setTourOpen(true)}
            aria-label="تور راهنما"
          >
            <HelpCircle size={14} />
            تور راهنما
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => setModalOpen(true)}
            data-tour="todo-create"
          >
            <Plus size={14} />
            وظیفه جدید
          </button>
        </div>
      </header>

      <div className={styles.stats} data-tour="todo-stats">
        <span className={styles.stat}>
          کل <strong>{fa(stats.total)}</strong>
        </span>
        <span className={styles.stat}>
          انتظار <strong>{fa(stats.todo)}</strong>
        </span>
        <span className={styles.stat}>
          در حال انجام <strong>{fa(stats.in_progress)}</strong>
        </span>
        <span className={styles.stat}>
          بررسی <strong>{fa(stats.review)}</strong>
        </span>
        <span className={styles.stat}>
          انجام‌شده <strong>{fa(stats.done)}</strong>
        </span>
        <span className={styles.stat}>
          آرشیو <strong>{fa(stats.archived)}</strong>
        </span>
        {typeof stats.pending_reports === 'number' ? (
          <span className={styles.stat}>
            گزارش منتظر بررسی <strong>{fa(stats.pending_reports)}</strong>
          </span>
        ) : null}
      </div>

      {!showArchived ? (
        <>
          <div className={styles.toolbar} data-tour="todo-filters">
            <div className={styles.filters}>
              {filters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`${styles.filterBtn} ${
                    filter === f.id ? styles.filterActive : ''
                  }`}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className={styles.search}>
              <Search size={14} />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجوی وظیفه یا کارمند..."
              />
            </div>
          </div>

          <div className={styles.assigneeBar} data-tour="todo-assignees">
            <button
              type="button"
              className={`${styles.chip} ${!selectedEmployee ? styles.chipActive : ''}`}
              onClick={() => setSelectedEmployee(null)}
            >
              <User size={12} />
              همه
            </button>
            {assignees.map((emp) => (
              <button
                key={emp.id}
                type="button"
                className={`${styles.chip} ${
                  String(selectedEmployee) === String(emp.id) ? styles.chipActive : ''
                }`}
                onClick={() => setSelectedEmployee(emp.id)}
              >
                <span className={styles.avatar}>
                  {(emp.name || '?').charAt(0)}
                </span>
                {emp.name}
              </button>
            ))}
          </div>
        </>
      ) : null}

      {loading ? (
        <div className={styles.loading}>
          <Loader2 size={20} className={styles.spin} />
          در حال بارگذاری میزکار...
        </div>
      ) : error ? (
        <div className={styles.errorBox}>
          <AlertCircle size={18} />
          <span>{error}</span>
          <button type="button" className={styles.btnGhost} onClick={refresh}>
            تلاش دوباره
          </button>
        </div>
      ) : showArchived ? (
        <div className={styles.archivedGrid}>
          {archivedTasks.length === 0 ? (
            <div className={styles.emptyBoard}>آرشیو خالی است</div>
          ) : (
            archivedTasks.map((task) => (
              <TaskCard key={task.id} task={task} isArchived />
            ))
          )}
        </div>
      ) : (
        <BoardColumns />
      )}

      <CreateTaskModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      <TodoTour open={tourOpen} onClose={() => setTourOpen(false)} />
    </div>
  )
}

const TodoModule = () => (
  <TodoProvider>
    <TodoContent />
  </TodoProvider>
)

export default TodoModule
