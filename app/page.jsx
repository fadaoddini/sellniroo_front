// app/page.jsx

import HomePage from "@/modules/home/components/HomePage";

export const metadata = {

  title: 'هلدینگ آریا استاد | بزرگترین تولیدکننده و مجری تخصصی سازه‌های سبک فولادی ال اس اف در ایران',
  
  alternates: {
    canonical: 'https://ariastudholding.com',
  },
  
  openGraph: {
    url: 'https://ariastudholding.com',
  },
};

export default function Page() {
  return (
    <>
      <h1 className="sr-only">
        هلدینگ آریا استاد | بزرگترین تولیدکننده و مجری تخصصی سازه‌های سبک فولادی ال اس اف در ایران
      </h1>

      <HomePage />
    </>
  );
}