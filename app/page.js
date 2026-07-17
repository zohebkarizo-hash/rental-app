export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import DashboardClient from './components/DashboardClient'

export default async function Dashboard() {
  // Fetch full lists for the interactive dashboard
  const activeTenants = await prisma.tenant.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  })
  
  const pendingInvoices = await prisma.invoice.findMany({
    where: { 
      status: { in: ['PENDING', 'VERIFYING'] } 
    },
    include: { tenant: true },
    orderBy: { dueDate: 'asc' }
  })
  
  const totalDepositObj = await prisma.tenant.aggregate({
    _sum: { deposit: true },
    where: { isActive: true }
  })
  
  const totalDeposit = totalDepositObj._sum.deposit || 0;

  return (
    <main className="container animate-fade-in">
      <h1>Dashboard:</h1>
      <DashboardClient 
        activeTenants={activeTenants} 
        pendingInvoices={pendingInvoices} 
        totalDeposit={totalDeposit} 
      />
    </main>
  )
}
