import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ShoppingBag } from 'lucide-react'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
        <ShoppingBag className="w-8 h-8 stroke-1" />
      </div>
      <h1 className="text-3xl font-extrabold font-serif text-slate-900 tracking-tight mb-2">
        Page Not Found
      </h1>
      <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
        The garment or page you are looking for has been moved, renamed, or is currently unavailable.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 text-white font-semibold text-xs hover:bg-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Storefront
      </Link>
    </div>
  )
}
