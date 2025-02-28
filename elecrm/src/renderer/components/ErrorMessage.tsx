// src/renderer/components/ErrorMessage.tsx
import React from 'react';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className }) => (
  <p className={className}>{message}</p>
);

export default ErrorMessage;
