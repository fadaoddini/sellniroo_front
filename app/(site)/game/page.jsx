// app/game/page.jsx
import Game from '@/components/Game/Game';

export const metadata = {
  title: 'مهندس دایناسور | نبض ساختمان',
  description: 'بازی مهندس بیتی - از موانع عبور کن و رکورد بزن!',
};

export default function GamePage() {
  return <Game />;
}