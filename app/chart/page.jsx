// app/news/page.jsx

import NewsList from '@/components/News/NewsList';
import OrganizationChartHexa from '../../modules/home/components/sections/ChartSection/OrganizationChartHexa';

export const metadata = {
  title: 'آریا اِستاد | نمودار سازمانی ',
  description: 'بزرگترین مرجع صنعت ساختمان و پیشرو در تولید و خدمات گسترده و نوین',
};

export default function Chart() {
  return (
    <div className="container">
      <OrganizationChartHexa />
    </div>
  )
}
