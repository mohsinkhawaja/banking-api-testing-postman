# Baseline execution

Executed with Node.js and Newman 6.2.1 on November 20, 2026.

| Target | Requests | Assertions passed | Failures |
| --- | ---: | ---: | ---: |
| Local synthetic savings fixture | 48 | 144 | 0 |
| Apache Fineract 1.16.1 with local PostgreSQL | 19 | 57 | 0 |

The fixture covered lifecycle restrictions, amount boundaries, authorization, declined mutations and wallet balances. The Fineract run created synthetic clients and savings accounts, replayed a deposit without posting a duplicate, checked balances and history after withdrawals and transfers, and verified withdrawal reversal. The reversal response identifies the savings account. The following history request confirms the original transaction's `reversed` flag and the restored balance.

See the [run instructions](../README.md) to reproduce the JUnit report.
