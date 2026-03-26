import React from 'react';
import { GlassCard } from './Primitives';

export function SkeletonDashboard() {
  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
      
      {/* Banner Skeleton */}
      <GlassCard className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
        <div className="w-20 h-20 rounded-2xl shimmer-skeleton shrink-0" />
        <div className="flex-1 space-y-3 w-full">
          <div className="h-8 w-1/3 rounded-lg shimmer-skeleton" />
          <div className="h-4 w-1/4 rounded-md shimmer-skeleton" />
        </div>
        <div className="flex gap-6 w-full md:w-auto">
          {[1,2,3].map(i => (
            <div key={i} className="flex flex-col gap-2 items-center md:items-end w-full md:w-24">
              <div className="h-8 w-full rounded-md shimmer-skeleton" />
              <div className="h-3 w-16 rounded-sm shimmer-skeleton" />
            </div>
          ))}
        </div>
      </GlassCard>

      {/* KPI Row Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <GlassCard key={i} className="p-5 flex flex-col gap-4 h-[140px]">
            <div className="w-10 h-10 rounded-xl shimmer-skeleton" />
            <div className="h-8 w-1/2 rounded-md shimmer-skeleton mt-auto" />
            <div className="h-3 w-2/3 rounded-sm shimmer-skeleton" />
          </GlassCard>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-6 h-[400px] flex flex-col">
          <div className="flex justify-between mb-8">
            <div className="h-6 w-48 rounded-md shimmer-skeleton" />
            <div className="h-8 w-64 rounded-full shimmer-skeleton" />
          </div>
          <div className="flex-1 rounded-xl shimmer-skeleton opacity-50" />
        </GlassCard>
        <GlassCard className="p-6 h-[400px] flex flex-col">
           <div className="h-6 w-40 rounded-md shimmer-skeleton mb-8" />
           <div className="flex-1 rounded-full shimmer-skeleton opacity-30 aspect-square mx-auto w-3/4" />
        </GlassCard>
      </div>

    </div>
  );
}
