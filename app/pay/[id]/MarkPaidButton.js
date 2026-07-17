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
      <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--text-success)', borderRadius: '8px', color: 'var(--text-success)', fontSize: '0.9rem' }}>
        Thank you! The landlord has been notified.
      </div>
    )
  }

  return (
    <div>
      <button 
        onClick={handleMarkPaid} 
        disabled={loading}
        className="btn btn-outline"
        style={{ width: '100%', borderColor: 'var(--text-success)', color: 'var(--text-success)', padding: '0.75rem', fontSize: '0.95rem' }}
      >
        {loading ? 'Updating...' : 'I have completed the payment'}
      </button>
    </div>
  )
}
