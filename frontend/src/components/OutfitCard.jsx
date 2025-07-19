import React from 'react';
import Icons from './Icons';

// Helper function to get image source
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
        <div className={`bg-white rounded-lg shadow-md overflow-hidden group relative ${hasUnavailableItems ? 'border-2 border-red-200' : ''}`}>
            <div className="p-4 border-b">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800">{outfit.name}</h3>
                    <button onClick={() => onDelete(outfit.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">{Icons.trash}</button>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                    {outfit.occasion && (
                        <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
                            {outfit.occasion.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                    )}
                    {hasUnavailableItems && (
                        <span className="inline-block bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                            {unavailableItems.length} Unavailable
                        </span>
                    )}
                </div>
            </div>
            <div className="p-4 grid grid-cols-3 gap-2">
                {outfitItems.slice(0, 6).map(item => (
                    <div key={item.id} className="relative">
                        <img 
                            src={getImageSource(item)} 
                            alt={item.name} 
                            className={`w-full h-20 object-cover rounded-md ${!item.isAvailable ? 'grayscale opacity-60' : ''}`} 
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}