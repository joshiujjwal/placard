import React, { useState, useEffect, useCallback } from 'react';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, query, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { auth, db, appId } from '../firebase/config';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import AddItemModal from './AddItemModal';
import BulkUploadModal from './BulkUploadModal';
import MyWardrobe from './MyWardrobe';
import Outfits from './Outfits';
import UserProfile from './UserProfile';
import VirtualTryOn from './VirtualTryOn';
import AIStylist from './AIStylist';
import Polls from './Polls';
import { showToast } from '../utils/toast';
import { Button } from './ui/Button';
import { ConfirmModal } from './ui/Modal';

const tabs = [
    { id: 'closet', label: 'My Closet', icon: '👕' },
    { id: 'outfits', label: 'Outfits', icon: '👗' },
    { id: 'ai-stylist', label: 'AI Stylist', icon: '🤖' },
    { id: 'polls', label: 'Polls', icon: '🗳️' },
    { id: 'virtual-tryon', label: 'Try-On', icon: '✨' },
    { id: 'profile', label: 'Profile', icon: '👤' },
];

const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
};

export default function MainApp({ user }) {
    const [activeTab, setActiveTab] = useState('closet');
    const [items, setItems] = useState([]);
    const [outfits, setOutfits] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [outfitName, setOutfitName] = useState('');
    const [outfitOccasion, setOutfitOccasion] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, id: null });

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const itemsCollectionPath = `artifacts/${appId}/users/${user.uid}/items`;
        const outfitsCollectionPath = `artifacts/${appId}/users/${user.uid}/outfits`;

        const unsubItems = onSnapshot(query(collection(db, itemsCollectionPath)), (snapshot) => {
            setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        const unsubOutfits = onSnapshot(query(collection(db, outfitsCollectionPath)), (snapshot) => {
            setOutfits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => { unsubItems(); unsubOutfits(); };
    }, [user]);

    const handleDeleteItem = useCallback((itemId) => {
        setConfirmModal({ isOpen: true, type: 'item', id: itemId });
    }, []);

    const handleDeleteOutfit = useCallback((outfitId) => {
        setConfirmModal({ isOpen: true, type: 'outfit', id: outfitId });
    }, []);

    const confirmDelete = async () => {
        const { type, id } = confirmModal;
        try {
            if (type === 'item') {
                const itemDocPath = `artifacts/${appId}/users/${user.uid}/items/${id}`;
                await deleteDoc(doc(db, itemDocPath));
                showToast.success('Item deleted successfully');
            } else if (type === 'outfit') {
                const outfitDocPath = `artifacts/${appId}/users/${user.uid}/outfits/${id}`;
                await deleteDoc(doc(db, outfitDocPath));
                showToast.success('Outfit deleted successfully');
            }
        } catch {
            showToast.error('Failed to delete. Please try again.');
        }
        setConfirmModal({ isOpen: false, type: null, id: null });
    };

    const handleToggleAvailability = async (itemId, isAvailable) => {
        try {
            const itemDocPath = `artifacts/${appId}/users/${user.uid}/items/${itemId}`;
            await updateDoc(doc(db, itemDocPath), { isAvailable });
            showToast.success(isAvailable ? 'Item marked as available' : 'Item marked as unavailable');
        } catch {
            showToast.error('Failed to update item');
        }
    };

    const handleSelectItem = (itemId) => {
        const itemToSelect = items.find(item => item.id === itemId);
        if (!itemToSelect) return;

        setSelectedItems(prev => {
            if (prev.includes(itemId)) {
                return prev.filter(id => id !== itemId);
            }

            const existingItemOfSameCategory = prev.find(selectedId => {
                const selectedItem = items.find(item => item.id === selectedId);
                return selectedItem && selectedItem.category === itemToSelect.category;
            });

            if (existingItemOfSameCategory) {
                return prev.map(id => id === existingItemOfSameCategory ? itemId : id);
            } else {
                return [...prev, itemId];
            }
        });
    };

    const handleSaveOutfit = async () => {
        if (selectedItems.length < 2 || !outfitName.trim()) {
            showToast.error('Please select at least 2 items and provide a name');
            return;
        }
        try {
            const outfitsCollectionPath = `artifacts/${appId}/users/${user.uid}/outfits`;
            await addDoc(collection(db, outfitsCollectionPath), {
                name: outfitName,
                occasion: outfitOccasion || null,
                itemIds: selectedItems,
                createdAt: new Date()
            });
            showToast.success('Outfit saved successfully!');
            setOutfitName('');
            setOutfitOccasion('');
            setSelectedItems([]);
            setIsSelectMode(false);
        } catch {
            showToast.error('Failed to save outfit');
        }
    };

    const handleLogout = () => {
        signOut(auth).catch(error => {
            console.error("Error signing out: ", error);
            showToast.error('Failed to sign out');
        });
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'closet':
                return (
                    <MyWardrobe
                        items={items}
                        loading={loading}
                        isSelectMode={isSelectMode}
                        setIsSelectMode={setIsSelectMode}
                        selectedItems={selectedItems}
                        setSelectedItems={setSelectedItems}
                        onDeleteItem={handleDeleteItem}
                        onToggleAvailability={handleToggleAvailability}
                        onSelectItem={handleSelectItem}
                        onShowModal={() => setShowModal(true)}
                        onShowBulkUpload={() => setShowBulkUpload(true)}
                    />
                );
            case 'outfits':
                return (
                    <Outfits
                        outfits={outfits}
                        items={items}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        onDeleteOutfit={handleDeleteOutfit}
                        user={user}
                    />
                );
            case 'ai-stylist':
                return <AIStylist items={items} user={user} />;
            case 'polls':
                return <Polls user={user} outfits={outfits} items={items} />;
            case 'virtual-tryon':
                return <VirtualTryOn user={user} outfits={outfits} items={items} />;
            case 'profile':
                return <UserProfile user={user} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Placard
                    </h1>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                        Sign Out
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Desktop Tabs */}
                <div className="hidden sm:block mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs" role="tablist">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                role="tab"
                                aria-selected={activeTab === tab.id}
                                aria-controls={`panel-${tab.id}`}
                                className={`
                                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                                    transition-colors duration-200
                                    ${activeTab === tab.id
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                                `}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Mobile Tabs - Horizontal Scroll */}
                <div className="sm:hidden mb-6 -mx-4 px-4">
                    <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm
                                    whitespace-nowrap transition-all duration-200
                                    ${activeTab === tab.id
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                                    }
                                `}
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Page Content with Animations */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.2 }}
                        id={`panel-${activeTab}`}
                        role="tabpanel"
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Outfit Creation Footer */}
            <AnimatePresence>
                {isSelectMode && selectedItems.length > 0 && (
                    <motion.footer
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-lg border-t border-gray-200 p-4 z-40"
                    >
                        <div className="max-w-7xl mx-auto">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-full text-sm">
                                        {selectedItems.length} items
                                    </div>
                                </div>
                                <div className="flex-grow flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="text"
                                        value={outfitName}
                                        onChange={e => setOutfitName(e.target.value)}
                                        placeholder="Name your outfit..."
                                        maxLength={50}
                                        className="flex-1 rounded-lg border border-gray-300 shadow-sm px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                                    />
                                    <select
                                        value={outfitOccasion}
                                        onChange={e => setOutfitOccasion(e.target.value)}
                                        className="rounded-lg border border-gray-300 shadow-sm px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                                    >
                                        <option value="">Occasion...</option>
                                        <option value="casual">Casual</option>
                                        <option value="business">Business</option>
                                        <option value="business-casual">Business Casual</option>
                                        <option value="party">Party</option>
                                        <option value="formal">Formal</option>
                                        <option value="athletic">Athletic</option>
                                        <option value="lounge">Lounge</option>
                                        <option value="date-night">Date Night</option>
                                        <option value="weekend">Weekend</option>
                                    </select>
                                </div>
                                <Button onClick={handleSaveOutfit} size="lg">
                                    Save Outfit
                                </Button>
                            </div>
                        </div>
                    </motion.footer>
                )}
            </AnimatePresence>

            {/* Modals */}
            {showModal && <AddItemModal setShowModal={setShowModal} userId={user.uid} />}
            {showBulkUpload && <BulkUploadModal setShowModal={setShowBulkUpload} userId={user.uid} />}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, type: null, id: null })}
                onConfirm={confirmDelete}
                title={confirmModal.type === 'item' ? 'Delete Item' : 'Delete Outfit'}
                message={`Are you sure you want to delete this ${confirmModal.type}? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}
