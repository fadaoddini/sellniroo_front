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
    // TOKEN
    // ============================================
    token: {
      obtain: () => `${Config.baseUrl}/api/token/`,
      refresh: () => `${Config.baseUrl}/api/token/refresh/`,
    },

    // ============================================
    // KARMANDAN (کارمندان)
    // ============================================
karmandan: {
  // ============================================
  // ✅ بررسی و دسترسی‌های کاربر
  // ============================================
  checkEmployee: () => {
    return Config.getApiUrl({
      segment: 'api/karmandan',
      endpoint: 'employees/check-employee/',
      noVersion: true
    });
  },
  myPermissions: () => {
    return Config.getApiUrl({
      segment: 'api/karmandan',
      endpoint: 'employees/my-permissions/',
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

  // ============================================
  // ✅ CRUD کارمندان
  // ============================================
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
  create: () => {
    return Config.getApiUrl({
      segment: 'api/karmandan',
      endpoint: 'employees/',
      noVersion: true
    });
  },
  update: (id) => {
    return Config.getApiUrl({
      segment: 'api/karmandan',
      endpoint: `employees/${id}/`,
      noVersion: true
    });
  },
  partialUpdate: (id) => {
    return Config.getApiUrl({
      segment: 'api/karmandan',
      endpoint: `employees/${id}/`,
      noVersion: true
    });
  },
  delete: (id) => {
    return Config.getApiUrl({
      segment: 'api/karmandan',
      endpoint: `employees/${id}/`,
      noVersion: true
    });
  },

  // ============================================
  // ✅ جستجو و آمار
  // ============================================
  search: (query) => {
    return Config.getApiUrl({
      segment: 'api/karmandan',
      endpoint: 'employees/search/',
      params: { q: query },
      noVersion: true
    });
  },
  stats: () => {
    return Config.getApiUrl({
      segment: 'api/karmandan',
      endpoint: 'employees/stats/',
      noVersion: true
    });
  },
  dashboardStats: () => {
    return Config.getApiUrl({
      segment: 'api/karmandan',
      endpoint: 'dashboard-stats/',
      noVersion: true
    });
  },

  // ============================================
  // ✅ اکشن‌های ویژه کارمندان
  // ============================================
  toggleActive: (id) => {
    return Config.getApiUrl({
      segment: 'api/karmandan',
      endpoint: `employees/${id}/toggle-active/`,
      noVersion: true
    });
  },
  searchUsers: (query) => {
    return Config.getApiUrl({
      segment: 'api/karmandan',
      endpoint: 'employees/search-users/',
      params: { q: query },
      noVersion: true
    });
  },

  // ============================================
  // ✅ لیدهای بازاریابی
  // ============================================
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
    partialUpdate: (id) => {
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

  // ============================================
  // ✅ درخواست‌های مرخصی
  // ============================================
  leaveRequests: {
    list: (params = {}) => {
      return Config.getApiUrl({
        segment: 'api/karmandan',
        endpoint: 'leave-requests/',
        params,
        noVersion: true
      });
    },
    detail: (id) => {
      return Config.getApiUrl({
        segment: 'api/karmandan',
        endpoint: `leave-requests/${id}/`,
        noVersion: true
      });
    },
    create: () => {
      return Config.getApiUrl({
        segment: 'api/karmandan',
        endpoint: 'leave-requests/',
        noVersion: true
      });
    },
    update: (id) => {
      return Config.getApiUrl({
        segment: 'api/karmandan',
        endpoint: `leave-requests/${id}/`,
        noVersion: true
      });
    },
    partialUpdate: (id) => {
      return Config.getApiUrl({
        segment: 'api/karmandan',
        endpoint: `leave-requests/${id}/`,
        noVersion: true
      });
    },
    delete: (id) => {
      return Config.getApiUrl({
        segment: 'api/karmandan',
        endpoint: `leave-requests/${id}/`,
        noVersion: true
      });
    },
    approve: (id) => {
      return Config.getApiUrl({
        segment: 'api/karmandan',
        endpoint: `leave-requests/${id}/approve/`,
        noVersion: true
      });
    },
    reject: (id) => {
      return Config.getApiUrl({
        segment: 'api/karmandan',
        endpoint: `leave-requests/${id}/reject/`,
        noVersion: true
      });
    },
    cancel: (id) => {
      return Config.getApiUrl({
        segment: 'api/karmandan',
        endpoint: `leave-requests/${id}/cancel/`,
        noVersion: true
      });
    },
    today: () => {
      return Config.getApiUrl({
        segment: 'api/karmandan',
        endpoint: 'leave-requests/today/',
        noVersion: true
      });
    },
    myRequests: (params = {}) => {
      return Config.getApiUrl({
        segment: 'api/karmandan',
        endpoint: 'leave-requests/my-requests/',
        params,
        noVersion: true
      });
    },
    stats: () => {
      return Config.getApiUrl({
        segment: 'api/karmandan',
        endpoint: 'leave-requests/stats/',
        noVersion: true
      });
    },
  },
},

    // ============================================
    // INVENTORY (انبار) - ✅ کامل و بروز شده
    // ============================================
    inventory: {
      // ---------- واحدهای اندازه‌گیری (Units) ----------
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
        roots: () => `${Config.baseUrl}/inventory/units/roots/`,
        tree: () => `${Config.baseUrl}/inventory/units/tree/`,
        children: (id) => `${Config.baseUrl}/inventory/units/${id}/children/`,
        allDescendants: (id) => `${Config.baseUrl}/inventory/units/${id}/all_descendants/`,
        breakdown: (unitId, quantity = 1) => 
          `${Config.baseUrl}/inventory/units/${unitId}/breakdown/?quantity=${quantity}`,
        breakdownFromChild: (unitId, quantity = 1) => 
          `${Config.baseUrl}/inventory/units/${unitId}/breakdown_from_child/?quantity=${quantity}`,
      },

      // ---------- دسته‌بندی کالاها (Categories) ----------
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

      // ---------- انبارها (Warehouses) ----------
      warehouses: {
        list: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/warehouses/${queryString ? '?' + queryString : ''}`;
        },
        detail: (id) => `${Config.baseUrl}/inventory/warehouses/${id}/`,
        create: () => `${Config.baseUrl}/inventory/warehouses/`,
        update: (id) => `${Config.baseUrl}/inventory/warehouses/${id}/`,
        delete: (id) => `${Config.baseUrl}/inventory/warehouses/${id}/`,
        stockItems: (id) => `${Config.baseUrl}/inventory/warehouses/${id}/stock_items/`,
        totalValue: (id) => `${Config.baseUrl}/inventory/warehouses/${id}/total_value/`,
      },

      // ---------- کالاها (Products) ----------
      products: {
        list: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/products/${queryString ? '?' + queryString : ''}`;
        },
        detail: (id) => `${Config.baseUrl}/inventory/products/${id}/`,
        create: () => `${Config.baseUrl}/inventory/products/`,
        update: (id) => `${Config.baseUrl}/inventory/products/${id}/`,
        delete: (id) => `${Config.baseUrl}/inventory/products/${id}/`,
        stockItems: (id) => `${Config.baseUrl}/inventory/products/${id}/stock_items/`,
        stockInUnit: (id, unitId) => {
          return `${Config.baseUrl}/inventory/products/${id}/stock_in_unit/?unit_id=${unitId}`;
        },
        transactions: (id) => `${Config.baseUrl}/inventory/products/${id}/transactions/`,
      },

      // ---------- موجودی کالا در انبار (Stock Items) ----------
      stockItems: {
        list: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/stock-items/${queryString ? '?' + queryString : ''}`;
        },
        detail: (id) => `${Config.baseUrl}/inventory/stock-items/${id}/`,
        update: (id) => `${Config.baseUrl}/inventory/stock-items/${id}/`,
        // متدهای اضافی برای موجودی در واحدهای مختلف
        getInUnit: (id, unitId) => {
          return `${Config.baseUrl}/inventory/stock-items/${id}/get_quantity_in_unit/?unit_id=${unitId}`;
        },
      },

      // ---------- تراکنش‌های انبار (Transactions) ----------
      transactions: {
        list: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/transactions/${queryString ? '?' + queryString : ''}`;
        },
        detail: (id) => `${Config.baseUrl}/inventory/transactions/${id}/`,
        create: () => `${Config.baseUrl}/inventory/transactions/`,
        update: (id) => `${Config.baseUrl}/inventory/transactions/${id}/`,
        delete: (id) => `${Config.baseUrl}/inventory/transactions/${id}/`,
        // ✅ ورود و خروج با واحدهای سلسله‌مراتبی
        addStock: () => `${Config.baseUrl}/inventory/transactions/add_stock/`,
        removeStock: () => `${Config.baseUrl}/inventory/transactions/remove_stock/`,
        confirm: (id) => `${Config.baseUrl}/inventory/transactions/${id}/confirm/`,
        cancel: (id) => `${Config.baseUrl}/inventory/transactions/${id}/cancel/`,
      },

      // ---------- افراد مجاز (Authorized Persons) ----------
      authorizedPersons: {
        list: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/authorized-persons/${queryString ? '?' + queryString : ''}`;
        },
        detail: (id) => `${Config.baseUrl}/inventory/authorized-persons/${id}/`,
        create: () => `${Config.baseUrl}/inventory/authorized-persons/`,
        update: (id) => `${Config.baseUrl}/inventory/authorized-persons/${id}/`,
        delete: (id) => `${Config.baseUrl}/inventory/authorized-persons/${id}/`,
        warehouses: (id) => `${Config.baseUrl}/inventory/authorized-persons/${id}/warehouses/`,
      },

      // ---------- هشدارهای موجودی (Alerts) ----------
      alerts: {
        list: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/alerts/${queryString ? '?' + queryString : ''}`;
        },
        detail: (id) => `${Config.baseUrl}/inventory/alerts/${id}/`,
        resolve: (id) => `${Config.baseUrl}/inventory/alerts/${id}/resolve/`,
        statistics: () => `${Config.baseUrl}/inventory/alerts/statistics/`,
      },

      // ---------- تاریخچه حرکات موجودی (Movements) ----------
      movements: {
        list: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/movements/${queryString ? '?' + queryString : ''}`;
        },
        detail: (id) => `${Config.baseUrl}/inventory/movements/${id}/`,
        byProduct: (productId, params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/movements/by_product/${productId}/${queryString ? '?' + queryString : ''}`;
        },
        byWarehouse: (warehouseId, params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/movements/by_warehouse/${warehouseId}/${queryString ? '?' + queryString : ''}`;
        },
      },

      // ---------- سرویس واحدهای سلسله‌مراتبی (Unit Inventory) ----------
      unitInventory: {
        // ✅ ورود کالا با واحد سلسله‌مراتبی
        receive: () => `${Config.baseUrl}/inventory/unit-inventory/receive/`,
        // ✅ خروج کالا با واحد سلسله‌مراتبی
        remove: () => `${Config.baseUrl}/inventory/unit-inventory/remove/`,
        // ✅ دریافت تفکیک واحد
        breakdown: (unitId, quantity = 1) => {
          return `${Config.baseUrl}/inventory/unit-inventory/breakdown/?unit_id=${unitId}&quantity=${quantity}`;
        },
        // ✅ دریافت موجودی بر حسب واحد مشخص
        stockInUnit: (productId, warehouseId, unitId) => {
          return `${Config.baseUrl}/inventory/unit-inventory/stock_in_unit/?product_id=${productId}&warehouse_id=${warehouseId}&unit_id=${unitId}`;
        },
      },

      // ---------- گزارشات (Reports) ----------
      reports: {
        // گزارش موجودی کل
        stock: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/reports/stock/${queryString ? '?' + queryString : ''}`;
        },
        // گزارش موجودی یک انبار خاص
        warehouseStock: (warehouseId, params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/reports/warehouse/${warehouseId}/${queryString ? '?' + queryString : ''}`;
        },
        // گزارش تراکنش‌ها
        transactions: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/reports/transactions/${queryString ? '?' + queryString : ''}`;
        },
        // خلاصه کلی
        summary: () => `${Config.baseUrl}/inventory/reports/summary/`,
        // گزارش خروجی‌ها
        outReport: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/reports/out/${queryString ? '?' + queryString : ''}`;
        },
        // گزارش ورودی‌ها
        inReport: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/reports/in/${queryString ? '?' + queryString : ''}`;
        },
        // گزارش موجودی کم
        lowStock: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/reports/low-stock/${queryString ? '?' + queryString : ''}`;
        },
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
// config/config.jsx - بخش news

news: {
  // ============================================
  // 🔹 اخبار
  // ============================================
  list: (params = {}) => {
    return Config.getApiUrl({
      segment: 'api',
      endpoint: 'news/',
      params,
      noVersion: true
    });
  },
  detail: (slug) => {
    return Config.getApiUrl({
      segment: 'api',
      endpoint: `news/${slug}/`,
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
  update: (slug) => {
    return Config.getApiUrl({
      segment: 'api',
      endpoint: `news/${slug}/`,
      noVersion: true
    });
  },
  delete: (slug) => {
    return Config.getApiUrl({
      segment: 'api',
      endpoint: `news/${slug}/`,
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
  latest: (limit = 10) => {
    return Config.getApiUrl({
      segment: 'api',
      endpoint: 'news/latest/',
      params: { limit },
      noVersion: true
    });
  },
  featured: (limit = 10) => {
    return Config.getApiUrl({
      segment: 'api',
      endpoint: 'news/featured/',
      params: { limit },
      noVersion: true
    });
  },
  breaking: (limit = 20) => {
    return Config.getApiUrl({
      segment: 'api',
      endpoint: 'news/breaking/',
      params: { limit },
      noVersion: true
    });
  },
  hot: (limit = 10) => {
    return Config.getApiUrl({
      segment: 'api',
      endpoint: 'news/hot/',
      params: { limit },
      noVersion: true
    });
  },
  popular: (limit = 10, days = 30) => {
    return Config.getApiUrl({
      segment: 'api',
      endpoint: 'news/popular/',
      params: { limit, days },
      noVersion: true
    });
  },
  view: (slug) => {
    return Config.getApiUrl({
      segment: 'api',
      endpoint: `news/${slug}/view/`,
      noVersion: true
    });
  },
  like: (slug) => {
    return Config.getApiUrl({
      segment: 'api',
      endpoint: `news/${slug}/like/`,
      noVersion: true
    });
  },
  share: (slug) => {
    return Config.getApiUrl({
      segment: 'api',
      endpoint: `news/${slug}/share/`,
      noVersion: true
    });
  },
  search: (query, category = null) => {
    const params = { q: query };
    if (category) params.category = category;
    return Config.getApiUrl({
      segment: 'api',
      endpoint: 'news/search/',
      params,
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

  // ============================================
  // 🔹 کامنت‌ها
  // ============================================
  comments: (newsId, params = {}) => {
    const queryString = new URLSearchParams({ ...params, news: newsId }).toString();
    return Config.getApiUrl({
      segment: 'api',
      endpoint: `comments/${queryString ? '?' + queryString : ''}`,
      noVersion: true
    });
  },
  addComment: () => {
    return Config.getApiUrl({
      segment: 'api',
      endpoint: 'comments/',
      noVersion: true
    });
  },
  commentDetail: (id) => {
    return Config.getApiUrl({
      segment: 'api',
      endpoint: `comments/${id}/`,
      noVersion: true
    });
  },
  likeComment: (commentId) => {
    return Config.getApiUrl({
      segment: 'api',
      endpoint: `comments/${commentId}/like/`,
      noVersion: true
    });
  },
  deleteComment: (commentId) => {
    return Config.getApiUrl({
      segment: 'api',
      endpoint: `comments/${commentId}/`,
      noVersion: true
    });
  },
  approveComment: (commentId) => {
    return Config.getApiUrl({
      segment: 'api',
      endpoint: `comments/${commentId}/approve/`,
      noVersion: true
    });
  },
  rejectComment: (commentId) => {
    return Config.getApiUrl({
      segment: 'api',
      endpoint: `comments/${commentId}/reject/`,
      noVersion: true
    });
  },
  pendingComments: () => {
    return Config.getApiUrl({
      segment: 'api',
      endpoint: 'comments/pending/',
      noVersion: true
    });
  },
  commentStats: () => {
    return Config.getApiUrl({
      segment: 'api',
      endpoint: 'comments/stats/',
      noVersion: true
    });
  },

  sendToPlatforms: (slug) => {
    return Config.getApiUrl({
      segment: 'api',
      endpoint: `news/${slug}/send-to-platforms/`,
      noVersion: true
    });
  },

  // اگر خواستی جداگانه هم داشته باشی:
  sendToBale: (slug) => {
    return Config.getApiUrl({
      segment: 'api',
      endpoint: `news/${slug}/send-to-bale/`,
      noVersion: true
    });
  },
  sendToRubika: (slug) => {
    return Config.getApiUrl({
      segment: 'api',
      endpoint: `news/${slug}/send-to-rubika/`,
      noVersion: true
    });
  },


  // ============================================
  // 🔹 ویدیوها
  // ============================================
  videos: (params = {}) => {
    return Config.getApiUrl({
      segment: 'api',
      endpoint: 'videos/',
      params,
      noVersion: true
    });
  },
  videoDetail: (id) => {
    return Config.getApiUrl({
      segment: 'api',
      endpoint: `videos/${id}/`,
      noVersion: true
    });
  },
},



    // ============================================
    // SUBSIDIARIES (شرکت‌های زیرمجموعه) - ✅ اضافه شود
    // ============================================
    subsidiaries: {
      // دریافت لیست شرکت‌ها با تنظیمات
      list: (params = {}) => {
        return Config.getApiUrl({ 
          segment: 'api', 
          endpoint: 'subsidiaries/',
          params,
          noVersion: true
        });
      },
      
      // دریافت شرکت‌های فعال با تنظیمات بخش
      active: (params = {}) => {
        return Config.getApiUrl({ 
          segment: 'api', 
          endpoint: 'subsidiaries/active_subsidiaries/',
          params,
          noVersion: true
        });
      },
      
      // دریافت جزئیات یک شرکت
      detail: (id) => {
        return Config.getApiUrl({ 
          segment: 'api', 
          endpoint: `subsidiaries/${id}/`,
          noVersion: true
        });
      },
      
      // ایجاد شرکت جدید (فقط ادمین)
      create: () => {
        return Config.getApiUrl({ 
          segment: 'api', 
          endpoint: 'subsidiaries/',
          noVersion: true
        });
      },
      
      // بروزرسانی شرکت (فقط ادمین)
      update: (id) => {
        return Config.getApiUrl({ 
          segment: 'api', 
          endpoint: `subsidiaries/${id}/`,
          noVersion: true
        });
      },
      
      // حذف شرکت (فقط ادمین)
      delete: (id) => {
        return Config.getApiUrl({ 
          segment: 'api', 
          endpoint: `subsidiaries/${id}/`,
          noVersion: true
        });
      },
      
      // ===== مدیریت اعضا =====
      members: {
        // افزودن عضو به شرکت
        add: (subsidiaryId) => {
          return Config.getApiUrl({ 
            segment: 'api', 
            endpoint: `subsidiaries/${subsidiaryId}/add_member/`,
            noVersion: true
          });
        },
        
        // بروزرسانی عضو
        update: (subsidiaryId) => {
          return Config.getApiUrl({ 
            segment: 'api', 
            endpoint: `subsidiaries/${subsidiaryId}/update_member/`,
            noVersion: true
          });
        },
        
        // حذف عضو
        remove: (subsidiaryId) => {
          return Config.getApiUrl({ 
            segment: 'api', 
            endpoint: `subsidiaries/${subsidiaryId}/remove_member/`,
            noVersion: true
          });
        },
        
        // بروزرسانی ترتیب اعضا
        updateOrder: (subsidiaryId) => {
          return Config.getApiUrl({ 
            segment: 'api', 
            endpoint: `subsidiaries/${subsidiaryId}/update_members_order/`,
            noVersion: true
          });
        },
      },
      
      // ===== تنظیمات بخش =====
      settings: {
        // دریافت تنظیمات فعال
        active: (params = {}) => {
          return Config.getApiUrl({ 
            segment: 'api', 
            endpoint: 'subsidiary-settings/active_settings/',
            params,
            noVersion: true
          });
        },
        
        // دریافت لیست تنظیمات
        list: (params = {}) => {
          return Config.getApiUrl({ 
            segment: 'api', 
            endpoint: 'subsidiary-settings/',
            params,
            noVersion: true
          });
        },
        
        // بروزرسانی تنظیمات
        update: (id) => {
          return Config.getApiUrl({ 
            segment: 'api', 
            endpoint: `subsidiary-settings/${id}/`,
            noVersion: true
          });
        },
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
    // ATTENDANCE (حضور و غیاب)
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

    // ============================================
    // AI AGENT
    // ============================================
    ai: {
      chat: () => {
        return Config.getApiUrl({
          segment: 'api/ai',
          endpoint: 'chat/',
          noVersion: true
        });
      },
      chatStream: () => {
        return Config.getApiUrl({
          segment: 'api/ai',
          endpoint: 'chat/stream/',
          noVersion: true
        });
      },
      knowledge: {
        list: (params = {}) => {
          return Config.getApiUrl({
            segment: 'api/ai',
            endpoint: 'knowledge/',
            params,
            noVersion: true
          });
        },
        detail: (id) => {
          return Config.getApiUrl({
            segment: 'api/ai',
            endpoint: `knowledge/${id}/`,
            noVersion: true
          });
        },
        upload: () => {
          return Config.getApiUrl({
            segment: 'api/ai',
            endpoint: 'knowledge/upload/',
            noVersion: true
          });
        },
        delete: (id) => {
          return Config.getApiUrl({
            segment: 'api/ai',
            endpoint: `knowledge/${id}/`,
            noVersion: true
          });
        },
        process: (docId) => {
          return Config.getApiUrl({
            segment: 'api/ai',
            endpoint: `knowledge/${docId}/process/`,
            noVersion: true
          });
        },
        clear: () => {
          return Config.getApiUrl({
            segment: 'api/ai',
            endpoint: 'knowledge/clear/',
            noVersion: true
          });
        },
        stats: () => {
          return Config.getApiUrl({
            segment: 'api/ai',
            endpoint: 'knowledge/stats/',
            noVersion: true
          });
        },
      },
      // مسیرهای مدیریتی ادمین
      admin: {
        processDocument: (docId) => {
          return Config.getApiUrl({
            segment: 'admin',
            endpoint: `process-document/${docId}/`,
            noVersion: true
          });
        },
        deleteDocument: (docId) => {
          return Config.getApiUrl({
            segment: 'admin',
            endpoint: `delete-document/${docId}/`,
            noVersion: true
          });
        },
        clearAllKnowledge: () => {
          return Config.getApiUrl({
            segment: 'admin',
            endpoint: 'clear-all-knowledge/',
            noVersion: true
          });
        },
        deleteDocumentRecord: (docId) => {
          return Config.getApiUrl({
            segment: 'admin',
            endpoint: `delete-document-record/${docId}/`,
            noVersion: true
          });
        },
      },
    },

    // ============================================
    // TREE CHART
    // ============================================
    tree: {
      list: (params = {}) => {
        return Config.getApiUrl({
          segment: 'api/tree',
          endpoint: 'nodes/',
          params,
          noVersion: true
        });
      },
      detail: (id) => {
        return Config.getApiUrl({
          segment: 'api/tree',
          endpoint: `nodes/${id}/`,
          noVersion: true
        });
      },
      create: () => {
        return Config.getApiUrl({
          segment: 'api/tree',
          endpoint: 'nodes/',
          noVersion: true
        });
      },
      update: (id) => {
        return Config.getApiUrl({
          segment: 'api/tree',
          endpoint: `nodes/${id}/`,
          noVersion: true
        });
      },
      delete: (id) => {
        return Config.getApiUrl({
          segment: 'api/tree',
          endpoint: `nodes/${id}/`,
          noVersion: true
        });
      },
      tree: () => {
        return Config.getApiUrl({
          segment: 'api/tree',
          endpoint: 'tree/',
          noVersion: true
        });
      },
    },

    // ============================================
    // ✅ JOBISELL (سیستم آگهی‌های شغلی)
    // ============================================
    jobisell: {
      // ---------- Lookup (فیلترها) ----------
      filterOptions: () => `${Config.baseUrl}/api/jobisell/jobs/filter_options/`,

      provinces: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `${Config.baseUrl}/api/jobisell/provinces/${qs ? '?' + qs : ''}`;
      },
      cities: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `${Config.baseUrl}/api/jobisell/cities/${qs ? '?' + qs : ''}`;
      },
      neighborhoods: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `${Config.baseUrl}/api/jobisell/neighborhoods/${qs ? '?' + qs : ''}`;
      },
      cooperationTypes: () => `${Config.baseUrl}/api/jobisell/cooperation-types/`,
      categories: () => `${Config.baseUrl}/api/jobisell/categories/`,
      jobTitles: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `${Config.baseUrl}/api/jobisell/job-titles/${qs ? '?' + qs : ''}`;
      },
      educationLevels: () => `${Config.baseUrl}/api/jobisell/education-levels/`,
      experienceLevels: () => `${Config.baseUrl}/api/jobisell/experience-levels/`,
      genders: () => `${Config.baseUrl}/api/jobisell/genders/`,
      salaryRanges: () => `${Config.baseUrl}/api/jobisell/salary-ranges/`,
      features: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `${Config.baseUrl}/api/jobisell/features/${qs ? '?' + qs : ''}`;
      },
      tags: () => `${Config.baseUrl}/api/jobisell/tags/`,
      companies: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `${Config.baseUrl}/api/jobisell/companies/${qs ? '?' + qs : ''}`;
      },
      sortOptions: () => `${Config.baseUrl}/api/jobisell/sort-options/`,

      // ---------- آگهی‌ها ----------
      jobs: {
        list: (params = {}) => {
          const qs = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/api/jobisell/jobs/${qs ? '?' + qs : ''}`;
        },
        detail: (id) => `${Config.baseUrl}/api/jobisell/jobs/${id}/`,
        create: () => `${Config.baseUrl}/api/jobisell/jobs/`,
        update: (id) => `${Config.baseUrl}/api/jobisell/jobs/${id}/`,
        partialUpdate: (id) => `${Config.baseUrl}/api/jobisell/jobs/${id}/`,
        delete: (id) => `${Config.baseUrl}/api/jobisell/jobs/${id}/`,

        latest: (limit = 10) =>
          `${Config.baseUrl}/api/jobisell/jobs/latest/?limit=${limit}`,
        featured: (limit = 10) =>
          `${Config.baseUrl}/api/jobisell/jobs/featured/?limit=${limit}`,
        hiring: (params = {}) => {
          const qs = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/api/jobisell/jobs/hiring/${qs ? '?' + qs : ''}`;
        },
        seeking: (params = {}) => {
          const qs = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/api/jobisell/jobs/seeking/${qs ? '?' + qs : ''}`;
        },
        search: (q) =>
          `${Config.baseUrl}/api/jobisell/jobs/search/?q=${encodeURIComponent(q)}`,
        stats: () => `${Config.baseUrl}/api/jobisell/jobs/stats/`,
        myListings: () => `${Config.baseUrl}/api/jobisell/jobs/my_listings/`,
        myApplications: () => `${Config.baseUrl}/api/jobisell/jobs/my_applications/`,
        myBookmarks: () => `${Config.baseUrl}/api/jobisell/jobs/my_bookmarks/`,

        like: (id) => `${Config.baseUrl}/api/jobisell/jobs/${id}/like/`,
        bookmark: (id) => `${Config.baseUrl}/api/jobisell/jobs/${id}/bookmark/`,
        apply: (id) => `${Config.baseUrl}/api/jobisell/jobs/${id}/apply/`,
      },

      // ---------- درخواست‌ها ----------
      applications: {
        list: (params = {}) => {
          const qs = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/api/jobisell/applications/${qs ? '?' + qs : ''}`;
        },
        detail: (id) => `${Config.baseUrl}/api/jobisell/applications/${id}/`,
        changeStatus: (id) => `${Config.baseUrl}/api/jobisell/applications/${id}/change_status/`,
      },

      // ---------- فیلترها (ادمین) ----------
      filterConfigs: () => `${Config.baseUrl}/api/jobisell/filter-configs/`,
    },

    // ============================================
    // GALLERY
    // ============================================
    gallery: {
      list: (params = {}) => {
        return Config.getApiUrl({
          segment: 'api/gallery',
          endpoint: 'images/',
          params,
          noVersion: true
        });
      },
      detail: (id) => {
        return Config.getApiUrl({
          segment: 'api/gallery',
          endpoint: `images/${id}/`,
          noVersion: true
        });
      },
      create: () => {
        return Config.getApiUrl({
          segment: 'api/gallery',
          endpoint: 'images/',
          noVersion: true
        });
      },
      update: (id) => {
        return Config.getApiUrl({
          segment: 'api/gallery',
          endpoint: `images/${id}/`,
          noVersion: true
        });
      },
      delete: (id) => {
        return Config.getApiUrl({
          segment: 'api/gallery',
          endpoint: `images/${id}/`,
          noVersion: true
        });
      },
      categories: () => {
        return Config.getApiUrl({
          segment: 'api/gallery',
          endpoint: 'categories/',
          noVersion: true
        });
      },
    },

    // ============================================
    // STORY
    // ============================================
    story: {
      list: (params = {}) => {
        return Config.getApiUrl({
          segment: 'api',
          endpoint: 'stories/',
          params,
          noVersion: true
        });
      },
      detail: (id) => {
        return Config.getApiUrl({
          segment: 'api',
          endpoint: `stories/${id}/`,
          noVersion: true
        });
      },
      create: () => {
        return Config.getApiUrl({
          segment: 'api',
          endpoint: 'stories/',
          noVersion: true
        });
      },
      update: (id) => {
        return Config.getApiUrl({
          segment: 'api',
          endpoint: `stories/${id}/`,
          noVersion: true
        });
      },
      delete: (id) => {
        return Config.getApiUrl({
          segment: 'api',
          endpoint: `stories/${id}/`,
          noVersion: true
        });
      },
      latest: (limit = 10) => {
        return Config.getApiUrl({
          segment: 'api',
          endpoint: 'stories/latest/',
          params: { limit },
          noVersion: true
        });
      },
    },
  },
};

export default Config;