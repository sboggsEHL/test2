import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import "../styles/common.css";
import LoginBox from "../components/LoginBox";
import ElevatedLoader from "../components/ElevatedLoader";

export const Login: React.FC = () => {
  const { login, resetPassword, errorMessage, loading } = useUser();
  const [isResetMode, setIsResetMode] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">ECM</h1>

      {loading ? (
        <ElevatedLoader width="15rem" />
      ) : (
        <LoginBox
          handleLogin={login}
          handleReset={resetPassword}
          errorMessage={errorMessage}
          isResetMode={isResetMode}
          setIsResetMode={setIsResetMode}
        />
      )}
    </div>
  );
};

export default Login;
