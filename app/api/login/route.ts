import { NextResponse } from "next/server";
import { createUserSession } from "@/lib/auth";
import { ensureSchema, findUserByCredentials } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      email?: string;
      accessCode?: string;
    };

    const email = payload.email?.trim();
    const accessCode = payload.accessCode?.trim();

    if (!email || !accessCode) {
      return NextResponse.json(
        { error: "Email and access code are required." },
        { status: 400 },
      );
    }

    await ensureSchema();
    const user = await findUserByCredentials(email, accessCode);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or access code." },
        { status: 401 },
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: "This account has been deactivated. Please contact your administrator." },
        { status: 403 },
      );
    }

    await createUserSession(user.id, user.email, user.role, user.organization_id);

    return NextResponse.json({ success: true, role: user.role });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to sign in right now. Please try again." },
      { status: 500 },
    );
  }
}
