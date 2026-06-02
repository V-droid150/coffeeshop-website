import { NextResponse } from 'next/server'
import { products } from '@/lib/menu-data'

export const dynamic = 'force-dynamic'

export function GET(request, { params }) {
  const product = products.find(p => p.id === Number(params.id))
  if (!product) {
    return NextResponse.json({ success: false, error: 'Produk tidak ditemukan' }, { status: 404 })
  }
  return NextResponse.json({ success: true, data: product })
}
