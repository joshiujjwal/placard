import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, query, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { auth, db, appId } from '../firebase/config';
import AddItemModal from './AddItemModal';
import MyWardrobe from './MyWardrobe';
import Outfits from './Outfits';
import UserProfile from './UserProfile';

export default function MainApp({ user }) {
    const [activeTab, setActiveTab] = useState('closet');
    const [items, setItems] = useState([]);
    const [outfits, setOutfits] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [outfitName, setOutfitName] = useState('');
    const [outfitOccasion, setOutfitOccasion] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

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

    const handleDeleteItem = async (itemId) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            const itemDocPath = `artifacts/${appId}/users/${user.uid}/items/${itemId}`;
            await deleteDoc(doc(db, itemDocPath));
        }
    };

    const handleToggleAvailability = async (itemId, isAvailable) => {
        const itemDocPath = `artifacts/${appId}/users/${user.uid}/items/${itemId}`;
        await updateDoc(doc(db, itemDocPath), { isAvailable });
    };

    const handleSelectItem = (itemId) => {
        setSelectedItems(prev =>
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        );
    };

    const handleDeleteOutfit = async (outfitId) => {
        if (window.confirm("Are you sure you want to delete this outfit?")) {
            const outfitDocPath = `artifacts/${appId}/users/${user.uid}/outfits/${outfitId}`;
            await deleteDoc(doc(db, outfitDocPath));
        }
    };

    const handleSaveOutfit = async () => {
        if (selectedItems.length < 2 || !outfitName.trim()) {
            alert("Please select at least 2 items and provide a name for the outfit.");
            return;
        }
        const outfitsCollectionPath = `artifacts/${appId}/users/${user.uid}/outfits`;
        await addDoc(collection(db, outfitsCollectionPath), { 
            name: outfitName, 
            occasion: outfitOccasion || null,
            itemIds: selectedItems, 
            createdAt: new Date() 
        });
        setOutfitName('');
        setOutfitOccasion('');
        setSelectedItems([]);
        setIsSelectMode(false);
    };

    const handleLogout = () => {
        signOut(auth).catch(error => console.error("Error signing out: ", error));
    };

    const renderCloset = () => (
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
        />
    );

    const renderOutfits = () => (
        <Outfits
            outfits={outfits}
            items={items}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onDeleteOutfit={handleDeleteOutfit}
            user={user}
        />
    );

    const renderProfile = () => (
        <UserProfile user={user} />
    );

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Placard</h1>
                    <button
                        onClick={handleLogout}
                        className="text-gray-600 hover:text-gray-900 font-medium"
                    >
                        Sign Out
                    </button>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                         <button onClick={() => setActiveTab('closet')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'closet' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>My Closet</button>
                        <button onClick={() => setActiveTab('outfits')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'outfits' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Outfits</button>
                        <button onClick={() => setActiveTab('profile')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Profile</button>
                    </nav>
                </div>
                {activeTab === 'closet' && renderCloset()}
                {activeTab === 'outfits' && renderOutfits()}
                {activeTab === 'profile' && renderProfile()}
            </main>
            {isSelectMode && selectedItems.length > 0 && (
                <footer className="sticky bottom-0 bg-white shadow-lg border-t p-4 z-40">
                    <div className="max-w-7xl mx-auto flex items-center gap-4">
                        <p className="font-semibold">{selectedItems.length} items selected</p>
                        <div className="flex-grow flex gap-2">
                            <input 
                                type="text" 
                                value={outfitName} 
                                onChange={e => setOutfitName(e.target.value)} 
                                placeholder="Name your outfit..." 
                                className="flex-1 rounded-md border-gray-300 shadow-sm p-2" 
                            />
                            <select 
                                value={outfitOccasion} 
                                onChange={e => setOutfitOccasion(e.target.value)}
                                className="rounded-md border-gray-300 shadow-sm p-2 bg-white"
                            >
                                <option value="">Select occasion...</option>
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
                        <button onClick={handleSaveOutfit} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700">Save Outfit</button>
                    </div>
                </footer>
            )}
            {showModal && <AddItemModal setShowModal={setShowModal} userId={user.uid} />}
        </div>
    );
};