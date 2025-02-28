import { CallLog, CallLogPaginationResponse, CallLogFilters } from '../models/callLog';

export class CallLogsService {
  private BASE_URL = import.meta.env.VITE_API_BASE_URL;

  private mapStatusToResult(status: string): 'connected' | 'didn\'t connect' | 'dropped' {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'connected';
      case 'failed':
      case 'busy':
      case 'no-answer':
        return 'didn\'t connect';
      case 'canceled':
        return 'dropped';
      default:
        return 'didn\'t connect';
    }
  }

  async getCallLogs(filters?: CallLogFilters): Promise<CallLogPaginationResponse> {
    try {
      console.log('[CallLogsService] Fetching call logs with filters:', filters);
      
      // Only use date range for server-side filtering
      const queryParams = new URLSearchParams();
      if (filters?.startDate) {
        queryParams.append('startDate', filters.startDate);
      }
      if (filters?.endDate) {
        queryParams.append('endDate', filters.endDate);
      }

      const url = `${this.BASE_URL}/api/signalwire/call/call-logs?${queryParams.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('[CallLogsService] Error fetching call logs:', errorBody);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody}`);
      }

      const data = await response.json();
      
      // Map API response to our model
      const logsWithResult = data.logs.map((log: any) => ({
        ...log,
        timestamp: log.start_time,
        result: this.mapStatusToResult(log.status)
      }));

      console.log('[CallLogsService] Call logs fetched successfully:', data);
      
      return {
        ...data,
        logs: logsWithResult
      };
    } catch (error) {
      console.error('[CallLogsService] Unexpected error:', error);
      throw error;
    }
  }

  async exportCallLogs(filters?: CallLogFilters): Promise<Blob> {
    try {
      console.log('[CallLogsService] Exporting call logs with filters:', filters);
      
      // Only use date range for server-side filtering
      const queryParams = new URLSearchParams();
      if (filters?.startDate) {
        queryParams.append('startDate', filters.startDate);
      }
      if (filters?.endDate) {
        queryParams.append('endDate', filters.endDate);
      }

      const url = `${this.BASE_URL}/api/signalwire/call-logs/export?${queryParams.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('[CallLogsService] Error exporting call logs:', errorBody);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('[CallLogsService] Unexpected error during export:', error);
      throw error;
    }
  }

  private getAuthToken(): string {
    return sessionStorage.getItem('token') || '';
  }
}

export const callLogsService = new CallLogsService();
