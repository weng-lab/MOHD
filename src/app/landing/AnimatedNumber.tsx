import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
}

export function AnimatedNumber({ value, duration = 1000 }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimestamp = useRef<number | null>(null);

  useEffect(() => {
    let animationFrame: number;

    const decimals =
      value % 1 !== 0 ? value.toString().split(".")[1]?.length ?? 0 : 0;

    const step = (timestamp: number) => {
      if (!startTimestamp.current) startTimestamp.current = timestamp;

      const progress = timestamp - startTimestamp.current;
      const percent = Math.min(progress / duration, 1);

      const current = percent * value;

      setDisplayValue(Number(current.toFixed(decimals)));

      if (percent < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrame);
      startTimestamp.current = null;
    };
  }, [value, duration]);

  return <>{displayValue}</>;
}
