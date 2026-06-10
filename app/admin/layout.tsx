import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { ensureSchema, findUserById } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionFromCookies();

  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  await ensureSchema();
  const user = await findUserById(session.userId);

  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <AdminNav email={user.email} organizationId={user.organization_id} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
