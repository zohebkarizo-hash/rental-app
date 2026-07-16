import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const isActive = searchParams.get('isActive') !== 'false'

  const tenants = await prisma.tenant.findMany({
    where: { isActive },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(tenants)
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
        idDocumentUrl: data.idDocumentUrl || null
      },
    })
    return NextResponse.json(tenant)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const data = await request.json()
    const { id, isActive } = data
    const tenant = await prisma.tenant.update({
      where: { id },
      data: { isActive }
    })
    return NextResponse.json(tenant)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 })
  }
}
