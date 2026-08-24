// modules/inventory/components/Units/UnitTreeTable.jsx

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronLeft, Layers, Package, CheckCircle, Circle, GitBranch, Edit, Trash2, Eye } from 'lucide-react';
import styles from '@/styles/modules/InventoryCommon.module.css';

const UnitTreeTable = ({
  data = [],
  loading = false,
  onRowClick,
  onViewDetail,
  onEdit,
  onDelete,
  getProductCount,
  t = {
    active: 'فعال',
    inactive: 'غیرفعال',
    viewDetail: 'مشاهده جزئیات',
    edit: 'ویرایش',
    delete: 'حذف',
  },
}) => {
  // ============================================
  // State
  // ============================================
  const [expandedItems, setExpandedItems] = useState({});

  // ============================================
  // Reset expanded state when data changes
  // ============================================
  useEffect(() => {
    // وقتی داده‌ها عوض می‌شوند، همه را باز کن
    const newExpanded = {};
    data.forEach(item => {
      newExpanded[item.id] = true;
    });
    setExpandedItems(newExpanded);
    console.log('🔄 Expanded items reset for', data.length, 'items');
  }, [data]);

  // ============================================
  // ساختار درختی از داده‌ها - نسخه بهبود یافته
  // ============================================
  const buildTree = (items) => {
    if (!items || items.length === 0) return [];
    
    console.log('🏗️ Building tree from items:', items.length);
    console.log('🔍 First item:', items[0]);
    
    // اگر آیتم‌ها از قبل ساختار درختی دارند (با children)
    // و اولین آیتم دارای children است
    if (items[0]?.children && items[0].children.length > 0) {
      console.log('📂 Items already have children structure');
      
      // تابع بازگشتی برای پردازش درخت
      const processTree = (node) => {
        if (!node) return null;
        const processed = { ...node };
        if (node.children && node.children.length > 0) {
          processed.children = node.children.map(child => processTree(child));
        }
        return processed;
      };
      
      // پردازش تمام آیتم‌ها
      const processedItems = items.map(item => processTree(item));
      console.log('🌳 Processed tree roots:', processedItems.length);
      return processedItems;
    }
    
    // در غیر این صورت، از parent برای ساخت درخت استفاده کن
    console.log('🔗 Building tree using parent references');
    
    const map = {};
    const roots = [];

    // ایجاد map از تمام آیتم‌ها
    items.forEach(item => {
      map[item.id] = { ...item, children: [] };
    });

    // ساخت درخت
    items.forEach(item => {
      let parentId = item.parent;
      
      // اگر parent به صورت object است، id آن را بگیر
      if (parentId && typeof parentId === 'object') {
        parentId = parentId.id;
      }
      
      // اگر parentId معتبر است و در map وجود دارد
      if (parentId && map[parentId]) {
        map[parentId].children.push(map[item.id]);
      } else {
        // در غیر این صورت ریشه است
        roots.push(map[item.id]);
      }
    });

    // مرتب‌سازی ریشه‌ها بر اساس عنوان
    roots.sort((a, b) => a.title.localeCompare(b.title));
    
    // مرتب‌سازی فرزندان هر آیتم
    Object.values(map).forEach(item => {
      if (item.children && item.children.length > 0) {
        item.children.sort((a, b) => a.title.localeCompare(b.title));
      }
    });

    console.log('🌳 Roots found:', roots.length);
    console.log('🔍 First root:', roots[0]?.title);
    console.log('🔍 Root children count:', roots[0]?.children?.length);
    
    return roots;
  };

  // ============================================
  // تبدیل درخت به لیست تخت با سطح تو رفتگی
  // ============================================
  const flattenTree = (items, level = 0) => {
    let rows = [];
    items.forEach(item => {
      const isExpanded = expandedItems[item.id] !== undefined ? expandedItems[item.id] : true;
      const row = { ...item, _level: level, _isExpanded: isExpanded };
      rows.push(row);
      
      // بررسی وجود children با چندین روش
      const hasChildren = item.children && 
                         Array.isArray(item.children) && 
                         item.children.length > 0;
      
      if (hasChildren && isExpanded) {
        rows = rows.concat(flattenTree(item.children, level + 1));
      }
    });
    return rows;
  };

  // ============================================
  // محاسبه داده‌های درختی با useMemo
  // ============================================
  const flatData = useMemo(() => {
    console.log('📊 Computing flatData with data length:', data.length);
    const tree = buildTree(data);
    console.log('🌳 Tree built with', tree.length, 'roots');
    const flat = flattenTree(tree);
    console.log('📊 Flat data length:', flat.length);
    if (flat.length > 0) {
      console.log('🔍 First flat item:', flat[0]?.title, 'level:', flat[0]?._level);
    }
    return flat;
  }, [data, expandedItems]);

  // ============================================
  // Toggle Expand
  // ============================================
  const toggleExpand = (id, e) => {
    e?.stopPropagation();
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // ============================================
  // Helper Functions
  // ============================================
  const getStatusLabel = (isActive) => {
    if (isActive) {
      return { 
        label: t.active || 'فعال', 
        className: styles.activeBadge, 
        icon: <CheckCircle size={12} /> 
      };
    }
    return { 
      label: t.inactive || 'غیرفعال', 
      className: styles.inactiveBadge, 
      icon: <Circle size={12} /> 
    };
  };

  const getLevelLabel = (level) => {
    const labels = {
      0: 'ریشه',
      1: 'سطح ۱',
      2: 'سطح ۲',
      3: 'سطح ۳',
      4: 'سطح ۴',
      5: 'سطح ۵',
    };
    return labels[level] || `سطح ${level}`;
  };

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
              <th className={styles.colLevel}>سطح</th>
              <th className={styles.colProducts}>کالاها</th>
              <th className={styles.colStatus}>وضعیت</th>
              <th className={styles.actionsHeader}>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {flatData.length === 0 ? (
              <tr>
                <td colSpan="6" className={styles.emptyCell}>
                  هیچ داده‌ای برای نمایش وجود ندارد
                </td>
              </tr>
            ) : (
              flatData.map((row) => {
                const status = getStatusLabel(row.is_active);
                const count = getProductCount?.(row.id) || 0;
                
                // بررسی وجود children با چندین روش
                const hasChildren = row.children && 
                                   Array.isArray(row.children) && 
                                   row.children.length > 0;
                
                const isExpanded = expandedItems[row.id] !== undefined ? expandedItems[row.id] : true;
                const level = row._level || 0;

                return (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row)}
                    className={onRowClick ? styles.clickable : ''}
                  >
                    {/* ===== ستون عنوان با تو رفتگی ===== */}
                    <td className={styles.colName}>
                      <div
                        className={styles.treeCell}
                        style={{ paddingRight: `${level * 28}px` }}
                      >
                        {hasChildren && (
                          <button
                            onClick={(e) => toggleExpand(row.id, e)}
                            className={styles.toggleBtn}
                          >
                            {isExpanded ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronLeft size={16} />
                            )}
                          </button>
                        )}
                        {!hasChildren && <span className={styles.togglePlaceholder} />}
                        
                        <div className={styles.unitNameCell}>
                          <div className={styles.unitIconWrapper}>
                            {level === 0 ? (
                              <GitBranch size={18} className={styles.unitIcon} style={{ color: '#e65100' }} />
                            ) : (
                              <Layers size={18} className={styles.unitIcon} />
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
                              <span className={styles.unitDescription}>{row.description}</span>
                            )}
                            {hasChildren && (
                              <span className={styles.childrenCount}>
                                {row.children.length} زیرمجموعه
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* ===== مخفف ===== */}
                    <td className={styles.colAbbr}>
                      <span className={styles.unitAbbr}>
                        {row.abbreviation || '-'}
                      </span>
                    </td>

                    {/* ===== سطح ===== */}
                    <td className={styles.colLevel}>
                      <span className={styles.levelBadge}>
                        {getLevelLabel(level)}
                      </span>
                    </td>

                    {/* ===== تعداد کالاها ===== */}
                    <td className={styles.colProducts}>
                      <span className={`${styles.productCount} ${count > 0 ? styles.hasProducts : styles.noProducts}`}>
                        <Package size={14} />
                        {count}
                      </span>
                    </td>

                    {/* ===== وضعیت ===== */}
                    <td className={styles.colStatus}>
                      <span className={`${styles.statusBadge} ${status.className}`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </td>

                    {/* ===== عملیات ===== */}
                    <td className={styles.actionsCell}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetail?.(row);
                        }}
                        className={styles.actionBtn}
                        title={t.viewDetail || 'مشاهده'}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit?.(row);
                        }}
                        className={styles.actionBtn}
                        title={t.edit || 'ویرایش'}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (count > 0) {
                            alert(`⚠️ این واحد در ${count} کالا استفاده شده است. ابتدا کالاهای مرتبط را تغییر دهید.`);
                            return;
                          }
                          if (hasChildren) {
                            alert('⚠️ این واحد دارای زیرمجموعه است. ابتدا زیرمجموعه‌ها را حذف یا انتقال دهید.');
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
      </div>
    </div>
  );
};

export default UnitTreeTable;