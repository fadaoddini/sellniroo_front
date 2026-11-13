// modules/inventory/context/InventoryContext.jsx

'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import axios from 'axios';
import Config from '@/config/config';

// ============================================
// Initial State
// ============================================
const initialState = {
  // داده‌ها
  units: [],
  unitTree: [],
  unitRoots: [],
  products: [],
  warehouses: [],
  transactions: [],
  authorizedPersons: [],
  alerts: [],
  categories: [],
  stockItems: [],
  movements: [],
  packagingLevels: [],
  packagingConfigs: [],
  packagingVariants: [],
  hierarchicalStock: [],
  
  // آمار
  dashboardStats: null,
  alertStatistics: null,
  
  // وضعیت بارگذاری
  loading: {
    units: false,
    unitTree: false,
    unitRoots: false,
    products: false,
    warehouses: false,
    transactions: false,
    authorizedPersons: false,
    alerts: false,
    categories: false,
    stockItems: false,
    movements: false,
    packagingLevels: false,
    packagingConfigs: false,
    packagingVariants: false,
    hierarchicalStock: false,
    dashboardStats: false,
    alertStatistics: false,
  },
  
  // خطا
  error: null,
  
  // صفحه‌بندی
  pagination: {
    products: { page: 1, total: 0, pageSize: 20 },
    transactions: { page: 1, total: 0, pageSize: 20 },
    alerts: { page: 1, total: 0, pageSize: 20 },
    stockItems: { page: 1, total: 0, pageSize: 20 },
    movements: { page: 1, total: 0, pageSize: 20 },
  },
  
  // فیلترهای فعال
  filters: {
    products: {},
    transactions: {},
    alerts: {},
    stockItems: {},
    movements: {},
  },
};

// ============================================
// Context
// ============================================
const InventoryContext = createContext(null);

export const InventoryProvider = ({ children }) => {
  const [state, setState] = useState(initialState);
  const initialLoadDone = useRef(false);
  
  const loadingRef = useRef({
    units: false,
    unitTree: false,
    unitRoots: false,
    products: false,
    warehouses: false,
    transactions: false,
    authorizedPersons: false,
    alerts: false,
    categories: false,
    stockItems: false,
    movements: false,
    packagingLevels: false,
    packagingConfigs: false,
    packagingVariants: false,
    hierarchicalStock: false,
    dashboardStats: false,
    alertStatistics: false,
  });

  // جلوگیری از برگرداندن [] وقتی درخواست قبلی هنوز در حال اجراست
  const inflightRef = useRef({});

  // ============================================
  // Auth Headers
  // ============================================
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // ============================================
  // Helper Functions
  // ============================================
  const setLoading = useCallback((key, value) => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, [key]: value },
    }));
  }, []);

  const setError = useCallback((error) => {
    setState(prev => ({ ...prev, error }));
    setTimeout(() => {
      setState(prev => ({ ...prev, error: null }));
    }, 5000);
  }, []);

  const handleResponse = useCallback((data) => {
    if (Array.isArray(data)) return data;
    if (data?.results) return data.results;
    if (data?.data?.results) return data.data.results;
    if (data?.data && Array.isArray(data.data)) return data.data;
    if (data?.data?.data && Array.isArray(data.data.data)) return data.data.data;
    if (data?.data?.status === 'success' && data?.data?.data) return data.data.data;
    return data;
  }, []);

  const updatePagination = useCallback((key, data, params = {}) => {
    setState(prev => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        [key]: {
          page: data?.page || params.page || 1,
          total: data?.count || data?.length || 0,
          pageSize: params.limit || 20,
        },
      },
    }));
  }, []);

  // ============================================
  // 1. UNITS
  // ============================================
  const loadUnits = useCallback(async (params = {}, options = {}) => {
    const force = !!options.force;
    const key = `units:${JSON.stringify(params || {})}`;
    if (!force && inflightRef.current[key]) {
      return inflightRef.current[key];
    }

    const run = (async () => {
      loadingRef.current.units = true;
      setLoading('units', true);
      try {
        const url = Config.endpoints.inventory.units.list(params);
        const response = await axios.get(url, { headers: getAuthHeaders() });
        const data = handleResponse(response.data);
        const list = Array.isArray(data) ? data : [];
        setState((prev) => ({ ...prev, units: list }));
        return list;
      } catch (error) {
        console.error('❌ Error loading units:', error);
        setError(error.response?.data?.message || 'خطا در دریافت واحدها');
        throw error;
      } finally {
        setLoading('units', false);
        loadingRef.current.units = false;
        if (inflightRef.current[key] === run) {
          delete inflightRef.current[key];
        }
      }
    })();

    inflightRef.current[key] = run;
    return run;
  }, [getAuthHeaders, setLoading, setError, handleResponse]);

  const loadUnitTree = useCallback(async (options = {}) => {
    const force = !!options.force;
    if (!force && inflightRef.current.unitTree) {
      return inflightRef.current.unitTree;
    }

    const run = (async () => {
      loadingRef.current.unitTree = true;
      setLoading('unitTree', true);
      try {
        const url = Config.endpoints.inventory.units.tree();
        const response = await axios.get(url, { headers: getAuthHeaders() });
        const data = handleResponse(response.data);
        const list = Array.isArray(data) ? data : [];
        setState((prev) => ({ ...prev, unitTree: list }));
        return list;
      } catch (error) {
        console.error('❌ Error loading unit tree:', error);
        setError(error.response?.data?.message || 'خطا در دریافت درخت واحدها');
        throw error;
      } finally {
        setLoading('unitTree', false);
        loadingRef.current.unitTree = false;
        if (inflightRef.current.unitTree === run) {
          inflightRef.current.unitTree = null;
        }
      }
    })();

    inflightRef.current.unitTree = run;
    return run;
  }, [getAuthHeaders, setLoading, setError, handleResponse]);

  const loadUnitRoots = useCallback(async (options = {}) => {
    const force = !!options.force;
    if (!force && inflightRef.current.unitRoots) {
      return inflightRef.current.unitRoots;
    }

    const run = (async () => {
      loadingRef.current.unitRoots = true;
      setLoading('unitRoots', true);
      try {
        const url = Config.endpoints.inventory.units.roots();
        const response = await axios.get(url, { headers: getAuthHeaders() });
        const data = handleResponse(response.data);
        const list = Array.isArray(data) ? data : [];
        setState((prev) => ({ ...prev, unitRoots: list }));
        return list;
      } catch (error) {
        console.error('❌ Error loading unit roots:', error);
        setError(error.response?.data?.message || 'خطا در دریافت واحدهای ریشه');
        throw error;
      } finally {
        setLoading('unitRoots', false);
        loadingRef.current.unitRoots = false;
        if (inflightRef.current.unitRoots === run) {
          inflightRef.current.unitRoots = null;
        }
      }
    })();

    inflightRef.current.unitRoots = run;
    return run;
  }, [getAuthHeaders, setLoading, setError, handleResponse]);

  const loadUnitChildren = useCallback(async (unitId) => {
    try {
      const url = Config.endpoints.inventory.units.children(unitId);
      console.log('🔗 loadUnitChildren URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 loadUnitChildren response:', response.data);
      
      return handleResponse(response.data);
    } catch (error) {
      console.error('❌ Error loading unit children:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت زیرمجموعه‌ها');
      throw error;
    }
  }, [getAuthHeaders, setError, handleResponse]);

  const loadUnitAllDescendants = useCallback(async (unitId) => {
    try {
      const url = Config.endpoints.inventory.units.allDescendants(unitId);
      console.log('🔗 loadUnitAllDescendants URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 loadUnitAllDescendants response:', response.data);
      
      return handleResponse(response.data);
    } catch (error) {
      console.error('❌ Error loading all descendants:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت تمام فرزندان');
      throw error;
    }
  }, [getAuthHeaders, setError, handleResponse]);

  const createUnit = useCallback(async (data) => {
    setLoading('units', true);
    try {
      const url = Config.endpoints.inventory.units.create();
      console.log('🔗 createUnit URL:', url);
      console.log('📤 createUnit data:', data);
      
      const response = await axios.post(url, data, { headers: getAuthHeaders() });
      console.log('✅ createUnit response:', response.data);
      
      const result = response.data;
      
      setState(prev => ({
        ...prev,
        units: [result, ...prev.units],
      }));
      
      await Promise.all([
        loadUnits(),
        loadUnitTree(),
        loadUnitRoots(),
      ]);
      
      return result;
    } catch (error) {
      console.error('❌ Error creating unit:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در ایجاد واحد');
      throw error;
    } finally {
      setLoading('units', false);
    }
  }, [getAuthHeaders, setLoading, setError, loadUnits, loadUnitTree, loadUnitRoots]);

  const updateUnit = useCallback(async (id, data) => {
    setLoading('units', true);
    try {
      const url = Config.endpoints.inventory.units.update(id);
      console.log('🔗 updateUnit URL:', url);
      console.log('📤 updateUnit data:', data);
      
      const response = await axios.put(url, data, { headers: getAuthHeaders() });
      console.log('✅ updateUnit response:', response.data);
      
      const result = response.data;
      
      setState(prev => ({
        ...prev,
        units: prev.units.map(u => u.id === id ? result : u),
      }));
      
      await Promise.all([
        loadUnits(),
        loadUnitTree(),
        loadUnitRoots(),
      ]);
      
      return result;
    } catch (error) {
      console.error('❌ Error updating unit:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در ویرایش واحد');
      throw error;
    } finally {
      setLoading('units', false);
    }
  }, [getAuthHeaders, setLoading, setError, loadUnits, loadUnitTree, loadUnitRoots]);

  const deleteUnit = useCallback(async (id) => {
    setLoading('units', true);
    try {
      const url = Config.endpoints.inventory.units.delete(id);
      console.log('🔗 deleteUnit URL:', url);
      
      await axios.delete(url, { headers: getAuthHeaders() });
      console.log('✅ deleteUnit success');
      
      setState(prev => ({
        ...prev,
        units: prev.units.filter(u => u.id !== id),
      }));
      
      await Promise.all([
        loadUnits(),
        loadUnitTree(),
        loadUnitRoots(),
      ]);
      
      return true;
    } catch (error) {
      console.error('❌ Error deleting unit:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در حذف واحد');
      throw error;
    } finally {
      setLoading('units', false);
    }
  }, [getAuthHeaders, setLoading, setError, loadUnits, loadUnitTree, loadUnitRoots]);

  const getUnitBreakdown = useCallback(async (unitId, quantity = 1) => {
    try {
      const url = Config.endpoints.inventory.unitInventory.breakdown(unitId, quantity);
      console.log('🔗 getUnitBreakdown URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 getUnitBreakdown response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error getting unit breakdown:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت تفکیک واحد');
      throw error;
    }
  }, [getAuthHeaders, setError]);

  const getUnitBreakdownFromChild = useCallback(async (unitId, quantity = 1) => {
    try {
      const url = Config.endpoints.inventory.units.breakdownFromChild(unitId, quantity);
      console.log('🔗 getUnitBreakdownFromChild URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 getUnitBreakdownFromChild response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error getting breakdown from child:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت تفکیک از پایین به بالا');
      throw error;
    }
  }, [getAuthHeaders, setError]);

  // ============================================
  // 2. PRODUCTS
  // ============================================
// modules/inventory/context/InventoryContext.jsx

// ============================================
// 2. PRODUCTS - نسخه اصلاح شده با دریافت stock_items
// ============================================
const loadProducts = useCallback(async (params = {}) => {
  if (loadingRef.current.products) {
    console.log('⏳ Already loading products, skipping...');
    return state.products;
  }

  loadingRef.current.products = true;
  setLoading('products', true);

  try {
    const url = Config.endpoints.inventory.products.list(params);
    console.log('🔗 loadProducts URL:', url);
    
    const response = await axios.get(url, { headers: getAuthHeaders() });
    console.log('📦 loadProducts response:', response.data);
    
    let products = handleResponse(response.data);
    // stock_items از خود API محصول می‌آید — نیازی به N+1 نیست
    if (Array.isArray(products)) {
      products = products.map((product) => ({
        ...product,
        stock_items: Array.isArray(product.stock_items) ? product.stock_items : [],
      }))
    }
    
    updatePagination('products', response.data, params);
    
    setState(prev => ({
      ...prev,
      products: products,
      filters: { ...prev.filters, products: params },
    }));
    
    return products;
  } catch (error) {
    console.error('❌ Error loading products:', error);
    console.error('❌ Error response:', error.response?.data);
    setError(error.response?.data?.message || 'خطا در دریافت لیست کالاها');
    throw error;
  } finally {
    setLoading('products', false);
    loadingRef.current.products = false;
  }
}, [getAuthHeaders, setLoading, setError, handleResponse, updatePagination, state.products]);

  const createProduct = useCallback(async (data) => {
    setLoading('products', true);
    try {
      const url = Config.endpoints.inventory.products.create();
      console.log('🔗 createProduct URL:', url);
      
      const response = await axios.post(url, data, { 
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('✅ createProduct response:', response.data);
      
      const result = response.data;
      
      setState(prev => ({
        ...prev,
        products: [result, ...prev.products],
      }));
      
      await loadProducts();
      return result;
    } catch (error) {
      console.error('❌ Error creating product:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در ایجاد کالا');
      throw error;
    } finally {
      setLoading('products', false);
    }
  }, [getAuthHeaders, setLoading, setError, loadProducts]);

  const updateProduct = useCallback(async (id, data) => {
    setLoading('products', true);
    try {
      const url = Config.endpoints.inventory.products.update(id);
      console.log('🔗 updateProduct URL:', url);
      
      const response = await axios.put(url, data, { 
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('✅ updateProduct response:', response.data);
      
      const result = response.data;
      
      setState(prev => ({
        ...prev,
        products: prev.products.map(p => p.id === id ? result : p),
      }));
      
      await loadProducts();
      return result;
    } catch (error) {
      console.error('❌ Error updating product:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در ویرایش کالا');
      throw error;
    } finally {
      setLoading('products', false);
    }
  }, [getAuthHeaders, setLoading, setError, loadProducts]);

  const deleteProduct = useCallback(async (id) => {
    setLoading('products', true);
    try {
      const url = Config.endpoints.inventory.products.delete(id);
      console.log('🔗 deleteProduct URL:', url);
      
      await axios.delete(url, { headers: getAuthHeaders() });
      console.log('✅ deleteProduct success');
      
      setState(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== id),
      }));
      
      await loadProducts();
      return true;
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در حذف کالا');
      throw error;
    } finally {
      setLoading('products', false);
    }
  }, [getAuthHeaders, setLoading, setError, loadProducts]);

  const getProductStockInUnit = useCallback(async (productId, unitId) => {
    try {
      const url = Config.endpoints.inventory.products.stockInUnit(productId, unitId);
      console.log('🔗 getProductStockInUnit URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 getProductStockInUnit response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error getting product stock in unit:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت موجودی بر حسب واحد');
      throw error;
    }
  }, [getAuthHeaders, setError]);

  const getProductStockItems = useCallback(async (productId) => {
    try {
      const url = Config.endpoints.inventory.products.stockItems(productId);
      console.log('🔗 getProductStockItems URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 getProductStockItems response:', response.data);
      
      return handleResponse(response.data);
    } catch (error) {
      console.error('❌ Error getting product stock items:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت موجودی کالا');
      throw error;
    }
  }, [getAuthHeaders, setError, handleResponse]);

  const getProductTransactions = useCallback(async (productId) => {
    try {
      const url = Config.endpoints.inventory.products.transactions(productId);
      console.log('🔗 getProductTransactions URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 getProductTransactions response:', response.data);
      
      return handleResponse(response.data);
    } catch (error) {
      console.error('❌ Error getting product transactions:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت تراکنش‌های کالا');
      throw error;
    }
  }, [getAuthHeaders, setError, handleResponse]);

  // ============================================
  // 3. CATEGORIES
  // ============================================
  const loadCategories = useCallback(async (params = {}) => {
    if (loadingRef.current.categories) {
      console.log('⏳ Already loading categories, skipping...');
      return state.categories;
    }

    loadingRef.current.categories = true;
    setLoading('categories', true);

    try {
      const url = Config.endpoints.inventory.categories.list(params);
      console.log('🔗 loadCategories URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 loadCategories response:', response.data);
      
      const data = handleResponse(response.data);
      
      setState(prev => ({ ...prev, categories: data }));
      return data;
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      console.error('❌ Error response:', error.response?.data);
      // API ممکن است هنوز آماده نباشد — داشبورد را از کار نینداز
      setState((prev) => ({ ...prev, categories: prev.categories || [] }))
      return []
    } finally {
      setLoading('categories', false);
      loadingRef.current.categories = false;
    }
  }, [getAuthHeaders, setLoading, setError, handleResponse, state.categories]);

  const createCategory = useCallback(async (data) => {
    setLoading('categories', true);
    try {
      const url = Config.endpoints.inventory.categories.create();
      console.log('🔗 createCategory URL:', url);
      
      const response = await axios.post(url, data, { headers: getAuthHeaders() });
      console.log('✅ createCategory response:', response.data);
      
      const result = response.data;
      
      setState(prev => ({
        ...prev,
        categories: [result, ...prev.categories],
      }));
      
      await loadCategories();
      return result;
    } catch (error) {
      console.error('❌ Error creating category:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در ایجاد دسته‌بندی');
      throw error;
    } finally {
      setLoading('categories', false);
    }
  }, [getAuthHeaders, setLoading, setError, loadCategories]);

  const updateCategory = useCallback(async (id, data) => {
    setLoading('categories', true);
    try {
      const url = Config.endpoints.inventory.categories.update(id);
      console.log('🔗 updateCategory URL:', url);
      
      const response = await axios.put(url, data, { headers: getAuthHeaders() });
      console.log('✅ updateCategory response:', response.data);
      
      const result = response.data;
      
      setState(prev => ({
        ...prev,
        categories: prev.categories.map(c => c.id === id ? result : c),
      }));
      
      await loadCategories();
      return result;
    } catch (error) {
      console.error('❌ Error updating category:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در ویرایش دسته‌بندی');
      throw error;
    } finally {
      setLoading('categories', false);
    }
  }, [getAuthHeaders, setLoading, setError, loadCategories]);

  const deleteCategory = useCallback(async (id) => {
    setLoading('categories', true);
    try {
      const url = Config.endpoints.inventory.categories.delete(id);
      console.log('🔗 deleteCategory URL:', url);
      
      await axios.delete(url, { headers: getAuthHeaders() });
      console.log('✅ deleteCategory success');
      
      setState(prev => ({
        ...prev,
        categories: prev.categories.filter(c => c.id !== id),
      }));
      
      await loadCategories();
      return true;
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در حذف دسته‌بندی');
      throw error;
    } finally {
      setLoading('categories', false);
    }
  }, [getAuthHeaders, setLoading, setError, loadCategories]);

  // ============================================
  // 4. WAREHOUSES
  // ============================================
  const loadWarehouses = useCallback(async (params = {}) => {
    if (loadingRef.current.warehouses) {
      console.log('⏳ Already loading warehouses, skipping...');
      return state.warehouses;
    }

    loadingRef.current.warehouses = true;
    setLoading('warehouses', true);

    try {
      const url = Config.endpoints.inventory.warehouses.list(params);
      console.log('🔗 loadWarehouses URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 loadWarehouses response:', response.data);
      
      const data = handleResponse(response.data);
      
      setState(prev => ({ ...prev, warehouses: data }));
      return data;
    } catch (error) {
      console.error('❌ Error loading warehouses:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت لیست انبارها');
      throw error;
    } finally {
      setLoading('warehouses', false);
      loadingRef.current.warehouses = false;
    }
  }, [getAuthHeaders, setLoading, setError, handleResponse, state.warehouses]);

  const createWarehouse = useCallback(async (data) => {
    setLoading('warehouses', true);
    try {
      const url = Config.endpoints.inventory.warehouses.create();
      console.log('🔗 createWarehouse URL:', url);
      
      const response = await axios.post(url, data, { 
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('✅ createWarehouse response:', response.data);
      
      const result = response.data;
      
      setState(prev => ({
        ...prev,
        warehouses: [result, ...prev.warehouses],
      }));
      
      await loadWarehouses();
      return result;
    } catch (error) {
      console.error('❌ Error creating warehouse:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در ایجاد انبار');
      throw error;
    } finally {
      setLoading('warehouses', false);
    }
  }, [getAuthHeaders, setLoading, setError, loadWarehouses]);

  const updateWarehouse = useCallback(async (id, data) => {
    setLoading('warehouses', true);
    try {
      const url = Config.endpoints.inventory.warehouses.update(id);
      console.log('🔗 updateWarehouse URL:', url);
      
      const response = await axios.put(url, data, { 
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('✅ updateWarehouse response:', response.data);
      
      const result = response.data;
      
      setState(prev => ({
        ...prev,
        warehouses: prev.warehouses.map(w => w.id === id ? result : w),
      }));
      
      await loadWarehouses();
      return result;
    } catch (error) {
      console.error('❌ Error updating warehouse:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در ویرایش انبار');
      throw error;
    } finally {
      setLoading('warehouses', false);
    }
  }, [getAuthHeaders, setLoading, setError, loadWarehouses]);

  const deleteWarehouse = useCallback(async (id) => {
    setLoading('warehouses', true);
    try {
      const url = Config.endpoints.inventory.warehouses.delete(id);
      console.log('🔗 deleteWarehouse URL:', url);
      
      await axios.delete(url, { headers: getAuthHeaders() });
      console.log('✅ deleteWarehouse success');
      
      setState(prev => ({
        ...prev,
        warehouses: prev.warehouses.filter(w => w.id !== id),
      }));
      
      await loadWarehouses();
      return true;
    } catch (error) {
      console.error('❌ Error deleting warehouse:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در حذف انبار');
      throw error;
    } finally {
      setLoading('warehouses', false);
    }
  }, [getAuthHeaders, setLoading, setError, loadWarehouses]);

  const getWarehouseStockItems = useCallback(async (warehouseId) => {
    try {
      const url = Config.endpoints.inventory.warehouses.stockItems(warehouseId);
      console.log('🔗 getWarehouseStockItems URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 getWarehouseStockItems response:', response.data);
      
      return handleResponse(response.data);
    } catch (error) {
      console.error('❌ Error getting warehouse stock items:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت موجودی انبار');
      throw error;
    }
  }, [getAuthHeaders, setError, handleResponse]);

  const getWarehouseTotalValue = useCallback(async (warehouseId) => {
    try {
      const url = Config.endpoints.inventory.warehouses.totalValue(warehouseId);
      console.log('🔗 getWarehouseTotalValue URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 getWarehouseTotalValue response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error getting warehouse total value:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت ارزش کل انبار');
      throw error;
    }
  }, [getAuthHeaders, setError]);

  // ============================================
  // 5. STOCK ITEMS
  // ============================================
const loadStockItems = useCallback(async (params = {}) => {
  if (loadingRef.current.stockItems) {
    console.log('⏳ Already loading stock items, skipping...');
    return state.stockItems;
  }

  loadingRef.current.stockItems = true;
  setLoading('stockItems', true);

  try {
    const url = Config.endpoints.inventory.stockItems.list(params);
    console.log('🔗 loadStockItems URL:', url);
    
    const response = await axios.get(url, { headers: getAuthHeaders() });
    console.log('📦 loadStockItems response:', response.data);
    
    const data = handleResponse(response.data);
    
    updatePagination('stockItems', response.data, params);
    
    setState(prev => ({
      ...prev,
      stockItems: data,
      filters: { ...prev.filters, stockItems: params },
    }));
    
    return data;
  } catch (error) {
    // endpoint سراسری stock-items در بک‌اند ثبت نشده؛ خطا را نرم رد کن
    console.warn('⚠️ loadStockItems skipped:', error?.response?.status || error?.message);
    if (error?.response?.status !== 404) {
      setError(error.response?.data?.message || 'خطا در دریافت موجودی');
    }
    return state.stockItems || [];
  } finally {
    setLoading('stockItems', false);
    loadingRef.current.stockItems = false;
  }
}, [getAuthHeaders, setLoading, setError, handleResponse, updatePagination, state.stockItems]);

  const updateStockItem = useCallback(async (id, data) => {
    setLoading('stockItems', true);
    try {
      const url = Config.endpoints.inventory.stockItems.update(id);
      console.log('🔗 updateStockItem URL:', url);
      
      const response = await axios.put(url, data, { headers: getAuthHeaders() });
      console.log('✅ updateStockItem response:', response.data);
      
      const result = response.data;
      
      setState(prev => ({
        ...prev,
        stockItems: prev.stockItems.map(s => s.id === id ? result : s),
      }));
      
      await loadStockItems();
      return result;
    } catch (error) {
      console.error('❌ Error updating stock item:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در ویرایش موجودی');
      throw error;
    } finally {
      setLoading('stockItems', false);
    }
  }, [getAuthHeaders, setLoading, setError, loadStockItems]);

  const getStockInUnit = useCallback(async (productId, warehouseId, unitId) => {
    try {
      const url = Config.endpoints.inventory.unitInventory.stockInUnit(productId, warehouseId, unitId);
      console.log('🔗 getStockInUnit URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 getStockInUnit response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error getting stock in unit:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت موجودی بر حسب واحد');
      throw error;
    }
  }, [getAuthHeaders, setError]);

  // ============================================
  // 6. DASHBOARD STATS (قبل از TRANSACTIONS و UNIT INVENTORY)
  // ============================================
  const loadDashboardStats = useCallback(async () => {
    if (loadingRef.current.dashboardStats) {
      console.log('⏳ Already loading dashboard stats, skipping...');
      return state.dashboardStats;
    }

    loadingRef.current.dashboardStats = true;
    setLoading('dashboardStats', true);

    try {
      const url = Config.endpoints.inventory.reports.summary();
      console.log('🔗 loadDashboardStats URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 loadDashboardStats response:', response.data);
      
      const data = handleResponse(response.data);
      
      setState(prev => ({ ...prev, dashboardStats: data }));
      return data;
    } catch (error) {
      console.error('❌ Error loading dashboard stats:', error);
      console.error('❌ Error response:', error.response?.data);
      return null;
    } finally {
      setLoading('dashboardStats', false);
      loadingRef.current.dashboardStats = false;
    }
  }, [getAuthHeaders, setLoading, handleResponse, state.dashboardStats]);

  // ============================================
  // 7. TRANSACTIONS
  // ============================================
  const loadTransactions = useCallback(async (params = {}) => {
    if (loadingRef.current.transactions) {
      console.log('⏳ Already loading transactions, skipping...');
      return state.transactions;
    }

    loadingRef.current.transactions = true;
    setLoading('transactions', true);

    try {
      const url = Config.endpoints.inventory.transactions.list(params);
      console.log('🔗 loadTransactions URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 loadTransactions response:', response.data);
      
      const data = handleResponse(response.data);
      
      updatePagination('transactions', response.data, params);
      
      setState(prev => ({
        ...prev,
        transactions: data,
        filters: { ...prev.filters, transactions: params },
      }));
      
      return data;
    } catch (error) {
      console.error('❌ Error loading transactions:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت تراکنش‌ها');
      throw error;
    } finally {
      setLoading('transactions', false);
      loadingRef.current.transactions = false;
    }
  }, [getAuthHeaders, setLoading, setError, handleResponse, updatePagination, state.transactions]);

  const confirmTransaction = useCallback(async (id) => {
    setLoading('transactions', true);
    try {
      const url = Config.endpoints.inventory.transactions.confirm(id);
      console.log('🔗 confirmTransaction URL:', url);
      
      const response = await axios.post(url, {}, { headers: getAuthHeaders() });
      console.log('✅ confirmTransaction response:', response.data);
      
      const result = response.data;
      
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.map(t => 
          t.id === id ? { ...t, status: 'CONFIRMED', ...result } : t
        ),
      }));
      
      await loadTransactions();
      return result;
    } catch (error) {
      console.error('❌ Error confirming transaction:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در تایید تراکنش');
      throw error;
    } finally {
      setLoading('transactions', false);
    }
  }, [getAuthHeaders, setLoading, setError, loadTransactions]);

  const cancelTransaction = useCallback(async (id, reason = '') => {
    setLoading('transactions', true);
    try {
      const url = Config.endpoints.inventory.transactions.cancel(id);
      console.log('🔗 cancelTransaction URL:', url);
      
      const response = await axios.post(
        url,
        { reason: reason || '' },
        { headers: getAuthHeaders() }
      );
      console.log('✅ cancelTransaction response:', response.data);
      
      const result = response.data;
      const updated = result?.data || result;
      
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.map(t => 
          t.id === id ? { ...t, ...updated, status: 'CANCELLED' } : t
        ),
      }));
      
      await Promise.allSettled([
        loadTransactions(),
        loadProducts(),
        loadStockItems(),
        loadDashboardStats().catch(() => null),
      ]);
      return result;
    } catch (error) {
      console.error('❌ Error cancelling transaction:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در لغو تراکنش');
      throw error;
    } finally {
      setLoading('transactions', false);
    }
  }, [getAuthHeaders, setLoading, setError, loadTransactions, loadProducts, loadStockItems, loadDashboardStats]);

  const archiveTransaction = useCallback(async (id) => {
    setLoading('transactions', true);
    try {
      const url = Config.endpoints.inventory.transactions.archive(id);
      const response = await axios.post(url, {}, { headers: getAuthHeaders() });
      const result = response.data;
      const updated = result?.data || result;
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.map(t =>
          t.id === id ? { ...t, ...updated, is_archived: true } : t
        ),
      }));
      return result;
    } catch (error) {
      setError(error.response?.data?.message || 'خطا در آرشیو حواله');
      throw error;
    } finally {
      setLoading('transactions', false);
    }
  }, [getAuthHeaders, setLoading, setError]);

  const unarchiveTransaction = useCallback(async (id) => {
    setLoading('transactions', true);
    try {
      const url = Config.endpoints.inventory.transactions.unarchive(id);
      const response = await axios.post(url, {}, { headers: getAuthHeaders() });
      const result = response.data;
      const updated = result?.data || result;
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.map(t =>
          t.id === id ? { ...t, ...updated, is_archived: false } : t
        ),
      }));
      return result;
    } catch (error) {
      setError(error.response?.data?.message || 'خطا در خروج از آرشیو');
      throw error;
    } finally {
      setLoading('transactions', false);
    }
  }, [getAuthHeaders, setLoading, setError]);

  const getDailyReport = useCallback(async (params = {}) => {
    try {
      const url = Config.endpoints.inventory.transactions.dailyReport(params);
      console.log('🔗 getDailyReport URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 getDailyReport response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error getting daily report:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت گزارش روزانه');
      throw error;
    }
  }, [getAuthHeaders, setError]);

  // ============================================
  // 8. UNIT INVENTORY (ورود و خروج با واحد)
  // ============================================
  const receiveWithUnit = useCallback(async (data) => {
    setLoading('transactions', true);
    try {
      const url = Config.endpoints.inventory.unitInventory.receive();
      console.log('🔗 receiveWithUnit URL:', url);
      console.log('📤 receiveWithUnit data:', data);
      
      const response = await axios.post(url, {
        product_id: data.product_id,
        warehouse_id: data.warehouse_id,
        unit_id: data.unit_id,
        quantity: data.quantity,
        description: data.description || '',
      }, { headers: getAuthHeaders() });
      
      console.log('✅ receiveWithUnit response:', response.data);
      const result = response.data;

      if (result?.status === 'error') {
        const msg = result?.message || 'خطا در ورود کالا';
        setError(msg);
        throw Object.assign(new Error(msg), { response: { data: result } });
      }
      
      setState(prev => ({
        ...prev,
        transactions: [result?.data || result, ...prev.transactions],
      }));
      
      // رفرش پس از ثبت نباید موفقیت را خراب کند
      await Promise.allSettled([
        loadProducts(),
        loadStockItems(),
        loadTransactions(),
        loadDashboardStats().catch(() => null),
      ]);
      
      return result;
    } catch (error) {
      console.error('❌ Error receiving with unit:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در ورود کالا');
      throw error;
    } finally {
      setLoading('transactions', false);
    }
  }, [getAuthHeaders, setLoading, setError, loadProducts, loadStockItems, loadTransactions, loadDashboardStats]);

  const removeWithUnit = useCallback(async (data) => {
    setLoading('transactions', true);
    try {
      const url = Config.endpoints.inventory.unitInventory.remove();
      console.log('🔗 removeWithUnit URL:', url);
      console.log('📤 removeWithUnit data:', data);
      
      const response = await axios.post(url, {
        product_id: data.product_id,
        warehouse_id: data.warehouse_id,
        unit_id: data.unit_id,
        quantity: data.quantity,
        authorized_person_id: data.authorized_person_id || null,
        description: data.description || '',
      }, { headers: getAuthHeaders() });
      
      console.log('✅ removeWithUnit response:', response.data);
      const result = response.data;

      if (result?.status === 'error') {
        const msg = result?.message || 'خطا در خروج کالا';
        setError(msg);
        throw Object.assign(new Error(msg), { response: { data: result } });
      }
      
      setState(prev => ({
        ...prev,
        transactions: [result?.data || result, ...prev.transactions],
      }));
      
      // رفرش پس از ثبت نباید موفقیت را خراب کند (قبلاً loadStockItems با ۴۰۴ کل عملیات را fail می‌کرد)
      await Promise.allSettled([
        loadProducts(),
        loadStockItems(),
        loadTransactions(),
        loadDashboardStats().catch(() => null),
      ]);
      
      return result;
    } catch (error) {
      console.error('❌ Error removing with unit:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در خروج کالا');
      throw error;
    } finally {
      setLoading('transactions', false);
    }
  }, [getAuthHeaders, setLoading, setError, loadProducts, loadStockItems, loadTransactions, loadDashboardStats]);

  // ============================================
  // 9. AUTHORIZED PERSONS
  // ============================================
  const loadAuthorizedPersons = useCallback(async (params = {}) => {
    if (loadingRef.current.authorizedPersons) {
      console.log('⏳ Already loading authorized persons, skipping...');
      return state.authorizedPersons;
    }

    loadingRef.current.authorizedPersons = true;
    setLoading('authorizedPersons', true);

    try {
      const url = Config.endpoints.inventory.authorizedPersons.list(params);
      console.log('🔗 loadAuthorizedPersons URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 loadAuthorizedPersons response:', response.data);
      
      const data = handleResponse(response.data);
      
      setState(prev => ({ ...prev, authorizedPersons: data }));
      return data;
    } catch (error) {
      console.error('❌ Error loading authorized persons:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت افراد مجاز');
      throw error;
    } finally {
      setLoading('authorizedPersons', false);
      loadingRef.current.authorizedPersons = false;
    }
  }, [getAuthHeaders, setLoading, setError, handleResponse, state.authorizedPersons]);

  const createAuthorizedPerson = useCallback(async (data) => {
    setLoading('authorizedPersons', true);
    try {
      const url = Config.endpoints.inventory.authorizedPersons.create();
      console.log('🔗 createAuthorizedPerson URL:', url);
      
      const response = await axios.post(url, data, { headers: getAuthHeaders() });
      console.log('✅ createAuthorizedPerson response:', response.data);
      
      const result = response.data;
      
      setState(prev => ({
        ...prev,
        authorizedPersons: [result, ...prev.authorizedPersons],
      }));
      
      await loadAuthorizedPersons();
      return result;
    } catch (error) {
      console.error('❌ Error creating authorized person:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در ایجاد فرد مجاز');
      throw error;
    } finally {
      setLoading('authorizedPersons', false);
    }
  }, [getAuthHeaders, setLoading, setError, loadAuthorizedPersons]);

  const updateAuthorizedPerson = useCallback(async (id, data) => {
    setLoading('authorizedPersons', true);
    try {
      const url = Config.endpoints.inventory.authorizedPersons.update(id);
      console.log('🔗 updateAuthorizedPerson URL:', url);
      
      const response = await axios.put(url, data, { headers: getAuthHeaders() });
      console.log('✅ updateAuthorizedPerson response:', response.data);
      
      const result = response.data;
      
      setState(prev => ({
        ...prev,
        authorizedPersons: prev.authorizedPersons.map(p => p.id === id ? result : p),
      }));
      
      await loadAuthorizedPersons();
      return result;
    } catch (error) {
      console.error('❌ Error updating authorized person:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در ویرایش فرد مجاز');
      throw error;
    } finally {
      setLoading('authorizedPersons', false);
    }
  }, [getAuthHeaders, setLoading, setError, loadAuthorizedPersons]);

  const deleteAuthorizedPerson = useCallback(async (id) => {
    setLoading('authorizedPersons', true);
    try {
      const url = Config.endpoints.inventory.authorizedPersons.delete(id);
      console.log('🔗 deleteAuthorizedPerson URL:', url);
      
      await axios.delete(url, { headers: getAuthHeaders() });
      console.log('✅ deleteAuthorizedPerson success');
      
      setState(prev => ({
        ...prev,
        authorizedPersons: prev.authorizedPersons.filter(p => p.id !== id),
      }));
      
      await loadAuthorizedPersons();
      return true;
    } catch (error) {
      console.error('❌ Error deleting authorized person:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در حذف فرد مجاز');
      throw error;
    } finally {
      setLoading('authorizedPersons', false);
    }
  }, [getAuthHeaders, setLoading, setError, loadAuthorizedPersons]);

// ============================================
  // 10. ALERTS
  // ============================================
  const loadAlerts = useCallback(async (params = {}) => {
    if (loadingRef.current.alerts) {
      console.log('⏳ Already loading alerts, skipping...');
      return state.alerts;
    }

    loadingRef.current.alerts = true;
    setLoading('alerts', true);

    try {
      const url = Config.endpoints.inventory.alerts.list(params);
      console.log('🔗 loadAlerts URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 loadAlerts response:', response.data);
      
      const data = handleResponse(response.data);
      
      updatePagination('alerts', response.data, params);
      
      setState(prev => ({
        ...prev,
        alerts: data,
        filters: { ...prev.filters, alerts: params },
      }));
      
      return data;
    } catch (error) {
      console.error('❌ Error loading alerts:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت هشدارها');
      throw error;
    } finally {
      setLoading('alerts', false);
      loadingRef.current.alerts = false;
    }
  }, [getAuthHeaders, setLoading, setError, handleResponse, updatePagination, state.alerts]);

  // ✅ loadAlertStatistics باید BEFORE resolveAlert باشد
  const loadAlertStatistics = useCallback(async () => {
    if (loadingRef.current.alertStatistics) {
      console.log('⏳ Already loading alert statistics, skipping...');
      return state.alertStatistics;
    }

    loadingRef.current.alertStatistics = true;
    setLoading('alertStatistics', true);

    try {
      const url = Config.endpoints.inventory.alerts.statistics();
      console.log('🔗 loadAlertStatistics URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 loadAlertStatistics response:', response.data);
      
      const data = handleResponse(response.data);
      
      setState(prev => ({ ...prev, alertStatistics: data }));
      return data;
    } catch (error) {
      console.error('❌ Error loading alert statistics:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت آمار هشدارها');
      throw error;
    } finally {
      setLoading('alertStatistics', false);
      loadingRef.current.alertStatistics = false;
    }
  }, [getAuthHeaders, setLoading, setError, handleResponse, state.alertStatistics]);

  // ✅ resolveAlert حالا بعد از loadAlertStatistics تعریف شده
  const resolveAlert = useCallback(async (id) => {
    setLoading('alerts', true);
    try {
      const url = Config.endpoints.inventory.alerts.resolve(id);
      console.log('🔗 resolveAlert URL:', url);
      
      const response = await axios.post(url, {}, { headers: getAuthHeaders() });
      console.log('✅ resolveAlert response:', response.data);
      
      setState(prev => ({
        ...prev,
        alerts: prev.alerts.map(a => 
          a.id === id ? { ...a, is_resolved: true } : a
        ),
      }));
      
      await loadAlerts();
      await loadAlertStatistics();
      return response.data;
    } catch (error) {
      console.error('❌ Error resolving alert:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در برطرف کردن هشدار');
      throw error;
    } finally {
      setLoading('alerts', false);
    }
  }, [getAuthHeaders, setLoading, setError, loadAlerts, loadAlertStatistics]);

  // ============================================
  // 11. MOVEMENTS
  // ============================================
  const loadMovements = useCallback(async (params = {}) => {
    if (loadingRef.current.movements) {
      console.log('⏳ Already loading movements, skipping...');
      return state.movements;
    }

    loadingRef.current.movements = true;
    setLoading('movements', true);

    try {
      const url = Config.endpoints.inventory.movements.list(params);
      console.log('🔗 loadMovements URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 loadMovements response:', response.data);
      
      const data = handleResponse(response.data);
      
      updatePagination('movements', response.data, params);
      
      setState(prev => ({
        ...prev,
        movements: data,
        filters: { ...prev.filters, movements: params },
      }));
      
      return data;
    } catch (error) {
      console.error('❌ Error loading movements:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت تاریخچه حرکات');
      throw error;
    } finally {
      setLoading('movements', false);
      loadingRef.current.movements = false;
    }
  }, [getAuthHeaders, setLoading, setError, handleResponse, updatePagination, state.movements]);

  const getMovementsByProduct = useCallback(async (productId, params = {}) => {
    try {
      const url = Config.endpoints.inventory.movements.byProduct(productId, params);
      console.log('🔗 getMovementsByProduct URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 getMovementsByProduct response:', response.data);
      
      return handleResponse(response.data);
    } catch (error) {
      console.error('❌ Error getting movements by product:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت حرکات محصول');
      throw error;
    }
  }, [getAuthHeaders, setError, handleResponse]);

  const getMovementsByWarehouse = useCallback(async (warehouseId, params = {}) => {
    try {
      const url = Config.endpoints.inventory.movements.byWarehouse(warehouseId, params);
      console.log('🔗 getMovementsByWarehouse URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 getMovementsByWarehouse response:', response.data);
      
      return handleResponse(response.data);
    } catch (error) {
      console.error('❌ Error getting movements by warehouse:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت حرکات انبار');
      throw error;
    }
  }, [getAuthHeaders, setError, handleResponse]);

  // ============================================
  // 12. REPORTS
  // ============================================
  const getStockReport = useCallback(async (params = {}) => {
    try {
      const url = Config.endpoints.inventory.reports.stock(params);
      console.log('🔗 getStockReport URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 getStockReport response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error getting stock report:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت گزارش موجودی');
      throw error;
    }
  }, [getAuthHeaders, setError]);

  const getWarehouseStockReport = useCallback(async (warehouseId, params = {}) => {
    try {
      const url = Config.endpoints.inventory.reports.warehouseStock(warehouseId, params);
      console.log('🔗 getWarehouseStockReport URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 getWarehouseStockReport response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error getting warehouse stock report:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت گزارش موجودی انبار');
      throw error;
    }
  }, [getAuthHeaders, setError]);

  const getTransactionReport = useCallback(async (params = {}) => {
    try {
      const url = Config.endpoints.inventory.reports.transactions(params);
      console.log('🔗 getTransactionReport URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 getTransactionReport response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error getting transaction report:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت گزارش تراکنش‌ها');
      throw error;
    }
  }, [getAuthHeaders, setError]);

  const getOutReport = useCallback(async (params = {}) => {
    try {
      const url = Config.endpoints.inventory.reports.outReport(params);
      console.log('🔗 getOutReport URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 getOutReport response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error getting out report:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت گزارش خروجی‌ها');
      throw error;
    }
  }, [getAuthHeaders, setError]);

  const getInReport = useCallback(async (params = {}) => {
    try {
      const url = Config.endpoints.inventory.reports.inReport(params);
      console.log('🔗 getInReport URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 getInReport response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error getting in report:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت گزارش ورودی‌ها');
      throw error;
    }
  }, [getAuthHeaders, setError]);

  const getLowStockReport = useCallback(async (params = {}) => {
    try {
      const url = Config.endpoints.inventory.reports.lowStock(params);
      console.log('🔗 getLowStockReport URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 getLowStockReport response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error getting low stock report:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت گزارش موجودی کم');
      throw error;
    }
  }, [getAuthHeaders, setError]);

  // ============================================
  // 13. PACKAGING
  // ============================================
  const loadPackagingLevels = useCallback(async (params = {}) => {
    if (loadingRef.current.packagingLevels) {
      console.log('⏳ Already loading packaging levels, skipping...');
      return state.packagingLevels;
    }

    // endpoint اختیاری — اگر در config نباشد، بی‌صدا رد شو
    if (!Config.endpoints.inventory?.packagingLevels?.list) {
      return state.packagingLevels || []
    }

    loadingRef.current.packagingLevels = true;
    setLoading('packagingLevels', true);

    try {
      const url = Config.endpoints.inventory.packagingLevels.list(params);
      console.log('🔗 loadPackagingLevels URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 loadPackagingLevels response:', response.data);
      
      const data = handleResponse(response.data);
      
      setState(prev => ({ ...prev, packagingLevels: data }));
      return data;
    } catch (error) {
      console.error('❌ Error loading packaging levels:', error);
      return state.packagingLevels || []
    } finally {
      setLoading('packagingLevels', false);
      loadingRef.current.packagingLevels = false;
    }
  }, [getAuthHeaders, setLoading, handleResponse, state.packagingLevels]);

  const loadPackagingConfigs = useCallback(async (params = {}) => {
    if (loadingRef.current.packagingConfigs) {
      console.log('⏳ Already loading packaging configs, skipping...');
      return state.packagingConfigs;
    }

    loadingRef.current.packagingConfigs = true;
    setLoading('packagingConfigs', true);

    try {
      const url = Config.endpoints.inventory.packagingConfigs.list(params);
      console.log('🔗 loadPackagingConfigs URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 loadPackagingConfigs response:', response.data);
      
      const data = handleResponse(response.data);
      
      setState(prev => ({ ...prev, packagingConfigs: data }));
      return data;
    } catch (error) {
      console.error('❌ Error loading packaging configs:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت تنظیمات بسته‌بندی');
      throw error;
    } finally {
      setLoading('packagingConfigs', false);
      loadingRef.current.packagingConfigs = false;
    }
  }, [getAuthHeaders, setLoading, setError, handleResponse, state.packagingConfigs]);

  const savePackagingHierarchy = useCallback(async (data) => {
    setLoading('packagingConfigs', true);
    try {
      const url = Config.endpoints.inventory.packagingHierarchy.save();
      console.log('🔗 savePackagingHierarchy URL:', url);
      
      const response = await axios.post(url, data, { headers: getAuthHeaders() });
      console.log('✅ savePackagingHierarchy response:', response.data);
      
      await loadPackagingConfigs();
      return response.data;
    } catch (error) {
      console.error('❌ Error saving packaging hierarchy:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در ذخیره سلسله‌مراتب بسته‌بندی');
      throw error;
    } finally {
      setLoading('packagingConfigs', false);
    }
  }, [getAuthHeaders, setLoading, setError, loadPackagingConfigs]);

  const getPackagingHierarchy = useCallback(async (productId, warehouseId) => {
    try {
      const url = Config.endpoints.inventory.packagingHierarchy.get(productId, warehouseId);
      console.log('🔗 getPackagingHierarchy URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 getPackagingHierarchy response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error getting packaging hierarchy:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت سلسله‌مراتب بسته‌بندی');
      throw error;
    }
  }, [getAuthHeaders, setError]);

  const loadPackagingVariants = useCallback(async (params = {}) => {
    if (loadingRef.current.packagingVariants) {
      console.log('⏳ Already loading packaging variants, skipping...');
      return state.packagingVariants;
    }

    loadingRef.current.packagingVariants = true;
    setLoading('packagingVariants', true);

    try {
      const url = Config.endpoints.inventory.packagingVariants.list(params);
      console.log('🔗 loadPackagingVariants URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 loadPackagingVariants response:', response.data);
      
      const data = handleResponse(response.data);
      
      setState(prev => ({ ...prev, packagingVariants: data }));
      return data;
    } catch (error) {
      console.error('❌ Error loading packaging variants:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت واریانت‌های بسته‌بندی');
      throw error;
    } finally {
      setLoading('packagingVariants', false);
      loadingRef.current.packagingVariants = false;
    }
  }, [getAuthHeaders, setLoading, setError, handleResponse, state.packagingVariants]);

  // ============================================
  // 14. HIERARCHICAL STOCK
  // ============================================
  const loadHierarchicalStock = useCallback(async (params = {}) => {
    if (loadingRef.current.hierarchicalStock) {
      console.log('⏳ Already loading hierarchical stock, skipping...');
      return state.hierarchicalStock;
    }

    loadingRef.current.hierarchicalStock = true;
    setLoading('hierarchicalStock', true);

    try {
      const url = Config.endpoints.inventory.hierarchicalStock.list(params);
      console.log('🔗 loadHierarchicalStock URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 loadHierarchicalStock response:', response.data);
      
      const data = handleResponse(response.data);
      
      setState(prev => ({ ...prev, hierarchicalStock: data }));
      return data;
    } catch (error) {
      console.error('❌ Error loading hierarchical stock:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت موجودی سلسله‌مراتبی');
      throw error;
    } finally {
      setLoading('hierarchicalStock', false);
      loadingRef.current.hierarchicalStock = false;
    }
  }, [getAuthHeaders, setLoading, setError, handleResponse, state.hierarchicalStock]);

  const addPallets = useCallback(async (data) => {
    setLoading('hierarchicalStock', true);
    try {
      const url = Config.endpoints.inventory.hierarchicalStock.addPallets();
      console.log('🔗 addPallets URL:', url);
      
      const response = await axios.post(url, data, { headers: getAuthHeaders() });
      console.log('✅ addPallets response:', response.data);
      
      await Promise.all([
        loadHierarchicalStock(),
        loadStockItems(),
        loadProducts(),
      ]);
      
      // بارگذاری جداگانه dashboard stats
      try {
        await loadDashboardStats();
      } catch (e) {
        console.warn('⚠️ Could not load dashboard stats:', e);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error adding pallets:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در افزودن پالت');
      throw error;
    } finally {
      setLoading('hierarchicalStock', false);
    }
  }, [getAuthHeaders, setLoading, setError, loadHierarchicalStock, loadStockItems, loadProducts, loadDashboardStats]);

  const addCustomPackaging = useCallback(async (data) => {
    setLoading('hierarchicalStock', true);
    try {
      const url = Config.endpoints.inventory.hierarchicalStock.addCustom();
      console.log('🔗 addCustomPackaging URL:', url);
      
      const response = await axios.post(url, data, { headers: getAuthHeaders() });
      console.log('✅ addCustomPackaging response:', response.data);
      
      await Promise.all([
        loadHierarchicalStock(),
        loadStockItems(),
        loadProducts(),
      ]);
      
      try {
        await loadDashboardStats();
      } catch (e) {
        console.warn('⚠️ Could not load dashboard stats:', e);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error adding custom packaging:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در افزودن بسته‌بندی سفارشی');
      throw error;
    } finally {
      setLoading('hierarchicalStock', false);
    }
  }, [getAuthHeaders, setLoading, setError, loadHierarchicalStock, loadStockItems, loadProducts, loadDashboardStats]);

  const removeHierarchicalStock = useCallback(async (data) => {
    setLoading('hierarchicalStock', true);
    try {
      const url = Config.endpoints.inventory.hierarchicalStock.remove();
      console.log('🔗 removeHierarchicalStock URL:', url);
      
      const response = await axios.post(url, data, { headers: getAuthHeaders() });
      console.log('✅ removeHierarchicalStock response:', response.data);
      
      await Promise.all([
        loadHierarchicalStock(),
        loadStockItems(),
        loadProducts(),
      ]);
      
      try {
        await loadDashboardStats();
      } catch (e) {
        console.warn('⚠️ Could not load dashboard stats:', e);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error removing hierarchical stock:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در خروج از موجودی سلسله‌مراتبی');
      throw error;
    } finally {
      setLoading('hierarchicalStock', false);
    }
  }, [getAuthHeaders, setLoading, setError, loadHierarchicalStock, loadStockItems, loadProducts, loadDashboardStats]);

  const getStockBreakdown = useCallback(async (params) => {
    try {
      const url = Config.endpoints.inventory.hierarchicalStock.getBreakdown(params);
      console.log('🔗 getStockBreakdown URL:', url);
      
      const response = await axios.get(url, { headers: getAuthHeaders() });
      console.log('📦 getStockBreakdown response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error getting stock breakdown:', error);
      console.error('❌ Error response:', error.response?.data);
      setError(error.response?.data?.message || 'خطا در دریافت تفکیک موجودی');
      throw error;
    }
  }, [getAuthHeaders, setError]);

  // ============================================
  // Reset State
  // ============================================
  const resetState = useCallback(() => {
    setState(initialState);
    initialLoadDone.current = false;
    Object.keys(loadingRef.current).forEach(key => {
      loadingRef.current[key] = false;
    });
  }, []);

  // ============================================
  // Initial Load
  // ============================================
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      console.log('🔄 Initial inventory load started');
      
      Promise.all([
        loadUnits().catch(err => console.warn('⚠️ loadUnits error:', err)),
        loadUnitTree().catch(err => console.warn('⚠️ loadUnitTree error:', err)),
        loadUnitRoots().catch(err => console.warn('⚠️ loadUnitRoots error:', err)),
        loadProducts().catch(err => console.warn('⚠️ loadProducts error:', err)),
        loadCategories().catch(err => console.warn('⚠️ loadCategories error:', err)),
        loadWarehouses().catch(err => console.warn('⚠️ loadWarehouses error:', err)),
        loadStockItems().catch(err => console.warn('⚠️ loadStockItems error:', err)),
        loadDashboardStats().catch(err => console.warn('⚠️ loadDashboardStats error:', err)),
        loadAlertStatistics().catch(err => console.warn('⚠️ loadAlertStatistics error:', err)),
      ]).then(() => {
        console.log('✅ Initial inventory load completed');
      }).catch((error) => {
        console.error('❌ Initial inventory load error:', error);
      });
    }
  }, []);

  // ============================================
  // Context Value
  // ============================================
const value = useMemo(() => ({
  state,
  
  // ===== Units =====
  loadUnits,
  loadUnitTree,
  loadUnitRoots,
  loadUnitChildren,
  loadUnitAllDescendants,
  createUnit,
  updateUnit,
  deleteUnit,
  getUnitBreakdown,
  getUnitBreakdownFromChild,
  
  // ===== Products =====
  loadProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStockInUnit,
  getProductStockItems,
  getProductTransactions,
  
  // ===== Categories =====
  loadCategories,        // ✅ این درست شد
  createCategory,
  updateCategory,
  deleteCategory,
  
  // ===== Warehouses =====
  loadWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getWarehouseStockItems,
  getWarehouseTotalValue,
  
  // ===== Stock Items =====
  loadStockItems,
  updateStockItem,
  getStockInUnit,
  
  // ===== Transactions =====
  loadTransactions,
  confirmTransaction,
  cancelTransaction,
  archiveTransaction,
  unarchiveTransaction,
  getDailyReport,
  
  // ===== Unit Inventory (ورود و خروج با واحد) =====
  receiveWithUnit,
  removeWithUnit,
  // aliases برای کامپوننت‌های قدیمی
  addStock: receiveWithUnit,
  removeStock: removeWithUnit,
  createTransaction: async (data) => {
    if (data?.transaction_type === 'OUT' || data?.type === 'OUT') {
      return removeWithUnit(data)
    }
    return receiveWithUnit(data)
  },
  
  // ===== Authorized Persons =====
  loadAuthorizedPersons,
  loadPersons: loadAuthorizedPersons,
  createAuthorizedPerson,
  updateAuthorizedPerson,
  deleteAuthorizedPerson,
  
  // ===== Alerts =====
  loadAlerts,
  resolveAlert,
  loadAlertStatistics,
  
  // ===== Movements =====
  loadMovements,
  getMovementsByProduct,
  getMovementsByWarehouse,
  
  // ===== Dashboard & Reports =====
  loadDashboardStats,
  getStockReport,
  getWarehouseStockReport,
  getTransactionReport,
  getOutReport,
  getInReport,
  getLowStockReport,
  
  // ===== Packaging =====
  loadPackagingLevels,
  loadPackagingConfigs,
  loadPackagingVariants,
  savePackagingHierarchy,
  getPackagingHierarchy,
  
  // ===== Hierarchical Stock =====
  loadHierarchicalStock,
  addPallets,
  addCustomPackaging,
  removeHierarchicalStock,
  getStockBreakdown,
  
  // ===== Helpers =====
  setError,
  resetState,
  
}), [
  state,
  loadUnits,
  loadUnitTree,
  loadUnitRoots,
  loadUnitChildren,
  loadUnitAllDescendants,
  createUnit,
  updateUnit,
  deleteUnit,
  getUnitBreakdown,
  getUnitBreakdownFromChild,
  loadProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStockInUnit,
  getProductStockItems,
  getProductTransactions,
  loadCategories,        // ✅ این در dependencies اضافه شد
  createCategory,
  updateCategory,
  deleteCategory,
  loadWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getWarehouseStockItems,
  getWarehouseTotalValue,
  loadStockItems,
  updateStockItem,
  getStockInUnit,
  loadTransactions,
  confirmTransaction,
  cancelTransaction,
  archiveTransaction,
  unarchiveTransaction,
  getDailyReport,
  receiveWithUnit,
  removeWithUnit,
  loadAuthorizedPersons,
  createAuthorizedPerson,
  updateAuthorizedPerson,
  deleteAuthorizedPerson,
  loadAlerts,
  resolveAlert,
  loadAlertStatistics,
  loadMovements,
  getMovementsByProduct,
  getMovementsByWarehouse,
  loadDashboardStats,
  getStockReport,
  getWarehouseStockReport,
  getTransactionReport,
  getOutReport,
  getInReport,
  getLowStockReport,
  loadPackagingLevels,
  loadPackagingConfigs,
  loadPackagingVariants,
  savePackagingHierarchy,
  getPackagingHierarchy,
  loadHierarchicalStock,
  addPallets,
  addCustomPackaging,
  removeHierarchicalStock,
  getStockBreakdown,
  setError,
  resetState,
]);

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

// ============================================
// Custom Hook
// ============================================
export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

export default InventoryContext;