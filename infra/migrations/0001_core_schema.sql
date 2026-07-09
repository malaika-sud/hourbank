BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;

DO $$
BEGIN
  CREATE TYPE listing_type AS ENUM ('offer', 'request');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE listing_status AS ENUM ('active', 'paused', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE user_skill_kind AS ENUM ('offer', 'want');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE trade_status AS ENUM ('proposed', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE ledger_owner_type AS ENUM ('user', 'system');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE ledger_transaction_kind AS ENUM ('grant', 'escrow_hold', 'escrow_release', 'refund', 'adjustment');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth0_sub text NOT NULL UNIQUE,
  display_name text NOT NULL,
  bio text,
  home_location geography(Point, 4326),
  approx_area text NOT NULL,
  verification_tier integer NOT NULL DEFAULT 0 CHECK (verification_tier >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_skills (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  kind user_skill_kind NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, skill_id, kind)
);

CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type listing_type NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  est_hours numeric(6, 2) CHECK (est_hours IS NULL OR est_hours > 0),
  location geography(Point, 4326),
  approx_area text NOT NULL,
  embedding vector(768),
  status listing_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
  requester_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  provider_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  agreed_hours numeric(6, 2) NOT NULL CHECK (agreed_hours > 0),
  credit_multiplier numeric(5, 2) NOT NULL DEFAULT 1.0 CHECK (credit_multiplier > 0),
  agreed_credits numeric(8, 2) GENERATED ALWAYS AS (agreed_hours * credit_multiplier) STORED,
  status trade_status NOT NULL DEFAULT 'proposed',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (requester_id <> provider_id)
);

CREATE TABLE IF NOT EXISTS ledger_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type ledger_owner_type NOT NULL,
  owner_ref text NOT NULL,
  kind text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_type, owner_ref, kind)
);

CREATE TABLE IF NOT EXISTS ledger_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind ledger_transaction_kind NOT NULL,
  trade_id uuid REFERENCES trades(id) ON DELETE RESTRICT,
  idempotency_key text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES ledger_transactions(id) ON DELETE RESTRICT,
  account_id uuid NOT NULL REFERENCES ledger_accounts(id) ON DELETE RESTRICT,
  amount numeric(10, 2) NOT NULL CHECK (amount <> 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION assert_ledger_transaction_balanced(transaction_id_to_check uuid)
RETURNS void AS $$
DECLARE
  entry_total numeric(10, 2);
BEGIN
  SELECT COALESCE(SUM(amount), 0)::numeric(10, 2)
  INTO entry_total
  FROM ledger_entries
  WHERE transaction_id = transaction_id_to_check;

  IF entry_total <> 0 THEN
    RAISE EXCEPTION 'ledger transaction % is not balanced', transaction_id_to_check;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_ledger_transaction_balanced()
RETURNS trigger AS $$
BEGIN
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    PERFORM assert_ledger_transaction_balanced(NEW.transaction_id);
  END IF;

  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    PERFORM assert_ledger_transaction_balanced(OLD.transaction_id);
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ledger_entries_balance_check ON ledger_entries;
CREATE CONSTRAINT TRIGGER ledger_entries_balance_check
AFTER INSERT OR UPDATE OR DELETE ON ledger_entries
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION check_ledger_transaction_balanced();

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id uuid NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  rater_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ratee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (trade_id, rater_id),
  CHECK (rater_id <> ratee_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id uuid NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appraisals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  suggested_hours numeric(6, 2) NOT NULL CHECK (suggested_hours > 0),
  rationale text NOT NULL,
  model text NOT NULL,
  confidence numeric(4, 3) CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 1),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS listings_set_updated_at ON listings;
CREATE TRIGGER listings_set_updated_at
BEFORE UPDATE ON listings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trades_set_updated_at ON trades;
CREATE TRIGGER trades_set_updated_at
BEFORE UPDATE ON trades
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE VIEW ledger_account_balances AS
SELECT
  ledger_accounts.id AS account_id,
  COALESCE(SUM(ledger_entries.amount), 0)::numeric(10, 2) AS balance
FROM ledger_accounts
LEFT JOIN ledger_entries ON ledger_entries.account_id = ledger_accounts.id
GROUP BY ledger_accounts.id;

CREATE INDEX IF NOT EXISTS users_home_location_gix ON users USING gist (home_location);
CREATE INDEX IF NOT EXISTS listings_location_gix ON listings USING gist (location);
CREATE INDEX IF NOT EXISTS listings_status_idx ON listings (status);
CREATE INDEX IF NOT EXISTS listings_category_idx ON listings (category);
CREATE INDEX IF NOT EXISTS trades_requester_id_idx ON trades (requester_id);
CREATE INDEX IF NOT EXISTS trades_provider_id_idx ON trades (provider_id);
CREATE INDEX IF NOT EXISTS ledger_entries_account_id_idx ON ledger_entries (account_id);
CREATE INDEX IF NOT EXISTS messages_trade_id_created_at_idx ON messages (trade_id, created_at);

COMMIT;
