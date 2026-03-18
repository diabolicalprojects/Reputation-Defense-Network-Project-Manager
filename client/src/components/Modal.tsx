import type * as React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl mx-4 bg-surface-800 border border-surface-700/50 rounded-2xl shadow-2xl shadow-black/40 animate-slide-up max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-surface-700/50">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-surface-700 rounded-lg transition-colors">
            <X className="w-4 h-4 text-surface-400" />
          </button>
        </div>
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
