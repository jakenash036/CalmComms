import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import {
  ensureSchema,
  findOrganizationById,
  findUserById,
  listStaffByOrganization,
  countStaffByOrganization,
} from "@/lib/db";
import { StaffTable } from "@/components/admin/StaffTable";
import { CreateStaffForm } from "@/components/admin/CreateStaffForm";

export default async function StaffPage() {
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

  const staff = await listStaffByOrganization(user.organization_id);
  const activeCount = await countStaffByOrganization(user.organization_id);
  const canAddMore = activeCount < organization.max_staff;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Staff accounts</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage staff accounts for <strong>{organization.name}</strong>.
          {" "}
          <span className="font-medium text-slate-700">
            {activeCount} / {organization.max_staff} active slots used.
          </span>
        </p>
      </div>

      {/* Create new staff */}
      <CreateStaffForm canAddMore={canAddMore} maxStaff={organization.max_staff} activeCount={activeCount} />

      {/* Staff list */}
      <StaffTable staff={staff} />
    </div>
  );
}
