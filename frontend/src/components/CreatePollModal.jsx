import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db, appId } from '../firebase/config';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { nanoid } from 'nanoid';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { showToast } from '../utils/toast';

const getImageSource = (item) => {
    if (item.imageBase64) {
        return `data:image/jpeg;base64,${item.imageBase64}`;
    }
    return item.imageUrl || '';
};

export default function CreatePollModal({ setShowModal, user, outfits, items }) {
    const [title, setTitle] = useState('');
    const [selectedOutfitA, setSelectedOutfitA] = useState(null);
    const [selectedOutfitB, setSelectedOutfitB] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1);

    const getOutfitItems = (outfit) => {
        if (!outfit) return [];
        return outfit.itemIds
            .map(id => items.find(item => item.id === id))
            .filter(Boolean);
    };

    const handleSelectOutfitA = (outfit) => {
        if (selectedOutfitB?.id === outfit.id) {
            showToast.error('Please select a different outfit');
            return;
        }
        setSelectedOutfitA(outfit);
        if (!selectedOutfitB) {
            setStep(2);
        }
    };

    const handleSelectOutfitB = (outfit) => {
        if (selectedOutfitA?.id === outfit.id) {
            showToast.error('Please select a different outfit');
            return;
        }
        setSelectedOutfitB(outfit);
    };

    const handleSubmit = async () => {
        if (!selectedOutfitA || !selectedOutfitB || !title.trim()) {
            showToast.error('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);
        try {
            const shareId = nanoid(10);

            const outfitAItems = getOutfitItems(selectedOutfitA);
            const outfitBItems = getOutfitItems(selectedOutfitB);

            const pollsCollectionPath = `artifacts/${appId}/users/${user.uid}/polls`;
            await addDoc(collection(db, pollsCollectionPath), {
                title: title.trim(),
                shareId,
                outfitAId: selectedOutfitA.id,
                outfitAName: selectedOutfitA.name,
                outfitASnapshot: outfitAItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    category: item.category,
                    imageBase64: item.imageBase64,
                })),
                outfitBId: selectedOutfitB.id,
                outfitBName: selectedOutfitB.name,
                outfitBSnapshot: outfitBItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    category: item.category,
                    imageBase64: item.imageBase64,
                })),
                votesA: 0,
                votesB: 0,
                createdAt: new Date(),
                userId: user.uid,
            });

            showToast.success('Poll created!');
            setShowModal(false);
        } catch (error) {
            console.error('Error creating poll:', error);
            showToast.error('Failed to create poll');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderOutfitGrid = (selectedOutfit, onSelect) => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1">
            {outfits.map((outfit) => {
                const outfitItems = getOutfitItems(outfit);
                const isSelected = selectedOutfit?.id === outfit.id;
                const isDisabled = (selectedOutfitA?.id === outfit.id && onSelect === handleSelectOutfitB) ||
                                   (selectedOutfitB?.id === outfit.id && onSelect === handleSelectOutfitA);

                return (
                    <button
                        key={outfit.id}
                        onClick={() => onSelect(outfit)}
                        disabled={isDisabled}
                        className={`relative p-2 rounded-xl border-2 transition-all ${
                            isSelected
                                ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                                : isDisabled
                                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                                    : 'border-gray-200 hover:border-indigo-300 bg-white'
                        }`}
                    >
                        <div className="grid grid-cols-2 gap-1 mb-2">
                            {outfitItems.slice(0, 4).map((item) => (
                                <img
                                    key={item.id}
                                    src={getImageSource(item)}
                                    alt={item.name}
                                    className="w-full aspect-square object-cover rounded"
                                />
                            ))}
                        </div>
                        <p className="text-xs font-medium text-gray-700 truncate">{outfit.name}</p>
                        {isSelected && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );

    const renderSelectedPreview = (outfit, label) => {
        const outfitItems = getOutfitItems(outfit);
        return (
            <div className="flex-1 p-3 bg-gray-50 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 mb-2">{label}</p>
                <div className="flex gap-1 overflow-x-auto pb-1">
                    {outfitItems.slice(0, 4).map((item) => (
                        <img
                            key={item.id}
                            src={getImageSource(item)}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded flex-shrink-0"
                        />
                    ))}
                </div>
                <p className="text-sm font-medium text-gray-800 mt-2 truncate">{outfit.name}</p>
            </div>
        );
    };

    if (outfits.length < 2) {
        return (
            <Modal
                isOpen={true}
                onClose={() => setShowModal(false)}
                title="Create Poll"
                size="md"
            >
                <div className="text-center py-8">
                    <div className="text-5xl mb-4">👗</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Need More Outfits
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Create at least 2 outfits to start a poll.
                    </p>
                    <Button onClick={() => setShowModal(false)}>Got it</Button>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            isOpen={true}
            onClose={() => setShowModal(false)}
            title={
                <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Create A/B Poll
                </span>
            }
            size="lg"
        >
            <div className="space-y-6">
                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                                step >= s ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
                            }`}>
                                {s}
                            </div>
                            {s < 3 && (
                                <div className={`w-8 h-1 mx-1 rounded transition-colors ${
                                    step > s ? 'bg-indigo-600' : 'bg-gray-200'
                                }`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step 1: Title */}
                {step === 1 && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Poll Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Which outfit should I wear?"
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            maxLength={100}
                        />
                        <p className="text-xs text-gray-500 mt-2">This title will be shown to voters</p>
                    </motion.div>
                )}

                {/* Step 2: Select Outfit A */}
                {step >= 1 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Option A - Select First Outfit
                        </label>
                        {renderOutfitGrid(selectedOutfitA, handleSelectOutfitA)}
                    </motion.div>
                )}

                {/* Step 3: Select Outfit B */}
                {step >= 2 && selectedOutfitA && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Option B - Select Second Outfit
                        </label>
                        {renderOutfitGrid(selectedOutfitB, handleSelectOutfitB)}
                    </motion.div>
                )}

                {/* Preview */}
                {selectedOutfitA && selectedOutfitB && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-4 border-t border-gray-200"
                    >
                        <p className="text-sm font-semibold text-gray-700 mb-3">Preview</p>
                        <div className="flex gap-4">
                            {renderSelectedPreview(selectedOutfitA, 'Option A')}
                            <div className="flex items-center">
                                <span className="text-2xl font-bold text-gray-300">VS</span>
                            </div>
                            {renderSelectedPreview(selectedOutfitB, 'Option B')}
                        </div>
                    </motion.div>
                )}

                {/* Actions */}
                <div className="flex justify-between pt-4 border-t border-gray-200">
                    <Button
                        variant="secondary"
                        onClick={() => {
                            if (step > 1) {
                                setStep(step - 1);
                            } else {
                                setShowModal(false);
                            }
                        }}
                        disabled={isSubmitting}
                    >
                        {step > 1 ? 'Back' : 'Cancel'}
                    </Button>
                    <Button
                        onClick={() => {
                            if (step === 1 && title.trim()) {
                                setStep(2);
                            } else if (selectedOutfitA && selectedOutfitB && title.trim()) {
                                handleSubmit();
                            }
                        }}
                        disabled={
                            isSubmitting ||
                            (step === 1 && !title.trim()) ||
                            (step >= 2 && (!selectedOutfitA || !selectedOutfitB))
                        }
                        loading={isSubmitting}
                    >
                        {selectedOutfitA && selectedOutfitB ? 'Create Poll' : 'Next'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
