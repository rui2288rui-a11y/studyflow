"use client";

import { useState } from "react";
import { Plus, Trash2, Target, Clock3, X } from "lucide-react";
import { useAppStore } from "@/lib/store";
import GoalForm from "@/components/GoalForm";
import type { Settings } from "@/types";

function SettingsRow({
  label, value, min, max, step, onChange, format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</label>
        <span className="text-xs font-bold tabular text-indigo-600 dark:text-indigo-300">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600 dark:bg-slate-700"
      />
    </div>
  );
}

export default function SettingsPage() {
  const {
    subjects, addSubject, updateSubject, removeSubject,
    settings, updateSettings,
  } = useAppStore();

  const [name, setName] = useState("");
  const [target, setTarget] = useState(80);
  const [current, setCurrent] = useState(50);
  const [weak, setWeak] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editScores, setEditScores] = useState({ target: 0, current: 0 });

  const add = () => {
    if (!name.trim()) return;
    addSubject(
      name.trim(),
      Math.min(100, Math.max(0, target)),
      Math.min(100, Math.max(0, current)),
      weak.split(/[,、・\s]+/).map((w) => w.trim()).filter(Boolean)
    );
    setName("");
    setWeak("");
    setCurrent(50);
  };

  const startEdit = (id: string, t: number, c: number) => {
    setEditingId(id);
    setEditScores({ target: t, current: c });
  };

  return (
    <div className="fade-up mx-auto max-w-2xl space-y-5 px-4 py-6">
      <header>
        <h1 className="text-xl font-extrabold">設定</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          目標・科目・計画のパラメータを管理します。データは端末内にのみ保存されます。
        </p>
      </header>

      {/* ---------- 目標 ---------- */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-extrabold">
          <Target size={16} className="text-indigo-500" />
          目標（試験）
        </h2>
        <GoalForm />
      </section>

      {/* ---------- 科目管理 ---------- */}
      <section className="card space-y-4 p-5">
        <h2 className="text-sm font-extrabold">科目（目標点・実力・弱点）</h2>

        {subjects.length > 0 && (
          <ul className="space-y-2">
            {subjects.map((s) => (
              <li key={s.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="min-w-0 flex-1 truncate text-sm font-bold">{s.name}</span>
                  <button
                    onClick={() => startEdit(s.id, s.targetScore, s.currentScore)}
                    className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    点数編集
                  </button>
                  <button
                    onClick={() => removeSubject(s.id)}
                    aria-label="科目を削除"
                    className="rounded-lg p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  目標 {s.targetScore}点 ・ 実力 {s.currentScore}点
                  {s.weakUnits.length > 0 ? ` ・ 弱点: ${s.weakUnits.join(" / ")}` : ""}
                </p>
                {editingId === s.id && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={editScores.target}
                      onChange={(e) => setEditScores((p) => ({ ...p, target: Number(e.target.value) }))}
                      className="w-16 rounded-lg border border-slate-200 bg-transparent px-2 py-1 text-center text-xs tabular dark:border-slate-700"
                      aria-label="目標点"
                    />
                    <span className="text-xs text-slate-400">/</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={editScores.current}
                      onChange={(e) => setEditScores((p) => ({ ...p, current: Number(e.target.value) }))}
                      className="w-16 rounded-lg border border-slate-200 bg-transparent px-2 py-1 text-center text-xs tabular dark:border-slate-700"
                      aria-label="現在の実力"
                    />
                    <button
                      onClick={() => {
                        updateSubject(s.id, {
                          targetScore: editScores.target,
                          currentScore: editScores.current,
                        });
                        setEditingId(null);
                      }}
                      className="btn-primary px-3 py-1 text-xs"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-lg p-1 text-slate-400"
                      aria-label="キャンセル"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* 追加フォーム */}
        <div className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="科目名（例: 英語）"
            className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-500 dark:text-slate-400">目標点</label>
              <input
                type="number"
                min={0}
                max={100}
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-center text-sm tabular dark:border-slate-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-500 dark:text-slate-400">現在の実力</label>
              <input
                type="number"
                min={0}
                max={100}
                value={current}
                onChange={(e) => setCurrent(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-center text-sm tabular dark:border-slate-700"
              />
            </div>
          </div>
          <input
            type="text"
            value={weak}
            onChange={(e) => setWeak(e.target.value)}
            placeholder="弱点単元（カンマ区切り、例: 仮定法, 石油化学）"
            className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700"
          />
          <button onClick={add} className="btn-primary w-full">
            <Plus size={16} />
            科目を追加
          </button>
        </div>
      </section>

      {/* ---------- 計画パラメータ ---------- */}
      <section className="card space-y-5 p-5">
        <h2 className="flex items-center gap-2 text-sm font-extrabold">
          <Clock3 size={16} className="text-indigo-500" />
          自動計画のパラメータ
        </h2>
        <SettingsRow
          label="1日の学習に確保できる時間"
          value={settings.dailyStudyMinutes}
          min={30}
          max={600}
          step={15}
          onChange={(v) => updateSettings({ dailyStudyMinutes: v } as Partial<Settings>)}
          format={(v) => `${Math.floor(v / 60)}時間${v % 60 ? `${v % 60}分` : ""}`}
        />
        <SettingsRow
          label="ギャップ1点を埋めるのに必要な時間"
          value={settings.minutesPerGapPoint}
          min={5}
          max={60}
          step={5}
          onChange={(v) => updateSettings({ minutesPerGapPoint: v } as Partial<Settings>)}
          format={(v) => `${v}分/点`}
        />
        <p className="text-[11px] leading-relaxed text-slate-400">
          ※必要総学習時間 ＝ 各科目の（目標点 − 現在の実力）× 分/点。残り日数で割って1日の学習量を逆算します。
          弱点単元が多い科目には自動的に優先配分されます。
        </p>
      </section>
    </div>
  );
}
