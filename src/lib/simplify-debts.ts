/**
 * Simplify debts algorithm.
 * Given net balances for each person in a group, minimize the number of transactions needed.
 *
 * Algorithm:
 * 1. Calculate net balance for each person (total owed - total owing)
 * 2. Separate into creditors (positive) and debtors (negative)
 * 3. Greedily match largest debtor with largest creditor
 * 4. Settle the minimum of their absolute balances
 * 5. Repeat until all settled
 */

export interface SimplifiedDebt {
  from: string; // userId who pays
  to: string; // userId who receives
  amount: number;
}

/**
 * Simplify debts given a map of userId -> net balance.
 * Positive balance = person is owed money (creditor).
 * Negative balance = person owes money (debtor).
 */
export function simplifyDebts(
  netBalances: Map<string, number>
): SimplifiedDebt[] {
  const creditors: { userId: string; amount: number }[] = [];
  const debtors: { userId: string; amount: number }[] = [];

  for (const [userId, balance] of netBalances) {
    const rounded = Math.round(balance * 100) / 100;
    if (rounded > 0.01) {
      creditors.push({ userId, amount: rounded });
    } else if (rounded < -0.01) {
      debtors.push({ userId, amount: Math.abs(rounded) });
    }
  }

  // Sort descending by amount
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions: SimplifiedDebt[] = [];
  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor = debtors[di];
    const settleAmount = Math.min(creditor.amount, debtor.amount);

    if (settleAmount > 0.01) {
      transactions.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: Math.round(settleAmount * 100) / 100,
      });
    }

    creditor.amount -= settleAmount;
    debtor.amount -= settleAmount;

    if (creditor.amount < 0.01) ci++;
    if (debtor.amount < 0.01) di++;
  }

  return transactions;
}

/**
 * Helper: compute net balances per user from pairwise balances.
 * Input: Map of "id1->id2" => amount (positive = id1 is owed by id2)
 */
export function computeNetBalances(
  pairwiseBalances: Map<string, number>
): Map<string, number> {
  const net = new Map<string, number>();

  for (const [key, amount] of pairwiseBalances) {
    const [id1, id2] = key.split("->");
    net.set(id1, (net.get(id1) ?? 0) + amount);
    net.set(id2, (net.get(id2) ?? 0) - amount);
  }

  return net;
}
