import React from 'react'
import { Link } from 'react-router-dom'
import { Phone, ShieldCheck, Truck, RefreshCw, Heart } from 'lucide-react'

const CURRENT_YEAR = new Date().getFullYear()

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900 mt-auto">
      {/* Value Proposition Highlights */}
      <div className="border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-100 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-slate-100 font-semibold text-sm">Express Shipping</h4>
              <p className="text-slate-400 mt-0.5">Nationwide fast doorstep delivery</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-100 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-slate-100 font-semibold text-sm">Cash on Delivery</h4>
              <p className="text-slate-400 mt-0.5">Pay safely when you receive items</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-100 shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-slate-100 font-semibold text-sm">WhatsApp Orders</h4>
              <p className="text-slate-400 mt-0.5">Direct friendly customer support</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-100 shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-slate-100 font-semibold text-sm">Easy Exchanges</h4>
              <p className="text-slate-400 mt-0.5">Hassle-free size replacement</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-white text-slate-950 rounded flex items-center justify-center font-black text-sm">
              E
            </div>
            <span className="font-extrabold text-white text-base tracking-tight font-serif">ATELIER ECOM</span>
          </div>
          <p className="leading-relaxed text-slate-400 max-w-sm">
            Curated modern streetwear & essentials. Designed with premium fabrics, durable stitching, and contemporary cuts.
          </p>
        </div>

        <div>
          <h5 className="font-bold uppercase tracking-wider text-white text-xs mb-3">Categories</h5>
          <ul className="space-y-2">
            <li><Link to="/catalog?category=hoodies" className="hover:text-white transition">Hoodies & Sweats</Link></li>
            <li><Link to="/catalog?category=tshirts" className="hover:text-white transition">T-Shirts</Link></li>
            <li><Link to="/catalog?category=jackets" className="hover:text-white transition">Jackets</Link></li>
            <li><Link to="/catalog?category=pants" className="hover:text-white transition">Pants & Bottoms</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold uppercase tracking-wider text-white text-xs mb-3">Shopping Info</h5>
          <ul className="space-y-2">
            <li><span className="text-slate-400">Order method: Direct WhatsApp</span></li>
            <li><span className="text-slate-400">Payment: Cash on Delivery</span></li>
            <li><span className="text-slate-400">Delivery timeframe: 24-48 Hours</span></li>
            <li><Link to="/catalog" className="hover:text-white transition">Full Product Catalog</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold uppercase tracking-wider text-white text-xs mb-3">Administrative</h5>
          <p className="text-slate-400 mb-3">Store managers and admins can manage stock, products, and prices:</p>
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition font-medium"
          >
            Access Admin Portal &rarr;
          </Link>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-900 py-6 text-center text-slate-500">
        <p className="flex items-center justify-center gap-1">
          &copy; {CURRENT_YEAR} ATELIER ECOM. All rights reserved. Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
        </p>
      </div>
    </footer>
  )
}
