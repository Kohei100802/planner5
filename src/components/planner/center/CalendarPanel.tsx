"use client";
import { addHours, eachHourOfInterval, format, setHours, setMinutes, startOfDay } from "date-fns";
import { useEffect, useMemo, useState } from "react";

type Props = {
  date: Date;
};

export function CalendarPanel({ date }: Props) {
  const [events, setEvents] = useState<any[]>([]);
  const hours = useMemo(() => eachHourOfInterval({ start: startOfDay(date), end: addHours(startOfDay(date), 24) }), [date]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/events?date=${date.toISOString()}`, { signal: controller.signal })
      .then((r) => r.json())
      .then(setEvents)
      .catch(() => setEvents([]));
    return () => controller.abort();
  }, [date]);

  const openCreate = async (hour: number) => {
    const title = window.prompt("予定名");
    if (!title) return;
    const start = setMinutes(setHours(date, hour), 0);
    const end = addHours(start, 1);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, start, end, calendar: "仕事" }),
    });
    if (res.ok) {
      const list = await fetch(`/api/events?date=${date.toISOString()}`).then((r) => r.json());
      setEvents(list);
    }
  };

  return (
    <div className="flex-1 grid grid-cols-[56px_1fr]">
      <div className="border-r border-[var(--card-border)] text-xs text-gray-500">
        {hours.slice(0, 24).map((h, i) => (
          <div key={i} className="h-12 flex items-start justify-end pr-2 pt-1">{format(h, "HH:mm")}</div>
        ))}
      </div>
      <div className="relative pane">
        {hours.slice(0, 24).map((h, i) => (
          <div key={i} className="timeline-cell hover:bg-gray-50 cursor-pointer" onClick={() => openCreate(i)} />
        ))}
        {events.map((ev) => {
          const top = (new Date(ev.start).getHours() + new Date(ev.start).getMinutes() / 60) * 48;
          const height = Math.max(40, ((new Date(ev.end).getTime() - new Date(ev.start).getTime()) / 3600000) * 48);
          return (
            <div key={ev.id} className="absolute left-2 right-2 event-block p-1 text-xs" style={{ top, height }}>
              <div className="font-medium">{ev.title}</div>
              <div className="text-[10px] text-gray-600">{format(new Date(ev.start), "HH:mm")} - {format(new Date(ev.end), "HH:mm")}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


