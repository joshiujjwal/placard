import { toast } from 'react-hot-toast';

export const showToast = {
    success: (message) => toast.success(message, {
        duration: 3000,
        style: {
            background: '#10B981',
            color: '#fff',
        },
        iconTheme: {
            primary: '#fff',
            secondary: '#10B981',
        },
    }),
    error: (message) => toast.error(message, {
        duration: 4000,
        style: {
            background: '#EF4444',
            color: '#fff',
        },
        iconTheme: {
            primary: '#fff',
            secondary: '#EF4444',
        },
    }),
    loading: (message) => toast.loading(message, {
        style: {
            background: '#6366F1',
            color: '#fff',
        },
    }),
    dismiss: (id) => toast.dismiss(id),
    promise: (promise, messages) => toast.promise(promise, messages, {
        style: {
            minWidth: '200px',
        },
        success: {
            duration: 3000,
            style: {
                background: '#10B981',
                color: '#fff',
            },
        },
        error: {
            duration: 4000,
            style: {
                background: '#EF4444',
                color: '#fff',
            },
        },
    }),
};
