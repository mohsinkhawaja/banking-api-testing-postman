# Baseline execution

Newman 6.2.1 executed the synthetic savings fixture on November 20, 2026. The run completed 48 requests and 144 assertions with zero failures.

The runner started with a fresh tenant fixture and synthetic account data. Tests exercised account state transitions, deposits, withdrawals, transfers, amount boundaries, rejected operations, replay, and reversal. Apache Fineract was outside this baseline.

See the [run instructions](../README.md) to reproduce the JUnit report.
