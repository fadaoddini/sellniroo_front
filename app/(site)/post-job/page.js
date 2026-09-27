// app/post-job/page.js
import { Suspense } from 'react';
import PostJobClient from './PostJobClient';

export const metadata = {
  title: 'ثبت آگهی جدید | آریا استاد',
  description: 'آگهی استخدام یا کارجو خود را ثبت کنید',
};

export default function PostJobPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px 20px', textAlign: 'center' }}>در حال بارگذاری...</div>}>
      <PostJobClient />
    </Suspense>
  );
}