import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import MainApp from './components/MainApp';
import AuthScreen from './components/AuthScreen';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log('Auth state changed:', currentUser?.email || 'No user');
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                <Route 
                    path="/" 
                    element={user ? <MainApp user={user} /> : <AuthScreen />} 
                />
                <Route 
                    path="/app" 
                    element={user ? <MainApp user={user} /> : <AuthScreen />} 
                />
            </Routes>
        </Router>
    );
}