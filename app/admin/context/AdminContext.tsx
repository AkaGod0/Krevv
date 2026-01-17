'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const adminApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

// Request interceptor to add token from cookies
adminApi.interceptors.request.use(
  (config) => {
    const token = Cookies.get('admin_token');
   
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
     
    } else {
      console.log('❌ No token found in cookies');
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
adminApi.interceptors.response.use(
  (response) => {
  
    return response;
  },
  (error) => {
  
    if (error.response?.status === 401) {
     
      Cookies.remove('admin_token');
      Cookies.remove('admin');
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

interface Admin {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImage?: string;
  bio?: string;
  phone?: string;
}

interface AdminContextType {
  admin: Admin | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateAdminProfile: (data: any) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = () => {
      try {
        const storedToken = Cookies.get('admin_token');
        const storedAdmin = Cookies.get('admin');
        
       
        if (storedToken && storedAdmin) {
          const parsedAdmin = JSON.parse(storedAdmin);
        
          setToken(storedToken);
          setAdmin(parsedAdmin);
        } else {
          console.log('⚠️ No admin session to restore');
        }
      } catch (error) {
        console.error('❌ Failed to restore admin session:', error);
        Cookies.remove('admin');
        Cookies.remove('admin_token');
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      
      
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/login`, {
        username,
        password,
      });

      

      const { admin: adminData, token: authToken } = response.data;
      
      if (!authToken) {
        throw new Error('No token received from server');
      }
      
    
      
      setAdmin(adminData);
      setToken(authToken);
      
      // Store in cookies (expires in 30 days)
      Cookies.set('admin_token', authToken, { expires: 30 });
      Cookies.set('admin', JSON.stringify(adminData), { expires: 30 });
      
     
      
    } catch (error: any) {
      console.error('❌ Admin login error:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
   
    setAdmin(null);
    setToken(null);
    Cookies.remove('admin_token');
    Cookies.remove('admin');
   
  };

  const updateAdminProfile = async (data: any) => {
    const updatedAdmin = { ...admin, ...data };
    setAdmin(updatedAdmin);
    Cookies.set('admin', JSON.stringify(updatedAdmin), { expires: 30 });
  };

  return (
    <AdminContext.Provider value={{ admin, token, login, logout, loading, updateAdminProfile }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

export { adminApi };