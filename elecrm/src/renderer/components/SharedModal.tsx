import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import {
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children?: ReactNode;
  icon?: ReactNode;
  primaryActionLabel: string;
  primaryAction: () => void;
  status?: "loading" | "success" | "error";
}

const SharedModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  icon,
  primaryActionLabel,
  primaryAction,
  status = "loading",
}) => {
  const getIcon = () => {
    if (icon) return icon;
    if (status === "success")
      return (
        <CheckIcon aria-hidden="true" className="h-6 w-6 text-green-600" />
      );
    if (status === "error")
      return (
        <ExclamationTriangleIcon aria-hidden="true" className="h-6 w-6 text-red-600" />
      );
    return (
      <InformationCircleIcon
        aria-hidden="true"
        className="h-6 w-6 text-blue-600"
      />
    );
  };

  const getDescription = () => {
    if (status === "success") return "Leads were assigned successfully.";
    if (status === "error")
      return "An error occurred while assigning leads. Please try again.";
    return description;
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-sidebarBg px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-sm sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white">
                {getIcon()}
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <DialogTitle
                  as="h3"
                  className="text-base font-semibold leading-6 text-text"
                >
                  {title}
                </DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-text">{getDescription()}</p>
                  {children}
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6">
              <button
                type="button"
                onClick={primaryAction}
                className="inline-flex w-full justify-center rounded-md bg-titleButtonBg px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-titleButtonHoverBg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {primaryActionLabel}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default SharedModal;
