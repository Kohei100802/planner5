"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow">
        <h1 className="text-xl font-semibold mb-4">ログイン</h1>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            await signIn("credentials", { email, password, callbackUrl: "/" });
          }}
          className="space-y-3"
        >
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="パスワード"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="w-full bg-blue-600 text-white rounded py-2 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "処理中..." : "ログイン"}
          </button>
        </form>
        <div className="mt-4 text-sm text-center">
          <Link href="/auth/signup" className="text-blue-600">アカウント作成へ</Link>
        </div>
      </div>
    </div>
  );
}


