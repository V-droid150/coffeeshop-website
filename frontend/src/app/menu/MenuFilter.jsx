'use client'
import { useRouter, useSearchParams } from 'next/navigation'

// Client component untuk filter kategori interaktif (ubah URL param tanpa reload penuh)
export default function MenuFilter({ categories, active }) {
  const router = useRouter()

  const setCategory = (slug) => {
    router.push(slug === 'semua' ? '/menu' : `/menu?category=${slug}`)
  }

  const allTabs = [
    { slug: 'semua', name: 'Semua', icon: '🍽️' },
    ...categories.map(c => ({ slug: c.slug, name: c.name, icon: c.icon })),
  ]

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {allTabs.map(tab => (
        <button
          key={tab.slug}
          onClick={() => setCategory(tab.slug)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-sans font-semibold text-sm transition-all duration-200 ${
            active === tab.slug
              ? 'bg-coffee text-warm-white shadow-warm'
              : 'bg-white text-coffee border border-beige hover:border-coffee hover:shadow-warm-sm'
          }`}
        >
          <span>{tab.icon}</span>
          {tab.name}
        </button>
      ))}
    </div>
  )
}
