import { PipelineLead } from "../models";
import {
  BuildingLibraryIcon,
  CheckIcon,
  CloudIcon,
  HomeIcon,
  InboxIcon,
  PhoneIcon,
} from "@heroicons/react/24/solid";
import { useSignalWire } from "../context/SignalWireContext";
import { isElectron } from "../utils";

const getReadableLoanPurpose = (loanPurpose: string | undefined) => {
  switch (loanPurpose) {
    case "R":
      return "Cash Out";
    case "P":
      return "Purchase";
    default:
      return loanPurpose;
  }
};

const formatPhoneNumber = (phoneNumber: string | undefined) => {
  if (!phoneNumber) return '';
  const cleaned = phoneNumber.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return phoneNumber;
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    // You might want to add a toast notification here
    console.log('Copied to clipboard');
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

export type LeadFormSideCarProps = {
  lead: Partial<PipelineLead>;
};

export default function LeadFormSideCar({ lead }: LeadFormSideCarProps) {
  const { dialNumber, callState } = useSignalWire();

  const handleDial = async (phoneNumber: string | undefined) => {
    if (!phoneNumber) return;

    const cleanNumber = phoneNumber.replace(/\D/g, "");

    if (isElectron()) {
      // Use the new direct dial method instead of updating shared state
      window.electronAPI.dialPhoneNumber(cleanNumber, lead);
    } else {
      // For web: directly use SignalWire context
      if (!callState?.conferenceSession?.laMLBinUrl) {
        console.error(
          "No valid conference URL found. Please ensure you are connected to a conference first."
        );
        return;
      }
      await dialNumber(cleanNumber);
    }
  };

  return (
    <div className="lg:col-start-1 sm:col-span-1">
      <h2 className="sr-only">Lead Info</h2>
      <div className="rounded-lg bg-gray-50 shadow-sm ring-1 ring-gray-900/5">
        <dl className="flex flex-wrap">
          <div className="flex-auto pl-6 pt-6">
            <dt className="mt-1 text-base font-semibold leading-6 text-gray-700">
              {lead?.first_name} {lead?.middle_name} {lead?.last_name}
            </dt>
          </div>
          {lead?.veteran && (
            <div className="flex-none self-end px-6 pt-4">
              <dt className="sr-only">Veteran</dt>
              <dd className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-600 ring-1 ring-inset ring-green-600/20">
                Veteran
              </dd>
            </div>
          )}
          <div className="mt-4 flex w-full flex-none gap-x-4 border-t border-gray-900/5 px-6 pt-6">
            <dt className="flex-none">
              <span className="sr-only">Email</span>
              <InboxIcon 
                aria-hidden="true" 
                className="h-6 w-5 text-gray-400 hover:text-blue-600 cursor-pointer transition-colors"
                onClick={() => lead?.email && copyToClipboard(lead.email)}
              />
            </dt>
            <dd className="text-sm leading-6 text-gray-500 break-all hover:text-blue-600 cursor-pointer"
                onClick={() => lead?.email && copyToClipboard(lead.email)}>
              {lead?.email}
            </dd>
          </div>
          <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
            <dt className="flex-none">
              <span className="sr-only">Phone</span>
              <PhoneIcon
                aria-hidden="true"
                className="h-6 w-5 text-gray-400 hover:text-blue-600 cursor-pointer transition-colors"
                onClick={() => handleDial(lead?.cell_phone)}
              />
            </dt>
            <dd className="flex gap-x-2 text-sm leading-6 text-gray-500">
              <span 
                className="hover:text-blue-600 cursor-pointer"
                onClick={() => lead?.cell_phone && copyToClipboard(lead.cell_phone)}>
                {formatPhoneNumber(lead?.cell_phone)}
              </span>
            </dd>
          </div>
          <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
            <dt className="flex-none">
              <span className="sr-only">Address</span>
              <HomeIcon aria-hidden="true" className="h-6 w-5 text-gray-400" />
            </dt>
            <dd className="text-sm leading-6 text-gray-500">
              {lead?.address}, <br />
              {lead?.city}, {lead?.state} {lead?.zip_code}
            </dd>
          </div>
        </dl>
        <div className="mt-4 flex w-full flex-none gap-x-4 border-t border-gray-900/5 px-6 pt-4 pb-2">
          <div className="flex flex-col">
            {" "}
            <h3 className="text-sm font-semibold leading-6 text-gray-700">
              Loan Details
            </h3>
            <div className="flex gap-x-4 mt-4">
              <dt className="flex-none">
                <span className="sr-only">Loan Type</span>
                <BuildingLibraryIcon
                  aria-hidden="true"
                  className="h-6 w-5 text-gray-400"
                />
              </dt>
              <dd className="text-sm font-medium leading-6 text-gray-500">
                {getReadableLoanPurpose(lead?.loan_purpose)}
              </dd>
            </div>
          </div>
        </div>
        {lead.exported && (
          <div className="mt-4 flex w-full flex-none gap-x-4 border-t border-gray-900/5 px-6 pt-4 pb-4">
            <div className="flex flex-col">
              {" "}
              <h3 className="text-sm font-semibold leading-6 text-gray-700">
                Status
              </h3>
              <div className="flex gap-x-4 mt-4">
                <dt className="flex-none">
                  <span className="sr-only">LOS Status</span>
                  <CheckIcon
                    aria-hidden="true"
                    className="h-6 w-5 text-green-600 font-bold"
                  />
                </dt>
                <dd className="text-sm font-medium leading-6 text-gray-500">
                  Exported to Encompass
                </dd>
              </div>
            </div>
          </div>
        )}
        <div className="mt-4 flex w-full flex-none gap-x-4 border-t border-gray-900/5 px-6 pt-4 pb-4">
          <div className="flex flex-col">
            {" "}
            <h3 className="text-sm font-semibold leading-6 text-gray-700">
              Current Weather Information
            </h3>
            <div className="flex gap-x-4 mt-4">
              <dt className="flex-none">
                <span className="sr-only">Weather</span>
                <CloudIcon
                  aria-hidden="true"
                  className="h-6 w-5 text-gray-400"
                />
              </dt>
              <dd className="text-sm font-medium leading-6 text-gray-500">
                Partly cloudy conditions today
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
