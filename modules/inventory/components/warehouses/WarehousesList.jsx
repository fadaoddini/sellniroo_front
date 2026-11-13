// modules/inventory/components/warehouses/WarehouseList.jsx

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInventory } from '@/modules/inventory/context/InventoryContext';

import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import WarehouseForm from './WarehouseForm';
import WarehouseDetail from './WarehouseDetail';
import { 
  Plus, Home, Building2, Package, Box, ArrowDownToLine, ArrowUpFromLine, 
  Users, AlertTriangle, RefreshCw, List, Grid,
  CheckCircle, Circle, AlertCircle, Tag, Search, Filter, Layers, 
  Eye, Edit, Trash2, X, Warehouse, Phone, MapPin, User,
} from 'lucide-react';
import styles from './warehouse.module.css';

const WarehouseList = () => {
  const { language } = useLanguage();
  const {
    state,
    loadWarehouses,
    deleteWarehouse,
    createWarehouse,
    updateWarehouse,
    loadProducts,
    loadStockItems,
  } = useInventory();

  // ============================================
  // State Management
  // ============================================
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [warehouseData, setWarehouseData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalItems: 0,
  });

  const initialLoadDone = useRef(false);
  const fetchInProgress = useRef(false);

  // ============================================
  // Translations
  // ============================================
  const t = useMemo(() => ({
    title: language === 'fa' ? 'مدیریت انبارها' : 'Warehouses Management',
    subtitle: language === 'fa' ? 'مدیریت انبارها و موجودی' : 'Manage warehouses and inventory',
    refresh: language === 'fa' ? 'بروزرسانی' : 'Refresh',
    dashboard: language === 'fa' ? 'داشبورد اصلی' : 'Dashboard',
    manageWarehouses: language === 'fa' ? 'مدیریت انبارها' : 'Manage Warehouses',
    manageProducts: language === 'fa' ? 'مدیریت کالاها' : 'Manage Products',
    manageUnits: language === 'fa' ? 'مدیریت واحدها' : 'Manage Units',
    stockIn: language === 'fa' ? 'ورود کالا' : 'Stock In',
    stockOut: language === 'fa' ? 'خروج کالا' : 'Stock Out',
    managePersons: language === 'fa' ? 'افراد مجاز' : 'Authorized Persons',
    manageAlerts: language === 'fa' ? 'هشدارها' : 'Alerts',
    warehouses: language === 'fa' ? 'انبارها' : 'Warehouses',
    newWarehouse: language === 'fa' ? 'انبار جدید' : 'New Warehouse',
    editWarehouse: language === 'fa' ? 'ویرایش انبار' : 'Edit Warehouse',
    totalWarehouses: language === 'fa' ? 'کل انبارها' : 'Total Warehouses',
    active: language === 'fa' ? 'فعال' : 'Active',
    inactive: language === 'fa' ? 'غیرفعال' : 'Inactive',
    totalItems: language === 'fa' ? 'کل اقلام' : 'Total Items',
    viewDetail: language === 'fa' ? 'مشاهده جزئیات' : 'View Details',
    edit: language === 'fa' ? 'ویرایش' : 'Edit',
    delete: language === 'fa' ? 'حذف' : 'Delete',
    titleLabel: language === 'fa' ? 'عنوان' : 'Title',
    address: language === 'fa' ? 'آدرس' : 'Address',
    phone: language === 'fa' ? 'تلفن' : 'Phone',
    manager: language === 'fa' ? 'مدیر' : 'Manager',
    status: language === 'fa' ? 'وضعیت' : 'Status',
    noWarehouses: language === 'fa' ? 'هیچ انباری یافت نشد' : 'No warehouses found',
    gridView: language === 'fa' ? 'نمایش شبکه‌ای' : 'Grid View',
    listView: language === 'fa' ? 'نمایش لیستی' : 'List View',
    allStatus: language === 'fa' ? 'همه وضعیت‌ها' : 'All Status',
    searchPlaceholder: language === 'fa' ? 'جستجوی انبارها (عنوان یا مدیر)...' : 'Search warehouses (title or manager)...',
    close: language === 'fa' ? 'بستن' : 'Close',
  }), [language]);

  // ============================================
  // Fetch Warehouses
  // ============================================
  const fetchWarehouses = useCallback(async (forceRefresh = false) => {
    if (fetchInProgress.current && !forceRefresh) return;
    fetchInProgress.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      const trimmedSearch = searchTerm?.trim() || '';
      const params = {};
      
      if (trimmedSearch.length === 0 || trimmedSearch.length >= 3) {
        params.search = trimmedSearch;
      }
      if (filterStatus) {
        params.is_active = filterStatus === 'active';
      }
      
      const warehousesData = await loadWarehouses(params);
      
      let warehouses = [];
      if (Array.isArray(warehousesData)) warehouses = warehousesData;
      else if (warehousesData?.results) warehouses = warehousesData.results;
      else if (warehousesData?.data) warehouses = warehousesData.data;
      
      setWarehouseData(warehouses);
      
      const totalItems = warehouses.reduce((sum, w) => sum + (w.total_items || 0), 0);
      
      setStats({
        total: warehouses.length,
        active: warehouses.filter(w => w.is_active).length,
        inactive: warehouses.filter(w => !w.is_active).length,
        totalItems: totalItems,
      });
    } catch (err) {
      console.error('Error loading warehouses:', err);
      setError(err.message || 'خطا در بارگذاری انبارها');
      setWarehouseData([]);
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, [searchTerm, filterStatus, loadWarehouses]);

  // ============================================
  // Effects
  // ============================================
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      Promise.all([
        loadProducts(),
        loadStockItems(),
      ]).then(() => fetchWarehouses(true));
    }
  }, []);

  useEffect(() => {
    if (initialLoadDone.current) {
      const timer = setTimeout(() => {
        const trimmed = searchTerm?.trim() || '';
        if (trimmed.length === 0 || trimmed.length >= 3) {
          fetchWarehouses(true);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, filterStatus]);

  // ============================================
  // Handlers - CRUD Operations
  // ============================================
  
  const handleSubmit = useCallback(async (data) => {
    try {
      const submitData = new FormData();
      
      Object.keys(data).forEach(key => {
        if (key === 'image' && data[key] instanceof File) {
          submitData.append('image', data[key]);
        } else if (data[key] !== undefined && data[key] !== null) {
          submitData.append(key, data[key]);
        }
      });

      let result;
      if (editingItem) {
        result = await updateWarehouse(editingItem.id, submitData);
      } else {
        result = await createWarehouse(submitData);
      }
      
      setShowForm(false);
      setEditingItem(null);
      await fetchWarehouses(true);
      
    } catch (err) {
      console.error('Error submitting warehouse:', err);
      if (err.response?.data) {
        const errorMessages = Object.values(err.response.data).flat().join(' ');
        setError(errorMessages || err.message || 'خطا در ذخیره انبار');
      } else {
        setError(err.message || 'خطا در ذخیره انبار');
      }
    }
  }, [editingItem, createWarehouse, updateWarehouse, fetchWarehouses]);

  const handleDelete = useCallback(async () => {
    if (!deletingItem) return;
    try {
      await deleteWarehouse(deletingItem.id);
      setDeletingItem(null);
      await fetchWarehouses(true);
    } catch (err) {
      setError(err.message || 'خطا در حذف انبار');
    }
  }, [deletingItem, deleteWarehouse, fetchWarehouses]);

  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((row) => {
    setEditingItem(row);
    setShowForm(true);
  }, []);

  const handleViewDetail = useCallback((row) => {
    setSelectedWarehouse(row);
    setShowDetail(true);
  }, []);

  const handleRefresh = useCallback(() => fetchWarehouses(true), [fetchWarehouses]);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  }, []);

  const isLoading_state = state.loading.warehouses || isLoading;

  // ============================================
  // Render Helpers
  // ============================================
  
  const getStatusBadge = useCallback((isActive) => {
    if (isActive) {
      return <span className={`${styles.statusBadge} ${styles.activeBadge}`}><CheckCircle size={12} /> {t.active}</span>;
    }
    return <span className={`${styles.statusBadge} ${styles.inactiveBadge}`}><Circle size={12} /> {t.inactive}</span>;
  }, [t]);

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
              <Warehouse className={styles.titleIcon} size={28} />
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
              {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
              <span>{viewMode === 'grid' ? t.listView : t.gridView}</span>
            </button>
            <button 
              className={styles.primaryBtn} 
              onClick={handleAdd}
              disabled={isLoading_state}
            >
              <Plus size={18} />
              {t.newWarehouse}
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
              <Warehouse className={styles.statIcon} style={{ color: '#1976d2' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.total}</span>
              <span className={styles.statLabel}>{t.totalWarehouses}</span>
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
            <div className={styles.statIconWrapper} style={{ background: '#fff3e0' }}>
              <Package className={styles.statIcon} style={{ color: '#e65100' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.totalItems}</span>
              <span className={styles.statLabel}>{t.totalItems}</span>
            </div>
          </div>
        </div>

        {/* ===== Search & Filter ===== */}
        <div className={styles.searchSection}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
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
                onClick={() => { 
                  setFilterStatus(''); 
                  setSearchTerm('');
                }}
              >
                پاک کردن
              </button>
            )}
          </div>
          <span className={styles.totalCount}>
            {isLoading_state ? 'در حال بارگذاری...' : `${stats.total} انبار`}
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
                <option value="">{t.allStatus}</option>
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

        {/* ===== Warehouse Grid/List ===== */}
        {isLoading_state ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>در حال بارگذاری...</p>
          </div>
        ) : warehouseData.length === 0 ? (
          <div className={styles.emptyState}>
            <Warehouse size={48} className={styles.emptyIcon} />
            <p>{t.noWarehouses}</p>
            <button className={styles.primaryBtn} onClick={handleAdd}>
              <Plus size={16} />
              {t.newWarehouse}
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className={styles.warehousesGrid}>
            {warehouseData.map(warehouse => (
              <div 
                key={warehouse.id} 
                className={styles.warehouseCard}
                onClick={() => handleViewDetail(warehouse)}
              >
                <div className={styles.warehouseImageWrapper}>
                  {warehouse.image ? (
                    <Image 
                      src={warehouse.image} 
                      alt={warehouse.title}
                      width={200}
                      height={150}
                      className={styles.warehouseImage}
                    />
                  ) : (
                    <div className={styles.warehouseImagePlaceholder}>
                      <Warehouse size={48} />
                    </div>
                  )}
                  <div className={styles.warehouseStatus}>
                    {getStatusBadge(warehouse.is_active)}
                  </div>
                </div>
                
                <div className={styles.warehouseInfo}>
                  <div className={styles.warehouseTitleRow}>
                    <h3 className={styles.warehouseTitle}>{warehouse.title}</h3>
                  </div>
                  
                  <div className={styles.warehouseMeta}>
                    <span className={styles.warehouseAddress}>
                      <MapPin size={14} />
                      {warehouse.address?.length > 30 
                        ? warehouse.address.slice(0, 30) + '...' 
                        : warehouse.address}
                    </span>
                    <span className={styles.warehouseManager}>
                      <User size={14} />
                      {warehouse.manager}
                    </span>
                    <span className={styles.warehousePhone}>
                      <Phone size={14} />
                      {warehouse.phone}
                    </span>
                  </div>
                  
                  <div className={styles.warehouseStock}>
                    <span className={styles.stockLabel}>کل اقلام:</span>
                    <span className={styles.stockValue}>
                      {warehouse.total_items || 0}
                    </span>
                  </div>
                </div>
                
                <div className={styles.warehouseActions}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleViewDetail(warehouse); }}
                    className={styles.actionBtn}
                    title={t.viewDetail}
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEdit(warehouse); }}
                    className={styles.actionBtn}
                    title={t.edit}
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setDeletingItem(warehouse);
                    }}
                    className={styles.actionBtn}
                    title={t.delete}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.warehousesTable}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.colImage}>تصویر</th>
                  <th className={styles.colTitle}>عنوان</th>
                  <th className={styles.colAddress}>آدرس</th>
                  <th className={styles.colManager}>مدیر</th>
                  <th className={styles.colPhone}>تلفن</th>
                  <th className={styles.colItems}>اقلام</th>
                  <th className={styles.colStatus}>وضعیت</th>
                  <th className={styles.actionsHeader}>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {warehouseData.map(warehouse => (
                  <tr 
                    key={warehouse.id}
                    onClick={() => handleViewDetail(warehouse)}
                    className={styles.clickable}
                  >
                    <td className={styles.colImage}>
                      {warehouse.image ? (
                        <Image 
                          src={warehouse.image} 
                          alt={warehouse.title}
                          width={40}
                          height={40}
                          className={styles.thumbnail}
                        />
                      ) : (
                        <div className={styles.thumbnailPlaceholder}>
                          <Warehouse size={20} />
                        </div>
                      )}
                    </td>
                    <td className={styles.colTitle}>
                      <span className={styles.warehouseName}>{warehouse.title}</span>
                    </td>
                    <td className={styles.colAddress}>
                      <span className={styles.addressText}>
                        {warehouse.address?.length > 40 
                          ? warehouse.address.slice(0, 40) + '...' 
                          : warehouse.address}
                      </span>
                    </td>
                    <td className={styles.colManager}>
                      <span className={styles.managerName}>{warehouse.manager}</span>
                    </td>
                    <td className={styles.colPhone}>
                      <span className={styles.phoneNumber}>{warehouse.phone}</span>
                    </td>
                    <td className={styles.colItems}>
                      <span className={styles.itemsBadge}>
                        {warehouse.total_items || 0}
                      </span>
                    </td>
                    <td className={styles.colStatus}>
                      {getStatusBadge(warehouse.is_active)}
                    </td>
                    <td className={styles.actionsCell}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleViewDetail(warehouse); }}
                        className={styles.actionBtn}
                        title={t.viewDetail}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(warehouse); }}
                        className={styles.actionBtn}
                        title={t.edit}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setDeletingItem(warehouse);
                        }}
                        className={styles.actionBtn}
                        title={t.delete}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ============================================
            MODALS
        ============================================ */}

        {/* ===== Modal ایجاد/ویرایش انبار ===== */}
        <Modal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          title={editingItem ? `✏️ ${t.editWarehouse}` : `➕ ${t.newWarehouse}`}
          size="lg"
        >
          <WarehouseForm
            initialData={editingItem}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
            loading={isLoading_state}
          />
        </Modal>

        {/* ===== Delete Confirmation ===== */}
        <ConfirmDialog
          isOpen={!!deletingItem}
          onClose={() => setDeletingItem(null)}
          onConfirm={handleDelete}
          title="حذف انبار"
          message={`آیا از حذف انبار "${deletingItem?.title}" اطمینان دارید؟`}
          confirmText="حذف"
          loading={isLoading_state}
        />

        {/* ===== Warehouse Detail Modal ===== */}
        <Modal
          isOpen={showDetail}
          onClose={() => {
            setShowDetail(false);
            setSelectedWarehouse(null);
          }}
          title="جزئیات انبار"
          size="lg"
        >
          {selectedWarehouse && (
            <WarehouseDetail 
              warehouse={selectedWarehouse}
              onEdit={() => {
                setShowDetail(false);
                handleEdit(selectedWarehouse);
              }}
              onClose={() => {
                setShowDetail(false);
                setSelectedWarehouse(null);
              }}
              getStatusBadge={getStatusBadge}
              t={t}
            />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default WarehouseList;