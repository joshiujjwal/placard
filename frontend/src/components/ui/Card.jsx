import React from 'react';
import { motion } from 'framer-motion';

export function Card({
    children,
    className = '',
    hover = false,
    onClick,
    padding = 'md',
    ...props
}) {
    const paddingSizes = {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
    };

    const Component = hover || onClick ? motion.div : 'div';
    const motionProps = hover || onClick ? {
        whileHover: { y: -4, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)' },
        whileTap: onClick ? { scale: 0.98 } : undefined,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
    } : {};

    return (
        <Component
            className={`
                bg-white rounded-xl shadow-md overflow-hidden
                ${onClick ? 'cursor-pointer' : ''}
                ${paddingSizes[padding]}
                ${className}
            `}
            onClick={onClick}
            {...motionProps}
            {...props}
        >
            {children}
        </Component>
    );
}

export function CardHeader({ children, className = '' }) {
    return (
        <div className={`px-4 py-3 border-b border-gray-100 ${className}`}>
            {children}
        </div>
    );
}

export function CardBody({ children, className = '' }) {
    return (
        <div className={`p-4 ${className}`}>
            {children}
        </div>
    );
}

export function CardFooter({ children, className = '' }) {
    return (
        <div className={`px-4 py-3 border-t border-gray-100 bg-gray-50 ${className}`}>
            {children}
        </div>
    );
}

export function CardImage({ src, alt, aspectRatio = 'square', className = '' }) {
    const aspects = {
        square: 'aspect-square',
        video: 'aspect-video',
        portrait: 'aspect-[3/4]',
        wide: 'aspect-[16/9]',
    };

    return (
        <div className={`${aspects[aspectRatio]} overflow-hidden ${className}`}>
            <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover"
                loading="lazy"
            />
        </div>
    );
}

export default Card;
