INSERT INTO users (email, access_code, plan, monthly_limit, used_this_month)
VALUES ('test@calmcomms.co.uk', 'DEMO123', 'lite', 100, 0)
ON CONFLICT (email) DO UPDATE SET
  access_code = EXCLUDED.access_code,
  plan = EXCLUDED.plan,
  monthly_limit = EXCLUDED.monthly_limit,
  used_this_month = EXCLUDED.used_this_month,
  updated_at = now();
