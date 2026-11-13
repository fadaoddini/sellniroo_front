// modules/inventory/components/units/UnitList.jsx

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInventory } from '@/modules/inventory/context/InventoryContext';

import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import UnitSimpleForm from './UnitSimpleForm';
import UnitSubForm from './UnitSubForm';
import UnitTreeTable from './UnitTreeTable';
import { 
  Plus, Edit, Trash2, Ruler, Package, Search, X, RefreshCw,
  Filter, Layers, CheckCircle, Circle, Building2,
  Users, AlertTriangle, Box, Home, GitBranch, Eye, PlusCircle,
  ArrowDownToLine, ArrowUpFromLine,
} from 'lucide-react';
import styles from './unit.module.css';

const UnitList = () => {
  const { language } = useLanguage();
  const {
    state,
    loadUnits,
    loadUnitTree,
    loadUnitRoots,
    deleteUnit,
    createUnit,
    updateUnit,
    loadProducts,
  } = useInventory();

  // ============================================
  // State Management
  // ============================================
  const [showRootForm, setShowRootForm] = useState(false);      // فرم ریشه
  const [showSubForm, setShowSubForm] = useState(false);        // فرم زیرمجموعه
  const [editingItem, setEditingItem] = useState(null);         // آیتم در حال ویرایش
  const [parentForSub, setParentForSub] = useState(null);       // والد برای ایجاد زیرمجموعه
  const [deletingItem, setDeletingItem] = useState(null);       // آیتم در حال حذف
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showUnitDetail, setShowUnitDetail] = useState(false);
  const [viewMode, setViewMode] = useState('tree');
  const [unitData, setUnitData] = useState([]);
  const [stats, setStats] = useState({
    total: 0, active: 0, inactive: 0, roots: 0, withProducts: 0,
  });

  const initialLoadDone = useRef(false);
  const fetchInProgress = useRef(false);

  // ============================================
  // Translations
  // ============================================
  const t = useMemo(() => ({
    title: language === 'fa' ? 'مدیریت واحدها' : 'Units Management',
    subtitle: language === 'fa' ? 'مدیریت واحدهای اندازه‌گیری (سلسله‌مراتبی)' : 'Manage measurement units (Hierarchical)',
    refresh: language === 'fa' ? 'بروزرسانی' : 'Refresh',
    dashboard: language === 'fa' ? 'داشبورد اصلی' : 'Dashboard',
    manageWarehouses: language === 'fa' ? 'مدیریت انبارها' : 'Manage Warehouses',
    manageProducts: language === 'fa' ? 'مدیریت کالاها' : 'Manage Products',
    stockIn: language === 'fa' ? 'ورود کالا' : 'Stock In',
    stockOut: language === 'fa' ? 'خروج کالا' : 'Stock Out',
    managePersons: language === 'fa' ? 'افراد مجاز' : 'Authorized Persons',
    manageAlerts: language === 'fa' ? 'هشدارها' : 'Alerts',
    units: language === 'fa' ? 'واحدها' : 'Units',
    newRootUnit: language === 'fa' ? 'واحد ریشه جدید' : 'New Root Unit',
    addSub: language === 'fa' ? 'افزودن زیرمجموعه' : 'Add Sub-unit',
    editUnit: language === 'fa' ? 'ویرایش واحد' : 'Edit Unit',
    totalUnits: language === 'fa' ? 'کل واحدها' : 'Total Units',
    active: language === 'fa' ? 'فعال' : 'Active',
    inactive: language === 'fa' ? 'غیرفعال' : 'Inactive',
    withProducts: language === 'fa' ? 'دارای کالا' : 'With Products',
    viewDetail: language === 'fa' ? 'مشاهده جزئیات' : 'View Details',
    edit: language === 'fa' ? 'ویرایش' : 'Edit',
    delete: language === 'fa' ? 'حذف' : 'Delete',
    root: language === 'fa' ? 'ریشه' : 'Root',
  }), [language]);

  // ============================================
  // Fetch Units
  // ============================================
  const fetchUnits = useCallback(async (forceRefresh = false) => {
    if (fetchInProgress.current && !forceRefresh) return;
    fetchInProgress.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      const trimmedSearch = searchTerm?.trim() || '';
      let unitsData;
      const opts = { force: !!forceRefresh };
      
      if (viewMode === 'tree' && !trimmedSearch && !filterStatus) {
        unitsData = await loadUnitTree(opts);
      } else {
        const params = {};
        if (trimmedSearch.length >= 3) {
          params.search = trimmedSearch;
        }
        if (filterStatus === 'active') params.is_active = true;
        if (filterStatus === 'inactive') params.is_active = false;
        unitsData = await loadUnits(params, opts);
      }

      let units = [];
      if (Array.isArray(unitsData)) units = unitsData;
      else if (unitsData?.results) units = unitsData.results;
      else if (Array.isArray(unitsData?.data)) units = unitsData.data;

      setUnitData(units);

      const flattenUnits = (list, acc = []) => {
        for (const u of list || []) {
          acc.push(u)
          if (Array.isArray(u.children) && u.children.length) {
            flattenUnits(u.children, acc)
          }
        }
        return acc
      }
      const flat = flattenUnits(units)
      
      const products = state.products || [];
      const withProducts = flat.filter(u => 
        products.some(p => p.root_unit === u.id)
      ).length;
      const roots = flat.filter(u => !u.parent).length;
      
      setStats({
        total: flat.length,
        active: flat.filter(u => u.is_active !== false).length,
        inactive: flat.filter(u => u.is_active === false).length,
        roots,
        withProducts,
      });
    } catch (err) {
      console.error('Error loading units:', err);
      setError(err.message || 'خطا در بارگذاری واحدها');
      // روی خطا لیست قبلی را پاک نکن تا صفحه خالی نشود
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, [searchTerm, filterStatus, viewMode, loadUnits, loadUnitTree, state.products]);

  const fetchUnitsRef = useRef(fetchUnits);
  fetchUnitsRef.current = fetchUnits;

  // ============================================
  // Effects
  // ============================================
  useEffect(() => {
    let cancelled = false;
    ;(async () => {
      try {
        await Promise.allSettled([loadProducts(), loadUnitRoots()]);
        if (!cancelled) {
          initialLoadDone.current = true;
          await fetchUnitsRef.current(true);
        }
      } catch (_) {
        if (!cancelled) initialLoadDone.current = true;
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!initialLoadDone.current) return undefined;
    const timer = setTimeout(() => {
      const trimmed = searchTerm?.trim() || '';
      if (trimmed.length === 0 || trimmed.length >= 3) {
        fetchUnitsRef.current(true);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filterStatus, viewMode]);

  // ============================================
  // Handlers - CRUD Operations
  // ============================================
  
  // ✅ ایجاد واحد جدید (ریشه یا زیرمجموعه)
  const handleSubmit = useCallback(async (data) => {
    try {
      // آماده‌سازی داده برای بک‌اند
      const submitData = {
        title: data.title.trim(),
        abbreviation: data.abbreviation.trim().toLowerCase(),
        description: data.description?.trim() || '',
        parent: data.parent ? parseInt(data.parent) : null,
        is_active: data.is_active === true || data.is_active === 'true',
        count_in_parent: data.count_in_parent ? parseInt(data.count_in_parent) : 1,
      };

      console.log('📤 Submitting unit data:', submitData);

      let result;
      if (editingItem) {
        // ✅ ویرایش
        result = await updateUnit(editingItem.id, submitData);
        console.log('✅ Unit updated:', result);
      } else {
        // ✅ ایجاد جدید
        result = await createUnit(submitData);
        console.log('✅ Unit created:', result);
      }

      // بستن مودال‌ها
      setShowRootForm(false);
      setShowSubForm(false);
      setEditingItem(null);
      setParentForSub(null);
      
      // بارگذاری مجدد داده‌ها
      await fetchUnits(true);
      
    } catch (err) {
      console.error('Error submitting unit:', err);
      // نمایش خطای دقیق از بک‌اند
      if (err.response?.data) {
        const errorMessages = Object.values(err.response.data).flat().join(' ');
        setError(errorMessages || err.message || 'خطا در ذخیره واحد');
      } else {
        setError(err.message || 'خطا در ذخیره واحد');
      }
    }
  }, [editingItem, createUnit, updateUnit, fetchUnits]);

  // ✅ حذف واحد
  const handleDelete = useCallback(async () => {
    if (!deletingItem) return;
    try {
      await deleteUnit(deletingItem.id);
      setDeletingItem(null);
      await fetchUnits(true);
    } catch (err) {
      setError(err.message || 'خطا در حذف واحد');
    }
  }, [deletingItem, deleteUnit, fetchUnits]);

  // ✅ باز کردن فرم ایجاد ریشه جدید
  const handleAddRoot = useCallback(() => {
    setEditingItem(null);
    setParentForSub(null);
    setShowRootForm(true);
    setShowSubForm(false);
  }, []);

  // ✅ باز کردن فرم ایجاد زیرمجموعه
const handleAddSub = useCallback((row) => {
  console.log('➕ handleAddSub called with row:', row);
  
  if (!row || !row.id) {
    // اگر row نداشت، ایجاد ریشه
    handleAddRoot();
    return;
  }
  
  // ✅ مهم: parentForSub رو برابر خود row قرار بده
  setParentForSub(row);
  setEditingItem(null);
  setShowSubForm(true);
  setShowRootForm(false);
  
  console.log('✅ parentForSub set to:', row.title, 'with id:', row.id);
}, []);

  // ✅ باز کردن فرم ویرایش
  const handleEdit = useCallback((row) => {
    console.log('✏️ Edit unit:', row);
    if (!row) return;
    
    setEditingItem(row);
    
    // تشخیص ریشه یا زیرمجموعه
    const isRoot = !row.parent || row.parent === null || row.parent === 'null';
    
    if (isRoot) {
      // ✅ ویرایش ریشه
      setShowRootForm(true);
      setShowSubForm(false);
      setParentForSub(null);
    } else {
      // ✅ ویرایش زیرمجموعه
      setShowSubForm(true);
      setShowRootForm(false);
      setParentForSub(null);
    }
  }, []);

  // ✅ مشاهده جزئیات
  const handleViewDetail = useCallback((row) => {
    setSelectedUnit(row);
    setShowUnitDetail(true);
  }, []);

  // ✅ تغییر حالت نمایش
  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'tree' ? 'flat' : 'tree');
  }, []);

  const handleRefresh = useCallback(() => fetchUnits(true), [fetchUnits]);

  // ✅ تعداد کالاهای مرتبط با واحد
  const getProductCount = useCallback((unitId) => {
    return state.products?.filter(p => p.root_unit === unitId).length || 0;
  }, [state.products]);

  const getLevelLabel = useCallback((level) => {
    const labels = {
      0: 'ریشه',
      1: 'سطح ۱',
      2: 'سطح ۲',
      3: 'سطح ۳',
      4: 'سطح ۴',
      5: 'سطح ۵',
    };
    return labels[level] || `سطح ${level}`;
  }, []);

  const isLoading_state = state.loading.units || isLoading;

  // ============================================
  // Render
  // ============================================
  return (
    <div className={styles.inventoryContainer}>
      <div className={styles.container}>
        
         {/* ===== Navigation Bar ===== */}
        {/* ===== Header ===== */}
        <div className={styles.inventoryHeader}>
          <div>
            <h1 className={styles.pageTitle}>
              <Ruler className={styles.titleIcon} size={28} />
              {t.title}
            </h1>
            <p className={styles.pageDesc}>{t.subtitle}</p>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.refreshBtn}
              onClick={handleRefresh}
              disabled={isLoading_state}
            >
              <RefreshCw size={18} className={isLoading_state ? styles.spinning : ''} />
              <span>{t.refresh}</span>
            </button>
            <button
              className={styles.secondaryBtn}
              onClick={toggleViewMode}
              disabled={isLoading_state}
            >
              {viewMode === 'tree' ? '📋 لیست' : '🌳 درخت'}
            </button>
            <button 
              className={styles.primaryBtn} 
              onClick={handleAddRoot}
              disabled={isLoading_state}
            >
              <Plus size={18} />
              {t.newRootUnit}
            </button>
          </div>
        </div>

        {/* ===== Error ===== */}
        {error && (
          <div className={styles.errorAlert}>
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* ===== Stats ===== */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#e3f2fd' }}>
              <Layers className={styles.statIcon} style={{ color: '#1976d2' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.total}</span>
              <span className={styles.statLabel}>{t.totalUnits}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#fff3e0' }}>
              <GitBranch className={styles.statIcon} style={{ color: '#e65100' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.roots}</span>
              <span className={styles.statLabel}>{t.root}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#e8f5e9' }}>
              <CheckCircle className={styles.statIcon} style={{ color: '#2e7d32' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.active}</span>
              <span className={styles.statLabel}>{t.active}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#ffebee' }}>
              <Circle className={styles.statIcon} style={{ color: '#c62828' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.inactive}</span>
              <span className={styles.statLabel}>{t.inactive}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#e8f5e9' }}>
              <Package className={styles.statIcon} style={{ color: '#2e7d32' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.withProducts}</span>
              <span className={styles.statLabel}>{t.withProducts}</span>
            </div>
          </div>
        </div>

        {/* ===== Search & Filter ===== */}
        <div className={styles.searchSection}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="جستجوی واحدها... (حداقل ۳ حرف)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
              disabled={isLoading_state}
            />
            {searchTerm && (
              <button 
                className={styles.clearSearch}
                onClick={() => setSearchTerm('')}
                disabled={isLoading_state}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className={styles.filterActions}>
            <button 
              className={`${styles.filterToggle} ${showFilterPanel ? styles.filterActive : ''}`}
              onClick={() => setShowFilterPanel(!showFilterPanel)}
            >
              <Filter size={18} />
              <span>فیلترها</span>
              {filterStatus && (
                <span className={styles.filterBadge}>●</span>
              )}
            </button>
            {filterStatus && (
              <button 
                className={styles.clearFiltersBtn}
                onClick={() => { setFilterStatus(''); setSearchTerm(''); }}
              >
                پاک کردن
              </button>
            )}
          </div>
          <span className={styles.totalCount}>
            {isLoading_state ? 'در حال بارگذاری...' : `${stats.total} واحد`}
          </span>
        </div>

        {/* ===== Filter Panel ===== */}
        {showFilterPanel && (
          <div className={styles.filterPanel}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>وضعیت</label>
              <select
                className={styles.filterSelect}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                disabled={isLoading_state}
              >
                <option value="">همه</option>
                <option value="active">{t.active}</option>
                <option value="inactive">{t.inactive}</option>
              </select>
            </div>
            <button 
              className={styles.filterApplyBtn}
              onClick={() => setShowFilterPanel(false)}
            >
              اعمال
            </button>
          </div>
        )}

        {/* ===== Search Hint ===== */}
        {searchTerm && searchTerm.length > 0 && searchTerm.length < 3 && (
          <div className={styles.searchHint}>
            <span>🔍 برای جستجو حداقل ۳ حرف وارد کنید</span>
          </div>
        )}

        {/* ===== Table ===== */}
        <UnitTreeTable
          data={unitData}
          loading={isLoading_state}
          onRowClick={handleViewDetail}
          onViewDetail={handleViewDetail}
          onEdit={handleEdit}
          onAddSub={handleAddSub}
          onDelete={(row) => {
            const count = getProductCount(row.id);
            if (count > 0) { 
              alert(`⚠️ این واحد در ${count} کالا استفاده شده است. ابتدا کالاهای مرتبط را تغییر دهید.`); 
              return; 
            }
            const hasChildren = row.children && row.children.length > 0;
            if (hasChildren) { 
              alert('⚠️ این واحد دارای زیرمجموعه است. ابتدا زیرمجموعه‌ها را حذف یا انتقال دهید.'); 
              return; 
            }
            setDeletingItem(row);
          }}
          getProductCount={getProductCount}
          viewMode={viewMode}
          t={t}
        />

        {/* ============================================
            MODALS
        ============================================ */}

        {/* ===== Modal ایجاد/ویرایش ریشه ===== */}
        <Modal
          isOpen={showRootForm}
          onClose={() => {
            setShowRootForm(false);
            setEditingItem(null);
          }}
          title={editingItem ? '✏️ ویرایش واحد ریشه' : '➕ واحد ریشه جدید'}
          size="md"
        >
          <UnitSimpleForm
            initialData={editingItem}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowRootForm(false);
              setEditingItem(null);
            }}
            loading={isLoading_state}
          />
        </Modal>

        {/* ===== Modal ایجاد/ویرایش زیرمجموعه ===== */}
        <Modal
          isOpen={showSubForm}
          onClose={() => {
            setShowSubForm(false);
            setParentForSub(null);
            setEditingItem(null);
          }}
          title={
            editingItem 
              ? `✏️ ویرایش "${editingItem?.title}"` 
              : `➕ زیرمجموعه جدید برای "${parentForSub?.title || 'والد'}"`
          }
          size="md"
        >
          <UnitSubForm
            parentUnit={parentForSub}
            initialData={editingItem}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowSubForm(false);
              setParentForSub(null);
              setEditingItem(null);
            }}
            loading={isLoading_state}
            units={unitData}
          />
        </Modal>

        {/* ===== Delete Confirmation ===== */}
        <ConfirmDialog
          isOpen={!!deletingItem}
          onClose={() => setDeletingItem(null)}
          onConfirm={handleDelete}
          title="حذف واحد"
          message={`آیا از حذف واحد "${deletingItem?.title}" اطمینان دارید؟`}
          confirmText="حذف"
          loading={isLoading_state}
        />

        {/* ===== Unit Detail Modal ===== */}
        <Modal
          isOpen={showUnitDetail}
          onClose={() => {
            setShowUnitDetail(false);
            setSelectedUnit(null);
          }}
          title="جزئیات واحد"
          size="lg"
        >
          {selectedUnit && (
            <div className={styles.unitDetail}>
              <div className={styles.detailHeader}>
                <div className={styles.detailIcon}>
                  <Layers size={32} />
                </div>
                <div className={styles.detailTitle}>
                  <h3>{selectedUnit.title}</h3>
                  <span className={styles.detailAbbr}>{selectedUnit.abbreviation}</span>
                </div>
                <span className={selectedUnit.is_active ? styles.activeBadge : styles.inactiveBadge}>
                  {selectedUnit.is_active ? t.active : t.inactive}
                </span>
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>عنوان:</span>
                  <span className={styles.detailValue}>{selectedUnit.title}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>مخفف:</span>
                  <span className={`${styles.detailValue} ${styles.detailAbbrValue}`}>
                    {selectedUnit.abbreviation || '-'}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>سطح:</span>
                  <span className={styles.detailValue}>
                    {getLevelLabel(selectedUnit.level || 0)}
                  </span>
                </div>
                {selectedUnit.parent && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>واحد والد:</span>
                    <span className={styles.detailValue}>
                      {selectedUnit.parent_title || selectedUnit.parent}
                    </span>
                  </div>
                )}
                {selectedUnit.count_in_parent && selectedUnit.parent && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>تعداد در والد:</span>
                    <span className={styles.detailValue}>
                      {selectedUnit.count_in_parent} عدد
                    </span>
                  </div>
                )}
                {selectedUnit.full_path && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>مسیر کامل:</span>
                    <span className={styles.detailValue}>{selectedUnit.full_path}</span>
                  </div>
                )}
                {selectedUnit.description && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>توضیحات:</span>
                    <span className={styles.detailValue}>{selectedUnit.description}</span>
                  </div>
                )}
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>کالاهای مرتبط:</span>
                  <span className={styles.detailValue}>
                    <Package size={14} /> {getProductCount(selectedUnit.id)} کالا
                  </span>
                </div>
              </div>

              {selectedUnit.children && selectedUnit.children.length > 0 && (
                <div className={styles.relatedProducts}>
                  <h4>
                    <GitBranch size={16} />
                    زیرمجموعه‌ها ({selectedUnit.children.length})
                  </h4>
                  <div className={styles.productTags}>
                    {selectedUnit.children.map(child => (
                      <span key={child.id} className={styles.productTag}>
                        <Layers size={12} />
                        {child.title} ({child.abbreviation || '-'})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.detailActions}>
                <button
                  className={styles.secondaryBtn}
                  onClick={() => {
                    setShowUnitDetail(false);
                    handleEdit(selectedUnit);
                  }}
                >
                  <Edit size={16} />
                  {t.edit}
                </button>
                <button
                  className={styles.secondaryBtn}
                  style={{ background: '#2d4a3e', color: 'white' }}
                  onClick={() => {
                    setShowUnitDetail(false);
                    handleAddSub(selectedUnit);
                  }}
                >
                  <PlusCircle size={16} />
                  {t.addSub}
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default UnitList;