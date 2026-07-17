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

  const [showCashModal, setShowCashModal] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group pending invoices by tenant for the modal
  const pendingByTenant = pendingInvoices.reduce((acc, inv) => {
    if (!acc[inv.tenantId]) {
      acc[inv.tenantId] = { tenant: inv.tenant, invoices: [] };
    }
    acc[inv.tenantId].invoices.push(inv);
    return acc;
  }, {});
  const tenantsWithPending = Object.values(pendingByTenant);

  const handleTenantSelect = (e) => {
    const tid = parseInt(e.target.value);
    setSelectedTenantId(tid);
    if (tid && pendingByTenant[tid]) {
      // Auto-select the oldest invoice (they are sorted by dueDate asc)
      setSelectedInvoiceId(pendingByTenant[tid].invoices[0].id);
    } else {
      setSelectedInvoiceId('');
    }
  };

  const handleGlobalMarkPaid = async (e) => {
    e.preventDefault();
    if (!selectedInvoiceId) return;
    
    setIsSubmitting(true);
    const res = await fetch(`/api/invoices/${selectedInvoiceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'PAID' })
    });
    
    setIsSubmitting(false);
    if (res.ok) {
      setShowCashModal(false);
      setSelectedTenantId('');
      setSelectedInvoiceId('');
      router.refresh();
    } else {
      alert('Failed to mark as paid');
    }
  };

  return (
    <>


      {showCashModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{width: '100%', maxWidth: '400px'}}>
            <h2 style={{color: '#fff', marginBottom: '1rem'}}>Record Cash Payment</h2>
            
            {tenantsWithPending.length === 0 ? (
              <p style={{color: 'var(--text-success)'}}>No pending invoices exist!</p>
            ) : (
              <form onSubmit={handleGlobalMarkPaid}>
                <div className="form-group full-width">
                  <label>Select Tenant</label>
                  <select 
                    className="form-control" 
                    value={selectedTenantId} 
                    onChange={handleTenantSelect}
                    required
                  >
                    <option value="">-- Choose Tenant --</option>
                    {tenantsWithPending.map(t => (
                      <option key={t.tenant.id} value={t.tenant.id}>
                        {t.tenant.name} ({t.invoices.length} pending)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTenantId && (
                  <div className="form-group full-width">
                    <label>Select Invoice</label>
                    <select 
                      className="form-control" 
                      value={selectedInvoiceId} 
                      onChange={(e) => setSelectedInvoiceId(e.target.value)}
                      required
                    >
                      {pendingByTenant[selectedTenantId]?.invoices.map(inv => (
                        <option key={inv.id} value={inv.id}>
                          ₹{inv.amountDue.toLocaleString('en-IN')} - Due {new Date(inv.dueDate).toLocaleDateString('en-IN')}
                        </option>
                      ))}
                    </select>
                    <p style={{fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem'}}>
                      * The oldest pending invoice is selected by default.
                    </p>
                  </div>
                )}

                <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
                  <button type="submit" className="btn btn-success" style={{flex: 1}} disabled={isSubmitting || !selectedInvoiceId}>
                    {isSubmitting ? 'Saving...' : 'Mark as Paid'}
                  </button>
                  <button type="button" className="btn btn-outline" style={{flex: 1}} onClick={() => setShowCashModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      <div className="flex-between">
        <h1 style={{margin: 0}}>Dashboard:</h1>
        <button className="btn btn-success hide-on-mobile" style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem'}} onClick={() => setShowCashModal(true)}>💰 Cash Entry</button>
      </div>

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
          onClick={() => setActiveView(activeView === 'pending' ? null : 'pending')}
          style={{cursor: 'pointer', border: activeView === 'pending' ? '1px solid var(--primary-color)' : '1px solid var(--border-color)'}}
        >
          <div className="stat-label">PENDING RENT <span style={{opacity: 0.5}}>→</span></div>
          <div className="stat-value" style={{color: 'var(--warning-color)'}}>
            ₹{pendingRentTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}
          </div>
        </div>
      </div>

      {/* Detailed Drill-down Views */}
      {activeView === 'tenants' && (
        <div className="glass-panel animate-fade-in" style={{marginBottom: '2rem'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
            <h2 style={{margin: 0}}>Active Tenants List</h2>
            <button className="btn btn-success hide-on-desktop" style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem'}} onClick={() => setShowCashModal(true)}>💰 Cash Entry</button>
          </div>
          <div style={{overflowX: 'auto', overflowY: 'auto', maxHeight: '50vh'}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Unit/House</th>
                  <th>Name</th>
                  <th>WhatsApp Phone</th>
                  <th>Rent Amount</th>
                </tr>
              </thead>
              <tbody>
                {activeTenants.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div style={{fontWeight: '600', color: '#ef4444'}}>Unit : {t.unitNo || '-'}</div>
                      <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>House : {t.houseNo || '-'}</div>
                    </td>
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
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
            <h2 style={{margin: 0}}>Deposits Breakdown</h2>
            <button className="btn btn-success hide-on-desktop" style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem'}} onClick={() => setShowCashModal(true)}>💰 Cash Entry</button>
          </div>
          <div style={{overflowX: 'auto', overflowY: 'auto', maxHeight: '50vh'}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Unit/House</th>
                  <th>Date of Deposit</th>
                  <th>Deposit Amount</th>
                </tr>
              </thead>
              <tbody>
                {activeTenants.map(t => (
                  <tr key={t.id}>
                    <td>{t.name}</td>
                    <td>
                      <div style={{fontWeight: '600', color: '#ef4444'}}>Unit : {t.unitNo || '-'}</div>
                      <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>House : {t.houseNo || '-'}</div>
                    </td>
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
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
            <h2 style={{margin: 0}}>Pending Rent Invoices</h2>
            <button className="btn btn-success hide-on-desktop" style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem'}} onClick={() => setShowCashModal(true)}>💰 Cash Entry</button>
          </div>
          <div style={{overflowX: 'auto', overflowY: 'auto', maxHeight: '40vh'}}>
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
                    <td style={{color: inv.status === 'VERIFYING' ? '#fbbf24' : 'var(--warning-color)', fontWeight: '600', whiteSpace: 'nowrap'}}>
                      ₹{inv.amountDue.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                      {inv.status === 'VERIFYING' && <span style={{fontSize: '0.75rem', marginLeft: '0.4rem', color: '#fbbf24', fontWeight: 'normal'}}>(⏳ Tenant claims paid)</span>}
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
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
          <h2 style={{margin: 0}}>Quick Actions</h2>
          <button className="btn btn-success hide-on-desktop" style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem'}} onClick={() => setShowCashModal(true)}>💰 Cash Entry</button>
        </div>
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
