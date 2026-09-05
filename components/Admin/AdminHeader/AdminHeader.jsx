// src/components/Admin/AdminHeader/AdminHeader.jsx
'use client'

import React, { useState } from 'react'
import {
  Bell,
  Search,
  User,
  ChevronDown,
  Moon,
  Sun,
  Settings,
  LogOut, 
  Menu
} from 'lucide-react'
import styles from './AdminHeader.module.css'

const AdminHeader = () => {
  const [isDark, setIsDark] = useState(false)
  const [notifications] = useState([
    { id: 1, title: 'آگهی جدید ثبت شد', time: '۵ دقیقه پیش' },
    { id: 2, title: 'کاربر جدید ثبت نام کرد', time: '۲ ساعت پیش' },
  ])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  return (
    <header className={styles.adminHeader}>
      <div className={styles.headerLeft}>
        <button className={styles.menuBtn} aria-label="باز کردن منو">
          <Menu size={20} />
        </button>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="جستجو در پنل..." 
            className={styles.searchInput}
          />
          <kbd className={styles.searchShortcut}>⌘K</kbd>
        </div>
      </div>

      <div className={styles.headerRight}>
        <button 
          className={styles.themeToggle}
          onClick={() => setIsDark(!isDark)}
          aria-label="تغییر تم"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className={styles.notificationWrapper}>
          <button 
            className={styles.notificationBtn}
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="اعلان‌ها"
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className={styles.notificationBadge}>
                {notifications.length}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className={styles.notificationDropdown}>
              <div className={styles.dropdownHeader}>
                <span>اعلان‌ها</span>
                <button className={styles.dropdownMarkAll}>خواندن همه</button>
              </div>
              {notifications.map((notif) => (
                <div key={notif.id} className={styles.notificationItem}>
                  <span className={styles.notificationTitle}>{notif.title}</span>
                  <span className={styles.notificationTime}>{notif.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.profileWrapper}>
          <button 
            className={styles.profileBtn}
            onClick={() => setShowProfile(!showProfile)}
          >
            <div className={styles.avatar}>
              <User size={18} />
            </div>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>مدیر سیستم</span>
              <span className={styles.profileRole}>ادمین</span>
            </div>
            <ChevronDown size={16} className={styles.profileArrow} />
          </button>

          {showProfile && (
            <div className={styles.profileDropdown}>
              <div className={styles.dropdownItem}>
                <User size={16} />
                <span>پروفایل</span>
              </div>
              <div className={styles.dropdownItem}>
                <Settings size={16} />
                <span>تنظیمات</span>
              </div>
              <div className={styles.dropdownDivider} />
              <div className={`${styles.dropdownItem} ${styles.danger}`}>
                <LogOut size={16} />
                <span>خروج</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default AdminHeader