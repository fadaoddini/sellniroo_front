// app/sales/components/MarketingModule.jsx
'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, Search, ListFilter, AlertCircle, Clock as ClockIcon, 
  CircleDot, CircleX, CheckCircle2, Sparkles, 
  X, Phone, Calendar, User, Circle, Eye, 
  TrendingUp, Loader2, MessageSquare, FileText, ScrollText, UserCog, Archive,
  HelpCircle
} from 'lucide-react'
import karmandanService from '../services/karmandanService'
import MarketingItem from './MarketingItem'
import StatusChangeModal from './StatusChangeModal'
import ConfirmDialog from './ConfirmDialog'
import FollowupTimeline from './FollowupTimeline'
import SalesBottomNav from './SalesBottomNav'
import SaleAccessBar from './SaleAccessBar'
import SaleArchive from './SaleArchive'
import MarketingLeadDetail from './MarketingLeadDetail'
import SaleTour, { hasSeenSaleTour } from './SaleTour'
import styles from '../styles/MarketingModule.module.css'
import PersianDatePicker from '@/components/common/PersianDatePicker'
import { useAuth } from '@/contexts/AuthContext'

const TOUR_DEMO_LEAD = {
  id: 'tour-demo',
  title: 'نمونه درخواست مشتری (آموزشی)',
  phone: '09120000000',
  customer_name: 'مشتری نمونه',
  status: 'in_progress',
  status_display: 'پیگیری',
  tracking_code: 'SL-000000',
  createdAt: new Date().toISOString(),
  created_at: new Date().toISOString(),
  nextFollowUp: new Date().toISOString().slice(0, 10),
  next_follow_up: new Date().toISOString().slice(0, 10),
  assigned_to_name: 'کارمند فروش',
  description: 'این یک مورد نمونه برای تور راهنما است تا دیالوگ جزئیات را ببینید.',
}

const TOUR_DEMO_FOLLOWUPS = [
  {
    id: 'tour-fu-1',
    status: 'in_progress',
    action_type: 'followup',
    description: 'تماس گرفته شد؛ مشتری درخواست پیش‌فاکتور داشت.',
    created_at: new Date().toISOString(),
    created_by_name: 'کارمند فروش',
    attachments: [],
  },
]

const MarketingModule = () => {
  const router = useRouter()
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    checkingEmployee,
    hasPermission,
    employeeData,
  } = useAuth()
  const searchInputRef = useRef(null)

  const [items, setItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusAction, setStatusAction] = useState(null)
  const [followups, setFollowups] = useState([])
  const [assignments, setAssignments] = useState([])
  const [assignableStaff, setAssignableStaff] = useState([])
  const [assignEmployeeId, setAssignEmployeeId] = useState('')
  const [assignNote, setAssignNote] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)
  const [isMobileApp, setIsMobileApp] = useState(false)
  const [tourOpen, setTourOpen] = useState(false)
  const tourDialogRef = useRef(false)
  const tourPrevDetailRef = useRef(null)
  const pendingFilesRef = useRef([])
  const detailStateRef = useRef({
    showDetail: false,
    selectedItem: null,
    followups: [],
    assignments: [],
  })

  const accessLevel = Number(
    employeeData?.access_level ?? user?.access_level ?? 0
  )
  const isSaleManager = !!user?.is_superuser || accessLevel >= 3
  const canMarketing =
    hasPermission('marketing') ||
    hasPermission('sales') ||
    !!employeeData?.is_marketing ||
    !!employeeData?.is_sales ||
    !!user?.is_superuser
  const canAccessSale = canMarketing || isSaleManager
  const canCreateLead = canMarketing || isSaleManager

  const apiErrorMessage = (err, fallback) => {
    if (!err) return fallback
    if (typeof err === 'string') return err
    if (err.message) return err.message
    if (err.error) return err.error
    if (err.detail) return err.detail
    const firstKey = Object.keys(err).find((k) => Array.isArray(err[k]) && err[k][0])
    if (firstKey) return err[firstKey][0]
    return fallback
  }

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)')
    const apply = () => setIsMobileApp(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    if (authLoading || checkingEmployee) return
    if (!isAuthenticated) {
      router.replace('/login?next=/sale')
      return
    }
    if (!canAccessSale) {
      router.replace('/dashboard')
    }
  }, [authLoading, checkingEmployee, isAuthenticated, canAccessSale, router])

  useEffect(() => {
    if (authLoading || checkingEmployee || !canAccessSale || loading) return
    if (!hasSeenSaleTour()) {
      const t = setTimeout(() => setTourOpen(true), 800)
      return () => clearTimeout(t)
    }
    return undefined
  }, [authLoading, checkingEmployee, canAccessSale, loading])

  useEffect(() => {
    detailStateRef.current = {
      showDetail,
      selectedItem,
      followups,
      assignments,
    }
  }, [showDetail, selectedItem, followups, assignments])

  const handleTourDialogRequired = useCallback((needOpen) => {
    if (needOpen) {
      if (!tourDialogRef.current) {
        tourPrevDetailRef.current = { ...detailStateRef.current }
        setSelectedItem(TOUR_DEMO_LEAD)
        setFollowups(TOUR_DEMO_FOLLOWUPS)
        setAssignments([])
        setShowDetail(true)
        tourDialogRef.current = true
      }
      return
    }
    if (tourDialogRef.current) {
      const prev = tourPrevDetailRef.current
      tourDialogRef.current = false
      tourPrevDetailRef.current = null
      if (prev?.showDetail && prev.selectedItem && prev.selectedItem.id !== 'tour-demo') {
        setSelectedItem(prev.selectedItem)
        setFollowups(prev.followups || [])
        setAssignments(prev.assignments || [])
        setShowDetail(true)
      } else {
        setShowDetail(false)
        setSelectedItem(null)
        setFollowups([])
        setAssignments([])
      }
    }
  }, [])

  useEffect(() => {
    if (!isMobileApp) return undefined
    const main = document.querySelector('main')
    if (!main) return undefined
    const prev = main.style.paddingBottom
    main.style.paddingBottom = 'calc(92px + env(safe-area-inset-bottom, 0px))'
    return () => {
      main.style.paddingBottom = prev
    }
  }, [isMobileApp])

  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmData, setConfirmData] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    phone: '',
    description: '',
    customer_name: '',
    followUpDate: '',
    followUpTime: '',
  })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const leadsResponse = await karmandanService.getLeads()
      const rawList = Array.isArray(leadsResponse)
        ? leadsResponse
        : Array.isArray(leadsResponse?.results)
          ? leadsResponse.results
          : Array.isArray(leadsResponse?.data)
            ? leadsResponse.data
            : []

      const formattedItems = rawList.map((lead) => ({
        id: lead.id,
        title: lead.title,
        phone: lead.phone,
        status: lead.status,
        status_display: lead.status_display,
        tracking_code: lead.tracking_code || '',
        description: lead.description || '',
        customer_name: lead.customer_name || '',
        createdAt: lead.created_at,
        nextFollowUp: lead.next_follow_up,
        nextFollowUpTime: lead.next_follow_up_time,
        assigned_to: lead.assigned_to,
        assigned_to_name: lead.assigned_to_name,
        created_by: lead.created_by,
        created_by_name: lead.created_by_name,
        is_archived: !!lead.is_archived,
      }))

      setItems(formattedItems)

      try {
        const statsResponse = await karmandanService.getLeadStats()
        const statsData = statsResponse?.data || statsResponse
        setStats(statsData)
      } catch (statsErr) {
        console.error('Error loading stats:', statsErr)
      }
      
    } catch (err) {
      console.error('Error loading data:', err)
      setError(apiErrorMessage(err, 'خطا در بارگذاری داده‌ها'))
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const refreshData = async () => {
    await loadData()
  }

  const getFilteredItems = useCallback(() => {
    let filtered = items
    
    if (activeTab !== 'all' && activeTab !== 'archived') {
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
        (item.tracking_code && item.tracking_code.toLowerCase().includes(search)) ||
        (item.customer_name && item.customer_name.toLowerCase().includes(search)) ||
        (item.description && item.description.toLowerCase().includes(search))
      )
    }
    
    return filtered
  }, [items, activeTab, searchTerm])

  const getColumnItems = useCallback(() => {
    const filtered = getFilteredItems()
    return {
      newItems: filtered.filter((item) => item.status === 'new'),
      progressItems: filtered.filter((item) => item.status === 'in_progress'),
      confirmedItems: filtered.filter((item) => item.status === 'confirmed'),
      cancelledItems: filtered.filter((item) => item.status === 'cancelled'),
    }
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
        followUpDate: '',
        followUpTime: '',
      })
      setShowForm(false)
      
    } catch (err) {
      console.error('❌ Error creating lead:', err)
      alert(apiErrorMessage(err, 'خطا در ایجاد لید'))
    } finally {
      setLoading(false)
    }
  }

  const formatAssignmentRange = (row) => {
    const from = row?.started_at
      ? new Date(row.started_at).toLocaleDateString('fa-IR')
      : '—'
    if (!row?.ended_at) return `از ${from} تا اکنون`
    const to = new Date(row.ended_at).toLocaleDateString('fa-IR')
    return `از ${from} تا ${to}`
  }

  const handleViewDetail = async (item) => {
    try {
      setLoading(true)
      setSelectedItem(item)
      setAssignEmployeeId('')
      setAssignNote('')

      const detail = await karmandanService.getLeadDetail(item.id)
      const payload = detail?.data && !detail?.id ? detail.data : detail

      setSelectedItem({
        ...item,
        id: payload.id || item.id,
        title: payload.title || item.title,
        phone: payload.phone || item.phone,
        status: payload.status || item.status,
        status_display: payload.status_display || item.status_display,
        description: payload.description || item.description || '',
        customer_name: payload.customer_name || item.customer_name || '',
        createdAt: payload.created_at || item.createdAt,
        nextFollowUp: payload.next_follow_up ?? item.nextFollowUp,
        nextFollowUpTime: payload.next_follow_up_time ?? item.nextFollowUpTime,
        assigned_to: payload.assigned_to ?? item.assigned_to,
        assigned_to_name: payload.assigned_to_name || item.assigned_to_name,
        created_by: payload.created_by ?? item.created_by,
        created_by_name: payload.created_by_name || item.created_by_name,
        tracking_code: payload.tracking_code || item.tracking_code || '',
        is_archived: !!payload.is_archived,
        archived_at: payload.archived_at || null,
      })

      const followupsData = payload.followups || []
      const invoicesData = Array.isArray(payload.sale_invoices) ? payload.sale_invoices : []
      const formattedFollowups = Array.isArray(followupsData)
        ? followupsData.map((f) => ({
            id: f.id,
            status: f.status,
            status_display: f.status_display,
            action_type: f.action_type,
            action_display: f.action_display,
            description: f.description || '',
            changeReason: f.change_reason || '',
            change_reason: f.change_reason || '',
            createdAt: f.created_at,
            created_at: f.created_at,
            nextFollowUp: f.next_follow_up,
            next_follow_up: f.next_follow_up,
            nextFollowUpTime: f.next_follow_up_time,
            next_follow_up_time: f.next_follow_up_time,
            created_by_name: f.created_by_name,
            attachments: Array.isArray(f.attachments) ? f.attachments : [],
            related_invoice: f.related_invoice || null,
          }))
        : []

      const linkedInvoiceIds = new Set(
        formattedFollowups
          .map((f) => f.related_invoice?.id)
          .filter(Boolean)
          .map(String)
      )
      const orphanInvoiceEvents = invoicesData
        .filter((inv) => inv?.id && !linkedInvoiceIds.has(String(inv.id)))
        .map((inv) => ({
          id: `invoice-${inv.id}`,
          status: payload.status || item.status,
          action_type: inv.doc_type === 'invoice' ? 'invoice' : 'proforma',
          action_display: inv.doc_type_label,
          description: `صدور ${inv.doc_type_label || 'سند'} شماره ${inv.number || ''}`,
          changeReason: `${inv.doc_type_label || 'سند'} صادر شد`,
          change_reason: `${inv.doc_type_label || 'سند'} صادر شد`,
          createdAt: inv.created_at,
          created_at: inv.created_at,
          created_by_name: inv.created_by_name,
          attachments: [],
          related_invoice: inv,
        }))

      const merged = [...formattedFollowups, ...orphanInvoiceEvents].sort((a, b) => {
        const ta = new Date(a.created_at || a.createdAt || 0).getTime()
        const tb = new Date(b.created_at || b.createdAt || 0).getTime()
        return tb - ta
      })

      setFollowups(merged)
      setAssignments(Array.isArray(payload.assignments) ? payload.assignments : [])

      if (isSaleManager) {
        try {
          const staffRes = await karmandanService.getAssignableStaff()
          setAssignableStaff(Array.isArray(staffRes?.data) ? staffRes.data : [])
        } catch (staffErr) {
          console.error('Error loading assignable staff:', staffErr)
          setAssignableStaff([])
        }
      }

      setShowDetail(true)
    } catch (err) {
      console.error('Error loading detail:', err)
      alert(apiErrorMessage(err, 'خطا در دریافت جزئیات'))
    } finally {
      setLoading(false)
    }
  }

  const handleAssignLead = async () => {
    if (!selectedItem?.id || !assignEmployeeId) {
      alert('کارمند مقصد را انتخاب کنید')
      return
    }
    try {
      setAssigning(true)
      const res = await karmandanService.assignLead(
        selectedItem.id,
        Number(assignEmployeeId),
        assignNote.trim()
      )
      const assigned = res?.assigned_to
      const nextAssignments = Array.isArray(res?.assignments) ? res.assignments : assignments

      setAssignments(nextAssignments)
      setSelectedItem((prev) =>
        prev
          ? {
              ...prev,
              assigned_to: assigned?.id ?? Number(assignEmployeeId),
              assigned_to_name: assigned?.full_name || prev.assigned_to_name,
            }
          : prev
      )
      setItems((prev) =>
        prev.map((row) =>
          row.id === selectedItem.id
            ? {
                ...row,
                assigned_to: assigned?.id ?? Number(assignEmployeeId),
                assigned_to_name: assigned?.full_name || row.assigned_to_name,
              }
            : row
        )
      )

      const refreshed = await karmandanService.getFollowups(selectedItem.id)
      setFollowups(
        Array.isArray(refreshed)
          ? refreshed.map((f) => ({
              id: f.id,
              status: f.status,
              status_display: f.status_display,
              action_type: f.action_type,
              action_display: f.action_display,
              description: f.description || '',
              changeReason: f.change_reason || '',
              change_reason: f.change_reason || '',
              createdAt: f.created_at,
              created_at: f.created_at,
              nextFollowUp: f.next_follow_up,
              next_follow_up: f.next_follow_up,
              nextFollowUpTime: f.next_follow_up_time,
              next_follow_up_time: f.next_follow_up_time,
              created_by_name: f.created_by_name,
              attachments: Array.isArray(f.attachments) ? f.attachments : [],
              related_invoice: f.related_invoice || null,
            }))
          : []
      )
      setAssignNote('')
      setAssignEmployeeId('')
      alert(res?.message || 'واگذاری انجام شد')
    } catch (err) {
      alert(apiErrorMessage(err, 'واگذاری ناموفق بود'))
    } finally {
      setAssigning(false)
    }
  }

  const handleStatusChangeRequest = (itemId, status, data) => {
    // فایل‌ها را در ref نگه می‌داریم تا با بستن مودال از بین نروند
    pendingFilesRef.current = Array.isArray(data?.files) ? data.files.filter(Boolean) : []
    setConfirmData({
      itemId,
      status,
      data: {
        ...data,
        files: pendingFilesRef.current,
      },
      action: statusAction,
      itemTitle: selectedItem?.title,
      itemPhone: selectedItem?.phone,
      itemCustomer: selectedItem?.customer_name,
    })
    setShowStatusModal(false)
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
      const files =
        pendingFilesRef.current.length > 0
          ? pendingFilesRef.current
          : Array.isArray(data.files)
            ? data.files.filter(Boolean)
            : []

      const saveRes = await karmandanService.addFollowup(itemId, followupData, files)
      const savedAttachments = saveRes?.data?.attachments
      if (
        files.length > 0 &&
        (!Array.isArray(savedAttachments) || savedAttachments.length === 0)
      ) {
        alert(
          'گزارش ثبت شد، اما فایل صوتی/پیوست ذخیره نشد. لطفاً دوباره پیوست کنید و ثبت کنید.'
        )
      }
      pendingFilesRef.current = []
      
      await loadData()
      
      setShowConfirmDialog(false)
      setConfirmData(null)
      setShowStatusModal(false)
      setStatusAction(null)
      
      if (selectedItem?.id === itemId) {
        const detail = await karmandanService.getLeadDetail(itemId)
        const payload = detail?.data && !detail?.id ? detail.data : detail
        const updatedFollowups = Array.isArray(payload?.followups)
          ? payload.followups
          : await karmandanService.getFollowups(itemId)
        const invoicesData = Array.isArray(payload?.sale_invoices) ? payload.sale_invoices : []
        const formatted = (Array.isArray(updatedFollowups) ? updatedFollowups : []).map((f) => ({
          id: f.id,
          status: f.status,
          status_display: f.status_display,
          action_type: f.action_type,
          action_display: f.action_display,
          description: f.description || '',
          changeReason: f.change_reason || '',
          change_reason: f.change_reason || '',
          createdAt: f.created_at,
          created_at: f.created_at,
          nextFollowUp: f.next_follow_up,
          next_follow_up: f.next_follow_up,
          nextFollowUpTime: f.next_follow_up_time,
          next_follow_up_time: f.next_follow_up_time,
          created_by_name: f.created_by_name,
          attachments: Array.isArray(f.attachments) ? f.attachments : [],
          related_invoice: f.related_invoice || null,
        }))
        const linkedInvoiceIds = new Set(
          formatted
            .map((f) => f.related_invoice?.id)
            .filter(Boolean)
            .map(String)
        )
        const orphanInvoiceEvents = invoicesData
          .filter((inv) => inv?.id && !linkedInvoiceIds.has(String(inv.id)))
          .map((inv) => ({
            id: `invoice-${inv.id}`,
            status: payload?.status || selectedItem.status,
            action_type: inv.doc_type === 'invoice' ? 'invoice' : 'proforma',
            description: `صدور ${inv.doc_type_label || 'سند'} شماره ${inv.number || ''}`,
            changeReason: `${inv.doc_type_label || 'سند'} صادر شد`,
            change_reason: `${inv.doc_type_label || 'سند'} صادر شد`,
            createdAt: inv.created_at,
            created_at: inv.created_at,
            created_by_name: inv.created_by_name,
            attachments: [],
            related_invoice: inv,
          }))
        setFollowups(
          [...formatted, ...orphanInvoiceEvents].sort((a, b) => {
            const ta = new Date(a.created_at || a.createdAt || 0).getTime()
            const tb = new Date(b.created_at || b.createdAt || 0).getTime()
            return tb - ta
          })
        )
      }
      
    } catch (err) {
      console.error('Error changing status:', err)
      alert(apiErrorMessage(err, 'خطا در تغییر وضعیت'))
    } finally {
      setLoading(false)
    }
  }

  const handleSendDocument = (item, docType = 'proforma') => {
    if (!item?.id) return
    const type = docType === 'invoice' ? 'invoice' : 'proforma'
    router.push(`/sale/invoice?lead=${item.id}&type=${type}`)
  }

  const handleArchiveItem = async (item) => {
    if (!item?.id) return
    if (item.status !== 'confirmed' && item.status !== 'cancelled') {
      alert('فقط موارد قرارداد یا بسته‌شده را می‌توان آرشیو کرد')
      return
    }
    const ok = window.confirm(`«${item.title}» به آرشیو منتقل شود؟`)
    if (!ok) return
    try {
      setLoading(true)
      await karmandanService.archiveLead(item.id)
      if (selectedItem?.id === item.id) {
        setShowDetail(false)
        setSelectedItem(null)
      }
      await loadData()
    } catch (err) {
      alert(apiErrorMessage(err, 'آرشیو ناموفق بود'))
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

  const { newItems, progressItems, confirmedItems, cancelledItems } = getColumnItems()
  const filteredList = getFilteredItems()

  const tabCounts = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return {
      all: items.length,
      today: items.filter((i) => i.nextFollowUp === today).length,
      in_progress: items.filter((i) => i.status === 'in_progress').length,
      new: items.filter((i) => i.status === 'new').length,
      confirmed: items.filter((i) => i.status === 'confirmed').length,
      cancelled: items.filter((i) => i.status === 'cancelled').length,
    }
  }, [items])

  const tabTitleMap = {
    all: 'همه موارد',
    new: 'جدید',
    in_progress: 'در حال پیگیری',
    today: 'پیگیری امروز',
    near: 'پیگیری نزدیک',
    confirmed: 'قراردادها',
    cancelled: 'بسته شده',
    archived: 'آرشیو',
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

  const confirmAction = confirmData?.action || statusAction

  const getConfirmMessage = () => {
    const messages = {
      followup:
        'پیگیری جدید برای این مورد ثبت می‌شود و وضعیت به «در حال پیگیری» تغییر می‌کند.',
      close:
        'این مورد بسته می‌شود و از لیست فعال خارج خواهد شد. این اقدام قابل بازگشت نیست.',
      contract:
        'این مورد به‌عنوان قرارداد موفق ثبت می‌شود و در بخش نتایج قرار می‌گیرد.',
    }
    return messages[confirmAction] || 'آیا از انجام این اقدام اطمینان دارید؟'
  }

  const getConfirmTitle = () => {
    const titles = {
      followup: 'تایید ثبت پیگیری',
      close: 'تایید بسته شدن',
      contract: 'تایید تبدیل به قرارداد',
    }
    return titles[confirmAction] || 'تایید اقدام'
  }

  const getConfirmType = () => {
    const types = {
      followup: 'warning',
      close: 'danger',
      contract: 'success',
    }
    return types[confirmAction] || 'warning'
  }

  const getConfirmText = () => {
    const texts = {
      followup: 'بله، پیگیری ثبت شود',
      close: 'بله، بسته شود',
      contract: 'بله، قرارداد شود',
    }
    return texts[confirmAction] || 'تایید'
  }

  const getConfirmDetails = () => {
    const data = confirmData?.data
    if (!data) return []
    const rows = []
    if (data.nextFollowUp) {
      rows.push({
        label: 'پیگیری بعدی',
        value: `${new Date(data.nextFollowUp).toLocaleDateString('fa-IR')}${
          data.nextFollowUpTime ? ` — ${data.nextFollowUpTime}` : ''
        }`,
      })
    }
    if (data.changeReason) {
      rows.push({ label: 'دلیل', value: data.changeReason })
    }
    if (data.description) {
      rows.push({
        label: 'توضیح',
        value:
          data.description.length > 80
            ? `${data.description.slice(0, 80)}...`
            : data.description,
      })
    }
    if (Array.isArray(data.files) && data.files.length > 0) {
      rows.push({
        label: 'پیوست',
        value: `${data.files.length} فایل`,
      })
    }
    return rows
  }

  if (authLoading || checkingEmployee || !isAuthenticated || !canAccessSale) {
    return (
      <div className={`${styles.container} ${styles.appShell}`}>
        <div className={styles.loadingContainer}>
          <Loader2 className={styles.spinner} size={40} />
          <p>در حال بررسی دسترسی...</p>
        </div>
      </div>
    )
  }

  if (loading && items.length === 0) {
    return (
      <div className={`${styles.container} ${isMobileApp ? styles.appShell : ''}`}>
        <div className={styles.loadingContainer}>
          <Loader2 className={styles.spinner} size={40} />
          <p>در حال بارگذاری...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.container} ${isMobileApp ? styles.appShell : ''}`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <ListFilter size={18} className={styles.headerIcon} />
            {isMobileApp ? (tabTitleMap[activeTab] || 'فروش') : 'فروش'}
          </h1>
          <div className={styles.mobileStats}>
            <span>{filteredList.length} مورد</span>
            {tabCounts.today > 0 ? (
              <span className={styles.mobileStatWarn}>{tabCounts.today} امروز</span>
            ) : null}
            {!isMobileApp && stats ? (
              <>
                <span>جدید {stats.new || 0}</span>
                <span>پیگیری {stats.in_progress || 0}</span>
              </>
            ) : null}
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.tourBtn}
            onClick={() => setTourOpen(true)}
            title="تور راهنما"
          >
            <HelpCircle size={15} />
            تور راهنما
          </button>
          {canCreateLead ? (
            <button type="button" className={styles.addBtn} onClick={() => setShowForm(true)}>
              <Plus size={15} />
              جدید
            </button>
          ) : null}
        </div>
      </div>

      {isSaleManager ? <SaleAccessBar enabled stats={stats} /> : null}

      <div className={styles.controls} data-tour="sale-search">
        {activeTab !== 'archived' ? (
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو در موارد..."
              className={styles.searchInput}
            />
          </div>
        ) : null}
        {!isMobileApp && (
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
            <button
              className={`${styles.tab} ${activeTab === 'archived' ? styles.activeTab : ''}`}
              data-tour="sale-archive-tab"
              onClick={() => setActiveTab('archived')}
            >
              <Archive size={12} /> آرشیو
            </button>
          </div>
        )}
      </div>

      {activeTab === 'archived' ? (
        <SaleArchive
          onViewDetail={handleViewDetail}
          onChanged={loadData}
        />
      ) : isMobileApp ? (
        <div className={styles.mobileList} data-tour="sale-board">
          {filteredList.length === 0 ? (
            <div className={styles.mobileEmpty}>
              <ListFilter size={36} />
              <p>موردی در این بخش نیست</p>
              {canCreateLead ? (
                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={() => setShowForm(true)}
                >
                  <Plus size={16} />
                  مورد جدید
                </button>
              ) : null}
            </div>
          ) : (
            filteredList.map((item) => (
              <MarketingItem
                key={item.id}
                item={item}
                onViewDetail={handleViewDetail}
                onStatusChange={openStatusModal}
                onArchive={handleArchiveItem}
              />
            ))
          )}
        </div>
      ) : (
        <div className={styles.columnsContainer} data-tour="sale-board">
          {[
            {
              key: 'new',
              title: 'جدید',
              icon: Sparkles,
              className: styles.columnNew,
              list: newItems,
              empty: 'مورد جدیدی نیست',
            },
            {
              key: 'progress',
              title: 'در حال پیگیری',
              icon: CircleDot,
              className: styles.columnProgress,
              list: progressItems,
              empty: 'پیگیری فعالی نیست',
            },
            {
              key: 'confirmed',
              title: 'قرارداد',
              icon: CheckCircle2,
              className: styles.columnConfirmed,
              list: confirmedItems,
              empty: 'قراردادی نیست',
            },
            {
              key: 'cancelled',
              title: 'بسته شده',
              icon: CircleX,
              className: styles.columnCancelled,
              list: cancelledItems,
              empty: 'مورد بسته‌ای نیست',
            },
          ].map((col) => {
            const Icon = col.icon
            return (
              <div key={col.key} className={`${styles.column} ${col.className}`}>
                <div className={styles.columnHeader}>
                  <span className={styles.columnTitle}>
                    <Icon size={14} />
                    {col.title}
                  </span>
                  <span className={styles.columnCount}>{col.list.length}</span>
                </div>
                <div className={styles.columnBody}>
                  {col.list.length === 0 ? (
                    <div className={styles.emptyColumn}>
                      <Icon size={22} />
                      <span>{col.empty}</span>
                    </div>
                  ) : (
                    col.list.map((item) => (
                      <MarketingItem
                        key={item.id}
                        item={item}
                        onViewDetail={handleViewDetail}
                        onStatusChange={openStatusModal}
                        onArchive={handleArchiveItem}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {isMobileApp && (
        <SalesBottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAdd={() => setShowForm(true)}
          onSearchFocus={() => searchInputRef.current?.focus()}
          counts={tabCounts}
        />
      )}

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
                    theme="light"
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

      {showDetail && selectedItem ? (
        <MarketingLeadDetail
          item={selectedItem}
          followups={followups}
          assignments={assignments}
          isSaleManager={isSaleManager && selectedItem.id !== 'tour-demo'}
          assignableStaff={assignableStaff}
          assignEmployeeId={assignEmployeeId}
          assignNote={assignNote}
          assigning={assigning}
          formatAssignmentRange={formatAssignmentRange}
          onClose={() => {
            if (tourOpen) return
            setShowDetail(false)
            setSelectedItem(null)
          }}
          onAssignEmployeeId={setAssignEmployeeId}
          onAssignNote={setAssignNote}
          onAssign={selectedItem.id === 'tour-demo' ? undefined : handleAssignLead}
          onSendDocument={
            selectedItem.id === 'tour-demo' ? undefined : handleSendDocument
          }
          onArchive={
            selectedItem.id === 'tour-demo' ? undefined : handleArchiveItem
          }
          onUnarchive={async (item) => {
            if (item?.id === 'tour-demo') return
            try {
              setLoading(true)
              await karmandanService.unarchiveLead(item.id)
              setShowDetail(false)
              setSelectedItem(null)
              setActiveTab('all')
              await loadData()
            } catch (err) {
              alert(apiErrorMessage(err, 'بازگردانی ناموفق بود'))
            } finally {
              setLoading(false)
            }
          }}
          onStatusChange={
            selectedItem.id === 'tour-demo' ? undefined : openStatusModal
          }
        />
      ) : null}

      <SaleTour
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        onDialogRequired={handleTourDialogRequired}
      />

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
          pendingFilesRef.current = []
        }}
        onConfirm={handleStatusChangeConfirmed}
        title={getConfirmTitle()}
        message={getConfirmMessage()}
        confirmText={getConfirmText()}
        cancelText="انصراف"
        type={getConfirmType()}
        loading={loading}
        itemTitle={selectedItem?.title || confirmData?.itemTitle}
        itemPhone={selectedItem?.phone || confirmData?.itemPhone}
        itemCustomer={selectedItem?.customer_name || confirmData?.itemCustomer}
        fromStatus={
          selectedItem?.status_display ||
          getStatusLabel(selectedItem?.status) ||
          ''
        }
        details={getConfirmDetails()}
      />
    </div>
  )
}

export default MarketingModule