import React, { useEffect } from "react";
import { X } from "lucide-react";
import clsx from "clsx";

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-2xl",
  footer
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className={clsx(
          "w-full bg-surface border border-border rounded-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]",
          maxWidth
        )}
      >
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-panel">
          <div>
            <h3 className="text-sm font-bold text-neutral-100 uppercase tracking-wide">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-muted mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-white p-1 rounded hover:bg-surface-subtle transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">{children}</div>

        {footer && (
          <div className="px-5 py-3 border-t border-border bg-panel flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
