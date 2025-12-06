const { PrismaClient, RoleType, TransactionType, PromotionType } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // === USERS ===
  const users = await prisma.user.createMany({
    data: [
      { utorid: "u001", email: "u001@demo.com", name: "Alice", role: RoleType.regular },
      { utorid: "u002", email: "u002@demo.com", name: "Bob", role: RoleType.regular },
      { utorid: "u003", email: "u003@demo.com", name: "Cindy", role: RoleType.regular },
      { utorid: "u004", email: "u004@demo.com", name: "Daniel", role: RoleType.regular },
      { utorid: "u005", email: "u005@demo.com", name: "Emma", role: RoleType.regular },
      // Special roles
      { utorid: "cashier1", email: "cashier@demo.com", name: "Cashier", role: RoleType.cashier },
      { utorid: "manager1", email: "manager@demo.com", name: "Manager", role: RoleType.manager },
      { utorid: "super1",  email: "super@demo.com", name: "Super Admin", role: RoleType.superuser },
      // Extra users for events
      { utorid: "u006", email: "u006@demo.com", name: "Frank", role: RoleType.regular },
      { utorid: "u007", email: "u007@demo.com", name: "Grace", role: RoleType.regular },
    ]
  })

  const allUsers = await prisma.user.findMany()
  const creatorUser = allUsers.find(u => u.role === "manager")
  const awarderUser = allUsers.find(u => u.role === "cashier")

  // === PROMOTIONS ===
  const promotions = []
  for (let i = 1; i <= 5; i++) {
    promotions.push(await prisma.promotion.create({
      data: {
        name: `Promo ${i}`,
        description: `Description for promo ${i}`,
        type: i % 2 === 0 ? PromotionType.automatic : PromotionType.onetime,
        startTime: new Date(),
        endTime: new Date(Date.now() + 86400000 * (5 + i)),
        rate: i % 2 === 0 ? 0.1 + i * 0.01 : null,
        points: i % 2 === 0 ? null : 50 + 10 * i,
      }
    }))
  }

  // === EVENTS ===
  const events = []
  for (let i = 1; i <= 5; i++) {
    events.push(await prisma.event.create({
      data: {
        name: `Campus Event ${i}`,
        description: "Sample event for testing.",
        startTime: new Date(Date.now() + 3600000 * i),
        endTime: new Date(Date.now() + 3600000 * (i + 1)),
        capacity: 100,
        points: 10 * i,
        published: true,
        createdById: creatorUser.id
      }
    }))
  }

  // === EVENT RSVPs (everyone RSVPs to first event) ===
  for (let u of allUsers) {
    await prisma.eventRSVP.create({
      data: {
        userId: u.id,
        eventId: events[0].id,
        attended: Math.random() > 0.5
      }
    })
  }

  // === EVENT ORGANIZERS
  await prisma.eventOrganizer.create({
    data: {
      userId: awarderUser.id,
      eventId: events[0].id
    }
  })

  // === EVENT POINT AWARDS
  await prisma.eventPointAward.create({
    data: {
      eventId: events[0].id,
      attendeeId: allUsers[0].id,
      awardedById: awarderUser.id,
      points: 100
    }
  })

  // === TRANSACTIONS ===
  const transactionData = []

  // Helper to add multiple txs
  function add(type, count, extra = {}) {
    for (let i = 0; i < count; i++) {
      transactionData.push({
        type,
        utorid: "u001",
        spent: 10 + i,
        createdBy: "manager1",
        remark: `${type} transaction #${i}`,
        ...extra
      })
    }
  }

  add(TransactionType.purchase, 6)
  add(TransactionType.redemption, 6)
  add(TransactionType.adjustment, 6)
  add(TransactionType.event, 6, { eventId: events[0].id })
  add(TransactionType.transfer, 6, { sender: "u001", recipient: "u002" })

  await prisma.transaction.createMany({ data: transactionData })

  console.log("🌱 Seeding complete.")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
