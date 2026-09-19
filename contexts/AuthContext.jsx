// contexts/AuthContext.jsx
"use client";
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Config from "@/config/config";

const AuthContext = createContext();

// ✅ لیست کامل مسیرهای عمومی که نیازی به احراز هویت ندارند
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/splash",
  "/news",
  "/news/",
  "/about",
  "/about/",
  "/contact",
  "/contact/",
  "/services",
  "/services/",
  "/projects",
  "/projects/",
];

// ✅ تابع پیشرفته برای بررسی مسیر عمومی
const isPublicPath = (pathname) => {
  if (!pathname) return false;
  
  // 1. بررسی تطابق دقیق
  if (PUBLIC_PATHS.includes(pathname)) return true;
  
  // 2. بررسی مسیرهای داینامیک با الگوی /news/*
  if (pathname.startsWith('/news/')) return true;
  
  // 3. بررسی سایر مسیرهای داینامیک
  const dynamicPatterns = [
    '/about/',
    '/contact/',
    '/services/',
    '/projects/',
  ];
  
  for (const pattern of dynamicPatterns) {
    if (pathname.startsWith(pattern)) return true;
  }
  
  return false;
};

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // ✅ stateهای وضعیت کارمندی
  const [isEmployee, setIsEmployee] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [checkingEmployee, setCheckingEmployee] = useState(true);
  const [permissions, setPermissions] = useState([]);
  
  const isRefreshing = useRef(false);
  const failedQueue = useRef([]);

  const processQueue = useCallback((error, token = null) => {
    failedQueue.current.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue.current = [];
  }, []);

  const refreshAccessToken = useCallback(async (refreshToken) => {
    try {
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const apiUrl = Config.endpoints.login("refreshToken");
      const response = await axios.post(
        apiUrl,
        { refresh: refreshToken },
        { _isAuthRequest: true }
      );

      const newAccessToken = response.data?.access_token || response.data?.access;
      const newRefreshToken = response.data?.refresh_token || response.data?.refresh || refreshToken;

      if (!newAccessToken) {
        throw new Error("Failed to refresh access token");
      }

      localStorage.setItem("accessToken", newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (err) {
      console.error("Error refreshing access token:", err);
      throw err;
    }
  }, []);

  const fetchUserProfile = useCallback(async (accessToken) => {
    try {
      const apiUrl = Config.endpoints.profile();
      console.log("Fetching profile from:", apiUrl);
      
      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
        _isAuthRequest: true,
      });
      
      console.log("Profile response:", response.data);
      
      const userData = response.data?.data || response.data;
      return userData;
    } catch (err) {
      console.error("Error fetching user profile:", err);
      console.error("Error response:", err.response?.data);
      throw err;
    }
  }, []);

  // ✅ تابع بررسی وضعیت کارمندی با دسترسی‌ها
  const checkEmployeeStatus = useCallback(async (token) => {
    try {
      setCheckingEmployee(true);
      
      if (!token) {
        token = localStorage.getItem("accessToken");
      }
      
      if (!token) {
        setCheckingEmployee(false);
        setIsEmployee(false);
        setEmployeeData(null);
        setPermissions([]);
        return false;
      }

      const apiUrl = Config.endpoints.karmandan.checkEmployee();
      console.log("Checking employee status at:", apiUrl);
      
      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
        _isAuthRequest: true,
      });
      
      console.log("Employee check response:", response.data);
      
      if (response.data && response.data.is_employee === true) {
        setIsEmployee(true);
        setEmployeeData(response.data);
        
        const perms = response.data.permissions || [];
        setPermissions(perms);
        
        try {
          localStorage.setItem('employeeData', JSON.stringify(response.data));
          localStorage.setItem('permissions', JSON.stringify(perms));
        } catch (e) {
          // ignore
        }
        
        return true;
      } else {
        setIsEmployee(false);
        setEmployeeData(null);
        setPermissions([]);
        localStorage.removeItem('employeeData');
        localStorage.removeItem('permissions');
        return false;
      }
    } catch (error) {
      console.error("Error checking employee status:", error);
      console.error("Error response:", error.response?.data);
      setIsEmployee(false);
      setEmployeeData(null);
      setPermissions([]);
      localStorage.removeItem('employeeData');
      localStorage.removeItem('permissions');
      return false;
    } finally {
      setCheckingEmployee(false);
    }
  }, []);

  // ✅ تابع بررسی دسترسی خاص
  const hasPermission = useCallback((permission) => {
    if (user?.is_superuser) return true;
    return permissions.includes(permission);
  }, [permissions, user]);

  const validateAndRefreshTokens = useCallback(async () => {
    if (typeof window === "undefined") return null;

    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    console.log("Validating tokens - access:", !!accessToken, "refresh:", !!refreshToken);

    if (!accessToken && !refreshToken) {
      return null;
    }

    let validAccessToken = accessToken;
    let activeRefreshToken = refreshToken;

    if (!accessToken && refreshToken) {
      try {
        const refreshedTokens = await refreshAccessToken(refreshToken);
        validAccessToken = refreshedTokens.accessToken;
        activeRefreshToken = refreshedTokens.refreshToken || refreshToken;
      } catch (err) {
        console.error("Failed to refresh token:", err);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return null;
      }
    }

    if (validAccessToken) {
      try {
        const userProfile = await fetchUserProfile(validAccessToken);
        return {
          accessToken: validAccessToken,
          refreshToken: activeRefreshToken,
          user: userProfile,
        };
      } catch (err) {
        if (err.response?.status === 401 && activeRefreshToken) {
          try {
            const refreshedTokens = await refreshAccessToken(activeRefreshToken);
            const newAccessToken = refreshedTokens.accessToken;
            activeRefreshToken = refreshedTokens.refreshToken || activeRefreshToken;
            const userProfile = await fetchUserProfile(newAccessToken);
            
            return {
              accessToken: newAccessToken,
              refreshToken: activeRefreshToken,
              user: userProfile,
            };
          } catch (refreshErr) {
            console.error("Failed to refresh expired token:", refreshErr);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            return null;
          }
        } else {
          console.error("Authentication failed:", err);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          return null;
        }
      }
    }

    return null;
  }, [refreshAccessToken, fetchUserProfile]);

  const login = useCallback(async (mobile, code) => {
    try {
      setLoading(true);
      
      const apiUrl = Config.endpoints.login("verifyCode");
      console.log("Verifying code at:", apiUrl);
      
      const response = await axios.post(apiUrl, { mobile, code });
      console.log("Verify response:", response.data);

      if (response.status === 200 && response.data.status === "ok") {
        const accessToken = response.data.access_token;
        const refreshToken = response.data.refresh_token;
        
        console.log("Tokens received - access:", !!accessToken, "refresh:", !!refreshToken);
        
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        try {
          const userProfile = await fetchUserProfile(accessToken);
          console.log("User profile after login:", userProfile);
          
          setUser({
            accessToken: accessToken,
            refreshToken: refreshToken,
            id: userProfile.id,
            mobile: userProfile.mobile,
            first_name: userProfile.first_name || "",
            last_name: userProfile.last_name || "",
            display_name: userProfile.display_name || "کاربر محترم",
            email: userProfile.email || "",
            is_staff: userProfile.is_staff || false,
            is_superuser: userProfile.is_superuser || false,
            is_active: userProfile.is_active || true,
            status: userProfile.status || "active",
            image: userProfile.image || null,
            date_joined: userProfile.date_joined || null,
          });
          setIsAuthenticated(true);
          
          await checkEmployeeStatus(accessToken);
          
          setLoading(false);
          router.push("/");
          return { success: true, user: userProfile };
        } catch (profileError) {
          console.error("Error fetching profile after login:", profileError);
          setUser({
            accessToken: accessToken,
            refreshToken: refreshToken,
            id: response.data.user_id || response.data.user?.id,
            mobile: mobile,
            display_name: "کاربر محترم",
          });
          setIsAuthenticated(true);
          
          await checkEmployeeStatus(accessToken);
          
          setLoading(false);
          router.push("/");
          return { success: true };
        }
      }
      
      setLoading(false);
      return {
        success: false,
        message: response.data?.message || "خطا در تایید کد",
      };
    } catch (error) {
      console.error("Login error:", error);
      console.error("Error response:", error.response?.data);
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || "خطا در ورود",
      };
    }
  }, [router, fetchUserProfile, checkEmployeeStatus]);

  const logout = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (accessToken && refreshToken) {
        const apiUrl = Config.endpoints.login("logout");
        await axios.post(
          apiUrl,
          { refresh_token: refreshToken },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            _isAuthRequest: true,
          }
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("employeeData");
      localStorage.removeItem("permissions");
      setUser(null);
      setIsAuthenticated(false);
      setIsEmployee(false);
      setEmployeeData(null);
      setPermissions([]);
      router.push("/login");
    }
  }, [router]);

  const sendOtp = useCallback(async (mobile) => {
    try {
      const apiUrl = Config.endpoints.login("sendOtp");
      console.log("Sending OTP to:", apiUrl);
      
      const response = await axios.post(apiUrl, { mobile });
      console.log("Send OTP response:", response.data);
      
      if (response.data.status === "ok") {
        return {
          success: true,
          message: response.data.message,
          waitTime: response.data.wait_time || 0,
        };
      } else {
        return {
          success: false,
          message: response.data.message || "خطا در ارسال کد تایید",
        };
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      console.error("Error response:", error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || "خطا در ارسال کد تایید",
      };
    }
  }, []);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // ✅ مقداردهی اولیه - بدون تغییر
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const authData = await validateAndRefreshTokens();

      if (authData) {
        console.log("Auth data received:", authData.user);
        setUser({
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          id: authData.user.id,
          mobile: authData.user.mobile,
          first_name: authData.user.first_name || "",
          last_name: authData.user.last_name || "",
          display_name: authData.user.display_name || "کاربر محترم",
          email: authData.user.email || "",
          is_staff: authData.user.is_staff || false,
          is_superuser: authData.user.is_superuser || false,
          is_active: authData.user.is_active || true,
          status: authData.user.status || "active",
          image: authData.user.image || null,
          date_joined: authData.user.date_joined || null,
        });
        setIsAuthenticated(true);
        
        await checkEmployeeStatus(authData.accessToken);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsEmployee(false);
        setEmployeeData(null);
        setPermissions([]);
      }

      setLoading(false);
    };

    initializeAuth();
  }, [validateAndRefreshTokens, checkEmployeeStatus]);

  // ✅ محافظت از مسیرها - به‌روزرسانی شده
  useEffect(() => {
    if (typeof window === "undefined" || loading) return;

    const pathname = window.location.pathname || "/";

    // ✅ بررسی عمومی بودن مسیر
    const isPublic = isPublicPath(pathname);

    // اگر مسیر عمومی است، اجازه دسترسی بده (حتی اگر لاگین نباشد)
    if (isPublic) {
      return;
    }

    // اگر مسیر عمومی نیست و کاربر لاگین نیست، به لاگین هدایت کن
    if (!isPublic && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    // اگر کاربر لاگین است و در صفحه لاگین است، به خانه هدایت کن
    if (isAuthenticated && pathname === "/login") {
      router.replace("/");
    }
  }, [isAuthenticated, loading, router]);

  // ✅ Interceptors برای axios - به‌روزرسانی شده
  useEffect(() => {
    if (typeof window === "undefined") return;

    // ✅ اینترسپتور درخواست - به‌روزرسانی شده
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        try {
          // اگر درخواست مربوط به مسیرهای عمومی است، هدر ارسال نشود
          const isPublicEndpoint = 
            config.url?.includes('/news') || 
            config.url?.includes('/about') ||
            config.url?.includes('/contact') ||
            config.url?.includes('/services') ||
            config.url?.includes('/projects');
          
          if (isPublicEndpoint && !config._isAuthRequest) {
            return config;
          }
          
          const token = localStorage.getItem("accessToken");
          if (token && !config._isAuthRequest) {
            config.headers = config.headers || {};
            if (!config.headers.Authorization) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          }
        } catch (e) {}
        return config;
      },
      (error) => Promise.reject(error)
    );

    // ✅ اینترسپتور پاسخ - به‌روزرسانی شده
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (!originalRequest || !error.response || error.response.status !== 401) {
          return Promise.reject(error);
        }

        if (originalRequest._isAuthRequest) {
          return Promise.reject(error);
        }

        if (originalRequest._retry) {
          return Promise.reject(error);
        }
        originalRequest._retry = true;

        if (isRefreshing.current) {
          return new Promise((resolve, reject) => {
            failedQueue.current.push({ resolve, reject });
          })
            .then((token) => {
              if (token) {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return axios(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        isRefreshing.current = true;

        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) {
            throw new Error("No refresh token");
          }

          const authData = await validateAndRefreshTokens();

          if (!authData || !authData.accessToken) {
            throw new Error("Unable to refresh access token");
          }

          setUser({
            accessToken: authData.accessToken,
            refreshToken: authData.refreshToken,
            id: authData.user.id,
            mobile: authData.user.mobile,
            first_name: authData.user.first_name || "",
            last_name: authData.user.last_name || "",
            display_name: authData.user.display_name || "کاربر محترم",
            email: authData.user.email || "",
            is_staff: authData.user.is_staff || false,
            is_superuser: authData.user.is_superuser || false,
            is_active: authData.user.is_active || true,
            status: authData.user.status || "active",
            image: authData.user.image || null,
            date_joined: authData.user.date_joined || null,
          });
          setIsAuthenticated(true);
          
          await checkEmployeeStatus(authData.accessToken);

          processQueue(null, authData.accessToken);

          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${authData.accessToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);

          setUser(null);
          setIsAuthenticated(false);
          setIsEmployee(false);
          setEmployeeData(null);
          setPermissions([]);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("employeeData");
          localStorage.removeItem("permissions");

          // ✅ فقط در صورت عدم حضور در مسیرهای عمومی به لاگین هدایت کن
          const pathname = window.location.pathname || "/";
          const isPublic = isPublicPath(pathname);
          
          if (!isPublic) {
            router.replace("/login");
          }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing.current = false;
        }
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [router, validateAndRefreshTokens, processQueue, checkEmployeeStatus]);

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    sendOtp,
    getAuthHeaders,
    refreshTokens: validateAndRefreshTokens,
    isEmployee,
    employeeData,
    checkingEmployee,
    checkEmployeeStatus,
    permissions,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};