import React from 'react';
import { SkeletonCard } from '../ui/Skeleton';

export function WardrobeSkeleton({ count = 10 }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}

export function OutfitsSkeleton({ count = 6 }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                    <div className="p-4 space-y-3">
                        <div className="h-6 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                    <div className="grid grid-cols-3 gap-1 p-2">
                        {Array.from({ length: 6 }).map((_, j) => (
                            <div key={j} className="aspect-square bg-gray-200 rounded" />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default WardrobeSkeleton;
