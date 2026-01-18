import React from 'react';

export function Skeleton({ className = '', animate = true }) {
    return (
        <div
            className={`bg-gray-200 rounded ${animate ? 'animate-pulse' : ''} ${className}`}
            aria-hidden="true"
        />
    );
}

export function SkeletonText({ lines = 1, className = '' }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={`h-4 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
                />
            ))}
        </div>
    );
}

export function SkeletonCircle({ size = 'md', className = '' }) {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24',
    };

    return (
        <Skeleton className={`rounded-full ${sizes[size]} ${className}`} />
    );
}

export function SkeletonCard({ className = '' }) {
    return (
        <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
            <Skeleton className="w-full h-48" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2 pt-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
            </div>
        </div>
    );
}

export function SkeletonImage({ aspectRatio = 'square', className = '' }) {
    const aspects = {
        square: 'aspect-square',
        video: 'aspect-video',
        portrait: 'aspect-[3/4]',
    };

    return (
        <Skeleton className={`w-full ${aspects[aspectRatio]} ${className}`} />
    );
}

export default Skeleton;
