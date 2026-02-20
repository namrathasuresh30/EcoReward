import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Award, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await api.get('/uploads/dashboard');
            setStats(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-400">Loading dashboard...</div>;
    if (!stats) return <div className="text-center py-20 text-red-400">Failed to load payload</div>;

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold">Welcome, {user?.name}!</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 flex items-center gap-4 bg-gradient-to-br from-panel to-gray-800 border-primary/20">
                    <div className="p-4 bg-primary/10 rounded-xl text-primary">
                        <Award className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm font-medium">Total Points</p>
                        <h3 className="text-3xl font-bold text-white">{stats.points}</h3>
                    </div>
                </div>

                <div className="card p-6 flex items-center gap-4">
                    <div className="p-4 bg-emerald-500/10 rounded-xl text-emerald-500">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm font-medium">Approved Uploads</p>
                        <h3 className="text-3xl font-bold text-white">{stats.total_approved}</h3>
                    </div>
                </div>

                <div className="card p-6 flex items-center gap-4">
                    <div className="p-4 bg-red-500/10 rounded-xl text-red-500">
                        <XCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm font-medium">Rejected Uploads</p>
                        <h3 className="text-3xl font-bold text-white">{stats.total_rejected}</h3>
                    </div>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" /> Recent Uploads
                    </h2>
                </div>
                {stats.history.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No uploads yet. Go upload some trash!</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-800/50 text-gray-400">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Image</th>
                                    <th className="px-6 py-4 font-medium">AI Prediction</th>
                                    <th className="px-6 py-4 font-medium">Confidence</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {stats.history.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-800/30 transition">
                                        <td className="px-6 py-4">
                                            <a href={`${API_BASE}${record.image_url}`} target="_blank" rel="noopener noreferrer">
                                                <img src={`${API_BASE}${record.image_url}`} alt="Trash" className="w-12 h-12 rounded object-cover border border-gray-700 hover:opacity-80 transition" />
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-white">{record.prediction}</td>
                                        <td className="px-6 py-4">{(record.confidence * 100).toFixed(1)}%</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${record.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                {record.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">
                                            {new Date(record.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
