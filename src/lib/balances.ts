/**
 * Calculate net balances between pairs of users from expense data.
 * Returns a map of "userId1->userId2" => amount (positive means userId1 is owed by userId2).
 */
export type BalanceMap = Map<string, number>;

interface ExpenseData {
  payers: { userId: string; amount: number }[];
  shares: { userId: string; amount: number }[];
}

/**
 * Compute pairwise balances from a list of expenses.
 * For each expense, each payer pays on behalf of each sharer proportionally.
 */
export function computePairwiseBalances(expenses: ExpenseData[]): BalanceMap {
  const balances: BalanceMap = new Map();

  for (const expense of expenses) {
    const totalPaid = expense.payers.reduce((sum, p) => sum + p.amount, 0);
    if (totalPaid === 0) continue;

    for (const payer of expense.payers) {
      for (const share of expense.shares) {
        if (payer.userId === share.userId) continue;

        // payer paid (payer.amount / totalPaid) fraction of share.amount for share.userId
        const owedAmount = (payer.amount / totalPaid) * share.amount;
        if (owedAmount === 0) continue;

        // Normalize key so smaller ID is always first
        const [id1, id2] =
          payer.userId < share.userId
            ? [payer.userId, share.userId]
            : [share.userId, payer.userId];

        const key = `${id1}->${id2}`;
        const current = balances.get(key) ?? 0;

        // Positive means id1 is owed by id2
        if (payer.userId === id1) {
          balances.set(key, current + owedAmount);
        } else {
          balances.set(key, current - owedAmount);
        }
      }
    }
  }

  return balances;
}

/**
 * Get the balance between two specific users.
 * Returns positive if user1 is owed by user2, negative if user1 owes user2.
 */
export function getBalanceBetween(
  balances: BalanceMap,
  user1Id: string,
  user2Id: string
): number {
  const [id1, id2] =
    user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id];

  const key = `${id1}->${id2}`;
  const amount = balances.get(key) ?? 0;

  return user1Id === id1 ? amount : -amount;
}

/**
 * Get total amounts a user owes and is owed across all pairs.
 */
export function getUserTotals(
  balances: BalanceMap,
  userId: string
): { totalOwed: number; totalOwing: number; netBalance: number } {
  let totalOwed = 0;
  let totalOwing = 0;

  for (const [key, amount] of balances) {
    const [id1, id2] = key.split("->");
    if (id1 !== userId && id2 !== userId) continue;

    const userBalance = id1 === userId ? amount : -amount;

    if (userBalance > 0) {
      totalOwed += userBalance;
    } else {
      totalOwing += Math.abs(userBalance);
    }
  }

  return {
    totalOwed,
    totalOwing,
    netBalance: totalOwed - totalOwing,
  };
}
