// services/attendanceService.js
// ✅ نسخه کامل و نهایی - مدیریت حضور و غیاب و درخواست‌های مرخصی

import axios from 'axios';
import Config from '@/config/config';

class AttendanceService {
  constructor() {
    this.baseUrl = Config.baseUrl;
  }

  // ============================================
  // ✅ هدرهای احراز هویت
  // ============================================
  getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // ============================================
  // ✅ مدیریت خطاها
  // ============================================
  handleError(error) {
    if (error.response?.data) {
      const data = error.response.data;

      if (data.message) {
        return new Error(data.message);
      }
      if (data.detail) {
        return new Error(data.detail);
      }
      if (data.error) {
        return new Error(data.error);
      }
      if (typeof data === 'string') {
        return new Error(data);
      }

      if (typeof data === 'object') {
        const errors = Object.values(data).flat();
        if (errors.length > 0) {
          return new Error(errors.join('، '));
        }
      }
    }
    return error;
  }

  // ============================================
  // ✅ متدهای کمکی (Helper Methods)
  // ============================================

  /**
   * دریافت نمایش فارسی نوع مرخصی
   */
  getLeaveTypeDisplay(type) {
    const map = {
      'annual': 'مرخصی استحقاقی',
      'sick': 'مرخصی استعلاجی',
      'emergency': 'مرخصی اضطراری',
      'other': 'سایر'
    };
    return map[type] || type;
  }

  /**
   * ✅ تبدیل میلادی به شمسی (برای ارسال به سرور)
   */
  convertToPersian(gregorianDate) {
    if (!gregorianDate) return null;

    if (typeof gregorianDate === 'string' && gregorianDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const year = parseInt(gregorianDate.split('-')[0]);
      if (year >= 1900 && year <= 2100) {
        try {
          const date = new Date(gregorianDate);
          const persianYear = date.getFullYear() - 621;
          let persianMonth = date.getMonth() + 1;
          let persianDay = date.getDate();

          if (persianMonth > 3) {
            persianMonth = persianMonth - 3;
            if (persianMonth > 6) {
              persianMonth = persianMonth - 6;
              persianDay = persianDay - 1;
              if (persianDay < 1) {
                persianDay = 30 + persianDay;
                persianMonth = persianMonth - 1;
              }
            }
          } else {
            persianMonth = persianMonth + 9;
            persianDay = persianDay - 1;
            if (persianDay < 1) {
              persianDay = 31 + persianDay;
              persianMonth = persianMonth - 1;
            }
          }

          return `${persianYear}-${String(persianMonth).padStart(2, '0')}-${String(persianDay).padStart(2, '0')}`;
        } catch (e) {
          console.warn('Error converting to persian:', e);
          return gregorianDate;
        }
      }
    }
    return gregorianDate;
  }

  /**
   * ✅ آماده‌سازی payload - تاریخ رو به شمسی تبدیل کن (برای سرور)
   */
  prepareLeaveRequestPayload(data) {
    const payload = { ...data };

    if (payload.leave_date) {
      // اگر تاریخ میلادی است، به شمسی تبدیل کن
      if (typeof payload.leave_date === 'string' && payload.leave_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const year = parseInt(payload.leave_date.split('-')[0]);
        // اگر سال بین 1900 تا 2100 است، میلادی است → تبدیل به شمسی
        if (year >= 1900 && year <= 2100) {
          payload.leave_date = this.convertToPersian(payload.leave_date);
        }
        // اگر سال بین 1300 تا 1500 است، شمسی است → همان را نگه دار
        else if (year >= 1300 && year <= 1500) {
          // کاری نکن
        }
      }
    }

    return payload;
  }

  /**
   * محاسبه مانده مرخصی
   */
  calculateRemainingLeave(stats) {
    if (stats.remaining_leave !== undefined) {
      return stats.remaining_leave;
    }

    const totalHours = stats.total_hours || 0;
    const baseLeave = 26; // ۲۶ ساعت مرخصی استحقاقی در سال
    return Math.max(0, baseLeave - totalHours);
  }

  /**
   * نرمال‌سازی داده‌های درخواست مرخصی برای تطابق با فرانت‌اند
   */
  normalizeLeaveRequest(item) {
    if (!item) return item;

    return {
      ...item,
      employee_name: item.employee_name || item.employee?.full_name || item.employee?.display_name || 'نامشخص',
      employee_code: item.employee_code || item.employee?.employee_code || '---',
      leave_type_display: item.leave_type_display || this.getLeaveTypeDisplay(item.leave_type),
      total_hours: parseFloat(item.total_hours) || 0,
    };
  }

  // ============================================
  // ✅ حضور و غیاب (Attendance)
  // ============================================

  /**
   * ثبت ورود
   */
  async checkIn(data = {}) {
    try {
      const url = Config.endpoints.attendance?.checkIn?.() || `${this.baseUrl}/api/attendance/check-in/`;
      const response = await axios.post(url, data, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error checking in:', error);
      throw this.handleError(error);
    }
  }

  /**
   * ثبت خروج
   */
  async checkOut(data = {}) {
    try {
      const url = Config.endpoints.attendance?.checkOut?.() || `${this.baseUrl}/api/attendance/check-out/`;
      const response = await axios.post(url, data, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error checking out:', error);
      throw this.handleError(error);
    }
  }

  /**
   * دریافت وضعیت امروز
   */
  async getTodayStatus() {
    try {
      const url = Config.endpoints.attendance?.today?.() || `${this.baseUrl}/api/attendance/today/`;
      const response = await axios.get(url, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error getting today status:', error);
      throw this.handleError(error);
    }
  }

  /**
   * دریافت تاریخچه حضور و غیاب
   */
  async getHistory(params = {}) {
    try {
      const url = Config.endpoints.attendance?.history?.(params) || `${this.baseUrl}/api/attendance/history/`;
      const response = await axios.get(url, {
        headers: this.getAuthHeaders(),
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error getting history:', error);
      throw this.handleError(error);
    }
  }

  /**
   * دریافت آمار حضور و غیاب (برای مدیران)
   */
  async getStats(params = {}) {
    try {
      const url = Config.endpoints.attendance?.stats?.(params) || `${this.baseUrl}/api/attendance/stats/`;
      const response = await axios.get(url, {
        headers: this.getAuthHeaders(),
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error getting stats:', error);
      throw this.handleError(error);
    }
  }

  /**
   * دریافت آمار شخصی کاربر
   */
  async getMyStats() {
    try {
      const url = Config.endpoints.karmandan?.leaveRequests?.stats?.() ||
        Config.getApiUrl({
          segment: 'api/karmandan',
          endpoint: 'leave-requests/stats/',
          noVersion: true
        });
      const response = await axios.get(url, {
        headers: this.getAuthHeaders()
      });

      const data = response.data;
      if (data?.status === 'ok') {
        const statsData = data.data || data;
        return {
          status: 'ok',
          data: {
            total_hours: statsData.total_hours || 0,
            remaining_leave: this.calculateRemainingLeave(statsData),
            total_requests: statsData.total || 0,
            pending: statsData.pending || 0,
            approved: statsData.approved || 0,
            rejected: statsData.rejected || 0,
            cancelled: statsData.cancelled || 0,
            by_type: statsData.by_type || [],
            by_month: statsData.by_month || [],
          }
        };
      }
      return response.data;
    } catch (error) {
      console.error('Error getting my stats:', error);
      // در صورت خطا، پاسخ پیش‌فرض برمی‌گردانیم
      return {
        status: 'ok',
        data: {
          total_hours: 0,
          remaining_leave: 26,
          total_requests: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          cancelled: 0,
          by_type: [],
          by_month: [],
        }
      };
    }
  }

  // ============================================
  // ✅ درخواست‌های مرخصی (Leave Requests)
  // ============================================

  /**
   * دریافت لیست تمام درخواست‌های مرخصی (برای مدیران)
   */
  async getLeaveRequests(params = {}) {
    try {
      const url = Config.endpoints.karmandan?.leaveRequests?.list?.(params) ||
        Config.getApiUrl({
          segment: 'api/karmandan',
          endpoint: 'leave-requests/',
          params,
          noVersion: true
        });
      const response = await axios.get(url, {
        headers: this.getAuthHeaders()
      });

      const data = response.data;

      if (data?.status === 'ok' && data?.data) {
        return {
          ...data,
          requests: data.data.map(this.normalizeLeaveRequest)
        };
      } else if (Array.isArray(data)) {
        return {
          status: 'ok',
          requests: data.map(this.normalizeLeaveRequest)
        };
      } else if (data?.results) {
        return {
          ...data,
          requests: data.results.map(this.normalizeLeaveRequest)
        };
      }

      return data;
    } catch (error) {
      console.error('Error getting leave requests:', error);
      throw this.handleError(error);
    }
  }

  /**
   * دریافت جزئیات یک درخواست مرخصی
   */
  async getLeaveRequestDetail(id) {
    try {
      const url = Config.getApiUrl({
        segment: 'api/karmandan',
        endpoint: `leave-requests/${id}/`,
        noVersion: true
      });
      const response = await axios.get(url, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error getting leave request detail:', error);
      throw this.handleError(error);
    }
  }

  /**
   * ایجاد درخواست مرخصی جدید
   */
  async createLeaveRequest(data) {
    try {
      const payload = this.prepareLeaveRequestPayload(data);

      const url = Config.endpoints.karmandan?.leaveRequests?.create?.() ||
        Config.getApiUrl({
          segment: 'api/karmandan',
          endpoint: 'leave-requests/',
          noVersion: true
        });
      const response = await axios.post(url, payload, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating leave request:', error);
      throw this.handleError(error);
    }
  }

  /**
   * بروزرسانی درخواست مرخصی
   */
  async updateLeaveRequest(id, data) {
    try {
      const payload = this.prepareLeaveRequestPayload(data);
      const url = Config.endpoints.karmandan?.leaveRequests?.update?.(id) ||
        Config.getApiUrl({
          segment: 'api/karmandan',
          endpoint: `leave-requests/${id}/`,
          noVersion: true
        });
      const response = await axios.put(url, payload, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating leave request:', error);
      throw this.handleError(error);
    }
  }

  /**
   * حذف درخواست مرخصی
   */
  async deleteLeaveRequest(id) {
    try {
      const url = Config.endpoints.karmandan?.leaveRequests?.delete?.(id) ||
        Config.getApiUrl({
          segment: 'api/karmandan',
          endpoint: `leave-requests/${id}/`,
          noVersion: true
        });
      const response = await axios.delete(url, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting leave request:', error);
      throw this.handleError(error);
    }
  }

  /**
   * تایید درخواست مرخصی (فقط مدیران)
   */
// services/attendanceService.js - متد approveLeaveRequest (به‌روز شده)

/**
 * تایید/رد درخواست مرخصی با توضیح اختیاری (فقط مدیران)
 * @param {number} id - شناسه درخواست
 * @param {string} status - 'approved' یا 'rejected'
 * @param {string} admin_note - توضیح اختیاری مدیر
 */
async approveLeaveRequest(id, status, admin_note = '') {
  try {
    const url = Config.endpoints.karmandan?.leaveRequests?.approve?.(id) ||
      Config.getApiUrl({
        segment: 'api/karmandan',
        endpoint: `leave-requests/${id}/approve/`,
        noVersion: true
      });
    
    const payload = { status };
    if (admin_note && admin_note.trim()) {
      payload.admin_note = admin_note.trim();
    }
    
    const response = await axios.post(url, payload, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error approving leave request:', error);
    throw this.handleError(error);
  }
}

  /**
   * لغو درخواست مرخصی
   */
  async cancelLeaveRequest(id) {
    try {
      const url = Config.endpoints.karmandan?.leaveRequests?.cancel?.(id) ||
        Config.getApiUrl({
          segment: 'api/karmandan',
          endpoint: `leave-requests/${id}/cancel/`,
          noVersion: true
        });
      const response = await axios.post(url, {}, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling leave request:', error);
      throw this.handleError(error);
    }
  }

  /**
   * دریافت آمار کلی درخواست‌های مرخصی
   */
  async getLeaveStats() {
    try {
      const url = Config.endpoints.karmandan?.leaveRequests?.stats?.() ||
        Config.getApiUrl({
          segment: 'api/karmandan',
          endpoint: 'leave-requests/stats/',
          noVersion: true
        });
      const response = await axios.get(url, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error getting leave stats:', error);
      throw this.handleError(error);
    }
  }

  /**
   * دریافت درخواست‌های مرخصی امروز
   */
  async getTodayLeaveRequests() {
    try {
      const url = Config.endpoints.karmandan?.leaveRequests?.today?.() ||
        Config.getApiUrl({
          segment: 'api/karmandan',
          endpoint: 'leave-requests/today/',
          noVersion: true
        });
      const response = await axios.get(url, {
        headers: this.getAuthHeaders()
      });

      if (response.data?.status === 'ok') {
        return {
          ...response.data,
          requests: (response.data.data || []).map(this.normalizeLeaveRequest)
        };
      }
      return response.data;
    } catch (error) {
      console.error('Error getting today leave requests:', error);
      throw this.handleError(error);
    }
  }

  /**
   * دریافت درخواست‌های مرخصی کاربر جاری
   */
  async getMyLeaveRequests(params = {}) {
    try {
      const url = Config.endpoints.karmandan?.leaveRequests?.myRequests?.(params) ||
        Config.getApiUrl({
          segment: 'api/karmandan',
          endpoint: 'leave-requests/my-requests/',
          params,
          noVersion: true
        });
      const response = await axios.get(url, {
        headers: this.getAuthHeaders()
      });

      const data = response.data;

      if (data?.status === 'ok') {
        let requests = [];

        if (data.requests) {
          requests = data.requests.map(this.normalizeLeaveRequest);
        } else if (data.data) {
          requests = data.data.map(this.normalizeLeaveRequest);
        } else if (Array.isArray(data)) {
          requests = data.map(this.normalizeLeaveRequest);
        }

        // اگر صفحه‌بندی وجود دارد
        const pagination = data.pagination || null;

        return {
          ...data,
          requests,
          pagination
        };
      }

      return data;
    } catch (error) {
      console.error('Error getting my leave requests:', error);
      throw this.handleError(error);
    }
  }

  /**
   * دریافت درخواست‌های مرخصی با فیلترهای پیشرفته
   */
  async searchLeaveRequests(filters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.status) params.append('status', filters.status);
      if (filters.leave_type) params.append('leave_type', filters.leave_type);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.employee_id) params.append('employee_id', filters.employee_id);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.per_page) params.append('per_page', filters.per_page);

      const url = Config.getApiUrl({
        segment: 'api/karmandan',
        endpoint: `leave-requests/?${params.toString()}`,
        noVersion: true
      });

      const response = await axios.get(url, {
        headers: this.getAuthHeaders()
      });

      const data = response.data;

      if (data?.status === 'ok') {
        return {
          ...data,
          requests: (data.data || []).map(this.normalizeLeaveRequest)
        };
      }

      return data;
    } catch (error) {
      console.error('Error searching leave requests:', error);
      throw this.handleError(error);
    }
  }

  /**
   * دریافت آمار درخواست‌های مرخصی برای داشبورد
   */
  async getLeaveDashboardStats() {
    try {
      const [statsRes, todayRes, myRes] = await Promise.all([
        this.getLeaveStats(),
        this.getTodayLeaveRequests(),
        this.getMyLeaveRequests({ per_page: 5 })
      ]);

      return {
        status: 'ok',
        data: {
          stats: statsRes?.data || statsRes || {},
          today: todayRes?.requests || [],
          recent: myRes?.requests || [],
          pending_count: statsRes?.data?.pending || statsRes?.pending || 0,
          total_count: statsRes?.data?.total || statsRes?.total || 0,
        }
      };
    } catch (error) {
      console.error('Error getting leave dashboard stats:', error);
      throw this.handleError(error);
    }
  }
}

// ✅ export به صورت default
export default new AttendanceService();