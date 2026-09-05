// src/app/admin/settings/page.jsx
'use client'

import React, { useState } from 'react'
import AdminForm, { FormGroup, FormRow } from '@/components/Admin/AdminForm/AdminForm'
import styles from './page.module.css'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'آریا استاد',
    siteDescription: 'بزرگترین تولیدکننده سازه‌های سبک فولادی',
    adminEmail: 'admin@ariastudholding.com',
    phone: '۰۲۱-۱۲۳۴۵۶۷۸',
    address: 'تهران، خیابان آزادی',
    workingHours: '۸:۰۰ - ۱۷:۰۰',
    maintenanceMode: false,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('ذخیره تنظیمات:', settings)
    // در اینجا با API ارتباط برقرار می‌شود
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>تنظیمات کلی</h1>
        <p className={styles.pageDesc}>مدیریت تنظیمات عمومی سامانه</p>
      </div>

      <div className={styles.content}>
        <AdminForm onSubmit={handleSubmit} onCancel={() => {}}>
          <FormRow>
            <FormGroup label="نام سایت" required>
              <input 
                type="text" 
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                placeholder="نام سایت را وارد کنید"
              />
            </FormGroup>
            <FormGroup label="ایمیل مدیریت" required>
              <input 
                type="email" 
                value={settings.adminEmail}
                onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
                placeholder="ایمیل را وارد کنید"
              />
            </FormGroup>
          </FormRow>

          <FormGroup label="توضیحات سایت">
            <textarea 
              value={settings.siteDescription}
              onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
              placeholder="توضیحات سایت را وارد کنید"
              rows={3}
            />
          </FormGroup>

          <FormRow>
            <FormGroup label="شماره تماس">
              <input 
                type="text" 
                value={settings.phone}
                onChange={(e) => setSettings({...settings, phone: e.target.value})}
                placeholder="شماره تماس را وارد کنید"
              />
            </FormGroup>
            <FormGroup label="ساعت کاری">
              <input 
                type="text" 
                value={settings.workingHours}
                onChange={(e) => setSettings({...settings, workingHours: e.target.value})}
                placeholder="ساعت کاری را وارد کنید"
              />
            </FormGroup>
          </FormRow>

          <FormGroup label="آدرس">
            <input 
              type="text" 
              value={settings.address}
              onChange={(e) => setSettings({...settings, address: e.target.value})}
              placeholder="آدرس را وارد کنید"
            />
          </FormGroup>

          <FormGroup label="حالت نگهداری">
            <div className={styles.toggleWrapper}>
              <label className={styles.toggle}>
                <input 
                  type="checkbox" 
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                />
                <span className={styles.toggleSlider} />
                <span className={styles.toggleLabel}>
                  {settings.maintenanceMode ? 'فعال' : 'غیرفعال'}
                </span>
              </label>
            </div>
          </FormGroup>
        </AdminForm>
      </div>
    </div>
  )
}