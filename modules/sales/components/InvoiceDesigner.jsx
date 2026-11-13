'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowRight,
  Building2,
  FilePlus2,
  FileText,
  Loader2,
  Package,
  Pencil,
  Plus,
  Printer,
  Save,
  Trash2,
} from 'lucide-react'
import karmandanService from '../services/karmandanService'
import ConfirmDialog from './ConfirmDialog'
import SaleCatalogTab from './SaleCatalogTab'
import PersianDatePicker from '@/components/common/PersianDatePicker'
import { formatPersianDate, toPersianDate } from '@/utils/dateUtils'
import { useAuth } from '@/contexts/AuthContext'
import styles from '../styles/InvoiceDesigner.module.css'

const emptyItem = (order = 1) => ({
  row_order: order,
  description: '',
  price_per_sqm: '',
  area_sqm: '',
  discount: '',
  notes: '',
})

const formatMoney = (value) => {
  const n = Number(value || 0)
  if (!Number.isFinite(n)) return '۰'
  return Math.round(n).toLocaleString('fa-IR')
}

const formatJalali = (isoDate) => {
  if (!isoDate) return '—'
  const p = toPersianDate(isoDate)
  return p ? formatPersianDate(p, 'full') : isoDate
}

const toNumber = (v) => {
  if (v === '' || v === null || v === undefined) return 0
  const n = Number(String(v).replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}

const todayIso = () => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const splitCustomerName = (name = '') => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return { first: '', last: '' }
  if (parts.length === 1) return { first: parts[0], last: '' }
  return { first: parts[0], last: parts.slice(1).join(' ') }
}

const buildFromCompany = (company, docType, number, lead = null) => {
  const names = splitCustomerName(lead?.customer_name || lead?.customerName || '')
  const phone = lead?.phone || ''
  return {
    id: null,
    company: company?.id || '',
    marketing_lead: lead?.id || null,
    doc_type: docType,
    number: number || '',
    issue_date: todayIso(),
    status: 'draft',
    show_logo: company?.invoice_show_logo ?? true,
    show_name_fa: company?.invoice_show_name_fa ?? true,
    show_name_en: company?.invoice_show_name_en ?? true,
    show_date: company?.invoice_show_date ?? true,
    show_number: company?.invoice_show_number ?? true,
    show_company_phone: true,
    show_company_address: true,
    show_registration: true,
    show_footer: true,
    show_buyer_section: company?.invoice_show_buyer ?? true,
    buyer_kind: lead?.customer_name || lead?.customerName ? 'person' : 'company',
    buyer_company_name: '',
    buyer_first_name: names.first,
    buyer_last_name: names.last,
    buyer_phone: phone,
    buyer_mobile: phone,
    buyer_email: '',
    buyer_address: '',
    buyer_national_id: '',
    show_buyer_company: true,
    show_buyer_person_name: true,
    show_buyer_phone: true,
    show_buyer_mobile: true,
    show_buyer_email: false,
    show_buyer_address: true,
    show_buyer_national_id: false,
    show_items: true,
    show_discount_column: company?.default_show_discount ?? false,
    show_tax: true,
    tax_percent: company?.default_tax_percent ?? 9,
    extra_discount: '',
    show_terms: company?.invoice_show_terms ?? true,
    terms_text:
      company?.invoice_terms ||
      '- اعتبار این پیش فاکتور ۲۴ ساعت می‌باشد.',
    show_stamp: company?.invoice_show_stamp ?? true,
    stamp_label: company?.invoice_stamp_label || 'مهر و امضای فروشنده',
    notes: lead?.title ? `مربوط به پیگیری: ${lead.title}` : '',
    items: [emptyItem(1), emptyItem(2)],
  }
}

const Check = ({ checked, onChange, children }) => (
  <label className={styles.checkItem}>
    <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
    <span>{children}</span>
  </label>
)

export default function InvoiceDesigner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    checkingEmployee,
    employeeData,
    hasPermission,
  } = useAuth()

  const accessLevel = Number(employeeData?.access_level ?? user?.access_level ?? 0)
  const isSaleManager = !!user?.is_superuser || accessLevel >= 3
  const canSaleStaff =
    isSaleManager ||
    hasPermission('marketing') ||
    hasPermission('sales') ||
    !!employeeData?.is_marketing ||
    !!employeeData?.is_sales

  const [activeTab, setActiveTab] = useState('document') // document | catalog
  const [companies, setCompanies] = useState([])
  const [docs, setDocs] = useState([])
  const [catalog, setCatalog] = useState([])
  const [leadInfo, setLeadInfo] = useState(null)
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingDefaults, setSavingDefaults] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [numberStarts, setNumberStarts] = useState({ proforma: 1, invoice: 1 })
  const [savingStarts, setSavingStarts] = useState(false)
  const [discountPercent, setDiscountPercent] = useState('')
  const [employeeDiscountPolicy, setEmployeeDiscountPolicy] = useState({
    can: true,
    maxPercent: 5,
  })

  const selectedCompany = useMemo(
    () => companies.find((c) => String(c.id) === String(form?.company)) || null,
    [companies, form?.company]
  )

  const maxEmployeeDiscount = toNumber(
    selectedCompany?.employee_max_discount_percent ?? employeeDiscountPolicy.maxPercent ?? 5
  )
  const employeeCanDiscount = selectedCompany
    ? selectedCompany.employee_can_discount !== false
    : employeeDiscountPolicy.can !== false

  const totals = useMemo(() => {
    if (!form?.items) {
      return { subtotal: 0, lineDiscount: 0, extraDiscount: 0, discountTotal: 0, taxable: 0, tax: 0, payable: 0 }
    }
    const subtotal = form.items.reduce(
      (sum, item) => sum + toNumber(item.price_per_sqm) * toNumber(item.area_sqm),
      0
    )
    const lineDiscount =
      isSaleManager && form.show_discount_column
        ? form.items.reduce((sum, item) => sum + toNumber(item.discount), 0)
        : 0
    let extraDiscount = toNumber(form.extra_discount)
    if (!isSaleManager) {
      const pct = Math.min(toNumber(discountPercent), maxEmployeeDiscount)
      extraDiscount = employeeCanDiscount ? (subtotal * pct) / 100 : 0
    }
    const discountTotal = lineDiscount + extraDiscount
    const taxable = Math.max(0, subtotal - discountTotal)
    const tax = form.show_tax ? (taxable * toNumber(form.tax_percent)) / 100 : 0
    const payable = taxable + tax
    return { subtotal, lineDiscount, extraDiscount, discountTotal, taxable, tax, payable }
  }, [form, isSaleManager, discountPercent, maxEmployeeDiscount, employeeCanDiscount])

  const setField = (key, value) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  const loadDocs = useCallback(async () => {
    const res = await karmandanService.getSaleInvoices()
    setDocs(Array.isArray(res?.data) ? res.data : [])
  }, [])

  const loadCatalog = useCallback(async (companyId) => {
    try {
      const params = { active: '1' }
      if (companyId) params.company = companyId
      const res = await karmandanService.getSaleCatalog(params)
      setCatalog(Array.isArray(res?.data) ? res.data : [])
    } catch {
      setCatalog([])
    }
  }, [])

  const startNew = useCallback(
    async (companyList, preferredCompanyId, preferredType = 'proforma') => {
      const list = companyList || companies
      const company =
        list.find((c) => String(c.id) === String(preferredCompanyId)) || list[0] || null
      let number = ''
      try {
        const numRes = await karmandanService.getNextInvoiceNumber(
          preferredType,
          company?.id
        )
        number = numRes?.data?.number || ''
      } catch {
        number = ''
      }
      setForm(buildFromCompany(company, preferredType, number, leadInfo))
      if (company) {
        setNumberStarts({
          proforma: company.proforma_number_start || 1,
          invoice: company.invoice_number_start || 1,
        })
      }
      setMessage(null)
      setError(null)
    },
    [companies, leadInfo]
  )

  useEffect(() => {
    if (authLoading || checkingEmployee) return
    if (!isAuthenticated) {
      router.replace('/login?next=/sale/invoice')
      return
    }
    if (!canSaleStaff) {
      router.replace('/sale')
    }
  }, [authLoading, checkingEmployee, isAuthenticated, canSaleStaff, router])

  useEffect(() => {
    if (!canSaleStaff) return undefined
    let cancelled = false
    const editId = searchParams.get('id')
    const preferredCompany = searchParams.get('company')
    const preferredType = searchParams.get('type') || 'proforma'
    const leadId = searchParams.get('lead')
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const tasks = [karmandanService.getSaleCompanies()]
        if (isSaleManager) tasks.push(loadDocs())
        const [compRes] = await Promise.all(tasks)
        if (cancelled) return
        const list = Array.isArray(compRes?.data) ? compRes.data : []
        setCompanies(list)
        await loadCatalog(preferredCompany || list[0]?.id)

        let lead = null
        if (leadId) {
          try {
            const leadRes = await karmandanService.getLeadDetail(leadId)
            lead = leadRes?.data || leadRes
            if (lead) setLeadInfo(lead)
          } catch {
            setLeadInfo(null)
          }
        } else {
          setLeadInfo(null)
        }

        // کارمند فقط از مسیر پیگیری می‌تواند سند بسازد
        if (!isSaleManager && !leadId && !editId) {
          if (!cancelled) {
            setError('برای صدور سند، از کارت پیگیری گزینه پیش‌فاکتور یا فاکتور را بزنید')
            setLoading(false)
            router.replace('/sale')
          }
          return
        }

        if (editId) {
          const detail = await karmandanService.getSaleInvoice(editId)
          if (cancelled) return
          const data = detail?.data
          if (data) {
            const company = list.find((c) => String(c.id) === String(data.company))
            if (company) {
              setNumberStarts({
                proforma: company.proforma_number_start || 1,
                invoice: company.invoice_number_start || 1,
              })
            }
            if (company) {
              setEmployeeDiscountPolicy({
                can: company.employee_can_discount !== false,
                maxPercent: company.employee_max_discount_percent ?? 5,
              })
            }
            const mappedItems =
              data.items?.length > 0
                ? data.items.map((it, idx) => ({
                    row_order: it.row_order || idx + 1,
                    description: it.description || '',
                    price_per_sqm: it.price_per_sqm ?? '',
                    area_sqm: it.area_sqm ?? '',
                    discount: it.discount ?? '',
                    notes: it.notes || '',
                  }))
                : [emptyItem(1)]
            if (!isSaleManager) {
              const sub = mappedItems.reduce(
                (s, it) => s + toNumber(it.price_per_sqm) * toNumber(it.area_sqm),
                0
              )
              const extra = toNumber(data.extra_discount)
              setDiscountPercent(
                sub > 0 && extra > 0 ? String(Math.round((extra / sub) * 1000) / 10) : ''
              )
            }
            setForm({
              ...data,
              marketing_lead: data.marketing_lead || lead?.id || null,
              show_registration: data.show_registration ?? true,
              show_footer: data.show_footer ?? true,
              show_discount_column: isSaleManager
                ? data.show_discount_column ?? false
                : false,
              show_tax: data.show_tax ?? true,
              tax_percent: data.tax_percent ?? 9,
              extra_discount: data.extra_discount ?? '',
              items: mappedItems,
            })
            return
          }
        }

        const company =
          list.find((c) => String(c.id) === String(preferredCompany)) || list[0] || null
        let number = ''
        try {
          const numRes = await karmandanService.getNextInvoiceNumber(
            preferredType,
            company?.id
          )
          number = numRes?.data?.number || ''
        } catch {
          number = ''
        }
        if (company) {
          setNumberStarts({
            proforma: company.proforma_number_start || 1,
            invoice: company.invoice_number_start || 1,
          })
          setEmployeeDiscountPolicy({
            can: company.employee_can_discount !== false,
            maxPercent: company.employee_max_discount_percent ?? 5,
          })
        }
        if (!cancelled) {
          const built = buildFromCompany(company, preferredType, number, lead)
          // کارمند: تخفیف خطی بسته؛ فقط درصد کلی در حد مجاز
          if (!isSaleManager) {
            built.show_discount_column = false
            built.extra_discount = ''
            built.items = []
            built.tax_percent = company?.default_tax_percent ?? built.tax_percent
            built.terms_text = company?.invoice_terms || built.terms_text
            built.stamp_label = company?.invoice_stamp_label || built.stamp_label
          }
          setForm(built)
          setDiscountPercent('')
        }
      } catch (err) {
        if (!cancelled) setError(err?.message || err?.error || 'بارگذاری ناموفق بود')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSaleStaff, isSaleManager, searchParams])

  const changeDocType = async (docType) => {
    setField('doc_type', docType)
    if (form?.id) return
    try {
      const numRes = await karmandanService.getNextInvoiceNumber(docType, form?.company)
      if (numRes?.data?.number) setField('number', numRes.data.number)
    } catch {
      /* ignore */
    }
  }

  const changeCompany = async (companyId) => {
    const company = companies.find((c) => String(c.id) === String(companyId))
    if (!company) {
      setField('company', companyId)
      loadCatalog(companyId)
      return
    }
    setNumberStarts({
      proforma: company.proforma_number_start || 1,
      invoice: company.invoice_number_start || 1,
    })
    setEmployeeDiscountPolicy({
      can: company.employee_can_discount !== false,
      maxPercent: company.employee_max_discount_percent ?? 5,
    })
    setForm((prev) =>
      prev
        ? {
            ...prev,
            company: company.id,
            show_logo: company.invoice_show_logo,
            show_name_fa: company.invoice_show_name_fa,
            show_name_en: company.invoice_show_name_en,
            show_date: company.invoice_show_date,
            show_number: company.invoice_show_number,
            show_buyer_section: company.invoice_show_buyer,
            show_terms: company.invoice_show_terms,
            show_stamp: company.invoice_show_stamp,
            show_discount_column: isSaleManager
              ? company.default_show_discount ?? prev.show_discount_column
              : false,
            tax_percent: company.default_tax_percent ?? prev.tax_percent,
            terms_text: company.invoice_terms || prev.terms_text,
            stamp_label: company.invoice_stamp_label || prev.stamp_label,
            extra_discount: isSaleManager ? prev.extra_discount : '',
          }
        : prev
    )
    if (!isSaleManager) setDiscountPercent('')
    loadCatalog(company.id)
    if (!form?.id) {
      try {
        const numRes = await karmandanService.getNextInvoiceNumber(
          form?.doc_type || 'proforma',
          company.id
        )
        if (numRes?.data?.number) setField('number', numRes.data.number)
      } catch {
        /* ignore */
      }
    }
  }

  const saveNumberStarts = async () => {
    if (!selectedCompany) return
    setSavingStarts(true)
    setError(null)
    try {
      const res = await karmandanService.updateSaleCompanyDefaults(selectedCompany.id, {
        proforma_number_start: Math.max(1, Number(numberStarts.proforma) || 1),
        invoice_number_start: Math.max(1, Number(numberStarts.invoice) || 1),
        default_tax_percent: toNumber(form.tax_percent) || 9,
        default_show_discount: !!form.show_discount_column,
        employee_can_discount: !!employeeDiscountPolicy.can,
        employee_max_discount_percent: Math.max(
          0,
          toNumber(employeeDiscountPolicy.maxPercent)
        ),
      })
      setCompanies((prev) =>
        prev.map((c) => (c.id === selectedCompany.id ? { ...c, ...res?.data } : c))
      )
      setMessage('تنظیمات شماره‌گذاری و تخفیف کارمند ذخیره شد')
      if (!form?.id) {
        const numRes = await karmandanService.getNextInvoiceNumber(
          form.doc_type,
          selectedCompany.id
        )
        if (numRes?.data?.number) setField('number', numRes.data.number)
      }
    } catch (err) {
      setError(err?.message || err?.error || 'ذخیره تنظیمات شماره‌گذاری ناموفق بود')
    } finally {
      setSavingStarts(false)
    }
  }

  const updateItem = (index, key, value) => {
    setForm((prev) => {
      if (!prev) return prev
      const items = prev.items.map((it, i) => (i === index ? { ...it, [key]: value } : it))
      return { ...prev, items }
    })
  }

  const addItem = () => {
    setForm((prev) => {
      if (!prev) return prev
      return { ...prev, items: [...prev.items, emptyItem(prev.items.length + 1)] }
    })
  }

  const addFromCatalog = (catalogId) => {
    if (!catalogId) return
    const cat = catalog.find((c) => String(c.id) === String(catalogId))
    if (!cat) return
    setForm((prev) => {
      if (!prev) return prev
      const blankIdx = prev.items.findIndex((it) => !(it.description || '').trim())
      const nextRow = {
        row_order: 0,
        description: cat.title || '',
        price_per_sqm: cat.price_per_sqm ?? '',
        area_sqm: '',
        discount: '',
        notes: cat.default_notes || '',
      }
      let items
      if (blankIdx >= 0) {
        items = prev.items.map((it, i) => (i === blankIdx ? { ...it, ...nextRow } : it))
      } else {
        items = [...prev.items, nextRow]
      }
      return {
        ...prev,
        items: items.map((it, i) => ({ ...it, row_order: i + 1 })),
      }
    })
  }

  const removeItem = (index) => {
    setForm((prev) => {
      if (!prev) return prev
      const items = prev.items
        .filter((_, i) => i !== index)
        .map((it, i) => ({ ...it, row_order: i + 1 }))
      // کارمند فقط از کاتالوگ اضافه می‌کند؛ ردیف خالی نگذار
      if (items.length) return { ...prev, items }
      return { ...prev, items: isSaleManager ? [emptyItem(1)] : [] }
    })
  }

  const renderCatalogCards = (compact = false) => (
    <div className={compact ? styles.catalogCardsCompact : styles.catalogCards}>
      {catalog.length === 0 ? (
        <p className={styles.hint}>
          هنوز کالایی در کاتالوگ نیست. مدیر باید از تب «کاتالوگ کالا و خدمات» ثبت کند.
        </p>
      ) : (
        catalog.map((c) => (
          <div key={c.id} className={styles.catalogCard}>
            <div className={styles.catalogCardBody}>
              <strong>{c.title}</strong>
              <span>{formatMoney(c.price_per_sqm)} ریال / م²</span>
              {c.default_notes ? (
                <em className={styles.catalogCardNotes}>{c.default_notes}</em>
              ) : null}
            </div>
            <button
              type="button"
              className={styles.catalogAddBtn}
              onClick={() => addFromCatalog(c.id)}
            >
              <Plus size={14} />
              ثبت در سند
            </button>
          </div>
        ))
      )}
    </div>
  )

  const payloadFromForm = () => {
    if (!form) return null
    const company = selectedCompany
    // کارمند فقط مالیات/تخفیف/اقلام را تغییر می‌دهد؛ بقیه از قالب مدیر
    const locked = !isSaleManager
    return {
      company: form.company,
      marketing_lead: form.marketing_lead || leadInfo?.id || null,
      doc_type: form.doc_type,
      number: form.number,
      issue_date: form.issue_date,
      status: form.status || 'draft',
      show_logo: locked ? company?.invoice_show_logo ?? form.show_logo : form.show_logo,
      show_name_fa: locked ? company?.invoice_show_name_fa ?? form.show_name_fa : form.show_name_fa,
      show_name_en: locked ? company?.invoice_show_name_en ?? form.show_name_en : form.show_name_en,
      show_date: locked ? company?.invoice_show_date ?? form.show_date : form.show_date,
      show_number: locked ? company?.invoice_show_number ?? form.show_number : form.show_number,
      show_company_phone: form.show_company_phone,
      show_company_address: form.show_company_address,
      show_buyer_section: locked
        ? company?.invoice_show_buyer ?? form.show_buyer_section
        : form.show_buyer_section,
      buyer_kind: form.buyer_kind,
      buyer_company_name: form.buyer_company_name,
      buyer_first_name: form.buyer_first_name,
      buyer_last_name: form.buyer_last_name,
      buyer_phone: form.buyer_phone,
      buyer_mobile: form.buyer_mobile,
      buyer_email: form.buyer_email,
      buyer_address: form.buyer_address,
      buyer_national_id: form.buyer_national_id,
      show_buyer_company: form.show_buyer_company,
      show_buyer_person_name: form.show_buyer_person_name,
      show_buyer_phone: form.show_buyer_phone,
      show_buyer_mobile: form.show_buyer_mobile,
      show_buyer_email: form.show_buyer_email,
      show_buyer_address: form.show_buyer_address,
      show_buyer_national_id: form.show_buyer_national_id,
      show_items: true,
      show_discount_column: isSaleManager ? !!form.show_discount_column : false,
      // کارمند فقط روشن/خاموش مالیات را می‌تواند عوض کند؛ درصد از قالب مدیر است
      show_tax: !!form.show_tax,
      tax_percent: locked
        ? toNumber(company?.default_tax_percent ?? form.tax_percent)
        : toNumber(form.tax_percent),
      extra_discount: (() => {
        if (isSaleManager) return toNumber(form.extra_discount)
        if (!employeeCanDiscount) return 0
        const pct = Math.min(toNumber(discountPercent), maxEmployeeDiscount)
        const subtotal = (form.items || []).reduce(
          (sum, item) => sum + toNumber(item.price_per_sqm) * toNumber(item.area_sqm),
          0
        )
        return Math.round((subtotal * pct) / 100)
      })(),
      show_terms: locked ? company?.invoice_show_terms ?? form.show_terms : form.show_terms,
      terms_text: locked ? company?.invoice_terms || form.terms_text : form.terms_text,
      show_stamp: locked ? company?.invoice_show_stamp ?? form.show_stamp : form.show_stamp,
      stamp_label: locked
        ? company?.invoice_stamp_label || form.stamp_label
        : form.stamp_label,
      notes: form.notes,
      items: (form.items || [])
        .filter((it) => (it.description || '').trim())
        .map((it, idx) => ({
          row_order: idx + 1,
          description: it.description.trim(),
          price_per_sqm: toNumber(it.price_per_sqm),
          area_sqm: toNumber(it.area_sqm),
          discount: isSaleManager && form.show_discount_column ? toNumber(it.discount) : 0,
          notes: (it.notes || '').trim(),
        })),
    }
  }

  const handleSave = async () => {
    const payload = payloadFromForm()
    if (!payload?.company) {
      setError('ابتدا شرکت فروشنده را انتخاب کنید')
      return
    }
    if (!payload.number?.trim()) {
      setError('شماره سند الزامی است')
      return
    }
    if (!isSaleManager && !payload.marketing_lead) {
      setError('سند کارمند باید از طریق یک مورد پیگیری ایجاد شود')
      return
    }
    if (!isSaleManager && (!payload.items || payload.items.length === 0)) {
      setError('حداقل یک کالا/خدمت از کاتالوگ انتخاب کنید')
      return
    }
    if (!isSaleManager && payload.items.some((it) => toNumber(it.area_sqm) <= 0)) {
      setError('متراژ همه اقلام باید بیشتر از صفر باشد')
      return
    }
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const res = form.id
        ? await karmandanService.updateSaleInvoice(form.id, payload)
        : await karmandanService.createSaleInvoice(payload)
      const data = res?.data
      if (data) {
        setForm({
          ...data,
          show_registration: form.show_registration ?? true,
          show_footer: form.show_footer ?? true,
          items:
            data.items?.length > 0
              ? data.items.map((it, idx) => ({
                  row_order: it.row_order || idx + 1,
                  description: it.description || '',
                  price_per_sqm: it.price_per_sqm ?? '',
                  area_sqm: it.area_sqm ?? '',
                  discount: it.discount ?? '',
                  notes: it.notes || '',
                }))
              : [emptyItem(1)],
        })
        router.replace(`/sale/invoice?id=${data.id}`)
      }
      const savedMsg = res?.message || 'ذخیره شد'
      setMessage(
        leadInfo
          ? `${savedMsg} — در تاریخچه پیگیری نیز ثبت شد. می‌توانید چاپ کنید.`
          : savedMsg
      )
      if (isSaleManager) await loadDocs()
    } catch (err) {
      setError(
        err?.number?.[0] ||
          err?.marketing_lead?.[0] ||
          err?.message ||
          err?.error ||
          'ذخیره ناموفق بود'
      )
    } finally {
      setSaving(false)
    }
  }

  const saveAsCompanyDefaults = async () => {
    if (!selectedCompany || !form) return
    setSavingDefaults(true)
    setError(null)
    try {
      const res = await karmandanService.updateSaleCompanyDefaults(selectedCompany.id, {
        invoice_terms: form.terms_text || '',
        invoice_stamp_label: form.stamp_label || 'مهر و امضای فروشنده',
        invoice_show_logo: !!form.show_logo,
        invoice_show_name_fa: !!form.show_name_fa,
        invoice_show_name_en: !!form.show_name_en,
        invoice_show_date: !!form.show_date,
        invoice_show_number: !!form.show_number,
        invoice_show_buyer: !!form.show_buyer_section,
        invoice_show_terms: !!form.show_terms,
        invoice_show_stamp: !!form.show_stamp,
        default_tax_percent: toNumber(form.tax_percent) || 9,
        default_show_discount: !!form.show_discount_column,
        proforma_number_start: Math.max(1, Number(numberStarts.proforma) || 1),
        invoice_number_start: Math.max(1, Number(numberStarts.invoice) || 1),
        employee_can_discount: !!employeeDiscountPolicy.can,
        employee_max_discount_percent: Math.max(
          0,
          toNumber(employeeDiscountPolicy.maxPercent)
        ),
      })
      setCompanies((prev) =>
        prev.map((c) => (c.id === selectedCompany.id ? { ...c, ...res?.data } : c))
      )
      setMessage('پیش‌فرض‌های قالب شرکت ذخیره شد')
    } catch (err) {
      setError(err?.message || err?.error || 'ذخیره پیش‌فرض شرکت ناموفق بود')
    } finally {
      setSavingDefaults(false)
    }
  }

  const openDoc = async (id) => {
    setLoading(true)
    setError(null)
    try {
      const detail = await karmandanService.getSaleInvoice(id)
      const data = detail?.data
      if (!data) throw new Error('سند پیدا نشد')
      setForm({
        ...data,
        show_registration: data.show_registration ?? true,
        show_footer: data.show_footer ?? true,
        show_discount_column: data.show_discount_column ?? false,
        show_tax: data.show_tax ?? true,
        items:
          data.items?.length > 0
            ? data.items.map((it, idx) => ({
                row_order: it.row_order || idx + 1,
                description: it.description || '',
                price_per_sqm: it.price_per_sqm ?? '',
                area_sqm: it.area_sqm ?? '',
                discount: it.discount ?? '',
                notes: it.notes || '',
              }))
            : [emptyItem(1)],
      })
      router.replace(`/sale/invoice?id=${id}`)
    } catch (err) {
      setError(err?.message || err?.error || 'باز کردن سند ناموفق بود')
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await karmandanService.deleteSaleInvoice(deleteTarget.id)
      setDeleteTarget(null)
      setMessage('سند حذف شد')
      await loadDocs()
      if (String(form?.id) === String(deleteTarget.id)) {
        await startNew(companies, form?.company, form?.doc_type || 'proforma')
        router.replace('/sale/invoice')
      }
    } catch (err) {
      setError(err?.message || err?.error || 'حذف ناموفق بود')
    } finally {
      setDeleting(false)
    }
  }

  if (authLoading || checkingEmployee || loading) {
    return (
      <div className={styles.page} dir="rtl">
        <div className={styles.gate}>
          <Loader2 size={22} className="animate-spin" />
          <p>در حال آماده‌سازی طراح سند...</p>
        </div>
      </div>
    )
  }

  if (!canSaleStaff) {
    return (
      <div className={styles.page} dir="rtl">
        <div className={styles.gate}>
          <h2>دسترسی محدود</h2>
          <p>برای صدور پیش‌فاکتور/فاکتور باید دسترسی فروش داشته باشید.</p>
          <button type="button" className={styles.primaryBtn} onClick={() => router.push('/sale')}>
            بازگشت به فروش
          </button>
        </div>
      </div>
    )
  }

  if (!form) return null

  const buyerLead =
    form.buyer_kind === 'company'
      ? `شرکت محترم ${form.buyer_company_name || '………………'}`
      : `${form.buyer_first_name || '………………'} ${form.buyer_last_name || ''}`.trim()

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <button type="button" className={styles.backBtn} onClick={() => router.push('/sale')}>
            <ArrowRight size={14} />
            فروش
          </button>
          <div className={styles.titleBlock}>
            <h1>
              {leadInfo
                ? form.doc_type === 'invoice'
                  ? 'ارسال فاکتور برای پیگیری'
                  : 'ارسال پیش‌فاکتور برای پیگیری'
                : 'طراح پیش‌فاکتور / فاکتور'}
            </h1>
            <p>
              {isSaleManager
                ? 'تنظیم قالب، کاتالوگ و محدودیت تخفیف کارمند'
                : 'فقط مالیات، تخفیف مجاز و انتخاب از کاتالوگ — بقیه طبق تنظیم مدیر'}
            </p>
          </div>
        </div>
        {activeTab === 'document' ? (
          <div className={styles.topRight}>
            <div className={styles.typeToggle}>
              <button
                type="button"
                className={form.doc_type === 'proforma' ? styles.active : ''}
                onClick={() => changeDocType('proforma')}
              >
                پیش‌فاکتور
              </button>
              <button
                type="button"
                className={form.doc_type === 'invoice' ? styles.active : ''}
                onClick={() => changeDocType('invoice')}
              >
                فاکتور
              </button>
            </div>
            {isSaleManager ? (
              <button
                type="button"
                className={styles.ghostBtn}
                onClick={() => startNew(companies, form.company, form.doc_type)}
              >
                <FilePlus2 size={14} />
                سند جدید
              </button>
            ) : null}
            <button type="button" className={styles.ghostBtn} onClick={() => window.print()}>
              <Printer size={14} />
              چاپ
            </button>
            <button type="button" className={styles.primaryBtn} onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={14} /> : <Save size={14} />}
              {form.doc_type === 'invoice' ? 'ثبت فاکتور' : 'ثبت پیش‌فاکتور'}
            </button>
          </div>
        ) : null}
      </div>

      {isSaleManager ? (
        <div className={styles.mainTabs}>
          <button
            type="button"
            className={`${styles.mainTab} ${activeTab === 'document' ? styles.mainTabActive : ''}`}
            onClick={() => setActiveTab('document')}
          >
            <FileText size={14} />
            پیش‌فاکتور / فاکتور
          </button>
          <button
            type="button"
            className={`${styles.mainTab} ${activeTab === 'catalog' ? styles.mainTabActive : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            <Package size={14} />
            کاتالوگ کالا و خدمات
          </button>
        </div>
      ) : null}

      {leadInfo ? (
        <div className={styles.msg}>
          سند برای پیگیری «{leadInfo.title}»
          {leadInfo.customer_name || leadInfo.customerName
            ? ` · ${leadInfo.customer_name || leadInfo.customerName}`
            : ''}
          {leadInfo.phone ? ` · ${leadInfo.phone}` : ''}
        </div>
      ) : null}

      {message ? <div className={styles.msg}>{message}</div> : null}
      {error ? <div className={styles.err}>{error}</div> : null}

      {isSaleManager && activeTab === 'catalog' ? (
        <SaleCatalogTab companies={companies} />
      ) : (
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          {!isSaleManager ? (
            <>
              <section className={styles.panel}>
                <div className={styles.panelHead}>
                  <h2>صدور سند</h2>
                </div>
                <p className={styles.hint}>
                  قالب و ظاهر سند طبق تنظیمات مدیر است. شما فقط مالیات، تخفیف مجاز و محصول از کاتالوگ را مشخص می‌کنید.
                </p>
                <div className={styles.field}>
                  <label>شرکت</label>
                  <input value={selectedCompany?.name_fa || '—'} readOnly />
                </div>
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label>شماره سند</label>
                    <input value={form.number || ''} readOnly />
                  </div>
                  <div className={styles.field}>
                    <label>تاریخ</label>
                    <input value={formatJalali(form.issue_date)} readOnly />
                  </div>
                </div>
              </section>

              <section className={styles.panel}>
                <div className={styles.panelHead}>
                  <h2>مالیات</h2>
                </div>
                <div className={styles.choiceRow}>
                  <button
                    type="button"
                    className={`${styles.choiceBtn} ${form.show_tax ? styles.choiceBtnActive : ''}`}
                    onClick={() => setField('show_tax', true)}
                  >
                    با مالیات
                  </button>
                  <button
                    type="button"
                    className={`${styles.choiceBtn} ${!form.show_tax ? styles.choiceBtnActive : ''}`}
                    onClick={() => setField('show_tax', false)}
                  >
                    بدون مالیات
                  </button>
                </div>
                {form.show_tax ? (
                  <p className={styles.hint}>
                    درصد مالیات طبق تنظیم مدیر:{' '}
                    {Number(form.tax_percent || 0).toLocaleString('fa-IR')}٪
                  </p>
                ) : (
                  <p className={styles.hint}>مالیات محاسبه نمی‌شود.</p>
                )}
              </section>

              <section className={styles.panel}>
                <div className={styles.panelHead}>
                  <h2>تخفیف</h2>
                </div>
                {employeeCanDiscount ? (
                  <div className={styles.taxControl}>
                    <div className={styles.field} style={{ marginBottom: 0 }}>
                      <label>
                        درصد تخفیف (حداکثر{' '}
                        {Number(maxEmployeeDiscount).toLocaleString('fa-IR')}٪)
                      </label>
                      <input
                        value={discountPercent}
                        onChange={(e) => {
                          const raw = e.target.value
                          const n = toNumber(raw)
                          if (raw === '') {
                            setDiscountPercent('')
                            return
                          }
                          setDiscountPercent(
                            String(Math.min(Math.max(0, n), maxEmployeeDiscount))
                          )
                        }}
                        inputMode="decimal"
                        placeholder="0"
                      />
                    </div>
                    <p className={styles.hint}>
                      مبلغ تخفیف: {formatMoney(totals.extraDiscount)} ریال
                    </p>
                  </div>
                ) : (
                  <p className={styles.hint}>مدیر اجازه تخفیف برای کارمند نداده است.</p>
                )}
              </section>

              <section className={styles.panel}>
                <div className={styles.panelHead}>
                  <h2>کاتالوگ — ثبت در سند</h2>
                </div>
                <p className={styles.hint}>
                  روی «ثبت در سند» بزنید، بعد متراژ را در جدول کامل کنید.
                </p>
                {renderCatalogCards(true)}
              </section>

              <section className={styles.panel}>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? <Loader2 size={14} /> : <Save size={14} />}
                  {form.doc_type === 'invoice' ? 'ثبت فاکتور' : 'ثبت پیش‌فاکتور'}
                </button>
              </section>
            </>
          ) : (
          <>
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2>فروشنده و مشخصات سند</h2>
            </div>
            <div className={styles.field}>
              <label>شرکت فروشنده</label>
              <select
                value={form.company || ''}
                onChange={(e) => changeCompany(e.target.value)}
              >
                <option value="">انتخاب شرکت...</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_fa}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.row2}>
              <div className={styles.field}>
                <label>شماره سند (یکتا)</label>
                <input
                  value={form.number}
                  onChange={(e) => setField('number', e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label>تاریخ (شمسی)</label>
                <PersianDatePicker
                  theme="light"
                  value={form.issue_date || ''}
                  onChange={(v) => setField('issue_date', v)}
                  placeholder="انتخاب تاریخ"
                />
              </div>
            </div>
            {isSaleManager ? (
              <>
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label>شروع شماره پیش‌فاکتور</label>
                    <input
                      value={numberStarts.proforma}
                      onChange={(e) =>
                        setNumberStarts((p) => ({ ...p, proforma: e.target.value }))
                      }
                      inputMode="numeric"
                    />
                  </div>
                  <div className={styles.field}>
                    <label>شروع شماره فاکتور</label>
                    <input
                      value={numberStarts.invoice}
                      onChange={(e) =>
                        setNumberStarts((p) => ({ ...p, invoice: e.target.value }))
                      }
                      inputMode="numeric"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.ghostBtn}
                  onClick={saveNumberStarts}
                  disabled={!selectedCompany || savingStarts}
                  style={{ width: '100%', justifyContent: 'center', marginBottom: '0.45rem' }}
                >
                  {savingStarts ? <Loader2 size={14} /> : null}
                  ذخیره شروع شماره‌گذاری شرکت
                </button>
              </>
            ) : null}
            <p className={styles.hint}>نمایش بخش‌های هدر</p>
            <div className={styles.checkList}>
              <Check checked={form.show_logo} onChange={(v) => setField('show_logo', v)}>
                لوگو
              </Check>
              <Check checked={form.show_name_fa} onChange={(v) => setField('show_name_fa', v)}>
                نام فارسی شرکت
              </Check>
              <Check checked={form.show_name_en} onChange={(v) => setField('show_name_en', v)}>
                نام انگلیسی شرکت
              </Check>
              <Check checked={form.show_date} onChange={(v) => setField('show_date', v)}>
                تاریخ
              </Check>
              <Check checked={form.show_number} onChange={(v) => setField('show_number', v)}>
                شماره سند
              </Check>
              <Check
                checked={form.show_registration}
                onChange={(v) => setField('show_registration', v)}
              >
                شماره ثبت زیر نام شرکت
              </Check>
              <Check
                checked={form.show_footer}
                onChange={(v) => setField('show_footer', v)}
              >
                فوتر پایین صفحه
              </Check>
              <Check
                checked={form.show_company_phone}
                onChange={(v) => setField('show_company_phone', v)}
              >
                تلفن در فوتر
              </Check>
              <Check
                checked={form.show_company_address}
                onChange={(v) => setField('show_company_address', v)}
              >
                آدرس در فوتر
              </Check>
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2>بخش خریدار</h2>
              <Check
                checked={form.show_buyer_section}
                onChange={(v) => setField('show_buyer_section', v)}
              >
                نمایش
              </Check>
            </div>
            <div className={styles.field}>
              <label>نوع خریدار</label>
              <select
                value={form.buyer_kind}
                onChange={(e) => setField('buyer_kind', e.target.value)}
              >
                <option value="company">شرکت</option>
                <option value="person">شخص حقیقی</option>
              </select>
            </div>
            {form.buyer_kind === 'company' ? (
              <div className={styles.field}>
                <label>شرکت محترم …</label>
                <input
                  value={form.buyer_company_name}
                  onChange={(e) => setField('buyer_company_name', e.target.value)}
                  placeholder="نام شرکت خریدار"
                />
              </div>
            ) : (
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label>نام</label>
                  <input
                    value={form.buyer_first_name}
                    onChange={(e) => setField('buyer_first_name', e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label>نام خانوادگی</label>
                  <input
                    value={form.buyer_last_name}
                    onChange={(e) => setField('buyer_last_name', e.target.value)}
                  />
                </div>
              </div>
            )}
            <div className={styles.row2}>
              <div className={styles.field}>
                <label>تلفن</label>
                <input
                  value={form.buyer_phone}
                  onChange={(e) => setField('buyer_phone', e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label>موبایل</label>
                <input
                  value={form.buyer_mobile}
                  onChange={(e) => setField('buyer_mobile', e.target.value)}
                />
              </div>
            </div>
            <div className={styles.field}>
              <label>ایمیل</label>
              <input
                value={form.buyer_email}
                onChange={(e) => setField('buyer_email', e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label>آدرس</label>
              <textarea
                value={form.buyer_address}
                onChange={(e) => setField('buyer_address', e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label>شناسه / کد ملی</label>
              <input
                value={form.buyer_national_id}
                onChange={(e) => setField('buyer_national_id', e.target.value)}
              />
            </div>
            <p className={styles.hint}>نمایش فیلدهای خریدار</p>
            <div className={styles.checkList}>
              <Check
                checked={form.show_buyer_company}
                onChange={(v) => setField('show_buyer_company', v)}
              >
                نام شرکت خریدار
              </Check>
              <Check
                checked={form.show_buyer_person_name}
                onChange={(v) => setField('show_buyer_person_name', v)}
              >
                نام و نام خانوادگی
              </Check>
              <Check
                checked={form.show_buyer_phone}
                onChange={(v) => setField('show_buyer_phone', v)}
              >
                تلفن
              </Check>
              <Check
                checked={form.show_buyer_mobile}
                onChange={(v) => setField('show_buyer_mobile', v)}
              >
                موبایل
              </Check>
              <Check
                checked={form.show_buyer_email}
                onChange={(v) => setField('show_buyer_email', v)}
              >
                ایمیل
              </Check>
              <Check
                checked={form.show_buyer_address}
                onChange={(v) => setField('show_buyer_address', v)}
              >
                آدرس
              </Check>
              <Check
                checked={form.show_buyer_national_id}
                onChange={(v) => setField('show_buyer_national_id', v)}
              >
                شناسه / کد ملی
              </Check>
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2>مالیات و تخفیف</h2>
            </div>

            <div className={styles.taxControl}>
              <p className={styles.hint} style={{ marginTop: 0 }}>
                ارسال با مالیات یا بدون مالیات
              </p>
              <div className={styles.choiceRow}>
                <button
                  type="button"
                  className={`${styles.choiceBtn} ${form.show_tax ? styles.choiceBtnActive : ''}`}
                  onClick={() => setField('show_tax', true)}
                >
                  با مالیات
                </button>
                <button
                  type="button"
                  className={`${styles.choiceBtn} ${!form.show_tax ? styles.choiceBtnActive : ''}`}
                  onClick={() => setField('show_tax', false)}
                >
                  بدون مالیات
                </button>
              </div>
              {form.show_tax ? (
                <div className={styles.field} style={{ marginTop: '0.45rem', marginBottom: 0 }}>
                  <label>درصد مالیات</label>
                  <input
                    value={form.tax_percent}
                    onChange={(e) => setField('tax_percent', e.target.value)}
                    inputMode="decimal"
                    placeholder="۹"
                    disabled={!isSaleManager}
                  />
                </div>
              ) : (
                <p className={styles.hint}>مالیات در سند محاسبه و نمایش داده نمی‌شود.</p>
              )}
            </div>

            {isSaleManager ? (
              <div className={styles.taxControl}>
                <Check
                  checked={employeeDiscountPolicy.can}
                  onChange={(v) =>
                    setEmployeeDiscountPolicy((p) => ({ ...p, can: v }))
                  }
                >
                  کارمند اجازه تخفیف داشته باشد
                </Check>
                <div className={styles.field} style={{ marginTop: '0.4rem', marginBottom: 0 }}>
                  <label>حداکثر درصد تخفیف کارمند</label>
                  <input
                    value={employeeDiscountPolicy.maxPercent}
                    onChange={(e) =>
                      setEmployeeDiscountPolicy((p) => ({
                        ...p,
                        maxPercent: e.target.value,
                      }))
                    }
                    inputMode="decimal"
                    placeholder="۵"
                  />
                </div>
                <p className={styles.hint}>
                  مثلاً ۵ یعنی کارمند حداکثر ۵٪ روی جمع اقلام می‌تواند تخفیف بدهد.
                </p>
              </div>
            ) : null}

            {isSaleManager ? (
              <>
                <Check
                  checked={form.show_discount_column}
                  onChange={(v) => setField('show_discount_column', v)}
                >
                  ستون تخفیف در جدول
                </Check>
                <div className={styles.field}>
                  <label>تخفیف کلی سند (ریال)</label>
                  <input
                    value={form.extra_discount}
                    onChange={(e) => setField('extra_discount', e.target.value)}
                    inputMode="numeric"
                  />
                </div>
              </>
            ) : employeeCanDiscount ? (
              <div className={styles.taxControl}>
                <div className={styles.field} style={{ marginBottom: 0 }}>
                  <label>
                    درصد تخفیف شما (حداکثر{' '}
                    {Number(maxEmployeeDiscount).toLocaleString('fa-IR')}٪)
                  </label>
                  <input
                    value={discountPercent}
                    onChange={(e) => {
                      const raw = e.target.value
                      const n = toNumber(raw)
                      if (raw === '') {
                        setDiscountPercent('')
                        return
                      }
                      setDiscountPercent(
                        String(Math.min(Math.max(0, n), maxEmployeeDiscount))
                      )
                    }}
                    inputMode="decimal"
                    placeholder="0"
                  />
                </div>
                <p className={styles.hint}>
                  مبلغ تخفیف: {formatMoney(totals.extraDiscount)} ریال
                </p>
              </div>
            ) : (
              <p className={styles.hint}>مدیر اجازه تخفیف برای کارمند فعال نکرده است.</p>
            )}

            <div className={styles.checkList} style={{ marginTop: '0.55rem' }}>
              <Check checked={form.show_items} onChange={(v) => setField('show_items', v)}>
                جدول کالا و خدمات
              </Check>
              <Check checked={form.show_terms} onChange={(v) => setField('show_terms', v)}>
                شرایط و ضوابط
              </Check>
              <Check checked={form.show_stamp} onChange={(v) => setField('show_stamp', v)}>
                محل مهر و امضا
              </Check>
            </div>
            <div className={styles.field}>
              <label>متن شرایط و ضوابط</label>
              <textarea
                value={form.terms_text}
                onChange={(e) => setField('terms_text', e.target.value)}
                placeholder="- اعتبار این پیش فاکتور ۲۴ ساعت می‌باشد."
              />
            </div>
            <div className={styles.field}>
              <label>عنوان محل مهر و امضا</label>
              <input
                value={form.stamp_label}
                onChange={(e) => setField('stamp_label', e.target.value)}
              />
            </div>
            {isSaleManager ? (
              <button
                type="button"
                className={styles.ghostBtn}
                onClick={saveAsCompanyDefaults}
                disabled={!selectedCompany || savingDefaults}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {savingDefaults ? <Loader2 size={14} /> : <Building2 size={14} />}
                ذخیره این تنظیمات به‌عنوان پیش‌فرض شرکت
              </button>
            ) : null}
          </section>

          {isSaleManager ? (
            <section className={styles.panel}>
              <div className={styles.panelHead}>
                <h2>اسناد ذخیره‌شده</h2>
              </div>
              {docs.length === 0 ? (
                <div className={styles.emptyDocs}>هنوز سندی ذخیره نشده است</div>
              ) : (
                <div className={styles.list}>
                  {docs.map((d) => (
                    <div key={d.id} className={styles.docRow}>
                      <div className={styles.docMeta}>
                        <strong>
                          {d.doc_type_label} {d.number}
                        </strong>
                        <span>
                          {d.company_name} ·{' '}
                          {formatJalali(d.issue_date)}
                        </span>
                      </div>
                      <div className={styles.docActions}>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => openDoc(d.id)}
                          title="ویرایش"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => setDeleteTarget(d)}
                          title="حذف"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : null}
          </>
          )}
        </aside>

        <div className={styles.previewWrap}>
          <article className={styles.sheet}>
            <header className={styles.docHeader}>
              <div className={styles.brand}>
                {form.show_logo ? (
                  selectedCompany?.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className={styles.logo}
                      src={selectedCompany.logo_url}
                      alt=""
                    />
                  ) : (
                    <div className={styles.logoPlaceholder}>
                      <Building2 size={22} />
                    </div>
                  )
                ) : null}
                <div className={styles.brandNames}>
                  {form.show_name_fa ? (
                    <h2>{selectedCompany?.name_fa || 'نام شرکت'}</h2>
                  ) : null}
                  {form.show_name_en && selectedCompany?.name_en ? (
                    <p className={styles.en}>{selectedCompany.name_en}</p>
                  ) : null}
                  {form.show_registration && selectedCompany?.registration_number ? (
                    <p className={styles.regNo}>
                      شماره ثبت: {selectedCompany.registration_number}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className={styles.metaBox}>
                <div className={styles.badge}>
                  {form.doc_type === 'invoice' ? 'فاکتور' : 'پیش‌فاکتور'}
                </div>
                {form.show_number ? (
                  <div className={styles.metaLine}>
                    <span>شماره</span>
                    <strong>{form.number || '—'}</strong>
                  </div>
                ) : null}
                {form.show_date ? (
                  <div className={styles.metaLine}>
                    <span>تاریخ</span>
                    <strong>{formatJalali(form.issue_date)}</strong>
                  </div>
                ) : null}
              </div>
            </header>

            {form.show_buyer_section ? (
              <section className={styles.section}>
                <div className={styles.sectionTitle}>
                  <h3>خریدار</h3>
                </div>
                <div className={styles.buyerCard}>
                  {(form.buyer_kind === 'company' && form.show_buyer_company) ||
                  (form.buyer_kind === 'person' && form.show_buyer_person_name) ? (
                    <div className={styles.buyerLead}>{buyerLead}</div>
                  ) : null}
                  <div className={styles.buyerGrid}>
                    {form.show_buyer_phone && form.buyer_phone ? (
                      <div>
                        <span>تلفن:</span>
                        {form.buyer_phone}
                      </div>
                    ) : null}
                    {form.show_buyer_mobile && form.buyer_mobile ? (
                      <div>
                        <span>موبایل:</span>
                        {form.buyer_mobile}
                      </div>
                    ) : null}
                    {form.show_buyer_email && form.buyer_email ? (
                      <div>
                        <span>ایمیل:</span>
                        {form.buyer_email}
                      </div>
                    ) : null}
                    {form.show_buyer_national_id && form.buyer_national_id ? (
                      <div>
                        <span>شناسه:</span>
                        {form.buyer_national_id}
                      </div>
                    ) : null}
                    {form.show_buyer_address && form.buyer_address ? (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <span>آدرس:</span>
                        {form.buyer_address}
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>
            ) : null}

            {form.show_items ? (
              <section className={styles.section}>
                <div className={styles.sectionTitle}>
                  <h3>مشخصات کالا و خدمات مورد معامله</h3>
                </div>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>ردیف</th>
                        <th>شرح کالا یا خدمات</th>
                        <th>قیمت هر م² (ریال)</th>
                        <th>متراژ (م²)</th>
                        {isSaleManager && form.show_discount_column ? (
                          <th>تخفیف (ریال)</th>
                        ) : null}
                        <th>مبلغ (ریال)</th>
                        <th>توضیحات</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.length === 0 ? (
                        <tr>
                          <td
                            colSpan={
                              isSaleManager && form.show_discount_column ? 8 : 7
                            }
                            className={styles.emptyItemsCell}
                          >
                            هنوز ردیفی نیست — از کارت‌های کاتالوگ زیر، «ثبت در سند» را بزنید.
                          </td>
                        </tr>
                      ) : (
                        form.items.map((item, index) => {
                          const gross =
                            toNumber(item.price_per_sqm) * toNumber(item.area_sqm)
                          const disc =
                            isSaleManager && form.show_discount_column
                              ? toNumber(item.discount)
                              : 0
                          const line = Math.max(0, gross - disc)
                          return (
                            <tr key={`item-${index}`}>
                              <td className={styles.rowIdx}>{index + 1}</td>
                              <td>
                                {isSaleManager ? (
                                  <input
                                    value={item.description}
                                    onChange={(e) =>
                                      updateItem(index, 'description', e.target.value)
                                    }
                                    placeholder="شرح کالا / خدمت"
                                  />
                                ) : (
                                  <span>{item.description || '—'}</span>
                                )}
                              </td>
                              <td>
                                {isSaleManager ? (
                                  <input
                                    className={styles.num}
                                    value={item.price_per_sqm}
                                    onChange={(e) =>
                                      updateItem(index, 'price_per_sqm', e.target.value)
                                    }
                                    placeholder="0"
                                  />
                                ) : (
                                  <span className={styles.num}>
                                    {formatMoney(item.price_per_sqm)}
                                  </span>
                                )}
                              </td>
                              <td>
                                <input
                                  className={styles.num}
                                  value={item.area_sqm}
                                  onChange={(e) =>
                                    updateItem(index, 'area_sqm', e.target.value)
                                  }
                                  placeholder="0"
                                />
                              </td>
                              {isSaleManager && form.show_discount_column ? (
                                <td>
                                  <input
                                    className={styles.num}
                                    value={item.discount}
                                    onChange={(e) =>
                                      updateItem(index, 'discount', e.target.value)
                                    }
                                    placeholder="0"
                                  />
                                </td>
                              ) : null}
                              <td className={styles.num}>{formatMoney(line)}</td>
                              <td>
                                {isSaleManager ? (
                                  <input
                                    value={item.notes}
                                    onChange={(e) =>
                                      updateItem(index, 'notes', e.target.value)
                                    }
                                    placeholder="—"
                                  />
                                ) : (
                                  <span>{item.notes || '—'}</span>
                                )}
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className={styles.iconBtn}
                                  onClick={() => removeItem(index)}
                                  title="حذف ردیف"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className={styles.totalsBox}>
                  <div className={styles.totalsRows}>
                    <div className={styles.totalsLine}>
                      <span>جمع کل</span>
                      <strong>{formatMoney(totals.subtotal)}</strong>
                    </div>
                    {totals.discountTotal > 0 ? (
                      <div className={styles.totalsLine}>
                        <span>
                          تخفیف
                          {!isSaleManager && toNumber(discountPercent) > 0
                            ? ` (${Number(discountPercent).toLocaleString('fa-IR')}٪)`
                            : ''}
                        </span>
                        <strong className={styles.discountVal}>
                          {formatMoney(totals.discountTotal)}
                        </strong>
                      </div>
                    ) : null}
                    {totals.discountTotal > 0 ? (
                      <div className={styles.totalsLine}>
                        <span>مبلغ پس از تخفیف</span>
                        <strong>{formatMoney(totals.taxable)}</strong>
                      </div>
                    ) : null}
                    {form.show_tax ? (
                      <div className={styles.totalsLine}>
                        <span>
                          مالیات (
                          {Number(form.tax_percent || 0).toLocaleString('fa-IR')}٪)
                        </span>
                        <strong>{formatMoney(totals.tax)}</strong>
                      </div>
                    ) : null}
                    <div className={`${styles.totalsLine} ${styles.totalsPayable}`}>
                      <span>مبلغ قابل پرداخت</span>
                      <strong>{formatMoney(totals.payable)}</strong>
                    </div>
                  </div>
                </div>
                <div className={styles.itemActions}>
                  {isSaleManager ? (
                    <button type="button" className={styles.addRowBtn} onClick={addItem}>
                      <Plus size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
                      ردیف خالی
                    </button>
                  ) : null}
                </div>
                <div className={styles.catalogInline}>
                  <div className={styles.sectionTitle}>
                    <h3>افزودن از کاتالوگ</h3>
                  </div>
                  {renderCatalogCards()}
                </div>
              </section>
            ) : null}

            {form.show_terms ? (
              <section className={styles.section}>
                <div className={styles.sectionTitle}>
                  <h3>شرایط و ضوابط</h3>
                </div>
                <div className={styles.termsBox}>
                  {form.terms_text || '- اعتبار این پیش فاکتور ۲۴ ساعت می‌باشد.'}
                </div>
              </section>
            ) : null}

            {form.show_stamp ? (
              <div className={styles.stampArea}>
                <div className={styles.stampBox}>{form.stamp_label || 'مهر و امضای فروشنده'}</div>
              </div>
            ) : null}

            {form.show_footer ? (
              <footer className={styles.docFooter}>
                <div className={styles.footerInner}>
                  {selectedCompany?.website ? (
                    <a
                      className={styles.footerSite}
                      href={selectedCompany.website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {selectedCompany.website.replace(/^https?:\/\//i, '')}
                    </a>
                  ) : (
                    <span className={styles.footerSiteMuted}>www.example.com</span>
                  )}
                  <div className={styles.footerContacts}>
                    {form.show_company_phone && selectedCompany?.phone ? (
                      <span>تلفن {selectedCompany.phone}</span>
                    ) : null}
                    {form.show_company_address && selectedCompany?.address ? (
                      <span>{selectedCompany.address}</span>
                    ) : null}
                  </div>
                </div>
              </footer>
            ) : null}
          </article>
        </div>
      </div>
      )}

      {activeTab === 'document' ? (
        <div className={styles.stickySaveBar}>
          <div className={styles.stickySaveMeta}>
            <span>
              {form.doc_type === 'invoice' ? 'فاکتور' : 'پیش‌فاکتور'}
              {form.number ? ` ${form.number}` : ''}
            </span>
            <strong>{formatMoney(totals.payable)} ریال</strong>
          </div>
          <button
            type="button"
            className={styles.stickySaveBtn}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <Loader2 size={16} /> : <Save size={16} />}
            {form.doc_type === 'invoice' ? 'ثبت فاکتور' : 'ثبت پیش‌فاکتور'}
          </button>
        </div>
      ) : null}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="حذف سند"
        message={
          deleteTarget
            ? `سند «${deleteTarget.doc_type_label || ''} ${deleteTarget.number}» حذف شود؟`
            : ''
        }
        confirmText="حذف"
        type="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
