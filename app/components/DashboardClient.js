"use client"
import { useState } from 'react'
import Link from 'next/link'

export default function DashboardClient({ activeTenants, pendingInvoices, totalDeposit }) {
  const [activeView, setActiveView] = useState(null) // 'tenants', 'deposits', 'pending'

  const pendingRentTotal = pendingInvoices.reduce((sum, inv) => sum + inv.amountDue, 0)

  return (
    <>
      <div className="dashboard-grid">
        <div 
          className="glass-panel stat-card" 
          style={{cursor: 'pointer', border: activeView === 'tenants' ? '2px solid var(--text-success)' : ''}}
          onClick={() => setActiveView(activeView === 'tenants' ? null : 'tenants')}
        >
          <div className="stat-label">Active Tenants</div>
          <div className="stat-value">{activeTenants.length}</div>
          <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem'}}>Click to view list ⬇️</div>
        </div>
        
        <div 
          className="glass-panel stat-card"
          style={{cursor: 'pointer', border: activeView === 'deposits' ? '2px solid var(--text-success)' : ''}}
          onClick={() => setActiveView(activeView === 'deposits' ? null : 'deposits')}
        >
          <div className="stat-label">Total Deposits Held</div>
          <div className="stat-value">₹{totalDeposit.toLocaleString()}</div>
          <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem'}}>Click to view list ⬇️</div>
        </div>
        
        <div 
          className="glass-panel stat-card"
          style={{cursor: 'pointer', border: activeView === 'pending' ? '2px solid var(--text-success)' : ''}}
          onClick={() => setActiveView(activeView === 'pending' ? null : 'pending')}
        >
          <div className="stat-label">Pending Rent</div>
          <div className="stat-value" style={{color: 'var(--warning-color)'}}>₹{pendingRentTotal.toLocaleString()}</div>
          <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem'}}>Click to view list ⬇️</div>
        </div>
      </div>

      {/* Detailed Drill-down Views */}
      {activeView === 'tenants' && (
        <div className="glass-panel animate-fade-in" style={{marginBottom: '2rem'}}>
          <h2>Active Tenants List</h2>
          <div style={{overflowX: 'auto'}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>House/Unit</th>
                  <th>Name</th>
                  <th>WhatsApp Phone</th>
                  <th>Rent Amount</th>
                </tr>
              </thead>
              <tbody>
                {activeTenants.map(t => (
                  <tr key={t.id}>
                    <td>House {t.houseNo || '-'}, Unit {t.unitNo || '-'}</td>
                    <td>{t.name}</td>
                    <td>+{t.phone}</td>
                    <td>₹{t.rentAmount}</td>
                  </tr>
                ))}
                {activeTenants.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center'}}>No active tenants found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeView === 'deposits' && (
        <div className="glass-panel animate-fade-in" style={{marginBottom: '2rem'}}>
          <h2>Deposits Breakdown</h2>
          <div style={{overflowX: 'auto'}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>House/Unit</th>
                  <th>Date of Deposit</th>
                  <th>Deposit Amount</th>
                </tr>
              </thead>
              <tbody>
                {activeTenants.map(t => (
                  <tr key={t.id}>
                    <td>{t.name}</td>
                    <td>House {t.houseNo || '-'}, Unit {t.unitNo || '-'}</td>
                    <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td style={{fontWeight: '600'}}>₹{t.deposit.toLocaleString()}</td>
                  </tr>
                ))}
                {activeTenants.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center'}}>No active deposits found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeView === 'pending' && (
        <div className="glass-panel animate-fade-in" style={{marginBottom: '2rem'}}>
          <h2>Pending Rent Invoices</h2>
          <div style={{overflowX: 'auto'}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tenant Name</th>
                  <th>Due Date</th>
                  <th>Amount Owed</th>
                </tr>
              </thead>
              <tbody>
                {pendingInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td>{inv.tenant.name}</td>
                    <td>{new Date(inv.dueDate).toLocaleDateString()}</td>
                    <td style={{color: 'var(--warning-color)', fontWeight: '600'}}>₹{inv.amountDue.toLocaleString()}</td>
                  </tr>
                ))}
                {pendingInvoices.length === 0 && <tr><td colSpan="3" style={{textAlign: 'center'}}>No pending invoices right now!</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="glass-panel">
        <h2>Quick Actions</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: '1.5rem'}}>Manage your properties and generate rent invoices automatically.</p>
        <div style={{display: 'flex', gap: '1rem'}}>
          <Link href="/tenants" className="btn">
            Manage Tenants
          </Link>
          <Link href="/invoices" className="btn">
            Generate Invoices
          </Link>
        </div>
      </div>
    </>
  )
}
