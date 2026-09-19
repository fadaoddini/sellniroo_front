// app/dashboard/page.jsx

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'
import {
  LayoutDashboard,
  Warehouse,
  ShoppingCart,
  Award,
  Users,
  Shield,
  RefreshCw,
  Briefcase,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import styles from './Dashboard.module.css'

const Dashboard = () => {
  const router = useRouter()
  const { 
    isAuthenticated, 
    loading, 
    user, 
    isEmployee, 
    employeeData 
  } = useAuth()
  const { language, dir } = useLanguage()
  
  const [loadingData, setLoadingData] = useState(false)

  const texts = {
    fa: {
      title: 'داشبورد مدیریت',
      subtitle: 'خلاصه وضعیت و عملکرد',
      dashboard: 'داشبورد مدیریت',
      inventory: 'انبارداری',
      sales: 'فروش',
      tender: 'مزایده/مناقصه',
      employees: 'کارمندان',
      welcome: 'خوش آمدید',
      accessDenied: 'دسترسی محدود',
      dashboardAccess: 'برای دسترسی به داشبورد باید کارمند باشید',
      returnHome: 'بازگشت به صفحه اصلی',
      loading: 'در حال بارگذاری...',
      quickAccess: 'دسترسی سریع',
      statistics: 'آمار کلی',
      totalLeads: 'کل لیدها',
      activeProjects: 'پروژه‌های فعال',
      pendingTasks: 'وظایف در انتظار',
      alerts: 'هشدارها',
      employeeCode: 'کد پرسنلی',
      department: 'بخش',
      position: 'سمت'
    },
    en: {
      title: 'Management Dashboard',
      subtitle: 'Overview and Performance',
      dashboard: 'Management Dashboard',
      inventory: 'Inventory',
      sales: 'Sales',
      tender: 'Tender/Auction',
      employees: 'Employees',
      welcome: 'Welcome',
      accessDenied: 'Access Denied',
      dashboardAccess: 'You must be an employee to access the dashboard',
      returnHome: 'Return to Home',
      loading: 'Loading...',
      quickAccess: 'Quick Access',
      statistics: 'Statistics',
      totalLeads: 'Total Leads',
      activeProjects: 'Active Projects',
      pendingTasks: 'Pending Tasks',
      alerts: 'Alerts',
      employeeCode: 'Employee Code',
      department: 'Department',
      position: 'Position'
    }
  }

  const t = texts[language] || texts.fa

  // بررسی دسترسی
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  // اگر در حال بارگذاری است
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

  // اگر کاربر وارد نشده است
  if (!isAuthenticated) {
    return null
  }

  // اگر کاربر کارمند نیست
  if (!isEmployee) {
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

  // آیتم‌های دسترسی سریع
  const quickActions = [
    {
      id: 'inventory',
      icon: <Warehouse />,
      label: t.inventory,
      href: '/inventory',
      color: '#1976d2',
      bgColor: '#e3f2fd'
    },
    {
      id: 'sales',
      icon: <ShoppingCart />,
      label: t.sales,
      href: '/sale',
      color: '#2e7d32',
      bgColor: '#e8f5e9'
    },
    {
      id: 'tender',
      icon: <Award />,
      label: t.tender,
      href: '/setad',
      color: '#e65100',
      bgColor: '#fff3e0'
    },
    {
      id: 'employees',
      icon: <Users />,
      label: t.employees,
      href: '/employees',
      color: '#6a1b9a',
      bgColor: '#f3e5f5'
    }
  ]

  // آمار نمونه
  const stats = [
    {
      id: 'leads',
      icon: <TrendingUp />,
      value: '۱۵۶',
      label: t.totalLeads,
      change: '+۱۲٪',
      positive: true,
      bgColor: '#e3f2fd',
      color: '#1976d2'
    },
    {
      id: 'projects',
      icon: <CheckCircle />,
      value: '۴۵',
      label: t.activeProjects,
      change: '+۸٪',
      positive: true,
      bgColor: '#e8f5e9',
      color: '#2e7d32'
    },
    {
      id: 'tasks',
      icon: <Clock />,
      value: '۱۲',
      label: t.pendingTasks,
      change: '-۳٪',
      positive: false,
      bgColor: '#fff3e0',
      color: '#e65100'
    },
    {
      id: 'alerts',
      icon: <AlertCircle />,
      value: '۵',
      label: t.alerts,
      change: 'بحرانی',
      positive: false,
      bgColor: '#fce4ec',
      color: '#c62828'
    }
  ]

  return (
    <div className={styles.dashboardContainer} dir={dir}>
      <div className={styles.container}>
        {/* هدر */}
        <div className={styles.dashboardHeader}>
          <div>
            <h1 className={styles.pageTitle}>
              <LayoutDashboard className={styles.titleIcon} size={28} />
              {t.dashboard}
            </h1>
            <p className={styles.pageDesc}>
              {t.welcome} {user?.display_name || user?.first_name || ''} - {t.subtitle}
            </p>
          </div>
        </div>

        {/* اطلاعات کاربر */}
        {employeeData && (
          <div className={styles.userInfoBar}>
            <Briefcase size={18} />
            <span className={styles.userInfoText}>
              {employeeData.employee_code && (
                <>{t.employeeCode}: <span className={styles.highlight}>{employeeData.employee_code}</span></>
              )}
              {employeeData.department && (
                <> | {t.department}: <span className={styles.highlight}>{employeeData.department}</span></>
              )}
              {employeeData.position && (
                <> | {t.position}: <span className={styles.highlight}>{employeeData.position}</span></>
              )}
            </span>
          </div>
        )}

        {/* آمار */}
        <div className={styles.statsGrid}>
          {stats.map((stat) => (
            <div key={stat.id} className={styles.statCard}>
              <div className={styles.statIconWrapper} style={{ background: stat.bgColor, color: stat.color }}>
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

        {/* دسترسی سریع */}
        <div className={styles.quickActionsSection}>
          <h3 className={styles.sectionTitle}>
            <LayoutDashboard size={18} />
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

        {/* فوتر */}
        <div className={styles.dashboardFooter}>
          {t.dashboard} - {new Date().toLocaleDateString('fa-IR')}
        </div>
      </div>
    </div>
  )
}

export default Dashboard