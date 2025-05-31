"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RefineKbarProvider } from "@refinedev/kbar";
import { RefineSnackbarProvider } from "@refinedev/mui";
import { ColorModeContextProvider } from "@/contexts/color-mode";
import { NextIntlClientProvider } from "next-intl";

export function Providers({
  children,
  defaultMode,
  messages,
  locale,
}: {
  children: React.ReactNode;
  defaultMode: "light" | "dark";
  messages: any;
  locale: string;
}) {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <RefineKbarProvider>
        <ColorModeContextProvider defaultMode={defaultMode}>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <RefineSnackbarProvider>
              {children}
              <ReactQueryDevtools initialIsOpen={false} />
            </RefineSnackbarProvider>
          </NextIntlClientProvider>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </QueryClientProvider>
  );
}