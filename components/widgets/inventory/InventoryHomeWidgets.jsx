'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpFromLine,
  ClipboardList,
  Loader2,
  UserPlus,
  Users,
} from 'lucide-react'
import Config from '@/config/config'
import { useAuth } from '@/contexts/AuthContext'
import { normalizeInventoryWidgetSettings } from '@/config/inventoryWidgetSettings'
import styles from './InventoryHomeWidgets.module.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
)

const faNum = (n) => Number(n || 0).toLocaleString('fa-IR')

function useHomeDashboard(days, enabled) {
  const { getAuthHeaders, isAuthenticated } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    if (!enabled) return
    if (!isAuthenticated) {
      setData(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setErr('')
    try {
      const url = `${Config.baseUrl}/inventory/reports/home-dashboard/?days=${days}`
      const res = await axios.get(url, { headers: getAuthHeaders?.() || {} })
      setData(res.data?.data || null)
    } catch (e) {
      setErr(e?.response?.data?.detail || e?.message || 'خطا در بارگذاری')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [days, enabled, getAuthHeaders, isAuthenticated])

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, err, isAuthenticated, reload: load }
}

function SectionShell({ settings, className, children, icon: Icon, iconTone }) {
  return (
    <section
      className={`${styles.wrap} ${styles.card} ${className || ''}`}
      style={{
        marginTop: settings.margin_top,
        marginBottom: settings.margin_bottom,
      }}
    >
      <div className={styles.head}>
        <div className={styles.headText}>
          <h3>{settings.title}</h3>
          {settings.subtitle ? <p>{settings.subtitle}</p> : null}
        </div>
        {Icon ? (
          <span className={styles.iconBadge} style={iconTone} aria-hidden>
            <Icon size={20} strokeWidth={2.2} />
          </span>
        ) : null}
      </div>
      {children}
    </section>
  )
}

export function InventoryAddKeeperWidget({ settings: raw }) {
  const settings = normalizeInventoryWidgetSettings(raw, 'inventory_add_keeper')
  return (
    <SectionShell settings={settings} className={styles.keeper} icon={UserPlus}>
      <Link href={settings.href || '/inventory/authorized-persons'} className={styles.cta}>
        {settings.cta_label || 'ثبت انباردار جدید'}
        <ArrowLeft size={15} />
      </Link>
    </SectionShell>
  )
}

export function InventoryStockInCtaWidget({ settings: raw }) {
  const settings = normalizeInventoryWidgetSettings(raw, 'inventory_stock_in_cta')
  return (
    <SectionShell settings={settings} className={styles.stockIn} icon={ArrowDownToLine}>
      <Link href={settings.href || '/inventory/in'} className={styles.cta}>
        {settings.cta_label || 'شروع ورود کالا'}
        <ArrowLeft size={15} />
      </Link>
    </SectionShell>
  )
}

export function InventoryStockOutCtaWidget({ settings: raw }) {
  const settings = normalizeInventoryWidgetSettings(raw, 'inventory_stock_out_cta')
  return (
    <SectionShell settings={settings} className={styles.stockOut} icon={ArrowUpFromLine}>
      <Link href={settings.href || '/inventory/out'} className={styles.cta}>
        {settings.cta_label || 'شروع خروج کالا'}
        <ArrowLeft size={15} />
      </Link>
    </SectionShell>
  )
}

export function InventoryTopOperatorsWidget({ settings: raw }) {
  const settings = normalizeInventoryWidgetSettings(raw, 'inventory_top_operators')
  const { data, loading, isAuthenticated } = useHomeDashboard(settings.days, true)
  const inOps = data?.top_in_operators || []
  const outOps = data?.top_out_operators || []

  return (
    <SectionShell settings={settings} icon={Users}>
      {loading ? (
        <div className={styles.loading}>
          <Loader2 className={styles.spin} size={22} />
        </div>
      ) : !isAuthenticated ? (
        <p className={styles.empty}>برای مشاهده آمار اپراتورها وارد شوید.</p>
      ) : (
        <div className={styles.opsGrid}>
          <div className={styles.opsCol}>
            <h4>ورود کالا</h4>
            {inOps.length ? (
              inOps.map((row) => (
                <div key={`in-${row.name}`} className={styles.opsRow}>
                  <strong>{row.name}</strong>
                  <span className={styles.opsCount}>{faNum(row.count)}</span>
                </div>
              ))
            ) : (
              <p className={styles.empty}>هنوز ورودی ثبت نشده</p>
            )}
          </div>
          <div className={styles.opsCol}>
            <h4>خروج / حواله</h4>
            {outOps.length ? (
              outOps.map((row) => (
                <div key={`out-${row.name}`} className={styles.opsRow}>
                  <strong>{row.name}</strong>
                  <span className={styles.opsCount}>{faNum(row.count)}</span>
                </div>
              ))
            ) : (
              <p className={styles.empty}>هنوز خروجی ثبت نشده</p>
            )}
          </div>
        </div>
      )}
    </SectionShell>
  )
}

export function InventoryActivityChartWidget({ settings: raw }) {
  const base = normalizeInventoryWidgetSettings(raw, 'inventory_activity_chart')
  const [days, setDays] = useState(base.days || 30)
  const settings = { ...base, days }
  const { data, loading, isAuthenticated } = useHomeDashboard(days, true)

  const chartData = useMemo(() => {
    const series = data?.series || []
    const labels = series.map((s) => s.label)
    return {
      labels,
      datasets: [
        {
          label: 'ورود',
          data: series.map((s) => s.in_count || 0),
          borderColor: '#15803d',
          backgroundColor: 'rgba(21, 128, 61, 0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 2.5,
        },
        {
          label: 'خروج',
          data: series.map((s) => s.out_count || 0),
          borderColor: '#b91c1c',
          backgroundColor: 'rgba(185, 28, 28, 0.1)',
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 2.5,
        },
      ],
    }
  }, [data])

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          rtl: true,
          titleFont: { family: 'Shabnam, Tahoma, sans-serif' },
          bodyFont: { family: 'Shabnam, Tahoma, sans-serif' },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            maxTicksLimit: days === 90 ? 8 : days === 60 ? 8 : 10,
            color: '#6b7280',
            font: { size: 10 },
          },
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(55,65,81,0.08)' },
          ticks: {
            precision: 0,
            color: '#6b7280',
            font: { size: 10 },
          },
        },
      },
    }),
    [days],
  )

  return (
    <SectionShell settings={settings} className={styles.chartCard}>
      <div className={styles.head} style={{ marginTop: '-0.25rem' }}>
        <div className={styles.legend}>
          <span>
            <i className={`${styles.dot} ${styles.dotIn}`} /> ورود
          </span>
          <span>
            <i className={`${styles.dot} ${styles.dotOut}`} /> خروج
          </span>
        </div>
        <div className={styles.rangeTabs} role="tablist" aria-label="بازه زمانی">
          {[30, 60, 90].map((d) => (
            <button
              key={d}
              type="button"
              className={`${styles.rangeTab} ${days === d ? styles.rangeTabActive : ''}`}
              onClick={() => setDays(d)}
            >
              {faNum(d)} روز
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <Loader2 className={styles.spin} size={22} />
        </div>
      ) : !isAuthenticated ? (
        <p className={styles.empty}>برای مشاهده نمودار اتفاقات وارد شوید.</p>
      ) : (
        <div className={styles.chartBox}>
          <Line data={chartData} options={options} />
        </div>
      )}
    </SectionShell>
  )
}

export function InventoryTodayVouchersWidget({ settings: raw }) {
  const settings = normalizeInventoryWidgetSettings(raw, 'inventory_today_vouchers')
  const { data, loading, isAuthenticated } = useHomeDashboard(30, true)
  const vouchers = data?.today_vouchers || []
  const count = data?.today_voucher_count ?? vouchers.length

  return (
    <SectionShell settings={settings} icon={ClipboardList}>
      <div className={styles.head} style={{ marginTop: '-0.35rem' }}>
        <span className={styles.badge}>{faNum(count)} حواله</span>
        <Link href={settings.href || '/inventory/vouchers'} className={styles.cta} style={{ padding: '0.45rem 0.85rem', background: '#374151', color: '#fff' }}>
          همه حواله‌ها
          <ArrowLeft size={14} />
        </Link>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <Loader2 className={styles.spin} size={22} />
        </div>
      ) : !isAuthenticated ? (
        <p className={styles.empty}>برای مشاهده حواله‌های امروز وارد شوید.</p>
      ) : vouchers.length ? (
        <div className={styles.voucherList}>
          {vouchers.map((v) => (
            <Link
              key={v.id}
              href={`/inventory/vouchers`}
              className={styles.voucherItem}
            >
              <strong>{v.reference_number || `OUT-${v.id}`}</strong>
              <span className={styles.badge}>{v.status || '—'}</span>
              <span className={styles.voucherMeta}>
                {v.product_title || 'کالا'} · {v.warehouse_title || 'انبار'}
                {v.authorized_by_name ? ` · ${v.authorized_by_name}` : ''}
                {v.quantity != null ? ` · تعداد ${faNum(v.quantity)}` : ''}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>امروز هنوز حواله‌ای ثبت نشده است.</p>
      )}
    </SectionShell>
  )
}

/** ردیف دکمه‌های سبز/قرمز کنار هم — برای چیدمان زیباتر در خانه */
export function InventoryStockCtaPair({ settingsIn, settingsOut }) {
  return (
    <div className={`${styles.wrap} ${styles.ctaRow}`}>
      <InventoryStockInCtaWidget settings={settingsIn} />
      <InventoryStockOutCtaWidget settings={settingsOut} />
    </div>
  )
}

export function renderInventoryWidget(instance) {
  const s = instance?.settings || {}
  switch (instance?.type) {
    case 'inventory_add_keeper':
      return <InventoryAddKeeperWidget settings={s} />
    case 'inventory_top_operators':
      return <InventoryTopOperatorsWidget settings={s} />
    case 'inventory_stock_in_cta':
      return <InventoryStockInCtaWidget settings={s} />
    case 'inventory_stock_out_cta':
      return <InventoryStockOutCtaWidget settings={s} />
    case 'inventory_activity_chart':
      return <InventoryActivityChartWidget settings={s} />
    case 'inventory_today_vouchers':
      return <InventoryTodayVouchersWidget settings={s} />
    default:
      return null
  }
}
