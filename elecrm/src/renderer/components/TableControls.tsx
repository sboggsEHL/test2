import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import React from "react";

interface TableControlsProps {
  searchPlaceholderText?: string;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  sortBy?: string;
  setSortBy?: React.Dispatch<React.SetStateAction<string>>;
  sortOptions?: { value: string; label: string }[];
  children?: React.ReactNode;
}

const TableControls: React.FC<TableControlsProps> = ({
  searchPlaceholderText = "Search",
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  sortOptions = [],
  children,
}) => {
  const classesInput =
    "w-full rounded-md border-0 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-orange-400 sm:text-sm";

  const renderSearchBar = () => {
    return (
      <div className="relative rounded-md shadow-sm w-full sm:flex-1">
        <MagnifyingGlassIcon
          aria-hidden="true"
          className="h-8 w-8 text-slate-400 pointer-events-none absolute inset-y-0 pl-3"
        />
        <input
          id="search"
          name="search"
          type="search"
          placeholder={searchPlaceholderText}
          className={classesInput + " pl-10"}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    );
  };

  const renderSortBy = () => {
    if (sortOptions.length > 0 && setSortBy && sortBy !== undefined) {
      return (
        <select
          id="sortBy"
          name="sortBy"
          className={classesInput + " w-full sm:max-w-40"}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    } else {
      return;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-6">
      {renderSearchBar()}
      {renderSortBy()}
      <div className="justify-end">{children}</div>
    </div>
  );
};

export default TableControls;
