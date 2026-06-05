import axios from 'axios';
import { useEffect } from 'react';
import { useAuth } from './useAuth';

const apiInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const useApi = () => {
  const { token, logout } = useAuth();

  useEffect(() => {
    const requestInterceptor = apiInstance.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = apiInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      apiInstance.interceptors.request.eject(requestInterceptor);
      apiInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [token, logout]);

  return apiInstance;
};

export default useApi;
export { apiInstance as api };
