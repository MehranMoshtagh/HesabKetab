import { prisma } from "./prisma";
import { simplifyDebts, computeNetBalances } from "./simplify-debts";

interface PairBalance {
  userId: string;
  name: string;
  avatar: string | null;
  amount: number; // positive = they owe you, negative = you owe them
}

/**
 * Compute all balances for a user across all non-deleted expenses.
 */
export async function getUserBalances(userId: string): Promise<{
  totalOwed: number;
  totalOwing: number;
  netBalance: number;
  byPerson: PairBalance[];
}> {
  // Get all non-deleted expenses where the user is a payer or sharer
  const expenses = await prisma.expense.findMany({
    where: {
      deletedAt: null,
      OR: [
        { payers: { some: { userId } } },
        { shares: { some: { userId } } },
      ],
    },
    include: {
      payers: true,
      shares: true,
    },
  });

  // Build pairwise balance map: otherUserId -> net amount (positive = they owe user)
  const balanceMap = new Map<string, number>();

  for (const exp of expenses) {
    const totalPaid = exp.payers.reduce((s, p) => s + Number(p.amount), 0);
    if (totalPaid === 0) continue;

    for (const payer of exp.payers) {
      for (const share of exp.shares) {
        if (payer.userId === share.userId) continue;

        const owedAmount = (Number(payer.amount) / totalPaid) * Number(share.amount);
        if (owedAmount === 0) continue;

        // share.userId owes payer.userId this amount
        if (payer.userId === userId) {
          // Someone owes me
          const cur = balanceMap.get(share.userId) ?? 0;
          balanceMap.set(share.userId, cur + owedAmount);
        } else if (share.userId === userId) {
          // I owe someone
          const cur = balanceMap.get(payer.userId) ?? 0;
          balanceMap.set(payer.userId, cur - owedAmount);
        }
      }
    }
  }

  // Fetch user info for all counterparties
  const otherUserIds = [...balanceMap.keys()];
  const users = otherUserIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: otherUserIds } },
        select: { id: true, name: true, avatar: true },
      })
    : [];

  const userMap = new Map(users.map((u) => [u.id, u]));

  let totalOwed = 0;
  let totalOwing = 0;
  const byPerson: PairBalance[] = [];

  for (const [otherId, amount] of balanceMap) {
    const rounded = Math.round(amount * 100) / 100;
    if (Math.abs(rounded) < 0.01) continue;

    const user = userMap.get(otherId);
    byPerson.push({
      userId: otherId,
      name: user?.name ?? "Unknown",
      avatar: user?.avatar ?? null,
      amount: rounded,
    });

    if (rounded > 0) totalOwed += rounded;
    else totalOwing += Math.abs(rounded);
  }

  // Sort: largest amounts first
  byPerson.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

  return {
    totalOwed: Math.round(totalOwed * 100) / 100,
    totalOwing: Math.round(totalOwing * 100) / 100,
    netBalance: Math.round((totalOwed - totalOwing) * 100) / 100,
    byPerson,
  };
}

/**
 * Compute balance between two specific users.
 */
export async function getFriendBalance(
  userId: string,
  friendId: string
): Promise<number> {
  const expenses = await prisma.expense.findMany({
    where: {
      deletedAt: null,
      AND: [
        { OR: [{ payers: { some: { userId } } }, { shares: { some: { userId } } }] },
        { OR: [{ payers: { some: { userId: friendId } } }, { shares: { some: { userId: friendId } } }] },
      ],
    },
    include: { payers: true, shares: true },
  });

  let balance = 0;

  for (const exp of expenses) {
    const totalPaid = exp.payers.reduce((s, p) => s + Number(p.amount), 0);
    if (totalPaid === 0) continue;

    for (const payer of exp.payers) {
      for (const share of exp.shares) {
        if (payer.userId === share.userId) continue;
        const owedAmount = (Number(payer.amount) / totalPaid) * Number(share.amount);

        if (payer.userId === userId && share.userId === friendId) {
          balance += owedAmount; // friend owes me
        } else if (payer.userId === friendId && share.userId === userId) {
          balance -= owedAmount; // I owe friend
        }
      }
    }
  }

  return Math.round(balance * 100) / 100;
}

/**
 * Compute group balances for all members, optionally simplified.
 */
export async function getGroupBalances(groupId: string): Promise<{
  members: { userId: string; name: string; avatar: string | null; balance: number }[];
  simplified: { from: string; fromName: string; to: string; toName: string; amount: number }[];
  simplifyEnabled: boolean;
}> {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
      },
    },
  });

  if (!group) return { members: [], simplified: [], simplifyEnabled: false };

  const expenses = await prisma.expense.findMany({
    where: { groupId, deletedAt: null },
    include: { payers: true, shares: true },
  });

  // Compute pairwise balances within the group
  const pairwise = new Map<string, number>();

  for (const exp of expenses) {
    const totalPaid = exp.payers.reduce((s, p) => s + Number(p.amount), 0);
    if (totalPaid === 0) continue;

    for (const payer of exp.payers) {
      for (const share of exp.shares) {
        if (payer.userId === share.userId) continue;
        const owedAmount = (Number(payer.amount) / totalPaid) * Number(share.amount);
        if (owedAmount === 0) continue;

        const [id1, id2] =
          payer.userId < share.userId
            ? [payer.userId, share.userId]
            : [share.userId, payer.userId];
        const key = `${id1}->${id2}`;
        const cur = pairwise.get(key) ?? 0;

        if (payer.userId === id1) {
          pairwise.set(key, cur + owedAmount);
        } else {
          pairwise.set(key, cur - owedAmount);
        }
      }
    }
  }

  // Compute net balance per member
  const netBalances = computeNetBalances(pairwise);
  const userMap = new Map(
    group.members.map((m) => [m.userId, m.user])
  );

  const members = group.members.map((m) => ({
    userId: m.userId,
    name: m.user.name,
    avatar: m.user.avatar,
    balance: Math.round((netBalances.get(m.userId) ?? 0) * 100) / 100,
  }));

  // Simplify debts
  const simplified = group.simplifyDebts
    ? simplifyDebts(netBalances).map((d) => ({
        from: d.from,
        fromName: userMap.get(d.from)?.name ?? "Unknown",
        to: d.to,
        toName: userMap.get(d.to)?.name ?? "Unknown",
        amount: d.amount,
      }))
    : [];

  return { members, simplified, simplifyEnabled: group.simplifyDebts };
}
