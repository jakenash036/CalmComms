-- Seed organization
INSERT INTO organizations (name, slug, plan, max_staff)
VALUES ('Demo School', 'demo-school', 'school', 50)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  plan = EXCLUDED.plan,
  max_staff = EXCLUDED.max_staff,
  updated_at = now();

-- Seed admin user (linked to the demo organization)
INSERT INTO users (email, access_code, full_name, role, organization_id, plan, monthly_limit, used_this_month)
VALUES (
  'admin@calmcomms.co.uk',
  'ADMIN123',
  'School Admin',
  'admin',
  (SELECT id FROM organizations WHERE slug = 'demo-school'),
  'school',
  999,
  0
)
ON CONFLICT (email) DO UPDATE SET
  access_code = EXCLUDED.access_code,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  organization_id = EXCLUDED.organization_id,
  plan = EXCLUDED.plan,
  monthly_limit = EXCLUDED.monthly_limit,
  used_this_month = EXCLUDED.used_this_month,
  updated_at = now();

-- Seed regular staff user (linked to the demo organization)
INSERT INTO users (email, access_code, full_name, role, organization_id, plan, monthly_limit, used_this_month)
VALUES (
  'test@calmcomms.co.uk',
  'DEMO123',
  'Test Staff',
  'staff',
  (SELECT id FROM organizations WHERE slug = 'demo-school'),
  'lite',
  100,
  0
)
ON CONFLICT (email) DO UPDATE SET
  access_code = EXCLUDED.access_code,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  organization_id = EXCLUDED.organization_id,
  plan = EXCLUDED.plan,
  monthly_limit = EXCLUDED.monthly_limit,
  used_this_month = EXCLUDED.used_this_month,
  updated_at = now();
