// src/components/AllBoxItem/components/ViewToggle/ViewToggle.jsx

'use client'

import React from 'react'
import { LayoutGrid, Columns3, List, LayoutPanelLeft } from 'lucide-react'
import styles from './ViewToggle.module.css'

const ViewToggle = ({ viewMode, onViewChange }) => {
  const views = [
    { id: 'grid-2', icon: LayoutGrid, label: 'نمایش دو ستونه' },
    { id: 'grid-3', icon: Columns3, label: 'نمایش سه ستونه' },
    { id: 'image-left', icon: LayoutPanelLeft, label: 'نمایش تصویر-چپ' },
    { id: 'list', icon: List, label: 'نمایش لیستی' }
  ]

  return (
    <div className={styles.viewToggle} role="group" aria-label="تغییر نحوه نمایش">
      {views.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          className={`${styles.viewBtn} ${viewMode === id ? styles.active : ''}`}
          onClick={() => onViewChange(id)}
          aria-label={label}
          title={label}
        >
          <Icon size={18} />
        </button>
      ))}
    </div>
  )
}

export default ViewToggle