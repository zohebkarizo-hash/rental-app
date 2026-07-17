"use client"
import { useState, useEffect } from 'react'

export default function TenantsPage() {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showActive, setShowActive] = useState(true)
  const [uploading, setUploading] = useState(false)
  
  // Edit State
  const [editingId, setEditingId] = useState(null)
  const [currentDocs, setCurrentDocs] = useState({ aadharUrl: null, passportUrl: null, photoUrl: null, agreementUrl: null })
  const [removedDocs, setRemovedDocs] = useState({ aadhar: false, passport: false, photo: false, agreement: false })

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
      // If they upload a new one, we no longer consider the old one "removed" explicitly (it will just be overwritten)
      setRemovedDocs({ ...removedDocs, [type]: false })
    }
  }

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); // keep only digits
    if (val.length > 0 && !val.startsWith('91') && !val.startsWith('9') && !val.startsWith('1')) {
       val = '91' + val;
    }
    if (val === '9' || val === '') val = '91';
    setFormData({...formData, phone: val});
  }

  const handleEditClick = (tenant) => {
    setEditingId(tenant.id)
    setFormData({
      name: tenant.name,
      phone: tenant.phone,
      houseNo: tenant.houseNo || '',
      unitNo: tenant.unitNo || '',
      deposit: tenant.deposit,
      rentAmount: tenant.rentAmount
    })
    setCurrentDocs({
      aadharUrl: tenant.aadharUrl,
      passportUrl: tenant.passportUrl,
      photoUrl: tenant.photoUrl,
      agreementUrl: tenant.agreementUrl
    })
    setRemovedDocs({ aadhar: false, passport: false, photo: false, agreement: false })
    setFiles({ aadhar: null, passport: null, photo: null, agreement: null })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({ name: '', phone: '91', houseNo: '', unitNo: '', deposit: '', rentAmount: '' })
    setFiles({ aadhar: null, passport: null, photo: null, agreement: null })
    setCurrentDocs({ aadharUrl: null, passportUrl: null, photoUrl: null, agreementUrl: null })
    setRemovedDocs({ aadhar: false, passport: false, photo: false, agreement: false })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    
    let uploadedUrls = {};
    if (!editingId) {
      uploadedUrls = { aadharUrl: null, passportUrl: null, photoUrl: null, agreementUrl: null };
    } else {
      // In Edit Mode, set any explicitly removed docs to null so the backend clears them
      ['aadhar', 'passport', 'photo', 'agreement'].forEach(type => {
        if (removedDocs[type]) {
          uploadedUrls[`${type}Url`] = null;
        }
      });
    }
    
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

    const endpoint = '/api/tenants';
    const method = editingId ? 'PATCH' : 'POST';
    const bodyPayload = editingId 
      ? { id: editingId, ...formData, ...uploadedUrls } 
      : { ...formData, ...uploadedUrls };

    const res = await fetch(endpoint, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload)
    })
    
    if (res.ok) {
      cancelEdit(); 
      document.querySelectorAll('input[type="file"]').forEach(input => input.value = '');
      fetchTenants();
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
        {/* Add/Edit Tenant Form */}
        <div className="glass-panel">
          <h2 style={{color: editingId ? 'var(--warning-color)' : 'var(--text-primary)'}}>
            {editingId ? 'Edit Tenant Details' : 'Add New Tenant'}
          </h2>
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

            <h3 style={{fontSize: '1rem', marginTop: '1rem', marginBottom: '0.5rem', color: 'var(--primary-color)'}}>
              {editingId ? 'Update Documents (Optional)' : 'Upload Documents'}
            </h3>

            {/* Display existing documents in Edit Mode with option to remove */}
            {editingId && (
              <div style={{marginBottom: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px'}}>
                <label style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block'}}>Current Saved Documents:</label>
                <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                  {['aadhar', 'passport', 'photo', 'agreement'].map(type => {
                    const hasDoc = currentDocs[`${type}Url`];
                    const isRemoved = removedDocs[type];
                    if (hasDoc && !isRemoved) {
                      return (
                        <span key={type} className="badge" style={{background: 'rgba(0,0,0,0.05)', color: 'var(--text-primary)', display: 'flex', gap: '6px', alignItems: 'center'}}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                          <button 
                            type="button" 
                            onClick={() => setRemovedDocs({...removedDocs, [type]: true})} 
                            style={{background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 2px'}}
                            title="Delete this document"
                          >
                            🗑️
                          </button>
                        </span>
                      )
                    } else if (hasDoc && isRemoved) {
                      return (
                        <span key={type} className="badge" style={{background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', textDecoration: 'line-through'}}>
                          {type.charAt(0).toUpperCase() + type.slice(1)} (Will be deleted)
                        </span>
                      )
                    }
                    return null;
                  })}
                  {!currentDocs.aadharUrl && !currentDocs.passportUrl && !currentDocs.photoUrl && !currentDocs.agreementUrl && (
                    <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>No documents saved currently.</span>
                  )}
                </div>
              </div>
            )}
            <div className="form-group" style={{marginBottom: '0.5rem'}}>
              <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                <select 
                  className="form-control" 
                  style={{flex: '1', minWidth: '150px'}}
                  onChange={(e) => document.getElementById('unified-file-upload').setAttribute('data-doctype', e.target.value)}
                >
                  <option value="aadhar">Aadhar Card</option>
                  <option value="passport">Passport</option>
                  <option value="photo">Tenant Photo</option>
                  <option value="agreement">Rental Agreement</option>
                </select>
                <input 
                  type="file" 
                  id="unified-file-upload"
                  data-doctype="aadhar"
                  className="form-control" 
                  accept="image/*,application/pdf" 
                  onChange={(e) => {
                    const type = e.target.getAttribute('data-doctype');
                    handleFileChange(type, e);
                    e.target.value = ''; // Reset so they can upload another type easily
                  }} 
                  style={{flex: '2', padding: '0.5rem', minWidth: '200px'}} 
                />
              </div>
            </div>
            
            {/* Show attached files */}
            <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem'}}>
              {Object.entries(files).map(([type, file]) => file && (
                <span key={type} className="badge badge-paid" style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                  {type.charAt(0).toUpperCase() + type.slice(1)} Attached
                  <button type="button" onClick={() => setFiles({...files, [type]: null})} style={{background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0 2px'}}>✖</button>
                </span>
              ))}
            </div>

            <div style={{display: 'flex', gap: '0.5rem'}}>
              <button type="submit" className={`btn ${editingId ? 'btn-success' : 'btn-success'}`} style={{flex: '1', backgroundColor: editingId ? 'var(--warning-color)' : ''}} disabled={uploading}>
                {uploading ? 'Processing...' : (editingId ? 'Update Tenant' : 'Add Tenant')}
              </button>
              {editingId && (
                <button type="button" className="btn" style={{backgroundColor: 'rgba(255,255,255,0.1)'}} onClick={cancelEdit} disabled={uploading}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tenants List */}
        <div className="glass-panel">
          <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem'}}>
            <button 
              className={`btn ${showActive ? 'btn-success' : 'btn-outline'}`} 
              onClick={() => setShowActive(true)}
            >
              Active Tenants
            </button>
            <button 
              className={`btn ${!showActive ? 'btn-success' : 'btn-outline'}`} 
              onClick={() => setShowActive(false)}
            >
              Vacated (Past Tenants)
            </button>
          </div>

          {loading ? <p>Loading...</p> : (
            <div style={{overflowX: 'auto'}}>
              <table className="data-table tenants-table">
                <thead>
                  <tr>
                    <th>Unit/House</th>
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
                      <td data-label="Unit/House">
                        <div style={{fontWeight: '600', color: '#ef4444'}}>Unit : {t.unitNo || '-'}</div>
                        <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>House : {t.houseNo || '-'}</div>
                      </td>
                      <td data-label="Name & Info">
                        <div>{t.name}</div>
                        <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>+{t.phone}</div>
                      </td>
                      <td data-label="Documents">
                        <div style={{display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end'}}>
                          {t.aadharUrl && <a href={t.aadharUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{padding: '0.2rem 0.5rem', fontSize: '0.7rem', width: 'fit-content', color: 'var(--text-primary)'}}><span className="bullet-3d"></span> Aadhar</a>}
                          {t.passportUrl && <a href={t.passportUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{padding: '0.2rem 0.5rem', fontSize: '0.7rem', width: 'fit-content', color: 'var(--text-primary)'}}><span className="bullet-3d"></span> Passport</a>}
                          {t.photoUrl && <a href={t.photoUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{padding: '0.2rem 0.5rem', fontSize: '0.7rem', width: 'fit-content', color: 'var(--text-primary)'}}><span className="bullet-3d"></span> Photo</a>}
                          {t.agreementUrl && <a href={t.agreementUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{padding: '0.2rem 0.5rem', fontSize: '0.7rem', width: 'fit-content', color: 'var(--text-primary)'}}><span className="bullet-3d"></span> Agreement</a>}
                          {!t.aadharUrl && !t.passportUrl && !t.photoUrl && !t.agreementUrl && <span style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>None</span>}
                        </div>
                      </td>
                      <td data-label="Deposit">₹{t.deposit.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      <td data-label="Rent">₹{t.rentAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      <td data-label="Actions">
                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%'}}>
                          {t.isActive && (
                            <button 
                              className="btn btn-success" 
                              style={{padding: '0.4rem 0.8rem', fontSize: '0.75rem', width: '100%', textAlign: 'center'}}
                              onClick={() => handleGenerateSingle(t.id)}
                            >
                              Bill Rent
                            </button>
                          )}
                          <button 
                            className="btn" 
                            style={{padding: '0.4rem 0.8rem', fontSize: '0.75rem', width: '100%', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: '#ef4444', color: '#ffffff'}}
                            onClick={() => handleEditClick(t)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-success" 
                            style={{padding: '0.4rem 0.8rem', fontSize: '0.75rem', width: '100%', textAlign: 'center', whiteSpace: 'nowrap'}}
                            onClick={() => handleToggleActive(t.id, t.isActive)}
                          >
                            {t.isActive ? 'Vacate' : 'Restore'}
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
