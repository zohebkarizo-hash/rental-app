import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(tenants)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const tenant = await prisma.tenant.create({
      data: {
        name: data.name,
        phone: data.phone,
        room: data.room,
        deposit: parseFloat(data.deposit),
        rentAmount: parseFloat(data.rentAmount),
      },
    })
    return NextResponse.json(tenant)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 })
  }
}
