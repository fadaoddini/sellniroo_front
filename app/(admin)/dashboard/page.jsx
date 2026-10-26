// app/dashboard/page.jsx

'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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
  BarChart3, Megaphone, Images, Settings2, Tags, Radio, Info, PanelTop, BookOpen, Brain, HelpCircle, GraduationCap, Star, FolderOpen, GalleryHorizontal, FileText, CreditCard, ShoppingBag, Package, Store, Wallet,
  Database, MapPin, Handshake, Building2, ClipboardList, ScrollText, ChevronDown,
} from 'lucide-react'
import GuidedTour, { useGuidedTour } from '@/components/Admin/GuidedTour'
import {
  DASHBOARD_FULL_TOUR,
  DASHBOARD_TOUR_SECTION_META,
  filterTourStepsToDom,
  resolveDashboardTour,
} from '@/config/dashboardTour'
import {
  fetchSiteModules,
  clearSiteModulesCache,
} from '@/services/siteModules'
import {
  fetchSiteSettings,
  clearSiteSettingsCache,
} from '@/services/siteSettings'
import {
  isDashboardItemModuleActive,
  isEffectiveMultiVendor,
  isEffectiveSingleStore,
  isShopModuleOn,
  SITE_MODULE_KEYS,
} from '@/config/siteModules'
import {
  groupDashboardActions,
  resolveDashboardGroup,
} from '@/config/dashboardSections'
import { findAllWidgetsByType } from '@/config/homeLayout'
import { isOwnerOnlyPath } from '@/utils/ownerAccess'
import { canManageMultiVendor } from '@/utils/multiVendorAccess'
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
  /** ویجت‌هایی که واقعاً در چیدمان صفحه اصلی قرار گرفته‌اند */
  const [layoutWidgetTypes, setLayoutWidgetTypes] = useState({
    latest_news: false,
    news_list: false,
    latest_news_recycler: false,
    featured_news: false,
    featured_news_slider: false,
    news_by_category: false,
  })

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
      headerMenu: 'منوی سایت و ظاهر',
      videoInstaManage: 'آرشیو ویدیو / استوری',
      catalogManage: 'کاتالوگ دیجیتال',
      quizManage: 'مدیریت آزمون',
      faqManage: 'سوالات متداول',
      schoolManage: 'مدرسه',
      requestTypes: 'انواع درخواست تماس',
      jobsManage: 'مدیریت آگهی‌ها',
      jobSingle: 'صفحه سینگل آگهی',
      jobsData: 'داده‌های کاریابی',
      jobsLocations: 'شهرها و موقعیت',
      jobsCooperation: 'نوع همکاری',
      jobsCategories: 'دسته‌بندی شغلی',
      jobsTitles: 'عناوین شغلی',
      jobsFilters: 'فیلترهای آگهی',
      jobsCompanies: 'شرکت‌ها و تأیید',
      jobsApplications: 'درخواست‌های شغلی',
      jobsResumes: 'رزومه‌ها',
      postJob: 'ثبت آگهی',
      platformConnections: 'اتصالات پیام‌رسان',
      adminPortal: 'ادمین وب',
      paymentManage: 'ماژول پرداخت',
      shopManage: 'مدیریت محصولات',
      shopPanel: 'پنل فروشگاه',
      shopSettings: 'تنظیمات فروشگاه',
      shopProducts: 'محصولات',
      shopCategories: 'دسته‌بندی محصولات',
      productSingle: 'سینگل محصول',
      adminShop: 'طراحی فروشگاه',
      marketplaceHub: 'مرکز چندفروشندگی',
      marketplaceSettle: 'تسویه و حسابداری',
      marketplaceProducts: 'محصولات فروشگاه‌ها',
      newsManage: 'مدیریت اخبار',
      newsSingle: 'صفحه سینگل خبر',
      latestNews: 'آخرین اخبار',
      newsList: 'لیست اخبار',
      newsRecycler: 'ریسایکلرویوی اخبار',
      featuredNewsList: 'اخبار ویژه لیست سفارشی',
      newsByCategory: 'اخبار یک دسته',
      featuredNewsSlider: 'اسلایدر اخبار ویژه',
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
      tourGuide: 'راهنمای تور',
      tourFull: 'تور کامل داشبورد',
      sectionHelp: 'راهنمای این بخش',
      tourMenuTitle: 'چه چیزی را یاد بگیرم؟',
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
      headerMenu: 'Site menu & appearance',
      videoInstaManage: 'Video Insta / Stories',
      catalogManage: 'Digital catalog',
      quizManage: 'Quiz manage',
      faqManage: 'FAQ manage',
      schoolManage: 'School',
      requestTypes: 'Contact request types',
      jobsManage: 'Job listings',
      jobSingle: 'Job single page',
      jobsData: 'Job board data',
      jobsLocations: 'Cities & locations',
      jobsCooperation: 'Cooperation types',
      jobsCategories: 'Job categories',
      jobsTitles: 'Job titles',
      jobsFilters: 'Listing filters',
      jobsCompanies: 'Companies & verification',
      jobsApplications: 'Job applications',
      jobsResumes: 'Resumes',
      postJob: 'Post a job',
      platformConnections: 'Messenger bots',
      adminPortal: 'Admin Web',
      paymentManage: 'Payment module',
      shopManage: 'Product catalog',
      shopPanel: 'Shop panel',
      shopSettings: 'Shop settings',
      shopProducts: 'Products',
      shopCategories: 'Product categories',
      productSingle: 'Product single',
      adminShop: 'Shop design',
      marketplaceHub: 'Multi-vendor hub',
      marketplaceSettle: 'Settlements',
      marketplaceProducts: 'Vendor products',
      newsManage: 'News management',
      newsSingle: 'News single page',
      latestNews: 'Latest news',
      newsList: 'News list',
      newsRecycler: 'News RecyclerView',
      featuredNewsList: 'Featured news custom list',
      newsByCategory: 'News by category',
      featuredNewsSlider: 'Featured news slider',
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
      tourGuide: 'Tour guide',
      tourFull: 'Full dashboard tour',
      sectionHelp: 'Guide this section',
      tourMenuTitle: 'What should I learn?',
    }
  }

  const t = texts[language] || texts.fa

  const loadLayoutWidgets = useCallback(async () => {
    try {
      clearSiteSettingsCache()
      const settings = await fetchSiteSettings({ force: true })
      const layout = settings?.home_layout
      setLayoutWidgetTypes({
        latest_news: findAllWidgetsByType(layout, 'latest_news').length > 0,
        news_list: findAllWidgetsByType(layout, 'news_list').length > 0,
        latest_news_recycler:
          findAllWidgetsByType(layout, 'latest_news_recycler').length > 0,
        featured_news: findAllWidgetsByType(layout, 'featured_news').length > 0,
        featured_news_slider:
          findAllWidgetsByType(layout, 'featured_news_slider').length > 0,
        news_by_category:
          findAllWidgetsByType(layout, 'news_by_category').length > 0,
      })
    } catch {
      setLayoutWidgetTypes({
        latest_news: false,
        news_list: false,
        latest_news_recycler: false,
        featured_news: false,
        featured_news_slider: false,
        news_by_category: false,
      })
    }
  }, [])

  const loadModuleMap = useCallback(async (nextMap) => {
    try {
      if (nextMap && typeof nextMap === 'object' && Object.keys(nextMap).length) {
        setModuleMap(nextMap)
        return
      }
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
    const jobs = [loadModuleMap(), loadLayoutWidgets()]
    if (isEmployee || user?.is_superuser) jobs.push(fetchDashboardStats())
    jobs.push(fetchNewsStats())
    if (canManageEmployees) jobs.push(fetchEmployeeStats())
    await Promise.allSettled(jobs)
  }, [
    isEmployee,
    user,
    canManageEmployees,
    fetchDashboardStats,
    fetchNewsStats,
    fetchEmployeeStats,
    loadModuleMap,
    loadLayoutWidgets,
  ])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (!isAuthenticated) return
    loadModuleMap()
    loadLayoutWidgets()
    if (isEmployee || user?.is_superuser) {
      fetchDashboardStats()
      fetchNewsStats()
    }
    if (canManageEmployees) {
      fetchEmployeeStats()
    }
  }, [
    isAuthenticated,
    isEmployee,
    user,
    canManageEmployees,
    fetchDashboardStats,
    fetchNewsStats,
    fetchEmployeeStats,
    loadModuleMap,
    loadLayoutWidgets,
  ])

  useEffect(() => {
    const onModulesChanged = (e) => {
      const map = e?.detail?.map
      loadModuleMap(map && typeof map === 'object' ? map : undefined)
    }
    const onLayoutChanged = () => loadLayoutWidgets()
    const onStorage = (e) => {
      if (e.key === 'site-modules-bust') loadModuleMap()
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        loadModuleMap()
        loadLayoutWidgets()
      }
    }
    window.addEventListener('site-modules-changed', onModulesChanged)
    window.addEventListener('home-layout-changed', onLayoutChanged)
    window.addEventListener('storage', onStorage)
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      window.removeEventListener('site-modules-changed', onModulesChanged)
      window.removeEventListener('home-layout-changed', onLayoutChanged)
      window.removeEventListener('storage', onStorage)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [loadModuleMap, loadLayoutWidgets])

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
  const canManageNews =
    user?.is_superuser || user?.is_staff || hasPermission('news')
  const canManageShops = canManageMultiVendor(user, {
    hasPermission,
    canManageEmployees,
  })
  const shopOn = isShopModuleOn(moduleMap)
  const multiVendorOn = isEffectiveMultiVendor(moduleMap)
  const singleStoreOn = isEffectiveSingleStore(moduleMap)

  const quickActions = useMemo(() => {
    const linked = (assignedSections || []).filter((d) => d.href)
    const seenHrefs = new Set()
    const raw = []

    const pushAction = (action) => {
      if (!action?.href || seenHrefs.has(action.href)) return
      const hrefPath = String(action.href).split('?')[0]
      // پورتال مالک (adminweb / adminproducts / …) فقط برای دو شماره — نه در داشبورد
      if (isOwnerOnlyPath(hrefPath)) return
      // چندفروشندگی را در حالت تک‌فروشگاهی هرگز اضافه نکن
      if (
        !multiVendorOn &&
        (hrefPath === '/shops-manage' ||
          hrefPath === '/shops-accounting' ||
          hrefPath === '/shops-products' ||
          action.sectionCode === 'shops-manage' ||
          action.sectionCode === 'shops-accounting' ||
          action.sectionCode === 'shops-products' ||
          action.sectionCode === 'multi_vendor' ||
          action.sectionCode === 'multi-vendor')
      ) {
        return
      }
      seenHrefs.add(action.href)
      raw.push({
        ...action,
        group: action.group || resolveDashboardGroup(action),
      })
    }

    linked.forEach((d) => {
      pushAction({
        id: d.code,
        icon: sectionIcon(d.icon),
        label: language === 'en' && d.name_en ? d.name_en : d.name_fa,
        href: d.href,
        color: d.color || '#c27800',
        bgColor: hexToBg(d.color),
        sectionCode: d.code,
      })
    })

    if (canManageEmployees) {
      pushAction({
        id: 'employees',
        icon: <Users />,
        label: t.employees,
        href: '/employees',
        color: '#6a1b9a',
        bgColor: '#f3e5f5',
        group: 'team',
      })
    }

    if (canManageNews) {
      pushAction({
        id: 'news',
        icon: <Newspaper />,
        label: t.newsManage,
        href: '/news-management',
        color: '#e65100',
        bgColor: '#fff3e0',
        group: 'news',
        sectionCode: 'news',
      })
      pushAction({
        id: 'news-single',
        icon: <FileText />,
        label: t.newsSingle,
        href: '/news-single',
        color: '#5d4037',
        bgColor: '#efebe9',
        group: 'news',
        sectionCode: 'news-single',
      })
      // فقط اگر ویجت واقعاً در چیدمان AdminWeb گذاشته شده باشد
      if (layoutWidgetTypes.latest_news) {
        pushAction({
          id: 'news-latest',
          icon: <Newspaper />,
          label: t.latestNews,
          href: '/news-latest',
          color: '#2e7d32',
          bgColor: '#e8f5e9',
          group: 'news',
          sectionCode: 'news-latest',
        })
      }
      if (layoutWidgetTypes.news_list) {
        pushAction({
          id: 'news-list',
          icon: <Newspaper />,
          label: t.newsList,
          href: '/news-list',
          color: '#0277bd',
          bgColor: '#e1f5fe',
          group: 'news',
          sectionCode: 'news-list',
        })
      }
      if (layoutWidgetTypes.latest_news_recycler) {
        pushAction({
          id: 'news-recycler',
          icon: <GalleryHorizontal />,
          label: t.newsRecycler,
          href: '/news-recycler',
          color: '#558b2f',
          bgColor: '#f1f8e9',
          group: 'news',
          sectionCode: 'news-recycler',
        })
      }
      if (layoutWidgetTypes.featured_news) {
        pushAction({
          id: 'news-featured-list',
          icon: <Star />,
          label: t.featuredNewsList,
          href: '/news-featured-list',
          color: '#c27800',
          bgColor: '#fff8e0',
          group: 'news',
          sectionCode: 'news-featured-list',
        })
      }
      if (layoutWidgetTypes.news_by_category) {
        pushAction({
          id: 'news-by-category',
          icon: <FolderOpen />,
          label: t.newsByCategory,
          href: '/news-by-category',
          color: '#1565c0',
          bgColor: '#e3f2fd',
          group: 'news',
          sectionCode: 'news-by-category',
        })
      }
      if (layoutWidgetTypes.featured_news_slider) {
        pushAction({
          id: 'news-featured',
          icon: <Images />,
          label: t.featuredNewsSlider,
          href: '/news-management?tab=featured',
          color: '#e65100',
          bgColor: '#fff3e0',
          group: 'news',
          sectionCode: 'news-featured',
        })
      }
    }

    if (canManageTicker) {
      pushAction({
        id: 'ticker',
        icon: <Megaphone />,
        label: t.ticker,
        href: '/ticker',
        color: '#c27800',
        bgColor: '#fff3c4',
        group: 'content',
      })
      pushAction({
        id: 'hero-slider',
        icon: <Images />,
        label: t.heroSlider,
        href: '/hero-slider',
        color: '#1565c0',
        bgColor: '#e3f2fd',
        group: 'content',
      })
      pushAction({
        id: 'site-settings',
        icon: <Settings2 />,
        label: t.siteSettings,
        href: '/site-settings',
        color: '#455a64',
        bgColor: '#eceff1',
        group: 'site',
      })
      pushAction({
        id: 'about-manage',
        icon: <Info />,
        label: t.aboutManage,
        href: '/about-manage',
        color: '#6a1b9a',
        bgColor: '#f3e5f5',
        group: 'content',
      })
      pushAction({
        id: 'header-menu',
        icon: <PanelTop />,
        label: t.headerMenu,
        href: '/header-menu',
        color: '#212121',
        bgColor: '#eeeeee',
        group: 'site',
      })
      pushAction({
        id: 'videoinsta-manage',
        icon: <Images />,
        label: t.videoInstaManage,
        href: '/videoinsta-manage',
        color: '#9f1239',
        bgColor: '#fce7f3',
        group: 'content',
      })
      pushAction({
        id: 'catalog-manage',
        icon: <BookOpen />,
        label: t.catalogManage,
        href: '/catalog-manage',
        color: '#800020',
        bgColor: '#fce7f3',
        group: 'content',
      })
      pushAction({
        id: 'quiz-manage',
        icon: <Brain />,
        label: t.quizManage,
        href: '/quiz-manage',
        color: '#800020',
        bgColor: '#fce7f3',
        group: 'content',
      })
      pushAction({
        id: 'faq-manage',
        icon: <HelpCircle />,
        label: t.faqManage,
        href: '/faq-manage',
        color: '#2d5a45',
        bgColor: '#e8f2ec',
        group: 'content',
      })
      pushAction({
        id: 'school-manage',
        icon: <GraduationCap />,
        label: t.schoolManage,
        href: '/school-manage',
        color: '#1e4d6b',
        bgColor: '#e8f1f6',
        group: 'content',
      })
      pushAction({
        id: 'request-types',
        icon: <Tags />,
        label: t.requestTypes,
        href: '/request-types',
        color: '#1565c0',
        bgColor: '#e3f2fd',
        group: 'sales',
      })
      pushAction({
        id: 'jobs-manage',
        icon: <Briefcase />,
        label: t.jobsManage,
        href: '/jobs-manage',
        color: '#c27800',
        bgColor: '#fff3c4',
        group: 'jobs',
      })
      pushAction({
        id: 'job-single',
        icon: <Briefcase />,
        label: t.jobSingle,
        href: '/job-single',
        color: '#e67e22',
        bgColor: '#fff4e8',
        group: 'jobs',
        sectionCode: 'job-single',
      })
      pushAction({
        id: 'post-job',
        icon: <Briefcase />,
        label: t.postJob,
        href: '/post-job',
        color: '#d97706',
        bgColor: '#fffbeb',
        group: 'jobs',
      })
      pushAction({
        id: 'jobs-data',
        icon: <Database />,
        label: t.jobsData,
        href: '/jobs-data',
        color: '#b45309',
        bgColor: '#fef3c7',
        group: 'jobs',
      })
      pushAction({
        id: 'jobs-locations',
        icon: <MapPin />,
        label: t.jobsLocations,
        href: '/jobs-data?tab=locations',
        color: '#0369a1',
        bgColor: '#e0f2fe',
        group: 'jobs',
      })
      pushAction({
        id: 'jobs-cooperation',
        icon: <Handshake />,
        label: t.jobsCooperation,
        href: '/jobs-data?tab=cooperation',
        color: '#0f766e',
        bgColor: '#ccfbf1',
        group: 'jobs',
      })
      pushAction({
        id: 'jobs-categories',
        icon: <FolderOpen />,
        label: t.jobsCategories,
        href: '/jobs-data?tab=categories',
        color: '#7c3aed',
        bgColor: '#ede9fe',
        group: 'jobs',
      })
      pushAction({
        id: 'jobs-titles',
        icon: <Tags />,
        label: t.jobsTitles,
        href: '/jobs-data?tab=titles',
        color: '#a16207',
        bgColor: '#fef9c3',
        group: 'jobs',
      })
      pushAction({
        id: 'jobs-filters',
        icon: <Settings2 />,
        label: t.jobsFilters,
        href: '/jobs-data?tab=filters',
        color: '#475569',
        bgColor: '#f1f5f9',
        group: 'jobs',
      })
      pushAction({
        id: 'jobs-companies',
        icon: <Building2 />,
        label: t.jobsCompanies,
        href: '/jobs-data?tab=companies',
        color: '#1d4ed8',
        bgColor: '#dbeafe',
        group: 'jobs',
      })
      pushAction({
        id: 'jobs-applications',
        icon: <ClipboardList />,
        label: t.jobsApplications,
        href: '/jobs-data?tab=applications',
        color: '#be123c',
        bgColor: '#ffe4e6',
        group: 'jobs',
      })
      pushAction({
        id: 'jobs-resumes',
        icon: <ScrollText />,
        label: t.jobsResumes,
        href: '/jobs-data?tab=resumes',
        color: '#0f766e',
        bgColor: '#ccfbf1',
        group: 'jobs',
      })
      pushAction({
        id: 'platform-connections',
        icon: <Radio />,
        label: t.platformConnections,
        href: '/platform-connections',
        color: '#1565c0',
        bgColor: '#e3f2fd',
        group: 'news',
      })
      pushAction({
        id: 'payment-manage',
        icon: <CreditCard />,
        label: t.paymentManage,
        href: '/payment-manage',
        color: '#0f766e',
        bgColor: '#e6f7f4',
        group: 'sales',
        sectionCode: 'payment',
      })
      // تنظیمات ویترین (نه پورتال مالک) — برای مدیر داشبورد
      if (shopOn && singleStoreOn) {
        pushAction({
          id: 'shop-manage',
          icon: <Package />,
          label: t.shopManage,
          href: '/shop-manage',
          color: '#b45309',
          bgColor: '#fff7ed',
          group: 'shop',
          sectionCode: 'shop-manage',
        })
        pushAction({
          id: 'product-single',
          icon: <ShoppingBag />,
          label: t.productSingle,
          href: '/product-single',
          color: '#c2410c',
          bgColor: '#fff7ed',
          group: 'shop',
          sectionCode: 'product-single',
        })
      } else if (shopOn && multiVendorOn) {
        pushAction({
          id: 'product-single',
          icon: <ShoppingBag />,
          label: t.productSingle,
          href: '/product-single',
          color: '#c2410c',
          bgColor: '#fff7ed',
          group: 'shop',
          sectionCode: 'product-single',
        })
      }
    }

    // پنل صاحب فروشگاه — برای کاربر نهایی (نه /admin*)
    if (shopOn) {
      pushAction({
        id: 'shop-panel',
        icon: <Store />,
        label: t.shopPanel,
        href: '/shop-panel',
        color: '#b45309',
        bgColor: '#fff7ed',
        group: 'shop',
        sectionCode: 'shop-panel',
      })
    }

    // فقط در حالت چندفروشندگی مؤثر — صفحات داشبوردی (نه /admin*)
    if (canManageShops && multiVendorOn) {
      pushAction({
        id: 'shops-manage',
        icon: <Store />,
        label: t.marketplaceHub,
        href: '/shops-manage',
        color: '#b45309',
        bgColor: '#fff7ed',
        group: 'marketplace',
        sectionCode: 'shops-manage',
      })
      pushAction({
        id: 'shops-accounting',
        icon: <Wallet />,
        label: t.marketplaceSettle,
        href: '/shops-accounting',
        color: '#0f7a3a',
        bgColor: '#ecfdf5',
        group: 'marketplace',
        sectionCode: 'shops-accounting',
      })
      pushAction({
        id: 'shops-products',
        icon: <Package />,
        label: t.marketplaceProducts,
        href: '/shops-products',
        color: '#9a3412',
        bgColor: '#ffedd5',
        group: 'marketplace',
        sectionCode: 'shops-products',
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
    canManageNews,
    canManageShops,
    shopOn,
    multiVendorOn,
    singleStoreOn,
    language,
    user,
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
    t.jobSingle,
    t.jobsData,
    t.jobsLocations,
    t.jobsCooperation,
    t.jobsCategories,
    t.jobsTitles,
    t.jobsFilters,
    t.jobsCompanies,
    t.jobsApplications,
    t.jobsResumes,
    t.postJob,
    t.platformConnections,
    t.paymentManage,
    t.shopManage,
    t.shopPanel,
    t.productSingle,
    t.marketplaceHub,
    t.marketplaceSettle,
    t.marketplaceProducts,
    t.newsManage,
    t.newsSingle,
    t.latestNews,
    t.newsList,
    t.newsRecycler,
    t.featuredNewsList,
    t.newsByCategory,
    t.featuredNewsSlider,
    layoutWidgetTypes,
  ])

  const quickSections = useMemo(
    () => groupDashboardActions(quickActions, language),
    [quickActions, language]
  )

  const tour = useGuidedTour(DASHBOARD_FULL_TOUR)
  const [tourMenuOpen, setTourMenuOpen] = useState(false)
  const tourMenuRef = useRef(null)
  const tourAutoStartedRef = useRef(false)
  const { start: startTour } = tour

  const startDashboardTour = useCallback(
    (sectionId = 'full') => {
      const raw = resolveDashboardTour(sectionId)
      const steps = filterTourStepsToDom(raw)
      if (!steps.length) return
      setTourMenuOpen(false)
      startTour(steps)
    },
    [startTour],
  )

  const tourMenuItems = useMemo(() => {
    const visibleIds = new Set(quickSections.map((s) => s.id))
    return DASHBOARD_TOUR_SECTION_META.filter((item) => {
      if (item.id === 'full') return true
      return visibleIds.has(item.id)
    })
  }, [quickSections])

  useEffect(() => {
    if (!tourMenuOpen) return undefined
    const onDoc = (e) => {
      if (tourMenuRef.current && !tourMenuRef.current.contains(e.target)) {
        setTourMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [tourMenuOpen])

  useEffect(() => {
    if (loading || loadingData || !isAuthenticated || !isEmployee) return undefined
    if (typeof window === 'undefined') return undefined
    if (tourAutoStartedRef.current) return undefined
    try {
      if (window.localStorage.getItem('sellniroo-dash-tour-seen')) return undefined
    } catch {
      return undefined
    }
    const timer = window.setTimeout(() => {
      if (tourAutoStartedRef.current) return
      tourAutoStartedRef.current = true
      startDashboardTour('full')
      try {
        window.localStorage.setItem('sellniroo-dash-tour-seen', '1')
      } catch {
        /* ignore */
      }
    }, 700)
    return () => window.clearTimeout(timer)
  }, [loading, loadingData, isAuthenticated, isEmployee, startDashboardTour])

  const visibleSectionChips = useMemo(() => {
    return (assignedSections || []).filter((d) => {
      const hrefPath = String(d.href || '').split('?')[0]
      if (
        !multiVendorOn &&
        (hrefPath === '/shops-manage' ||
          hrefPath === '/shops-accounting' ||
          hrefPath === '/shops-products' ||
          d.code === 'shops-manage' ||
          d.code === 'shops-accounting' ||
          d.code === 'shops-products' ||
          d.code === 'multi_vendor' ||
          d.code === 'multi-vendor')
      ) {
        return false
      }
      return isDashboardItemModuleActive(d.href, moduleMap, d.code)
    })
  }, [assignedSections, moduleMap, multiVendorOn])

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
        <div className={styles.dashboardHeader} data-tour="dash-header">
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
            <div className={styles.tourMenuWrap} ref={tourMenuRef}>
              <button
                type="button"
                className={styles.tourBtn}
                data-tour="dash-tour-btn"
                onClick={() => setTourMenuOpen((v) => !v)}
                aria-expanded={tourMenuOpen}
                aria-haspopup="menu"
              >
                <GraduationCap size={14} />
                {t.tourGuide}
                <ChevronDown size={13} className={tourMenuOpen ? styles.chevOpen : undefined} />
              </button>
              {tourMenuOpen ? (
                <div className={styles.tourMenu} role="menu" aria-label={t.tourMenuTitle}>
                  <p className={styles.tourMenuLabel}>{t.tourMenuTitle}</p>
                  {tourMenuItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="menuitem"
                      className={styles.tourMenuItem}
                      onClick={() => startDashboardTour(item.id)}
                    >
                      {item.id === 'full' ? (
                        <GraduationCap size={14} />
                      ) : (
                        <HelpCircle size={14} />
                      )}
                      <span>
                        {language === 'en' ? item.labelEn : item.labelFa}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              className={styles.refreshBtn}
              data-tour="dash-refresh"
              onClick={refreshAll}
              disabled={loadingData}
            >
              <RefreshCw size={14} className={loadingData ? styles.spinner : undefined} />
              {t.refresh}
            </button>
          </div>
        </div>

        {(employeeData || user) && (
          <div className={styles.userInfoBar} data-tour="dash-profile">
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

        <div className={styles.statsSection} data-tour="dash-stats">
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

        <div className={styles.quickActionsSection} data-tour="dash-quick">
          <div className={styles.blockHeader}>
            <h3 className={styles.sectionTitle}>
              <Zap size={18} />
              {t.quickAccess}
            </h3>
          </div>
          {quickSections.length > 0 ? (
            <div className={styles.actionSections}>
              {quickSections.map((section) => (
                <div
                  key={section.id}
                  className={styles.actionSection}
                  data-tour={`dash-section-${section.id}`}
                >
                  <div className={styles.actionSectionHead}>
                    <h4 className={styles.actionSectionTitle}>{section.label}</h4>
                    <button
                      type="button"
                      className={styles.sectionHelpBtn}
                      title={t.sectionHelp}
                      aria-label={t.sectionHelp}
                      onClick={() => startDashboardTour(section.id)}
                    >
                      <HelpCircle size={13} />
                      ?
                    </button>
                  </div>
                  <div className={styles.actionsGrid}>
                    {section.actions.map((action) => (
                      <Link
                        key={action.id}
                        href={action.href}
                        className={styles.actionCard}
                        data-tour={`dash-action-${action.id}`}
                      >
                        <div
                          className={styles.actionIcon}
                          style={{
                            background: action.bgColor,
                            color: action.color,
                          }}
                        >
                          {action.icon}
                        </div>
                        <span className={styles.actionLabel}>{action.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
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

      <GuidedTour
        open={tour.open}
        steps={tour.steps}
        stepIndex={tour.stepIndex}
        onStepChange={tour.setStepIndex}
        onClose={tour.close}
      />
    </div>
  )
}

export default Dashboard
