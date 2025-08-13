"use client";
import { addMonths, endOfMonth, format, getDate, getDay, isSameDay, startOfMonth, startOfWeek } from "date-fns";
import { ja } from "date-fns/locale";
import clsx from "clsx";
import { useMemo, useState } from "react";

type Props = {
  selectedDate: Date;
  onChangeDate: (d: Date) => void;
};

export function DaySidebar({ selectedDate, onChangeDate }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewDate), { locale: ja });
    const end = endOfMonth(viewDate);
    const days: Date[] = [];
    let cur = start;
    while (cur <= end) {
      days.push(cur);
      cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
    }
    return days;
  }, [viewDate]);

  return (
    <div className="flex-1 grid grid-rows-[40px_1fr]">
      <div className="panel-header px-3">
        <button className="text-sm text-gray-600" onClick={() => setCollapsed((v) => !v)}>{collapsed ? "▶" : "◀"} メニュー</button>
        <div className="text-sm text-gray-500">{format(viewDate, "yyyy年M月", { locale: ja })}</div>
        <div className="flex gap-2 text-sm">
          <button className="btn-primary" onClick={() => setViewDate(addMonths(viewDate, -1))}>前</button>
          <button className="btn-primary" onClick={() => setViewDate(addMonths(viewDate, 1))}>次</button>
        </div>
      </div>
      <div className="grid grid-cols-1 h-full">
        <div className={clsx("pane", collapsed && "hidden")}> 
          <div className="p-3">
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-1">
              {"日月火水木金土".split("").map((w) => (
                <div key={w}>{w}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((d) => (
                <button
                  key={d.toISOString()}
                  onClick={() => onChangeDate(d)}
                  className={clsx(
                    "h-8 rounded text-xs border",
                    isSameDay(d, selectedDate) ? "bg-[var(--soft-blue)] border-[var(--card-border)] text-blue-700 font-medium" : "bg-white hover:bg-[var(--soft-blue)] border-[var(--card-border)]",
                  )}
                >
                  {getDate(d)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className={clsx("pane border-t border-[var(--card-border)] p-3", collapsed && "row-span-2")}>
          <div className="text-sm text-gray-600 mb-2">カレンダー一覧</div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> 仕事カレンダー</li>
            <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> 家族カレンダー</li>
            <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500"></span> プライベート</li>
          </ul>
        </div>
      </div>
    </div>
  );
}


