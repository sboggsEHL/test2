import React from "react";
import ElevatedLoader from "./ElevatedLoader";

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-36 w-auto">
      <ElevatedLoader width="10rem" />
    </div>
  );
};

export default LoadingIndicator;
