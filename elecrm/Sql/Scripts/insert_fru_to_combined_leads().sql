
BEGIN
    INSERT INTO app.combined_leads (
        globalid, lead_source, first_name, last_name, email, ssn, phone_primary, phone_secondary, phone_other,
        property_street_address, property_city, property_state, property_zip_code,
        loan_purpose, property_type, property_use, property_value, desired_loan_amount,
        first_mortgage_balance, second_mortgage_balance, first_mortgage_rate, credit_rating,
        cash_out, veteran_status, estimated_down_payment, ltv, universal_lead_id, campaign_id
    ) VALUES (
        NEW.globalid, 'FRU', NEW.first_name, NEW.last_name, NEW.email, NEW.ssn, NEW.cell_phone, NEW.home_phone, NEW.other_phone,
        NEW.street_address, NEW.property_city, NEW.property_state, NEW.zip,
        NEW.loan_purpose, NEW.property_type, NEW.property_use, NEW.property_value, NEW.desired_loan_amt,
        NEW.first_mort_balance, NEW.second_mort_balance, NEW.first_mort_rate, NEW.credit_rating,
        NEW.cashout, NEW.veteran_military, NEW.est_down_payment, NEW.ltv, NEW.universal_leadid, NEW.campaign_id
    );
    RETURN NEW;
END;
