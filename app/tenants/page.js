"use client"
import { useState, useEffect } from 'react'

export default function TenantsPage() {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showActive, setShowActive] = useState(true)
  const [uploading, setUploading] = useState(false)
  
  const [files, setFiles] = useState({ aadhar: null, passport: null, photo: null, agreement: null })
  const [formData, setFormData] = useState({ name: '', phone: '91', houseNo: '', unitNo: '', deposit: '', rentAmount: '' })

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

  const handleFileChange = (type, e) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [type]: e.target.files[0] })
    }
  }

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); // keep only digits
    // ensure it starts with 91
    if (val.length > 0 && !val.startsWith('91') && !val.startsWith('9') && !val.startsWith('1')) {
       val = '91' + val;
    }
    // If they delete everything, just keep 91 or empty
    if (val === '9' || val === '') val = '91';
    setFormData({...formData, phone: val});
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    
    let uploadedUrls = { aadharUrl: null, passportUrl: null, photoUrl: null, agreementUrl: null };
    
    // Upload files sequentially
    for (const [key, file] of Object.entries(files)) {
      if (file) {
        const form = new FormData();
        form.append('file', file);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: form
        });
        
        if (uploadRes.ok) {
          const blob = await uploadRes.json();
          uploadedUrls[`${key}Url`] = blob.url;
        } else {
          alert(`Failed to upload ${key}. Please ensure Vercel Blob is configured.`);
          setUploading(false);
          return;
        }
      }
    }

    const res = await fetch('/api/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, ...uploadedUrls })
    })
    
    if (res.ok) {
      setFormData({ name: '', phone: '91', houseNo: '', unitNo: '', deposit: '', rentAmount: '' })
      setFiles({ aadhar: null, passport: null, photo: null, agreement: null })
      // Clear file inputs
      document.querySelectorAll('input[type="file"]').forEach(input => input.value = '');
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
              <label>WhatsApp Phone (Digits Only, Prefix 91)</label>
              <input type="tel" className="form-control" required value={formData.phone} onChange={handlePhoneChange} />
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>House No. (e.g. 42)</label>
                <input type="text" className="form-control" value={formData.houseNo} onChange={e => setFormData({...formData, houseNo: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Unit No. (e.g. 6)</label>
                <input type="text" className="form-control" value={formData.unitNo} onChange={e => setFormData({...formData, unitNo: e.target.value})} />
              </div>
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

            <h3 style={{fontSize: '1rem', marginTop: '1rem', marginBottom: '0.5rem', color: 'var(--primary-color)'}}>Documents</h3>
            
            <div className="form-group">
              <label>Aadhar Card</label>
              <input type="file" className="form-control" accept="image/*,application/pdf" onChange={(e) => handleFileChange('aadhar', e)} style={{padding: '0.5rem'}} />
            </div>
            <div className="form-group">
              <label>Passport</label>
              <input type="file" className="form-control" accept="image/*,application/pdf" onChange={(e) => handleFileChange('passport', e)} style={{padding: '0.5rem'}} />
            </div>
            <div className="form-group">
              <label>Tenant Photo</label>
              <input type="file" className="form-control" accept="image/*" onChange={(e) => handleFileChange('photo', e)} style={{padding: '0.5rem'}} />
            </div>
            <div className="form-group" style={{marginBottom: '1.5rem'}}>
              <label>Rental Agreement</label>
              <input type="file" className="form-control" accept="image/*,application/pdf" onChange={(e) => handleFileChange('agreement', e)} style={{padding: '0.5rem'}} />
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
                    <th>House/Unit</th>
                    <th>Name & Info</th>
                    <th>Documents</th>
                    <th>Deposit</th>
                    <th>Rent</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map(t => (
                    <tr key={t.id}>
                      <td>
                        <div style={{fontWeight: '600'}}>House {t.houseNo || '-'}</div>
                        <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Unit {t.unitNo || '-'}</div>
                      </td>
                      <td>
                        <div><strong>{t.name}</strong></div>
                        <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>📱 +{t.phone}</div>
                      </td>
                      <td>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                          {t.aadharUrl && <a href={t.aadharUrl} target="_blank" rel="noreferrer" style={{fontSize: '0.75rem', color: 'var(--primary-color)', textDecoration: 'none'}}>📄 Aadhar</a>}
                          {t.passportUrl && <a href={t.passportUrl} target="_blank" rel="noreferrer" style={{fontSize: '0.75rem', color: 'var(--primary-color)', textDecoration: 'none'}}>📄 Passport</a>}
                          {t.photoUrl && <a href={t.photoUrl} target="_blank" rel="noreferrer" style={{fontSize: '0.75rem', color: 'var(--primary-color)', textDecoration: 'none'}}>🖼️ Photo</a>}
                          {t.agreementUrl && <a href={t.agreementUrl} target="_blank" rel="noreferrer" style={{fontSize: '0.75rem', color: 'var(--primary-color)', textDecoration: 'none'}}>📄 Agreement</a>}
                          {!t.aadharUrl && !t.passportUrl && !t.photoUrl && !t.agreementUrl && <span style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>None</span>}
                        </div>
                      </td>
                      <td>₹{t.deposit}</td>
                      <td>₹{t.rentAmount}</td>
                      <td>
                        <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
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
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tenants.length === 0 && (
                    <tr><td colSpan="6" style={{textAlign: 'center', color: 'var(--text-secondary)'}}>No {showActive ? 'active' : 'vacated'} tenants found.</td></tr>
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
