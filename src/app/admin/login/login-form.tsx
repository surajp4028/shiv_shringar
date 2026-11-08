"use client";
import { useState } from "react";
import { IconLoader2, IconLock } from "@tabler/icons-react";
import { SparklesCore } from "@/components/ui/sparkles";
import { inputCls } from "@/components/admin/fields";

export function LoginForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.ok) window.location.href = "/admin";
    else {
      setError(json.error ?? "Login failed");
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4">
      <div className="absolute inset-0"><SparklesCore background="transparent" particleColor="#f5d68a" particleDensity={40} minSize={0.4} maxSize={1.2} className="h-full w-full" /></div>
      <div className="absolute h-96 w-96 rounded-full bg-amber-600/15 blur-[120px]" />
      <form onSubmit={onSubmit} className="relative w-full max-w-sm rounded-3xl border border-amber-500/20 bg-neutral-950/90 p-8 backdrop-blur">
        <img src="/brand/logo.png" alt="" className="mx-auto h-20 w-20 rounded-full object-cover ring-1 ring-amber-400/30" />
        <h1 className="text-gold mt-4 text-center font-display text-3xl font-semibold">Admin Login</h1>
        <p className="mt-1 text-center text-sm text-neutral-500">Shiv Shringar Sewa Samiti</p>
        <div className="mt-8 space-y-4">
          <input name="email" type="email" required placeholder="Email" autoComplete="username" className={inputCls} />
          <input name="password" type="password" required placeholder="Password" autoComplete="current-password" className={inputCls} />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-amber-300 to-orange-500 py-3 font-semibold text-black disabled:opacity-60">
            {busy ? <IconLoader2 size={18} className="animate-spin" /> : <IconLock size={18} />} Log in
          </button>
        </div>
      </form>
    </div>
  );
}
