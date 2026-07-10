BEGIN;

INSERT INTO skills (id, name, category)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Spanish tutoring', 'Education'),
  ('10000000-0000-0000-0000-000000000002', 'Moving help', 'Home'),
  ('10000000-0000-0000-0000-000000000003', 'Bike repair', 'Repair'),
  ('10000000-0000-0000-0000-000000000004', 'Dog walking', 'Pets'),
  ('10000000-0000-0000-0000-000000000005', 'Resume review', 'Career')
ON CONFLICT (name) DO UPDATE
SET category = EXCLUDED.category;

INSERT INTO users (
  id,
  auth0_sub,
  display_name,
  bio,
  home_location,
  approx_area,
  verification_tier
)
VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    'demo|maya',
    'Maya Chen',
    'Happy to trade tutoring and resume help for practical neighborhood favors.',
    ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography,
    'Mission District',
    1
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'demo|jordan',
    'Jordan Rivera',
    'Bike commuter, dog person, and generally useful on weekends.',
    ST_SetSRID(ST_MakePoint(-122.4313, 37.7730), 4326)::geography,
    'Lower Haight',
    1
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    'demo|sam',
    'Sam Patel',
    'Looking for help around the apartment and glad to trade pet care.',
    ST_SetSRID(ST_MakePoint(-122.4098, 37.7833), 4326)::geography,
    'SoMa',
    0
  )
ON CONFLICT (auth0_sub) DO UPDATE
SET
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  home_location = EXCLUDED.home_location,
  approx_area = EXCLUDED.approx_area,
  verification_tier = EXCLUDED.verification_tier;

INSERT INTO user_skills (user_id, skill_id, kind)
VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'offer'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'offer'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'want'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'offer'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'want'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004', 'offer'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'want')
ON CONFLICT (user_id, skill_id, kind) DO NOTHING;

INSERT INTO listings (
  id,
  user_id,
  type,
  title,
  description,
  category,
  est_hours,
  location,
  approx_area
)
VALUES
  (
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'offer',
    'Spanish tutoring for beginners',
    'One-on-one help with conversation practice, homework, or getting ready for a trip.',
    'Education',
    1.50,
    ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography,
    'Mission District'
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    'offer',
    'Basic bike tune-up',
    'I can adjust brakes, fix a flat, tighten bolts, and help diagnose small issues.',
    'Repair',
    2.00,
    ST_SetSRID(ST_MakePoint(-122.4313, 37.7730), 4326)::geography,
    'Lower Haight'
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000003',
    'request',
    'Help moving a small bookcase',
    'Need one person to help carry a bookcase down two flights of stairs this weekend.',
    'Home',
    1.00,
    ST_SetSRID(ST_MakePoint(-122.4098, 37.7833), 4326)::geography,
    'SoMa'
  )
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  est_hours = EXCLUDED.est_hours,
  location = EXCLUDED.location,
  approx_area = EXCLUDED.approx_area,
  status = 'active';

INSERT INTO ledger_accounts (id, owner_type, owner_ref, kind)
VALUES
  ('40000000-0000-0000-0000-000000000001', 'system', 'mint', 'source'),
  ('40000000-0000-0000-0000-000000000002', 'system', 'escrow', 'holding'),
  ('40000000-0000-0000-0000-000000000101', 'user', '20000000-0000-0000-0000-000000000001', 'available'),
  ('40000000-0000-0000-0000-000000000102', 'user', '20000000-0000-0000-0000-000000000002', 'available'),
  ('40000000-0000-0000-0000-000000000103', 'user', '20000000-0000-0000-0000-000000000003', 'available')
ON CONFLICT (owner_type, owner_ref, kind) DO NOTHING;

INSERT INTO ledger_transactions (id, kind, idempotency_key)
VALUES
  ('50000000-0000-0000-0000-000000000001', 'grant', 'seed-grant-maya'),
  ('50000000-0000-0000-0000-000000000002', 'grant', 'seed-grant-jordan'),
  ('50000000-0000-0000-0000-000000000003', 'grant', 'seed-grant-sam')
ON CONFLICT (idempotency_key) DO NOTHING;

INSERT INTO ledger_entries (transaction_id, account_id, amount)
SELECT *
FROM (
  VALUES
    ('50000000-0000-0000-0000-000000000001'::uuid, '40000000-0000-0000-0000-000000000001'::uuid, -5.00::numeric),
    ('50000000-0000-0000-0000-000000000001'::uuid, '40000000-0000-0000-0000-000000000101'::uuid, 5.00::numeric),
    ('50000000-0000-0000-0000-000000000002'::uuid, '40000000-0000-0000-0000-000000000001'::uuid, -5.00::numeric),
    ('50000000-0000-0000-0000-000000000002'::uuid, '40000000-0000-0000-0000-000000000102'::uuid, 5.00::numeric),
    ('50000000-0000-0000-0000-000000000003'::uuid, '40000000-0000-0000-0000-000000000001'::uuid, -5.00::numeric),
    ('50000000-0000-0000-0000-000000000003'::uuid, '40000000-0000-0000-0000-000000000103'::uuid, 5.00::numeric)
) AS seed_entries(transaction_id, account_id, amount)
WHERE NOT EXISTS (
  SELECT 1
  FROM ledger_entries existing_entries
  WHERE existing_entries.transaction_id = seed_entries.transaction_id
);

COMMIT;
