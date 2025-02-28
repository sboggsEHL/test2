export interface CallLog {
  id: string;
  timestamp: string;
  from_number: string;
  to_number: string;
  call_duration: number;
  call_status: 'completed' | 'failed' | 'in-progress';
  recording_url?: string;
  call_sid: string;
  result?: string;
  direction: 'inbound' | 'outbound';
  mos_score?: number;
  user?: {
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  timeZone?: string; // Add timeZone property
}


export interface CallLogPaginationResponse {
  logs: CallLog[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
  };
}

export interface CallLogFilters {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}
