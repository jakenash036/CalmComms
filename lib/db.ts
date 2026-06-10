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
    CREATE TABLE IF NOT EXISTS organizations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      plan TEXT DEFAULT 'school',
      max_staff INTEGER DEFAULT 50,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      access_code TEXT NOT NULL,
      full_name TEXT DEFAULT '',
      role TEXT DEFAULT 'staff',
      organization_id UUID REFERENCES organizations(id),
      plan TEXT DEFAULT 'lite',
      monthly_limit INTEGER DEFAULT 100,
      used_this_month INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
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

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type UserRow = {
  id: string;
  email: string;
  access_code: string;
  full_name: string;
  role: string;
  organization_id: string | null;
  plan: string;
  monthly_limit: number;
  used_this_month: number;
  is_active: boolean;
};

export type OrganizationRow = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  max_staff: number;
};

export type StaffRow = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  monthly_limit: number;
  used_this_month: number;
  is_active: boolean;
  created_at: string;
};

/* ------------------------------------------------------------------ */
/*  User queries                                                       */
/* ------------------------------------------------------------------ */

export async function findUserByCredentials(email: string, accessCode: string) {
  const sql = getSqlClient();
  const users = (await sql`
    SELECT id, email, access_code, full_name, role, organization_id, plan, monthly_limit, used_this_month, is_active
    FROM users
    WHERE lower(email) = lower(${email}) AND access_code = ${accessCode}
    LIMIT 1
  `) as UserRow[];

  return users[0] ?? null;
}

export async function findUserById(id: string) {
  const sql = getSqlClient();
  const users = (await sql`
    SELECT id, email, access_code, full_name, role, organization_id, plan, monthly_limit, used_this_month, is_active
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

/* ------------------------------------------------------------------ */
/*  Organization queries                                               */
/* ------------------------------------------------------------------ */

export async function findOrganizationById(id: string) {
  const sql = getSqlClient();
  const rows = (await sql`
    SELECT id, name, slug, plan, max_staff
    FROM organizations
    WHERE id = ${id}
    LIMIT 1
  `) as OrganizationRow[];

  return rows[0] ?? null;
}

/* ------------------------------------------------------------------ */
/*  Admin — staff management                                           */
/* ------------------------------------------------------------------ */

export async function listStaffByOrganization(organizationId: string) {
  const sql = getSqlClient();
  const rows = (await sql`
    SELECT id, email, full_name, role, monthly_limit, used_this_month, is_active, created_at
    FROM users
    WHERE organization_id = ${organizationId}
    ORDER BY created_at DESC
  `) as StaffRow[];

  return rows;
}

export async function countStaffByOrganization(organizationId: string) {
  const sql = getSqlClient();
  const rows = (await sql`
    SELECT COUNT(*)::int AS count
    FROM users
    WHERE organization_id = ${organizationId} AND is_active = true
  `) as { count: number }[];

  return rows[0]?.count ?? 0;
}

export async function createStaffAccount(params: {
  email: string;
  fullName: string;
  accessCode: string;
  organizationId: string;
  monthlyLimit: number;
}) {
  const sql = getSqlClient();
  const rows = (await sql`
    INSERT INTO users (email, access_code, full_name, role, organization_id, plan, monthly_limit)
    VALUES (${params.email}, ${params.accessCode}, ${params.fullName}, 'staff', ${params.organizationId}, 'lite', ${params.monthlyLimit})
    RETURNING id, email, full_name, role, monthly_limit, used_this_month, is_active, created_at
  `) as StaffRow[];

  return rows[0] ?? null;
}

export async function updateStaffAccount(params: {
  staffId: string;
  organizationId: string;
  fullName?: string;
  email?: string;
  accessCode?: string;
  monthlyLimit?: number;
  isActive?: boolean;
}) {
  const sql = getSqlClient();

  // Verify the staff member belongs to this organization
  const existing = (await sql`
    SELECT id FROM users
    WHERE id = ${params.staffId} AND organization_id = ${params.organizationId}
    LIMIT 1
  `) as { id: string }[];

  if (!existing[0]) {
    return null;
  }

  if (params.fullName !== undefined) {
    await sql`UPDATE users SET full_name = ${params.fullName}, updated_at = now() WHERE id = ${params.staffId}`;
  }
  if (params.email !== undefined) {
    await sql`UPDATE users SET email = ${params.email}, updated_at = now() WHERE id = ${params.staffId}`;
  }
  if (params.accessCode !== undefined) {
    await sql`UPDATE users SET access_code = ${params.accessCode}, updated_at = now() WHERE id = ${params.staffId}`;
  }
  if (params.monthlyLimit !== undefined) {
    await sql`UPDATE users SET monthly_limit = ${params.monthlyLimit}, updated_at = now() WHERE id = ${params.staffId}`;
  }
  if (params.isActive !== undefined) {
    await sql`UPDATE users SET is_active = ${params.isActive}, updated_at = now() WHERE id = ${params.staffId}`;
  }

  const updated = (await sql`
    SELECT id, email, full_name, role, monthly_limit, used_this_month, is_active, created_at
    FROM users
    WHERE id = ${params.staffId}
    LIMIT 1
  `) as StaffRow[];

  return updated[0] ?? null;
}

export async function resetStaffUsage(staffId: string, organizationId: string) {
  const sql = getSqlClient();

  const existing = (await sql`
    SELECT id FROM users
    WHERE id = ${staffId} AND organization_id = ${organizationId}
    LIMIT 1
  `) as { id: string }[];

  if (!existing[0]) {
    return false;
  }

  await sql`UPDATE users SET used_this_month = 0, updated_at = now() WHERE id = ${staffId}`;
  return true;
}

export async function getOrganizationStats(organizationId: string) {
  const sql = getSqlClient();

  const staffCount = (await sql`
    SELECT COUNT(*)::int AS count FROM users WHERE organization_id = ${organizationId}
  `) as { count: number }[];

  const activeCount = (await sql`
    SELECT COUNT(*)::int AS count FROM users WHERE organization_id = ${organizationId} AND is_active = true
  `) as { count: number }[];

  const totalUsage = (await sql`
    SELECT COALESCE(SUM(used_this_month), 0)::int AS total FROM users WHERE organization_id = ${organizationId}
  `) as { total: number }[];

  const totalRewrites = (await sql`
    SELECT COUNT(*)::int AS count FROM rewrites r
    JOIN users u ON u.id = r.user_id
    WHERE u.organization_id = ${organizationId}
  `) as { count: number }[];

  return {
    totalStaff: staffCount[0]?.count ?? 0,
    activeStaff: activeCount[0]?.count ?? 0,
    totalUsageThisMonth: totalUsage[0]?.total ?? 0,
    totalRewritesAllTime: totalRewrites[0]?.count ?? 0,
  };
}
