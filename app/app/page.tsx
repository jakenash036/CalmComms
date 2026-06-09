import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { RewriteForm } from "@/components/RewriteForm";
import { SafetyNotice } from "@/components/SafetyNotice";
import { UsageCounter } from "@/components/UsageCounter";
import { getSessionFromCookies } from "@/lib/auth";
import { ensureSchema, findUserById } from "@/lib/db";

export default async function AppPage() {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect("/login");
  }

  await ensureSchema();
  const user = await findUserById(session.userId);

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto w-full max-w-5xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Header email={user.email} />
        <p className="text-sm text-slate-600">
          Rewrite rough staff notes into clear, neutral, parent-friendly school communication.
        </p>
        <UsageCounter used={user.used_this_month} limit={user.monthly_limit} />
        <SafetyNotice />
        <RewriteForm initialUsedThisMonth={user.used_this_month} />
      </div>
    </main>
  );
}
