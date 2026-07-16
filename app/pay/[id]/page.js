import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function PaymentPage({ params }) {
  const { id } = await params;
  const invoiceId = parseInt(id)
  
  if (isNaN(invoiceId)) {
    notFound()
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { tenant: true }
  })

  if (!invoice) {
    notFound()
  }

  const UPI_ID = '919854469256@waaxis';
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=Landlord&am=${invoice.amountDue}&cu=INR`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}`

  return (
    <main className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '1rem' }}>
      <div className="glass-panel animate-fade-in" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>Rent Payment</h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0 0 1.5rem 0' }}>For {invoice.tenant?.name || 'Tenant'}</p>
        
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '1rem' }}>
          ₹{invoice.amountDue.toLocaleString('en-IN', {minimumFractionDigits: 2})}
        </div>
        
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          {new Date(invoice.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Rent
        </p>

        <a 
          href={upiUrl} 
          className="btn btn-success" 
          style={{ 
            display: 'block', 
            width: '100%', 
            padding: '1rem', 
            fontSize: '1.1rem', 
            fontWeight: '600', 
            marginBottom: '2rem',
            textDecoration: 'none'
          }}
        >
          Pay via UPI App
        </a>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>Or scan this QR Code from another phone:</p>
          <img 
            src={qrUrl} 
            alt="UPI QR Code" 
            style={{ 
              borderRadius: '12px', 
              border: '4px solid white', 
              width: '200px', 
              height: '200px', 
              margin: '0 auto' 
            }} 
          />
        </div>
      </div>
    </main>
  )
}
