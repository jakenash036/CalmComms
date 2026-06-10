"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CreateStaffFormProps = {
  canAddMore: boolean;
  maxStaff: number;
  activeCount: number;
};

export function CreateStaffForm({ canAddMore, maxStaff, activeCount }: CreateStaffFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState("100");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setMonthlyLimit("100");
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          monthlyLimit: parseInt(monthlyLimit, 10),
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        accessCode?: string;
        staff?: { full_name: string; email: string };
      };

      if (!response.ok) {
        throw new Error(data.error || "Failed to create staff account.");
      }

      setSuccess(
        `Account created for ${data.staff?.full_name ?? email}. Access code: ${data.accessCode}. Please share this securely with the staff member.`,
      );
      setFullName("");
      setEmail("");
      setMonthlyLimit("100");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create staff account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Add new staff member</h2>
            <p className="mt-1 text-sm text-slate-600">
              {activeCount} of {maxStaff} active staff slots used.
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsOpen(true);
            }}
            disabled={!canAddMore}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {canAddMore ? "Add staff member" : "Staff limit reached"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Create new staff account</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          Cancel
        </button>
      </div>

      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Full name
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-800"
              placeholder="e.g. Jane Smith"
              required
              minLength={2}
              maxLength={100}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Email address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-800"
              placeholder="e.g. j.smith@school.co.uk"
              required
            />
          </label>
        </div>

        <label className="block text-sm font-medium text-slate-700">
          Monthly rewrite limit
          <input
            type="number"
            value={monthlyLimit}
            onChange={(e) => setMonthlyLimit(e.target.value)}
            className="mt-1 w-full max-w-xs rounded-lg border border-slate-300 p-2.5 text-sm text-slate-800"
            min={1}
            max={10000}
            required
          />
          <span className="mt-1 block text-xs text-slate-500">
            Maximum number of rewrites this staff member can use per month.
          </span>
        </label>

        <p className="text-sm text-slate-600">
          An access code will be automatically generated. You will need to share it securely with the staff member so they can sign in.
        </p>

        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {success && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
            <p className="font-medium">Staff account created successfully!</p>
            <p className="mt-1">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Creating account..." : "Create staff account"}
        </button>
      </form>
    </div>
  );
}
