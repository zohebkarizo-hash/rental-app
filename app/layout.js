import './globals.css'
import Link from 'next/link'

import Navbar from './components/Navbar'

export const metadata = {
  title: 'Rental Management Web App',
  description: 'Manage rentals, deposits, and WhatsApp invoices easily.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
