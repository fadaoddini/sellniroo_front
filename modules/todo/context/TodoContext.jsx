'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useAuth } from '@/contexts/AuthContext'
import todoService from '../services/todoService'

const TodoContext = createContext(null)

export const useTodo = () => {
  const ctx = useContext(TodoContext)
  if (!ctx) throw new Error('useTodo must be used within TodoProvider')
  return ctx
}

const PRIORITIES = [
  { id: 'critical', name: 'بحرانی', color: '#b91c1c', bg: '#fef2f2' },
  { id: 'high', name: 'بالا', color: '#c2410c', bg: '#fff7ed' },
  { id: 'medium', name: 'متوسط', color: '#a16207', bg: '#fefce8' },
  { id: 'low', name: 'پایین', color: '#15803d', bg: '#f0fdf4' },
  { id: 'training', name: 'آموزشی', color: '#1d4ed8', bg: '#eff6ff' },
]

const COLUMNS = [
  { id: 'todo', title: 'در انتظار' },
  { id: 'in_progress', title: 'در حال انجام' },
  { id: 'review', title: 'در بررسی' },
  { id: 'done', title: 'انجام شده' },
]

export const TodoProvider = ({ children }) => {
  const { employeeData, user } = useAuth() || {}
  const [tasks, setTasks] = useState([])
  const [archivedTasks, setArchivedTasks] = useState([])
  const [assignees, setAssignees] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    in_progress: 0,
    review: 0,
    done: 0,
    archived: 0,
    pending_reports: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showArchived, setShowArchived] = useState(false)

  const isAdmin = useMemo(() => {
    if (user?.is_superuser) return true
    const level = employeeData?.access_level ?? 0
    return Number(level) >= 3
  }, [user, employeeData])

  const currentUser = useMemo(
    () => ({
      id: employeeData?.id || null,
      name: employeeData?.full_name || user?.full_name || 'کاربر',
      isAdmin,
    }),
    [employeeData, user, isAdmin]
  )

  const refreshStats = useCallback(async () => {
    try {
      const data = await todoService.getStats()
      if (data) setStats(data)
    } catch {
      /* ignore */
    }
  }, [])

  const loadBoard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [board, people] = await Promise.all([
        todoService.getBoard(),
        todoService.getAssignees(),
      ])
      const list = Array.isArray(board?.tasks)
        ? board.tasks
        : Array.isArray(board)
          ? board
          : []
      setTasks(list)
      setAssignees(Array.isArray(people) ? people : [])
      await refreshStats()
    } catch (err) {
      setError(err?.message || err?.error || 'خطا در بارگذاری میزکار وظایف')
      setTasks([])
    } finally {
      setLoading(false)
    }
  }, [refreshStats])

  const loadArchived = useCallback(async () => {
    try {
      const data = await todoService.getArchived()
      setArchivedTasks(Array.isArray(data) ? data : [])
      await refreshStats()
    } catch (err) {
      setError(err?.message || err?.error || 'خطا در بارگذاری آرشیو')
    }
  }, [refreshStats])

  useEffect(() => {
    loadBoard()
  }, [loadBoard])

  useEffect(() => {
    if (showArchived) loadArchived()
  }, [showArchived, loadArchived])

  const addTask = async (payload) => {
    const created = await todoService.createTask(payload)
    await loadBoard()
    return created
  }

  const updateTask = async (taskId, payload) => {
    await todoService.updateTask(taskId, payload)
    await loadBoard()
  }

  const deleteTask = async (taskId) => {
    if (!isAdmin) throw new Error('فقط مدیر می‌تواند حذف کند')
    await todoService.deleteTask(taskId)
    await loadBoard()
  }

  const moveTask = async (taskId, newStatus) => {
    if (!isAdmin) {
      throw new Error(
        'جابه‌جایی دستی فقط برای مدیر مجاز است؛ وضعیت با ثبت گزارش عوض می‌شود'
      )
    }
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    )
    try {
      await todoService.moveTask(taskId, { status: newStatus })
      await refreshStats()
    } catch (err) {
      await loadBoard()
      throw err
    }
  }

  const archiveTask = async (taskId) => {
    await todoService.archiveTask(taskId)
    await loadBoard()
    if (showArchived) await loadArchived()
  }

  const unarchiveTask = async (taskId) => {
    await todoService.unarchiveTask(taskId)
    await loadArchived()
    await loadBoard()
  }

  const addComment = async (taskId, text) => {
    const comment = await todoService.addComment(taskId, text)
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t
        const comments = Array.isArray(t.comments) ? t.comments : []
        return {
          ...t,
          comments: [...comments, comment],
          comments_count: (t.comments_count || comments.length) + 1,
        }
      })
    )
    return comment
  }

  const filteredTasks = useMemo(() => {
    let list = tasks
    if (filter !== 'all') {
      list = list.filter((t) => t.status === filter)
    }
    if (selectedEmployee) {
      list = list.filter((t) => String(t.assignee) === String(selectedEmployee))
    }
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase()
      list = list.filter(
        (t) =>
          (t.title || '').toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q) ||
          (t.assignee_name || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [tasks, filter, selectedEmployee, searchTerm])

  const value = {
    tasks,
    filteredTasks,
    archivedTasks,
    assignees,
    employees: assignees,
    labels: PRIORITIES,
    priorities: PRIORITIES,
    columns: COLUMNS,
    stats,
    loading,
    error,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    selectedEmployee,
    setSelectedEmployee,
    showArchived,
    setShowArchived,
    currentUser,
    isAdmin,
    refresh: loadBoard,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    archiveTask,
    unarchiveTask,
    addComment,
  }

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>
}
