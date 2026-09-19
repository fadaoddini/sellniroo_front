// services/galleryService.js

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

const galleryService = {
  // ============================================
  // دریافت همه اسلایدها
  // ============================================
  getSlides: async (params = {}) => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/gallery/slides/`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching slides:', error);
      throw error.response?.data || { error: 'خطا در دریافت اسلایدها' };
    }
  },

  // ============================================
  // دریافت اسلایدهای ویژه
  // ============================================
  getFeaturedSlides: async () => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/gallery/slides/featured/`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching featured slides:', error);
      throw error.response?.data || { error: 'خطا در دریافت اسلایدهای ویژه' };
    }
  },

  // ============================================
  // دریافت جزئیات اسلاید (افزایش بازدید)
  // ============================================
  getSlide: async (id) => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/gallery/slides/${id}/`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching slide ${id}:`, error);
      throw error.response?.data || { error: 'خطا در دریافت جزئیات اسلاید' };
    }
  },

  // ============================================
  // ایجاد اسلاید جدید - اصلاح شده
  // ============================================
  createSlide: async (data) => {
    try {
      // اگر data یک FormData است، مستقیماً استفاده کن
      if (data instanceof FormData) {
        const response = await axios.post(
          `${Config.baseUrl}/api/gallery/slides/`,
          data,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        return response.data;
      }

      // اگر data یک شیء معمولی است، تبدیل به FormData کن
      const formData = new FormData();
      
      // اضافه کردن فیلدهای متنی
      const textFields = [
        'title_fa', 'title_en', 'subtitle_fa', 'subtitle_en',
        'description_fa', 'description_en', 'link',
        'link_text_fa', 'link_text_en'
      ];
      
      textFields.forEach(field => {
        if (data[field]) {
          formData.append(field, data[field]);
        }
      });

      // اضافه کردن boolean ها
      if (data.is_featured !== undefined) {
        formData.append('is_featured', data.is_featured ? 'true' : 'false');
      }
      
      if (data.order !== undefined) {
        formData.append('order', String(data.order || 0));
      }

      // اضافه کردن تصویر
      if (data.image instanceof File) {
        formData.append('image', data.image);
      }

      // اضافه کردن تصاویر گالری
      if (data.gallery_images && Array.isArray(data.gallery_images)) {
        data.gallery_images.forEach((img, index) => {
          if (img.image instanceof File) {
            formData.append(`gallery_images[${index}]image`, img.image);
          }
          if (img.title) {
            formData.append(`gallery_images[${index}]title`, img.title);
          }
          if (img.description) {
            formData.append(`gallery_images[${index}]description`, img.description);
          }
          formData.append(`gallery_images[${index}]order`, String(img.order || index));
        });
      }

      const response = await axios.post(
        `${Config.baseUrl}/api/gallery/slides/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating slide:', error);
      console.error('Error response data:', error.response?.data);
      throw error.response?.data || { error: 'خطا در ایجاد اسلاید' };
    }
  },

  // ============================================
  // بروزرسانی اسلاید - اصلاح شده
  // ============================================
  updateSlide: async (id, data) => {
    try {
      // اگر data یک FormData است، مستقیماً استفاده کن
      if (data instanceof FormData) {
        const response = await axios.put(
          `${Config.baseUrl}/api/gallery/slides/${id}/`,
          data,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        return response.data;
      }

      const formData = new FormData();
      
      // اضافه کردن فیلدهای متنی
      const textFields = [
        'title_fa', 'title_en', 'subtitle_fa', 'subtitle_en',
        'description_fa', 'description_en', 'link',
        'link_text_fa', 'link_text_en'
      ];
      
      textFields.forEach(field => {
        if (data[field]) {
          formData.append(field, data[field]);
        }
      });

      if (data.is_featured !== undefined) {
        formData.append('is_featured', data.is_featured ? 'true' : 'false');
      }
      
      if (data.order !== undefined) {
        formData.append('order', String(data.order || 0));
      }

      if (data.image instanceof File) {
        formData.append('image', data.image);
      }

      const response = await axios.put(
        `${Config.baseUrl}/api/gallery/slides/${id}/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating slide ${id}:`, error);
      console.error('Error response data:', error.response?.data);
      throw error.response?.data || { error: 'خطا در بروزرسانی اسلاید' };
    }
  },

  // ============================================
  // حذف اسلاید
  // ============================================
  deleteSlide: async (id) => {
    try {
      const response = await axios.delete(
        `${Config.baseUrl}/api/gallery/slides/${id}/`
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting slide ${id}:`, error);
      throw error.response?.data || { error: 'خطا در حذف اسلاید' };
    }
  },

  // ============================================
  // لایک کردن اسلاید
  // ============================================
  likeSlide: async (id) => {
    try {
      const response = await axios.post(
        `${Config.baseUrl}/api/gallery/slides/${id}/like/`
      );
      return response.data;
    } catch (error) {
      console.error(`Error liking slide ${id}:`, error);
      throw error.response?.data || { error: 'خطا در لایک کردن' };
    }
  },

  // ============================================
  // افزودن تصویر به گالری اسلاید
  // ============================================
  addGalleryImage: async (slideId, data) => {
    try {
      const formData = new FormData();
      if (data.image instanceof File) {
        formData.append('image', data.image);
      }
      formData.append('title', data.title || '');
      formData.append('description', data.description || '');
      formData.append('order', data.order || 0);
      
      const response = await axios.post(
        `${Config.baseUrl}/api/gallery/slides/${slideId}/add_gallery_image/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error adding gallery image to slide ${slideId}:`, error);
      throw error.response?.data || { error: 'خطا در افزودن تصویر' };
    }
  },

  // ============================================
  // حذف تصویر از گالری اسلاید
  // ============================================
  removeGalleryImage: async (slideId, imageId) => {
    try {
      const response = await axios.delete(
        `${Config.baseUrl}/api/gallery/slides/${slideId}/remove_gallery_image/?image_id=${imageId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error removing gallery image ${imageId} from slide ${slideId}:`, error);
      throw error.response?.data || { error: 'خطا در حذف تصویر' };
    }
  },

  // ============================================
  // دریافت آمار اسلایدها
  // ============================================
  getStats: async () => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/gallery/slides/stats/`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error.response?.data || { error: 'خطا در دریافت آمار' };
    }
  },

  // ============================================
  // دریافت آمار بازدیدها
  // ============================================
  getViewsStats: async () => {
    try {
      const response = await axios.get(
        `${Config.baseUrl}/api/gallery/slides/views_stats/`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching views stats:', error);
      throw error.response?.data || { error: 'خطا در دریافت آمار بازدید' };
    }
  },
};

export default galleryService;