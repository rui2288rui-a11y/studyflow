"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Square } from "lucide-react";
import { useAppStore } from "@/lib/store";

/**
 * 学習タイムトラッキング用ストップウォッチ。
 * タブが非アクティブでも正確な時間を保つため Date.now() 差分で計測する。
 */
export default function Stopwatch() {
  const subjects = useAppStore((s) => s.subjects);
  const addLog = useAppStore((s) => s.addLog);

  const [subjectId, setSubjectId] = useState("");
  const [elapsed, setElapsed] = useState(0); // 秒
  const [running, setRunning] = useState(false);
  const startRef = useRef<number>(0);
  const baseRef = useRef<number>(0);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setElapsed(baseRef.current + Math.floor((Date.now() - startRef.current) / 1000));
    }, 250);
    return () => clearInterval(t);
  }, [running]);

  const activeId = subjectId || subjects[0]?.id || "";
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  const start = () => {
    startRef.current = Date.now();
    baseRef.current = elapsed;
    setRunning(true);
  };
  const pause = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    setElapsed(0);
    baseRef.current = 0;
  };
  const save = () => {
    if (!activeId || elapsed < 60) return;
    addLog(activeId, Math.round(elapsed / 60));
    reset();
  };

  if (subjects.length === 0) {
    return (
      <div className="card p-5 text-sm text-slate-500 dark:text-slate-400">
        ストップウォッチを使うには、まず
        <a href="/settings" className="mx-1 font-semibold text-indigo-600 underline dark:text-indigo-400">設定</a>
        で科目を追加してください。
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="mb-4 flex flex-wrap gap-2">
        {subjects.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSubjectId(sub.id)}
            disabled={running}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 ${
              activeId === sub.id
                ? "border-transparent text-white shadow"
                : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"
            }`}
            style={activeId === sub.id ? { backgroundColor: sub.color } : undefined}
          >
            {sub.name}
          </button>
        ))}
      </div>

      <div className="my-6 text-center">
        <span className="text-6xl font-black tabular tracking-tight text-slate-800 dark:text-slate-100 sm:text-7xl">
          {timeStr}
        </span>
        {running && (
          <span className="ml-3 inline-block h-3 w-3 animate-pulse-soft rounded-full bg-red-500 align-middle" />
        )}
      </div>

      <div className="flex justify-center gap-3">
        {!running ? (
          <button onClick={start} className="btn-primary h-12 w-28">
            <Play size={18} />
            {elapsed > 0 ? "再開" : "開始"}
          </button>
        ) : (
          <button onClick={pause} className="btn-ghost h-12 w-28">
            <Pause size={18} />
            一時停止
          </button>
        )}
        <button
          onClick={save}
          disabled={elapsed < 60}
          title={elapsed < 60 ? "1分以上で保存できます" : "この時間を記録に保存"}
          className="btn h-12 w-28 bg-emerald-600 text-white hover:bg-emerald-500"
        >
          <Square size={16} />
          保存
        </button>
        <button onClick={reset} disabled={elapsed === 0} className="btn-ghost h-12 w-20">
          リセット
        </button>
      </div>
      <p className="mt-3 text-center text-[11px] text-slate-400">
        1分以上計測すると「保存」できます。記録は今日の学習に反映されます。
      </p>
    </div>
  );
}
