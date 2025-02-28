// src/renderer/components/LoginButton.tsx
import React from 'react';

interface LoginButtonProps {
  type: 'submit' | 'button' | 'reset';
  text: string;
  className?: string;
}

const LoginButton: React.FC<LoginButtonProps> = ({ type, text, className }) => (
  <button type={type} className={className}>
    {text}
  </button>
);

export default LoginButton;
