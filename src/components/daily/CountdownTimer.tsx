import { useState, useEffect, useRef } from "react";
import { getNextMidnightUTC } from "@/lib/data";

interface CountdownTimerProps {
  /** Called once when the countdown first crosses zero. */
  onExpire?: () => void;
}

/**
 * Counts down to the next UTC midnight.
 * When the window hits zero, shows an explicit expired state instead of
 * silently restarting toward the following midnight.
 */
export default function CountdownTimer({ onExpire }: CountdownTimerProps = {}) {
  const [timeLeft, setTimeLeft] = useState("--:--:--");
  const [expired, setExpired] = useState(false);
  /** Fixed target for this mount — do not retarget after expiry. */
  const targetMs = useRef<number | null>(null);
  const didExpire = useRef(false);

  useEffect(() => {
    function update() {
      try {
        if (targetMs.current == null) {
          const midnight = getNextMidnightUTC();
          const ms = midnight.getTime();
          if (!Number.isFinite(ms)) {
            setTimeLeft("--:--:--");
            return;
          }
          targetMs.current = ms;
        }

        const diff = targetMs.current - Date.now();

        if (diff <= 0) {
          setTimeLeft("00:00:00");
          if (!didExpire.current) {
            didExpire.current = true;
            setExpired(true);
            onExpire?.();
          }
          return;
        }

        const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(
          2,
          "0",
        );
        const minutes = String(
          Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        ).padStart(2, "0");
        const seconds = String(
          Math.floor((diff % (1000 * 60)) / 1000),
        ).padStart(2, "0");
        setTimeLeft(`${hours}:${minutes}:${seconds}`);
      } catch {
        setTimeLeft("--:--:--");
      }
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [onExpire]);

  if (expired) {
    return (
      <span
        role="status"
        className="font-mono text-[9px] sm:text-[10px] text-warn tracking-wide uppercase"
      >
        EXPIRED · next target incoming
      </span>
    );
  }

  return (
    <span className="font-mono text-xs sm:text-sm text-muted-foreground tabular-nums">
      {timeLeft}
    </span>
  );
}
