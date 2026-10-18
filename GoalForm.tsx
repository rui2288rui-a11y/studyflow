"use client";

import { useState } from "react";
import { Plus, RotateCcw } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { EXAM_PRESETS } from "@/lib/constants";

/** 目標（試験）の新規登録・変更フォーム。プリセット選択で日付が自動入力される。 */
export default function GoalForm({ initial }: { initial?: { title: string; examDate: string; presetId?: string } }) {
  const setGoal = useAppStore((s) => s.setGoal);
  const [presetId, setPresetId] = useState(initial?.presetId ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [examDate, setExamDate] = useState(() => {
    if (initial) return initial.examDate.slice(0, 16);
    return "";
  });
  const [error, setError] = useState("");

  const applyPreset = (id: string) => {
    setPresetId(id);
    const p = EXAM_PRESETS.find((x) => x.id === id);
    if (p) {
      setTitle(p.name);
      setExamDate(p.date.slice(0, 16));
    }
  };

  const submit = () => {
    if (!title.trim()) return setError("試験名を入力してください");
    if (!examDate) return setError("日付を選択してください");
    setError("");
    setGoal({
      id: crypto.randomUUID(),
      title: title.trim(),
      examDate: new Date(examDate).toISOString(),
      presetId: presetId || undefined,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="card space-y-4 p-5">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">
          プリセットから選ぶ
        </label>
        <div className="flex flex-wrap gap-2">
          {(["大学受験", "資格・検定"] as const).map((cat) => (
            <div key={cat} className="flex flex-wrap gap-1.5">
              {EXAM_PRESETS.filter((p) => p.category === cat).map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                    presetId === p.id
                      ? "border-indigo-600 bg-indigo-600 text-white shadow"
                      : "border-slate-200 text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:text-slate-300"
                  }`}
                >
                  {p.name.replace(/ 202[67]年度?| 第174回| 2026年12月/, "")}
                </button>
              ))}
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
          ※プリセットは2026年10月時点の公式発表日程です。必ず公式サイトで最新情報をご確認ください。
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">
          試験名・目的
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: 東京大学 理系 / 英検準1級"
          className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">
          試験日（基準時刻）
        </label>
        <input
          type="datetime-local"
          value={examDate}
          onChange={(e) => {
            setExamDate(e.target.value);
            setPresetId("");
          }}
          className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:[color-scheme:dark]"
        />
      </div>

      {error && <p className="text-xs font-semibold text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button onClick={submit} className="btn-primary flex-1">
          <Plus size={16} />
          {initial ? "更新する" : "目標を設定"}
        </button>
        {initial && (
          <button
            onClick={() => {
              setTitle("");
              setExamDate("");
              setPresetId("");
            }}
            className="btn-ghost"
            title="リセット"
          >
            <RotateCcw size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
