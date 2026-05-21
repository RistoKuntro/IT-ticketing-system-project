// client/src/components/Modal.tsx
import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: number;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = 500 }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: `${maxWidth}px` }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

/* LISA index.css-i:
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000; padding:1rem; }
.modal-content { background:white; border-radius:12px; width:100%; box-shadow:0 20px 60px rgba(0,0,0,0.3); max-height:90vh; overflow-y:auto; }
.modal-header { display:flex; justify-content:space-between; align-items:center; padding:1.25rem 1.5rem; border-bottom:1px solid #e5e7eb; }
.modal-header h2 { font-size:1.125rem; font-weight:600; margin:0; }
.modal-close { background:none; border:none; font-size:1.25rem; cursor:pointer; color:#9ca3af; padding:4px; border-radius:4px; line-height:1; }
.modal-close:hover { color:#374151; background:#f3f4f6; }
.modal-body { padding:1.5rem; }
*/