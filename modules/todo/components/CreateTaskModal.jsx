'use client'

import React, { useState } from 'react'
import { X, User, Calendar, Tag, FileText } from 'lucide-react'
import { useTodo } from '../context/TodoContext'
import PersianDatePicker from '../../../components/common/PersianDatePicker'
import styles from '../../../styles/modules/CreateTaskModal.module.css'

const CreateTaskModal = ({ isOpen, onClose }) => {
  const { addTask, employees, labels } = useTodo()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    dueDate: '',
    label: '',
    status: 'todo',
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, dueDate: date }))
    if (errors.dueDate) {
      setErrors(prev => ({ ...prev, dueDate: '' }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'عنوان وظیفه الزامی است'
    if (!formData.assignee) newErrors.assignee = 'انتخاب کارمند الزامی است'
    if (!formData.dueDate) newErrors.dueDate = 'تاریخ سررسید الزامی است'
    if (!formData.label) newErrors.label = 'انتخاب برچسب الزامی است'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    addTask({
      ...formData,
      assignee: parseInt(formData.assignee),
    })

    onClose()
    setFormData({
      title: '',
      description: '',
      assignee: '',
      dueDate: '',
      label: '',
      status: 'todo',
    })
  }

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>➕ ایجاد وظیفه جدید</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* ردیف اول: کارمند و تاریخ */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>
                <User size={16} />
                کارمند
              </label>
              <select
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
                className={errors.assignee ? styles.error : ''}
              >
                <option value="">انتخاب کارمند...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} - {emp.role}
                  </option>
                ))}
              </select>
              {errors.assignee && <span className={styles.errorText}>{errors.assignee}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>
                <Calendar size={16} />
                تاریخ سررسید
              </label>
              <PersianDatePicker
                value={formData.dueDate}
                onChange={handleDateChange}
                placeholder="انتخاب تاریخ..."
              />
              {errors.dueDate && <span className={styles.errorText}>{errors.dueDate}</span>}
            </div>
          </div>

          {/* ردیف دوم: عنوان وظیفه */}
          <div className={styles.formGroup}>
            <label>
              <FileText size={16} />
              عنوان وظیفه
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="عنوان وظیفه را وارد کنید..."
              className={errors.title ? styles.error : ''}
            />
            {errors.title && <span className={styles.errorText}>{errors.title}</span>}
          </div>

          {/* ردیف سوم: توضیحات */}
          <div className={styles.formGroup}>
            <label>
              <FileText size={16} />
              توضیحات
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="توضیحات کامل وظیفه..."
              rows="3"
            />
          </div>

          {/* ردیف چهارم: برچسب */}
          <div className={styles.formGroup}>
            <label>
              <Tag size={16} />
              برچسب
            </label>
            <select
              name="label"
              value={formData.label}
              onChange={handleChange}
              className={errors.label ? styles.error : ''}
            >
              <option value="">انتخاب برچسب...</option>
              {labels.map(label => (
                <option key={label.id} value={label.name}>
                  {label.name}
                </option>
              ))}
            </select>
            {errors.label && <span className={styles.errorText}>{errors.label}</span>}
          </div>

          {/* دکمه‌های اقدام */}
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              انصراف
            </button>
            <button type="submit" className={styles.submitBtn}>
              ایجاد وظیفه
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTaskModal
