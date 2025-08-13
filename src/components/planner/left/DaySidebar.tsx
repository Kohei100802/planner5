"use client";
import { addMonths, endOfMonth, format, getDate, isSameDay, isSameMonth, isToday, startOfMonth, startOfWeek } from "date-fns";
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
    <div className="flex-1 grid grid-rows-[48px_1fr]">
      <div className="px-3 flex items-center justify-between h-12 border-b border-[var(--card-border)]" style={{background:"var(--header-bg)", borderTopLeftRadius:12, borderTopRightRadius:12}}>
        <div className="segmented">
          <button className="active">メニュー</button>
          <button onClick={() => setCollapsed((v)=>!v)}>{collapsed ? "開" : "閉"}</button>
        </div>
        <div className="text-sm text-gray-600">{format(viewDate, "yyyy年M月", { locale: ja })}</div>
        <div className="segmented">
          <button onClick={() => setViewDate(addMonths(viewDate, -1))}>前</button>
          <button onClick={() => setViewDate(addMonths(viewDate, 1))}>次</button>
        </div>
      </div>
      <div className="grid grid-cols-1 h-full">
        <div className={clsx("pane", collapsed && "hidden")}> 
          <div className="p-3 pt-2">
            <div className="mini-month">
              <div className="mm-title-edges">
                <button className="btn m-0 btn-mini" onClick={() => setViewDate(addMonths(viewDate, -1))}>{"<"}</button>
                <div className="mm-center">{format(viewDate, "yyyy年M月", { locale: ja })}</div>
                <button className="btn m-0 btn-mini" onClick={() => setViewDate(addMonths(viewDate, 1))}>{">"}</button>
              </div>
              <div className="mm-grid">
                {"日月火水木金土".split("").map((w) => (
                  <div key={w} className="mm-weekday">{w}</div>
                ))}
                {monthDays.map((d) => {
                  const selected = isSameDay(d, selectedDate);
                  const outside = !isSameMonth(d, viewDate);
                  return (
                    <button key={d.toISOString()} onClick={() => onChangeDate(d)} className={clsx("mm-cell", selected && "selected", outside && "outside")}>{getDate(d)}</button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className={clsx("pane border-t border-[var(--card-border)] p-3", collapsed && "row-span-2")}>
          <div className="text-xs text-gray-500 mb-2">カレンダー</div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> 仕事</li>
            <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> 家族</li>
            <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500"></span> プライベート</li>
          </ul>
        </div>
      </div>
    </div>
  );
}


