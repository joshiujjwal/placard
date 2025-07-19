import React from 'react';
import Icons from './Icons';

// Helper function to get image source
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
        <div 
            className={`
                bg-white rounded-lg shadow-md overflow-hidden group relative transition-all duration-300 
                ${isSelectMode && !isCategorySelected ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : ''} 
                ${isSelected ? 'ring-4 ring-indigo-500 shadow-xl scale-105' : ''} 
                ${!item.isAvailable ? 'opacity-60' : ''}
                ${isSelectMode && !isSelected && !isCategorySelected ? 'hover:ring-2 hover:ring-indigo-300' : ''}
                ${isCategorySelected ? 'opacity-50 cursor-not-allowed' : ''}
            `} 
            onClick={handleClick}
        >
            <img src={getImageSource(item)} alt={item.name} className={`w-full h-48 object-cover transition-all duration-300 ${!item.isAvailable ? 'grayscale' : ''}`} />
            
            {isSelected && (
                <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 animate-pulse">
                    <div className="w-4 h-4">{Icons.check}</div>
                </div>
            )}
            
            {isSelectMode && !isSelected && !isCategorySelected && (
                <div className="absolute top-2 right-2 bg-white bg-opacity-80 text-indigo-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-4 h-4">+</div>
                </div>
            )}
            
            {isCategorySelected && (
                <div className="absolute top-2 right-2 bg-gray-400 text-white rounded-full p-1">
                    <div className="w-4 h-4">🚫</div>
                </div>
            )}
            
            <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-800 truncate">{item.name}</h3>
                    {!item.isAvailable && (
                        <span className="inline-block bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                            Unavailable
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-500">{item.category}</p>
                {item.occasion && (
                    <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full mt-1">
                        {item.occasion.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                )}
            </div>
            
            {!isSelectMode && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            onToggleAvailability(item.id, !item.isAvailable); 
                        }} 
                        className={`p-2 rounded-full shadow-lg ${item.isAvailable ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
                        title={item.isAvailable ? 'Mark as unavailable' : 'Mark as available'}
                    >
                        <div className="w-4 h-4">{item.isAvailable ? '🚫' : '✅'}</div>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600">
                        <div className="w-4 h-4">{Icons.trash}</div>
                    </button>
                </div>
            )}
        </div>
    );
};

export default WardrobeItem;