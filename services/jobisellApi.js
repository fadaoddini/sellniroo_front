// src/services/jobisellApi.js
import axios from 'axios';
import Config from '@/config/config';

const authHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const jobisellApi = {
  // ============================================
  // ✅ فیلترها (Lookup)
  // ============================================
  async getFilterOptions() {
    const { data } = await axios.get(Config.endpoints.jobisell.filterOptions());
    return data;
  },

  async getProvinces(params = {}) {
    const { data } = await axios.get(Config.endpoints.jobisell.provinces(params));
    return data;
  },

  async getCities(params = {}) {
    const { data } = await axios.get(Config.endpoints.jobisell.cities(params));
    return data;
  },

  async getNeighborhoods(params = {}) {
    const { data } = await axios.get(Config.endpoints.jobisell.neighborhoods(params));
    return data;
  },

  async getCooperationTypes() {
    const { data } = await axios.get(Config.endpoints.jobisell.cooperationTypes());
    return data;
  },

  async getCategories() {
    const { data } = await axios.get(Config.endpoints.jobisell.categories());
    return data;
  },

  async getJobTitles(params = {}) {
    const { data } = await axios.get(Config.endpoints.jobisell.jobTitles(params));
    return data;
  },

  async getFeatures(params = {}) {
    const { data } = await axios.get(Config.endpoints.jobisell.features(params));
    return data;
  },

  async getTags() {
    const { data } = await axios.get(Config.endpoints.jobisell.tags());
    return data;
  },

  async getSortOptions() {
    const { data } = await axios.get(Config.endpoints.jobisell.sortOptions());
    return data;
  },

  // ============================================
  // ✅ آگهی‌ها
  // ============================================
  async getJobs(params = {}) {
    // حذف پارامترهای خالی
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    );
    const { data } = await axios.get(Config.endpoints.jobisell.jobs.list(cleanParams));
    return data;
  },

  async getJobDetail(id) {
    const { data } = await axios.get(Config.endpoints.jobisell.jobs.detail(id));
    return data;
  },

  async createJob(payload) {
  // اگر payload FormData است، هدر Content-Type نگذار
  const isFormData = payload instanceof FormData;
  const { data } = await axios.post(
    Config.endpoints.jobisell.jobs.create(),
    payload,
    {
      headers: {
        ...authHeaders(),
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      },
    }
  );
  return data;
},

  async updateJob(id, payload) {
    const { data } = await axios.patch(
      Config.endpoints.jobisell.jobs.partialUpdate(id),
      payload,
      { headers: authHeaders() }
    );
    return data;
  },

  async deleteJob(id) {
    const { data } = await axios.delete(
      Config.endpoints.jobisell.jobs.delete(id),
      { headers: authHeaders() }
    );
    return data;
  },

  async getStats() {
    const { data } = await axios.get(Config.endpoints.jobisell.jobs.stats());
    return data;
  },

  async searchJobs(q) {
    const { data } = await axios.get(Config.endpoints.jobisell.jobs.search(q));
    return data;
  },

  // ============================================
  // ✅ تعاملات
  // ============================================
  async toggleLike(id) {
    const { data } = await axios.post(
      Config.endpoints.jobisell.jobs.like(id),
      {},
      { headers: authHeaders() }
    );
    return data;
  },

  async toggleBookmark(id) {
    const { data } = await axios.post(
      Config.endpoints.jobisell.jobs.bookmark(id),
      {},
      { headers: authHeaders() }
    );
    return data;
  },

  async applyToJob(id, payload) {
    const { data } = await axios.post(
      Config.endpoints.jobisell.jobs.apply(id),
      payload,
      { headers: authHeaders() }
    );
    return data;
  },
};

export default jobisellApi;