// app/sales/services/karmandanService.js
import axios from 'axios';
import Config from '@/config/config';

// تنظیم اینترسپتور برای اضافه کردن توکن به همه درخواست‌ها
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const karmandanService = {
  // ============================================
  // احراز هویت
  // ============================================
  login: async (mobile, password) => {
    try {
      const response = await axios.post(
        `${Config.baseUrl}/api/karmandan/auth/login/`,
        { mobile, password }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در ارتباط با سرور' };
    }
  },
  
  logout: async () => {
    try {
      const response = await axios.post(
        `${Config.baseUrl}/api/karmandan/auth/logout/`,
        { refresh_token: localStorage.getItem('refreshToken') }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در خروج' };
    }
  },
  
  // ============================================
  // مدیریت کارمندان
  // ============================================
  getEmployees: async (params) => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/karmandan/employees/`,
        { params }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در دریافت لیست کارمندان' };
    }
  },
  
  getCurrentEmployee: async () => {
    try {
      const response = await axios.get(
        Config.endpoints.karmandan.myProfile()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در دریافت اطلاعات کاربر' };
    }
  },
  
  createEmployee: async (data) => {
    try {
      const response = await axios.post(
        `${Config.baseUrl}/api/karmandan/employees/`,
        data
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در ایجاد کارمند' };
    }
  },
  
  updateEmployee: async (id, data) => {
    try {
      const response = await axios.put(
        `${Config.baseUrl}/api/karmandan/employees/${id}/`,
        data
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در بروزرسانی کارمند' };
    }
  },
  
  deleteEmployee: async (id) => {
    try {
      const response = await axios.delete(
        `${Config.baseUrl}/api/karmandan/employees/${id}/`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در حذف کارمند' };
    }
  },
  
  changeEmployeeStatus: async (id, status, reason) => {
    try {
      const response = await axios.post(
        `${Config.baseUrl}/api/karmandan/employees/${id}/change-status/`,
        { status, reason }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در تغییر وضعیت' };
    }
  },
  
  // ============================================
  // مدیریت لیدها (بازاریابی)
  // ============================================
  getLeads: async (params) => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/karmandan/leads/`,
        { params }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در دریافت لیست لیدها' };
    }
  },
  
  getLeadStats: async () => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/karmandan/leads/stats/`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در دریافت آمار' };
    }
  },

  getTeamAnalytics: async (params = {}) => {
    try {
      const response = await axios.get(
        Config.endpoints.karmandan.leads.teamAnalytics(params)
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در دریافت گزارش تحلیلی' };
    }
  },

  getEmployeeActivity: async (params = {}) => {
    try {
      const response = await axios.get(
        Config.endpoints.karmandan.leads.employeeActivity(params)
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در دریافت گزارش فعالیت' };
    }
  },

  getPathMonitor: async (params = {}) => {
    try {
      const clean = {};
      Object.entries(params || {}).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        clean[key] = value;
      });
      const response = await axios.get(
        Config.endpoints.karmandan.leads.pathMonitor(clean)
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در دریافت رصد مسیر' };
    }
  },
  
  createLead: async (data) => {
    try {
      const response = await axios.post(
        `${Config.baseUrl}/api/karmandan/leads/`,
        data
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در ایجاد لید' };
    }
  },
  
  getLeadDetail: async (id) => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/karmandan/leads/${id}/`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در دریافت جزئیات لید' };
    }
  },
  
  updateLead: async (id, data) => {
    try {
      const response = await axios.put(
        `${Config.baseUrl}/api/karmandan/leads/${id}/`,
        data
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در بروزرسانی لید' };
    }
  },
  
  deleteLead: async (id) => {
    try {
      const response = await axios.delete(
        `${Config.baseUrl}/api/karmandan/leads/${id}/`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در حذف لید' };
    }
  },
  
  addFollowup: async (id, data, files = []) => {
    try {
      const list = (Array.isArray(files) ? files : []).filter(Boolean);
      const hasFiles = list.length > 0;
      if (hasFiles) {
        const formData = new FormData();
        Object.entries(data || {}).forEach(([key, value]) => {
          if (value === undefined || value === null || value === '') return;
          formData.append(key, String(value));
        });
        list.forEach((file, index) => {
          const name =
            file.name ||
            `attachment-${index + 1}${
              (file.type || '').includes('audio') ? '.webm' : ''
            }`;
          // File یا Blob هر دو قابل ارسال‌اند
          formData.append('attachments', file, name);
        });
        const response = await axios.post(
          `${Config.baseUrl}/api/karmandan/leads/${id}/followup/`,
          formData,
          {
            // Content-Type را ست نکن تا browser boundary بگذارد
            headers: { 'Content-Type': undefined },
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
          }
        );
        return response.data;
      }

      const response = await axios.post(
        `${Config.baseUrl}/api/karmandan/leads/${id}/followup/`,
        data
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در ثبت پیگیری' };
    }
  },

  getArchivedLeads: async (params = {}) => {
    try {
      const response = await axios.get(
        Config.endpoints.karmandan.leads.archived(params)
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در دریافت آرشیو' };
    }
  },

  archiveLead: async (id) => {
    try {
      const response = await axios.post(
        Config.endpoints.karmandan.leads.archive(id)
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در آرشیو کردن' };
    }
  },

  unarchiveLead: async (id) => {
    try {
      const response = await axios.post(
        Config.endpoints.karmandan.leads.unarchive(id)
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در خروج از آرشیو' };
    }
  },

  getAssignableStaff: async () => {
    try {
      const response = await axios.get(
        Config.endpoints.karmandan.leads.assignableStaff()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در دریافت لیست کارمندان فروش' };
    }
  },

  assignLead: async (id, employeeId, note = '') => {
    try {
      const response = await axios.post(
        Config.endpoints.karmandan.leads.assign(id),
        { employee_id: employeeId, note }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در واگذاری لید' };
    }
  },
  
  getFollowups: async (id) => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/karmandan/leads/${id}/`
      );
      const payload =
        response.data?.data && !response.data?.followups
          ? response.data.data
          : response.data;
      if (payload && Array.isArray(payload.followups)) {
        return payload.followups;
      }
      return [];
    } catch (error) {
      console.error('Error getting followups:', error);
      throw error.response?.data || { error: 'خطا در دریافت پیگیری‌ها' };
    }
  },
  
  getFollowupSmsConfig: async () => {
    try {
      const response = await axios.get(Config.endpoints.karmandan.followupSmsConfig());
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در دریافت تنظیمات پیامک' };
    }
  },

  updateFollowupSmsConfig: async (data) => {
    try {
      const response = await axios.patch(
        Config.endpoints.karmandan.followupSmsConfig(),
        data
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در ذخیره تنظیمات پیامک' };
    }
  },

  getSaleAccessList: async () => {
    try {
      const response = await axios.get(Config.endpoints.karmandan.saleAccessList());
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در دریافت لیست دسترسی فروش' };
    }
  },

  setSaleAccess: async (id, enabled) => {
    try {
      const response = await axios.post(
        Config.endpoints.karmandan.setSaleAccess(id),
        { enabled }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در تغییر دسترسی فروش' };
    }
  },

  setSalePriceEdit: async (id, can_edit_price) => {
    try {
      const response = await axios.post(
        Config.endpoints.karmandan.setSaleAccess(id),
        { can_edit_price: !!can_edit_price }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در تغییر اجازه قیمت دلخواه' };
    }
  },

  getSaleCompanies: async () => {
    try {
      const response = await axios.get(
        Config.endpoints.karmandan.saleCompanies.list()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در دریافت شرکت‌ها' };
    }
  },

  createSaleCompany: async (formData) => {
    try {
      const response = await axios.post(
        Config.endpoints.karmandan.saleCompanies.list(),
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در ثبت شرکت' };
    }
  },

  updateSaleCompany: async (id, formData) => {
    try {
      const response = await axios.patch(
        Config.endpoints.karmandan.saleCompanies.detail(id),
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در ویرایش شرکت' };
    }
  },

  updateSaleCompanyDefaults: async (id, payload) => {
    try {
      const response = await axios.patch(
        Config.endpoints.karmandan.saleCompanies.detail(id),
        payload
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در ذخیره پیش‌فرض قالب' };
    }
  },

  deleteSaleCompany: async (id) => {
    try {
      const response = await axios.delete(
        Config.endpoints.karmandan.saleCompanies.detail(id)
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در حذف شرکت' };
    }
  },

  getSaleInvoices: async (params = {}) => {
    try {
      const response = await axios.get(
        Config.endpoints.karmandan.saleInvoices.list(params)
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در دریافت اسناد' };
    }
  },

  getSaleInvoice: async (id) => {
    try {
      const response = await axios.get(
        Config.endpoints.karmandan.saleInvoices.detail(id)
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در دریافت سند' };
    }
  },

  getNextInvoiceNumber: async (docType = 'proforma', companyId = null) => {
    try {
      const response = await axios.get(
        Config.endpoints.karmandan.saleInvoices.nextNumber(docType, companyId)
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در دریافت شماره سند' };
    }
  },

  createSaleInvoice: async (payload) => {
    try {
      const response = await axios.post(
        Config.endpoints.karmandan.saleInvoices.list(),
        payload
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در ذخیره سند' };
    }
  },

  updateSaleInvoice: async (id, payload) => {
    try {
      const response = await axios.patch(
        Config.endpoints.karmandan.saleInvoices.detail(id),
        payload
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در بروزرسانی سند' };
    }
  },

  deleteSaleInvoice: async (id) => {
    try {
      const response = await axios.delete(
        Config.endpoints.karmandan.saleInvoices.detail(id)
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در حذف سند' };
    }
  },

  getSaleCatalog: async (params = {}) => {
    try {
      const response = await axios.get(
        Config.endpoints.karmandan.saleCatalog.list(params)
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در دریافت کاتالوگ' };
    }
  },

  createSaleCatalogItem: async (payload) => {
    try {
      const response = await axios.post(
        Config.endpoints.karmandan.saleCatalog.list(),
        payload
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در ثبت کالا/خدمت' };
    }
  },

  updateSaleCatalogItem: async (id, payload) => {
    try {
      const response = await axios.patch(
        Config.endpoints.karmandan.saleCatalog.detail(id),
        payload
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در ویرایش کالا/خدمت' };
    }
  },

  deleteSaleCatalogItem: async (id) => {
    try {
      const response = await axios.delete(
        Config.endpoints.karmandan.saleCatalog.detail(id)
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در حذف کالا/خدمت' };
    }
  },
};

export default karmandanService;