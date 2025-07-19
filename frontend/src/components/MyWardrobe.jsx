import React from 'react';
import Icons from './Icons';
import WardrobeItem from './WardrobeItem';

export default function MyWardrobe({ items, loading, isSelectMode, setIsSelectMode, selectedItems, setSelectedItems, onDeleteItem, onToggleAvailability, onSelectItem, onShowModal }) {
    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">My Wardrobe</h2>
                <div className="flex items-center gap-4">
                    <button onClick={() => { setIsSelectMode(!isSelectMode); setSelectedItems([]); }} className={`py-2 px-4 rounded-lg font-semibold ${isSelectMode ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-200'}`}>{isSelectMode ? 'Cancel' : 'Create Outfit'}</button>
                    <button onClick={onShowModal} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 flex items-center gap-2">{Icons.add} Add Item</button>
                </div>
            </div>
            {loading ? <p>Loading...</p> : items.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {items.map(item => <WardrobeItem key={item.id} item={item} onDelete={onDeleteItem} onToggleAvailability={onToggleAvailability} isSelectMode={isSelectMode} onSelectItem={onSelectItem} isSelected={selectedItems.includes(item.id)} />)}
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