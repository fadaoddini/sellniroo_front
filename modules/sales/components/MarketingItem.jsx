// app/sales/components/MarketingItem.jsx
'use client'

import React from 'react'
import { 
  Phone, Calendar, Clock as ClockIcon, 
  Trash2, CircleDot, 
  CircleX, CheckCircle2, CalendarClock,
  Eye, User, MessageSquare
} from 'lucide-react'
import styles from '../styles/MarketingItem.module.css'

const MarketingItem = ({ item, onViewDetail, onDelete, onStatusChange }) => {
  const isToday = item.nextFollowUp === new Date().toISOString().split('T')[0]
  
  const getStatusInfo = (status) => {
    const map = {
      new: { label: 'جدید', color: '#007aff', icon: <CircleDot size={12} /> },
      in_progress: { label: 'در حال پیگیری', color: '#ff9500', icon: <CircleDot size={12} /> },
      cancelled: { label: 'بسته شده', color: '#ff3b30', icon: <CircleX size={12} /> },
      confirmed: { label: 'قرارداد', color: '#34c759', icon: <CheckCircle2 size={12} /> },
    }
    return map[status] || map.new
  }

  const status = getStatusInfo(item.status)

  const getNextFollowUpLabel = () => {
    if (!item.nextFollowUp) return null
    const today = new Date().toISOString().split('T')[0]
    if (item.nextFollowUp === today) return 'امروز'
    return new Date(item.nextFollowUp).toLocaleDateString('fa-IR')
  }

  const handleActionClick = (e, action) => {
    e.stopPropagation()
    onStatusChange(item, action)
  }

  const isResultItem = item.status === 'confirmed' || item.status === 'cancelled'

  // ✅ لاگ برای دیباگ
  console.log('🔍 MarketingItem:', {
    id: item.id,
    title: item.title,
    hasDescription: !!item.description,
    description: item.description
  })

  return (
    <div 
      className={`${styles.item} ${isToday ? styles.todayItem : ''}`}
      onClick={() => onViewDetail(item)}
    >
      <div className={styles.itemContent}>
        <div className={styles.itemHeader}>
          <div className={styles.itemTitle}>
            <span className={styles.titleText}>{item.title}</span>
            {item.customer_name && (
              <span className={styles.customerName}> - {item.customer_name}</span>
            )}
            <span 
              className={styles.statusBadge}
              style={{ backgroundColor: status.color + '15', color: status.color }}
            >
              {status.icon} {status.label}
            </span>
          </div>
          <div className={styles.itemActions}>
            <button 
              className={styles.deleteBtn}
              onClick={(e) => {
                e.stopPropagation()
                onDelete(item.id)
              }}
            >
              <Trash2 size={14} />
            </button>
            <button 
              className={styles.viewBtn}
              onClick={(e) => {
                e.stopPropagation()
                onViewDetail(item)
              }}
            >
              <Eye size={14} />
            </button>
          </div>
        </div>
        
        {/* ✅ نمایش توضیحات در کارت */}
        {item.description && item.description.trim() !== '' && (
          <div className={styles.itemDescription}>
            <MessageSquare size={14} className={styles.descIcon} />
            <span className={styles.descText}>
              {item.description.length > 80 
                ? item.description.slice(0, 80) + '...' 
                : item.description}
            </span>
          </div>
        )}
        
        <div className={styles.itemMeta}>
          <span className={styles.phone}>
            <Phone size={12} />
            {item.phone}
          </span>
          <span className={styles.date}>
            <Calendar size={12} />
            {new Date(item.createdAt).toLocaleDateString('fa-IR')}
          </span>
          {item.nextFollowUp && (
            <span className={styles.nextFollow}>
              <ClockIcon size={12} />
              {getNextFollowUpLabel()}
              {item.nextFollowUpTime && ` ${item.nextFollowUpTime}`}
            </span>
          )}
          {item.assigned_to_name && (
            <span className={styles.assignedTo}>
              <User size={12} />
              {item.assigned_to_name}
            </span>
          )}
        </div>

        {!isResultItem && (
          <div className={styles.actionButtons}>
            <button 
              className={`${styles.actionBtn} ${styles.followUpBtn}`}
              onClick={(e) => handleActionClick(e, 'followup')}
              title="تنظیم پیگیری بعدی"
            >
              <CalendarClock size={14} />
              <span>پیگیری بعدی</span>
            </button>
            <button 
              className={`${styles.actionBtn} ${styles.closeBtn}`}
              onClick={(e) => handleActionClick(e, 'close')}
              title="بسته شدن (کنسل)"
            >
              <CircleX size={14} />
              <span>بسته شود</span>
            </button>
            <button 
              className={`${styles.actionBtn} ${styles.contractBtn}`}
              onClick={(e) => handleActionClick(e, 'contract')}
              title="تبدیل به قرارداد"
            >
              <CheckCircle2 size={14} />
              <span>قرارداد</span>
            </button>
          </div>
        )}

        {isResultItem && (
          <div className={styles.resultBadge}>
            {item.status === 'confirmed' ? (
              <span className={styles.confirmedBadge}>
                <CheckCircle2 size={12} />
                این مورد به قرارداد تبدیل شده است
              </span>
            ) : (
              <span className={styles.cancelledBadge}>
                <CircleX size={12} />
                این مورد بسته شده است
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MarketingItem