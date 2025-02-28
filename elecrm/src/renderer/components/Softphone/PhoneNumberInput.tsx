import React from "react";

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value,
  onChange,
  isValid,
  disabled = false,
  placeholder = "(555) 555-5555",
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 10) value = value.slice(0, 10);

    let formattedValue = value;
    if (value.length > 6) {
      formattedValue = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
    } else if (value.length > 3) {
      formattedValue = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    } else if (value.length > 0) {
      formattedValue = `(${value}`;
    }

    onChange(formattedValue);
  };

  return (
    <div className="w-full my-8">
      <input
        type="text"
        className={`w-full p-2 bg-inherit border-none text-primaryText text-center text-xl focus:border-none hover:border-none active:border-none focus:outline-none rounded ${
          !isValid && value !== "" ? "border-2 border-red-500" : ""
        }`}
        name="phone"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        maxLength={14}
        readOnly={disabled}
      />
      {!isValid && value !== "" && (
        <p className="text-red-500 text-sm mt-1 text-center">
          Please enter a valid 10 digit phone number.
        </p>
      )}
    </div>
  );
};

export default PhoneNumberInput;
