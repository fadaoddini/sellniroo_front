// modules/inventory/components/Alerts/AlertList.jsx
'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInventory } from '../../components/context/InventoryContext';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  Search,
  X,
  Filter,
  Package,
  Building2,
  AlertCircle,
  CircleCheck,
  CircleX,
  Loader2,
  Eye,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  FileText,
  Box,
  Home,
  LayoutDashboard
} from 'lucide-react';
import styles from '@/styles/modules/InventoryCommon.module.css';

const AlertList = () => {
  const { language } = useLanguage();
  const {
    state,
    loadAlerts,
    resolveAlert,
    loadProducts,
    loadWarehouses,
  } = useInventory();

  // ============================================
  // Translations
  // ============================================
  const t = {
    title: language === 'fa' ? 'هشدارهای موجودی' : 'Stock Alerts',
    subtitle: language === 'fa' ? 'مدیریت و نظارت بر هشدارهای موجودی کالا' : 'Manage and monitor stock alerts',
    refresh: language === 'fa' ? 'بروزرسانی' : 'Refresh',
    dashboard: language === 'fa' ? 'داشبورد اصلی' : 'Dashboard',
    manageWarehouses: language === 'fa' ? 'مدیریت انبارها' : 'Manage Warehouses',
    manageProducts: language === 'fa' ? 'مدیریت کالاها' : 'Manage Products',
    transactionHistory: language === 'fa' ? 'تاریخچه تراکنش‌ها' : 'Transaction History',
    managePersons: language === 'fa' ? 'افراد مجاز' : 'Authorized Persons',
    manageAlerts: language === 'fa' ? 'هشدارها' : 'Alerts',
    units: language === 'fa' ? 'واحدها' : 'Units',
    totalAlerts: language === 'fa' ? 'کل هشدارها' : 'Total Alerts',
    critical: language === 'fa' ? 'بحرانی' : 'Critical',
    warning: language === 'fa' ? 'هشدار' : 'Warning',
    info: language === 'fa' ? 'اطلاعاتی' : 'Info',
    resolved: language === 'fa' ? 'برطرف شده' : 'Resolved',
    unresolved: language === 'fa' ? 'فعال' : 'Active',
    viewDetail: language === 'fa' ? 'مشاهده جزئیات' : 'View Details',
    resolveAlert: language === 'fa' ? 'برطرف کردن هشدار' : 'Resolve Alert',
  };

  // ============================================
  // State Management
  // ============================================
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterResolved, setFilterResolved] = useState('false');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showAlertDetail, setShowAlertDetail] = useState(false);
  const [resolvingAlert, setResolvingAlert] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    warning: 0,
    info: 0,
    resolved: 0,
    unresolved: 0,
  });

  // ============================================
  // Refs
  // ============================================
  const isMounted = useRef(true);
  const fetchTimer = useRef(null);
  const isFetching = useRef(false);
  const initialLoadDone = useRef(false);

  // ============================================
  // Lifecycle
  // ============================================
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (fetchTimer.current) {
        clearTimeout(fetchTimer.current);
      }
    };
  }, []);

  // ============================================
  // Core Functions
  // ============================================
  const fetchInitialData = useCallback(async () => {
    try {
      await Promise.all([
        loadProducts(),
        loadWarehouses(),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }, [loadProducts, loadWarehouses]);

  const fetchAlerts = useCallback(async () => {
    if (isFetching.current || !isMounted.current) return;
    
    isFetching.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      const trimmedSearch = searchTerm?.trim() || '';
      const params = {
        page,
        limit: 20,
        is_resolved: filterResolved === 'true' ? true : filterResolved === 'false' ? false : undefined,
      };
      
      if (trimmedSearch.length === 0 || trimmedSearch.length >= 3) {
        params.search = trimmedSearch;
      }
      
      if (filterType) {
        params.alert_type = filterType;
      }
      
      if (filterLevel) {
        params.level = filterLevel;
      }
      
      if (filterWarehouse) {
        params.warehouse = filterWarehouse;
      }
      
      if (filterProduct) {
        params.product = filterProduct;
      }
      
      console.log('📦 Fetching alerts:', params);
      const data = await loadAlerts(params);
      
      // محاسبه آمار
      const alerts = data || [];
      setStats({
        total: alerts.length,
        critical: alerts.filter(a => a.level === 'CRITICAL').length,
        warning: alerts.filter(a => a.level === 'WARNING').length,
        info: alerts.filter(a => a.level === 'INFO').length,
        resolved: alerts.filter(a => a.is_resolved).length,
        unresolved: alerts.filter(a => !a.is_resolved).length,
      });
      
    } catch (err) {
      console.error('❌ Error loading alerts:', err);
      setError(err.message || 'خطا در بارگذاری هشدارها');
    } finally {
      if (isMounted.current) {
        isFetching.current = false;
        setIsLoading(false);
      }
    }
  }, [page, searchTerm, filterType, filterLevel, filterWarehouse, filterProduct, filterResolved, loadAlerts]);

  // ============================================
  // Debounced Fetch
  // ============================================
  const debouncedFetch = useCallback(() => {
    if (fetchTimer.current) {
      clearTimeout(fetchTimer.current);
    }
    fetchTimer.current = setTimeout(() => {
      fetchAlerts();
    }, 500);
  }, [fetchAlerts]);

  // ============================================
  // Effects
  // ============================================
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchInitialData();
      fetchAlerts();
    }
    return () => {
      if (fetchTimer.current) {
        clearTimeout(fetchTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (initialLoadDone.current) {
      const trimmed = searchTerm?.trim() || '';
      if (trimmed.length === 0 || trimmed.length >= 3) {
        debouncedFetch();
      }
    }
  }, [page, searchTerm, filterType, filterLevel, filterWarehouse, filterProduct, filterResolved]);

  // ============================================
  // Handlers
  // ============================================
  const handleResolve = useCallback(async () => {
    if (!resolvingAlert) return;
    
    try {
      await resolveAlert(resolvingAlert.id);
      setResolvingAlert(null);
      await fetchAlerts();
    } catch (err) {
      console.error('Error resolving alert:', err);
      setError(err.message || 'خطا در برطرف کردن هشدار');
    }
  }, [resolvingAlert, resolveAlert, fetchAlerts]);

  const handleRefresh = useCallback(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage !== page && newPage > 0) {
      setPage(newPage);
    }
  }, [page]);

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setPage(1);
  }, []);

  const handleFilterType = useCallback((value) => {
    setFilterType(value);
    setPage(1);
  }, []);

  const handleFilterLevel = useCallback((value) => {
    setFilterLevel(value);
    setPage(1);
  }, []);

  const handleFilterWarehouse = useCallback((value) => {
    setFilterWarehouse(value);
    setPage(1);
  }, []);

  const handleFilterProduct = useCallback((value) => {
    setFilterProduct(value);
    setPage(1);
  }, []);

  const handleFilterResolved = useCallback((value) => {
    setFilterResolved(value);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilterType('');
    setFilterLevel('');
    setFilterWarehouse('');
    setFilterProduct('');
    setFilterResolved('false');
    setSearchTerm('');
    setPage(1);
  }, []);

  const handleViewDetail = useCallback((row) => {
    setSelectedAlert(row);
    setShowAlertDetail(true);
  }, []);

  const handleResolveClick = useCallback((row) => {
    setResolvingAlert(row);
  }, []);

  // ============================================
  // Helper Functions
  // ============================================
  const getLevelLabel = useCallback((level) => {
    const map = {
      CRITICAL: { 
        label: t.critical, 
        className: styles.levelCritical, 
        icon: <AlertCircle size={14} />
      },
      WARNING: { 
        label: t.warning, 
        className: styles.levelWarning, 
        icon: <AlertTriangle size={14} />
      },
      INFO: { 
        label: t.info, 
        className: styles.levelInfo, 
        icon: <CheckCircle size={14} />
      },
    };
    return map[level] || { label: level, className: '', icon: null };
  }, [t]);

  const getTypeLabel = useCallback((type) => {
    const map = {
      LOW_STOCK: { label: 'موجودی کم', icon: <TrendingDown size={14} /> },
      NO_STOCK: { label: 'تمام شده', icon: <CircleX size={14} /> },
      OVER_STOCK: { label: 'موجودی بیش از حد', icon: <TrendingUp size={14} /> },
    };
    return map[type] || { label: type, icon: null };
  }, []);

  const getSearchPlaceholder = () => {
    return 'جستجوی هشدارها... (نام کالا یا پیام - حداقل ۳ حرف)';
  };

  // ============================================
  // Memoized Values
  // ============================================
  const totalItems = state.alerts?.length || 0;
  const isLoading_state = state.loading.alerts || isLoading;

  const columns = useMemo(() => [
    {
      header: 'سطح',
      render: (row) => {
        const level = getLevelLabel(row.level);
        return (
          <span className={`${styles.levelBadge} ${level.className}`}>
            {level.icon}
            {level.label}
          </span>
        );
      },
      cellClassName: styles.colLevel,
    },
    {
      header: 'نوع',
      render: (row) => {
        const type = getTypeLabel(row.alert_type);
        return (
          <span className={styles.typeCell}>
            {type.icon}
            {type.label}
          </span>
        );
      },
      cellClassName: styles.colType,
    },
    {
      header: 'کالا',
      render: (row) => (
        <div className={styles.productCell}>
          <Package size={14} className={styles.productIcon} />
          <span>{row.product_title || row.product || '—'}</span>
        </div>
      ),
      cellClassName: styles.colProduct,
    },
    {
      header: 'انبار',
      render: (row) => (
        <div className={styles.warehouseCell}>
          <Building2 size={14} className={styles.warehouseIcon} />
          <span>{row.warehouse_title || 'همه انبارها'}</span>
        </div>
      ),
      cellClassName: styles.colWarehouse,
    },
    {
      header: 'موجودی فعلی',
      render: (row) => (
        <span className={styles.quantityCell}>
          {row.current_quantity || 0}
        </span>
      ),
      cellClassName: styles.colQuantity,
    },
    {
      header: 'وضعیت',
      render: (row) => (
        <span className={row.is_resolved ? styles.resolvedBadge : styles.unresolvedBadge}>
          {row.is_resolved ? (
            <>
              <CheckCircle size={12} />
              {t.resolved}
            </>
          ) : (
            <>
              <Clock size={12} />
              {t.unresolved}
            </>
          )}
        </span>
      ),
      cellClassName: styles.colStatus,
    },
    {
      header: 'تاریخ',
      render: (row) => (
        <span className={styles.dateCell}>
          {new Date(row.created_at).toLocaleDateString('fa-IR')}
        </span>
      ),
      cellClassName: styles.colDate,
    },
  ], [getLevelLabel, getTypeLabel, t]);

  const actions = useMemo(() => [
    {
      label: t.viewDetail,
      icon: <Eye size={16} />,
      onClick: handleViewDetail,
    },
    {
      label: t.resolveAlert,
      icon: <CheckCircle size={16} />,
      onClick: (row) => {
        if (!row.is_resolved) {
          handleResolveClick(row);
        }
      },
      disabled: (row) => row.is_resolved,
    },
  ], [handleViewDetail, handleResolveClick, t]);

  // ============================================
  // Render
  // ============================================
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
            <Link href="/inventory/alerts" className={`${styles.actionCard} ${styles.actionCardActive}`}>
              <AlertTriangle size={20} style={{ color: '#c62828' }} />
              <span>{t.manageAlerts}</span>
            </Link>
            <Link href="/inventory/units" className={styles.actionCard}>
              <Box size={20} style={{ color: '#e65100' }} />
              <span>{t.units}</span>
            </Link>
          </div>
        </div>

        {/* ===== Header ===== */}
        <div className={styles.inventoryHeader}>
          <div>
            <h1 className={styles.pageTitle}>
              <AlertTriangle className={styles.titleIcon} size={28} />
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
          </div>
        </div>

        {/* ===== Error ===== */}
        {error && (
          <div className={styles.errorAlert}>
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* ===== Stats Grid ===== */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#e3f2fd' }}>
              <AlertTriangle className={styles.statIcon} style={{ color: '#1976d2' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.total}</span>
              <span className={styles.statLabel}>{t.totalAlerts}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#ffebee' }}>
              <AlertCircle className={styles.statIcon} style={{ color: '#c62828' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.critical}</span>
              <span className={styles.statLabel}>{t.critical}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#fff3e0' }}>
              <AlertTriangle className={styles.statIcon} style={{ color: '#f57c00' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.warning}</span>
              <span className={styles.statLabel}>{t.warning}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#e3f2fd' }}>
              <CheckCircle className={styles.statIcon} style={{ color: '#1976d2' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.info}</span>
              <span className={styles.statLabel}>{t.info}</span>
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
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#ffebee' }}>
              <Clock className={styles.statIcon} style={{ color: '#c62828' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.unresolved}</span>
              <span className={styles.statLabel}>{t.unresolved}</span>
            </div>
          </div>
        </div>

        {/* ===== Search & Filter ===== */}
        <div className={styles.searchSection}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder={getSearchPlaceholder()}
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
              {(filterType || filterLevel || filterWarehouse || filterProduct || filterResolved !== 'false') && (
                <span className={styles.filterBadge}>●</span>
              )}
            </button>
            {(filterType || filterLevel || filterWarehouse || filterProduct || filterResolved !== 'false') && (
              <button 
                className={styles.clearFiltersBtn}
                onClick={clearFilters}
              >
                پاک کردن فیلترها
              </button>
            )}
          </div>
          <span className={styles.totalCount}>
            {isLoading_state ? 'در حال بارگذاری...' : `${totalItems} هشدار`}
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
                onChange={(e) => handleFilterType(e.target.value)}
                disabled={isLoading_state}
              >
                <option value="">همه</option>
                <option value="LOW_STOCK">موجودی کم</option>
                <option value="NO_STOCK">تمام شده</option>
                <option value="OVER_STOCK">موجودی بیش از حد</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>سطح هشدار</label>
              <select
                className={styles.filterSelect}
                value={filterLevel}
                onChange={(e) => handleFilterLevel(e.target.value)}
                disabled={isLoading_state}
              >
                <option value="">همه</option>
                <option value="CRITICAL">{t.critical}</option>
                <option value="WARNING">{t.warning}</option>
                <option value="INFO">{t.info}</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>وضعیت</label>
              <select
                className={styles.filterSelect}
                value={filterResolved}
                onChange={(e) => handleFilterResolved(e.target.value)}
                disabled={isLoading_state}
              >
                <option value="false">{t.unresolved}</option>
                <option value="true">{t.resolved}</option>
                <option value="">همه</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>انبار</label>
              <select
                className={styles.filterSelect}
                value={filterWarehouse}
                onChange={(e) => handleFilterWarehouse(e.target.value)}
                disabled={isLoading_state}
              >
                <option value="">همه انبارها</option>
                {state.warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.title}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>کالا</label>
              <select
                className={styles.filterSelect}
                value={filterProduct}
                onChange={(e) => handleFilterProduct(e.target.value)}
                disabled={isLoading_state}
              >
                <option value="">همه کالاها</option>
                {state.products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
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

        {/* ===== Table ===== */}
        <DataTable
          columns={columns}
          data={state.alerts || []}
          loading={isLoading_state}
          actions={actions}
          searchable={false}
          pagination={{
            page,
            total: totalItems,
            pageSize: 20,
          }}
          onPageChange={handlePageChange}
          emptyMessage={
            searchTerm && searchTerm.length >= 3 
              ? 'نتیجه‌ای یافت نشد' 
              : 'هیچ هشداری یافت نشد'
          }
          onRowClick={handleViewDetail}
        />

        {/* ===== Resolve Confirmation ===== */}
        <ConfirmDialog
          isOpen={!!resolvingAlert}
          onClose={() => setResolvingAlert(null)}
          onConfirm={handleResolve}
          title={t.resolveAlert}
          message={`آیا از برطرف کردن هشدار "${resolvingAlert?.product_title || ''}" اطمینان دارید؟`}
          confirmText={t.resolveAlert}
          confirmColor="success"
          loading={isLoading_state}
        />

        {/* ===== Alert Detail Modal ===== */}
        <Modal
          isOpen={showAlertDetail}
          onClose={() => {
            setShowAlertDetail(false);
            setSelectedAlert(null);
          }}
          title={t.viewDetail}
          size="md"
        >
          {selectedAlert && (
            <div className={styles.alertDetail}>
              <div className={styles.detailHeader}>
                <div className={styles.detailLevel}>
                  <span className={`${styles.levelBadge} ${getLevelLabel(selectedAlert.level).className}`}>
                    {getLevelLabel(selectedAlert.level).icon}
                    {getLevelLabel(selectedAlert.level).label}
                  </span>
                  <span className={styles.detailType}>
                    {getTypeLabel(selectedAlert.alert_type).icon}
                    {getTypeLabel(selectedAlert.alert_type).label}
                  </span>
                </div>
                <span className={selectedAlert.is_resolved ? styles.resolvedBadge : styles.unresolvedBadge}>
                  {selectedAlert.is_resolved ? (
                    <>
                      <CheckCircle size={14} />
                      {t.resolved}
                    </>
                  ) : (
                    <>
                      <Clock size={14} />
                      {t.unresolved}
                    </>
                  )}
                </span>
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>کالا:</span>
                  <span className={styles.detailValue}>
                    <Package size={14} />
                    {selectedAlert.product_title || selectedAlert.product}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>انبار:</span>
                  <span className={styles.detailValue}>
                    <Building2 size={14} />
                    {selectedAlert.warehouse_title || 'همه انبارها'}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>موجودی فعلی:</span>
                  <span className={`${styles.detailValue} ${styles.detailQuantity}`}>
                    {selectedAlert.current_quantity || 0}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>آستانه:</span>
                  <span className={styles.detailValue}>
                    {selectedAlert.threshold || 0}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>پیام:</span>
                  <span className={styles.detailMessage}>
                    {selectedAlert.message}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>تاریخ ایجاد:</span>
                  <span className={styles.detailValue}>
                    {new Date(selectedAlert.created_at).toLocaleDateString('fa-IR')}
                    {' '}
                    {new Date(selectedAlert.created_at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {selectedAlert.resolved_at && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>تاریخ برطرف شدن:</span>
                    <span className={styles.detailValue}>
                      {new Date(selectedAlert.resolved_at).toLocaleDateString('fa-IR')}
                      {' '}
                      {new Date(selectedAlert.resolved_at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>

              {!selectedAlert.is_resolved && (
                <div className={styles.detailActions}>
                  <button 
                    className={styles.resolveBtn}
                    onClick={() => {
                      setShowAlertDetail(false);
                      handleResolveClick(selectedAlert);
                    }}
                  >
                    <CheckCircle size={18} />
                    {t.resolveAlert}
                  </button>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AlertList;