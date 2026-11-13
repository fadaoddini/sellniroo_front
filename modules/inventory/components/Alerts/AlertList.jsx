// modules/inventory/components/alerts/AlertList.jsx

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInventory } from '@/modules/inventory/context/InventoryContext';

import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import AlertDetail from './AlertDetail';
import { 
  Plus, Home, Building2, Package, Box, ArrowDownToLine, ArrowUpFromLine, 
  Users, AlertTriangle, RefreshCw, List, Grid,
  CheckCircle, Circle, AlertCircle, Search, Filter, 
  Eye, Edit, Trash2, X, Bell, Clock, Check, Zap,
  AlertOctagon, AlertCircle as AlertCircleIcon,
} from 'lucide-react';
import styles from './alert.module.css';

const AlertList = () => {
  const { language } = useLanguage();
  const {
    state,
    loadAlerts,
    resolveAlert,
    loadAlertStatistics,
    loadProducts,
    loadWarehouses,
    loadDashboardStats,
  } = useInventory();

  // ============================================
  // State Management
  // ============================================
  const [resolvingAlert, setResolvingAlert] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [alertData, setAlertData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    resolved: 0,
    byType: {},
    byLevel: {},
  });

  const initialLoadDone = useRef(false);
  const fetchInProgress = useRef(false);

  // ============================================
  // Translations
  // ============================================
  const t = useMemo(() => ({
    title: language === 'fa' ? 'مدیریت هشدارها' : 'Alerts Management',
    subtitle: language === 'fa' ? 'مدیریت هشدارهای موجودی کالا' : 'Manage inventory alerts',
    refresh: language === 'fa' ? 'بروزرسانی' : 'Refresh',
    dashboard: language === 'fa' ? 'داشبورد اصلی' : 'Dashboard',
    manageWarehouses: language === 'fa' ? 'مدیریت انبارها' : 'Manage Warehouses',
    manageProducts: language === 'fa' ? 'مدیریت کالاها' : 'Manage Products',
    manageUnits: language === 'fa' ? 'مدیریت واحدها' : 'Manage Units',
    stockIn: language === 'fa' ? 'ورود کالا' : 'Stock In',
    stockOut: language === 'fa' ? 'خروج کالا' : 'Stock Out',
    managePersons: language === 'fa' ? 'افراد مجاز' : 'Authorized Persons',
    manageAlerts: language === 'fa' ? 'هشدارها' : 'Alerts',
    alerts: language === 'fa' ? 'هشدارها' : 'Alerts',
    totalAlerts: language === 'fa' ? 'کل هشدارها' : 'Total Alerts',
    active: language === 'fa' ? 'فعال' : 'Active',
    resolved: language === 'fa' ? 'برطرف شده' : 'Resolved',
    viewDetail: language === 'fa' ? 'مشاهده جزئیات' : 'View Details',
    resolve: language === 'fa' ? 'برطرف کردن' : 'Resolve',
    delete: language === 'fa' ? 'حذف' : 'Delete',
    product: language === 'fa' ? 'کالا' : 'Product',
    warehouse: language === 'fa' ? 'انبار' : 'Warehouse',
    type: language === 'fa' ? 'نوع' : 'Type',
    level: language === 'fa' ? 'سطح' : 'Level',
    status: language === 'fa' ? 'وضعیت' : 'Status',
    message: language === 'fa' ? 'پیام' : 'Message',
    currentQuantity: language === 'fa' ? 'موجودی فعلی' : 'Current Quantity',
    threshold: language === 'fa' ? 'آستانه' : 'Threshold',
    noAlerts: language === 'fa' ? 'هیچ هشداری یافت نشد' : 'No alerts found',
    gridView: language === 'fa' ? 'نمایش شبکه‌ای' : 'Grid View',
    listView: language === 'fa' ? 'نمایش لیستی' : 'List View',
    allTypes: language === 'fa' ? 'همه انواع' : 'All Types',
    allLevels: language === 'fa' ? 'همه سطوح' : 'All Levels',
    allStatus: language === 'fa' ? 'همه وضعیت‌ها' : 'All Status',
    allWarehouses: language === 'fa' ? 'همه انبارها' : 'All Warehouses',
    allProducts: language === 'fa' ? 'همه کالاها' : 'All Products',
    searchPlaceholder: language === 'fa' ? 'جستجوی هشدارها (کالا یا پیام)...' : 'Search alerts (product or message)...',
    close: language === 'fa' ? 'بستن' : 'Close',
    lowStock: language === 'fa' ? 'موجودی کم' : 'Low Stock',
    noStock: language === 'fa' ? 'تمام شده' : 'No Stock',
    overStock: language === 'fa' ? 'بیش از حد' : 'Over Stock',
    info: language === 'fa' ? 'اطلاعاتی' : 'Info',
    warning: language === 'fa' ? 'هشدار' : 'Warning',
    critical: language === 'fa' ? 'بحرانی' : 'Critical',
    resolveConfirm: language === 'fa' ? 'آیا از برطرف کردن این هشدار اطمینان دارید؟' : 'Are you sure you want to resolve this alert?',
    alertResolved: language === 'fa' ? 'هشدار برطرف شد' : 'Alert resolved',
  }), [language]);

  // ============================================
  // Fetch Alerts
  // ============================================
  const fetchAlerts = useCallback(async (forceRefresh = false) => {
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
      if (filterType) {
        params.alert_type = filterType;
      }
      if (filterLevel) {
        params.level = filterLevel;
      }
      if (filterStatus) {
        params.is_resolved = filterStatus === 'resolved';
      }
      if (filterWarehouse) {
        params.warehouse = filterWarehouse;
      }
      if (filterProduct) {
        params.product = filterProduct;
      }
      
      const alertsData = await loadAlerts(params);
      
      let alerts = [];
      if (Array.isArray(alertsData)) alerts = alertsData;
      else if (alertsData?.results) alerts = alertsData.results;
      else if (alertsData?.data) alerts = alertsData.data;
      
      setAlertData(alerts);
      
      // دریافت آمار
      const statsData = await loadAlertStatistics();
      
      if (statsData) {
        setStats({
          total: alerts.length + (statsData.resolved || 0),
          active: alerts.filter(a => !a.is_resolved).length,
          resolved: statsData.resolved || 0,
          byType: statsData.by_type || {},
          byLevel: statsData.by_level || {},
        });
      } else {
        setStats({
          total: alerts.length,
          active: alerts.filter(a => !a.is_resolved).length,
          resolved: alerts.filter(a => a.is_resolved).length,
          byType: {},
          byLevel: {},
        });
      }
    } catch (err) {
      console.error('Error loading alerts:', err);
      setError(err.message || 'خطا در بارگذاری هشدارها');
      setAlertData([]);
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, [searchTerm, filterType, filterLevel, filterStatus, filterWarehouse, filterProduct, loadAlerts, loadAlertStatistics]);

  // ============================================
  // Effects
  // ============================================
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      Promise.all([
        loadProducts(),
        loadWarehouses(),
        loadDashboardStats(),
      ]).then(() => fetchAlerts(true));
    }
  }, []);

  useEffect(() => {
    if (initialLoadDone.current) {
      const timer = setTimeout(() => {
        const trimmed = searchTerm?.trim() || '';
        if (trimmed.length === 0 || trimmed.length >= 3) {
          fetchAlerts(true);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, filterType, filterLevel, filterStatus, filterWarehouse, filterProduct]);

  // ============================================
  // Handlers
  // ============================================
  
  const handleResolve = useCallback(async () => {
    if (!resolvingAlert) return;
    try {
      await resolveAlert(resolvingAlert.id);
      setResolvingAlert(null);
      await fetchAlerts(true);
      await loadDashboardStats();
    } catch (err) {
      setError(err.message || 'خطا در برطرف کردن هشدار');
    }
  }, [resolvingAlert, resolveAlert, fetchAlerts, loadDashboardStats]);

  const handleViewDetail = useCallback((row) => {
    setSelectedAlert(row);
    setShowDetail(true);
  }, []);

  const handleRefresh = useCallback(() => fetchAlerts(true), [fetchAlerts]);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  }, []);

  const isLoading_state = state.loading.alerts || isLoading;

  // ============================================
  // Render Helpers
  // ============================================
  
  const getTypeBadge = useCallback((type) => {
    const types = {
      'LOW_STOCK': { label: t.lowStock, className: 'typeLowStock', icon: <AlertCircle size={12} /> },
      'NO_STOCK': { label: t.noStock, className: 'typeNoStock', icon: <AlertOctagon size={12} /> },
      'OVER_STOCK': { label: t.overStock, className: 'typeOverStock', icon: <Zap size={12} /> },
    };
    const result = types[type] || { label: type, className: '', icon: null };
    return (
      <span className={`${styles.typeBadge} ${styles[result.className] || ''}`}>
        {result.icon}
        {result.label}
      </span>
    );
  }, [t]);

  const getLevelBadge = useCallback((level) => {
    const levels = {
      'INFO': { label: t.info, className: 'levelInfo' },
      'WARNING': { label: t.warning, className: 'levelWarning' },
      'CRITICAL': { label: t.critical, className: 'levelCritical' },
    };
    const result = levels[level] || { label: level, className: '' };
    return (
      <span className={`${styles.levelBadge} ${styles[result.className] || ''}`}>
        {result.label}
      </span>
    );
  }, [t]);

  const getStatusBadge = useCallback((isResolved) => {
    if (isResolved) {
      return <span className={`${styles.statusBadge} ${styles.resolvedBadge}`}><Check size={12} /> {t.resolved}</span>;
    }
    return <span className={`${styles.statusBadge} ${styles.activeBadge}`}><Bell size={12} /> {t.active}</span>;
  }, [t]);

  const getProductName = useCallback((productId) => {
    const product = state.products?.find(p => p.id === productId);
    return product?.title || product?.code || '-';
  }, [state.products]);

  const getWarehouseName = useCallback((warehouseId) => {
    if (!warehouseId) return 'همه انبارها';
    const warehouse = state.warehouses?.find(w => w.id === warehouseId);
    return warehouse?.title || '-';
  }, [state.warehouses]);

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
              <Bell className={styles.titleIcon} size={28} />
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
              <Bell className={styles.statIcon} style={{ color: '#1976d2' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.total}</span>
              <span className={styles.statLabel}>{t.totalAlerts}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#ffebee' }}>
              <AlertTriangle className={styles.statIcon} style={{ color: '#c62828' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.active}</span>
              <span className={styles.statLabel}>{t.active}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#e8f5e9' }}>
              <CheckCircle className={styles.statIcon} style={{ color: '#2e7d32' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.resolved}</span>
              <span className={styles.statLabel}>{t.resolved}</span>
            </div>
          </div>
          {stats.byType && Object.keys(stats.byType).length > 0 && (
            <div className={styles.statCard}>
              <div className={styles.statIconWrapper} style={{ background: '#fff3e0' }}>
                <AlertCircle className={styles.statIcon} style={{ color: '#e65100' }} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>
                  {stats.byType.LOW_STOCK || 0}
                </span>
                <span className={styles.statLabel}>{t.lowStock}</span>
              </div>
            </div>
          )}
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
              {(filterType || filterLevel || filterStatus || filterWarehouse || filterProduct) && (
                <span className={styles.filterBadge}>●</span>
              )}
            </button>
            {(filterType || filterLevel || filterStatus || filterWarehouse || filterProduct) && (
              <button 
                className={styles.clearFiltersBtn}
                onClick={() => { 
                  setFilterType(''); 
                  setFilterLevel('');
                  setFilterStatus('');
                  setFilterWarehouse('');
                  setFilterProduct('');
                  setSearchTerm('');
                }}
              >
                پاک کردن
              </button>
            )}
          </div>
          <span className={styles.totalCount}>
            {isLoading_state ? 'در حال بارگذاری...' : `${alertData.length} هشدار`}
          </span>
        </div>

        {/* ===== Filter Panel ===== */}
        {showFilterPanel && (
          <div className={styles.filterPanel}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>نوع هشدار</label>
              <select
                className={styles.filterSelect}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                disabled={isLoading_state}
              >
                <option value="">{t.allTypes}</option>
                <option value="LOW_STOCK">{t.lowStock}</option>
                <option value="NO_STOCK">{t.noStock}</option>
                <option value="OVER_STOCK">{t.overStock}</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>سطح هشدار</label>
              <select
                className={styles.filterSelect}
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                disabled={isLoading_state}
              >
                <option value="">{t.allLevels}</option>
                <option value="INFO">{t.info}</option>
                <option value="WARNING">{t.warning}</option>
                <option value="CRITICAL">{t.critical}</option>
              </select>
            </div>
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
                <option value="resolved">{t.resolved}</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>انبار</label>
              <select
                className={styles.filterSelect}
                value={filterWarehouse}
                onChange={(e) => setFilterWarehouse(e.target.value)}
                disabled={isLoading_state}
              >
                <option value="">{t.allWarehouses}</option>
                {state.warehouses?.map(w => (
                  <option key={w.id} value={w.id}>{w.title}</option>
                ))}
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

        {/* ===== Alert Grid/List ===== */}
        {isLoading_state ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>در حال بارگذاری...</p>
          </div>
        ) : alertData.length === 0 ? (
          <div className={styles.emptyState}>
            <Bell size={48} className={styles.emptyIcon} />
            <p>{t.noAlerts}</p>
            <button className={styles.secondaryBtn} onClick={handleRefresh}>
              <RefreshCw size={16} />
              {t.refresh}
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className={styles.alertsGrid}>
            {alertData.map(alert => (
              <div 
                key={alert.id} 
                className={`${styles.alertCard} ${alert.is_resolved ? styles.resolvedCard : ''}`}
                onClick={() => handleViewDetail(alert)}
              >
                <div className={styles.alertCardHeader}>
                  <div className={styles.alertCardType}>
                    {getTypeBadge(alert.alert_type)}
                    {getLevelBadge(alert.level)}
                  </div>
                  <div className={styles.alertCardStatus}>
                    {getStatusBadge(alert.is_resolved)}
                  </div>
                </div>
                
                <div className={styles.alertCardBody}>
                  <h4 className={styles.alertProduct}>
                    {getProductName(alert.product)}
                  </h4>
                  <p className={styles.alertMessage}>{alert.message}</p>
                  
                  <div className={styles.alertDetails}>
                    <span className={styles.alertDetail}>
                      <Package size={12} />
                      {getProductName(alert.product)}
                    </span>
                    <span className={styles.alertDetail}>
                      <Building2 size={12} />
                      {getWarehouseName(alert.warehouse)}
                    </span>
                  </div>
                  
                  <div className={styles.alertQuantities}>
                    <span className={styles.quantityItem}>
                      <span className={styles.quantityLabel}>موجودی:</span>
                      <span className={`${styles.quantityValue} ${alert.current_quantity <= 0 ? styles.criticalValue : ''}`}>
                        {alert.current_quantity}
                      </span>
                    </span>
                    <span className={styles.quantityItem}>
                      <span className={styles.quantityLabel}>آستانه:</span>
                      <span className={styles.quantityValue}>{alert.threshold}</span>
                    </span>
                  </div>
                </div>
                
                <div className={styles.alertCardActions}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleViewDetail(alert); }}
                    className={styles.actionBtn}
                    title={t.viewDetail}
                  >
                    <Eye size={16} />
                  </button>
                  {!alert.is_resolved && (
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setResolvingAlert(alert);
                      }}
                      className={`${styles.actionBtn} ${styles.resolveBtn}`}
                      title={t.resolve}
                    >
                      <Check size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.alertsTable}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.colProduct}>کالا</th>
                  <th className={styles.colWarehouse}>انبار</th>
                  <th className={styles.colType}>نوع</th>
                  <th className={styles.colLevel}>سطح</th>
                  <th className={styles.colQuantity}>موجودی</th>
                  <th className={styles.colStatus}>وضعیت</th>
                  <th className={styles.actionsHeader}>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {alertData.map(alert => (
                  <tr 
                    key={alert.id}
                    onClick={() => handleViewDetail(alert)}
                    className={`${styles.clickable} ${alert.is_resolved ? styles.resolvedRow : ''}`}
                  >
                    <td className={styles.colProduct}>
                      <span className={styles.productName}>{getProductName(alert.product)}</span>
                    </td>
                    <td className={styles.colWarehouse}>
                      <span className={styles.warehouseName}>{getWarehouseName(alert.warehouse)}</span>
                    </td>
                    <td className={styles.colType}>
                      {getTypeBadge(alert.alert_type)}
                    </td>
                    <td className={styles.colLevel}>
                      {getLevelBadge(alert.level)}
                    </td>
                    <td className={styles.colQuantity}>
                      <span className={`${styles.quantityBadge} ${alert.current_quantity <= 0 ? styles.criticalBadge : ''}`}>
                        {alert.current_quantity}
                      </span>
                    </td>
                    <td className={styles.colStatus}>
                      {getStatusBadge(alert.is_resolved)}
                    </td>
                    <td className={styles.actionsCell}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleViewDetail(alert); }}
                        className={styles.actionBtn}
                        title={t.viewDetail}
                      >
                        <Eye size={16} />
                      </button>
                      {!alert.is_resolved && (
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setResolvingAlert(alert);
                          }}
                          className={`${styles.actionBtn} ${styles.resolveBtn}`}
                          title={t.resolve}
                        >
                          <Check size={16} />
                        </button>
                      )}
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

        {/* ===== Alert Detail Modal ===== */}
        <Modal
          isOpen={showDetail}
          onClose={() => {
            setShowDetail(false);
            setSelectedAlert(null);
          }}
          title="جزئیات هشدار"
          size="lg"
        >
          {selectedAlert && (
            <AlertDetail 
              alert={selectedAlert}
              onResolve={() => {
                setShowDetail(false);
                setResolvingAlert(selectedAlert);
              }}
              onClose={() => {
                setShowDetail(false);
                setSelectedAlert(null);
              }}
              getTypeBadge={getTypeBadge}
              getLevelBadge={getLevelBadge}
              getStatusBadge={getStatusBadge}
              getProductName={getProductName}
              getWarehouseName={getWarehouseName}
              t={t}
            />
          )}
        </Modal>

        {/* ===== Resolve Confirmation ===== */}
        <ConfirmDialog
          isOpen={!!resolvingAlert}
          onClose={() => setResolvingAlert(null)}
          onConfirm={handleResolve}
          title={t.resolve}
          message={`${t.resolveConfirm}\n\n"${resolvingAlert?.message}"`}
          confirmText={t.resolve}
          loading={isLoading_state}
          type="warning"
        />
      </div>
    </div>
  );
};

export default AlertList;