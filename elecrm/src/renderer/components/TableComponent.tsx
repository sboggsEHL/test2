import React, { useState, useEffect, useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { ExtendedColumn } from "../models";

export const TableHead = ({
  children,
  className = "",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <thead className={`bg-mainContentBg ${className}`} {...props}>
    {children}
  </thead>
);

export const TableBody = ({
  children,
  className = "",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <tbody
    className={`divide-y divide-gray-800 bg-chartBg ${className}`}
    {...props}
  >
    {children}
  </tbody>
);

export const TableRow = ({
  children,
  className = "",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <tr className={`${className}`} {...props}>
    {children}
  </tr>
);

export const TableHeader = ({
  children,
  className = "",
  sortable = false,
  sortDirection,
  onClick,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  sortable?: boolean;
  sortDirection?: "asc" | "desc" | null | undefined;
  onClick?: () => void;
}) => (
  <th
    scope="col"
    className={`whitespace-nowrap p-4 text-left text-sm font-semibold sm:pl-6 ${className} ${
      sortable ? "cursor-pointer" : ""
    }`}
    onClick={sortable ? onClick : undefined}
    {...props}
  >
    <div className="flex items-center select-none">
      {children}
      {sortable && (
        <span className="ml-2">
          {sortDirection === "asc" ? "↑" : sortDirection === "desc" ? "↓" : "↕"}
        </span>
      )}
    </div>
  </th>
);

export const TableCell = ({
  children,
  className = "",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <td
    className={`whitespace-nowrap p-4 text-left text-sm sm:pl-6 h-2 ${className}`}
    {...props}
  >
    {children}
  </td>
);

interface TableProps<T> {
  columns: Array<ExtendedColumn<T>>;
  data: Array<T>;
  title?: string;
  actionButtons?: React.ReactNode;
  enablePagination?: boolean;
  itemsPerPage?: number;
  totalItems?: number;
  currentPage?: number;
  setCurrentPage?: (page: number) => void;
  sortState?: { column: string; direction: "asc" | "desc" | null };
  onSort?: (column: string) => void;
  onSelected?: (selectedRows: T[]) => void;
  className?: string;
  onButtonClick?: (row: T) => void;
  loading?: boolean;
}

export const Table = <T extends Record<string, any>>({
  columns,
  data,
  title,
  actionButtons,
  enablePagination = false,
  itemsPerPage = 10,
  totalItems = 0,
  currentPage,
  setCurrentPage,
  sortState,
  onSort,
  onSelected,
  className,
  onButtonClick,
  loading
}: TableProps<T>) => {
  const [selectedRows, setSelectedRows] = useState<Record<number, boolean>>({});
  const prevSelectedRowsRef = useRef(selectedRows);
  const prevDataRef = useRef(data);

  const toggleRowSelected = (rowIndex: number) => {
    const newSelectedRows = {
      ...selectedRows,
      [rowIndex]: !selectedRows[rowIndex],
    };
    setSelectedRows(newSelectedRows);
  };

  useEffect(() => {
    if (onSelected && prevSelectedRowsRef.current !== selectedRows) {
      const selectedData = data.filter((_, index) => selectedRows[index]);
      prevSelectedRowsRef.current = selectedRows;
      onSelected(selectedData);
    }
  }, [selectedRows, data, onSelected]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageClick = (page: number) => {
    setCurrentPage?.(page);
  };

  const classesPageButtons =
    "px-4 py-2 text-sm font-medium text-text ring-1 ring-inset ring-slate-300 hover:bg-titleButtonHoverBg";

  const renderEllipsis = (key: string) => (
    <button key={key} disabled className={classesPageButtons}>
      ...
    </button>
  );

  const renderPageButton = (i: number) => (
    <button
      key={i}
      onClick={() => handlePageClick(i)}
      className={`${classesPageButtons} ${
        i === currentPage ? "bg-titleButtonBg text-gray-50" : ""
      }`}
    >
      {i}
    </button>
  );

  const renderPageButtons = () => {
    const pageButtons = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageButtons.push(renderPageButton(i));
      }
    } else {
      let startPage, endPage;
      if (currentPage! <= 3) {
        startPage = 1;
        endPage = maxPagesToShow - 1;
      } else if (currentPage! + 1 >= totalPages) {
        startPage = totalPages - (maxPagesToShow - 2);
        endPage = totalPages;
      } else {
        startPage = currentPage! - 1;
        endPage = currentPage! + 1;
      }

      for (let i = startPage; i <= endPage; i++) {
        pageButtons.push(renderPageButton(i));
      }

      if (currentPage! > 3) {
        pageButtons.unshift(renderEllipsis("start-ellipsis"));
        pageButtons.unshift(renderPageButton(1));
      }

      if (currentPage! + 1 < totalPages) {
        pageButtons.push(renderEllipsis("end-ellipsis"));
        pageButtons.push(renderPageButton(totalPages));
      }
    }

    return pageButtons;
  };

  const renderPagination = (currentPage: number) => (
    <div className="px-4 py-4 border-t border-slate-200">
      <div className="flex gap-6 justify-between sm:hidden">
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          className="secondary-btn secondary-text w-32 cursor-pointer"
        >
          Previous
        </button>
        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="secondary-btn secondary-text w-32 cursor-pointer"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:items-center sm:justify-between">
        <>
          <p className="text-sm text-text">
            Showing{" "}
            <span className="font-medium">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>
            -
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </span>{" "}
            of <span className="font-medium">{totalItems}</span> results
          </p>
        </>
        <>
          <nav
            aria-label="Pagination"
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
          >
            <button
              onClick={() => handlePageClick(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-l-md px-2 py-2 text-text ring-1 ring-inset ring-slate-300 hover:titleButtonHoverBg cursor-pointer"
            >
              <ChevronLeftIcon
                aria-hidden="true"
                className="h-5 w-5 text-text"
              />
            </button>
            {renderPageButtons()}
            <button
              onClick={() => handlePageClick(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-r-md px-2 py-2 text-text ring-1 ring-inset ring-slate-300 hover:titleButtonHoverBg cursor-pointer"
            >
              <ChevronRightIcon
                aria-hidden="true"
                className="h-5 w-5 text-text"
              />
            </button>
          </nav>
        </>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-titleButtonBg"></div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col overflow-hidden ${className}`}>
      {title && (
        <div className="flex justify-between items-center px-4">
          <h2 className="text-2xl px-2 font-semibold text-text my-6 w-auto">
            {title}
          </h2>
          <div className="flex justify-between align-middle w-10/12 2xl:w-8/12">
            {actionButtons}
          </div>
        </div>
      )}
      <div className="max-h-fit h-full flex-grow-1 overflow-y-auto">
        <table className="min-w-full text-text">
          <TableHead className="border-b border-gray-700 sticky -top-1">
            <TableRow className="bg-mainContentBg w-full">
              {columns.map((column) => (
                <TableHeader
                  key={column.accessor as string}
                  sortable={!!column.sortable}
                  sortDirection={
                    sortState?.column === column.accessor
                      ? sortState?.direction
                      : null
                  }
                  onClick={() => onSort && onSort(column.accessor as string)}
                >
                  {column.Header}
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="even:bg-tableRowGray">
                {columns.map((column) => (
                  <TableCell key={column.accessor as string}>
                    {column.Cell ? (
                      column.Cell({ row, toggleRowSelected: () => toggleRowSelected(rowIndex) })
                    ) : column.accessor === "select" ? (
                      <label className="flex items-center cursor-pointer w-full h-full">
                        <input
                          type="checkbox"
                          className="accent-titleButtonBg cursor-pointer"
                          checked={!!selectedRows[rowIndex]}
                          onChange={() => toggleRowSelected(rowIndex)}
                        />
                      </label>
                    ) : column.accessor === "button" ? (
                      <button
                        onClick={() => onButtonClick?.(row)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md"
                      >
                        {column.Header}
                      </button>
                    ) : (
                      row[column.accessor as keyof T]
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </table>
      </div>
      {enablePagination &&
        currentPage !== undefined &&
        setCurrentPage !== undefined &&
        renderPagination(currentPage)}
    </div>
  );
};
