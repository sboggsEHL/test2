import React from "react";
import { useToast } from "../context/ToastContext";
import Toast from "./Toast";

const ToastContainer: React.FC = () => {
  const { toasts, closeToast } = useToast();

  return (
    <div className="z-50 fixed inset-0 flex items-end justify-end px-4 py-6 sm:items-end sm:p-6 pointer-events-none">
      <div className="flex flex-col items-end space-y-4 overflow-y-auto max-h-screen">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            show={toast.visible}
            onClose={() => closeToast(toast.id)}
            title={toast.title}
            description={toast.description}
            {...toast.options}
          />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
