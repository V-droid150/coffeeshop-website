import { NextResponse } from 'next/server'
import { products } from '@/lib/menu-data'

export const dynamic = 'force-dynamic'

// GET /api/products?category=kopi&featured=true&search=latte
export function GET(request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const featured = searchParams.get('featured')
  const search   = searchParams.get('search')

  let data = products.filter(p => p.is_available)
  if (category)            data = data.filter(p => p.category_slug === category)
  if (featured === 'true') data = data.filter(p => p.is_featured)
  if (search)              data = data.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  return NextResponse.json({ success: true, data })
}
