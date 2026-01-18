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

const WardrobeItem = ({ item, onDelete, onToggleAvailability, isSelectMode, onSelectItem, isSelected, isCategorySelected }) => {
    const handleClick = () => {
        if (isSelectMode && !isCategorySelected) {
            onSelectItem(item.id);
        }
    };

    return (
        <motion.div
            whileHover={!isCategorySelected ? { y: -4 } : undefined}
            whileTap={isSelectMode && !isCategorySelected ? { scale: 0.98 } : undefined}
            className={`
                bg-white rounded-xl shadow-md overflow-hidden group relative transition-all duration-300
                ${isSelectMode && !isCategorySelected ? 'cursor-pointer' : ''}
                ${isSelected ? 'ring-4 ring-indigo-500 shadow-xl' : ''}
                ${!item.isAvailable ? 'opacity-60' : ''}
                ${isSelectMode && !isSelected && !isCategorySelected ? 'hover:ring-2 hover:ring-indigo-300' : ''}
                ${isCategorySelected ? 'opacity-40 cursor-not-allowed' : ''}
            `}
            onClick={handleClick}
        >
            <div className="relative overflow-hidden">
                <img
                    src={getImageSource(item)}
                    alt={item.name}
                    className={`w-full h-40 sm:h-48 object-cover transition-all duration-300 ${!item.isAvailable ? 'grayscale' : ''}`}
                    loading="lazy"
                />

                {/* Selection indicator */}
                {isSelected && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1.5 shadow-lg"
                    >
                        <div className="w-4 h-4">{Icons.check}</div>
                    </motion.div>
                )}

                {/* Hover add indicator */}
                {isSelectMode && !isSelected && !isCategorySelected && (
                    <div className="absolute top-2 right-2 bg-white/90 text-indigo-600 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm">
                        <div className="w-4 h-4 font-bold text-center leading-4">+</div>
                    </div>
                )}

                {/* Category already selected indicator */}
                {isCategorySelected && (
                    <div className="absolute inset-0 bg-gray-900/20 flex items-center justify-center">
                        <span className="bg-white/90 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                            Category selected
                        </span>
                    </div>
                )}

                {/* Action buttons (non-select mode) */}
                {!isSelectMode && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-1.5">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleAvailability(item.id, !item.isAvailable);
                            }}
                            className={`p-2 rounded-full shadow-lg transition-colors ${
                                item.isAvailable
                                    ? 'bg-amber-500 hover:bg-amber-600'
                                    : 'bg-emerald-500 hover:bg-emerald-600'
                            } text-white`}
                            title={item.isAvailable ? 'Mark as unavailable' : 'Mark as available'}
                            aria-label={item.isAvailable ? 'Mark as unavailable' : 'Mark as available'}
                        >
                            <span className="w-4 h-4 block text-sm">{item.isAvailable ? '🚫' : '✅'}</span>
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                            className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                            title="Delete item"
                            aria-label="Delete item"
                        >
                            <div className="w-4 h-4">{Icons.trash}</div>
                        </button>
                    </div>
                )}
            </div>

            <div className="p-3 sm:p-4">
                <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800 truncate text-sm sm:text-base">{item.name}</h3>
                    {!item.isAvailable && (
                        <span className="flex-shrink-0 bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">
                            Unavailable
                        </span>
                    )}
                </div>
                <p className="text-xs sm:text-sm text-gray-500">{item.category}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                    {item.color && (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color.toLowerCase() }}></span>
                            {item.color}
                        </span>
                    )}
                    {item.occasion && (
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full">
                            {item.occasion.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default WardrobeItem;
