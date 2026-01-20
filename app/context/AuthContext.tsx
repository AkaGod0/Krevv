"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import axios, { AxiosInstance } from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface User {
  name?: string;
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  companyLogo?: string;
  logo?: string;
  role?: string;
  phone?: string;
  location?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  companyLogin: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  token: string | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to get token - ALWAYS reads fresh from cookie
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return Cookies.get('auth_token') || null;
};

// Create API instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Request interceptor - ALWAYS gets fresh token from cookie
// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    // CHANGE: Strictly check if token exists and is not the string "undefined"
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // If no token, don't send the Authorization header at all
      delete config.headers.Authorization;
      console.warn(`[API] ⚠️ No token available for ${config.url}`);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    
    console.error(`[API] ❌ Error ${status}:`, message);
    
    if (status === 401) {
      console.warn('[API] Unauthorized - token may be invalid');
      // Don't auto-clear token here, let the component handle it
    }
    
    return Promise.reject(error);
  }
);

export { api, getToken };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Decode JWT payload
  const decodeToken = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (e) {
      console.error('[Auth] Failed to decode token:', e);
      return null;
    }
  };

  // Check authentication on mount
  const checkAuth = useCallback(async () => {
    console.log('[Auth] 🔍 Checking authentication...');
    
    try {
      const storedToken = getToken();
      
      if (!storedToken) {
        console.log('[Auth] No token found');
        setLoading(false);
        return;
      }

 
      setToken(storedToken);
      
      const payload = decodeToken(storedToken);
      if (!payload) {
        console.error('[Auth] Invalid token format');
        Cookies.remove('auth_token', { path: '/' });
        setLoading(false);
        return;
      }
      
     

      // Check if token is expired
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.warn('[Auth] Token expired');
        Cookies.remove('auth_token', { path: '/' });
        setToken(null);
        setLoading(false);
        return;
      }

      const isCompany = payload.type === 'company';
      const endpoint = isCompany ? '/company/profile' : '/users/me';
      
     

      const res = await api.get(endpoint);
      const userData = res.data.data || res.data;
      
      // Normalize logo field
      if (userData.logo && !userData.companyLogo) {
        userData.companyLogo = userData.logo;
      }
      
      
      setUser(userData);
      
    } catch (error: any) {
      console.error('[Auth] ❌ Auth check failed:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        Cookies.remove('auth_token', { path: '/' });
        setUser(null);
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Handle successful authentication
  const handleAuthSuccess = async (responseData: any) => {
    const authToken = responseData.token || responseData.data?.token || responseData.accessToken;
    
    if (!authToken) {
      console.error('[Auth] No token in response');
      throw new Error('No token received from server');
    }

    
    
    // Save to cookie
    Cookies.set('auth_token', authToken, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    
    // Verify it was saved
    const savedToken = getToken();
    if (!savedToken) {
      console.error('[Auth] ❌ Failed to save token to cookie!');
      throw new Error('Failed to save authentication token');
    }
    

    setToken(authToken);
    
    // Decode and fetch profile
    const payload = decodeToken(authToken);
    if (!payload) {
      throw new Error('Invalid token format');
    }
    
  

    const isCompany = payload.type === 'company';
    const endpoint = isCompany ? '/company/profile' : '/users/me';
    
    // Fetch profile with explicit token header (in case interceptor hasn't updated yet)
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const userData = res.data.data || res.data;
    
    // Normalize logo field
    if (userData.logo && !userData.companyLogo) {
      userData.companyLogo = userData.logo;
    }
    

    setUser(userData);
    
    return payload;
  };

  const login = async (email: string, password: string) => {
   
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, { 
      email, 
      password 
    });
    await handleAuthSuccess(res.data);
  };

  const companyLogin = async (email: string, password: string) => {
   
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/company/login`, { 
      email, 
      password 
    });
    await handleAuthSuccess(res.data);
  };

  const logout = async () => {
    console.log('[Auth] 👋 Logging out...');
    
    // Clear cookie first
    Cookies.remove('auth_token', { path: '/' });
    
    // Clear state
    setUser(null);
    setToken(null);
    
    // Redirect
    router.push('/');
  };

  const refreshUser = async () => {
    
    await checkAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        companyLogin,
        logout,
        isAuthenticated: !!user && !!getToken(),
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}