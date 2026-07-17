import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const data = await request.json()
    
    if (data.status) {
      const invoice = await prisma.invoice.update({
        where: { id },
        data: { status: data.status }
      })
      return NextResponse.json(invoice)
    }
    
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}
