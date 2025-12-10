const { PrismaClient, RoleType } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("seeding database");

  // users
  await prisma.user.createMany({
    data: [
      // regulars
      { utorid: "u001", email: "u001@mail.utoronto.ca", name: "Alice", role: RoleType.regular, points: 100 },
      { utorid: "u002", email: "u002@mail.utoronto.ca", name: "Bob", role: RoleType.regular, points: 200 },
      { utorid: "u003", email: "u003@mail.utoronto.ca", name: "Cindy", role: RoleType.regular, points: 300 },
      { utorid: "u004", email: "u004@mail.utoronto.ca", name: "Daniel", role: RoleType.regular, points: 400 },
      { utorid: "u005", email: "u005@mail.utoronto.ca", name: "Emma", role: RoleType.regular, points: 500 },
      { utorid: "u006", email: "u006@mail.utoronto.ca", name: "Frank", role: RoleType.regular, points: 10000 },
      { utorid: "u007", email: "u007@mail.utoronto.ca", name: "Grace", role: RoleType.regular, points: 0 },

      // cashiers
      { utorid: "cashier1", email: "cashier1@mail.utoronto.ca", name: "Hank", role: RoleType.cashier, points: 8000 },
      { utorid: "cashier2", email: "cashier2@mail.utoronto.ca", name: "Ivan", role: RoleType.cashier, suspicious: true, points: 6000 },

      // managers
      { utorid: "manager1", email: "manager1@mail.utoronto.ca", name: "Josh", role: RoleType.manager, points: 15000 },
      { utorid: "manager2", email: "manager2@mail.utoronto.ca", name: "Kelly", role: RoleType.manager, points: 20000 },

      // superusers
      { utorid: "super1", email: "super1@mail.utoronto.ca", name: "Landon", role: RoleType.superuser, points: 100000 },
      { utorid: "super2", email: "super2@mail.utoronto.ca", name: "Morris", role: RoleType.superuser, points: 1000000 },
    ]
  });

  const allUsers = await prisma.user.findMany();
  const creatorUser = allUsers.find(u => u.role === RoleType.manager);
  const awarderUser = allUsers.find(u => u.role === RoleType.cashier);

  // promotions
  await prisma.promotion.createMany({
    data: [
      { name: "Signup Bonus", description: "Create an account and get 500 points!", type: "onetime", points: 500, startTime: new Date(), endTime: new Date(Date.now() + 86400000 * 6) },
      { name: "Referral Promotion", description: "Refer a friend and get 2000!", type: "onetime", points: 2000, startTime: new Date(), endTime: new Date(Date.now() + 86400000 * 7) },
      { name: "Promo Week Promotion", description: "This week, claim 500 points!", type: "onetime", points: 500, startTime: new Date(), endTime: new Date(Date.now() + 86400000 * 8) },
      { name: "Weekend Bonus", description: "This weekend, claim 1000 points!", type: "onetime", points: 1000, startTime: new Date(), endTime: new Date(Date.now() + 86400000 * 9) },

      { name: "2x Point Weekend", description: "This weekend, get double the points on all purchases!", type: "automatic", rate: 0.02, startTime: new Date(), endTime: new Date(Date.now() + 86400000 * 6) },
      { name: "1.5x Point Weekend", description: "50% more points this weekend!", type: "automatic", rate: 0.015, startTime: new Date(), endTime: new Date(Date.now() + 86400000 * 7) },
      { name: "Back to School Sale", description: "Back to school points!", type: "automatic", rate: 0.01, startTime: new Date(2025, 8, 1), endTime: new Date(2025, 8, 10) },
    ]
  });

  // events
  await prisma.event.createMany({
    data: [
      { name: "Job Fair", description: "Annual job fair", location: "Bahen Auditorium", startTime: new Date(), endTime: new Date(Date.now() + 86400000 * 6), capacity: 500, points: 200, published: true, createdById: creatorUser.id },
      { name: "2025 Hackathon", description: "Monthly hackathon!", location: "Myhal Centre", startTime: new Date(), endTime: new Date(Date.now() + 86400000 * 7), capacity: 100, points: 1000, published: true, createdById: creatorUser.id },
      { name: "Small Business Market", description: "Local business market", location: "Hart House", startTime: new Date(), endTime: new Date(Date.now() + 86400000 * 8), capacity: 1000, points: 400, published: true, createdById: creatorUser.id },
      { name: "Local Artists Market", description: "Support local artists!", location: "Goldring Centre", startTime: new Date(), endTime: new Date(Date.now() + 86400000 * 9), capacity: 600, points: 400, published: true, createdById: creatorUser.id },
    ]
  });

  const events = await prisma.event.findMany({ orderBy: { id: "asc" } });

  // event rsvps
  for (let u of allUsers) {
    for (let i = 0; i < events.length; i++) {
      await prisma.eventRSVP.create({
        data: {
          userId: u.id,
          eventId: events[i].id,
          attended: Math.random() > 0.5
        }
      });
    }
  }

  // event organizers
  await prisma.eventOrganizer.create({
    data: { userId: awarderUser.id, eventId: events[0].id }
  });

  for (let i = 1; i < events.length; i++) {
    await prisma.eventOrganizer.create({
      data: { userId: creatorUser.id, eventId: events[i].id }
    });
  }

  // event point awards
  await prisma.eventPointAward.create({
    data: {
      eventId: events[0].id,
      attendeeId: allUsers[0].id,
      awardedById: awarderUser.id,
      points: 100
    }
  });

  // transactions
  await prisma.transaction.createMany({
    data: [
      // purchases
      { type: "purchase", utorid: "u001", spent: 10, amount: 40, createdBy: "cashier1", remark: "purchase at lane #1" },
      { type: "purchase", utorid: "u002", spent: 23, amount: 23 * 4, createdBy: "cashier1", remark: "purchase at lane #1" },
      { type: "purchase", utorid: "u003", spent: 42, amount: 42 * 4, createdBy: "cashier1", remark: "purchase at lane #1" },
      { type: "purchase", utorid: "u004", spent: 67, amount: 67 * 4, createdBy: "cashier1", remark: "purchase at lane #1" },
      { type: "purchase", utorid: "u005", spent: 23, amount: 23 * 4, createdBy: "cashier1", remark: "purchase at lane #1" },
      { type: "purchase", utorid: "u006", spent: 19, amount: 19 * 4, createdBy: "cashier2", remark: "purchase at lane #2" },
      { type: "purchase", utorid: "u007", spent: 3, amount: 3 * 4, createdBy: "cashier2", remark: "purchase at lane #2" },
      { type: "purchase", utorid: "u007", spent: 130, amount: 130 * 4, createdBy: "cashier2", remark: "purchase at lane #2" },
      { type: "purchase", utorid: "u007", spent: 299, amount: 299 * 4, createdBy: "manager1", remark: "purchase at lane #3" },
      { type: "purchase", utorid: "u007", spent: 72, amount: 72 * 4, createdBy: "manager1", remark: "purchase at lane #3" },

      // redemptions
      { type: "redemption", utorid: "u001", amount: 400, createdBy: "cashier1", remark: "redeemed for gift card" },
      { type: "redemption", utorid: "u002", amount: 1000, createdBy: "cashier1", remark: "redeemed for gift card" },
      { type: "redemption", utorid: "u003", amount: 5000, createdBy: "manager1", remark: "redeemed for gift card" },
      { type: "redemption", utorid: "u004", amount: 1000, createdBy: "manager2", remark: "redeemed for gift card" },
      { type: "redemption", utorid: "u007", amount: 10000, createdBy: "manager2", remark: "redeemed for gift card" },

      // adjustments
      { type: "adjustment", utorid: "u001", amount: -10, relatedId: 1, createdBy: "manager1", remark: "added extra item" },
      { type: "adjustment", utorid: "u002", amount: -2, relatedId: 2, createdBy: "manager1", remark: "added extra item" },
      { type: "adjustment", utorid: "u003", amount: 3, relatedId: 3, createdBy: "manager1", remark: "didnt input 50% sale" },
      { type: "adjustment", utorid: "u004", amount: 10, relatedId: 4, createdBy: "manager2", remark: "miscalculated total" },
      { type: "adjustment", utorid: "u007", amount: -22, relatedId: 7, createdBy: "manager2", remark: "refund" },

      // events
      { type: "event", recipient: "u001", amount: 200, relatedId: 1, createdBy: "manager1", remark: "attended job fair" },
      { type: "event", recipient: "u002", amount: 1000, relatedId: 2, createdBy: "manager1", remark: "attended hackathon" },
      { type: "event", recipient: "u003", amount: 400, relatedId: 3, createdBy: "manager1", remark: "attended small business market" },
      { type: "event", recipient: "u004", amount: 400, relatedId: 3, createdBy: "manager2", remark: "attended small business market" },
      { type: "event", recipient: "u007", amount: 400, relatedId: 4, createdBy: "manager2", remark: "local small artists market" },

      // transfers
      { type: "transfer", sender: "u001", recipient: "u001", spent: 400, createdBy: "u001", remark: "poker night" },
      { type: "transfer", sender: "u003", recipient: "u006", spent: 200, createdBy: "u003", remark: "poker night" },
      { type: "transfer", sender: "u007", recipient: "u002", spent: 1000, createdBy: "u007", remark: "lost a bet" },
      { type: "transfer", sender: "u005", recipient: "u004", spent: 100, createdBy: "u005", remark: "" },
      { type: "transfer", sender: "u001", recipient: "u006", spent: 300, createdBy: "u001", remark: "" },
    ]
  });

  console.log("database seeded");
}

main()
  .catch((err) => {
    console.error("seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
