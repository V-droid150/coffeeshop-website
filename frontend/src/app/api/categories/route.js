import { NextResponse } from 'next/server'
import { categories } from '@/lib/menu-data'

export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json({ success: true, data: categories })
}
