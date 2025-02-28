import React, { useState, useMemo, useRef, useEffect, MouseEvent as ReactMouseEvent } from 'react';
import { useTable, useFilters, useSortBy, useResizeColumns, useBlockLayout, Column, HeaderGroup, TableInstance } from 'react-table';
import ReactDOM from 'react-dom';

interface DynamicTableProps {
  data: Array<Record<string, any>>;
  columns: Array<Column<Record<string, any>>>;
  onRowClick?: (row: Record<string, any>) => void;
}

interface FilterDialogProps {
  column: any;
  onClose: () => void;
  position: { top: number; left: number };
}

const FilterDialog: React.FC<FilterDialogProps> = ({ column, onClose, position }) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside as EventListener);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside as EventListener);
    };
  }, [onClose]);

  return ReactDOM.createPortal(
    <div
      ref={dialogRef}
      className="absolute bg-white border rounded shadow-lg p-2 z-50"
      style={{ top: position.top, left: position.left }}
    >
      <input
        value={column.filterValue || ''}
        onChange={(e) => {
          column.setFilter(e.target.value || undefined);
        }}
        placeholder={`Filter ${column.Header}`}
        className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
        autoFocus
      />
    </div>,
    document.body
  );
};

interface HeaderProps {
  column: HeaderGroup<Record<string, any>> & {
    getSortByToggleProps: () => any;
    isSorted: boolean;
    isSortedDesc: boolean;
    canFilter: boolean;
    canResize: boolean;
    getResizerProps: () => any;
    isResizing: boolean;
  };
  onFilterClick: (column: any, position: { top: number; left: number }) => void;
}

const Header: React.FC<HeaderProps> = ({ column, onFilterClick }) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center p-2 font-semibold border-b relative cursor-pointer"
      style={{
        borderColor: 'var(--glass-border)',
        color: 'var(--sidebar-text-color)',
        minWidth: column.minWidth,
        width: column.width,
        maxWidth: column.maxWidth,
        wordWrap: 'break-word',
        textAlign: 'center',
      }}
    >
      <div
        className="flex flex-col items-center justify-between w-full"
        {...column.getHeaderProps(column.getSortByToggleProps())}
      >
        <span onClick={(e: ReactMouseEvent) => e.stopPropagation()} className="text-center">
          {column.render('Header')}
        </span>
        <span className="ml-1">
          {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
        </span>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="ml-2 mt-1 w-4 h-4 text-gray-500"
        onClick={(e: ReactMouseEvent) => {
          e.stopPropagation();
          const rect = ref.current!.getBoundingClientRect();
          onFilterClick(column, { top: rect.bottom, left: rect.left });
        }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
      {column.canResize && (
        <div
          {...column.getResizerProps()}
          className={`absolute right-0 top-0 h-full w-1 cursor-col-resize ${
            column.isResizing ? 'bg-blue-500' : ''
          }`}
          style={{ backgroundColor: 'var(--glass-border)' }}
        />
      )}
    </div>
  );
};

const DynamicTable: React.FC<DynamicTableProps> = ({ data, columns, onRowClick }) => {
  const [filterVisibility, setFilterVisibility] = useState<Record<string, boolean>>({});
  const [activeFilter, setActiveFilter] = useState<{ column: any; position: { top: number; left: number } } | null>(null);

  const toggleFilterVisibility = (columnId: string) => {
    setFilterVisibility((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  const defaultColumn = useMemo(
    () => ({
      minWidth: 30,
      width: 150,
      maxWidth: 400,
      Filter: ({ column }: { column: HeaderGroup<Record<string, any>> & { filterValue: any; setFilter: Function; preFilteredRows: any[]; id: string; } }) => (
        <></> // Remove the default filter rendering
      ),
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setColumnOrder,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
    },
    useFilters,
    useSortBy,
    useResizeColumns,
    useBlockLayout
  ) as TableInstance<Record<string, any>> & { setColumnOrder: (order: string[]) => void };

  const handleFilterClick = (column: any, position: { top: number; left: number }) => {
    setActiveFilter({ column, position });
  };

  return (
    <div
      className="overflow-x-auto"
      style={{ backgroundColor: 'var(--main-content-bg)', boxShadow: 'var(--shadow-md)' }}
    >
      <table {...getTableProps()} className="min-w-full border-collapse">
        <thead>
          {headerGroups.map((headerGroup: HeaderGroup<Record<string, any>>) => (
            <tr {...headerGroup.getHeaderGroupProps()} style={{ backgroundColor: 'var(--sidebar-bg)' }}>
              {headerGroup.headers.map((column) => (
                <th key={column.id} className="relative" style={{ padding: 0 }}>
                  <Header
                    column={column as HeaderProps['column']}
                    onFilterClick={handleFilterClick}
                  />
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr
                {...row.getRowProps()}
                onClick={() => onRowClick && onRowClick(row.original)}
                className="hover:bg-gray-50 cursor-pointer"
                style={{ backgroundColor: 'var(--main-content-bg)', color: 'var(--main-text-color)' }}
              >
                {row.cells.map((cell) => (
                  <td {...cell.getCellProps()} className="p-2 border-b" style={{ borderColor: 'var(--glass-border)' }}>
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {activeFilter && (
        <FilterDialog
          column={activeFilter.column}
          onClose={() => setActiveFilter(null)}
          position={activeFilter.position}
        />
      )}
    </div>
  );
};

export default DynamicTable;
