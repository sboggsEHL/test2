import { useState, useEffect } from "react";
import { Transition } from "@headlessui/react";
import { BellAlertIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface ToastProps {
  show: boolean;
  onClose: () => void;
  title: string;
  description: string;
  icon?: JSX.Element;
  primaryActionLabel?: string;
  primaryAction?: () => void;
  secondaryActionLabel?: string;
  secondaryAction?: () => void;
}

const Toast: React.FC<ToastProps> = ({
  show,
  onClose,
  title,
  description,
  icon = <BellAlertIcon aria-hidden="true" className="h-6 w-6 text-text" />,
  primaryActionLabel,
  primaryAction,
  secondaryActionLabel,
  secondaryAction,
}) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  const handlePrimaryAction = () => {
    primaryAction && primaryAction();
    onClose();
  }

  return (
    <div className="w-96 p-1">
      <Transition
        show={isVisible}
        enter="transition-opacity ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-mainContentBg shadow-lg ring-1 ring-text ring-opacity-5">
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">{icon}</div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm text-text font-extrabold">{title}</p>
                <p className="mt-1 text-sm text-text">{description}</p>
                <div className="mt-3 flex space-x-7">
                  {primaryActionLabel && primaryAction && (
                    <button
                      type="button"
                      onClick={handlePrimaryAction}
                      className="rounded-md p-2 bg-mainContentBg text-sm font-medium text-titleButtonBg hover:text-text hover:bg-altContentBg focus:outline-none focus:ring-2 focus:ring-titleButtonBg focus:ring-offset-2"
                    >
                      {primaryActionLabel}
                    </button>
                  )}
                  {secondaryActionLabel && secondaryAction && (
                    <button
                      type="button"
                      onClick={secondaryAction}
                      className="rounded-md p-2 bg-mainContentBg text-sm font-medium text-text hover:text-text hover:bg-altContentBg focus:outline-none focus:ring-2 focus:ring-titleButtonBg focus:ring-offset-2"
                    >
                      {secondaryActionLabel}
                    </button>
                  )}
                </div>
              </div>
              <div className="ml-4 flex flex-shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex p-1 rounded-md bg-mainContentBg text-text hover:text-text focus:outline-none hover:bg-altContentBg focus:ring-2 focus:ring-titleButtonBg focus:ring-offset-2"
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon aria-hidden="true" className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default Toast;
