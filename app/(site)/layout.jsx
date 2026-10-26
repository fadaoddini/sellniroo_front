// app/(site)/layout.jsx
import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import "@/styles/globals.css";
import HomeLayoutBridge from "@/components/layout/HomeLayoutBridge";
import SiteChrome from "@/components/layout/SiteChrome";
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
        <HomeLayoutBridge />
        <SiteChrome siteName={siteName}>{children}</SiteChrome>
      </body>
    </html>
  );
}

export default function RootLayout({ children }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <LayoutContent>{children}</LayoutContent>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
