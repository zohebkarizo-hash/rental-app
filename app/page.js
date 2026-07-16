export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function Dashboard() {
  const tenantsCount = await prisma.tenant.count()
  
  const totalDepositObj = await prisma.tenant.aggregate({
    _sum: { deposit: true }
  })
  
  const pendingInvoices = await prisma.invoice.aggregate({
    _sum: { amountDue: true },
    where: { status: 'PENDING' }
  })
  
  const totalDeposit = totalDepositObj._sum.deposit || 0;
  const pendingRent = pendingInvoices._sum.amountDue || 0;

  return (
    <main className="container animate-fade-in">
      <h1>Dashboard Overview</h1>
      
      <div className="dashboard-grid">
        <div className="glass-panel stat-card">
          <div className="stat-label">Active Tenants</div>
          <div className="stat-value">{tenantsCount}</div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-label">Total Deposits Held</div>
          <div className="stat-value">₹{totalDeposit.toLocaleString()}</div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-label">Pending Rent</div>
          <div className="stat-value" style={{color: 'var(--warning-color)'}}>₹{pendingRent.toLocaleString()}</div>
        </div>
      </div>

      <div className="glass-panel">
        <h2>Quick Actions</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: '1.5rem'}}>Manage your properties and generate rent invoices automatically.</p>
        <div style={{display: 'flex', gap: '1rem'}}>
          <Link href="/tenants" className="btn">
            Manage Tenants
          </Link>
          <Link href="/invoices" className="btn btn-success">
            Generate Invoices
          </Link>
        </div>
      </div>
    </main>
  )
}
