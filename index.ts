export type ViewMode = "auto" | "mobile" | "desktop";

export interface Goal {
  id: string;
  title: string;
  /** ISO 8601 (例: 2027-01-16T09:30:00+09:00) */
  examDate: string;
  presetId?: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  /** チャート・バッジ用カラー */
  color: string;
  targetScore: number;
  /** 最新の実力 or 過去問の点数 */
  currentScore: number;
  /** 苦手単元（自動計画のタスク名に使う） */
  weakUnits: string[];
}

export interface StudyLog {
  id: string;
  /** yyyy-MM-dd（ローカル日付） */
  date: string;
  subjectId: string;
  subjectName: string;
  minutes: number;
  memo?: string;
  createdAt: string;
}

export interface PlannedTask {
  id: string;
  date: string;
  subjectName: string;
  title: string;
  minutes: number;
  done: boolean;
  source: "auto" | "manual";
}

export interface Settings {
  /** 1日に確保できる学習時間（分） */
  dailyStudyMinutes: number;
  /** ギャップ1点を埋めるのに必要な学習時間（分） */
  minutesPerGapPoint: number;
}

export interface ExamPreset {
  id: string;
  category: "大学受験" | "資格・検定";
  name: string;
  /** ISO 8601 */
  date: string;
  /** 出典・注記 */
  note?: string;
}
