// modules/inventory/context/InventoryContext.jsx

'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import InventoryApi from '../../services/inventoryApi';

// ============================================
// Initial State
// ============================================
const initialState = {
  loading: {
    warehouses: false,
    products: false,
    transactions: false,
    alerts: false,
    persons: false,
    packaging: false,
    units: false,
    categories: false,
  },
  warehouses: [],
  products: [],
  transactions: [],
  alerts: [],
  authorizedPersons: [],
  units: [],
  categories: [],
  packagingLevels: [],
  packagingConfigs: [],
  packagingVariants: [],
  hierarchicalStock: [],
  pagination: {
    warehouses: { page: 1, total: 0, pageSize: 20 },
    products: { page: 1, total: 0, pageSize: 20 },
    transactions: { page: 1, total: 0, pageSize: 20 },
    alerts: { page: 1, total: 0, pageSize: 20 },
    persons: { page: 1, total: 0, pageSize: 20 },
  },
  filters: {
    warehouses: {},
    products: {},
    transactions: {},
    alerts: {},
    persons: {},
  },
  selected: {
    warehouse: null,
    product: null,
    transaction: null,
    alert: null,
    person: null,
  },
  error: null,
};

// ============================================
// Actions
// ============================================
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  SET_WAREHOUSES: 'SET_WAREHOUSES',
  ADD_WAREHOUSE: 'ADD_WAREHOUSE',
  UPDATE_WAREHOUSE: 'UPDATE_WAREHOUSE',
  DELETE_WAREHOUSE: 'DELETE_WAREHOUSE',
  SELECT_WAREHOUSE: 'SELECT_WAREHOUSE',
  
  SET_PRODUCTS: 'SET_PRODUCTS',
  ADD_PRODUCT: 'ADD_PRODUCT',
  UPDATE_PRODUCT: 'UPDATE_PRODUCT',
  DELETE_PRODUCT: 'DELETE_PRODUCT',
  SELECT_PRODUCT: 'SELECT_PRODUCT',
  
  SET_TRANSACTIONS: 'SET_TRANSACTIONS',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  UPDATE_TRANSACTION: 'UPDATE_TRANSACTION',
  SELECT_TRANSACTION: 'SELECT_TRANSACTION',
  
  SET_ALERTS: 'SET_ALERTS',
  RESOLVE_ALERT: 'RESOLVE_ALERT',
  
  SET_PERSONS: 'SET_PERSONS',
  ADD_PERSON: 'ADD_PERSON',
  UPDATE_PERSON: 'UPDATE_PERSON',
  DELETE_PERSON: 'DELETE_PERSON',
  
  SET_UNITS: 'SET_UNITS',
  ADD_UNIT: 'ADD_UNIT',
  UPDATE_UNIT: 'UPDATE_UNIT',
  DELETE_UNIT: 'DELETE_UNIT',
  
  SET_CATEGORIES: 'SET_CATEGORIES',
  
  SET_PACKAGING_LEVELS: 'SET_PACKAGING_LEVELS',
  SET_PACKAGING_CONFIGS: 'SET_PACKAGING_CONFIGS',
  ADD_PACKAGING_CONFIG: 'ADD_PACKAGING_CONFIG',
  UPDATE_PACKAGING_CONFIG: 'UPDATE_PACKAGING_CONFIG',
  DELETE_PACKAGING_CONFIG: 'DELETE_PACKAGING_CONFIG',
  SET_PACKAGING_VARIANTS: 'SET_PACKAGING_VARIANTS',
  ADD_PACKAGING_VARIANT: 'ADD_PACKAGING_VARIANT',
  UPDATE_PACKAGING_VARIANT: 'UPDATE_PACKAGING_VARIANT',
  DELETE_PACKAGING_VARIANT: 'DELETE_PACKAGING_VARIANT',
  SET_HIERARCHICAL_STOCK: 'SET_HIERARCHICAL_STOCK',
  
  SET_PAGINATION: 'SET_PAGINATION',
  SET_FILTERS: 'SET_FILTERS',
};

// ============================================
// Reducer
// ============================================
function inventoryReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value },
      };

    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };

    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case ACTIONS.SET_WAREHOUSES:
      return { ...state, warehouses: action.payload };

    case ACTIONS.ADD_WAREHOUSE:
      return { ...state, warehouses: [action.payload, ...state.warehouses] };

    case ACTIONS.UPDATE_WAREHOUSE:
      return {
        ...state,
        warehouses: state.warehouses.map((w) =>
          w.id === action.payload.id ? action.payload : w
        ),
      };

    case ACTIONS.DELETE_WAREHOUSE:
      return {
        ...state,
        warehouses: state.warehouses.filter((w) => w.id !== action.payload),
      };

    case ACTIONS.SELECT_WAREHOUSE:
      return { ...state, selected: { ...state.selected, warehouse: action.payload } };

    case ACTIONS.SET_PRODUCTS:
      return { ...state, products: action.payload };

    case ACTIONS.ADD_PRODUCT:
      return { ...state, products: [action.payload, ...state.products] };

    case ACTIONS.UPDATE_PRODUCT:
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };

    case ACTIONS.DELETE_PRODUCT:
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.payload),
      };

    case ACTIONS.SELECT_PRODUCT:
      return { ...state, selected: { ...state.selected, product: action.payload } };

    case ACTIONS.SET_TRANSACTIONS:
      return { ...state, transactions: action.payload };

    case ACTIONS.ADD_TRANSACTION:
      return { ...state, transactions: [action.payload, ...state.transactions] };

    case ACTIONS.UPDATE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };

    case ACTIONS.SELECT_TRANSACTION:
      return { ...state, selected: { ...state.selected, transaction: action.payload } };

    case ACTIONS.SET_ALERTS:
      return { ...state, alerts: action.payload };

    case ACTIONS.RESOLVE_ALERT:
      return {
        ...state,
        alerts: state.alerts.map((a) =>
          a.id === action.payload ? { ...a, is_resolved: true } : a
        ),
      };

    case ACTIONS.SET_PERSONS:
      return { ...state, authorizedPersons: action.payload };

    case ACTIONS.ADD_PERSON:
      return { ...state, authorizedPersons: [action.payload, ...state.authorizedPersons] };

    case ACTIONS.UPDATE_PERSON:
      return {
        ...state,
        authorizedPersons: state.authorizedPersons.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };

    case ACTIONS.DELETE_PERSON:
      return {
        ...state,
        authorizedPersons: state.authorizedPersons.filter((p) => p.id !== action.payload),
      };

    case ACTIONS.SET_UNITS:
      return { ...state, units: action.payload };

    case ACTIONS.ADD_UNIT:
      return { ...state, units: [action.payload, ...state.units] };

    case ACTIONS.UPDATE_UNIT:
      return {
        ...state,
        units: state.units.map((u) =>
          u.id === action.payload.id ? action.payload : u
        ),
      };

    case ACTIONS.DELETE_UNIT:
      return {
        ...state,
        units: state.units.filter((u) => u.id !== action.payload),
      };

    case ACTIONS.SET_CATEGORIES:
      return { ...state, categories: action.payload };

    case ACTIONS.SET_PACKAGING_LEVELS:
      return { ...state, packagingLevels: action.payload };

    case ACTIONS.SET_PACKAGING_CONFIGS:
      return { ...state, packagingConfigs: action.payload };

    case ACTIONS.ADD_PACKAGING_CONFIG:
      return { ...state, packagingConfigs: [action.payload, ...state.packagingConfigs] };

    case ACTIONS.UPDATE_PACKAGING_CONFIG:
      return {
        ...state,
        packagingConfigs: state.packagingConfigs.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };

    case ACTIONS.DELETE_PACKAGING_CONFIG:
      return {
        ...state,
        packagingConfigs: state.packagingConfigs.filter((c) => c.id !== action.payload),
      };

    case ACTIONS.SET_PACKAGING_VARIANTS:
      return { ...state, packagingVariants: action.payload };

    case ACTIONS.ADD_PACKAGING_VARIANT:
      return { ...state, packagingVariants: [action.payload, ...state.packagingVariants] };

    case ACTIONS.UPDATE_PACKAGING_VARIANT:
      return {
        ...state,
        packagingVariants: state.packagingVariants.map((v) =>
          v.id === action.payload.id ? action.payload : v
        ),
      };

    case ACTIONS.DELETE_PACKAGING_VARIANT:
      return {
        ...state,
        packagingVariants: state.packagingVariants.filter((v) => v.id !== action.payload),
      };

    case ACTIONS.SET_HIERARCHICAL_STOCK:
      return { ...state, hierarchicalStock: action.payload };

    case ACTIONS.SET_PAGINATION:
      return {
        ...state,
        pagination: {
          ...state.pagination,
          [action.payload.key]: {
            ...state.pagination[action.payload.key],
            ...action.payload.data,
          },
        },
      };

    case ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, [action.payload.key]: action.payload.data },
      };

    default:
      return state;
  }
}

// ============================================
// Context
// ============================================
const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const { getAuthHeaders } = useAuth();
  const [state, dispatch] = useReducer(inventoryReducer, initialState);

  // ============================================
  // API Instance - با useMemo
  // ============================================
  const api = useMemo(() => new InventoryApi(getAuthHeaders), [getAuthHeaders]);

  // ============================================
  // Refs برای جلوگیری از رفرش بی‌نهایت
  // ============================================
  const initialLoadDone = useRef(false);
  const loadingRef = useRef({
    units: false,
    tree: false,
    products: false,
    warehouses: false,
    transactions: false,
    alerts: false,
    persons: false,
    packaging: false,
    categories: false,
  });
  
  const cacheRef = useRef({
    units: null,
    products: null,
    warehouses: null,
  });

  // ============================================
  // Helper Functions
  // ============================================
  const setLoading = useCallback((key, value) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: { key, value } });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: error });
    setTimeout(() => dispatch({ type: ACTIONS.CLEAR_ERROR }), 5000);
  }, []);

  const handleResponse = useCallback((data) => {
    if (Array.isArray(data)) return data;
    if (data?.results) return data.results;
    if (data?.data?.results) return data.data.results;
    if (data?.data && Array.isArray(data.data)) return data.data;
    return data;
  }, []);

  // ============================================
  // ابتدا توابع load را تعریف می‌کنیم (بدون وابستگی به هم)
  // ============================================

  // ============================================
  // 1. Units
  // ============================================
  const loadUnits = useCallback(async (params = {}) => {
    if (loadingRef.current.units) {
      console.log('⏳ Already loading units, skipping...');
      return;
    }

    loadingRef.current.units = true;
    setLoading('units', true);

    try {
      const data = await api.getUnits(params);
      const results = handleResponse(data);
      
      const currentDataStr = JSON.stringify(cacheRef.current.units);
      const newDataStr = JSON.stringify(results);
      
      if (newDataStr !== currentDataStr) {
        console.log('📦 Units changed, updating state');
        cacheRef.current.units = results;
        dispatch({ type: ACTIONS.SET_UNITS, payload: results });
      }

      return results;
    } catch (error) {
      console.error('❌ Error loading units:', error);
      setError('خطا در دریافت واحدها');
      throw error;
    } finally {
      setLoading('units', false);
      loadingRef.current.units = false;
    }
  }, [api, setLoading, setError, dispatch, handleResponse]);

  const loadUnitTree = useCallback(async () => {
    if (loadingRef.current.tree) {
      console.log('⏳ Already loading tree, skipping...');
      return;
    }

    loadingRef.current.tree = true;
    setLoading('units', true);

    try {
      const data = await api.getUnitTree();
      const results = handleResponse(data);
      
      const currentDataStr = JSON.stringify(cacheRef.current.units);
      const newDataStr = JSON.stringify(results);
      
      if (newDataStr !== currentDataStr) {
        console.log('🌳 Units tree changed, updating state');
        cacheRef.current.units = results;
        dispatch({ type: ACTIONS.SET_UNITS, payload: results });
      }

      return results;
    } catch (error) {
      console.error('❌ Error loading unit tree:', error);
      setError('خطا در دریافت درخت واحدها');
      throw error;
    } finally {
      setLoading('units', false);
      loadingRef.current.tree = false;
    }
  }, [api, setLoading, setError, dispatch, handleResponse]);

  const loadUnitRoots = useCallback(async () => {
    try {
      const data = await api.getUnitRoots();
      return handleResponse(data);
    } catch (error) {
      console.error('❌ Error loading unit roots:', error);
      setError('خطا در دریافت ریشه‌های واحدها');
      throw error;
    }
  }, [api, setError, handleResponse]);

  // ============================================
  // 2. Products
  // ============================================
  const loadProducts = useCallback(async (params = {}) => {
    if (loadingRef.current.products) {
      console.log('⏳ Already loading products, skipping...');
      return;
    }

    loadingRef.current.products = true;
    setLoading('products', true);

    try {
      const data = await api.getProducts(params);
      const results = handleResponse(data);
      
      const currentDataStr = JSON.stringify(cacheRef.current.products);
      const newDataStr = JSON.stringify(results);
      
      if (newDataStr !== currentDataStr) {
        console.log('📦 Products changed, updating state');
        cacheRef.current.products = results;
        dispatch({ type: ACTIONS.SET_PRODUCTS, payload: results });
      }

      return results;
    } catch (error) {
      console.error('❌ Error loading products:', error);
      setError('خطا در دریافت لیست کالاها');
      throw error;
    } finally {
      setLoading('products', false);
      loadingRef.current.products = false;
    }
  }, [api, setLoading, setError, dispatch, handleResponse]);

  // ============================================
  // 3. Warehouses
  // ============================================
  const loadWarehouses = useCallback(async (params = {}) => {
    if (loadingRef.current.warehouses) {
      console.log('⏳ Already loading warehouses, skipping...');
      return;
    }

    loadingRef.current.warehouses = true;
    setLoading('warehouses', true);

    try {
      const data = await api.getWarehouses(params);
      const results = handleResponse(data);
      
      const currentDataStr = JSON.stringify(cacheRef.current.warehouses);
      const newDataStr = JSON.stringify(results);
      
      if (newDataStr !== currentDataStr) {
        console.log('🏠 Warehouses changed, updating state');
        cacheRef.current.warehouses = results;
        dispatch({ type: ACTIONS.SET_WAREHOUSES, payload: results });
      }

      return results;
    } catch (error) {
      setError('خطا در دریافت لیست انبارها');
      throw error;
    } finally {
      setLoading('warehouses', false);
      loadingRef.current.warehouses = false;
    }
  }, [api, setLoading, setError, dispatch, handleResponse]);

  // ============================================
  // 4. Transactions
  // ============================================
  const loadTransactions = useCallback(async (params = {}) => {
    if (loadingRef.current.transactions) {
      console.log('⏳ Already loading transactions, skipping...');
      return;
    }

    loadingRef.current.transactions = true;
    setLoading('transactions', true);

    try {
      const data = await api.getTransactions(params);
      const results = handleResponse(data);
      dispatch({ type: ACTIONS.SET_TRANSACTIONS, payload: results });
      return results;
    } catch (error) {
      setError('خطا در دریافت تراکنش‌ها');
      throw error;
    } finally {
      setLoading('transactions', false);
      loadingRef.current.transactions = false;
    }
  }, [api, setLoading, setError, dispatch, handleResponse]);

  // ============================================
  // 5. Alerts
  // ============================================
  const loadAlerts = useCallback(async (params = {}) => {
    if (loadingRef.current.alerts) {
      console.log('⏳ Already loading alerts, skipping...');
      return;
    }

    loadingRef.current.alerts = true;
    setLoading('alerts', true);

    try {
      const data = await api.getAlerts(params);
      const results = handleResponse(data);
      dispatch({ type: ACTIONS.SET_ALERTS, payload: results });
      return results;
    } catch (error) {
      setError('خطا در دریافت هشدارها');
      throw error;
    } finally {
      setLoading('alerts', false);
      loadingRef.current.alerts = false;
    }
  }, [api, setLoading, setError, dispatch, handleResponse]);

  // ============================================
  // 6. Persons
  // ============================================
  const loadPersons = useCallback(async (params = {}) => {
    if (loadingRef.current.persons) {
      console.log('⏳ Already loading persons, skipping...');
      return;
    }

    loadingRef.current.persons = true;
    setLoading('persons', true);

    try {
      const data = await api.getAuthorizedPersons(params);
      const results = handleResponse(data);
      dispatch({ type: ACTIONS.SET_PERSONS, payload: results });
      return results;
    } catch (error) {
      setError('خطا در دریافت افراد مجاز');
      throw error;
    } finally {
      setLoading('persons', false);
      loadingRef.current.persons = false;
    }
  }, [api, setLoading, setError, dispatch, handleResponse]);

  // ============================================
  // 7. Categories
  // ============================================
  const loadCategories = useCallback(async (params = {}) => {
    if (loadingRef.current.categories) {
      console.log('⏳ Already loading categories, skipping...');
      return;
    }

    loadingRef.current.categories = true;

    try {
      const data = await api.getCategories(params);
      const results = handleResponse(data);
      dispatch({ type: ACTIONS.SET_CATEGORIES, payload: results });
      return results;
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      loadingRef.current.categories = false;
    }
  }, [api, dispatch, handleResponse]);

  // ============================================
  // 8. Packaging
  // ============================================
  const loadPackagingLevels = useCallback(async (params = {}) => {
    try {
      const data = await api.getPackagingLevels(params);
      const results = handleResponse(data);
      dispatch({ type: ACTIONS.SET_PACKAGING_LEVELS, payload: results });
      return results;
    } catch (error) {
      console.error('Error loading packaging levels:', error);
    }
  }, [api, dispatch, handleResponse]);

  const loadPackagingConfigs = useCallback(async (params = {}) => {
    if (loadingRef.current.packaging) {
      console.log('⏳ Already loading packaging configs, skipping...');
      return;
    }

    loadingRef.current.packaging = true;
    setLoading('packaging', true);

    try {
      const data = await api.getPackagingConfigs(params);
      const results = handleResponse(data);
      dispatch({ type: ACTIONS.SET_PACKAGING_CONFIGS, payload: results });
      return results;
    } catch (error) {
      setError('خطا در دریافت تنظیمات بسته‌بندی');
      throw error;
    } finally {
      setLoading('packaging', false);
      loadingRef.current.packaging = false;
    }
  }, [api, setLoading, setError, dispatch, handleResponse]);

  const loadPackagingVariants = useCallback(async (params = {}) => {
    try {
      const data = await api.getPackagingVariants(params);
      const results = handleResponse(data);
      dispatch({ type: ACTIONS.SET_PACKAGING_VARIANTS, payload: results });
      return results;
    } catch (error) {
      console.error('Error loading packaging variants:', error);
    }
  }, [api, dispatch, handleResponse]);

  // ============================================
  // 9. Hierarchical Stock
  // ============================================
  const loadHierarchicalStock = useCallback(async (params = {}) => {
    setLoading('packaging', true);
    try {
      const data = await api.getHierarchicalStock(params);
      const results = handleResponse(data);
      dispatch({ type: ACTIONS.SET_HIERARCHICAL_STOCK, payload: results });
      return results;
    } catch (error) {
      setError('خطا در دریافت موجودی سلسله‌مراتبی');
      throw error;
    } finally {
      setLoading('packaging', false);
    }
  }, [api, setLoading, setError, dispatch, handleResponse]);

  // ============================================
  // 10. Unit Inventory - ورود و خروج با واحدهای سلسله‌مراتبی ✅
  // (بعد از تعریف loadTransactions و loadProducts)
  // ============================================

  /**
   * ورود کالا با واحد سلسله‌مراتبی
   * @param {Object} data - { product_id, warehouse_id, unit_id, quantity, description }
   */
  const receiveWithUnit = useCallback(async (data) => {
    setLoading('transactions', true);
    setError(null);
    
    try {
      const result = await api.receiveWithUnit(data);
      
      // بعد از موفقیت، تراکنش‌ها و کالاها را مجدداً بارگذاری کن
      await loadTransactions();
      await loadProducts();
      
      dispatch({ type: ACTIONS.ADD_TRANSACTION, payload: result });
      return result;
    } catch (error) {
      console.error('❌ Error receiving with unit:', error);
      setError(error.message || 'خطا در ورود کالا');
      throw error;
    } finally {
      setLoading('transactions', false);
    }
  }, [api, setLoading, setError, dispatch, loadTransactions, loadProducts]);

  /**
   * خروج کالا با واحد سلسله‌مراتبی
   * @param {Object} data - { product_id, warehouse_id, unit_id, quantity, authorized_person_id, description }
   */
  const removeWithUnit = useCallback(async (data) => {
    setLoading('transactions', true);
    setError(null);
    
    try {
      const result = await api.removeWithUnit(data);
      
      // بعد از موفقیت، تراکنش‌ها و کالاها را مجدداً بارگذاری کن
      await loadTransactions();
      await loadProducts();
      
      dispatch({ type: ACTIONS.ADD_TRANSACTION, payload: result });
      return result;
    } catch (error) {
      console.error('❌ Error removing with unit:', error);
      setError(error.message || 'خطا در خروج کالا');
      throw error;
    } finally {
      setLoading('transactions', false);
    }
  }, [api, setLoading, setError, dispatch, loadTransactions, loadProducts]);

  /**
   * دریافت تفکیک یک واحد
   * @param {number} unitId - شناسه واحد
   * @param {number} quantity - تعداد
   */
  const getUnitBreakdown = useCallback(async (unitId, quantity = 1) => {
    try {
      const result = await api.getUnitBreakdown(unitId, quantity);
      return result;
    } catch (error) {
      console.error('❌ Error getting unit breakdown:', error);
      setError('خطا در دریافت تفکیک واحد');
      throw error;
    }
  }, [api, setError]);

  // ============================================
  // متدهای قدیمی (برای سازگاری با کدهای موجود) ✅
  // ============================================
  
  // این متدها به متدهای جدید اشاره می‌کنند
  const addStock = useCallback(async (data) => {
    return receiveWithUnit(data);
  }, [receiveWithUnit]);

  const removeStock = useCallback(async (data) => {
    return removeWithUnit(data);
  }, [removeWithUnit]);

  // ============================================
  // 11. CRUD Operations (بعد از load functions)
  // ============================================

  // Units CRUD
  const createUnit = useCallback(async (data) => {
    setLoading('units', true);
    try {
      const result = await api.createUnit(data);
      dispatch({ type: ACTIONS.ADD_UNIT, payload: result });
      await loadUnits();
      return result;
    } catch (error) {
      console.error('❌ Error creating unit:', error);
      setError('خطا در ایجاد واحد');
      throw error;
    } finally {
      setLoading('units', false);
    }
  }, [api, setLoading, setError, dispatch, loadUnits]);

  const updateUnit = useCallback(async (id, data) => {
    setLoading('units', true);
    try {
      const result = await api.updateUnit(id, data);
      dispatch({ type: ACTIONS.UPDATE_UNIT, payload: result });
      await loadUnits();
      return result;
    } catch (error) {
      console.error('❌ Error updating unit:', error);
      setError('خطا در ویرایش واحد');
      throw error;
    } finally {
      setLoading('units', false);
    }
  }, [api, setLoading, setError, dispatch, loadUnits]);

  const deleteUnit = useCallback(async (id) => {
    setLoading('units', true);
    try {
      await api.deleteUnit(id);
      dispatch({ type: ACTIONS.DELETE_UNIT, payload: id });
      await loadUnits();
      return true;
    } catch (error) {
      console.error('❌ Error deleting unit:', error);
      setError('خطا در حذف واحد');
      throw error;
    } finally {
      setLoading('units', false);
    }
  }, [api, setLoading, setError, dispatch, loadUnits]);

  // Warehouses CRUD
  const createWarehouse = useCallback(async (data) => {
    setLoading('warehouses', true);
    try {
      const result = await api.createWarehouse(data);
      dispatch({ type: ACTIONS.ADD_WAREHOUSE, payload: result });
      await loadWarehouses();
      return result;
    } catch (error) {
      setError('خطا در ایجاد انبار');
      throw error;
    } finally {
      setLoading('warehouses', false);
    }
  }, [api, setLoading, setError, dispatch, loadWarehouses]);

  const updateWarehouse = useCallback(async (id, data) => {
    setLoading('warehouses', true);
    try {
      const result = await api.updateWarehouse(id, data);
      dispatch({ type: ACTIONS.UPDATE_WAREHOUSE, payload: result });
      await loadWarehouses();
      return result;
    } catch (error) {
      setError('خطا در ویرایش انبار');
      throw error;
    } finally {
      setLoading('warehouses', false);
    }
  }, [api, setLoading, setError, dispatch, loadWarehouses]);

  const deleteWarehouse = useCallback(async (id) => {
    setLoading('warehouses', true);
    try {
      await api.deleteWarehouse(id);
      dispatch({ type: ACTIONS.DELETE_WAREHOUSE, payload: id });
      await loadWarehouses();
    } catch (error) {
      setError('خطا در حذف انبار');
      throw error;
    } finally {
      setLoading('warehouses', false);
    }
  }, [api, setLoading, setError, dispatch, loadWarehouses]);

  // Products CRUD
  const createProduct = useCallback(async (data) => {
    setLoading('products', true);
    try {
      const result = await api.createProduct(data);
      dispatch({ type: ACTIONS.ADD_PRODUCT, payload: result });
      await loadProducts();
      return result;
    } catch (error) {
      setError('خطا در ایجاد کالا');
      throw error;
    } finally {
      setLoading('products', false);
    }
  }, [api, setLoading, setError, dispatch, loadProducts]);

  const updateProduct = useCallback(async (id, data) => {
    setLoading('products', true);
    try {
      const result = await api.updateProduct(id, data);
      dispatch({ type: ACTIONS.UPDATE_PRODUCT, payload: result });
      await loadProducts();
      return result;
    } catch (error) {
      setError('خطا در ویرایش کالا');
      throw error;
    } finally {
      setLoading('products', false);
    }
  }, [api, setLoading, setError, dispatch, loadProducts]);

  const deleteProduct = useCallback(async (id) => {
    setLoading('products', true);
    try {
      await api.deleteProduct(id);
      dispatch({ type: ACTIONS.DELETE_PRODUCT, payload: id });
      await loadProducts();
    } catch (error) {
      setError('خطا در حذف کالا');
      throw error;
    } finally {
      setLoading('products', false);
    }
  }, [api, setLoading, setError, dispatch, loadProducts]);

  // Persons CRUD
const createPerson = useCallback(async (data) => {
  setLoading('persons', true);
  try {
    // ✅ داده‌ها را به صورت JSON ارسال کن
    const result = await api.createAuthorizedPerson(data);
    dispatch({ type: ACTIONS.ADD_PERSON, payload: result });
    await loadPersons();
    return result;
  } catch (error) {
    setError('خطا در ایجاد فرد مجاز');
    throw error;
  } finally {
    setLoading('persons', false);
  }
}, [api, setLoading, setError, dispatch, loadPersons]);

const updatePerson = useCallback(async (id, data) => {
  setLoading('persons', true);
  try {
    // ✅ داده‌ها را به صورت JSON ارسال کن
    const result = await api.updateAuthorizedPerson(id, data);
    dispatch({ type: ACTIONS.UPDATE_PERSON, payload: result });
    await loadPersons();
    return result;
  } catch (error) {
    setError('خطا در ویرایش فرد مجاز');
    throw error;
  } finally {
    setLoading('persons', false);
  }
}, [api, setLoading, setError, dispatch, loadPersons]);

  const deletePerson = useCallback(async (id) => {
    setLoading('persons', true);
    try {
      await api.deleteAuthorizedPerson(id);
      dispatch({ type: ACTIONS.DELETE_PERSON, payload: id });
      await loadPersons();
    } catch (error) {
      setError('خطا در حذف فرد مجاز');
      throw error;
    } finally {
      setLoading('persons', false);
    }
  }, [api, setLoading, setError, dispatch, loadPersons]);

  // Alerts
  const resolveAlert = useCallback(async (id) => {
    try {
      await api.resolveAlert(id);
      dispatch({ type: ACTIONS.RESOLVE_ALERT, payload: id });
      await loadAlerts();
    } catch (error) {
      setError('خطا در برطرف کردن هشدار');
      throw error;
    }
  }, [api, setError, dispatch, loadAlerts]);

  // Packaging CRUD
  const createPackagingConfig = useCallback(async (data) => {
    setLoading('packaging', true);
    try {
      const result = await api.createPackagingConfig(data);
      dispatch({ type: ACTIONS.ADD_PACKAGING_CONFIG, payload: result });
      await loadPackagingConfigs();
      return result;
    } catch (error) {
      setError('خطا در ایجاد تنظیمات بسته‌بندی');
      throw error;
    } finally {
      setLoading('packaging', false);
    }
  }, [api, setLoading, setError, dispatch, loadPackagingConfigs]);

  const updatePackagingConfig = useCallback(async (id, data) => {
    setLoading('packaging', true);
    try {
      const result = await api.updatePackagingConfig(id, data);
      dispatch({ type: ACTIONS.UPDATE_PACKAGING_CONFIG, payload: result });
      await loadPackagingConfigs();
      return result;
    } catch (error) {
      setError('خطا در ویرایش تنظیمات بسته‌بندی');
      throw error;
    } finally {
      setLoading('packaging', false);
    }
  }, [api, setLoading, setError, dispatch, loadPackagingConfigs]);

  const deletePackagingConfig = useCallback(async (id) => {
    setLoading('packaging', true);
    try {
      await api.deletePackagingConfig(id);
      dispatch({ type: ACTIONS.DELETE_PACKAGING_CONFIG, payload: id });
      await loadPackagingConfigs();
    } catch (error) {
      setError('خطا در حذف تنظیمات بسته‌بندی');
      throw error;
    } finally {
      setLoading('packaging', false);
    }
  }, [api, setLoading, setError, dispatch, loadPackagingConfigs]);

  const createPackagingVariant = useCallback(async (data) => {
    setLoading('packaging', true);
    try {
      const result = await api.createPackagingVariant(data);
      dispatch({ type: ACTIONS.ADD_PACKAGING_VARIANT, payload: result });
      await loadPackagingVariants();
      return result;
    } catch (error) {
      setError('خطا در ایجاد واریانت بسته‌بندی');
      throw error;
    } finally {
      setLoading('packaging', false);
    }
  }, [api, setLoading, setError, dispatch, loadPackagingVariants]);

  const updatePackagingVariant = useCallback(async (id, data) => {
    setLoading('packaging', true);
    try {
      const result = await api.updatePackagingVariant(id, data);
      dispatch({ type: ACTIONS.UPDATE_PACKAGING_VARIANT, payload: result });
      await loadPackagingVariants();
      return result;
    } catch (error) {
      setError('خطا در ویرایش واریانت بسته‌بندی');
      throw error;
    } finally {
      setLoading('packaging', false);
    }
  }, [api, setLoading, setError, dispatch, loadPackagingVariants]);

  const deletePackagingVariant = useCallback(async (id) => {
    setLoading('packaging', true);
    try {
      await api.deletePackagingVariant(id);
      dispatch({ type: ACTIONS.DELETE_PACKAGING_VARIANT, payload: id });
      await loadPackagingVariants();
    } catch (error) {
      setError('خطا در حذف واریانت بسته‌بندی');
      throw error;
    } finally {
      setLoading('packaging', false);
    }
  }, [api, setLoading, setError, dispatch, loadPackagingVariants]);

  const addPallets = useCallback(async (data) => {
    setLoading('packaging', true);
    try {
      const result = await api.addPallets(data);
      await loadHierarchicalStock();
      return result;
    } catch (error) {
      setError('خطا در ورود پالت‌ها');
      throw error;
    } finally {
      setLoading('packaging', false);
    }
  }, [api, setLoading, setError, loadHierarchicalStock]);

  // ============================================
  // Initial Load - فقط یکبار
  // ============================================
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      console.log('🔄 Initial load started');

      Promise.all([
        loadUnits(),
        loadProducts(),
        loadCategories(),
        loadPackagingLevels(),
      ]).then(() => {
        console.log('✅ Initial load completed');
      }).catch((error) => {
        console.error('❌ Initial load error:', error);
      });
    }
  }, []);

  // ============================================
  // Context Value - با useMemo
  // ============================================
  const value = useMemo(() => ({
    state,
    dispatch,
    api,

    // ===== Unit Inventory (جدید) =====
    receiveWithUnit,
    removeWithUnit,
    getUnitBreakdown,

    // ===== Units =====
    loadUnits,
    loadUnitTree,
    loadUnitRoots,
    createUnit,
    updateUnit,
    deleteUnit,

    // ===== Warehouses =====
    loadWarehouses,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,

    // ===== Products =====
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,

    // ===== Transactions (قدیمی - برای سازگاری) =====
    loadTransactions,
    addStock,      // ← اشاره به receiveWithUnit
    removeStock,   // ← اشاره به removeWithUnit

    // ===== Alerts =====
    loadAlerts,
    resolveAlert,

    // ===== Persons =====
    loadPersons,
    createPerson,
    updatePerson,
    deletePerson,

    // ===== Categories =====
    loadCategories,

    // ===== Packaging =====
    loadPackagingLevels,
    loadPackagingConfigs,
    createPackagingConfig,
    updatePackagingConfig,
    deletePackagingConfig,
    loadPackagingVariants,
    createPackagingVariant,
    updatePackagingVariant,
    deletePackagingVariant,

    // ===== Hierarchical Stock =====
    loadHierarchicalStock,
    addPallets,

    // ===== Helpers =====
    setError,
  }), [
    state, dispatch, api,
    receiveWithUnit, removeWithUnit, getUnitBreakdown,
    loadUnits, loadUnitTree, loadUnitRoots, createUnit, updateUnit, deleteUnit,
    loadWarehouses, createWarehouse, updateWarehouse, deleteWarehouse,
    loadProducts, createProduct, updateProduct, deleteProduct,
    loadTransactions, addStock, removeStock,
    loadAlerts, resolveAlert,
    loadPersons, createPerson, updatePerson, deletePerson,
    loadCategories,
    loadPackagingLevels, loadPackagingConfigs, createPackagingConfig,
    updatePackagingConfig, deletePackagingConfig, loadPackagingVariants,
    createPackagingVariant, updatePackagingVariant, deletePackagingVariant,
    loadHierarchicalStock, addPallets,
    setError,
  ]);

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};