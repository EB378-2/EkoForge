import React from "react";
import { CanAccess } from "@refinedev/core";
export default async function Layout({ children }: React.PropsWithChildren) {

  return (
    <>
      {/*
      
      <CanAccess fallback={<div>You cannot access this section</div>}>
        {children}
      </CanAccess>
      
      */}

      { children }
    </>
  );
}