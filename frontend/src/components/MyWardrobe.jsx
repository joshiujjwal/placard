import React from 'react';
import Icons from './Icons';
import WardrobeItem from './WardrobeItem';

export default function MyWardrobe({ items, loading, isSelectMode, setIsSelectMode, selectedItems, setSelectedItems, onDeleteItem, onToggleAvailability, onSelectItem, onShowModal }) {
    // Get selected items with their details
    const selectedItemsDetails = selectedItems.map(id => items.find(item => item.id === id)).filter(Boolean);
    
    // Group selected items by category
    const selectedByCategory = selectedItemsDetails.reduce((acc, item) => {
        acc[item.category] = item;
        return acc;
    }, {});

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">My Wardrobe</h2>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => { setIsSelectMode(!isSelectMode); setSelectedItems([]); }} 
                        className={`py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                            isSelectMode 
                                ? 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-700' 
                                : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                    >
                        {isSelectMode ? 'Cancel Selection' : 'Create Outfit'}
                    </button>
                    <button 
                        onClick={onShowModal} 
                        className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 flex items-center gap-2 transition-all duration-200"
                    >
                        {Icons.add} Add Item
                    </button>
                </div>
            </div>
            
            {isSelectMode && (
                <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <div className="flex items-center gap-2 text-indigo-800 mb-3">
                        <div className="w-5 h-5">{Icons.info}</div>
                        <p className="font-medium">
                            {selectedItems.length === 0 
                                ? "Select items to create an outfit (one per category)" 
                                : `${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''} selected`
                            }
                        </p>
                    </div>
                    
                    {selectedItems.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(selectedByCategory).map(([category, item]) => (
                                <div key={category} className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-indigo-200">
                                    <span className="text-xs font-medium text-indigo-700">{category}</span>
                                    <span className="text-xs text-gray-600">•</span>
                                    <span className="text-xs text-gray-800 truncate max-w-20">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            {loading ? <p>Loading...</p> : items.length > 0 ? (
                <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 transition-all duration-300 ${
                    isSelectMode ? 'bg-indigo-25 p-4 rounded-lg' : ''
                }`}>
                    {items.map(item => (
                        <WardrobeItem 
                            key={item.id} 
                            item={item} 
                            onDelete={onDeleteItem} 
                            onToggleAvailability={onToggleAvailability} 
                            isSelectMode={isSelectMode} 
                            onSelectItem={onSelectItem} 
                            isSelected={selectedItems.includes(item.id)} 
                            isCategorySelected={selectedByCategory[item.category] && selectedByCategory[item.category].id !== item.id}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-lg shadow">
                    <div className="text-gray-400 mx-auto text-5xl flex items-center justify-center">{Icons.shirt}</div>
                    <h3 className="mt-4 text-xl font-semibold text-gray-800">Your Wardrobe is Empty</h3>
                    <p className="mt-1 text-gray-500">Click "Add Item" to start building your digital wardrobe.</p>
                </div>
            )}
        </>
    );
} 