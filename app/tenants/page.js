"use client"
import { useState, useEffect } from 'react'

export default function TenantsPage() {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ name: '', phone: '', room: '', deposit: '', rentAmount: '' })

  useEffect(() => {
    fetchTenants()
  }, [])

  const fetchTenants = async () => {
    const res = await fetch('/api/tenants')
    const data = await res.json()
    setTenants(data)
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await fetch('/api/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    if (res.ok) {
      setFormData({ name: '', phone: '', room: '', deposit: '', rentAmount: '' })
      fetchTenants()
    }
  }

  const handleGenerateSingle = async (tenantId) => {
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId })
    })
    if (res.ok) {
      alert('Invoice generated successfully! Go to the Invoices tab to send it via WhatsApp.')
    } else {
      alert('Failed to generate invoice.')
    }
  }

  return (
    <main className="container animate-fade-in">
      <div className="flex-between">
        <h1>Tenants Management</h1>
      </div>

      <div className="dashboard-grid" style={{gridTemplateColumns: '1fr 2fr'}}>
        {/* Add Tenant Form */}
        <div className="glass-panel">
          <h2>Add New Tenant</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input type="text" className="form-control" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>WhatsApp Phone</label>
              <input type="text" className="form-control" placeholder="9876543210" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Room / House No.</label>
              <input type="text" className="form-control" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Deposit (₹)</label>
                <input type="number" className="form-control" required value={formData.deposit} onChange={e => setFormData({...formData, deposit: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Rent Amount (₹)</label>
                <input type="number" className="form-control" required value={formData.rentAmount} onChange={e => setFormData({...formData, rentAmount: e.target.value})} />
              </div>
            </div>
            <button type="submit" className="btn btn-success" style={{width: '100%'}}>Add Tenant</button>
          </form>
        </div>

        {/* Tenants List */}
        <div className="glass-panel">
          <h2>Active Tenants</h2>
          {loading ? <p>Loading...</p> : (
            <div style={{overflowX: 'auto'}}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Deposit</th>
                    <th>Rent</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map(t => (
                    <tr key={t.id}>
                      <td>{t.room || '-'}</td>
                      <td>{t.name}</td>
                      <td>{t.phone}</td>
                      <td>₹{t.deposit}</td>
                      <td>₹{t.rentAmount}</td>
                      <td>
                        <button 
                          className="btn btn-success" 
                          style={{padding: '0.4rem 0.8rem', fontSize: '0.75rem'}}
                          onClick={() => handleGenerateSingle(t.id)}
                        >
                          Generate Rent
                        </button>
                      </td>
                    </tr>
                  ))}
                  {tenants.length === 0 && (
                    <tr><td colSpan="6" style={{textAlign: 'center', color: 'var(--text-secondary)'}}>No tenants found. Add one to get started.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
