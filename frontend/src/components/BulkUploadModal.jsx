import { useState, useCallback } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db, appId, model } from '../firebase/config';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { showToast } from '../utils/toast';

const MAX_FILES = 10;

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

const BulkUploadModal = ({ setShowModal, userId }) => {
    const [files, setFiles] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [results, setResults] = useState([]);

    const toBase64 = useCallback((file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = (err) => reject(err);
    }), []);

    const handleFilesChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > MAX_FILES) {
            showToast.error(`Maximum ${MAX_FILES} files allowed`);
            return;
        }

        const validFiles = selectedFiles.filter(file => {
            if (file.size > 5 * 1024 * 1024) {
                showToast.error(`${file.name} exceeds 5MB limit`);
                return false;
            }
            return file.type.startsWith('image/');
        });

        setFiles(validFiles);
        setResults([]);
    };

    const analyzeAndSaveItem = async (file, index) => {
        setCurrentIndex(index);

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
                throw new Error("Could not determine category");
            }

            const color = parsedJson.color || 'Unknown';
            const itemName = `${color} ${validatedCategory}`;

            const itemsCollectionPath = `artifacts/${appId}/users/${userId}/items`;
            await addDoc(collection(db, itemsCollectionPath), {
                name: itemName,
                category: validatedCategory,
                color: color,
                material: parsedJson.material || null,
                occasion: null,
                isAvailable: true,
                imageBase64: base64ImageData,
                createdAt: new Date(),
            });

            return { success: true, name: itemName, category: validatedCategory };
        } catch (error) {
            console.error(`Error processing ${file.name}:`, error);
            return { success: false, error: error.message || 'Failed to process' };
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            showToast.error('Please select files to upload');
            return;
        }

        setProcessing(true);
        setResults([]);

        const uploadResults = [];
        for (let i = 0; i < files.length; i++) {
            const result = await analyzeAndSaveItem(files[i], i);
            uploadResults.push({
                fileName: files[i].name,
                preview: URL.createObjectURL(files[i]),
                ...result
            });
            setResults([...uploadResults]);
        }

        setProcessing(false);
        setCurrentIndex(-1);

        const successCount = uploadResults.filter(r => r.success).length;
        if (successCount === files.length) {
            showToast.success(`All ${successCount} items added successfully!`);
        } else if (successCount > 0) {
            showToast.success(`${successCount} of ${files.length} items added`);
        } else {
            showToast.error('Failed to add items');
        }
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const getStatusIcon = (result) => {
        if (result.success) {
            return (
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </div>
            );
        }
        return (
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </div>
        );
    };

    const progressPercent = results.length > 0 ? Math.round((results.length / files.length) * 100) : 0;

    return (
        <Modal
            isOpen={true}
            onClose={() => !processing && setShowModal(false)}
            title={
                <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Bulk Upload
                </span>
            }
            size="lg"
        >
            <div className="space-y-6">
                {/* File Selection */}
                {!processing && results.length === 0 && (
                    <>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <label className="cursor-pointer">
                                <span className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-md shadow-indigo-200">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Select Images
                                </span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFilesChange}
                                    className="hidden"
                                />
                            </label>
                            <p className="text-sm text-gray-500 mt-3">
                                Select up to {MAX_FILES} images (max 5MB each)
                            </p>
                        </div>

                        {/* Selected Files Preview */}
                        {files.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-gray-800">
                                        Selected Files ({files.length})
                                    </h4>
                                    <button
                                        onClick={() => setFiles([])}
                                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                                    >
                                        Clear All
                                    </button>
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                    {files.map((file, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={file.name}
                                                className="w-full aspect-square object-cover rounded-lg"
                                            />
                                            <button
                                                onClick={() => removeFile(index)}
                                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                            >
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Processing State */}
                {processing && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Processing {currentIndex + 1} of {files.length}</span>
                            <span>{progressPercent}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-indigo-600"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>

                        {/* Current Item Preview */}
                        {currentIndex >= 0 && currentIndex < files.length && (
                            <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-xl">
                                <img
                                    src={URL.createObjectURL(files[currentIndex])}
                                    alt="Processing"
                                    className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800">{files[currentIndex].name}</p>
                                    <div className="flex items-center gap-2 text-sm text-indigo-600">
                                        <LoadingSpinner size="sm" />
                                        <span>Analyzing with AI...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Results */}
                {results.length > 0 && !processing && (
                    <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800">Upload Results</h4>
                        <div className="max-h-64 overflow-y-auto space-y-2">
                            {results.map((result, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center gap-3 p-3 rounded-lg ${
                                        result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                                    }`}
                                >
                                    <img
                                        src={result.preview}
                                        alt={result.fileName}
                                        className="w-12 h-12 object-cover rounded-lg"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-800 truncate">
                                            {result.success ? result.name : result.fileName}
                                        </p>
                                        <p className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                                            {result.success ? result.category : result.error}
                                        </p>
                                    </div>
                                    {getStatusIcon(result)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button
                        variant="secondary"
                        onClick={() => setShowModal(false)}
                        disabled={processing}
                    >
                        {results.length > 0 ? 'Close' : 'Cancel'}
                    </Button>
                    {results.length === 0 && (
                        <Button
                            onClick={handleUpload}
                            disabled={files.length === 0 || processing}
                            loading={processing}
                        >
                            Upload {files.length > 0 ? `(${files.length})` : ''}
                        </Button>
                    )}
                    {results.length > 0 && !processing && (
                        <Button
                            onClick={() => {
                                setFiles([]);
                                setResults([]);
                            }}
                        >
                            Upload More
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default BulkUploadModal;
