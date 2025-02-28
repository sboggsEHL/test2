// Server Side/src/encompass/encompass.model.ts
export interface LeadRequest {
  id?: number;
  lead_id?: number;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  suffix?: string;
  email?: string;
  dob?: string;
  ssn?: string;
  veteran?: boolean;
  credit?: string;
  marital_status?: string;
  first_name_b2?: string;
  last_name_b2?: string;
  address?: string;
  unit?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  home_phone?: string;
  cell_phone?: string;
  property_use?: string;
  property_type?: string;
  loan_purpose?: string;
  mortgage_balance?: number;
  second_mortgage_balance?: number;
  desired_loan_amount?: number;
  estimated_value?: number;
  lead_source?: string;
  lead_status?: string;
  status?: string;
  ulid?: string;
  created_at?: string;
  updated_at?: string;
}
export type EncompassExportFormat = {
  applications: Array<{
    borrower: {
      FirstName: string;
      LastName: string;
      MiddleName?: string;
      TaxIdentificationIdentifier: string;
      Birthdate: string;
      HomePhoneNumber: string;
      EmailAddressText: string;
      residences: Array<{
        residencyType: string;
        urla2020StreetAddress: string;
        addressCity: string;
        addressState: string;
        addressPostalCode: string;
        addressUnitIdentifier?: string;
      }>;
    };
  }>;
  property: {
    LoanPurposeType: string;
    StreetAddress: string;
    City: string;
    State: string;
    PostalCode: string;
    addressUnitIdentifier?: string;
  };
};

export function mapToEncompassFormat(lead: LeadRequest): EncompassExportFormat {
  return {
    applications: [
      {
        borrower: {
          FirstName: lead.first_name || "",
          LastName: lead.last_name || "",
          MiddleName: lead.middle_name || "",
          TaxIdentificationIdentifier: lead.ssn || "",
          Birthdate: lead.dob || "",
          HomePhoneNumber: lead.home_phone || "",
          EmailAddressText: lead.email || "",
          residences: [
            {
              residencyType: "Current", // WILL ALWAYS STAY AS A CONSTANT
              urla2020StreetAddress: lead.address || "",
              addressCity: lead.city || "",
              addressState: lead.state || "",
              addressPostalCode: lead.zip_code || "",
              addressUnitIdentifier: lead.unit || "", // Condo/Apartment Unit Number
            },
          ],
        },
      },
    ],
    property: {
      LoanPurposeType: "NoCash-Out Refinance",
      StreetAddress: lead.address || "",
      City: lead.city || "",
      State: lead.state || "",
      PostalCode: lead.zip_code || "",
      addressUnitIdentifier: lead.unit || "",
    },
  };
}
