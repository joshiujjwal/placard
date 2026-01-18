import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc } from 'firebase/firestore';
import { db, appId } from '../firebase/config';
import { useAIStylist } from '../hooks/useAIStylist';
import SuggestionCard from './SuggestionCard';
import { Button } from './ui/Button';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { showToast } from '../utils/toast';
import Icons from './Icons';

const OCCASIONS = [
    { value: '', label: 'Any Occasion' },
    { value: 'casual', label: 'Casual' },
    { value: 'business', label: 'Business' },
    { value: 'business-casual', label: 'Business Casual' },
    { value: 'party', label: 'Party' },
    { value: 'formal', label: 'Formal' },
    { value: 'athletic', label: 'Athletic' },
    { value: 'date-night', label: 'Date Night' },
    { value: 'weekend', label: 'Weekend' },
];

const getImageSource = (item) => {
    if (item.imageBase64) {
        return `data:image/jpeg;base64,${item.imageBase64}`;
    }
    return item.imageUrl || '';
};

export default function AIStylist({ items, user }) {
    const [selectedOccasion, setSelectedOccasion] = useState('');
    const [lockedItems, setLockedItems] = useState([]);
    const [showItemPicker, setShowItemPicker] = useState(false);
    const [savingId, setSavingId] = useState(null);

    const { suggestions, loading, error, generateSuggestions, clearSuggestions } = useAIStylist(items);

    const availableItems = items.filter(item => item.isAvailable !== false);

    const toggleLockedItem = (item) => {
        setLockedItems(prev => {
            const exists = prev.find(i => i.id === item.id);
            if (exists) {
                return prev.filter(i => i.id !== item.id);
            }
            if (prev.length >= 3) {
                showToast.error('You can only lock up to 3 items');
                return prev;
            }
            return [...prev, item];
        });
    };

    const handleGenerate = () => {
        generateSuggestions({
            occasion: selectedOccasion,
            lockedItems,
        });
    };

    const handleSaveAsOutfit = async (suggestion) => {
        if (!user) return;

        setSavingId(suggestion.id);
        try {
            const outfitsCollectionPath = `artifacts/${appId}/users/${user.uid}/outfits`;
            await addDoc(collection(db, outfitsCollectionPath), {
                name: suggestion.name,
                occasion: selectedOccasion || null,
                itemIds: suggestion.items.map(item => item.id),
                createdAt: new Date(),
                aiGenerated: true,
            });
            showToast.success('Outfit saved!');
        } catch (err) {
            console.error('Error saving outfit:', err);
            showToast.error('Failed to save outfit');
        } finally {
            setSavingId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
                        {Icons.sparkles} AI Stylist
                    </h2>
                    <p className="text-gray-600 mt-1">Get personalized outfit suggestions from AI</p>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                {/* Occasion Filter */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        What's the occasion?
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {OCCASIONS.map(occasion => (
                            <button
                                key={occasion.value}
                                onClick={() => setSelectedOccasion(occasion.value)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                    selectedOccasion === occasion.value
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {occasion.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Locked Items */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-semibold text-gray-700">
                            Build outfit around specific items (optional)
                        </label>
                        <button
                            onClick={() => setShowItemPicker(!showItemPicker)}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            {showItemPicker ? 'Hide' : 'Select items'}
                        </button>
                    </div>

                    {lockedItems.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {lockedItems.map(item => (
                                <motion.div
                                    key={item.id}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-center gap-2 bg-indigo-100 px-3 py-1.5 rounded-full"
                                >
                                    <img
                                        src={getImageSource(item)}
                                        alt={item.name}
                                        className="w-6 h-6 rounded-full object-cover"
                                    />
                                    <span className="text-sm font-medium text-indigo-800">{item.name}</span>
                                    <button
                                        onClick={() => toggleLockedItem(item)}
                                        className="text-indigo-600 hover:text-indigo-800"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <AnimatePresence>
                        {showItemPicker && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 p-3 bg-gray-50 rounded-lg max-h-48 overflow-y-auto">
                                    {availableItems.map(item => {
                                        const isLocked = lockedItems.some(i => i.id === item.id);
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => toggleLockedItem(item)}
                                                className={`relative rounded-lg overflow-hidden aspect-square transition-all ${
                                                    isLocked ? 'ring-2 ring-indigo-500' : 'hover:ring-2 hover:ring-indigo-300'
                                                }`}
                                            >
                                                <img
                                                    src={getImageSource(item)}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                {isLocked && (
                                                    <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Generate Button */}
                <div className="flex gap-3">
                    <Button
                        onClick={handleGenerate}
                        loading={loading}
                        disabled={availableItems.length < 3}
                        size="lg"
                        className="flex-1"
                    >
                        {loading ? 'Generating...' : 'Generate Outfit Ideas'}
                    </Button>
                    {suggestions.length > 0 && (
                        <Button
                            onClick={clearSuggestions}
                            variant="secondary"
                            size="lg"
                        >
                            Clear
                        </Button>
                    )}
                </div>

                {availableItems.length < 3 && (
                    <p className="text-sm text-amber-600 mt-2">
                        Add at least 3 available items to your wardrobe to get suggestions.
                    </p>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-4"
                >
                    <p className="text-red-700">{error}</p>
                </motion.div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">AI is analyzing your wardrobe...</p>
                </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Outfit Suggestions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {suggestions.map((suggestion) => (
                            <SuggestionCard
                                key={suggestion.id}
                                suggestion={suggestion}
                                onSaveAsOutfit={handleSaveAsOutfit}
                                isSaving={savingId === suggestion.id}
                            />
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Empty State */}
            {!loading && suggestions.length === 0 && !error && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl"
                >
                    <div className="text-5xl mb-4">✨</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Let AI style your outfits
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                        Select an occasion, optionally lock specific items you want to wear,
                        and let our AI suggest complete outfit combinations from your wardrobe.
                    </p>
                </motion.div>
            )}
        </div>
    );
}
