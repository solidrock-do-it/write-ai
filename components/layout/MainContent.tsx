import React from "react";

interface MainContentProps {
  sidebarOpen: boolean;
  children: React.ReactNode;
}

export function MainContent({ sidebarOpen, children }: MainContentProps) {
  return (
    <div
      className={`flex-1 p-4 overflow-y-auto flex flex-col transition-all duration-300 ${
        sidebarOpen ? "ml-56" : "ml-15"
      }`}
    >
      <div className="w-full mx-auto space-y-4 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
