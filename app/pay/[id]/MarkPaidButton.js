"use client"
import { useState } from 'react'

export default function MarkPaidButton({ invoiceId }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleMarkPaid = async () => {
    if (!confirm('Have you successfully completed the payment on your UPI app?')) return;
    
    setLoading(true)
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAID' })
      })
      if (res.ok) {
        setDone(true)
        // Refresh the page after 2 seconds to show the paid state
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        alert('Failed to update status. Please notify your landlord directly.')
      }
    } catch (error) {
      alert('Error updating status.')
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--text-success)', borderRadius: '8px', color: 'var(--text-success)' }}>
        Thank you! The landlord has been notified.
      </div>
    )
  }

  return (
    <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
        After you finish paying on your app, click the button below to update your invoice status.
      </p>
      <button 
        onClick={handleMarkPaid} 
        disabled={loading}
        className="btn btn-outline"
        style={{ width: '100%', borderColor: 'var(--text-success)', color: 'var(--text-success)' }}
      >
        {loading ? 'Updating...' : 'I have completed the payment'}
      </button>
    </div>
  )
}
