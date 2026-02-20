import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            fetchProfile();
        } else {
            localStorage.removeItem('token');
            setUser(null);
            setLoading(false);
        }
    }, [token]);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/profile');
            setUser(res.data);
        } catch (error) {
            console.error('Failed to fetch profile', error);
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const res = await api.post('/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        setToken(res.data.access_token);
    };

    const register = async (name, email, password) => {
        await api.post('/register', { name, email, password });
        await login(email, password); // Auto login after register
    };

    const logout = () => {
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, register, logout, loading, fetchProfile }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
