import { useState, useEffect } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db, appId, model } from '../firebase/config';
import Icons from './Icons';
import Spinner from './Spinner';

// --- Category Mapping System ---
// Maps AI-detected item types to standardized categories based on body parts
const CATEGORY_MAPPING = {
    // Tops - anything worn on the upper body
    't-shirt': 'Top',
    'tshirt': 'Top',
    'shirt': 'Top',
    'dress shirt': 'Top',
    'blouse': 'Top',
    'sweater': 'Top',
    'hoodie': 'Top',
    'jacket': 'Top',
    'cardigan': 'Top',
    'tank top': 'Top',
    'polo': 'Top',
    'henley': 'Top',
    'turtleneck': 'Top',
    'crop top': 'Top',
    'tube top': 'Top',
    'camisole': 'Top',
    'bodysuit': 'Top',
    
    // Bottoms - anything worn on the lower body
    'jeans': 'Bottom',
    'pants': 'Bottom',
    'trousers': 'Bottom',
    'shorts': 'Bottom',
    'skirt': 'Bottom',
    'leggings': 'Bottom',
    'joggers': 'Bottom',
    'chinos': 'Bottom',
    'khakis': 'Bottom',
    'dress pants': 'Bottom',
    'slacks': 'Bottom',
    'cargo pants': 'Bottom',
    'sweatpants': 'Bottom',
    'track pants': 'Bottom',
    'culottes': 'Bottom',
    'palazzo pants': 'Bottom',
    'jeggings': 'Bottom',
    
    // Outerwear - worn over other clothes
    'coat': 'Outerwear',
    'blazer': 'Outerwear',
    'suit jacket': 'Outerwear',
    'bomber jacket': 'Outerwear',
    'leather jacket': 'Outerwear',
    'denim jacket': 'Outerwear',
    'parka': 'Outerwear',
    'puffer jacket': 'Outerwear',
    'trench coat': 'Outerwear',
    'peacoat': 'Outerwear',
    'windbreaker': 'Outerwear',
    'vest': 'Outerwear',
    
    // Shoes - footwear
    'sneakers': 'Shoes',
    'shoes': 'Shoes',
    'boots': 'Shoes',
    'heels': 'Shoes',
    'flats': 'Shoes',
    'sandals': 'Shoes',
    'loafers': 'Shoes',
    'oxfords': 'Shoes',
    'pumps': 'Shoes',
    'mules': 'Shoes',
    'espadrilles': 'Shoes',
    'sliders': 'Shoes',
    'slides': 'Shoes',
    'tennis shoes': 'Shoes',
    'running shoes': 'Shoes',
    'athletic shoes': 'Shoes',
    'dress shoes': 'Shoes',
    'casual shoes': 'Shoes',
    
    // Dresses - one-piece garments
    'dress': 'Dress',
    'sundress': 'Dress',
    'cocktail dress': 'Dress',
    'evening dress': 'Dress',
    'maxi dress': 'Dress',
    'mini dress': 'Dress',
    'midi dress': 'Dress',
    'shift dress': 'Dress',
    'wrap dress': 'Dress',
    'bodycon dress': 'Dress',
    'a-line dress': 'Dress',
    
    // Accessories - smaller items
    'hat': 'Accessory',
    'cap': 'Accessory',
    'beanie': 'Accessory',
    'scarf': 'Accessory',
    'belt': 'Accessory',
    'bag': 'Accessory',
    'purse': 'Accessory',
    'handbag': 'Accessory',
    'backpack': 'Accessory',
    'wallet': 'Accessory',
    'jewelry': 'Accessory',
    'necklace': 'Accessory',
    'earrings': 'Accessory',
    'bracelet': 'Accessory',
    'watch': 'Accessory',
    'sunglasses': 'Accessory',
    'glasses': 'Accessory',
    'tie': 'Accessory',
    'bow tie': 'Accessory',
    'socks': 'Accessory',
    'stockings': 'Accessory',
    'tights': 'Accessory',
};

// Standardized category options
const CATEGORY_OPTIONS = [
    'Top',
    'Bottom', 
    'Dress',
    'Outerwear',
    'Shoes',
    'Accessory'
];

// Function to map AI response to standardized category
function mapToStandardCategory(aiItemType) {
    if (!aiItemType) return '';
    
    const normalizedType = aiItemType.toLowerCase().trim();
    
    // Direct match
    if (CATEGORY_MAPPING[normalizedType]) {
        return CATEGORY_MAPPING[normalizedType];
    }
    
    // Partial match for variations
    for (const [key, category] of Object.entries(CATEGORY_MAPPING)) {
        if (normalizedType.includes(key) || key.includes(normalizedType)) {
            return category;
        }
    }
    
    // Default fallback based on common patterns
    if (normalizedType.includes('shirt') || normalizedType.includes('top') || normalizedType.includes('blouse')) {
        return 'Top';
    }
    if (normalizedType.includes('pant') || normalizedType.includes('jean') || normalizedType.includes('short')) {
        return 'Bottom';
    }
    if (normalizedType.includes('dress')) {
        return 'Dress';
    }
    if (normalizedType.includes('shoe') || normalizedType.includes('boot') || normalizedType.includes('sneaker')) {
        return 'Shoes';
    }
    if (normalizedType.includes('jacket') || normalizedType.includes('coat') || normalizedType.includes('blazer')) {
        return 'Outerwear';
    }
    
    return ''; // Return empty if no match found
}

// Function to validate and standardize category from AI response
function validateAndStandardizeCategory(aiCategory) {
    if (!aiCategory) return '';
    
    const normalizedCategory = aiCategory.trim();
    
    // Direct match with standardized categories
    if (CATEGORY_OPTIONS.includes(normalizedCategory)) {
        return normalizedCategory;
    }
    
    // Try mapping if it's not a direct match
    return mapToStandardCategory(aiCategory);
}

// --- New Helper Function for Parsing AI Response ---
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
            
            // Updated prompt to specifically request standardized categories
            const prompt = `Analyze this image of a clothing item. Identify the type of clothing and categorize it into one of these EXACT categories: Top, Bottom, Dress, Outerwear, Shoes, or Accessory.

IMPORTANT: The category must be exactly one of these 6 options:
- "Top" (for shirts, t-shirts, blouses, sweaters, tank tops, etc.)
- "Bottom" (for pants, jeans, shorts, skirts, leggings, etc.)
- "Dress" (for any one-piece dress)
- "Outerwear" (for jackets, coats, blazers, etc.)
- "Shoes" (for any footwear)
- "Accessory" (for hats, bags, jewelry, belts, etc.)

Also identify the primary color and material/fabric if visible.

Respond in JSON format with these exact keys: 'category', 'color', and 'material'.

Example response: {"category": "Top", "color": "Blue", "material": "Cotton"}`;
            
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

            // Validate and standardize the category from AI response
            const validatedCategory = validateAndStandardizeCategory(parsedJson.category);
            
            if (!validatedCategory) {
                throw new Error("AI could not determine a valid category. Please select manually.");
            }
            
            setCategory(validatedCategory);
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
                        <select 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)} 
                            className="block w-full rounded-md border-gray-300 shadow-sm p-2 bg-white" 
                            disabled={isLoading}
                        >
                            <option value="">Select Category</option>
                            {CATEGORY_OPTIONS.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
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
