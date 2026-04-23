// components/Toast.tsx
// Tarteel.ai style toast — shows wrong words in Arabic RTL

'use client';

import React, { useEffect, useRef } from 'react';
import { XCircle, CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

// const ToastItem = ({
//   toast,
//   onRemove,
// }: {
//   toast: ToastMessage;
//   onRemove: (id: string) => void;
// }) => {
//   const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   useEffect(() => {
//     const duration = toast.duration ?? 5000;
//     timerRef.current = setTimeout(() => onRemove(toast.id), duration);
//     return () => {
//       if (timerRef.current) clearTimeout(timerRef.current);
//     };
//   }, [toast.id, toast.duration, onRemove]);

//   const config: Record<
//     ToastType,
//     { icon: React.ReactNode; bg: string; border: string; titleColor: string }
//   > = {
//     success: {
//       icon      : <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />,
//       bg        : 'bg-green-50 dark:bg-green-900/30',
//       border    : 'border-green-200 dark:border-green-700',
//       titleColor: 'text-green-800 dark:text-green-200',
//     },
//     error: {
//       icon      : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />,
//       bg        : 'bg-red-50 dark:bg-red-900/30',
//       border    : 'border-red-200 dark:border-red-700',
//       titleColor: 'text-red-800 dark:text-red-200',
//     },
//     warning: {
//       icon      : <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />,
//       bg        : 'bg-amber-50 dark:bg-amber-900/30',
//       border    : 'border-amber-200 dark:border-amber-700',
//       titleColor: 'text-amber-800 dark:text-amber-200',
//     },
//     info: {
//       icon      : <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />,
//       bg        : 'bg-blue-50 dark:bg-blue-900/30',
//       border    : 'border-blue-200 dark:border-blue-700',
//       titleColor: 'text-blue-800 dark:text-blue-200',
//     },
//   };

//   const { icon, bg, border, titleColor } = config[toast.type];

//   // Split multiline messages (each wrong word is on its own line)
//   const lines = toast.message.split('\n').filter(Boolean);

//   return (
//     <div
//       className={`
//         flex items-start gap-3 p-4 rounded-xl shadow-lg border
//         ${bg} ${border}
//         max-w-sm w-full
//         animate-slide-in-right
//       `}
//       style={{ direction: 'rtl' }}  // RTL for Arabic text
//     >
//       {icon}

//       <div className="flex-1 min-w-0">
//         {/* Title */}
//         <h4 className={`font-bold text-sm mb-1 ${titleColor}`}>{toast.title}</h4>

//         {/* Wrong word lines — each on its own row */}
//         {lines.length > 1 ? (
//           <ul className="space-y-1">
//             {lines.map((line, i) => (
//               <li
//                 key={i}
//                 className="text-sm text-gray-700 dark:text-gray-200 font-arabic leading-relaxed"
//                 style={{
//                   fontFamily : "'Scheherazade New', 'Arial', sans-serif",
//                   fontSize   : '1rem',
//                 }}
//               >
//                 {line}
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p
//             className="text-sm text-gray-700 dark:text-gray-200 font-arabic"
//             style={{
//               fontFamily : "'Scheherazade New', 'Arial', sans-serif",
//               fontSize   : '1rem',
//             }}
//           >
//             {toast.message}
//           </p>
//         )}
//       </div>

//       {/* Close button */}
//       <button
//         onClick={() => onRemove(toast.id)}
//         className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0"
//         aria-label="بند کریں"
//       >
//         <X className="w-4 h-4" />
//       </button>
//     </div>
//   );
// };
const ToastItem = ({
  toast,
  onRemove,
}: {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const duration = toast.duration ?? 5000;
    timerRef.current = setTimeout(() => onRemove(toast.id), duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, toast.duration, onRemove]);

  const config: Record<
    ToastType,
    { icon: React.ReactNode; bg: string; border: string; titleColor: string }
  > = {
    success: {
      icon: <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />,
      bg: 'bg-green-50 dark:bg-green-900/30',
      border: 'border-green-200 dark:border-green-700',
      titleColor: 'text-green-800 dark:text-green-200',
    },
    error: {
      icon: <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />,
      bg: 'bg-red-50 dark:bg-red-900/30',
      border: 'border-red-200 dark:border-red-700',
      titleColor: 'text-red-800 dark:text-red-200',
    },
    warning: {
      icon: <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />,
      bg: 'bg-amber-50 dark:bg-amber-900/30',
      border: 'border-amber-200 dark:border-amber-700',
      titleColor: 'text-amber-800 dark:text-amber-200',
    },
    info: {
      icon: <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />,
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      border: 'border-blue-200 dark:border-blue-700',
      titleColor: 'text-blue-800 dark:text-blue-200',
    },
  };

  const { icon, bg, border, titleColor } = config[toast.type];

  // Split multiline messages
  const lines = toast.message.split('\n').filter(Boolean);

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-xl shadow-lg border
        ${bg} ${border}
        max-w-sm w-full
        animate-slide-in-right
      `}
      style={{ direction: 'rtl' }}  // RTL for Arabic text
    >
      {icon}

      <div className="flex-1 min-w-0">
        {/* Title in Arabic */}
        <h4 className={`font-bold text-sm mb-1 ${titleColor}`}>{toast.title}</h4>

        {/* Wrong word lines */}
        {lines.length > 1 ? (
          <ul className="space-y-1">
            {lines.map((line, i) => (
              <li
                key={i}
                className="text-sm text-gray-700 dark:text-gray-200 font-arabic leading-relaxed"
                style={{
                  fontFamily: "'Scheherazade New', 'Amiri', 'Arial', sans-serif",
                  fontSize: '1.1rem',
                }}
              >
                {line}
              </li>
            ))}
          </ul>
        ) : (
          <p
            className="text-sm text-gray-700 dark:text-gray-200 font-arabic"
            style={{
              fontFamily: "'Scheherazade New', 'Amiri', 'Arial', sans-serif",
              fontSize: '1.1rem',
            }}
          >
            {toast.message}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => onRemove(toast.id)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0"
        aria-label="بند کریں"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const Toast: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  if (!toasts.length) return null;

  return (
    // Fixed top-right — stacks downward for multiple toasts
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
};