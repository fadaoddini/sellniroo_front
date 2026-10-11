// app/(site)/layout.jsx
import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Header from "@/components/common/Header";
import MobileBottomNav from "@/components/common/MobileBottomNav";
import SiteFooter from "@/components/common/SiteFooter";
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

async function LayoutContent({ children }) {
  let siteName = DEFAULT_SITE_SETTINGS.site_name;
  try {
    const settings = await fetchSiteSettings();
    if (settings?.site_name) siteName = settings.site_name;
  } catch {
    /* fallback */
  }

  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning className="siteBody">
        <BreakingNews />
        <HeroSlider />
        <Header />
        <main className="siteMain">{children}</main>
        <SiteFooter siteName={siteName} />
        <MobileBottomNav />
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
