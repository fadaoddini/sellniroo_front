// app/(site)/layout.jsx
import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import HeaderSlot from "@/components/modules/HeaderSlot";
import HeaderByMenuTopSlot from "@/components/modules/HeaderByMenuTopSlot";
import CorporateMobileNavSlot from "@/components/modules/CorporateMobileNavSlot";
import MobileBottomNavSlot from "@/components/modules/MobileBottomNavSlot";
import SiteFooterSlot from "@/components/modules/SiteFooterSlot";
import "@/styles/globals.css";
import BreakingNewsSlot from "@/components/modules/BreakingNewsSlot";
import VideoInstaSlot from "@/components/modules/VideoInstaSlot";
import HeroSliderSlot from "@/components/modules/HeroSliderSlot";
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
        <BreakingNewsSlot />
        <VideoInstaSlot variant="rail" />
        <HeroSliderSlot />
        <HeaderByMenuTopSlot />
        <HeaderSlot />
        <main className="siteMain">{children}</main>
        <SiteFooterSlot siteName={siteName} />
        <CorporateMobileNavSlot />
        <MobileBottomNavSlot />
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
