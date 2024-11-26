import React from "react";

const NoSidebarLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="">
      {children}
    </div>
  );
};

export default NoSidebarLayout;
