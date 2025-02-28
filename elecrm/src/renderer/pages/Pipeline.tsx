import React, { useEffect, useState } from "react";
import {
  Button,
  ErrorBanner,
  LoadingIndicator,
  Modal,
  PageHeader,
  Table,
  UpdateLeadForm,
} from "../components";
import { PipelineColumns } from "../data";
import {
  AuthenticationError,
  PipelineLead,
  TokenExpiredError,
} from "../models";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePipeline } from "../context";

const leadsPerPage = 20;

/**
 * Sometimes "assigned" or "assigned_at" isn't on the base PipelineLead interface,
 * so we extend it here. We also add an index signature so we can do a[column].
 */
type PipelineLeadWithAssigned = PipelineLead & {
  assigned?: string;
  assigned_at?: string;
  [key: string]: any;
};

/**
 * Parses either:
 *  1) "DD/MM/YYYY HH:mm" (older format), or
 *  2) "YYYY-MM-DD HH:mm:ss.ffffff" (if there's a space), or
 *  3) a fully ISO-like string with "T" (e.g. "2025-02-18T16:06:28.418Z")
 * into a local Date object.
 */
function parseDDMMYYYYToLocal(dateString?: string): Date | null {
  if (!dateString) {
    console.log("parseDDMMYYYYToLocal: dateString is empty or undefined");
    return null;
  }
  console.log("parseDDMMYYYYToLocal input:", dateString);

  // 1) If there's already a 'T' in the string (like "2025-02-18T16:06:28.418Z"),
  //    we can parse it directly. JavaScript handles ISO strings just fine.
  if (dateString.includes("T")) {
    console.log("Detected existing 'T' => direct parse via new Date()");
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) {
      console.log("parseDDMMYYYYToLocal: invalid ISO date:", dateString);
      return null;
    }
    console.log("parseDDMMYYYYToLocal: final parsed date (ISO path):", dateObj.toISOString());
    return dateObj;
  }

  // 2) If it starts with YYYY-MM-DD (but has a space), e.g. "2025-02-18 16:06:28.418613"
  //    we'll replace the space with 'T' and remove fractional seconds if needed.
  if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
    console.log("Detected potential YYYY-MM-DD format. Attempting parse...");
    const [ymd, timePart] = dateString.split(" ");
    if (!ymd) {
      console.log("parseDDMMYYYYToLocal: no date part found in:", dateString);
      return null;
    }
    let timeNoFraction = timePart?.split(".")[0] || "";
    const isoString = ymd + "T" + timeNoFraction; 
    console.log("parseDDMMYYYYToLocal: constructed ISO:", isoString);

    const dateObj = new Date(isoString);
    if (isNaN(dateObj.getTime())) {
      console.log("parseDDMMYYYYToLocal: invalid date in YYYY-MM-DD parse:", dateString);
      return null;
    }
    console.log("parseDDMMYYYYToLocal: final parsed date (YYYY-MM-DD path):", dateObj.toISOString());
    return dateObj;
  }

  // 3) Otherwise, assume "DD/MM/YYYY HH:mm" format
  const [datePart, timePart] = dateString.split(" ");
  if (!datePart) {
    console.log("parseDDMMYYYYToLocal: no datePart found in:", dateString);
    return null;
  }

  const [day, month, year] = datePart.split("/");
  if (!day || !month || !year) {
    console.log("parseDDMMYYYYToLocal: day/month/year missing in:", dateString);
    return null;
  }

  let hours = 0;
  let minutes = 0;

  if (timePart) {
    const [h, m] = timePart.split(":");
    hours = parseInt(h, 10) || 0;
    minutes = parseInt(m, 10) || 0;
  }

  const dateObj = new Date(+year, +month - 1, +day, hours, minutes);
  if (isNaN(dateObj.getTime())) {
    console.log(
      "parseDDMMYYYYToLocal: invalid date after construction:",
      dateString
    );
    return null;
  }

  console.log(
    "parseDDMMYYYYToLocal: final parsed date (DD/MM/YYYY path):",
    dateObj.toISOString()
  );
  return dateObj;
}

/**
 * Formats a date string (DD/MM/YYYY HH:mm, or "YYYY-MM-DD HH:mm:ss.ffffff", or "YYYY-MM-DDTHH:mm:ssZ")
 * as "MM/DD/YYYY h:mma (time ago)" if it's within the past week, etc.
 */
function formatDateTimeWithRelative(dateString?: string): string {
  const dateObj = parseDDMMYYYYToLocal(dateString);
  if (!dateObj) return "Invalid date";

  // Format as MM/DD/YYYY h:mma
  let month = dateObj.getMonth() + 1;
  let day = dateObj.getDate();
  const year = dateObj.getFullYear();
  let hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours || 12;

  const strMonth = month.toString().padStart(2, "0");
  const strDay = day.toString().padStart(2, "0");
  const strHours = hours.toString();
  const strMinutes = minutes.toString().padStart(2, "0");

  const formattedDate = `${strMonth}/${strDay}/${year} ${strHours}:${strMinutes}${ampm}`;

  // Calculate time difference from "now"
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  if (diffMs < 0) {
    // It's a future date/time, so just show the date
    return formattedDate;
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Build a "time ago" string up to (and including) 7 days
  let relativeStr = "";
  if (diffDays >= 7) {
    // More than a week ago
    relativeStr = `(${diffDays} days ago)`;
  } else if (diffDays >= 2) {
    // 2-6 days
    relativeStr = `(${diffDays} days ago)`;
  } else if (diffDays === 1) {
    // Exactly 1 day => yesterday
    relativeStr = "(yesterday)";
  } else {
    // Same day
    if (diffHours >= 1) {
      // Hours + minutes
      const remainderMinutes = diffMinutes % 60;
      if (remainderMinutes > 0) {
        relativeStr = `(${diffHours} hour${
          diffHours === 1 ? "" : "s"
        }, ${remainderMinutes} minute${
          remainderMinutes === 1 ? "" : "s"
        } ago)`;
      } else {
        relativeStr = `(${diffHours} hour${diffHours === 1 ? "" : "s"} ago)`;
      }
    } else {
      // Less than an hour => minutes
      if (diffMinutes <= 1) {
        relativeStr = "(just now)";
      } else {
        relativeStr = `(${diffMinutes} minute${
          diffMinutes === 1 ? "" : "s"
        } ago)`;
      }
    }
  }

  return `${formattedDate} ${relativeStr}`;
}

const Pipeline = () => {
  const { leads, loadLeads, loading, error } = usePipeline();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Partial<PipelineLead>>();
  const [searchColumn, setSearchColumn] = useState("first_name");
  const [filteredData, setFilteredData] = useState<PipelineLead[]>(leads);
  const [sortState, setSortState] = useState<{
    column: string;
    direction: "asc" | "desc" | null;
  }>({ column: "created_at", direction: "desc" });
  const [leadsLoaded, setLeadsLoaded] = useState(false); // New state to track if leads are loaded

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleLoadingLeads = () => {
    const username = sessionStorage.getItem("username");
    if (username && !loading) {
      console.log("Loading leads for user:", username);
      loadLeads(username).then(() => setLeadsLoaded(true)); // Set leadsLoaded to true once leads are loaded
    }
  };

  useEffect(() => {
    handleLoadingLeads();
  }, []);

  useEffect(() => {
    setFilteredData(leads);
  }, [leads]);

  useEffect(() => {
    if (
      error instanceof AuthenticationError ||
      error instanceof TokenExpiredError
    ) {
      // navigate("/" + AppRoutes.Login);
    }
  }, [error, navigate]);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredData(leads);
    } else {
      const filtered = leads.filter((lead: PipelineLead) => {
        const value = lead[searchColumn as keyof PipelineLead] as string;
        return value
          ?.toString()
          ?.toLowerCase()
          ?.includes(searchTerm.toLowerCase());
      });
      setFilteredData(filtered);
    }
  }, [searchTerm, searchColumn, leads]);

  useEffect(() => {
    const selectedLeadId = searchParams.get("selectedLead");

    // Only run this logic if the leads have finished loading
    if (leadsLoaded && selectedLeadId && leads.length > 0) {
      const lead = leads.find((ld) => ld.lead_id?.toString() === selectedLeadId);
      if (lead) {
        setSelectedLead(lead);
        setIsModalOpen(true);
      }
    }
  }, [searchParams, leads, leadsLoaded]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchColumnChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSearchColumn(event.target.value);
  };

  const handleSort = (column: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortState.column === column && sortState.direction === "asc") {
      direction = "desc";
    }

    console.log("Sorting column:", column, "direction:", direction);

    setSortState({ column, direction });

    const dataCopy = [...filteredData];

    const sortedData = dataCopy.sort(
      (a: PipelineLeadWithAssigned, b: PipelineLeadWithAssigned) => {
        const aVal = a[column];
        const bVal = b[column];

        // Only log for assigned/assigned_at:
        if (column === "assigned" || column === "assigned_at") {
          console.log(
            "Compare row (assigned):",
            a.lead_id,
            "->",
            aVal,
            "vs",
            b.lead_id,
            "->",
            bVal
          );
        }

        if (
          column === "created_at" ||
          column === "updated_at" ||
          column === "assigned" ||
          column === "assigned_at"
        ) {
          const aDate = parseDDMMYYYYToLocal(aVal);
          const bDate = parseDDMMYYYYToLocal(bVal);
          const aTime = aDate ? aDate.getTime() : NaN;
          const bTime = bDate ? bDate.getTime() : NaN;

          // Only log the parsed times for assigned/assigned_at
          if (column === "assigned" || column === "assigned_at") {
            console.log("Parsed times (assigned):", aTime, bTime);
          }

          if (isNaN(aTime) || isNaN(bTime)) return 0;
          return direction === "asc" ? aTime - bTime : bTime - aTime;
        } else {
          const aStr = aVal?.toString()?.toLowerCase() ?? "";
          const bStr = bVal?.toString()?.toLowerCase() ?? "";
          if (aStr < bStr) return direction === "asc" ? -1 : 1;
          if (aStr > bStr) return direction === "asc" ? 1 : -1;
          return 0;
        }
      }
    );

    console.log(
      "Sorted result:",
      sortedData.map((item: any) => ({
        lead_id: item.lead_id,
        [column]: item[column],
      }))
    );

    setFilteredData(sortedData);
  };

  const startIndex = (currentPage - 1) * leadsPerPage;
  const currentLeads = filteredData.slice(startIndex, startIndex + leadsPerPage);

  const handleOpenModal = (lead?: Partial<PipelineLead>) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLead(undefined);
  };

  const renderTable = () => {
    const displayedLeads = currentLeads.map((lead: PipelineLeadWithAssigned) => {
      const newLead = { ...lead };
      if (newLead.created_at) {
        newLead.created_at = formatDateTimeWithRelative(newLead.created_at);
      }
      if (newLead.updated_at) {
        newLead.updated_at = formatDateTimeWithRelative(newLead.updated_at);
      }
      if (newLead.assigned) {
        newLead.assigned = formatDateTimeWithRelative(newLead.assigned);
      }
      if (newLead.assigned_at) {
        newLead.assigned_at = formatDateTimeWithRelative(newLead.assigned_at);
      }
      return newLead;
    });

    return (
      <Table
        columns={PipelineColumns}
        data={displayedLeads}
        title="Leads"
        onButtonClick={(lead) => handleOpenModal(lead)}
        actionButtons={
          <>
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <div className="grid grid-cols-1 sm:flex-auto mr-4">
              <input
                id="search"
                name="search"
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={handleSearch}
                className="peer relative col-start-1 row-start-1 border-0 bg-transparent py-1.5 px-4 text-text placeholder:text-text focus:ring-0 sm:text-sm sm:leading-6"
              />
              <div
                aria-hidden="true"
                className="col-start-1 col-end-3 row-start-1 rounded-md shadow-sm ring-1 ring-inset ring-gray-300 peer-focus:ring-2 peer-focus:ring-titleButtonBg"
              />
              <div className="col-start-2 row-start-1 flex items-center px-4">
                <span
                  aria-hidden="true"
                  className="h-4 w-px flex-none bg-gray-200"
                />
                <label htmlFor="searchColumn" className="sr-only">
                  Search By
                </label>
                <select
                  id="searchColumn"
                  name="searchColumn"
                  value={searchColumn}
                  onChange={handleSearchColumnChange}
                  className="rounded-md border-0 py-1.5 pl-4 pr-7 text-text focus:ring-2 focus:ring-inset focus:ring-titleButtonBg sm:text-sm sm:leading-6 bg-mainContentBg"
                >
                  {PipelineColumns.filter(
                    (column) => column.accessor !== "select"
                  ).map((column) => (
                    <option
                      key={column.accessor as string}
                      value={column.accessor as string}
                    >
                      {column.Header}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button className="mr-4" onClick={() => handleOpenModal()}>
              + New Lead
            </Button>
            <Button
              className="mr-4"
              onClick={() =>
                loadLeads(sessionStorage.getItem("username") || "")
              }
            >
              Refresh
            </Button>
          </>
        }
        enablePagination
        itemsPerPage={leadsPerPage}
        totalItems={filteredData.length}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        sortState={sortState}
        onSort={handleSort}
        className="w-full p-0"
      />
    );
  };

  return (
    <div className="bg-mainContentBg h-full py-4 flex flex-col relative">
      <PageHeader title="Pipeline" />
      <div className="overflow-hidden rounded-lg h-full">
        {loading ? (
          <LoadingIndicator />
        ) : error ? (
          <ErrorBanner error={error as string} />
        ) : (
          renderTable()
        )}
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <UpdateLeadForm lead={selectedLead} onClose={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default Pipeline;
