// services/treeChartService.js

import axios from 'axios';
import Config from '@/config/config';

// تنظیم اینترسپتور برای اضافه کردن توکن
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

const treeChartService = {
  // ============================================
  // دریافت کل ساختار درختی (ریشه‌ها)
  // ============================================
  getTree: async () => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/tree/nodes/tree/`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching tree:', error);
      throw error.response?.data || { error: 'خطا در دریافت ساختار درخت' };
    }
  },

  // ============================================
  // دریافت همه گره‌ها به صورت صاف (بدون سلسله مراتب)
  // ============================================
  getFlatNodes: async (params = {}) => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/tree/nodes/flat/`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching flat nodes:', error);
      throw error.response?.data || { error: 'خطا در دریافت گره‌ها' };
    }
  },

  // ============================================
  // دریافت جزئیات یک گره با تمام فرزندان
  // ============================================
  getNode: async (id) => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/tree/nodes/${id}/`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching node ${id}:`, error);
      throw error.response?.data || { error: 'خطا در دریافت جزئیات گره' };
    }
  },

  // ============================================
  // دریافت فرزندان مستقیم یک گره
  // ============================================
  getNodeChildren: async (id) => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/tree/nodes/${id}/children/`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching children of node ${id}:`, error);
      throw error.response?.data || { error: 'خطا در دریافت فرزندان' };
    }
  },

  // ============================================
  // دریافت همه زیرشاخه‌های یک گره
  // ============================================
  getNodeDescendants: async (id) => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/tree/nodes/${id}/descendants/`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching descendants of node ${id}:`, error);
      throw error.response?.data || { error: 'خطا در دریافت زیرشاخه‌ها' };
    }
  },

  // ============================================
  // دریافت مسیر از ریشه تا گره جاری
  // ============================================
  getNodePath: async (id) => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/tree/nodes/${id}/path/`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching path of node ${id}:`, error);
      throw error.response?.data || { error: 'خطا در دریافت مسیر' };
    }
  },

  // ============================================
  // ایجاد گره جدید
  // ============================================
  createNode: async (data) => {
    try {
      const response = await axios.post(
        `${Config.baseUrl}/api/tree/nodes/`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error creating node:', error);
      throw error.response?.data || { error: 'خطا در ایجاد گره' };
    }
  },

  // ============================================
  // بروزرسانی گره
  // ============================================
  updateNode: async (id, data) => {
    try {
      const response = await axios.put(
        `${Config.baseUrl}/api/tree/nodes/${id}/`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating node ${id}:`, error);
      throw error.response?.data || { error: 'خطا در بروزرسانی گره' };
    }
  },

  // ============================================
  // حذف گره
  // ============================================
  deleteNode: async (id) => {
    try {
      const response = await axios.delete(
        `${Config.baseUrl}/api/tree/nodes/${id}/`
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting node ${id}:`, error);
      throw error.response?.data || { error: 'خطا در حذف گره' };
    }
  },

  // ============================================
  // افزودن فعالیت به گره
  // ============================================
  addActivity: async (nodeId, data) => {
    try {
      const response = await axios.post(
        `${Config.baseUrl}/api/tree/nodes/${nodeId}/add_activity/`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error adding activity to node ${nodeId}:`, error);
      throw error.response?.data || { error: 'خطا در افزودن فعالیت' };
    }
  },

  // ============================================
  // حذف فعالیت از گره
  // ============================================
  removeActivity: async (nodeId, activityId) => {
    try {
      const response = await axios.delete(
        `${Config.baseUrl}/api/tree/nodes/${nodeId}/remove_activity/?activity_id=${activityId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error removing activity ${activityId} from node ${nodeId}:`, error);
      throw error.response?.data || { error: 'خطا در حذف فعالیت' };
    }
  },

  // ============================================
  // دریافت فعالیت‌های یک گره
  // ============================================
  getNodeActivities: async (nodeId) => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/tree/activities/?node_id=${nodeId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching activities of node ${nodeId}:`, error);
      throw error.response?.data || { error: 'خطا در دریافت فعالیت‌ها' };
    }
  },

  // ============================================
  // دریافت گره‌ها با فیلتر
  // ============================================
  searchNodes: async (params = {}) => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/tree/nodes/`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Error searching nodes:', error);
      throw error.response?.data || { error: 'خطا در جستجوی گره‌ها' };
    }
  },

  // ============================================
  // دریافت گره‌های ریشه
  // ============================================
  getRootNodes: async () => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/tree/nodes/?root_only=true`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching root nodes:', error);
      throw error.response?.data || { error: 'خطا در دریافت گره‌های ریشه' };
    }
  },

  // ============================================
  // دریافت گره‌ها بر اساس نوع
  // ============================================
  getNodesByType: async (type) => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/tree/nodes/?type=${type}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching nodes by type ${type}:`, error);
      throw error.response?.data || { error: 'خطا در دریافت گره‌ها' };
    }
  },

  // ============================================
  // دریافت گره‌ها بر اساس سطح
  // ============================================
  getNodesByLevel: async (level) => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/tree/nodes/?level=${level}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching nodes by level ${level}:`, error);
      throw error.response?.data || { error: 'خطا در دریافت گره‌ها' };
    }
  },

  // ============================================
  // ایجاد چندین گره به صورت دسته‌جمعی (برای seed)
  // ============================================
  bulkCreateNodes: async (nodes) => {
    try {
      const results = [];
      for (const node of nodes) {
        const result = await treeChartService.createNode(node);
        results.push(result);
      }
      return results;
    } catch (error) {
      console.error('Error bulk creating nodes:', error);
      throw error.response?.data || { error: 'خطا در ایجاد دسته‌جمعی گره‌ها' };
    }
  },
};

export default treeChartService;