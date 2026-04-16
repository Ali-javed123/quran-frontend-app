// hooks/useToast.ts

import { useState, useCallback } from 'react';
import { ToastMessage, ToastType } from '../components/Toast';

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const addToast = useCallback((
    type: ToastType,
    title: string,
    message: string,
    duration: number = 5000
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 4);
    const newToast: ToastMessage = {
      id,
      type,
      title,
      message,
      duration,
    };
    
    setToasts((prev) => [...prev, newToast]);
    
    return id;
  }, []);
  
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);
  
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);
  
  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
  };
};