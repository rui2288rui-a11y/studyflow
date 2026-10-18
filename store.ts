"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Goal, PlannedTask, Settings, StudyLog, Subject, ViewMode } from "@/types";
import { SUBJECT_COLORS, uid } from "@/lib/constants";
import { todayKey } from "@/lib/datetime";

interface AppState {
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;

  goal: Goal | null;
  setGoal: (g: Goal | null) => void;

  subjects: Subject[];
  addSubject: (name: string, targetScore: number, currentScore: number, weakUnits: string[]) => void;
  updateSubject: (id: string, patch: Partial<Subject>) => void;
  removeSubject: (id: string) => void;

  logs: StudyLog[];
  addLog: (subjectId: string, minutes: number, memo?: string) => void;
  removeLog: (id: string) => void;

  tasks: PlannedTask[];
  addManualTask: (subjectName: string, title: string, minutes: number, date?: string) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  addAutoTasks: (tasks: Omit<PlannedTask, "id">[]) => void;

  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      viewMode: "auto",
      setViewMode: (v) => set({ viewMode: v }),

      goal: null,
      setGoal: (g) => set({ goal: g }),

      subjects: [],
      addSubject: (name, targetScore, currentScore, weakUnits) =>
        set((s) => ({
          subjects: [
            ...s.subjects,
            {
              id: uid(),
              name,
              color: SUBJECT_COLORS[s.subjects.length % SUBJECT_COLORS.length],
              targetScore,
              currentScore,
              weakUnits,
            },
          ],
        })),
      updateSubject: (id, patch) =>
        set((s) => ({
          subjects: s.subjects.map((sub) => (sub.id === id ? { ...sub, ...patch } : sub)),
        })),
      removeSubject: (id) => set((s) => ({ subjects: s.subjects.filter((x) => x.id !== id) })),

      logs: [],
      addLog: (subjectId, minutes, memo) => {
        const subject = get().subjects.find((s) => s.id === subjectId);
        set((s) => ({
          logs: [
            {
              id: uid(),
              date: todayKey(),
              subjectId,
              subjectName: subject?.name ?? "未分類",
              minutes,
              memo,
              createdAt: new Date().toISOString(),
            },
            ...s.logs,
          ],
        }));
      },
      removeLog: (id) => set((s) => ({ logs: s.logs.filter((l) => l.id !== id) })),

      tasks: [],
      addManualTask: (subjectName, title, minutes, date) =>
        set((s) => ({
          tasks: [
            {
              id: uid(),
              date: date ?? todayKey(),
              subjectName,
              title,
              minutes,
              done: false,
              source: "manual",
            },
            ...s.tasks,
          ],
        })),
      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
        })),
      removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      addAutoTasks: (list) =>
        set((s) => ({
          tasks: [
            ...list.map((t) => ({ ...t, id: uid() })),
            ...s.tasks,
          ],
        })),

      settings: { dailyStudyMinutes: 180, minutesPerGapPoint: 20 },
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
    }),
    {
      name: "studyflow-storage-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        viewMode: s.viewMode,
        goal: s.goal,
        subjects: s.subjects,
        logs: s.logs,
        tasks: s.tasks,
        settings: s.settings,
      }),
    }
  )
);
