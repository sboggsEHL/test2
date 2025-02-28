import React, { useState, useEffect } from "react";
import { Table } from "../../../components/TableComponent";
import { ExtendedColumn } from "../../../models";
import { Dialog } from "@headlessui/react";
import { FilterPanel } from "./FilterPanel";
import {
  ArrowPathIcon,
  ArrowDownTrayIcon,
  PhoneArrowUpRightIcon,
  PhoneArrowDownLeftIcon,
  PhoneXMarkIcon,
  CheckIcon,
} from "@heroicons/react/20/solid";
import { useCallLogs } from "../../../context/CallLogsContext";
import { CallLog } from "../../../models/callLog";
import {
  formatPhoneNumber,
  capitalizeFullName,
} from "../../../utils/formatters";
import { format, toZonedTime } from "date-fns-tz";
import {
  ArrowDownIcon,
  ArrowDownLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowUpRightIcon,
} from "@heroicons/react/24/solid";

type CallLogWithActions = CallLog & {
  actions: string;
};

export const CallLogs: React.FC = () => {
  const {
    filteredLogs,
    loading,
    error,
    selectedCall,
    setSelectedCall,
    fetchCallLogs,
    exportCallLogs,
    filters,
    setFilters,
    pagination,
    setCurrentPage,
    getCurrentPageData,
  } = useCallLogs();

  const [sortedData, setSortedData] = useState<CallLogWithActions[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Table columns configuration
  const columns: Array<ExtendedColumn<CallLogWithActions>> = [
    {
      Header: "Call Start Time",
      accessor: "timestamp",
      sortable: true,
      Cell: ({ row }) => {
        if (!row.timestamp) return "Invalid Date";
        try {
          const date = new Date(row.timestamp);
          const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const localDate = toZonedTime(date, timeZone);
          return format(localDate, "MMM dd, yyyy hh:mm:ss a");
        } catch {
          return "Invalid Date";
        }
      },
    },
    {
      Header: "Direction",
      accessor: "direction",
      sortable: true,
      Cell: ({ row }) => (
        <span
          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
            row.direction === "outbound"
              ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20"
              : "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20"
          }`}
        >
          {row.direction === "outbound" ? (
            <ArrowUpRightIcon className="h-3 w-3 mr-1" />
          ) : (
            <ArrowDownLeftIcon className="h-3 w-3 mr-1" />
          )}
          {row.direction}
        </span>
      ),
    },
    {
      Header: "Result",
      accessor: "call_status",
      sortable: true,
      Cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
            row.call_status === "completed"
              ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
              : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
          }`}
        >
          {row.call_status === "completed" ? (
            <CheckIcon className="h-3 w-3 mr-1" />
          ) : (
            <PhoneXMarkIcon className="h-3 w-3 mr-1" />
          )}
          {row.call_status}
        </span>
      ),
    },
    {
      Header: "From",
      accessor: "from_number",
      sortable: true,
      Cell: ({ row }) => formatPhoneNumber(row.from_number),
    },
    {
      Header: "To",
      accessor: "to_number",
      sortable: true,
      Cell: ({ row }) => formatPhoneNumber(row.to_number),
    },
    {
      Header: "Call Owner",
      accessor: "user",
      sortable: true,
      Cell: ({ row }) =>
        row.user
          ? capitalizeFullName(row.user.first_name, row.user.last_name)
          : "-",
    },
    {
      Header: "Duration",
      accessor: "call_duration",
      sortable: true,
      Cell: ({ row }) => {
        const duration = Number(row.call_duration);
        if (isNaN(duration)) return "0s";
        if (duration < 60) return `${duration}s`;
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
      },
    },
    {
      Header: "View Log",
      accessor: "actions",
      Cell: ({ row }) => (
        <button
          onClick={() => setSelectedCall(row)}
          className="text-orange-500 hover:text-blue-400 transition-colors"
        >
          View Details
        </button>
      ),
    },
  ];

  useEffect(() => {
    fetchCallLogs({
      startDate,
      endDate,
    });
  }, [startDate, endDate, fetchCallLogs]);

  useEffect(() => {
    setFilters({
      searchTerm,
      startDate,
      endDate,
    });
  }, [searchTerm, startDate, endDate, setFilters]);

  const handleSort = (column: string) => {
    const newDirection =
      filters.sortColumn === column && filters.sortDirection === "asc"
        ? "desc"
        : "asc";

    setFilters({
      ...filters,
      sortColumn: column,
      sortDirection: newDirection,
    });

    const filteredData = filteredLogs.filter((log) => {
      const matchesSearch =
        log.from_number.includes(searchTerm) ||
        log.to_number.includes(searchTerm);
      const matchesDate =
        (!startDate || new Date(log.timestamp) >= new Date(startDate)) &&
        (!endDate || new Date(log.timestamp) <= new Date(endDate));
      return matchesSearch && matchesDate;
    });

    const sortedData = filteredData.sort((a, b) => {
      const direction = newDirection === "asc" ? 1 : -1;
      switch (column) {
        case "call_status":
          const statusOrder = ["completed", "in-progress", "failed"];
          return (
            direction *
            (statusOrder.indexOf(a.call_status) -
              statusOrder.indexOf(b.call_status))
          );
        case "timestamp":
          return (
            direction *
            (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          );
        case "from_number":
        case "to_number":
          return direction * a[column].localeCompare(b[column]);
        case "call_duration":
          return direction * (a.call_duration - b.call_duration);
        case "direction":
          return direction * a.direction.localeCompare(b.direction);
        case "user":
          const aName = a.user ? `${a.user.first_name} ${a.user.last_name}` : '';
          const bName = b.user ? `${b.user.first_name} ${b.user.last_name}` : '';
          return direction * aName.localeCompare(bName);
        default:
          return 0;
      }
    });

    setSortedData(
      sortedData.map((log) => ({
        ...log,
        actions: "",
      }))
    );
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setFilters({
      searchTerm: "",
      startDate: "",
      endDate: "",
      sortColumn: "timestamp",
      sortDirection: "desc",
    });
    fetchCallLogs();
  };

  const handleExport = () => {
    exportCallLogs({
      startDate,
      endDate,
    });
  };

  if (error) {
    return (
      <div className="p-4 text-red-500">Error loading call logs: {error}</div>
    );
  }

  const currentPageData: CallLogWithActions[] = getCurrentPageData().map(
    (log) => ({
      ...log,
      actions: "",
    })
  );

  const renderTable = () => {
    return (
      <Table
        columns={columns}
        data={sortedData.length > 0 ? sortedData : currentPageData}
        enablePagination
        itemsPerPage={30}
        totalItems={filteredLogs.length}
        currentPage={pagination.currentPage}
        setCurrentPage={setCurrentPage}
        sortState={{
          column: filters.sortColumn,
          direction: filters.sortDirection,
        }}
        onSort={handleSort}
        className="w-full p-0"
        actionButtons={
          <div className="flex items-center">
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center rounded-md bg-mainContentBg px-3 py-2 text-sm font-semibold text-text shadow-sm ring-1 ring-inset ring-gray-700 hover:bg-gray-700 transition-colors mr-4"
              disabled={loading}
            >
              <ArrowPathIcon
                className={`h-5 w-5 mr-1.5 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Loading..." : "Refresh"}
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center rounded-md bg-titleButtonBg px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-titleButtonHoverBg transition-colors"
              disabled={loading}
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-1.5" />
              Export (CSV)
            </button>
          </div>
        }
      />
    );
  };

  return (
    <div className="bg-mainContentBg h-full py-4 pb-16 flex flex-col">
      <div className="border-b border-gray-700 mb-4">
        <div className="px-4 pb-2">
          <h1 className="text-base font-semibold text-text">Call Logs</h1>
          <p className="mt-2 text-sm text-text">
            A list of all calls made and received by your team.
          </p>
        </div>
      </div>
      <div className="px-4 mb-4">
        <FilterPanel
          searchTerm={searchTerm}
          startDate={startDate}
          endDate={endDate}
          onSearchChange={setSearchTerm}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </div>
      <div className="overflow-hidden rounded-lg h-full pb-4">
        {loading ? <div>Loading...</div> : renderTable()}
      </div>

      <Dialog
        open={!!selectedCall}
        onClose={() => setSelectedCall(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded bg-mainContentBg p-6">
            <Dialog.Title className="text-lg font-medium text-text mb-4">
              Call Details
            </Dialog.Title>
            {selectedCall && (
              <div className="space-y-4">
                <p className="text-sm text-text">
                  <strong>Call SID:</strong> {selectedCall.call_sid}
                </p>
                <p className="text-sm text-text">
                  <strong>Time:</strong>{" "}
                  {selectedCall.timestamp
                    ? (() => {
                        const date = new Date(selectedCall.timestamp);
                        const timeZone =
                          selectedCall.timeZone || "America/Phoenix";
                        return new Intl.DateTimeFormat("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                          timeZone: timeZone,
                        }).format(date);
                      })()
                    : "Invalid Date"}
                </p>
                <p className="text-sm text-text">
                  <strong>From:</strong>{" "}
                  {formatPhoneNumber(selectedCall.from_number)}
                </p>
                <p className="text-sm text-text">
                  <strong>To:</strong>{" "}
                  {formatPhoneNumber(selectedCall.to_number)}
                </p>
                <p className="text-sm text-text">
                  <strong>Duration:</strong>{" "}
                  {(() => {
                    const duration = Number(selectedCall.call_duration);
                    if (isNaN(duration)) return "0s";
                    if (duration < 60) return `${duration}s`;
                    const minutes = Math.floor(duration / 60);
                    const seconds = duration % 60;
                    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
                  })()}
                </p>
                <p className="text-sm text-text">
                  <strong>Status:</strong> {selectedCall.call_status}
                </p>
                {selectedCall.mos_score && (
                  <p className="text-sm text-text">
                    <strong>MOS Score:</strong> {selectedCall.mos_score}
                  </p>
                )}
                {selectedCall.user && (
                  <p className="text-sm text-text">
                    <strong>Agent:</strong>{" "}
                    {capitalizeFullName(
                      selectedCall.user.first_name,
                      selectedCall.user.last_name
                    )}
                  </p>
                )}
                {selectedCall.recording_url && (
                  <div>
                    <p className="text-sm font-medium text-text mb-2">
                      Recording:
                    </p>
                    <audio
                      controls
                      src={selectedCall.recording_url}
                      className="w-full"
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="rounded-md bg-titleButtonBg px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-titleButtonHoverBg"
                onClick={() => setSelectedCall(null)}
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};
