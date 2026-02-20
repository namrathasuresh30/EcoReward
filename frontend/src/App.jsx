import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Rewards from './pages/Rewards';
import Navbar from './components/Navbar';

function PrivateRoute({ children }) {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" />;
}


function AppRoutes() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/upload" element={<PrivateRoute><Upload /></PrivateRoute>} />
                    <Route path="/rewards" element={<PrivateRoute><Rewards /></PrivateRoute>} />
                </Routes>
            </main>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
