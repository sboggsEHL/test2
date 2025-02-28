import React from "react";

type PageHeaderProps = {
  title: string;
  children?: React.ReactNode;
};

export default function PageHeader({
  title,
  children,
}: PageHeaderProps) {
  return (
    <div className="w-full border-b border-gray-700 flex p-4 md:flex md:items-center md:justify-between">
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl font-bold leading-7 text-text sm:truncate sm:text-3xl sm:tracking-tight">
          {title}
        </h2>
      </div>
      <div className="mt-4 flex md:ml-4 md:mt-0">
        {/* Any buttons with actions can be rendered here */}
        {children}
      </div>
    </div>
  );
}
