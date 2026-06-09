# CalmComms MVP

CalmComms is a school-safe rewriting tool for SEND, SEMH, AP and pastoral teams.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment template and fill values:

```bash
cp .env.example .env.local
```

Required variables:
- `DATABASE_URL`
- `OPENAI_API_KEY`
- `SESSION_SECRET`

3. Run SQL in Neon:

```sql
-- db/schema.sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  access_code TEXT NOT NULL,
  plan TEXT DEFAULT 'lite',
  monthly_limit INTEGER DEFAULT 100,
  used_this_month INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rewrites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  message_type TEXT NOT NULL,
  tone TEXT NOT NULL,
  output_type TEXT NOT NULL,
  input_char_count INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
```

4. Seed demo user:

```sql
INSERT INTO users (email, access_code, plan, monthly_limit, used_this_month)
VALUES ('test@calmcomms.co.uk', 'DEMO123', 'lite', 100, 0)
ON CONFLICT (email) DO UPDATE SET
  access_code = EXCLUDED.access_code,
  plan = EXCLUDED.plan,
  monthly_limit = EXCLUDED.monthly_limit,
  used_this_month = EXCLUDED.used_this_month,
  updated_at = now();
```

5. Run locally:

```bash
npm run dev
```

## Add a user manually

```sql
INSERT INTO users (email, access_code, plan, monthly_limit, used_this_month)
VALUES ('staff@school.org.uk', 'ACCESS123', 'lite', 100, 0);
```

## Deploy to Vercel

1. Import repo in Vercel.
2. Add `DATABASE_URL`, `OPENAI_API_KEY`, `SESSION_SECRET` in Project Settings → Environment Variables.
3. Deploy.
