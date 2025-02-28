// src/renderer/components/InputField.tsx
import React from "react";

interface InputFieldProps {
  type: string;
  id: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  className?: string;
  autoComplete?: string;
  textColor?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  type,
  id,
  placeholder,
  value,
  onChange,
  required = false,
  className,
  autoComplete,
}) => (
  <input
    type={type}
    id={id}
    placeholder={placeholder}
    autoComplete={autoComplete}
    className={`${className}`}
    value={value}
    onChange={onChange}
    required={required}
  />
);

export default InputField;
