// src/renderer/pages/LookupTool.tsx
import React from 'react';
import { PageHeader } from '../components';
import APITest from '../components/APITest'; // Import the APITest component

export const LookupTool = () => {
  return (
    <div className="w-full h-full bg-dark-mainContentBg py-4">
      <PageHeader title="Lookup" /> 
      {/* Add the APITest component here */}
      <APITest />
    </div>
  );
};
