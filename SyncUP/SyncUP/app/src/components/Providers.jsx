"use client";
/* eslint-disable import/extensions,import/no-unresolved */
import React from "react";
import {NextUIProvider} from "@nextui-org/react";
import { SessionProvider } from "next-auth/react";

import {ThemeProvider as NextThemesProvider} from "next-themes";
function Providers({ children }) {
  return (
    <NextUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="dark">
      <SessionProvider>{children}</SessionProvider>
      </NextThemesProvider>
    </NextUIProvider>
  );
}

export default Providers;
