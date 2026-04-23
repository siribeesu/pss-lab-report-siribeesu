import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import useUIStore, { ToastType } from '../../store/uiStore';

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="text-emerald-500" size={18} />,
  error: <XCircle className="text-rose-500" size={18} />,
  warning: <AlertCircle className="text-amber-500" size={18} />,
  info: <Info className="text-blue-500" size={18} />,
};

const Toast: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed top-4 right-8 z-[9999] flex flex-col gap-3 pointer-events-none items-end">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 bg-white border border-slate-100 shadow-[0px_10px_25px_rgba(0,0,0,0.06)] px-5 py-2 rounded-full toast-animate whitespace-nowrap"
          style={{ zIndex: 9999 }}
        >
          <div className="flex-shrink-0">{icons[toast.type]}</div>
          <div className="flex-grow">
            <p className="text-[13px] font-bold text-teal-950 font-body">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-300 hover:text-error transition-colors p-1 flex items-center justify-center rounded-full hover:bg-slate-50"
          >
            <X size={12} strokeWidth={3} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
