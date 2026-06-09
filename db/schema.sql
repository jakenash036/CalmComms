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
