import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import Icons from './Icons';

const getImageSource = (item) => {
    if (item.imageBase64) {
        return `data:image/jpeg;base64,${item.imageBase64}`;
    }
    return item.imageUrl || '';
};

export default function OutfitCard({ outfit, items, onDelete }) {
    const outfitItems = outfit.itemIds.map(id => items.find(item => item.id === id)).filter(Boolean);
    const unavailableItems = outfitItems.filter(item => !item.isAvailable);
    const hasUnavailableItems = unavailableItems.length > 0;

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className={`bg-white rounded-xl shadow-md overflow-hidden group relative transition-shadow hover:shadow-lg ${
                hasUnavailableItems ? 'ring-2 ring-red-200' : ''
            }`}
        >
            <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">{outfit.name}</h3>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {outfit.occasion && (
                                <span className="inline-flex items-center bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full">
                                    {outfit.occasion.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                            )}
                            {hasUnavailableItems && (
                                <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                    {unavailableItems.length} Unavailable
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => onDelete(outfit.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        aria-label="Delete outfit"
                    >
                        {Icons.trash}
                    </button>
                </div>
            </div>

            <div className="p-3 grid grid-cols-3 gap-1.5">
                {outfitItems.slice(0, 6).map(item => (
                    <div key={item.id} className="relative aspect-square">
                        <img
                            src={getImageSource(item)}
                            alt={item.name}
                            className={`w-full h-full object-cover rounded-lg ${
                                !item.isAvailable ? 'grayscale opacity-50' : ''
                            }`}
                            loading="lazy"
                        />
                        {!item.isAvailable && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs bg-white/80 text-gray-600 px-1 rounded">Unavailable</span>
                            </div>
                        )}
                    </div>
                ))}
                {outfitItems.length > 6 && (
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-500">+{outfitItems.length - 6}</span>
                    </div>
                )}
            </div>

            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                    {outfitItems.length} items • Created {new Date(outfit.createdAt?.toDate?.() || outfit.createdAt).toLocaleDateString()}
                </p>
            </div>
        </motion.div>
    );
}
