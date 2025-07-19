import React, { useState, useEffect } from 'react';
import Icons from './Icons';
import { doc, getDoc } from 'firebase/firestore';
import { db, appId, model, visionModel } from '../firebase/config';

// Helper function to parse AI response
function parseAIResponse(responseText) {
    try {
        // Remove code block markers (``` and ```json)
        let cleaned = responseText.trim()
            .replace(/^```(?:json)?/i, '')
            .replace(/```$/, '')
            .trim();
        // Replace single quotes with double quotes
        cleaned = cleaned.replace(/'/g, '"');
        // Parse as JSON
        return JSON.parse(cleaned);
    } catch (error) {
        console.error('Error parsing AI response:', error);
        return null;
    }
}

export default function VirtualTryOn({ user, outfits, items }) {
    const [selectedOutfit, setSelectedOutfit] = useState(null);
    const [userImageBase64, setUserImageBase64] = useState(null);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userProfile, setUserProfile] = useState(null);

    // Load user profile images and automatically set the body image
    useEffect(() => {
        const loadUserProfile = async () => {
            if (!user) return;
            
            try {
                const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile`, 'images');
                const userProfileDoc = await getDoc(userProfileRef);
                
                if (userProfileDoc.exists()) {
                    const profileData = userProfileDoc.data();
                    setUserProfile(profileData);
                    
                    // Automatically set the body image if available
                    if (profileData.bodyImageBase64) {
                        setUserImageBase64(profileData.bodyImageBase64);
                    }
                }
            } catch (error) {
                console.error('Error loading user profile:', error);
            }
        };

        loadUserProfile();
    }, [user]);

    const handleOutfitSelect = (outfit) => {
        setSelectedOutfit(outfit);
        setGeneratedImage(null);
        setError(null);
    };

    const handleGenerateVirtualTryOn = async () => {
        if (!userImageBase64 || !selectedOutfit) {
            setError('Please select an outfit to generate virtual try-on');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Get all items from the selected outfit
            const outfitItems = selectedOutfit.itemIds.map(id => items.find(item => item.id === id)).filter(Boolean);
            
            if (outfitItems.length === 0) {
                throw new Error('Selected outfit has no items.');
            }

            // Convert all outfit items to base64
            const clothingImagesBase64 = [];
            
            for (const item of outfitItems) {
                let itemBase64;
                
                if (item.imageBase64) {
                    // Use the base64 data directly from the item
                    itemBase64 = item.imageBase64;
                } else if (item.imageUrl) {
                    // Fallback: convert URL to base64 (for legacy items)
                    try {
                        const response = await fetch(item.imageUrl);
                        const blob = await response.blob();
                        itemBase64 = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => {
                                const base64 = reader.result.split(',')[1];
                                resolve(base64);
                            };
                            reader.onerror = reject;
                            reader.readAsDataURL(blob);
                        });
                    } catch (fetchError) {
                        throw new Error(`Unable to access image for ${item.name}. Please try a different outfit or contact support.`);
                    }
                } else {
                    throw new Error(`Item ${item.name} has no image data.`);
                }
                
                clothingImagesBase64.push(itemBase64);
            }

            // Create a clear, direct prompt for image generation
            const itemNames = outfitItems.map(item => item.name).join(', ');
            const imagePrompt = `Generate a photorealistic virtual try-on image. 

Take the person from the first image and dress them in these clothing items: ${itemNames}.

Requirements:
- Keep the person's face, body shape, and pose exactly the same
- Apply each clothing item to the correct body part with realistic fit
- Layer items properly (tops over bottoms, etc.)
- Create a new, professional background
- Make the result look like a high-quality fashion photo

Return only the generated image, no text description.`;

            // Prepare the request for the AI model with multiple clothing images
            const requestParts = [
                { text: imagePrompt },
                {
                    inlineData: {
                        mimeType: "image/jpeg",
                        data: userImageBase64
                    }
                }
            ];

            // Add all clothing images to the request
            clothingImagesBase64.forEach((base64, index) => {
                requestParts.push({
                    inlineData: {
                        mimeType: "image/jpeg",
                        data: base64
                    }
                });
            });

            const request = {
                contents: [{
                    role: "user",
                    parts: requestParts
                }],
                generationConfig: {
                    temperature: 0.6,
                    topP: 0.95,
                    topK: 40,
                    responseModalities: ["Text", "Image"]
                }
            };

            // Try to generate content using the image generation model
            let result;
            try {
                result = await model.generateContent(request);
            } catch (modelError) {
                console.warn('Image generation model failed, trying fallback model:', modelError);
                // If image generation model fails, try with the regular vision model
                const fallbackParts = [
                    { text: `Generate a virtual try-on image by combining the person from the first image with ALL the clothing items from the outfit (${outfitItems.length} items total). Preserve the person's face and each clothing item's exact appearance. Apply items to appropriate body parts and layer them correctly. Return the result as a base64 encoded image.` },
                    { 
                        inlineData: { 
                            mimeType: "image/jpeg", 
                            data: userImageBase64 
                        } 
                    }
                ];

                // Add all clothing images to fallback request
                clothingImagesBase64.forEach(base64 => {
                    fallbackParts.push({
                        inlineData: { 
                            mimeType: "image/jpeg", 
                            data: base64 
                        }
                    });
                });

                const fallbackRequest = {
                    contents: [{
                        role: "user",
                        parts: fallbackParts
                    }]
                };
                result = await visionModel.generateContent(fallbackRequest);
            }
            
            // Check if the response contains image data
            if (result.response && result.response.candidates && result.response.candidates.length > 0) {
                const candidate = result.response.candidates[0];
                if (candidate.content && candidate.content.parts) {
                    for (const part of candidate.content.parts) {
                        if (part.inlineData && part.inlineData.data) {
                            // Found image data in the response
                            const mimeType = part.inlineData.mimeType || 'image/png';
                            setGeneratedImage(`data:${mimeType};base64,${part.inlineData.data}`);
                            return; // Exit early since we found the image
                        }
                    }
                }
            }
            
            // Fallback: try to get text response and parse it
            const text = result.response.text();
            console.log('AI Response:', text);
            
            // Check if the response contains code or is just descriptive text
            if (text.includes('import') || text.includes('def ') || text.includes('function') || text.includes('```')) {
                throw new Error('The AI model returned code instead of an image. This model may not support image generation.');
            }
            
            if (text.includes('Here\'s') || text.includes('photorealistic') || text.includes('person wearing')) {
                throw new Error('The AI model provided a text description instead of generating an image. The model may not be configured for image generation or the prompt needs adjustment.');
            }
            
            // Try to parse the response as JSON to extract image data
            const parsedResponse = parseAIResponse(text);
            
            if (parsedResponse && parsedResponse.image) {
                // If the response contains base64 image data
                setGeneratedImage(`data:image/png;base64,${parsedResponse.image}`);
            } else {
                // If the response is just text, try to extract image data from the response
                // This is a fallback in case the model returns the image in a different format
                const imageMatch = text.match(/data:image\/[^;]+;base64,([^"]+)/);
                if (imageMatch) {
                    setGeneratedImage(imageMatch[0]);
                } else {
                    // Try to find base64 data without the data URL prefix
                    const base64Match = text.match(/[A-Za-z0-9+/]{50,}={0,2}/);
                    if (base64Match) {
                        setGeneratedImage(`data:image/png;base64,${base64Match[0]}`);
                    } else {
                        throw new Error('The AI model did not generate an image. This could be because:\n1. The model does not support image generation\n2. The prompt was not clear enough\n3. There was an issue with the input images\n\nPlease try using a different model that supports image generation or contact support.');
                    }
                }
            }
        } catch (error) {
            console.error('Error generating virtual try-on:', error);
            setError(error.message || 'Failed to generate virtual try-on. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetTryOn = () => {
        setSelectedOutfit(null);
        setGeneratedImage(null);
        setError(null);
    };

    // Helper function to get data URL for display
    const getDataUrl = (base64) => {
        return base64 ? `data:image/jpeg;base64,${base64}` : '';
    };

    // Helper function to get image source for items
    const getImageSource = (item) => {
        if (item.imageBase64) {
            return getDataUrl(item.imageBase64);
        }
        return item.imageUrl || '';
    };

    // Check if user has a profile image
    const hasProfileImage = userProfile && userProfile.bodyImageBase64;
    const canGenerate = hasProfileImage && selectedOutfit && !loading;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">Virtual Try-On</h2>
                    <button
                        onClick={resetTryOn}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                        Reset
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Profile Image Status */}
                {!hasProfileImage && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                        <div className="flex items-center space-x-3">
                            <div className="text-yellow-600 text-xl">{Icons.warning}</div>
                            <div>
                                <p className="text-yellow-800 font-medium">Profile Photo Required</p>
                                <p className="text-yellow-700 text-sm">Please upload a full body photo in your profile to use virtual try-on.</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Panel - Profile Image Display */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Your Profile Photo</h3>
                        
                        {hasProfileImage ? (
                            <div className="border-2 border-gray-300 rounded-lg p-4">
                                <div className="text-center">
                                    <img 
                                        src={getDataUrl(userProfile.bodyImageBase64)} 
                                        alt="Your Profile Photo" 
                                        className="w-48 h-64 mx-auto rounded-lg object-cover border-2 border-gray-200"
                                    />
                                    <p className="mt-2 text-sm font-medium text-gray-700">Full Body Photo</p>
                                    <p className="text-xs text-gray-500 mt-1">This photo will be used for virtual try-on</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <div className="text-gray-400 mx-auto text-4xl mb-2">{Icons.user}</div>
                                <p className="text-gray-600">No profile photo found</p>
                                <p className="text-sm text-gray-500 mt-1">Please upload a full body photo in your profile first</p>
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Outfit Selection */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Select Outfit</h3>
                        
                        <div className="max-h-96 overflow-y-auto space-y-2">
                            {outfits.map(outfit => {
                                const outfitItems = outfit.itemIds.map(id => items.find(item => item.id === id)).filter(Boolean);
                                
                                return (
                                    <div 
                                        key={outfit.id}
                                        className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                                            selectedOutfit?.id === outfit.id 
                                                ? 'border-indigo-500 bg-indigo-50' 
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                        onClick={() => handleOutfitSelect(outfit)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            {/* Show multiple items in a grid */}
                                            <div className="grid grid-cols-2 gap-1">
                                                {outfitItems.slice(0, 4).map((item, index) => (
                                                    <img 
                                                        key={item.id}
                                                        src={getImageSource(item)} 
                                                        alt={item.name}
                                                        className="w-8 h-8 rounded object-cover border border-gray-200"
                                                        title={item.name}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-800">{outfit.name}</h4>
                                                <p className="text-sm text-gray-600">
                                                    {outfitItems.length} item{outfitItems.length !== 1 ? 's' : ''}
                                                </p>
                                                {outfit.occasion && (
                                                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full mt-1">
                                                        {outfit.occasion}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {outfits.length === 0 && (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <div className="text-gray-400 mx-auto text-4xl mb-2">{Icons.sparkles}</div>
                                <p className="text-gray-600">No outfits found</p>
                                <p className="text-sm text-gray-500 mt-1">Create some outfits first to try them on</p>
                            </div>
                        )}

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerateVirtualTryOn}
                            disabled={!canGenerate}
                            className="w-full px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {loading ? 'Generating...' : 'Generate Virtual Try-On'}
                        </button>
                    </div>
                </div>

                {/* Generated Result */}
                {generatedImage && (
                    <div className="mt-8 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Try-On Result</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            <div className="w-full">
                                <img 
                                    src={generatedImage} 
                                    alt="Virtual Try-On Result" 
                                    className="w-full max-w-md mx-auto rounded-lg shadow-md"
                                />
                                <div className="mt-4 text-center">
                                    <a 
                                        href={generatedImage} 
                                        download="virtual-tryon-result.jpg"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                    >
                                        Download Result
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="mt-8 text-center">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Generating your virtual try-on...</p>
                        <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
                    </div>
                )}

                {/* Instructions */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
                    <ol className="text-sm text-blue-800 space-y-1">
                        <li>1. Your profile photo is automatically used for virtual try-on</li>
                        <li>2. Choose an outfit from your wardrobe</li>
                        <li>3. Click "Generate Virtual Try-On" to see how the outfit looks on you</li>
                        <li>4. Download the result to save or share</li>
                    </ol>
                    <p className="text-xs text-blue-700 mt-2">
                        Note: The AI will preserve your facial features and the exact appearance of all clothing items while creating a realistic try-on image.
                    </p>
                </div>
            </div>
        </div>
    );
}
