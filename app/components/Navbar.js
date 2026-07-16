"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  
  // Hide navbar completely on the tenant payment page
  if (pathname && pathname.startsWith('/pay')) return null;

  return (
    <nav className="navbar">
      <Link href="/" className="logo">
        <img src="/logo.jpg" alt="KirayaPay Logo" style={{width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover'}} />
        KirayaPay
      </Link>
      <div className="nav-links">
        <Link href="/">Dashboard</Link>
        <Link href="/tenants">Tenants</Link>
        <Link href="/invoices">Invoices</Link>
      </div>
    </nav>
  )
}
