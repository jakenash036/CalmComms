import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import {
  ensureSchema,
  findUserById,
  createStaffAccount,
  updateStaffAccount,
  countStaffByOrganization,
  findOrganizationById,
} from "@/lib/db";
import { generateAccessCode } from "@/lib/access-code";

function isValidEmail(email: string): boolean {
  if (email.length > 254) {
    return false;
  }

  const parts = email.split("@");

  if (parts.length !== 2) {
    return false;
  }

  const [local, domain] = parts;

  if (!local || local.length > 64 || !domain || domain.length > 253) {
    return false;
  }

  const domainLabels = domain.split(".");

  if (domainLabels.length < 2) {
    return false;
  }

  return domainLabels.every(
    (label) => label.length > 0 && label.length <= 63 && /^[a-zA-Z0-9-]+$/.test(label),
  );
}

/**
 * POST — Create a new staff account under the admin's organisation.
 */
export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies();

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
    }

    await ensureSchema();
    const admin = await findUserById(session.userId);

    if (!admin || admin.role !== "admin" || !admin.organization_id) {
      return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
    }

    const organization = await findOrganizationById(admin.organization_id);

    if (!organization) {
      return NextResponse.json({ error: "Organisation not found." }, { status: 404 });
    }

    const payload = (await request.json()) as {
      fullName?: string;
      email?: string;
      monthlyLimit?: number;
    };

    const fullName = payload.fullName?.trim();
    const email = payload.email?.trim();
    const monthlyLimit = payload.monthlyLimit ?? 100;

    if (!fullName || fullName.length < 2) {
      return NextResponse.json(
        { error: "Full name is required (at least 2 characters)." },
        { status: 400 },
      );
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 },
      );
    }

    if (typeof monthlyLimit !== "number" || monthlyLimit < 1 || monthlyLimit > 10000) {
      return NextResponse.json(
        { error: "Monthly limit must be between 1 and 10,000." },
        { status: 400 },
      );
    }

    // Check staff limit
    const activeCount = await countStaffByOrganization(admin.organization_id);

    if (activeCount >= organization.max_staff) {
      return NextResponse.json(
        { error: `Staff limit reached (${organization.max_staff}). Deactivate an existing account or contact support.` },
        { status: 403 },
      );
    }

    const accessCode = generateAccessCode();

    const staff = await createStaffAccount({
      email,
      fullName,
      accessCode,
      organizationId: admin.organization_id,
      monthlyLimit,
    });

    return NextResponse.json({ staff, accessCode }, { status: 201 });
  } catch (error) {
    console.error(error);

    const message =
      error instanceof Error && error.message.includes("duplicate key")
        ? "A user with that email address already exists."
        : "Failed to create staff account.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH — Update a staff account (name, email, limit, active status).
 */
export async function PATCH(request: Request) {
  try {
    const session = await getSessionFromCookies();

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
    }

    await ensureSchema();
    const admin = await findUserById(session.userId);

    if (!admin || admin.role !== "admin" || !admin.organization_id) {
      return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
    }

    const payload = (await request.json()) as {
      staffId?: string;
      fullName?: string;
      email?: string;
      monthlyLimit?: number;
      isActive?: boolean;
    };

    if (!payload.staffId) {
      return NextResponse.json({ error: "Staff ID is required." }, { status: 400 });
    }

    if (payload.email !== undefined && !isValidEmail(payload.email.trim())) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    if (
      payload.monthlyLimit !== undefined &&
      (typeof payload.monthlyLimit !== "number" || payload.monthlyLimit < 1 || payload.monthlyLimit > 10000)
    ) {
      return NextResponse.json(
        { error: "Monthly limit must be between 1 and 10,000." },
        { status: 400 },
      );
    }

    const updated = await updateStaffAccount({
      staffId: payload.staffId,
      organizationId: admin.organization_id,
      fullName: payload.fullName?.trim(),
      email: payload.email?.trim(),
      monthlyLimit: payload.monthlyLimit,
      isActive: payload.isActive,
    });

    if (!updated) {
      return NextResponse.json({ error: "Staff member not found." }, { status: 404 });
    }

    return NextResponse.json({ staff: updated });
  } catch (error) {
    console.error(error);

    const message =
      error instanceof Error && error.message.includes("duplicate key")
        ? "A user with that email address already exists."
        : "Failed to update staff account.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
