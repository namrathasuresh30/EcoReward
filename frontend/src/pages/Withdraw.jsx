import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Wallet, Info, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function Withdraw() {
    const { user, fetchProfile } = useAuth();
    const [points, setPoints] = useState('');
    const [method, setMethod] = useState('PayPal');
    const [details, setDetails] = useState('');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const CONVERSION_RATE = 1.0; // 10 points = 10 Rupees (1 pt = 1 ₹)

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/withdrawals/my');
            setHistory(res.data);
        } catch (err) {
            console.error('Failed to fetch withdrawal history');
        }
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const pointsAmount = parseInt(points);
        if (isNaN(pointsAmount) || pointsAmount <= 0) {
            setError('Please enter a valid amount of points.');
            return;
        }

        if (pointsAmount > user.points) {
            setError('Insufficient points.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/withdrawals/', {
                points_amount: pointsAmount,
                payment_method: method,
                payment_details: details
            });
            setSuccess(`Withdrawal request submitted! ₹${(pointsAmount * CONVERSION_RATE).toFixed(2)} will be sent to your ${method} account.`);
            setPoints('');
            setDetails('');
            fetchProfile(); // Refresh points balance
            fetchHistory(); // Refresh history table
        } catch (err) {
            setError(err.response?.data?.detail || 'Withdrawal failed.');
        } finally {
            setLoading(true);
            // Artificial delay for UX
            setTimeout(() => setLoading(false), 500);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left Side: Form */}
                <div className="flex-1">
                    <div className="card p-8 mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-xl bg-primary/20 text-primary">
                                <Wallet className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Withdraw Points</h1>
                                <p className="text-gray-400">Convert your hard-earned points to real cash.</p>
                            </div>
                        </div>

                        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-8 flex items-start gap-4">
                            <Info className="w-5 h-5 text-primary mt-1 shrink-0" />
                            <div className="text-sm">
                                <p className="text-white font-medium">Conversion Rate: 10 Points = ₹10.00</p>
                                <p className="text-gray-400">Minimum withdrawal is 100 points (₹100.00). Processing takes 1-3 business days.</p>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6 flex items-center gap-3">
                                <AlertCircle className="w-5 h-5" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="bg-primary/10 border border-primary/50 text-primary p-4 rounded-xl mb-6 flex items-center gap-3 animate-pulse">
                                <CheckCircle className="w-5 h-5" />
                                <p className="text-sm">{success}</p>
                            </div>
                        )}

                        <form onSubmit={handleWithdraw} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Points to Withdraw (Current: {user?.points || 0})</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        required
                                        min="100"
                                        step="10"
                                        className="input-field pr-20"
                                        placeholder="Min 100"
                                        value={points}
                                        onChange={(e) => setPoints(e.target.value)}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                                        ≈ ₹{(parseInt(points || 0) * CONVERSION_RATE).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Payment Method</label>
                                <select
                                    className="input-field appearance-none cursor-pointer"
                                    value={method}
                                    onChange={(e) => setMethod(e.target.value)}
                                >
                                    <option value="PayPal">PayPal</option>
                                    <option value="UPI">UPI ID</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Payment Details (Email / ID / Acc No.)</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    placeholder={method === 'PayPal' ? 'example@email.com' : method === 'UPI' ? 'user@upi' : 'Bank details...'}
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || (user?.points || 0) < 100}
                                className="btn-primary w-full py-4 text-lg font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : (user?.points || 0) < 100 ? 'Minimum 100 requirement' : 'Confirm Withdrawal'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Side: History */}
                <div className="w-full md:w-[400px]">
                    <div className="card p-6 h-full">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            Recent Withdrawals
                        </h2>

                        <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                            {history.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <p>No withdrawal history yet.</p>
                                </div>
                            ) : (
                                history.map((w) => (
                                    <div key={w.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-bold text-white">₹{w.currency_amount.toFixed(2)}</p>
                                                <p className="text-xs text-gray-500">{w.points_amount} points</p>
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase py-1 px-2 rounded-full ${w.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                                w.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                                                    'bg-yellow-500/10 text-yellow-500'
                                                }`}>
                                                {w.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400">{new Date(w.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
