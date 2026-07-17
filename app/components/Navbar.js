"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  
  // Hide navbar completely on the tenant payment page
  if (pathname && pathname.startsWith('/pay')) return null;

  return (
    <nav className="navbar">
      <a href="/" className="logo">
        <img src="/house_logo.jpg" alt="KirayaPay Logo" style={{width: '32px', height: '32px', objectFit: 'cover', mixBlendMode: 'lighten'}} />
        <span>Kiraya<span style={{color: 'var(--text-success)'}}>Pay</span></span>
      </a>
      
      <div className="nav-links">
        {pathname !== '/' && <Link href="/">Dashboard</Link>}
        {pathname !== '/tenants' && <Link href="/tenants">Tenants</Link>}
        {pathname !== '/invoices' && <Link href="/invoices">Invoices</Link>}
      </div>
    </nav>
  )
}
