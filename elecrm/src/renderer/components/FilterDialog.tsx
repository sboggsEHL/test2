import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

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

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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

export default FilterDialog;
