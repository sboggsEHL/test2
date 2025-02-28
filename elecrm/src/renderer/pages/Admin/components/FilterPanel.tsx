import React from 'react';
import { Menu, MenuButton } from '@headlessui/react';
import { ChevronDownIcon, CalendarIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { PhoneIcon } from '@heroicons/react/24/solid';

interface FilterPanelProps {
  searchTerm: string;
  startDate: string;
  endDate: string;
  onSearchChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

const dateRangeOptions = [
  { name: 'Last 7 days', value: '7' },
  { name: 'Last 30 days', value: '30' },
  { name: 'Last 90 days', value: '90' },
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  searchTerm,
  startDate,
  endDate,
  onSearchChange,
  onStartDateChange,
  onEndDateChange,
}) => {
  const handleDateRangeSelect = (days: string) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - parseInt(days));

    onStartDateChange(start.toISOString().split('T')[0]);
    onEndDateChange(end.toISOString().split('T')[0]);
  };

  const handleClearAll = () => {
    onSearchChange('');
    onStartDateChange('');
    onEndDateChange('');
  };

  const hasActiveFilters = searchTerm || startDate || endDate;
  const activeFilters = [
    searchTerm && 'Search',
    (startDate || endDate) && 'Date range'
  ].filter(Boolean);

  return (
    <div className="flex items-center justify-between">
      {/* Left side - Filter badges and clear all */}
      <div className="flex items-center gap-2">
        {hasActiveFilters && (
          <>
            <span className="text-sm text-text">Filters:</span>
            {activeFilters.map((filter) => (
              <span
                key={filter}
                className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
              >
                {filter}
              </span>
            ))}
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10 hover:bg-red-100 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
              Clear all
            </button>
          </>
        )}
      </div>

      {/* Right side - Search and Date range */}
      <div className="flex items-center gap-4">
        <div className="relative w-72">
          <input
            type="text"
            name="search"
            id="search"
            className={`block w-full rounded-md border-0 py-2 pl-10 text-text shadow-sm ring-1 ring-inset ${
              searchTerm ? 'ring-titleButtonBg' : 'ring-gray-700'
            } placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-titleButtonBg sm:text-sm sm:leading-6 bg-mainContentBg`}
            placeholder="Search phone numbers..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <PhoneIcon className="h-5 w-5 text-text" aria-hidden="true" />
          </div>
          {searchTerm && (
            <button
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-text"
              onClick={() => onSearchChange('')}
            >
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>

        <Menu as="div" className="relative">
          <MenuButton 
            className={`inline-flex items-center rounded-md bg-mainContentBg px-3 py-2 text-sm font-medium text-text ring-1 ring-inset ${
              startDate || endDate ? 'ring-titleButtonBg' : 'ring-gray-700'
            } hover:bg-gray-700 focus:outline-none transition-colors`}
          >
            <CalendarIcon className="h-5 w-5 text-text mr-2" aria-hidden="true" />
            <span>
              {startDate || endDate ? (
                `${startDate ? new Date(startDate).toLocaleDateString() : 'Start'} - ${
                  endDate ? new Date(endDate).toLocaleDateString() : 'End'
                }`
              ) : (
                'Date range'
              )}
            </span>
            <ChevronDownIcon className="ml-2 h-5 w-5 text-text" aria-hidden="true" />
          </MenuButton >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-mainContentBg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {dateRangeOptions.map((option) => (
                <Menu.Item key={option.value}>
                  {({ active }) => (
                    <button
                      onClick={() => handleDateRangeSelect(option.value)}
                      className={`${
                        active ? 'bg-gray-700 text-text' : 'text-text'
                      } block px-4 py-2 text-sm w-full text-left transition-colors`}
                    >
                      {option.name}
                    </button>
                  )}
                </Menu.Item>
              ))}
              <div className="px-4 py-3 space-y-3 border-t border-gray-700">
                <div className="space-y-1">
                  <label htmlFor="start-date" className="block text-sm font-medium text-text">
                    Start date
                  </label>
                  <input
                    type="date"
                    id="start-date"
                    value={startDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 px-2 text-sm text-text shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-titleButtonBg bg-mainContentBg"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="end-date" className="block text-sm font-medium text-text">
                    End date
                  </label>
                  <input
                    type="date"
                    id="end-date"
                    value={endDate}
                    onChange={(e) => onEndDateChange(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 px-2 text-sm text-text shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-titleButtonBg bg-mainContentBg"
                  />
                </div>
              </div>
            </div>
          </Menu.Items>
        </Menu>
      </div>
    </div>
  );
};
