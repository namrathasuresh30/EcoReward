import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, FileImage, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Upload() {
    const { fetchProfile } = useAuth();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
            setResult(null);
            setError(null);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/uploads/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(res.data);
            if (res.data.approved) {
                fetchProfile(); // Update points
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to upload image');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <UploadCloud className="w-8 h-8 text-primary" /> Verify Trash
            </h1>

            <div className="card p-8">
                <form onSubmit={handleUpload} className="space-y-6">
                    <div className="border-2 border-dashed border-gray-700 hover:border-primary/50 transition-colors rounded-xl p-8 text-center bg-gray-900/50 cursor-pointer relative group">
                        <input
                            type="file"
                            accept="image/jpeg, image/png"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            required
                        />
                        {preview ? (
                            <div className="space-y-4">
                                <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-lg border border-gray-700" />
                                <p className="text-sm text-gray-400 group-hover:text-primary transition-colors flex justify-center items-center gap-2">
                                    <FileImage className="w-4 h-4" /> Click to change image
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4 py-8">
                                <div className="p-4 bg-gray-800 rounded-full inline-block group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                    <UploadCloud className="w-10 h-10" />
                                </div>
                                <div>
                                    <p className="text-lg font-medium text-white mb-1">Click or drag image to upload</p>
                                    <p className="text-sm text-gray-500">JPG or PNG (max. 5MB)</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={!file || loading}
                        className="btn-primary w-full text-lg py-3 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing via AI...' : (
                            <>Submit for Verification <CheckCircle className="w-5 h-5" /></>
                        )}
                    </button>
                </form>

                {error && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3 text-red-400">
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-red-500">Upload Error</h4>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {result && (
                    <div className={`mt-6 p-6 rounded-xl border ${result.approved ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                        <div className="flex items-start gap-4">
                            {result.approved ? (
                                <div className="p-3 bg-emerald-500/20 rounded-full text-emerald-500 shrink-0">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                            ) : (
                                <div className="p-3 bg-red-500/20 rounded-full text-red-500 shrink-0">
                                    <AlertTriangle className="w-8 h-8" />
                                </div>
                            )}

                            <div className="flex-1 space-y-3">
                                <h3 className={`text-xl font-bold ${result.approved ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {result.approved ? 'Approved! Points Awarded.' : 'Verification Failed'}
                                </h3>

                                <div className="grid grid-cols-2 gap-4 text-sm bg-black/20 p-4 rounded-lg">
                                    <div>
                                        <p className="text-gray-500 mb-1">AI Prediction</p>
                                        <p className="font-semibold text-white">{result.prediction}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-1">Confidence</p>
                                        <p className="font-semibold text-white">{(result.confidence * 100).toFixed(1)}%</p>
                                    </div>
                                    <div className="col-span-2 border-t border-gray-700/50 pt-3 mt-1 flex justify-between items-center">
                                        <div>
                                            <p className="text-gray-500 mb-1">Duplicate Check</p>
                                            <p className={`font-semibold ${result.duplicate ? 'text-red-400' : 'text-emerald-400'}`}>
                                                {result.duplicate ? 'Duplicate Image Detected' : 'Unique Image'}
                                            </p>
                                        </div>
                                        {result.points_added > 0 && (
                                            <div className="text-right">
                                                <span className="inline-flex items-center gap-1 bg-emerald-500 text-white font-bold px-3 py-1 rounded-full animate-bounce">
                                                    +{result.points_added} pts
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
