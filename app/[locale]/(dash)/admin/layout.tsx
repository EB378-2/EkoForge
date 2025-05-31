"use client";

import AdminNav from "@components/AdminComponents/AdminNav";
import React from "react";
import { Box } from "@mui/material";
import { CanAccess } from "@refinedev/core";

export default function Layout({ children }: React.PropsWithChildren) {

  return (
    <CanAccess resource="admin" action="list" fallback={
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <h1>Access Denied</h1>
        <p>You do not have permission to access this page.</p>
      </Box>
    }>
      {/* Admin Navigation */}
      <AdminNav />      
      { children }
    </CanAccess>
  );
}