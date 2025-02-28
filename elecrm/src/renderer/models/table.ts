import { ReactNode } from 'react';

export interface ExtendedColumn<T> {
  Header: string;
  accessor: keyof T | 'select' | 'button' | 'actions';
  Cell?: (props: { row: T, toggleRowSelected: (row: T) => void }) => ReactNode;
  sortable?: boolean;
  sortDirection?: "asc" | "desc";
  Filter?: ReactNode;
  filter?: string;
}
