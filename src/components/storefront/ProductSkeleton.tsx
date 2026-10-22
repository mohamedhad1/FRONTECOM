import React from 'react'

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200 animate-pulse flex flex-col">
      <div className="aspect-[4/5] bg-slate-200" />
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="h-3 w-16 bg-slate-200 rounded" />
        <div className="h-4 w-3/4 bg-slate-200 rounded" />
        <div className="flex gap-1 my-1">
          <div className="h-4 w-6 bg-slate-200 rounded" />
          <div className="h-4 w-6 bg-slate-200 rounded" />
          <div className="h-4 w-6 bg-slate-200 rounded" />
        </div>
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="h-5 w-20 bg-slate-200 rounded" />
          <div className="h-8 w-8 bg-slate-200 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  )
}
