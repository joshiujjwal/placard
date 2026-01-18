import React, { useState, useEffect, useCallback } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { db, appId } from '../firebase/config';
import { showToast } from '../utils/toast';
import { Button } from './ui/Button';
import { LoadingSpinner, LoadingState } from './ui/LoadingSpinner';
import { Card } from './ui/Card';

const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export default function UserProfile({ user }) {
    const [bodyImage, setBodyImage] = useState(null);
    const [bodyImageBase64, setBodyImageBase64] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const loadUserProfile = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        try {
            const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile`, 'images');
            const userProfileDoc = await getDoc(userProfileRef);

            if (userProfileDoc.exists()) {
                const data = userProfileDoc.data();
                setBodyImageBase64(data.bodyImageBase64 || '');
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
            showToast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadUserProfile();
    }, [loadUserProfile]);

    const uploadImage = async (file) => {
        if (!file || !user) return;

        setUploading(true);
        try {
            const base64 = await fileToBase64(file);
            const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile`, 'images');
            await setDoc(userProfileRef, { bodyImageBase64: base64 }, { merge: true });
            setBodyImageBase64(base64);
            setBodyImage(null);
            showToast.success('Photo uploaded successfully!');
        } catch (error) {
            console.error('Error uploading image:', error);
            showToast.error('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const deleteImage = async () => {
        if (!user) return;

        setDeleting(true);
        try {
            const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile`, 'images');
            await setDoc(userProfileRef, { bodyImageBase64: '' }, { merge: true });
            setBodyImageBase64('');
            showToast.success('Photo removed');
        } catch (error) {
            console.error('Error deleting image:', error);
            showToast.error('Failed to delete image. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast.error('File size must be less than 5MB');
                return;
            }

            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                showToast.error('Please upload a valid image file (JPEG, PNG, or WebP)');
                return;
            }

            setBodyImage(file);
        }
    };

    const getDataUrl = (base64) => {
        return base64 ? `data:image/jpeg;base64,${base64}` : '';
    };

    if (loading) {
        return <LoadingState message="Loading profile..." />;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="p-0" padding="none">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
                        <p className="text-gray-500 mt-1">Manage your virtual try-on profile photo</p>
                    </div>

                    <div className="p-6">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Full Body Photo</h3>
                                <p className="text-sm text-gray-600">
                                    This photo is used for the virtual try-on feature to show how outfits look on you.
                                </p>
                            </div>

                            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                                bodyImageBase64 ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-300 hover:border-indigo-400'
                            }`}>
                                {bodyImageBase64 ? (
                                    <div className="space-y-4">
                                        <div className="relative inline-block">
                                            <img
                                                src={getDataUrl(bodyImageBase64)}
                                                alt="Full Body"
                                                className="w-48 h-64 mx-auto rounded-xl object-cover shadow-lg"
                                            />
                                            <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 justify-center">
                                            <label className="cursor-pointer">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">
                                                    Change Photo
                                                </span>
                                            </label>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={deleteImage}
                                                loading={deleting}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="w-48 h-64 mx-auto bg-gray-100 rounded-xl flex items-center justify-center">
                                            <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <label className="cursor-pointer inline-block">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                                <span className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-md shadow-indigo-200">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    Upload Photo
                                                </span>
                                            </label>
                                            <p className="text-sm text-gray-500 mt-3">Maximum size: 5MB</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {bodyImage && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-green-50 rounded-xl border border-green-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-medium text-green-800">{bodyImage.name}</p>
                                                <p className="text-sm text-green-600">Ready to upload</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setBodyImage(null)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => uploadImage(bodyImage)}
                                                loading={uploading}
                                            >
                                                {uploading ? 'Uploading...' : 'Confirm Upload'}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-100">
                        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Tips for best results
                        </h4>
                        <ul className="text-sm text-blue-800 space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400">•</span>
                                Use a clear, well-lit full body photo
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400">•</span>
                                Show your full figure from head to toe
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400">•</span>
                                Wear form-fitting clothes or a neutral outfit
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400">•</span>
                                Stand in a natural pose with arms slightly away from body
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400">•</span>
                                Use a plain background for best results
                            </li>
                        </ul>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
