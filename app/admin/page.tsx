import { getSessionFromCookies } from "@/lib/auth";
import { ensureSchema, findOrganizationById, findUserById, getOrganizationStats } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await getSessionFromCookies();

  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  await ensureSchema();
  const user = await findUserById(session.userId);

  if (!user || !user.organization_id) {
    redirect("/login");
  }

  const organization = await findOrganizationById(user.organization_id);

  if (!organization) {
    redirect("/login");
  }

  const stats = await getOrganizationStats(user.organization_id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Welcome back. Here&apos;s an overview of <strong>{organization.name}</strong>.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total staff" value={stats.totalStaff} />
        <StatCard label="Active staff" value={stats.activeStaff} />
        <StatCard label="Rewrites this month" value={stats.totalUsageThisMonth} />
        <StatCard label="All-time rewrites" value={stats.totalRewritesAllTime} />
      </div>

      {/* Organisation info */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Organisation details</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-slate-500">Name</dt>
            <dd className="mt-1 text-sm text-slate-900">{organization.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Plan</dt>
            <dd className="mt-1 text-sm text-slate-900 capitalize">{organization.plan}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Max staff allowed</dt>
            <dd className="mt-1 text-sm text-slate-900">{organization.max_staff}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Staff slots remaining</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {organization.max_staff - stats.activeStaff}
            </dd>
          </div>
        </dl>
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin/staff"
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Manage staff accounts
          </Link>
          <Link
            href="/app"
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Use CalmComms
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
