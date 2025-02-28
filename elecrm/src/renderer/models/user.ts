export interface User {
    id?: number;
    username: string;
    email: string;
    created_at?: Date;
    updated_at?: Date;
    sw_phone_number?: string;
    direct_phone_number?: string;
    first_name?: string;
    last_name?: string;
    persona?: string[];
  }
  
  export interface CreateUserDTO {
    firstName: string;
    lastName: string;
    direct_phone_number: string;
    persona: UserRole[] | string[];
  }


  // ['admin','manager','loan_officer','processing','jr_loan_officer']
  export enum UserRole {
    ADMIN = 'admin',
    MANAGER = 'manager',
    LOAN_OFFICER = 'loan_officer',
    PROCESSING = 'processing',
    JR_LOAN_OFFICER = 'jr_loan_officer',
  }