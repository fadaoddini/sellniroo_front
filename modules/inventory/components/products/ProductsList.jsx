// modules/inventory/components/Products/ProductList.jsx
'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInventory } from '../context/InventoryContext';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import ProductForm from './ProductForm';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Package,
  TrendingUp, 
  TrendingDown,
  Search,
  X,
  RefreshCw,
  AlertCircle,
  Filter,
  Box,
  Tag,
  Layers,
  Building2,
  FileText,
  Users,
  AlertTriangle,
  Home,
  LayoutDashboard
} from 'lucide-react';
import styles from '@/styles/modules/InventoryCommon.module.css';

const ProductList = () => {
  const { language } = useLanguage();
  const {
    state,
    loadProducts,
    deleteProduct,
    createProduct,
    updateProduct,
    loadCategories,
    loadUnits,
  } = useInventory();

  
  // ============================================
  // Translations
  // ============================================
  const t = {
    title: language === 'fa' ? 'مدیریت کالاها' : 'Products Management',
    subtitle: language === 'fa' ? 'مدیریت و نظارت بر کالاهای سازمان' : 'Manage and monitor organization products',
    refresh: language === 'fa' ? 'بروزرسانی' : 'Refresh',
    dashboard: language === 'fa' ? 'داشبورد اصلی' : 'Dashboard',
    manageWarehouses: language === 'fa' ? 'مدیریت انبارها' : 'Manage Warehouses',
    manageProducts: language === 'fa' ? 'مدیریت کالاها' : 'Manage Products',
    transactionHistory: language === 'fa' ? 'تاریخچه تراکنش‌ها' : 'Transaction History',
    managePersons: language === 'fa' ? 'افراد مجاز' : 'Authorized Persons',
    manageAlerts: language === 'fa' ? 'هشدارها' : 'Alerts',
    units: language === 'fa' ? 'واحدها' : 'Units',
    newProduct: language === 'fa' ? 'کالای جدید' : 'New Product',
    totalProducts: language === 'fa' ? 'کل کالاها' : 'Total Products',
    inStock: language === 'fa' ? 'موجود' : 'In Stock',
    lowStock: language === 'fa' ? 'موجودی کم' : 'Low Stock',
    outOfStock: language === 'fa' ? 'تمام شده' : 'Out of Stock',
  };

  // ============================================
  // State Management
  // ============================================
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

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
  const fetchProducts = useCallback(async () => {
    if (isFetching.current || !isMounted.current) return;
    
    isFetching.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      const trimmedSearch = searchTerm?.trim() || '';
      const params = {
        page,
        limit: 20,
      };
      
      if (trimmedSearch.length === 0 || trimmedSearch.length >= 3) {
        params.search = trimmedSearch;
      }
      
      if (filterCategory) {
        params.category = filterCategory;
      }
      
      if (filterStatus) {
        params.status = filterStatus;
      }
      
      console.log('📦 Fetching products:', params);
      await loadProducts(params);
      
    } catch (err) {
      console.error('❌ Error loading products:', err);
      setError(err.message || 'خطا در بارگذاری کالاها');
    } finally {
      if (isMounted.current) {
        isFetching.current = false;
        setIsLoading(false);
      }
    }
  }, [page, searchTerm, filterCategory, filterStatus, loadProducts]);

  // ============================================
  // Debounced Fetch
  // ============================================
  const debouncedFetch = useCallback(() => {
    if (fetchTimer.current) {
      clearTimeout(fetchTimer.current);
    }
    fetchTimer.current = setTimeout(() => {
      fetchProducts();
    }, 500);
  }, [fetchProducts]);

  // ============================================
  // Effects
  // ============================================
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchProducts();
      loadCategories();
      loadUnits();
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
  }, [page, searchTerm, filterCategory, filterStatus]);

  // ============================================
  // Handlers
  // ============================================
  const handleDelete = useCallback(async () => {
    if (!deletingItem) return;
    
    try {
      await deleteProduct(deletingItem.id);
      setDeletingItem(null);
      await fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.message || 'خطا در حذف کالا');
    }
  }, [deletingItem, deleteProduct, fetchProducts]);

  const handleSubmit = useCallback(
    async (data) => {
      try {
        if (editingItem) {
          await updateProduct(editingItem.id, data);
        } else {
          await createProduct(data);
        }
        setShowForm(false);
        setEditingItem(null);
        await fetchProducts();
      } catch (err) {
        console.error('Error submitting product:', err);
        setError(err.message || 'خطا در ذخیره کالا');
      }
    },
    [editingItem, createProduct, updateProduct, fetchProducts]
  );

  const handleRefresh = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

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

  const handleAddNew = useCallback(() => {
    setEditingItem(null);
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((row) => {
    setEditingItem(row);
    setShowForm(true);
  }, []);

  const handleDeleteClick = useCallback((row) => {
    setDeletingItem(row);
  }, []);

  const handleCategoryFilter = useCallback((value) => {
    setFilterCategory(value);
    setPage(1);
  }, []);

  const handleStatusFilter = useCallback((value) => {
    setFilterStatus(value);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilterCategory('');
    setFilterStatus('');
    setSearchTerm('');
    setPage(1);
  }, []);

  // ============================================
  // Helper Functions
  // ============================================
  const getStockStatus = useCallback((product) => {
    const total = product.total_stock || 0;
    const minAlert = product.min_stock_alert || 10;
    
    if (total <= 0) {
      return { 
        label: 'تمام شده', 
        className: styles.statusOutOfStock,
        icon: <TrendingDown size={14} />
      };
    }
    if (total <= minAlert) {
      return { 
        label: 'موجودی کم', 
        className: styles.statusLowStock,
        icon: <AlertCircle size={14} />
      };
    }
    return { 
      label: 'موجودی کافی', 
      className: styles.statusInStock,
      icon: <TrendingUp size={14} />
    };
  }, []);

  const getStockBar = useCallback((product) => {
    const total = product.total_stock || 0;
    const minAlert = product.min_stock_alert || 10;
    const maxStock = Math.max(total, minAlert * 2, 100);
    const percentage = Math.min((total / maxStock) * 100, 100);
    const color = total <= 0 ? '#c62828' : total <= minAlert ? '#f57c00' : '#2e7d32';
    
    return (
      <div className={styles.stockBarWrapper}>
        <div className={styles.stockBarTrack}>
          <div 
            className={styles.stockBarFill} 
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>
        <span className={styles.stockBarValue}>{total}</span>
      </div>
    );
  }, []);

  // ============================================
  // Memoized Values
  // ============================================
  const totalItems = state.products?.length || 0;
  const isLoading_state = state.loading.products || isLoading;

  const getSearchPlaceholder = () => {
    return 'جستجوی کالا... (کد یا عنوان - حداقل ۳ حرف)';
  };

  const columns = useMemo(() => [
    { 
      header: 'کد', 
      render: (row) => (
        <span className={styles.productCode}>{row.code}</span>
      ),
      cellClassName: styles.colCode,
    },
    { 
      header: 'عنوان کالا', 
      render: (row) => (
        <div className={styles.productNameCell}>
          {row.main_image ? (
            <img 
              src={row.main_image} 
              alt={row.title} 
              className={styles.productThumb}
            />
          ) : (
            <div className={styles.productThumbPlaceholder}>
              <Package size={20} />
            </div>
          )}
          <div className={styles.productNameInfo}>
            <span className={styles.productName}>{row.title}</span>
            {row.specifications && Object.keys(row.specifications).length > 0 && (
              <span className={styles.productSpecs}>
                {Object.entries(row.specifications).slice(0, 2).map(([key, value]) => (
                  <span key={key} className={styles.specTag}>
                    {key}: {value}
                  </span>
                ))}
                {Object.keys(row.specifications).length > 2 && (
                  <span className={styles.specMore}>+{Object.keys(row.specifications).length - 2}</span>
                )}
              </span>
            )}
          </div>
        </div>
      ),
      cellClassName: styles.colProduct,
    },
    { 
      header: 'دسته‌بندی', 
      render: (row) => (
        <span className={styles.categoryTag}>
          <Tag size={12} />
          {row.category_title || '—'}
        </span>
      ),
      cellClassName: styles.colCategory,
    },
    { 
      header: 'واحد پایه', 
      render: (row) => (
        <span className={styles.unitTag}>
          <Layers size={12} />
          {row.base_unit_title || '—'}
        </span>
      ),
      cellClassName: styles.colUnit,
    },
    { 
      header: 'موجودی', 
      render: (row) => getStockBar(row),
      cellClassName: styles.colStock,
    },
    { 
      header: 'وضعیت', 
      render: (row) => {
        const status = getStockStatus(row);
        return (
          <span className={`${styles.statusBadge} ${status.className}`}>
            {status.icon}
            {status.label}
          </span>
        );
      },
      cellClassName: styles.colStatus,
    },
    { 
      header: 'فعال', 
      render: (row) => (
        <span className={row.is_active ? styles.activeBadge : styles.inactiveBadge}>
          {row.is_active ? 'فعال' : 'غیرفعال'}
        </span>
      ),
      cellClassName: styles.colActive,
    },
  ], [getStockStatus, getStockBar]);

  const actions = useMemo(() => [
    {
      label: 'مشاهده موجودی',
      icon: <Eye size={16} />,
      onClick: (row) => {
        console.log('View product stock:', row);
      },
    },
    {
      label: 'ویرایش',
      icon: <Edit size={16} />,
      onClick: handleEdit,
    },
    {
      label: 'حذف',
      icon: <Trash2 size={16} />,
      onClick: handleDeleteClick,
    },
  ], [handleEdit, handleDeleteClick]);

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
            <Link href="/inventory/products" className={`${styles.actionCard} ${styles.actionCardActive}`}>
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
              <Package className={styles.titleIcon} size={28} />
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
              className={styles.primaryBtn} 
              onClick={handleAddNew}
              disabled={isLoading_state}
            >
              <Plus size={18} />
              {t.newProduct}
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
              <Package className={styles.statIcon} style={{ color: '#1976d2' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{totalItems}</span>
              <span className={styles.statLabel}>{t.totalProducts}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#e8f5e9' }}>
              <TrendingUp className={styles.statIcon} style={{ color: '#2e7d32' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {state.products?.filter(p => (p.total_stock || 0) > (p.min_stock_alert || 10)).length || 0}
              </span>
              <span className={styles.statLabel}>{t.inStock}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#fff3e0' }}>
              <AlertCircle className={styles.statIcon} style={{ color: '#f57c00' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {state.products?.filter(p => (p.total_stock || 0) <= (p.min_stock_alert || 10) && (p.total_stock || 0) > 0).length || 0}
              </span>
              <span className={styles.statLabel}>{t.lowStock}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#ffebee' }}>
              <TrendingDown className={styles.statIcon} style={{ color: '#c62828' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {state.products?.filter(p => (p.total_stock || 0) <= 0).length || 0}
              </span>
              <span className={styles.statLabel}>{t.outOfStock}</span>
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
              {(filterCategory || filterStatus) && (
                <span className={styles.filterBadge}>●</span>
              )}
            </button>
            {(filterCategory || filterStatus) && (
              <button 
                className={styles.clearFiltersBtn}
                onClick={clearFilters}
              >
                پاک کردن فیلترها
              </button>
            )}
          </div>
          <span className={styles.totalCount}>
            {isLoading_state ? 'در حال بارگذاری...' : `${totalItems} کالا`}
          </span>
        </div>

        {/* ===== Filter Panel ===== */}
        {showFilterPanel && (
          <div className={styles.filterPanel}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>دسته‌بندی</label>
              <select
                className={styles.filterSelect}
                value={filterCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                disabled={isLoading_state}
              >
                <option value="">همه دسته‌ها</option>
                {state.categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>وضعیت موجودی</label>
              <select
                className={styles.filterSelect}
                value={filterStatus}
                onChange={(e) => handleStatusFilter(e.target.value)}
                disabled={isLoading_state}
              >
                <option value="">همه وضعیت‌ها</option>
                <option value="in_stock">موجود</option>
                <option value="low_stock">موجودی کم</option>
                <option value="out_of_stock">تمام شده</option>
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
          data={state.products || []}
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
              : 'هیچ کالایی یافت نشد'
          }
          onRowClick={(row) => {
            console.log('Product clicked:', row);
          }}
        />

        {/* ===== Form Modal ===== */}
        <Modal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          title={editingItem ? 'ویرایش کالا' : 'ایجاد کالای جدید'}
          size="xl"
        >
          <ProductForm
            initialData={editingItem}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
            loading={isLoading_state}
            categories={state.categories}
            units={state.units}
          />
        </Modal>

        {/* ===== Delete Confirmation ===== */}
        <ConfirmDialog
          isOpen={!!deletingItem}
          onClose={() => setDeletingItem(null)}
          onConfirm={handleDelete}
          title="حذف کالا"
          message={`آیا از حذف کالا "${deletingItem?.title}" اطمینان دارید؟`}
          confirmText="حذف"
          loading={isLoading_state}
        />
      </div>
    </div>
  );
};

export default ProductList;