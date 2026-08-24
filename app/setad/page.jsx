// app/setad/page.jsx
import SetadPage from '@/modules/setad/components/SetadPage';

export const metadata = {
  title: 'مزایده و مناقصات | آریا استاد هلدینگ',
  description: 'مشاهده آخرین مناقصات و مزایده‌های سامانه ستاد - به‌روزرسانی لحظه‌ای',
  keywords: 'مناقصه, مزایده, ستاد, تدارکات الکترونیکی, فراخوان',
};

export default function Page() {
  return (
    <>
      <h1 className="sr-only">مزایده و مناقصات - آریااستاد </h1>
      <SetadPage />
    </>
  );
}