// src/components/Admin/DataTable/DataTable.jsx
'use client'

import React from 'react'
import { MoreVertical, Eye, Edit, Trash2 } from 'lucide-react'
import styles from './DataTable.module.css'

const DataTable = ({ data, columns, onEdit, onDelete, onView }) => {
  const getStatusClass = (status) => {
    if (status === 'فعال') return styles.statusActive
    if (status === 'در انتظار') return styles.statusPending
    return styles.statusInactive
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={styles.th}>
                {col.label}
              </th>
            ))}
            <th className={styles.thActions}>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className={styles.tr}>
              {columns.map((col) => (
                <td key={col.key} className={styles.td}>
                  {col.key === 'status' ? (
                    <span className={`${styles.statusBadge} ${getStatusClass(item[col.key])}`}>
                      {item[col.key]}
                    </span>
                  ) : (
                    item[col.key]
                  )}
                </td>
              ))}
              <td className={styles.tdActions}>
                <div className={styles.actionsDropdown}>
                  <button className={styles.actionBtn} onClick={() => onView?.(item)}>
                    <Eye size={16} />
                  </button>
                  <button className={styles.actionBtn} onClick={() => onEdit?.(item)}>
                    <Edit size={16} />
                  </button>
                  <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => onDelete?.(item)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable