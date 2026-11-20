# Savings account and wallet API test plan

The fixture state machine permits pending → approved → active → closed. Only active accounts accept transactions. A close requires zero balance. The sender and receiver must be distinct active accounts for a transfer. A transfer produces one matching debit and credit under a single transfer ID. A successful operation may be replayed with its fixture idempotency key without posting a duplicate. Rejected operations preserve account balances and transaction histories.

The amount partition includes invalid types, negative and zero amounts, sub-cent precision, one cent, exact available balance, and one cent over available balance. The suite checks coordinated account effects, cross-ledger references, tenant and role boundaries, and reversal without deleting the original entry. The fixture stores integer cents and exposes major currency units at the HTTP layer.

The release gate is a clean fixture run with JUnit results. For Apache Fineract, verify the version, product charges, date policy, tenant roles, and idempotency behavior before comparing upstream results. Use the opt-in collection with a seeded local instance and synthetic data. The fixture defines its own error codes, holds no credentials, and makes no claim about concurrent settlement, real banking, or upstream database behavior.
