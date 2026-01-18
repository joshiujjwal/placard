import { useState, useCallback } from 'react';
import { removeBackground } from '@imgly/background-removal';

export function useBackgroundRemoval() {
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    const removeBackgroundFromImage = useCallback(async (imageBlob) => {
        setProcessing(true);
        setProgress(0);
        setError(null);

        try {
            const result = await removeBackground(imageBlob, {
                progress: (key, current, total) => {
                    if (total > 0) {
                        const pct = Math.round((current / total) * 100);
                        setProgress(pct);
                    }
                },
                output: {
                    format: 'image/png',
                    quality: 0.9,
                },
            });

            setProgress(100);
            return result;
        } catch (err) {
            console.error('Background removal error:', err);
            setError(err.message || 'Failed to remove background');
            return null;
        } finally {
            setProcessing(false);
        }
    }, []);

    const removeBackgroundFromBase64 = useCallback(async (base64Data, mimeType = 'image/jpeg') => {
        const byteString = atob(base64Data);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([uint8Array], { type: mimeType });

        const resultBlob = await removeBackgroundFromImage(blob);
        if (!resultBlob) return null;

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64Result = reader.result.split(',')[1];
                resolve(base64Result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(resultBlob);
        });
    }, [removeBackgroundFromImage]);

    const reset = useCallback(() => {
        setProcessing(false);
        setProgress(0);
        setError(null);
    }, []);

    return {
        processing,
        progress,
        error,
        removeBackgroundFromImage,
        removeBackgroundFromBase64,
        reset,
    };
}

export default useBackgroundRemoval;
