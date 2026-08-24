'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { initialTasks, employees, labels } from '../utils/mockData'

const TodoContext = createContext()

export const useTodo = () => {
  const context = useContext(TodoContext)
  if (!context) {
    throw new Error('useTodo must be used within TodoProvider')
  }
  return context
}

export const TodoProvider = ({ children }) => {
  const [tasks, setTasks] = useState([])
  const [archivedTasks, setArchivedTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showArchived, setShowArchived] = useState(false)
  const [currentUser, setCurrentUser] = useState({
    id: 1,
    name: 'مدیر',
    role: 'admin',
    isAdmin: true,
  })

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks')
    const savedArchived = localStorage.getItem('archivedTasks')
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    } else {
      setTasks(initialTasks)
    }
    if (savedArchived) {
      setArchivedTasks(JSON.parse(savedArchived))
    } else {
      setArchivedTasks([])
    }
  }, [])

  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('tasks', JSON.stringify(tasks))
    }
  }, [tasks])

  useEffect(() => {
    localStorage.setItem('archivedTasks', JSON.stringify(archivedTasks))
  }, [archivedTasks])

  const addTask = (taskData) => {
    const newTask = {
      id: Date.now(),
      ...taskData,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      comments: [],
      isArchived: false,
    }
    setTasks(prev => [newTask, ...prev])
    return newTask
  }

  const updateTask = (taskId, updatedData) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            ...updatedData, 
            updatedAt: new Date().toISOString().split('T')[0] 
          }
        : task
    ))
  }

  const deleteTask = (taskId) => {
    if (!currentUser.isAdmin) {
      throw new Error('تنها مدیر می‌تواند تسک را حذف کند')
    }
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }

  const moveTask = (taskId, newStatus) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { 
            ...task, 
            status: newStatus,
            updatedAt: new Date().toISOString().split('T')[0]
          }
        : task
    ))
  }

  const addComment = (taskId, commentText) => {
    const newComment = {
      id: Date.now(),
      text: commentText,
      author: currentUser.name,
      createdAt: new Date().toISOString().split('T')[0],
    }
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, comments: [...task.comments, newComment] }
        : task
    ))
  }

  // آرشیو کردن تسک
  const archiveTask = (taskId) => {
    const taskToArchive = tasks.find(task => task.id === taskId)
    if (taskToArchive) {
      // حذف از tasks اصلی
      setTasks(prev => prev.filter(task => task.id !== taskId))
      // اضافه به archivedTasks
      setArchivedTasks(prev => [...prev, { ...taskToArchive, archivedAt: new Date().toISOString().split('T')[0] }])
    }
  }

  // برگرداندن از آرشیو
  const unarchiveTask = (taskId) => {
    const taskToUnarchive = archivedTasks.find(task => task.id === taskId)
    if (taskToUnarchive) {
      setArchivedTasks(prev => prev.filter(task => task.id !== taskId))
      setTasks(prev => [...prev, { ...taskToUnarchive, isArchived: false }])
    }
  }

  // حذف کامل از آرشیو
  const deleteArchivedTask = (taskId) => {
    if (!currentUser.isAdmin) {
      throw new Error('تنها مدیر می‌تواند تسک را حذف کند')
    }
    setArchivedTasks(prev => prev.filter(task => task.id !== taskId))
  }

  const getFilteredTasks = () => {
    let filtered = tasks
    if (filter !== 'all') {
      filtered = filtered.filter(task => task.status === filter)
    }
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.includes(searchTerm) ||
        task.description.includes(searchTerm) ||
        employees.find(e => e.id === task.assignee)?.name.includes(searchTerm)
      )
    }
    if (selectedEmployee) {
      filtered = filtered.filter(task => task.assignee === selectedEmployee)
    }
    return filtered
  }

  const getStats = () => {
    const total = tasks.length
    const todo = tasks.filter(t => t.status === 'todo').length
    const inProgress = tasks.filter(t => t.status === 'inProgress').length
    const review = tasks.filter(t => t.status === 'review').length
    const done = tasks.filter(t => t.status === 'done').length
    const archived = archivedTasks.length
    return { total, todo, inProgress, review, done, archived }
  }

  const getEmployeeTasks = (employeeId) => {
    return tasks.filter(task => task.assignee === employeeId)
  }

  const value = {
    tasks,
    archivedTasks,
    filteredTasks: getFilteredTasks(),
    stats: getStats(),
    employees,
    labels,
    currentUser,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    selectedEmployee,
    setSelectedEmployee,
    showArchived,
    setShowArchived,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addComment,
    archiveTask,
    unarchiveTask,
    deleteArchivedTask,
    getEmployeeTasks,
  }

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  )
}
