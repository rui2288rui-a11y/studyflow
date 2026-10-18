"use client";

import type { Goal, PlannedTask, Settings, StudyLog, Subject } from "@/types";
import { addDays, dateKey, daysUntil, todayKey } from "@/lib/datetime";

export interface PlannerInput {
  goal: Goal;
  subjects: Subject[];
  logs: StudyLog[];
  tasks: PlannedTask[];
  settings: Settings;
}

export interface SubjectPlan {
  subjectId: string;
  subjectName: string;
  color: string;
  gap: number;
  /** ギャップ×弱点で重み付けした配点 */
  weight: number;
  allocatedMinutes: number;
  taskTitles: string[];
}

export interface PlannerOutput {
  remainingDays: number;
  totalGap: number;
  /** 計画全体で必要な総学習時間（分） */
  requiredMinutes: number;
  /** 残り日数で捻出できる総学習時間（分） */
  availableMinutes: number;
  /** 遅延率（>100% は計画超過＝要調整） */
  loadRatio: number;
  plans: SubjectPlan[];
  dailyTargets: PlannedTask[];
  advice: string[];
}

const WEAK_UNIT_TEMPLATES = [
  (u: string) => `${u}の演習`,
  (u: string) => `${u}の復習＋類題`,
  (u: string) => `${u}の総チェック`,
];

/**
 * 自動計画エンジン（決定論的バックワード・スケジューリング）
 * 1) 科目ごとの点数ギャップを算出
 * 2) ギャップ × 弱点ブースト(1.0 + 0.2×弱点数) で学習時間を配分
 * 3) 残り日数 × 1日の学習時間で可能量と照合し、今日〜3日分のタスクを逆算
 */
export function buildPlan({ goal, subjects, logs, tasks, settings }: PlannerInput): PlannerOutput {
  const now = Date.now();
  const remaining = daysUntil(new Date(goal.examDate).getTime(), now);

  const last30 = now - 30 * 86400000;
  const recentMinutes = logs
    .filter((l) => new Date(l.createdAt).getTime() >= last30)
    .reduce((a, b) => a + b.minutes, 0);

  const raw = subjects.map((s) => {
    const gap = Math.max(0, s.targetScore - s.currentScore);
    const weakBoost = 1 + Math.min(0.6, s.weakUnits.length * 0.2);
    return { subject: s, gap, weight: gap * weakBoost };
  });

  const totalWeight = raw.reduce((a, r) => a + r.weight, 0);
  const totalGap = raw.reduce((a, r) => a + r.gap, 0);
  const requiredMinutes = raw.reduce((a, r) => a + r.gap * settings.minutesPerGapPoint, 0);
  const availableMinutes = remaining * settings.dailyStudyMinutes;
  const loadRatio = availableMinutes === 0 ? Infinity : (requiredMinutes / availableMinutes) * 100;

  const plans: SubjectPlan[] = raw
    .filter((r) => r.gap > 0)
    .sort((a, b) => b.weight - a.weight)
    .map((r) => {
      const allocatedMinutes =
        totalWeight === 0 ? 0 : Math.round((r.weight / totalWeight) * availableMinutes);
      const taskTitles: string[] = [];
      r.subject.weakUnits.forEach((u, i) => {
        taskTitles.push(WEAK_UNIT_TEMPLATES[i % WEAK_UNIT_TEMPLATES.length](u));
      });
      if (taskTitles.length === 0) taskTitles.push(`${r.subject.name} 総合演習`);
      return {
        subjectId: r.subject.id,
        subjectName: r.subject.name,
        color: r.subject.color,
        gap: r.gap,
        weight: r.weight,
        allocatedMinutes,
        taskTitles,
      };
    });

  // 今日〜3日分のタスク生成（既存の自動タスクは上書きしない想定で重複日も許容）
  const dailyTargets: PlannedTask[] = [];
  const days = Math.min(3, Math.max(remaining, 1));
  if (totalWeight > 0) {
    for (let d = 0; d < days; d++) {
      const date = dateKey(addDays(new Date(now), d));
      let budget = settings.dailyStudyMinutes;
      for (const p of plans) {
        if (budget <= 0) break;
        const perDay = Math.round((p.weight / totalWeight) * settings.dailyStudyMinutes);
        const m = Math.min(budget, perDay);
        if (m < 10) continue;
        const title = p.taskTitles[d % p.taskTitles.length];
        dailyTargets.push({
          id: `auto-${date}-${p.subjectId}-${d}`,
          date,
          subjectName: p.subjectName,
          title,
          minutes: m,
          done: tasks.some(
            (t) => t.date === date && t.subjectName === p.subjectName && t.title === title
          ),
          source: "auto",
        });
        budget -= m;
      }
    }
  }

  const advice: string[] = [];
  if (remaining === 0) {
    advice.push("試験日は今日または過ぎています。日付を確認してください。");
  } else if (loadRatio > 100) {
    const over = requiredMinutes - availableMinutes;
    advice.push(
      `計画量が残り日数の学習可能時間を ${Math.round(over / 60)}時間 上回っています。目標点の見直し、または1日の学習時間を増やしましょう。`
    );
  } else if (loadRatio > 0) {
    advice.push(
      `1日 ${Math.ceil(requiredMinutes / remaining)}分 ペースで達成可能です。この調子で続けましょう。`
    );
  }
  if (recentMinutes === 0 && subjects.length > 0) {
    advice.push("直近30日の学習記録がありません。まずはストップウォッチで今日の記録をつけると計画の精度が上がります。");
  }
  const topSubject = plans[0];
  if (topSubject) {
    advice.push(
      `最優先は「${topSubject.subjectName}」（ギャップ ${topSubject.gap}点）。配分学習時間は全体の ${Math.round(
        (topSubject.weight / totalWeight) * 100
      )}% です。`
    );
  }
  const todayLogs = logs.filter((l) => l.date === todayKey()).reduce((a, b) => a + b.minutes, 0);
  if (todayLogs > 0) {
    advice.push(`今日はすでに ${todayLogs}分 記録済み。あと ${Math.max(0, settings.dailyStudyMinutes - todayLogs)}分 が目標です。`);
  }

  return {
    remainingDays: remaining,
    totalGap,
    requiredMinutes,
    availableMinutes,
    loadRatio,
    plans,
    dailyTargets,
    advice,
  };
}
