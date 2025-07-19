import React, { useState, useEffect, useCallback } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, appId } from '../firebase/config';

// Helper function to convert file to base64
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // Get the base64 string without the data URL prefix
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
            // Convert file to base64
            const base64 = await fileToBase64(file);
            
            // Save base64 to Firestore
            const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile`, 'images');
            const updateData = { bodyImageBase64: base64 };
            
            await setDoc(userProfileRef, updateData, { merge: true });
            
            // Update local state
            setBodyImageBase64(base64);
            setBodyImage(null);
            
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const deleteImage = async () => {
        if (!user) return;
        
        try {
            const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile`, 'images');
            const updateData = { bodyImageBase64: '' };
            
            await setDoc(userProfileRef, updateData, { merge: true });
            
            setBodyImageBase64('');
        } catch (error) {
            console.error('Error deleting image:', error);
            alert('Failed to delete image. Please try again.');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('File size must be less than 5MB');
                return;
            }
            
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                alert('Please upload a valid image file (JPEG, PNG, or WebP)');
                return;
            }
            
            setBodyImage(file);
        }
    };

    // Helper function to get data URL for display
    const getDataUrl = (base64) => {
        return base64 ? `data:image/jpeg;base64,${base64}` : '';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">User Profile</h2>
                
                <div className="max-w-md mx-auto">
                    {/* Full Body Image Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Full Body Photo</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Upload a full body photo to use with virtual try-on features. 
                            This photo will be used to visualize how outfits look on you.
                        </p>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            {bodyImageBase64 ? (
                                <div className="space-y-4">
                                    <img 
                                        src={getDataUrl(bodyImageBase64)} 
                                        alt="Full Body" 
                                        className="w-48 h-64 mx-auto rounded-lg object-cover border-4 border-gray-200"
                                    />
                                    <div className="flex gap-2 justify-center">
                                        <button
                                            onClick={deleteImage}
                                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                        >
                                            Remove Photo
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="w-48 h-64 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <label className="cursor-pointer">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <span className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                                                Upload Full Body Photo
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {bodyImage && (
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-2">Ready to upload: {bodyImage.name}</p>
                                <button
                                    onClick={() => uploadImage(bodyImage)}
                                    disabled={uploading}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    {uploading ? 'Uploading...' : 'Upload Photo'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Tips for best virtual try-on results:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Use a clear, well-lit full body photo</li>
                        <li>• Photo should show your full figure from head to toe</li>
                        <li>• Wear form-fitting clothes or a neutral outfit</li>
                        <li>• Stand in a natural pose with arms slightly away from body</li>
                        <li>• Use a plain background for best results</li>
                        <li>• Maximum file size: 5MB</li>
                    </ul>
                </div>
            </div>
        </div>
    );
} 