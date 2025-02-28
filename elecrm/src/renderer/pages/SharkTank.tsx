import React, { useCallback, useEffect, useState } from "react";
import SharkTankControls from "../components/SharkTankControls";
import LoadingIndicator from "../components/LoadingIndicator";
import { Button, SharedModal, Table } from "../components";
import PageHeader from "../components/PageHeader";
import { useNavigate } from "react-router-dom";
import { SharkTankLead } from "../models";
import { SharkTankColumns } from "../data/SharkTankColumns";
import { useSharkTank } from "../context/SharkTankContext";
import { useLead } from "../context";
import { useSignalWire } from "../context/SignalWireContext";
import { isElectron } from "../utils";
import { AppRoutes } from "../config/routes";

const leadsPerPage = 20;

export const SharkTank: React.FC = () => {
  const navigate = useNavigate();
  const { leads, loadLeads, addLead, loading } = useSharkTank();
  const { assignLeadById } = useLead();
  const { dialNumber } = useSignalWire();
  const [sortState, setSortState] = useState<{
    column: string;
    direction: "asc" | "desc" | null;
  }>({ column: "created_date", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<SharkTankLead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchColumn, setSearchColumn] = useState("first_name");
  const [filteredData, setFilteredData] = useState<SharkTankLead[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

  const handleDialSelected = async () => {
    setIsOpen(true);
    setModalStatus("loading");
    try {
      const selectedLeadIds = selectedRows.map((lead) => lead.lead_id);
      const selectedLead = selectedRows[0];
      await assignLeadById(selectedLeadIds[0]);

      // Handle dialing the lead's phone number
      if (selectedLead.cell_phone) {
        if (isElectron()) {
          window.electronAPI.dialPhoneNumber(
            selectedLead.cell_phone,
            selectedLead
          );
        } else {
          await dialNumber(selectedLead.cell_phone);
        }
      }

      const route = `/${AppRoutes.Pipeline}?selectedLead=${selectedLeadIds[0]}`;
      navigate(route);
      setModalStatus("success");
      setIsOpen(false);
    } catch (error: any) {
      console.error("Error dialing selected leads:", error);
      setModalStatus("error");
    }
  };

  const handleDialList = async () => {
    console.log("Dialing all leads...");
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSelectedRows = useCallback(
    (selectedRows: Record<string, any>[]) => {
      setSelectedRows(selectedRows as SharkTankLead[]);
    },
    []
  );

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredData(leads);
    } else {
      const filtered = leads.filter((lead) => {
        const value = lead[searchColumn as keyof SharkTankLead] as string;
        return value
          ?.toString()
          ?.toLowerCase()
          ?.includes(searchTerm.toLowerCase());
      });
      setFilteredData(filtered);
    }
  }, [searchTerm, leads, searchColumn]);

  const handleSort = (column: string) => {
    let direction: "asc" | "desc" = "desc"; // Default to most recent on top
    if (sortState.column === column && sortState.direction === "desc") {
        direction = "asc";
    }
    setSortState({ column, direction });

    const sortedData = [...filteredData].sort((a: any, b: any) => {
        const aValue = new Date(a[column]).getTime();
        const bValue = new Date(b[column]).getTime();

        return direction === "asc" ? aValue - bValue : bValue - aValue;
    });

    setFilteredData(sortedData);
};

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchColumnChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSearchColumn(event.target.value);
  };

  const startIndex = (currentPage - 1) * leadsPerPage;
  const currentLeads = filteredData.slice(
    startIndex,
    startIndex + leadsPerPage
  );

  const renderTable = () => {
    return (
      <Table
        columns={SharkTankColumns}
        data={currentLeads}
        title="Leads"
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
                  {SharkTankColumns.filter(
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
            <Button className="mr-4" onClick={loadLeads}>
              Refresh
            </Button>
            <Button className="mr-4" onClick={handleDialSelected}>
              Dial selected
            </Button>
            <Button onClick={handleDialList}>Dial list</Button>
          </>
        }
        enablePagination
        itemsPerPage={leadsPerPage}
        totalItems={filteredData.length}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        sortState={sortState}
        onSort={handleSort}
        onSelected={handleSelectedRows}
        className="w-full p-0"
      />
    );
  };

  return (
    <div className="bg-mainContentBg h-full py-4 flex flex-col">
      <PageHeader title="Shark Tank" />
      <div className="overflow-hidden rounded-lg h-full">
        {loading ? <LoadingIndicator /> : renderTable()}
      </div>
      <SharedModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Lead Dialer"
        description="Assigning leads..."
        primaryActionLabel="Go back to sharktank"
        primaryAction={handleClose}
        status={modalStatus}
      />
    </div>
  );
};
