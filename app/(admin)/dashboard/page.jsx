// app/dashboard/page.jsx

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'
import axios from 'axios'
import Config from '@/config/config'
import {
  LayoutDashboard, ShoppingCart, Users, Shield,
  RefreshCw, Briefcase, TrendingUp, CheckCircle,
  Newspaper, Zap, Eye, Settings, Warehouse, Headphones, Calendar,
  BarChart3, Megaphone, Images, Settings2, Tags, Radio
} from 'lucide-react'
import styles from './Dashboard.module.css'

const Dashboard = () => {
  const router = useRouter()
  const {
    isAuthenticated,
    loading,
    user,
    isEmployee,
    employeeData,
    hasPermission,
    getAuthHeaders,
    assignedSections,
    canManageEmployees,
  } = useAuth()
  const { language, dir } = useLanguage()

  const [stats, setStats] = useState(null)
  const [newsStats, setNewsStats] = useState(null)
  const [employeeStats, setEmployeeStats] = useState(null)
  const [loadingData, setLoadingData] = useState(false)

  const texts = {
    fa: {
      title: 'داشبورد مدیریت',
      subtitle: 'خلاصه وضعیت و عملکرد',
      dashboard: 'داشبورد مدیریت',
      employees: 'کارمندان',
      ticker: 'نوار خبری',
      heroSlider: 'اسلایدر هیرو',
      siteSettings: 'تنظیمات سایت',
      requestTypes: 'انواع درخواست تماس',
      jobsManage: 'مدیریت آگهی‌ها',
      platformConnections: 'اتصالات پیام‌رسان',
      welcome: 'خوش آمدید',
      accessDenied: 'دسترسی محدود',
      dashboardAccess: 'برای دسترسی به داشبورد باید کارمند باشید',
      returnHome: 'بازگشت به صفحه اصلی',
      loading: 'در حال بارگذاری...',
      quickAccess: 'دسترسی سریع',
      statistics: 'آمار کلی',
      totalLeads: 'کل لیدها',
      activeEmployees: 'کارمندان فعال',
      publishedNews: 'اخبار منتشر شده',
      totalViews: 'کل بازدید',
      employeeCode: 'کد پرسنلی',
      followups: 'پیگیری‌ها',
      today: 'امروز',
      total: 'کل',
      refresh: 'بروزرسانی',
      noStats: 'هنوز آماری برای نمایش وجود ندارد',
      noQuick: 'بخشی با مسیر صفحه به شما اختصاص داده نشده است',
      newLabel: 'جدید',
      pending: 'در انتظار',
      likes: 'لایک',
    },
    en: {
      title: 'Management Dashboard',
      subtitle: 'Overview and Performance',
      dashboard: 'Management Dashboard',
      employees: 'Employees',
      ticker: 'Ticker bar',
      heroSlider: 'Hero slider',
      siteSettings: 'Site settings',
      requestTypes: 'Contact request types',
      jobsManage: 'Job listings',
      platformConnections: 'Messenger bots',
      welcome: 'Welcome',
      accessDenied: 'Access Denied',
      dashboardAccess: 'You must be an employee to access the dashboard',
      returnHome: 'Return to Home',
      loading: 'Loading...',
      quickAccess: 'Quick Access',
      statistics: 'Statistics',
      totalLeads: 'Total Leads',
      activeEmployees: 'Active Employees',
      publishedNews: 'Published News',
      totalViews: 'Total Views',
      employeeCode: 'Employee Code',
      followups: 'Follow-ups',
      today: 'Today',
      total: 'Total',
      refresh: 'Refresh',
      noStats: 'No statistics to show yet',
      noQuick: 'No linked sections assigned to you',
      newLabel: 'new',
      pending: 'pending',
      likes: 'likes',
    }
  }

  const t = texts[language] || texts.fa

  const fetchDashboardStats = useCallback(async () => {
    if (!isEmployee && !user?.is_superuser) return
    try {
      setLoadingData(true)
      const url = Config.endpoints.karmandan.dashboardStats()
      const res = await axios.get(url, { headers: getAuthHeaders() })
      setStats(res.data?.data || res.data)
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
    } finally {
      setLoadingData(false)
    }
  }, [isEmployee, user, getAuthHeaders])

  const fetchNewsStats = useCallback(async () => {
    if (!user?.is_superuser && !user?.is_staff && !hasPermission('news')) return
    try {
      const url = Config.endpoints.news.stats()
      const res = await axios.get(url, { headers: getAuthHeaders() })
      setNewsStats(res.data?.data || res.data)
    } catch (err) {
      console.error('Error fetching news stats:', err)
    }
  }, [user, getAuthHeaders, hasPermission])

  const fetchEmployeeStats = useCallback(async () => {
    try {
      const url = Config.endpoints.karmandan.stats()
      const res = await axios.get(url, { headers: getAuthHeaders() })
      setEmployeeStats(res.data?.data || res.data)
    } catch {
      setEmployeeStats(null)
    }
  }, [getAuthHeaders])

  const refreshAll = useCallback(async () => {
    const jobs = []
    if (isEmployee || user?.is_superuser) jobs.push(fetchDashboardStats())
    jobs.push(fetchNewsStats())
    if (canManageEmployees) jobs.push(fetchEmployeeStats())
    await Promise.allSettled(jobs)
  }, [isEmployee, user, canManageEmployees, fetchDashboardStats, fetchNewsStats, fetchEmployeeStats])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (!isAuthenticated) return
    if (isEmployee || user?.is_superuser) {
      fetchDashboardStats()
      fetchNewsStats()
    }
    if (canManageEmployees) {
      fetchEmployeeStats()
    }
  }, [isAuthenticated, isEmployee, user, canManageEmployees, fetchDashboardStats, fetchNewsStats, fetchEmployeeStats])

  const sectionIcon = (icon) => {
    const map = {
      users: <Users />,
      newspaper: <Newspaper />,
      settings: <Settings />,
      'shopping-cart': <ShoppingCart />,
      briefcase: <Briefcase />,
      warehouse: <Warehouse />,
      headphones: <Headphones />,
      calendar: <Calendar />,
      shield: <Shield />,
      layers: <Briefcase />,
    }
    return map[icon] || <Briefcase />
  }

  const hexToBg = (hex) => {
    if (!hex) return '#fff3c4'
    const h = hex.replace('#', '')
    if (h.length !== 6) return '#fff3c4'
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, 0.14)`
  }

  const displayName = user?.display_name || user?.first_name || employeeData?.full_name || ''

  const initialsOf = () => {
    const parts = String(displayName).trim().split(/\s+/).filter(Boolean)
    if (!parts.length) return '؟'
    return ((parts[0][0] || '') + (parts[1]?.[0] || '')).toUpperCase()
  }

  const linkedSections = (assignedSections || []).filter((d) => d.href)
  const seenHrefs = new Set()
  const quickActions = []

  linkedSections.forEach((d) => {
    if (!d.href || seenHrefs.has(d.href)) return
    seenHrefs.add(d.href)
    quickActions.push({
      id: d.code,
      icon: sectionIcon(d.icon),
      label: language === 'en' && d.name_en ? d.name_en : d.name_fa,
      href: d.href,
      color: d.color || '#c27800',
      bgColor: hexToBg(d.color),
    })
  })

  if (canManageEmployees && !seenHrefs.has('/employees')) {
    quickActions.unshift({
      id: 'employees',
      icon: <Users />,
      label: t.employees,
      href: '/employees',
      color: '#6a1b9a',
      bgColor: '#f3e5f5',
    })
  }

  const canManageTicker = user?.is_superuser || user?.is_staff || canManageEmployees
  if (canManageTicker && !seenHrefs.has('/ticker')) {
    quickActions.push({
      id: 'ticker',
      icon: <Megaphone />,
      label: t.ticker,
      href: '/ticker',
      color: '#c27800',
      bgColor: '#fff3c4',
    })
  }
  if (canManageTicker && !seenHrefs.has('/hero-slider')) {
    quickActions.push({
      id: 'hero-slider',
      icon: <Images />,
      label: t.heroSlider,
      href: '/hero-slider',
      color: '#1565c0',
      bgColor: '#e3f2fd',
    })
  }
  if (canManageTicker && !seenHrefs.has('/site-settings')) {
    quickActions.push({
      id: 'site-settings',
      icon: <Settings2 />,
      label: t.siteSettings,
      href: '/site-settings',
      color: '#455a64',
      bgColor: '#eceff1',
    })
  }
  if (canManageTicker && !seenHrefs.has('/request-types')) {
    quickActions.push({
      id: 'request-types',
      icon: <Tags />,
      label: t.requestTypes,
      href: '/request-types',
      color: '#1565c0',
      bgColor: '#e3f2fd',
    })
  }
  if (canManageTicker && !seenHrefs.has('/jobs-manage')) {
    quickActions.unshift({
      id: 'jobs-manage',
      icon: <Briefcase />,
      label: t.jobsManage,
      href: '/jobs-manage',
      color: '#c27800',
      bgColor: '#fff3c4',
    })
  }
  if (canManageTicker && !seenHrefs.has('/platform-connections')) {
    quickActions.push({
      id: 'platform-connections',
      icon: <Radio />,
      label: t.platformConnections,
      href: '/platform-connections',
      color: '#1565c0',
      bgColor: '#e3f2fd',
    })
  }

  const displayStats = []

  if (stats?.leads) {
    displayStats.push({
      id: 'leads',
      icon: <TrendingUp />,
      value: stats.leads.total ?? 0,
      label: t.totalLeads,
      change: `${stats.leads.new ?? 0} ${t.newLabel}`,
      positive: true,
      bgColor: '#eef2ff',
      color: '#5b6cff',
    })
  }

  if (stats?.followups) {
    displayStats.push({
      id: 'followups',
      icon: <CheckCircle />,
      value: stats.followups.total ?? 0,
      label: t.followups,
      change: `${stats.followups.today ?? 0} ${t.today}`,
      positive: true,
      bgColor: '#e8f5e9',
      color: '#2e7d32',
    })
  }

  if (employeeStats && (employeeStats.total != null || employeeStats.active != null)) {
    displayStats.push({
      id: 'employees',
      icon: <Users />,
      value: employeeStats.active ?? employeeStats.total ?? 0,
      label: t.activeEmployees,
      change: `${t.total}: ${employeeStats.total ?? 0}`,
      positive: true,
      bgColor: '#f3e5f5',
      color: '#6a1b9a',
    })
  }

  if (newsStats) {
    displayStats.push({
      id: 'news',
      icon: <Newspaper />,
      value: newsStats.published ?? 0,
      label: t.publishedNews,
      change: `${newsStats.pending ?? 0} ${t.pending}`,
      positive: true,
      bgColor: '#fff3e0',
      color: '#e65100',
    })

    displayStats.push({
      id: 'views',
      icon: <Eye />,
      value: newsStats.total_views ?? 0,
      label: t.totalViews,
      change: `${newsStats.total_likes ?? 0} ${t.likes}`,
      positive: true,
      bgColor: '#fde8ea',
      color: '#c62828',
    })
  }

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.container}>
          <div className={styles.loadingContainer}>
            <RefreshCw size={32} className={styles.spinner} />
            <p>{t.loading}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  if (!isEmployee && !user?.is_staff && !user?.is_superuser) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.container}>
          <div className={styles.errorContainer}>
            <div className={styles.accessDeniedIcon}>
              <Shield size={48} />
            </div>
            <h3>{t.accessDenied}</h3>
            <p>{t.dashboardAccess}</p>
            <Link href="/" className={styles.primaryBtn}>{t.returnHome}</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.dashboardContainer} dir={dir}>
      <div className={styles.container}>
        <div className={styles.dashboardHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <LayoutDashboard size={26} />
            </div>
            <div>
              <h1 className={styles.pageTitle}>{t.dashboard}</h1>
              <p className={styles.pageDesc}>
                {t.welcome}{displayName ? ` ${displayName}` : ''} — {t.subtitle}
              </p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.refreshBtn}
              onClick={refreshAll}
              disabled={loadingData}
            >
              <RefreshCw size={14} className={loadingData ? styles.spinner : undefined} />
              {t.refresh}
            </button>
          </div>
        </div>

        {(employeeData || user) && (
          <div className={styles.userInfoBar}>
            <span className={styles.userAvatar}>{initialsOf()}</span>
            <div className={styles.userMeta}>
              <span className={styles.userName}>{displayName || '—'}</span>
              <div className={styles.userChips}>
                {employeeData?.employee_code && (
                  <span className={`${styles.chip} ${styles.chipStrong}`}>
                    {t.employeeCode}: {employeeData.employee_code}
                  </span>
                )}
                {employeeData?.access_level_label && (
                  <span className={styles.chip}>{employeeData.access_level_label}</span>
                )}
                {(assignedSections || []).map((d) => (
                  <span
                    key={d.id || d.code}
                    className={`${styles.chip} ${styles.sectionChip}`}
                    style={{ '--chip-color': d.color || '#c27800' }}
                  >
                    <span className={styles.colorDot} />
                    {language === 'en' && d.name_en ? d.name_en : d.name_fa}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className={styles.statsSection}>
          <div className={styles.blockHeader}>
            <h3 className={styles.sectionTitle}>
              <BarChart3 size={18} />
              {t.statistics}
            </h3>
          </div>
          {displayStats.length > 0 ? (
            <div className={styles.statsGrid}>
              {displayStats.map((stat) => (
                <div
                  key={stat.id}
                  className={styles.statCard}
                  style={{ '--stat-accent': stat.color }}
                >
                  <div
                    className={styles.statIconWrapper}
                    style={{ background: stat.bgColor, color: stat.color }}
                  >
                    {stat.icon}
                  </div>
                  <div className={styles.statInfo}>
                    <span className={styles.statValue}>{stat.value}</span>
                    <span className={styles.statLabel}>{stat.label}</span>
                    <span className={`${styles.statChange} ${stat.positive ? styles.positive : styles.negative}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyHint}>{t.noStats}</div>
          )}
        </div>

        <div className={styles.quickActionsSection}>
          <div className={styles.blockHeader}>
            <h3 className={styles.sectionTitle}>
              <Zap size={18} />
              {t.quickAccess}
            </h3>
          </div>
          {quickActions.length > 0 ? (
            <div className={styles.actionsGrid}>
              {quickActions.map((action) => (
                <Link key={action.id} href={action.href} className={styles.actionCard}>
                  <div
                    className={styles.actionIcon}
                    style={{ background: action.bgColor, color: action.color }}
                  >
                    {action.icon}
                  </div>
                  <span className={styles.actionLabel}>{action.label}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.emptyHint}>{t.noQuick}</div>
          )}
        </div>

        <div className={styles.dashboardFooter}>
          {t.dashboard} — {new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'fa-IR')}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
