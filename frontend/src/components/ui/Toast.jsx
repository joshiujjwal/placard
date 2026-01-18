import { Toaster } from 'react-hot-toast';

export function ToastProvider({ children }) {
    return (
        <>
            {children}
            <Toaster
                position="top-right"
                gutter={8}
                containerStyle={{
                    top: 80,
                }}
                toastOptions={{
                    className: 'font-medium text-sm',
                    style: {
                        padding: '12px 16px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                }}
            />
        </>
    );
}

export default ToastProvider;
