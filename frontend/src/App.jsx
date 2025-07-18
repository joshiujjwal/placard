import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { auth } from './firebase/config';
import MainApp from './components/MainApp';
import AuthScreen from './components/AuthScreen';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

function AuthWatcher({ setUser, setLoadingAuth }) {
  const navigate = useNavigate();

  useEffect(() => {
    // First, check for redirect result
    getRedirectResult(auth)
      .then((result) => {
        console.log('getRedirectResult:', result);
        if (result && result.user) {
          setUser(result.user);
          navigate('/app');
          setLoadingAuth(false);
        } else {
          // Fallback to onAuthStateChanged
          const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            console.log('onAuthStateChanged:', currentUser);
            if (currentUser) {
              setUser(currentUser);
              navigate('/app');
            } else {
              setUser(null);
              navigate('/');
            }
            setLoadingAuth(false);
          });
          return () => unsubscribe();
        }
      })
      .catch((error) => {
        console.log('getRedirectResult error:', error);
        setLoadingAuth(false);
        setUser(null);
        navigate('/');
      });
  }, [setUser, setLoadingAuth, navigate]);

  return null;
}

export default function App() {
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    return (
      <Router>
        <AuthWatcher setUser={setUser} setLoadingAuth={setLoadingAuth} />
        {loadingAuth ? (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        ) : (
            <Routes>
                <Route path="/" element={<AuthScreen setUser={setUser} />} />
                <Route path="/app" element={<MainApp user={user} />} />
            </Routes>
        )}
      </Router>
    );
}

