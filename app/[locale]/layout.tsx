import { getMessages } from 'next-intl/server';
import { Metadata } from "next";
import { cookies } from "next/headers";
import React from "react";
import type { Viewport } from "next";
import SplashScreen from "@/components/splashScreen";
import { Refine } from "@refinedev/core";
import { RefineKbar } from "@refinedev/kbar";
import { useNotificationProvider } from "@refinedev/mui";
import routerProvider from "@refinedev/nextjs-router";
import { authProviderClient } from "@/providers/auth-provider/auth-provider.client";
import { dataProvider } from "@/providers/data-provider";
import { accessControlProvider } from "@providers/access-provider/access-control.client"
import resources from "@resources";


import { defaultUrl, APP_NAME, APP_DEFAULT_TITLE, APP_TITLE_TEMPLATE, APP_DESCRIPTION } from "@/constants";

import { Providers } from "@components/providers";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  metadataBase: new URL(defaultUrl),
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  }, // default title
  icons: {
    icon: "/favicon.ico",
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};


export default async function RootLayout({
  children,
  params: {locale}
}: Readonly<{
  children: React.ReactNode;
  params: {locale: string};
}>) {
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme");
  const defaultMode = theme?.value === "dark" ? "dark" : "light";


  return (
    <html lang={locale}>
      <body>
        <Providers defaultMode={defaultMode} messages={messages} locale={locale}>
          <Refine
            routerProvider={routerProvider}
            authProvider={authProviderClient}
            dataProvider={dataProvider}
            notificationProvider={useNotificationProvider}
            accessControlProvider={accessControlProvider}
            resources={resources}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
              useNewQueryKeys: true,
              projectId: "lexx72-WST3Re-ljtrGz",
              title: { 
                text: APP_DEFAULT_TITLE,
                icon: "/Logo.png"
              }
            }}
          >
            <SplashScreen loading={false} />
            { children }
            <RefineKbar />
          </Refine>
        </Providers>
      </body>
    </html>
  );
}
