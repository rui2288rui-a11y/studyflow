"use client";

import { useMemo, useState } from "react";
import { X, Plus } from "lucide-react";
import { useAppStore } from "@/lib/store";

/**
 * 画面右下の FAB から開く「クイック学習記録」モーダル。
 * ストップウォッチ or 手動入力で今日の学習を最速で記録する。
 */
export default function QuickLogModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const subjects = useAppStore((s) => s.subjects);
  const addLog = useAppStore((s) => s.addLog);

  const [subjectId, setSubjectId] = useState<string>("");
  const [minutes, setMinutes] = useState(25);
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const activeId = useMemo(
    () => subjectId || subjects[0]?.id || "",
    [subjectId, subjects]
  );

  if (!open) return null;

  const submit = async () => {
    if (!activeId || minutes <= 0) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 150)); // 視覚的フィードバック
    addLog(activeId, minutes, memo || undefined);
    setSubmitting(false);
    setMemo("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm md:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 md:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">クイック学習記録</h2>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {subjects.length === 0 ? (
          <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
            まだ科目がありません。<a href="/settings" className="font-semibold underline">設定</a>から科目を追加してください。
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">科目</label>
              <div className="flex flex-wrap gap-2">
                {subjects.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSubjectId(s.id)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                      activeId === s.id
                        ? "border-transparent text-white shadow"
                        : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                    }`}
                    style={activeId === s.id ? { backgroundColor: s.color } : undefined}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: activeId === s.id ? "#fff" : s.color }}
                    />
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                学習時間: {minutes}分
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={5}
                  max={240}
                  step={5}
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600 dark:bg-slate-700"
                />
                <input
                  type="number"
                  min={1}
                  max={600}
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(1, Number(e.target.value) || 1))}
                  className="w-20 rounded-lg border border-slate-200 bg-transparent px-3 py-1.5 text-center text-sm tabular dark:border-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                メモ（任意）
              </label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="例: 過去問 演習"
                className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700"
              />
            </div>

            <button
              onClick={submit}
              disabled={submitting}
              className="btn-primary w-full py-3"
            >
              <Plus size={16} />
              {submitting ? "記録中…" : "この内容で記録"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
