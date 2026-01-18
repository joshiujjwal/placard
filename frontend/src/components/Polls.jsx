import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db, appId } from '../firebase/config';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { LoadingSpinner, LoadingState } from './ui/LoadingSpinner';
import { ConfirmModal } from './ui/Modal';
import { showToast } from '../utils/toast';
import CreatePollModal from './CreatePollModal';

const getImageSource = (item) => {
    if (item.imageBase64) {
        return `data:image/jpeg;base64,${item.imageBase64}`;
    }
    return item.imageUrl || '';
};

export default function Polls({ user, outfits, items }) {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => {
        if (!user) return;

        const pollsCollectionPath = `artifacts/${appId}/users/${user.uid}/polls`;
        const q = query(collection(db, pollsCollectionPath), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setPolls(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleDeletePoll = async (pollId) => {
        setDeletingId(pollId);
        try {
            const pollDocPath = `artifacts/${appId}/users/${user.uid}/polls/${pollId}`;
            await deleteDoc(doc(db, pollDocPath));
            showToast.success('Poll deleted');
        } catch {
            showToast.error('Failed to delete poll');
        } finally {
            setDeletingId(null);
            setConfirmDelete(null);
        }
    };

    const handleCopyLink = (poll) => {
        const url = `${window.location.origin}/poll/${poll.shareId}`;
        navigator.clipboard.writeText(url);
        showToast.success('Link copied to clipboard!');
    };

    const getVotePercentage = (votesA, votesB, isA) => {
        const total = votesA + votesB;
        if (total === 0) return 50;
        return isA ? Math.round((votesA / total) * 100) : Math.round((votesB / total) * 100);
    };

    if (loading) {
        return <LoadingState message="Loading polls..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Outfit Polls
                    </h2>
                    <p className="text-gray-600 mt-1">Get feedback on your outfit choices</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Poll
                </Button>
            </div>

            {/* Polls List */}
            {polls.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl"
                >
                    <div className="text-5xl mb-4">🗳️</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        No polls yet
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                        Create an A/B poll to get feedback from friends on which outfit to wear!
                    </p>
                    <Button onClick={() => setShowCreateModal(true)}>
                        Create Your First Poll
                    </Button>
                </motion.div>
            ) : (
                <div className="grid gap-4">
                    {polls.map((poll) => {
                        const totalVotes = poll.votesA + poll.votesB;
                        const percentA = getVotePercentage(poll.votesA, poll.votesB, true);
                        const percentB = getVotePercentage(poll.votesA, poll.votesB, false);

                        return (
                            <motion.div
                                key={poll.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                            >
                                <div className="p-4 border-b border-gray-100">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{poll.title}</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                                                {poll.createdAt?.toDate && (
                                                    <span> • {poll.createdAt.toDate().toLocaleDateString()}</span>
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleCopyLink(poll)}
                                                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Copy share link"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setConfirmDelete(poll.id)}
                                                disabled={deletingId === poll.id}
                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete poll"
                                            >
                                                {deletingId === poll.id ? (
                                                    <LoadingSpinner size="sm" />
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4">
                                    <div className="flex gap-6">
                                        {/* Option A */}
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">{poll.outfitAName}</span>
                                                <span className={`text-sm font-bold ${percentA > percentB ? 'text-green-600' : 'text-gray-500'}`}>
                                                    {percentA}%
                                                </span>
                                            </div>
                                            <div className="flex gap-1 mb-2">
                                                {poll.outfitASnapshot?.slice(0, 4).map((item, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={getImageSource(item)}
                                                        alt={item.name}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                ))}
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-indigo-500"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentA}%` }}
                                                    transition={{ duration: 0.5, delay: 0.2 }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{poll.votesA} votes</p>
                                        </div>

                                        <div className="flex items-center">
                                            <span className="text-lg font-bold text-gray-300">VS</span>
                                        </div>

                                        {/* Option B */}
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">{poll.outfitBName}</span>
                                                <span className={`text-sm font-bold ${percentB > percentA ? 'text-green-600' : 'text-gray-500'}`}>
                                                    {percentB}%
                                                </span>
                                            </div>
                                            <div className="flex gap-1 mb-2">
                                                {poll.outfitBSnapshot?.slice(0, 4).map((item, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={getImageSource(item)}
                                                        alt={item.name}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                ))}
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-purple-500"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentB}%` }}
                                                    transition={{ duration: 0.5, delay: 0.2 }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{poll.votesB} votes</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-4 pb-4">
                                    <button
                                        onClick={() => handleCopyLink(poll)}
                                        className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                        </svg>
                                        Share Poll
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Modals */}
            {showCreateModal && (
                <CreatePollModal
                    setShowModal={setShowCreateModal}
                    user={user}
                    outfits={outfits}
                    items={items}
                />
            )}

            <ConfirmModal
                isOpen={confirmDelete !== null}
                onClose={() => setConfirmDelete(null)}
                onConfirm={() => handleDeletePoll(confirmDelete)}
                title="Delete Poll"
                message="Are you sure you want to delete this poll? All votes will be lost."
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}
