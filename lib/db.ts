import { neon } from "@neondatabase/serverless";

let schemaReady = false;

function getSqlClient() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return neon(databaseUrl);
}

export async function ensureSchema() {
  if (schemaReady) {
    return;
  }

  const sql = getSqlClient();

  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      access_code TEXT NOT NULL,
      plan TEXT DEFAULT 'lite',
      monthly_limit INTEGER DEFAULT 100,
      used_this_month INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS rewrites (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      message_type TEXT NOT NULL,
      tone TEXT NOT NULL,
      output_type TEXT NOT NULL,
      input_char_count INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT now()
    )
  `;

  schemaReady = true;
}

export type UserRow = {
  id: string;
  email: string;
  access_code: string;
  plan: string;
  monthly_limit: number;
  used_this_month: number;
};

export async function findUserByCredentials(email: string, accessCode: string) {
  const sql = getSqlClient();
  const users = (await sql`
    SELECT id, email, access_code, plan, monthly_limit, used_this_month
    FROM users
    WHERE lower(email) = lower(${email}) AND access_code = ${accessCode}
    LIMIT 1
  `) as UserRow[];

  return users[0] ?? null;
}

export async function findUserById(id: string) {
  const sql = getSqlClient();
  const users = (await sql`
    SELECT id, email, access_code, plan, monthly_limit, used_this_month
    FROM users
    WHERE id = ${id}
    LIMIT 1
  `) as UserRow[];

  return users[0] ?? null;
}

export async function incrementUsageAndTrackRewrite(params: {
  userId: string;
  messageType: string;
  tone: string;
  outputType: string;
  inputCharCount: number;
}) {
  const sql = getSqlClient();

  await sql`
    UPDATE users
    SET used_this_month = used_this_month + 1,
        updated_at = now()
    WHERE id = ${params.userId}
  `;

  await sql`
    INSERT INTO rewrites (user_id, message_type, tone, output_type, input_char_count)
    VALUES (${params.userId}, ${params.messageType}, ${params.tone}, ${params.outputType}, ${params.inputCharCount})
  `;
}
