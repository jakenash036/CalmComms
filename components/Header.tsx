"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type HeaderProps = {
  email: string;
};

export function Header({ email }: HeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const onLogout = async () => {
    setIsLoggingOut(true);

    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500">CalmComms</p>
        <h1 className="text-2xl font-semibold text-slate-900">CalmComms</h1>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <span>{email}</span>
        <button
          onClick={onLogout}
          disabled={isLoggingOut}
          className="rounded-lg border border-slate-300 px-3 py-2 font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </header>
  );
}
