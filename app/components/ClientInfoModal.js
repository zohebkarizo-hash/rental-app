export default function ClientInfoModal({ tenant, onClose }) {
  if (!tenant) return null;

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="glass-panel modal-content" style={{maxWidth: '400px', width: '90%'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
          <h2 style={{margin: 0, color: 'var(--text-primary)'}}>Client Information</h2>
          <button className="btn btn-outline" style={{padding: '0.2rem 0.6rem'}} onClick={onClose}>×</button>
        </div>

        <div style={{marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <div>
            <h3 style={{margin: '0 0 0.5rem 0', color: 'var(--primary-color)', fontSize: '1.2rem'}}>{tenant.name}</h3>
            <p style={{margin: 0, color: 'var(--text-secondary)'}}>
              <span style={{fontWeight: '600', color: '#ef4444'}}>Unit : {tenant.unitNo || '-'}</span>
              <span style={{margin: '0 0.5rem'}}>|</span>
              <span>House : {tenant.houseNo || '-'}</span>
            </p>
            <p style={{margin: '0.5rem 0 0 0', fontWeight: '500'}}>+{tenant.phone}</p>
          </div>
          <div style={{display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '50%'}}>
            {tenant.aadharUrl && <a href={tenant.aadharUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{padding: '0.2rem 0.4rem', fontSize: '0.7rem', color: 'var(--text-primary)'}}><span className="bullet-3d"></span> Aadhar</a>}
            {tenant.passportUrl && <a href={tenant.passportUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{padding: '0.2rem 0.4rem', fontSize: '0.7rem', color: 'var(--text-primary)'}}><span className="bullet-3d"></span> Passport</a>}
            {tenant.photoUrl && <a href={tenant.photoUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{padding: '0.2rem 0.4rem', fontSize: '0.7rem', color: 'var(--text-primary)'}}><span className="bullet-3d"></span> Photo</a>}
            {tenant.agreementUrl && <a href={tenant.agreementUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{padding: '0.2rem 0.4rem', fontSize: '0.7rem', color: 'var(--text-primary)'}}><span className="bullet-3d"></span> Agreement</a>}
          </div>
        </div>

        {/* Roommates Section */}
        {(tenant.roommate1Name || tenant.roommate2Name) && (
          <div style={{marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
            <h4 style={{margin: '0 0 0.8rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Roommates</h4>
            
            {tenant.roommate1Name && (
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tenant.roommate2Name ? '1rem' : '0'}}>
                <div>
                  <div style={{fontWeight: '500'}}>{tenant.roommate1Name}</div>
                  <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>+{tenant.roommate1Phone}</div>
                </div>
                <div style={{display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '60%'}}>
                  {tenant.roommate1AadharUrl && <a href={tenant.roommate1AadharUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{padding: '0.2rem 0.4rem', fontSize: '0.7rem', color: 'var(--text-primary)'}}><span className="bullet-3d"></span> Aadhar</a>}
                  {tenant.roommate1PassportUrl && <a href={tenant.roommate1PassportUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{padding: '0.2rem 0.4rem', fontSize: '0.7rem', color: 'var(--text-primary)'}}><span className="bullet-3d"></span> Passport</a>}
                  {tenant.roommate1PhotoUrl && <a href={tenant.roommate1PhotoUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{padding: '0.2rem 0.4rem', fontSize: '0.7rem', color: 'var(--text-primary)'}}><span className="bullet-3d"></span> Photo</a>}
                </div>
              </div>
            )}

            {tenant.roommate2Name && (
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <div>
                  <div style={{fontWeight: '500'}}>{tenant.roommate2Name}</div>
                  <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>+{tenant.roommate2Phone}</div>
                </div>
                <div style={{display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '60%'}}>
                  {tenant.roommate2AadharUrl && <a href={tenant.roommate2AadharUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{padding: '0.2rem 0.4rem', fontSize: '0.7rem', color: 'var(--text-primary)'}}><span className="bullet-3d"></span> Aadhar</a>}
                  {tenant.roommate2PassportUrl && <a href={tenant.roommate2PassportUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{padding: '0.2rem 0.4rem', fontSize: '0.7rem', color: 'var(--text-primary)'}}><span className="bullet-3d"></span> Passport</a>}
                  {tenant.roommate2PhotoUrl && <a href={tenant.roommate2PhotoUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{padding: '0.2rem 0.4rem', fontSize: '0.7rem', color: 'var(--text-primary)'}}><span className="bullet-3d"></span> Photo</a>}
                </div>
              </div>
            )}
          </div>
        )}



        <button className="btn btn-success" style={{width: '100%'}} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
