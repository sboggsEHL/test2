import { Column } from "react-table";

export const NumberRangeColumnFilter = ({
  column: { filterValue = [], setFilter },
}: {
  column: { filterValue: number[]; setFilter: Function };
}) => {
  return (
    <div className="flex space-x-2">
      <input
        value={filterValue[0] || ""}
        type="number"
        onChange={(e) => {
          const val = e.target.value;
          setFilter((old: number[] = []) => [
            val ? parseInt(val, 10) : undefined,
            old[1],
          ]);
        }}
        placeholder="Min"
        className="w-20 px-2 py-1 text-sm border rounded"
      />
      <input
        value={filterValue[1] || ""}
        type="number"
        onChange={(e) => {
          const val = e.target.value;
          setFilter((old: number[] = []) => [
            old[0],
            val ? parseInt(val, 10) : undefined,
          ]);
        }}
        placeholder="Max"
        className="w-20 px-2 py-1 text-sm border rounded"
      />
    </div>
  );
};
// Define a custom Column type that includes the additional properties we're using
type ExtendedColumn<
  D extends Record<string, unknown> = Record<string, unknown>
> = Column<D> & {
  Filter?: React.FC<any>;
  filter?: string;
};

export const SharkTankColumns: Array<any> = [
  {
    Header: "",
    accessor: "select",
  },
  {
    Header: "Date Time",
    accessor: "created_at",
    sortable: true,
  },
  {
    Header: "First Name",
    accessor: "first_name",
    sortable: true,
  },
  {
    Header: "Last Name",
    accessor: "last_name",
    sortable: true,
  },
  {
    Header: "Phone",
    accessor: "cell_phone",
    sortable: true,
  },
  {
    Header: "Property State",
    accessor: "state",
    sortable: true,
  },
  {
    Header: "Property Type",
    accessor: "property_type",
    sortable: true,
  },
  {
    Header: "Mortgage Balance",
    accessor: "mortgage_balance",
    Filter: NumberRangeColumnFilter,
    filter: "between",
    sortable: true,
  },
  {
    Header: "Veteran",
    accessor: "veteran",
    sortable: false,
  },
  {
    Header: "Lead Status",
    accessor: "status",
    sortable: true,
  },
  {
    Header: "Last Contact",
    accessor: "lastContact",
    sortable: true,
  },
];
