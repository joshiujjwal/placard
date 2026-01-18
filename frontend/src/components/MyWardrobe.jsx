import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import Icons from './Icons';
import WardrobeItem from './WardrobeItem';
import { WardrobeSkeleton } from './skeletons/WardrobeSkeleton';
import { Button } from './ui/Button';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function MyWardrobe({
    items,
    loading,
    isSelectMode,
    setIsSelectMode,
    selectedItems,
    setSelectedItems,
    onDeleteItem,
    onToggleAvailability,
    onSelectItem,
    onShowModal,
    onShowBulkUpload
}) {
    const selectedItemsDetails = selectedItems.map(id => items.find(item => item.id === id)).filter(Boolean);

    const selectedByCategory = selectedItemsDetails.reduce((acc, item) => {
        acc[item.category] = item;
        return acc;
    }, {});

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">My Wardrobe</h2>
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto flex-wrap">
                    <Button
                        variant={isSelectMode ? 'primary' : 'secondary'}
                        onClick={() => { setIsSelectMode(!isSelectMode); setSelectedItems([]); }}
                        size="sm"
                        className="flex-1 sm:flex-none"
                    >
                        {isSelectMode ? 'Cancel' : 'Create Outfit'}
                    </Button>
                    <Button
                        onClick={onShowBulkUpload}
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none"
                    >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Bulk
                    </Button>
                    <Button
                        onClick={onShowModal}
                        icon={Icons.add}
                        size="sm"
                        className="flex-1 sm:flex-none"
                    >
                        Add Item
                    </Button>
                </div>
            </div>

            {isSelectMode && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl"
                >
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
                                <motion.div
                                    key={category}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-indigo-200 shadow-sm"
                                >
                                    <span className="text-xs font-semibold text-indigo-700">{category}</span>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-700 truncate max-w-24">{item.name}</span>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {loading ? (
                <WardrobeSkeleton count={10} />
            ) : items.length > 0 ? (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 transition-all duration-300 ${
                        isSelectMode ? 'p-4 bg-indigo-50/50 rounded-xl' : ''
                    }`}
                >
                    {items.map(item => (
                        <motion.div key={item.id} variants={itemVariants}>
                            <WardrobeItem
                                item={item}
                                onDelete={onDeleteItem}
                                onToggleAvailability={onToggleAvailability}
                                isSelectMode={isSelectMode}
                                onSelectItem={onSelectItem}
                                isSelected={selectedItems.includes(item.id)}
                                isCategorySelected={selectedByCategory[item.category] && selectedByCategory[item.category].id !== item.id}
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
                        {Icons.shirt}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Your Wardrobe is Empty</h3>
                    <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                        Click "Add Item" to start building your digital wardrobe.
                    </p>
                    <Button onClick={onShowModal} className="mt-6" icon={Icons.add}>
                        Add Your First Item
                    </Button>
                </motion.div>
            )}
        </>
    );
}
