"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow">
        <h1 className="text-xl font-semibold mb-4">アカウント作成</h1>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              setLoading(true);
              setError(null);
              const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
              });
              if (!res.ok) throw new Error(await res.text());
              router.push("/auth/signin");
            } catch (err: any) {
              setError(err.message ?? "エラーが発生しました");
            } finally {
              setLoading(false);
            }
          }}
          className="space-y-3"
        >
          <input className="w-full border rounded px-3 py-2" placeholder="名前" value={name} onChange={(e)=>setName(e.target.value)} />
          <input className="w-full border rounded px-3 py-2" placeholder="メールアドレス" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <input className="w-full border rounded px-3 py-2" placeholder="パスワード" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button className="w-full bg-blue-600 text-white rounded py-2 disabled:opacity-50" disabled={loading}>
            {loading ? "作成中..." : "作成"}
          </button>
        </form>
      </div>
    </div>
  );
}


