import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react'

export const HeroBanner: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white py-16 sm:py-24 md:py-28 rounded-2xl mb-12 border border-slate-900 shadow-2xl">
      {/* Background radial highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.12),transparent_50%)] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
        {/* Seasonal Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 mb-6 uppercase tracking-widest animate-in fade-in zoom-in-95">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>New Season Drop 2026</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-serif max-w-3xl leading-[1.1] mb-6">
          Understated Elegance. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-300 to-slate-400">
            Engineered For Everyday.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl font-normal leading-relaxed mb-8">
          Discover heavyweight hoodies, relaxed-fit tees, tailored pants, and timeless outerwear crafted from premium organic cotton and durable blends.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            to="/catalog"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-100 transition shadow-lg flex items-center justify-center gap-2 group"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/catalog?category=hoodies"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 font-semibold text-sm hover:bg-slate-800 hover:text-white transition flex items-center justify-center"
          >
            <span>Shop Hoodies</span>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 pt-8 border-t border-slate-900/80 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Authentic Quality</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Pay on Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>Instant WhatsApp Orders</span>
          </div>
        </div>
      </div>
    </section>
  )
}
