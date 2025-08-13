"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Phase = "work" | "break";

export function Pomodoro() {
  const [phase, setPhase] = useState<Phase>("work");
  const [seconds, setSeconds] = useState<number>(25 * 60);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running]);

  useEffect(() => {
    if (seconds === 0) {
      const next: Phase = phase === "work" ? "break" : "work";
      setPhase(next);
      setSeconds(next === "work" ? 25 * 60 : 5 * 60);
    }
  }, [seconds, phase]);

  const mmss = useMemo(() => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  }, [seconds]);

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="px-2 py-1 rounded bg-gray-100">{phase === "work" ? "作業" : "休憩"}</span>
      <span className="font-mono tabular-nums w-[52px] text-center">{mmss}</span>
      <button className="px-2 py-1 border rounded" onClick={() => setRunning((v) => !v)}>
        {running ? "停止" : "開始"}
      </button>
      <button
        className="px-2 py-1 border rounded"
        onClick={() => {
          setRunning(false);
          setPhase("work");
          setSeconds(25 * 60);
        }}
      >
        リセット
      </button>
    </div>
  );
}


