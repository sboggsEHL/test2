export const PipelineColumns: Array<any> = [

  {
    Header: "View",
    accessor: "button",
  },

  {
    Header: "Created Time",
    accessor: "created_at",
    sortable: true,
  },
  {
    Header: "Assigned",
    accessor: "updated_at",
    sortable: false,
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
    Header: "State",
    accessor: "state",
    sortable: true,
  },
  {
    Header: "Status",
    accessor: "lead_status",
    sortable: true,
  },
  {
    Header: "Email",
    accessor: "email",
    sortable: true,
  },
  {
    Header: "Desired Loan Amount",
    accessor: "desired_loan_amount",
    sortable: true,
  },
];
