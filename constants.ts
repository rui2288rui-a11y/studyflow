import type { ExamPreset } from "@/types";

/**
 * 試験日プリセット（2026-10 時点で公開されている公式日程のみ掲載）
 * - 共通テスト2027 / 国公立二次 / 英検 / 簿記 / TOEIC は公式発表済みの日程
 */
export const EXAM_PRESETS: ExamPreset[] = [
  {
    id: "kyotsu-2027",
    category: "大学受験",
    name: "大学入学共通テスト 2027年度（令和9年度）",
    date: "2027-01-16T09:30:00+09:00",
    note: "本試験 2027/1/16(土)・17(日)／追試 1/23・24（大学入試センター発表）",
  },
  {
    id: "kokuritsu-zenki-2027",
    category: "大学受験",
    name: "国公立大学 二次試験 前期日程 2027年度",
    date: "2027-02-25T09:00:00+09:00",
    note: "前期日程は 2027/2/25(木) 開始（各大学の日程による）",
  },
  {
    id: "kokuritsu-koki-2027",
    category: "大学受験",
    name: "国公立大学 二次試験 後期日程 2027年度",
    date: "2027-03-12T09:00:00+09:00",
    note: "後期日程は 2027/3/12(金) 開始（各大学の日程による）",
  },
  {
    id: "eiken-2026-3",
    category: "資格・検定",
    name: "英検 2026年度 第3回（一次）",
    date: "2027-01-24T09:00:00+09:00",
    note: "本会場 一次 2027/1/24(日)（日本英語検定協会発表）",
  },
  {
    id: "boki-174",
    category: "資格・検定",
    name: "日商簿記検定 第174回",
    date: "2026-11-15T09:00:00+09:00",
    note: "統一試験（ペーパー）2026/11/15(日)（東京商工会議所発表）",
  },
  {
    id: "toeic-2026-12",
    category: "資格・検定",
    name: "TOEIC L&R 公開テスト 2026年12月",
    date: "2026-12-06T10:00:00+09:00",
    note: "2026/12/6(日) 実施（IIBC発表）／その他の日程もあり",
  },
];

/** 科目の表示カラー（ダークモードでも視認性の高いパレット） */
export const SUBJECT_COLORS = [
  "#6366f1", // indigo
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#22c55e", // green
  "#ef4444", // red
  "#0ea5e9", // sky
] as const;

export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
