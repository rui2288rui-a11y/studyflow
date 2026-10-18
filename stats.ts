"use client";

import type { StudyLog, Subject } from "@/types";
import { addDays, dateKey, todayKey } from "@/lib/datetime";

export function totalMinutes(logs: StudyLog[]): number {
  return logs.reduce((a, b) => a + b.minutes, 0);
}

export function minutesOn(logs: StudyLog[], dateKeyStr: string): number {
  return logs.filter((l) => l.date === dateKeyStr).reduce((a, b) => a + b.minutes, 0);
}

export function streakDays(logs: StudyLog[]): number {
  const dates = new Set(logs.map((l) => l.date));
  let streak = 0;
  let cursor = new Date();
  // 今日の記録が無くても昨日からの連続を許容
  if (!dates.has(dateKey(cursor))) cursor = addDays(cursor, -1);
  while (dates.has(dateKey(cursor))) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** 直近 n 日の棒グラフデータ（Recharts用） */
export function lastNDays(logs: StudyLog[], n = 14) {
  const today = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = addDays(today, -(n - 1 - i));
    const key = dateKey(d);
    const row: Record<string, number | string> = { date: `${d.getMonth() + 1}/${d.getDate()}` };
    logs
      .filter((l) => l.date === key)
      .forEach((l) => {
        row[l.subjectName] = ((row[l.subjectName] as number) ?? 0) + l.minutes;
      });
    return row;
  });
}

/** 科目別の累計時間（円グラフ用） */
export function minutesBySubject(logs: StudyLog[]) {
  const map = new Map<string, number>();
  logs.forEach((l) => map.set(l.subjectName, (map.get(l.subjectName) ?? 0) + l.minutes));
  return Array.from(map.entries()).map(([name, minutes]) => ({ name, minutes }));
}

/** 科目ごとの合計時間（分析カード用） */
export function minutesBySubjectId(logs: StudyLog[], subjects: Subject[]) {
  return subjects.map((s) => ({
    subject: s,
    minutes: totalMinutes(logs.filter((l) => l.subjectId === s.id)),
  }));
}

export const WEEKDAYS_JA = ["日", "月", "火", "水", "木", "金", "土"];
