// config/config.jsx

const Config = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",

  defaultApiVersion: "v1",
  
  getApiUrl: ({ segment = '', endpoint = '', version = null, params = {}, noVersion = false }) => {
    const apiVersion = version || Config.defaultApiVersion;
    let url;
    
    if (endpoint.startsWith('/')) {
      url = `${Config.baseUrl}${endpoint}`;
    } else if (segment) {
      url = noVersion 
        ? `${Config.baseUrl}/${segment}/${endpoint}`
        : `${Config.baseUrl}/${segment}/${apiVersion}/${endpoint}`;
    } else {
      url = noVersion 
        ? `${Config.baseUrl}/${endpoint}`
        : `${Config.baseUrl}/${apiVersion}/${endpoint}`;
    }
    
    const queryString = new URLSearchParams(params).toString();
    return queryString ? `${url}?${queryString}` : url;
  },
  
  endpoints: {
    // ============================================
    // LOGIN
    // ============================================
    login: (endpoint, params = {}) => {
      if (!endpoint || endpoint.startsWith('/')) {
        return Config.getApiUrl({ segment: 'login', endpoint: endpoint || '', params });
      }
      return Config.getApiUrl({ segment: 'login', endpoint: `${endpoint}`, params });
    },
    
    profile: (endpoint = '', params = {}) => {
      return Config.getApiUrl({ segment: 'login', endpoint: `profile${endpoint ? '/' + endpoint : ''}`, params });
    },
    
    admin: (endpoint, params = {}) => Config.getApiUrl({ segment: 'admin', endpoint, params }),
    
    // ============================================
    // KARMANDAN (کارمندان) - ✅ کامل
    // ============================================
    karmandan: {
      checkEmployee: () => {
        return Config.getApiUrl({ 
          segment: 'api/karmandan', 
          endpoint: 'employees/check-employee/',
          noVersion: true
        });
      },
      // ✅ دریافت دسترسی‌های کاربر
      myPermissions: () => {
        return Config.getApiUrl({ 
          segment: 'api/karmandan', 
          endpoint: 'employees/my-permissions/',
          noVersion: true
        });
      },
      list: (params = {}) => {
        return Config.getApiUrl({ 
          segment: 'api/karmandan', 
          endpoint: 'employees/',
          params,
          noVersion: true
        });
      },
      detail: (id) => {
        return Config.getApiUrl({ 
          segment: 'api/karmandan', 
          endpoint: `employees/${id}/`,
          noVersion: true
        });
      },
      myProfile: () => {
        return Config.getApiUrl({ 
          segment: 'api/karmandan', 
          endpoint: 'employees/my-profile/',
          noVersion: true
        });
      },
      leads: {
        list: (params = {}) => {
          return Config.getApiUrl({ 
            segment: 'api/karmandan', 
            endpoint: 'leads/',
            params,
            noVersion: true
          });
        },
        detail: (id) => {
          return Config.getApiUrl({ 
            segment: 'api/karmandan', 
            endpoint: `leads/${id}/`,
            noVersion: true
          });
        },
        create: () => {
          return Config.getApiUrl({ 
            segment: 'api/karmandan', 
            endpoint: 'leads/',
            noVersion: true
          });
        },
        update: (id) => {
          return Config.getApiUrl({ 
            segment: 'api/karmandan', 
            endpoint: `leads/${id}/`,
            noVersion: true
          });
        },
        delete: (id) => {
          return Config.getApiUrl({ 
            segment: 'api/karmandan', 
            endpoint: `leads/${id}/`,
            noVersion: true
          });
        },
        followup: (leadId) => {
          return Config.getApiUrl({ 
            segment: 'api/karmandan', 
            endpoint: `leads/${leadId}/followup/`,
            noVersion: true
          });
        },
        assign: (leadId) => {
          return Config.getApiUrl({ 
            segment: 'api/karmandan', 
            endpoint: `leads/${leadId}/assign/`,
            noVersion: true
          });
        },
        changeStatus: (leadId) => {
          return Config.getApiUrl({ 
            segment: 'api/karmandan', 
            endpoint: `leads/${leadId}/change-status/`,
            noVersion: true
          });
        },
        stats: () => {
          return Config.getApiUrl({ 
            segment: 'api/karmandan', 
            endpoint: 'leads/stats/',
            noVersion: true
          });
        },
        myLeads: () => {
          return Config.getApiUrl({ 
            segment: 'api/karmandan', 
            endpoint: 'leads/my-leads/',
            noVersion: true
          });
        },
      },
      dashboardStats: () => {
        return Config.getApiUrl({ 
          segment: 'api/karmandan', 
          endpoint: 'dashboard-stats/',
          noVersion: true
        });
      },
      // ✅ جستجوی کارمندان
      search: (query) => {
        return Config.getApiUrl({ 
          segment: 'api/karmandan', 
          endpoint: 'employees/search/',
          params: { q: query },
          noVersion: true
        });
      },
      // ✅ آمار کارمندان
      stats: () => {
        return Config.getApiUrl({ 
          segment: 'api/karmandan', 
          endpoint: 'employees/stats/',
          noVersion: true
        });
      },
    },

    // ============================================
    // REQUSER (درخواست‌های مشتریان)
    // ============================================
    requser: {
      create: () => {
        return Config.getApiUrl({ 
          segment: 'api/requser', 
          endpoint: 'public/create/',
          noVersion: true
        });
      },
      status: (requestNumber) => {
        return Config.getApiUrl({ 
          segment: 'api/requser', 
          endpoint: 'public/status/',
          params: { request_number: requestNumber },
          noVersion: true
        });
      },
      list: (params = {}) => {
        return Config.getApiUrl({ 
          segment: 'api/requser', 
          endpoint: 'requests/',
          params,
          noVersion: true
        });
      },
      detail: (id) => {
        return Config.getApiUrl({ 
          segment: 'api/requser', 
          endpoint: `requests/${id}/`,
          noVersion: true
        });
      },
      followup: (id) => {
        return Config.getApiUrl({ 
          segment: 'api/requser', 
          endpoint: `requests/${id}/followup/`,
          noVersion: true
        });
      },
      changeStatus: (id) => {
        return Config.getApiUrl({ 
          segment: 'api/requser', 
          endpoint: `requests/${id}/change-status/`,
          noVersion: true
        });
      },
      assign: (id) => {
        return Config.getApiUrl({ 
          segment: 'api/requser', 
          endpoint: `requests/${id}/assign/`,
          noVersion: true
        });
      },
      note: (id) => {
        return Config.getApiUrl({ 
          segment: 'api/requser', 
          endpoint: `requests/${id}/note/`,
          noVersion: true
        });
      },
      stats: () => {
        return Config.getApiUrl({ 
          segment: 'api/requser', 
          endpoint: 'requests/stats/',
          noVersion: true
        });
      },
      myRequests: (params = {}) => {
        return Config.getApiUrl({ 
          segment: 'api/requser', 
          endpoint: 'requests/my-requests/',
          params,
          noVersion: true
        });
      },
      types: () => {
        return Config.getApiUrl({ 
          segment: 'api/requser', 
          endpoint: 'types/',
          noVersion: true
        });
      },
      categories: () => {
        return Config.getApiUrl({ 
          segment: 'api/requser', 
          endpoint: 'categories/',
          noVersion: true
        });
      },
    },

    // ============================================
    // NEWS
    // ============================================
    news: {
      list: (params = {}) => {
        return Config.getApiUrl({ 
          segment: 'api', 
          endpoint: 'news/', 
          params,
          noVersion: true
        });
      },
      categories: () => {
        return Config.getApiUrl({ 
          segment: 'api', 
          endpoint: 'news/categories/',
          noVersion: true
        });
      },
      detail: (id) => {
        return Config.getApiUrl({ 
          segment: 'api', 
          endpoint: `news/${id}/`,
          noVersion: true
        });
      },
      latest: (limit = 10) => {
        return Config.getApiUrl({ 
          segment: 'api', 
          endpoint: 'news/latest/',
          params: { limit },
          noVersion: true
        });
      },
      bySource: (source, limit = 20) => {
        return Config.getApiUrl({ 
          segment: 'api', 
          endpoint: 'news/by_source/',
          params: { source, limit },
          noVersion: true
        });
      },
      stats: () => {
        return Config.getApiUrl({ 
          segment: 'api', 
          endpoint: 'news/stats/',
          noVersion: true
        });
      },
      scrape: () => {
        return Config.getApiUrl({ 
          segment: 'api', 
          endpoint: 'news/scrape/',
          noVersion: true
        });
      },
      refresh: () => {
        return Config.getApiUrl({ 
          segment: 'api', 
          endpoint: 'news/refresh/',
          noVersion: true
        });
      },
      sync: () => {
        return Config.getApiUrl({ 
          segment: 'api', 
          endpoint: 'news/sync/',
          noVersion: true
        });
      },
      create: () => {
        return Config.getApiUrl({ 
          segment: 'api', 
          endpoint: 'news/',
          noVersion: true
        });
      },
      update: (id) => {
        return Config.getApiUrl({ 
          segment: 'api', 
          endpoint: `news/${id}/`,
          noVersion: true
        });
      },
      delete: (id) => {
        return Config.getApiUrl({ 
          segment: 'api', 
          endpoint: `news/${id}/`,
          noVersion: true
        });
      },
    },


    // ============================================
    // VIDEO ARCHIVE
    // ============================================
    videoArchive: {
      list: (params = {}) => {
        return Config.getApiUrl({
          segment: 'api',
          endpoint: 'v1/video-archive',
          params,
          noVersion: true
        });
      },
      detail: (id) => {
        return Config.getApiUrl({
          segment: 'api',
          endpoint: `v1/video-archive/${id}`,
          noVersion: true
        });
      },
      create: () => {
        return Config.getApiUrl({
          segment: 'api',
          endpoint: 'v1/video-archive',
          noVersion: true
        });
      },
      update: (id) => {
        return Config.getApiUrl({
          segment: 'api',
          endpoint: `v1/video-archive/${id}`,
          noVersion: true
        });
      },
      delete: (id) => {
        return Config.getApiUrl({
          segment: 'api',
          endpoint: `v1/video-archive/${id}`,
          noVersion: true
        });
      },
      stats: () => {
        return Config.getApiUrl({
          segment: 'api',
          endpoint: 'v1/video-archive/stats',
          noVersion: true
        });
      },
      reorder: () => {
        return Config.getApiUrl({
          segment: 'api',
          endpoint: 'v1/video-archive/reorder',
          noVersion: true
        });
      },
    },
    
  },
};

export default Config;