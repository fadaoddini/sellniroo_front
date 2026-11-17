'use client'

import React, { useState } from 'react'
import { useTodo } from '../context/TodoContext'
import TaskCard from './TaskCard'
import styles from '../../../styles/modules/TodoColumns.module.css'

const TaskColumns = () => {
  const { filteredTasks, moveTask } = useTodo()
  const [draggedTask, setDraggedTask] = useState(null)

  const columns = [
    { id: 'todo', title: '📋 در انتظار' },
    { id: 'inProgress', title: '⚡ در حال انجام' },
    { id: 'review', title: '🔍 در بررسی' },
    { id: 'done', title: '✅ انجام شده' },
  ]

  const getTasksByStatus = (status) => {
    return filteredTasks.filter(task => task.status === status)
  }

  const handleDragStart = (e, taskId) => {
    setDraggedTask(taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, status) => {
    e.preventDefault()
    if (draggedTask) {
      moveTask(draggedTask, status)
      setDraggedTask(null)
    }
  }

  return (
    <div className={styles.columnsContainer}>
      {columns.map((column) => (
        <div
          key={column.id}
          className={styles.column}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <div className={styles.columnHeader}>
            <span className={styles.columnTitle}>{column.title}</span>
            <span className={styles.columnCount}>
              {getTasksByStatus(column.id).length}
            </span>
          </div>
          <div className={styles.columnBody}>
            {getTasksByStatus(column.id).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDragStart={handleDragStart}
              />
            ))}
            {getTasksByStatus(column.id).length === 0 && (
              <div className={styles.emptyState}>
                <span>هیچ وظیفه‌ای در این بخش نیست</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default TaskColumns
