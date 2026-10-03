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
  LayoutDashboard, Warehouse, ShoppingCart, Award, Users, Shield,
  RefreshCw, Briefcase, TrendingUp, CheckCircle, Clock, AlertCircle,
  Newspaper, MessageSquare, Package, Headphones, FileText, Zap,
  Eye, Heart, UserCheck, UserX, BarChart3
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
    permissions,
  } = useAuth()
  const { language, dir } = useLanguage()

  const [stats, setStats] = useState(null)
  const [newsStats, setNewsStats] = useState(null)
  const [loadingData, setLoadingData] = useState(false)

  const texts = {
    fa: {
      title: 'داشبورد مدیریت',
      subtitle: 'خلاصه وضعیت و عملکرد',
      dashboard: 'داشبورد مدیریت',
      inventory: 'انبارداری',
      sales: 'بازاریابی',
      tender: 'مزایده/مناقصه',
      employees: 'کارمندان',
      newsManagement: 'مدیریت اخبار',
      comments: 'کامنت‌ها',
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
      pendingComments: 'کامنت‌های در انتظار',
      totalViews: 'کل بازدید',
      employeeCode: 'کد پرسنلی',
      department: 'بخش',
      position: 'سمت',
      leads: 'لیدها',
      followups: 'پیگیری‌ها',
      today: 'امروز',
      thisWeek: 'این هفته',
      total: 'کل',
      noAccess: 'دسترسی ندارید',
      myProfile: 'پروفایل من',
      leaveRequests: 'درخواست مرخصی',
    },
    en: {
      title: 'Management Dashboard',
      subtitle: 'Overview and Performance',
      dashboard: 'Management Dashboard',
      inventory: 'Inventory',
      sales: 'Sales',
      tender: 'Tender/Auction',
      employees: 'Employees',
      newsManagement: 'News Management',
      comments: 'Comments',
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
      pendingComments: 'Pending Comments',
      totalViews: 'Total Views',
      employeeCode: 'Employee Code',
      department: 'Department',
      position: 'Position',
      leads: 'Leads',
      followups: 'Follow-ups',
      today: 'Today',
      thisWeek: 'This Week',
      total: 'Total',
      noAccess: 'No Access',
      myProfile: 'My Profile',
      leaveRequests: 'Leave Requests',
    }
  }

  const t = texts[language] || texts.fa

  // ============================================
  // ✅ دریافت آمار داشبورد
  // ============================================
  const fetchDashboardStats = useCallback(async () => {
    if (!isEmployee) return
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
  }, [isEmployee, getAuthHeaders])

  // ============================================
  // ✅ دریافت آمار اخبار (فقط برای staff)
  // ============================================
  const fetchNewsStats = useCallback(async () => {
    if (!user?.is_staff && !user?.is_superuser) return
    try {
      const url = Config.endpoints.news.stats()
      const res = await axios.get(url, { headers: getAuthHeaders() })
      setNewsStats(res.data?.data || res.data)
    } catch (err) {
      console.error('Error fetching news stats:', err)
    }
  }, [user, getAuthHeaders])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (isAuthenticated && isEmployee) {
      fetchDashboardStats()
      fetchNewsStats()
    }
  }, [isAuthenticated, isEmployee, fetchDashboardStats, fetchNewsStats])

  // ============================================
  // ✅ بررسی دسترسی‌ها
  // ============================================
  const canManageEmployees = user?.is_superuser ||
    permissions?.includes('marketing') ||
    permissions?.includes('all') ||
    employeeData?.access_level >= 3

  const canManageNews = user?.is_staff || user?.is_superuser

  const canAccessInventory = permissions?.includes('warehouse') || user?.is_superuser
  const canAccessSales = permissions?.includes('sales') || user?.is_superuser
  const canAccessSupport = permissions?.includes('support') || user?.is_superuser
  const canAccessAttendance = permissions?.includes('attendance') || user?.is_superuser

  // ============================================
  // ✅ ساخت آیتم‌های دسترسی سریع
  // ============================================
  const quickActions = [
    canManageEmployees && {
      id: 'employees',
      icon: <Users />,
      label: t.employees,
      href: '/employees',
      color: '#6a1b9a',
      bgColor: '#f3e5f5'
    },
    canManageNews && {
      id: 'news',
      icon: <Newspaper />,
      label: t.newsManagement,
      href: '/news-management',
      color: '#1976d2',
      bgColor: '#e3f2fd'
    },
  
    canAccessSales && {
      id: 'sales',
      icon: <ShoppingCart />,
      label: t.sales,
      href: '/sale',
      color: '#2e7d32',
      bgColor: '#e8f5e9'
    },
   
  ].filter(Boolean)

  // ============================================
  // ✅ ساخت آمار نمایشی
  // ============================================
  const displayStats = []

  if (stats?.leads) {
    displayStats.push({
      id: 'leads',
      icon: <TrendingUp />,
      value: stats.leads.total ?? 0,
      label: t.totalLeads,
      change: `${stats.leads.new ?? 0} جدید`,
      positive: true,
      bgColor: '#e3f2fd',
      color: '#1976d2'
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
      color: '#2e7d32'
    })
  }

  if (newsStats) {
    displayStats.push({
      id: 'news',
      icon: <Newspaper />,
      value: newsStats.published ?? 0,
      label: t.publishedNews,
      change: `${newsStats.pending ?? 0} در انتظار`,
      positive: true,
      bgColor: '#fff3e0',
      color: '#e65100'
    })

    displayStats.push({
      id: 'views',
      icon: <Eye />,
      value: newsStats.total_views ?? 0,
      label: t.totalViews,
      change: `${newsStats.total_likes ?? 0} لایک`,
      positive: true,
      bgColor: '#fce4ec',
      color: '#c62828'
    })
  }

  // ============================================
  // ✅ حالت‌های بارگذاری و خطا
  // ============================================
  if (loading || loadingData) {
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

  if (!isAuthenticated) {
    return null
  }

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
            <Link href="/" className={styles.primaryBtn}>
              {t.returnHome}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // ✅ رندر اصلی
  // ============================================
  return (
    <div className={styles.dashboardContainer} dir={dir}>
      <div className={styles.container}>
        {/* هدر */}
        <div className={styles.dashboardHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <LayoutDashboard size={28} />
            </div>
            <div>
              <h1 className={styles.pageTitle}>
                {t.dashboard}
              </h1>
              <p className={styles.pageDesc}>
                {t.welcome} {user?.display_name || user?.first_name || ''} - {t.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* اطلاعات کاربر */}
        {employeeData && (
          <div className={styles.userInfoBar}>
            <Briefcase size={18} />
            <span className={styles.userInfoText}>
              {employeeData.employee_code && (
                <>
                  {t.employeeCode}: <span className={styles.highlight}>{employeeData.employee_code}</span>
                </>
              )}
              {employeeData.access_level_label && (
                <>
                  {' | '}
                  <span className={styles.highlight}>{employeeData.access_level_label}</span>
                </>
              )}
            </span>
          </div>
        )}

        {/* آمار */}
        {displayStats.length > 0 && (
          <div className={styles.statsGrid}>
            {displayStats.map((stat) => (
              <div key={stat.id} className={styles.statCard}>
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
        )}

        {/* دسترسی سریع */}
        {quickActions.length > 0 && (
          <div className={styles.quickActionsSection}>
            <h3 className={styles.sectionTitle}>
              <Zap size={18} />
              {t.quickAccess}
            </h3>

            <div className={styles.actionsGrid}>
              {quickActions.map((action) => (
                <Link
                  key={action.id}
                  href={action.href}
                  className={styles.actionCard}
                >
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
          </div>
        )}

        {/* فوتر */}
        <div className={styles.dashboardFooter}>
          {t.dashboard} - {new Date().toLocaleDateString('fa-IR')}
        </div>
      </div>
    </div>
  )
}

export default Dashboard