// app/sales/components/FollowupTimeline.jsx
'use client'

import React from 'react'
import { 
  Calendar, User, Clock, 
  CircleDot, CheckCircle2, CircleX,
  PlusCircle, RefreshCw, TrendingUp
} from 'lucide-react'
import styles from '../styles/FollowupTimeline.module.css'

const FollowupTimeline = ({ followups = [] }) => {
  if (!followups || followups.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Clock size={24} />
        <span>هیچ فعالیتی ثبت نشده است</span>
      </div>
    )
  }

  const getActionIcon = (actionType) => {
    const icons = {
      create: <PlusCircle size={14} />,
      followup: <RefreshCw size={14} />,
      close: <CircleX size={14} />,
      contract: <CheckCircle2 size={14} />,
      update: <RefreshCw size={14} />,
    }
    return icons[actionType] || <CircleDot size={14} />
  }

  const getActionColor = (actionType) => {
    const colors = {
      create: '#8b9aff',
      followup: '#ff9500',
      close: '#ff3b30',
      contract: '#34c759',
      update: '#8b9aff',
    }
    return colors[actionType] || '#666'
  }

  const getActionLabel = (actionType) => {
    const labels = {
      create: 'ایجاد شد',
      followup: 'پیگیری شد',
      close: 'بسته شد',
      contract: 'قرارداد شد',
      update: 'بروزرسانی شد',
    }
    return labels[actionType] || actionType
  }

  const getStatusLabel = (status) => {
    const map = {
      new: 'جدید',
      in_progress: 'در حال پیگیری',
      cancelled: 'بسته شده',
      confirmed: 'قرارداد',
    }
    return map[status] || status
  }

  const getStatusColor = (status) => {
    const map = {
      new: '#8b9aff',
      in_progress: '#ff9500',
      cancelled: '#ff3b30',
      confirmed: '#34c759',
    }
    return map[status] || '#666'
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className={styles.timeline}>
      {followups.map((followup, index) => {
        const isFirst = index === 0
        const isLast = index === followups.length - 1
        const actionColor = getActionColor(followup.action_type)
        const isContract = followup.action_type === 'contract'
        const isClose = followup.action_type === 'close'

        return (
          <div 
            key={followup.id} 
            className={`${styles.timelineItem} ${isFirst ? styles.firstItem : ''} ${isLast ? styles.lastItem : ''}`}
          >
            {/* خط عمودی */}
            {!isLast && <div className={styles.timelineLine} style={{ borderColor: actionColor + '40' }} />}
            
            {/* نقطه */}
            <div className={styles.timelineDot} style={{ backgroundColor: actionColor }}>
              {getActionIcon(followup.action_type)}
            </div>

            {/* محتوای کارت */}
            <div className={`${styles.timelineCard} ${isContract ? styles.contractCard : ''} ${isClose ? styles.closeCard : ''}`}>
              <div className={styles.cardHeader}>
                <div className={styles.cardLeft}>
                  <span 
                    className={styles.actionBadge}
                    style={{ backgroundColor: actionColor + '15', color: actionColor }}
                  >
                    {getActionIcon(followup.action_type)}
                    {getActionLabel(followup.action_type)}
                  </span>
                  <span 
                    className={styles.statusBadge}
                    style={{ 
                      backgroundColor: getStatusColor(followup.status) + '15',
                      color: getStatusColor(followup.status)
                    }}
                  >
                    {getStatusLabel(followup.status)}
                  </span>
                </div>
                <div className={styles.cardRight}>
                  <span className={styles.time}>
                    <Clock size={12} />
                    {formatTime(followup.created_at)}
                  </span>
                  <span className={styles.date}>
                    <Calendar size={12} />
                    {formatDate(followup.created_at)}
                  </span>
                </div>
              </div>

              <div className={styles.cardBody}>
                <p className={styles.description}>{followup.description}</p>
                
                {followup.change_reason && (
                  <div className={styles.reason}>
                    <span className={styles.reasonLabel}>دلیل:</span>
                    <span className={styles.reasonText}>{followup.change_reason}</span>
                  </div>
                )}

                {followup.next_follow_up && (
                  <div className={styles.nextFollow}>
                    <Calendar size={12} />
                    <span>پیگیری بعدی: {formatDate(followup.next_follow_up)}</span>
                    {followup.next_follow_up_time && (
                      <span className={styles.nextTime}>
                        ساعت {followup.next_follow_up_time}
                      </span>
                    )}
                  </div>
                )}

                {followup.created_by_name && (
                  <div className={styles.createdBy}>
                    <User size={12} />
                    <span>توسط: {followup.created_by_name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default FollowupTimeline