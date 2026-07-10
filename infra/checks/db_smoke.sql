SELECT extname
FROM pg_extension
WHERE extname IN ('pgcrypto', 'postgis', 'vector')
ORDER BY extname;

SELECT
  (SELECT COUNT(*) FROM users) AS users,
  (SELECT COUNT(*) FROM skills) AS skills,
  (SELECT COUNT(*) FROM listings) AS listings,
  (SELECT COUNT(*) FROM ledger_transactions) AS ledger_transactions;

SELECT
  ledger_accounts.owner_type,
  ledger_accounts.owner_ref,
  ledger_accounts.kind,
  ledger_account_balances.balance
FROM ledger_account_balances
JOIN ledger_accounts ON ledger_accounts.id = ledger_account_balances.account_id
ORDER BY ledger_accounts.owner_type, ledger_accounts.owner_ref, ledger_accounts.kind;

SELECT
  ledger_transactions.id,
  ledger_transactions.kind,
  SUM(ledger_entries.amount)::numeric(10, 2) AS entry_sum
FROM ledger_transactions
JOIN ledger_entries ON ledger_entries.transaction_id = ledger_transactions.id
GROUP BY ledger_transactions.id, ledger_transactions.kind
HAVING SUM(ledger_entries.amount) <> 0;
