import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, LogOut, Award, UploadCloud, LayoutDashboard, Wallet } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-dark border-b border-gray-800 text-gray-200">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
                    <Leaf className="w-6 h-6" />
                    EcoReward
                </Link>

                {user && (
                    <div className="flex items-center gap-6">
                        <Link to="/dashboard" className="flex items-center gap-2 hover:text-primary transition">
                            <LayoutDashboard className="w-5 h-5" /> Dashboard
                        </Link>
                        <Link to="/upload" className="flex items-center gap-2 hover:text-primary transition">
                            <UploadCloud className="w-5 h-5" /> Upload
                        </Link>
                        <Link to="/rewards" className="flex items-center gap-2 hover:text-primary transition">
                            <Award className="w-5 h-5" /> Rewards
                        </Link>
                        <Link to="/withdraw" className="flex items-center gap-3 hover:text-primary transition">
                            <Wallet className="w-5 h-5" /> Withdraw
                        </Link>
                        <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-700">
                            <div className="flex flex-col text-right text-sm">
                                <span className="font-semibold">{user.name}</span>
                                <span className="text-primary font-bold">{user.points} pts</span>
                            </div>
                            <button onClick={handleLogout} className="p-2 hover:bg-gray-800 rounded-full text-red-400 hover:text-red-300 transition" title="Logout">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
