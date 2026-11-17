// config/config.jsx

/** آدرس API لوکال — :8001 مربوط به تنظیم قدیمی/اشتباه است و باید به :8000 برگردد */
function resolveApiBaseUrl() {
  const raw = String(
    process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
  ).trim()
  return raw
    .replace(/\/$/, '')
    .replace(/^(https?:\/\/(?:localhost|127\.0\.0\.1)):8001(?=\/|$)/i, '$1:8000')
}

const Config = {
  baseUrl: resolveApiBaseUrl(),

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
    
    const cleanParams = {};
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      cleanParams[key] = value;
    });
    const queryString = new URLSearchParams(cleanParams).toString();
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
  search: (query, extra = {}) => {
    return Config.getApiUrl({
      segment: 'api/karmandan',
      endpoint: 'employees/search/',
      params: { q: query, ...extra },
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
  lookupMobile: (mobile) => {
    return Config.getApiUrl({
      segment: 'api/karmandan',
      endpoint: 'employees/lookup-mobile/',
      params: { mobile },
      noVersion: true
    });
  },
  saleAccessList: () => {
    return Config.getApiUrl({
      segment: 'api/karmandan',
      endpoint: 'employees/sale-access/',
      noVersion: true
    });
  },
  setSaleAccess: (id) => {
    return Config.getApiUrl({
      segment: 'api/karmandan',
      endpoint: `employees/${id}/sale-access/`,
      noVersion: true
    });
  },
  saleCompanies: {
    list: () =>
      Config.getApiUrl({
        segment: 'api/karmandan',
        endpoint: 'sale-companies/',
        noVersion: true,
      }),
    detail: (id) =>
      Config.getApiUrl({
        segment: 'api/karmandan',
        endpoint: `sale-companies/${id}/`,
        noVersion: true,
      }),
  },
  saleInvoices: {
    list: (params = {}) =>
      Config.getApiUrl({
        segment: 'api/karmandan',
        endpoint: 'sale-invoices/',
        params,
        noVersion: true,
      }),
    detail: (id) =>
      Config.getApiUrl({
        segment: 'api/karmandan',
        endpoint: `sale-invoices/${id}/`,
        noVersion: true,
      }),
    nextNumber: (docType, companyId) =>
      Config.getApiUrl({
        segment: 'api/karmandan',
        endpoint: 'sale-invoices/next-number/',
        params: {
          doc_type: docType,
          ...(companyId ? { company: companyId } : {}),
        },
        noVersion: true,
      }),
  },
  saleCatalog: {
    list: (params = {}) =>
      Config.getApiUrl({
        segment: 'api/karmandan',
        endpoint: 'sale-catalog/',
        params,
        noVersion: true,
      }),
    detail: (id) =>
      Config.getApiUrl({
        segment: 'api/karmandan',
        endpoint: `sale-catalog/${id}/`,
        noVersion: true,
      }),
  },

  departments: {
    list: (params = {}) => Config.getApiUrl({
      segment: 'api/karmandan',
      endpoint: 'departments/',
      params,
      noVersion: true
    }),
    create: () => Config.getApiUrl({
      segment: 'api/karmandan',
      endpoint: 'departments/',
      noVersion: true
    }),
    update: (id) => Config.getApiUrl({
      segment: 'api/karmandan',
      endpoint: `departments/${id}/`,
      noVersion: true
    }),
    delete: (id) => Config.getApiUrl({
      segment: 'api/karmandan',
      endpoint: `departments/${id}/`,
      noVersion: true
    }),
  },

  // ============================================
  // ✅ لیدهای بازاریابی
  // ============================================
  leads: {
    teamAnalytics: (params = {}) =>
      Config.getApiUrl({
        segment: 'api/karmandan',
        endpoint: 'leads/team-analytics/',
        params,
        noVersion: true,
      }),
    employeeActivity: (params = {}) =>
      Config.getApiUrl({
        segment: 'api/karmandan',
        endpoint: 'leads/employee-activity/',
        params,
        noVersion: true,
      }),
    pathMonitor: (params = {}) =>
      Config.getApiUrl({
        segment: 'api/karmandan',
        endpoint: 'leads/path-monitor/',
        params,
        noVersion: true,
      }),
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
    assignableStaff: () =>
      Config.getApiUrl({
        segment: 'api/karmandan',
        endpoint: 'leads/assignable-staff/',
        noVersion: true,
      }),
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
    archived: (params = {}) =>
      Config.getApiUrl({
        segment: 'api/karmandan',
        endpoint: 'leads/archived/',
        params,
        noVersion: true,
      }),
    archive: (leadId) =>
      Config.getApiUrl({
        segment: 'api/karmandan',
        endpoint: `leads/${leadId}/archive/`,
        noVersion: true,
      }),
    unarchive: (leadId) =>
      Config.getApiUrl({
        segment: 'api/karmandan',
        endpoint: `leads/${leadId}/unarchive/`,
        noVersion: true,
      }),
  },

  // ============================================
  // ✅ یادآور پیامک پیگیری فروش
  // ============================================
  followupSmsConfig: () =>
    Config.getApiUrl({
      segment: 'api/notifications',
      endpoint: 'followup-sms-config/',
      noVersion: true,
    }),

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
        reverse: (id) => `${Config.baseUrl}/inventory/transactions/${id}/reverse/`,
        archive: (id) => `${Config.baseUrl}/inventory/transactions/${id}/archive/`,
        unarchive: (id) => `${Config.baseUrl}/inventory/transactions/${id}/unarchive/`,
        dailyReport: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/reports/transactions/${queryString ? '?' + queryString : ''}`;
        },
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
        homeDashboard: (params = {}) => {
          const queryString = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/inventory/reports/home-dashboard/${queryString ? '?' + queryString : ''}`;
        },
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
      types: (params = {}) => {
        return Config.getApiUrl({
          segment: 'api/requser',
          endpoint: 'types/',
          params,
          noVersion: true,
        });
      },
      typeDetail: (id) => {
        return Config.getApiUrl({
          segment: 'api/requser',
          endpoint: `types/${id}/`,
          noVersion: true,
        });
      },
      typeToggleActive: (id) => {
        return Config.getApiUrl({
          segment: 'api/requser',
          endpoint: `types/${id}/toggle-active/`,
          noVersion: true,
        });
      },
      typesSeed: () => {
        return Config.getApiUrl({
          segment: 'api/requser',
          endpoint: 'types/seed/',
          noVersion: true,
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
  detail: (idOrSlug) => {
    const key = encodeURIComponent(String(idOrSlug || '').trim());
    return Config.getApiUrl({
      segment: 'api',
      endpoint: `news/${key}/`,
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
  /** ارسال مطلب توسط مخاطب (در انتظار تایید) */
  contribute: () => {
    return Config.getApiUrl({
      segment: 'api',
      endpoint: 'news/contribute/',
      noVersion: true
    });
  },
  /** مطالب ارسالی کاربر عضو */
  myContributions: () => {
    return Config.getApiUrl({
      segment: 'api',
      endpoint: 'news/my-contributions/',
      noVersion: true
    });
  },
  update: (idOrSlug) => {
    const key = encodeURIComponent(String(idOrSlug || '').trim());
    return Config.getApiUrl({
      segment: 'api',
      endpoint: `news/${key}/`,
      noVersion: true
    });
  },
  delete: (idOrSlug) => {
    const key = encodeURIComponent(String(idOrSlug || '').trim());
    return Config.getApiUrl({
      segment: 'api',
      endpoint: `news/${key}/`,
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
  tickers: {
    list: (params = {}) => Config.getApiUrl({
      segment: 'api',
      endpoint: 'tickers/',
      params,
      noVersion: true
    }),
    active: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'tickers/active/',
      noVersion: true
    }),
    create: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'tickers/',
      noVersion: true
    }),
    update: (id) => Config.getApiUrl({
      segment: 'api',
      endpoint: `tickers/${id}/`,
      noVersion: true
    }),
    delete: (id) => Config.getApiUrl({
      segment: 'api',
      endpoint: `tickers/${id}/`,
      noVersion: true
    }),
    toggleActive: (id) => Config.getApiUrl({
      segment: 'api',
      endpoint: `tickers/${id}/toggle-active/`,
      noVersion: true
    }),
  },
  headerMenu: {
    list: (params = {}) => Config.getApiUrl({
      segment: 'api',
      endpoint: 'header-menu/',
      params,
      noVersion: true
    }),
    reorder: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'header-menu/reorder/',
      noVersion: true
    }),
    active: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'header-menu/active/',
      noVersion: true
    }),
    create: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'header-menu/',
      noVersion: true
    }),
    update: (id) => Config.getApiUrl({
      segment: 'api',
      endpoint: `header-menu/${id}/`,
      noVersion: true
    }),
    delete: (id) => Config.getApiUrl({
      segment: 'api',
      endpoint: `header-menu/${id}/`,
      noVersion: true
    }),
    toggleActive: (id) => Config.getApiUrl({
      segment: 'api',
      endpoint: `header-menu/${id}/toggle-active/`,
      noVersion: true
    }),
  },
  menuLists: {
    list: (params = {}) => Config.getApiUrl({
      segment: 'api',
      endpoint: 'menu-lists/',
      params,
      noVersion: true
    }),
    get: (slug) => Config.getApiUrl({
      segment: 'api',
      endpoint: `menu-lists/${slug}/`,
      noVersion: true
    }),
    create: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'menu-lists/',
      noVersion: true
    }),
    update: (slug) => Config.getApiUrl({
      segment: 'api',
      endpoint: `menu-lists/${slug}/`,
      noVersion: true
    }),
    delete: (slug) => Config.getApiUrl({
      segment: 'api',
      endpoint: `menu-lists/${slug}/`,
      noVersion: true
    }),
  },
  menuListItems: {
    list: (params = {}) => Config.getApiUrl({
      segment: 'api',
      endpoint: 'menu-list-items/',
      params,
      noVersion: true
    }),
    create: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'menu-list-items/',
      noVersion: true
    }),
    update: (id) => Config.getApiUrl({
      segment: 'api',
      endpoint: `menu-list-items/${id}/`,
      noVersion: true
    }),
    delete: (id) => Config.getApiUrl({
      segment: 'api',
      endpoint: `menu-list-items/${id}/`,
      noVersion: true
    }),
  },
  corporateAppearance: {
    get: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'corporate-appearance/',
      noVersion: true
    }),
    update: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'corporate-appearance/update/',
      noVersion: true
    }),
  },
  heroSlides: {
    list: (params = {}) => Config.getApiUrl({
      segment: 'api',
      endpoint: 'hero-slides/',
      params,
      noVersion: true
    }),
    active: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'hero-slides/active/',
      noVersion: true
    }),
    create: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'hero-slides/',
      noVersion: true
    }),
    update: (id) => Config.getApiUrl({
      segment: 'api',
      endpoint: `hero-slides/${id}/`,
      noVersion: true
    }),
    delete: (id) => Config.getApiUrl({
      segment: 'api',
      endpoint: `hero-slides/${id}/`,
      noVersion: true
    }),
    toggleActive: (id) => Config.getApiUrl({
      segment: 'api',
      endpoint: `hero-slides/${id}/toggle-active/`,
      noVersion: true
    }),
  },
  siteSettings: {
    get: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'site-settings/',
      noVersion: true
    }),
    update: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'site-settings/update/',
      noVersion: true
    }),
  },
  siteBackup: {
    create: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'site-backup/',
      noVersion: true
    }),
  },
  about: {
    get: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'about/',
      noVersion: true
    }),
    update: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'about/update/',
      noVersion: true
    }),
  },
  topicPacks: {
    list: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'topic-packs/',
      noVersion: true,
    }),
    apply: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'topic-packs/apply/',
      noVersion: true,
    }),
    snapshot: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'topic-packs/snapshot/',
      noVersion: true,
    }),
    ownerSystems: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'topic-packs/owner-systems/',
      noVersion: true,
    }),
    buildBackend: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'topic-packs/build-backend/',
      noVersion: true,
    }),
    buildBackendPreview: (pack) => Config.getApiUrl({
      segment: 'api',
      endpoint: `topic-packs/build-backend/?pack=${encodeURIComponent(pack || '')}`,
      noVersion: true,
    }),
    buildBackendFile: (pack) => Config.getApiUrl({
      segment: 'api',
      endpoint: `topic-packs/build-backend/?pack=${encodeURIComponent(pack || '')}&download=1`,
      noVersion: true,
    }),
  },
  siteFactory: {
    suggest: (domain) => Config.getApiUrl({
      segment: 'api',
      endpoint: `site-factory/suggest/?domain=${encodeURIComponent(domain || '')}`,
      noVersion: true,
    }),
    provision: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'site-factory/provision/',
      noVersion: true,
    }),
    provisionStatus: (id) => Config.getApiUrl({
      segment: 'api',
      endpoint: `site-factory/provision/${id}/`,
      noVersion: true,
    }),
    ssl: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'site-factory/ssl/',
      noVersion: true,
    }),
    sslStatus: (id) => Config.getApiUrl({
      segment: 'api',
      endpoint: `site-factory/ssl/${id}/`,
      noVersion: true,
    }),
    sites: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'site-factory/sites/',
      noVersion: true,
    }),
    siteStatus: (siteId) => Config.getApiUrl({
      segment: 'api',
      endpoint: `site-factory/sites/${encodeURIComponent(siteId || '')}/status/`,
      noVersion: true,
    }),
    siteUpdate: (siteId) => Config.getApiUrl({
      segment: 'api',
      endpoint: `site-factory/sites/${encodeURIComponent(siteId || '')}/update/`,
      noVersion: true,
    }),
    updateStatus: (id) => Config.getApiUrl({
      segment: 'api',
      endpoint: `site-factory/update/${id}/`,
      noVersion: true,
    }),
  },
  git: {
    overview: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'git/overview/',
      noVersion: true,
    }),
    status: (repo) => Config.getApiUrl({
      segment: 'api',
      endpoint: `git/status/?repo=${encodeURIComponent(repo || '')}`,
      noVersion: true,
    }),
    add: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'git/add/',
      noVersion: true,
    }),
    commit: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'git/commit/',
      noVersion: true,
    }),
    push: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'git/push/',
      noVersion: true,
    }),
    update: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'git/update/',
      noVersion: true,
    }),
    packPublish: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'git/pack-publish/',
      noVersion: true,
    }),
  },
  siteModules: {
    list: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'site-modules/',
      noVersion: true,
    }),
    map: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'site-modules/map/',
      noVersion: true,
    }),
    toggle: (key) => Config.getApiUrl({
      segment: 'api',
      endpoint: `site-modules/${key}/toggle/`,
      noVersion: true,
    }),
    update: (key) => Config.getApiUrl({
      segment: 'api',
      endpoint: `site-modules/${key}/`,
      noVersion: true,
    }),
    reorderHome: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'site-modules/reorder-home/',
      noVersion: true,
    }),
  },
  localSettings: {
    get: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'platform/local-settings/',
      noVersion: true,
    }),
    save: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'platform/local-settings/',
      noVersion: true,
    }),
  },
  platformConnections: {
    list: () => Config.getApiUrl({
      segment: 'api',
      endpoint: 'platform-connections/',
      noVersion: true,
    }),
    detail: (platform) => Config.getApiUrl({
      segment: 'api',
      endpoint: `platform-connections/${platform}/`,
      noVersion: true,
    }),
    test: (platform) => Config.getApiUrl({
      segment: 'api',
      endpoint: `platform-connections/${platform}/test/`,
      noVersion: true,
    }),
    toggleEnabled: (platform) => Config.getApiUrl({
      segment: 'api',
      endpoint: `platform-connections/${platform}/toggle-enabled/`,
      noVersion: true,
    }),
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
  view: (idOrSlug) => {
    const key = encodeURIComponent(String(idOrSlug || '').trim());
    return Config.getApiUrl({
      segment: 'api',
      endpoint: `news/${key}/view/`,
      noVersion: true
    });
  },
  like: (idOrSlug) => {
    const key = encodeURIComponent(String(idOrSlug || '').trim());
    return Config.getApiUrl({
      segment: 'api',
      endpoint: `news/${key}/like/`,
      noVersion: true
    });
  },
  share: (idOrSlug) => {
    const key = encodeURIComponent(String(idOrSlug || '').trim());
    return Config.getApiUrl({
      segment: 'api',
      endpoint: `news/${key}/share/`,
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
    // RASAD (رصد علاقه استانی)
    // ============================================
    todo: {
      tasks: (params = {}) =>
        Config.getApiUrl({
          segment: 'api/todo',
          endpoint: 'tasks/',
          params,
          noVersion: true,
        }),
      task: (id) =>
        Config.getApiUrl({
          segment: 'api/todo',
          endpoint: `tasks/${id}/`,
          noVersion: true,
        }),
      board: (params = {}) =>
        Config.getApiUrl({
          segment: 'api/todo',
          endpoint: 'tasks/board/',
          params,
          noVersion: true,
        }),
      stats: () =>
        Config.getApiUrl({
          segment: 'api/todo',
          endpoint: 'tasks/stats/',
          noVersion: true,
        }),
      assignees: () =>
        Config.getApiUrl({
          segment: 'api/todo',
          endpoint: 'tasks/assignees/',
          noVersion: true,
        }),
      archived: () =>
        Config.getApiUrl({
          segment: 'api/todo',
          endpoint: 'tasks/archived/',
          noVersion: true,
        }),
      move: (id) =>
        Config.getApiUrl({
          segment: 'api/todo',
          endpoint: `tasks/${id}/move/`,
          noVersion: true,
        }),
      assign: (id) =>
        Config.getApiUrl({
          segment: 'api/todo',
          endpoint: `tasks/${id}/assign/`,
          noVersion: true,
        }),
      archive: (id) =>
        Config.getApiUrl({
          segment: 'api/todo',
          endpoint: `tasks/${id}/archive/`,
          noVersion: true,
        }),
      unarchive: (id) =>
        Config.getApiUrl({
          segment: 'api/todo',
          endpoint: `tasks/${id}/unarchive/`,
          noVersion: true,
        }),
      comments: (id) =>
        Config.getApiUrl({
          segment: 'api/todo',
          endpoint: `tasks/${id}/comments/`,
          noVersion: true,
        }),
      reports: (id) =>
        Config.getApiUrl({
          segment: 'api/todo',
          endpoint: `tasks/${id}/reports/`,
          noVersion: true,
        }),
      reviewReport: (taskId, reportId) =>
        Config.getApiUrl({
          segment: 'api/todo',
          endpoint: `tasks/${taskId}/reports/${reportId}/review/`,
          noVersion: true,
        }),
    },

    rasad: {
      provinces: (params = {}) => {
        return Config.getApiUrl({
          segment: 'rasad',
          endpoint: 'provinces/',
          params,
          noVersion: true,
        });
      },
      search: () => {
        return Config.getApiUrl({
          segment: 'rasad',
          endpoint: 'search/',
          noVersion: true,
        });
      },
      refresh: () => {
        return Config.getApiUrl({
          segment: 'rasad',
          endpoint: 'refresh/',
          noVersion: true,
        });
      },
      worldStats: () => {
        return Config.getApiUrl({
          segment: 'rasad',
          endpoint: 'world-stats/',
          noVersion: true,
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
      trackView: (id) => {
        return Config.getApiUrl({
          segment: 'api',
          endpoint: `v1/video-archive/${id}/view/`,
          noVersion: true
        });
      },
      settings: () => {
        return Config.getApiUrl({
          segment: 'api',
          endpoint: 'v1/video-archive/settings/',
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
    // CATALOG FLIPBOOK
    // ============================================
    catalog: {
      bundle: () => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/catalog/',
        noVersion: true,
      }),
      settings: () => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/catalog/settings/',
        noVersion: true,
      }),
      pages: (params = {}) => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/catalog/pages/',
        params,
        noVersion: true,
      }),
      page: (id) => Config.getApiUrl({
        segment: 'api',
        endpoint: `v1/catalog/pages/${id}/`,
        noVersion: true,
      }),
      reorder: () => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/catalog/pages/reorder/',
        noVersion: true,
      }),
      upload: () => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/catalog/upload/',
        noVersion: true,
      }),
    },

    // ============================================
    // QUIZ MODULE
    // ============================================
    quiz: {
      bundle: (params = {}) => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/quiz/',
        params,
        noVersion: true,
      }),
      settings: () => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/quiz/settings/',
        noVersion: true,
      }),
      specialties: (params = {}) => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/quiz/specialties/',
        params,
        noVersion: true,
      }),
      specialty: (id) => Config.getApiUrl({
        segment: 'api',
        endpoint: `v1/quiz/specialties/${id}/`,
        noVersion: true,
      }),
      questions: (params = {}) => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/quiz/questions/',
        params,
        noVersion: true,
      }),
      question: (id) => Config.getApiUrl({
        segment: 'api',
        endpoint: `v1/quiz/questions/${id}/`,
        noVersion: true,
      }),
      start: () => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/quiz/start/',
        noVersion: true,
      }),
      submit: () => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/quiz/submit/',
        noVersion: true,
      }),
      leaderboard: (params = {}) => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/quiz/leaderboard/',
        params,
        noVersion: true,
      }),
      scores: (params = {}) => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/quiz/scores/',
        params,
        noVersion: true,
      }),
      my: (params = {}) => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/quiz/my/',
        params,
        noVersion: true,
      }),
    },

    // ============================================
    // FAQ MODULE
    // ============================================
    // ============================================
    // NOBAT — نوبت‌دهی
    // ============================================
    nobat: {
      bundle: () => Config.getApiUrl({
        segment: 'api/nobat', endpoint: 'v1/bundle/', noVersion: true,
      }),
      availability: (params = {}) => Config.getApiUrl({
        segment: 'api/nobat', endpoint: 'v1/availability/', params, noVersion: true,
      }),
      book: () => Config.getApiUrl({
        segment: 'api/nobat', endpoint: 'v1/book/', noVersion: true,
      }),
      lookup: (params = {}) => Config.getApiUrl({
        segment: 'api/nobat', endpoint: 'v1/lookup/', params, noVersion: true,
      }),
      settings: () => Config.getApiUrl({
        segment: 'api/nobat', endpoint: 'v1/settings/', noVersion: true,
      }),
      categories: () => Config.getApiUrl({
        segment: 'api/nobat', endpoint: 'v1/categories/', noVersion: true,
      }),
      category: (id) => Config.getApiUrl({
        segment: 'api/nobat', endpoint: `v1/categories/${id}/`, noVersion: true,
      }),
      services: (params = {}) => Config.getApiUrl({
        segment: 'api/nobat', endpoint: 'v1/services/', params, noVersion: true,
      }),
      service: (id) => Config.getApiUrl({
        segment: 'api/nobat', endpoint: `v1/services/${id}/`, noVersion: true,
      }),
      staff: (params = {}) => Config.getApiUrl({
        segment: 'api/nobat', endpoint: 'v1/staff/', params, noVersion: true,
      }),
      staffMember: (id) => Config.getApiUrl({
        segment: 'api/nobat', endpoint: `v1/staff/${id}/`, noVersion: true,
      }),
      schedules: (params = {}) => Config.getApiUrl({
        segment: 'api/nobat', endpoint: 'v1/schedules/', params, noVersion: true,
      }),
      schedule: (id) => Config.getApiUrl({
        segment: 'api/nobat', endpoint: `v1/schedules/${id}/`, noVersion: true,
      }),
      exceptions: () => Config.getApiUrl({
        segment: 'api/nobat', endpoint: 'v1/exceptions/', noVersion: true,
      }),
      exception: (id) => Config.getApiUrl({
        segment: 'api/nobat', endpoint: `v1/exceptions/${id}/`, noVersion: true,
      }),
      appointments: (params = {}) => Config.getApiUrl({
        segment: 'api/nobat', endpoint: 'v1/appointments/', params, noVersion: true,
      }),
      appointment: (id) => Config.getApiUrl({
        segment: 'api/nobat', endpoint: `v1/appointments/${id}/`, noVersion: true,
      }),
      accounting: (params = {}) => Config.getApiUrl({
        segment: 'api/nobat', endpoint: 'v1/accounting/', params, noVersion: true,
      }),
      staffSettle: (id) => Config.getApiUrl({
        segment: 'api/nobat', endpoint: `v1/staff/${id}/settle/`, noVersion: true,
      }),
      staffAdjust: (id) => Config.getApiUrl({
        segment: 'api/nobat', endpoint: `v1/staff/${id}/adjust/`, noVersion: true,
      }),
    },

    faq: {
      bundle: (params = {}) => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/faq/',
        params,
        noVersion: true,
      }),
      settings: () => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/faq/settings/',
        noVersion: true,
      }),
      categories: (params = {}) => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/faq/categories/',
        params,
        noVersion: true,
      }),
      category: (id) => Config.getApiUrl({
        segment: 'api',
        endpoint: `v1/faq/categories/${id}/`,
        noVersion: true,
      }),
      items: (params = {}) => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/faq/items/',
        params,
        noVersion: true,
      }),
      item: (id) => Config.getApiUrl({
        segment: 'api',
        endpoint: `v1/faq/items/${id}/`,
        noVersion: true,
      }),
    },

    curvedTimeline: {
      bundle: () => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/curved-timeline/',
        noVersion: true,
      }),
      settings: () => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/curved-timeline/settings/',
        noVersion: true,
      }),
      steps: (params = {}) => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/curved-timeline/steps/',
        params,
        noVersion: true,
      }),
      step: (id) => Config.getApiUrl({
        segment: 'api',
        endpoint: `v1/curved-timeline/steps/${id}/`,
        noVersion: true,
      }),
    },

    // ============================================
    // REPAIRS — تعمیرات و سرویس
    // ============================================
    repairs: {
      config: () => Config.getApiUrl({
        segment: 'api', endpoint: 'v1/repairs/config/', noVersion: true,
      }),
      request: () => Config.getApiUrl({
        segment: 'api', endpoint: 'v1/repairs/request/', noVersion: true,
      }),
      lookup: (params = {}) => Config.getApiUrl({
        segment: 'api', endpoint: 'v1/repairs/lookup/', params, noVersion: true,
      }),
      my: () => Config.getApiUrl({
        segment: 'api', endpoint: 'v1/repairs/my/', noVersion: true,
      }),
      myReminderRespond: (id) => Config.getApiUrl({
        segment: 'api', endpoint: `v1/repairs/my/reminders/${id}/`, noVersion: true,
      }),
      techMe: () => Config.getApiUrl({
        segment: 'api', endpoint: 'v1/repairs/tech/me/', noVersion: true,
      }),
      techJobs: (params = {}) => Config.getApiUrl({
        segment: 'api', endpoint: 'v1/repairs/tech/jobs/', params, noVersion: true,
      }),
      techJob: (id) => Config.getApiUrl({
        segment: 'api', endpoint: `v1/repairs/tech/jobs/${id}/`, noVersion: true,
      }),
      techJobProposals: (id) => Config.getApiUrl({
        segment: 'api', endpoint: `v1/repairs/tech/jobs/${id}/proposals/`, noVersion: true,
      }),
      techShopProducts: (params = {}) => Config.getApiUrl({
        segment: 'api', endpoint: 'v1/repairs/tech/shop-products/', params, noVersion: true,
      }),
      track: (token) => Config.getApiUrl({
        segment: 'api', endpoint: `v1/repairs/track/${token}/`, noVersion: true,
      }),
      trackRate: (token) => Config.getApiUrl({
        segment: 'api', endpoint: `v1/repairs/track/${token}/rate/`, noVersion: true,
      }),
      pay: (token) => Config.getApiUrl({
        segment: 'api', endpoint: `v1/repairs/track/${token}/pay/`, noVersion: true,
      }),
      proposalAction: (token, id) => Config.getApiUrl({
        segment: 'api',
        endpoint: `v1/repairs/track/${token}/proposals/${id}/`,
        noVersion: true,
      }),
      manageSettings: () => Config.getApiUrl({
        segment: 'api', endpoint: 'v1/repairs/manage/settings/', noVersion: true,
      }),
      manageBundle: () => Config.getApiUrl({
        segment: 'api', endpoint: 'v1/repairs/manage/bundle/', noVersion: true,
      }),
      manageTechnicians: () => Config.getApiUrl({
        segment: 'api', endpoint: 'v1/repairs/manage/technicians/', noVersion: true,
      }),
      manageTechnician: (id) => Config.getApiUrl({
        segment: 'api', endpoint: `v1/repairs/manage/technicians/${id}/`, noVersion: true,
      }),
      manageUsers: (params = {}) => Config.getApiUrl({
        segment: 'api', endpoint: 'v1/repairs/manage/users/', params, noVersion: true,
      }),
      manageLaborRates: () => Config.getApiUrl({
        segment: 'api', endpoint: 'v1/repairs/manage/labor-rates/', noVersion: true,
      }),
      manageLaborRate: (id) => Config.getApiUrl({
        segment: 'api', endpoint: `v1/repairs/manage/labor-rates/${id}/`, noVersion: true,
      }),
      manageParts: () => Config.getApiUrl({
        segment: 'api', endpoint: 'v1/repairs/manage/parts/', noVersion: true,
      }),
      managePart: (id) => Config.getApiUrl({
        segment: 'api', endpoint: `v1/repairs/manage/parts/${id}/`, noVersion: true,
      }),
      manageJobs: (params = {}) => Config.getApiUrl({
        segment: 'api', endpoint: 'v1/repairs/manage/jobs/', params, noVersion: true,
      }),
      manageJob: (id) => Config.getApiUrl({
        segment: 'api', endpoint: `v1/repairs/manage/jobs/${id}/`, noVersion: true,
      }),
      manageJobReport: (id) => Config.getApiUrl({
        segment: 'api', endpoint: `v1/repairs/manage/jobs/${id}/report/`, noVersion: true,
      }),
      manageJobProposals: (id) => Config.getApiUrl({
        segment: 'api', endpoint: `v1/repairs/manage/jobs/${id}/proposals/`, noVersion: true,
      }),
      manageProposal: (id) => Config.getApiUrl({
        segment: 'api', endpoint: `v1/repairs/manage/proposals/${id}/`, noVersion: true,
      }),
      manageShopProducts: (params = {}) => Config.getApiUrl({
        segment: 'api', endpoint: 'v1/repairs/manage/shop-products/', params, noVersion: true,
      }),
      managePayments: (params = {}) => Config.getApiUrl({
        segment: 'api', endpoint: 'v1/repairs/manage/payments/', params, noVersion: true,
      }),
      confirmPayment: (id) => Config.getApiUrl({
        segment: 'api', endpoint: `v1/repairs/manage/payments/${id}/confirm/`, noVersion: true,
      }),
      manageProposals: (params = {}) => Config.getApiUrl({
        segment: 'api', endpoint: 'v1/repairs/manage/proposals/', params, noVersion: true,
      }),
      reminders: (params = {}) => Config.getApiUrl({
        segment: 'api', endpoint: 'v1/repairs/manage/reminders/', params, noVersion: true,
      }),
      accounting: (params = {}) => Config.getApiUrl({
        segment: 'api', endpoint: 'v1/repairs/manage/accounting/', params, noVersion: true,
      }),
      manageExpenses: (params = {}) => Config.getApiUrl({
        segment: 'api', endpoint: 'v1/repairs/manage/expenses/', params, noVersion: true,
      }),
      manageExpense: (id) => Config.getApiUrl({
        segment: 'api', endpoint: `v1/repairs/manage/expenses/${id}/`, noVersion: true,
      }),
    },

    // ============================================
    // CLOUD SERVER — سرور ابری اشتراکی
    // ============================================
    reboOrders: {
      config: () => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/rebo-orders/config/',
        noVersion: true,
      }),
      my: () => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/rebo-orders/my/',
        noVersion: true,
      }),
      checkout: () => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/rebo-orders/checkout/',
        noVersion: true,
      }),
      manageOrders: (params = {}) => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/rebo-orders/manage/orders/',
        params,
        noVersion: true,
      }),
      manageOrderAction: (id) => Config.getApiUrl({
        segment: 'api',
        endpoint: `v1/rebo-orders/manage/orders/${id}/action/`,
        noVersion: true,
      }),
      manageSettings: () => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/rebo-orders/manage/settings/',
        noVersion: true,
      }),
      manageStats: () => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/rebo-orders/manage/stats/',
        noVersion: true,
      }),
    },

    // ============================================
    // REBO LEARN — آموزش‌های اختصاصی ربو
    // ============================================
    reboLearn: {
      bundle: (params = {}) => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/rebolearn/',
        params,
        noVersion: true,
      }),
      lesson: (slug) => Config.getApiUrl({
        segment: 'api',
        endpoint: `v1/rebolearn/lessons/${slug}/`,
        noVersion: true,
      }),
      manageLessons: () => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/rebolearn/manage/lessons/',
        noVersion: true,
      }),
      manageLesson: (id) => Config.getApiUrl({
        segment: 'api',
        endpoint: `v1/rebolearn/manage/lessons/${id}/`,
        noVersion: true,
      }),
    },

    cloudServer: {
      config: () => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/cloud-server/config/',
        noVersion: true,
      }),
      my: () => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/cloud-server/my/',
        noVersion: true,
      }),
      myLedger: () => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/cloud-server/my/ledger/',
        noVersion: true,
      }),
      myTopups: () => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/cloud-server/my/topups/',
        noVersion: true,
      }),
      manageSettings: () => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/cloud-server/manage/settings/',
        noVersion: true,
      }),
      manageSubscriptions: (params = {}) => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/cloud-server/manage/subscriptions/',
        params,
        noVersion: true,
      }),
      manageSubscription: (id) => Config.getApiUrl({
        segment: 'api',
        endpoint: `v1/cloud-server/manage/subscriptions/${id}/`,
        noVersion: true,
      }),
      manageTopups: (params = {}) => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/cloud-server/manage/topups/',
        params,
        noVersion: true,
      }),
      manageTopupAction: (id) => Config.getApiUrl({
        segment: 'api',
        endpoint: `v1/cloud-server/manage/topups/${id}/action/`,
        noVersion: true,
      }),
      manageStats: () => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/cloud-server/manage/stats/',
        noVersion: true,
      }),
      runBilling: () => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/cloud-server/manage/run-billing/',
        noVersion: true,
      }),
    },

    // ============================================
    // SOFTAPPS — نرم‌افزارهای کاربردی
    // ============================================
    softapps: {
      list: (params = {}) => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/softapps/',
        params,
        noVersion: true,
      }),
      my: () => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/softapps/my/',
        noVersion: true,
      }),
      detail: (slug) => Config.getApiUrl({
        segment: 'api',
        endpoint: `v1/softapps/${slug}/`,
        noVersion: true,
      }),
      purchase: (id) => Config.getApiUrl({
        segment: 'api',
        endpoint: `v1/softapps/${id}/purchase/`,
        noVersion: true,
      }),
      download: (id) => Config.getApiUrl({
        segment: 'api',
        endpoint: `v1/softapps/${id}/download/`,
        noVersion: true,
      }),
      manageApps: () => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/softapps/manage/apps/',
        noVersion: true,
      }),
      manageApp: (id) => Config.getApiUrl({
        segment: 'api',
        endpoint: `v1/softapps/manage/apps/${id}/`,
        noVersion: true,
      }),
      manageCategories: () => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/softapps/manage/categories/',
        noVersion: true,
      }),
      manageCategory: (id) => Config.getApiUrl({
        segment: 'api',
        endpoint: `v1/softapps/manage/categories/${id}/`,
        noVersion: true,
      }),
      accounting: (params = {}) => Config.getApiUrl({
        segment: 'api',
        endpoint: 'v1/softapps/manage/accounting/',
        params,
        noVersion: true,
      }),
    },

    // ============================================
    // SCHOOL MODULE
    // ============================================
    school: {
      me: () => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/me/', noVersion: true }),
      settings: () => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/settings/', noVersion: true }),
      overview: () => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/overview/', noVersion: true }),
      tree: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/tree/', params, noVersion: true }),
      upload: () => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/upload/', noVersion: true }),
      teachers: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/teachers/', params, noVersion: true }),
      teacher: (id) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/teachers/${id}/`, noVersion: true }),
      teacherMe: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/teachers/me/', params, noVersion: true }),
      teacherPublic: (slug) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/teachers/public/${encodeURIComponent(slug)}/`, noVersion: true }),
      counselors: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/counselors/', params, noVersion: true }),
      counselor: (id) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/counselors/${id}/`, noVersion: true }),
      counselorMe: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/counselors/me/', params, noVersion: true }),
      counselorPublic: (slug) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/counselors/public/${encodeURIComponent(slug)}/`, noVersion: true }),
      counselorDashboard: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/dashboard/counselor/', params, noVersion: true }),
      counselingTests: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/counseling/tests/', params, noVersion: true }),
      counselingTest: (id) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/counseling/tests/${id}/`, noVersion: true }),
      counselingTestStart: () => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/counseling/tests/start/', noVersion: true }),
      counselingTestSubmit: () => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/counseling/tests/submit/', noVersion: true }),
      counselingAttempts: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/counseling/attempts/', params, noVersion: true }),
      counselingAvailableTests: () => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/counseling/available-tests/', noVersion: true }),
      counselingFiles: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/counseling/files/', params, noVersion: true }),
      counselingFile: (id) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/counseling/files/${id}/`, noVersion: true }),
      counselingFileByStudent: (studentId) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/counseling/files/student/${studentId}/`, noVersion: true }),
      counselingNotes: () => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/counseling/notes/', noVersion: true }),
      counselingTeacherFiles: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/counseling/teacher-files/', params, noVersion: true }),
      counselingTeacherFile: (id) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/counseling/teacher-files/${id}/`, noVersion: true }),
      counselingFileByTeacher: (teacherId) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/counseling/teacher-files/teacher/${teacherId}/`, noVersion: true }),
      counselingTeacherNotes: () => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/counseling/teacher-notes/', noVersion: true }),
      students: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/students/', params, noVersion: true }),
      studentsLookup: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/students/lookup/', params, noVersion: true }),
      student: (id) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/students/${id}/`, noVersion: true }),
      studentSnapshot: (id, params = {}) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/students/${id}/snapshot/`, params, noVersion: true }),
      subjects: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/subjects/', params, noVersion: true }),
      subject: (id) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/subjects/${id}/`, noVersion: true }),
      chapters: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/chapters/', params, noVersion: true }),
      chapter: (id) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/chapters/${id}/`, noVersion: true }),
      lessons: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/lessons/', params, noVersion: true }),
      lesson: (id) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/lessons/${id}/`, noVersion: true }),
      attachments: () => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/attachments/', noVersion: true }),
      attachment: (id) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/attachments/${id}/`, noVersion: true }),
      exercises: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/exercises/', params, noVersion: true }),
      exercise: (id) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/exercises/${id}/`, noVersion: true }),
      exerciseSubmit: (id) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/exercises/${id}/submit/`, noVersion: true }),
      submissions: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/submissions/', params, noVersion: true }),
      submissionReview: (id) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/submissions/${id}/review/`, noVersion: true }),
      submissionArchive: (id) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/submissions/${id}/archive/`, noVersion: true }),
      quizzes: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/quizzes/', params, noVersion: true }),
      quiz: (id) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/quizzes/${id}/`, noVersion: true }),
      quizQuestions: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/quiz-questions/', params, noVersion: true }),
      quizQuestion: (id) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/quiz-questions/${id}/`, noVersion: true }),
      quizStart: () => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/quiz/start/', noVersion: true }),
      quizSubmit: () => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/quiz/submit/', noVersion: true }),
      quizAttempts: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/quiz/attempts/', params, noVersion: true }),
      bankQuestions: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/bank-questions/', params, noVersion: true }),
      bankQuestion: (id) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/bank-questions/${id}/`, noVersion: true }),
      bankAvailability: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/bank-availability/', params, noVersion: true }),
      exams: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/exams/', params, noVersion: true }),
      exam: (id) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/exams/${id}/`, noVersion: true }),
      examStart: () => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/exam/start/', noVersion: true }),
      examSubmit: () => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/exam/submit/', noVersion: true }),
      examPapers: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/exam-papers/', params, noVersion: true }),
      examPaper: (id) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/exam-papers/${id}/`, noVersion: true }),
      examPaperArchive: (id) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/exam-papers/${id}/archive/`, noVersion: true }),
      teacherDashboard: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/dashboard/teacher/', params, noVersion: true }),
      studentDashboard: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/dashboard/student/', params, noVersion: true }),
      attendanceSessions: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/attendance/sessions/', params, noVersion: true }),
      attendanceSession: (id) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/attendance/sessions/${id}/`, noVersion: true }),
      attendanceMark: (id) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/attendance/sessions/${id}/mark/`, noVersion: true }),
      attendanceToday: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/attendance/today/', params, noVersion: true }),
      attendanceStats: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/attendance/stats/', params, noVersion: true }),
      attendanceStudent: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/attendance/student/', params, noVersion: true }),
      attendanceOverview: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/attendance/overview/', params, noVersion: true }),
      classes: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/classes/', params, noVersion: true }),
      schoolClass: (id) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/classes/${id}/`, noVersion: true }),
      classStudents: (id) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/classes/${id}/students/`, noVersion: true }),
      classTimetable: (id) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/classes/${id}/timetable/`, noVersion: true }),
      periods: () => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/periods/', noVersion: true }),
      period: (id) => Config.getApiUrl({ segment: 'api', endpoint: `v1/school/periods/${id}/`, noVersion: true }),
      myTimetable: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/timetable/mine/', params, noVersion: true }),
      reportCardSheet: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/report-card/sheet/', params, noVersion: true }),
      reportCardBulk: () => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/report-card/bulk/', noVersion: true }),
      reportCardMine: (params = {}) => Config.getApiUrl({ segment: 'api', endpoint: 'v1/school/report-card/mine/', params, noVersion: true }),
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
      provinceDetail: (id) => `${Config.baseUrl}/api/jobisell/provinces/${id}/`,
      cities: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `${Config.baseUrl}/api/jobisell/cities/${qs ? '?' + qs : ''}`;
      },
      cityDetail: (id) => `${Config.baseUrl}/api/jobisell/cities/${id}/`,
      neighborhoods: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `${Config.baseUrl}/api/jobisell/neighborhoods/${qs ? '?' + qs : ''}`;
      },
      neighborhoodDetail: (id) =>
        `${Config.baseUrl}/api/jobisell/neighborhoods/${id}/`,
      cooperationTypes: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `${Config.baseUrl}/api/jobisell/cooperation-types/${qs ? '?' + qs : ''}`;
      },
      cooperationTypeDetail: (id) =>
        `${Config.baseUrl}/api/jobisell/cooperation-types/${id}/`,
      categories: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `${Config.baseUrl}/api/jobisell/categories/${qs ? '?' + qs : ''}`;
      },
      categoryDetail: (id) => `${Config.baseUrl}/api/jobisell/categories/${id}/`,
      jobTitles: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `${Config.baseUrl}/api/jobisell/job-titles/${qs ? '?' + qs : ''}`;
      },
      jobTitleDetail: (id) => `${Config.baseUrl}/api/jobisell/job-titles/${id}/`,
      educationLevels: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `${Config.baseUrl}/api/jobisell/education-levels/${qs ? '?' + qs : ''}`;
      },
      educationLevelDetail: (id) =>
        `${Config.baseUrl}/api/jobisell/education-levels/${id}/`,
      experienceLevels: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `${Config.baseUrl}/api/jobisell/experience-levels/${qs ? '?' + qs : ''}`;
      },
      experienceLevelDetail: (id) =>
        `${Config.baseUrl}/api/jobisell/experience-levels/${id}/`,
      genders: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `${Config.baseUrl}/api/jobisell/genders/${qs ? '?' + qs : ''}`;
      },
      genderDetail: (id) => `${Config.baseUrl}/api/jobisell/genders/${id}/`,
      salaryRanges: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `${Config.baseUrl}/api/jobisell/salary-ranges/${qs ? '?' + qs : ''}`;
      },
      salaryRangeDetail: (id) =>
        `${Config.baseUrl}/api/jobisell/salary-ranges/${id}/`,
      features: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `${Config.baseUrl}/api/jobisell/features/${qs ? '?' + qs : ''}`;
      },
      featureDetail: (id) => `${Config.baseUrl}/api/jobisell/features/${id}/`,
      tags: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `${Config.baseUrl}/api/jobisell/tags/${qs ? '?' + qs : ''}`;
      },
      tagDetail: (id) => `${Config.baseUrl}/api/jobisell/tags/${id}/`,
      companies: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `${Config.baseUrl}/api/jobisell/companies/${qs ? '?' + qs : ''}`;
      },
      companyDetail: (id) => `${Config.baseUrl}/api/jobisell/companies/${id}/`,
      companyBySlug: (slug) =>
        `${Config.baseUrl}/api/jobisell/companies/by-slug/${encodeURIComponent(slug)}/`,
      sortOptions: () => `${Config.baseUrl}/api/jobisell/sort-options/`,

      // ---------- آگهی‌ها ----------
      jobs: {
        list: (params = {}) => {
          const qs = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/api/jobisell/jobs/${qs ? '?' + qs : ''}`;
        },
        detail: (idOrSlug) =>
          `${Config.baseUrl}/api/jobisell/jobs/${encodeURIComponent(String(idOrSlug))}/`,
        create: () => `${Config.baseUrl}/api/jobisell/jobs/`,
        update: (id) => `${Config.baseUrl}/api/jobisell/jobs/${encodeURIComponent(String(id))}/`,
        partialUpdate: (id) =>
          `${Config.baseUrl}/api/jobisell/jobs/${encodeURIComponent(String(id))}/`,
        delete: (id) =>
          `${Config.baseUrl}/api/jobisell/jobs/${encodeURIComponent(String(id))}/`,

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
        myStats: () => `${Config.baseUrl}/api/jobisell/jobs/my-stats/`,

        myListings: () => `${Config.baseUrl}/api/jobisell/jobs/my_listings/`,
        myApplications: () => `${Config.baseUrl}/api/jobisell/jobs/my_applications/`,
        myBookmarks: () => `${Config.baseUrl}/api/jobisell/jobs/my_bookmarks/`,

        like: (id) => `${Config.baseUrl}/api/jobisell/jobs/${id}/like/`,
        bookmark: (id) => `${Config.baseUrl}/api/jobisell/jobs/${id}/bookmark/`,
        apply: (id) => `${Config.baseUrl}/api/jobisell/jobs/${id}/apply/`,

        adminStats: () => `${Config.baseUrl}/api/jobisell/jobs/admin-stats/`,
        approve: (id) => `${Config.baseUrl}/api/jobisell/jobs/${id}/approve/`,
        reject: (id) => `${Config.baseUrl}/api/jobisell/jobs/${id}/reject/`,
        toggleFeatured: (id) => `${Config.baseUrl}/api/jobisell/jobs/${id}/toggle-featured/`,
        toggleActive: (id) => `${Config.baseUrl}/api/jobisell/jobs/${id}/toggle-active/`,
        setStatus: (id) => `${Config.baseUrl}/api/jobisell/jobs/${id}/set-status/`,
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

      // ---------- داده‌های پایه (مالک پلتفرم / adminweb) ----------
      baseData: {
        status: () => `${Config.baseUrl}/api/jobisell/base-data/`,
        import: () => `${Config.baseUrl}/api/jobisell/base-data/import/`,
        replaceJobTitles: () =>
          `${Config.baseUrl}/api/jobisell/base-data/replace-job-titles/`,
        replaceCategories: () =>
          `${Config.baseUrl}/api/jobisell/base-data/replace-categories/`,
      },
      // ---------- شرکت من (My Company) ----------  ⬅️ اینجا داخل jobisell
  myCompany: {
  get: () => `${Config.baseUrl}/api/jobisell/my-company/`,
  create: () => `${Config.baseUrl}/api/jobisell/my-company/`,
  update: () => `${Config.baseUrl}/api/jobisell/my-company/`,
  requestVerification: () =>
    `${Config.baseUrl}/api/jobisell/my-company/request-verification/`,
  verificationStatus: () =>
    `${Config.baseUrl}/api/jobisell/my-company/verification-status/`,
  
  // ✅ جدید
  uploadDocuments: () =>
    `${Config.baseUrl}/api/jobisell/my-company/upload-documents/`,
  deleteDocument: (docId) =>
    `${Config.baseUrl}/api/jobisell/my-company/delete-document/${docId}/`,
},

  // ---------- درخواست‌های صحت‌سنجی ----------
  verificationRequests: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return `${Config.baseUrl}/api/jobisell/verification-requests/${qs ? '?' + qs : ''}`;
    },
    detail: (id) => `${Config.baseUrl}/api/jobisell/verification-requests/${id}/`,
    approve: (id) => `${Config.baseUrl}/api/jobisell/verification-requests/${id}/approve/`,
    reject: (id) => `${Config.baseUrl}/api/jobisell/verification-requests/${id}/reject/`,
  },

        // ---------- رزومه من ----------
      myResume: {
        get: () => `${Config.baseUrl}/api/jobisell/resumes/my/`,
        create: () => `${Config.baseUrl}/api/jobisell/resumes/my/`,
        update: () => `${Config.baseUrl}/api/jobisell/resumes/my/`,
        publish: () => `${Config.baseUrl}/api/jobisell/resumes/my/publish/`,
        unpublish: () => `${Config.baseUrl}/api/jobisell/resumes/my/unpublish/`,
      },

      // ---------- بخش‌های رزومه ----------
      resumeSections: {
        workExperiences: {
          list: () => `${Config.baseUrl}/api/jobisell/resume/work-experiences/`,
          detail: (id) => `${Config.baseUrl}/api/jobisell/resume/work-experiences/${id}/`,
        },
        educations: {
          list: () => `${Config.baseUrl}/api/jobisell/resume/educations/`,
          detail: (id) => `${Config.baseUrl}/api/jobisell/resume/educations/${id}/`,
        },
        skills: {
          list: () => `${Config.baseUrl}/api/jobisell/resume/skills/`,
          detail: (id) => `${Config.baseUrl}/api/jobisell/resume/skills/${id}/`,
        },
        languages: {
          list: () => `${Config.baseUrl}/api/jobisell/resume/languages/`,
          detail: (id) => `${Config.baseUrl}/api/jobisell/resume/languages/${id}/`,
        },
        certificates: {
          list: () => `${Config.baseUrl}/api/jobisell/resume/certificates/`,
          detail: (id) => `${Config.baseUrl}/api/jobisell/resume/certificates/${id}/`,
        },
        projects: {
          list: () => `${Config.baseUrl}/api/jobisell/resume/projects/`,
          detail: (id) => `${Config.baseUrl}/api/jobisell/resume/projects/${id}/`,
        },
        awards: {
          list: () => `${Config.baseUrl}/api/jobisell/resume/awards/`,
          detail: (id) => `${Config.baseUrl}/api/jobisell/resume/awards/${id}/`,
        },
        interests: {
          list: () => `${Config.baseUrl}/api/jobisell/resume/interests/`,
          detail: (id) => `${Config.baseUrl}/api/jobisell/resume/interests/${id}/`,
        },
      },

      // ---------- رزومه عمومی ----------
      publicResume: {
        detail: (slug) => `${Config.baseUrl}/api/jobisell/resumes/${slug}/`,
        download: (slug) => `${Config.baseUrl}/api/jobisell/resumes/${slug}/download/`,
      },

      // ---------- مدیریت رزومه (مدیر) ----------
      resumesManage: {
        list: (params = {}) => {
          const qs = new URLSearchParams(params).toString();
          return `${Config.baseUrl}/api/jobisell/resumes-manage/${qs ? '?' + qs : ''}`;
        },
        detail: (id) => `${Config.baseUrl}/api/jobisell/resumes-manage/${id}/`,
        setStatus: (id) =>
          `${Config.baseUrl}/api/jobisell/resumes-manage/${id}/set-status/`,
      },
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
    // SHOP (فروشگاه)
    // ============================================
    shop: {
      products: (params = {}) =>
        Config.getApiUrl({
          segment: 'api/shop',
          endpoint: 'v1/products/',
          params,
          noVersion: true,
        }),
      productDetail: (id) =>
        Config.getApiUrl({
          segment: 'api/shop',
          endpoint: `v1/products/${id}/`,
          noVersion: true,
        }),
      widgets: (params = {}) =>
        Config.getApiUrl({
          segment: 'api/shop',
          endpoint: 'v1/widgets/',
          params,
          noVersion: true,
        }),
      categories: () =>
        Config.getApiUrl({
          segment: 'api/shop',
          endpoint: 'v1/categories/',
          noVersion: true,
        }),
      shops: () =>
        Config.getApiUrl({
          segment: 'api/shop',
          endpoint: 'v1/shops/',
          noVersion: true,
        }),
      adminProducts: (params = {}) =>
        Config.getApiUrl({
          segment: 'api/shop',
          endpoint: 'v1/admin/products/',
          params,
          noVersion: true,
        }),
      adminProductDetail: (id) =>
        Config.getApiUrl({
          segment: 'api/shop',
          endpoint: `v1/admin/products/${id}/`,
          noVersion: true,
        }),
      ownerMe: () =>
        Config.getApiUrl({
          segment: 'api/shop',
          endpoint: 'v1/owner/me/',
          noVersion: true,
        }),
      ownerDashboard: () =>
        Config.getApiUrl({
          segment: 'api/shop',
          endpoint: 'v1/owner/dashboard/',
          noVersion: true,
        }),
      ownerProducts: (params = {}) =>
        Config.getApiUrl({
          segment: 'api/shop',
          endpoint: 'v1/owner/products/',
          params,
          noVersion: true,
        }),
      ownerProductDetail: (id) =>
        Config.getApiUrl({
          segment: 'api/shop',
          endpoint: `v1/owner/products/${id}/`,
          noVersion: true,
        }),
      ownerProductImages: (id) =>
        Config.getApiUrl({
          segment: 'api/shop',
          endpoint: `v1/owner/products/${id}/images/`,
          noVersion: true,
        }),
      ownerProductImageDetail: (id, imageId) =>
        Config.getApiUrl({
          segment: 'api/shop',
          endpoint: `v1/owner/products/${id}/images/${imageId}/`,
          noVersion: true,
        }),
      ownerProductMedia: (id) =>
        Config.getApiUrl({
          segment: 'api/shop',
          endpoint: `v1/owner/products/${id}/media/`,
          noVersion: true,
        }),
      ownerCategories: (params = {}) =>
        Config.getApiUrl({
          segment: 'api/shop',
          endpoint: 'v1/owner/categories/',
          params,
          noVersion: true,
        }),
      ownerCategoryDetail: (id) =>
        Config.getApiUrl({
          segment: 'api/shop',
          endpoint: `v1/owner/categories/${id}/`,
          noVersion: true,
        }),
      platformOverview: () =>
        Config.getApiUrl({
          segment: 'api/shop',
          endpoint: 'v1/platform/overview/',
          noVersion: true,
        }),
      platformShops: (params = {}) =>
        Config.getApiUrl({
          segment: 'api/shop',
          endpoint: 'v1/platform/shops/',
          params,
          noVersion: true,
        }),
      platformShopDetail: (id) =>
        Config.getApiUrl({
          segment: 'api/shop',
          endpoint: `v1/platform/shops/${id}/`,
          noVersion: true,
        }),
      platformProducts: (params = {}) =>
        Config.getApiUrl({
          segment: 'api/shop',
          endpoint: 'v1/platform/products/',
          params,
          noVersion: true,
        }),
      platformProductDetail: (id) =>
        Config.getApiUrl({
          segment: 'api/shop',
          endpoint: `v1/platform/products/${id}/`,
          noVersion: true,
        }),
      platformProductImages: (id) =>
        Config.getApiUrl({
          segment: 'api/shop',
          endpoint: `v1/platform/products/${id}/images/`,
          noVersion: true,
        }),
      platformProductImageDetail: (id, imageId) =>
        Config.getApiUrl({
          segment: 'api/shop',
          endpoint: `v1/platform/products/${id}/images/${imageId}/`,
          noVersion: true,
        }),
      platformProductMedia: (id) =>
        Config.getApiUrl({
          segment: 'api/shop',
          endpoint: `v1/platform/products/${id}/media/`,
          noVersion: true,
        }),
      platformCategories: (params = {}) =>
        Config.getApiUrl({
          segment: 'api/shop',
          endpoint: 'v1/platform/categories/',
          params,
          noVersion: true,
        }),
      platformCategoryDetail: (id) =>
        Config.getApiUrl({
          segment: 'api/shop',
          endpoint: `v1/platform/categories/${id}/`,
          noVersion: true,
        }),
      platformCategoryReorder: () =>
        Config.getApiUrl({
          segment: 'api/shop',
          endpoint: 'v1/platform/categories/reorder/',
          noVersion: true,
        }),
      platformCategoryTemplates: () =>
        Config.getApiUrl({
          segment: 'api/shop',
          endpoint: 'v1/platform/categories/templates/',
          noVersion: true,
        }),
    },

    // ============================================
    // ORDER (سبد / آدرس / تسویه)
    // ============================================
    order: {
      cart: (params = {}) =>
        Config.getApiUrl({
          segment: 'api/order',
          endpoint: 'v1/cart/',
          params,
          noVersion: true,
        }),
      cartItems: () =>
        Config.getApiUrl({
          segment: 'api/order',
          endpoint: 'v1/cart/items/',
          noVersion: true,
        }),
      cartDelta: () =>
        Config.getApiUrl({
          segment: 'api/order',
          endpoint: 'v1/cart/delta/',
          noVersion: true,
        }),
      cartClear: () =>
        Config.getApiUrl({
          segment: 'api/order',
          endpoint: 'v1/cart/clear/',
          noVersion: true,
        }),
      addresses: () =>
        Config.getApiUrl({
          segment: 'api/order',
          endpoint: 'v1/addresses/',
          noVersion: true,
        }),
      addressDetail: (id) =>
        Config.getApiUrl({
          segment: 'api/order',
          endpoint: `v1/addresses/${id}/`,
          noVersion: true,
        }),
      checkout: () =>
        Config.getApiUrl({
          segment: 'api/order',
          endpoint: 'v1/checkout/',
          noVersion: true,
        }),
      shippingEstimate: () =>
        Config.getApiUrl({
          segment: 'api/order',
          endpoint: 'v1/shipping/estimate/',
          noVersion: true,
        }),
      wallet: () =>
        Config.getApiUrl({
          segment: 'api/order',
          endpoint: 'v1/wallet/',
          noVersion: true,
        }),
      orders: () =>
        Config.getApiUrl({
          segment: 'api/order',
          endpoint: 'v1/orders/',
          noVersion: true,
        }),
      orderDetail: (id) =>
        Config.getApiUrl({
          segment: 'api/order',
          endpoint: `v1/orders/${id}/`,
          noVersion: true,
        }),
      orderReceipt: (id) =>
        Config.getApiUrl({
          segment: 'api/order',
          endpoint: `v1/orders/${id}/receipt/`,
          noVersion: true,
        }),
      ownerOrders: (params = {}) =>
        Config.getApiUrl({
          segment: 'api/order',
          endpoint: 'v1/owner/orders/',
          params,
          noVersion: true,
        }),
      ownerOrderDetail: (id) =>
        Config.getApiUrl({
          segment: 'api/order',
          endpoint: `v1/owner/orders/${id}/`,
          noVersion: true,
        }),
      ownerAccounting: (params = {}) =>
        Config.getApiUrl({
          segment: 'api/order',
          endpoint: 'v1/owner/accounting/',
          params,
          noVersion: true,
        }),
      ownerExpenses: (params = {}) =>
        Config.getApiUrl({
          segment: 'api/order',
          endpoint: 'v1/owner/expenses/',
          params,
          noVersion: true,
        }),
      ownerExpenseDetail: (id) =>
        Config.getApiUrl({
          segment: 'api/order',
          endpoint: `v1/owner/expenses/${id}/`,
          noVersion: true,
        }),
      platformUnsettled: (params = {}) =>
        Config.getApiUrl({
          segment: 'api/order',
          endpoint: 'v1/platform/unsettled/',
          params,
          noVersion: true,
        }),
      platformSettlements: (params = {}) =>
        Config.getApiUrl({
          segment: 'api/order',
          endpoint: 'v1/platform/settlements/',
          params,
          noVersion: true,
        }),
      platformSettlementDetail: (id) =>
        Config.getApiUrl({
          segment: 'api/order',
          endpoint: `v1/platform/settlements/${id}/`,
          noVersion: true,
        }),
    },

    // ============================================
    // PAYMENT (سراسری)
    // ============================================
    payment: {
      bundle: () =>
        Config.getApiUrl({
          segment: 'api/payment',
          endpoint: 'v1/bundle/',
          noVersion: true,
        }),
      settings: () =>
        Config.getApiUrl({
          segment: 'api/payment',
          endpoint: 'v1/settings/',
          noVersion: true,
        }),
      gateways: () =>
        Config.getApiUrl({
          segment: 'api/payment',
          endpoint: 'v1/gateways/',
          noVersion: true,
        }),
      gatewayDetail: (id) =>
        Config.getApiUrl({
          segment: 'api/payment',
          endpoint: `v1/gateways/${id}/`,
          noVersion: true,
        }),
      purposes: () =>
        Config.getApiUrl({
          segment: 'api/payment',
          endpoint: 'v1/purposes/',
          noVersion: true,
        }),
      purposeDetail: (id) =>
        Config.getApiUrl({
          segment: 'api/payment',
          endpoint: `v1/purposes/${id}/`,
          noVersion: true,
        }),
      payments: (params = {}) =>
        Config.getApiUrl({
          segment: 'api/payment',
          endpoint: 'v1/payments/',
          params,
          noVersion: true,
        }),
      paymentDetail: (id) =>
        Config.getApiUrl({
          segment: 'api/payment',
          endpoint: `v1/payments/${id}/`,
          noVersion: true,
        }),
      intents: () =>
        Config.getApiUrl({
          segment: 'api/payment',
          endpoint: 'v1/intents/',
          noVersion: true,
        }),
      publicConfig: () =>
        Config.getApiUrl({
          segment: 'api/payment',
          endpoint: 'v1/public/',
          noVersion: true,
        }),
      callback: (scope) =>
        Config.getApiUrl({
          segment: 'api/payment',
          endpoint: scope ? `v1/callback/${scope}/` : 'v1/callback/',
          noVersion: true,
        }),
    },


    // ============================================
    // CLUB (کسب‌وکارها و اشتراک‌ها)
    // ============================================
    club: {
      categories: {
        list: (params = {}) =>
          Config.getApiUrl({
            segment: 'api/club',
            endpoint: 'v1/categories/',
            params,
            noVersion: true,
          }),
        detail: (slug) =>
          Config.getApiUrl({
            segment: 'api/club',
            endpoint: `v1/categories/${slug}/`,
            noVersion: true,
          }),
        subcategories: (slug) =>
          Config.getApiUrl({
            segment: 'api/club',
            endpoint: `v1/categories/${slug}/subcategories/`,
            noVersion: true,
          }),
      },

      subcategories: {
        list: (params = {}) =>
          Config.getApiUrl({
            segment: 'api/club',
            endpoint: 'v1/subcategories/',
            params,
            noVersion: true,
          }),
        detail: (slug) =>
          Config.getApiUrl({
            segment: 'api/club',
            endpoint: `v1/subcategories/${slug}/`,
            noVersion: true,
          }),
        plans: (slug) =>
          Config.getApiUrl({
            segment: 'api/club',
            endpoint: `v1/subcategories/${slug}/plans/`,
            noVersion: true,
          }),
      },

      plans: {
        list: (params = {}) =>
          Config.getApiUrl({
            segment: 'api/club',
            endpoint: 'v1/plans/',
            params,
            noVersion: true,
          }),
        detail: (id) =>
          Config.getApiUrl({
            segment: 'api/club',
            endpoint: `v1/plans/${id}/`,
            noVersion: true,
          }),
      },

      purchase: () =>
        Config.getApiUrl({
          segment: 'api/club',
          endpoint: 'v1/purchase/',
          noVersion: true,
        }),

      businesses: {
        list: (params = {}) =>
          Config.getApiUrl({
            segment: 'api/club',
            endpoint: 'v1/businesses/',
            params,
            noVersion: true,
          }),
        detail: (slug) =>
          Config.getApiUrl({
            segment: 'api/club',
            endpoint: `v1/businesses/${slug}/`,
            noVersion: true,
          }),
        subscriptions: (slug) =>
          Config.getApiUrl({
            segment: 'api/club',
            endpoint: `v1/businesses/${slug}/subscriptions/`,
            noVersion: true,
          }),
        transactions: (slug) =>
          Config.getApiUrl({
            segment: 'api/club',
            endpoint: `v1/businesses/${slug}/transactions/`,
            noVersion: true,
          }),
      },

      subscriptions: {
        list: (params = {}) =>
          Config.getApiUrl({
            segment: 'api/club',
            endpoint: 'v1/subscriptions/',
            params,
            noVersion: true,
          }),
        detail: (id) =>
          Config.getApiUrl({
            segment: 'api/club',
            endpoint: `v1/subscriptions/${id}/`,
            noVersion: true,
          }),
        cancel: (id) =>
          Config.getApiUrl({
            segment: 'api/club',
            endpoint: `v1/subscriptions/${id}/cancel/`,
            noVersion: true,
          }),
      },

      transactions: {
        list: (params = {}) =>
          Config.getApiUrl({
            segment: 'api/club',
            endpoint: 'v1/transactions/',
            params,
            noVersion: true,
          }),
        detail: (id) =>
          Config.getApiUrl({
            segment: 'api/club',
            endpoint: `v1/transactions/${id}/`,
            noVersion: true,
          }),
        confirm: (id) =>
          Config.getApiUrl({
            segment: 'api/club',
            endpoint: `v1/transactions/${id}/confirm/`,
            noVersion: true,
          }),
      },
    },

    // ============================================
    // BODYBUILDING (مدیریت باشگاه بدنسازی)
    // ============================================


    bodybuilding: {
      /** باشگاه سطح‌سایت — بدون اشتراک؛ فقط مدیر/سوپریوزر */
      siteBusiness: () =>
        Config.getApiUrl({
          segment: 'api/bodybuilding',
          endpoint: 'site-business/',
          noVersion: true,
        }),

      me: () =>
        Config.getApiUrl({
          segment: 'api/bodybuilding',
          endpoint: 'me/',
          noVersion: true,
        }),

      myTrainerClients: () =>
        Config.getApiUrl({
          segment: 'api/bodybuilding',
          endpoint: 'my-trainer/clients/',
          noVersion: true,
        }),

      myMemberships: {
        list: () =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: 'my-memberships/',
            noVersion: true,
          }),
        detail: (slug) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `my-memberships/${encodeURIComponent(slug)}/`,
            noVersion: true,
          }),
        workouts: (slug) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `my-memberships/${encodeURIComponent(slug)}/workouts/`,
            noVersion: true,
          }),
        diets: (slug) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `my-memberships/${encodeURIComponent(slug)}/diets/`,
            noVersion: true,
          }),
        tracking: (slug) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `my-memberships/${encodeURIComponent(slug)}/tracking/`,
            noVersion: true,
          }),
        products: (slug) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `my-memberships/${encodeURIComponent(slug)}/products/`,
            noVersion: true,
          }),
      },
      // ============ آمار داشبورد ============
      dashboardStats: (businessSlug) =>
        Config.getApiUrl({
          segment: 'api/bodybuilding',
          endpoint: `${businessSlug}/dashboard-stats/`,
          noVersion: true,
        }),

      // ============ اعضا ============
      members: {
        list: (businessSlug, params = {}) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/members/`,
            params,
            noVersion: true,
          }),
        detail: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/members/${id}/`,
            noVersion: true,
          }),
        create: (businessSlug) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/members/`,
            noVersion: true,
          }),
        update: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/members/${id}/`,
            noVersion: true,
          }),
        partialUpdate: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/members/${id}/`,
            noVersion: true,
          }),
        delete: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/members/${id}/`,
            noVersion: true,
          }),
        toggleStatus: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/members/${id}/toggle-status/`,
            noVersion: true,
          }),
        alerts: (businessSlug) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/members/alerts/`,
            noVersion: true,
          }),
        bodyProfile: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/members/${id}/body-profile/`,
            noVersion: true,
          }),
        progressLogs: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/members/${id}/progress-logs/`,
            noVersion: true,
          }),
        progressLogDetail: (businessSlug, id, logId) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/members/${id}/progress-logs/${logId}/`,
            noVersion: true,
          }),
        trackingSummary: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/members/${id}/tracking-summary/`,
            noVersion: true,
          }),
      },

      // ============ بسته‌ها ============
      packages: {
        list: (businessSlug, params = {}) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/packages/`,
            params,
            noVersion: true,
          }),
        detail: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/packages/${id}/`,
            noVersion: true,
          }),
        create: (businessSlug) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/packages/`,
            noVersion: true,
          }),
        update: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/packages/${id}/`,
            noVersion: true,
          }),
        delete: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/packages/${id}/`,
            noVersion: true,
          }),
      },

      shopProducts: {
        publicList: (params = {}) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: 'public/shop-products/',
            params,
            noVersion: true,
          }),
      },

      // ============ سانس‌ها ============
      sessions: {
        publicList: (params = {}) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: 'public/sessions/',
            params,
            noVersion: true,
          }),
        list: (businessSlug, params = {}) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/sessions/`,
            params,
            noVersion: true,
          }),
        detail: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/sessions/${id}/`,
            noVersion: true,
          }),
        create: (businessSlug) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/sessions/`,
            noVersion: true,
          }),
        update: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/sessions/${id}/`,
            noVersion: true,
          }),
        delete: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/sessions/${id}/`,
            noVersion: true,
          }),
      },

      // ============ مربیان ============
      trainers: {
        publicList: (params = {}) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: 'public/trainers/',
            params,
            noVersion: true,
          }),
        list: (businessSlug, params = {}) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/trainers/`,
            params,
            noVersion: true,
          }),
        detail: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/trainers/${id}/`,
            noVersion: true,
          }),
        create: (businessSlug) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/trainers/`,
            noVersion: true,
          }),
        update: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/trainers/${id}/`,
            noVersion: true,
          }),
        delete: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/trainers/${id}/`,
            noVersion: true,
          }),
        toggleStatus: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/trainers/${id}/toggle-status/`,
            noVersion: true,
          }),
      },

      // ============ محصولات ============
      products: {
        list: (businessSlug, params = {}) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/products/`,
            params,
            noVersion: true,
          }),
        detail: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/products/${id}/`,
            noVersion: true,
          }),
        create: (businessSlug) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/products/`,
            noVersion: true,
          }),
        update: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/products/${id}/`,
            noVersion: true,
          }),
        delete: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/products/${id}/`,
            noVersion: true,
          }),
      },


      // ============ اطلاعات کسب‌وکار (اشتراک) ============
      getBusinessInfo: (businessSlug) =>
        Config.getApiUrl({
          segment: 'api/club',
          endpoint: `v1/businesses/${businessSlug}/info/`,
          noVersion: true,
        }),

      

      // ============ برنامه‌های تمرینی ============
      workoutPrograms: {
        list: (businessSlug, params = {}) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/workout-programs/`,
            params,
            noVersion: true,
          }),
        detail: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/workout-programs/${id}/`,
            noVersion: true,
          }),
        create: (businessSlug) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/workout-programs/`,
            noVersion: true,
          }),
        update: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/workout-programs/${id}/`,
            noVersion: true,
          }),
        delete: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/workout-programs/${id}/`,
            noVersion: true,
          }),
        approve: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/workout-programs/${id}/approve/`,
            noVersion: true,
          }),
        unlock: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/workout-programs/${id}/unlock/`,
            noVersion: true,
          }),
        addExercise: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/workout-programs/${id}/exercises/add/`,
            noVersion: true,
          }),
        updateExercise: (businessSlug, programId, exerciseId) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/workout-programs/${programId}/exercises/${exerciseId}/update/`,
            noVersion: true,
          }),
        deleteExercise: (businessSlug, programId, exerciseId) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/workout-programs/${programId}/exercises/${exerciseId}/delete/`,
            noVersion: true,
          }),
        reorderExercises: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/workout-programs/${id}/exercises/reorder/`,
            noVersion: true,
          }),
        toggleSuperSet: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/workout-programs/${id}/exercises/super-set/`,
            noVersion: true,
          }),
        archive: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/workout-programs/${id}/archive/`,
            noVersion: true,
          }),
      },

      // ============ آرشیو برنامه‌های تمرینی مربی ============
      workoutProgramArchives: {
        list: (businessSlug, params = {}) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/workout-program-archives/`,
            params,
            noVersion: true,
          }),
        detail: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/workout-program-archives/${id}/`,
            noVersion: true,
          }),
        update: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/workout-program-archives/${id}/`,
            noVersion: true,
          }),
        delete: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/workout-program-archives/${id}/`,
            noVersion: true,
          }),
        apply: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/workout-program-archives/${id}/apply/`,
            noVersion: true,
          }),
      },

      // ============ برنامه‌های غذایی ============
      dietPrograms: {
        list: (businessSlug, params = {}) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/diet-programs/`,
            params,
            noVersion: true,
          }),
        detail: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/diet-programs/${id}/`,
            noVersion: true,
          }),
        create: (businessSlug) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/diet-programs/`,
            noVersion: true,
          }),
        update: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/diet-programs/${id}/`,
            noVersion: true,
          }),
        delete: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/diet-programs/${id}/`,
            noVersion: true,
          }),
        approve: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/diet-programs/${id}/approve/`,
            noVersion: true,
          }),
        unlock: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/diet-programs/${id}/unlock/`,
            noVersion: true,
          }),
        addMeal: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/diet-programs/${id}/meals/add/`,
            noVersion: true,
          }),
        updateMeal: (businessSlug, programId, mealId) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/diet-programs/${programId}/meals/${mealId}/update/`,
            noVersion: true,
          }),
        deleteMeal: (businessSlug, programId, mealId) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/diet-programs/${programId}/meals/${mealId}/delete/`,
            noVersion: true,
          }),
        addFood: (businessSlug, programId, mealId) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/diet-programs/${programId}/meals/${mealId}/items/add/`,
            noVersion: true,
          }),
        updateFood: (businessSlug, programId, mealId, itemId) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/diet-programs/${programId}/meals/${mealId}/items/${itemId}/update/`,
            noVersion: true,
          }),
        deleteFood: (businessSlug, programId, mealId, itemId) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/diet-programs/${programId}/meals/${mealId}/items/${itemId}/delete/`,
            noVersion: true,
          }),
        archive: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/diet-programs/${id}/archive/`,
            noVersion: true,
          }),
      },

      dietProgramArchives: {
        list: (businessSlug, params = {}) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/diet-program-archives/`,
            params,
            noVersion: true,
          }),
        detail: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/diet-program-archives/${id}/`,
            noVersion: true,
          }),
        update: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/diet-program-archives/${id}/`,
            noVersion: true,
          }),
        delete: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/diet-program-archives/${id}/`,
            noVersion: true,
          }),
        apply: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/diet-program-archives/${id}/apply/`,
            noVersion: true,
          }),
      },

      // ============ پنل پیامکی ============
      sms: {
        panel: (businessSlug) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/sms-panel/`,
            noVersion: true,
          }),
        charge: (businessSlug) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/sms-panel/charge/`,
            noVersion: true,
          }),
      },

      // ============ هشدارها ============
      alerts: {
        list: (businessSlug, params = {}) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/alerts/`,
            params,
            noVersion: true,
          }),
        resolve: (businessSlug, id) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/alerts/${id}/resolve/`,
            noVersion: true,
          }),
        generate: (businessSlug) =>
          Config.getApiUrl({
            segment: 'api/bodybuilding',
            endpoint: `${businessSlug}/alerts/generate/`,
            noVersion: true,
          }),
      },

      // ============ کتابخانه (عمومی - بدون business slug) ============
      library: {
        exercises: {
          list: (params = {}) =>
            Config.getApiUrl({
              segment: 'api/bodybuilding',
              endpoint: 'library/exercises/',
              params,
              noVersion: true,
            }),
          detail: (slug) =>
            Config.getApiUrl({
              segment: 'api/bodybuilding',
              endpoint: `library/exercises/${slug}/`,
              noVersion: true,
            }),
          create: () =>
            Config.getApiUrl({
              segment: 'api/bodybuilding',
              endpoint: 'library/exercises/',
              noVersion: true,
            }),
          update: (slug) =>
            Config.getApiUrl({
              segment: 'api/bodybuilding',
              endpoint: `library/exercises/${slug}/`,
              noVersion: true,
            }),
          delete: (slug) =>
            Config.getApiUrl({
              segment: 'api/bodybuilding',
              endpoint: `library/exercises/${slug}/`,
              noVersion: true,
            }),
          grouped: () =>
            Config.getApiUrl({
              segment: 'api/bodybuilding',
              endpoint: 'library/exercises/grouped/',
              noVersion: true,
            }),
        },
        foods: {
          list: (params = {}) =>
            Config.getApiUrl({
              segment: 'api/bodybuilding',
              endpoint: 'library/foods/',
              params,
              noVersion: true,
            }),
          detail: (slug) =>
            Config.getApiUrl({
              segment: 'api/bodybuilding',
              endpoint: `library/foods/${slug}/`,
              noVersion: true,
            }),
          create: () =>
            Config.getApiUrl({
              segment: 'api/bodybuilding',
              endpoint: 'library/foods/',
              noVersion: true,
            }),
          update: (slug) =>
            Config.getApiUrl({
              segment: 'api/bodybuilding',
              endpoint: `library/foods/${slug}/`,
              noVersion: true,
            }),
          delete: (slug) =>
            Config.getApiUrl({
              segment: 'api/bodybuilding',
              endpoint: `library/foods/${slug}/`,
              noVersion: true,
            }),
          grouped: () =>
            Config.getApiUrl({
              segment: 'api/bodybuilding',
              endpoint: 'library/foods/grouped/',
              noVersion: true,
            }),
        },
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