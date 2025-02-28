import React, { useEffect, useState } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronUpIcon, CheckIcon } from "@heroicons/react/20/solid";
import {
  ArrowLeftStartOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import { useUser } from "../context/UserContext";
import { classNames } from "../utils";
import { UserStatusTypes } from "../models/status";

const statuses = [
  { id: 1, name: "Available", value: UserStatusTypes.AVAILABLE, color: "bg-green-400" },
  { id: 4, name: "Away", value: UserStatusTypes.AWAY, color: "bg-yellow-400" },
  { id: 3, name: "Do Not Disturb", value: UserStatusTypes.DND, color: "bg-red-400" },
];

const ProfileDropdown = () => {
  const { username, logout, updateStatus, status } = useUser();
  const [selectedStatus, setSelectedStatus] = useState(() => 
    statuses.find(s => s.value === status) || statuses[0]
  );

  useEffect(() => {
    setSelectedStatus(statuses.find(s => s.value === status) || statuses[0]);
  }, [status]);

  return (
    <div className="relative flex flex-col items-center">
      <Listbox
        value={selectedStatus}
        onChange={(status) => {
          setSelectedStatus(status);
          updateStatus(status.value);
        }}
      >
        <div className="relative w-48">
          {/* Button */}
          <ListboxButton className="flex items-center gap-3 p-2 w-full rounded-none bg-sidebarBg text-text hover:bg-gray-800 cursor-pointer justify-between">
            <div className="flex gap-2">
              <UserCircleIcon className="h-8 w-8 rounded-full text-gray-400" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-normal">{username}</span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <span
                    className={classNames(
                      selectedStatus.color,
                      "inline-block w-2.5 h-2.5 rounded-full border border-transparent"
                    )}
                  />
                  {selectedStatus.name}
                </span>
              </div>
            </div>

            <ChevronUpIcon className="h-5 w-5 text-gray-400" />
          </ListboxButton>

          {/* Dropdown Options */}
          <ListboxOptions className="absolute bottom-full mb-2 w-full bg-gray-900 rounded-none shadow-lg ring-1 ring-black/5 z-50">
            {statuses.map((status) => (
              <ListboxOption
                key={status.id}
                value={status}
                className={({ active, selected }) =>
                  classNames(
                    active ? "bg-blue-600 text-white" : "text-text",
                    selected ? "font-semibold" : "font-normal ",
                    "relative cursor-pointer select-none py-2 pl-3 pr-9 text-sm"
                  )
                }
              >
                <div className="flex items-center">
                  <span
                    aria-hidden="true"
                    className={classNames(
                      status.color,
                      "inline-block w-2.5 h-2.5 rounded-full border border-transparent"
                    )}
                  />
                  <span className="ml-3 block truncate">{status.name}</span>
                </div>
                {selectedStatus.id === status.id && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                    <CheckIcon className="w-5 h-5" aria-hidden="true" />
                  </span>
                )}
              </ListboxOption>
            ))}
            <div className="border-t border-gray-800 my-4"></div>
            {/* Logout Option */}
            <div
              onClick={logout}
              className="group flex gap-x-3 pl-2 p-2 text-sm font-semibold leading-6 text-text hover:bg-titleButtonHoverBg hover:text-text cursor-pointer"
            >
              <ArrowLeftStartOnRectangleIcon className="h-6 w-6" />
              Sign Out
            </div>
          </ListboxOptions>
        </div>
      </Listbox>
    </div>
  );
};

export default ProfileDropdown;
