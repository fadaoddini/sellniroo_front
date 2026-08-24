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
    // HERO
    // ============================================
    hero: (endpoint = '', params = {}) => {
      if (endpoint.startsWith('/')) {
        return Config.getApiUrl({ segment: '', endpoint, params });
      }
      return Config.getApiUrl({ segment: 'api', endpoint: `hero/${endpoint}`, params });
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
    // BRANDS
    // ============================================
    brands: {
      list: (params = {}) => {
        return Config.getApiUrl({ 
          segment: 'api', 
          endpoint: 'brands/',
          params,
          noVersion: true
        });
      },
      detail: (id) => {
        return Config.getApiUrl({ 
          segment: 'api', 
          endpoint: `brands/${id}/`,
          noVersion: true
        });
      },
      featured: () => {
        return Config.getApiUrl({ 
          segment: 'api', 
          endpoint: 'brands/featured/',
          noVersion: true
        });
      },
      byCategory: (category) => {
        return Config.getApiUrl({ 
          segment: 'api', 
          endpoint: `brands/by-category/${category}/`,
          noVersion: true
        });
      },
      categories: () => {
        return Config.getApiUrl({ 
          segment: 'api', 
          endpoint: 'brands/categories/',
          noVersion: true
        });
      },
      click: (id) => {
        return Config.getApiUrl({ 
          segment: 'api', 
          endpoint: `brands/${id}/click/`,
          noVersion: true
        });
      },
      stats: () => {
        return Config.getApiUrl({ 
          segment: 'api', 
          endpoint: 'brands/stats/',
          noVersion: true
        });
      },
      create: () => {
        return Config.getApiUrl({ 
          segment: 'api', 
          endpoint: 'brands/',
          noVersion: true
        });
      },
      update: (id) => {
        return Config.getApiUrl({ 
          segment: 'api', 
          endpoint: `brands/${id}/`,
          noVersion: true
        });
      },
      delete: (id) => {
        return Config.getApiUrl({ 
          segment: 'api', 
          endpoint: `brands/${id}/`,
          noVersion: true
        });
      },
    },

    // ============================================
    // INVENTORY - کامل
    // ============================================
    inventory: {
      units: {
        list: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/units/${queryString ? '?' + queryString : ''}`;
        },
        detail: (id) => `${Config.baseUrl}/inventory/units/${id}/`,
        create: () => `${Config.baseUrl}/inventory/units/`,
        update: (id) => `${Config.baseUrl}/inventory/units/${id}/`,
        partialUpdate: (id) => `${Config.baseUrl}/inventory/units/${id}/`,
        delete: (id) => `${Config.baseUrl}/inventory/units/${id}/`,
        tree: () => `${Config.baseUrl}/inventory/units/tree_all/`,
        roots: () => `${Config.baseUrl}/inventory/units/roots/`,
        children: (id) => `${Config.baseUrl}/inventory/units/${id}/children/`,
        breakdown: (unitId, quantity = 1) => 
          `${Config.baseUrl}/inventory/units/${unitId}/breakdown/?quantity=${quantity}`,
      },
      categories: {
        list: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/categories/${queryString ? '?' + queryString : ''}`;
        },
        detail: (id) => `${Config.baseUrl}/inventory/categories/${id}/`,
        create: () => `${Config.baseUrl}/inventory/categories/`,
        update: (id) => `${Config.baseUrl}/inventory/categories/${id}/`,
        delete: (id) => `${Config.baseUrl}/inventory/categories/${id}/`,
      },
      warehouses: {
        list: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/warehouses/${queryString ? '?' + queryString : ''}`;
        },
        detail: (id) => `${Config.baseUrl}/inventory/warehouses/${id}/`,
        create: () => `${Config.baseUrl}/inventory/warehouses/`,
        update: (id) => `${Config.baseUrl}/inventory/warehouses/${id}/`,
        delete: (id) => `${Config.baseUrl}/inventory/warehouses/${id}/`,
        summary: (id) => `${Config.baseUrl}/inventory/warehouses/${id}/summary/`,
      },
      products: {
        list: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/products/${queryString ? '?' + queryString : ''}`;
        },
        detail: (id) => `${Config.baseUrl}/inventory/products/${id}/`,
        create: () => `${Config.baseUrl}/inventory/products/`,
        update: (id) => `${Config.baseUrl}/inventory/products/${id}/`,
        delete: (id) => `${Config.baseUrl}/inventory/products/${id}/`,
        stockStatus: (id) => `${Config.baseUrl}/inventory/products/${id}/stock_status/`,
        stockHistory: (id, params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/products/${id}/stock_history/${queryString ? '?' + queryString : ''}`;
        },
      },
      packagings: {
        list: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/packagings/${queryString ? '?' + queryString : ''}`;
        },
        detail: (id) => `${Config.baseUrl}/inventory/packagings/${id}/`,
        create: () => `${Config.baseUrl}/inventory/packagings/`,
        update: (id) => `${Config.baseUrl}/inventory/packagings/${id}/`,
        delete: (id) => `${Config.baseUrl}/inventory/packagings/${id}/`,
      },
      packagingHierarchy: {
        save: () => `${Config.baseUrl}/inventory/packaging-configs/create_hierarchy/`,
        get: (productId, warehouseId) => 
          `${Config.baseUrl}/inventory/packaging-configs/get_hierarchy/?product_id=${productId}&warehouse_id=${warehouseId}`,
      },
      transactions: {
        list: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/transactions/${queryString ? '?' + queryString : ''}`;
        },
        detail: (id) => `${Config.baseUrl}/inventory/transactions/${id}/`,
        create: () => `${Config.baseUrl}/inventory/transactions/`,
        update: (id) => `${Config.baseUrl}/inventory/transactions/${id}/`,
        delete: (id) => `${Config.baseUrl}/inventory/transactions/${id}/`,
        addStock: () => `${Config.baseUrl}/inventory/transactions/add_stock/`,
        removeStock: () => `${Config.baseUrl}/inventory/transactions/remove_stock/`,
        dailyReport: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/transactions/daily_report/${queryString ? '?' + queryString : ''}`;
        },
        printReceipt: (id) => `${Config.baseUrl}/inventory/transactions/${id}/print_receipt/`,
      },
      authorizedPersons: {
        list: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/authorized-persons/${queryString ? '?' + queryString : ''}`;
        },
        detail: (id) => `${Config.baseUrl}/inventory/authorized-persons/${id}/`,
        create: () => `${Config.baseUrl}/inventory/authorized-persons/`,
        update: (id) => `${Config.baseUrl}/inventory/authorized-persons/${id}/`,
        delete: (id) => `${Config.baseUrl}/inventory/authorized-persons/${id}/`,
      },
      alerts: {
        list: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/alerts/${queryString ? '?' + queryString : ''}`;
        },
        detail: (id) => `${Config.baseUrl}/inventory/alerts/${id}/`,
        resolve: (id) => `${Config.baseUrl}/inventory/alerts/${id}/resolve/`,
      },
      stockItems: {
        list: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/stock-items/${queryString ? '?' + queryString : ''}`;
        },
        detail: (id) => `${Config.baseUrl}/inventory/stock-items/${id}/`,
        update: (id) => `${Config.baseUrl}/inventory/stock-items/${id}/`,
      },
      packagingLevels: {
        list: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/packaging-levels/${queryString ? '?' + queryString : ''}`;
        },
        detail: (id) => `${Config.baseUrl}/inventory/packaging-levels/${id}/`,
        create: () => `${Config.baseUrl}/inventory/packaging-levels/`,
        update: (id) => `${Config.baseUrl}/inventory/packaging-levels/${id}/`,
        delete: (id) => `${Config.baseUrl}/inventory/packaging-levels/${id}/`,
      },
      packagingConfigs: {
        list: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/packaging-configs/${queryString ? '?' + queryString : ''}`;
        },
        detail: (id) => `${Config.baseUrl}/inventory/packaging-configs/${id}/`,
        create: () => `${Config.baseUrl}/inventory/packaging-configs/`,
        update: (id) => `${Config.baseUrl}/inventory/packaging-configs/${id}/`,
        delete: (id) => `${Config.baseUrl}/inventory/packaging-configs/${id}/`,
        createHierarchy: () => `${Config.baseUrl}/inventory/packaging-configs/create_hierarchy/`,
        getByProduct: (productId) => `${Config.baseUrl}/inventory/packaging-configs/get_by_product/?product_id=${productId}`,
      },
      packagingVariants: {
        list: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/packaging-variants/${queryString ? '?' + queryString : ''}`;
        },
        detail: (id) => `${Config.baseUrl}/inventory/packaging-variants/${id}/`,
        create: () => `${Config.baseUrl}/inventory/packaging-variants/`,
        update: (id) => `${Config.baseUrl}/inventory/packaging-variants/${id}/`,
        delete: (id) => `${Config.baseUrl}/inventory/packaging-variants/${id}/`,
        getByProduct: (productId) => `${Config.baseUrl}/inventory/packaging-variants/get_by_product/?product_id=${productId}`,
      },
      hierarchicalStock: {
        list: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/hierarchical-stock/${queryString ? '?' + queryString : ''}`;
        },
        detail: (id) => `${Config.baseUrl}/inventory/hierarchical-stock/${id}/`,
        create: () => `${Config.baseUrl}/inventory/hierarchical-stock/`,
        update: (id) => `${Config.baseUrl}/inventory/hierarchical-stock/${id}/`,
        delete: (id) => `${Config.baseUrl}/inventory/hierarchical-stock/${id}/`,
        addPallets: () => `${Config.baseUrl}/inventory/hierarchical-stock/add_pallets/`,
        addCustom: () => `${Config.baseUrl}/inventory/hierarchical-stock/add_custom/`,
        removeStock: () => `${Config.baseUrl}/inventory/hierarchical-stock/remove_stock/`,
        getBreakdown: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/hierarchical-stock/get_stock_breakdown/${queryString ? '?' + queryString : ''}`;
        },
      },
      reports: {
        list: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/reports/${queryString ? '?' + queryString : ''}`;
        },
        stock: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/reports/stock/${queryString ? '?' + queryString : ''}`;
        },
        transactions: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/reports/transactions/${queryString ? '?' + queryString : ''}`;
        },
        summary: () => `${Config.baseUrl}/inventory/reports/summary/`,
      },
    },

    // ============================================
    // SETAD (مناقصات)
    // ============================================
    setad: {
      list: (params = {}) => {
        return Config.getApiUrl({ 
          segment: 'setad', 
          endpoint: 'tenders/',
          params,
          noVersion: true
        });
      },
      detail: (id) => {
        return Config.getApiUrl({ 
          segment: 'setad', 
          endpoint: `tender/${id}/`,
          noVersion: true
        });
      },
      latest: (params = {}) => {
        return Config.getApiUrl({ 
          segment: 'setad', 
          endpoint: 'tenders/latest/',
          params,
          noVersion: true
        });
      },
      search: (params = {}) => {
        return Config.getApiUrl({ 
          segment: 'setad', 
          endpoint: 'search/',
          params,
          noVersion: true
        });
      },
      stats: () => {
        return Config.getApiUrl({ 
          segment: 'setad', 
          endpoint: 'stats/',
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

    // ============================================
    // ATTENDANCE (حضور و غیاب) - ✅ اضافه شده
    // ============================================
    attendance: {
      checkIn: () => {
        return Config.getApiUrl({
          segment: 'api/attendance',
          endpoint: 'check-in/',
          noVersion: true
        });
      },
      checkOut: () => {
        return Config.getApiUrl({
          segment: 'api/attendance',
          endpoint: 'check-out/',
          noVersion: true
        });
      },
      today: () => {
        return Config.getApiUrl({
          segment: 'api/attendance',
          endpoint: 'today/',
          noVersion: true
        });
      },
      history: (params = {}) => {
        return Config.getApiUrl({
          segment: 'api/attendance',
          endpoint: 'history/',
          params,
          noVersion: true
        });
      },
      stats: (params = {}) => {
        return Config.getApiUrl({
          segment: 'api/attendance',
          endpoint: 'stats/',
          params,
          noVersion: true
        });
      },
      myStats: () => {
        return Config.getApiUrl({
          segment: 'api/attendance',
          endpoint: 'my-stats/',
          noVersion: true
        });
      },
    },
  },
};

export default Config;