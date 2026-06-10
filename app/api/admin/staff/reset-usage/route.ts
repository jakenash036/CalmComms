import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { ensureSchema, findUserById, resetStaffUsage } from "@/lib/db";

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

    const payload = (await request.json()) as { staffId?: string };

    if (!payload.staffId) {
      return NextResponse.json({ error: "Staff ID is required." }, { status: 400 });
    }

    const success = await resetStaffUsage(payload.staffId, admin.organization_id);

    if (!success) {
      return NextResponse.json({ error: "Staff member not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to reset usage." }, { status: 500 });
  }
}
