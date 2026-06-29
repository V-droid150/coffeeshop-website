import { NextResponse } from 'next/server'
import { getProducts } from '@/lib/products'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  const products = await getProducts({ availableOnly: true })
  const product = products.find(p => p.id === Number(params.id))
  if (!product) {
    return NextResponse.json({ success: false, error: 'Produk tidak ditemukan' }, { status: 404 })
  }
  return NextResponse.json({ success: true, data: product })
}
