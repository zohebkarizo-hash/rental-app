import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Rental Management Web App',
  description: 'Manage rentals, deposits, and WhatsApp invoices easily.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <Link href="/" className="logo">
            🏠 RentalManager
          </Link>
          <div className="nav-links">
            <Link href="/">Dashboard</Link>
            <Link href="/tenants">Tenants</Link>
            <Link href="/invoices">Invoices</Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
