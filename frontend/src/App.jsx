import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import MainApp from './components/MainApp';
import AuthScreen from './components/AuthScreen';
import PublicPoll from './pages/PublicPoll';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

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
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <ToastProvider>
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
                    <Route
                        path="/poll/:shareId"
                        element={<PublicPoll />}
                    />
                </Routes>
            </Router>
        </ToastProvider>
    );
}