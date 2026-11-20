import { readFileSync } from 'node:fs';

const policy = JSON.parse(readFileSync(new URL('../test-data/savings-policy.json', import.meta.url)));
const fail = (status, code) => [status, { error: { code } }];
const ok = (data) => [200, data];
const asMoney = (minor) => minor / 100;
const readMoney = (input) => {
  const decimal = typeof input === 'number' || typeof input === 'string' ? String(input) : '';
  if (!/^\d{1,7}(?:\.\d{1,2})?$/.test(decimal)) return null;
  const [units, fraction = ''] = decimal.split('.');
  const amount = Number(units) * 100 + Number(fraction.padEnd(2, '0'));
  return amount >= policy.minimumAmountMinor && amount <= policy.maximumAmountMinor ? amount : null;
};

export function makeRouter() {
  const clients = new Map();
  const accounts = new Map();
  const replays = new Map();
  let transactionId = 0;
  let transferId = 0;

  function entry(account, type, amount, reference) {
    account.balance += type === 'deposit' ? amount : -amount;
    const transaction = { id: ++transactionId, amount: asMoney(amount), type, runningBalance: asMoney(account.balance), reversed: false };
    if (reference) transaction.transferId = reference;
    account.transactions.push(transaction);
    return transaction;
  }

  function accountView(account, includeTransactions) {
    const { id, clientId, state } = account;
    const status = { active: state === 'active', closed: state === 'closed', approved: state === 'approved', submittedAndPendingApproval: state === 'pending' };
    const response = { id, clientId, status, currency: { code: policy.currency }, summary: { accountBalance: asMoney(account.balance) } };
    if (includeTransactions) response.transactions = account.transactions;
    return ok(response);
  }

  function applyTransfer(body) {
    const sender = accounts.get(body.fromAccountId);
    const receiver = accounts.get(body.toAccountId);
    if (!sender || !receiver) return fail(404, 'ACCOUNT_NOT_FOUND');
    if (sender === receiver) return fail(400, 'SAME_ACCOUNT');
    if (sender.state !== 'active' || receiver.state !== 'active') return fail(409, 'ACCOUNT_NOT_ACTIVE');
    const amount = readMoney(body.transferAmount);
    if (amount === null) return fail(400, 'INVALID_AMOUNT');
    if (amount > sender.balance) return fail(403, 'INSUFFICIENT_FUNDS');
    const resourceId = ++transferId;
    const debit = entry(sender, 'withdrawal', amount, resourceId);
    const credit = entry(receiver, 'deposit', amount, resourceId);
    return ok({ resourceId, savingsId: sender.id, debitTransactionId: debit.id, creditTransactionId: credit.id });
  }

  function applyTransaction(account, command, body, targetId) {
    if (account.state !== 'active') return fail(409, 'ACCOUNT_NOT_ACTIVE');
    if (command === 'undo') {
      const transaction = account.transactions.find(({ id }) => id === targetId);
      if (!transaction) return fail(404, 'TRANSACTION_NOT_FOUND');
      if (transaction.reversed || transaction.transferId) return fail(409, 'REVERSAL_NOT_ALLOWED');
      const amount = readMoney(transaction.amount);
      if (transaction.type === 'deposit' && amount > account.balance) return fail(403, 'INSUFFICIENT_FUNDS');
      account.balance += transaction.type === 'deposit' ? -amount : amount;
      transaction.reversed = true;
      return ok({ resourceId: targetId, savingsId: account.id });
    }
    if (command !== 'deposit' && command !== 'withdrawal') return fail(400, 'UNKNOWN_COMMAND');
    const amount = readMoney(body.transactionAmount);
    if (amount === null) return fail(400, 'INVALID_AMOUNT');
    if (command === 'withdrawal' && amount > account.balance) return fail(403, 'INSUFFICIENT_FUNDS');
    return ok({ resourceId: entry(account, command, amount).id, savingsId: account.id });
  }

  function replay(key, signature, apply) {
    if (!key) return apply();
    const cached = replays.get(key);
    if (cached) return cached.signature === signature ? cached.result : fail(409, 'KEY_REUSED');
    const result = apply();
    if (result[0] === 200) replays.set(key, { signature, result });
    return result;
  }

  return ({ method, path, query, body, headers }) => {
    if (path === '/health') return ok({ ready: true });
    const auth = headers.authorization;
    if (auth !== 'Bearer fixture-bank-writer' && auth !== 'Bearer fixture-bank-reader') return fail(401, 'AUTH_REQUIRED');
    if (headers['fineract-platform-tenantid'] !== policy.tenant) return fail(400, 'UNKNOWN_TENANT');
    if (method !== 'GET' && auth === 'Bearer fixture-bank-reader') return fail(403, 'READ_ONLY_ROLE');
    if (path === '/clients' && method === 'POST') {
      if (typeof body.firstname !== 'string' || !body.firstname.trim() || typeof body.lastname !== 'string' || !body.lastname.trim()) return fail(400, 'INVALID_NAME');
      const id = clients.size + 1;
      clients.set(id, { id, firstname: body.firstname, lastname: body.lastname });
      return ok({ resourceId: id, clientId: id });
    }
    if (path === '/savingsaccounts' && method === 'POST') {
      if (!clients.has(body.clientId)) return fail(404, 'CLIENT_NOT_FOUND');
      if (body.productId !== policy.productId) return fail(400, 'PRODUCT_NOT_FOUND');
      const id = accounts.size + 1;
      accounts.set(id, { id, clientId: body.clientId, state: 'pending', balance: 0, transactions: [] });
      return ok({ resourceId: id, clientId: body.clientId });
    }
    const command = query.get('command');
    const key = headers['idempotency-key'];
    const signature = `${path}?${query.toString()} ${JSON.stringify(body)}`;
    if (path === '/accounttransfers' && method === 'POST') return replay(key, signature, () => applyTransfer(body));
    const match = path.match(/^\/savingsaccounts\/(\d+)(?:\/(transactions)(?:\/(\d+))?)?$/);
    if (!match) return fail(404, 'ROUTE_NOT_FOUND');
    const account = accounts.get(Number(match[1]));
    if (!account) return fail(404, 'ACCOUNT_NOT_FOUND');
    if (method === 'GET' && !match[2]) return accountView(account, query.get('associations') === 'transactions');
    if (method !== 'POST') return fail(404, 'ROUTE_NOT_FOUND');
    if (match[2]) return replay(key, signature, () => applyTransaction(account, command, body, Number(match[3])));
    if (command === 'approve' && account.state === 'pending') account.state = 'approved';
    else if (command === 'activate' && account.state === 'approved') account.state = 'active';
    else if (command === 'close' && account.state === 'active' && account.balance === 0) account.state = 'closed';
    else return fail(409, 'INVALID_TRANSITION');
    return ok({ resourceId: account.id, savingsId: account.id });
  };
}
