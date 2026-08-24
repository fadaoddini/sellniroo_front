// app/sales/components/StatusChangeModal.jsx
'use client'

import React, { useState, useEffect } from 'react'
import { 
  X, Calendar, Clock as ClockIcon, 
  CircleDot, CircleX, CheckCircle2,
  AlertCircle, CalendarClock, User,
  Phone, Loader2
} from 'lucide-react'
import PersianDatePicker from '@/components/common/PersianDatePicker'
import styles from '../styles/StatusChangeModal.module.css'

const StatusChangeModal = ({ isOpen, onClose, item, action, onConfirm, loading = false }) => {
  const [formData, setFormData] = useState({
    nextFollowUp: '',
    nextFollowUpTime: '',
    changeReason: '',
    description: '',
  })

  useEffect(() => {
    if (isOpen) {
      setFormData({
        nextFollowUp: '',
        nextFollowUpTime: '',
        changeReason: '',
        description: '',
      })
    }
  }, [isOpen])

  if (!isOpen || !item) return null

  const getActionConfig = () => {
    const configs = {
      followup: {
        title: 'تنظیم پیگیری بعدی',
        icon: <CalendarClock size={20} />,
        color: '#ff9500',
        status: 'in_progress',
        fields: ['nextFollowUp', 'nextFollowUpTime', 'description'],
        requireDate: true,
        placeholder: 'توضیح دهید برای پیگیری بعدی چه برنامه‌ای دارید...',
        confirmText: 'ثبت پیگیری',
      },
      close: {
        title: 'بسته شدن مورد',
        icon: <CircleX size={20} />,
        color: '#ff3b30',
        status: 'cancelled',
        fields: ['changeReason', 'description'],
        requireDate: false,
        placeholder: 'دلیل بسته شدن این مورد را توضیح دهید...',
        confirmText: 'تایید بسته شدن',
      },
      contract: {
        title: 'تبدیل به قرارداد',
        icon: <CheckCircle2 size={20} />,
        color: '#34c759',
        status: 'confirmed',
        fields: ['changeReason', 'description'],
        requireDate: false,
        placeholder: 'توضیح دهید چگونه به قرارداد رسیدید...',
        confirmText: 'تایید قرارداد',
      },
    }
    return configs[action] || configs.followup
  }

  const config = getActionConfig()

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (config.requireDate && !formData.nextFollowUp) {
      alert('لطفاً تاریخ پیگیری بعدی را انتخاب کنید')
      return
    }

    if (!formData.description.trim()) {
      alert('لطفاً توضیحات را وارد کنید')
      return
    }

    onConfirm(item.id, config.status, {
      ...formData,
      changeReason: formData.changeReason || '',
    })
  }

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // ✅ تابع جدید برای مدیریت تغییر تاریخ از PersianDatePicker
  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, nextFollowUp: date }))
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.iconWrapper} style={{ color: config.color, backgroundColor: config.color + '15' }}>
              {config.icon}
            </span>
            <h2>{config.title}</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} disabled={loading}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.itemInfo}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>
              <User size={14} />
              عنوان:
            </span>
            <span className={styles.infoValue}>{item.title}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>
              <Phone size={14} />
              موبایل:
            </span>
            <span className={styles.infoValue}>{item.phone}</span>
          </div>
          {item.customer_name && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>
                <User size={14} />
                مشتری:
              </span>
              <span className={styles.infoValue}>{item.customer_name}</span>
            </div>
          )}
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>
              <CircleDot size={14} />
              وضعیت فعلی:
            </span>
            <span 
              className={styles.currentStatus}
              style={{ 
                color: config.color,
                backgroundColor: config.color + '15',
              }}
            >
              {item.status_display || item.status}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {config.fields.includes('nextFollowUp') && (
            <div className={styles.dateSection}>
              <div className={styles.formGroup}>
                <label>
                  <Calendar size={14} />
                  تاریخ پیگیری بعدی *
                </label>
                {/* ✅ جایگزین input type="date" با PersianDatePicker */}
                <PersianDatePicker
                  value={formData.nextFollowUp}
                  onChange={handleDateChange}
                  placeholder="تاریخ پیگیری بعدی را انتخاب کنید"
                />
              </div>
              <div className={styles.formGroup}>
                <label>
                  <ClockIcon size={14} />
                  ساعت (اختیاری)
                </label>
                <input
                  type="time"
                  value={formData.nextFollowUpTime}
                  onChange={(e) => handleFieldChange('nextFollowUpTime', e.target.value)}
                />
              </div>
            </div>
          )}

          {config.fields.includes('changeReason') && (
            <div className={styles.formGroup}>
              <label>
                <AlertCircle size={14} />
                دلیل تغییر وضعیت *
              </label>
              <input
                type="text"
                value={formData.changeReason}
                onChange={(e) => handleFieldChange('changeReason', e.target.value)}
                placeholder={action === 'close' ? 'مثلاً: مشتری منصرف شد...' : 'مثلاً: قرارداد امضا شد...'}
                required
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label>
              <User size={14} />
              توضیحات *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder={config.placeholder}
              rows={4}
              required
            />
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
              انصراف
            </button>
            <button 
              type="submit" 
              className={styles.confirmBtn}
              style={{ backgroundColor: config.color }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className={styles.spinner} />
                  در حال ثبت...
                </>
              ) : (
                <>
                  {config.icon}
                  {config.confirmText}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StatusChangeModal