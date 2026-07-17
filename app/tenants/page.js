"use client"
import { useState, useEffect } from 'react'
import ClientInfoModal from '../components/ClientInfoModal'

export default function TenantsPage() {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showActive, setShowActive] = useState(true)
  const [uploading, setUploading] = useState(false)
  
  // Edit State
  const [editingId, setEditingId] = useState(null)
  const [currentDocs, setCurrentDocs] = useState({ aadharUrl: null, passportUrl: null, photoUrl: null, agreementUrl: null })
  const [removedDocs, setRemovedDocs] = useState({ aadhar: false, passport: false, photo: false, agreement: false })

  const [files, setFiles] = useState({ aadhar: null, passport: null, photo: null, agreement: null, roommate1Aadhar: null, roommate1Passport: null, roommate1Photo: null, roommate2Aadhar: null, roommate2Passport: null, roommate2Photo: null })
  const [formData, setFormData] = useState({ name: '', phone: '91', houseNo: '', unitNo: '', deposit: '', rentAmount: '', roommate1Name: '', roommate1Phone: '91', roommate2Name: '', roommate2Phone: '91' })
  const [selectedClient, setSelectedClient] = useState(null)
  const [roommateCount, setRoommateCount] = useState(0)

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
      const file = e.target.files[0];
      if (file.size > 4.5 * 1024 * 1024) {
        alert(`The file for ${type} is too large (max 4.5MB allowed). Please select a smaller file.`);
        e.target.value = '';
        return;
      }
      setFiles({ ...files, [type]: file })
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
      deposit: tenant.deposit.toString(),
      rentAmount: tenant.rentAmount.toString(),
      roommate1Name: tenant.roommate1Name || '',
      roommate1Phone: tenant.roommate1Phone || '91',
      roommate2Name: tenant.roommate2Name || '',
      roommate2Phone: tenant.roommate2Phone || '91'
    })
    
    // Set roommate count based on existing data
    if (tenant.roommate2Name || (tenant.roommate2Phone && tenant.roommate2Phone !== '91')) {
      setRoommateCount(2)
    } else if (tenant.roommate1Name || (tenant.roommate1Phone && tenant.roommate1Phone !== '91')) {
      setRoommateCount(1)
    } else {
      setRoommateCount(0)
    }

    setCurrentDocs({
      aadharUrl: tenant.aadharUrl,
      passportUrl: tenant.passportUrl,
      photoUrl: tenant.photoUrl,
      agreementUrl: tenant.agreementUrl,
      roommate1AadharUrl: tenant.roommate1AadharUrl,
      roommate1PassportUrl: tenant.roommate1PassportUrl,
      roommate1PhotoUrl: tenant.roommate1PhotoUrl,
      roommate2AadharUrl: tenant.roommate2AadharUrl,
      roommate2PassportUrl: tenant.roommate2PassportUrl,
      roommate2PhotoUrl: tenant.roommate2PhotoUrl
    })
    setRemovedDocs({ aadhar: false, passport: false, photo: false, agreement: false, roommate1Aadhar: false, roommate1Passport: false, roommate1Photo: false, roommate2Aadhar: false, roommate2Passport: false, roommate2Photo: false })
    setFiles({ aadhar: null, passport: null, photo: null, agreement: null, roommate1Aadhar: null, roommate1Passport: null, roommate1Photo: null, roommate2Aadhar: null, roommate2Passport: null, roommate2Photo: null })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({ name: '', phone: '91', houseNo: '', unitNo: '', deposit: '', rentAmount: '', roommate1Name: '', roommate1Phone: '91', roommate2Name: '', roommate2Phone: '91' })
    setRoommateCount(0)
    setFiles({ aadhar: null, passport: null, photo: null, agreement: null, roommate1Aadhar: null, roommate1Passport: null, roommate1Photo: null, roommate2Aadhar: null, roommate2Passport: null, roommate2Photo: null })
    setCurrentDocs({ aadharUrl: null, passportUrl: null, photoUrl: null, agreementUrl: null, roommate1AadharUrl: null, roommate1PassportUrl: null, roommate1PhotoUrl: null, roommate2AadharUrl: null, roommate2PassportUrl: null, roommate2PhotoUrl: null })
    setRemovedDocs({ aadhar: false, passport: false, photo: false, agreement: false, roommate1Aadhar: false, roommate1Passport: false, roommate1Photo: false, roommate2Aadhar: false, roommate2Passport: false, roommate2Photo: false })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    
    let uploadedUrls = {};
    if (!editingId) {
      uploadedUrls = { 
        aadharUrl: null, passportUrl: null, photoUrl: null, agreementUrl: null,
        roommate1AadharUrl: null, roommate1PassportUrl: null, roommate1PhotoUrl: null,
        roommate2AadharUrl: null, roommate2PassportUrl: null, roommate2PhotoUrl: null
      };
    } else {
      // In Edit Mode, set any explicitly removed docs to null so the backend clears them
      ['aadhar', 'passport', 'photo', 'agreement', 'roommate1Aadhar', 'roommate1Passport', 'roommate1Photo', 'roommate2Aadhar', 'roommate2Passport', 'roommate2Photo'].forEach(type => {
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
          let errMsg = uploadRes.statusText;
          try {
            const errData = await uploadRes.json();
            if (errData.error) errMsg = errData.error;
          } catch (e) {}
          
          alert(`Failed to upload ${key}. Error: ${errMsg}. Please ensure Vercel Blob is configured and you are not exceeding free tier limits.`);
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
              <label>Name <span style={{color: '#ef4444'}}>*</span></label>
              <input type="text" className="form-control" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            
            <div className="form-group">
              <label>WhatsApp Phone <span style={{fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '400'}}>(Digits Only, Prefix 91)</span> <span style={{color: '#ef4444'}}>*</span></label>
              <input type="tel" className="form-control" required value={formData.phone} onChange={handlePhoneChange} />
            </div>

            {roommateCount >= 1 && (
              <div className="animate-fade-in" style={{position: 'relative', marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
                <button type="button" style={{position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px'}} onClick={() => {
                  if (roommateCount === 2) {
                    setFormData({...formData, roommate1Name: formData.roommate2Name, roommate1Phone: formData.roommate2Phone, roommate2Name: '', roommate2Phone: '91'});
                    setRoommateCount(1);
                  } else {
                    setFormData({...formData, roommate1Name: '', roommate1Phone: '91'});
                    setRoommateCount(0);
                  }
                }}>×</button>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Roommate Name</label>
                    <input type="text" className="form-control" value={formData.roommate1Name} onChange={e => setFormData({...formData, roommate1Name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Roommate Phone</label>
                    <input type="tel" className="form-control" value={formData.roommate1Phone} onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val === '' || val.startsWith('91')) setFormData({...formData, roommate1Phone: val});
                    }} />
                  </div>
                </div>
                <div style={{marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border-color)'}}>
                  <h3 style={{fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--primary-color)'}}>Roommate Documents</h3>
                  <div className="form-group" style={{marginBottom: '0.5rem'}}>
                    <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                      <select 
                        className="form-control" 
                        style={{flex: '1', minWidth: '150px'}}
                        onChange={(e) => document.getElementById('r1-unified-file-upload').setAttribute('data-doctype', e.target.value)}
                      >
                        <option value="roommate1Aadhar">Aadhar Card</option>
                        <option value="roommate1Passport">Passport</option>
                        <option value="roommate1Photo">Photo</option>
                      </select>
                      <input 
                        type="file" 
                        id="r1-unified-file-upload"
                        data-doctype="roommate1Aadhar"
                        className="form-control" 
                        accept="image/*,application/pdf" 
                        onChange={(e) => {
                          const type = e.target.getAttribute('data-doctype');
                          handleFileChange(type, e);
                          e.target.value = '';
                        }} 
                        style={{flex: '2', padding: '0.5rem', minWidth: '200px'}} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {roommateCount >= 2 && (
              <div className="animate-fade-in" style={{position: 'relative', marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
                <button type="button" style={{position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px'}} onClick={() => {
                  setFormData({...formData, roommate2Name: '', roommate2Phone: '91'});
                  setRoommateCount(1);
                }}>×</button>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Roommate Name</label>
                    <input type="text" className="form-control" value={formData.roommate2Name} onChange={e => setFormData({...formData, roommate2Name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Roommate Phone</label>
                    <input type="tel" className="form-control" value={formData.roommate2Phone} onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val === '' || val.startsWith('91')) setFormData({...formData, roommate2Phone: val});
                    }} />
                  </div>
                </div>
                <div style={{marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border-color)'}}>
                  <h3 style={{fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--primary-color)'}}>Roommate Documents</h3>
                  <div className="form-group" style={{marginBottom: '0.5rem'}}>
                    <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                      <select 
                        className="form-control" 
                        style={{flex: '1', minWidth: '150px'}}
                        onChange={(e) => document.getElementById('r2-unified-file-upload').setAttribute('data-doctype', e.target.value)}
                      >
                        <option value="roommate2Aadhar">Aadhar Card</option>
                        <option value="roommate2Passport">Passport</option>
                        <option value="roommate2Photo">Photo</option>
                      </select>
                      <input 
                        type="file" 
                        id="r2-unified-file-upload"
                        data-doctype="roommate2Aadhar"
                        className="form-control" 
                        accept="image/*,application/pdf" 
                        onChange={(e) => {
                          const type = e.target.getAttribute('data-doctype');
                          handleFileChange(type, e);
                          e.target.value = '';
                        }} 
                        style={{flex: '2', padding: '0.5rem', minWidth: '200px'}} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {roommateCount < 2 && (
              <div style={{marginTop: '1rem', textAlign: 'center'}}>
                <button type="button" className="btn btn-outline" style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem', width: 'fit-content', color: 'var(--primary-color)', borderColor: 'var(--primary-color)'}} onClick={() => setRoommateCount(prev => prev + 1)}>
                  + {roommateCount === 0 ? 'Add Roommate' : 'Add Another Roommate'}
                </button>
              </div>
            )}
            
            <div className="form-grid" style={{marginTop: '1.5rem'}}>
              <div className="form-group">
                <label>House No.</label>
                <input type="text" className="form-control" value={formData.houseNo} onChange={e => setFormData({...formData, houseNo: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Unit No.</label>
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
                  {['aadhar', 'passport', 'photo', 'agreement', 'roommate1Aadhar', 'roommate1Passport', 'roommate1Photo', 'roommate2Aadhar', 'roommate2Passport', 'roommate2Photo'].map(type => {
                    const hasDoc = currentDocs[`${type}Url`];
                    const isRemoved = removedDocs[type];
                    
                    const formatLabel = (t) => {
                      if (t.startsWith('roommate1')) return `Roommate 1 ${t.replace('roommate1', '')}`;
                      if (t.startsWith('roommate2')) return `Roommate 2 ${t.replace('roommate2', '')}`;
                      return t.charAt(0).toUpperCase() + t.slice(1);
                    }

                    if (hasDoc && !isRemoved) {
                      return (
                        <span key={type} className="badge" style={{background: 'rgba(0,0,0,0.05)', color: 'var(--text-primary)', display: 'flex', gap: '6px', alignItems: 'center'}}>
                          {formatLabel(type)}
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
                          {formatLabel(type)} (Will be deleted)
                        </span>
                      )
                    }
                    return null;
                  })}
                  {!Object.values(currentDocs).some(val => val !== null) && (
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
              {Object.entries(files).map(([type, file]) => {
                if (!file) return null;
                const formatLabel = (t) => {
                  if (t.startsWith('roommate1')) return `Roommate 1 ${t.replace('roommate1', '')}`;
                  if (t.startsWith('roommate2')) return `Roommate 2 ${t.replace('roommate2', '')}`;
                  return t.charAt(0).toUpperCase() + t.slice(1);
                }
                return (
                  <span key={type} className="badge badge-paid" style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                    {formatLabel(type)} Attached
                    <button type="button" onClick={() => setFiles({...files, [type]: null})} style={{background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0 2px'}}>✖</button>
                  </span>
                )
              })}
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
                        <span 
                          className="client-name-link"
                          onClick={() => setSelectedClient(t)}
                        >
                          {t.name}
                        </span>
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

      <ClientInfoModal tenant={selectedClient} onClose={() => setSelectedClient(null)} />
    </main>
  )
}
