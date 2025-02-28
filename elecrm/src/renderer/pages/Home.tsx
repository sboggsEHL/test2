import React, { useContext } from "react";
import "../styles/Home.css";
import { PageHeader } from "../components";
import { classNames } from "../utils";
import { UserIcon } from "@heroicons/react/24/solid";

const stats = [
  { name: "Number of Active Leads", value: "85" },
  { name: "Average Loan Processing Time", value: "7.3", unit: "days" },
  { name: "Number of Applications Approved", value: "47" },
  { name: "Approval Rate", value: "78.5%" },
];

const statuses: any = {
  "Application Received": "text-blue-400 bg-blue-400/10",
  "Under Review": "text-yellow-400 bg-yellow-400/10",
  Approved: "text-green-400 bg-green-400/10",
  "Awaiting Documents": "text-orange-400 bg-orange-400/10",
  Closed: "text-gray-400 bg-gray-400/10",
};

const activityItems = [
  {
    lead: { name: "Michael Foster" },
    type: "Refinance",
    isVeteran: true,
    status: "Under Review",
    equity: "$250,000",
    date: "45 minutes ago",
  },
  {
    lead: { name: "Sarah Connor" },
    type: "Purchase",
    isVeteran: false,
    status: "Approved",
    equity: "$300,000",
    date: "2 hours ago",
  },
  {
    lead: { name: "John Doe" },
    type: "Refinance",
    isVeteran: false,
    status: "Application Received",
    equity: "$150,000",
    date: "1 day ago",
  },
  {
    lead: { name: "Jane Smith" },
    type: "Purchase",
    isVeteran: true,
    status: "Awaiting Documents",
    equity: "$200,000",
    date: "3 days ago",
  },
  {
    lead: { name: "Robert Brown" },
    type: "Refinance",
    isVeteran: false,
    status: "Closed",
    equity: "$100,000",
    date: "1 week ago",
  },
  {
    lead: { name: "Emily Davis" },
    type: "Purchase",
    isVeteran: false,
    status: "Under Review",
    equity: "$250,000",
    date: "2 weeks ago",
  },
  {
    lead: { name: "James Wilson" },
    type: "Refinance",
    isVeteran: false,
    status: "Approved",
    equity: "$350,000",
    date: "3 weeks ago",
  },
  {
    lead: { name: "Patricia Johnson" },
    type: "Purchase",
    isVeteran: false,
    status: "Application Received",
    equity: "$400,000",
    date: "1 month ago",
  },
  {
    lead: { name: "Michael Clark" },
    type: "Refinance",
    isVeteran: false,
    status: "Awaiting Documents",
    equity: "$500,000",
    date: "2 months ago",
  },
  {
    lead: { name: "Linda Martinez" },
    type: "Purchase",
    isVeteran: false,
    status: "Closed",
    equity: "$600,000",
    date: "3 months ago",
  },
  {
    lead: { name: "David Lee" },
    type: "Refinance",
    isVeteran: true,
    status: "Under Review",
    equity: "$700,000",
    date: "4 months ago",
  },
];

export const Home: React.FC = () => {
  return (
    <div className="w-full h-full bg-dark-mainContentBg py-4">
      <PageHeader title="Dashboard" />
      <main>
        <header>
          {/* Heading */}
          <div className="flex flex-col items-start justify-between gap-x-8 gap-y-4 bg-gray-700/10 px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
            <div>
              <div className="flex items-center gap-x-3">
                <div className="flex-none rounded-full bg-green-400/10 p-1 text-green-400">
                  <div className="size-2 rounded-full bg-current" />
                </div>
                <h1 className="flex gap-x-3 text-base/7">
                  <span className="font-semibold text-white">
                    Mortgage Processing
                  </span>
                  <span className="text-gray-600">/</span>
                  <span className="font-semibold text-white">Sean Boggs</span>
                </h1>
              </div>
              <p className="mt-2 text-xs/6 text-gray-400">
                Status of ongoing loan applications
              </p>
            </div>
            <div className="order-first flex-none rounded-full bg-indigo-400/10 px-2 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-400/30 sm:order-none">
              Active Pipeline
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 bg-gray-700/10 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, statIdx) => (
              <div
                key={stat.name}
                className={classNames(
                  statIdx % 2 === 1
                    ? "sm:border-l"
                    : statIdx === 2
                    ? "lg:border-l"
                    : "",
                  "border-t border-white/5 px-4 py-6 sm:px-6 lg:px-8"
                )}
              >
                <p className="text-sm/6 font-medium text-gray-400">
                  {stat.name}
                </p>
                <p className="mt-2 flex items-baseline gap-x-2">
                  <span className="text-4xl font-semibold tracking-tight text-white">
                    {stat.value}
                  </span>
                  {stat.unit ? (
                    <span className="text-sm text-gray-400">{stat.unit}</span>
                  ) : null}
                </p>
              </div>
            ))}
          </div>
        </header>

        {/* Activity list */}
        <div className="border-t border-white/10 pt-11">
          <h2 className="px-4 text-base/7 font-semibold text-white sm:px-6 lg:px-8">
            Latest activity
          </h2>

          <div className="mt-6 w-full overflow-y-auto">
            <table className="mt-6 w-full whitespace-nowrap text-left">
              <colgroup>
                <col className="w-full sm:w-4/12" />
                <col className="lg:w-4/12" />
                <col className="lg:w-2/12" />
                <col className="lg:w-1/12" />
                <col className="lg:w-1/12" />
              </colgroup>
              <thead className="border-b border-white/10 text-sm/6 text-white">
                <tr>
                  <th
                    scope="col"
                    className="py-2 pl-4 pr-8 font-semibold sm:pl-6 lg:pl-8"
                  >
                    Lead
                  </th>
                  <th
                    scope="col"
                    className="hidden py-2 pl-0 pr-8 font-semibold sm:table-cell"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="py-2 pl-0 pr-4 text-right font-semibold sm:pr-8 sm:text-left lg:pr-20"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="hidden py-2 pl-0 pr-8 font-semibold md:table-cell lg:pr-20"
                  >
                    Equity
                  </th>
                  <th
                    scope="col"
                    className="hidden py-2 pl-0 pr-4 text-right font-semibold sm:table-cell sm:pr-6 lg:pr-8"
                  >
                    Last Update
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5  overflow-y-auto">
                {activityItems.map((item) => (
                  <tr key={item.lead.name}>
                    <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
                      <div className="flex items-center gap-x-4">
                        <UserIcon className="fill-slate-100 h-4 w-4" />
                        <div className="truncate text-sm/6 font-medium text-white">
                          {item.lead.name}
                        </div>
                      </div>
                    </td>
                    <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                      <div className="flex gap-x-3">
                        <div className="font-mono text-sm/6 text-gray-400">
                          {item.type}
                        </div>
                        {item.isVeteran && (
                          <span className="inline-flex items-center rounded-md bg-gray-400/10 px-2 py-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-gray-400/20">
                            Veteran
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 pl-0 pr-4 text-sm/6 sm:pr-8 lg:pr-20">
                      <div className="flex items-center justify-end gap-x-2 sm:justify-start">
                        <time
                          dateTime={item.date}
                          className="text-gray-400 sm:hidden"
                        >
                          {item.date}
                        </time>
                        <div
                          className={classNames(
                            statuses[item.status],
                            "flex-none rounded-full p-1"
                          )}
                        >
                          <div className="size-1.5 rounded-full bg-current" />
                        </div>
                        <div className="hidden text-white sm:block">
                          {item.status}
                        </div>
                      </div>
                    </td>
                    <td className="hidden py-4 pl-0 pr-8 text-sm/6 text-gray-400 md:table-cell lg:pr-20">
                      {item.equity}
                    </td>
                    <td className="hidden py-4 pl-0 pr-4 text-right text-sm/6 text-gray-400 sm:table-cell sm:pr-6 lg:pr-8">
                      <time dateTime={item.date}>{item.date}</time>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
