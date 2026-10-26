// app/(admin)/adminmodule — مدیریت ماژول‌های سایت
'use client'

import React, { useCallback, useState } from 'react'
import OwnerPortalShell from '@/components/Admin/OwnerPortalShell'
import useOwnerGate from '@/components/Admin/useOwnerGate'
import AdminWebModules from '../adminweb/AdminWebModules'
import styles from '../adminweb/AdminWeb.module.css'

export default function AdminModulePage() {
  const gate = useOwnerGate('/adminmodule')
  const [moduleStats, setModuleStats] = useState({
    total: 0,
    active: 0,
    groups: 0,
  })
  const [selectedModuleKey, setSelectedModuleKey] = useState(null)

  const onStatsChange = useCallback((s) => {
    if (s && typeof s === 'object') setModuleStats(s)
  }, [])

  return (
    <OwnerPortalShell
      brand="module"
      brandAccent="admin"
      tagline="روشن و خاموش کردن ماژول‌های پلتفرم"
      wide
      {...gate}
    >
      <div className={styles.statsStrip}>
        <div className={`${styles.statCard} ${styles.statOk}`}>
          <span className={styles.statValue}>{moduleStats.active}</span>
          <span className={styles.statLabel}>ماژول فعال</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{moduleStats.total}</span>
          <span className={styles.statLabel}>کل ماژول‌ها</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{moduleStats.groups}</span>
          <span className={styles.statLabel}>مجموعهٔ گروهی</span>
        </div>
      </div>

      {gate.allowed ? (
        <AdminWebModules
          onStatsChange={onStatsChange}
          selectedKey={selectedModuleKey}
          onSelect={setSelectedModuleKey}
        />
      ) : null}
    </OwnerPortalShell>
  )
}
