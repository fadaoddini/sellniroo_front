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
      return response.data?.results !== undefined ? response.data.results : response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ============================================
  // Unit Inventory - ورود و خروج با واحدهای سلسله‌مراتبی ✅
  // ============================================
  
  /**
   * ورود کالا با واحد سلسله‌مراتبی
   * @param {Object} data - { product_id, warehouse_id, unit_id, quantity, description }
   * @returns {Promise} - { status, message, data: { product, warehouse, unit, quantity, total_in_base, breakdown, transaction_id, reference_number } }
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
   * @returns {Promise} - { status, message, data: { product, warehouse, unit, quantity, total_in_base, transaction_id, reference_number } }
   */
  removeWithUnit(data) {
    return this.request({
      method: 'POST',
      url: `${this.baseUrl}/inventory/unit-inventory/remove/`,
      data,
    });
  }

  /**
   * دریافت تفکیک یک واحد
   * @param {number} unitId - شناسه واحد
   * @param {number} quantity - تعداد
   * @returns {Promise} - { status, data: { unit, unit_id, quantity, breakdown, total_in_base } }
   */
  getUnitBreakdown(unitId, quantity = 1) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/unit-inventory/breakdown/?unit_id=${unitId}&quantity=${quantity}`,
    });
  }

  // ============================================
  // Transactions - فقط برای مشاهده تاریخچه ✅
  // ============================================
  
  /**
   * دریافت لیست تراکنش‌ها
   * @param {Object} params - { page, limit, search, transaction_type, status, warehouse, product }
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

  // ============================================
  // Units - با پشتیبانی از سلسله‌مراتب
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
      url: `${this.baseUrl}/inventory/units/tree_all/`,
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
   * دریافت زیرمجموعه‌های یک واحد
   * @param {number} id - شناسه واحد
   */
  getUnitChildren(id) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/units/${id}/children/`,
    });
  }

  // ============================================
  // Categories
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
  // Warehouses
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
   * @param {Object} data - { title, address, phone, manager, manager_phone, is_active }
   */
  createWarehouse(data) {
    return this.request({
      method: 'POST',
      url: `${this.baseUrl}/inventory/warehouses/`,
      data,
    });
  }

  /**
   * ویرایش انبار
   * @param {number} id - شناسه انبار
   * @param {Object} data - { title, address, phone, manager, manager_phone, is_active }
   */
  updateWarehouse(id, data) {
    return this.request({
      method: 'PUT',
      url: `${this.baseUrl}/inventory/warehouses/${id}/`,
      data,
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
   * دریافت خلاصه اطلاعات انبار
   * @param {number} id - شناسه انبار
   */
  getWarehouseSummary(id) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/warehouses/${id}/summary/`,
    });
  }

  // ============================================
  // Products
  // ============================================
  
  /**
   * دریافت لیست کالاها
   * @param {Object} params - { search, category, is_active, base_unit }
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
   * @param {Object} data - { title, code, category, base_unit, main_image, images, video, description, specifications, min_stock_alert, is_active }
   */
  createProduct(data) {
    return this.request({
      method: 'POST',
      url: `${this.baseUrl}/inventory/products/`,
      data,
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
   * دریافت وضعیت موجودی کالا
   * @param {number} id - شناسه کالا
   */
  getProductStockStatus(id) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/products/${id}/stock_status/`,
    });
  }

  /**
   * دریافت تاریخچه موجودی کالا
   * @param {number} id - شناسه کالا
   * @param {Object} params - { start_date, end_date, limit }
   */
  getProductStockHistory(id, params = {}) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/products/${id}/stock_history/`,
      params,
    });
  }

  // ============================================
  // Authorized Persons
  // ============================================
  
  /**
   * دریافت لیست افراد مجاز
   * @param {Object} params - { search, is_active, can_confirm }
   */
  getAuthorizedPersons(params = {}) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/authorized-persons/`,
      params,
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

  // ============================================
  // Alerts
  // ============================================
  
  /**
   * دریافت لیست هشدارها
   * @param {Object} params - { alert_type, level, is_resolved, warehouse, product }
   */
  getAlerts(params = {}) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/alerts/`,
      params,
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

  // ============================================
  // Stock Items
  // ============================================
  
  /**
   * دریافت لیست موجودی کالاها
   * @param {Object} params - { product, warehouse, is_low_stock }
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
   * ویرایش موجودی
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

  // ============================================
  // Packaging Levels
  // ============================================
  
  getPackagingLevels(params = {}) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/packaging-levels/`,
      params,
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
  // Packaging Configs
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

  savePackagingHierarchy(data) {
    return this.request({
      method: 'POST',
      url: `${this.baseUrl}/inventory/packaging-configs/create_hierarchy/`,
      data,
    });
  }

  getPackagingHierarchy(productId, warehouseId) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/packaging-configs/get_hierarchy/?product_id=${productId}&warehouse_id=${warehouseId}`,
    });
  }

  getPackagingConfigsByProduct(productId) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/packaging-configs/get_by_product/?product_id=${productId}`,
    });
  }

  // ============================================
  // Packaging Variants
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
  // Hierarchical Stock
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

  addPallets(data) {
    return this.request({
      method: 'POST',
      url: `${this.baseUrl}/inventory/hierarchical-stock/add_pallets/`,
      data,
    });
  }

  addCustomPackaging(data) {
    return this.request({
      method: 'POST',
      url: `${this.baseUrl}/inventory/hierarchical-stock/add_custom/`,
      data,
    });
  }

  removeHierarchicalStock(data) {
    return this.request({
      method: 'POST',
      url: `${this.baseUrl}/inventory/hierarchical-stock/remove_stock/`,
      data,
    });
  }

  getStockBreakdown(params) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/hierarchical-stock/get_stock_breakdown/`,
      params,
    });
  }

  // ============================================
  // Reports
  // ============================================
  
  getReports(params = {}) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/reports/`,
      params,
    });
  }

  getStockReport(params = {}) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/reports/stock/`,
      params,
    });
  }

  getTransactionReport(params = {}) {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/reports/transactions/`,
      params,
    });
  }

  getSummaryReport() {
    return this.request({
      method: 'GET',
      url: `${this.baseUrl}/inventory/reports/summary/`,
    });
  }
}

export default InventoryApi;