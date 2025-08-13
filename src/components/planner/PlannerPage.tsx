"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { addDays, format, startOfDay } from "date-fns";
import { ja } from "date-fns/locale";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Pomodoro } from "./Pomodoro";
import { DaySidebar } from "./left/DaySidebar";
import { RemindersPanel } from "./right/RemindersPanel";
import { CalendarPanel } from "./center/CalendarPanel";

export default function PlannerPage() {
  const { data: session } = useSession();
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [note, setNote] = useState<string>("");

  // load daily note
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      const res = await fetch(`/api/notes?date=${selectedDate.toISOString()}`, {
        signal: controller.signal,
      });
      if (res.ok) {
        const json = await res.json();
        setNote(json.content ?? "");
      } else {
        setNote("");
      }
    };
    run();
    return () => controller.abort();
  }, [selectedDate]);

  // autosave
  useEffect(() => {
    const id = setTimeout(async () => {
      await fetch(`/api/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate.toISOString(), content: note }),
      });
    }, 500);
    return () => clearTimeout(id);
  }, [note, selectedDate]);

  const title = useMemo(
    () => `${format(selectedDate, "yyyy年M月d日 (E)", { locale: ja })} メモ`,
    [selectedDate]
  );

  if (!session?.user) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">ログインしてください。</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3rem)] grid grid-cols-[320px_1fr_420px] gap-3 p-3">
      <aside className="card overflow-hidden flex flex-col">
        <DaySidebar
          selectedDate={selectedDate}
          onChangeDate={setSelectedDate}
        />
      </aside>
      <main className="card overflow-hidden flex flex-col">
        <div className="panel-header">
          <div className="text-sm text-gray-500">Daily Planner</div>
          <Pomodoro />
        </div>
        <CalendarPanel date={selectedDate} />
        <div className="border-t border-[var(--card-border)] p-3">
          <h3 className="text-sm font-semibold mb-2">{title}</h3>
          <div className="grid grid-cols-2 gap-3">
            <textarea
              className="min-h-[160px] border rounded-lg p-2 text-sm"
              placeholder="Markdownでメモ... 自動保存"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="prose prose-sm max-w-none border rounded-lg p-2">
              <Markdown remarkPlugins={[remarkGfm]}>{note}</Markdown>
            </div>
          </div>
        </div>
      </main>
      <section className="card overflow-hidden flex flex-col">
        <RemindersPanel date={selectedDate} />
      </section>
    </div>
  );
}


