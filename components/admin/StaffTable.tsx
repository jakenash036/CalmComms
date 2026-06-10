"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type StaffMember = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  monthly_limit: number;
  used_this_month: number;
  is_active: boolean;
  created_at: string;
};

type StaffTableProps = {
  staff: StaffMember[];
};

export function StaffTable({ staff }: StaffTableProps) {
  if (staff.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-slate-500">No staff accounts yet. Create one above to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-900">
          All staff members ({staff.length})
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left">
              <th className="px-6 py-3 font-medium text-slate-600">Name</th>
              <th className="px-6 py-3 font-medium text-slate-600">Email</th>
              <th className="px-6 py-3 font-medium text-slate-600">Role</th>
              <th className="px-6 py-3 font-medium text-slate-600">Usage</th>
              <th className="px-6 py-3 font-medium text-slate-600">Status</th>
              <th className="px-6 py-3 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staff.map((member) => (
              <StaffRow key={member.id} member={member} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StaffRow({ member }: { member: StaffMember }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editName, setEditName] = useState(member.full_name);
  const [editEmail, setEditEmail] = useState(member.email);
  const [editLimit, setEditLimit] = useState(String(member.monthly_limit));
  const [error, setError] = useState<string | null>(null);

  const handleToggleActive = async () => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId: member.id,
          isActive: !member.is_active,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to update status.");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveEdit = async () => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId: member.id,
          fullName: editName.trim(),
          email: editEmail.trim(),
          monthlyLimit: parseInt(editLimit, 10),
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to update staff account.");
      }

      setIsEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetUsage = async () => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/staff/reset-usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId: member.id }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to reset usage.");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetAccessCode = async () => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/staff/reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId: member.id }),
      });

      const data = (await response.json()) as { error?: string; accessCode?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset access code.");
      }

      alert(`New access code for ${member.full_name || member.email}: ${data.accessCode}\n\nPlease share this securely with the staff member.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isEditing) {
    return (
      <tr className="bg-slate-50">
        <td className="px-6 py-3">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
            placeholder="Full name"
          />
        </td>
        <td className="px-6 py-3">
          <input
            type="email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
            placeholder="Email"
          />
        </td>
        <td className="px-6 py-3 text-slate-600 capitalize">{member.role}</td>
        <td className="px-6 py-3">
          <input
            type="number"
            value={editLimit}
            onChange={(e) => setEditLimit(e.target.value)}
            className="w-24 rounded border border-slate-300 px-2 py-1 text-sm"
            min={1}
            max={10000}
          />
        </td>
        <td className="px-6 py-3">
          <StatusBadge isActive={member.is_active} />
        </td>
        <td className="px-6 py-3">
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={isUpdating}
              className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setError(null);
              }}
              className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </td>
      </tr>
    );
  }

  return (
    <tr className={!member.is_active ? "bg-slate-50 opacity-60" : ""}>
      <td className="px-6 py-3 font-medium text-slate-900">
        {member.full_name || "—"}
      </td>
      <td className="px-6 py-3 text-slate-600">{member.email}</td>
      <td className="px-6 py-3 text-slate-600 capitalize">{member.role}</td>
      <td className="px-6 py-3 text-slate-600">
        {member.used_this_month} / {member.monthly_limit}
      </td>
      <td className="px-6 py-3">
        <StatusBadge isActive={member.is_active} />
      </td>
      <td className="px-6 py-3">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setIsEditing(true)}
            disabled={isUpdating}
            className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            Edit
          </button>
          <button
            onClick={handleToggleActive}
            disabled={isUpdating}
            className={`rounded px-2 py-1 text-xs font-medium disabled:opacity-50 ${
              member.is_active
                ? "border border-red-200 text-red-700 hover:bg-red-50"
                : "border border-green-200 text-green-700 hover:bg-green-50"
            }`}
          >
            {member.is_active ? "Deactivate" : "Reactivate"}
          </button>
          <button
            onClick={handleResetUsage}
            disabled={isUpdating}
            className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            Reset usage
          </button>
          <button
            onClick={handleResetAccessCode}
            disabled={isUpdating}
            className="rounded border border-amber-200 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50"
          >
            Reset code
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </td>
    </tr>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        isActive
          ? "bg-green-100 text-green-800"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
