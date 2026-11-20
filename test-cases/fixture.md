# Synthetic savings and wallet contract

Fee-free USD savings, integer-cent balances, account lifecycle and linked transfer effects.

| ID | Method | Path | Scenario | Status |
| --- | --- | --- | --- | --- |
| BK-01 | `POST` | `/clients` | Reject request with no credentials | 401 |
| BK-02 | `POST` | `/clients` | Reject unexpected tenant | 400 |
| BK-03 | `POST` | `/clients` | Reject read-only customer creation | 403 |
| BK-04 | `POST` | `/clients` | Reject blank customer surname | 400 |
| BK-05 | `POST` | `/clients` | Create synthetic customer | 200 |
| BK-06 | `POST` | `/savingsaccounts` | Reject application for unknown customer | 404 |
| BK-07 | `POST` | `/savingsaccounts` | Reject application for unknown product | 400 |
| BK-08 | `POST` | `/savingsaccounts` | Create sender savings application | 200 |
| BK-09 | `POST` | `/savingsaccounts` | Create recipient savings application | 200 |
| BK-10 | `GET` | `/savingsaccounts/{{senderId}}` | New account is pending with no balance | 200 |
| BK-11 | `POST` | `/savingsaccounts/{{senderId}}?command=activate` | Activation before approval is rejected | 409 |
| BK-12 | `POST` | `/savingsaccounts/{{senderId}}/transactions?command=deposit` | Deposit to pending account is rejected | 409 |
| BK-13 | `POST` | `/savingsaccounts/{{senderId}}?command=approve` | Approve sender account | 200 |
| BK-14 | `POST` | `/savingsaccounts/{{senderId}}?command=activate` | Activate sender account | 200 |
| BK-15 | `POST` | `/savingsaccounts/{{recipientId}}?command=approve` | Approve recipient account | 200 |
| BK-16 | `POST` | `/savingsaccounts/{{recipientId}}?command=activate` | Activate recipient account | 200 |
| BK-17 | `POST` | `/savingsaccounts/{{senderId}}/transactions?command=deposit` | Reject deposit amount zero | 400 |
| BK-18 | `POST` | `/savingsaccounts/{{senderId}}/transactions?command=deposit` | Reject deposit amount negative | 400 |
| BK-19 | `POST` | `/savingsaccounts/{{senderId}}/transactions?command=deposit` | Reject deposit amount sub-cent precision | 400 |
| BK-20 | `POST` | `/savingsaccounts/{{senderId}}/transactions?command=deposit` | Reject deposit amount above maximum | 400 |
| BK-21 | `POST` | `/savingsaccounts/{{senderId}}/transactions?command=deposit` | Reject deposit amount nonnumeric | 400 |
| BK-22 | `GET` | `/savingsaccounts/{{senderId}}?associations=transactions` | Rejected deposits leave sender ledger empty | 200 |
| BK-23 | `POST` | `/savingsaccounts/{{senderId}}/transactions?command=deposit` | Accept minimum amount of one cent | 200 |
| BK-24 | `GET` | `/savingsaccounts/{{senderId}}` | Deposit floor boundary is reflected in balance | 200 |
| BK-25 | `POST` | `/savingsaccounts/{{senderId}}/transactions?command=deposit` | Deposit the starting funds | 200 |
| BK-26 | `POST` | `/savingsaccounts/{{senderId}}/transactions?command=deposit` | Duplicate deposit returns original transaction | 200 |
| BK-27 | `POST` | `/savingsaccounts/{{senderId}}/transactions?command=deposit` | Reused key with different amount is rejected in fixture | 409 |
| BK-28 | `GET` | `/savingsaccounts/{{senderId}}?associations=transactions` | Deposit replay did not alter balance or ledger count | 200 |
| BK-29 | `POST` | `/savingsaccounts/{{senderId}}/transactions?command=withdrawal` | Withdraw 300 from sender | 200 |
| BK-30 | `POST` | `/savingsaccounts/{{senderId}}/transactions?command=withdrawal` | Reject withdrawal one cent over balance | 403 |
| BK-31 | `POST` | `/savingsaccounts/{{senderId}}/transactions?command=withdrawal` | Unauthorized sender withdrawal is rejected | 403 |
| BK-32 | `GET` | `/savingsaccounts/{{senderId}}?associations=transactions` | Both failed withdrawals preserve balance and history | 200 |
| BK-33 | `POST` | `/accounttransfers` | Reject self-transfer | 400 |
| BK-34 | `POST` | `/accounttransfers` | Reject transfer to unknown account | 404 |
| BK-35 | `POST` | `/accounttransfers` | Reject transfer over available balance | 403 |
| BK-36 | `GET` | `/savingsaccounts/{{recipientId}}?associations=transactions` | Recipient unchanged after transfer rejection | 200 |
| BK-37 | `POST` | `/accounttransfers` | Transfer between active accounts | 200 |
| BK-38 | `GET` | `/savingsaccounts/{{senderId}}?associations=transactions` | Verify sender debit and transfer total | 200 |
| BK-39 | `GET` | `/savingsaccounts/{{recipientId}}?associations=transactions` | Verify recipient credit and money conservation | 200 |
| BK-40 | `POST` | `/savingsaccounts/{{senderId}}/transactions/{{withdrawId}}?command=undo` | Reverse the original withdrawal | 200 |
| BK-41 | `POST` | `/savingsaccounts/{{senderId}}/transactions/{{withdrawId}}?command=undo` | Repeat withdrawal reversal is rejected | 409 |
| BK-42 | `GET` | `/savingsaccounts/{{senderId}}?associations=transactions` | Reversal restores amount once and retains audit flag | 200 |
| BK-43 | `POST` | `/savingsaccounts/{{senderId}}?command=close` | Reject close when balance is nonzero | 409 |
| BK-44 | `POST` | `/savingsaccounts/{{senderId}}/transactions?command=withdrawal` | Withdraw exactly the remaining sender balance | 200 |
| BK-45 | `GET` | `/savingsaccounts/{{senderId}}` | Verify exact boundary leaves zero balance | 200 |
| BK-46 | `POST` | `/savingsaccounts/{{senderId}}?command=close` | Close zero-balance sender | 200 |
| BK-47 | `POST` | `/savingsaccounts/{{senderId}}/transactions?command=deposit` | Closed account rejects deposits | 409 |
| BK-48 | `GET` | `/savingsaccounts/{{senderId}}` | Closed state remains in account view | 200 |
