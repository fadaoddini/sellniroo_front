// app/sales/services/karmandanService.js
import axios from 'axios';
import Config from '@/config/config';

// تنظیم اینترسپتور برای اضافه کردن توکن به همه درخواست‌ها
// NOTE: احراز هویت اصلی (OTP + JWT) در AuthContext انجام می‌شود؛
// این اینترسپتور فقط توکن ذخیره‌شده را به درخواست‌های karmandan اضافه می‌کند.
axios.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const karmandanService = {
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
      // ✅ endpoint صحیح بک‌اند: employees/my-profile/ (نه employees/me/)
      const response = await axios.get(
        `${Config.baseUrl}/api/karmandan/employees/my-profile/`
      );
      return response.data?.data || response.data;
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

  addFollowup: async (id, data) => {
    try {
      const response = await axios.post(
        `${Config.baseUrl}/api/karmandan/leads/${id}/followup/`,
        data
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'خطا در ثبت پیگیری' };
    }
  },

  getFollowups: async (id) => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/karmandan/leads/${id}/`
      );
      // ✅ بک‌اند retrieve حالا followups را داخل جزئیات لید برمی‌گرداند
      if (response.data && response.data.followups) {
        return response.data.followups;
      }
      if (response.data && response.data.data && response.data.data.followups) {
        return response.data.data.followups;
      }
      return [];
    } catch (error) {
      console.error('Error getting followups:', error);
      throw error.response?.data || { error: 'خطا در دریافت پیگیری‌ها' };
    }
  },
};

export default karmandanService;
