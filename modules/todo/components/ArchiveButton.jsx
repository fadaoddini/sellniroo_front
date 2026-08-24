'use client'

import React from 'react'
import { Archive, ArchiveRestore, Trash2 } from 'lucide-react'
import { useTodo } from '../context/TodoContext'
import styles from '../../../styles/modules/ArchiveButton.module.css'

const ArchiveButton = ({ task, isArchived = false, onArchive }) => {
  const { archiveTask, unarchiveTask, deleteArchivedTask, currentUser } = useTodo()

  const handleArchive = () => {
    if (window.confirm('آیا از آرشیو کردن این وظیفه اطمینان دارید؟')) {
      archiveTask(task.id)
      if (onArchive) onArchive()
    }
  }

  const handleUnarchive = () => {
    unarchiveTask(task.id)
    if (onArchive) onArchive()
  }

  const handleDelete = () => {
    if (window.confirm('آیا از حذف دائمی این وظیفه اطمینان دارید؟')) {
      deleteArchivedTask(task.id)
      if (onArchive) onArchive()
    }
  }

  if (isArchived) {
    return (
      <div className={styles.archiveActions}>
        <button 
          className={`${styles.archiveBtn} ${styles.unarchiveBtn}`}
          onClick={handleUnarchive}
          title="بازگرداندن از آرشیو"
        >
          <ArchiveRestore size={16} />
          <span>بازگردانی</span>
        </button>
        {currentUser.isAdmin && (
          <button 
            className={`${styles.archiveBtn} ${styles.deletePermanentBtn}`}
            onClick={handleDelete}
            title="حذف دائمی"
          >
            <Trash2 size={16} />
            <span>حذف</span>
          </button>
        )}
      </div>
    )
  }

  // فقط برای تسک‌های با وضعیت 'done' دکمه آرشیو نمایش داده شود
  if (task.status !== 'done') return null

  return (
    <button 
      className={styles.archiveBtn}
      onClick={handleArchive}
      title="آرشیو کردن وظیفه"
    >
      <Archive size={16} />
      <span>آرشیو</span>
    </button>
  )
}

export default ArchiveButton
