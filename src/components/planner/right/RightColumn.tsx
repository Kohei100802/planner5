"use client";
import { RemindersPanel } from "./RemindersPanel";
import { useEffect, useState } from "react";

function GoalsCard({ date }: { date: Date }) {
  const [items, setItems] = useState<any[]>([]);
  useEffect(()=>{ fetch(`/api/goals?date=${date.toISOString()}`).then(r=>r.json()).then(setItems).catch(()=>setItems([])); }, [date]);
  return (
    <div className="card mb-3">
      <div className="panel-header"><div className="text-sm font-medium">ゴール</div></div>
      <div className="p-3 space-y-2">
        {items.map((g)=> (
          <div key={g.id} className="flex items-center gap-2">
            <input type="checkbox" checked={g.completed} onChange={async()=>{ await fetch('/api/goals',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({action:'toggle', id: g.id})}); setItems((list)=>list.map((i)=>i.id===g.id?{...i,completed:!i.completed}:i)); }} />
            <input className="flex-1 outline-none bg-transparent" value={g.title} onChange={async(e)=>{ const title=e.target.value; setItems((list)=>list.map((i)=>i.id===g.id?{...i,title}:i)); await fetch('/api/goals',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({action:'title', id:g.id, title})}); }} />
          </div>
        ))}
        <div className="pt-2"><button className="btn-primary text-xs" onClick={async()=>{ const res=await fetch('/api/goals',{method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({date: date.toISOString(), title:'新規ゴール'})}); setItems(await res.json()); }}>追加</button></div>
      </div>
    </div>
  );
}

function NotesCard({ date }: { date: Date }) {
  const [content, setContent] = useState("");
  useEffect(()=>{ fetch(`/api/notes?date=${date.toISOString()}`).then(r=>r.json()).then((n)=>setContent(n?.content??"")); },[date]);
  useEffect(()=>{ const id=setTimeout(()=>{ fetch('/api/notes',{method:'POST',headers:{'Content-Type':'application/json'}, body: JSON.stringify({date: date.toISOString(), content})}); },500); return ()=>clearTimeout(id); },[content,date]);
  return (
    <div className="card">
      <div className="panel-header"><div className="text-sm font-medium">メモ</div></div>
      <div className="p-3">
        <textarea className="w-full min-h-[120px] text-sm border rounded-lg p-2" placeholder="今日のメモ" value={content} onChange={(e)=>setContent(e.target.value)} />
      </div>
    </div>
  );
}

export default function RightColumn({ date }: { date: Date }) {
  return (
    <div className="flex-1 overflow-hidden">
      <div className="space-y-3 h-full pane pr-1">
        <GoalsCard date={date} />
        <div className="card">
          <RemindersPanel date={date} />
        </div>
        <NotesCard date={date} />
      </div>
    </div>
  );
}


