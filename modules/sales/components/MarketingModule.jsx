// app/sales/components/MarketingModule.jsx
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Plus, Search, ListFilter, AlertCircle, Clock as ClockIcon, 
  CircleDot, CircleX, CheckCircle2, Sparkles, 
  X, Phone, Calendar, User, Circle, Eye, 
  TrendingUp, Loader2, MessageSquare  // ✅ اضافه کردن MessageSquare
} from 'lucide-react'
import karmandanService from '../services/karmandanService'
import MarketingItem from './MarketingItem'
import StatusChangeModal from './StatusChangeModal'
import ConfirmDialog from './ConfirmDialog'
import FollowupTimeline from './FollowupTimeline'
import styles from '../styles/MarketingModule.module.css'
import PersianDatePicker from '@/components/common/PersianDatePicker'


const MarketingModule = () => {
  const [items, setItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusAction, setStatusAction] = useState(null)
  const [followups, setFollowups] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)

  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmData, setConfirmData] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    phone: '',
    description: '',
    customer_name: '',
    source: '',
    followUpDate: '',
    followUpTime: '',
  })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const leadsResponse = await karmandanService.getLeads()
      console.log('📊 Leads loaded:', leadsResponse)
      
      const formattedItems = Array.isArray(leadsResponse) 
        ? leadsResponse.map(lead => ({
            id: lead.id,
            title: lead.title,
            phone: lead.phone,
            status: lead.status,
            status_display: lead.status_display,
            description: lead.description || '',
            customer_name: lead.customer_name || '',
            createdAt: lead.created_at,
            nextFollowUp: lead.next_follow_up,
            nextFollowUpTime: lead.next_follow_up_time,
            assigned_to: lead.assigned_to,
            assigned_to_name: lead.assigned_to_name,
            created_by: lead.created_by,
            created_by_name: lead.created_by_name,
          }))
        : []
      
      console.log('📝 Formatted items with descriptions:', formattedItems.map(i => ({
        id: i.id,
        title: i.title,
        hasDescription: !!i.description,
        descriptionPreview: i.description ? i.description.slice(0, 30) + '...' : 'empty'
      })))
      
      setItems(formattedItems)
      
      try {
        const statsResponse = await karmandanService.getLeadStats()
        setStats(statsResponse)
      } catch (statsErr) {
        console.error('Error loading stats:', statsErr)
      }
      
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err.error || 'خطا در بارگذاری داده‌ها')
      loadMockData()
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMockData = () => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const mockItems = [
      {
        id: 1,
        title: 'سازه LSF - پروژه ویلای لوکس',
        phone: '09123456789',
        status: 'in_progress',
        status_display: 'در حال پیگیری',
        description: 'مشتری برای ساخت ویلای لوکس با سیستم LSF ابراز علاقه کرده',
        customer_name: 'احمد رضایی',
        createdAt: now.toISOString(),
        nextFollowUp: tomorrow.toISOString().split('T')[0],
        nextFollowUpTime: '10:00',
        assigned_to_name: 'علی محمدی',
      },
      {
        id: 2,
        title: 'کناف - ساختمان اداری',
        phone: '09129876543',
        status: 'new',
        status_display: 'جدید',
        description: 'شرکت پیمانکاری به دنبال اجرای کناف با کیفیت بالا است',
        customer_name: 'محمد کریمی',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        nextFollowUp: null,
        nextFollowUpTime: null,
        assigned_to_name: 'سارا احمدی',
      },
      {
        id: 3,
        title: 'طراحی معماری - ویلا',
        phone: '09123456788',
        status: 'confirmed',
        status_display: 'قرارداد',
        description: 'پروژه طراحی ویلا در شمال تهران. مشتری طرح اولیه را تایید کرده است.',
        customer_name: 'نادر حسینی',
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        nextFollowUp: null,
        nextFollowUpTime: null,
        assigned_to_name: 'علی محمدی',
      },
    ]
    setItems(mockItems)
  }

  useEffect(() => {
    loadData()
  }, [loadData])

  const refreshData = async () => {
    await loadData()
  }

  const getFilteredItems = useCallback(() => {
    let filtered = items
    
    if (activeTab !== 'all') {
      if (activeTab === 'today') {
        const today = new Date().toISOString().split('T')[0]
        filtered = items.filter(item => item.nextFollowUp === today)
      } else if (activeTab === 'near') {
        const today = new Date().toISOString().split('T')[0]
        const threeDaysLater = new Date()
        threeDaysLater.setDate(threeDaysLater.getDate() + 3)
        const threeDaysLaterStr = threeDaysLater.toISOString().split('T')[0]
        filtered = items.filter(item => 
          item.nextFollowUp && 
          item.nextFollowUp > today && 
          item.nextFollowUp <= threeDaysLaterStr
        )
      } else {
        filtered = items.filter(item => item.status === activeTab)
      }
    }
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(search) ||
        item.phone.includes(search) ||
        (item.customer_name && item.customer_name.toLowerCase().includes(search)) ||
        (item.description && item.description.toLowerCase().includes(search))
      )
    }
    
    return filtered
  }, [items, activeTab, searchTerm])

  const getColumnItems = useCallback(() => {
    const filtered = getFilteredItems()
    
    const newItems = filtered.filter(item => item.status === 'new')
    const progressItems = filtered.filter(item => item.status === 'in_progress')
    const resultsItems = filtered.filter(item => 
      item.status === 'confirmed' || item.status === 'cancelled'
    )
    
    return { newItems, progressItems, resultsItems }
  }, [getFilteredItems])

  const handleAddItem = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.phone.trim()) {
      alert('عنوان و موبایل الزامی است')
      return
    }
    
    try {
      setLoading(true)
      
      const leadData = {
        title: formData.title,
        phone: formData.phone,
        description: formData.description || '',
        customer_name: formData.customer_name || '',
        source: formData.source || 'داخلی',
        status: 'new',
        next_follow_up: formData.followUpDate || null,
        next_follow_up_time: formData.followUpTime || null,
      }
      
      console.log('📤 Creating lead with data:', leadData)
      
      const newLead = await karmandanService.createLead(leadData)
      console.log('✅ Lead created:', newLead)
      
      await loadData()
      
      setFormData({ 
        title: '', 
        phone: '', 
        description: '',
        customer_name: '',
        source: '',
        followUpDate: '',
        followUpTime: '',
      })
      setShowForm(false)
      
    } catch (err) {
      console.error('❌ Error creating lead:', err)
      alert(err.error || 'خطا در ایجاد لید')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async (id) => {
    if (!window.confirm('آیا از حذف این مورد اطمینان دارید؟')) {
      return
    }
    
    try {
      setLoading(true)
      await karmandanService.deleteLead(id)
      await loadData()
      
      if (selectedItem?.id === id) {
        setSelectedItem(null)
        setShowDetail(false)
      }
    } catch (err) {
      console.error('Error deleting lead:', err)
      alert(err.error || 'خطا در حذف لید')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = async (item) => {
    try {
      setLoading(true)
      setSelectedItem(item)
      
      const detail = await karmandanService.getLeadDetail(item.id)
      console.log('📄 Lead detail:', detail)
      
      // ✅ دریافت followups از detail
      const followupsData = detail.followups || []
      console.log('📋 Followups from detail:', followupsData)
      
      // تبدیل داده‌های پیگیری
      const formattedFollowups = Array.isArray(followupsData) 
        ? followupsData.map(f => ({
            id: f.id,
            status: f.status,
            status_display: f.status_display,
            action_type: f.action_type,
            action_display: f.action_display,
            description: f.description || '',
            changeReason: f.change_reason || '',
            createdAt: f.created_at,
            nextFollowUp: f.next_follow_up,
            nextFollowUpTime: f.next_follow_up_time,
            created_by_name: f.created_by_name,
          }))
        : []
      
      setFollowups(formattedFollowups)
      setShowDetail(true)
      
    } catch (err) {
      console.error('Error loading detail:', err)
      alert(err.error || 'خطا در دریافت جزئیات')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChangeRequest = (itemId, status, data) => {
    setConfirmData({
      itemId,
      status,
      data,
      action: statusAction,
    })
    setShowConfirmDialog(true)
  }

  const handleStatusChangeConfirmed = async () => {
    if (!confirmData) return
    
    const { itemId, status, data } = confirmData
    
    try {
      setLoading(true)
      
      const followupData = {
        status: status,
        description: data.description || '',
        change_reason: data.changeReason || '',
        next_follow_up: data.nextFollowUp || null,
        next_follow_up_time: data.nextFollowUpTime || null,
      }
      
      console.log('📤 Sending followup data:', followupData)
      
      await karmandanService.addFollowup(itemId, followupData)
      
      await loadData()
      
      setShowConfirmDialog(false)
      setConfirmData(null)
      setShowStatusModal(false)
      setStatusAction(null)
      
      if (selectedItem?.id === itemId) {
        const updatedFollowups = await karmandanService.getFollowups(itemId)
        const formatted = Array.isArray(updatedFollowups) 
          ? updatedFollowups.map(f => ({
              id: f.id,
              status: f.status,
              status_display: f.status_display,
              description: f.description || '',
              changeReason: f.change_reason || '',
              createdAt: f.created_at,
              nextFollowUp: f.next_follow_up,
              nextFollowUpTime: f.next_follow_up_time,
              created_by_name: f.created_by_name,
            }))
          : []
        setFollowups(formatted)
      }
      
    } catch (err) {
      console.error('Error changing status:', err)
      alert(err.error || 'خطا در تغییر وضعیت')
    } finally {
      setLoading(false)
    }
  }

  const openStatusModal = (item, action) => {
    setSelectedItem(item)
    setStatusAction(action)
    setShowStatusModal(true)
  }

  const closeStatusModal = () => {
    setShowStatusModal(false)
    setStatusAction(null)
  }

  const { newItems, progressItems, resultsItems } = getColumnItems()

  const getStatusColor = (status) => {
    const map = {
      new: '#8b9aff',
      in_progress: '#ff9500',
      cancelled: '#ff3b30',
      confirmed: '#34c759',
    }
    return map[status] || '#666'
  }

  const getStatusIcon = (status) => {
    const map = {
      new: <Sparkles size={12} />,
      in_progress: <CircleDot size={12} />,
      cancelled: <CircleX size={12} />,
      confirmed: <CheckCircle2 size={12} />,
    }
    return map[status] || <Circle size={12} />
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

  const getConfirmMessage = () => {
    const messages = {
      followup: 'آیا از ثبت پیگیری برای این مورد اطمینان دارید؟',
      close: 'آیا از بسته شدن این مورد اطمینان دارید؟ این اقدام غیرقابل بازگشت است.',
      contract: 'آیا از تبدیل این مورد به قرارداد اطمینان دارید؟',
    }
    return messages[statusAction] || 'آیا از انجام این اقدام اطمینان دارید؟'
  }

  const getConfirmTitle = () => {
    const titles = {
      followup: 'تایید ثبت پیگیری',
      close: 'تایید بسته شدن',
      contract: 'تایید قرارداد',
    }
    return titles[statusAction] || 'تایید اقدام'
  }

  const getConfirmType = () => {
    const types = {
      followup: 'warning',
      close: 'danger',
      contract: 'success',
    }
    return types[statusAction] || 'warning'
  }

  const getConfirmText = () => {
    const texts = {
      followup: 'ثبت پیگیری',
      close: 'بله، بسته شود',
      contract: 'بله، قرارداد',
    }
    return texts[statusAction] || 'تایید'
  }

  if (loading && items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <Loader2 className={styles.spinner} size={40} />
          <p>در حال بارگذاری...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <ListFilter size={18} className={styles.headerIcon} />
            بازاریابی و پیگیری
          </h1>
          <p className={styles.subtitle}>مدیریت موارد بازاریابی و پیگیری‌ها</p>
          {stats && (
            <div className={styles.statsBar}>
              <span>کل: {stats.total || 0}</span>
              <span>جدید: {stats.new || 0}</span>
              <span>در حال پیگیری: {stats.in_progress || 0}</span>
              <span>قرارداد: {stats.confirmed || 0}</span>
              <span>بسته شده: {stats.cancelled || 0}</span>
            </div>
          )}
        </div>
        <div className={styles.headerActions}>
          <button className={styles.addBtn} onClick={() => setShowForm(true)}>
            <Plus size={16} />
            مورد جدید
          </button>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجو در موارد..."
            className={styles.searchInput}
          />
        </div>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('all')}
          >
            همه ({items.length})
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'new' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('new')}
          >
            <Sparkles size={12} /> جدید ({items.filter(i => i.status === 'new').length})
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'in_progress' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('in_progress')}
          >
            <CircleDot size={12} /> در حال پیگیری ({items.filter(i => i.status === 'in_progress').length})
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'today' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('today')}
          >
            <AlertCircle size={12} /> امروز
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'near' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('near')}
          >
            <ClockIcon size={12} /> نزدیک
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'confirmed' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('confirmed')}
          >
            <CheckCircle2 size={12} /> قرارداد ({items.filter(i => i.status === 'confirmed').length})
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'cancelled' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            <CircleX size={12} /> بسته شده ({items.filter(i => i.status === 'cancelled').length})
          </button>
        </div>
      </div>

      <div className={styles.columnsContainer}>
        <div className={`${styles.column} ${styles.columnNew}`}>
          <div className={styles.columnHeader}>
            <span className={styles.columnTitle}>
              <Sparkles size={16} />
              جدید
            </span>
            <span className={styles.columnCount}>{newItems.length}</span>
          </div>
          <div className={styles.columnBody}>
            {newItems.length === 0 ? (
              <div className={styles.emptyColumn}>
                <Sparkles size={32} />
                <span>هیچ مورد جدیدی وجود ندارد</span>
              </div>
            ) : (
              newItems.map(item => (
                <MarketingItem
                  key={item.id}
                  item={item}
                  onViewDetail={handleViewDetail}
                  onDelete={handleDeleteItem}
                  onStatusChange={openStatusModal}
                />
              ))
            )}
          </div>
        </div>

        <div className={`${styles.column} ${styles.columnProgress}`}>
          <div className={styles.columnHeader}>
            <span className={styles.columnTitle}>
              <CircleDot size={16} />
              در حال پیگیری
            </span>
            <span className={styles.columnCount}>{progressItems.length}</span>
          </div>
          <div className={styles.columnBody}>
            {progressItems.length === 0 ? (
              <div className={styles.emptyColumn}>
                <CircleDot size={32} />
                <span>هیچ مورد در حال پیگیری وجود ندارد</span>
              </div>
            ) : (
              progressItems.map(item => (
                <MarketingItem
                  key={item.id}
                  item={item}
                  onViewDetail={handleViewDetail}
                  onDelete={handleDeleteItem}
                  onStatusChange={openStatusModal}
                />
              ))
            )}
          </div>
        </div>

        <div className={`${styles.column} ${styles.columnResults}`}>
          <div className={styles.columnHeader}>
            <span className={styles.columnTitle}>
              <TrendingUp size={16} />
              نتایج
            </span>
            <span className={styles.columnCount}>{resultsItems.length}</span>
          </div>
          <div className={styles.columnBody}>
            {resultsItems.length === 0 ? (
              <div className={styles.emptyColumn}>
                <TrendingUp size={32} />
                <span>هیچ نتیجه‌ای ثبت نشده است</span>
              </div>
            ) : (
              resultsItems.map(item => (
                <MarketingItem
                  key={item.id}
                  item={item}
                  onViewDetail={handleViewDetail}
                  onDelete={handleDeleteItem}
                  onStatusChange={openStatusModal}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                <Plus size={18} className={styles.modalIcon} />
                مورد جدید
              </h2>
              <button className={styles.closeBtn} onClick={() => setShowForm(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleAddItem}>
              <div className={styles.formGroup}>
                <label>عنوان *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثلاً: پروژه سازه LSF"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>نام مشتری</label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="نام مشتری..."
                />
              </div>
              <div className={styles.formGroup}>
                <label>شماره موبایل *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0912xxx..."
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>منبع</label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="منبع (مثلاً: اینستاگرام، تبلیغات، ...)"
                />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>
                    <Calendar size={14} />
                    تاریخ پیگیری (اختیاری)
                  </label>
                  <PersianDatePicker
                    value={formData.followUpDate}
                    onChange={(date) => setFormData({ ...formData, followUpDate: date })}
                    placeholder="تاریخ پیگیری را انتخاب کنید"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>
                    <ClockIcon size={14} />
                    ساعت (اختیاری)
                  </label>
                  <input
                    type="time"
                    value={formData.followUpTime}
                    onChange={(e) => setFormData({ ...formData, followUpTime: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>توضیحات</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="توضیحات کامل درباره این مورد..."
                  rows={4}
                />
              </div>
              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>
                  انصراف
                </button>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? 'در حال ثبت...' : 'ثبت مورد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetail && selectedItem && (
        <div className={styles.modalOverlay} onClick={() => { setShowDetail(false); setSelectedItem(null) }}>
          <div className={`${styles.modal} ${styles.detailModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                <ListFilter size={18} className={styles.modalIcon} />
                {selectedItem.title}
              </h2>
              <button className={styles.closeBtn} onClick={() => { setShowDetail(false); setSelectedItem(null) }}>
                <X size={18} />
              </button>
            </div>
            
            <div className={styles.detailContent}>
              <div className={styles.infoBar}>
                <span className={styles.infoItem}>
                  <Phone size={14} />
                  {selectedItem.phone}
                </span>
                {selectedItem.customer_name && (
                  <span className={styles.infoItem}>
                    <User size={14} />
                    {selectedItem.customer_name}
                  </span>
                )}
                <span className={styles.infoItem}>
                  <Calendar size={14} />
                  {new Date(selectedItem.createdAt).toLocaleDateString('fa-IR')}
                </span>
                {selectedItem.nextFollowUp && (
                  <span className={styles.infoItem}>
                    <ClockIcon size={14} />
                    {new Date(selectedItem.nextFollowUp).toLocaleDateString('fa-IR')}
                    {selectedItem.nextFollowUpTime && ` ${selectedItem.nextFollowUpTime}`}
                  </span>
                )}
                {selectedItem.assigned_to_name && (
                  <span className={styles.infoItem}>
                    <User size={14} />
                    مسئول: {selectedItem.assigned_to_name}
                  </span>
                )}
                <span 
                  className={styles.infoStatus}
                  style={{ 
                    backgroundColor: getStatusColor(selectedItem.status) + '20',
                    color: getStatusColor(selectedItem.status)
                  }}
                >
                  {getStatusIcon(selectedItem.status)} {getStatusLabel(selectedItem.status)}
                </span>
              </div>

              {/* ✅ نمایش توضیحات در صفحه جزئیات */}
              <div className={styles.descriptionSection}>
                <h4 className={styles.sectionTitle}>
                  <MessageSquare size={16} className={styles.labelIcon} />
                  توضیحات
                </h4>
                <div className={styles.descriptionBox}>
                  {selectedItem.description ? (
                    <p>{selectedItem.description}</p>
                  ) : (
                    <p className={styles.emptyDescription}>توضیحی ثبت نشده است</p>
                  )}
                </div>
              </div>

              <div className={styles.timelineSection}>
                <div className={styles.timelineHeader}>
                  <ClockIcon size={16} className={styles.labelIcon} />
                  <h4>تاریخچه فعالیت‌ها</h4>
                  <span className={styles.timelineCount}>{followups.length}</span>
                </div>
                <FollowupTimeline followups={followups} />
              </div>

              <div className={styles.followups}>
                <h4>
                  <ClockIcon size={14} className={styles.labelIcon} />
                  تاریخچه پیگیری‌ها ({followups.length})
                </h4>
                {followups.length === 0 ? (
                  <p className={styles.noFollowups}>هیچ پیگیری ثبت نشده</p>
                ) : (
                  followups.map(f => (
                    <div key={f.id} className={styles.followupItem}>
                      <div className={styles.followupHeader}>
                        <span className={styles.followupStatus}>
                          {getStatusIcon(f.status)} {getStatusLabel(f.status)}
                        </span>
                        <span className={styles.followupDate}>
                          <Calendar size={12} />
                          {new Date(f.createdAt).toLocaleString('fa-IR')}
                        </span>
                        {f.created_by_name && (
                          <span className={styles.followupBy}>
                            <User size={12} />
                            {f.created_by_name}
                          </span>
                        )}
                      </div>
                      <p className={styles.followupDesc}>{f.description}</p>
                      {f.changeReason && (
                        <div className={styles.followupReason}>
                          <AlertCircle size={12} />
                          دلیل: {f.changeReason}
                        </div>
                      )}
                      {f.nextFollowUp && (
                        <div className={styles.followupNext}>
                          <ClockIcon size={12} />
                          پیگیری بعدی: {new Date(f.nextFollowUp).toLocaleDateString('fa-IR')}
                          {f.nextFollowUpTime && ` ساعت ${f.nextFollowUpTime}`}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showStatusModal && selectedItem && statusAction && (
        <StatusChangeModal
          isOpen={showStatusModal}
          onClose={closeStatusModal}
          item={selectedItem}
          action={statusAction}
          onConfirm={handleStatusChangeRequest}
          loading={loading}
        />
      )}

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false)
          setConfirmData(null)
        }}
        onConfirm={handleStatusChangeConfirmed}
        title={getConfirmTitle()}
        message={getConfirmMessage()}
        confirmText={getConfirmText()}
        cancelText="انصراف"
        type={getConfirmType()}
        loading={loading}
      />
    </div>
  )
}

export default MarketingModule