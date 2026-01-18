import React, { useEffect, useRef, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';

const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    full: 'max-w-full mx-4',
};

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    footer,
    className = '',
}) {
    const modalRef = useRef(null);
    const previousActiveElement = useRef(null);

    const handleEscape = useCallback((e) => {
        if (closeOnEscape && e.key === 'Escape') {
            onClose();
        }
    }, [closeOnEscape, onClose]);

    useEffect(() => {
        if (isOpen) {
            previousActiveElement.current = document.activeElement;
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';

            setTimeout(() => {
                modalRef.current?.focus();
            }, 0);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
            if (previousActiveElement.current) {
                previousActiveElement.current.focus();
            }
        };
    }, [isOpen, handleEscape]);

    const handleOverlayClick = (e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/50"
                        onClick={handleOverlayClick}
                        aria-hidden="true"
                    />
                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className={`
                            relative w-full ${sizes[size]}
                            bg-white rounded-xl shadow-2xl
                            max-h-[90vh] overflow-hidden
                            flex flex-col
                            mx-4
                            ${className}
                        `}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={title ? 'modal-title' : undefined}
                        tabIndex={-1}
                    >
                        {(title || showCloseButton) && (
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                                {title && (
                                    <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
                                        {title}
                                    </h2>
                                )}
                                {showCloseButton && (
                                    <button
                                        onClick={onClose}
                                        className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        aria-label="Close modal"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        )}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {children}
                        </div>
                        {footer && (
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    loading = false,
}) {
    const variants = {
        danger: 'bg-red-500 hover:bg-red-600 focus:ring-red-400',
        primary: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
        success: 'bg-green-500 hover:bg-green-600 focus:ring-green-400',
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
            footer={
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-4 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 ${variants[variant]}`}
                    >
                        {loading ? 'Processing...' : confirmText}
                    </button>
                </div>
            }
        >
            <p className="text-gray-600">{message}</p>
        </Modal>
    );
}

export default Modal;
