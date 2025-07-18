import React from 'react';
import Icons from './Icons';

export default function OutfitCard({ outfit, items, onDelete }) {
    const outfitItems = outfit.itemIds.map(id => items.find(item => item.id === id)).filter(Boolean);
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden group relative">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-gray-800">{outfit.name}</h3>
                <button onClick={() => onDelete(outfit.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">{Icons.trash}</button>
            </div>
            <div className="p-4 grid grid-cols-3 gap-2">
                {outfitItems.slice(0, 6).map(item => <img key={item.id} src={item.imageUrl} alt={item.name} className="w-full h-20 object-cover rounded-md" />)}
            </div>
        </div>
    );
};