import Icons from './Icons';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { auth } from '../firebase/config';

export default function AuthScreen({ setUser }) {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            if (isMobile) {
                await signInWithRedirect(auth, provider);
            } else {
                await signInWithPopup(auth, provider);
            }
            // onAuthStateChanged will handle the user state update
        } catch (error) {
            console.error("Error during sign-in:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="text-indigo-600 mb-4">
                    {Icons.hanger}
                </div>
                <h1 className="text-4xl font-bold text-gray-900">Placard</h1>
                <p className="mt-2 text-lg text-gray-600">Your AI Wardrobe Assistant</p>
                <div className="mt-8">
                    <button
                        onClick={signInWithGoogle}
                        className="w-full inline-flex justify-center items-center gap-3 bg-white text-gray-700 font-semibold py-3 px-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
                    >
                        {Icons.google}
                        Sign in with Google
                    </button>
                </div>
            </div>
        </div>
    );
};