'use client'

import React, { useState } from 'react'
import { Plus, Search, Users, User, Archive, ArchiveRestore } from 'lucide-react'
import { TodoProvider, useTodo } from '../context/TodoContext'
import StatsCards from './StatsCards'
import TaskColumns from './TaskColumns'
import TaskCard from './TaskCard'
import CreateTaskModal from './CreateTaskModal'
import styles from '../../../styles/modules/TodoModule.module.css'

const TodoContent = () => {
  const { 
    filter, setFilter, 
    searchTerm, setSearchTerm,
    selectedEmployee, setSelectedEmployee,
    employees,
    stats,
    showArchived,
    setShowArchived,
    archivedTasks
  } = useTodo()

  const [isModalOpen, setIsModalOpen] = useState(false)

  const filters = [
    { id: 'all', label: 'همه' },
    { id: 'todo', label: 'در انتظار' },
    { id: 'inProgress', label: 'در حال انجام' },
    { id: 'review', label: 'در بررسی' },
    { id: 'done', label: 'انجام شده' },
  ]

  return (
    <div className={styles.todoContainer}>
      <div className={styles.todoHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>📊 مدیریت وظایف</h1>
          <div className={styles.statsBadge}>
            <span>{stats.total} وظیفه</span>
            <span className={styles.badgeDivider}>|</span>
            <span>{stats.done} انجام شده</span>
            <span className={styles.badgeDivider}>|</span>
            <span>{stats.archived} آرشیو شده</span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={`${styles.archiveToggleBtn} ${showArchived ? styles.activeArchive : ''}`}
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? <ArchiveRestore size={18} /> : <Archive size={18} />}
            <span>{showArchived ? 'بازگشت' : 'آرشیو'}</span>
          </button>
          <button 
            className={styles.createBtn}
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={20} />
            <span>وظیفه جدید</span>
          </button>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.filters}>
          {filters.map((f) => (
            <button
              key={f.id}
              className={`${styles.filterBtn} ${filter === f.id ? styles.activeFilter : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجوی وظایف، کارمندان..."
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.employeeFilter}>
        <div className={styles.employeeFilterHeader}>
          <Users size={18} />
          <span>فیلتر بر اساس کارمند:</span>
        </div>
        <div className={styles.employeeList}>
          <button
            className={`${styles.employeeBtn} ${!selectedEmployee ? styles.activeEmployee : ''}`}
            onClick={() => setSelectedEmployee(null)}
          >
            <User size={16} />
            همه
          </button>
          {employees.map(emp => (
            <button
              key={emp.id}
              className={`${styles.employeeBtn} ${selectedEmployee === emp.id ? styles.activeEmployee : ''}`}
              onClick={() => setSelectedEmployee(emp.id)}
            >
              <div className={styles.employeeAvatar}>
                {emp.name.charAt(0)}
              </div>
              {emp.name}
            </button>
          ))}
        </div>
      </div>

      <StatsCards />
      
      {showArchived ? (
        <div className={styles.archivedSection}>
          <div className={styles.archivedHeader}>
            <Archive size={20} />
            <h3>وظایف آرشیو شده</h3>
            <span className={styles.archivedCount}>{archivedTasks.length}</span>
          </div>
          <div className={styles.archivedGrid}>
            {archivedTasks.length > 0 ? (
              archivedTasks.map(task => (
                <div key={task.id} className={styles.archivedCard}>
                  <TaskCard task={task} isArchived={true} />
                </div>
              ))
            ) : (
              <div className={styles.emptyArchived}>
                <Archive size={48} />
                <p>هیچ وظیفه‌ای آرشیو نشده است</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <TaskColumns />
      )}

      <CreateTaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}

const TodoModule = () => {
  return (
    <TodoProvider>
      <TodoContent />
    </TodoProvider>
  )
}

export default TodoModule
