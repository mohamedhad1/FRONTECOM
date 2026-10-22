import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingBag, Search, Menu, X, Shield, ArrowRight } from 'lucide-react'
import { useCart } from '../../store/cart.context'

interface NavbarProps {
  cartItemCount?: number
  onOpenCart?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ cartItemCount, onOpenCart }) => {
  const cart = useCart()
  const effectiveCount = cartItemCount !== undefined ? cartItemCount : cart.totalCount
  const handleOpenCart = onOpenCart || cart.openCart
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setMobileMenuOpen(false)
    }
  }

  const navLinks = [
    { name: 'Shop All', path: '/catalog' },
    { name: 'Hoodies', path: '/catalog?category=hoodies' },
    { name: 'T-Shirts', path: '/catalog?category=tshirts' },
    { name: 'Jackets', path: '/catalog?category=jackets' },
    { name: 'Pants', path: '/catalog?category=pants' },
  ]

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-slate-900 text-slate-100 text-[11px] font-medium tracking-wider uppercase py-2 px-4 text-center">
        <span>Cash on Delivery available nationwide — Fast delivery via WhatsApp checkout</span>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Mobile menu button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 rounded-lg focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 rounded-lg"
              aria-label="Toggle Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-slate-950 text-white rounded-lg flex items-center justify-center font-black tracking-tighter text-xl group-hover:bg-slate-800 transition">
              E
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-950 font-serif leading-none">
                ATELIER ECOM
              </span>
              <span className="text-[10px] tracking-widest text-slate-400 font-semibold uppercase mt-0.5">
                Modern Clothing
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname + location.search === link.path
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-semibold tracking-wide transition-colors ${
                    isActive
                      ? 'text-slate-950 underline underline-offset-8 decoration-2'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {link.name}
                </Link>
              )
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Desktop Search bar */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex relative items-center">
              <input
                type="text"
                placeholder="Search collection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-64 pl-9 pr-4 py-1.5 text-xs rounded-full bg-slate-100 border border-transparent focus:border-slate-300 focus:bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            </form>

            {/* Admin Portal Shortcut */}
            <Link
              to="/admin/login"
              title="Admin Portal"
              className="p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100 transition"
            >
              <Shield className="w-5 h-5" />
            </Link>

            {/* Shopping Bag Trigger */}
            <button
              onClick={handleOpenCart}
              className="relative p-2.5 text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition flex items-center justify-center group cursor-pointer"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-105 transition-transform" />
              {effectiveCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-slate-950 text-white text-[10px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in-50">
                  {effectiveCount > 99 ? '99+' : effectiveCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Dropdown */}
        {searchOpen && (
          <div className="lg:hidden border-t border-slate-200 px-4 py-3 bg-white animate-in slide-in-from-top-2">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Search for hoodies, t-shirts, jackets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg bg-slate-100 border border-slate-200 focus:bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3" />
              <button
                type="submit"
                className="absolute right-2 px-3 py-1 bg-slate-900 text-white text-xs rounded font-medium"
              >
                Go
              </button>
            </form>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-[113px] bg-white border-b border-slate-200 shadow-xl px-6 py-6 flex flex-col gap-4 animate-in slide-in-from-top-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Collections</div>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-slate-800 hover:text-slate-950 py-1 flex items-center justify-between"
              >
                <span>{link.name}</span>
                <ArrowRight className="w-4 h-4 text-slate-300" />
              </Link>
            ))}
            <hr className="border-slate-100 my-2" />
            <Link
              to="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-slate-600 hover:text-slate-950 flex items-center gap-2 py-1"
            >
              <Shield className="w-4 h-4" /> Admin Portal
            </Link>
          </div>
        )}
      </header>
    </>
  )
}
