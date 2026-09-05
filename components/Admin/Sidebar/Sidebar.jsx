// src/components/Admin/Sidebar/Sidebar.jsx
'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Settings,
  FolderTree,
  MapPin,
  Users,
  Newspaper,
  Info,
  Phone,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  Sparkles
} from 'lucide-react'
import styles from './Sidebar.module.css'

const menuItems = [
  { path: '/admin', label: 'داشبورد', icon: LayoutDashboard },
  { path: '/admin/settings', label: 'تنظیمات کلی', icon: Settings },
  { path: '/admin/categories', label: 'دسته بندی‌ها', icon: FolderTree },
  { path: '/admin/cities', label: 'شهرها', icon: MapPin },
  { path: '/admin/users', label: 'کاربران', icon: Users },
  { path: '/admin/advertisements', label: 'آگهی نامه', icon: Newspaper },
  { path: '/admin/about', label: 'درباره ما', icon: Info },
  { path: '/admin/contact', label: 'تماس با ما', icon: Phone },
]

const Sidebar = ({ collapsed, onToggle }) => {
  const pathname = usePathname()

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* لوگو */}
      <div className={styles.sidebarBrand}>
        <div className={styles.brandIcon}>
          <Shield size={28} className={styles.brandShield} />
          <Sparkles size={12} className={styles.brandSparkle} />
        </div>
        {!collapsed && (
          <div className={styles.brandText}>
            <span className={styles.brandName}>آریا استاد</span>
            <span className={styles.brandSub}>پنل مدیریت</span>
          </div>
        )}
      </div>

      {/* دکمه جمع کردن */}
      <button className={styles.collapseBtn} onClick={onToggle}>
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* منو */}
      <nav className={styles.sidebarNav}>
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path || pathname?.startsWith(`${item.path}/`)
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              title={collapsed ? item.label : ''}
            >
              <Icon size={20} className={styles.navIcon} />
              {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
              {isActive && !collapsed && <span className={styles.activeIndicator} />}
            </Link>
          )
        })}
      </nav>

      {/* خروج */}
      <div className={styles.sidebarFooter}>
        <button className={styles.logoutBtn}>
          <LogOut size={20} />
          {!collapsed && <span>خروج</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar