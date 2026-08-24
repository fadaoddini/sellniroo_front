// modules/inventory/components/common/DataTable.jsx
'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import styles from '@/styles/modules/InventoryCommon.module.css';

const DataTable = ({
  columns,
  data,
  loading = false,
  onRowClick,
  actions,
  pagination,
  onPageChange,
  searchable = true,
  onSearch,
  searchPlaceholder = 'جستجو...',
  emptyMessage = 'هیچ داده‌ای یافت نشد',
  className = '',
}) => {
  const handlePageChange = (newPage) => {
    if (onPageChange && newPage !== pagination?.page) {
      onPageChange(newPage);
    }
  };

  return (
    <div className={`${styles.tableContainer} ${className}`}>
      {searchable && (
        <div className={styles.tableSearch}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch?.(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={col.className}>
                  {col.header}
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className={styles.actionsHeader}>عملیات</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions && actions.length > 0 ? 1 : 0)} className={styles.loadingCell}>
                  <div className={styles.spinner}></div>
                </td>
              </tr>
            ) : data?.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions && actions.length > 0 ? 1 : 0)} className={styles.emptyCell}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={onRowClick ? styles.clickable : ''}
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={col.cellClassName}>
                      {col.accessor ? row[col.accessor] : col.render?.(row)}
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className={styles.actionsCell}>
                      {actions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(row);
                          }}
                          className={styles.actionBtn}
                          title={action.label}
                          disabled={action.disabled?.(row)}
                        >
                          {action.icon}
                        </button>
                      ))}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            صفحه {pagination.page} از {Math.ceil(pagination.total / pagination.pageSize) || 1}
            {' ('}
            {pagination.total}
            {' مورد)'}
          </span>
          <div className={styles.paginationButtons}>
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className={styles.pageBtn}
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              className={styles.pageBtn}
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;