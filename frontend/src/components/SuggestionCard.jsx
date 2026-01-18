import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Button } from './ui/Button';

const getImageSource = (item) => {
    if (item.imageBase64) {
        return `data:image/jpeg;base64,${item.imageBase64}`;
    }
    return item.imageUrl || '';
};

export default function SuggestionCard({ suggestion, onSaveAsOutfit, isSaving }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        >
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <h3 className="font-semibold text-gray-900">{suggestion.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                    </div>
                    <span className="flex-shrink-0 bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-1 rounded-full">
                        AI Pick
                    </span>
                </div>
            </div>

            <div className="p-4">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
                    {suggestion.items.map((item, index) => (
                        <div key={item.id || index} className="relative group">
                            <img
                                src={getImageSource(item)}
                                alt={item.name}
                                className="w-full aspect-square object-cover rounded-lg"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center p-1">
                                <span className="text-white text-xs text-center line-clamp-2">{item.name}</span>
                            </div>
                            <span className="absolute bottom-1 left-1 bg-white/90 text-gray-700 text-xs px-1.5 py-0.5 rounded">
                                {item.category}
                            </span>
                        </div>
                    ))}
                </div>

                {suggestion.stylingTips && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                        <div className="flex items-start gap-2">
                            <span className="text-amber-600">💡</span>
                            <p className="text-sm text-amber-800">{suggestion.stylingTips}</p>
                        </div>
                    </div>
                )}

                <Button
                    onClick={() => onSaveAsOutfit(suggestion)}
                    loading={isSaving}
                    fullWidth
                    variant="outline"
                >
                    Save as Outfit
                </Button>
            </div>
        </motion.div>
    );
}
