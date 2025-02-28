import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/SideBar.css";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import {
  XMarkIcon,
  UserCircleIcon,
  Bars3Icon,
  HomeIcon,
  QueueListIcon,
  MagnifyingGlassIcon,
  ListBulletIcon,
  PhoneIcon,
  ComputerDesktopIcon,
  AdjustmentsVerticalIcon,
  FolderPlusIcon,
  UserGroupIcon,
  UserPlusIcon,
} from "@heroicons/react/24/solid";
import ThemeSwitcher from "./ThemeSwitcher";
import { useUser } from "../context/UserContext";
import { classNames } from "../utils";
import ProfileDropdown from "./ProfileDropdown";
import { NavigationItem } from "../models/navigation";
import { AppRoutes } from '../config/routes';

const navigation: NavigationItem[] = [
  { name: "Dashboard", path: AppRoutes.Home, icon: HomeIcon },
  { name: "Pipeline", path: AppRoutes.Pipeline, icon: UserGroupIcon },
  { name: "Shark Tank", path: AppRoutes.SharkTank, icon: UserPlusIcon },
  { name: "SW Api Testing", path: AppRoutes.LookupTool, icon: AdjustmentsVerticalIcon },
  { name: "Admin", path: AppRoutes.Admin, icon: ComputerDesktopIcon },
];

const buttonClassName =
  "relative inline-flex items-center justify-center p-0.5 mb-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800";
const spanClassName =
  "relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0";

const SideBar = ({ onToggleSoftphone }: { onToggleSoftphone: () => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username, logout } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavigation = (path: string | undefined) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <>
      <Dialog
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        className="relative z-50 lg:hidden"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/50 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
        />

        <div className="fixed inset-0 flex">
          <DialogPanel
            transition
            className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
          >
            <TransitionChild>
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="-m-2.5 p-2.5"
                >
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon aria-hidden="true" className="h-6 w-6 text-text" />
                </button>
              </div>
            </TransitionChild>
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-sidebarBg px-6 pb-2 ring-1 ring-white/10">
              <div className="flex h-20 shrink-0 items-center">
                <img
                  id="LogoImage"
                  src="/assets/Elevated HL white no HL or border.svg"
                  alt="Logo"
                  className="h-6 w-auto"
                />
              </div>
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navigation.map((item) => (
                        <li key={item.name}>
                          {item.isSoftphone ? (
                            <a
                              onClick={onToggleSoftphone}
                              className={classNames(
                                "text-text hover:bg-titleButtonHoverBg hover:text-text",
                                "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 cursor-pointer"
                              )}
                            >
                              {item.icon &&
                                React.createElement(item.icon, {
                                  "aria-hidden": "true",
                                  className: "h-6 w-6 shrink-0",
                                })}
                              {item.name}
                            </a>
                          ) : (
                            <a
                              onClick={() => handleNavigation(item.path)}
                              className={classNames(
                                location.pathname === item.path
                                  ? "bg-titleButtonHoverBg text-text"
                                  : "text-text hover:bg-titleButtonHoverBg hover:text-text",
                                "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 cursor-pointer"
                              )}
                            >
                              {item.icon &&
                                React.createElement(item.icon, {
                                  "aria-hidden": "true",
                                  className: "h-6 w-6 shrink-0",
                                })}
                              {item.name}
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </li>
                  <li className="-mx-6 mt-auto flex flex-col justify-center">
                    <ThemeSwitcher />
                    <a
                      onClick={onToggleSoftphone}
                      className={classNames(
                        "text-text hover:bg-titleButtonHoverBg hover:text-text",
                        "group flex gap-x-3 pl-4 p-2 text-sm font-semibold leading-6 cursor-pointer"
                      )}
                    >
                      <PhoneIcon className="h-5 w-5 rounded-full" />
                      <span className="sr-only">Communications</span>
                      <span className="select-none" aria-hidden="true">
                        Communications
                      </span>
                    </a>
                    <div className="border-t border-gray-800"></div>
                    <ProfileDropdown />
                  </li>
                </ul>
              </nav>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-48 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-sidebarBg px-6">
          <div className="flex h-20 shrink-0 items-center">
            <img
              id="LogoImage"
              src="/assets/Elevated HL white no HL or border.svg"
              alt="Logo"
              className="h-6 w-auto"
            />
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      {item.isSoftphone ? (
                        <a
                          onClick={onToggleSoftphone}
                          className={classNames(
                            "text-text hover:bg-titleButtonHoverBg hover:text-text",
                            "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 cursor-pointer"
                          )}
                        >
                          {item.icon &&
                            React.createElement(item.icon, {
                              "aria-hidden": "true",
                              className: "h-6 w-6 shrink-0",
                            })}
                          {item.name}
                        </a>
                      ) : (
                        <a
                          onClick={() => handleNavigation(item.path)}
                          className={classNames(
                            location.pathname.includes(item.path)
                              ? "bg-titleButtonBg text-text"
                              : "text-text hover:bg-titleButtonHoverBg hover:text-text",
                            "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 cursor-pointer"
                          )}
                        >
                          {item.icon &&
                            React.createElement(item.icon, {
                              "aria-hidden": "true",
                              className: "h-6 w-6 shrink-0",
                            })}
                          {item.name}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
              <li className="-mx-6 mt-auto flex flex-col justify-center">
                <ThemeSwitcher />
                <a
                  onClick={onToggleSoftphone}
                  className={classNames(
                    "text-text hover:bg-titleButtonHoverBg hover:text-text",
                    "group flex gap-x-3 pl-4 p-2 text-sm font-semibold leading-6 cursor-pointer"
                  )}
                >
                  <PhoneIcon className="h-5 w-5 rounded-full" />
                  <span className="sr-only">Communications</span>
                  <span className="select-none" aria-hidden="true">
                    Communications
                  </span>
                </a>
                <div className="border-t border-gray-800"></div>
                <ProfileDropdown />
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-sidebarBg px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="-m-2.5 p-2.5 text-gray-400 lg:hidden"
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon aria-hidden="true" className="h-6 w-6 text-primaryText" />
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 text-text">
          ECM
        </div>
        <a href="#">
          <span className="sr-only">Your profile</span>
          <UserCircleIcon className="h-8 w-8 rounded-full" />
        </a>
      </div>
    </>
  );
};

export default SideBar;
