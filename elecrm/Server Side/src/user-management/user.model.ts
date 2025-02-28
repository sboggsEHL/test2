export interface LicenseRecord {
  individualId: number;
  individualLastName: string;
  individualFirstName: string;
  individualMiddleName?: string;
  individualSuffix?: string;
  licenseNumber?: string;
  licenseName: string;
  industryType: string;
  licenseStatus: string;
  licenseStatusDate: Date;
  originalLicenseDate?: Date;
  renewedThroughYear?: number;
  preventRenewal: string;
  sponsorshipStatus?: string;
  sponsorshipStatusDate?: Date;
  workerClassification: string;
  classificationBeginDate: Date;
  relationshipEffectiveDate: Date;
  reportCurrentAsOf: Date;
  reportGeneratedTime: Date;
  username?: string;
  state?: string;
}

export interface User {
  id?: number;                   // optional, because the DB will auto-generate
  username: string;
  email: string;
  password_hash: string;
  created_at?: Date;
  updated_at?: Date;
  sw_phone_number?: string;
  direct_phone_number?: string;
  first_name?: string;
  last_name?: string;
  persona?: string[]; // Must be a subset of ['admin','manager','loan_officer','processing','jr_loan_officer']
}


// This is what the frontend might send to create a user:
export interface CreateUserDTO {
  firstName: string;           // e.g. "Sean"
  lastName: string;            // e.g. "Boggs"
  direct_phone_number: string; // e.g. "555-123-4567"
  persona: string[];           // e.g. ["admin", "manager"]
}