"use client"
import { useState, useEffect } from 'react'

export default function TenantsPage() {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showActive, setShowActive] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState(null)
  const [formData, setFormData] = useState({ name: '', phone: '', room: '', deposit: '', rentAmount: '' })

  useEffect(() => {
    fetchTenants()
  }, [showActive])

  const fetchTenants = async () => {
    setLoading(true)
    const res = await fetch(`/api/tenants?isActive=${showActive}`)
    const data = await res.json()
    setTenants(data)
    setLoading(false)
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    
    let idDocumentUrl = null;
    if (file) {
      const form = new FormData();
      form.append('file', file);
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: form
      });
      
      if (uploadRes.ok) {
        const blob = await uploadRes.json();
        idDocumentUrl = blob.url;
      } else {
        alert("File upload failed. Please ensure Vercel Blob is configured.");
        setUploading(false);
        return;
      }
    }

    const res = await fetch('/api/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, idDocumentUrl })
    })
    
    if (res.ok) {
      setFormData({ name: '', phone: '', room: '', deposit: '', rentAmount: '' })
      setFile(null)
      document.getElementById('file-upload').value = ''
      if (showActive) fetchTenants()
    }
    setUploading(false)
  }

  const handleToggleActive = async (tenantId, currentStatus) => {
    if (!confirm(`Are you sure you want to mark this tenant as ${currentStatus ? 'Vacated' : 'Active'}?`)) return;
    
    const res = await fetch('/api/tenants', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tenantId, isActive: !currentStatus })
    })
    if (res.ok) {
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
            <div className="form-group">
              <label>ID Document (Aadhar/Passport PDF or Image)</label>
              <input type="file" id="file-upload" className="form-control" accept="image/*,application/pdf" onChange={handleFileChange} style={{padding: '0.5rem'}} />
            </div>
            <button type="submit" className="btn btn-success" style={{width: '100%'}} disabled={uploading}>
              {uploading ? 'Uploading & Adding...' : 'Add Tenant'}
            </button>
          </form>
        </div>

        {/* Tenants List */}
        <div className="glass-panel">
          <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem'}}>
            <button 
              className={`btn ${showActive ? 'btn-success' : ''}`} 
              style={{background: showActive ? '' : 'transparent', border: '1px solid var(--border-color)'}}
              onClick={() => setShowActive(true)}
            >
              Active Tenants
            </button>
            <button 
              className={`btn ${!showActive ? 'btn-success' : ''}`} 
              style={{background: !showActive ? '' : 'transparent', border: '1px solid var(--border-color)'}}
              onClick={() => setShowActive(false)}
            >
              Vacated (Past Tenants)
            </button>
          </div>

          {loading ? <p>Loading...</p> : (
            <div style={{overflowX: 'auto'}}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Name & Info</th>
                    <th>Deposit</th>
                    <th>Rent</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map(t => (
                    <tr key={t.id}>
                      <td>{t.room || '-'}</td>
                      <td>
                        <div><strong>{t.name}</strong></div>
                        <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>📱 {t.phone}</div>
                        {t.idDocumentUrl && (
                          <a href={t.idDocumentUrl} target="_blank" rel="noreferrer" style={{fontSize: '0.75rem', color: 'var(--primary-color)', textDecoration: 'none', display: 'inline-block', marginTop: '4px'}}>
                            📄 View ID Document
                          </a>
                        )}
                      </td>
                      <td>₹{t.deposit}</td>
                      <td>₹{t.rentAmount}</td>
                      <td style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                        {t.isActive && (
                          <button 
                            className="btn btn-success" 
                            style={{padding: '0.4rem 0.8rem', fontSize: '0.75rem'}}
                            onClick={() => handleGenerateSingle(t.id)}
                          >
                            Bill Rent
                          </button>
                        )}
                        <button 
                          className="btn" 
                          style={{padding: '0.4rem 0.8rem', fontSize: '0.75rem', backgroundColor: t.isActive ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: t.isActive ? 'var(--warning-color)' : 'var(--success-color)'}}
                          onClick={() => handleToggleActive(t.id, t.isActive)}
                        >
                          {t.isActive ? 'Mark Vacated' : 'Restore Active'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {tenants.length === 0 && (
                    <tr><td colSpan="5" style={{textAlign: 'center', color: 'var(--text-secondary)'}}>No {showActive ? 'active' : 'vacated'} tenants found.</td></tr>
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
