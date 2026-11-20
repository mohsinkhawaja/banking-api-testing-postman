# Banking API Testing with Postman

Regression suites for synthetic savings accounts and wallet transfers. Newman checks account lifecycle, deposits and withdrawals, exact currency boundaries, permissions, transaction history, idempotency, and reversal. The fixture and the optional Apache Fineract integration use separate collections, so a fixture baseline cannot be confused with an upstream test result.

## Run the fixture regression

Prerequisite: Node.js 22 or later.

```sh
npm ci
npm run verify:collections
npm test
```

The runner starts a fresh fixture on a random loopback port. All 48 scenarios execute in collection order and store `reports/fixture.junit.xml`. GitHub Actions runs the same suite on each push and pull request. To use Postman directly, start `npm run fixture`, import the [fixture collection](collections/fixture.postman_collection.json) and [example environment](environments/fixture.example.postman_environment.json), and use the Collection Runner. Restart the local fixture between runs.

## Optional Apache Fineract integration

Follow the [Apache Fineract setup](https://github.com/apache/fineract) and [API reference](https://fineract.apache.org/docs/legacy/index.html). Use a disposable local 1.16.1 deployment. Seed a test office and active savings product in USD with zero fees and interest, no minimum opening balance, no holds, and no overdraft. Allow a user to create clients, manage savings accounts, submit transfers and undo savings transactions. Configure the test service's business date to match the current UTC date. Run only against a disposable loopback target. The 19-case integration creates synthetic records and assumes an empty balance for the configured product. Discard the disposable tenant or volume after use.

Copy the [example environment](environments/fineract-local.example.postman_environment.json) to `environments/fineract.local.postman_environment.json`. Fill in `productId`, `officeId`, `tenantId`, and `basicAuth` (the Base64 encoding of `username:password`, without `Basic `). Base64 is not encryption. Keep the local file untracked. Set `baseUrl` to the local service, including `/fineract-provider/api/v1`.

```sh
npx --no-install newman run collections/fineract-local.postman_collection.json -e environments/fineract.local.postman_environment.json --bail
```

## Project layout

- [`TEST_PLAN.md`](TEST_PLAN.md) describes the amount boundaries, lifecycle and permissions coverage.
- [`test-cases/`](test-cases/) holds scenario contracts and readable case matrices.
- [`test-data/`](test-data/) describes the fixture's currency and product rules.
- [`collections/`](collections/) holds generated Postman exports. Use `npm run build` after changing a scenario.
- [`reports/`](reports/) contains execution evidence. [`bug-reports/`](bug-reports/) holds the defect template.
