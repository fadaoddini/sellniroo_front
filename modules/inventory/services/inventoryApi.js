// modules/inventory/services/inventoryApi.js

import axios from 'axios';
import Config from '@/config/config';

class InventoryApi {
  constructor(getAuthHeaders) {
    this.getAuthHeaders = getAuthHeaders;
    this.baseUrl = Config.baseUrl;
  }

  // ============================================
  // Helper
  // ============================================
  async request(config) {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios({
        ...config,
        headers: { ...headers, ...config.headers },
      });
      // اگر پاسخ دارای results باشد (صفحه‌بندی) آن را برمی‌گردانیم
      if (response.data?.results !== undefined) {
        return {
          results: response.data.results,
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
        };
      }
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ============================================
  // ============ UNIT INVENTORY ================
  // ورود و خروج با واحدهای سلسله‌مراتبی
  // ============================================
  
  /**
   * ورود کالا با واحد سلسله‌مراتبی
   * @param {Object} data - { product_id, warehouse_id, unit_id, quantity, description }
   * @returns {Promise} - { status, message, data: { transaction_id, reference_number, product, warehouse, quantity, unit, quantity_in_root, root_unit, new_stock, created } }
   */
  receiveWithUnit(data) {
    return this.request({
      method: 'POST',
      url: `${this.baseUrl}/inventory/unit-inventory/receive/`,
      data,
    });
  }

  /**
   * خروج کالا با واحد سلسله‌مراتبی
   * @param {Object} data - { product_id, warehouse_id, unit_id, quantity, authorized_person_id, description }
   * @returns {Promise} - { status, message, data: { transaction_id, reference_number, product, warehouse, quantity, unit, quantity_in_root, root_unit, remaining_stock } }
   */
  removeWithUnit(data) {
    return this.request({
      method: 'POST',
      url: `${this.baseUrl}/inventory/unit-inventory/remove/`,
      data,
    });
  }

  /**
   * دریافت تفکیک یک واحد (از ریشه به پایین)
   * @param {number} unitId - شناسه واحد
   * @param {number} quantity - تعداد (پیش‌فرض 1)
   * @returns {Promise} - { status, data: { unit, quantity, breakdown, quantity_in_root } }
   */
  getUnitBreakdown(unitId, quantity = 1) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/unit-inventory/breakdown/?unit_id=${unitId}&quantity=${quantity}`,
    });
  }

  /**
   * دریافت تفکیک از پایین به بالا (از فرزند به ریشه)
   * @param {number} unitId - شناسه واحد
   * @param {number} quantity - تعداد (پیش‌فرض 1)
   * @returns {Promise} - { status, data: { unit, quantity, breakdown, quantity_in_root } }
   */
  getUnitBreakdownFromChild(unitId, quantity = 1) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/units/${unitId}/breakdown_from_child/?quantity=${quantity}`,
    });
  }

  /**
   * دریافت موجودی یک کالا در انبار بر حسب واحد مشخص
   * @param {number} productId - شناسه کالا
   * @param {number} warehouseId - شناسه انبار
   * @param {number} unitId - شناسه واحد
   * @returns {Promise} - { status, data: { product, warehouse, unit, quantity, quantity_in_root, root_unit, available } }
   */
  getStockInUnit(productId, warehouseId, unitId) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/unit-inventory/stock_in_unit/?product_id=${productId}&warehouse_id=${warehouseId}&unit_id=${unitId}`,
    });
  }

  // ============================================
  // ============ TRANSACTIONS ==================
  // ============================================
  
  /**
   * دریافت لیست تراکنش‌ها
   * @param {Object} params - { page, limit, search, transaction_type, status, warehouse, product, start_date, end_date }
   * @returns {Promise} - { results: [...], count, next, previous }
   */
  getTransactions(params = {}) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/transactions/`,
      params,
    });
  }

  /**
   * دریافت جزئیات یک تراکنش
   * @param {number} id - شناسه تراکنش
   */
  getTransaction(id) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/transactions/${id}/`,
    });
  }

  /**
   * تایید تراکنش (فقط تراکنش‌های در انتظار)
   * @param {number} id - شناسه تراکنش
   */
  confirmTransaction(id) {
    return this.request({
      method: 'POST',
      url: `${this.baseUrl}/inventory/transactions/${id}/confirm/`,
    });
  }

  /**
   * لغو تراکنش
   * @param {number} id - شناسه تراکنش
   */
  cancelTransaction(id) {
    return this.request({
      method: 'POST',
      url: `${this.baseUrl}/inventory/transactions/${id}/cancel/`,
    });
  }

  /**
   * دریافت گزارش روزانه تراکنش‌ها
   * @param {Object} params - { date, warehouse_id }
   */
  getDailyReport(params = {}) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/transactions/daily_report/`,
      params,
    });
  }

  // ============================================
  // ============ UNITS =========================
  // ============================================
  
  /**
   * دریافت لیست واحدها
   * @param {Object} params - { search, is_active, parent, parent_id }
   */
  getUnits(params = {}) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/units/`,
      params,
    });
  }

  /**
   * دریافت جزئیات یک واحد
   * @param {number} id - شناسه واحد
   */
  getUnit(id) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/units/${id}/`,
    });
  }

  /**
   * ایجاد واحد جدید
   * @param {Object} data - { title, abbreviation, description, parent, is_active, count_in_parent }
   */
  createUnit(data) {
    return this.request({
      method: 'POST',
      url: `${this.baseUrl}/inventory/units/`,
      data,
    });
  }

  /**
   * ویرایش کامل واحد
   * @param {number} id - شناسه واحد
   * @param {Object} data - { title, abbreviation, description, parent, is_active, count_in_parent }
   */
  updateUnit(id, data) {
    return this.request({
      method: 'PUT',
      url: `${this.baseUrl}/inventory/units/${id}/`,
      data,
    });
  }

  /**
   * ویرایش جزئی واحد
   * @param {number} id - شناسه واحد
   * @param {Object} data - داده‌های قابل ویرایش
   */
  partialUpdateUnit(id, data) {
    return this.request({
      method: 'PATCH',
      url: `${this.baseUrl}/inventory/units/${id}/`,
      data,
    });
  }

  /**
   * حذف واحد
   * @param {number} id - شناسه واحد
   */
  deleteUnit(id) {
    return this.request({
      method: 'DELETE',
      url: `${this.baseUrl}/inventory/units/${id}/`,
    });
  }

  /**
   * دریافت ساختار درختی کامل واحدها
   */
  getUnitTree() {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/units/tree/`,
    });
  }

  /**
   * دریافت واحدهای ریشه (بدون والد)
   */
  getUnitRoots() {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/units/roots/`,
    });
  }

  /**
   * دریافت زیرمجموعه‌های مستقیم یک واحد
   * @param {number} id - شناسه واحد
   */
  getUnitChildren(id) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/units/${id}/children/`,
    });
  }

  /**
   * دریافت تمام فرزندان (به صورت بازگشتی) یک واحد
   * @param {number} id - شناسه واحد
   */
  getUnitAllDescendants(id) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/units/${id}/all_descendants/`,
    });
  }

  // ============================================
  // ============ CATEGORIES ====================
  // ============================================
  
  /**
   * دریافت لیست دسته‌بندی‌ها
   * @param {Object} params - { search, is_active }
   */
  getCategories(params = {}) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/categories/`,
      params,
    });
  }

  /**
   * دریافت جزئیات دسته‌بندی
   * @param {number} id - شناسه دسته‌بندی
   */
  getCategory(id) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/categories/${id}/`,
    });
  }

  /**
   * ایجاد دسته‌بندی جدید
   * @param {Object} data - { title, parent, description, icon, is_active }
   */
  createCategory(data) {
    return this.request({
      method: 'POST',
      url: `${this.baseUrl}/inventory/categories/`,
      data,
    });
  }

  /**
   * ویرایش دسته‌بندی
   * @param {number} id - شناسه دسته‌بندی
   * @param {Object} data - { title, parent, description, icon, is_active }
   */
  updateCategory(id, data) {
    return this.request({
      method: 'PUT',
      url: `${this.baseUrl}/inventory/categories/${id}/`,
      data,
    });
  }

  /**
   * حذف دسته‌بندی
   * @param {number} id - شناسه دسته‌بندی
   */
  deleteCategory(id) {
    return this.request({
      method: 'DELETE',
      url: `${this.baseUrl}/inventory/categories/${id}/`,
    });
  }

  // ============================================
  // ============ WAREHOUSES ====================
  // ============================================
  
  /**
   * دریافت لیست انبارها
   * @param {Object} params - { search, is_active }
   */
  getWarehouses(params = {}) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/warehouses/`,
      params,
    });
  }

  /**
   * دریافت جزئیات انبار
   * @param {number} id - شناسه انبار
   */
  getWarehouse(id) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/warehouses/${id}/`,
    });
  }

  /**
   * ایجاد انبار جدید
   * @param {Object} data - { title, image, address, phone, manager, manager_phone, is_active }
   */
  createWarehouse(data) {
    return this.request({
      method: 'POST',
      url: `${this.baseUrl}/inventory/warehouses/`,
      data,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * ویرایش انبار
   * @param {number} id - شناسه انبار
   * @param {Object} data - { title, image, address, phone, manager, manager_phone, is_active }
   */
  updateWarehouse(id, data) {
    return this.request({
      method: 'PUT',
      url: `${this.baseUrl}/inventory/warehouses/${id}/`,
      data,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * حذف انبار
   * @param {number} id - شناسه انبار
   */
  deleteWarehouse(id) {
    return this.request({
      method: 'DELETE',
      url: `${this.baseUrl}/inventory/warehouses/${id}/`,
    });
  }

  /**
   * دریافت تمام موجودی‌های یک انبار
   * @param {number} id - شناسه انبار
   */
  getWarehouseStockItems(id) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/warehouses/${id}/stock_items/`,
    });
  }

  /**
   * دریافت ارزش کل موجودی انبار
   * @param {number} id - شناسه انبار
   */
  getWarehouseTotalValue(id) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/warehouses/${id}/total_value/`,
    });
  }

  // ============================================
  // ============ PRODUCTS ======================
  // ============================================
  
  /**
   * دریافت لیست کالاها
   * @param {Object} params - { search, category, is_active, root_unit, low_stock, ordering }
   */
  getProducts(params = {}) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/products/`,
      params,
    });
  }

  /**
   * دریافت جزئیات کالا
   * @param {number} id - شناسه کالا
   */
  getProduct(id) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/products/${id}/`,
    });
  }

  /**
   * ایجاد کالا جدید
   * @param {Object} data - { title, code, category, root_unit, main_image, images, video, description, specifications, min_stock_alert, is_active }
   */
  createProduct(data) {
    return this.request({
      method: 'POST',
      url: `${this.baseUrl}/inventory/products/`,
      data,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * ویرایش کالا
   * @param {number} id - شناسه کالا
   * @param {Object} data - داده‌های کالا
   */
  updateProduct(id, data) {
    return this.request({
      method: 'PUT',
      url: `${this.baseUrl}/inventory/products/${id}/`,
      data,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * حذف کالا
   * @param {number} id - شناسه کالا
   */
  deleteProduct(id) {
    return this.request({
      method: 'DELETE',
      url: `${this.baseUrl}/inventory/products/${id}/`,
    });
  }

  /**
   * دریافت موجودی کالا در تمام انبارها
   * @param {number} id - شناسه کالا
   */
  getProductStockItems(id) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/products/${id}/stock_items/`,
    });
  }

  /**
   * دریافت موجودی کالا بر حسب واحد مشخص
   * @param {number} productId - شناسه کالا
   * @param {number} unitId - شناسه واحد
   */
  getProductStockInUnit(productId, unitId) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/products/${productId}/stock_in_unit/?unit_id=${unitId}`,
    });
  }

  /**
   * دریافت تراکنش‌های یک کالا
   * @param {number} id - شناسه کالا
   */
  getProductTransactions(id) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/products/${id}/transactions/`,
    });
  }

  // ============================================
  // ============ STOCK ITEMS ===================
  // ============================================
  
  /**
   * دریافت لیست موجودی کالاها
   * @param {Object} params - { product, warehouse, is_low_stock, min_alert }
   */
  getStockItems(params = {}) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/stock-items/`,
      params,
    });
  }

  /**
   * دریافت جزئیات موجودی
   * @param {number} id - شناسه موجودی
   */
  getStockItem(id) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/stock-items/${id}/`,
    });
  }

  /**
   * ویرایش موجودی (تنظیمات هشدار)
   * @param {number} id - شناسه موجودی
   * @param {Object} data - { min_alert, max_capacity }
   */
  updateStockItem(id, data) {
    return this.request({
      method: 'PUT',
      url: `${this.baseUrl}/inventory/stock-items/${id}/`,
      data,
    });
  }

  /**
   * دریافت موجودی بر حسب واحد مشخص
   * @param {number} stockItemId - شناسه موجودی
   * @param {number} unitId - شناسه واحد
   */
  getStockItemInUnit(stockItemId, unitId) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/stock-items/${stockItemId}/get_quantity_in_unit/?unit_id=${unitId}`,
    });
  }

  // ============================================
  // ============ AUTHORIZED PERSONS ============
  // ============================================
  
  /**
   * دریافت لیست افراد مجاز
   * @param {Object} params - { search, is_active, can_confirm, warehouses }
   */
  getAuthorizedPersons(params = {}) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/authorized-persons/`,
      params,
    });
  }

  /**
   * دریافت جزئیات فرد مجاز
   * @param {number} id - شناسه فرد مجاز
   */
  getAuthorizedPerson(id) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/authorized-persons/${id}/`,
    });
  }

  /**
   * ایجاد فرد مجاز جدید
   * @param {Object} data - { user, full_name, position, phone, email, warehouses, is_active, can_confirm }
   */
  createAuthorizedPerson(data) {
    return this.request({
      method: 'POST',
      url: `${this.baseUrl}/inventory/authorized-persons/`,
      data,
    });
  }

  /**
   * ویرایش فرد مجاز
   * @param {number} id - شناسه فرد مجاز
   * @param {Object} data - داده‌های فرد مجاز
   */
  updateAuthorizedPerson(id, data) {
    return this.request({
      method: 'PUT',
      url: `${this.baseUrl}/inventory/authorized-persons/${id}/`,
      data,
    });
  }

  /**
   * حذف فرد مجاز
   * @param {number} id - شناسه فرد مجاز
   */
  deleteAuthorizedPerson(id) {
    return this.request({
      method: 'DELETE',
      url: `${this.baseUrl}/inventory/authorized-persons/${id}/`,
    });
  }

  /**
   * دریافت انبارهای مجاز یک فرد
   * @param {number} id - شناسه فرد مجاز
   */
  getAuthorizedPersonWarehouses(id) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/authorized-persons/${id}/warehouses/`,
    });
  }

  // ============================================
  // ============ ALERTS ========================
  // ============================================
  
  /**
   * دریافت لیست هشدارها
   * @param {Object} params - { alert_type, level, is_resolved, warehouse, product, product_id, warehouse_id }
   */
  getAlerts(params = {}) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/alerts/`,
      params,
    });
  }

  /**
   * دریافت جزئیات هشدار
   * @param {number} id - شناسه هشدار
   */
  getAlert(id) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/alerts/${id}/`,
    });
  }

  /**
   * برطرف کردن هشدار
   * @param {number} id - شناسه هشدار
   */
  resolveAlert(id) {
    return this.request({
      method: 'POST',
      url: `${this.baseUrl}/inventory/alerts/${id}/resolve/`,
    });
  }

  /**
   * دریافت آمار هشدارها
   */
  getAlertStatistics() {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/alerts/statistics/`,
    });
  }

  // ============================================
  // ============ MOVEMENTS =====================
  // ============================================
  
  /**
   * دریافت تاریخچه حرکات موجودی
   * @param {Object} params - { stock_item, movement_type, start_date, end_date }
   */
  getMovements(params = {}) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/movements/`,
      params,
    });
  }

  /**
   * دریافت حرکات یک محصول
   * @param {number} productId - شناسه محصول
   * @param {Object} params - { start_date, end_date, movement_type }
   */
  getMovementsByProduct(productId, params = {}) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/movements/by_product/${productId}/`,
      params,
    });
  }

  /**
   * دریافت حرکات یک انبار
   * @param {number} warehouseId - شناسه انبار
   * @param {Object} params - { start_date, end_date, movement_type }
   */
  getMovementsByWarehouse(warehouseId, params = {}) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/movements/by_warehouse/${warehouseId}/`,
      params,
    });
  }

  // ============================================
  // ============ REPORTS =======================
  // ============================================
  
  /**
   * دریافت گزارش موجودی کل
   * @param {Object} params - { warehouse, category, search }
   */
  getStockReport(params = {}) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/reports/stock/`,
      params,
    });
  }

  /**
   * دریافت گزارش موجودی یک انبار خاص
   * @param {number} warehouseId - شناسه انبار
   * @param {Object} params - { category, search }
   */
  getWarehouseStockReport(warehouseId, params = {}) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/reports/warehouse/${warehouseId}/`,
      params,
    });
  }

  /**
   * دریافت گزارش تراکنش‌ها
   * @param {Object} params - { start_date, end_date, transaction_type, warehouse, product }
   */
  getTransactionReport(params = {}) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/reports/transactions/`,
      params,
    });
  }

  /**
   * دریافت خلاصه کلی انبار
   */
  getSummaryReport() {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/reports/summary/`,
    });
  }

  /**
   * دریافت گزارش خروجی‌ها
   * @param {Object} params - { start_date, end_date, warehouse, product }
   */
  getOutReport(params = {}) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/reports/out/`,
      params,
    });
  }

  /**
   * دریافت گزارش ورودی‌ها
   * @param {Object} params - { start_date, end_date, warehouse, product }
   */
  getInReport(params = {}) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/reports/in/`,
      params,
    });
  }

  /**
   * دریافت گزارش موجودی کم
   * @param {Object} params - { warehouse, threshold }
   */
  getLowStockReport(params = {}) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/reports/low-stock/`,
      params,
    });
  }

  // ============================================
  // ============ PACKAGING LEVELS ==============
  // ============================================
  
  getPackagingLevels(params = {}) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/packaging-levels/`,
      params,
    });
  }

  getPackagingLevel(id) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/packaging-levels/${id}/`,
    });
  }

  createPackagingLevel(data) {
    return this.request({
      method: 'POST',
      url: `${this.baseUrl}/inventory/packaging-levels/`,
      data,
    });
  }

  updatePackagingLevel(id, data) {
    return this.request({
      method: 'PUT',
      url: `${this.baseUrl}/inventory/packaging-levels/${id}/`,
      data,
    });
  }

  deletePackagingLevel(id) {
    return this.request({
      method: 'DELETE',
      url: `${this.baseUrl}/inventory/packaging-levels/${id}/`,
    });
  }

  // ============================================
  // ============ PACKAGING CONFIGS =============
  // ============================================
  
  getPackagingConfigs(params = {}) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/packaging-configs/`,
      params,
    });
  }

  getPackagingConfig(id) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/packaging-configs/${id}/`,
    });
  }

  createPackagingConfig(data) {
    return this.request({
      method: 'POST',
      url: `${this.baseUrl}/inventory/packaging-configs/`,
      data,
    });
  }

  updatePackagingConfig(id, data) {
    return this.request({
      method: 'PUT',
      url: `${this.baseUrl}/inventory/packaging-configs/${id}/`,
      data,
    });
  }

  deletePackagingConfig(id) {
    return this.request({
      method: 'DELETE',
      url: `${this.baseUrl}/inventory/packaging-configs/${id}/`,
    });
  }

  /**
   * ذخیره سلسله‌مراتب بسته‌بندی
   * @param {Object} data - { product_id, warehouse_id, levels: [{ unit_id, count }] }
   */
  savePackagingHierarchy(data) {
    return this.request({
      method: 'POST',
      url: `${this.baseUrl}/inventory/packaging-configs/create_hierarchy/`,
      data,
    });
  }

  /**
   * دریافت سلسله‌مراتب بسته‌بندی یک محصول در انبار
   * @param {number} productId - شناسه محصول
   * @param {number} warehouseId - شناسه انبار
   */
  getPackagingHierarchy(productId, warehouseId) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/packaging-configs/get_hierarchy/?product_id=${productId}&warehouse_id=${warehouseId}`,
    });
  }

  /**
   * دریافت تنظیمات بسته‌بندی بر اساس محصول
   * @param {number} productId - شناسه محصول
   */
  getPackagingConfigsByProduct(productId) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/packaging-configs/get_by_product/?product_id=${productId}`,
    });
  }

  // ============================================
  // ============ PACKAGING VARIANTS ============
  // ============================================
  
  getPackagingVariants(params = {}) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/packaging-variants/`,
      params,
    });
  }

  getPackagingVariant(id) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/packaging-variants/${id}/`,
    });
  }

  createPackagingVariant(data) {
    return this.request({
      method: 'POST',
      url: `${this.baseUrl}/inventory/packaging-variants/`,
      data,
    });
  }

  updatePackagingVariant(id, data) {
    return this.request({
      method: 'PUT',
      url: `${this.baseUrl}/inventory/packaging-variants/${id}/`,
      data,
    });
  }

  deletePackagingVariant(id) {
    return this.request({
      method: 'DELETE',
      url: `${this.baseUrl}/inventory/packaging-variants/${id}/`,
    });
  }

  getPackagingVariantsByProduct(productId) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/packaging-variants/get_by_product/?product_id=${productId}`,
    });
  }

  // ============================================
  // ============ HIERARCHICAL STOCK ============
  // ============================================
  
  getHierarchicalStock(params = {}) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/hierarchical-stock/`,
      params,
    });
  }

  getHierarchicalStockItem(id) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/hierarchical-stock/${id}/`,
    });
  }

  createHierarchicalStock(data) {
    return this.request({
      method: 'POST',
      url: `${this.baseUrl}/inventory/hierarchical-stock/`,
      data,
    });
  }

  updateHierarchicalStock(id, data) {
    return this.request({
      method: 'PUT',
      url: `${this.baseUrl}/inventory/hierarchical-stock/${id}/`,
      data,
    });
  }

  deleteHierarchicalStock(id) {
    return this.request({
      method: 'DELETE',
      url: `${this.baseUrl}/inventory/hierarchical-stock/${id}/`,
    });
  }

  /**
   * افزودن پالت به موجودی سلسله‌مراتبی
   * @param {Object} data - { product_id, warehouse_id, packaging_config_id, pallet_count, description }
   */
  addPallets(data) {
    return this.request({
      method: 'POST',
      url: `${this.baseUrl}/inventory/hierarchical-stock/add_pallets/`,
      data,
    });
  }

  /**
   * افزودن بسته‌بندی سفارشی
   * @param {Object} data - { product_id, warehouse_id, packaging_config_id, quantity, description }
   */
  addCustomPackaging(data) {
    return this.request({
      method: 'POST',
      url: `${this.baseUrl}/inventory/hierarchical-stock/add_custom/`,
      data,
    });
  }

  /**
   * خروج از موجودی سلسله‌مراتبی
   * @param {Object} data - { product_id, warehouse_id, packaging_config_id, quantity, authorized_person_id, description }
   */
  removeHierarchicalStock(data) {
    return this.request({
      method: 'POST',
      url: `${this.baseUrl}/inventory/hierarchical-stock/remove_stock/`,
      data,
    });
  }

  /**
   * دریافت تفکیک موجودی
   * @param {Object} params - { product_id, warehouse_id }
   */
  getStockBreakdown(params) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/hierarchical-stock/get_stock_breakdown/`,
      params,
    });
  }
}

export default InventoryApi;