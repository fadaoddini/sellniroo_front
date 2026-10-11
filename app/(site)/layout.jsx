// app/(site)/layout.jsx
import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Header from "@/components/common/Header";
import "@/styles/globals.css";
import BreakingNews from "@/components/common/breakingnews/BreakingNews";
import HeroSlider from "@/components/slider";
import {
  fetchSiteSettings,
  buildMetadataFromSettings,
  DEFAULT_SITE_SETTINGS,
} from "@/services/siteSettings";

export async function generateMetadata() {
  try {
    const settings = await fetchSiteSettings();
    return buildMetadataFromSettings(settings);
  } catch {
    return buildMetadataFromSettings(DEFAULT_SITE_SETTINGS);
  }
}

function LayoutContent({ children }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <BreakingNews />
        <HeroSlider />
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}

export default function RootLayout({ children }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <LayoutContent>{children}</LayoutContent>
      </AuthProvider>
    </LanguageProvider>
  );
}
