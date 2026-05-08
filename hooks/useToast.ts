// // hooks/useToast.ts

// import { useState, useCallback } from 'react';
// import { ToastMessage, ToastType } from '../components/Toast';

// export const useToast = () => {
//   const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
//   const addToast = useCallback((
//     type: ToastType,
//     title: string,
//     message: string,
//     duration: number = 5000
//   ) => {
//     const id = Date.now().toString() + Math.random().toString(36).substr(2, 4);
//     const newToast: ToastMessage = {
//       id,
//       type,
//       title,
//       message,
//       duration,
//     };
    
//     setToasts((prev) => [...prev, newToast]);
    
//     return id;
//   }, []);
  
//   const removeToast = useCallback((id: string) => {
//     setToasts((prev) => prev.filter((toast) => toast.id !== id));
//   }, []);
  
//   const clearToasts = useCallback(() => {
//     setToasts([]);
//   }, []);
  
//   return {
//     toasts,
//     addToast,
//     removeToast,
//     clearToasts,
//   };
// };
// hooks/useToast.ts
// Enhanced toast with word-specific functionality

import { useState, useCallback } from 'react';
import { ToastMessage, ToastType } from '../components/Toast';

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const addToast = useCallback((
    type: ToastType,
    title: string,
    message: string,
    duration: number = 4000
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 6);
    const newToast: ToastMessage = {
      id,
      type,
      title,
      message,
      duration,
    };
    
    setToasts((prev) => [...prev, newToast]);
    
    // Auto-remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
    
    return id;
  }, []);
  
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);
  
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);
  
  // Helper for showing wrong word toast
  const showWrongWord = useCallback((wrongWord: string, correctWord: string, duration: number = 4000) => {
    return addToast('error', '❌ غلط', `«${wrongWord}» → ✅ «${correctWord}»`, duration);
  }, [addToast]);
  
  // Helper for showing correct word toast
  const showCorrectWord = useCallback((word: string, accuracy: number, duration: number = 2000) => {
    if (accuracy >= 95) {
      return addToast('success', '✅ صحیح', `ماشاء اللہ! "${word}" بالکل صحیح ہے`, duration);
    } else if (accuracy >= 70) {
      return addToast('success', '✅ صحیح', `"${word}" صحیح ہے`, duration);
    } else if (accuracy >= 50) {
      return addToast('info', '⚠️ قریب', `"${word}" قریب ہے۔ اچھی کوشش!`, duration);
    }
    return null;
  }, [addToast]);
  
  // Helper for showing overall result
  const showOverallResult = useCallback((accuracy: number, isPerfect: boolean, duration: number = 5000) => {
    if (isPerfect || accuracy >= 95) {
      return addToast('success', '🎉 ماشاء اللہ!', `آپ نے پوری آیت بالکل صحیح پڑھی! ${accuracy}%`, duration);
    } else if (accuracy >= 70) {
      return addToast('success', '👍 بہت اچھے!', `آپ نے ${accuracy}% صحیح پڑھا۔ مزید مشق کریں۔`, duration);
    } else if (accuracy >= 50) {
      return addToast('warning', '📖 اچھی کوشش', `آپ نے ${accuracy}% صحیح پڑھا۔ غلط الفاظ پر توجہ دیں۔`, duration);
    } else {
      return addToast('error', '🎯 مشق کی ضرورت', `آپ نے ${accuracy}% صحیح پڑھا۔ براہ کرم دوبارہ کوشش کریں۔`, duration);
    }
  }, [addToast]);
  
  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    showWrongWord,
    showCorrectWord,
    showOverallResult,
  };
};