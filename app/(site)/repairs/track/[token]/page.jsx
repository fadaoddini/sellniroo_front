import RepairsTrackPage from '@/components/Repairs/RepairsTrackPage'

export const metadata = {
  title: 'پیگیری تعمیر | سلنیرو',
}

export default function RepairTrackRoute({ params }) {
  return <RepairsTrackPage token={params?.token} />
}
