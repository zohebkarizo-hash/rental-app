import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Zoheb',
      phone: '919854469256',
      room: 'A1',
      deposit: 10000,
      rentAmount: 4500,
    }
  })

  await prisma.invoice.create({
    data: {
      tenantId: tenant.id,
      amountDue: 4500,
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      status: 'PENDING',
    }
  })

  console.log("Database seeded successfully with Tenant Zoheb!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
