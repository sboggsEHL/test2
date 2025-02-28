import React, { useState, useEffect } from "react";
import { PipelineLead } from "../models";
import { useLead, usePipeline } from "../context";
import Button from "./Button";
import Input from "./Input";
import LeadFormSideCar from "./LeadFormSideCar";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/solid";

type UpdateLeadFormProps = {
  onClose: () => void;
  lead?: Partial<PipelineLead>;
};

export default function UpdateLeadForm({ onClose, lead }: UpdateLeadFormProps) {
  const {
    createNewLead,
    updateExistingLead,
    deleteExistingLead,
    isLoading,
    error,
  } = useLead();
  const { exportToLOS, isExporting } = usePipeline();
  const username = sessionStorage.getItem("username") || "";
  const [formData, setFormData] = useState<Partial<PipelineLead>>({
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    email: "",
    dob: "",
    veteran: false,
    credit: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    home_phone: "",
    cell_phone: "",
    first_name_b2: "", // Co-borrower first name
    last_name_b2: "", // Co-borrower last name
    property_use: "",
    property_type: "",
    loan_purpose: "",
    mortgage_balance: 0,
    second_mortgage_balance: 0,
    desired_loan_amount: 0,
    estimated_value: 0,
    lead_source: "",
    status: "",
    lead_id: "",
    exported: false,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof PipelineLead, string>>
  >({});

  useEffect(() => {
    if (lead) {
      setFormData({
        first_name: lead.first_name || "",
        middle_name: lead.middle_name || "",
        last_name: lead.last_name || "",
        suffix: lead.suffix || "",
        email: lead.email || "",
        dob: lead.dob || "",
        veteran: lead.veteran || false,
        credit: lead.credit || "",
        address: lead.address || "",
        city: lead.city || "",
        state: lead.state || "",
        zip_code: lead.zip_code || "",
        home_phone: lead.home_phone || "",
        cell_phone: lead.cell_phone || "",
        first_name_b2: lead.first_name_b2 || "", // Co-borrower first name
        last_name_b2: lead.last_name_b2 || "", // Co-borrower last name
        property_use: lead.property_use || "",
        property_type: lead.property_type || "",
        loan_purpose: lead.loan_purpose || "",
        mortgage_balance: lead.mortgage_balance || 0,
        second_mortgage_balance: lead.second_mortgage_balance || 0,
        desired_loan_amount: lead.desired_loan_amount || 0,
        estimated_value: lead.estimated_value || 0,
        lead_source: lead.lead_source || "",
        status: lead.status || "",
        lead_id: lead.lead_id || "",
        exported: lead.exported || false,
      });
    }
  }, [lead]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof PipelineLead, string>> = {};
    if (!formData.first_name) newErrors.first_name = "First name is required";
    if (!formData.last_name) newErrors.last_name = "Last name is required";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length === 0) {
      try {
        if (lead?.id) {
          await updateExistingLead(lead.id, formData);
        } else {
          await createNewLead(formData);
        }
        onClose();
      } catch (err) {
        console.error("Error saving lead:", err);
      }
    } else {
      setErrors(formErrors);
    }
  };

  const handleExportToLOS = async () => {
    try {
      await exportToLOS(formData, username);
      // Optional: Show success message
    } catch (err) {
      // Error is already handled in context, but you could add additional UI feedback here
      console.error("Error in handleExportToLOS:", err);
    }
  };

  const isEditMode = !!lead?.id;

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-2 px-2 h-[48rem]"
    >
      <div className="sm:col-span-1">
        {/* Left column: Side Car for Personal Information */}
        <LeadFormSideCar lead={lead || {}} />
        <Button
          onClick={handleExportToLOS}
          type="button"
          disabled={isLoading || isExporting}
          className="mt-4 font-bold text-base bg-green-700 hover:bg-green-800 text-white w-full h-10"
        >
          <div className="flex items-start justify-center">
            {isExporting ? "Exporting..." : "Export to LOS"}
            <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-2" />
          </div>
        </Button>
      </div>

      {/* Right column: Editable Form Fields */}
      <div className="sm:col-span-2 overflow-y-scroll hide-scrollbar">
        <div className="border-b border-borderGray pb-12">
          {/* Personal Information */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 pb-4">
            <h2 className="text-base font-semibold leading-7 text-text col-span-full border-b border-borderGray pb-2">
              Personal Information
            </h2>

            <Input
              id="first_name"
              name="first_name"
              type="text"
              label="First Name"
              value={formData.first_name || ""}
              onChange={handleChange}
              error={errors.first_name}
              className="sm:col-span-3"
            />

            <Input
              id="middle_name"
              name="middle_name"
              type="text"
              label="Middle Name"
              value={formData.middle_name || ""}
              onChange={handleChange}
              error={errors.middle_name}
              className="sm:col-span-3"
            />

            <Input
              id="last_name"
              name="last_name"
              type="text"
              label="Last Name"
              value={formData.last_name || ""}
              onChange={handleChange}
              error={errors.last_name}
              className="sm:col-span-3"
            />

            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              value={formData.email || ""}
              onChange={handleChange}
              error={errors.email}
              className="sm:col-span-3"
            />

            <Input
              id="dob"
              name="dob"
              type="date"
              label="Date of Birth"
              value={formData.dob || ""}
              onChange={handleChange}
              error={errors.dob}
              className="sm:col-span-2"
            />

            <Input
              id="suffix"
              name="suffix"
              type="text"
              label="Suffix"
              value={formData.suffix || ""}
              onChange={handleChange}
              error={errors.suffix}
              className="sm:col-span-1"
            />

            <Input
              id="home_phone"
              name="home_phone"
              type="text"
              label="Home Phone"
              value={formData.home_phone || ""}
              onChange={handleChange}
              error={errors.home_phone}
              className="sm:col-span-3"
            />

            <Input
              id="cell_phone"
              name="cell_phone"
              type="text"
              label="Cell Phone"
              value={formData.cell_phone || ""}
              onChange={handleChange}
              error={errors.cell_phone}
              className="sm:col-span-3"
            />

            <Input
              id="address"
              name="address"
              type="text"
              label="Street Address"
              value={formData.address || ""}
              onChange={handleChange}
              error={errors.address}
              className="sm:col-span-6"
            />

            <Input
              id="city"
              name="city"
              type="text"
              label="City"
              value={formData.city || ""}
              onChange={handleChange}
              error={errors.city}
              className="sm:col-span-2"
            />

            <Input
              id="state"
              name="state"
              type="text"
              label="State / Province"
              value={formData.state || ""}
              onChange={handleChange}
              error={errors.state}
              className="sm:col-span-2"
            />

            <Input
              id="zip_code"
              name="zip_code"
              type="text"
              label="ZIP / Postal Code"
              value={formData.zip_code || ""}
              onChange={handleChange}
              error={errors.zip_code}
              className="sm:col-span-2"
            />

            <Input
              id="credit"
              name="credit"
              type="text"
              label="Credit Rating"
              value={formData.credit || ""}
              onChange={handleChange}
              error={errors.credit}
              className="sm:col-span-3"
            />
          </div>

          {/* Co-Borrower Information */}
          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 pb-4">
            <h2 className="text-base font-semibold leading-7 text-text col-span-full border-b border-borderGray pb-2">
              Co-Borrower Information
            </h2>

            <Input
              id="first_name_b2"
              name="first_name_b2"
              type="text"
              label="Co-Borrower First Name"
              value={formData.first_name_b2 || ""}
              onChange={handleChange}
              error={errors.first_name_b2}
              className="sm:col-span-3"
            />

            <Input
              id="last_name_b2"
              name="last_name_b2"
              type="text"
              label="Co-Borrower Last Name"
              value={formData.last_name_b2 || ""}
              onChange={handleChange}
              error={errors.last_name_b2}
              className="sm:col-span-3"
            />
          </div>

          {/* Property Information */}
          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 pb-4">
            <h2 className="text-base font-semibold leading-7 text-text col-span-full border-b border-borderGray pb-2">
              Property Information
            </h2>

            <Input
              id="property_use"
              name="property_use"
              type="text"
              label="Property Use"
              value={formData.property_use || ""}
              onChange={handleChange}
              error={errors.property_use}
              className="sm:col-span-3"
            />

            <Input
              id="property_type"
              name="property_type"
              type="text"
              label="Property Type"
              value={formData.property_type || ""}
              onChange={handleChange}
              error={errors.property_type}
              className="sm:col-span-3"
            />

            <Input
              id="estimated_value"
              name="estimated_value"
              type="number"
              label="Estimated Value"
              value={formData.estimated_value || 0}
              onChange={handleChange}
              error={errors.estimated_value}
              className="sm:col-span-3"
            />
          </div>

          {/* Loan Details */}
          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 pb-4">
            <h2 className="text-base font-semibold leading-7 text-text col-span-full border-b border-borderGray pb-2">
              Loan Details
            </h2>

            <Input
              id="loan_purpose"
              name="loan_purpose"
              type="text"
              label="Loan Purpose"
              value={formData.loan_purpose || ""}
              onChange={handleChange}
              error={errors.loan_purpose}
              className="sm:col-span-3"
            />

            <Input
              id="desired_loan_amount"
              name="desired_loan_amount"
              type="number"
              label="Desired Loan Amount"
              value={formData.desired_loan_amount || 0}
              onChange={handleChange}
              error={errors.desired_loan_amount}
              className="sm:col-span-3"
            />

            <Input
              id="mortgage_balance"
              name="mortgage_balance"
              type="number"
              label="Mortgage Balance"
              value={formData.mortgage_balance || 0}
              onChange={handleChange}
              error={errors.mortgage_balance}
              className="sm:col-span-3"
            />

            <Input
              id="second_mortgage_balance"
              name="second_mortgage_balance"
              type="number"
              label="Second Mortgage Balance"
              value={formData.second_mortgage_balance || 0}
              onChange={handleChange}
              error={errors.second_mortgage_balance}
              className="sm:col-span-3"
            />
          </div>

          {/* Other Details */}
          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 pb-4">
            <h2 className="text-base font-semibold leading-7 text-text col-span-full border-b border-borderGray pb-2">
              Other Details
            </h2>

            <Input
              id="lead_source"
              name="lead_source"
              type="text"
              label="Lead Source"
              value={formData.lead_source || ""}
              onChange={handleChange}
              error={errors.lead_source}
              className="sm:col-span-3"
            />

            <Input
              id="status"
              name="status"
              type="text"
              label="Status"
              value={formData.status || ""}
              onChange={handleChange}
              error={errors.status}
              className="sm:col-span-3"
            />
          </div>
        </div>

        <div className="w-full mt-6 flex items-center justify-between gap-x-6">
          <div className="flex ml-auto gap-x-6">
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => console.log("Updating...")}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : isEditMode ? "Update" : "Add"}
            </Button>
          </div>
        </div>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </form>
  );
}
