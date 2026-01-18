import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import Icons from './Icons';
import OutfitCard from './OutfitCard';
import { OutfitsSkeleton } from './skeletons/WardrobeSkeleton';
import { Input } from './ui/Input';

const OCCASIONS = [
    { value: 'casual', label: 'Casual' },
    { value: 'business', label: 'Business' },
    { value: 'business-casual', label: 'Business Casual' },
    { value: 'party', label: 'Party' },
    { value: 'formal', label: 'Formal' },
    { value: 'athletic', label: 'Athletic' },
    { value: 'lounge', label: 'Lounge' },
    { value: 'date-night', label: 'Date Night' },
    { value: 'weekend', label: 'Weekend' }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function Outfits({ outfits, items, searchTerm, setSearchTerm, onDeleteOutfit, loading }) {
    const [occasionFilter, setOccasionFilter] = useState('');
    const [showUnavailable, setShowUnavailable] = useState(true);

    const filteredOutfits = outfits.filter(outfit => {
        const term = searchTerm.toLowerCase();
        const outfitNameMatch = outfit.name.toLowerCase().includes(term);
        const itemMatch = outfit.itemIds.some(itemId => {
            const item = items.find(i => i.id === itemId);
            return item && (
                item.name.toLowerCase().includes(term) ||
                item.category.toLowerCase().includes(term) ||
                item.color.toLowerCase().includes(term)
            );
        });
        const searchMatch = outfitNameMatch || itemMatch;

        const occasionMatch = !occasionFilter ||
            outfit.occasion === occasionFilter ||
            outfit.itemIds.some(itemId => {
                const item = items.find(i => i.id === itemId);
                return item && item.occasion === occasionFilter;
            });

        const outfitItems = outfit.itemIds.map(id => items.find(item => item.id === id)).filter(Boolean);
        const hasUnavailableItems = outfitItems.some(item => !item.isAvailable);
        const availabilityMatch = showUnavailable || !hasUnavailableItems;

        return searchMatch && occasionMatch && availabilityMatch;
    });

    return (
        <>
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">My Outfits</h2>
                    <div className="w-full sm:w-72">
                        <Input
                            placeholder="Search outfits..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            leftIcon={Icons.search}
                        />
                    </div>
                </div>

                {/* Occasion Filter */}
                <div className="mb-4">
                    <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => setOccasionFilter('')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                occasionFilter === ''
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
                            }`}
                        >
                            All
                        </button>
                        {OCCASIONS.map(occasion => (
                            <button
                                key={occasion.value}
                                onClick={() => setOccasionFilter(occasion.value)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                    occasionFilter === occasion.value
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
                                }`}
                            >
                                {occasion.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Availability Filter */}
                <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                    <input
                        type="checkbox"
                        checked={showUnavailable}
                        onChange={(e) => setShowUnavailable(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Show outfits with unavailable items
                </label>
            </div>

            {loading ? (
                <OutfitsSkeleton count={6} />
            ) : filteredOutfits.length > 0 ? (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                >
                    {filteredOutfits.map(outfit => (
                        <motion.div key={outfit.id} variants={itemVariants}>
                            <OutfitCard
                                outfit={outfit}
                                items={items}
                                onDelete={onDeleteOutfit}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 sm:py-20 bg-white rounded-2xl shadow-sm border border-gray-100"
                >
                    <div className="text-gray-300 mx-auto text-6xl flex items-center justify-center mb-4">
                        {Icons.sparkles}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">No Outfits Found</h3>
                    <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                        {searchTerm || occasionFilter
                            ? 'Try adjusting your search or filter to see more outfits.'
                            : 'Go to your closet, select items, and create your first outfit!'
                        }
                    </p>
                </motion.div>
            )}
        </>
    );
}
