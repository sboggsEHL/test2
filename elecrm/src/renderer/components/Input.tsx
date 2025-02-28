import React from "react";

interface GenericFormInputProps {
  id: string;
  name: string;
  type: string;
  label: string;
  value: string | number;
  placeholder?: string;
  error?: string;
  className?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<GenericFormInputProps> = ({
  id,
  name,
  type,
  label,
  value,
  placeholder,
  error,
  onChange,
  className = "",
}) => {
  return (
    <div className={`${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-text">
        {label}
      </label>
      <div className="mt-2">
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="block w-full rounded-md border-0 p-1.5 text-altContentBg shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-titleButtonActiveBg sm:text-sm"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
};

export default Input;
