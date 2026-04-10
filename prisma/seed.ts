import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.expenseShare.deleteMany();
  await prisma.expensePayer.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 12);

  // Create users
  const alice = await prisma.user.create({
    data: {
      name: "Alice Johnson",
      email: "alice@example.com",
      password,
      defaultCurrency: "USD",
      language: "en",
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: "Bob Smith",
      email: "bob@example.com",
      password,
      defaultCurrency: "USD",
      language: "en",
    },
  });

  const sara = await prisma.user.create({
    data: {
      name: "سارا احمدی",
      email: "sara@example.com",
      password,
      defaultCurrency: "IRR",
      language: "fa",
    },
  });

  const ali = await prisma.user.create({
    data: {
      name: "علی رضایی",
      email: "ali@example.com",
      password,
      defaultCurrency: "USD",
      language: "fa",
    },
  });

  console.log("✓ Users created");

  // Create friendships
  await prisma.friendship.createMany({
    data: [
      { user1Id: alice.id, user2Id: bob.id },
      { user1Id: alice.id, user2Id: sara.id },
      { user1Id: alice.id, user2Id: ali.id },
      { user1Id: bob.id, user2Id: sara.id },
      { user1Id: bob.id, user2Id: ali.id },
      { user1Id: ali.id, user2Id: sara.id },
    ],
  });

  console.log("✓ Friendships created");

  // Create groups
  const tripGroup = await prisma.group.create({
    data: {
      name: "Paris Trip 2026",
      type: "TRIP",
      simplifyDebts: true,
      createdById: alice.id,
      members: {
        create: [
          { userId: alice.id, role: "ADMIN" },
          { userId: bob.id, role: "MEMBER" },
          { userId: sara.id, role: "MEMBER" },
        ],
      },
    },
  });

  const homeGroup = await prisma.group.create({
    data: {
      name: "Apartment 4B",
      type: "HOME",
      simplifyDebts: true,
      createdById: bob.id,
      members: {
        create: [
          { userId: bob.id, role: "ADMIN" },
          { userId: alice.id, role: "MEMBER" },
          { userId: ali.id, role: "MEMBER" },
        ],
      },
    },
  });

  console.log("✓ Groups created");

  // Helper to create expenses
  const createExpense = async (data: {
    description: string;
    amount: number;
    currency?: string;
    category: string;
    date: Date;
    groupId?: string;
    createdById: string;
    payers: { userId: string; amount: number }[];
    shares: { userId: string; amount: number }[];
    isPayment?: boolean;
  }) => {
    return prisma.expense.create({
      data: {
        description: data.description,
        amount: new Prisma.Decimal(data.amount.toFixed(2)),
        currency: data.currency ?? "USD",
        category: data.category,
        date: data.date,
        groupId: data.groupId,
        createdById: data.createdById,
        isPayment: data.isPayment ?? false,
        splitType: "EQUAL",
        payers: {
          create: data.payers.map((p) => ({
            userId: p.userId,
            amount: new Prisma.Decimal(p.amount.toFixed(2)),
          })),
        },
        shares: {
          create: data.shares.map((s) => ({
            userId: s.userId,
            amount: new Prisma.Decimal(s.amount.toFixed(2)),
          })),
        },
      },
    });
  };

  // Trip group expenses
  await createExpense({
    description: "Hotel booking",
    amount: 450,
    category: "hotel",
    date: new Date("2026-03-15"),
    groupId: tripGroup.id,
    createdById: alice.id,
    payers: [{ userId: alice.id, amount: 450 }],
    shares: [
      { userId: alice.id, amount: 150 },
      { userId: bob.id, amount: 150 },
      { userId: sara.id, amount: 150 },
    ],
  });

  await createExpense({
    description: "Dinner at Le Petit Bistro",
    amount: 120,
    category: "dining-out",
    date: new Date("2026-03-16"),
    groupId: tripGroup.id,
    createdById: bob.id,
    payers: [{ userId: bob.id, amount: 120 }],
    shares: [
      { userId: alice.id, amount: 40 },
      { userId: bob.id, amount: 40 },
      { userId: sara.id, amount: 40 },
    ],
  });

  await createExpense({
    description: "Metro tickets",
    amount: 30,
    category: "bus-train",
    date: new Date("2026-03-16"),
    groupId: tripGroup.id,
    createdById: sara.id,
    payers: [{ userId: sara.id, amount: 30 }],
    shares: [
      { userId: alice.id, amount: 10 },
      { userId: bob.id, amount: 10 },
      { userId: sara.id, amount: 10 },
    ],
  });

  await createExpense({
    description: "Museum tickets",
    amount: 60,
    category: "other-entertainment",
    date: new Date("2026-03-17"),
    groupId: tripGroup.id,
    createdById: alice.id,
    payers: [{ userId: alice.id, amount: 60 }],
    shares: [
      { userId: alice.id, amount: 20 },
      { userId: bob.id, amount: 20 },
      { userId: sara.id, amount: 20 },
    ],
  });

  // Home group expenses
  await createExpense({
    description: "March Rent",
    amount: 3000,
    category: "rent",
    date: new Date("2026-03-01"),
    groupId: homeGroup.id,
    createdById: bob.id,
    payers: [{ userId: bob.id, amount: 3000 }],
    shares: [
      { userId: bob.id, amount: 1000 },
      { userId: alice.id, amount: 1000 },
      { userId: ali.id, amount: 1000 },
    ],
  });

  await createExpense({
    description: "Groceries - Whole Foods",
    amount: 85.5,
    category: "groceries",
    date: new Date("2026-03-10"),
    groupId: homeGroup.id,
    createdById: alice.id,
    payers: [{ userId: alice.id, amount: 85.5 }],
    shares: [
      { userId: bob.id, amount: 28.5 },
      { userId: alice.id, amount: 28.5 },
      { userId: ali.id, amount: 28.5 },
    ],
  });

  await createExpense({
    description: "Internet bill",
    amount: 75,
    category: "tv-phone-internet",
    date: new Date("2026-03-05"),
    groupId: homeGroup.id,
    createdById: ali.id,
    payers: [{ userId: ali.id, amount: 75 }],
    shares: [
      { userId: bob.id, amount: 25 },
      { userId: alice.id, amount: 25 },
      { userId: ali.id, amount: 25 },
    ],
  });

  // Non-group expenses (between friends)
  await createExpense({
    description: "Coffee at Starbucks",
    amount: 12.5,
    category: "dining-out",
    date: new Date("2026-03-20"),
    createdById: alice.id,
    payers: [{ userId: alice.id, amount: 12.5 }],
    shares: [
      { userId: alice.id, amount: 6.25 },
      { userId: bob.id, amount: 6.25 },
    ],
  });

  await createExpense({
    description: "Spotify Family Plan",
    amount: 16.99,
    category: "music",
    date: new Date("2026-03-01"),
    createdById: bob.id,
    payers: [{ userId: bob.id, amount: 16.99 }],
    shares: [
      { userId: alice.id, amount: 8.5 },
      { userId: bob.id, amount: 8.49 },
    ],
  });

  await createExpense({
    description: "Taxi to airport",
    amount: 45,
    category: "taxi-ride-share",
    date: new Date("2026-03-14"),
    createdById: sara.id,
    payers: [{ userId: sara.id, amount: 45 }],
    shares: [
      { userId: alice.id, amount: 22.5 },
      { userId: sara.id, amount: 22.5 },
    ],
  });

  // A payment (settle up)
  await createExpense({
    description: "Payment: Alice Johnson → Bob Smith",
    amount: 50,
    category: "general",
    date: new Date("2026-03-22"),
    createdById: alice.id,
    isPayment: true,
    payers: [{ userId: alice.id, amount: 50 }],
    shares: [{ userId: bob.id, amount: 50 }],
  });

  console.log("✓ Expenses created");

  // Create some comments
  const hotelExpense = await prisma.expense.findFirst({
    where: { description: "Hotel booking" },
  });

  if (hotelExpense) {
    await prisma.comment.createMany({
      data: [
        {
          expenseId: hotelExpense.id,
          userId: bob.id,
          content: "Great hotel choice! The view was amazing.",
        },
        {
          expenseId: hotelExpense.id,
          userId: sara.id,
          content: "هتل عالی بود! ممنون 🙏",
        },
      ],
    });
  }

  console.log("✓ Comments created");

  // Create activities
  await prisma.activity.createMany({
    data: [
      {
        userId: alice.id,
        type: "GROUP_CREATED",
        groupId: tripGroup.id,
        metadata: { groupName: "Paris Trip 2026" },
      },
      {
        userId: bob.id,
        type: "GROUP_CREATED",
        groupId: homeGroup.id,
        metadata: { groupName: "Apartment 4B" },
      },
    ],
  });

  console.log("✓ Activities created");
  console.log("\n🎉 Seed complete!");
  console.log("\nTest accounts (password: password123):");
  console.log("  alice@example.com");
  console.log("  bob@example.com");
  console.log("  sara@example.com (Persian)");
  console.log("  ali@example.com (Persian)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
