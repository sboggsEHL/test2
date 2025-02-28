import React from "react";

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  className = "",
  type = "button",
  variant = "primary",
  disabled = false,
}) => {
  const baseClasses =
    "rounded-md px-3 py-2 text-sm font-semibold text-gray-50 shadow-sm";
  const variantClasses =
    variant === "primary"
      ? "bg-titleButtonBg hover:bg-titleButtonHoverBg"
      : "bg-gray-600 hover:bg-gray-700";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
