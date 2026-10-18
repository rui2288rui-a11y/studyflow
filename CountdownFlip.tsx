"use client";

import { useEffect, useState } from "react";

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-16 w-14 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md sm:h-20 sm:w-16">
        <span className="text-3xl font-black tabular sm:text-4xl">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="mt-1.5 text-[11px] font-bold text-white/80">{label}</span>
    </div>
  );
}

function Separator() {
  return (
    <span className="-mt-5 text-3xl font-black text-white/50 sm:-mt-6">:</span>
  );
}

/** 秒単位のリアルタイムカウントダウン表示 */
export default function CountdownFlip({
  days, hours, minutes, seconds,
}: { days: number; hours: number; minutes: number; seconds: number }) {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 200);
    return () => clearTimeout(t);
  }, [seconds]);

  return (
    <div className="mt-4 flex items-start justify-center gap-2 sm:gap-3">
      <Unit value={days} label="日" />
      <Separator />
      <Unit value={hours} label="時間" />
      <Separator />
      <Unit value={minutes} label="分" />
      <Separator />
      <div className={pulse ? "animate-pulse-soft" : ""}>
        <Unit value={seconds} label="秒" />
      </div>
    </div>
  );
}
