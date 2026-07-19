export default function Loading() {
  return (
    <div className="container" style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: '1rem'}}>
      <div className="custom-loader"></div>
      <div style={{color: 'var(--text-secondary)', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.85rem', animation: 'pulse 1.5s infinite'}}>
        Loading Dashboard...
      </div>
      <style>{`
        .custom-loader {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(16, 185, 129, 0.1);
          border-radius: 50%;
          border-top-color: var(--primary-color);
          animation: spin 1s ease-in-out infinite;
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
