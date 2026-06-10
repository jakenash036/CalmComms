import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE_NAME = "calmcomms_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
  email: string;
  role: string;
  organizationId: string | null;
  exp: number;
};

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET is not configured.");
  }

  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

export function encodeSession(payload: SessionPayload) {
  const rawPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(rawPayload);
  return `${rawPayload}.${signature}`;
}

export function decodeSession(token: string): SessionPayload | null {
  const [rawPayload, signature] = token.split(".");

  if (!rawPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(rawPayload);

  try {
    if (
      !timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature),
      )
    ) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(rawPayload, "base64url").toString("utf8"),
    ) as SessionPayload;

    if (!payload.userId || !payload.email || !payload.role || !payload.exp) {
      return null;
    }

    if (payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function createUserSession(userId: string, email: string, role: string, organizationId: string | null) {
  const token = encodeSession({
    userId,
    email,
    role,
    organizationId,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearUserSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return decodeSession(token);
}
