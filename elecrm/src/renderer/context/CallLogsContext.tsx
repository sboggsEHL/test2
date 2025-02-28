import React, { createContext, useContext, useState, useCallback } from 'react';
import { CallLog, CallLogFilters } from '../models/callLog';
import { callLogsService } from '../services/CallLogsService';

interface CallLogsState {
  allLogs: CallLog[];
  filteredLogs: CallLog[];
  loading: boolean;
  error: string | null;
  selectedCall: CallLog | null;
  filters: {
    searchTerm: string;
    startDate: string;
    endDate: string;
    sortColumn: string;
    sortDirection: 'asc' | 'desc';
  };
  pagination: {
    currentPage: number;
    pageSize: number;
  };
}

interface CallLogsContextType extends CallLogsState {
  fetchCallLogs: (filters?: CallLogFilters) => Promise<void>;
  exportCallLogs: (filters?: CallLogFilters) => Promise<void>;
  setSelectedCall: (call: CallLog | null) => void;
  setFilters: (filters: Partial<CallLogsState['filters']>) => void;
  setCurrentPage: (page: number) => void;
  getCurrentPageData: () => CallLog[];
}

const CallLogsContext = createContext<CallLogsContextType | undefined>(undefined);

const filterLogs = (logs: CallLog[], filters: CallLogsState['filters']) => {
  return logs.filter(log => {
    // Date range filter
    if (filters.startDate && new Date(log.timestamp) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(log.timestamp) > new Date(filters.endDate)) return false;
    
    // Search term filter (phone numbers and names)
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      const cleanedSearch = search.replace(/\D/g, '');
      const cleanedFromNumber = log.from_number.replace(/\D/g, '');
      const cleanedToNumber = log.to_number.replace(/\D/g, '');
      
      return cleanedFromNumber.includes(cleanedSearch) || 
             cleanedToNumber.includes(cleanedSearch) ||
             (log.user?.first_name?.toLowerCase().includes(search)) ||
             (log.user?.last_name?.toLowerCase().includes(search));
    }
    
    return true;
  });
};

const sortLogs = (logs: CallLog[], column: string, direction: 'asc' | 'desc') => {
  return [...logs].sort((a, b) => {
    let comparison = 0;
    switch (column) {
      case 'timestamp':
        comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        break;
      case 'duration':
        comparison = a.call_duration - b.call_duration;
        break;
      case 'user':
        const aName = a.user ? `${a.user.first_name} ${a.user.last_name}` : '';
        const bName = b.user ? `${b.user.first_name} ${b.user.last_name}` : '';
        comparison = aName.localeCompare(bName);
        break;
      case 'direction':
        comparison = a.direction.localeCompare(b.direction);
        break;
      case 'from_number':
        comparison = a.from_number.localeCompare(b.from_number);
        break;
      case 'to_number':
        comparison = a.to_number.localeCompare(b.to_number);
        break;
      default:
        comparison = 0;
    }
    return direction === 'asc' ? comparison : -comparison;
  });
};

export const CallLogsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CallLogsState>({
    allLogs: [],
    filteredLogs: [],
    loading: false,
    error: null,
    selectedCall: null,
    filters: {
      searchTerm: '',
      startDate: '',
      endDate: '',
      sortColumn: 'timestamp',
      sortDirection: 'desc'
    },
    pagination: {
      currentPage: 1,
      pageSize: 30
    }
  });

  const applyFiltersAndSort = useCallback((logs: CallLog[], filters: CallLogsState['filters']) => {
    let result = filterLogs(logs, filters);
    result = sortLogs(result, filters.sortColumn, filters.sortDirection);
    return result;
  }, []);

  const fetchCallLogs = useCallback(async (filters?: CallLogFilters) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await callLogsService.getCallLogs(filters);
      const filteredLogs = applyFiltersAndSort(response.logs, state.filters);
      
      setState(prev => ({
        ...prev,
        allLogs: response.logs,
        filteredLogs,
        loading: false,
        pagination: {
          ...prev.pagination,
          currentPage: 1
        }
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch call logs',
        loading: false
      }));
    }
  }, [applyFiltersAndSort]); // Removed state.filters dependency

  const exportCallLogs = useCallback(async (filters?: CallLogFilters) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const blob = await callLogsService.exportCallLogs(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `call_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to export call logs',
        loading: false
      }));
    }
  }, []);

  const setSelectedCall = useCallback((call: CallLog | null) => {
    setState(prev => ({ ...prev, selectedCall: call }));
  }, []);

  const setFilters = useCallback((newFilters: Partial<CallLogsState['filters']>) => {
    setState(prev => {
      const updatedFilters = { ...prev.filters, ...newFilters };
      const filteredLogs = applyFiltersAndSort(prev.allLogs, updatedFilters);
      return {
        ...prev,
        filters: updatedFilters,
        filteredLogs,
        pagination: {
          ...prev.pagination,
          currentPage: 1 // Reset to first page when filters change
        }
      };
    });
  }, [applyFiltersAndSort]);

  const setCurrentPage = useCallback((page: number) => {
    setState(prev => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        currentPage: page
      }
    }));
  }, []);

  const getCurrentPageData = useCallback(() => {
    const { currentPage, pageSize } = state.pagination;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return state.filteredLogs.slice(start, end);
  }, [state.filteredLogs, state.pagination]);

  return (
    <CallLogsContext.Provider
      value={{
        ...state,
        fetchCallLogs,
        exportCallLogs,
        setSelectedCall,
        setFilters,
        setCurrentPage,
        getCurrentPageData
      }}
    >
      {children}
    </CallLogsContext.Provider>
  );
};

export const useCallLogs = () => {
  const context = useContext(CallLogsContext);
  if (context === undefined) {
    throw new Error('useCallLogs must be used within a CallLogsProvider');
  }
  return context;
};
