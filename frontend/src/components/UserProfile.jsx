import React, { useState, useEffect, useCallback } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { storage, db, appId } from '../firebase/config';

export default function UserProfile({ user }) {
    const [faceImage, setFaceImage] = useState(null);
    const [bodyImage, setBodyImage] = useState(null);
    const [faceImageUrl, setFaceImageUrl] = useState('');
    const [bodyImageUrl, setBodyImageUrl] = useState('');
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
                setFaceImageUrl(data.faceImageUrl || '');
                setBodyImageUrl(data.bodyImageUrl || '');
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

    const uploadImage = async (file, type) => {
        if (!file || !user) return;
        
        setUploading(true);
        try {
            const fileExtension = file.name.split('.').pop();
            const fileName = `${type}_${user.uid}_${Date.now()}.${fileExtension}`;
            const storageRef = ref(storage, `user-profiles/${user.uid}/${fileName}`);
            
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            
            // Save to Firestore
            const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile`, 'images');
            const updateData = type === 'face' 
                ? { faceImageUrl: downloadURL }
                : { bodyImageUrl: downloadURL };
            
            await setDoc(userProfileRef, updateData, { merge: true });
            
            // Update local state
            if (type === 'face') {
                setFaceImageUrl(downloadURL);
                setFaceImage(null);
            } else {
                setBodyImageUrl(downloadURL);
                setBodyImage(null);
            }
            
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const deleteImage = async (type) => {
        if (!user) return;
        
        try {
            const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile`, 'images');
            const updateData = type === 'face' 
                ? { faceImageUrl: '' }
                : { bodyImageUrl: '' };
            
            await setDoc(userProfileRef, updateData, { merge: true });
            
            if (type === 'face') {
                setFaceImageUrl('');
            } else {
                setBodyImageUrl('');
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            alert('Failed to delete image. Please try again.');
        }
    };

    const handleFileChange = (e, type) => {
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
            
            if (type === 'face') {
                setFaceImage(file);
            } else {
                setBodyImage(file);
            }
        }
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Face Image Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Face Image</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            {faceImageUrl ? (
                                <div className="space-y-4">
                                    <img 
                                        src={faceImageUrl} 
                                        alt="Face" 
                                        className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-gray-200"
                                    />
                                    <div className="flex gap-2 justify-center">
                                        <button
                                            onClick={() => deleteImage('face')}
                                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <label className="cursor-pointer">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(e, 'face')}
                                                className="hidden"
                                            />
                                            <span className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                                                Upload Face Image
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {faceImage && (
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-2">Ready to upload: {faceImage.name}</p>
                                <button
                                    onClick={() => uploadImage(faceImage, 'face')}
                                    disabled={uploading}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    {uploading ? 'Uploading...' : 'Upload Face Image'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Full Body Image Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Full Body Image</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            {bodyImageUrl ? (
                                <div className="space-y-4">
                                    <img 
                                        src={bodyImageUrl} 
                                        alt="Full Body" 
                                        className="w-32 h-48 mx-auto rounded-lg object-cover border-4 border-gray-200"
                                    />
                                    <div className="flex gap-2 justify-center">
                                        <button
                                            onClick={() => deleteImage('body')}
                                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="w-32 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <label className="cursor-pointer">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(e, 'body')}
                                                className="hidden"
                                            />
                                            <span className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                                                Upload Body Image
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
                                    onClick={() => uploadImage(bodyImage, 'body')}
                                    disabled={uploading}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    {uploading ? 'Uploading...' : 'Upload Body Image'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Tips for best results:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Use clear, well-lit photos</li>
                        <li>• Face image should be a close-up headshot</li>
                        <li>• Body image should show your full figure from head to toe</li>
                        <li>• Wear form-fitting clothes for the body image</li>
                        <li>• Maximum file size: 5MB</li>
                    </ul>
                </div>
            </div>
        </div>
    );
} 