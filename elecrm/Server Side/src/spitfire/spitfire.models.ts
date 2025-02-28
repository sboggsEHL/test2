// Specific interface for Spitfire API requests if needed
export interface SpitfireLeadRequest {
  customerID: number;
  userID: number;
  listName: string;
  duplicateCheck: boolean;
  listClient: {
    listId: number;
    clientId: number;
    name: string;
    firstName: string;
    lastName: string;
    company: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    voicePhone: string;
    secondaryVoicePhone: string;
    homePhone: string;
    cellPhone: string;
    faxPhone: string;
    email: string;
    webSite: string;
    note: string;
    xmldata: string;
    dateEdited: string;
    dateCreated: string;
    outboundCallerId: string;
    customFields: {
      field: SpitfireCustomField[];
    };
    updatedCustomFields: {
      field: SpitfireCustomField[];
    };
  };
}

// Specific interface for Spitfire API responses if needed
export interface SpitfireResponse {
  // TODO: Add Spitfire-specific response fields
}

export interface SpitfireLoginRequest {
  username: string;
  password: string;
  appType: string;
}

export interface SpitfireLoginResponse {
  loginResult: {
    result: string;
    accessToken: string;
    customerID: string;
    userID: string;
    message?: string;
  };
}

export interface SpitfireCustomField {
  name: string;
  value: string;
}
