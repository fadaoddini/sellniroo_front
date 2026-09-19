// services/heroService.js
import axios from 'axios';
import Config from '@/config/config';

class HeroService {
  /**
   * دریافت هیروی فعال با زبان
   */
  static async getActiveHero(lang = 'fa') {
    try {
      // استفاده از مسیر مستقیم
      const baseUrl = Config.baseUrl;
      const response = await axios.get(
        `${baseUrl}/api/hero/active_hero/`,
        { params: { lang } }
      );
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error fetching hero data:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در دریافت اطلاعات'
      };
    }
  }

  /**
   * دریافت همه هیروها (فقط ادمین)
   */
  static async getAllHeroes(token, lang = 'fa') {
    try {
      const baseUrl = Config.baseUrl;
      const response = await axios.get(
        `${baseUrl}/api/hero/`,
        {
          params: { lang },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در دریافت اطلاعات'
      };
    }
  }

  /**
   * دریافت یک هیرو با ID
   */
  static async getHeroById(id, token = null, lang = 'fa') {
    try {
      const baseUrl = Config.baseUrl;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(
        `${baseUrl}/api/hero/${id}/`,
        { 
          params: { lang },
          headers 
        }
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در دریافت اطلاعات'
      };
    }
  }

  /**
   * بروزرسانی هیرو (فقط ادمین)
   */
  static async updateHero(id, data, token) {
    try {
      const baseUrl = Config.baseUrl;
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });

      const response = await axios.put(
        `${baseUrl}/api/hero/${id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در بروزرسانی'
      };
    }
  }

  /**
   * افزودن آیتم آماری (فقط ادمین)
   */
  static async addStat(heroId, data, token) {
    try {
      const baseUrl = Config.baseUrl;
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });

      const response = await axios.post(
        `${baseUrl}/api/hero/${heroId}/add_stat/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در افزودن آیتم آماری'
      };
    }
  }

  /**
   * بروزرسانی آیتم آماری (فقط ادمین)
   */
  static async updateStat(heroId, statId, data, token) {
    try {
      const baseUrl = Config.baseUrl;
      const formData = new FormData();
      formData.append('stat_id', statId);
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });

      const response = await axios.post(
        `${baseUrl}/api/hero/${heroId}/update_stat/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در بروزرسانی آیتم آماری'
      };
    }
  }

  /**
   * حذف آیتم آماری (فقط ادمین)
   */
  static async removeStat(heroId, statId, token) {
    try {
      const baseUrl = Config.baseUrl;
      const response = await axios.delete(
        `${baseUrl}/api/hero/${heroId}/remove_stat/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { stat_id: statId }
        }
      );
      return {
        success: true,
        data: response.data.data,
        message: 'با موفقیت حذف شد'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در حذف'
      };
    }
  }

  /**
   * بروزرسانی ترتیب آیتم‌ها (فقط ادمین)
   */
  static async updateOrder(heroId, orders, token) {
    try {
      const baseUrl = Config.baseUrl;
      const response = await axios.post(
        `${baseUrl}/api/hero/${heroId}/update_order/`,
        { orders },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در بروزرسانی ترتیب'
      };
    }
  }
}

export default HeroService;