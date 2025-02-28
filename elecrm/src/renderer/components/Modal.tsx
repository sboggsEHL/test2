import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import Button from "./Button";

type ModalProps = {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
};

export default function Modal({ children, isOpen, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0" onClick={onClose}></div>
      <div className="relative bg-altContentBg p-4 rounded-lg shadow-lg w-full max-w-5xl">
        <Button
          className="absolute top-1 right-1 p-2 text-text focus:outline-none bg-transparent"
          onClick={onClose}
        >
          &times;
        </Button>
        <div className="px-4 py-5 sm:py-2 mt-6 overflow-hidden relative">
          {children}
        </div>
      </div>
    </div>
  );
}
