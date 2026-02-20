import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(formData.name, formData.email, formData.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="card w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <Leaf className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h2 className="text-3xl font-bold">Create an Account</h2>
                    <p className="text-gray-400 mt-2">Join EcoRewards today!</p>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            className="input-field"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="input-field"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="input-field"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full mt-6">
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-gray-400">
                    Already have an account? <Link to="/login" className="text-primary hover:underline">Login here</Link>
                </p>
            </div>
        </div>
    );
}
