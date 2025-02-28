import React, { useState, useEffect, useCallback } from "react";
import InputField from "./InputField";
import LoginButton from "./LoginButton";
import ErrorMessage from "./ErrorMessage";
import "../styles/common.css";

interface LoginBoxProps {
  handleLogin: (username: string, password: string) => void;
  handleReset: (username: string) => Promise<void>;
  errorMessage: string;
  isResetMode: boolean;
  setIsResetMode: (value: boolean) => void;
}

const LoginBox: React.FC<LoginBoxProps> = ({
  handleLogin,
  handleReset,
  errorMessage,
  isResetMode,
  setIsResetMode,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) setUsername(savedUsername);
    if (!isResetMode) {
      const savedPassword = localStorage.getItem("password");
      if (savedPassword) setPassword(savedPassword);
    }
  }, [isResetMode]);

  const onSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isResetMode) {
      try {
        await handleReset(username);
        setResetSuccess(true);
        setUsername(""); // Clear username after successful reset
      } catch (error) {
        setResetSuccess(false);
      }
    } else {
      localStorage.setItem("username", username);
      localStorage.setItem("password", password);
      handleLogin(username, password);
    }
  }, [isResetMode, username, password, handleReset, handleLogin]);

  const handleBackToLogin = useCallback(() => {
    setIsResetMode(false);
    setResetSuccess(false);
    setUsername("");
  }, [setIsResetMode]);

  const handleForgotPassword = useCallback(() => {
    setIsResetMode(true);
    setResetSuccess(false);
  }, [setIsResetMode]);

  return (
    <div className="w-80">
      {isResetMode && resetSuccess ? (
        <div className="flex flex-col gap-4">
          <div className="text-green-500 text-center">
            Password reset initiated. Please check your Slack for further instructions.
          </div>
          <button
            type="button"
            onClick={handleBackToLogin}
            className="h-10 mt-2 text-blue-600 hover:text-white transition duration-200"
          >
            Back to Login
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {isResetMode ? (
            <>
              <div className="flex flex-col gap-1">
                <label htmlFor="username" className="text-sm text-gray-300">
                  Enter your username to reset password
                </label>
                <InputField
                  type="text"
                  id="username"
                  placeholder="Username"
                  autoComplete="username"
                  className="w-full p-2 bg-slate-600 border border-borderGray rounded text-gray-100 placeholder:text-gray-100"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <LoginButton
                type="submit"
                text="Reset Password"
                className="w-full p-3 bg-sidebarButtonBg text-text rounded cursor-pointer transition duration-200 hover:bg-sidebarButtonHoverBg"
              />
              <button
                type="button"
                onClick={handleBackToLogin}
                className="h-10 mt-2 text-blue-600 hover:text-white transition duration-200"
              >
                Back to Login
              </button>
            </>
          ) : (
            <>
              <InputField
                type="text"
                id="username"
                placeholder="Username"
                autoComplete="username"
                className="w-full p-2 bg-slate-600 border border-borderGray rounded text-gray-100 placeholder:text-gray-100"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <InputField
                type="password"
                id="password"
                placeholder="Password"
                autoComplete="current-password"
                className="w-full p-2 bg-slate-600 border border-borderGray rounded text-gray-100 placeholder:text-gray-100"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <LoginButton
                type="submit"
                text="Sign In"
                className="w-full p-3 bg-sidebarButtonBg text-text rounded cursor-pointer transition duration-200 hover:bg-sidebarButtonHoverBg"
              />
              <button
                type="button"
                onClick={handleForgotPassword}
                className="h-10 mt-2 text-blue-600 hover:text-white transition duration-200"
              >
                Forgot Password?
              </button>
            </>
          )}
        </form>
      )}
      {errorMessage && (
        <ErrorMessage message={errorMessage} className="mx-auto text-red-500 mt-4 text-center" />
      )}
    </div>
  );
};

export default LoginBox;
