import "@/styles/globals.css";

export const metadata = {
  title: {
    default: "پنل مدیریت",
    template: "%s | پنل مدیریت آریا استاد",
  },

  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}