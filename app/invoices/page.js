"use client"
import { useState, useEffect } from 'react'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [sendingId, setSendingId] = useState(null)
  const [previewInvoice, setPreviewInvoice] = useState(null)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    const res = await fetch('/api/invoices')
    const data = await res.json()
    setInvoices(data)
    setLoading(false)
  }

  const handleGenerateAll = async () => {
    setGenerating(true)
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}) // No tenantId means all
    })
    if (res.ok) {
      fetchInvoices()
    }
    setGenerating(false)
  }

  const handleSendWhatsApp = async (invoiceId) => {
    setSendingId(invoiceId)
    const res = await fetch('/api/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId })
    })
    
    const data = await res.json()
    if (res.ok) {
      fetchInvoices()
    } else {
      alert(`Twilio Error: ${data.error}`)
    }
    setSendingId(null)
  }

  const handleBulkSendWhatsApp = async () => {
    const pendingInvoices = invoices.filter(inv => !inv.whatsappSent && inv.status === 'PENDING')
    if (pendingInvoices.length === 0) {
      alert("No pending unsent invoices found!")
      return
    }
    
    if (!confirm(`Are you sure you want to send WhatsApp messages to ${pendingInvoices.length} tenants?`)) return;

    setGenerating(true)
    let successCount = 0;
    let failCount = 0;
    let lastError = "";

    for (const inv of pendingInvoices) {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: inv.id })
      })
      if (res.ok) {
        successCount++;
      } else {
        const data = await res.json();
        lastError = data.error;
        failCount++;
      }
    }
    
    fetchInvoices()
    setGenerating(false)
    if (failCount > 0) {
      alert(`Bulk Send Complete:\nSuccess: ${successCount}\nFailed: ${failCount}\nLast Error: ${lastError}`);
    } else {
      alert(`Successfully sent ${successCount} WhatsApp messages!`);
    }
  }

  const handleSendManual = async (inv) => {
    let phone = inv.tenant?.phone || '';
    if (!phone.startsWith('91') && !phone.startsWith('+')) {
      phone = '91' + phone;
    }
    phone = phone.replace('+', '');
    
    const baseUrl = window.location.origin;
    let payUrl = `${baseUrl}/pay/${inv.id}`;
    
    const text = `Hello ${inv.tenant?.name},\n\nYour rent for this month is Rs. ${inv.amountDue}.\nTo pay instantly via GPay/PhonePe or to view your QR code, click your secure invoice link below:\n${payUrl}\n\nThank you!`;
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
    
    // Mark as sent in DB
    await fetch('/api/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId: inv.id, manual: true })
    });
    fetchInvoices();
  }

  return (
    <main className="container animate-fade-in">
      <div className="flex-between">
        <h1>Invoices & Billing</h1>
        <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
          <button 
            className="btn btn-outline" 
            onClick={handleBulkSendWhatsApp}
            disabled={generating}
            style={{borderColor: '#25D366', color: '#25D366'}}
          >
            {generating ? 'Sending...' : 'Bulk Send via Twilio'}
          </button>
          <button 
            className="btn btn-success" 
            onClick={handleGenerateAll}
            disabled={generating}
          >
            {generating ? 'Generating...' : 'Generate Rent for All Tenants'}
          </button>
        </div>
      </div>

      <div className="glass-panel">
        <h2>Recent Invoices</h2>
        {loading ? <p>Loading...</p> : (
          <div style={{overflowX: 'auto'}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Tenant</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>WhatsApp</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id}>
                    <td>{new Date(inv.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>{inv.tenant?.name || 'Unknown'}</td>
                    <td>₹{inv.amountDue}</td>
                    <td>
                      <span className={`badge ${inv.status === 'PAID' ? 'badge-paid' : 'badge-pending'}`}>
                        {inv.status === 'PENDING' ? 'Pending' : inv.status === 'PAID' ? 'Paid' : inv.status}
                      </span>
                    </td>
                    <td>
                      {inv.whatsappSent ? (
                        <span style={{color: 'var(--text-success)'}}>✓ Sent</span>
                      ) : (
                        <span style={{color: 'var(--text-secondary)'}}>Not Sent</span>
                      )}
                    </td>
                    <td style={{display: 'flex', gap: '0.5rem', whiteSpace: 'nowrap'}}>
                      <button 
                        className="btn btn-outline" 
                        style={{padding: '0.4rem 0.8rem', fontSize: '0.875rem'}}
                        onClick={() => setPreviewInvoice(inv)}
                      >
                        Preview
                      </button>
                      <button 
                        className="btn btn-success" 
                        style={{padding: '0.4rem 0.8rem', fontSize: '0.875rem'}}
                        onClick={() => handleSendManual(inv)}
                      >
                        Open WA
                      </button>
                      <button 
                        className="btn btn-outline" 
                        style={{padding: '0.4rem 0.8rem', fontSize: '0.875rem'}}
                        onClick={() => handleSendWhatsApp(inv.id)}
                        disabled={sendingId === inv.id}
                        title="Send via Twilio Background API"
                      >
                        {sendingId === inv.id ? '...' : 'Auto'}
                      </button>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr><td colSpan="6" style={{textAlign: 'center', color: 'var(--text-secondary)'}}>No invoices generated yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {previewInvoice && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
          <div className="glass-panel animate-fade-in" style={{maxWidth: '500px', width: '90%', position: 'relative'}}>
            <button onClick={() => setPreviewInvoice(null)} style={{position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer', padding: '0'}}>&times;</button>
            <h2 style={{marginTop: '0'}}>Message Preview</h2>
            <div style={{background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', whiteSpace: 'pre-wrap', border: '1px solid var(--border-color)'}}>
              {`Hello ${previewInvoice.tenant?.name},\n\nYour rent for this month is Rs. ${previewInvoice.amountDue}.\nTo pay instantly via GPay/PhonePe or to view your QR code, click your secure invoice link below:\n${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/pay/${previewInvoice.id}\n\nThank you!`}
            </div>
            <div style={{textAlign: 'center'}}>
              <a href={`/pay/${previewInvoice.id}`} target="_blank" className="btn btn-success" style={{textDecoration: 'none', display: 'inline-block', padding: '0.5rem 1rem'}}>
                Test Payment Portal
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
