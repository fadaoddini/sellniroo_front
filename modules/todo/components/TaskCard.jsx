'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  User, Calendar, MessageCircle, MoreVertical, 
  Edit, Trash2, Plus, X, Check 
} from 'lucide-react'
import { useTodo } from '../context/TodoContext'
import { formatPersianDate } from '../../../utils/dateUtils'
import ArchiveButton from './ArchiveButton'
import styles from '../../../styles/modules/TaskCard.module.css'

const TaskCard = ({ task, onDragStart, isArchived = false }) => {
  const { employees, labels, currentUser, deleteTask, addComment } = useTodo()
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [showActions, setShowActions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const actionsRef = useRef(null)

  const assignee = employees.find(e => e.id === task.assignee)
  const label = labels.find(l => l.name === task.label)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setShowActions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDelete = () => {
    if (window.confirm('آیا از حذف این وظیفه اطمینان دارید؟')) {
      deleteTask(task.id)
      setShowActions(false)
    }
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment(task.id, newComment)
      setNewComment('')
    }
  }

  const getStatusText = (status) => {
    const map = {
      todo: 'در انتظار',
      inProgress: 'در حال انجام',
      review: 'در بررسی',
      done: 'انجام شده'
    }
    return map[status] || status
  }

  const getStatusColor = (status) => {
    const map = {
      todo: '#ff9500',
      inProgress: '#ffcc00',
      review: '#af52de',
      done: '#34c759'
    }
    return map[status] || '#8e8e93'
  }

  return (
    <div 
      className={`${styles.taskCard} ${isArchived ? styles.archived : ''}`}
      draggable={!isArchived}
      onDragStart={(e) => !isArchived && onDragStart(e, task.id)}
    >
      <div className={styles.taskHeader}>
        <div className={styles.taskTitle}>
          <h4>{task.title}</h4>
          {!isArchived && currentUser.isAdmin && (
            <div className={styles.actionsWrapper} ref={actionsRef}>
              <button 
                className={styles.moreBtn}
                onClick={() => setShowActions(!showActions)}
                aria-label="بیشتر"
              >
                <MoreVertical size={18} />
              </button>
              {showActions && (
                <div className={styles.actionsDropdown}>
                  <button 
                    className={styles.actionItem}
                    onClick={() => {
                      setIsEditing(true)
                      setShowActions(false)
                    }}
                  >
                    <Edit size={16} />
                    <span>ویرایش</span>
                  </button>
                  <button 
                    className={`${styles.actionItem} ${styles.deleteAction}`}
                    onClick={handleDelete}
                  >
                    <Trash2 size={16} />
                    <span>حذف</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className={styles.taskMeta}>
          <span 
            className={styles.taskLabel}
            style={{ backgroundColor: label?.color || '#8e8e93' }}
          >
            {task.label}
          </span>
          <span 
            className={styles.taskStatus}
            style={{ color: getStatusColor(task.status) }}
          >
            {getStatusText(task.status)}
          </span>
        </div>
      </div>

      <p className={styles.taskDescription}>{task.description}</p>

      <div className={styles.taskFooter}>
        <div className={styles.taskAssignees}>
          {assignee && (
            <div className={styles.assignee}>
              <div className={styles.assigneeAvatar}>
                {assignee.name.charAt(0)}
              </div>
              <span>{assignee.name}</span>
              <span className={styles.assigneeRole}>{assignee.role}</span>
            </div>
          )}
        </div>
        <div className={styles.taskDate}>
          <Calendar size={14} />
          <span>سررسید: {formatPersianDate(task.dueDate)}</span>
        </div>
      </div>

      {/* دکمه آرشیو - فقط برای تسک‌های انجام شده */}
      {!isArchived && <ArchiveButton task={task} />}

      {task.comments.length > 0 && (
        <button 
          className={styles.commentsToggle}
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle size={14} />
          <span>{task.comments.length} نظر</span>
        </button>
      )}

      {showComments && (
        <div className={styles.commentsSection}>
          {task.comments.map((comment) => (
            <div key={comment.id} className={styles.comment}>
              <div className={styles.commentHeader}>
                <span className={styles.commentAuthor}>{comment.author}</span>
                <span className={styles.commentDate}>
                  {formatPersianDate(comment.createdAt)}
                </span>
              </div>
              <p className={styles.commentText}>{comment.text}</p>
            </div>
          ))}
          
          <div className={styles.addComment}>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="نظر خود را بنویسید..."
              className={styles.commentInput}
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <button onClick={handleAddComment} className={styles.addCommentBtn}>
              <Plus size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskCard
