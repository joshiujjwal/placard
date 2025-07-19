import Icons from './Icons';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useState } from 'react';

export default function AuthScreen() {
    const [loading, setLoading] = useState(false);
    
    // More reliable mobile detection
    const isMobile = () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));
    };

    const signInWithGoogle = async () => {
        setLoading(true);
        const provider = new GoogleAuthProvider();
        
        try {
            if (isMobile()) {
                console.log('Using redirect for mobile');
                await signInWithPopup(auth, provider);
                // Don't set loading to false here - page will redirect
            } else {
                console.log('Using popup for desktop');
                await signInWithPopup(auth, provider);
                setLoading(false);
            }
        } catch (error) {
            console.error("Error during sign-in:", error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="text-indigo-600 mb-4">
                    {Icons.hanger}
                </div>
                <h1 className="text-4xl font-bold text-gray-900">Placard</h1>
                <p className="mt-2 text-lg text-gray-600">
                    Your virtual closet - upload pictures of your clothes, mix and match clothing items to create outfits, and try them on with AI.
                </p>
                <div className="mt-8">
                    <button
                        onClick={signInWithGoogle}
                        disabled={loading}
                        className="w-full inline-flex justify-center items-center gap-3 bg-white text-gray-700 font-semibold py-3 px-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
                        ) : (
                            Icons.google
                        )}
                        {loading ? 'Signing in...' : 'Sign in with Google'}
                    </button>
                </div>
            </div>
        </div>
    );
}