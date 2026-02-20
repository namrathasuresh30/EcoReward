import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Award, Gift, CheckCircle } from 'lucide-react';

export default function Rewards() {
    const { user, fetchProfile } = useAuth();
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchRewards();
    }, []);

    const fetchRewards = async () => {
        try {
            const res = await api.get('/rewards/');
            setRewards(res.data);
        } catch (error) {
            console.error('Failed to fetch rewards', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async (rewardId) => {
        setMessage(null);
        try {
            const res = await api.post(`/rewards/redeem/${rewardId}`);
            setMessage({ type: 'success', text: res.data.message });
            fetchProfile(); // Update UI points
            fetchRewards(); // Update UI available quantity
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to redeem reward' });
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-400">Loading rewards...</div>;

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Award className="w-8 h-8 text-primary" /> Reward Store
                </h1>
                <div className="bg-primary/20 text-primary px-4 py-2 rounded-lg font-bold border border-primary/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    Balance: {user?.points} pts
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/50' : 'bg-red-500/10 text-red-500 border border-red-500/50'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : null}
                    {message.text}
                </div>
            )}

            {rewards.length === 0 ? (
                <div className="card p-12 text-center text-gray-500">
                    No rewards available at the moment. Check back later!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rewards.map(reward => (
                        <div key={reward.id} className="card p-6 flex flex-col hover:border-primary/50 transition-colors group">
                            <div className="p-4 bg-gray-800 rounded-xl mb-4 text-primary group-hover:scale-110 transition-transform origin-left inline-block self-start">
                                <Gift className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{reward.reward_name}</h3>
                            <p className="text-gray-400 text-sm mb-6 flex-grow">{reward.description || 'Exclusive reward for eco-friendly users.'}</p>

                            <div className="flex items-center justify-between mt-auto">
                                <div>
                                    <span className="block text-2xl font-bold text-white">{reward.points_required}</span>
                                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Points</span>
                                </div>

                                <button
                                    onClick={() => handleRedeem(reward.id)}
                                    disabled={user?.points < reward.points_required || reward.available_quantity <= 0}
                                    className="btn-primary disabled:opacity-50 disabled:hover:bg-primary disabled:cursor-not-allowed"
                                >
                                    {reward.available_quantity <= 0 ? 'Out of Stock' : 'Redeem'}
                                </button>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500 text-center flex justify-between">
                                <span>Stock tracking enabled</span>
                                <span className={reward.available_quantity <= 5 ? "text-red-400" : ""}>{reward.available_quantity} left</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
