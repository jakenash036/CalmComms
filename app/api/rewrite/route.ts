import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import {
  ensureSchema,
  findUserById,
  incrementUsageAndTrackRewrite,
} from "@/lib/db";
import { generateRewrite } from "@/lib/openai";
import { SAFETY_BLOCK_MESSAGE, hasRiskKeywords } from "@/lib/safety";
import { validateRewriteInput } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies();

    if (!session) {
      return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
    }

    const payload = (await request.json()) as {
      input: string;
      messageType: string;
      tone: string;
      outputType: string;
    };

    const validationError = validateRewriteInput(payload);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    await ensureSchema();
    const user = await findUserById(session.userId);

    if (!user) {
      return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
    }

    if (user.used_this_month >= user.monthly_limit) {
      return NextResponse.json(
        { error: "Monthly rewrite limit reached. Please contact an administrator." },
        { status: 403 },
      );
    }

    const trimmedInput = payload.input.trim();

    if (hasRiskKeywords(trimmedInput)) {
      return NextResponse.json({
        output: SAFETY_BLOCK_MESSAGE,
        blocked: true,
        usedThisMonth: user.used_this_month,
      });
    }

    const output = await generateRewrite({
      input: trimmedInput,
      messageType: payload.messageType,
      tone: payload.tone,
      outputType: payload.outputType,
    });

    await incrementUsageAndTrackRewrite({
      userId: user.id,
      messageType: payload.messageType,
      tone: payload.tone,
      outputType: payload.outputType,
      inputCharCount: trimmedInput.length,
    });

    return NextResponse.json({
      output,
      usedThisMonth: user.used_this_month + 1,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Rewrite failed. Please try again." },
      { status: 500 },
    );
  }
}
