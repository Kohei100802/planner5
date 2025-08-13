"use client";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KeyboardEvent, useEffect, useMemo, useState } from "react";
import clsx from "clsx";

type Reminder = { id: string; title: string; position: number; completed: boolean; dueAt?: string | null };

function SortableItem({ item, onToggle, onTitle, onInfo }: { item: Reminder; onToggle: (id: string)=>void; onTitle: (id: string, title: string)=>void; onInfo: (id: string)=>void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style: any = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={clsx("group flex items-center gap-2 p-2 border-b", isDragging && "bg-blue-50")}> 
      <input type="checkbox" checked={item.completed} onChange={() => onToggle(item.id)} />
      <input className="flex-1 outline-none" value={item.title} onChange={(e)=>onTitle(item.id, e.target.value)} onKeyDown={(e: KeyboardEvent<HTMLInputElement>)=>{ if(e.key==='Enter'){ (e.target as HTMLInputElement).blur(); } }} />
      <button className="opacity-0 group-hover:opacity-100 text-xs border rounded px-1" onClick={()=>onInfo(item.id)}>i</button>
    </div>
  );
}

export function RemindersPanel({ date }: { date: Date }) {
  const [items, setItems] = useState<Reminder[]>([]);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/reminders?date=${date.toISOString()}`, { signal: controller.signal })
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setItems([]));
    return () => controller.abort();
  }, [date]);

  const persist = async (body: any) => {
    await fetch("/api/reminders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  };

  const onToggle = async (id: string) => {
    const next = items.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i));
    setItems(next);
    await persist({ action: "toggle", id });
  };

  const onTitle = async (id: string, title: string) => {
    setItems((list) => list.map((i) => (i.id === id ? { ...i, title } : i)));
    await persist({ action: "title", id, title });
  };

  const onInfo = async (id: string) => {
    const dueAt = window.prompt("期日 (YYYY-MM-DD HH:mm)") || null;
    await persist({ action: "info", id, dueAt });
  };

  const addNew = async () => {
    const res = await fetch("/api/reminders", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: date.toISOString(), title: "新規リマインダー" }) });
    const list = await res.json();
    setItems(list);
  };

  return (
    <div className="flex-1 grid grid-rows-[40px_1fr]">
      <div className="panel-header">
        <div className="text-sm font-medium">リマインダー</div>
        <button className="text-sm btn-primary" onClick={addNew}>追加</button>
      </div>
      <div className="pane">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={async (e)=>{
          const { active, over } = e;
          if (!over || active.id === over.id) return;
          const oldIndex = items.findIndex((i)=>i.id===active.id);
          const newIndex = items.findIndex((i)=>i.id===over.id);
          const newItems = arrayMove(items, oldIndex, newIndex).map((i, idx)=>({ ...i, position: idx }));
          setItems(newItems);
          await fetch("/api/reminders/reorder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: newItems.map(({id, position})=>({id, position})) }) });
        }}>
          <SortableContext items={items.map((i)=>i.id)} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <SortableItem key={item.id} item={item} onToggle={onToggle} onTitle={onTitle} onInfo={onInfo} />
            ))}
          </SortableContext>
        </DndContext>
        <div className="border-t border-[var(--card-border)] p-3">
          <div className="text-sm font-medium mb-2">⭐ ゴール</div>
          <Goals date={date} />
        </div>
      </div>
    </div>
  );
}

function Goals({ date }: { date: Date }) {
  const [items, setItems] = useState<Reminder[]>([]);
  useEffect(() => {
    fetch(`/api/goals?date=${date.toISOString()}`).then((r)=>r.json()).then(setItems).catch(()=>setItems([]));
  }, [date]);
  const add = async () => {
    const res = await fetch("/api/goals", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: date.toISOString(), title: "新規ゴール" }) });
    const list = await res.json();
    setItems(list);
  };
  const onTitle = async (id: string, title: string) => {
    setItems((list)=>list.map((i)=>i.id===id?{...i,title}:i));
    await fetch("/api/goals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "title", id, title }) });
  };
  return (
    <div>
      <div className="flex justify-end mb-2"><button className="text-xs btn-primary" onClick={add}>追加</button></div>
      <ul>
        {items.map((g)=>(
          <li key={g.id} className="flex items-center gap-2 p-2 border-b border-[var(--card-border)]">
            <input type="checkbox" checked={g.completed} onChange={async ()=>{
              setItems((list)=>list.map((i)=>i.id===g.id?{...i,completed:!i.completed}:i));
              await fetch("/api/goals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "toggle", id: g.id }) });
            }} />
            <input className="flex-1 outline-none" value={g.title} onChange={(e)=>onTitle(g.id, e.target.value)} />
          </li>
        ))}
      </ul>
    </div>
  );
}


