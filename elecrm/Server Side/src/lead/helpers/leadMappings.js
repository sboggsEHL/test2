const mapFRULead = (leadData, username) => {
  return {
    lead_id: leadData.id,
    created_date: leadData.created_date || 'N/A',
    lead_source: 'FRU', // Assuming 'FRU' as the identifier for Free Rate Update
    first_name: leadData.first_name || 'N/A',
    last_name: leadData.last_name || 'N/A',
    middle_name: leadData.middle_name || '',
    suffix: leadData.suffix || '',
    email: leadData.email || 'N/A',
    ssn: leadData.ssn || '',
    phone: leadData.phone_primary || '',
    home_phone: leadData.phone_secondary || '',
    phone_other: leadData.phone_other || '',
    address: leadData.street_address || 'N/A',
    city: leadData.property_city || 'N/A',
    state: leadData.property_state || 'N/A',
    postal_code: leadData.zip || 'N/A',
    loan_purpose: leadData.loan_purpose || 'N/A',
    property_type: leadData.property_type || 'N/A',
    property_use: leadData.property_use || 'N/A',
    property_value: leadData.property_value ? parseFloat(leadData.property_value) : 0,
    desired_loan_amount: leadData.desired_loan_amount ? parseFloat(leadData.desired_loan_amount) : 0,
    first_mortgage_balance: leadData.first_mort_balance ? parseFloat(leadData.first_mort_balance) : 0,
    second_mortgage_balance: leadData.second_mort_balance ? parseFloat(leadData.second_mort_balance) : 0,
    first_mortgage_rate: leadData.first_mort_rate ? parseFloat(leadData.first_mort_rate) : 0,
    credit_rating: leadData.credit_rating || 'N/A',
    fico_score: leadData.fico_score ? parseInt(leadData.fico_score) : 0,
    cash_out: leadData.cashout || 'N/A',
    veteran: leadData.veteran_military === 'Yes',
    first_time_buyer: leadData.first_time_buyer || 'N/A',
    estimated_down_payment: leadData.est_down_payment ? parseFloat(leadData.est_down_payment) : 0,
    ltv: leadData.ltv ? parseFloat(leadData.ltv) : 0,
    additional_liens_balance: leadData.additional_liens_balance ? parseFloat(leadData.additional_liens_balance) : 0,
    ip_address: leadData.ip_address || '',
    universal_lead_id: leadData.universal_lead_id || '',
    campaign_id: leadData.campaign_id || '',
    tu_trigger_date: leadData.tu_trigger_date || '',
    tu_duplicate_count: leadData.tu_duplicate_count ? parseInt(leadData.tu_duplicate_count) : 0,
    lead_status: 'New Lead',
    assigned_to: username // Set the active user’s username
  };
};

const mapLowerMyBillsLead = (leadData) => {
  return {
    lead_id: leadData.id,
    lead_source: 'LMB', // Assuming 'LMB' as the identifier for Lower My Bills
    first_name: leadData.first_name,
    last_name: leadData.last_name,
    middle_initial: leadData.middle_initial,
    email: leadData.email,
    phone: leadData.phone_number,
    phone_secondary: leadData.work_phone,
    phone_other: leadData.cell_phone,
    ssn: leadData.ssn,
    birth_date: leadData.birth_date,
    credit_rating: leadData.credit_profile,
    monthly_debt_payments: leadData.month_debt_payments,
    desired_loan_amount: leadData.desired_loan_amt,
    property_value: leadData.exist_prop_value,
    property_street_address: leadData.street_address,
    property_city: leadData.city,
    property_state: leadData.state,
    property_zip_code: leadData.zip_code,
    property_county: leadData.property_county,
    property_type: leadData.property_desc,
    property_use: leadData.intend_prop_use,
    loan_purpose: leadData.loan_purpose,
    first_mortgage_balance: leadData.first_mort_balance,
    first_mortgage_rate: leadData.first_mort_int_rate,
    second_mortgage_balance: leadData.second_mort_balance,
    second_mortgage_rate: leadData.second_mort_int_rate,
    ltv: calculateLTV(leadData.exist_prop_value, leadData.first_mort_balance, leadData.second_mort_balance),
    cash_out: leadData.cashout === 'Yes',
    veteran: leadData.veteran === 'Yes',
    first_time_buyer: leadData.first_time_buyer === 'Yes',
    estimated_down_payment: calculateDownPayment(leadData.down_payment, leadData.desired_loan_amt),
    employment_status: null, // Not provided in LMB schema
    employer_name: null, // Not provided in LMB schema
    employment_length: null, // Not provided in LMB schema
    monthly_income: null, // Not provided in LMB schema
    fico_score: null, // Not provided in LMB schema
    ip_address: leadData.ip_address,
    lead_status: 'New Lead',
    created_date: new Date().toISOString(), // Current timestamp
    additional_info: {
      work_phone_ext: leadData.work_phone_ext,
      work_phone_ext2: leadData.work_phone_ext2,
      phone2_type: leadData.phone2_type,
      contact_time: leadData.contact_time,
      new_prop_value: leadData.new_prop_value,
      property_found: leadData.property_found,
      search_zip: leadData.search_zip,
      prop_purch_year: leadData.prop_purch_year,
      desired_rate_type: leadData.desired_rate_type,
      desired_month_pmt: leadData.desired_month_pmt,
      first_mort_rate_type: leadData.first_mort_rate_type,
      current_need_sit: leadData.current_need_sit,
      loan_type: leadData.loan_type,
      pref_loan_type: leadData.pref_loan_type,
      loan_timeframe: leadData.loan_timeframe,
      bankruptcy: leadData.bankruptcy,
      bankruptcy_type: leadData.bankruptcy_type,
      home_owner: leadData.home_owner,
      need_purch_re_agent: leadData.need_purch_re_agent,
      re_agent_name: leadData.re_agent_name,
      re_agent_phone: leadData.re_agent_phone,
      need_sell_re_agent: leadData.need_sell_re_agent,
      consumer_comments: leadData.consumer_comments,
      add_information: leadData.add_information
    }
  };
};

const mapTransUnionLead = (leadData) => {
  return {
    lead_id: leadData.id,
    lead_source: 'TU',
    created_date: leadData.created_dt,
    first_name: leadData.fname,
    last_name: leadData.lname,
    middle_name: leadData.mname,
    suffix: leadData.suffix,
    email: null,
    ssn: leadData.ssn,
    birth_date: leadData.bday,
    phone: leadData.phone,
    phone_secondary: null,
    phone_other: null,
    property_street_address: leadData.street,
    property_city: leadData.city,
    property_state: leadData.state,
    property_zip_code: leadData.zip,
    property_county: null,
    loan_purpose: null,
    property_type: null,
    property_use: null,
    property_value: null,
    desired_loan_amount: null,
    first_mortgage_balance: leadData.bal_mort1,
    first_mortgage_rate: null,
    second_mortgage_balance: leadData.bal_mort2,
    second_mortgage_rate: null,
    credit_rating: null,
    fico_score: leadData.fico04,
    cash_out: null,
    veteran: null,
    first_time_buyer: null,
    estimated_down_payment: null,
    ltv: calculateLTV(leadData.high_credit_mort1, leadData.bal_mort1),
    monthly_income: null,
    employment_status: null,
    employer_name: null,
    employment_length: null,
    total_credit_card_balance: null,
    total_installment_balance: leadData.bal_installment,
    monthly_debt_payments: calculateMonthlyDebtPayments(leadData),
    additional_liens_balance: calculateAdditionalLiens(leadData),
    ip_address: null,
    universal_lead_id: leadData.perm_id,
    campaign_id: null,
    tu_trigger_date: leadData.trig_dt,
    tu_duplicate_count: leadData.duplicate_count,
    lead_status: 'New Lead',
    additional_info: {
      ext_zip: leadData.ext_zip,
      loan_type_mort1: leadData.loan_type_mort1,
      months_since_mort1: leadData.months_since_mort1,
      trades_30d_past_due: leadData.trades_30d_past_due,
      high_credit_mort1: leadData.high_credit_mort1,
      num_pmts_mort1: leadData.num_pmts_mort1,
      pmt_amt_mort1: leadData.pmt_amt_mort1,
      remain_pmts_mort1: leadData.remain_pmts_mort1,
      open_dt_mort1: leadData.open_dt_mort1,
      high_credit_mort2: leadData.high_credit_mort2,
      open_dt_mort2: leadData.open_dt_mort2,
      pmt_amt_mort2: leadData.pmt_amt_mort2,
      remain_pmts_mort2: leadData.remain_pmts_mort2,
      loan_type_mort2: leadData.loan_type_mort2,
      bal_mort3: leadData.bal_mort3,
      high_credit_mort3: leadData.high_credit_mort3,
      open_dt_mort3: leadData.open_dt_mort3,
      pmt_amt_mort3: leadData.pmt_amt_mort3,
      remain_pmts_mort3: leadData.remain_pmts_mort3,
      loan_type_mort3: leadData.loan_type_mort3,
      bal_home_equity1: leadData.bal_home_equity1,
      bal_home_equity2: leadData.bal_home_equity2,
      bal_home_equity3: leadData.bal_home_equity3,
      ratio_bankcard: leadData.ratio_bankcard,
      bal_revolving: leadData.bal_revolving
    }
  };
};

// Helper functions for calculations
const calculateLTV = (propertyValue, firstMortgage, secondMortgage) => {
  const totalMortgage = parseFloat(firstMortgage || 0) + parseFloat(secondMortgage || 0);
  const propertyValueFloat = parseFloat(propertyValue || 0);
  return propertyValueFloat ? (totalMortgage / propertyValueFloat * 100).toFixed(2) : null;
};

const calculateDownPayment = (downPaymentPercentage, desiredLoanAmount) => {
  const percentage = parseFloat(downPaymentPercentage || 0) / 100;
  const loanAmount = parseFloat(desiredLoanAmount || 0);
  return loanAmount ? (loanAmount * percentage).toFixed(2) : null;
};

const calculateMonthlyDebtPayments = (leadData) => {
  return (parseFloat(leadData.pmt_amt_mort1 || 0) +
          parseFloat(leadData.pmt_amt_mort2 || 0) +
          parseFloat(leadData.pmt_amt_mort3 || 0)).toFixed(2);
};

const calculateAdditionalLiens = (leadData) => {
  return (parseFloat(leadData.bal_home_equity1 || 0) +
          parseFloat(leadData.bal_home_equity2 || 0) +
          parseFloat(leadData.bal_home_equity3 || 0)).toFixed(2);
};

const getLeadMapping = (leadSource) => {
  switch (leadSource.toUpperCase()) {
    case 'FRU':
      return mapFRULead;
    case 'LMB':
      return mapLowerMyBillsLead;
    case 'TU':
      return mapTransUnionLead;
    default:
      throw new Error(`Unsupported lead source: ${leadSource}`);
  }
};

module.exports = {
  getLeadMapping
};
