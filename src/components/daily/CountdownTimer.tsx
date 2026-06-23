import { useState, useEffect } from 'react';
import { getNextMidnightUTC } from '@/lib/data';

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState('--:--:--');

  useEffect(() => {
    function update() {
      const midnight = getNextMidnightUTC();
      const diff = midnight.getTime() - new Date().getTime();

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        return;
      }

      const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
      const minutes = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
      const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
      setTimeLeft(`${hours}:${minutes}:${seconds}`);
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="font-mono text-xs sm:text-sm text-muted-foreground tabular-nums">{timeLeft}</span>
  );
}