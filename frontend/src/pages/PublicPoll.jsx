import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, increment } from 'firebase/firestore';
import { db, appId } from '../firebase/config';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';

const getImageSource = (item) => {
    if (item.imageBase64) {
        return `data:image/jpeg;base64,${item.imageBase64}`;
    }
    return item.imageUrl || '';
};

export default function PublicPoll() {
    const { shareId } = useParams();
    const [poll, setPoll] = useState(null);
    const [pollDoc, setPollDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [voted, setVoted] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [voting, setVoting] = useState(false);

    useEffect(() => {
        const hasVoted = localStorage.getItem(`poll_voted_${shareId}`);
        if (hasVoted) {
            setVoted(true);
            setSelectedOption(hasVoted);
        }
    }, [shareId]);

    useEffect(() => {
        const fetchPoll = async () => {
            try {
                const usersRef = collection(db, `artifacts/${appId}/users`);
                const usersSnapshot = await getDocs(usersRef);

                for (const userDoc of usersSnapshot.docs) {
                    const pollsRef = collection(db, `artifacts/${appId}/users/${userDoc.id}/polls`);
                    const q = query(pollsRef, where('shareId', '==', shareId));
                    const pollSnapshot = await getDocs(q);

                    if (!pollSnapshot.empty) {
                        const pollData = pollSnapshot.docs[0];
                        setPoll({ id: pollData.id, ...pollData.data() });
                        setPollDoc(pollData.ref);
                        setLoading(false);
                        return;
                    }
                }

                setError('Poll not found');
                setLoading(false);
            } catch (err) {
                console.error('Error fetching poll:', err);
                setError('Failed to load poll');
                setLoading(false);
            }
        };

        fetchPoll();
    }, [shareId]);

    const handleVote = async (option) => {
        if (voted || voting) return;

        setVoting(true);
        try {
            const updateData = option === 'A'
                ? { votesA: increment(1) }
                : { votesB: increment(1) };

            await updateDoc(pollDoc, updateData);

            localStorage.setItem(`poll_voted_${shareId}`, option);
            setVoted(true);
            setSelectedOption(option);

            setPoll(prev => ({
                ...prev,
                votesA: option === 'A' ? prev.votesA + 1 : prev.votesA,
                votesB: option === 'B' ? prev.votesB + 1 : prev.votesB,
            }));
        } catch (err) {
            console.error('Error voting:', err);
        } finally {
            setVoting(false);
        }
    };

    const getVotePercentage = (votesA, votesB, isA) => {
        const total = votesA + votesB;
        if (total === 0) return 50;
        return isA ? Math.round((votesA / total) * 100) : Math.round((votesB / total) * 100);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">Loading poll...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">😕</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Poll Not Found</h1>
                    <p className="text-gray-600 mb-6">This poll may have been deleted or the link is invalid.</p>
                    <Link to="/">
                        <Button>Go to Placard</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const totalVotes = poll.votesA + poll.votesB;
    const percentA = getVotePercentage(poll.votesA, poll.votesB, true);
    const percentB = getVotePercentage(poll.votesA, poll.votesB, false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Placard
                        </h1>
                    </Link>
                </div>

                {/* Poll Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">
                            {poll.title}
                        </h2>
                        <p className="text-sm text-gray-500 text-center mt-2">
                            {totalVotes} vote{totalVotes !== 1 ? 's' : ''} so far
                        </p>
                    </div>

                    <div className="p-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                            {/* Option A */}
                            <motion.button
                                onClick={() => handleVote('A')}
                                disabled={voted || voting}
                                whileHover={!voted ? { scale: 1.02 } : {}}
                                whileTap={!voted ? { scale: 0.98 } : {}}
                                className={`relative p-4 rounded-xl border-2 transition-all ${
                                    selectedOption === 'A'
                                        ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                                        : voted
                                            ? 'border-gray-200 bg-gray-50'
                                            : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/50'
                                }`}
                            >
                                <div className="absolute -top-3 left-4 bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                    A
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {poll.outfitASnapshot?.slice(0, 4).map((item, idx) => (
                                        <img
                                            key={idx}
                                            src={getImageSource(item)}
                                            alt={item.name}
                                            className="w-full aspect-square object-cover rounded-lg"
                                        />
                                    ))}
                                </div>

                                <p className="font-semibold text-gray-800 mb-2">{poll.outfitAName}</p>

                                {voted && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-gray-600">{poll.votesA} votes</span>
                                            <span className={`font-bold ${percentA > percentB ? 'text-green-600' : 'text-gray-500'}`}>
                                                {percentA}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-indigo-500"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentA}%` }}
                                                transition={{ duration: 0.5 }}
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {selectedOption === 'A' && (
                                    <div className="absolute top-2 right-2">
                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                            </motion.button>

                            {/* VS Divider (Mobile) */}
                            <div className="sm:hidden flex items-center justify-center -my-3">
                                <span className="bg-white px-4 py-2 rounded-full text-lg font-bold text-gray-300 shadow-sm border border-gray-100">
                                    VS
                                </span>
                            </div>

                            {/* Option B */}
                            <motion.button
                                onClick={() => handleVote('B')}
                                disabled={voted || voting}
                                whileHover={!voted ? { scale: 1.02 } : {}}
                                whileTap={!voted ? { scale: 0.98 } : {}}
                                className={`relative p-4 rounded-xl border-2 transition-all ${
                                    selectedOption === 'B'
                                        ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                                        : voted
                                            ? 'border-gray-200 bg-gray-50'
                                            : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50/50'
                                }`}
                            >
                                <div className="absolute -top-3 left-4 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                    B
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {poll.outfitBSnapshot?.slice(0, 4).map((item, idx) => (
                                        <img
                                            key={idx}
                                            src={getImageSource(item)}
                                            alt={item.name}
                                            className="w-full aspect-square object-cover rounded-lg"
                                        />
                                    ))}
                                </div>

                                <p className="font-semibold text-gray-800 mb-2">{poll.outfitBName}</p>

                                {voted && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-gray-600">{poll.votesB} votes</span>
                                            <span className={`font-bold ${percentB > percentA ? 'text-green-600' : 'text-gray-500'}`}>
                                                {percentB}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-purple-500"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentB}%` }}
                                                transition={{ duration: 0.5 }}
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {selectedOption === 'B' && (
                                    <div className="absolute top-2 right-2">
                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                            </motion.button>
                        </div>

                        {/* Voting Status */}
                        <div className="mt-6 text-center">
                            {voting && (
                                <div className="flex items-center justify-center gap-2 text-indigo-600">
                                    <LoadingSpinner size="sm" />
                                    <span>Recording your vote...</span>
                                </div>
                            )}
                            {voted && !voting && (
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-green-600 font-medium"
                                >
                                    Thanks for voting!
                                </motion.p>
                            )}
                            {!voted && !voting && (
                                <p className="text-gray-500 text-sm">
                                    Tap an outfit to vote
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 border-t border-gray-100">
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-3">
                                Want to create your own outfit polls?
                            </p>
                            <Link to="/">
                                <Button variant="outline" size="sm">
                                    Try Placard Free
                                </Button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
