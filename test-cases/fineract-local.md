# Apache Fineract savings integration

Opt-in flow against a disposable loopback Fineract instance with a fee-free product and demo tenant.

| ID | Method | Path | Scenario | Status |
| --- | --- | --- | --- | --- |
| FIN-01 | `POST` | `/clients` | Create synthetic primary client | 200 |
| FIN-02 | `POST` | `/clients` | Create receiver in the configured test office | 200 |
| FIN-03 | `POST` | `/savingsaccounts` | Submit sender savings application | 200 |
| FIN-04 | `POST` | `/savingsaccounts/{{senderId}}?command=approve` | Approve sender savings application | 200 |
| FIN-05 | `POST` | `/savingsaccounts/{{senderId}}?command=activate` | Activate sender savings account | 200 |
| FIN-06 | `POST` | `/savingsaccounts` | Submit receiver savings application | 200 |
| FIN-07 | `POST` | `/savingsaccounts/{{recipientId}}?command=approve` | Approve receiver savings application | 200 |
| FIN-08 | `POST` | `/savingsaccounts/{{recipientId}}?command=activate` | Activate receiver savings account | 200 |
| FIN-09 | `POST` | `/savingsaccounts/{{senderId}}/transactions?command=deposit` | Deposit 1,000 units into sender | 200 |
| FIN-10 | `POST` | `/savingsaccounts/{{senderId}}/transactions?command=deposit` | Duplicate deposit returns original transaction | 200 |
| FIN-11 | `POST` | `/savingsaccounts/{{senderId}}/transactions?command=withdrawal` | Withdraw 300 units from sender | 200 |
| FIN-12 | `GET` | `/savingsaccounts/{{senderId}}?associations=transactions` | Confirm sender balance and both ledger entries | 200 |
| FIN-13 | `POST` | `/savingsaccounts/{{senderId}}/transactions?command=withdrawal` | Decline withdrawal one cent over balance | 403 |
| FIN-14 | `GET` | `/savingsaccounts/{{senderId}}?associations=transactions` | Sender balance unchanged after rejection | 200 |
| FIN-15 | `POST` | `/accounttransfers` | Transfer 250 units to configured recipient | 200 |
| FIN-16 | `GET` | `/savingsaccounts/{{senderId}}?associations=transactions` | Confirm sender transfer debit | 200 |
| FIN-17 | `GET` | `/savingsaccounts/{{recipientId}}?associations=transactions` | Confirm receiver transfer credit | 200 |
| FIN-18 | `POST` | `/savingsaccounts/{{senderId}}/transactions/{{liveWithdrawalId}}?command=undo` | Reverse original standalone withdrawal | 200 |
| FIN-19 | `GET` | `/savingsaccounts/{{senderId}}?associations=transactions` | Confirm reversal flag and restored sender balance | 200 |
