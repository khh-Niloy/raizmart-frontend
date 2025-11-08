"use client";

import React from "react";

export interface CountdownTimerProps {
  endAt: string | Date;
  className?: string;
  darkLabels?: boolean;
}

export function CountdownTimer({ endAt, className, darkLabels }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = React.useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  React.useEffect(() => {
    const calculate = () => {
      const target = new Date(endAt).getTime();
      const now = Date.now();
      const diff = target - now;
      if (isNaN(target) || diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds, expired: false });
    };

    calculate();
    const id = setInterval(calculate, 1000);
    return () => clearInterval(id);
  }, [endAt]);

  const labelColor = darkLabels ? "text-gray-900" : "text-white";

  if (timeLeft.expired) {
    return (
      <div className={className ?? ""}>
        <span className="inline-flex text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-700">
          Expired
        </span>
      </div>
    );
  }

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-gray-900/90 rounded-md px-3 py-2 min-w-[52px] text-center border border-gray-800">
        <span className="text-white text-xl font-semibold">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className={`${labelColor} text-[10px] mt-1 tracking-wide`}>{label}</span>
    </div>
  );

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <TimeBox value={timeLeft.days} label="DAY" />
      <TimeBox value={timeLeft.hours} label="HRS" />
      <TimeBox value={timeLeft.minutes} label="MIN" />
      <TimeBox value={timeLeft.seconds} label="SEC" />
    </div>
  );
}

export default CountdownTimer;


