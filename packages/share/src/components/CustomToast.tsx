import { FC, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import React from 'react';

export interface ToastMessage {
  id: string;
  severity: 'success' | 'error' | 'warn' | 'info';
  summary: string;
  detail: string;
  duration?: number;
}

interface Props {
  message: ToastMessage | null;
  onClose: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
}

export const CustomToast: FC<Props> = ({
  message,
  onClose,
  position = 'top-right',
  className = '',
}) => {
  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(onClose, message.duration ?? 4000);
    return () => clearTimeout(timeout);
  }, [message]);

  if (!message) return null;

  const posClasses: Record<string, string> = {
    'top-right': 'top-5 right-5',
    'top-left': 'top-5 left-5',
    'bottom-right': 'bottom-5 right-5',
    'bottom-left': 'bottom-5 left-5',
  };

  const severityStyles: Record<string, string> = {
    success: 'bg-green-100 text-green-800 border-green-300',
    error: 'bg-red-100 text-red-800 border-red-300',
    warn: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  return (
    <div className={`fixed z-50 ${posClasses[position]} ${className}`}>
      <AnimatePresence>
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`border rounded-xl shadow-md p-4 w-80 flex items-start gap-3 ${severityStyles[message.severity]}`}
        >
          <div className="flex-1">
            <p className="font-semibold">{message.summary}</p>
            <p className="text-sm">{message.detail}</p>
          </div>
          <button onClick={onClose} className="text-sm hover:opacity-60">
            <X size={16} />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
