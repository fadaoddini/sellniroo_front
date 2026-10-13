// app/dashboard/page.jsx

'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
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
  BarChart3, Megaphone, Images, Settings2, Tags, Radio, Info, PanelTop, BookOpen, Brain, HelpCircle, GraduationCap,
} from 'lucide-react'
import {
  fetchSiteModules,
  clearSiteModulesCache,
} from '@/services/siteModules'
import {
  isDashboardItemModuleActive,
  SITE_MODULE_KEYS,
} from '@/config/siteModules'
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
  const [moduleMap, setModuleMap] = useState({})

  const texts = {
    fa: {
      title: 'داشبورد مدیریت',
      subtitle: 'خلاصه وضعیت و عملکرد',
      dashboard: 'داشبورد مدیریت',
      employees: 'کارمندان',
      ticker: 'نوار خبری',
      heroSlider: 'اسلایدر هیرو',
      siteSettings: 'تنظیمات سایت',
      aboutManage: 'درباره ما',
      headerMenu: 'منوی سیستم شرکتی',
      videoInstaManage: 'آرشیو ویدیو / استوری',
      catalogManage: 'کاتالوگ دیجیتال',
      quizManage: 'مدیریت آزمون',
      faqManage: 'سوالات متداول',
      schoolManage: 'مدرسه',
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
      aboutManage: 'About page',
      headerMenu: 'Corporate menu',
      videoInstaManage: 'Video Insta / Stories',
      catalogManage: 'Digital catalog',
      quizManage: 'Quiz manage',
      faqManage: 'FAQ manage',
      schoolManage: 'School',
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

  const loadModuleMap = useCallback(async () => {
    try {
      clearSiteModulesCache()
      const { map } = await fetchSiteModules({ force: true })
      setModuleMap(map || {})
    } catch {
      setModuleMap({})
    }
  }, [])

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
    const jobs = [loadModuleMap()]
    if (isEmployee || user?.is_superuser) jobs.push(fetchDashboardStats())
    jobs.push(fetchNewsStats())
    if (canManageEmployees) jobs.push(fetchEmployeeStats())
    await Promise.allSettled(jobs)
  }, [isEmployee, user, canManageEmployees, fetchDashboardStats, fetchNewsStats, fetchEmployeeStats, loadModuleMap])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (!isAuthenticated) return
    loadModuleMap()
    if (isEmployee || user?.is_superuser) {
      fetchDashboardStats()
      fetchNewsStats()
    }
    if (canManageEmployees) {
      fetchEmployeeStats()
    }
  }, [isAuthenticated, isEmployee, user, canManageEmployees, fetchDashboardStats, fetchNewsStats, fetchEmployeeStats, loadModuleMap])

  useEffect(() => {
    const onModulesChanged = () => loadModuleMap()
    window.addEventListener('site-modules-changed', onModulesChanged)
    return () => window.removeEventListener('site-modules-changed', onModulesChanged)
  }, [loadModuleMap])

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

  const canManageTicker = user?.is_superuser || user?.is_staff || canManageEmployees

  const quickActions = useMemo(() => {
    const linked = (assignedSections || []).filter((d) => d.href)
    const seenHrefs = new Set()
    const raw = []

    linked.forEach((d) => {
      if (!d.href || seenHrefs.has(d.href)) return
      seenHrefs.add(d.href)
      raw.push({
        id: d.code,
        icon: sectionIcon(d.icon),
        label: language === 'en' && d.name_en ? d.name_en : d.name_fa,
        href: d.href,
        color: d.color || '#c27800',
        bgColor: hexToBg(d.color),
        sectionCode: d.code,
      })
    })

    if (canManageEmployees && !seenHrefs.has('/employees')) {
      raw.unshift({
        id: 'employees',
        icon: <Users />,
        label: t.employees,
        href: '/employees',
        color: '#6a1b9a',
        bgColor: '#f3e5f5',
      })
    }

    if (canManageTicker && !seenHrefs.has('/ticker')) {
      raw.push({
        id: 'ticker',
        icon: <Megaphone />,
        label: t.ticker,
        href: '/ticker',
        color: '#c27800',
        bgColor: '#fff3c4',
      })
    }
    if (canManageTicker && !seenHrefs.has('/hero-slider')) {
      raw.push({
        id: 'hero-slider',
        icon: <Images />,
        label: t.heroSlider,
        href: '/hero-slider',
        color: '#1565c0',
        bgColor: '#e3f2fd',
      })
    }
    if (canManageTicker && !seenHrefs.has('/site-settings')) {
      raw.push({
        id: 'site-settings',
        icon: <Settings2 />,
        label: t.siteSettings,
        href: '/site-settings',
        color: '#455a64',
        bgColor: '#eceff1',
      })
    }
    if (canManageTicker && !seenHrefs.has('/about-manage')) {
      raw.push({
        id: 'about-manage',
        icon: <Info />,
        label: t.aboutManage,
        href: '/about-manage',
        color: '#6a1b9a',
        bgColor: '#f3e5f5',
      })
    }
    if (canManageTicker && !seenHrefs.has('/header-menu')) {
      raw.push({
        id: 'header-menu',
        icon: <PanelTop />,
        label: t.headerMenu,
        href: '/header-menu',
        color: '#212121',
        bgColor: '#eeeeee',
      })
    }
    if (canManageTicker && !seenHrefs.has('/videoinsta-manage')) {
      raw.push({
        id: 'videoinsta-manage',
        icon: <Images />,
        label: t.videoInstaManage,
        href: '/videoinsta-manage',
        color: '#9f1239',
        bgColor: '#fce7f3',
      })
    }
    if (canManageTicker && !seenHrefs.has('/catalog-manage')) {
      raw.push({
        id: 'catalog-manage',
        icon: <BookOpen />,
        label: t.catalogManage,
        href: '/catalog-manage',
        color: '#800020',
        bgColor: '#fce7f3',
      })
    }
    if (canManageTicker && !seenHrefs.has('/quiz-manage')) {
      raw.push({
        id: 'quiz-manage',
        icon: <Brain />,
        label: t.quizManage,
        href: '/quiz-manage',
        color: '#800020',
        bgColor: '#fce7f3',
      })
    }
    if (canManageTicker && !seenHrefs.has('/faq-manage')) {
      raw.push({
        id: 'faq-manage',
        icon: <HelpCircle />,
        label: t.faqManage,
        href: '/faq-manage',
        color: '#2d5a45',
        bgColor: '#e8f2ec',
      })
    }
    if (canManageTicker && !seenHrefs.has('/school-manage')) {
      raw.push({
        id: 'school-manage',
        icon: <GraduationCap />,
        label: t.schoolManage,
        href: '/school-manage',
        color: '#1e4d6b',
        bgColor: '#e8f1f6',
      })
    }
    if (canManageTicker && !seenHrefs.has('/request-types')) {
      raw.push({
        id: 'request-types',
        icon: <Tags />,
        label: t.requestTypes,
        href: '/request-types',
        color: '#1565c0',
        bgColor: '#e3f2fd',
      })
    }
    if (canManageTicker && !seenHrefs.has('/jobs-manage')) {
      raw.unshift({
        id: 'jobs-manage',
        icon: <Briefcase />,
        label: t.jobsManage,
        href: '/jobs-manage',
        color: '#c27800',
        bgColor: '#fff3c4',
      })
    }
    if (canManageTicker && !seenHrefs.has('/platform-connections')) {
      raw.push({
        id: 'platform-connections',
        icon: <Radio />,
        label: t.platformConnections,
        href: '/platform-connections',
        color: '#1565c0',
        bgColor: '#e3f2fd',
      })
    }

    return raw.filter((action) =>
      isDashboardItemModuleActive(
        action.href,
        moduleMap,
        action.sectionCode || action.id
      )
    )
  }, [
    assignedSections,
    canManageEmployees,
    canManageTicker,
    language,
    moduleMap,
    t.employees,
    t.ticker,
    t.heroSlider,
    t.siteSettings,
    t.aboutManage,
    t.headerMenu,
    t.videoInstaManage,
    t.catalogManage,
    t.quizManage,
    t.faqManage,
    t.schoolManage,
    t.requestTypes,
    t.jobsManage,
    t.platformConnections,
  ])

  const visibleSectionChips = useMemo(() => {
    return (assignedSections || []).filter((d) =>
      isDashboardItemModuleActive(d.href, moduleMap, d.code)
    )
  }, [assignedSections, moduleMap])

  const displayStats = []

  const salesModuleOn =
    !Object.prototype.hasOwnProperty.call(moduleMap, SITE_MODULE_KEYS.SALES_MARKETING) ||
    !!moduleMap[SITE_MODULE_KEYS.SALES_MARKETING]

  if (stats?.leads && salesModuleOn) {
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

  if (stats?.followups && salesModuleOn) {
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

  const newsModuleOn =
    !Object.prototype.hasOwnProperty.call(moduleMap, SITE_MODULE_KEYS.NEWS) ||
    !!moduleMap[SITE_MODULE_KEYS.NEWS]

  if (newsStats && newsModuleOn) {
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
                {visibleSectionChips.map((d) => (
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
