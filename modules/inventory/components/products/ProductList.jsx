// modules/inventory/components/products/ProductList.jsx

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInventory } from '@/modules/inventory/context/InventoryContext';
import Config from '@/config/config';

import Modal from '@/modules/inventory/components/common/Modal';
import ConfirmDialog from '@/modules/inventory/components/common/ConfirmDialog';
import ProductForm from './ProductForm';
import ProductDetail from './ProductDetail';
import { 
  Plus, Package, RefreshCw, List, Grid, 
  CheckCircle, Circle, AlertCircle, Tag, 
  Search, Filter, Layers, 
  Eye, Edit, Trash2, X, ChevronDown, ChevronRight,
} from 'lucide-react';
import styles from './ProductList.module.css';
import { getFactorToRoot, quantityInUnit } from '../../utils/unitStock';

const ProductList = () => {
  const { language } = useLanguage();
  const {
    state,
    loadProducts,
    loadCategories,
    loadUnits,
    loadUnitRoots,
    loadWarehouses,
    deleteProduct,
    createProduct,
    updateProduct,
    loadDashboardStats,
  } = useInventory();

  // ============================================
  // State
  // ============================================
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [productData, setProductData] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [stockDataMap, setStockDataMap] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    lowStock: 0,
    categories: 0,
  });

  const initialLoadDone = useRef(false);
  const fetchInProgress = useRef(false);

  // ============================================
  // Translations
  // ============================================
  const t = useMemo(() => ({
    pageTitle: language === 'fa' ? 'مدیریت کالاها' : 'Products Management',
    subtitle: language === 'fa' ? 'مدیریت کالاها و موجودی' : 'Manage products and inventory',
    refresh: language === 'fa' ? 'بروزرسانی' : 'Refresh',
    newProduct: language === 'fa' ? 'کالای جدید' : 'New Product',
    editProduct: language === 'fa' ? 'ویرایش کالا' : 'Edit Product',
    totalProducts: language === 'fa' ? 'کل کالاها' : 'Total Products',
    active: language === 'fa' ? 'فعال' : 'Active',
    inactive: language === 'fa' ? 'غیرفعال' : 'Inactive',
    lowStock: language === 'fa' ? 'موجودی کم' : 'Low Stock',
    categories: language === 'fa' ? 'دسته‌بندی‌ها' : 'Categories',
    viewDetail: language === 'fa' ? 'مشاهده جزئیات' : 'View Details',
    edit: language === 'fa' ? 'ویرایش' : 'Edit',
    delete: language === 'fa' ? 'حذف' : 'Delete',
    code: language === 'fa' ? 'کد کالا' : 'Product Code',
    columnTitle: language === 'fa' ? 'عنوان' : 'Title',
    category: language === 'fa' ? 'دسته‌بندی' : 'Category',
    stock: language === 'fa' ? 'موجودی' : 'Stock',
    unit: language === 'fa' ? 'واحد' : 'Unit',
    status: language === 'fa' ? 'وضعیت' : 'Status',
    noProducts: language === 'fa' ? 'هیچ کالایی یافت نشد' : 'No products found',
    gridView: language === 'fa' ? 'نمایش شبکه‌ای' : 'Grid View',
    listView: language === 'fa' ? 'نمایش لیستی' : 'List View',
    allCategories: language === 'fa' ? 'همه دسته‌بندی‌ها' : 'All Categories',
    allStatus: language === 'fa' ? 'همه وضعیت‌ها' : 'All Status',
    searchPlaceholder: language === 'fa' ? 'جستجوی کالاها (عنوان یا کد)...' : 'Search products (title or code)...',
    stockInRoot: language === 'fa' ? 'موجودی (واحد اصلی)' : 'Stock (Base Unit)',
    close: language === 'fa' ? 'بستن' : 'Close',
    showAllLevels: language === 'fa' ? 'نمایش همه سطوح' : 'Show All Levels',
    hideLevels: language === 'fa' ? 'بستن سطوح' : 'Hide Levels',
    total: language === 'fa' ? 'کل' : 'Total',
    reserved: language === 'fa' ? 'رزرو' : 'Reserved',
    available: language === 'fa' ? 'قابل استفاده' : 'Available',
    buffer: language === 'fa' ? 'بافر' : 'Buffer',
    factor: language === 'fa' ? 'ضریب' : 'Factor',
    rootUnit: language === 'fa' ? 'واحد اصلی' : 'Root Unit',
  }), [language]);

  // ============================================
  // دریافت Auth Headers
  // ============================================
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // ============================================
  // دریافت stock_items برای یک محصول (با کش)
  // ============================================
  const fetchStockForProduct = useCallback(async (productId) => {
    try {
      const url = Config.endpoints.inventory.products.stockItems(productId);
      const response = await axios.get(url, { headers: getAuthHeaders() });
      
      // لاگ برای دیباگ
      console.log(`📦 Stock for product ${productId}:`, response.data?.data);
      
      return response.data?.data || [];
    } catch (err) {
      console.warn(`⚠️ Could not fetch stock for product ${productId}:`, err.message);
      return [];
    }
  }, [getAuthHeaders]);

  // ============================================
  // دریافت stock_items برای همه محصولات
  // ============================================
  const fetchAllStockData = useCallback(async (products) => {
    if (!products || products.length === 0) return {};
    
    const stockMap = {};
    const promises = products.map(async (product) => {
      const stockItems = await fetchStockForProduct(product.id);
      stockMap[product.id] = stockItems;
    });
    
    await Promise.all(promises);
    
    console.log('📦 All stock data loaded:', stockMap);
    return stockMap;
  }, [fetchStockForProduct]);

  // ============================================
  // دریافت تمام سطوح موجودی با بافر - نسخه نهایی
  // ============================================
  const getProductAllLevels = useCallback((product) => {
    if (!product || !state.units) return [];
    
    const rootUnit = state.units.find(u => u.id === product.root_unit);
    if (!rootUnit) return [];
    
    const getAllDescendants = (unitId) => {
      const children = state.units.filter(u => u.parent === unitId && u.is_active !== false);
      let result = [...children];
      for (const child of children) {
        result = [...result, ...getAllDescendants(child.id)];
      }
      return result;
    };
    
    const allUnits = [rootUnit, ...getAllDescendants(rootUnit.id)];
    
    // ✅ دریافت stock_items از map
    const stockItems = stockDataMap[product.id] || [];
    
    console.log(`🔍 Product ${product.id} - Stock Items:`, stockItems);
    
    let rootStock = 0;
    let rootReserved = 0;
    let packagingBuffer = {};
    
    if (stockItems.length > 0) {
      for (const item of stockItems) {
        rootStock += Math.floor(item.quantity || 0);
        rootReserved += Math.floor(item.reserved_quantity || 0);
        
        // ✅ خواندن packaging_buffer
        if (item.packaging_buffer && typeof item.packaging_buffer === 'object') {
          console.log(`📦 Packaging buffer for product ${product.id}:`, item.packaging_buffer);
          for (const [key, value] of Object.entries(item.packaging_buffer)) {
            packagingBuffer[key] = (packagingBuffer[key] || 0) + value;
          }
        }
      }
    }
    
    // ✅ اگر هیچ stock_item وجود نداشت، از total_stock استفاده کن
    if (stockItems.length === 0) {
      rootStock = Math.floor(product.total_stock || 0);
      rootReserved = Math.floor(product.total_reserved || 0);
    }
    
    console.log(`📊 Product ${product.id} - Root Stock: ${rootStock}, Buffer:`, packagingBuffer);
    
    // محاسبه موجودی در هر سطح (با تبدیل همه بافرها مثل بک‌اند)
    const factorsById = {};
    allUnits.forEach((unit) => {
      factorsById[unit.id] = getFactorToRoot(unit, state.units, rootUnit.id);
    });

    const levels = allUnits.map((unit) => {
      const unitIdStr = String(unit.id);
      const factor = factorsById[unit.id] || 1;
      const buffer = packagingBuffer[unitIdStr] || packagingBuffer[unit.id] || 0;
      const reserved = rootReserved * factor;
      const quantity = quantityInUnit({
        targetUnit: unit,
        rootId: rootUnit.id,
        rootStock,
        packagingBuffer,
        unitsList: allUnits,
        factorsById,
      });

      return {
        unitId: unit.id,
        title: unit.title,
        abbreviation: unit.abbreviation || '',
        level: unit.level || 0,
        quantity,
        reserved,
        available: Math.max(0, quantity - reserved),
        buffer,
        isRoot: unit.id === rootUnit.id,
        countInParent: unit.count_in_parent || 1,
        displayFactor: factor,
        fullPath: unit.get_full_path ? unit.get_full_path() : '',
      };
    });
    
    return levels.sort((a, b) => a.level - b.level);
  }, [state.units, stockDataMap]);

  // ============================================
  // Toggle Expand Row
  // ============================================
  const toggleRow = useCallback((productId) => {
    setExpandedRows(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  }, []);

  // ============================================
  // Fetch Products
  // ============================================
  const fetchProducts = useCallback(async (forceRefresh = false) => {
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
      if (filterCategory) {
        params.category = filterCategory;
      }
      if (filterStatus) {
        params.is_active = filterStatus === 'active';
      }
      
      let products = await loadProducts(params);
      
      if (!Array.isArray(products)) {
        if (products?.results) products = products.results;
        else if (products?.data) products = products.data;
        else products = [];
      }
      
      console.log(`📦 Loaded ${products.length} products`);

      // stock_items همراه لیست محصول از API می‌آید
      const stockMap = {}
      products.forEach((product) => {
        stockMap[product.id] = product.stock_items || []
      })
      setStockDataMap(stockMap)
      
      setProductData(products);
      
      const categories = state.categories || [];
      const lowStockCount = products.filter(p => p.is_low_stock).length;
      
      setStats({
        total: products.length,
        active: products.filter(p => p.is_active).length,
        inactive: products.filter(p => !p.is_active).length,
        lowStock: lowStockCount,
        categories: categories.length,
      });
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message || 'خطا در بارگذاری کالاها');
      setProductData([]);
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, [searchTerm, filterCategory, filterStatus, loadProducts, state.categories]);

  // ============================================
  // Effects
  // ============================================
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      Promise.allSettled([
        loadCategories(),
        loadUnits(),
        loadUnitRoots(),
        loadWarehouses(),
        loadDashboardStats(),
      ]).then(() => fetchProducts(true));
    }
  }, []);

  useEffect(() => {
    if (initialLoadDone.current) {
      const timer = setTimeout(() => {
        const trimmed = searchTerm?.trim() || '';
        if (trimmed.length === 0 || trimmed.length >= 3) {
          fetchProducts(true);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, filterCategory, filterStatus]);

  // ============================================
  // Handlers
  // ============================================
  const handleSubmit = useCallback(async (data) => {
    try {
      const submitData = new FormData();
      
      Object.keys(data).forEach(key => {
        if (key === 'images' && Array.isArray(data[key])) {
          data[key].forEach((url, index) => {
            submitData.append(`images[${index}]`, url);
          });
        } else if (key === 'specifications' && typeof data[key] === 'object') {
          submitData.append(key, JSON.stringify(data[key]));
        } else if (key === 'main_image' && data[key] instanceof File) {
          submitData.append('main_image', data[key]);
        } else if (data[key] !== undefined && data[key] !== null) {
          submitData.append(key, data[key]);
        }
      });

      let result;
      if (editingItem) {
        result = await updateProduct(editingItem.id, submitData);
      } else {
        result = await createProduct(submitData);
      }
      
      setShowForm(false);
      setEditingItem(null);
      await fetchProducts(true);
      
    } catch (err) {
      console.error('Error submitting product:', err);
      if (err.response?.data) {
        const errorMessages = Object.values(err.response.data).flat().join(' ');
        setError(errorMessages || err.message || 'خطا در ذخیره کالا');
      } else {
        setError(err.message || 'خطا در ذخیره کالا');
      }
    }
  }, [editingItem, createProduct, updateProduct, fetchProducts]);

  const handleDelete = useCallback(async () => {
    if (!deletingItem) return;
    try {
      await deleteProduct(deletingItem.id);
      setDeletingItem(null);
      await fetchProducts(true);
    } catch (err) {
      setError(err.message || 'خطا در حذف کالا');
    }
  }, [deletingItem, deleteProduct, fetchProducts]);

  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((row) => {
    setEditingItem(row);
    setShowForm(true);
  }, []);

  const handleViewDetail = useCallback((row) => {
    setSelectedProduct(row);
    setShowDetail(true);
  }, []);

  const handleRefresh = useCallback(() => fetchProducts(true), [fetchProducts]);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  }, []);

  const isLoading_state = state.loading.products || isLoading;

  // ============================================
  // Render Helpers
  // ============================================
  const getCategoryName = useCallback((categoryId) => {
    const category = state.categories?.find(c => c.id === categoryId);
    return category?.title || '-';
  }, [state.categories]);

  const getUnitName = useCallback((unitId) => {
    const unit = state.units?.find(u => u.id === unitId);
    return unit?.title || '-';
  }, [state.units]);

  const getUnitFullPath = useCallback((unitId) => {
    const unit = state.units?.find(u => u.id === unitId);
    if (!unit) return '-';
    const path = [unit.title];
    let current = unit;
    while (current.parent) {
      const parent = state.units?.find(u => u.id === current.parent);
      if (parent) {
        path.unshift(parent.title);
        current = parent;
      } else {
        break;
      }
    }
    return path.join(' → ');
  }, [state.units]);

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
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <Package className={styles.titleIcon} size={28} />
            {t.pageTitle}
          </h1>
          <p className={styles.subtitle}>{t.subtitle}</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshBtn} onClick={handleRefresh} disabled={isLoading_state}>
            <RefreshCw size={18} className={isLoading_state ? styles.spinning : ''} />
            <span>{t.refresh}</span>
          </button>
          <button className={styles.secondaryBtn} onClick={toggleViewMode} disabled={isLoading_state}>
            {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
            <span>{viewMode === 'grid' ? t.listView : t.gridView}</span>
          </button>
          <button className={styles.primaryBtn} onClick={handleAdd} disabled={isLoading_state}>
            <Plus size={18} />
            {t.newProduct}
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className={styles.statsGrid}>
        <div className={styles.statCard} style={{ '--stat-color': '#1976d2' }}>
          <div className={styles.statIcon}><Package size={20} /></div>
          <div>
            <div className={styles.statValue}>{stats.total}</div>
            <div className={styles.statLabel}>{t.totalProducts}</div>
          </div>
        </div>
        <div className={styles.statCard} style={{ '--stat-color': '#2e7d32' }}>
          <div className={styles.statIcon}><CheckCircle size={20} /></div>
          <div>
            <div className={styles.statValue}>{stats.active}</div>
            <div className={styles.statLabel}>{t.active}</div>
          </div>
        </div>
        <div className={styles.statCard} style={{ '--stat-color': '#c62828' }}>
          <div className={styles.statIcon}><Circle size={20} /></div>
          <div>
            <div className={styles.statValue}>{stats.inactive}</div>
            <div className={styles.statLabel}>{t.inactive}</div>
          </div>
        </div>
        <div className={styles.statCard} style={{ '--stat-color': '#e65100' }}>
          <div className={styles.statIcon}><AlertCircle size={20} /></div>
          <div>
            <div className={styles.statValue}>{stats.lowStock}</div>
            <div className={styles.statLabel}>{t.lowStock}</div>
          </div>
        </div>
        <div className={styles.statCard} style={{ '--stat-color': '#6c5ce7' }}>
          <div className={styles.statIcon}><Tag size={20} /></div>
          <div>
            <div className={styles.statValue}>{stats.categories}</div>
            <div className={styles.statLabel}>{t.categories}</div>
          </div>
        </div>
      </div>

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
            <button className={styles.clearSearch} onClick={() => setSearchTerm('')}>
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
            {(filterCategory || filterStatus) && <span className={styles.filterBadge}>●</span>}
          </button>
          {(filterCategory || filterStatus) && (
            <button 
              className={styles.clearFiltersBtn}
              onClick={() => { setFilterCategory(''); setFilterStatus(''); setSearchTerm(''); }}
            >
              پاک کردن
            </button>
          )}
        </div>
        <span className={styles.totalCount}>
          {isLoading_state ? 'در حال بارگذاری...' : `${stats.total} کالا`}
        </span>
      </div>

      {showFilterPanel && (
        <div className={styles.filterPanel}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>دسته‌بندی</label>
            <select
              className={styles.filterSelect}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              disabled={isLoading_state}
            >
              <option value="">{t.allCategories}</option>
              {state.categories?.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.title}</option>
              ))}
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
              <option value="inactive">{t.inactive}</option>
            </select>
          </div>
          <button className={styles.filterApplyBtn} onClick={() => setShowFilterPanel(false)}>
            اعمال
          </button>
        </div>
      )}

      {searchTerm && searchTerm.length > 0 && searchTerm.length < 3 && (
        <div className={styles.searchHint}>
          <span>🔍 برای جستجو حداقل ۳ حرف وارد کنید</span>
        </div>
      )}

      {isLoading_state ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>در حال بارگذاری...</p>
        </div>
      ) : productData.length === 0 ? (
        <div className={styles.emptyState}>
          <Package size={48} className={styles.emptyIcon} />
          <p>{t.noProducts}</p>
          <button className={styles.primaryBtn} onClick={handleAdd}>
            <Plus size={16} /> {t.newProduct}
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className={styles.productsGrid}>
          {productData.map(product => {
            const rootUnitName = getUnitName(product.root_unit);
            const stockValue = Math.floor(product.total_stock || 0);
            
            return (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.cardImageWrapper} onClick={() => handleViewDetail(product)}>
                  {product.main_image ? (
                    <Image src={product.main_image} alt={product.title} width={200} height={160} className={styles.cardImage} />
                  ) : (
                    <div className={styles.cardImagePlaceholder}><Package size={40} /></div>
                  )}
                  <div className={styles.cardStatus}>{getStatusBadge(product.is_active)}</div>
                </div>
                
                <div className={styles.cardBody} onClick={() => handleViewDetail(product)}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{product.title}</h3>
                    <span className={styles.cardCode}>{product.code}</span>
                  </div>
                  <div className={styles.cardMeta}>
                    <span><Tag size={14} /> {getCategoryName(product.category)}</span>
                    <span><Layers size={14} /> {rootUnitName}</span>
                  </div>
                  <div className={styles.cardStock}>
                    <span className={styles.cardStockLabel}>{t.stockInRoot}:</span>
                    <span className={`${styles.cardStockValue} ${product.is_low_stock ? styles.lowStock : ''}`}>
                      {stockValue.toLocaleString('fa-IR')}
                    </span>
                    <span className={styles.cardStockUnit}>{rootUnitName}</span>
                  </div>
                  {product.is_low_stock && (
                    <div className={styles.cardWarning}><AlertCircle size={14} /> موجودی کم</div>
                  )}
                </div>
                
                <div className={styles.cardActions}>
                  <button onClick={() => handleViewDetail(product)} title={t.viewDetail}><Eye size={16} /></button>
                  <button onClick={() => handleEdit(product)} title={t.edit}><Edit size={16} /></button>
                  <button onClick={() => setDeletingItem(product)} title={t.delete}><Trash2 size={16} /></button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>تصویر</th>
                <th>کد</th>
                <th>عنوان</th>
                <th>دسته‌بندی</th>
                <th>واحد اصلی</th>
                <th>موجودی</th>
                <th>سطوح</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {productData.map(product => {
                const stockValue = Math.floor(product.total_stock || 0);
                const isExpanded = expandedRows[product.id];
                const levels = getProductAllLevels(product);
                
                return (
                  <React.Fragment key={product.id}>
                    <tr>
                      <td onClick={() => handleViewDetail(product)}>
                        {product.main_image ? (
                          <Image src={product.main_image} alt={product.title} width={40} height={40} className={styles.thumbnail} />
                        ) : (
                          <div className={styles.thumbnailPlaceholder}><Package size={20} /></div>
                        )}
                      </td>
                      <td onClick={() => handleViewDetail(product)}><span className={styles.codeBadge}>{product.code}</span></td>
                      <td onClick={() => handleViewDetail(product)}><span className={styles.productName}>{product.title}</span></td>
                      <td onClick={() => handleViewDetail(product)}><span className={styles.categoryBadge}>{getCategoryName(product.category)}</span></td>
                      <td onClick={() => handleViewDetail(product)}><span className={styles.unitBadge}>{getUnitName(product.root_unit)}</span></td>
                      <td onClick={() => handleViewDetail(product)}>
                        <span className={`${styles.stockBadge} ${product.is_low_stock ? styles.lowStockBadge : ''}`}>
                          {stockValue.toLocaleString('fa-IR')}
                        </span>
                      </td>
                      <td>
                        <button className={styles.expandBtn} onClick={(e) => { e.stopPropagation(); toggleRow(product.id); }}>
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          <span>{isExpanded ? t.hideLevels : t.showAllLevels}</span>
                        </button>
                      </td>
                      <td onClick={() => handleViewDetail(product)}>{getStatusBadge(product.is_active)}</td>
                      <td>
                        <button onClick={() => handleViewDetail(product)} className={styles.actionBtn} title={t.viewDetail}><Eye size={16} /></button>
                        <button onClick={() => handleEdit(product)} className={styles.actionBtn} title={t.edit}><Edit size={16} /></button>
                        <button onClick={() => setDeletingItem(product)} className={styles.actionBtn} title={t.delete}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                    
                    {isExpanded && (
                      <tr className={styles.expandedRow}>
                        <td colSpan="9">
                          <div className={styles.expandedContent}>
                            <div className={styles.levelsHeader}>
                              <span>📊 تفکیک موجودی در تمام سطوح</span>
                              <span className={styles.levelsSubtitle}>{getUnitName(product.root_unit)} ← {getUnitFullPath(product.root_unit)}</span>
                            </div>
                            
                            {levels.length > 0 ? (
                              <div className={styles.levelsGrid}>
                                {levels.map((level, idx) => {
                                  const levelNames = { 0: 'ریشه', 1: 'سطح ۱', 2: 'سطح ۲', 3: 'سطح ۳', 4: 'سطح ۴', 5: 'سطح ۵' };
                                  const levelColors = { 0: '#800020', 1: '#1976d2', 2: '#2e7d32', 3: '#e65100', 4: '#6a1b9a', 5: '#00695c' };
                                  const color = levelColors[level.level] || '#6b7280';
                                  const isRoot = level.isRoot;
                                  const indent = level.level * 20;
                                  
                                  return (
                                    <div key={idx} className={`${styles.levelItem} ${isRoot ? styles.levelRoot : ''}`} style={{ paddingRight: `${indent}px` }}>
                                      <span className={styles.levelIcon}>{isRoot ? '📦' : '└─'}</span>
                                      <span className={styles.levelTitle} style={{ color }}>{level.title}{level.abbreviation && <span className={styles.levelAbbr}>({level.abbreviation})</span>}</span>
                                      <span className={styles.levelBadge} style={{ backgroundColor: color }}>{levelNames[level.level] || `سطح ${level.level}`}</span>
                                      
                                      <div className={styles.levelStockInfo}>
                                        <span className={styles.levelQuantity}>{level.quantity.toLocaleString('fa-IR')}<span className={styles.levelUnit}>{level.abbreviation || level.title}</span></span>
                                        {level.buffer > 0 && <span className={styles.levelBuffer}>📦 {level.buffer.toLocaleString('fa-IR')}<span className={styles.levelUnit}>بافر</span></span>}
                                        {level.reserved > 0 && <span className={styles.levelReserved}>🔒 {level.reserved.toLocaleString('fa-IR')}<span className={styles.levelUnit}>رزرو</span></span>}
                                        <span className={styles.levelAvailable}>✅ {level.available.toLocaleString('fa-IR')}<span className={styles.levelUnit}>قابل استفاده</span></span>
                                      </div>
                                      
                                      {!isRoot && level.displayFactor > 1 && <span className={styles.levelFactor}>× {level.displayFactor.toLocaleString('fa-IR')}</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className={styles.levelsEmpty}>⚠️ اطلاعات موجودی در سطوح مختلف در دسترس نیست</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingItem(null); }} title={editingItem ? `✏️ ${t.editProduct}` : `➕ ${t.newProduct}`} size="lg">
        <ProductForm
          initialData={editingItem}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditingItem(null); }}
          loading={isLoading_state}
          categories={state.categories || []}
          units={state.units || []}
        />
      </Modal>

      <ConfirmDialog isOpen={!!deletingItem} onClose={() => setDeletingItem(null)} onConfirm={handleDelete} title="حذف کالا" message={`آیا از حذف کالا "${deletingItem?.title}" اطمینان دارید؟`} confirmText="حذف" loading={isLoading_state} />

      <Modal isOpen={showDetail} onClose={() => { setShowDetail(false); setSelectedProduct(null); }} title="جزئیات کالا" size="lg">
        {selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onEdit={() => { setShowDetail(false); handleEdit(selectedProduct); }}
            onClose={() => { setShowDetail(false); setSelectedProduct(null); }}
            getCategoryName={getCategoryName}
            getUnitName={getUnitName}
            getUnitFullPath={getUnitFullPath}
            getStatusBadge={getStatusBadge}
            t={t}
          />
        )}
      </Modal>
    </div>
  );
};

export default ProductList;