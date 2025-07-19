import React, { useState } from 'react';
import Icons from './Icons';
import OutfitCard from './OutfitCard';

export default function Outfits({ outfits, items, searchTerm, setSearchTerm, onDeleteOutfit, user }) {
    const [occasionFilter, setOccasionFilter] = useState('');
    const [showUnavailable, setShowUnavailable] = useState(true);
    
    const filteredOutfits = outfits.filter(outfit => {
        // Search term filtering
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
        
        // Occasion filtering - check both outfit occasion and individual item occasions
        const occasionMatch = !occasionFilter || 
            outfit.occasion === occasionFilter ||
            outfit.itemIds.some(itemId => {
                const item = items.find(i => i.id === itemId);
                return item && item.occasion === occasionFilter;
            });
        
        // Availability filtering
        const outfitItems = outfit.itemIds.map(id => items.find(item => item.id === id)).filter(Boolean);
        const hasUnavailableItems = outfitItems.some(item => !item.isAvailable);
        const availabilityMatch = showUnavailable || !hasUnavailableItems;
        
        return searchMatch && occasionMatch && availabilityMatch;
    });

    return (
        <>
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-3xl font-bold text-gray-800">My Outfits</h2>
                    <div className="relative w-full max-w-xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">{Icons.search}</div>
                        <input
                            type="text"
                            placeholder="Search outfits..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>
                
                {/* Occasion Filter */}
                <div className="flex flex-wrap gap-2 mb-3">
                    <button
                        onClick={() => setOccasionFilter('')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            occasionFilter === '' 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        All Occasions
                    </button>
                    {[
                        { value: 'casual', label: 'Casual' },
                        { value: 'business', label: 'Business' },
                        { value: 'business-casual', label: 'Business Casual' },
                        { value: 'party', label: 'Party' },
                        { value: 'formal', label: 'Formal' },
                        { value: 'athletic', label: 'Athletic' },
                        { value: 'lounge', label: 'Lounge' },
                        { value: 'date-night', label: 'Date Night' },
                        { value: 'weekend', label: 'Weekend' }
                    ].map(occasion => (
                        <button
                            key={occasion.value}
                            onClick={() => setOccasionFilter(occasion.value)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                occasionFilter === occasion.value 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {occasion.label}
                        </button>
                    ))}
                </div>
                
                {/* Availability Filter */}
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <input
                            type="checkbox"
                            checked={showUnavailable}
                            onChange={(e) => setShowUnavailable(e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        Show outfits with unavailable items
                    </label>
                </div>
            </div>
            {filteredOutfits.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOutfits.map(outfit => (
                        <OutfitCard 
                            key={outfit.id} 
                            outfit={outfit} 
                            items={items} 
                            onDelete={onDeleteOutfit}
                            user={user}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-lg shadow">
                    <div className="text-gray-400 mx-auto text-5xl flex items-center justify-center">{Icons.sparkles}</div>
                    <h3 className="mt-4 text-xl font-semibold text-gray-800">No Outfits Found</h3>
                    <p className="mt-1 text-gray-500">
                        {searchTerm || occasionFilter 
                            ? `Try adjusting your search or occasion filter to see more outfits.` 
                            : `Go to your closet, select items, and create your first outfit!`
                        }
                    </p>
                </div>
            )}
        </>
    );
} 