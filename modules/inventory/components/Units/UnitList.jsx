// modules/inventory/components/Units/UnitList.jsx

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInventory } from '../../components/context/InventoryContext';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import UnitForm from './UnitForm';
import UnitTreeTable from './UnitTreeTable';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Ruler, 
  Package, 
  Search, 
  X, 
  RefreshCw,
  Filter,
  Layers,
  CheckCircle,
  Circle,
  Building2,
  FileText,
  Users,
  AlertTriangle,
  Box,
  Home,
  GitBranch,
  Eye,
} from 'lucide-react';
import styles from '@/styles/modules/InventoryCommon.module.css';

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
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showUnitDetail, setShowUnitDetail] = useState(false);
  const [viewMode, setViewMode] = useState('tree');
  const [unitData, setUnitData] = useState([]); // <-- اضافه شد
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    roots: 0,
    withProducts: 0,
    withoutProducts: 0,
  });

  // ============================================
  // Refs
  // ============================================
  const initialLoadDone = useRef(false);
  const fetchInProgress = useRef(false);

  // ============================================
  // Translations
  // ============================================
  const t = useMemo(() => ({
    title: language === 'fa' ? 'مدیریت واحدها' : 'Units Management',
    subtitle: language === 'fa' ? 'مدیریت واحدهای اندازه‌گیری کالاها (سلسله‌مراتبی)' : 'Manage product measurement units (Hierarchical)',
    refresh: language === 'fa' ? 'بروزرسانی' : 'Refresh',
    dashboard: language === 'fa' ? 'داشبورد اصلی' : 'Dashboard',
    manageWarehouses: language === 'fa' ? 'مدیریت انبارها' : 'Manage Warehouses',
    manageProducts: language === 'fa' ? 'مدیریت کالاها' : 'Manage Products',
    transactionHistory: language === 'fa' ? 'تاریخچه تراکنش‌ها' : 'Transaction History',
    managePersons: language === 'fa' ? 'افراد مجاز' : 'Authorized Persons',
    manageAlerts: language === 'fa' ? 'هشدارها' : 'Alerts',
    units: language === 'fa' ? 'واحدها' : 'Units',
    newUnit: language === 'fa' ? 'واحد جدید' : 'New Unit',
    totalUnits: language === 'fa' ? 'کل واحدها' : 'Total Units',
    active: language === 'fa' ? 'فعال' : 'Active',
    inactive: language === 'fa' ? 'غیرفعال' : 'Inactive',
    withProducts: language === 'fa' ? 'دارای کالا' : 'With Products',
    withoutProducts: language === 'fa' ? 'بدون کالا' : 'Without Products',
    viewDetail: language === 'fa' ? 'مشاهده جزئیات' : 'View Details',
    edit: language === 'fa' ? 'ویرایش' : 'Edit',
    delete: language === 'fa' ? 'حذف' : 'Delete',
    root: language === 'fa' ? 'ریشه' : 'Root',
    treeView: language === 'fa' ? 'نمایش درختی' : 'Tree View',
    listView: language === 'fa' ? 'نمایش لیستی' : 'List View',
  }), [language]);

  // ============================================
  // Core Functions
  // ============================================

  const fetchUnits = useCallback(async (forceRefresh = false) => {
    if (fetchInProgress.current && !forceRefresh) {
      console.log('⏳ Fetch already in progress, skipping...');
      return;
    }

    fetchInProgress.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      const trimmedSearch = searchTerm?.trim() || '';
      
      let unitsData;
      
      // اگر در حالت درختی و بدون جستجو و فیلتر هستیم، از درخت استفاده کن
      if (viewMode === 'tree' && !trimmedSearch && !filterStatus) {
        console.log('🌳 Fetching unit tree...');
        unitsData = await loadUnitTree();
      } else {
        // در غیر این صورت از API معمولی با پارامترها استفاده کن
        const params = {};
        
        if (trimmedSearch.length === 0 || trimmedSearch.length >= 3) {
          params.search = trimmedSearch;
        }
        
        if (filterStatus) {
          params.is_active = filterStatus === 'active';
        }
        
        console.log('📋 Fetching units with params:', params);
        unitsData = await loadUnits(params);
      }

      // تبدیل به آرایه
      let units = [];
      if (Array.isArray(unitsData)) {
        units = unitsData;
      } else if (unitsData?.results) {
        units = unitsData.results;
      } else if (unitsData?.data) {
        units = unitsData.data;
      } else {
        units = [];
      }

      console.log('📦 Received units count:', units.length);
      console.log('📦 First unit sample:', units[0]);

      // ذخیره در state
      setUnitData(units);

      // محاسبه آمار
      const products = state.products || [];
      const withProducts = units.filter(u => 
        products.some(p => p.base_unit === u.id)
      ).length;
      const roots = units.filter(u => !u.parent).length;
      
      setStats({
        total: units.length,
        active: units.filter(u => u.is_active).length,
        inactive: units.filter(u => !u.is_active).length,
        roots: roots,
        withProducts: withProducts,
        withoutProducts: units.length - withProducts,
      });

      console.log(`✅ Loaded ${units.length} units`);

    } catch (err) {
      console.error('❌ Error loading units:', err);
      setError(err.message || 'خطا در بارگذاری واحدها');
      setUnitData([]);
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, [searchTerm, filterStatus, viewMode, loadUnits, loadUnitTree, state.products]);

  // ============================================
  // Effects
  // ============================================

  // بارگذاری اولیه
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      console.log('🔄 Initial load');
      
      Promise.all([
        loadProducts(),
        loadUnitRoots(),
      ]).then(() => {
        fetchUnits(true);
      });
    }
  }, []);

  // تغییر در جستجو، فیلتر، یا حالت نمایش
  useEffect(() => {
    if (initialLoadDone.current) {
      const timer = setTimeout(() => {
        const trimmed = searchTerm?.trim() || '';
        if (trimmed.length === 0 || trimmed.length >= 3) {
          console.log('🔄 Fetching with new params');
          fetchUnits(true);
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [searchTerm, filterStatus, viewMode]);

  // ============================================
  // Handlers
  // ============================================

  const handleDelete = useCallback(async () => {
    if (!deletingItem) return;
    
    try {
      await deleteUnit(deletingItem.id);
      setDeletingItem(null);
      await fetchUnits(true);
    } catch (err) {
      console.error('Error deleting unit:', err);
      setError(err.message || 'خطا در حذف واحد');
    }
  }, [deletingItem, deleteUnit, fetchUnits]);

  const handleSubmit = useCallback(
    async (data) => {
      try {
        if (editingItem) {
          await updateUnit(editingItem.id, data);
        } else {
          await createUnit(data);
        }
        setShowForm(false);
        setEditingItem(null);
        await fetchUnits(true);
      } catch (err) {
        console.error('Error submitting unit:', err);
        setError(err.message || 'خطا در ذخیره واحد');
      }
    },
    [editingItem, createUnit, updateUnit, fetchUnits]
  );

  const handleRefresh = useCallback(() => {
    fetchUnits(true);
  }, [fetchUnits]);

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const handleFilterStatus = useCallback((value) => {
    setFilterStatus(value);
  }, []);

  const clearFilters = useCallback(() => {
    setFilterStatus('');
    setSearchTerm('');
  }, []);

  const handleAddNew = useCallback(() => {
    setEditingItem(null);
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((row) => {
    setEditingItem(row);
    setShowForm(true);
  }, []);

  const handleDeleteClick = useCallback((row) => {
    const hasChildren = row.children && row.children.length > 0;
    if (hasChildren) {
      alert('⚠️ این واحد دارای زیرمجموعه است. ابتدا زیرمجموعه‌ها را حذف یا انتقال دهید.');
      return;
    }
    setDeletingItem(row);
  }, []);

  const handleViewDetail = useCallback((row) => {
    setSelectedUnit(row);
    setShowUnitDetail(true);
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'tree' ? 'list' : 'tree');
  }, []);

  // ============================================
  // Helper Functions
  // ============================================
  const getProductCount = useCallback((unitId) => {
    return state.products?.filter(p => p.base_unit === unitId).length || 0;
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

  // ============================================
  // Render
  // ============================================

  const isLoading_state = state.loading.units || isLoading;

  console.log('🔄 Rendering UnitList with data length:', unitData.length);

  return (
    <div className={styles.inventoryContainer}>
      <div className={styles.container}>
        {/* ===== Navigation Bar ===== */}
        <div className={styles.navBar}>
          <div className={styles.actionsGrid}>
            <Link href="/inventory" className={styles.actionCard}>
              <Home size={20} style={{ color: '#1976d2' }} />
              <span>{t.dashboard}</span>
            </Link>
            <Link href="/inventory/warehouses" className={styles.actionCard}>
              <Building2 size={20} style={{ color: '#1976d2' }} />
              <span>{t.manageWarehouses}</span>
            </Link>
            <Link href="/inventory/products" className={styles.actionCard}>
              <Package size={20} style={{ color: '#388e3c' }} />
              <span>{t.manageProducts}</span>
            </Link>
            <Link href="/inventory/transactions" className={styles.actionCard}>
              <FileText size={20} style={{ color: '#f57c00' }} />
              <span>{t.transactionHistory}</span>
            </Link>
            <Link href="/inventory/authorized-persons" className={styles.actionCard}>
              <Users size={20} style={{ color: '#6c5ce7' }} />
              <span>{t.managePersons}</span>
            </Link>
            <Link href="/inventory/alerts" className={styles.actionCard}>
              <AlertTriangle size={20} style={{ color: '#c62828' }} />
              <span>{t.manageAlerts}</span>
            </Link>
            <Link href="/inventory/units" className={`${styles.actionCard} ${styles.actionCardActive}`}>
              <Box size={20} style={{ color: '#e65100' }} />
              <span>{t.units}</span>
            </Link>
          </div>
        </div>

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
              title={viewMode === 'tree' ? t.listView : t.treeView}
            >
              {viewMode === 'tree' ? '📋 لیست' : '🌳 درخت'}
            </button>
            <button 
              className={styles.primaryBtn} 
              onClick={handleAddNew}
              disabled={isLoading_state}
            >
              <Plus size={18} />
              {t.newUnit}
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

        {/* ===== Stats Bar ===== */}
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
            <div className={styles.statIconWrapper} style={{ background: '#e8f5e9' }}>
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
              placeholder="جستجوی واحدها... (عنوان یا مخفف - حداقل ۳ حرف)"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className={styles.searchInput}
              disabled={isLoading_state}
            />
            {searchTerm && (
              <button 
                className={styles.clearSearch}
                onClick={clearSearch}
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
                onClick={clearFilters}
              >
                پاک کردن فیلترها
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
                onChange={(e) => handleFilterStatus(e.target.value)}
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
              اعمال فیلترها
            </button>
          </div>
        )}

        {/* ===== Search Hint ===== */}
        {searchTerm && searchTerm.length > 0 && searchTerm.length < 3 && (
          <div className={styles.searchHint}>
            <span>🔍 برای جستجو حداقل ۳ حرف وارد کنید</span>
          </div>
        )}

        {/* ===== Tree Table ===== */}
        <UnitTreeTable
          data={unitData}
          loading={isLoading_state}
          onRowClick={handleViewDetail}
          onViewDetail={handleViewDetail}
          onEdit={handleEdit}
          onDelete={(row) => {
            const count = getProductCount(row.id);
            if (count > 0) {
              alert(`⚠️ این واحد در ${count} کالا استفاده شده است. ابتدا کالاهای مرتبط را تغییر دهید.`);
              return;
            }
            handleDeleteClick(row);
          }}
          getProductCount={getProductCount}
          t={t}
        />

        {/* ===== Form Modal ===== */}
        <Modal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          title={editingItem ? 'ویرایش واحد' : 'ایجاد واحد جدید'}
          size="md"
        >
          <UnitForm
            initialData={editingItem}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
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
                    {getLevelLabel(selectedUnit._level || 0)}
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
                    <Package size={14} />
                    {getProductCount(selectedUnit.id)} کالا
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>وضعیت:</span>
                  <span className={styles.detailValue}>
                    {selectedUnit.is_active ? t.active : t.inactive}
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

              {getProductCount(selectedUnit.id) > 0 && (
                <div className={styles.relatedProducts}>
                  <h4>
                    <Package size={16} />
                    کالاهای مرتبط ({getProductCount(selectedUnit.id)})
                  </h4>
                  <div className={styles.productTags}>
                    {state.products
                      ?.filter(p => p.base_unit === selectedUnit.id)
                      .slice(0, 10)
                      .map(p => (
                        <span key={p.id} className={styles.productTag}>
                          <Package size={12} />
                          {p.title} ({p.code})
                        </span>
                      ))}
                    {getProductCount(selectedUnit.id) > 10 && (
                      <span className={styles.productMore}>
                        +{getProductCount(selectedUnit.id) - 10} بیشتر
                      </span>
                    )}
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
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default UnitList;