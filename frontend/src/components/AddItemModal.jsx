import { useState, useEffect, useCallback } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db, appId, model } from '../firebase/config';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import Icons from './Icons';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { showToast } from '../utils/toast';
import { useBackgroundRemoval } from '../hooks/useBackgroundRemoval';

// --- Category Mapping System ---
const CATEGORY_MAPPING = {
    't-shirt': 'Top', 'tshirt': 'Top', 'shirt': 'Top', 'dress shirt': 'Top',
    'blouse': 'Top', 'sweater': 'Top', 'hoodie': 'Top', 'jacket': 'Top',
    'cardigan': 'Top', 'tank top': 'Top', 'polo': 'Top', 'henley': 'Top',
    'turtleneck': 'Top', 'crop top': 'Top', 'tube top': 'Top',
    'camisole': 'Top', 'bodysuit': 'Top',
    'jeans': 'Bottom', 'pants': 'Bottom', 'trousers': 'Bottom', 'shorts': 'Bottom',
    'skirt': 'Bottom', 'leggings': 'Bottom', 'joggers': 'Bottom', 'chinos': 'Bottom',
    'khakis': 'Bottom', 'dress pants': 'Bottom', 'slacks': 'Bottom',
    'cargo pants': 'Bottom', 'sweatpants': 'Bottom', 'track pants': 'Bottom',
    'culottes': 'Bottom', 'palazzo pants': 'Bottom', 'jeggings': 'Bottom',
    'coat': 'Outerwear', 'blazer': 'Outerwear', 'suit jacket': 'Outerwear',
    'bomber jacket': 'Outerwear', 'leather jacket': 'Outerwear',
    'denim jacket': 'Outerwear', 'parka': 'Outerwear', 'puffer jacket': 'Outerwear',
    'trench coat': 'Outerwear', 'peacoat': 'Outerwear', 'windbreaker': 'Outerwear',
    'vest': 'Outerwear',
    'sneakers': 'Shoes', 'shoes': 'Shoes', 'boots': 'Shoes', 'heels': 'Shoes',
    'flats': 'Shoes', 'sandals': 'Shoes', 'loafers': 'Shoes', 'oxfords': 'Shoes',
    'pumps': 'Shoes', 'mules': 'Shoes', 'espadrilles': 'Shoes', 'sliders': 'Shoes',
    'slides': 'Shoes', 'tennis shoes': 'Shoes', 'running shoes': 'Shoes',
    'athletic shoes': 'Shoes', 'dress shoes': 'Shoes', 'casual shoes': 'Shoes',
    'dress': 'Dress', 'sundress': 'Dress', 'cocktail dress': 'Dress',
    'evening dress': 'Dress', 'maxi dress': 'Dress', 'mini dress': 'Dress',
    'midi dress': 'Dress', 'shift dress': 'Dress', 'wrap dress': 'Dress',
    'bodycon dress': 'Dress', 'a-line dress': 'Dress',
    'hat': 'Accessory', 'cap': 'Accessory', 'beanie': 'Accessory',
    'scarf': 'Accessory', 'belt': 'Accessory', 'bag': 'Accessory',
    'purse': 'Accessory', 'handbag': 'Accessory', 'backpack': 'Accessory',
    'wallet': 'Accessory', 'jewelry': 'Accessory', 'necklace': 'Accessory',
    'earrings': 'Accessory', 'bracelet': 'Accessory', 'watch': 'Accessory',
    'sunglasses': 'Accessory', 'glasses': 'Accessory', 'tie': 'Accessory',
    'bow tie': 'Accessory', 'socks': 'Accessory', 'stockings': 'Accessory',
    'tights': 'Accessory',
};

const CATEGORY_OPTIONS = ['Top', 'Bottom', 'Dress', 'Outerwear', 'Shoes', 'Accessory'];

const OCCASION_OPTIONS = [
    { value: 'casual', label: 'Casual' },
    { value: 'business', label: 'Business' },
    { value: 'business-casual', label: 'Business Casual' },
    { value: 'party', label: 'Party' },
    { value: 'formal', label: 'Formal' },
    { value: 'athletic', label: 'Athletic' },
    { value: 'lounge', label: 'Lounge' },
    { value: 'date-night', label: 'Date Night' },
    { value: 'weekend', label: 'Weekend' },
];

function mapToStandardCategory(aiItemType) {
    if (!aiItemType) return '';
    const normalizedType = aiItemType.toLowerCase().trim();
    if (CATEGORY_MAPPING[normalizedType]) return CATEGORY_MAPPING[normalizedType];
    for (const [key, category] of Object.entries(CATEGORY_MAPPING)) {
        if (normalizedType.includes(key) || key.includes(normalizedType)) return category;
    }
    if (normalizedType.includes('shirt') || normalizedType.includes('top') || normalizedType.includes('blouse')) return 'Top';
    if (normalizedType.includes('pant') || normalizedType.includes('jean') || normalizedType.includes('short')) return 'Bottom';
    if (normalizedType.includes('dress')) return 'Dress';
    if (normalizedType.includes('shoe') || normalizedType.includes('boot') || normalizedType.includes('sneaker')) return 'Shoes';
    if (normalizedType.includes('jacket') || normalizedType.includes('coat') || normalizedType.includes('blazer')) return 'Outerwear';
    return '';
}

function validateAndStandardizeCategory(aiCategory) {
    if (!aiCategory) return '';
    const normalizedCategory = aiCategory.trim();
    if (CATEGORY_OPTIONS.includes(normalizedCategory)) return normalizedCategory;
    return mapToStandardCategory(aiCategory);
}

function parseAIResponse(responseText) {
    let cleaned = responseText.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    cleaned = cleaned.replace(/'/g, '"');
    return JSON.parse(cleaned);
}

const AddItemModal = ({ setShowModal, userId }) => {
    const [itemName, setItemName] = useState('');
    const [category, setCategory] = useState('');
    const [color, setColor] = useState('');
    const [material, setMaterial] = useState('');
    const [occasion, setOccasion] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    const [removeBackground, setRemoveBackground] = useState(false);

    const {
        processing: bgProcessing,
        progress: bgProgress,
        removeBackgroundFromBase64,
    } = useBackgroundRemoval();

    useEffect(() => {
        if (color && category) {
            setItemName(`${color} ${category}`);
        }
    }, [color, category]);

    const toBase64 = useCallback((file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = (err) => reject(err);
    }), []);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

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
        setStep(2);

        try {
            const base64ImageData = await toBase64(file);
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

            const result = await model.generateContent(request);
            const responseText = await result.response.text();
            const parsedJson = parseAIResponse(responseText);
            const validatedCategory = validateAndStandardizeCategory(parsedJson.category);

            if (!validatedCategory) {
                throw new Error("AI could not determine a valid category. Please select manually.");
            }

            setCategory(validatedCategory);
            setColor(parsedJson.color || '');
            setMaterial(parsedJson.material || '');
            showToast.success('AI analysis complete!');
        } catch (err) {
            console.error("Error analyzing image:", err);
            setAnalysisError("AI analysis failed. Please enter details manually.");
            showToast.error('AI analysis failed. Please fill in details manually.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!itemName || !category || !color || !imageFile || !userId) {
            showToast.error('Please fill in all required fields');
            return;
        }
        setIsSubmitting(true);

        try {
            let imageBase64 = await toBase64(imageFile);

            if (removeBackground) {
                const toastId = showToast.loading('Removing background...');
                const processed = await removeBackgroundFromBase64(imageBase64);
                showToast.dismiss(toastId);
                if (processed) {
                    imageBase64 = processed;
                    showToast.success('Background removed!');
                } else {
                    showToast.error('Background removal failed, using original image');
                }
            }

            const itemsCollectionPath = `artifacts/${appId}/users/${userId}/items`;
            await addDoc(collection(db, itemsCollectionPath), {
                name: itemName,
                category,
                color,
                material: material || null,
                occasion: occasion || null,
                isAvailable: isAvailable,
                imageBase64,
                createdAt: new Date(),
            });
            showToast.success('Item added to your wardrobe!');
            setShowModal(false);
        } catch (error) {
            console.error("Error adding item:", error);
            showToast.error('Failed to add item. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isLoading = isAnalyzing || isSubmitting || bgProcessing;

    return (
        <Modal
            isOpen={true}
            onClose={() => setShowModal(false)}
            title={
                <span className="flex items-center gap-2">
                    {Icons.sparkles} Add New Item
                </span>
            }
            size="lg"
        >
            <form onSubmit={handleSubmit}>
                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    {[1, 2].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                                step >= s ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
                            }`}>
                                {s}
                            </div>
                            {s < 2 && (
                                <div className={`w-12 h-1 mx-2 rounded transition-colors ${
                                    step > s ? 'bg-indigo-600' : 'bg-gray-200'
                                }`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step 1: Image Upload */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Step 1: Add an Image
                    </label>
                    <div className={`border-2 border-dashed rounded-xl transition-colors ${
                        preview ? 'border-indigo-300 bg-indigo-50/50' : 'border-gray-300 hover:border-indigo-400'
                    }`}>
                        {preview ? (
                            <div className="p-4 flex items-center gap-4">
                                <img src={preview} alt="Preview" className="h-24 w-24 object-cover rounded-lg shadow-sm" />
                                <div className="flex-1">
                                    {isAnalyzing ? (
                                        <div className="flex items-center gap-3 text-indigo-600">
                                            <LoadingSpinner size="sm" />
                                            <span className="font-medium">Analyzing image...</span>
                                        </div>
                                    ) : analysisError ? (
                                        <p className="text-red-600 text-sm">{analysisError}</p>
                                    ) : (
                                        <div className="space-y-1">
                                            <p className="text-green-600 font-medium flex items-center gap-1">
                                                {Icons.check} Analysis complete
                                            </p>
                                            <p className="text-sm text-gray-500">Detected: {category} ({color})</p>
                                        </div>
                                    )}
                                </div>
                                <label className="cursor-pointer text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                                    Change
                                    <input type="file" className="sr-only" onChange={handleFileChange} accept="image/*" disabled={isLoading} />
                                </label>
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <div className="flex justify-center gap-4 mb-4">
                                    <label className="cursor-pointer inline-flex items-center gap-2 bg-white py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                        <i className="fa-solid fa-upload"></i>
                                        Upload File
                                        <input type="file" className="sr-only" onChange={handleFileChange} accept="image/*" disabled={isLoading} />
                                    </label>
                                    <label className="cursor-pointer inline-flex items-center gap-2 bg-indigo-600 text-white py-2.5 px-4 rounded-lg shadow-sm text-sm font-medium hover:bg-indigo-700 transition-colors">
                                        <i className="fa-solid fa-camera"></i>
                                        Use Camera
                                        <input type="file" capture="environment" className="sr-only" onChange={handleFileChange} accept="image/*" disabled={isLoading} />
                                    </label>
                                </div>
                                <p className="text-sm text-gray-500">AI will automatically analyze your clothing item</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Step 2: Confirm Details */}
                <AnimatePresence>
                    {step >= 2 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Step 2: Confirm Details
                            </label>
                            <div className="space-y-4 bg-gray-50 rounded-xl p-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Item Name *</label>
                                    <input
                                        type="text"
                                        value={itemName}
                                        onChange={(e) => setItemName(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="e.g., Blue T-Shirt"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Category *</label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            disabled={isLoading}
                                        >
                                            <option value="">Select...</option>
                                            {CATEGORY_OPTIONS.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Color *</label>
                                        <input
                                            type="text"
                                            value={color}
                                            onChange={(e) => setColor(e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="e.g., Blue"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Material</label>
                                        <input
                                            type="text"
                                            value={material}
                                            onChange={(e) => setMaterial(e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="e.g., Cotton"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Occasion</label>
                                        <select
                                            value={occasion}
                                            onChange={(e) => setOccasion(e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            disabled={isLoading}
                                        >
                                            <option value="">Select...</option>
                                            {OCCASION_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Available</p>
                                        <p className="text-xs text-gray-500">Mark unavailable if in laundry</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsAvailable(!isAvailable)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            isAvailable ? 'bg-indigo-600' : 'bg-gray-300'
                                        }`}
                                        disabled={isLoading}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                            isAvailable ? 'translate-x-6' : 'translate-x-1'
                                        }`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Remove Background</p>
                                        <p className="text-xs text-gray-500">AI-powered background removal</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setRemoveBackground(!removeBackground)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            removeBackground ? 'bg-indigo-600' : 'bg-gray-300'
                                        }`}
                                        disabled={isLoading}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                            removeBackground ? 'translate-x-6' : 'translate-x-1'
                                        }`} />
                                    </button>
                                </div>

                                {bgProcessing && (
                                    <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                        <div className="flex items-center gap-3 text-indigo-700">
                                            <LoadingSpinner size="sm" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">Removing background...</p>
                                                <div className="mt-1 h-1.5 bg-indigo-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-600 transition-all duration-300"
                                                        style={{ width: `${bgProgress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setShowModal(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading || !imageFile || !itemName || !category || !color}
                        loading={isSubmitting}
                    >
                        Save to Closet
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddItemModal;
