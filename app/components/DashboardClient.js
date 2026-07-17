"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardClient({ activeTenants, pendingInvoices, totalDeposit }) {
  const [activeView, setActiveView] = useState(null) // 'tenants', 'deposits', 'pending'
  const router = useRouter()

  const pendingRentTotal = pendingInvoices.reduce((sum, inv) => sum + inv.amountDue, 0)

  const handleSendStrictReminder = (inv) => {
    let phone = inv.tenant?.phone || '';
    if (!phone) {
      alert("No phone number for this tenant.");
      return;
    }
    if (!phone.startsWith('91') && !phone.startsWith('+')) {
      phone = '91' + phone;
    }
    phone = phone.replace('+', '');
    
    const text = `Hello ${inv.tenant?.name},\n\nYour rent for this month (Rs. ${inv.amountDue.toLocaleString('en-IN', {minimumFractionDigits: 2})}) is currently PENDING.\n\nPlease pay at the earliest without any ifs and buts.\n\nPay here: ${window.location.origin}/pay/${inv.id}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleMarkPaid = async (id, isVerifying = false) => {
    const msg = isVerifying 
      ? 'Are you sure you want to confirm this UPI payment and mark it as officially PAID?' 
      : 'Are you sure you want to mark this invoice as Paid in Cash?';
    if (!confirm(msg)) return;
    
    const res = await fetch(`/api/invoices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'PAID' })
    })
    
    if (res.ok) {
      router.refresh();
    } else {
      alert('Failed to mark as paid')
    }
  }

  const handleRejectPayment = async (id) => {
    if (!confirm('Are you sure you want to reject this payment claim and set it back to Pending?')) return;
    
    const res = await fetch(`/api/invoices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'PENDING' })
    })
    
    if (res.ok) {
      router.refresh();
    } else {
      alert('Failed to reject payment')
    }
  }

  return (
    <>
      <div className="dashboard-grid">
        <div 
          className="glass-panel stat-card" 
          style={{cursor: 'pointer', border: activeView === 'tenants' ? '2px solid var(--text-success)' : ''}}
          onClick={() => setActiveView(activeView === 'tenants' ? null : 'tenants')}
        >
          <div className="stat-label">Active Tenants <span style={{opacity: 0.5}}>&rarr;</span></div>
          <div className="stat-value">{activeTenants.length}</div>
        </div>
        
        <div 
          className="glass-panel stat-card"
          style={{cursor: 'pointer', border: activeView === 'deposits' ? '2px solid var(--text-success)' : ''}}
          onClick={() => setActiveView(activeView === 'deposits' ? null : 'deposits')}
        >
          <div className="stat-label">Total Deposits <span style={{opacity: 0.5}}>&rarr;</span></div>
          <div className="stat-value">₹{totalDeposit.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
        </div>
        
        <div 
          className="glass-panel stat-card"
          style={{cursor: 'pointer', border: activeView === 'pending' ? '2px solid var(--text-success)' : ''}}
          onClick={() => setActiveView(activeView === 'pending' ? null : 'pending')}
        >
          <div className="stat-label">Pending Rent <span style={{opacity: 0.5}}>&rarr;</span></div>
          <div className="stat-value" style={{color: 'var(--warning-color)'}}>₹{pendingRentTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
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
                    <td>₹{t.rentAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
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
                    <td>{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                    <td style={{fontWeight: '600'}}>₹{t.deposit.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
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
                  <th style={{textAlign: 'right'}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td>{inv.tenant.name}</td>
                    <td>{new Date(inv.dueDate).toLocaleDateString('en-IN')}</td>
                    <td style={{color: inv.status === 'VERIFYING' ? '#fbbf24' : 'var(--warning-color)', fontWeight: '600'}}>
                      ₹{inv.amountDue.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                      {inv.status === 'VERIFYING' && <div style={{fontSize: '0.75rem', marginTop: '0.2rem', color: '#fbbf24'}}>⏳ Tenant claims paid</div>}
                    </td>
                    <td style={{display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'nowrap'}}>
                      {inv.status === 'VERIFYING' ? (
                        <>
                          <button 
                            className="btn btn-success" 
                            style={{padding: '0.3rem 0.6rem', fontSize: '0.75rem', fontWeight: 'bold'}}
                            onClick={() => handleMarkPaid(inv.id, true)}
                            title="Confirm payment received"
                          >
                            Confirm
                          </button>
                          <button 
                            className="btn btn-danger" 
                            style={{padding: '0.3rem 0.6rem', fontSize: '0.75rem', fontWeight: 'bold'}}
                            onClick={() => handleRejectPayment(inv.id)}
                            title="Reject payment claim"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            className="btn btn-outline" 
                            style={{padding: '0.3rem 0.6rem', fontSize: '0.75rem', fontWeight: 'bold', borderColor: 'var(--text-success)', color: 'var(--text-success)'}}
                            onClick={() => handleMarkPaid(inv.id)}
                          >
                            Cash Received
                          </button>
                          <button 
                            className="btn btn-danger" 
                            style={{padding: '0.3rem 0.6rem', fontSize: '0.75rem', fontWeight: 'bold'}}
                            onClick={() => handleSendStrictReminder(inv)}
                          >
                            Strict Reminder
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {pendingInvoices.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center'}}>No pending invoices right now!</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className={`glass-panel ${activeView ? 'hide-on-mobile' : ''}`}>
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
