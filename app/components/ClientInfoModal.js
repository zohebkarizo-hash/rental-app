export default function ClientInfoModal({ tenant, onClose }) {
  if (!tenant) return null;

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="glass-panel modal-content" style={{maxWidth: '400px', width: '90%'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
          <h2 style={{margin: 0, color: 'var(--text-primary)'}}>Client Information</h2>
          <button className="btn btn-outline" style={{padding: '0.2rem 0.6rem'}} onClick={onClose}>×</button>
        </div>

        <div style={{marginBottom: '1.5rem'}}>
          <h3 style={{margin: '0 0 0.5rem 0', color: 'var(--primary-color)', fontSize: '1.2rem'}}>{tenant.name}</h3>
          <p style={{margin: 0, color: 'var(--text-secondary)'}}>
            <span style={{fontWeight: '600', color: '#ef4444'}}>Unit : {tenant.unitNo || '-'}</span>
            <span style={{margin: '0 0.5rem'}}>|</span>
            <span>House : {tenant.houseNo || '-'}</span>
          </p>
          <p style={{margin: '0.5rem 0 0 0', fontWeight: '500'}}>+{tenant.phone}</p>
        </div>

        {/* Roommates Section */}
        {(tenant.roommate1Name || tenant.roommate2Name) && (
          <div style={{marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
            <h4 style={{margin: '0 0 0.8rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Roommates</h4>
            
            {tenant.roommate1Name && (
              <div style={{marginBottom: tenant.roommate2Name ? '0.8rem' : '0'}}>
                <div style={{fontWeight: '500'}}>{tenant.roommate1Name}</div>
                <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>+{tenant.roommate1Phone}</div>
              </div>
            )}

            {tenant.roommate2Name && (
              <div>
                <div style={{fontWeight: '500'}}>{tenant.roommate2Name}</div>
                <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>+{tenant.roommate2Phone}</div>
              </div>
            )}
          </div>
        )}

        {/* Documents Section */}
        <div style={{marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
          <h4 style={{margin: '0 0 0.8rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Documents</h4>
          
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
            {tenant.aadharUrl && <a href={tenant.aadharUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--text-primary)'}}><span className="bullet-3d"></span> Aadhar</a>}
            {tenant.passportUrl && <a href={tenant.passportUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--text-primary)'}}><span className="bullet-3d"></span> Passport</a>}
            {tenant.photoUrl && <a href={tenant.photoUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--text-primary)'}}><span className="bullet-3d"></span> Photo</a>}
            {tenant.agreementUrl && <a href={tenant.agreementUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--text-primary)'}}><span className="bullet-3d"></span> Agreement</a>}
            {!tenant.aadharUrl && !tenant.passportUrl && !tenant.photoUrl && !tenant.agreementUrl && (
              <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>No documents uploaded.</span>
            )}
          </div>
        </div>

        <button className="btn btn-success" style={{width: '100%'}} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
