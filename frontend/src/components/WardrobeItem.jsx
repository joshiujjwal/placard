import React from 'react';
import Icons from './Icons';

const WardrobeItem = ({ item, onDelete, isSelectMode, onSelectItem, isSelected }) => {
    const handleClick = () => {
        if (isSelectMode) {
            onSelectItem(item.id);
        }
    };

    return (
        <div className={`bg-white rounded-lg shadow-md overflow-hidden group relative transition-all duration-200 ${isSelectMode ? 'cursor-pointer' : ''} ${isSelected ? 'ring-4 ring-indigo-500' : ''}`} onClick={handleClick}>
            <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover" />
            {isSelected && (
                <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1">
                    <div className="w-4 h-4">{Icons.check}</div>
                </div>
            )}
            <div className="p-4">
                <h3 className="font-bold text-gray-800 truncate">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.category}</p>
            </div>
            {!isSelectMode && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600">
                        <div className="w-4 h-4">{Icons.trash}</div>
                    </button>
                </div>
            )}
        </div>
    );
};

export default WardrobeItem;