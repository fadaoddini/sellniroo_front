// app/(admin)/layout.jsx
"use client";

import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import SiteFooter from "@/components/common/SiteFooter";
import "@/styles/globals.css";

export default function AdminLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning className="adminBody">
        <LanguageProvider>
          <AuthProvider>
            <div className="adminShell">
              <div className="adminShellMain">{children}</div>
              <SiteFooter />
            </div>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}