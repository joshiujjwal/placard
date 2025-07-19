import { useState, useEffect } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db, appId, model } from '../firebase/config';
import Icons from './Icons';
import Spinner from './Spinner';

// --- New Helper Function for Parsing AI Response ---
// This function is used to parse the response from the AI model
// It removes the code block markers and replaces single quotes with double quotes
// It then parses the response as JSON
function parseAIResponse(responseText) {
    // Remove code block markers (``` and ```json)
    let cleaned = responseText.trim()
        .replace(/^```(?:json)?/i, '')
        .replace(/```$/, '')
        .trim();
    // Replace single quotes with double quotes
    cleaned = cleaned.replace(/'/g, '"');
    // Parse as JSON
    return JSON.parse(cleaned);
}

// --- Main Refactored Component ---

const AddItemModal = ({ setShowModal, userId }) => {
    // Form state
    const [itemName, setItemName] = useState('');
    const [category, setCategory] = useState('');
    const [color, setColor] = useState('');
    const [material, setMaterial] = useState('');
    const [occasion, setOccasion] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    
    // AI state
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState(null);
    
    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Effect to update item name when AI results change
    useEffect(() => {
        if (color && category) {
            setItemName(`${color} ${category}`);
        }
    }, [color, category]);

    // Converts the image file to a base64 string for the API
    const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]); // Get only the base64 part
        reader.onerror = (err) => reject(err);
    });

    // Main function to handle file selection and trigger analysis
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Reset state for new upload
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
        setItemName('');
        setCategory('');
        setColor('');
        setMaterial('');
        setOccasion('');
        setIsAvailable(true);
        setAnalysisError(null);
        setIsAnalyzing(true);

        try {
            const base64ImageData = await toBase64(file);
            const prompt = "Analyze this image of a clothing item. Identify the type of clothing (e.g., T-shirt, Jeans, Dress, Sneaker), its primary color, and the material/fabric if visible (e.g., Cotton, Denim, Silk, Polyester, Wool). Respond in JSON format with three keys: 'itemType', 'color', and 'material'. Example: {'itemType': 'T-shirt', 'color': 'Blue', 'material': 'Cotton'}";
            
            const request = {
                contents: [{
                    role: "user",
                    parts: [
                        { text: prompt },
                        { inlineData: { mimeType: "image/jpeg", data: base64ImageData } }
                    ]
                }],
            };

            // Generate content using the Firebase AI SDK
            const result = await model.generateContent(request);
            const responseText = await result.response.text();
            const parsedJson = parseAIResponse(responseText);

            setCategory(parsedJson.itemType || '');
            setColor(parsedJson.color || '');
            setMaterial(parsedJson.material || '');

        } catch (err) {
            console.error("Error analyzing image:", err);
            setAnalysisError("AI analysis failed. Please enter details manually.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Handles the final submission to Firebase
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!itemName || !category || !color || !imageFile || !userId) {
            alert("Please ensure all required fields are filled after analysis.");
            return;
        }
        setIsSubmitting(true);

        try {
            // Convert image to base64 and save directly to Firestore
            const imageBase64 = await toBase64(imageFile);

            const itemsCollectionPath = `artifacts/${appId}/users/${userId}/items`;
            await addDoc(collection(db, itemsCollectionPath), {
                name: itemName,
                category,
                color,
                material: material || null, // Store material as null if empty
                occasion: occasion || null, // Store occasion as null if empty
                isAvailable: isAvailable,
                imageBase64, // Store base64 instead of imageUrl
                createdAt: new Date(),
            });

            setShowModal(false);
        } catch (error) {
            console.error("Error adding item:", error);
            alert("Failed to add item. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isLoading = isAnalyzing || isSubmitting;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                    {Icons.sparkles} Add New Item with AI
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">1. Add an Image</label>
                        <div className="mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            {preview ? (
                                <img src={preview} alt="Preview" className="mx-auto h-32 w-32 object-cover rounded-md" />
                            ) : (
                                <div className="space-y-4 text-center">
                                    <div className="flex items-center justify-center gap-4">
                                        {/* File Upload Button */}
                                        <label htmlFor="file-upload" className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                                            <i className="fa-solid fa-upload mr-2"></i>
                                            Upload File
                                        </label>
                                        <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" disabled={isLoading} />

                                        <span className="text-gray-400 text-sm">or</span>

                                        {/* Camera Button */}
                                        <label htmlFor="camera-upload" className="cursor-pointer bg-indigo-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700">
                                            <i className="fa-solid fa-camera mr-2"></i>
                                            Use Camera
                                        </label>
                                        <input id="camera-upload" type="file" capture="environment" className="sr-only" onChange={handleFileChange} accept="image/*" disabled={isLoading} />
                                    </div>
                                    <p className="text-xs text-gray-500">The AI will analyze it automatically</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {isAnalyzing && (
                        <div className="text-center p-3 bg-indigo-50 rounded-md text-indigo-700 font-semibold">
                            Analyzing image...
                        </div>
                    )}

                    {analysisError && (
                        <div className="text-center p-3 bg-red-50 rounded-md text-red-700 font-semibold">
                            {analysisError}
                        </div>
                    )}

                    <p className="text-sm font-medium text-gray-700 mb-2 mt-4">2. Confirm Details</p>
                    
                    <div className="space-y-4">
                        <input 
                            type="text" 
                            value={itemName} 
                            onChange={(e) => setItemName(e.target.value)} 
                            className="block w-full rounded-md border-gray-300 shadow-sm p-2" 
                            placeholder="Item Name (e.g., Blue T-Shirt)"
                            disabled={isLoading}
                        />
                        <input 
                            type="text" 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)} 
                            className="block w-full rounded-md border-gray-300 shadow-sm p-2" 
                            placeholder="Category (e.g., Top)"
                            disabled={isLoading}
                        />
                        <input 
                            type="text" 
                            value={color} 
                            onChange={(e) => setColor(e.target.value)} 
                            className="block w-full rounded-md border-gray-300 shadow-sm p-2" 
                            placeholder="Color (e.g., Blue)"
                            disabled={isLoading}
                        />
                        <input 
                            type="text" 
                            value={material} 
                            onChange={(e) => setMaterial(e.target.value)} 
                            className="block w-full rounded-md border-gray-300 shadow-sm p-2" 
                            placeholder="Material (optional, e.g., Cotton, Denim)"
                            disabled={isLoading}
                        />
                        <select 
                            value={occasion} 
                            onChange={(e) => setOccasion(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm p-2 bg-white"
                            disabled={isLoading}
                        >
                            <option value="">Occasion (optional)</option>
                            <option value="casual">Casual</option>
                            <option value="business">Business</option>
                            <option value="business-casual">Business Casual</option>
                            <option value="party">Party</option>
                            <option value="formal">Formal</option>
                            <option value="athletic">Athletic</option>
                            <option value="lounge">Lounge</option>
                            <option value="date-night">Date Night</option>
                            <option value="weekend">Weekend</option>
                        </select>
                        
                        {/* Availability Toggle */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Item Availability</label>
                                <p className="text-xs text-gray-500">Mark as unavailable if item is in laundry, damaged, etc.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAvailable(!isAvailable)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    isAvailable ? 'bg-indigo-600' : 'bg-gray-200'
                                }`}
                                disabled={isLoading}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        isAvailable ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={() => setShowModal(false)} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={isLoading || !imageFile} className="py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center gap-2">
                            {isSubmitting && <Spinner />}
                            {isSubmitting ? 'Saving...' : 'Save to Closet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddItemModal;
