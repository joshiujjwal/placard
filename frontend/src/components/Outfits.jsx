import React from 'react';
import Icons from './Icons';
import OutfitCard from './OutfitCard';

export default function Outfits({ outfits, items, searchTerm, setSearchTerm, onDeleteOutfit }) {
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
        return outfitNameMatch || itemMatch;
    });

    return (
        <>
            <div className="flex justify-between items-center mb-6">
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
            {filteredOutfits.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOutfits.map(outfit => <OutfitCard key={outfit.id} outfit={outfit} items={items} onDelete={onDeleteOutfit} />)}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-lg shadow">
                    <div className="text-gray-400 mx-auto text-5xl flex items-center justify-center">{Icons.sparkles}</div>
                    <h3 className="mt-4 text-xl font-semibold text-gray-800">No Outfits Found</h3>
                    <p className="mt-1 text-gray-500">{searchTerm ? `Clear your search to see all outfits.` : `Go to your closet, select items, and create your first outfit!`}</p>
                </div>
            )}
        </>
    );
} 