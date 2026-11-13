// modules/inventory/components/units/UnitTreeTable.jsx

'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Layers,
  Package,
  CheckCircle,
  Circle,
  GitBranch,
  Edit,
  Trash2,
  Eye,
  PlusCircle,
} from 'lucide-react';
import styles from './unit.module.css';

const UnitTreeTable = ({
  data = [],
  loading = false,
  onRowClick,
  onViewDetail,
  onEdit,
  onDelete,
  onAddSub,
  getProductCount,
  viewMode = 'tree',
  t = {},
}) => {
  const [expandedItems, setExpandedItems] = useState({});
  const [hoveredRow, setHoveredRow] = useState(null);

  // ============================================
  // Reset expanded state when data changes
  // ============================================
  useEffect(() => {
    const newExpanded = {};
    data.forEach(item => {
      newExpanded[item.id] = true;
    });
    setExpandedItems(newExpanded);
  }, [data]);

  // ============================================
  // Build Tree from flat data
  // ============================================
  const buildTree = useCallback((items) => {
    if (!items || items.length === 0) return [];

    // اگر داده‌ها از قبل ساختار درختی دارند
    if (items[0]?.children && Array.isArray(items[0].children)) {
      return items.map(item => ({
        ...item,
        children: item.children || [],
      }));
    }

    // ساخت درخت از داده‌های تخت
    const map = {};
    const roots = [];

    items.forEach(item => {
      map[item.id] = {
        ...item,
        children: [],
        _hasParent: false,
      };
    });

    items.forEach(item => {
      const node = map[item.id];
      if (!node) return;

      let parentId = item.parent;
      if (parentId && typeof parentId === 'object') {
        parentId = parentId.id;
      }
      if (parentId && typeof parentId === 'string') {
        parentId = parseInt(parentId);
      }

      if (parentId && map[parentId]) {
        map[parentId].children.push(node);
        node._hasParent = true;
      } else if (parentId && !map[parentId]) {
        node._hasParent = true;
        node._parentMissing = true;
        roots.push(node);
      } else {
        roots.push(node);
      }
    });

    if (roots.length === 0 && items.length > 0) {
      Object.values(map).forEach(item => {
        if (!item._hasParent) roots.push(item);
      });
      if (roots.length === 0) {
        Object.values(map).forEach(item => roots.push(item));
      }
    }

    roots.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    Object.values(map).forEach(item => {
      if (item.children && item.children.length > 0) {
        item.children.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      }
    });

    return roots;
  }, []);

  // ============================================
  // Flatten tree for display
  // ============================================
  const flattenTree = useCallback((items, level = 0) => {
    let rows = [];
    items.forEach(item => {
      const isExpanded = expandedItems[item.id] !== undefined ? expandedItems[item.id] : true;
      const row = { ...item, _level: level, _isExpanded: isExpanded };
      rows.push(row);

      const hasChildren = item.children && Array.isArray(item.children) && item.children.length > 0;
      if (hasChildren && isExpanded) {
        rows = rows.concat(flattenTree(item.children, level + 1));
      }
    });
    return rows;
  }, [expandedItems]);

  // ============================================
  // Display data based on viewMode
  // ============================================
  const displayData = useMemo(() => {
    if (!data || data.length === 0) return [];

    if (viewMode === 'flat' || viewMode === 'list') {
      return data.map((item, index) => ({
        ...item,
        _level: 0,
        _isExpanded: true,
        _index: index,
      }));
    }

    const tree = buildTree(data);
    return flattenTree(tree);
  }, [data, viewMode, buildTree, flattenTree]);

  // ============================================
  // Toggle Expand
  // ============================================
  const toggleExpand = useCallback((id, e) => {
    e?.stopPropagation();
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  // ============================================
  // Helper Functions
  // ============================================
  const getStatusLabel = useCallback(isActive => {
    if (isActive) {
      return {
        label: t.active || 'فعال',
        className: styles.activeBadge,
        icon: <CheckCircle size={12} />,
      };
    }
    return {
      label: t.inactive || 'غیرفعال',
      className: styles.inactiveBadge,
      icon: <Circle size={12} />,
    };
  }, [t]);

  const getLevelLabel = useCallback(level => {
    const labels = { 0: 'ریشه', 1: 'سطح ۱', 2: 'سطح ۲', 3: 'سطح ۳', 4: 'سطح ۴', 5: 'سطح ۵' };
    return labels[level] || `سطح ${level}`;
  }, []);

  const hasChildren = useCallback(item => {
    return item.children && Array.isArray(item.children) && item.children.length > 0;
  }, []);

  // ============================================
  // Render
  // ============================================

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.emptyState}>
          <p>هیچ واحدی یافت نشد</p>
          <button
            className={styles.primaryBtn}
            onClick={() => onAddSub?.({})}
            style={{ marginTop: '0.5rem' }}
          >
            <PlusCircle size={16} />
            اولین واحد را ایجاد کنید
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableWrapper}>
        <table className={styles.treeTable}>
          <thead>
            <tr>
              <th className={styles.colName}>عنوان</th>
              <th className={styles.colAbbr}>مخفف</th>
              <th className={styles.colCount}>تعداد در والد</th>
              <th className={styles.colLevel}>سطح</th>
              <th className={styles.colProducts}>کالاها</th>
              <th className={styles.colStatus}>وضعیت</th>
              <th className={styles.actionsHeader}>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {displayData.length === 0 ? (
              <tr>
                <td colSpan="7" className={styles.emptyCell}>
                  هیچ داده‌ای برای نمایش وجود ندارد
                </td>
              </tr>
            ) : (
              displayData.map((row, index) => {
                const status = getStatusLabel(row.is_active);
                const count = getProductCount?.(row.id) || 0;
                const hasChildrenFlag = hasChildren(row);
                const isExpanded = expandedItems[row.id] !== undefined ? expandedItems[row.id] : true;
                const level = row._level || 0;
                const isRoot = level === 0 && !row.parent;

                return (
                  <tr
                    key={`${row.id}-${index}`}
                    onClick={() => onRowClick?.(row)}
                    className={`${onRowClick ? styles.clickable : ''}`}
                    onMouseEnter={() => setHoveredRow(row.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      backgroundColor: isRoot ? 'rgba(128, 0, 32, 0.03)' : 'transparent',
                    }}
                  >
                    {/* عنوان */}
                    <td className={styles.colName}>
                      <div
                        className={styles.treeCell}
                        style={{ paddingRight: `${Math.min(level, 5) * 28}px` }}
                      >
                        {/* دکمه expand/collapse */}
                        {hasChildrenFlag && (
                          <button
                            onClick={e => toggleExpand(row.id, e)}
                            className={styles.toggleBtn}
                            title={isExpanded ? 'بستن' : 'باز کردن'}
                          >
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                        )}
                        {!hasChildrenFlag && <span className={styles.togglePlaceholder} />}

                        {level > 0 && (
                          <span className={styles.levelIndicator}>
                            {'— '.repeat(Math.min(level, 5))}
                          </span>
                        )}

                        {isRoot && (
                          <span className={styles.rootBadge} title="واحد ریشه">🌳</span>
                        )}

                        <div className={styles.unitNameCell}>
                          <div
                            className={styles.unitIconWrapper}
                            style={{
                              backgroundColor: isRoot ? 'rgba(128, 0, 32, 0.1)' : '#f8fafc',
                              borderColor: isRoot ? '#800020' : '#e5e7eb',
                            }}
                          >
                            {isRoot ? (
                              <GitBranch size={18} style={{ color: '#800020' }} />
                            ) : (
                              <Layers size={18} />
                            )}
                          </div>
                          <div className={styles.unitNameInfo}>
                            <span className={styles.unitName}>
                              {row.title}
                              {row.abbreviation && (
                                <span className={styles.unitAbbr}> ({row.abbreviation})</span>
                              )}
                            </span>
                            {row.description && (
                              <span className={styles.unitDescription}>
                                {row.description.length > 50
                                  ? row.description.slice(0, 50) + '...'
                                  : row.description}
                              </span>
                            )}
                            <div className={styles.unitMeta}>
                              {hasChildrenFlag && (
                                <span className={styles.childrenCount}>
                                  <GitBranch size={10} />
                                  {row.children.length} زیرمجموعه
                                </span>
                              )}
                              {row._parentMissing && (
                                <span className={styles.parentMissingBadge}>⚠️ والد غیرفعال</span>
                              )}
                              {isRoot && <span className={styles.rootLabel}>ریشه</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* مخفف */}
                    <td className={styles.colAbbr}>
                      <span className={styles.unitAbbr}>{row.abbreviation || '-'}</span>
                    </td>

                    {/* تعداد در والد */}
                    <td className={styles.colCount}>
                      {row.parent ? (
                        <span className={styles.countBadge}>
                          {row.count_in_parent || 1}
                          <span className={styles.countLabel}>عدد</span>
                        </span>
                      ) : (
                        <span className={styles.countRoot}>—</span>
                      )}
                    </td>

                    {/* سطح */}
                    <td className={styles.colLevel}>
                      <span
                        className={styles.levelBadge}
                        style={{
                          backgroundColor: isRoot ? 'rgba(128, 0, 32, 0.1)' : '#e3f2fd',
                          color: isRoot ? '#800020' : '#1976d2',
                        }}
                      >
                        {getLevelLabel(level)}
                      </span>
                    </td>

                    {/* تعداد کالاها */}
                    <td className={styles.colProducts}>
                      <span className={`${styles.productCount} ${count > 0 ? styles.hasProducts : styles.noProducts}`}>
                        <Package size={14} />
                        {count}
                      </span>
                    </td>

                    {/* وضعیت */}
                    <td className={styles.colStatus}>
                      <span className={`${styles.statusBadge} ${status.className}`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </td>

                    {/* عملیات */}
                    <td className={styles.actionsCell}>
                      <button
                        onClick={e => { e.stopPropagation(); onAddSub?.(row); }}
                        className={styles.actionBtn}
                        title={t.addSub || 'افزودن زیرمجموعه'}
                        style={{ color: '#2d4a3e' }}
                      >
                        <PlusCircle size={16} />
                      </button>

                      <button
                        onClick={e => { e.stopPropagation(); onViewDetail?.(row); }}
                        className={styles.actionBtn}
                        title={t.viewDetail || 'مشاهده'}
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={e => { e.stopPropagation(); onEdit?.(row); }}
                        className={styles.actionBtn}
                        title={t.edit || 'ویرایش'}
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (count > 0) {
                            alert(`⚠️ این واحد در ${count} کالا استفاده شده است.`);
                            return;
                          }
                          if (hasChildrenFlag) {
                            alert('⚠️ این واحد دارای زیرمجموعه است.');
                            return;
                          }
                          onDelete?.(row);
                        }}
                        className={styles.actionBtn}
                        title={t.delete || 'حذف'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className={styles.tableFooter}>
          <span className={styles.tableCount}>
            نمایش {displayData.length} از {data.length} واحد
          </span>
        </div>
      </div>
    </div>
  );
};

export default UnitTreeTable;